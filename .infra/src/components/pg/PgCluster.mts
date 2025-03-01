import { Construct } from 'constructs';
import { ApiObject, Size } from 'cdk8s';
import * as kplus from 'cdk8s-plus-32';

import type { IPrincipal, IPgCluster } from './common.mjs';
import PgRole, { type PgRoleProps } from './PgRole.mjs';
import PgDatabase from './PgDatabase.mjs';

export interface PgClusterProps {
  name: string,
  namespace?: kplus.Namespace,
  instanceCount?: number,
  size?: Size,
  imageOverride?: string;
}

export default class PgCluster extends Construct implements IPgCluster {
  readonly #props: PgClusterProps;
  readonly #appName: string;
  readonly clusterObject: ApiObject;
  readonly dbSecret: kplus.ISecret;
  readonly netPolicy: kplus.NetworkPolicy;
  readonly allowOperatorNetPolicy: ApiObject;
  readonly podSelector: kplus.Pods;
  
  get name(): string {
    return this.#props.name;
  }
  get port(): number {
    return 5432;
  }

  constructor(scope: Construct, id: string, props: PgClusterProps) {
    super(scope, id);
    this.#props = props;
    this.#appName = `postgres-${id}`;

    this.clusterObject = new ApiObject(this, 'PostgresCluster', {
      kind: 'Cluster',
      apiVersion: 'postgresql.cnpg.io/v1',
      metadata: {
        name: props.name,
        namespace: props.namespace?.name,
      },
      spec: {
        inheritedMetadata: {
          labels: {
            'app': this.#appName
          }
        },
        instances: props.instanceCount ?? 3,
        storage: {
          size: props.size?.asString() ?? '5Gi'
        },
        imageName: props.imageOverride ?? 'johndavisdotdev/postgres-sqids:17.2',
        managed: {
          roles: []
        },
        bootstrap: {
          initdb: {
            postInitTemplateSQL: [
              'DROP EXTENSION IF EXISTS pg_sqids;',
              'CREATE EXTENSION pg_sqids;',
            ]
          }
        }
      }
    });
    this.dbSecret = kplus.Secret.fromSecretName(this, 'Name', `postgres-app`);
    this.podSelector = kplus.Pods.select(this, 'Pods', {
      namespaces: kplus.Namespaces.select(this, 'Namespaces', {
        names: this.#props.namespace ? [this.#props.namespace!.name!] : ['default'],
      }),
      labels: {
        'app': this.#appName
      }
    });

    this.netPolicy = new kplus.NetworkPolicy(this, 'NetPolicy', {
      selector: this.podSelector,
      egress: {
        default: kplus.NetworkPolicyTrafficDefault.DENY
      },
      ingress: {
        default: kplus.NetworkPolicyTrafficDefault.DENY
      }
    });
    this.netPolicy.addIngressRule(this.podSelector, [kplus.NetworkPolicyPort.tcp(5432)]);
    this.netPolicy.addEgressRule(this.podSelector, [kplus.NetworkPolicyPort.tcp(5432)]);

    this.allowOperatorNetPolicy = new ApiObject(this, 'OperatorNetPolicy', {
      metadata: {
        name: 'operator-policy',
        namespace: props.namespace?.name,
      },
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      spec: {
        podSelector: {
          matchLabels: {
            'cnpg.io/cluster': props.name
          }
        },
        ingress: [
          {
            from: [
              {
                namespaceSelector: {
                  matchLabels: {
                    'kubernetes.io/metadata.name': 'cnpg-system'
                  }
                },
                podSelector: {
                  matchLabels: {
                    'app.kubernetes.io/name': 'cloudnative-pg'
                  }
                }
              }
            ],
            ports: [
              {
                port: 8000
              },
              {
                port: 5432
              }
            ]
          }
        ]
      }
    });
  }

  allowFrom(peer: kplus.INetworkPolicyPeer, port: number) {
    this.netPolicy.addIngressRule(peer, [kplus.NetworkPolicyPort.tcp(port)]);
  }
  allowTo(peer: kplus.INetworkPolicyPeer, port: number) {
    this.netPolicy.addEgressRule(peer, [kplus.NetworkPolicyPort.tcp(port)]);
  }

  addDatabase(name: string, owner: IPrincipal): PgDatabase {
    return new PgDatabase(this, name, {
      cluster: this,
      name: name,
      owner: owner.name,
      namespace: this.#props.namespace
    });
  }

  addRole(props: Omit<PgRoleProps, 'cluster'>): PgRole {
    return new PgRole(this, `Role${props.name}`, {
      ...props,
      cluster: this
    });
  }
}
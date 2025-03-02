import { Construct } from 'constructs';
import { ApiObject } from 'cdk8s';
import * as kplus from 'cdk8s-plus-32';
import PgCluster from './PgCluster.mjs';
import type { IPgDatabase } from './common.mjs';

export interface PgDatabaseProps {
  cluster: PgCluster;
  name: string;
  namespace?: kplus.Namespace;
  owner: string;
}

export default class PgDatabase extends Construct implements IPgDatabase {
  readonly #props: PgDatabaseProps;
  readonly clusterObject: ApiObject;

  get name(): string {
    return this.#props.name;
  }

  constructor(scope: Construct, id: string, props: PgDatabaseProps) {
    super(scope, id);
    this.#props = props;

    this.clusterObject = new ApiObject(this, 'Db', {
      kind: 'Database',
      apiVersion: 'postgresql.cnpg.io/v1',
      metadata: {
        name: props.name,
        namespace: props.namespace?.name
      },
      spec: {
        owner: props.owner,
        name: props.name,
        cluster: {
          name: props.cluster.name,
        }
      }
    });
  }
}
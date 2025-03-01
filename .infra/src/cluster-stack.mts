import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_eks as eks
} from 'aws-cdk-lib';
import * as c from './components/index.mjs';
import { App } from 'cdk8s';
import { Namespace } from 'cdk8s-plus-32';

export class ClusterStack extends cdk.Stack {
  readonly db: c.Database;
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const network = new c.FabricVpc(this, 'Vpc', props.env!.account);
    const sg = new ec2.SecurityGroup(this, 'K8SGroup', {
      allowAllIpv6Outbound: true,
      allowAllOutbound: true,
      vpc: network
    });
    sg.addIngressRule(ec2.Peer.ipv4(network.vpcCidrBlock), ec2.Port.allTraffic());
    sg.addIngressRule(ec2.Peer.ipv6(network.ipv6CidrBlock), ec2.Port.allTraffic());
    sg.addIngressRule(ec2.Peer.ipv4('172.16.0.0/12'), ec2.Port.allTraffic());

    const cluster = new c.AutoCluster(this, 'Cluster', {
      name: 'citadel',
      vpc: network
    });

    const cdk8sApp = new App();
    const storageChart = new c.Gp3StorageClassChart(cdk8sApp, 'StorageClassChart', {
      name: 'auto-ebs-sc',
      type: 'gp3',
      isDefault: true
    });

    const ghRole = new iam.Role(this, 'Role', {
      assumedBy: new iam.FederatedPrincipal('arn:aws:iam::390402568971:oidc-provider/token.actions.githubusercontent.com', {
        "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
            "token.actions.githubusercontent.com:sub": "repo:HitchPin/hp-apis:*"
        }
      }),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
      ]
    });
    const ghRunner = new c.GitHubRunner(cdk8sApp, 'GitHubRunner', {
      name: 'github',
      role: ghRole
    });
    const ghNode = cluster.cluster.addCdk8sChart('GitHub', ghRunner).node;
    const storageNode = cluster.cluster.addCdk8sChart('Storage', storageChart).node;

    const r = new iam.Role(this, 'ArgoWorkflowsRole', {
      assumedBy: new iam.ServicePrincipal('pods.eks.amazonaws.com').withSessionTags(),
    });
    const workflows = new c.ArgoWorkflows(this, 'Workflows', {
      name: 'argo-workflows',
      namespace: 'argo',
      role: r
    });
    cluster.cluster.addCdk8sChart('Workflows', workflows);
    workflows.node.addDependency(this.db);

    const ra = new eks.CfnPodIdentityAssociation(this, 'Association', {
      namespace: 'argo',
      roleArn: r.roleArn,
      serviceAccount: 'flowsvc',
      clusterName: cluster.cfnCluster.name!
    });
    ra.addDependency(cluster.cfnCluster);
    /*
    this.db = new c.Database(cdk8sApp, 'Db', {
      name: 'dbcluster',
      namespace: 'database'
    });
    cluster.cluster.addCdk8sChart('Db', this.db);
    this.db.node.addDependency(cluster.cfnCluster);
    */
    ghNode.addDependency(cluster.cfnCluster);
    storageNode.addDependency(cluster.cfnCluster);
  }
}

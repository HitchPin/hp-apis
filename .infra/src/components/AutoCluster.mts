import {
  aws_eks as eks,
  aws_ec2 as ec2,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface AutoClusterProps {
  name: string;
  vpc: ec2.IVpc;
}
export class AutoCluster extends Construct {
  readonly cfnCluster: eks.CfnCluster;
  readonly cluster: eks.ICluster;
  constructor(scope: Construct, name: string, props: AutoClusterProps) {
    super(scope, name);
    
    this.cfnCluster = new eks.CfnCluster(this, 'Cluster', {
      accessConfig: {
        authenticationMode: 'API',
        bootstrapClusterCreatorAdminPermissions: true,
      },
      name: props.name,
      roleArn: 'arn:aws:iam::390402568971:role/AmazonEKSAutoClusterRole',
      version: '1.32',
      resourcesVpcConfig: {
        subnetIds: props.vpc.privateSubnets.filter(s => s.availabilityZone != 'us-east-1e').map(s => s.subnetId),
        endpointPublicAccess: true,
        endpointPrivateAccess: true,
      },
      storageConfig: {
        blockStorage: {
          enabled: true
        }
      },
      kubernetesNetworkConfig: {
        elasticLoadBalancing: {
          enabled: true
        }
      },
      computeConfig: {
        enabled: true,
        nodeRoleArn: 'arn:aws:iam::390402568971:role/AmazonEKSAutoNodeRole',
        nodePools: ['system']
      },
      
    });
    
    const provider = new iam.OpenIdConnectProvider(this, 'Provider', {
      url: this.cfnCluster.getAtt('OpenIdConnectIssuerUrl').toString(),
    });
    this.cluster = eks.Cluster.fromClusterAttributes(this, 'CdkCluster', {
      clusterName: props.name,
      openIdConnectProvider: provider,
      kubectlRoleArn: 'arn:aws:iam::390402568971:role/cdk-hnb659fds-cfn-exec-role-390402568971-us-east-1',
    });
  }
}
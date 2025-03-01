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
      vpc: props.vpc,
      kubectlRoleArn: 'arn:aws:iam::390402568971:role/cdk-hnb659fds-cfn-exec-role-390402568971-us-east-1',
    });

    new eks.Addon(this, 'EbsCsiAddon', {
      addonName: 'aws-ebs-csi-driver',
      addonVersion: 'v1.40.0-eksbuild.1',
      cluster: this.cluster,
    });
    new eks.Addon(this, 'CorednsAddon', {
      addonName: 'coredns',
      addonVersion: 'v1.11.4-eksbuild.2',
      cluster: this.cluster,
    });
    new eks.Addon(this, 'KubeProxyAddon', {
      addonName: 'kube-proxy',
      addonVersion: 'v1.32.0-eksbuild.2',
      cluster: this.cluster,
    });
    new eks.Addon(this, 'EksPodIdentityAddon', {
      addonName: 'eks-pod-identity-agent',
      addonVersion: 'v1.3.5-eksbuild.2',
      cluster: this.cluster,
    });
    new eks.Addon(this, 'VpcCniAddon', {
      addonName: 'vpc-cni',
      addonVersion: 'v1.19.3-eksbuild.1',
      cluster: this.cluster,
    });
    

    const instanceTypesOf = (ic: ec2.InstanceClass) => {
      return [
        ec2.InstanceType.of(ic, ec2.InstanceSize.MEDIUM),
        ec2.InstanceType.of(ic, ec2.InstanceSize.LARGE),
        ec2.InstanceType.of(ic, ec2.InstanceSize.XLARGE),
        ec2.InstanceType.of(ic, ec2.InstanceSize.XLARGE2),
        ec2.InstanceType.of(ic, ec2.InstanceSize.XLARGE4),
      ]
    }

    const nodeRole = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryPullOnly'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
      ],
      inlinePolicies: {
        'ipv6': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                "ec2:AssignIpv6Addresses",
                "ec2:DescribeInstances",
                "ec2:DescribeTags",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DescribeInstanceTypes"
              ],
              resources: ['*']
            }),
            new iam.PolicyStatement({
              actions: [
                "ec2:CreateTags"
              ],
              resources: ['arn:aws:ec2:*:*:network-interface/*']
            }),
          ]
        })
      }
    });
    const nodeSg = new ec2.SecurityGroup(this, 'NodeSg', {
      allowAllIpv6Outbound: true,
      allowAllOutbound: true,
      vpc: props.vpc
    });
    nodeSg.addIngressRule(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.allTraffic());
    new eks.Nodegroup(this, 'Nodes', {
      nodegroupName: 'ArmCap',
      minSize: 2,
      maxSize: 5,
      desiredSize: 3,
      diskSize: 64,
      amiType: eks.NodegroupAmiType.BOTTLEROCKET_ARM_64,
      remoteAccess: {
        sshKeyName: 'bottlerocket',
        sourceSecurityGroups: [ nodeSg ]
      },
      subnets: { subnets: props.vpc.privateSubnets.filter(p => p.availabilityZone !== 'us-east-1f') },
      capacityType: eks.CapacityType.SPOT,
      cluster: this.cluster,
      instanceTypes: [
        ...instanceTypesOf(ec2.InstanceClass.C8G),
        ...instanceTypesOf(ec2.InstanceClass.M8G),
        ...instanceTypesOf(ec2.InstanceClass.R8G),
      ],
      nodeRole: nodeRole
    });
  }
}
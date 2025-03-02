import { Construct } from 'constructs';
import { Chart, ChartProps, ApiObject } from 'cdk8s';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
interface ArmCapacityProps extends ChartProps {
  name: string;
  vpc: ec2.IVpc;
  subnets: ec2.SubnetSelection;
  securityGroup: ec2.ISecurityGroup;
}

export class ArmCapacity extends Chart {
  readonly nodeClass: ApiObject;
  readonly nodePool: ApiObject;
  constructor(scope: Construct, id: string, props: ArmCapacityProps) {
    super(scope, id, props);

    this.nodeClass = new ApiObject(this, 'NodeClass', {
      'apiVersion': 'eks.amazonaws.com/v1',
      kind: 'NodeClass',
      metadata: {
        name: props.name
      },
      spec: {
        role: 'AmazonEKSAutoNodeRole',
        subnetSelectorTerms: props.vpc.selectSubnets(props.subnets).subnetIds.map(s => ({id: s})),
        securityGroupSelectorTerms: [
          { id: props.securityGroup.securityGroupId }
        ],
        ephemeralStorage: {
          size: '160Gi'
        }
      }
    });
    this.nodePool = new ApiObject(this, 'NodePool', {
      "apiVersion": "karpenter.sh/v1",
      "kind": "NodePool",
      "metadata": {
        "name": props.name
      },
      "spec": {
        "template": {
          "spec": {
            "nodeClassRef": {
              "group": "eks.amazonaws.com",
              "kind": "NodeClass",
              "name": props.name
            },
            "requirements": [
              {
                "key": "karpenter.sh/capacity-type",
                "operator": "In",
                "values": [
                  "spot", //"on-demand"
                ]
              },
              {
                "key": "eks.amazonaws.com/instance-category",
                "operator": "In",
                "values": [
                  "c",
                  "m",
                  "r"
                ]
              },
              {
                "key": "eks.amazonaws.com/instance-cpu",
                "operator": "In",
                "values": [
                  "4",
                  "8",
                  "16",
                  "32"
                ]
              },
              {
                "key": "kubernetes.io/arch",
                "operator": "In",
                "values": [
                  "arm64"
                ]
              }
            ]
          }
        },
        "limits": {
          "cpu": "1000",
          "memory": "1000Gi"
        }
      }
    });
  }
}
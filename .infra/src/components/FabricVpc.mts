import {
  App,
  aws_ec2 as ec2,
  Stack,
} from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct, Node } from 'constructs';
import { tmpdir } from 'os';

export interface IFabricVpc extends IVpc {
  readonly ipv6CidrBlock: string;
}

// @ts-expect-error
class _FabricVpc implements IFabricVpc {
  constructor(parent: Construct, name: string, fromAccountId?: string) {
    const account = fromAccountId ?? Stack.of(parent).account;
    const n = App.isApp(parent) ? parent.node : App.of(parent)!.node;
    setNodeContext(n, account);
    const bespokeStack = new (class extends Stack {
      readonly vpc: ec2.IVpc;
      constructor() {
        const app = new App({ outdir: tmpdir(), autoSynth: false});
        setNodeContext(app.node, account);
        super(app, 'Stack', { env: { account: account, region: 'us-east-1' }});
        this.vpc = ec2.Vpc.fromLookup(this, name, {
          vpcId: 'vpc-0913155c4340fe51b',
        });
      }
    })();
    Object.defineProperty(bespokeStack.vpc, 'ipv6CidrBlock', {
      value: '2600:1f18:77d3:6500::/56',
    });
    return bespokeStack.vpc;
  }
}

function setNodeContext(n: Node, sourceAccountId?: string) {
  const account = sourceAccountId ?? Stack.of(n.scope!).account;
  const ctxKey = `vpc-provider:account=${account}:filter.vpc-id=vpc-0913155c4340fe51b:region=us-east-1:returnAsymmetricSubnets=true`;
  (n as unknown as { _context: { [key: string]: any }})._context[ctxKey] = FabricVpcDefinition;
}

type VpcConstructor = {
  new(parent: Construct, name: string, accountId?: string): IFabricVpc;
};
export const FabricVpc: VpcConstructor = _FabricVpc as unknown as VpcConstructor;

/* eslint-disable */
const FabricVpcDefinition = {
  "vpcId": "vpc-0913155c4340fe51b",
  "vpcCidrBlock": "10.0.0.0/16",
  "ownerAccountId": "010928191957",
  "availabilityZones": [],
  "subnetGroups": [
    {
      "name": "isolated",
      "type": "Isolated",
      "subnets": [
        /*
        {
            "subnetId": "subnet-00149b19120da8b41",
            "cidr": "10.0.176.0/21",
            "availabilityZone": "us-east-1-dfw-2a",
            "routeTableId": "rtb-0e882797c88572f07"
        },
        {
            "subnetId": "subnet-09c67d16be971a1ea",
            "cidr": "10.0.184.0/21",
            "availabilityZone": "us-east-1-mci-1a",
            "routeTableId": "rtb-0e8d6ddce7e775ad6"
        },
        */
        {
          "subnetId": "subnet-0101baa9cc89bcf18",
          "cidr": "10.0.128.0/21",
          "availabilityZone": "us-east-1a",
          "routeTableId": "rtb-0e6be1da659a44835"
        },
        {
          "subnetId": "subnet-016bc8003856f499e",
          "cidr": "10.0.136.0/21",
          "availabilityZone": "us-east-1b",
          "routeTableId": "rtb-0b30397fc0c78a1b4"
        },
        {
          "subnetId": "subnet-00d094613fb10175e",
          "cidr": "10.0.144.0/21",
          "availabilityZone": "us-east-1c",
          "routeTableId": "rtb-0af9cf74fdd042c33"
        },
        {
          "subnetId": "subnet-08015c8e346cc1ae9",
          "cidr": "10.0.152.0/21",
          "availabilityZone": "us-east-1d",
          "routeTableId": "rtb-032d1b97b0e913e6d"
        },
        {
          "subnetId": "subnet-071508db8cd565207",
          "cidr": "10.0.160.0/21",
          "availabilityZone": "us-east-1e",
          "routeTableId": "rtb-067863e15a2aee9c2"
        },
        {
          "subnetId": "subnet-05d1dc42f4badfc69",
          "cidr": "10.0.168.0/21",
          "availabilityZone": "us-east-1f",
          "routeTableId": "rtb-023ffe691e952a6a5"
        }
      ]
    },
    {
      "name": "private",
      "type": "Private",
      "subnets": [
        /*
        {
            "subnetId": "subnet-00edd321489034123",
            "cidr": "10.0.48.0/21",
            "availabilityZone": "us-east-1-dfw-2a",
            "routeTableId": "rtb-0bdcc8dd5c72fb9ae"
        },
        {
            "subnetId": "subnet-0fe436ab4f66f9036",
            "cidr": "10.0.56.0/21",
            "availabilityZone": "us-east-1-mci-1a",
            "routeTableId": "rtb-0a2a1d22220fd8971"
        },
        */
        {
          "subnetId": "subnet-0e24721604a56e4e4",
          "cidr": "10.0.0.0/21",
          "availabilityZone": "us-east-1a",
          "routeTableId": "rtb-0bb1307ce4489f3fa"
        },
        {
          "subnetId": "subnet-02503682c7d887ddd",
          "cidr": "10.0.8.0/21",
          "availabilityZone": "us-east-1b",
          "routeTableId": "rtb-049f3492a77fdcacc"
        },
        {
          "subnetId": "subnet-051a44bca76aeb193",
          "cidr": "10.0.16.0/21",
          "availabilityZone": "us-east-1c",
          "routeTableId": "rtb-0f78697b40a9ecbab"
        },
        {
          "subnetId": "subnet-06cf5b02c77cd6f64",
          "cidr": "10.0.24.0/21",
          "availabilityZone": "us-east-1d",
          "routeTableId": "rtb-0edf1f2cb06713750"
        },
        {
          "subnetId": "subnet-0d75506eab8aee294",
          "cidr": "10.0.32.0/21",
          "availabilityZone": "us-east-1e",
          "routeTableId": "rtb-03a62915e479fba4f"
        },
        {
          "subnetId": "subnet-0d1fbf0af0ebc453e",
          "cidr": "10.0.40.0/21",
          "availabilityZone": "us-east-1f",
          "routeTableId": "rtb-0ac81c5c40599f18a"
        }
      ]
    },
    {
      "name": "public",
      "type": "Public",
      "subnets": [
        /*
        {
            "subnetId": "subnet-0bc50df25862b9d43",
            "cidr": "10.0.112.0/21",
            "availabilityZone": "us-east-1-dfw-2a",
            "routeTableId": "rtb-045aee4820631c484"
        },
        {
            "subnetId": "subnet-05992ff0eded0bf0d",
            "cidr": "10.0.120.0/21",
            "availabilityZone": "us-east-1-mci-1a",
            "routeTableId": "rtb-0945c00774dc6312c"
        },
        */
        {
          "subnetId": "subnet-0278d67f4abc8b379",
          "cidr": "10.0.64.0/21",
          "availabilityZone": "us-east-1a",
          "routeTableId": "rtb-0119f0561279e30b1"
        },
        {
          "subnetId": "subnet-037a5af6eb554e324",
          "cidr": "10.0.72.0/21",
          "availabilityZone": "us-east-1b",
          "routeTableId": "rtb-029ea52674c5300ed"
        },
        {
          "subnetId": "subnet-06a88d88ab75c6e7a",
          "cidr": "10.0.80.0/21",
          "availabilityZone": "us-east-1c",
          "routeTableId": "rtb-08351f39f01e57de0"
        },
        {
          "subnetId": "subnet-04597135c2205eac6",
          "cidr": "10.0.88.0/21",
          "availabilityZone": "us-east-1d",
          "routeTableId": "rtb-0fa742c3f76a8aae9"
        },
        {
          "subnetId": "subnet-0129e1581c4c31687",
          "cidr": "10.0.96.0/21",
          "availabilityZone": "us-east-1e",
          "routeTableId": "rtb-0e2e2da745086bcba"
        },
        {
          "subnetId": "subnet-0b4a959b8e917da8a",
          "cidr": "10.0.104.0/21",
          "availabilityZone": "us-east-1f",
          "routeTableId": "rtb-0d93d2d2d4af9acdf"
        }
      ]
    }
  ]
};
/* eslint-enable */

export { setNodeContext };
import { Construct } from 'constructs';
import { Chart, ChartProps, Helm, Include } from 'cdk8s';
import { aws_iam as iam } from 'aws-cdk-lib';
import { ConfigMap, Secret, ServiceAccount } from 'cdk8s-plus-32';

interface ArgoWorkflowsProps extends ChartProps {
  name: string;
  role: iam.Role;
}

export class ArgoWorkflows extends Chart {
  readonly svcAccountSecret: Secret;
  readonly svcAccount: ServiceAccount;
  constructor(scope: Construct, id: string, props: ArgoWorkflowsProps) {
    super(scope, id, props);

    const wf = new Include(this, 'ArgoWorkflow', {
      url: 'https://github.com/argoproj/argo-workflows/releases/download/v3.6.4/quick-start-minimal.yaml'
    });
    this.svcAccount = new ServiceAccount(this, 'Svc', {
      metadata: {
        namespace: 'argo',
        name: 'flowsvc',
        annotations: {
          'eks.amazonaws.com/role-arn': props.role.roleArn
        }
      },
    });
    const cm = new ConfigMap(this, 'WorkflowDefaults', {
      metadata: {
        name: 'workflow-controller-configmap',
        namespace: 'argo',
      },
      data: {
        workflowDefaults: JSON.stringify({
          metadata: {
            annotations: {
              argo: 'workflows'
            },
          },
          spec: {
            ttlStrategy: {
              secondsAfterSuccess: 5
            },
            parallelism: 3
          }
        }),
        artifactRepository: JSON.stringify({
          s3: {
            bucket: 'hp-argo-workflow-artifacts',
            endpoint: 's3.amazonaws.com',
            useSDKCreds: 'true'
          }
        })
      }
    });
    cm.node.addDependency(wf);
    new Secret(this, 'Secret', {
      metadata: {
        name: 'flowsvc.service-account-token',
        annotations: {
          'kubernetes.io/service-account.name': 'flowsvc'
        },
      },
      type: 'kubernetes.io/service-account-token'
    })
  }
}
import { Construct } from 'constructs';
import { Chart, ChartProps } from 'cdk8s';
import { Role, RoleBinding, ServiceAccount, Secret, ApiResource } from 'cdk8s-plus-32';
import { aws_iam as iam } from 'aws-cdk-lib';
interface GitHubRunnerProps extends ChartProps {
  name: string;
  role: iam.IRole;
}

export class GitHubRunner extends Chart {
  readonly role: Role;
  readonly binding: RoleBinding;
  readonly svcAccount: ServiceAccount;
  readonly secret: Secret;
  constructor(scope: Construct, id: string, props: GitHubRunnerProps) {
    super(scope, id, props);

    this.role = new Role(this, 'Role', {
      metadata: {
        name: props.name
      },
      rules: [
        {
          verbs: ['list', 'update'],
          resources: [ ApiResource.custom({
            apiGroup: '',
            resourceType: 'workflows.argoproj.io'
          })]
        },
        {
          verbs: ['get', 'list', 'create'],
          resources: [ ApiResource.custom({
            apiGroup: '',
            resourceType: 'pods'
          }), ApiResource.custom({
            apiGroup: '',
            resourceType: 'pods/portforward'
          })]
        },
      ]
    });
    this.svcAccount = new ServiceAccount(this, 'Svc', {
      metadata: {
        name: props.name,
        annotations: {
          'eks.amazonaws.com/role-arn': props.role.roleArn
        }
      },
    });
    this.binding = new RoleBinding(this, 'RoleBinding', {
      metadata: {
        name: props.name,
      },
      role: this.role
    });
    this.binding.addSubjects(this.svcAccount);
    this.secret = new Secret(this, 'Secret', {
      metadata: {
        name: 'github.service-account-token',
        annotations: {
          'kubernetes.io/service-account.name': props.name,
        },
      },
      type: 'kubernetes.io/service-account-token'
    });
  }
}
import { Construct } from 'constructs';
import { Chart, ChartProps, ApiObject } from 'cdk8s';

interface Gp3StorageClassChartProps extends ChartProps {
  name: string;
  isDefault?: boolean;
  type?: 'gp2' | 'gp3';
  encrypted?: boolean;
}

export class Gp3StorageClassChart extends Chart {
  readonly storageClass: ApiObject;
  constructor(scope: Construct, id: string, props: Gp3StorageClassChartProps) {
    super(scope, id, props);
    this.storageClass = new ApiObject(this, 'StorageClass', {
      apiVersion: 'storage.k8s.io/v1',
      kind: 'StorageClass',
      metadata: {
        name: props.name,
        namespace: props.namespace ? props.namespace! : undefined,
        annotations: props.isDefault ? {
          'storageclass.kubernetes.io/is-default-class': 'true'
        } : undefined,
      },
      provisioner: 'ebs.csi.eks.amazonaws.com',
      volumeBindingMode: 'WaitForFirstConsumer',
      parameters: {
        type: props.type ?? 'gp3',
        encrypted: (props.encrypted ?? true) ? 'true' : 'false',
      }
    });
  }
}
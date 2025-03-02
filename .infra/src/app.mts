import { App } from 'aws-cdk-lib';
import { ClusterStack } from './cluster-stack.mjs';

const app = new App();
new ClusterStack(app, 'App', {env: {
  region: 'us-east-1',
  account: '390402568971'
}});
app.synth();
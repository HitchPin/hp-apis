import { Construct } from 'constructs';
import * as kplus from 'cdk8s-plus-32';
import * as c from './pg/index.mjs';
import { Chart, Helm, Include, Size } from 'cdk8s';

const pgOpPath = 'src/components/pg/cnpg-1.25.0.yaml';
export interface DatabaseProps {
  name: string,
  namespace: string;
}

export default class Database extends Chart {
  readonly #roleSecret: kplus.ISecret;
  readonly #cluster: c.PgCluster;
  readonly #role: c.PgRole;
  readonly #db: c.PgDatabase;

  get db(): kplus.EnvValue {
    return {
      value: this.#db.name
    }
  }
  get host(): kplus.EnvValue {
    return this.#cluster.dbSecret.envValue('host');
  }
  get port(): kplus.EnvValue {
    return {
      value: this.#cluster.port.toString()
    }
  }
  get user(): kplus.EnvValue {
    return this.#roleSecret.envValue('username');
  }
  get password(): kplus.EnvValue {
    return this.#roleSecret.envValue('password');
  }
  
  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id, { namespace: props.namespace });

    const dbNs =new kplus.Namespace(this, 'DatabaseNs', {
      metadata: { name: props.namespace }
    });
    const pgOperator = new Include(this, 'PgOperator', {
      url: pgOpPath
    });
    const operatorHelm = new Helm(this, 'Helm', {
      repo: 'https://cloudnative-pg.github.io/charts',
      chart: 'cloudnative-pg',
      namespace: props.namespace
    });
    operatorHelm.node.addDependency(pgOperator);

    this.#roleSecret = new kplus.BasicAuthSecret(this, 'Secret', {
      username: 'hpoa',
      password: 'qubbu6-zatriq-Vukzok',
      metadata: {
        name: 'db-credentials',
        namespace: props.namespace,
      }
    });

    this.#cluster = new c.PgCluster(this, 'cluster', {
      name: props.name,
      namespace: dbNs,
      size: Size.gibibytes(5),
      instanceCount: 3,
    });
    this.#role = this.#cluster.addRole({
      name: 'hpoa_argo',
      login: true,
      passwordSecret: this.#roleSecret,
      disablePassword: false,
      comment: 'arg service user'
    });
    this.#cluster.node.addDependency(dbNs)
    this.#db = this.#cluster.addDatabase('hpoa_workflows', this.#role);
  }

  connectTo(wl: kplus.Workload) {
    this.#cluster.allowTo(wl, 5432);
    this.#cluster.allowFrom(wl, 5432);
  }
}
import { Construct } from 'constructs';
import { JsonPatch } from 'cdk8s';
import * as kplus from 'cdk8s-plus-32';
import PgCluster from './PgCluster.mjs';
import type { IPrincipal } from './common.mjs';

export interface PgRoleProps {
  /**
   * Owning cluster
   */
  cluster: PgCluster;
  /**
   * Name of the role
   */
  name: string;
  /**
   * Description of the role
   */
  comment?: string;
  /**
   * Ensure the role is present or absent - defaults to "present"
   */
  ensure?: 'absent' | 'present';
  /**
   * Secret containing the password of the role (if present) If null, the password will be ignored unless DisablePassword is set.
   */
  passwordSecret?: kplus.ISecret;
  /**
   * If the role can log in, this specifies how many concurrent connections the role can make. -1 (the default) means no limit.
   * @default -1
   */
  connectionLimit?: number;
  /**
   * Date and time after which the role's password is no longer valid. When omitted, the password will never expire (default).
   * @default []
   */
  validUntil?: Date;
  /**
   * List of one or more existing roles to which this role will be immediately added as a new member.
   * @default []
   */
  inRoles?: string[];
  /**
   * Whether a role "inherits" the privileges of roles it is a member of.
   * @default true
   */
  inherit?: boolean;
  /**
   * DisablePassword indicates that a role's password should be set to NULL in Postgres
   */
  disablePassword?: boolean;
  /**
   * Whether the role is a superuser who can override all access restrictions within the database - superuser status is dangerous and should be used only when really needed. You must yourself be a superuser to create a new superuser.
   * @default false
   */
  superuser?: boolean;
  /**
   * When set to true, the role being defined will be allowed to create new databases. Specifying false (default) will deny a role the ability to create databases.
   * @default false
   */
  createdb?: boolean;
  /**
   * Whether the role will be permitted to create, alter, drop, comment on, change the security label for, and grant or revoke membership in other roles.
   * @default false
   */
  createrole?: boolean;
  /**
   * Whether the role is allowed to log in. A role having the login attribute can be thought of as a user. Roles without this attribute are useful for managing database privileges, but are not users in the usual sense of the word.
   * @default false
   */
  login?: boolean;
  /**
   * Whether a role is a replication role. A role must have this attribute (or be a superuser) in order to be able to connect to the server in replication mode (physical or logical replication) and in order to be able to create or drop replication slots. A role having the replication attribute is a very highly privileged role, and should only be used on roles actually used for replication.
   * @default false
   */
  replication?: boolean;
  /**
   * Whether a role bypasses every row-level security (RLS) policy.
   * @default false
   */
  bypassrls?: boolean;
}

export default class PgRole extends Construct implements IPrincipal {
  readonly #props: PgRoleProps;

  constructor(scope: Construct, id: string, props: PgRoleProps) {
    super(scope, id);
    this.#props = props;

    const m = new Map<string, any>();
    m.set('name', props.name);
    if (props.comment) m.set('comment', props.comment);
    if (props.ensure) m.set('ensure', props.ensure);
    if (props.passwordSecret) m.set('passwordSecret', {
      name: props.passwordSecret.name,
    });
    if (props.connectionLimit) m.set('connectionLimit', props.connectionLimit);
    if (props.validUntil) m.set('validUntil', props.validUntil!.toISOString());
    if (props.inRoles) m.set('inRoles', props.inRoles);
    if (props.inherit) m.set('inherit', props.inherit);
    if (props.disablePassword) m.set('disablePassword', props.disablePassword);
    if (props.superuser) m.set('superuser', props.superuser);
    if (props.createdb) m.set('createdb', props.createdb);
    if (props.createrole) m.set('createrole', props.createrole);
    if (props.login) m.set('login', props.login);
    if (props.replication) m.set('replication', props.replication);
    if (props.bypassrls) m.set('bypassrls', props.bypassrls);

    props.cluster.clusterObject.addJsonPatch(JsonPatch.add('/spec/managed/roles/-', {
      ...Object.fromEntries(m.entries())
    }));
  }

  get name(): string {
    return this.#props.name;
  }
}
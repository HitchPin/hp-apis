export interface IPrincipal {
  get name(): string;
}

export interface IPgDatabase {
  get name(): string;
}

export interface IPgCluster {
  get name(): string;
  get port(): number;
}
import { OpenAPIV3 } from '@scalar/openapi-types';

type Operation = OpenAPIV3.OperationObject;
type Schema = OpenAPIV3.Document;

export interface GenerationContext {
  schema: Schema;
  outDir: string;
  outputs: GenerationOutputs;
  metadata: Metadata
}

export interface GenerationOutputs {
  models?: string;
  client?: string;
  pkgJson?: string;
  tsConfig?: string;
}

export interface Metadata {
  pkgName: string;
  description: string;
  ghLink: string;
}
import { OpenAPIV3 } from '@scalar/openapi-types';
import { existsSync, readFileSync } from 'node:fs';

import * as steps from './codegen/index.mjs';
import { join } from 'node:path';
import { mkdir, rm } from 'node:fs/promises';
export interface ClientGeneratorOptions {
  schemaFile: string;
  outDir: string;
  clientName: string;
  clientVersion: string;
  clean?: boolean;
} 

type Operation = OpenAPIV3.OperationObject;
type Schema = OpenAPIV3.Document;

type Step = (c: steps.GenerationContext) => Promise<void>;
export class ClientGenerator {
  readonly #schema: Schema;
  readonly #ops: ClientGeneratorOptions;
  constructor(op: ClientGeneratorOptions) {
    const fileContents = readFileSync(op.schemaFile).toString('utf8');
    this.#schema = JSON.parse(fileContents);
    this.#ops = op;
  }

  async generate() {
    const s: Step[] = [
      steps.generatePackageJson,
      steps.generateTsConfigJson,
      steps.generateModels,
      steps.generateClient,
    ];
    const context: steps.GenerationContext = {
      schema: this.#schema,
      outDir: join(process.cwd(), 'gen-dir'),
      outputs: {},
      metadata: {
        pkgName: 'client',
        description: 'A nice autogenreated client',
        ghLink: 'https://github.com',
      }
    }
    if (!existsSync(context.outDir)) {
      await mkdir(context.outDir);
    } else if (this.#ops.clean) {
      await rm(context.outDir, { recursive: true, force: true }); 
      await mkdir(context.outDir);
    }
    if (!existsSync(join(context.outDir, 'src'))) {
      await mkdir(join(context.outDir, 'src'));
    }
    for (const step of s) {
      await step(context);
    }
  }
}
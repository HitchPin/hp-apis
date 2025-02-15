import fs from "node:fs";
import openapiTS, { astToString } from "openapi-typescript";
import type { GenerationContext } from './types.mjs';
import { stringify } from 'yaml';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export default async function s(context: GenerationContext) {
  const ast = await openapiTS(stringify(context.schema!));
  const contents = astToString(ast, {
    formatOptions: {
      omitTrailingSemicolon: false
    }
  });
  const modelPath =  join(context.outDir, 'src/models.mts');
  await writeFile(modelPath, contents);
  context.outputs.models = modelPath;
}
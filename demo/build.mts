import { jsonSchemaToZod } from "json-schema-to-zod";
import { glob } from 'glob'
import { readFileSync, writeFile, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const srcDir = 'schemas/*.json';

const files = await glob(srcDir);
for (const f of files) {
  const obj = JSON.parse(readFileSync(f).toString('utf8'));
  const module = jsonSchemaToZod(obj, { name: obj['title'], module: "esm", type: true });
  writeFileSync(join('src', basename(f).replace('.json', '.ts')), module);
}

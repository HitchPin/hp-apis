import { ClientGenerator } from '../src/generator.mts';

const gen = new ClientGenerator({
  schemaFile: 'bin/schema.openapi.json',
  outDir: 'bin/gen-dir',
  clientName: 'client',
  clientVersion: '1.0.0',
})
await gen.generate();
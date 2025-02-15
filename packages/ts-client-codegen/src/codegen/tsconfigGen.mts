import { TsConfigJson  } from 'type-fest';
import { GenerationContext } from './types.mts';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';

export const template: TsConfigJson = {
  "extends": "@tsconfig/node22/tsconfig.json",
  "compilerOptions": {
    "outDir": "dist/src",
    "baseUrl": ".",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true,
  },
  "include": ["src"],
  "exclude": ["dist", "bundle", "node_modules"],
};

export default async function generateTsConfigJson(context: GenerationContext) {
  const tsConf = { ...template };
  const tsConfPath = join(context.outDir, 'tsconfig.json');
  await writeFile(tsConfPath, JSON.stringify(tsConf, null, 2));
  context.outputs.tsConfig = tsConfPath;
}



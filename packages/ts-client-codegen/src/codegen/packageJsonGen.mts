import { PackageJson  } from 'type-fest';
import { GenerationContext } from './types.mts';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';

export default async function generatePackageJson(context: GenerationContext) {
  const md = context.metadata;
  const pkgJson: PackageJson = {
    name: md.pkgName,
    version: "1.0.0", // automatically changed later
    description: md.description,
    repository: md.ghLink,
    main: "./dist/index.cjs",
    module: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      "import": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js",
      },
      "require": {
        "types": "./dist/index.d.cts",
        "require": "./dist/index.cjs"
      }
    },
    scripts: {
      "build": "tsup src/index.mts --format cjs,esm --dts --clean --sourcemap",
      "codegen": "pnpm tsx bin/codegen.mts",
      "test": "vitest run"
    },
    devDependencies: {
      "@smithy/types": "^4.1.0",
      "@tsconfig/node22": "^22.0.0",
      "@types/node": "^22.13.1",
      "prettier": "^3.5.1",
      "tsup": "^8.3.6",
      "typescript": "^5.7.3",
    },
    dependencies: {
      "@aws-sdk/credential-providers": "^3.744.0",
      "aws-sigv4-fetch": "^4.3.1",
      "openapi-fetch": "^0.13.4",
    }
  };
  const pkgJsonPath = join(context.outDir, 'package.json');
  await writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  context.outputs.pkgJson = pkgJsonPath;
}
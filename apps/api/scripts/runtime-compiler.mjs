import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const defaultOutDir = path.join(repoRoot, "node_modules/.cache/uzmax-api-runtime");
const compilerOptions = {
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2023
};

export async function importApiRuntime() {
  const outDir = defaultOutDir;
  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });

  await writeModule(outDir, "packages/authz/src/index.ts", "authz-index.mjs");
  await writeModule(outDir, "packages/db/src/index.ts", "db-index.mjs");
  await writeModule(
    outDir,
    "apps/api/src/access-context-core.ts",
    "access-context-core.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs"
    }
  );
  await writeModule(outDir, "apps/api/src/access-context.ts", "access-context.mjs", {
    "./access-context-core.ts": "./access-context-core.mjs"
  });
  await writeModule(outDir, "apps/api/src/app.module.ts", "app.module.mjs", {
    "./access-context.ts": "./access-context.mjs"
  });
  await writeModule(outDir, "apps/api/src/main.ts", "main.mjs", {
    "./app.module.ts": "./app.module.mjs"
  });
  const entry = pathToFileURL(path.join(outDir, "main.mjs")).href;
  return import(`${entry}?t=${Date.now()}`);
}

async function writeModule(outDir, sourcePath, outputName, replacements = {}) {
  let source = await readFile(path.join(repoRoot, sourcePath), "utf8");
  for (const [from, to] of Object.entries(replacements)) {
    source = source.replaceAll(from, to);
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions,
    fileName: sourcePath
  });
  await writeFile(path.join(outDir, outputName), outputText);
}

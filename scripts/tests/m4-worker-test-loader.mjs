import { readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

const repoRoot = process.cwd();

export function readRepoText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), {
    encoding: "utf8"
  });
}

export async function importWorkerEntrypoint() {
  const moduleUrl = compileWorkerEntrypointUrl();
  return { module: await import(moduleUrl), moduleUrl };
}

export async function importWorkerDispatchEntrypoint() {
  const mainUrl = compileWorkerEntrypointUrl();
  const moduleUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-dispatch.ts").replaceAll(
      "./main.ts",
      mainUrl
    )
  );

  return { module: await import(moduleUrl), moduleUrl };
}

function compileWorkerEntrypointUrl() {
  const orderReadUrl = compileTsModuleUrl(
    readRepoText("packages/capabilities/order-read/src/index.ts")
  );
  const dbUrl = compileTsModuleUrl(
    readRepoText("packages/db/src/m4-order-import-contracts.ts")
  );
  const moduleUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/main.ts")
      .replaceAll('export * from "./order-import-dispatch.ts";', "")
      .replaceAll(
        "../../../packages/capabilities/order-read/src/index.ts",
        orderReadUrl
      )
      .replaceAll("../../../packages/db/src/m4-order-import-contracts.ts", dbUrl)
  );

  return moduleUrl;
}

function compileTsModuleUrl(sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(compiled, "utf8").toString(
    "base64"
  )}`;
}

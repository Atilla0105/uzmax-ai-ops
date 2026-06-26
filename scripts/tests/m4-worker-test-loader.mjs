import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

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

export async function importWorkerFileIntakeEntrypoint() {
  const moduleUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-file-intake.ts")
  );

  return { module: await import(moduleUrl), moduleUrl };
}

export async function importWorkerPrismaPersistenceEntrypoint() {
  const mainUrl = compileWorkerEntrypointUrl();
  const moduleUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-prisma-persistence.ts").replaceAll(
      "./main.ts",
      mainUrl
    )
  );

  return { module: await import(moduleUrl), moduleUrl };
}

export async function importWorkerBullmqRuntimeEntrypoint() {
  const mainUrl = compileWorkerEntrypointUrl();
  const dispatchUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-dispatch.ts").replaceAll(
      "./main.ts",
      mainUrl
    )
  );
  const moduleUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-bullmq-runtime.ts")
      .replaceAll("./order-import-dispatch.ts", dispatchUrl)
      .replaceAll("./main.ts", mainUrl)
      .replaceAll('"bullmq"', JSON.stringify(bullmqModuleUrl()))
  );

  return { module: await import(moduleUrl), moduleUrl };
}

function bullmqModuleUrl() {
  return pathToFileURL(path.join(repoRoot, "node_modules/bullmq/dist/cjs/index.js"))
    .href;
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
      .replaceAll(
        'import { runWorkerServiceShellFromCli } from "./worker-service-shell.ts";',
        ""
      )
      .replaceAll('export * from "./order-import-dispatch.ts";', "")
      .replaceAll('export * from "./order-import-file-intake.ts";', "")
      .replaceAll('export * from "./order-import-prisma-persistence.ts";', "")
      .replaceAll('export * from "./order-import-bullmq-runtime.ts";', "")
      .replaceAll('export * from "./worker-service-shell.ts";', "")
      .replace(
        /\nif \(process\.argv\[1\][\s\S]*?await runWorkerServiceShellFromCli\(\);\n}\n?$/,
        "\n"
      )
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

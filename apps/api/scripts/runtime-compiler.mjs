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
  await writeModule(
    outDir,
    "apps/api/src/conversation-ticket.types.ts",
    "conversation-ticket.types.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/capabilities/handoff/src/index.ts": "./handoff-index.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/conversation-ticket.errors.ts",
    "conversation-ticket.errors.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/capabilities/handoff/src/index.ts": "./handoff-index.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/conversation-ticket.repository.ts",
    "conversation-ticket.repository.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/capabilities/handoff/src/index.ts": "./handoff-index.mjs",
      "./conversation-ticket.types.ts": "./conversation-ticket.types.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/conversation-ticket.service.ts",
    "conversation-ticket.service.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/capabilities/handoff/src/index.ts": "./handoff-index.mjs",
      "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
      "./conversation-ticket.repository.ts": "./conversation-ticket.repository.mjs",
      "./conversation-ticket.types.ts": "./conversation-ticket.types.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/conversation-ticket.controller.ts",
    "conversation-ticket.controller.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "./access-context.ts": "./access-context.mjs",
      "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
      "./conversation-ticket.service.ts": "./conversation-ticket.service.mjs",
      "./conversation-ticket.types.ts": "./conversation-ticket.types.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/conversation-ticket.ts",
    "conversation-ticket.mjs",
    {
      "./conversation-ticket.controller.ts": "./conversation-ticket.controller.mjs",
      "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
      "./conversation-ticket.repository.ts": "./conversation-ticket.repository.mjs",
      "./conversation-ticket.service.ts": "./conversation-ticket.service.mjs",
      "./conversation-ticket.types.ts": "./conversation-ticket.types.mjs"
    }
  );
  await writeModule(
    outDir,
    "packages/capabilities/handoff/src/index.ts",
    "handoff-index.mjs"
  );
  for (const [name, replacements] of customerAssetRuntimeModules()) {
    await writeModule(
      outDir,
      `apps/api/src/customer-asset.${name}.ts`,
      `customer-asset.${name}.mjs`,
      replacements
    );
  }
  await writeModule(
    outDir,
    "packages/capabilities/order-read/src/index.ts",
    "order-read-index.mjs"
  );
  await writeModule(
    outDir,
    "apps/api/src/order-import.types.ts",
    "order-import.types.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/capabilities/order-read/src/index.ts": "./order-read-index.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/order-import.defaults.ts",
    "order-import.defaults.mjs",
    {
      "./order-import.types.ts": "./order-import.types.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/order-import.repository.ts",
    "order-import.repository.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "./order-import.defaults.ts": "./order-import.defaults.mjs",
      "./order-import.types.ts": "./order-import.types.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/order-import.service.ts",
    "order-import.service.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/capabilities/order-read/src/index.ts":
        "./order-read-index.mjs",
      "./order-import.repository.ts": "./order-import.repository.mjs",
      "./order-import.types.ts": "./order-import.types.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/order-import.controller.ts",
    "order-import.controller.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "./access-context.ts": "./access-context.mjs",
      "./order-import.service.ts": "./order-import.service.mjs",
      "./order-import.types.ts": "./order-import.types.mjs"
    }
  );
  await writeModule(outDir, "apps/api/src/order-import.ts", "order-import.mjs", {
    "./order-import.controller.ts": "./order-import.controller.mjs",
    "./order-import.repository.ts": "./order-import.repository.mjs",
    "./order-import.service.ts": "./order-import.service.mjs",
    "./order-import.types.ts": "./order-import.types.mjs"
  });
  await writeModule(outDir, "apps/api/src/app.module.ts", "app.module.mjs", {
    "./access-context.ts": "./access-context.mjs",
    "./conversation-ticket.ts": "./conversation-ticket.mjs",
    "./customer-asset.controller.ts": "./customer-asset.controller.mjs",
    "./customer-asset.repository.ts": "./customer-asset.repository.mjs",
    "./customer-asset.service.ts": "./customer-asset.service.mjs",
    "./order-import.ts": "./order-import.mjs"
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

function customerAssetRuntimeModules() {
  return [
    ["types", { "../../../packages/authz/src/index.ts": "./authz-index.mjs" }],
    [
      "repository",
      {
        "../../../packages/authz/src/index.ts": "./authz-index.mjs",
        "./customer-asset.types.ts": "./customer-asset.types.mjs"
      }
    ],
    [
      "service",
      {
        "../../../packages/authz/src/index.ts": "./authz-index.mjs",
        "../../../packages/db/src/index.ts": "./db-index.mjs",
        "./access-context.ts": "./access-context.mjs",
        "./access-context-core.ts": "./access-context-core.mjs",
        "./customer-asset.repository.ts": "./customer-asset.repository.mjs",
        "./customer-asset.types.ts": "./customer-asset.types.mjs"
      }
    ],
    [
      "controller",
      {
        "../../../packages/authz/src/index.ts": "./authz-index.mjs",
        "./access-context.ts": "./access-context.mjs",
        "./customer-asset.service.ts": "./customer-asset.service.mjs",
        "./customer-asset.types.ts": "./customer-asset.types.mjs"
      }
    ]
  ];
}

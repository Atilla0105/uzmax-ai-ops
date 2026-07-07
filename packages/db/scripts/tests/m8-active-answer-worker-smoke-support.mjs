import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

export async function compileM8ActiveAnswerRuntimeModules(input) {
  await mkdir(input.tempDir, { recursive: true });
  const write = (fileName, sourceText) =>
    writeModule(input.tempDir, fileName, sourceText);
  const read = (relativePath) => readRepoText(input.repoRoot, relativePath);

  await write("channels.mjs", read("packages/channels/src/index.ts"));
  await write("handoff.mjs", read("packages/capabilities/handoff/src/index.ts"));
  await write("kb.mjs", read("packages/capabilities/kb/src/index.ts"));
  await write("engine.mjs", read("packages/engine/src/index.ts"));
  await write("llm-gateway.mjs", read("packages/llm-gateway/src/index.ts"));
  await writeFile(path.join(input.tempDir, "db.mjs"), rlsStubSource());
  await write(
    "bot-answer-runtime.mjs",
    read("apps/worker/src/telegram-bot-answer-runtime.ts")
  );
  await write(
    "active-answer-runtime.mjs",
    replaceActiveAnswerImports(
      read("apps/worker/src/telegram-bot-active-answer-runtime.ts")
    )
  );
  await writeWorkerModules(input.tempDir, read, write);
  await write(
    "telegram-bot.mjs",
    read("apps/api/src/telegram-bot.ts").replaceAll(
      "../../../packages/channels/src/index.ts",
      "./channels.mjs"
    )
  );

  return {
    api: await import(pathToFileURL(path.join(input.tempDir, "telegram-bot.mjs")).href),
    worker: await import(
      pathToFileURL(path.join(input.tempDir, "worker-service-shell.mjs")).href
    )
  };
}

async function writeWorkerModules(tempDir, read, write) {
  await write(
    "conversation-runtime.mjs",
    replaceConversationImports(read("apps/worker/src/conversation-runtime.ts"))
  );
  await write(
    "bot-persistence.mjs",
    read("apps/worker/src/telegram-bot-conversation-persistence.ts").replaceAll(
      "../../../packages/db/src/index.ts",
      "./db.mjs"
    )
  );
  await writeFile(
    path.join(tempDir, "order-import-bullmq-runtime.mjs"),
    orderImportStub()
  );
  await writeFile(path.join(tempDir, "main.mjs"), mainStub());
  await write(
    "telegram-bot-worker-service-runtime.mjs",
    replaceWorkerRuntimeImports(
      read("apps/worker/src/telegram-bot-worker-service-runtime.ts")
    )
  );
  await write(
    "worker-service-shell.mjs",
    replaceWorkerShellImports(read("apps/worker/src/worker-service-shell.ts"))
  );
}

function replaceActiveAnswerImports(source) {
  return source
    .replaceAll("../../../packages/capabilities/kb/src/index.ts", "./kb.mjs")
    .replaceAll("../../../packages/db/src/index.ts", "./db.mjs")
    .replaceAll("../../../packages/engine/src/index.ts", "./engine.mjs")
    .replaceAll("../../../packages/llm-gateway/src/index.ts", "./llm-gateway.mjs")
    .replaceAll("./telegram-bot-answer-runtime.ts", "./bot-answer-runtime.mjs");
}

function replaceConversationImports(source) {
  return source
    .replaceAll("../../../packages/channels/src/index.ts", "./channels.mjs")
    .replaceAll("../../../packages/capabilities/handoff/src/index.ts", "./handoff.mjs")
    .replaceAll("../../../packages/db/src/index.ts", "./db.mjs")
    .replaceAll("./telegram-bot-answer-runtime.ts", "./bot-answer-runtime.mjs");
}

function replaceWorkerRuntimeImports(source) {
  return source
    .replaceAll("./conversation-runtime.ts", "./conversation-runtime.mjs")
    .replaceAll("./telegram-bot-conversation-persistence.ts", "./bot-persistence.mjs")
    .replaceAll(
      "./telegram-bot-active-answer-runtime.ts",
      "./active-answer-runtime.mjs"
    )
    .replaceAll("../../../packages/channels/src/index.ts", "./channels.mjs");
}

function replaceWorkerShellImports(source) {
  return source
    .replaceAll("./order-import-bullmq-runtime.ts", "./order-import-bullmq-runtime.mjs")
    .replaceAll("./conversation-runtime.ts", "./conversation-runtime.mjs")
    .replaceAll("./telegram-bot-answer-runtime.ts", "./bot-answer-runtime.mjs")
    .replaceAll(
      "./telegram-bot-worker-service-runtime.ts",
      "./telegram-bot-worker-service-runtime.mjs"
    )
    .replaceAll("./main.ts", "./main.mjs")
    .replaceAll("../../../packages/channels/src/index.ts", "./channels.mjs");
}

async function writeModule(tempDir, fileName, sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  });
  await writeFile(path.join(tempDir, fileName), compiled.outputText);
}

function readRepoText(repoRoot, relativePath) {
  return Buffer.from(
    ts.sys.readFile(path.join(repoRoot, relativePath)) ?? "",
    "utf8"
  ).toString();
}

function rlsStubSource() {
  return "export function createRlsTransactionContext(context) { return { roleSql: 'set local role \"uzmax_app_runtime\"', settings: [{ key: 'app.org_id', value: context.orgId }, { key: 'app.tenant_id', value: context.tenantId }] }; }";
}

function orderImportStub() {
  return "export const orderImportBullmqQueueDefaults = { queueName: 'unused-order-import' }; export function createOrderImportCsvTextBullmqWorker() { throw new Error('outside smoke scope'); }";
}

function mainStub() {
  return "export function runOrderImportCsvTextPersistenceJob() { throw new Error('outside smoke scope'); }";
}

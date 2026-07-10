import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";

export async function assertM8ActiveAnswerApiReadback(input) {
  const outDir = await compileApiRuntime({ outDir: input.outDir });
  const repoModule = await import(
    pathToFileURL(path.join(outDir, "conversation-ticket.repository.mjs")).href
  );
  const serviceModule = await import(
    pathToFileURL(path.join(outDir, "conversation-ticket.service.mjs")).href
  );
  const repository = await repoModule.createConversationTicketRepositoryProviderFromEnv(
    {
      env: {
        UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE: "rls_prisma_gateway",
        UZMAX_RLS_DATABASE_URL: input.rlsDatabaseUrl
      },
      prismaClient: input.prisma
    }
  );
  const service = new serviceModule.ConversationTicketService(repository);
  const list = await service.listConversations(readbackAccessContext(input), {});
  assert.equal(list.items.length, 2);
  const details = await Promise.all(
    list.items.map((conversation) =>
      service.getConversationDetail(readbackAccessContext(input), conversation.id)
    )
  );
  assert.equal(
    details.filter((detail) =>
      detail.messages.some((message) => message.direction === "outbound")
    ).length,
    2
  );
  assert.equal(details.filter((detail) => detail.tickets.length === 1).length, 1);
  assert.equal(JSON.stringify(details).includes("setup help"), true);
  assert.equal(JSON.stringify(details).includes("unknown"), true);
}

function readbackAccessContext(input) {
  return {
    membershipVersion: 1,
    orgId: input.orgId,
    permissions: ["conversation:read"],
    selectedTenantId: input.tenantId,
    tenantIds: [input.tenantId],
    userId: input.userId
  };
}

export async function compileM8ActiveAnswerRuntimeModules(input) {
  await mkdir(input.tempDir, { recursive: true });
  const write = (fileName, sourceText) =>
    writeModule(input.tempDir, fileName, sourceText);
  const read = (relativePath) => readRepoText(input.repoRoot, relativePath);

  await write(
    "telegram-bot-inbound-contract.mjs",
    read("packages/channels/src/telegram-bot-inbound-contract.ts")
  );
  await write(
    "channels.mjs",
    read("packages/channels/src/index.ts").replaceAll(
      "./telegram-bot-inbound-contract.ts",
      "./telegram-bot-inbound-contract.mjs"
    )
  );
  await write("handoff.mjs", read("packages/capabilities/handoff/src/index.ts"));
  await write("kb.mjs", read("packages/capabilities/kb/src/index.ts"));
  await write("engine.mjs", read("packages/engine/src/index.ts"));
  await write(
    "deepseek-provider.mjs",
    read("packages/llm-gateway/src/deepseek-provider.ts")
  );
  await write("mock-provider.mjs", read("packages/llm-gateway/src/mock-provider.ts"));
  await write(
    "llm-gateway.mjs",
    replaceLlmGatewayImports(read("packages/llm-gateway/src/index.ts"))
  );
  await writeFile(path.join(input.tempDir, "db.mjs"), rlsStubSource);
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
    read("apps/api/src/telegram-bot.ts")
      .replaceAll("../../../packages/channels/src/index.ts", "./channels.mjs")
      .replaceAll(
        "../../../packages/channels/src/telegram-bot-inbound-contract.ts",
        "./telegram-bot-inbound-contract.mjs"
      )
  );

  return {
    api: await import(pathToFileURL(path.join(input.tempDir, "telegram-bot.mjs")).href),
    channels: await import(
      pathToFileURL(path.join(input.tempDir, "channels.mjs")).href
    ),
    conversationRuntime: await import(
      pathToFileURL(path.join(input.tempDir, "conversation-runtime.mjs")).href
    ),
    persistence: await import(
      pathToFileURL(path.join(input.tempDir, "bot-atomic-writes.mjs")).href
    ),
    worker: await import(
      pathToFileURL(path.join(input.tempDir, "worker-service-shell.mjs")).href
    )
  };
}

async function writeWorkerModules(tempDir, read, write) {
  await write(
    "conversation-flow.mjs",
    replaceConversationImports(
      read("apps/worker/src/telegram-bot-conversation.flow.ts")
    )
  );
  await write(
    "conversation-runtime.mjs",
    replaceConversationImports(read("apps/worker/src/conversation-runtime.ts"))
  );
  await write(
    "bot-ticket-follow-up.mjs",
    read("apps/worker/src/telegram-bot-ticket-follow-up.ts").replaceAll(
      "../../../packages/capabilities/handoff/src/index.ts",
      "./handoff.mjs"
    )
  );
  await write(
    "bot-persistence.mjs",
    replaceConversationImports(
      read("apps/worker/src/telegram-bot-conversation-persistence.ts")
    )
  );
  await write(
    "bot-atomic-writes.mjs",
    replaceConversationImports(
      read("apps/worker/src/telegram-bot-conversation.atomic-writes.ts")
    )
  );
  await writeFile(
    path.join(tempDir, "order-import-bullmq-runtime.mjs"),
    orderImportStub
  );
  await writeFile(path.join(tempDir, "main.mjs"), mainStub);
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

function replaceLlmGatewayImports(source) {
  return source
    .replaceAll("./deepseek-provider.ts", "./deepseek-provider.mjs")
    .replaceAll("./mock-provider.ts", "./mock-provider.mjs");
}

function replaceConversationImports(source) {
  return source
    .replaceAll("../../../packages/channels/src/index.ts", "./channels.mjs")
    .replaceAll(
      "../../../packages/channels/src/telegram-bot-inbound-contract.ts",
      "./telegram-bot-inbound-contract.mjs"
    )
    .replaceAll("../../../packages/capabilities/handoff/src/index.ts", "./handoff.mjs")
    .replaceAll("../../../packages/db/src/index.ts", "./db.mjs")
    .replaceAll("./conversation-runtime.ts", "./conversation-runtime.mjs")
    .replaceAll("./telegram-bot-conversation.flow.ts", "./conversation-flow.mjs")
    .replaceAll("./telegram-bot-conversation-persistence.ts", "./bot-persistence.mjs")
    .replaceAll("./telegram-bot-answer-runtime.ts", "./bot-answer-runtime.mjs")
    .replaceAll("./telegram-bot-ticket-follow-up.ts", "./bot-ticket-follow-up.mjs");
}

function replaceWorkerRuntimeImports(source) {
  return source
    .replaceAll("./conversation-runtime.ts", "./conversation-runtime.mjs")
    .replaceAll(
      "./telegram-bot-conversation.atomic-writes.ts",
      "./bot-atomic-writes.mjs"
    )
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
    .replaceAll("../../../packages/channels/src/index.ts", "./channels.mjs")
    .replaceAll(
      "../../../packages/channels/src/telegram-bot-inbound-contract.ts",
      "./telegram-bot-inbound-contract.mjs"
    );
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

const rlsStubSource =
  "export function createRlsTransactionContext(context) { return { roleSql: 'set local role \"uzmax_app_runtime\"', settings: [{ key: 'app.org_id', value: context.orgId }, { key: 'app.tenant_id', value: context.tenantId }] }; }";
const orderImportStub =
  "export const orderImportBullmqQueueDefaults = { queueName: 'unused-order-import' }; export function createOrderImportCsvTextBullmqWorker() { throw new Error('outside smoke scope'); }";
const mainStub =
  "export function runOrderImportCsvTextPersistenceJob() { throw new Error('outside smoke scope'); }";

export function queryM11ConversationFixture(state, strings, values, log) {
  const sql = strings.join("?").replaceAll(/\s+/g, " ").trim().toLowerCase();
  if (sql.includes("set_config"))
    return logged(log, { key: values[0], kind: "set_config", value: values[1] });
  if (sql.includes("pg_advisory_xact_lock")) return logged(log, [{ lock_result: "1" }]);
  if (sql.includes("from conversation"))
    return conversationLockRows(state, sql, values, log);
  if (sql.includes("from ticket")) return ticketLockRows(state, values, log);
  if (sql.includes("from message")) return messageLockRows(state, sql, values, log);
  throw new Error("unsupported fake raw query");
}

function conversationLockRows(state, sql, values, log) {
  const natural = sql.includes("external_conversation_ref");
  const [id, orgId, tenantId, channelConnectionId, externalConversationRef] = natural
    ? [undefined, ...values]
    : values;
  const rows = state.conversations
    .filter((row) =>
      natural
        ? row.orgId === orgId &&
          row.tenantId === tenantId &&
          row.channelConnectionId === channelConnectionId &&
          row.externalConversationRef === externalConversationRef
        : row.id === id && row.orgId === orgId && row.tenantId === tenantId
    )
    .map(({ id: rowId }) => ({ id: rowId }));
  return logged(
    log,
    {
      ids: rows.map((row) => row.id),
      kind: "conversation_lock"
    },
    rows
  );
}

function ticketLockRows(state, values, log) {
  const [conversationId, orgId, tenantId] = values;
  const rows = state.tickets
    .filter(
      (row) =>
        row.conversationId === conversationId &&
        row.orgId === orgId &&
        row.tenantId === tenantId &&
        row.status !== "CLOSED"
    )
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(({ id }) => ({ id }));
  return logged(log, { ids: rows.map((row) => row.id), kind: "ticket_lock" }, rows);
}

function messageLockRows(state, sql, values, log) {
  const exact = sql.includes("where id =");
  const [messageId, conversationId, orgId, tenantId] = exact
    ? values
    : [undefined, ...values];
  const rows = state.messages
    .filter(
      (row) =>
        (!messageId || row.id === messageId) &&
        row.conversationId === conversationId &&
        row.orgId === orgId &&
        row.tenantId === tenantId &&
        (exact ||
          (row.direction === "OUTBOUND" &&
            row.deliveryStatus === "QUEUED" &&
            row.content.runtimeOrigin === "telegram_bot_ai" &&
            row.content.dispatchPhase === "generating"))
    )
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(({ id }) => ({ id }));
  return logged(log, { ids: rows.map((row) => row.id), kind: "message_lock" }, rows);
}

function logged(log, entry, result = entry) {
  log?.push(entry);
  return result;
}

export function applyM11FixtureData(row, data) {
  for (const [key, value] of Object.entries(data)) {
    row[key] =
      isRecord(value) && typeof value.increment === "number"
        ? Number(row[key] ?? 0) + value.increment
        : value;
  }
}

export function matchesM11FixtureWhere(row, where) {
  return Object.entries(where).every(([key, value]) =>
    matchesFixtureField(row, key, value)
  );
}

function matchesFixtureField(row, key, value) {
  if (key === "AND" && Array.isArray(value))
    return value.every((condition) => matchesM11FixtureWhere(row, condition));
  if (!isRecord(value)) return row[key] === value;
  if (Array.isArray(value.in)) return value.in.includes(row[key]);
  if (key === "content")
    return (
      value.path.reduce((item, part) => item?.[part], row.content) === value.equals
    );
  if (key.includes("_"))
    return Object.entries(value).every(([part, expected]) => row[part] === expected);
  if ("not" in value) return row[key] !== value.not;
  return row[key] === value;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function createM11MemoryFenceSeed(channelConnectionId, orgId, tenantId) {
  const conversationId = "52000000-0000-4000-8000-000000000001";
  const messages = [
    ["generating-ai", "generating", "telegram_bot_ai"],
    ["claimed-ai", "claimed", "telegram_bot_ai"],
    ["generating-operator", "generating", "operator"]
  ].map(([id, dispatchPhase, runtimeOrigin]) => ({
    content: { dispatchPhase, runtimeOrigin },
    contentKind: "text",
    conversationId,
    deliveryStatus: "queued",
    direction: "outbound",
    id,
    occurredAt: "2026-07-10T00:00:00.000Z",
    orgId,
    tenantId
  }));
  return {
    conversations: [
      {
        channelConnectionId,
        externalConversationRef: "telegram:chat:memory-fence",
        id: conversationId,
        orgId,
        participantExternalRef: "telegram:user:memory-fence",
        status: "open",
        tenantId,
        unreadCount: 0
      }
    ],
    messages
  };
}

export function deferredM11Barrier() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

export function createM11AnswerRuntime(calls, result, barrier) {
  return {
    async answer() {
      calls.answer += 1;
      if (barrier) {
        barrier.entered.resolve();
        await barrier.release.promise;
      }
      return result;
    }
  };
}

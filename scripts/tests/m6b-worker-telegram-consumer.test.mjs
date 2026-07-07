import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const workerShell = read("apps/worker/src/worker-service-shell.ts");
const workerRuntime = read("apps/worker/src/telegram-bot-worker-service-runtime.ts");
const workerPackage = JSON.parse(read("apps/worker/package.json"));
const ci = read(".github/workflows/ci.yml");
const spec = read("docs/specs/M6B-06b-telegram-worker-consumer.md");

describe("M6B-06b Telegram worker consumer", () => {
  it("starts the Telegram Bot conversation worker only through explicit queue config", () => {
    assert.match(workerShell, /UZMAX_WORKER_QUEUES/);
    assert.match(workerShell, /telegram-bot-conversation/);
    assert.match(workerShell, /createTelegramBotConversationBullmqWorker/);
    assert.match(workerShell, /telegramBotConversationQueueDefaults\.queueName/);
    assert.match(workerShell, /return \["order-import"\]/);
  });

  it("requires RLS DB persistence by default and keeps telemetry explicit", () => {
    assert.match(workerShell, /UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE/);
    assert.match(workerRuntime, /rls_prisma_gateway/);
    assert.match(workerRuntime, /UZMAX_RLS_DATABASE_URL/);
    assert.match(workerRuntime, /createTelemetryOnlyTelegramBotConversationGateway/);
    assert.match(workerShell, /worker\.telegram_bot\.completed/);
  });

  it("declares runtime dependency and CI true DB smoke coverage", () => {
    assert.equal(workerPackage.dependencies["@prisma/client"], "^6.19.3");
    assert.match(ci, /M6B conversation runtime true DB smoke/);
    assert.match(ci, /run-m6b-conversation-runtime-true-db-smoke\.mjs/);
    assert.match(spec, /telegram-bot-conversation/);
  });
});

function read(relativePath) {
  return readFileSync(relativePath, "utf8");
}

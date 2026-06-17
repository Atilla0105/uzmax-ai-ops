import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const tmpRoot = mkdtempSync(path.join(tmpdir(), "uzmax-m2-02-"));

const channels = await importChannelsSource();
const telegramApi = await importTelegramApiSource(channels.moduleUrl);
const contracts = read("docs/contracts/README.md");
const appModule = read("apps/api/src/app.module.ts");
const telegramApiSource = read("apps/api/src/telegram-bot.ts");

describe("M2-02 Telegram Bot ingress baseline", () => {
  it("normalizes bounded Bot update fields and defers unsupported or Business updates", () => {
    const textUpdate = channels.module.normalizeTelegramBotUpdate({
      message: {
        chat: { id: 7001, type: "private", username: "not-retained" },
        date: 1781654400,
        from: { id: 8001, username: "not-retained" },
        message_id: 9001,
        text: "hello",
        raw_surprise: "must-not-leak"
      },
      update_id: 1001
    });

    assert.deepEqual(textUpdate, {
      contentKind: "text",
      chatExternalRef: "telegram:chat:7001",
      messageExternalRef: "telegram:message:9001",
      occurredAt: "2026-06-17T00:00:00.000Z",
      participantExternalRef: "telegram:user:8001",
      provider: "telegram_bot",
      providerUpdateId: "1001",
      text: "hello",
      updateKind: "message"
    });
    assert.equal(JSON.stringify(textUpdate).includes("raw_surprise"), false);

    const photoUpdate = channels.module.normalizeTelegramBotUpdate({
      message: {
        chat: { id: "photo-chat" },
        from: { id: 8002 },
        message_id: 9002,
        photo: [{ file_id: "small" }, { file_id: "large" }]
      },
      update_id: 1002
    });
    assert.equal(photoUpdate.contentKind, "image");
    assert.deepEqual(photoUpdate.fileIds, ["small", "large"]);

    const voiceUpdate = channels.module.normalizeTelegramBotUpdate({
      message: {
        chat: { id: 7003 },
        from: { id: 8003 },
        message_id: 9003,
        voice: { file_id: "voice-file" }
      },
      update_id: 1003
    });
    assert.equal(voiceUpdate.contentKind, "voice");
    assert.deepEqual(voiceUpdate.fileIds, ["voice-file"]);

    const callbackUpdate = channels.module.normalizeTelegramBotUpdate({
      callback_query: {
        data: "confirm:123",
        from: { id: 8004 },
        id: "callback-id",
        message: { chat: { id: 7004 }, message_id: 9004 }
      },
      update_id: 1004
    });
    assert.equal(callbackUpdate.updateKind, "callback_query");
    assert.equal(callbackUpdate.contentKind, "callback");
    assert.equal(callbackUpdate.callbackData, "confirm:123");

    const businessUpdate = channels.module.normalizeTelegramBotUpdate({
      business_message: { message_id: 9005 },
      update_id: 1005
    });
    assert.equal(businessUpdate.contentKind, "unsupported");
    assert.equal(businessUpdate.unsupportedReason, "telegram_business_deferred");

    const unsupportedUpdate = channels.module.normalizeTelegramBotUpdate({
      my_chat_member: { status: "blocked" },
      update_id: 1006
    });
    assert.equal(unsupportedUpdate.contentKind, "unsupported");
    assert.equal(
      unsupportedUpdate.unsupportedReason,
      "unsupported_update_type:my_chat_member"
    );
  });

  it("accepts, dedupes, and safely ignores unsupported updates through the queue port", async () => {
    const queue = new telegramApi.module.InMemoryTelegramBotIngressQueue();
    const core = new telegramApi.module.TelegramBotWebhookCore({
      queue,
      secretToken: "secret_1"
    });
    const headers = {
      [telegramApi.module.TELEGRAM_BOT_SECRET_HEADER]: "secret_1"
    };
    const body = {
      message: {
        chat: { id: 7007 },
        from: { id: 8007 },
        message_id: 9007,
        text: "queue me",
        raw_surprise: "must-not-leak"
      },
      update_id: 2001
    };

    const accepted = await core.handleWebhook({ body, headers });
    assert.deepEqual(accepted, {
      contentKind: "text",
      ok: true,
      providerUpdateId: "2001",
      status: "accepted",
      updateKind: "message"
    });
    assert.equal(queue.jobs.length, 1);
    assert.equal(JSON.stringify(queue.jobs[0]).includes("raw_surprise"), false);

    const deduped = await core.handleWebhook({ body, headers });
    assert.equal(deduped.status, "deduped");
    assert.equal(queue.jobs.length, 1);

    const unsupported = await core.handleWebhook({
      body: { sticker: { file_id: "sticker-file" }, update_id: 2002 },
      headers
    });
    assert.deepEqual(unsupported, {
      contentKind: "unsupported",
      ok: true,
      providerUpdateId: "2002",
      status: "unsupported",
      updateKind: "unsupported"
    });
    assert.equal(queue.jobs.length, 1);
  });

  it("fails closed when the Telegram webhook secret is missing or mismatched", async () => {
    const queue = new telegramApi.module.InMemoryTelegramBotIngressQueue();
    const body = {
      message: {
        chat: { id: 7010 },
        from: { id: 8010 },
        message_id: 9010,
        text: "do not enqueue"
      },
      update_id: 3001
    };

    const unconfigured = new telegramApi.module.TelegramBotWebhookCore({
      queue,
      secretToken: ""
    });
    await assert.rejects(
      () => unconfigured.handleWebhook({ body, headers: {} }),
      matchesWebhookError(503, /secret is not configured/)
    );

    const configured = new telegramApi.module.TelegramBotWebhookCore({
      queue,
      secretToken: "secret_2"
    });
    await assert.rejects(
      () =>
        configured.handleWebhook({
          body,
          headers: { [telegramApi.module.TELEGRAM_BOT_SECRET_HEADER]: "wrong" }
        }),
      matchesWebhookError(401, /secret token mismatch/)
    );
    assert.equal(queue.jobs.length, 0);
  });

  it("registers the webhook shell and documents the contract boundary", () => {
    assert.deepEqual(channels.module.telegramBotAllowedUpdates, [
      "message",
      "callback_query"
    ]);
    assert.match(telegramApiSource, /class TelegramBotWebhookCore/);
    assert.match(appModule, /@Controller\("telegram\/bot"\)/);
    assert.match(appModule, /@Post\("webhook"\)/);
    assert.match(appModule, /TelegramBotWebhookController/);
    assert.match(appModule, /DisabledTelegramBotIngressQueue/);
    assert.match(contracts, /M2 Telegram Bot Ingress Contract/);
    assert.match(contracts, /X-Telegram-Bot-Api-Secret-Token/);
    assert.match(contracts, /No raw Telegram payloads/);
  });
});

async function importChannelsSource() {
  const moduleUrl = transpileToTempModule("packages/channels/src/index.ts");
  return { module: await import(moduleUrl), moduleUrl };
}

async function importTelegramApiSource(channelsModuleUrl) {
  const source = read("apps/api/src/telegram-bot.ts").replace(
    "../../../packages/channels/src/index.ts",
    channelsModuleUrl
  );
  const moduleUrl = writeTempModule("telegram-bot.mjs", transpileSource(source));
  return { module: await import(moduleUrl), moduleUrl };
}

function transpileToTempModule(relativePath) {
  return writeTempModule(
    `${relativePath.replaceAll(/[/.]/g, "_")}.mjs`,
    transpileSource(read(relativePath))
  );
}

function transpileSource(sourceText) {
  return ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
}

function writeTempModule(fileName, sourceText) {
  const filePath = path.join(tmpRoot, fileName);
  writeFileSync(filePath, sourceText, "utf8");
  return pathToFileURL(filePath).href;
}

function read(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  assert.equal(existsSync(absolutePath), true, `missing ${relativePath}`);
  return readFileSync(absolutePath, "utf8");
}

function matchesWebhookError(statusCode, messagePattern) {
  return (error) => {
    assert.equal(error?.statusCode, statusCode);
    assert.match(error?.message ?? "", messagePattern);
    return true;
  };
}

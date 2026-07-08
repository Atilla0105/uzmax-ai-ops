import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const scriptPath = "packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs";
const script = text(scriptPath);
const packageJson = JSON.parse(text("package.json"));
const spec = text("docs/specs/M8-06-internal-live-bot-supervisor.md");
const evidence = text("docs/evidence/M8/M8-06-internal-live-bot-supervisor.md");

describe("M8-06 internal live Bot supervisor", () => {
  it("exposes a named operator command and keeps live actions explicit", () => {
    assert.equal(
      packageJson.scripts["smoke:m8-internal-live-bot"],
      `node ${scriptPath}`
    );
    assert.match(script, /--check-telegram/);
    assert.match(script, /--set-webhook/);
    assert.match(script, /--verify-db/);
    assert.match(script, /--expect-live/);
    assert.match(script, /secret_token/);
    assert.match(script, /allowed_updates/);
    assert.match(script, /getWebhookInfo/);
    assert.match(script, /setWebhook/);
    assert.match(script, /getMe/);
    assert.match(script, /<redacted-path>/);
  });

  it("prints help that names the owner-gated live boundary", () => {
    const result = runScript(["--help"]);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /preflight only/);
    assert.match(result.stdout, /--set-webhook is explicit and owner-gated/);
    assert.match(result.stdout, /--expect-live/);
    assert.match(result.stdout, /UZMAX_INTERNAL_TEST_CHAT_ID/);
    assert.match(result.stdout, /never sends customer data to an LLM\/provider/);
  });

  it("fails closed before any network or DB work when env is missing", () => {
    const result = runScript([], {
      TELEGRAM_BOT_WEBHOOK_SECRET: "",
      TELEGRAM_TEST_BOT_TOKEN: "",
      UZMAX_INTERNAL_TEST_WEBHOOK_URL: "",
      UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID: "",
      UZMAX_TELEGRAM_BOT_ORG_ID: "",
      UZMAX_TELEGRAM_BOT_TENANT_ID: ""
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing required env/);
    assert.match(result.stderr, /UZMAX_TELEGRAM_BOT_TOKEN or TELEGRAM_TEST_BOT_TOKEN/);
    assert.match(result.stderr, /UZMAX_INTERNAL_TEST_WEBHOOK_URL/);
    assert.doesNotMatch(result.stderr, /1234567890:SECRET/);
    assert.equal(result.stdout, "");
  });

  it("rejects --expect-live unless live answer mode is explicit", () => {
    const result = runScript(
      ["--expect-live"],
      completeEnv({
        UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE: "dry_run"
      })
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /requires UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE=live/);
    assert.doesNotMatch(result.stderr, /1234567890:SECRET/);
  });

  it("keeps DB verification scoped to inbound plus outbound-or-ticket readback", () => {
    assert.match(script, /inboundMessages > 0/);
    assert.match(script, /sentOutboundMessages > 0 \|\| readback\.openTickets > 0/);
    assert.match(script, /set local role "uzmax_app_runtime"/);
    assert.match(script, /telegram:chat:/);
    assert.match(script, /m\.direction = 'inbound'/);
    assert.match(script, /m\.direction = 'outbound'/);
    assert.match(script, /m\.delivery_status = 'sent'/);
    assert.match(script, /t\.status = 'open'/);
    assert.doesNotMatch(script, /m\.direction = 'INBOUND'/);
    assert.doesNotMatch(script, /m\.delivery_status = 'SENT'/);
    assert.doesNotMatch(script, /t\.status = 'OPEN'/);
    assert.match(script, /DB readback timed out/);
  });

  it("records the Telegram official-doc basis and remaining live-test boundary", () => {
    const docs = `${spec}\n${evidence}`;
    assert.match(docs, /https:\/\/core\.telegram\.org\/bots\/api/);
    assert.match(docs, /not_ga0_not_release/);
    assert.match(docs, /owner-gated/i);
    assert.match(docs, /No real LLM\/provider call/i);
  });
});

function runScript(args, envOverrides = {}) {
  const env = { ...process.env, ...envOverrides };
  for (const [key, value] of Object.entries(envOverrides)) {
    if (value === "") delete env[key];
  }
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env
  });
}

function completeEnv(overrides = {}) {
  return {
    TELEGRAM_BOT_WEBHOOK_SECRET: "controlled-secret",
    TELEGRAM_TEST_BOT_TOKEN: "1234567890:SECRETSECRETSECRETSECRETSECRET",
    UZMAX_INTERNAL_TEST_WEBHOOK_URL: "https://example.com/telegram/bot/webhook",
    UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID: "33333333-3333-4333-8333-333333333604",
    UZMAX_TELEGRAM_BOT_ORG_ID: "11111111-1111-4111-8111-111111111604",
    UZMAX_TELEGRAM_BOT_TENANT_ID: "22222222-2222-4222-8222-222222222604",
    ...overrides
  };
}

function text(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");

const files = {
  acceptance: "UZMAX智能运营系统-1.0验收矩阵-v1.1.md",
  architecture: "UZMAX智能运营系统-技术架构-v1.1.md",
  prd: "UZMAX智能运营系统-PRD-v1.1.md",
  spec: "docs/specs/M6-06-telegram-bot-ga0-main-path.md",
  evidence: "docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md",
  m6Readme: "docs/evidence/M6/README.md",
  release: "docs/release.md",
  runbook: "docs/runbooks/telegram-bot-main-path.md",
  runbookIndex: "docs/runbooks/README.md",
  adrB01: "docs/adr/ADR-B01-telegram-business.md",
  spk01: "docs/evidence/M2/spikes/SPK-01-telegram-business/manifest.md",
  botSource: "apps/api/src/telegram-bot.ts",
  channelsSource: "packages/channels/src/index.ts",
  appModule: "apps/api/src/app.module.ts",
  handoffSource: "packages/capabilities/handoff/src/index.ts",
  conversationService: "apps/api/src/conversation-ticket.service.ts",
  conversationController: "apps/api/src/conversation-ticket.controller.ts",
  m202Evidence: "docs/evidence/M2/M2-02-telegram-bot-ingress-dedupe-queue.md",
  m203Evidence: "docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md",
  m204Evidence: "docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md",
  m207Evidence: "docs/evidence/M2/M2-07-conversation-ticket-api-http-hardening.md",
  m603Evidence: "docs/evidence/M6/M6-03-queue-failure-injection-drills.md",
  m605Evidence: "docs/evidence/M6/M6-05-ai-safety-eval-gates.md",
  botTest: "scripts/tests/m2-telegram-bot-ingress.test.mjs",
  handoffTest: "scripts/tests/m2-conversation-ticket-api-contract.test.mjs",
  httpTest: "scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs",
  m603Test: "scripts/tests/m6-queue-failure-injection-drills.test.mjs",
  m605Test: "scripts/tests/m6-ai-safety-eval-gates.test.mjs"
};

const contents = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, read(path)])
);

test("M6-06 maps Bot GA-0 acceptance items to repo evidence", () => {
  for (const token of ["C-01", "C-02", "C-03b", "C-06", "J-04", "L-01", "L-02"]) {
    assert.match(contents.acceptance, new RegExp(token));
    assert.match(contents.evidence, new RegExp(token));
  }

  for (const path of [
    files.botSource,
    files.channelsSource,
    files.conversationService,
    files.conversationController,
    files.handoffSource,
    files.adrB01,
    files.spk01,
    files.m202Evidence,
    files.m203Evidence,
    files.m207Evidence,
    files.m603Evidence,
    files.m605Evidence,
    files.runbook
  ]) {
    assert.match(
      contents.evidence,
      new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }
});

test("Bot ingress evidence remains bounded, deduped, and fail-closed", () => {
  assert.match(contents.channelsSource, /telegramBotAllowedUpdates/);
  assert.match(contents.channelsSource, /"message", "callback_query"/);
  assert.match(contents.channelsSource, /normalizeTelegramBotUpdate/);
  assert.match(contents.channelsSource, /business_message/);
  assert.match(contents.channelsSource, /telegram_business_deferred/);
  assert.match(contents.botSource, /TELEGRAM_BOT_SECRET_HEADER/);
  assert.match(contents.botSource, /DisabledTelegramBotIngressQueue/);
  assert.match(contents.botSource, /InMemoryTelegramBotIngressQueue/);
  assert.match(contents.botSource, /seenProviderUpdateIds/);
  assert.match(contents.botTest, /status: "accepted"/);
  assert.match(contents.botTest, /status, "deduped"/);
  assert.match(contents.botTest, /status: "unsupported"/);
  assert.match(contents.botTest, /secret token mismatch/);
  assert.match(
    contents.m202Evidence,
    /no raw customer data, Telegram payload files|no raw payload retention/i
  );
});

test("Manual handoff path is recorded without claiming production worker closure", () => {
  assert.match(contents.handoffSource, /createHumanHandoff/);
  assert.match(contents.handoffSource, /pending_handoff/);
  assert.match(contents.handoffSource, /aiState: "suspended"/);
  assert.match(contents.handoffSource, /withdrawn/);
  assert.match(contents.handoffSource, /pending_cancel/);
  assert.match(contents.conversationService, /createHandoffTicket/);
  assert.match(
    contents.conversationController,
    /@Post\("conversations\/:conversationId\/handoff"\)/
  );
  assert.match(
    contents.handoffTest,
    /creates a handoff ticket draft and suspends in-flight AI/
  );
  assert.match(contents.httpTest, /ticket is locked by another user/);
  assert.match(contents.evidence, /Real Bot leave-ticket behavior remains/);
  assert.match(contents.evidence, /worker consumer remains future scope/);
});

test("Business auto-reply remains disabled under ADR-B01", () => {
  assert.match(contents.prd, /1\.0 不允许 Telegram Business 自动回复/);
  assert.match(contents.architecture, /1\.0 禁止自动发送 Business 回复/);
  assert.match(contents.adrB01, /decision_type: no_go_owner_inputs_missing/);
  assert.match(contents.adrB01, /C-03b.*P0_current_branch/s);
  assert.match(contents.adrB01, /入口不可见，API 不可调用，后台不可发送/s);
  assert.match(contents.spk01, /no_go_owner_inputs_missing/);
  assert.match(contents.spk01, /C-03b/);
  assert.match(contents.evidence, /no Business auto-reply launch is approved/i);
  assert.doesNotMatch(
    contents.evidence,
    /Business auto-reply (is )?(approved|enabled)\b/i
  );
});

test("Bot runbook covers no-response, duplicate/out-of-order, Business disabled and manual escalation", () => {
  for (const token of [
    "Bot No Response",
    "Duplicate And Out Of Order Ingress",
    "Business Disabled Handling",
    "Manual Escalation",
    "m6-bot-ga0-main-path-readiness.test.mjs",
    "m2-telegram-bot-ingress.test.mjs",
    "m2-conversation-ticket-api-contract.test.mjs",
    "m6-ai-safety-eval-gates.test.mjs",
    "Close GA-0/release authorization"
  ]) {
    assert.match(contents.runbook, new RegExp(token));
  }
  assert.match(contents.runbookIndex, /telegram-bot-main-path\.md/);
});

test("M6 index and release boundary reflect M6-06 without opening GA-0", () => {
  for (const doc of [contents.m6Readme, contents.release]) {
    assert.match(doc, /M6-06/);
    assert.match(doc, /GA-0 is not open|GA-0 remains locked/);
    assert.match(doc, /Telegram Business automatic reply/i);
    assert.match(doc, /real customer/i);
  }

  for (const doc of [contents.spec, contents.evidence, contents.runbook]) {
    assert.match(
      doc,
      /not approve|not approved|not open|not granted|remains not approved/i
    );
    assert.doesNotMatch(doc, /GA-0 (is )?(approved|opened)\b/i);
    assert.doesNotMatch(doc, /Business auto-reply (is )?(approved|enabled)\b/i);
    assert.doesNotMatch(doc, /real customer traffic (is )?approved\b/i);
  }
});

test("M6-06 remains docs/test-only and forbids source/schema/provider edits", () => {
  assert.match(contents.spec, /Source files: 0 changed, 0 new, 0 net LOC/);
  assert.match(
    contents.spec,
    /Generated, lockfile, migration, schema, CI\/config changes: none/
  );
  assert.match(contents.spec, /Do not modify runtime source/);
  assert.match(contents.spec, /New external API\/provider\/adapter code/);
  assert.doesNotMatch(
    contents.spec,
    /large_change_exception|external_dependency_exception/
  );
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const contractSource = read("apps/admin/src/aiMemberConsoleContracts.ts");
const shellSource = read("apps/admin/src/M5AiMemberConsoleShell.tsx");
const appSource = read("apps/admin/src/App.tsx");
const playwrightSpec = read("apps/admin/tests/m5-ai-member-console.spec.ts");
const spec = read("docs/specs/M5-05-ai-member-console.md");
const evidence = read("docs/evidence/M5/M5-05-ai-member-console.md");
const m5Index = read("docs/evidence/M5/README.md");
const incident = read("docs/incidents/INC-2026-06-24-m5-05-root-patch-target.md");
const contracts = await importContracts();

describe("M5-05 AI member console", () => {
  it("creates local AI member action drafts without formal runtime writes", () => {
    const emergency = contracts.createAiMemberActionDraft({
      action: "emergency_stop",
      auditRef: "controlled://ai-member/audit/emergency-stop",
      currentStatus: "online",
      reasonRef: "controlled://ai-member/reason/emergency-stop"
    });
    assert.equal(emergency.targetStatus, "disabled");
    assert.equal(emergency.formalRuntimeWrite, false);
    assert.equal(emergency.requiresOwnerConfirmation, true);

    const manual = contracts.createAiMemberActionDraft({
      action: "manual_offline",
      auditRef: "controlled://ai-member/audit/manual-offline",
      currentStatus: "breaker_offline",
      reasonRef: "controlled://ai-member/reason/manual-offline"
    });
    assert.equal(manual.targetStatus, "manual_offline");
    assert.equal(manual.requiresOwnerConfirmation, false);

    const toggle = contracts.createAiMemberActionDraft({
      action: "toggle_capability",
      auditRef: "controlled://ai-member/audit/toggle",
      capabilityKey: "vision",
      currentStatus: "manual_offline",
      nextEnabled: true,
      reasonRef: "controlled://ai-member/reason/toggle"
    });
    assert.equal(toggle.capabilityKey, "vision");
    assert.equal(toggle.nextEnabled, true);
    assert.equal(toggle.targetStatus, "manual_offline");
  });

  it("fails closed for malformed actions, unsafe refs and raw payload fields", () => {
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "pause_ai",
          auditRef: "controlled://ai-member/audit/pause",
          currentStatus: "online",
          reasonRef: "controlled://ai-member/reason/pause"
        }),
      /AI member action is invalid/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "manual_offline",
          auditRef: "controlled://ai-member/audit/manual",
          currentStatus: "paused",
          reasonRef: "controlled://ai-member/reason/manual"
        }),
      /AI member status is invalid/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "toggle_capability",
          auditRef: "controlled://ai-member/audit/toggle",
          capabilityKey: "sms",
          currentStatus: "online",
          nextEnabled: true,
          reasonRef: "controlled://ai-member/reason/toggle"
        }),
      /AI member capability key is invalid/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "recover_online",
          auditRef: "controlled://ai-member/audit/recover",
          currentStatus: "disabled",
          reasonRef: "https://example.invalid/reason"
        }),
      /reasonRef must not be a URL or inline payload/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "recover_online",
          auditRef: "controlled://ai-member/audit/raw",
          currentStatus: "disabled",
          reasonRef: "controlled://ai-member/reason/recover"
        }),
      /auditRef must be a safe controlled ref/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "recover_online",
          auditRef:
            "controlled://ai-member/audit/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          currentStatus: "disabled",
          reasonRef: "controlled://ai-member/reason/recover"
        }),
      /auditRef must be a safe controlled ref/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "toggle_capability",
          auditRef: "controlled://ai-member/audit/toggle",
          capabilityKey: "quote",
          currentStatus: "online",
          reasonRef: "controlled://ai-member/reason/toggle"
        }),
      /nextEnabled must be boolean/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "manual_offline",
          auditRef: "controlled://ai-member/audit/manual",
          capabilityKey: "quote",
          currentStatus: "online",
          reasonRef: "controlled://ai-member/reason/manual"
        }),
      /capability toggle fields are only allowed/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "manual_offline",
          auditRef: "controlled://ai-member/audit/manual",
          currentStatus: "online",
          localNoteRef: "controlled://ai-member/note/local",
          reasonRef: "controlled://ai-member/reason/manual"
        }),
      /localNoteRef is not allowed/
    );
    assert.throws(
      () =>
        contracts.createAiMemberActionDraft({
          action: "manual_offline",
          auditRef: "controlled://ai-member/audit/manual",
          currentStatus: "online",
          rawPayload: "customer text",
          reasonRef: "controlled://ai-member/reason/manual"
        }),
      /rawPayload is a forbidden raw payload key/
    );
  });

  it("records scope and source boundaries without backend imports or runtime fetches", () => {
    assert.match(contractSource, /formalRuntimeWrite: false/);
    assert.match(shellSource, /M5AiMemberConsoleShell/);
    assert.match(appSource, /M5AiMemberConsoleShell/);
    assert.match(playwrightSpec, /M5-05 AI member console/);
    assert.match(incident, /Root Patch Target/);
    assert.match(
      `${spec}\n${evidence}\n${m5Index}`,
      /(?=.*M5-05 AI Member Console)(?=.*changed source files <= 4, net source LOC <= 600)(?=.*supported_not_closed)(?=.*m5_05_ai_member_console_recorded__not_accepted)(?=.*No Sensitive Data Statement)/s
    );
    assert.doesNotMatch(
      `${contractSource}\n${shellSource}\n${appSource}`,
      /from\s+["'].*(?:apps\/api|apps\/worker|apps\/cron|packages\/db|packages\/distill|packages\/capabilities|packages\/engine|packages\/llm-gateway|packages\/evals|@uzmax\/api|@uzmax\/db)["']|process\.env|globalThis\.fetch|\bfetch\(|\bWebSocket\b|\bEventSource\b|\bXMLHttpRequest\b|navigator\.sendBeacon/i
    );
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importContracts() {
  const outputText = ts.transpileModule(contractSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  const encodedModule = Buffer.from(outputText, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encodedModule}`);
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const contractSource = read("apps/admin/src/logsAnalyticsContracts.ts");
const shellSource = read("apps/admin/src/M5LogsAnalyticsShell.tsx");
const appSource = read("apps/admin/src/App.tsx");
const playwrightSpec = read("apps/admin/tests/m5-logs-analytics.spec.ts");
const spec = read("docs/specs/M5-06-logs-analytics.md");
const evidence = read("docs/evidence/M5/M5-06-logs-analytics.md");
const m5Index = read("docs/evidence/M5/README.md");
const contracts = await importContracts();

describe("M5-06 logs analytics", () => {
  it("whitelists analytics dimensions and fixed board items", () => {
    assert.deepEqual(contracts.logsAnalyticsDimensions, [
      "tenant",
      "member",
      "ai_member",
      "channel",
      "intent",
      "time_grain",
      "order_status",
      "handoff_reason"
    ]);
    for (const label of [
      "Resolution rate",
      "Handoff rate",
      "SLA",
      "Cost",
      "Top questions",
      "Order query",
      "Draft adoption",
      "Knowledge health",
      "Confirmation queue 7-day pass rate",
      "Distill frequency",
      "Real traffic baseline"
    ]) {
      assert.ok(
        contracts.fixedAnalyticsBoardItems.some((item) => item.label === label),
        `${label} is present`
      );
    }
  });

  it("creates local export drafts without formal export writes", () => {
    const draft = contracts.createLogsAnalyticsExportDraft({
      actorRef: "controlled://analytics/actor/owner",
      dimensions: ["tenant", "member", "channel"],
      filterRefs: ["controlled://analytics/filter/login"],
      metricRefs: ["controlled://metric/board-1"],
      viewRef: "controlled://analytics/view/m5-06"
    });
    assert.equal(draft.formalExportWrite, false);
    assert.equal(draft.requiresOwnerConfirmation, true);
    assert.equal(draft.fileRef, null);
    assert.deepEqual(draft.dimensions, ["tenant", "member", "channel"]);
    assert.equal(draft.status, "draft_requires_owner_confirmation");
  });

  it("fails closed for unsafe dimensions, refs and payload fields", () => {
    assert.throws(
      () =>
        contracts.createLogsAnalyticsExportDraft({
          actorRef: "controlled://analytics/actor/owner",
          dimensions: ["tenant", "unsafe_field"],
          metricRefs: ["controlled://metric/board-1"],
          viewRef: "controlled://analytics/view/m5-06"
        }),
      /analytics dimension is not whitelisted/
    );
    assert.throws(
      () =>
        contracts.createLogsAnalyticsExportDraft({
          actorRef: "controlled://analytics/actor/owner",
          dimensions: ["tenant"],
          metricRefs: ["controlled://metric/board-1"],
          rawPayload: "inline text",
          viewRef: "controlled://analytics/view/m5-06"
        }),
      /rawPayload is a forbidden raw payload key/
    );
    assert.throws(
      () =>
        contracts.createLogsAnalyticsExportDraft({
          actorRef: "controlled://analytics/actor/owner",
          dimensions: ["tenant"],
          metricRefs: ["controlled://metric/board-1"],
          viewRef: "https://example.invalid/export"
        }),
      /viewRef must not be a URL or inline payload/
    );
    assert.throws(
      () =>
        contracts.createLogsAnalyticsExportDraft({
          actorRef:
            "controlled://analytics/actor/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          dimensions: ["tenant"],
          metricRefs: ["controlled://metric/board-1"],
          viewRef: "controlled://analytics/view/m5-06"
        }),
      /actorRef must be a safe controlled ref/
    );
    assert.throws(
      () =>
        contracts.createLogsAnalyticsExportDraft({
          actorRef: "controlled://analytics/actor/owner",
          dimensions: ["tenant"],
          metricRefs: ["controlled://metric/raw-dump"],
          viewRef: "controlled://analytics/view/m5-06"
        }),
      /metricRefs\.0 must be a safe controlled ref/
    );
    for (const unsafeRef of [
      "controlled://analytics/customerProfile",
      "controlled://analytics/rawPayload",
      "controlled://analytics/secretRef",
      "controlled://analytics/orderStatus"
    ]) {
      assert.throws(
        () =>
          contracts.createLogsAnalyticsExportDraft({
            actorRef: "controlled://analytics/actor/owner",
            dimensions: ["tenant"],
            metricRefs: [unsafeRef],
            viewRef: "controlled://analytics/view/m5-06"
          }),
        /metricRefs\.0 must be a safe controlled ref/
      );
    }
    assert.throws(
      () =>
        contracts.createLogsAnalyticsExportDraft({
          actorRef: "controlled://analytics/actor/owner",
          dimensions: ["tenant"],
          metricRefs: ["controlled://metric/board-1"],
          viewRef: "controlled://analytics/view/m5-06",
          xlsxFileRef: "controlled://analytics/file-a"
        }),
      /xlsxFileRef is not allowed/
    );
  });

  it("records scope and source boundaries without backend imports or runtime fetches", () => {
    assert.match(contractSource, /formalExportWrite: false/);
    assert.match(shellSource, /M5LogsAnalyticsShell/);
    assert.match(appSource, /M5LogsAnalyticsShell/);
    assert.match(playwrightSpec, /M5-06 logs analytics/);
    assert.match(
      `${spec}\n${evidence}\n${m5Index}`,
      /(?=.*M5-06 Logs Analytics)(?=.*changed source files <= 4, net source LOC <= 600)(?=.*frontend_local_contract_supported_not_closed)(?=.*m5_06_logs_analytics_recorded__not_accepted)(?=.*No Sensitive Data Statement)/s
    );
    assert.doesNotMatch(
      `${contractSource}\n${shellSource}\n${appSource}`,
      /from\s+["'].*(?:apps\/api|apps\/worker|apps\/cron|packages\/db|packages\/distill|packages\/capabilities|packages\/engine|packages\/llm-gateway|packages\/evals|@uzmax\/api|@uzmax\/db)["']|process\.env|globalThis\.fetch|\bfetch\(|\bWebSocket\b|\bEventSource\b|\bXMLHttpRequest\b|navigator\.sendBeacon/i
    );
    assert.doesNotMatch(shellSource, /ORD-|PAY-|TG-|telegram payload|xlsx|@[\w_]+/i);
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importContracts() {
  const { outputText } = ts.transpileModule(contractSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  });
  return import(`data:text/javascript;charset=utf-8,${encodeURIComponent(outputText)}`);
}

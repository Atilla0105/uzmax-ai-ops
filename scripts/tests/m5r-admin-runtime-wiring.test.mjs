import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(path, "utf8");

const files = {
  aiShell: read("apps/admin/src/M5AiMemberConsoleShell.tsx"),
  confirmationShell: read("apps/admin/src/M5ConfirmationQueueShell.tsx"),
  confirmationClient: read("apps/admin/src/confirmationQueueApiClient.ts"),
  confirmationRuntime: read("apps/admin/src/m5ConfirmationQueueRuntime.ts"),
  evidence: read("docs/evidence/M5R/M5R-07-admin-runtime-wiring.md"),
  logsClient: read("apps/admin/src/logsAnalyticsApiClient.ts"),
  playwright: read("apps/admin/tests/m5r-admin-runtime-wiring.spec.ts"),
  readme: read("docs/evidence/M5R/README.md"),
  runtimeMode: read("apps/admin/src/m5AdminRuntimeMode.ts"),
  spec: read("docs/specs/M5R-07-admin-runtime-wiring.md"),
  templateClient: read("apps/admin/src/templateCopyApiClient.ts")
};

test("M5R-07 spec and evidence keep admin-only runtime boundaries explicit", () => {
  assert.match(files.spec, /M5R-07 Admin Runtime Wiring/);
  assert.match(files.spec, /apps\/admin\/src\/M5ConfirmationQueueShell\.tsx/);
  assert.match(files.spec, /No `packages\/db`|No packages\/db/);
  assert.match(files.evidence, /M5R-07 Admin Runtime Wiring Evidence/);
  assert.match(files.evidence, /Direct true DB\/RLS smoke omitted/);
  for (const slice of ["M5R-01", "M5R-04", "M5R-05", "M5R-06"]) {
    assert.match(files.evidence, new RegExp(slice));
  }
  assert.match(
    files.readme,
    /M5R-06 Template Copy Runtime \| `runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted`/
  );
  assert.match(
    files.readme,
    /M5R-07 Admin Runtime Wiring \| `admin_runtime_wiring_supported_not_true_closeout_not_owner_accepted`/
  );
  assert.match(
    files.readme,
    /M5R-08 True Integration Closeout \| `m5r_08_true_integration_closeout_pending_secret_backed_ci_not_owner_accepted`/
  );
});

test("runtime mode is opt-in and wires the four existing admin shells", () => {
  assert.match(files.runtimeMode, /__UZMAX_M5R_ADMIN_RUNTIME__/);
  assert.match(files.runtimeMode, /config\?\.enabled === true/);
  assert.match(files.confirmationClient, /createConfirmationQueueApiClient/);
  assert.match(files.confirmationRuntime, /\.getItem\(itemId\)/);
  assert.match(files.confirmationShell, /m5-runtime-empty/);
  assert.match(files.confirmationClient, /auditDraft\.formalWrite must match/);
  assert.doesNotMatch(files.confirmationClient, /must keep formalWrite false/);
  assert.match(files.aiShell, /createAiMemberRuntimeApiClient/);
  assert.match(files.aiShell, /toggleCapability/);
  assert.match(files.aiShell, /activeVersionEvidence\.evalGateId/);
  assert.match(files.logsClient, /\/logs-analytics/);
  assert.match(files.logsClient, /\/export-jobs/);
  assert.match(files.templateClient, /\/template-copy/);
  assert.match(files.templateClient, /\/copies/);
});

test("Playwright runtime smoke asserts desktop and 320px API requests", () => {
  assert.match(files.playwright, /page\.route/);
  assert.match(files.playwright, /\/confirmation-queue\/items/);
  assert.match(files.playwright, /\/ai-members\/\$\{memberId\}\/runtime-control/);
  assert.match(files.playwright, /\/logs-analytics\/board/);
  assert.match(files.playwright, /\/template-copy\/copies/);
  assert.match(files.playwright, /configVersionId/);
  assert.match(files.playwright, /m5-runtime-empty/);
  assert.match(files.playwright, /width: 320/);
  assert.doesNotMatch(files.playwright, /\.only|\.skip|xit|xfail/);
});

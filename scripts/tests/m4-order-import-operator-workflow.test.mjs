import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const spec = read("docs/specs/M4-42-order-import-operator-workflow.md");
const orderShellSource = read("apps/admin/src/M4OrderPathStatusShell.tsx");
const operatorSource = read("apps/admin/src/M4OrderImportOperatorWorkflow.tsx");
const cssSource = read("apps/admin/src/m4-order-path-status-shell.css");
const designSpec = read("apps/admin/tests/design.spec.ts");
const apiClientSource = read("apps/admin/src/orderImportApiClient.ts");
const apiSubmitSource = read("apps/api/src/order-import.submit.ts");
const visibleSmokeSource = read("apps/admin/src/M4OrderImportVisibleSmokeState.tsx");
const visibleSmokeSubmitSource = read(
  "apps/admin/src/orderImportVisibleSmokeSubmit.ts"
);
const visibleHarnessSource = read(
  "packages/db/scripts/order-import-admin-visible-smoke-harness.mjs"
);
const operatorSmokeSource = read(
  "packages/db/scripts/run-m4-order-import-operator-workflow-smoke.mjs"
);
const storageSmokeSource = read(
  "packages/db/scripts/run-m4-order-import-storage-backed-true-db-smoke.mjs"
);
const ciSource = read(".github/workflows/ci.yml");
const evidence = read("docs/evidence/M4/M4-42-order-import-operator-workflow.md");
const m4Index = read("docs/evidence/M4/README.md");

describe("M4-42 order import operator workflow", () => {
  it("roots execution in the approved M4-42 plan and keeps later M4 slices separate", () => {
    assert.match(spec, /M4-42：订单导入 operator workflow/);
    assert.match(
      spec,
      /packages\/db\/scripts\/run-m4-order-import-operator-workflow-smoke\.mjs/
    );
    assert.match(spec, /M4-43：客户资产真实 DB\/RLS-backed workflow/);
    assert.match(spec, /M4-44：AI order-read runtime/);
    assert.match(spec, /M4-45：队列\/安全\/closeout/);
    assert.match(spec, /不新增客户资产 DB runtime、AI order-read runtime/);
  });

  it("adds a visible operator workflow without bloating the existing order shell", () => {
    assert.match(orderShellSource, /M4OrderImportOperatorWorkflow/);
    assert.match(operatorSource, /data-testid="m4-order-import-operator-workflow"/);
    assert.match(operatorSource, /Submit storage metadata/);
    assert.match(operatorSource, /POST \/order-import\/storage-jobs/);
    assert.match(operatorSource, /text\/csv or text\/tab-separated-values/);
    assert.match(cssSource, /m4-operator-workflow/);
    assert.match(cssSource, /@media \(max-width: 900px\)/);
    assert.ok(operatorSource.split("\n").length <= 220);
  });

  it("keeps operator submit on Storage metadata and blocks raw browser payloads", () => {
    assert.match(operatorSource, /storageSubmit/);
    assert.match(operatorSource, /submitVisibleSmokeJobOnce/);
    assert.match(visibleSmokeSubmitSource, /autoSubmit\?: boolean/);
    assert.match(visibleSmokeSource, /smokeConfig\.autoSubmit !== false/);
    assert.match(apiClientSource, /submitImportStorageObjectJob/);
    assert.match(apiSubmitSource, /rejectStorageInlinePayload/);
    assert.match(apiSubmitSource, /csvText is not accepted for storage submit/);
    assert.match(apiSubmitSource, /sourceRef is derived from storage metadata/);
    assert.doesNotMatch(operatorSource, /csvText|FileReader|FormData|arrayBuffer/);
    assert.doesNotMatch(operatorSource, /order_connector|customer-assets|llm|prompt/i);
  });

  it("extends browser coverage for the operator surface and no-fabrication states", () => {
    assert.match(designSpec, /m4-order-import-operator-workflow/);
    assert.match(designSpec, /m4-operator-storage-metadata/);
    assert.match(designSpec, /Submit storage metadata/);
    assert.match(designSpec, /Status ref hidden unless fresh/);
    assert.doesNotMatch(designSpec, /\.skip|\.only|xit|xfail/);
  });

  it("adds a true DB operator workflow runner without duplicating the import path", () => {
    const submitBlock = /const storageSubmitPayload = \{[\s\S]*?\n\};/.exec(
      operatorSmokeSource
    )?.[0];
    assert.ok(submitBlock);
    assert.match(operatorSmokeSource, /autoSubmit: false/);
    assert.match(operatorSmokeSource, /Submit storage metadata/);
    assert.match(operatorSmokeSource, /text\/tab-separated-values/);
    assert.match(operatorSmokeSource, /orders\.tsv/);
    assert.match(operatorSmokeSource, /waitForCapturedApiPostBody/);
    assert.match(operatorSmokeSource, /assertTenantBOrderImportIsolation/);
    assert.match(operatorSmokeSource, /order_snapshot_stale/);
    assert.match(operatorSmokeSource, /order_snapshot_missing/);
    assert.match(operatorSmokeSource, /storage_object_residue=0/);
    assert.match(visibleHarnessSource, /prepareSupabaseStorageObject/);
    assert.match(visibleHarnessSource, /downloadSupabaseStorageObject/);
    assert.match(visibleHarnessSource, /cleanupSupabaseStorageObject/);
    assert.doesNotMatch(submitBlock, /csvText|sourceRef/);
    assert.doesNotMatch(operatorSmokeSource, /service_role|sk-|phone|address/i);
  });

  it("continues to rely on the M4-41 true Storage and DB smoke foundation", () => {
    assert.match(storageSmokeSource, /createWorkerStorageObjectSubmitDispatcher/);
    assert.match(storageSmokeSource, /downloadSupabaseStorageObject/);
    assert.match(storageSmokeSource, /storage_object_residue=0/);
    assert.match(storageSmokeSource, /Storage download->worker dispatch->DB\/RLS/);
  });

  it("wires CI and evidence while leaving M4-43 through M4-45 open", () => {
    assert.match(ciSource, /run-m4-order-import-operator-workflow-smoke\.mjs/);
    assert.match(evidence, /M4-42 Order Import Operator Workflow Evidence/);
    assert.match(evidence, /CI true DB\/Storage validation passed/);
    assert.match(evidence, /28036581776/);
    assert.match(evidence, /db_residue=0/);
    assert.match(evidence, /storage_object_residue=0/);
    assert.match(evidence, /M4-43\/M4-44\/M4-45/);
    assert.match(m4Index, /M4-42 order import operator workflow evidence/);
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

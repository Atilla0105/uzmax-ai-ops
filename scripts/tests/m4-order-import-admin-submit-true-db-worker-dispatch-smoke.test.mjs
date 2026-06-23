import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const adminClientSource = read("apps/admin/src/orderImportApiClient.ts");
const visibleSmokeSource = read("apps/admin/src/M4OrderImportVisibleSmokeState.tsx");
const apiControllerSource = read("apps/api/src/order-import.controller.ts");
const apiServiceSource = read("apps/api/src/order-import.service.ts");
const httpHarnessSource = read("apps/api/scripts/order-import-http-smoke-harness.mjs");
const visibleHarnessSource = read(
  "packages/db/scripts/order-import-admin-visible-smoke-harness.mjs"
);
const smokeSource = read(
  "packages/db/scripts/run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke.mjs"
);
const ciSource = read(".github/workflows/ci.yml");
const spec = read(
  "docs/specs/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md"
);
const evidence = read(
  "docs/evidence/M4/M4-40-order-import-admin-submit-true-db-worker-dispatch-smoke.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const adminClientModuleText = ts.transpileModule(adminClientSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  }
}).outputText;
const adminClient = await import(
  `data:text/javascript;base64,${Buffer.from(adminClientModuleText, "utf8").toString(
    "base64"
  )}`
);

describe("M4-40 order import admin submit true DB worker dispatch smoke", () => {
  it("adds a controlled Admin client POST submit method", async () => {
    const calls = [];
    const client = adminClient.createOrderImportApiClient({
      fetcher: async (input, init) => {
        calls.push({ init, input });
        return {
          json: async () => ({
            dispatch: {
              idempotencyKey: "controlled://order-import/job-a",
              jobId: "55555555-5555-4555-8555-555555555140",
              jobName: "order_import_csv_text"
            },
            importJobId: "55555555-5555-4555-8555-555555555140",
            persisted: { importJobs: 1, rowErrors: 1, snapshots: 1 },
            sourceRef: "storage://order-imports/m4-40.csv",
            status: "submitted"
          }),
          ok: true,
          status: 200
        };
      }
    });

    const result = await client.submitImportCsvTextJob({
      csvText: "external_order_ref,order_status_ref,source_updated_at,expires_at",
      importJobId: "55555555-5555-4555-8555-555555555140",
      importedAt: "2026-06-23T08:30:00.000Z",
      rowErrorIds: ["77777777-7777-4777-8777-777777777140"],
      snapshotIds: ["66666666-6666-4666-8666-666666666140"],
      sourceRef: "storage://order-imports/m4-40.csv"
    });

    assert.equal(result.status, "submitted");
    assert.deepEqual(
      calls.map((call) => [call.input, call.init.method]),
      [["/order-import/jobs", "POST"]]
    );
    assert.equal(calls[0].init.headers["content-type"], "application/json");
    assert.match(calls[0].init.body, /55555555-5555-4555-8555-555555555140/);
  });

  it("rejects invalid submit UUID allocations before the API request", async () => {
    const calls = [];
    const client = adminClient.createOrderImportApiClient({
      fetcher: async (input, init) => {
        calls.push({ init, input });
        return { json: async () => ({}), ok: true, status: 200 };
      }
    });

    await assert.rejects(
      () =>
        client.submitImportCsvTextJob({
          csvText: "external_order_ref,order_status_ref,source_updated_at,expires_at",
          importJobId: "55555555-5555-4555-8555-555555555140",
          importedAt: "2026-06-23T08:30:00.000Z",
          rowErrorIds: ["not-a-uuid"],
          snapshotIds: ["66666666-6666-4666-8666-666666666140"],
          sourceRef: "storage://order-imports/m4-40.csv"
        }),
      /rowErrorIds\.0 must be a UUID/
    );
    assert.deepEqual(calls, []);
  });

  it("keeps submit smoke opt-in and fail-closed behind the API dispatcher port", () => {
    assert.match(visibleSmokeSource, /submit\?: OrderImportCsvTextSubmitInput/);
    assert.match(visibleSmokeSource, /client\s*\.submitImportCsvTextJob/);
    assert.match(
      visibleSmokeSource,
      /submittedSmokeJobs = new Map<string, Promise<string>>\(\)/
    );
    assert.match(visibleSmokeSource, /submittedSmokeJobs\.get\(submitKey\)/);
    assert.match(
      visibleSmokeSource,
      /submittedSmokeJobs\.set\(submitKey, nextSubmit\)/
    );
    assert.match(visibleSmokeSource, /submitResult\.importJobId/);
    assert.match(
      visibleSmokeSource,
      /jobs\.find\(\(item\) => item\.id === submittedImportJobId\)/
    );
    assert.match(apiControllerSource, /@Post\("jobs"\)/);
    assert.match(apiControllerSource, /@Body\(\) body: unknown = \{\}/);
    assert.match(apiServiceSource, /ORDER_IMPORT_SUBMIT_DISPATCHER/);
    assert.match(apiServiceSource, /assertPermission\(accessContext, "order:write"\)/);
    assert.match(apiServiceSource, /order import submit dispatcher is not configured/);
    assert.match(
      apiServiceSource,
      /idempotencyKey: `controlled:\/\/order-import\/\$\{input\.importJobId\}`/
    );
    assert.match(apiServiceSource, /rowErrorIds: uuidArray\(record\.rowErrorIds/);
    assert.match(apiServiceSource, /snapshotIds: uuidArray\(record\.snapshotIds/);
    assert.match(adminClientSource, /rowErrorIds: uuidArray\(input\.rowErrorIds/);
    assert.match(adminClientSource, /snapshotIds: uuidArray\(input\.snapshotIds/);
    assert.doesNotMatch(
      `${apiControllerSource}\n${apiServiceSource}`,
      /BullMQ|Redis|PrismaClient|process\.env|order_connector/i
    );
  });

  it("runs browser submit through HTTP smoke, worker dispatch and RLS readback", () => {
    assert.match(httpHarnessSource, /submitDispatcher/);
    assert.match(httpHarnessSource, /ORDER_IMPORT_SUBMIT_DISPATCHER/);
    assert.match(visibleHarnessSource, /seedRows = true/);
    assert.match(
      visibleHarnessSource,
      /postData: request\.postData\(\) \?\? undefined/
    );
    assert.match(visibleHarnessSource, /"x-uzmax-smoke-permissions": permissions/);
    assert.match(smokeSource, /seedRows: false/);
    assert.match(smokeSource, /permissions: "order:read,order:write"/);
    assert.match(smokeSource, /runOrderImportCsvTextDispatchContract/);
    assert.match(smokeSource, /createOrderImportWorkerPrismaPersistenceGateway/);
    assert.match(smokeSource, /runOrderImportCsvTextPersistenceJob/);
    assert.match(smokeSource, /set local role "uzmax_app_runtime"/);
    assert.match(smokeSource, /select set_config\('app\.org_id'/);
    assert.match(smokeSource, /assertTenantBIsolation/);
    assert.match(smokeSource, /residue=0/);
    assert.doesNotMatch(
      `${smokeSource}\n${visibleHarnessSource}`,
      /SUPABASE_SECRET_KEY|service_role|customer_phone|phone_number|\+998|sk-/i
    );
  });

  it("wires CI, spec and evidence without claiming full M4 acceptance closure", () => {
    assert.match(
      ciSource,
      /run-m4-order-import-admin-submit-true-db-worker-dispatch-smoke\.mjs/
    );
    assert.match(m4Index, /M4-40 order import admin submit true DB worker dispatch/);
    assert.match(spec, /does not close full E-02\/E-03\/E-04\/I-01\/J-02\/B-01/);
    assert.match(evidence, /not_closed/);
    assert.ok(
      /pending CI results/.test(evidence) ||
        /GitHub Actions CI run `\d+`/.test(evidence)
    );
    assert.match(evidence, /No raw order\/customer data/);
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as nodePath from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const adminClientSource = read("apps/admin/src/orderImportApiClient.ts");
const visibleSmokeSource = read("apps/admin/src/M4OrderImportVisibleSmokeState.tsx");
const visibleSmokeSubmitSource = read(
  "apps/admin/src/orderImportVisibleSmokeSubmit.ts"
);
const apiControllerSource = read("apps/api/src/order-import.controller.ts");
const apiServiceSource = read("apps/api/src/order-import.service.ts");
const apiSubmitSource = read("apps/api/src/order-import.submit.ts");
const visibleHarnessSource = read(
  "packages/db/scripts/order-import-admin-visible-smoke-harness.mjs"
);
const smokeSource = read(
  "packages/db/scripts/run-m4-order-import-storage-backed-true-db-smoke.mjs"
);
const workerSubmitSupportSource = read(
  "packages/db/scripts/order-import-worker-submit-smoke-support.mjs"
);
const ciSource = read(".github/workflows/ci.yml");
const spec = read("docs/specs/M4-41-order-import-storage-backed-true-db-smoke.md");
const evidence = read(
  "docs/evidence/M4/M4-41-order-import-storage-backed-true-db-smoke.md"
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

describe("M4-41 order import Storage-backed true DB smoke", () => {
  it("adds a controlled Admin client Storage metadata POST without inline CSV", async () => {
    const calls = [];
    const client = adminClient.createOrderImportApiClient({
      fetcher: async (input, init) => {
        calls.push({ init, input });
        return {
          json: async () => ({
            dispatch: {
              idempotencyKey: "controlled://order-import/job-a",
              jobId: "55555555-5555-4555-8555-555555555141",
              jobName: "order_import_csv_text"
            },
            importJobId: "55555555-5555-4555-8555-555555555141",
            persisted: { importJobs: 1, rowErrors: 1, snapshots: 1 },
            sourceRef:
              "storage://m4-order-import-smokes/m4-41/55555555-5555-4555-8555-555555555141/orders.csv",
            status: "submitted"
          }),
          ok: true,
          status: 200
        };
      }
    });

    const result = await client.submitImportStorageObjectJob({
      bucketId: "m4-order-import-smokes",
      importJobId: "55555555-5555-4555-8555-555555555141",
      importedAt: "2026-06-23T08:30:00.000Z",
      maxRows: 10,
      mediaType: "text/csv",
      objectPath: "m4-41/55555555-5555-4555-8555-555555555141/orders.csv",
      rowErrorIds: ["77777777-7777-4777-8777-777777777141"],
      snapshotIds: ["66666666-6666-4666-8666-666666666141"]
    });

    const payload = JSON.parse(calls[0].init.body);
    assert.equal(result.status, "submitted");
    assert.deepEqual(
      calls.map((call) => [call.input, call.init.method]),
      [["/order-import/storage-jobs", "POST"]]
    );
    assert.equal(calls[0].init.headers["content-type"], "application/json");
    assert.deepEqual(Object.keys(payload).sort(), [
      "bucketId",
      "importJobId",
      "importedAt",
      "maxRows",
      "mediaType",
      "objectPath",
      "rowErrorIds",
      "snapshotIds"
    ]);
    assert.equal(payload.bucketId, "m4-order-import-smokes");
    assert.equal(payload.objectPath.endsWith("/orders.csv"), true);
    assert.equal("csvText" in payload, false);
    assert.equal("sourceRef" in payload, false);
  });

  it("rejects unsafe Storage metadata before the API request", async () => {
    const calls = [];
    const client = adminClient.createOrderImportApiClient({
      fetcher: async (input, init) => {
        calls.push({ init, input });
        return { json: async () => ({}), ok: true, status: 200 };
      }
    });

    await assert.rejects(
      () =>
        client.submitImportStorageObjectJob({
          bucketId: "m4-order-import-smokes",
          importJobId: "55555555-5555-4555-8555-555555555141",
          importedAt: "2026-06-23T08:30:00.000Z",
          objectPath: "../orders.csv",
          rowErrorIds: ["77777777-7777-4777-8777-777777777141"],
          snapshotIds: ["66666666-6666-4666-8666-666666666141"]
        }),
      /objectPath is invalid/
    );
    assert.deepEqual(calls, []);
  });

  it("keeps Storage submit fail-closed and separate from inline CSV submit", () => {
    assert.match(apiControllerSource, /@Post\("storage-jobs"\)/);
    assert.match(apiControllerSource, /submitImportStorageObjectJob/);
    assert.match(apiServiceSource, /submitDispatcher\?\.dispatchStorageObject/);
    assert.match(apiServiceSource, /orderImportStorageObjectSubmitInput/);
    assert.match(
      apiServiceSource,
      /order import storage submit dispatcher is not configured/
    );
    assert.match(apiSubmitSource, /rejectStorageInlinePayload/);
    assert.match(apiSubmitSource, /csvText is not accepted for storage submit/);
    assert.match(apiSubmitSource, /sourceRef is derived from storage metadata/);
    assert.match(apiSubmitSource, /storageSourceRef\(bucketId, objectPath\)/);
    assert.doesNotMatch(
      `${apiControllerSource}\n${apiServiceSource}\n${apiSubmitSource}`,
      /PrismaClient|@supabase\/supabase-js|BullMQ|Redis|process\.env|order_connector/i
    );
  });

  it("routes visible smoke through Storage submit with request-body evidence hooks", () => {
    assert.match(visibleSmokeSource, /storageSubmit/);
    assert.match(visibleSmokeSource, /submitVisibleSmokeJobOnce/);
    assert.match(visibleSmokeSubmitSource, /submittedSmokeJobs = new Map/);
    assert.match(visibleSmokeSubmitSource, /submitImportStorageObjectJob/);
    assert.match(visibleSmokeSubmitSource, /smoke submit config is ambiguous/);
    assert.match(visibleHarnessSource, /storageSubmit/);
    assert.match(visibleHarnessSource, /onApiRequest/);
    assert.match(visibleHarnessSource, /postData/);
  });

  it("runs real Supabase Storage download through worker intake before DB/RLS readback", () => {
    const payloadBlock = blockFrom(smokeSource, "const storageSubmitPayload = {");
    assert.match(smokeSource, /import WebSocket from "ws"/);
    assert.match(smokeSource, /createClient\(supabaseUrl, supabaseSecretKey/);
    assert.match(smokeSource, /realtime: \{ transport: WebSocket \}/);
    assert.match(smokeSource, /waitForStoragePostBody\(storagePostBodies\)/);
    assert.match(smokeSource, /storage\.createBucket/);
    assert.match(smokeSource, /\.upload\(input\.objectPath/);
    assert.match(smokeSource, /\.download\(input\.objectPath\)/);
    assert.match(smokeSource, /\.remove\(\[input\.objectPath\]\)/);
    assert.match(smokeSource, /storage_object_residue=0/);
    assert.match(smokeSource, /createWorkerStorageObjectSubmitDispatcher/);
    assert.match(
      workerSubmitSupportSource,
      /createOrderImportCsvTextInputFromStorageObject/
    );
    assert.match(workerSubmitSupportSource, /runOrderImportCsvTextDispatchContract/);
    assert.match(
      workerSubmitSupportSource,
      /createOrderImportWorkerPrismaPersistenceGateway/
    );
    assert.match(workerSubmitSupportSource, /set local role "uzmax_app_runtime"/);
    assert.match(workerSubmitSupportSource, /select set_config\('app\.org_id'/);
    assert.match(workerSubmitSupportSource, /assertTenantBOrderImportIsolation/);
    assert.doesNotMatch(payloadBlock, /csvText|sourceRef/);
    assert.doesNotMatch(
      `${smokeSource}\n${workerSubmitSupportSource}`,
      /service_role|customer_phone|phone_number|\+998|sk-/i
    );
  });

  it("wires CI, spec and evidence without claiming full M4 acceptance closure", () => {
    assert.match(ciSource, /run-m4-order-import-storage-backed-true-db-smoke\.mjs/);
    assert.match(ciSource, /UZMAX_SUPABASE_SECRET_KEY/);
    assert.match(ciSource, /https:\/\/enyocaykcgcfcswycujg\.supabase\.co/);
    assert.match(m4Index, /M4-41 order import Storage-backed true DB smoke/);
    assert.match(spec, /不关闭完整 E-02\/E-03\/E-04\/I-01\/J-02\/B-01/);
    assert.match(
      evidence,
      /CI true DB\/Storage validation pending|GitHub Actions CI run `\d+`/
    );
    assert.match(evidence, /No raw customer\/order/);
    assert.match(evidence, /Browser\/API POST body must not contain `csvText`/);
  });
});

function blockFrom(sourceText, start) {
  const startIndex = sourceText.indexOf(start);
  assert.notEqual(startIndex, -1, `missing block ${start}`);
  const endIndex = sourceText.indexOf("\n};", startIndex);
  assert.notEqual(endIndex, -1, `missing block end ${start}`);
  return sourceText.slice(startIndex, endIndex);
}

function read(relativePath) {
  return fs.readFileSync(nodePath.join(repoRoot, relativePath), "utf8");
}

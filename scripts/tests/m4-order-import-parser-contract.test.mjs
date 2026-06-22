import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { importWorkerEntrypoint, readRepoText } from "./m4-worker-test-loader.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";
const IMPORT_JOB_ID = "44444444-4444-4444-8444-444444444444";
const SNAPSHOT_ID = "55555555-5555-4555-8555-555555555555";
const ROW_ERROR_ID = "66666666-6666-4666-8666-666666666666";
const SOURCE_REF = "storage://order-imports/parser-batch-a";
const workerSource = readRepoText("apps/worker/src/main.ts");
const spec = readRepoText("docs/specs/M4-10-order-import-parser-contract.md");
const evidence = readRepoText("docs/evidence/M4/M4-10-order-import-parser-contract.md");
const m4Index = readRepoText("docs/evidence/M4/README.md");
const worker = await importWorkerEntrypoint();

describe("M4-10 order import parser contract", () => {
  it("parses controlled CSV text into worker rows and DB draft output", () => {
    const parsed = worker.module.parseOrderImportCsvText({
      csvText: controlledCsv([
        "external order ref,order status ref,source updated at,expires at,external batch ref,customer ref",
        "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z,controlled://batch/ref-a,controlled://customer/ref-a",
        "controlled://order/ref-b,,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z,,"
      ]),
      sourceRef: SOURCE_REF
    });

    assert.deepEqual(parsed.headers, [
      "external_order_ref",
      "order_status_ref",
      "source_updated_at",
      "expires_at",
      "external_batch_ref",
      "customer_ref"
    ]);
    assert.equal(parsed.sourceRef, SOURCE_REF);
    assert.equal(parsed.rows.length, 2);
    assert.equal(parsed.rows[0].sourceRef, SOURCE_REF);
    assert.deepEqual(parsed.rows[0].payloadSummary, {
      rowRef: "import://order-import/row-1",
      statusRef: "status://order/in-transit"
    });
    assert.deepEqual(parsed.rows[1].payloadSummary, {
      rowRef: "import://order-import/row-2"
    });

    const result = worker.module.createOrderImportWorkerDrafts({
      createdByUserId: USER_ID,
      importJobId: IMPORT_JOB_ID,
      importedAt: "2026-06-22T12:00:00.000Z",
      orgId: ORG_ID,
      rowErrorIds: [ROW_ERROR_ID],
      rows: parsed.rows,
      snapshotIds: [SNAPSHOT_ID],
      sourceRef: SOURCE_REF,
      tenantId: TENANT_ID
    });

    assert.equal(result.batch.summary.status, "completed_with_errors");
    assert.equal(result.importJobDraft.fileRef, SOURCE_REF);
    assert.equal(result.snapshotDrafts[0].externalOrderRef, "controlled://order/ref-a");
    assert.equal(result.rowErrorDrafts[0].rowNumber, 2);
    assert.equal(result.rowErrorDrafts[0].errorCode, "order_status_ref_required");
  });

  it("fails closed for unsafe headers, missing required headers and bad CSV", () => {
    assert.throws(
      () =>
        worker.module.parseOrderImportCsvText({
          csvText: controlledCsv([
            "external_order_ref,phone",
            "controlled://order/ref-a,controlled://customer/ref-a"
          ]),
          sourceRef: SOURCE_REF
        }),
      /order import CSV header phone is not allowed/
    );
    assert.throws(
      () =>
        worker.module.parseOrderImportCsvText({
          csvText: controlledCsv([
            "external_order_ref,source_updated_at,expires_at",
            "controlled://order/ref-a,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z"
          ]),
          sourceRef: SOURCE_REF
        }),
      /order import CSV header order_status_ref is required/
    );
    assert.throws(
      () =>
        worker.module.parseOrderImportCsvText({
          csvText: '"external_order_ref\ncontrolled://order/ref-a',
          sourceRef: SOURCE_REF
        }),
      /unterminated quoted CSV field/
    );
  });

  it("skips blank rows and enforces a bounded row budget", () => {
    const parsed = worker.module.parseOrderImportCsvText({
      csvText: controlledCsv([
        "external_order_ref,order_status_ref,source_updated_at,expires_at",
        "",
        "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z",
        ""
      ]),
      sourceRef: SOURCE_REF
    });

    assert.equal(parsed.rows.length, 1);
    assert.throws(
      () =>
        worker.module.parseOrderImportCsvText({
          csvText: controlledCsv([
            "external_order_ref,order_status_ref,source_updated_at,expires_at",
            "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z",
            "controlled://order/ref-b,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z"
          ]),
          maxRows: 1,
          sourceRef: SOURCE_REF
        }),
      /order import CSV row count exceeds maxRows/
    );
  });

  it("records M4-10 scope without adding runtime side effects", () => {
    assert.match(spec, /parser-contract foundation/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-10 order import parser contract/);
    assert.match(m4Index, /DB client wiring, queue runtime/);
    assert.doesNotMatch(
      workerSource,
      /readFileSync|node:fs|PrismaClient|@prisma\/client|BullMQ|Queue|Redis|process\.env|fetch\(|https?:\/\/|order_connector/i
    );
    assert.doesNotMatch(
      workerSource,
      /raw payload|csv export|xlsx export|phone|address|payment|secret/i
    );
  });
});

function controlledCsv(lines) {
  return lines.join("\r\n");
}

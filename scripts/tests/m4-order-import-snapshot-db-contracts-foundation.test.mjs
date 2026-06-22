import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const schema = read("packages/db/prisma/schema.prisma");
const migration = read(
  "packages/db/migrations/0006_order_import_snapshot_contracts_foundation.sql"
);
const spec = read("docs/specs/M4-04-order-import-snapshot-db-contracts-foundation.md");
const evidence = read(
  "docs/evidence/M4/M4-04-order-import-snapshot-db-contracts-foundation.md"
);
const db = await importTypescriptSource("packages/db/src/m4-order-import-contracts.ts");
const m4Order = db.m4OrderImportContracts;

const ORG_UUID = "11111111-1111-4111-8111-111111111111";
const TENANT_UUID = "22222222-2222-4222-8222-222222222222";
const CUSTOMER_UUID = "33333333-3333-4333-8333-333333333333";
const SNAPSHOT_UUID = "44444444-4444-4444-8444-444444444444";
const IMPORT_JOB_UUID = "55555555-5555-4555-8555-555555555555";
const ROW_ERROR_UUID = "66666666-6666-4666-8666-666666666666";
const QUERY_LOG_UUID = "77777777-7777-4777-8777-777777777777";
const USER_UUID = "88888888-8888-4888-8888-888888888888";

describe("M4-04 order import snapshot DB contracts foundation", () => {
  it("maps order import snapshot Prisma models to the expected SQL tables", () => {
    for (const [model, table] of [
      ["OrderSnapshot", "order_snapshot"],
      ["ImportJob", "import_job"],
      ["ImportRowError", "import_row_error"],
      ["OrderQueryLog", "order_query_log"]
    ]) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
      assert.match(schema, new RegExp(`@@map\\("${table}"\\)`));
      assert.match(migration, new RegExp(`create table if not exists ${table} \\(`));
    }

    for (const enumName of [
      "OrderSnapshotSourceKind",
      "OrderSnapshotRecordStatus",
      "ImportJobStatus",
      "ImportRowErrorSeverity",
      "OrderQueryKind",
      "OrderQueryOutcome"
    ]) {
      assert.match(schema, new RegExp(`enum ${enumName} \\{`));
    }
  });

  it("keeps order import snapshot tables tenant-scoped and least-privileged", () => {
    for (const table of orderImportTables) {
      assert.match(migration, new RegExp(`\\('${table}'\\)`));
      assert.match(
        migration,
        new RegExp(
          `grant select, insert, update on table ${table} to uzmax_app_runtime`
        )
      );
      assert.doesNotMatch(
        migration,
        new RegExp(`grant [^;]*delete[^;]* on table ${table} to uzmax_app_runtime`, "i")
      );
    }

    assert.match(migration, /scope_check text := concat_ws/);
    assert.match(migration, /current_setting\(''app\.org_id'', true\)/);
    assert.match(migration, /current_setting\(''app\.tenant_id'', true\)/);
    assert.match(
      migration,
      /execute format\('alter table %I enable row level security'/
    );
    assert.match(
      migration,
      /execute format\('alter table %I force row level security'/
    );
    assert.match(migration, /m4_order_import_/);
    assert.match(migration, /_read_scope/);
    assert.match(migration, /_create_scope/);
    assert.match(migration, /_change_scope/);

    for (const scopedFk of [
      "order_snapshot_customer_fk",
      "order_snapshot_import_job_fk",
      "import_row_error_job_fk",
      "order_query_log_customer_fk",
      "order_query_log_snapshot_fk"
    ]) {
      assert.match(migration, new RegExp(`constraint ${scopedFk}`));
    }

    assert.match(migration, /order_snapshot_expires_after_source_update/);
    assert.match(migration, /order_snapshot_payload_summary_object/);
    assert.match(migration, /import_job_counts_within_total/);
    assert.match(migration, /import_row_error_row_number_positive/);
    assert.match(migration, /order_query_log_stale_outcome_matches_flag/);
    assert.match(migration, /order_query_log_handoff_outcome_matches_flag/);
  });

  it("exports order import constants and pure builders", () => {
    assert.deepEqual(m4Order.tableNames, {
      importJob: "import_job",
      importRowError: "import_row_error",
      orderQueryLog: "order_query_log",
      orderSnapshot: "order_snapshot"
    });
    assert.equal(m4Order.snapshotSourceKinds.importSnapshot, "import_snapshot");
    assert.equal(
      m4Order.importJobStatuses.completedWithErrors,
      "completed_with_errors"
    );
    assert.equal(m4Order.queryOutcomes.handoff, "handoff");

    const importJob = m4Order.createImportJobContract({
      createdByUserId: USER_UUID,
      errorReportRef: "controlled://order-import/error-report",
      failedRows: 1,
      fileRef: "storage://order-imports/batch-1.csv",
      fileSha256: "sha256:controlled",
      id: IMPORT_JOB_UUID,
      metadata: { source: "controlled-ref" },
      orgId: ORG_UUID,
      startedAt: "2026-06-22T00:00:00.000Z",
      status: "completed_with_errors",
      successfulRows: 9,
      tenantId: TENANT_UUID,
      totalRows: 10
    });
    assert.equal(importJob.successfulRows, 9);

    const snapshot = m4Order.createOrderSnapshotContract({
      customerId: CUSTOMER_UUID,
      expiresAt: "2026-06-23T00:00:00.000Z",
      externalBatchRef: "controlled://batch/ref",
      externalOrderRef: "controlled://order/ref",
      id: SNAPSHOT_UUID,
      importJobId: IMPORT_JOB_UUID,
      orderStatusRef: "controlled://order-status/in-transit",
      orgId: ORG_UUID,
      payloadSummary: { fields: ["status", "batch"] },
      sourceKind: "import_snapshot",
      sourceRef: "storage://order-imports/batch-1.csv",
      sourceUpdatedAt: "2026-06-22T00:00:00.000Z",
      status: "active",
      tenantId: TENANT_UUID
    });
    assert.equal(snapshot.externalOrderRef, "controlled://order/ref");

    const rowError = m4Order.createImportRowErrorContract({
      columnKey: "status",
      errorCode: "missing_required_status",
      id: ROW_ERROR_UUID,
      importJobId: IMPORT_JOB_UUID,
      messageRef: "controlled://order-import/errors/missing-status",
      orgId: ORG_UUID,
      rowNumber: 5,
      rowRef: "controlled://order-import/row/5",
      severity: "error",
      tenantId: TENANT_UUID
    });
    assert.equal(rowError.rowNumber, 5);

    const queryLog = m4Order.createOrderQueryLogContract({
      customerId: CUSTOMER_UUID,
      handoffRequired: true,
      id: QUERY_LOG_UUID,
      orderSnapshotId: SNAPSHOT_UUID,
      orgId: ORG_UUID,
      outcome: "handoff",
      queryKind: "order_ref",
      queryRef: "controlled://order-query/ref",
      reasonRef: "controlled://order-query/missing-or-stale",
      tenantId: TENANT_UUID
    });
    assert.equal(queryLog.handoffRequired, true);

    assert.throws(
      () => m4Order.createImportJobContract({ ...importJob, totalRows: 2 }),
      /row counts cannot exceed totalRows/
    );
    assert.throws(
      () =>
        m4Order.createOrderSnapshotContract({
          ...snapshot,
          expiresAt: "not-a-timestamp"
        }),
      /order snapshot timestamps must be parseable/
    );
    assert.throws(
      () =>
        m4Order.createOrderSnapshotContract({
          ...snapshot,
          expiresAt: "2026-06-22T00:00:00.000Z"
        }),
      /order snapshot expiresAt must be after sourceUpdatedAt/
    );
    assert.throws(
      () =>
        m4Order.createOrderSnapshotContract({
          ...snapshot,
          payloadSummary: "raw payload"
        }),
      /order snapshot payloadSummary must be an object/
    );
    assert.throws(
      () => m4Order.createImportRowErrorContract({ ...rowError, rowNumber: 0 }),
      /rowNumber must be an integer from 1/
    );
    assert.throws(
      () =>
        m4Order.createOrderQueryLogContract({
          ...queryLog,
          handoffRequired: false
        }),
      /handoff order query outcome requires handoffRequired/
    );
  });

  it("keeps the current no-API branch free of order connector claims", () => {
    for (const forbidden of [
      /model OrderConnector/,
      /create table if not exists order_connector/,
      /order_connector_status/,
      /connector interface/i,
      /external order api connector/i
    ]) {
      assert.doesNotMatch(schema, forbidden);
      assert.doesNotMatch(migration, forbidden);
    }
  });

  it("records scope and redaction boundaries in M4 docs", () => {
    assert.match(spec, /no-API 分支/);
    assert.match(spec, /不新增 `order_connector`/);
    assert.match(spec, /不读取或提交 raw/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(evidence, /no `order_connector`/);
  });
});

const orderImportTables = [
  "import_job",
  "order_snapshot",
  "import_row_error",
  "order_query_log"
];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importTypescriptSource(relativePath) {
  const moduleText = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(moduleText).toString("base64")}`
  );
}

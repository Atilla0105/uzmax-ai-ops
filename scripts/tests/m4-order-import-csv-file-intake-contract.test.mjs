import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TextEncoder } from "node:util";

import {
  importWorkerEntrypoint,
  importWorkerFileIntakeEntrypoint,
  readRepoText
} from "./m4-worker-test-loader.mjs";

const SOURCE_REF = "storage://order-imports/csv-file-intake-batch-a";
const fileIntakeSource = readRepoText("apps/worker/src/order-import-file-intake.ts");
const workerSource = readRepoText("apps/worker/src/main.ts");
const spec = readRepoText("docs/specs/M4-28-order-import-csv-file-intake-contract.md");
const evidence = readRepoText(
  "docs/evidence/M4/M4-28-order-import-csv-file-intake-contract.md"
);
const m4Index = readRepoText("docs/evidence/M4/README.md");
const worker = await importWorkerEntrypoint();
const fileIntake = await importWorkerFileIntakeEntrypoint();

describe("M4-28 order import CSV file intake contract", () => {
  it("turns a controlled UTF-8 CSV file payload into existing parser input", () => {
    const intake = fileIntake.module.createOrderImportCsvTextInputFromFile({
      content: new TextEncoder().encode(
        controlledCsv([
          "external_order_ref,order_status_ref,source_updated_at,expires_at",
          "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z"
        ])
      ),
      fileName: "order-import-batch-a.csv",
      maxRows: 5,
      mediaType: "text/csv",
      sourceRef: SOURCE_REF
    });

    const parsed = worker.module.parseOrderImportCsvText(intake);

    assert.equal(intake.fileName, "order-import-batch-a.csv");
    assert.equal(intake.mediaType, "text/csv");
    assert.equal(intake.sourceRef, SOURCE_REF);
    assert.ok(intake.byteLength > 0);
    assert.equal(parsed.sourceRef, SOURCE_REF);
    assert.equal(parsed.rows.length, 1);
    assert.equal(parsed.rows[0].externalOrderRef, "controlled://order/ref-a");
  });

  it("accepts string content with a UTF-8 byte order mark and preserves row budgets", () => {
    const intake = fileIntake.module.createOrderImportCsvTextInputFromFile({
      content:
        "\uFEFFexternal_order_ref,order_status_ref,source_updated_at,expires_at\n" +
        "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z\n" +
        "controlled://order/ref-b,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z",
      fileName: "order-import-batch-b.csv",
      maxRows: 1,
      sourceRef: "upload://order-imports/batch-b"
    });

    assert.throws(
      () => worker.module.parseOrderImportCsvText(intake),
      /order import CSV row count exceeds maxRows/
    );
  });

  it("fails closed for unsupported file metadata or non-text payloads", () => {
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromFile({
          content: "external_order_ref",
          fileName: "order-import-batch-a.xlsx",
          mediaType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          sourceRef: SOURCE_REF
        }),
      /must be a CSV file/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromFile({
          content: "external_order_ref",
          fileName: "nested/order-import.csv",
          sourceRef: SOURCE_REF
        }),
      /fileName is invalid/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromFile({
          content: new Uint8Array([0xff]),
          fileName: "order-import-batch-a.csv",
          sourceRef: SOURCE_REF
        }),
      /valid UTF-8/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromFile({
          content: "external_order_ref",
          fileName: "order-import-batch-a.csv",
          maxBytes: 1,
          sourceRef: SOURCE_REF
        }),
      /exceeds maxBytes/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromFile({
          content: "external_order_ref",
          fileName: "order-import-batch-a.csv",
          sourceRef: "https://example.invalid/orders.csv"
        }),
      /controlled file ref/
    );
  });

  it("records M4-28 scope without file system, storage, DB, queue or API runtime", () => {
    assert.match(workerSource, /order-import-file-intake/);
    assert.match(fileIntakeSource, /createOrderImportCsvTextInputFromFile/);
    assert.doesNotMatch(
      `${workerSource}\n${fileIntakeSource}`,
      /readFileSync|node:fs|PrismaClient|@prisma\/client|BullMQ|Queue|Redis|process\.env|fetch\(|order_connector/i
    );
    assert.match(spec, /CSV file intake contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-28 order import CSV file intake contract/);
    assert.match(m4Index, /Storage ingestion/);
    assert.match(m4Index, /real BullMQ\/Redis runtime/);
  });
});

function controlledCsv(lines) {
  return lines.join("\n");
}

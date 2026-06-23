import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TextEncoder } from "node:util";

import {
  importWorkerEntrypoint,
  importWorkerFileIntakeEntrypoint,
  readRepoText
} from "./m4-worker-test-loader.mjs";

const SOURCE_REF = "storage://order-imports/table-file-intake-batch-a";
const fileIntakeSource = readRepoText("apps/worker/src/order-import-file-intake.ts");
const workerSource = readRepoText("apps/worker/src/main.ts");
const spec = readRepoText(
  "docs/specs/M4-29-order-import-table-file-intake-contract.md"
);
const evidence = readRepoText(
  "docs/evidence/M4/M4-29-order-import-table-file-intake-contract.md"
);
const m4Index = readRepoText("docs/evidence/M4/README.md");
const worker = await importWorkerEntrypoint();
const fileIntake = await importWorkerFileIntakeEntrypoint();

describe("M4-29 order import table file intake contract", () => {
  it("turns a controlled UTF-8 TSV file payload into existing parser input", () => {
    const intake = fileIntake.module.createOrderImportCsvTextInputFromTableFile({
      content: new TextEncoder().encode(
        tableText([
          [
            "external order ref",
            "order status ref",
            "source updated at",
            "expires at",
            "external batch ref"
          ],
          [
            "controlled://order/ref-a",
            "status://order/in-transit",
            "2026-06-22T00:00:00.000Z",
            "2026-06-23T00:00:00.000Z",
            "controlled://batch/ref-a"
          ]
        ])
      ),
      fileName: "order-import-table-a.tsv",
      maxRows: 5,
      mediaType: "text/tab-separated-values",
      sourceRef: SOURCE_REF
    });

    const parsed = worker.module.parseOrderImportCsvText(intake);

    assert.equal(intake.delimiter, "tab");
    assert.equal(intake.fileName, "order-import-table-a.tsv");
    assert.equal(intake.mediaType, "text/tab-separated-values");
    assert.equal(parsed.sourceRef, SOURCE_REF);
    assert.equal(parsed.rows.length, 1);
    assert.equal(parsed.rows[0].externalOrderRef, "controlled://order/ref-a");
    assert.equal(parsed.rows[0].externalBatchRef, "controlled://batch/ref-a");
  });

  it("strips a UTF-8 byte order mark and preserves parser row budgets", () => {
    const intake = fileIntake.module.createOrderImportCsvTextInputFromTableFile({
      content:
        "\uFEFFexternal_order_ref\torder_status_ref\tsource_updated_at\texpires_at\n" +
        "controlled://order/ref-a\tstatus://order/in-transit\t2026-06-22T00:00:00.000Z\t2026-06-23T00:00:00.000Z\n" +
        "controlled://order/ref-b\tstatus://order/in-transit\t2026-06-22T00:00:00.000Z\t2026-06-23T00:00:00.000Z",
      fileName: "order-import-table-b.tsv",
      maxRows: 1,
      sourceRef: "upload://order-imports/table-b"
    });

    assert.throws(
      () => worker.module.parseOrderImportCsvText(intake),
      /order import CSV row count exceeds maxRows/
    );
  });

  it("fails closed for unsupported table metadata or non-text payloads", () => {
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromTableFile({
          content: "external_order_ref\torder_status_ref",
          fileName: "order-import-table-a.xlsx",
          mediaType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          sourceRef: SOURCE_REF
        }),
      /must be TSV/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromTableFile({
          content: "external_order_ref,order_status_ref",
          fileName: "order-import-table-a.tsv",
          sourceRef: SOURCE_REF
        }),
      /tab-delimited/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromTableFile({
          content: new Uint8Array([0xff]),
          fileName: "order-import-table-a.tsv",
          sourceRef: SOURCE_REF
        }),
      /valid UTF-8/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromTableFile({
          content: "external_order_ref\torder_status_ref",
          fileName: "order-import-table-a.tsv",
          maxBytes: 1,
          sourceRef: SOURCE_REF
        }),
      /exceeds maxBytes/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromTableFile({
          content: "external_order_ref\torder_status_ref",
          fileName: "order-import-table-a.tsv",
          sourceRef: "https://example.invalid/orders.tsv"
        }),
      /controlled file ref/
    );
  });

  it("records M4-29 scope without binary spreadsheets, DB, queue or API runtime", () => {
    assert.match(fileIntakeSource, /createOrderImportCsvTextInputFromTableFile/);
    assert.doesNotMatch(
      `${workerSource}\n${fileIntakeSource}`,
      /readFileSync|node:fs|PrismaClient|@prisma\/client|BullMQ|Queue|Redis|process\.env|fetch\(|order_connector/i
    );
    assert.match(spec, /table file intake contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-29 order import table file intake contract/);
    assert.match(m4Index, /Storage ingestion/);
    assert.match(m4Index, /XLSX parser/);
    assert.match(m4Index, /real BullMQ\/Redis runtime/);
  });
});

function tableText(rows) {
  return rows.map((row) => row.join("\t")).join("\n");
}

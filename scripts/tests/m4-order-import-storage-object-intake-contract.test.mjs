import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TextEncoder } from "node:util";

import {
  importWorkerEntrypoint,
  importWorkerFileIntakeEntrypoint,
  readRepoText
} from "./m4-worker-test-loader.mjs";

const BUCKET_ID = "order-imports";
const CSV_OBJECT_PATH = "tenant-a/imports/order-import-storage-a.csv";
const TSV_OBJECT_PATH = "tenant-a/imports/order-import-storage-b.tsv";
const CSV_SOURCE_REF = `storage://${BUCKET_ID}/${CSV_OBJECT_PATH}`;
const TSV_SOURCE_REF = `storage://${BUCKET_ID}/${TSV_OBJECT_PATH}`;
const fileIntakeSource = readRepoText("apps/worker/src/order-import-file-intake.ts");
const workerSource = readRepoText("apps/worker/src/main.ts");
const spec = readRepoText(
  "docs/specs/M4-30-order-import-storage-object-intake-contract.md"
);
const evidence = readRepoText(
  "docs/evidence/M4/M4-30-order-import-storage-object-intake-contract.md"
);
const m4Index = readRepoText("docs/evidence/M4/README.md");
const worker = await importWorkerEntrypoint();
const fileIntake = await importWorkerFileIntakeEntrypoint();

describe("M4-30 order import Storage object intake contract", () => {
  it("turns a controlled CSV Storage object into existing parser input", () => {
    const intake = fileIntake.module.createOrderImportCsvTextInputFromStorageObject({
      bucketId: BUCKET_ID,
      content: new TextEncoder().encode(
        controlledCsv([
          "external_order_ref,order_status_ref,source_updated_at,expires_at",
          "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z"
        ])
      ),
      maxRows: 5,
      mediaType: "text/csv",
      objectPath: CSV_OBJECT_PATH
    });

    const parsed = worker.module.parseOrderImportCsvText(intake);

    assert.equal(intake.bucketId, BUCKET_ID);
    assert.equal(intake.objectPath, CSV_OBJECT_PATH);
    assert.equal(intake.fileName, "order-import-storage-a.csv");
    assert.equal(intake.sourceRef, CSV_SOURCE_REF);
    assert.equal(intake.storageKind, "csv");
    assert.equal(parsed.sourceRef, CSV_SOURCE_REF);
    assert.equal(parsed.rows.length, 1);
    assert.equal(parsed.rows[0].externalOrderRef, "controlled://order/ref-a");
  });

  it("turns a controlled TSV Storage object into existing parser input", () => {
    const intake = fileIntake.module.createOrderImportCsvTextInputFromStorageObject({
      bucketId: BUCKET_ID,
      content:
        "\uFEFFexternal order ref\torder status ref\tsource updated at\texpires at\n" +
        "controlled://order/ref-b\tstatus://order/in-transit\t2026-06-22T00:00:00.000Z\t2026-06-23T00:00:00.000Z",
      maxRows: 5,
      mediaType: "text/tab-separated-values",
      objectPath: TSV_OBJECT_PATH
    });

    const parsed = worker.module.parseOrderImportCsvText(intake);

    assert.equal(intake.bucketId, BUCKET_ID);
    assert.equal(intake.objectPath, TSV_OBJECT_PATH);
    assert.equal(intake.delimiter, "tab");
    assert.equal(intake.fileName, "order-import-storage-b.tsv");
    assert.equal(intake.sourceRef, TSV_SOURCE_REF);
    assert.equal(intake.storageKind, "table");
    assert.equal(parsed.sourceRef, TSV_SOURCE_REF);
    assert.equal(parsed.rows.length, 1);
    assert.equal(parsed.rows[0].externalOrderRef, "controlled://order/ref-b");
  });

  it("fails closed for unsafe Storage metadata and unsupported object types", () => {
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromStorageObject({
          bucketId: "x",
          content: "external_order_ref",
          objectPath: CSV_OBJECT_PATH
        }),
      /bucketId is invalid/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromStorageObject({
          bucketId: BUCKET_ID,
          content: "external_order_ref",
          objectPath: "../order-import.csv"
        }),
      /objectPath is invalid/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromStorageObject({
          bucketId: BUCKET_ID,
          content: "external_order_ref",
          mediaType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          objectPath: "tenant-a/imports/order-import.xlsx"
        }),
      /must be CSV or TSV/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromStorageObject({
          bucketId: BUCKET_ID,
          content: "external_order_ref",
          mediaType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          objectPath: CSV_OBJECT_PATH
        }),
      /mediaType must be CSV-compatible/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromStorageObject({
          bucketId: BUCKET_ID,
          content: new Uint8Array([0xff]),
          objectPath: CSV_OBJECT_PATH
        }),
      /valid UTF-8/
    );
    assert.throws(
      () =>
        fileIntake.module.createOrderImportCsvTextInputFromStorageObject({
          bucketId: BUCKET_ID,
          content: "external_order_ref",
          maxBytes: 1,
          objectPath: CSV_OBJECT_PATH
        }),
      /exceeds maxBytes/
    );
  });

  it("records M4-30 scope without Storage downloader, DB, queue or API runtime", () => {
    assert.match(fileIntakeSource, /createOrderImportCsvTextInputFromStorageObject/);
    assert.match(spec, /Storage object intake contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-30 order import Storage object intake contract/);
    assert.match(m4Index, /Storage object metadata\/content intake/);
    assert.match(m4Index, /XLSX parser/);
    assert.match(m4Index, /real BullMQ\/Redis runtime/);
    assert.doesNotMatch(
      `${workerSource}\n${fileIntakeSource}`,
      /readFileSync|node:fs|createSignedUrl|download|Supabase|PrismaClient|@prisma\/client|BullMQ|Queue|Redis|process\.env|fetch\(|order_connector/i
    );
  });
});

function controlledCsv(lines) {
  return lines.join("\n");
}

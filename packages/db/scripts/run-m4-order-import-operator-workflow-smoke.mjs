import assert from "node:assert/strict";

import { PrismaClient } from "@prisma/client";

import {
  assertNoVisibleText,
  assertVisibleText,
  cleanupSupabaseStorageObject,
  createSupabaseStorageSmokeClient,
  downloadSupabaseStorageObject,
  prepareSupabaseStorageObject,
  runAdminVisibleOrderImportSmoke,
  supabaseStorageObjectResidueCount,
  waitForCapturedApiPostBody,
  withVisibleSmokePage
} from "./order-import-admin-visible-smoke-harness.mjs";
import {
  createOrderImportHttpSmokeFixture,
  requireSmokeEnv
} from "./order-import-true-db-http-smoke-fixture.mjs";
import {
  assertTenantBOrderImportIsolation,
  createWorkerStorageObjectSubmitDispatcher
} from "./order-import-worker-submit-smoke-support.mjs";

const storageBucketId = "m4-order-import-smokes";
const storageObjectPath = "m4-42/55555555-5555-4555-8555-555555555142/orders.tsv";
const fixture = createOrderImportHttpSmokeFixture({
  orderRef: "controlled://order/m4-42-ref-a",
  payloadSource: "m4-42-order-import-operator-workflow-smoke",
  sourceRef: `storage://${storageBucketId}/${storageObjectPath}`,
  suffix: "142",
  syntheticSpec: "M4-42"
});
const missingOrderRef = "controlled://order/m4-42-missing-ref";
const staleNow = "2026-07-01T08:30:00.000Z";
const storageTsvText = [
  "external_order_ref\torder_status_ref\tsource_updated_at\texpires_at\texternal_batch_ref",
  `${fixture.orderRef}\tstatus://order/ready\t${fixture.importedAt}\t${fixture.expiresAt}\tcontrolled://batch/m4-42`,
  "controlled://order/m4-42-bad\t\t2026-06-23T08:30:00.000Z\t2026-06-30T08:30:00.000Z\t"
].join("\n");
const storageSubmitPayload = {
  bucketId: storageBucketId,
  importJobId: fixture.importJobId,
  importedAt: fixture.importedAt,
  maxRows: 10,
  mediaType: "text/tab-separated-values",
  objectPath: storageObjectPath,
  rowErrorIds: [fixture.rowErrorId],
  snapshotIds: [fixture.snapshotId]
};

const { prisma, submitDispatcher, supabase } = await prepareOperatorSmokeRuntime();

try {
  await runAdminVisibleOrderImportSmoke({
    assertRuntime: async (runtime) => {
      await assertOperatorSubmitAndReadback(runtime);
      await assertVisibleHandoff({
        expectedReasonCode: "order_snapshot_stale",
        queryRef: fixture.orderRef,
        runtime
      });
      await assertVisibleHandoff({
        expectedReasonCode: "order_snapshot_missing",
        queryRef: missingOrderRef,
        runtime
      });
      await assertTenantBOrderImportIsolation({
        apiBaseUrl: runtime.apiBaseUrl,
        fixture
      });
    },
    fixture,
    prisma,
    seedRows: false,
    smokeName: "m4-order-import-operator-workflow-smoke",
    submitDispatcher,
    successMessage:
      "m4-order-import-operator-workflow-smoke: passed operator metadata submit->Storage TSV download->worker dispatch->DB/RLS readback and stale/missing handoff; db_residue=0"
  });
} finally {
  await cleanupSupabaseStorageObject(supabase, {
    bucketId: storageBucketId,
    objectPath: storageObjectPath
  }).catch((error) => {
    console.error(
      `m4-order-import-operator-workflow-smoke: storage cleanup failed: ${error.message}`
    );
  });
}

assert.equal(
  await supabaseStorageObjectResidueCount(supabase, {
    bucketId: storageBucketId,
    objectPath: storageObjectPath
  }),
  0
);
console.log("m4-order-import-operator-workflow-smoke: storage_object_residue=0");

async function assertOperatorSubmitAndReadback(runtime) {
  const storagePostBodies = [];
  await withVisibleSmokePage(
    runtime,
    {
      autoSubmit: false,
      now: fixture.importedAt,
      onApiRequest: ({ path: apiPath, postData }) => {
        if (apiPath === "/order-import/storage-jobs" && postData) {
          storagePostBodies.push(JSON.parse(postData));
        }
      },
      permissions: "order:read,order:write",
      queryRef: fixture.orderRef,
      storageSubmit: storageSubmitPayload
    },
    async (_runtimeState, page) => {
      const workflow = page.getByTestId("m4-order-import-operator-workflow");
      const result = page.getByTestId("m4-operator-result");
      await assertVisibleText(workflow, "Operator import workflow");
      await assertVisibleText(workflow, "Storage metadata only");
      assert.equal(storagePostBodies.length, 0);

      await page.getByRole("button", { name: "Submit storage metadata" }).click();
      await waitForCapturedApiPostBody(storagePostBodies);
      assert.equal(storagePostBodies.length, 1);
      assert.deepEqual(Object.keys(storagePostBodies[0]).sort(), [
        "bucketId",
        "importJobId",
        "importedAt",
        "maxRows",
        "mediaType",
        "objectPath",
        "rowErrorIds",
        "snapshotIds"
      ]);
      assert.equal(storagePostBodies[0].mediaType, "text/tab-separated-values");
      assert.equal(storagePostBodies[0].objectPath, storageObjectPath);
      assert.equal("csvText" in storagePostBodies[0], false);
      assert.equal("sourceRef" in storagePostBodies[0], false);

      await assertVisibleText(result, fixture.sourceRef);
      await assertVisibleText(result, "order_status_ref_required");
      await assertVisibleText(result, "snapshot_ready");
      await assertVisibleText(result, "1 successful / 1 failed");
      await assertVisibleText(result, "Status ref: status://order/ready");
      await assertVisibleText(result, "Handoff: not required");
    }
  );
}

async function assertVisibleHandoff({ expectedReasonCode, queryRef, runtime }) {
  await withVisibleSmokePage(
    runtime,
    { now: staleNow, queryRef },
    async (runtimeState) => {
      for (const expectedText of [
        fixture.sourceRef,
        "order_status_ref_required",
        "handoff_required",
        `Reason code: ${expectedReasonCode}`,
        `Runtime warning: ${expectedReasonCode}`,
        "Handoff: required"
      ]) {
        await assertVisibleText(runtimeState, expectedText);
      }
      await assertNoVisibleText(
        runtimeState,
        /Status ref|orderStatusRef|status:\/\/order\/ready/
      );
    }
  );
}

async function prepareOperatorSmokeRuntime() {
  const prismaClient = new PrismaClient({
    datasources: { db: { url: requireSmokeEnv("UZMAX_RLS_DATABASE_URL") } }
  });
  const storageClient = createSupabaseStorageSmokeClient({
    secretKey: requireSmokeEnv("UZMAX_SUPABASE_SECRET_KEY"),
    url: requireSmokeEnv("UZMAX_SUPABASE_URL")
  });
  const dispatcher = await createWorkerStorageObjectSubmitDispatcher({
    fixture,
    prismaClient,
    storageObjectDownloader: (input) =>
      downloadSupabaseStorageObject(storageClient, input)
  });

  await prepareSupabaseStorageObject(storageClient, {
    bucketId: storageBucketId,
    content: storageTsvText,
    contentType: "text/tab-separated-values",
    objectPath: storageObjectPath
  });
  return {
    prisma: prismaClient,
    submitDispatcher: dispatcher,
    supabase: storageClient
  };
}

import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

import {
  assertVisibleText,
  runAdminVisibleOrderImportSmoke,
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
const fixture = createOrderImportHttpSmokeFixture({
  orderRef: "controlled://order/m4-41-ref-a",
  payloadSource: "m4-41-storage-backed-true-db-smoke",
  sourceRef:
    "storage://m4-order-import-smokes/m4-41/55555555-5555-4555-8555-555555555141/orders.csv",
  suffix: "141",
  syntheticSpec: "M4-41"
});
const storageObjectPath = `m4-41/${fixture.importJobId}/orders.csv`;
const storageCsvText = [
  "external_order_ref,order_status_ref,source_updated_at,expires_at,external_batch_ref",
  `${fixture.orderRef},status://order/ready,${fixture.importedAt},${fixture.expiresAt},controlled://batch/m4-41`,
  "controlled://order/m4-41-bad,,2026-06-23T08:30:00.000Z,2026-06-30T08:30:00.000Z,"
].join("\n");
const storageSubmitPayload = {
  bucketId: storageBucketId,
  importJobId: fixture.importJobId,
  importedAt: fixture.importedAt,
  maxRows: 10,
  mediaType: "text/csv",
  objectPath: storageObjectPath,
  rowErrorIds: [fixture.rowErrorId],
  snapshotIds: [fixture.snapshotId]
};

const databaseUrl = requireSmokeEnv("UZMAX_RLS_DATABASE_URL");
const supabaseUrl = requireSmokeEnv("UZMAX_SUPABASE_URL");
const supabaseSecretKey = requireSmokeEnv("UZMAX_SUPABASE_SECRET_KEY");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});
const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket }
});
const submitDispatcher = await createWorkerStorageObjectSubmitDispatcher({
  fixture,
  prismaClient: prisma,
  storageObjectDownloader: (input) => downloadStorageObject(supabase, input)
});

await prepareStorageObject(supabase, {
  bucketId: storageBucketId,
  content: storageCsvText,
  contentType: "text/csv",
  objectPath: storageObjectPath
});

try {
  await runAdminVisibleOrderImportSmoke({
    assertRuntime: async (runtime) => {
      await assertBrowserStorageSubmitAndReadback(runtime);
      await assertTenantBOrderImportIsolation({
        apiBaseUrl: runtime.apiBaseUrl,
        fixture
      });
    },
    fixture,
    prisma,
    seedRows: false,
    smokeName: "m4-order-import-storage-backed-true-db-smoke",
    submitDispatcher,
    successMessage:
      "m4-order-import-storage-backed-true-db-smoke: passed browser metadata submit->Storage download->worker dispatch->DB/RLS readback synthetic path; db_residue=0"
  });
} finally {
  await cleanupStorageObject(supabase, {
    bucketId: storageBucketId,
    objectPath: storageObjectPath
  }).catch((error) => {
    console.error(
      `m4-order-import-storage-backed-true-db-smoke: storage cleanup failed: ${error.message}`
    );
  });
}

assert.equal(
  await storageObjectResidueCount(supabase, {
    bucketId: storageBucketId,
    objectPath: storageObjectPath
  }),
  0
);
console.log("m4-order-import-storage-backed-true-db-smoke: storage_object_residue=0");

async function assertBrowserStorageSubmitAndReadback(runtime) {
  const storagePostBodies = [];
  await withVisibleSmokePage(
    runtime,
    {
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
    async (runtimeState) => {
      await waitForStoragePostBody(storagePostBodies);
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
      assert.equal(storagePostBodies[0].bucketId, storageBucketId);
      assert.equal(storagePostBodies[0].objectPath, storageObjectPath);
      assert.equal("csvText" in storagePostBodies[0], false);
      assert.equal("sourceRef" in storagePostBodies[0], false);

      await assertVisibleText(runtimeState, fixture.sourceRef);
      await assertVisibleText(runtimeState, "order_status_ref_required");
      await assertVisibleText(runtimeState, "snapshot_ready");
      await assertVisibleText(runtimeState, "Status ref: status://order/ready");
      await assertVisibleText(runtimeState, "Handoff: not required");
    }
  );
}

async function waitForStoragePostBody(storagePostBodies) {
  const deadline = Date.now() + 10_000;
  while (Date.now() <= deadline) {
    if (storagePostBodies.length > 0) return;
    await delay(100);
  }
}

async function prepareStorageObject(storageClient, input) {
  const createResult = await storageClient.storage.createBucket(input.bucketId, {
    public: false
  });
  if (createResult.error && !/already exists/i.test(createResult.error.message)) {
    throw new Error(`create storage bucket: ${createResult.error.message}`);
  }

  await ensureNoStorageError(
    `upload ${input.objectPath}`,
    await storageClient.storage
      .from(input.bucketId)
      .upload(input.objectPath, Buffer.from(input.content, "utf8"), {
        contentType: input.contentType,
        upsert: true
      })
  );
}

async function downloadStorageObject(storageClient, input) {
  const result = await storageClient.storage
    .from(input.bucketId)
    .download(input.objectPath);
  await ensureNoStorageError(`download ${input.objectPath}`, result);
  return new Uint8Array(await result.data.arrayBuffer());
}

async function cleanupStorageObject(storageClient, input) {
  const result = await storageClient.storage
    .from(input.bucketId)
    .remove([input.objectPath]);
  if (result.error && !/not found|does not exist/i.test(result.error.message)) {
    throw new Error(`remove ${input.objectPath}: ${result.error.message}`);
  }
}

async function storageObjectResidueCount(storageClient, input) {
  const prefix = input.objectPath.split("/").slice(0, -1).join("/");
  const fileName = input.objectPath.split("/").at(-1);
  const result = await storageClient.storage.from(input.bucketId).list(prefix);
  await ensureNoStorageError(`list ${prefix}`, result);
  return result.data.filter((item) => item.name === fileName).length;
}

async function ensureNoStorageError(action, result) {
  if (result.error) throw new Error(`${action}: ${result.error.message}`);
}

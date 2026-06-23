import assert from "node:assert/strict";

import { PrismaClient } from "@prisma/client";

import { startOrderImportHttpSmoke } from "../../../apps/api/scripts/order-import-http-smoke-harness.mjs";
import {
  cleanupSyntheticRows,
  createOrderImportHttpFetcher,
  createOrderImportHttpSmokeFixture,
  createSyntheticAccessContext,
  getOrderImportJson,
  requireSmokeEnv,
  seedOrderImportRowsInRlsTransaction,
  seedSyntheticTenant,
  syntheticResidueCount
} from "./order-import-true-db-http-smoke-fixture.mjs";

const fixture = createOrderImportHttpSmokeFixture({
  orderRef: "controlled://order/m4-36-ref-a",
  payloadSource: "m4-36-http-smoke",
  sourceRef: "storage://order-imports/m4-36-api-true-db-http-smoke.csv",
  suffix: "136",
  syntheticSpec: "M4-36"
});

const databaseUrl = requireSmokeEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});

let app;

try {
  await cleanupSyntheticRows(prisma, fixture);
  await seedSyntheticTenant(prisma, fixture);
  await seedOrderImportRowsInRlsTransaction(prisma, fixture);

  app = await startOrderImportHttpSmoke({
    createAccessContext: (selectedTenantId, permissions) =>
      createSyntheticAccessContext(fixture, selectedTenantId, permissions),
    prisma
  });
  const baseUrl = await app.getUrl();

  await assertTenantAHttpReads(baseUrl);
  await assertTenantBIsolation(baseUrl);
  await assertPermissionFailure(baseUrl);

  await app.close();
  app = undefined;
  await cleanupSyntheticRows(prisma, fixture);
  const residue = await syntheticResidueCount(prisma, fixture);
  assert.equal(residue, 0);

  console.log(
    "m4-order-import-api-true-db-http-smoke: passed Nest HTTP->API->DB/RLS synthetic path; residue=0"
  );
} finally {
  if (app) await app.close().catch(() => {});
  await cleanupSyntheticRows(prisma, fixture).catch((error) => {
    console.error(
      `m4-order-import-api-true-db-http-smoke: cleanup failed: ${error.message}`
    );
  });
  await prisma.$disconnect();
}

async function assertTenantAHttpReads(baseUrl) {
  const tenantAFetcher = createOrderImportHttpFetcher(baseUrl, {
    tenantId: fixture.tenantAId
  });
  const jobs = await getOrderImportJson(tenantAFetcher, "/order-import/jobs");
  assert.equal(
    jobs.items.some((job) => job.id === fixture.importJobId),
    true
  );

  const errors = await getOrderImportJson(
    tenantAFetcher,
    `/order-import/jobs/${fixture.importJobId}/errors`
  );
  assert.equal(errors.items.length, 1);
  assert.equal(errors.items[0].id, fixture.rowErrorId);

  const snapshot = await getOrderImportJson(
    tenantAFetcher,
    `/order-import/snapshots/search?queryKind=order_ref&queryRef=${encodeURIComponent(
      fixture.orderRef
    )}&now=${encodeURIComponent(fixture.importedAt)}`
  );
  assert.equal(snapshot.status, "snapshot_ready");
  assert.equal(snapshot.customerVisible.orderStatusRef, "status://order/ready");
}

async function assertTenantBIsolation(baseUrl) {
  const tenantBFetcher = createOrderImportHttpFetcher(baseUrl, {
    tenantId: fixture.tenantBId
  });
  const jobs = await getOrderImportJson(tenantBFetcher, "/order-import/jobs");
  assert.equal(
    jobs.items.some((job) => job.id === fixture.importJobId),
    false
  );

  const missingSnapshot = await getOrderImportJson(
    tenantBFetcher,
    `/order-import/snapshots/search?queryKind=order_ref&queryRef=${encodeURIComponent(
      fixture.orderRef
    )}&now=${encodeURIComponent(fixture.importedAt)}`
  );
  assert.equal(missingSnapshot.status, "handoff_required");
  assert.equal(missingSnapshot.reasonCode, "order_snapshot_missing");

  await getOrderImportJson(
    tenantBFetcher,
    `/order-import/jobs/${fixture.importJobId}/errors`,
    { expectedStatus: 404 }
  );
}

async function assertPermissionFailure(baseUrl) {
  await getOrderImportJson(
    createOrderImportHttpFetcher(baseUrl, {
      permissions: "none",
      tenantId: fixture.tenantAId
    }),
    "/order-import/jobs",
    { expectedStatus: 403 }
  );
}

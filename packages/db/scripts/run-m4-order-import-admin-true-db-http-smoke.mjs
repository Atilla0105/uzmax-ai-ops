import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";

import { PrismaClient } from "@prisma/client";
import ts from "typescript";

import { startOrderImportHttpSmoke } from "../../../apps/api/scripts/order-import-http-smoke-harness.mjs";
import {
  cleanupSyntheticRows,
  createOrderImportHttpFetcher,
  createOrderImportHttpSmokeFixture,
  createSyntheticAccessContext,
  requireSmokeEnv,
  seedOrderImportRowsInRlsTransaction,
  seedSyntheticTenant,
  syntheticResidueCount
} from "./order-import-true-db-http-smoke-fixture.mjs";

const fixture = createOrderImportHttpSmokeFixture({
  orderRef: "controlled://order/m4-37-ref-a",
  payloadSource: "m4-37-admin-http-smoke",
  sourceRef: "storage://order-imports/m4-37-admin-true-db-http-smoke.csv",
  suffix: "137",
  syntheticSpec: "M4-37"
});

const databaseUrl = requireSmokeEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});

let app;

try {
  const adminClient = await importAdminOrderImportApiClient();

  await cleanupSyntheticRows(prisma, fixture);
  await seedSyntheticTenant(prisma, fixture);
  await seedOrderImportRowsInRlsTransaction(prisma, fixture);

  app = await startOrderImportHttpSmoke({
    createAccessContext: (selectedTenantId, permissions) =>
      createSyntheticAccessContext(fixture, selectedTenantId, permissions),
    prisma
  });
  const baseUrl = await app.getUrl();

  await assertTenantAAdminClientReads(adminClient, baseUrl);
  await assertTenantBAdminClientIsolation(adminClient, baseUrl);
  await assertAdminClientPermissionFailure(adminClient, baseUrl);

  await app.close();
  app = undefined;
  await cleanupSyntheticRows(prisma, fixture);
  const residue = await syntheticResidueCount(prisma, fixture);
  assert.equal(residue, 0);

  console.log(
    "m4-order-import-admin-true-db-http-smoke: passed admin client->Nest HTTP->API->DB/RLS synthetic path; residue=0"
  );
} finally {
  if (app) await app.close().catch(() => {});
  await cleanupSyntheticRows(prisma, fixture).catch((error) => {
    console.error(
      `m4-order-import-admin-true-db-http-smoke: cleanup failed: ${error.message}`
    );
  });
  await prisma.$disconnect();
}

async function assertTenantAAdminClientReads(adminClient, baseUrl) {
  const client = createClient(adminClient, baseUrl, {
    tenantId: fixture.tenantAId
  });
  const jobs = await client.listImportJobs();
  assert.equal(
    jobs.some((job) => job.id === fixture.importJobId),
    true
  );

  const errors = await client.listImportRowErrors(fixture.importJobId);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].id, fixture.rowErrorId);

  const snapshot = await client.searchSnapshot({
    now: fixture.importedAt,
    queryKind: "order_ref",
    queryRef: fixture.orderRef
  });
  assert.equal(snapshot.status, "snapshot_ready");
  assert.equal(snapshot.customerVisible.orderStatusRef, "status://order/ready");
}

async function assertTenantBAdminClientIsolation(adminClient, baseUrl) {
  const client = createClient(adminClient, baseUrl, {
    tenantId: fixture.tenantBId
  });
  const jobs = await client.listImportJobs();
  assert.equal(
    jobs.some((job) => job.id === fixture.importJobId),
    false
  );

  const missingSnapshot = await client.searchSnapshot({
    now: fixture.importedAt,
    queryKind: "order_ref",
    queryRef: fixture.orderRef
  });
  assert.equal(missingSnapshot.status, "handoff_required");
  assert.equal(missingSnapshot.reasonCode, "order_snapshot_missing");
  assert.equal(missingSnapshot.runtimeWarning.code, "order_snapshot_missing");

  await assert.rejects(
    () => client.listImportRowErrors(fixture.importJobId),
    /status 404/
  );
}

async function assertAdminClientPermissionFailure(adminClient, baseUrl) {
  const client = createClient(adminClient, baseUrl, {
    permissions: "none",
    tenantId: fixture.tenantAId
  });
  await assert.rejects(() => client.listImportJobs(), /status 403/);
}

function createClient(adminClient, baseUrl, { permissions, tenantId }) {
  return adminClient.createOrderImportApiClient({
    fetcher: createOrderImportHttpFetcher(baseUrl, { permissions, tenantId })
  });
}

async function importAdminOrderImportApiClient() {
  const source = await readFile(
    new URL("../../../apps/admin/src/orderImportApiClient.ts", import.meta.url),
    "utf8"
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(compiled, "utf8").toString("base64")}`
  );
}

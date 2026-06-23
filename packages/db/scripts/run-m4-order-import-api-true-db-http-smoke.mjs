import assert from "node:assert/strict";

import { PrismaClient } from "@prisma/client";

import { startOrderImportHttpSmoke } from "../../../apps/api/scripts/order-import-http-smoke-harness.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111136";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222136";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333136";
const USER_ID = "44444444-4444-4444-8444-444444444136";
const IMPORT_JOB_ID = "55555555-5555-4555-8555-555555555136";
const SNAPSHOT_ID = "66666666-6666-4666-8666-666666666136";
const ROW_ERROR_ID = "77777777-7777-4777-8777-777777777136";
const SOURCE_REF = "storage://order-imports/m4-36-api-true-db-http-smoke.csv";
const ORDER_REF = "controlled://order/m4-36-ref-a";
const IMPORTED_AT = "2026-06-23T08:30:00.000Z";
const EXPIRES_AT = "2026-06-30T08:30:00.000Z";
const SYNTHETIC_SPEC = "M4-36";
const fetchApi = globalThis.fetch;

const databaseUrl = requireEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});

let app;

try {
  await cleanupSyntheticRows();
  await seedSyntheticTenant();
  await seedOrderImportRowsInRlsTransaction();

  app = await startOrderImportHttpSmoke({
    createAccessContext: createSyntheticAccessContext,
    prisma
  });
  const baseUrl = await app.getUrl();

  await assertTenantAHttpReads(baseUrl);
  await assertTenantBIsolation(baseUrl);
  await assertPermissionFailure(baseUrl);

  await app.close();
  app = undefined;
  await cleanupSyntheticRows();
  const residue = await syntheticResidueCount();
  assert.equal(residue, 0);

  console.log(
    "m4-order-import-api-true-db-http-smoke: passed Nest HTTP->API->DB/RLS synthetic path; residue=0"
  );
} finally {
  if (app) await app.close().catch(() => {});
  await cleanupSyntheticRows().catch((error) => {
    console.error(
      `m4-order-import-api-true-db-http-smoke: cleanup failed: ${error.message}`
    );
  });
  await prisma.$disconnect();
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function seedSyntheticTenant() {
  await prisma.org.create({
    data: {
      id: ORG_ID,
      name: "M4-36 Synthetic Org",
      slug: "m4-36-synthetic-org"
    }
  });
  await prisma.tenant.createMany({
    data: [
      {
        id: TENANT_A_ID,
        name: "M4-36 Synthetic Tenant A",
        orgId: ORG_ID,
        slug: "tenant-a"
      },
      {
        id: TENANT_B_ID,
        name: "M4-36 Synthetic Tenant B",
        orgId: ORG_ID,
        slug: "tenant-b"
      }
    ]
  });
}

async function seedOrderImportRowsInRlsTransaction() {
  await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${TENANT_A_ID}, true)`,
    prisma.importJob.create({
      data: {
        completedAt: new Date(IMPORTED_AT),
        createdByUserId: USER_ID,
        failedRows: 1,
        fileRef: SOURCE_REF,
        id: IMPORT_JOB_ID,
        metadata: { synthetic_spec: SYNTHETIC_SPEC },
        orgId: ORG_ID,
        startedAt: new Date(IMPORTED_AT),
        status: "COMPLETED_WITH_ERRORS",
        successfulRows: 1,
        tenantId: TENANT_A_ID,
        totalRows: 2
      }
    }),
    prisma.orderSnapshot.create({
      data: {
        expiresAt: new Date(EXPIRES_AT),
        externalBatchRef: "controlled://batch/m4-36",
        externalOrderRef: ORDER_REF,
        id: SNAPSHOT_ID,
        importJobId: IMPORT_JOB_ID,
        metadata: { synthetic_spec: SYNTHETIC_SPEC },
        orderStatusRef: "status://order/ready",
        orgId: ORG_ID,
        payloadSummary: { source: "m4-36-http-smoke" },
        sourceKind: "IMPORT_SNAPSHOT",
        sourceRef: SOURCE_REF,
        sourceUpdatedAt: new Date(IMPORTED_AT),
        status: "ACTIVE",
        tenantId: TENANT_A_ID
      }
    }),
    prisma.importRowError.create({
      data: {
        columnKey: "orderStatusRef",
        errorCode: "order_status_ref_required",
        id: ROW_ERROR_ID,
        importJobId: IMPORT_JOB_ID,
        messageRef: "reason://order-import/order-status-ref-required",
        metadata: { synthetic_spec: SYNTHETIC_SPEC },
        orgId: ORG_ID,
        rowNumber: 3,
        rowRef: "controlled://order/m4-36-row-3",
        severity: "ERROR",
        tenantId: TENANT_A_ID
      }
    })
  ]);
}

async function assertTenantAHttpReads(baseUrl) {
  const jobs = await getJson(baseUrl, "/order-import/jobs", {
    tenantId: TENANT_A_ID
  });
  assert.equal(
    jobs.items.some((job) => job.id === IMPORT_JOB_ID),
    true
  );

  const errors = await getJson(baseUrl, `/order-import/jobs/${IMPORT_JOB_ID}/errors`, {
    tenantId: TENANT_A_ID
  });
  assert.equal(errors.items.length, 1);
  assert.equal(errors.items[0].id, ROW_ERROR_ID);

  const snapshot = await getJson(
    baseUrl,
    `/order-import/snapshots/search?queryKind=order_ref&queryRef=${encodeURIComponent(
      ORDER_REF
    )}&now=${encodeURIComponent(IMPORTED_AT)}`,
    { tenantId: TENANT_A_ID }
  );
  assert.equal(snapshot.status, "snapshot_ready");
  assert.equal(snapshot.customerVisible.orderStatusRef, "status://order/ready");
}

async function assertTenantBIsolation(baseUrl) {
  const jobs = await getJson(baseUrl, "/order-import/jobs", {
    tenantId: TENANT_B_ID
  });
  assert.equal(
    jobs.items.some((job) => job.id === IMPORT_JOB_ID),
    false
  );

  const missingSnapshot = await getJson(
    baseUrl,
    `/order-import/snapshots/search?queryKind=order_ref&queryRef=${encodeURIComponent(
      ORDER_REF
    )}&now=${encodeURIComponent(IMPORTED_AT)}`,
    { tenantId: TENANT_B_ID }
  );
  assert.equal(missingSnapshot.status, "handoff_required");
  assert.equal(missingSnapshot.reasonCode, "order_snapshot_missing");

  await getJson(baseUrl, `/order-import/jobs/${IMPORT_JOB_ID}/errors`, {
    expectedStatus: 404,
    tenantId: TENANT_B_ID
  });
}

async function assertPermissionFailure(baseUrl) {
  await getJson(baseUrl, "/order-import/jobs", {
    expectedStatus: 403,
    permissions: "none",
    tenantId: TENANT_A_ID
  });
}

async function getJson(
  baseUrl,
  apiPath,
  { expectedStatus = 200, permissions = "order:read", tenantId }
) {
  const response = await fetchApi(`${baseUrl}${apiPath}`, {
    headers: {
      authorization: "Bearer m4-36-synthetic-token",
      "x-uzmax-smoke-permissions": permissions,
      "x-tenant-id": tenantId
    }
  });
  const bodyText = await response.text();
  assert.equal(response.status, expectedStatus, bodyText);
  return bodyText ? JSON.parse(bodyText) : undefined;
}

function createSyntheticAccessContext(selectedTenantId, permissions) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [TENANT_A_ID, TENANT_B_ID],
    userId: USER_ID
  };
}

async function cleanupSyntheticRows() {
  await prisma.org.deleteMany({
    where: { id: ORG_ID }
  });
}

async function syntheticResidueCount() {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from import_job where metadata->>'synthetic_spec' = ${SYNTHETIC_SPEC})
      + (select count(*) from order_snapshot where metadata->>'synthetic_spec' = ${SYNTHETIC_SPEC})
      + (select count(*) from import_row_error where metadata->>'synthetic_spec' = ${SYNTHETIC_SPEC})
      + (select count(*) from order_query_log where metadata->>'synthetic_spec' = ${SYNTHETIC_SPEC})
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

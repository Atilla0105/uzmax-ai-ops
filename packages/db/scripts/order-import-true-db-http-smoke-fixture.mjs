import assert from "node:assert/strict";

export function createOrderImportHttpSmokeFixture({
  orderRef,
  payloadSource,
  sourceRef,
  suffix,
  syntheticSpec
}) {
  return {
    expiresAt: "2026-06-30T08:30:00.000Z",
    importJobId: `55555555-5555-4555-8555-555555555${suffix}`,
    importedAt: "2026-06-23T08:30:00.000Z",
    orderRef,
    orgId: `11111111-1111-4111-8111-111111111${suffix}`,
    payloadSource,
    rowErrorId: `77777777-7777-4777-8777-777777777${suffix}`,
    snapshotId: `66666666-6666-4666-8666-666666666${suffix}`,
    sourceRef,
    syntheticSpec,
    tenantAId: `22222222-2222-4222-8222-222222222${suffix}`,
    tenantBId: `33333333-3333-4333-8333-333333333${suffix}`,
    userId: `44444444-4444-4444-8444-444444444${suffix}`
  };
}

export function requireSmokeEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export async function seedSyntheticTenant(prisma, fixture) {
  await prisma.org.create({
    data: {
      id: fixture.orgId,
      name: `${fixture.syntheticSpec} Synthetic Org`,
      slug: `${fixture.syntheticSpec.toLowerCase()}-synthetic-org`
    }
  });
  await prisma.tenant.createMany({
    data: [
      {
        id: fixture.tenantAId,
        name: `${fixture.syntheticSpec} Synthetic Tenant A`,
        orgId: fixture.orgId,
        slug: "tenant-a"
      },
      {
        id: fixture.tenantBId,
        name: `${fixture.syntheticSpec} Synthetic Tenant B`,
        orgId: fixture.orgId,
        slug: "tenant-b"
      }
    ]
  });
}

export async function seedOrderImportRowsInRlsTransaction(prisma, fixture) {
  await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${fixture.orgId}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${fixture.tenantAId}, true)`,
    prisma.importJob.create({
      data: {
        completedAt: new Date(fixture.importedAt),
        createdByUserId: fixture.userId,
        failedRows: 1,
        fileRef: fixture.sourceRef,
        id: fixture.importJobId,
        metadata: { synthetic_spec: fixture.syntheticSpec },
        orgId: fixture.orgId,
        startedAt: new Date(fixture.importedAt),
        status: "COMPLETED_WITH_ERRORS",
        successfulRows: 1,
        tenantId: fixture.tenantAId,
        totalRows: 2
      }
    }),
    prisma.orderSnapshot.create({
      data: {
        expiresAt: new Date(fixture.expiresAt),
        externalBatchRef: `controlled://batch/${fixture.syntheticSpec.toLowerCase()}`,
        externalOrderRef: fixture.orderRef,
        id: fixture.snapshotId,
        importJobId: fixture.importJobId,
        metadata: { synthetic_spec: fixture.syntheticSpec },
        orderStatusRef: "status://order/ready",
        orgId: fixture.orgId,
        payloadSummary: { source: fixture.payloadSource },
        sourceKind: "IMPORT_SNAPSHOT",
        sourceRef: fixture.sourceRef,
        sourceUpdatedAt: new Date(fixture.importedAt),
        status: "ACTIVE",
        tenantId: fixture.tenantAId
      }
    }),
    prisma.importRowError.create({
      data: {
        columnKey: "orderStatusRef",
        errorCode: "order_status_ref_required",
        id: fixture.rowErrorId,
        importJobId: fixture.importJobId,
        messageRef: "reason://order-import/order-status-ref-required",
        metadata: { synthetic_spec: fixture.syntheticSpec },
        orgId: fixture.orgId,
        rowNumber: 3,
        rowRef: `controlled://order/${fixture.syntheticSpec.toLowerCase()}-row-3`,
        severity: "ERROR",
        tenantId: fixture.tenantAId
      }
    })
  ]);
}

export function createSyntheticAccessContext(fixture, selectedTenantId, permissions) {
  return {
    membershipVersion: 1,
    orgId: fixture.orgId,
    permissions,
    selectedTenantId,
    tenantIds: [fixture.tenantAId, fixture.tenantBId],
    userId: fixture.userId
  };
}

export function createOrderImportHttpFetcher(
  baseUrl,
  { permissions = "order:read", tenantId }
) {
  return (apiPath, init = {}) => {
    assert.equal(init.method ?? "GET", "GET");
    return globalThis.fetch(`${baseUrl}${apiPath}`, {
      headers: {
        authorization: "Bearer m4-order-import-synthetic-token",
        "x-tenant-id": tenantId,
        "x-uzmax-smoke-permissions": permissions
      },
      method: "GET"
    });
  };
}

export async function getOrderImportJson(
  fetcher,
  apiPath,
  { expectedStatus = 200 } = {}
) {
  const response = await fetcher(apiPath, { method: "GET" });
  const bodyText = await response.text();
  assert.equal(response.status, expectedStatus, bodyText);
  return bodyText ? JSON.parse(bodyText) : undefined;
}

export async function cleanupSyntheticRows(prisma, fixture) {
  await prisma.org.deleteMany({
    where: { id: fixture.orgId }
  });
}

export async function syntheticResidueCount(prisma, fixture) {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${fixture.orgId})
      + (select count(*) from import_job where metadata->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from order_snapshot where metadata->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from import_row_error where metadata->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from order_query_log where metadata->>'synthetic_spec' = ${fixture.syntheticSpec})
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

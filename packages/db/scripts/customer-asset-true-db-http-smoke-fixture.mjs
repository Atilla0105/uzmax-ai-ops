import assert from "node:assert/strict";

export function createCustomerAssetRuntimeSmokeFixture({ suffix, syntheticSpec }) {
  return {
    auditReasonRef: `reason://customer/${syntheticSpec.toLowerCase()}-manual-review`,
    customerAId: `55555555-5555-4555-8555-555555555${suffix}`,
    customerBId: `55555555-5555-4555-8555-555555556${suffix}`,
    fieldDefinitionId: `66666666-6666-4666-8666-666666666${suffix}`,
    fieldValueId: `77777777-7777-4777-8777-777777777${suffix}`,
    identityId: `88888888-8888-4888-8888-888888888${suffix}`,
    importedAt: "2026-06-23T08:30:00.000Z",
    orgId: `11111111-1111-4111-8111-111111111${suffix}`,
    relatedRefs: {
      conversationRefs: [`conversation://${syntheticSpec.toLowerCase()}-history`],
      orderSnapshotRefs: [`snapshot://${syntheticSpec.toLowerCase()}-order`],
      quoteRecordRefs: [`quote://${syntheticSpec.toLowerCase()}-draft`],
      ticketRefs: [`ticket://${syntheticSpec.toLowerCase()}-open`]
    },
    syntheticSpec,
    tagAssignmentId: `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaa${suffix}`,
    tagDefinitionId: `99999999-9999-4999-8999-999999999${suffix}`,
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

export function createCustomerAssetHttpFetcher(
  baseUrl,
  { permissions = "customer:read", tenantId }
) {
  return (apiPath, init = {}) =>
    globalThis.fetch(`${baseUrl}${apiPath}`, {
      body: init.body,
      headers: {
        authorization: "Bearer m4-customer-asset-synthetic-token",
        "content-type": init.headers?.["content-type"] ?? "application/json",
        "x-tenant-id": tenantId,
        "x-uzmax-smoke-permissions": permissions
      },
      method: init.method ?? "GET"
    });
}

export async function getCustomerAssetJson(
  fetcher,
  apiPath,
  { body, expectedStatus = 200, method = "GET" } = {}
) {
  const response = await fetcher(apiPath, {
    body: body === undefined ? undefined : JSON.stringify(body),
    method
  });
  const bodyText = await response.text();
  assert.equal(response.status, expectedStatus, bodyText);
  return bodyText ? JSON.parse(bodyText) : undefined;
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
    data: ["A", "B"].map((label) => ({
      id: label === "A" ? fixture.tenantAId : fixture.tenantBId,
      name: `${fixture.syntheticSpec} Synthetic Tenant ${label}`,
      orgId: fixture.orgId,
      slug: `tenant-${label.toLowerCase()}`
    }))
  });
}

export async function seedCustomerAssetRowsInRlsTransaction(prisma, fixture) {
  await seedTenantACustomerAssets(prisma, fixture);
  await inRls(prisma, fixture, fixture.tenantBId, [
    prisma.customer.create({
      data: {
        ...scope(fixture, fixture.tenantBId),
        displayLabelRef: "label://customer/m4-43-tenant-b",
        id: fixture.customerBId,
        isBlacklisted: false,
        isUnreachable: false,
        metadata: synthetic(fixture),
        preferredLanguage: "ru",
        preferredScript: "cyrillic",
        status: "ACTIVE",
        unresolvedIssueCount: 0
      }
    })
  ]);
}

export async function cleanupSyntheticRows(prisma, fixture) {
  await prisma.org.deleteMany({ where: { id: fixture.orgId } });
}

export async function syntheticResidueCount(prisma, fixture) {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${fixture.orgId})
      + (select count(*) from customer where metadata->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from customer_identity where metadata->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from custom_field_definition where config->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from customer_field_value where value->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from tag_definition where metadata->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from tag_assignment where metadata->>'synthetic_spec' = ${fixture.syntheticSpec})
      + (select count(*) from audit_log where org_id::text = ${fixture.orgId})
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

export async function listAuditRowsInRlsTransaction(prisma, fixture) {
  const rows = await inRls(prisma, fixture, fixture.tenantAId, [
    prisma.auditLog.findMany({
      where: {
        eventType: "customer.flags_restored",
        objectId: fixture.customerAId,
        orgId: fixture.orgId,
        tenantId: fixture.tenantAId
      }
    })
  ]);
  return rows.at(-1) ?? [];
}

export async function getCustomerInRlsTransaction(prisma, fixture) {
  const rows = await inRls(prisma, fixture, fixture.tenantAId, [
    prisma.customer.findFirst({
      where: {
        id: fixture.customerAId,
        orgId: fixture.orgId,
        tenantId: fixture.tenantAId
      }
    })
  ]);
  return rows.at(-1);
}

async function seedTenantACustomerAssets(prisma, fixture) {
  const base = scope(fixture, fixture.tenantAId);
  const marker = synthetic(fixture);
  await inRls(prisma, fixture, fixture.tenantAId, [
    prisma.customer.create({
      data: {
        ...base,
        blacklistedAt: new Date(fixture.importedAt),
        displayLabelRef: "label://customer/m4-43-alpha",
        id: fixture.customerAId,
        isBlacklisted: true,
        isUnreachable: true,
        journeyStage: "journey://m4-43-review",
        metadata: {
          relatedRefs: fixture.relatedRefs,
          synthetic_spec: fixture.syntheticSpec
        },
        preferredLanguage: "uz",
        preferredScript: "latin",
        status: "ACTIVE",
        unreachableAt: new Date(fixture.importedAt),
        unresolvedIssueCount: 2
      }
    }),
    prisma.customerIdentity.create({
      data: {
        ...base,
        customerId: fixture.customerAId,
        externalSubjectRef: "identity://m4-43-alpha-primary",
        id: fixture.identityId,
        identityKind: "channel_subject",
        metadata: marker,
        provider: "controlled_provider",
        status: "ACTIVE"
      }
    }),
    prisma.customFieldDefinition.create({
      data: {
        ...base,
        config: marker,
        fieldKey: "m4_43.journey_stage",
        id: fixture.fieldDefinitionId,
        label: "M4 43 Journey Stage",
        status: "ACTIVE",
        valueType: "TEXT"
      }
    }),
    prisma.customerFieldValue.create({
      data: {
        ...base,
        customerId: fixture.customerAId,
        fieldDefinitionId: fixture.fieldDefinitionId,
        id: fixture.fieldValueId,
        updatedByUserId: fixture.userId,
        value: {
          controlledValueRef: "field-value://m4-43-alpha-stage",
          synthetic_spec: fixture.syntheticSpec
        }
      }
    }),
    prisma.tagDefinition.create({
      data: {
        ...base,
        colorToken: "status-warning",
        id: fixture.tagDefinitionId,
        label: "M4 43 Needs Review",
        metadata: marker,
        status: "ACTIVE",
        tagKey: "m4-43-needs-review",
        targetKind: "CUSTOMER"
      }
    }),
    prisma.tagAssignment.create({
      data: {
        ...base,
        assignedByUserId: fixture.userId,
        customerId: fixture.customerAId,
        id: fixture.tagAssignmentId,
        metadata: marker,
        tagDefinitionId: fixture.tagDefinitionId
      }
    })
  ]);
}

function inRls(prisma, fixture, tenantId, operations) {
  return prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${fixture.orgId}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`,
    ...operations
  ]);
}

function scope(fixture, tenantId) {
  return { orgId: fixture.orgId, tenantId };
}

function synthetic(fixture) {
  return { synthetic_spec: fixture.syntheticSpec };
}

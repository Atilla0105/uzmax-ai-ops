import assert from "node:assert/strict";
import { pathToFileURL, URL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";

const SPEC = "M5R-06";
const ORG_ID = "11111111-1111-4111-8111-111111111506";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222506";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333506";
const USER_ID = "44444444-4444-4444-8444-444444444506";
const TARGET_KEY = "m5r-06-quick-reply-copy";

export async function runM5rTemplateCopyTrueDbSmoke() {
  const databaseUrl = readRlsDatabaseUrl();
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await cleanup(prisma);
    await seedTenants(prisma);
    const api = await importRuntime();
    const repository =
      api.templateCopyRuntime.createTemplateCopyRuntimeRepositoryProviderFromEnv({
        env: {
          UZMAX_RLS_DATABASE_URL: databaseUrl,
          UZMAX_TEMPLATE_COPY_RUNTIME_MODE: "rls_prisma_gateway"
        },
        prismaClient: prisma
      });
    const tenantA = accessContext(TENANT_A_ID);

    const first = await repository.copyToTenant(tenantA, input("v1"));
    assert.equal(first.status, "draft");
    assert.equal(first.templateKind, "quick_reply");

    const firstRows = await rlsProbe(prisma, TENANT_A_ID, (client) =>
      client.configVersion.findMany({ where: { id: first.configVersionId } })
    );
    assert.equal(firstRows.length, 1);
    assert.equal(firstRows[0].domain, "TEMPLATE_COPY");
    assert.equal(firstRows[0].status, "DRAFT");
    assert.equal(firstRows[0].payload.sourceSnapshotRef, snapshotRef("v1"));

    const second = await repository.copyToTenant(tenantA, input("v2"));
    assert.equal(second.version, 2);

    const versions = await rlsProbe(prisma, TENANT_A_ID, (client) =>
      client.configVersion.findMany({
        orderBy: { version: "asc" },
        where: { domain: "TEMPLATE_COPY", key: TARGET_KEY }
      })
    );
    assert.equal(versions.length, 2);
    assert.equal(versions[0].payload.sourceSnapshotRef, snapshotRef("v1"));
    assert.equal(versions[1].payload.sourceSnapshotRef, snapshotRef("v2"));

    const auditRows = await rlsProbe(prisma, TENANT_A_ID, (client) =>
      client.auditLog.findMany({ where: { objectId: first.configVersionId } })
    );
    assert.equal(auditRows.length, 1);
    assert.equal(auditRows[0].content.after.templateKind, "quick_reply");
    assert.equal(auditRows[0].content.after.sourceTemplateRef, sourceTemplateRef());

    assert.equal(
      (
        await rlsProbe(prisma, TENANT_B_ID, (client) =>
          client.configVersion.findMany({ where: { id: first.configVersionId } })
        )
      ).length,
      0
    );
    await assertMissingContext(prisma, first.configVersionId);
    await cleanup(prisma);
    assert.equal(await residue(prisma), 0);
    console.log(
      "m5r-template-copy-true-db-smoke: passed same-tenant template_copy config_version+audit_log copy, independent snapshot versioning, wrong-tenant and missing-context RLS negatives; residue=0"
    );
  } finally {
    await cleanup(prisma).catch((error) => {
      console.error(
        `m5r-template-copy-true-db-smoke: cleanup failed: ${error.message}`
      );
    });
    await prisma.$disconnect();
  }
}

function readRlsDatabaseUrl() {
  const value = process.env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!value) throw new Error("UZMAX_RLS_DATABASE_URL is required");
  return value;
}

async function importRuntime() {
  const outDir = await compileApiRuntime();
  return {
    templateCopyRuntime: await import(
      new URL("template-copy-runtime.mjs", `${pathToFileURL(outDir).href}/`).href
    )
  };
}

async function seedTenants(prisma) {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M5R-06 Synthetic Org", slug: "m5r-06-org" }
  });
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A_ID, name: "M5R-06 Tenant A", orgId: ORG_ID, slug: "m5r-06-a" },
      { id: TENANT_B_ID, name: "M5R-06 Tenant B", orgId: ORG_ID, slug: "m5r-06-b" }
    ]
  });
}

function input(revision) {
  return {
    controlRefs: [`controlled://template-copy/${SPEC}/${revision}/approval`],
    reasonRef: `controlled://template-copy/${SPEC}/${revision}/reason`,
    sourceSnapshotRef: snapshotRef(revision),
    sourceTemplateRef: sourceTemplateRef(),
    sourceUpdatedRef: `controlled://group-template/quick_reply/m5r-06/${revision}/updated`,
    targetKey: TARGET_KEY,
    templateKind: "quick_reply",
    traceId: `m5r-06:${revision}`
  };
}

function sourceTemplateRef() {
  return "controlled://group-template/quick_reply/m5r-06-source";
}

function snapshotRef(revision) {
  return `controlled://group-template/quick_reply/m5r-06-source/${revision}`;
}

async function rlsProbe(prisma, tenantId, op) {
  const rows = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config(${"app.org_id"}, ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config(${"app.tenant_id"}, ${tenantId}, true)`,
    op(prisma)
  ]);
  return rows[3];
}

async function assertMissingContext(prisma, configVersionId) {
  const rows = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.configVersion.findMany({ where: { id: configVersionId } }),
    prisma.auditLog.findMany({ where: { objectId: configVersionId } })
  ]);
  assert.equal(rows[1].length, 0);
  assert.equal(rows[2].length, 0);
}

function accessContext(selectedTenantId) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["template:write"],
    selectedTenantId,
    tenantIds: [TENANT_A_ID, TENANT_B_ID],
    userId: USER_ID
  };
}

async function cleanup(prisma) {
  await prisma.auditLog.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.configVersion.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.tenant.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function residue(prisma) {
  const counts = await Promise.all([
    prisma.auditLog.count({ where: { orgId: ORG_ID } }),
    prisma.configVersion.count({ where: { orgId: ORG_ID } })
  ]);
  return counts.reduce((sum, count) => sum + count, 0);
}

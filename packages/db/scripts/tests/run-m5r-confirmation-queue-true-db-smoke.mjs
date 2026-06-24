import assert from "node:assert/strict";
import { pathToFileURL, URL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";

const SYNTHETIC_SPEC = "M5R-01";
const ORG_ID = "11111111-1111-4111-8111-111111111501";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222501";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333501";
const USER_ID = "44444444-4444-4444-8444-444444444501";
const IDS = {
  approve: "55555555-5555-4555-8555-555555555501",
  edit: "55555555-5555-4555-8555-555555555502",
  discard: "55555555-5555-4555-8555-555555555503",
  block: "55555555-5555-4555-8555-555555555504",
  noDiff: "55555555-5555-4555-8555-555555555505"
};

export async function runM5rConfirmationQueueTrueDbSmoke() {
  const databaseUrl = requireSmokeEnv("UZMAX_RLS_DATABASE_URL");
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await cleanupSyntheticRows(prisma);
    await seedSyntheticTenants(prisma);
    const api = await importApiConfirmationQueueRuntimeModules();
    const repository =
      api.confirmationQueueRuntime.createConfirmationQueueRepositoryProviderFromEnv({
        env: {
          UZMAX_CONFIRMATION_QUEUE_REPOSITORY_MODE: "rls_prisma_gateway",
          UZMAX_RLS_DATABASE_URL: databaseUrl
        },
        prismaClient: prisma
      });
    const service = new api.confirmationQueueService.ConfirmationQueueService(
      repository
    );
    await seedQueueItems(repository);

    const tenantARead = accessContext(TENANT_A_ID, ["confirmation:read"]);
    const tenantAWrite = accessContext(TENANT_A_ID, ["confirmation:write"]);
    const tenantBRead = accessContext(TENANT_B_ID, ["confirmation:read"]);
    const tenantBWrite = accessContext(TENANT_B_ID, ["confirmation:write"]);

    const list = await service.listItems(tenantARead, { status: "pending" });
    assert.deepEqual(
      list.items.map((item) => item.id),
      [IDS.noDiff, IDS.block, IDS.discard, IDS.edit, IDS.approve]
    );
    assert.equal(
      (await service.getItemDetail(tenantARead, IDS.approve)).item.diffPayload.left.ref,
      "controlled://kb/current"
    );
    await assert.rejects(
      () => service.getItemDetail(tenantBRead, IDS.approve),
      /confirmation item not found/
    );
    await assert.rejects(
      () =>
        service.applyDecision(tenantBWrite, {
          action: "discard",
          itemId: IDS.noDiff
        }),
      /confirmation item not found/
    );
    await assert.rejects(
      () =>
        service.applyDecision(tenantAWrite, { action: "approve", itemId: IDS.noDiff }),
      /conflict candidate requires side-by-side diff payload/
    );

    const decisions = [
      [
        "approved",
        { action: "approve", itemId: IDS.approve, reasonRef: reasonRef("approve") }
      ],
      [
        "edited",
        {
          action: "edit",
          editedPayload: { summaryRef: "controlled://candidate/m5r-01-edited" },
          itemId: IDS.edit,
          reasonRef: reasonRef("edit")
        }
      ],
      ["discarded", { action: "discard", itemId: IDS.discard }],
      ["blocked", { action: "block", itemId: IDS.block, reasonRef: reasonRef("block") }]
    ];
    for (const [status, input] of decisions) {
      assertDecision(await service.applyDecision(tenantAWrite, input), status);
    }
    const edited = await repository.getItem(tenantARead, IDS.edit);
    assert.equal(
      edited.metadata.editedPayload.summaryRef,
      "controlled://candidate/m5r-01-edited"
    );
    const approved = await repository.getItem(tenantARead, IDS.approve);
    assert.equal(approved.metadata.decision.formalWrite, false);
    assert.equal(approved.metadata.synthetic_spec, SYNTHETIC_SPEC);

    await assertRlsIsolation(prisma);
    await cleanupSyntheticRows(prisma);
    assert.equal(await syntheticResidueCount(prisma), 0);
    console.log(
      "m5r-confirmation-queue-true-db-smoke: passed same-tenant create/list/detail/approve/edit/discard/block, wrong-tenant/missing-context RLS negatives, conflict diff and formalWrite=false; residue=0"
    );
  } finally {
    await cleanupSyntheticRows(prisma).catch((error) => {
      console.error(
        `m5r-confirmation-queue-true-db-smoke: cleanup failed: ${error.message}`
      );
    });
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runM5rConfirmationQueueTrueDbSmoke();
}

function requireSmokeEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function importApiConfirmationQueueRuntimeModules() {
  const outDir = await compileApiRuntime();
  const baseUrl = `${pathToFileURL(outDir).href}/`;
  const importModule = (fileName) => import(new URL(`${fileName}.mjs`, baseUrl).href);
  const [confirmationQueueRuntime, confirmationQueueService] = await Promise.all([
    importModule("confirmation-queue.runtime"),
    importModule("confirmation-queue.service")
  ]);

  return { confirmationQueueRuntime, confirmationQueueService };
}

async function seedSyntheticTenants(prisma) {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M5R-01 Synthetic Org", slug: "m5r-01-synthetic-org" }
  });
  await prisma.tenant.createMany({
    data: [
      tenant(TENANT_A_ID, "M5R-01 Synthetic Tenant A"),
      tenant(TENANT_B_ID, "M5R-01 Synthetic Tenant B")
    ]
  });
}

function tenant(id, name) {
  return {
    id,
    name,
    orgId: ORG_ID,
    slug: id === TENANT_A_ID ? "tenant-a" : "tenant-b"
  };
}

async function seedQueueItems(repository) {
  for (const [id, kind, diffPayload] of [
    [IDS.approve, "conflict_candidate", sideBySideDiff()],
    [IDS.edit, "knowledge_candidate"],
    [IDS.discard, "eval_candidate"],
    [IDS.block, "profile_candidate"],
    [IDS.noDiff, "conflict_candidate"]
  ]) {
    await repository.saveItem(queueItem(id, kind, diffPayload));
  }
}

function queueItem(id, kind, diffPayload) {
  return {
    candidatePayload: {
      candidateRef: `controlled://candidate/${id}`,
      summaryRef: `controlled://candidate-summary/${id}`
    },
    confidenceBps: 8000,
    createdAt: `2026-06-24T12:00:0${id.at(-1)}.000Z`,
    diffPayload,
    id,
    kind,
    metadata: { synthetic_spec: SYNTHETIC_SPEC },
    orgId: ORG_ID,
    sourceRef: `controlled://distill/source/${id}`,
    status: "pending",
    tenantId: TENANT_A_ID
  };
}

function sideBySideDiff() {
  return {
    left: { ref: "controlled://kb/current" },
    right: { ref: "controlled://candidate/new" },
    summaryRef: "controlled://diff/m5r-01"
  };
}

function accessContext(selectedTenantId, permissions) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [TENANT_A_ID, TENANT_B_ID],
    userId: USER_ID
  };
}

function assertDecision(result, status) {
  assert.equal(result.formalWrite, false);
  assert.equal(result.auditDraft.formalWrite, false);
  assert.equal(result.item.status, status);
  assert.equal(result.item.metadata.decision.formalWrite, false);
  assert.equal(result.item.reviewedByUserId, USER_ID);
}

async function assertRlsIsolation(prisma) {
  const sameTenantRows = await runDirectRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.confirmationItem.findMany({ where: { id: IDS.approve } })
  );
  assert.equal(sameTenantRows.length, 1);
  assert.equal(sameTenantRows[0].auditLogId, null);
  assert.equal(
    (
      await runDirectRlsProbe(prisma, TENANT_B_ID, (client) =>
        client.confirmationItem.findMany({ where: { id: IDS.approve } })
      )
    ).length,
    0
  );
  await assert.rejects(
    () =>
      runDirectRlsProbe(prisma, TENANT_B_ID, (client) =>
        client.confirmationItem.update({
          data: { status: "DISCARDED" },
          where: { id: IDS.noDiff }
        })
      ),
    /Record to update not found|No .* found|P2025|not found/i
  );
  assert.equal(
    (
      await runDirectRlsProbeWithoutContext(prisma, (client) =>
        client.confirmationItem.findMany({ where: { id: IDS.approve } })
      )
    ).length,
    0
  );
  await assert.rejects(
    () =>
      runDirectRlsProbeWithoutContext(prisma, (client) =>
        client.confirmationItem.update({
          data: { status: "DISCARDED" },
          where: { id: IDS.noDiff }
        })
      ),
    /Record to update not found|No .* found|P2025|not found/i
  );
}

async function runDirectRlsProbe(prisma, tenantId, operation) {
  if (!ORG_ID.trim() || !tenantId?.trim()) {
    throw new Error("RLS tenant context requires orgId and tenantId");
  }
  return (
    await prisma.$transaction([
      prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
      prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
      prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`,
      operation(prisma)
    ])
  ).at(-1);
}

async function runDirectRlsProbeWithoutContext(prisma, operation) {
  return (
    await prisma.$transaction([
      prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
      operation(prisma)
    ])
  ).at(-1);
}

async function cleanupSyntheticRows(prisma) {
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function syntheticResidueCount(prisma) {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from confirmation_item where metadata->>'synthetic_spec' = ${SYNTHETIC_SPEC})
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

function reasonRef(action) {
  return `controlled://confirmation/m5r-01/${action}`;
}

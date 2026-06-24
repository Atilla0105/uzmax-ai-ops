import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

import { compileApiRuntime } from "../../../../apps/api/scripts/runtime-compiler.mjs";

const SYNTHETIC_SPEC = "M5R-02";
const ORG_ID = "11111111-1111-4111-8111-111111111502";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222502";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333502";
const USER_ID = "44444444-4444-4444-8444-444444444502";
const IDS = {
  approve: "55555555-5555-4555-8555-555555555502",
  block: "55555555-5555-4555-8555-555555555512",
  discard: "55555555-5555-4555-8555-555555555522",
  edit: "55555555-5555-4555-8555-555555555532",
  noDiff: "55555555-5555-4555-8555-555555555542",
  pending: "55555555-5555-4555-8555-555555555552"
};
const TARGETS = {
  approve: "controlled://config-version/business_config/m5r-02-approved",
  block: "controlled://config-version/business_config/m5r-02-blocked",
  discard: "controlled://config-version/business_config/m5r-02-discarded",
  edit: "controlled://config-version/business_config/m5r-02-edited",
  pending: "controlled://config-version/business_config/m5r-02-pending"
};

export async function runM5rFormalWriteTrueDbSmoke() {
  const databaseUrl = readRlsDatabaseUrl();
  const prisma = await createSmokePrismaClient(databaseUrl);

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
    const formalWrite =
      api.confirmationQueueFormalWrite.createConfirmationFormalWritePipelineProviderFromEnv(
        {
          env: {
            UZMAX_CONFIRMATION_FORMAL_WRITE_MODE: "rls_prisma_gateway",
            UZMAX_RLS_DATABASE_URL: databaseUrl
          },
          prismaClient: prisma
        }
      );
    const service = new api.confirmationQueueService.ConfirmationQueueService(
      repository,
      formalWrite
    );
    await seedQueueItems(repository);

    const tenantARead = accessContext(TENANT_A_ID, ["confirmation:read"]);
    const tenantAWrite = accessContext(TENANT_A_ID, ["confirmation:write"]);
    const tenantBRead = accessContext(TENANT_B_ID, ["confirmation:read"]);
    const tenantBWrite = accessContext(TENANT_B_ID, ["confirmation:write"]);

    await assert.rejects(
      () => service.getItemDetail(tenantBRead, IDS.approve),
      /confirmation item not found/
    );
    await assert.rejects(
      () =>
        service.applyDecision(tenantAWrite, {
          action: "approve",
          itemId: IDS.noDiff,
          reasonRef: reasonRef("no-diff")
        }),
      /conflict candidate requires side-by-side diff payload/
    );
    await assert.rejects(
      () =>
        service.applyDecision(tenantBWrite, {
          action: "approve",
          itemId: IDS.approve,
          reasonRef: reasonRef("wrong-tenant")
        }),
      /confirmation item not found/
    );

    const approved = await service.applyDecision(tenantAWrite, {
      action: "approve",
      itemId: IDS.approve,
      reasonRef: reasonRef("approve")
    });
    const edited = await service.applyDecision(tenantAWrite, {
      action: "edit",
      editedPayload: { summaryRef: "controlled://candidate/m5r-02-edited" },
      itemId: IDS.edit,
      reasonRef: reasonRef("edit")
    });
    const discarded = await service.applyDecision(tenantAWrite, {
      action: "discard",
      itemId: IDS.discard,
      reasonRef: reasonRef("discard")
    });
    const blocked = await service.applyDecision(tenantAWrite, {
      action: "block",
      itemId: IDS.block,
      reasonRef: reasonRef("block")
    });

    assertFormalWrite(approved, TARGETS.approve);
    assertFormalWrite(edited, TARGETS.edit);
    assert.equal(discarded.formalWrite, false);
    assert.equal(blocked.formalWrite, false);
    assert.equal(
      (await repository.getItem(tenantARead, IDS.pending)).status,
      "pending"
    );

    const targetEvidence = await assertTargetWrites(prisma, {
      approvedConfigId: approved.auditDraft.configVersionId,
      approvedTargetRef: TARGETS.approve,
      editedConfigId: edited.auditDraft.configVersionId,
      editedTargetRef: TARGETS.edit
    });
    await assertNoWritesForInactiveTargets(prisma);
    await assertRlsIsolation(prisma, targetEvidence.approvedConfigId);
    await cleanupSyntheticRows(prisma);
    assert.equal(await syntheticResidueCount(prisma), 0);
    console.log(
      "m5r-formal-write-true-db-smoke: passed approved/edited config_version+audit_log writes, pending/discarded/blocked no-writes, conflict diff, tenant isolation, wrong-tenant/missing-context RLS negatives; residue=0"
    );
  } finally {
    await cleanupSyntheticRows(prisma).catch((error) => {
      console.error(`m5r-formal-write-true-db-smoke: cleanup failed: ${error.message}`);
    });
    await prisma.$disconnect();
  }
}

function readRlsDatabaseUrl() {
  const name = "UZMAX_RLS_DATABASE_URL";
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function createSmokePrismaClient(databaseUrl) {
  const { PrismaClient: SmokePrismaClient } = await import("@prisma/client");
  return new SmokePrismaClient({ datasources: { db: { url: databaseUrl } } });
}

async function importApiConfirmationQueueRuntimeModules() {
  const outDir = await compileApiRuntime();
  const moduleBaseHref = `${pathToFileURL(outDir).href}/`;
  const entries = {
    confirmationQueueFormalWrite: "confirmation-queue.formal-write",
    confirmationQueueRuntime: "confirmation-queue.runtime",
    confirmationQueueService: "confirmation-queue.service"
  };
  const loaded = {};
  for (const [key, fileName] of Object.entries(entries)) {
    loaded[key] = await import(`${moduleBaseHref}${fileName}.mjs`);
  }
  return loaded;
}

async function seedSyntheticTenants(prisma) {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M5R-02 Synthetic Org", slug: "m5r-02-synthetic-org" }
  });
  await prisma.tenant.createMany({
    data: [
      tenant(TENANT_A_ID, "M5R-02 Synthetic Tenant A"),
      tenant(TENANT_B_ID, "M5R-02 Synthetic Tenant B")
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
  for (const item of [
    queueItem(IDS.approve, "conflict_candidate", TARGETS.approve, sideBySideDiff()),
    queueItem(IDS.edit, "knowledge_candidate", TARGETS.edit),
    queueItem(IDS.discard, "eval_candidate", TARGETS.discard),
    queueItem(IDS.block, "profile_candidate", TARGETS.block),
    queueItem(IDS.pending, "knowledge_candidate", TARGETS.pending),
    queueItem(IDS.noDiff, "conflict_candidate", TARGETS.approve)
  ]) {
    await repository.saveItem(item);
  }
}

function queueItem(id, kind, targetRef, diffPayload = {}) {
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
    targetKind: "config_version",
    targetRef,
    tenantId: TENANT_A_ID
  };
}

function sideBySideDiff() {
  return {
    left: { ref: "controlled://config/current" },
    right: { ref: "controlled://candidate/new" },
    summaryRef: "controlled://diff/m5r-02"
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

function assertFormalWrite(result, targetRef) {
  assert.equal(result.formalWrite, true);
  assert.equal(result.auditDraft.formalWrite, true);
  assert.equal(result.auditDraft.targetRef, targetRef);
  assert.equal(result.item.auditLogId, result.auditDraft.auditLogId);
  assert.equal(result.item.metadata.formalWrite.targetRef, targetRef);
  assert.equal(result.item.metadata.formalWrite.status, "written");
}

async function assertTargetWrites(prisma, target) {
  const configs = await runDirectRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.configVersion.findMany({
      orderBy: { key: "asc" },
      where: { key: { in: ["m5r-02-approved", "m5r-02-edited"] } }
    })
  );
  assert.deepEqual(
    configs.map((row) => row.key),
    ["m5r-02-approved", "m5r-02-edited"]
  );
  const auditRows = await runDirectRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.auditLog.findMany({
      where: { objectId: { in: [target.approvedConfigId, target.editedConfigId] } }
    })
  );
  assert.equal(auditRows.length, 2);
  for (const audit of auditRows) {
    assert.equal(audit.content.after.confirmerUserId, USER_ID);
    assert.equal(audit.content.after.targetKind, "config_version");
    assert.match(audit.content.after.targetRef, /^controlled:\/\/config-version\//);
    assert.ok(audit.content.after.diffPayload);
  }
  return { approvedConfigId: target.approvedConfigId };
}

async function assertNoWritesForInactiveTargets(prisma) {
  const noWriteRows = await runDirectRlsProbe(prisma, TENANT_A_ID, (client) =>
    client.configVersion.findMany({
      where: {
        key: { in: ["m5r-02-blocked", "m5r-02-discarded", "m5r-02-pending"] }
      }
    })
  );
  assert.equal(noWriteRows.length, 0);
}

async function assertRlsIsolation(prisma, approvedConfigId) {
  assert.equal(
    (
      await runDirectRlsProbe(prisma, TENANT_B_ID, (client) =>
        client.configVersion.findMany({ where: { id: approvedConfigId } })
      )
    ).length,
    0
  );
  await assert.rejects(
    () =>
      runDirectRlsProbe(prisma, TENANT_B_ID, (client) =>
        client.configVersion.create({
          data: {
            createdByUserId: USER_ID,
            domain: "BUSINESS_CONFIG",
            id: "66666666-6666-4666-8666-666666666502",
            key: "m5r-02-wrong-tenant",
            orgId: ORG_ID,
            payload: { targetRef: TARGETS.approve },
            status: "ACTIVE",
            tenantId: TENANT_A_ID,
            version: 1
          }
        })
      ),
    /row-level security|violates|permission denied|P2004|P2010/i
  );
  assert.equal(
    (
      await runDirectRlsProbeWithoutContext(prisma, (client) =>
        client.configVersion.findMany({ where: { id: approvedConfigId } })
      )
    ).length,
    0
  );
  await assert.rejects(
    () =>
      runDirectRlsProbeWithoutContext(prisma, (client) =>
        client.auditLog.create({
          data: {
            action: "formal_write_config_version",
            actorUserId: USER_ID,
            content: { after: { targetRef: TARGETS.approve }, before: null },
            eventType: "config_version.saved",
            id: "77777777-7777-4777-8777-777777777502",
            module: "confirmation_queue",
            objectId: approvedConfigId,
            objectType: "config_version",
            orgId: ORG_ID,
            tenantId: TENANT_A_ID
          }
        })
      ),
    /row-level security|violates|permission denied|P2004|P2010/i
  );
}

async function runDirectRlsProbe(prisma, tenantId, operation) {
  return runAppRuntimeProbe(prisma, operation, tenantId);
}

async function runDirectRlsProbeWithoutContext(prisma, operation) {
  return runAppRuntimeProbe(prisma, operation);
}

async function runAppRuntimeProbe(prisma, operation, tenantId) {
  const batch = [prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"')];
  if (tenantId) batch.push(...tenantSettings(prisma, tenantId));
  batch.push(operation(prisma));
  return (await prisma.$transaction(batch)).at(-1);
}

function tenantSettings(prisma, tenantId) {
  return [
    prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`
  ];
}

async function cleanupSyntheticRows(prisma) {
  for (const deleteSyntheticRows of [
    () => prisma.confirmationItem.deleteMany({ where: { orgId: ORG_ID } }),
    () => prisma.auditLog.deleteMany({ where: { orgId: ORG_ID } }),
    () => prisma.configVersion.deleteMany({ where: { orgId: ORG_ID } }),
    () => prisma.tenant.deleteMany({ where: { orgId: ORG_ID } }),
    () => prisma.org.deleteMany({ where: { id: ORG_ID } })
  ]) {
    await deleteSyntheticRows();
  }
}

async function syntheticResidueCount(prisma) {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from confirmation_item where metadata->>'synthetic_spec' = ${SYNTHETIC_SPEC})
      + (select count(*) from config_version where config_key like 'm5r-02-%')
      + (select count(*) from audit_log where trace_id like 'confirmation:55555555-5555-4555-8555-5555555555%')
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

function reasonRef(action) {
  return `controlled://confirmation/m5r-02/${action}`;
}

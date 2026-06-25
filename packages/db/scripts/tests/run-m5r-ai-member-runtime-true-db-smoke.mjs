import assert from "node:assert/strict";

import { PrismaClient } from "@prisma/client";

import { importApiAiMemberRuntimeModules } from "../../../../apps/api/scripts/runtime-compiler.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111504";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222504";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333504";
const USER_ID = "44444444-4444-4444-8444-444444444504";
const MEMBER_ID = "55555555-5555-4555-8555-555555555504";
const BLOCKED_MEMBER_ID = "55555555-5555-4555-8555-555555555514";
const VERSION_ID = "66666666-6666-4666-8666-666666666504";
const BLOCKED_VERSION_ID = "66666666-6666-4666-8666-666666666514";
const PASSED_GATE_ID = "77777777-7777-4777-8777-777777777504";
const BLOCKED_GATE_ID = "77777777-7777-4777-8777-777777777514";
const CONFIG_VERSION_ID = "88888888-8888-4888-8888-888888888504";
const TOGGLE_ID = "99999999-9999-4999-8999-999999999504";

export async function runM5rAiMemberRuntimeTrueDbSmoke() {
  const databaseUrl = readRlsDatabaseUrl();
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    await cleanup(prisma);
    await seed(prisma);
    const { aiMemberRuntime } = await importApiAiMemberRuntimeModules();
    const repository = aiMemberRuntime.createAiMemberRuntimeRepositoryProviderFromEnv({
      env: {
        UZMAX_AI_MEMBER_RUNTIME_MODE: "rls_prisma_gateway",
        UZMAX_RLS_DATABASE_URL: databaseUrl
      },
      prismaClient: prisma
    });
    const tenantA = accessContext(TENANT_A_ID);
    const tenantB = accessContext(TENANT_B_ID);

    const before = await repository.getRuntimeState(tenantA, MEMBER_ID);
    assert.equal(before.status, "online");
    await assert.rejects(
      () => repository.getRuntimeState(tenantB, MEMBER_ID),
      /AI member not found/
    );
    const stopped = await repository.emergencyStop(tenantA, MEMBER_ID, {
      controlRef: "controlled://ai-member/m5r-04/emergency-control",
      reasonRef: "controlled://ai-member/m5r-04/emergency-reason"
    });
    assert.equal(stopped.member.status, "disabled");
    await assert.rejects(
      () =>
        repository.recoverOnline(tenantA, MEMBER_ID, {
          reasonRef: "controlled://ai-member/m5r-04/recovery-missing-evidence"
        }),
      /breakerResolvedRef/
    );
    const recovered = await repository.recoverOnline(tenantA, MEMBER_ID, {
      breakerResolvedRef: "controlled://breaker/m5r-04/resolved",
      controlRef: "controlled://ai-member/m5r-04/recovery-control",
      reasonRef: "controlled://ai-member/m5r-04/recovery-reason"
    });
    assert.equal(recovered.member.activeVersion.evalGateId, PASSED_GATE_ID);
    const toggled = await repository.toggleCapability(tenantA, MEMBER_ID, "quote", {
      configVersionId: CONFIG_VERSION_ID,
      enabled: true,
      evalGateId: PASSED_GATE_ID,
      reasonRef: "controlled://ai-member/m5r-04/toggle-enable"
    });
    assert.equal(toggled.capability.enabled, true);
    await assert.rejects(
      () =>
        repository.toggleCapability(tenantA, MEMBER_ID, "quote", {
          configVersionId: CONFIG_VERSION_ID,
          enabled: true,
          evalGateId: BLOCKED_GATE_ID,
          reasonRef: "controlled://ai-member/m5r-04/toggle-blocked"
        }),
      /passed eval gate/
    );
    await assert.rejects(
      () =>
        repository.recoverOnline(tenantA, BLOCKED_MEMBER_ID, {
          breakerResolvedRef: "controlled://breaker/m5r-04/blocked-version",
          reasonRef: "controlled://ai-member/m5r-04/recovery-blocked-gate"
        }),
      /passed eval gate/
    );
    await assertRls(prisma);
    await cleanup(prisma);
    assert.equal(await residueCount(prisma), 0);
    console.log(
      "m5r-ai-member-runtime-true-db-smoke: passed emergency stop, recovery, capability toggle, audit writes, active version gate, wrong-tenant and missing-context RLS negatives; residue=0"
    );
  } finally {
    await cleanup(prisma).catch((error) => {
      console.error(
        `m5r-ai-member-runtime-true-db-smoke: cleanup failed: ${error.message}`
      );
    });
    await prisma.$disconnect();
  }
}

if (
  process.argv[1]?.endsWith(
    "packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs"
  )
) {
  await runM5rAiMemberRuntimeTrueDbSmoke();
}

function readRlsDatabaseUrl() {
  const value = process.env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!value) throw new Error("UZMAX_RLS_DATABASE_URL is required");
  return value;
}

async function seed(prisma) {
  await prisma.org.create({
    data: { id: ORG_ID, name: "M5R-04 Synthetic Org", slug: "m5r-04-org" }
  });
  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A_ID, name: "M5R-04 Tenant A", orgId: ORG_ID, slug: "m5r-04-a" },
      { id: TENANT_B_ID, name: "M5R-04 Tenant B", orgId: ORG_ID, slug: "m5r-04-b" }
    ]
  });
  await prisma.evalGate.createMany({
    data: [evalGate(PASSED_GATE_ID, "PASSED"), evalGate(BLOCKED_GATE_ID, "BLOCKED")]
  });
  await prisma.configVersion.create({
    data: {
      createdByUserId: USER_ID,
      domain: "BUSINESS_CONFIG",
      id: CONFIG_VERSION_ID,
      key: "m5r-04-ai-member-runtime",
      orgId: ORG_ID,
      payload: { summaryRef: "controlled://config/m5r-04" },
      status: "ACTIVE",
      tenantId: TENANT_A_ID,
      version: 1
    }
  });
  await prisma.aiMember.createMany({
    data: [
      member(MEMBER_ID, "m5r-04-primary", "ONLINE"),
      member(BLOCKED_MEMBER_ID, "m5r-04-blocked", "DISABLED")
    ]
  });
  await prisma.aiMemberVersion.createMany({
    data: [
      version(VERSION_ID, MEMBER_ID, PASSED_GATE_ID),
      version(BLOCKED_VERSION_ID, BLOCKED_MEMBER_ID, BLOCKED_GATE_ID)
    ]
  });
  await prisma.aiMember.update({
    data: { activeVersionId: VERSION_ID },
    where: { id: MEMBER_ID }
  });
  await prisma.aiMember.update({
    data: {
      activeVersionId: BLOCKED_VERSION_ID,
      breakerReasonRef: "controlled://breaker/m5r-04/blocked"
    },
    where: { id: BLOCKED_MEMBER_ID }
  });
  await prisma.aiCapabilityToggle.create({
    data: {
      aiMemberId: MEMBER_ID,
      capabilityKey: "QUOTE",
      enabled: false,
      id: TOGGLE_ID,
      metadata: { synthetic_spec: "M5R-04" },
      orgId: ORG_ID,
      tenantId: TENANT_A_ID
    }
  });
}

function evalGate(id, status) {
  return {
    categoryQuotas: { redline: "passed" },
    gateKey: `m5r-04-${id.slice(-3)}`,
    id,
    orgId: ORG_ID,
    status,
    targetKind: "ai_member_version",
    targetRef: `controlled://ai-member-version/${id}`,
    tenantId: TENANT_A_ID
  };
}

function member(id, memberKey, status) {
  return {
    displayName: `M5R-04 ${memberKey}`,
    id,
    memberKey,
    metadata: { synthetic_spec: "M5R-04" },
    orgId: ORG_ID,
    status,
    tenantId: TENANT_A_ID
  };
}

function version(id, aiMemberId, evalGateId) {
  return {
    aiMemberId,
    createdByUserId: USER_ID,
    evalGateId,
    id,
    orgId: ORG_ID,
    personaRef: `manifest://ai-member/m5r-04/${id}`,
    status: "ACTIVE",
    tenantId: TENANT_A_ID,
    version: 1
  };
}

function accessContext(selectedTenantId) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["ai_member:read", "ai_member:write"],
    selectedTenantId,
    tenantIds: [TENANT_A_ID, TENANT_B_ID],
    userId: USER_ID
  };
}

async function assertRls(prisma) {
  assert.equal(
    (
      await rlsProbe(prisma, TENANT_A_ID, (client) =>
        client.aiMember.findMany({ where: { id: MEMBER_ID } })
      )
    ).length,
    1
  );
  assert.equal(
    (
      await rlsProbe(prisma, TENANT_B_ID, (client) =>
        client.aiMember.findMany({ where: { id: MEMBER_ID } })
      )
    ).length,
    0
  );
  await assert.rejects(
    () =>
      rlsProbe(prisma, TENANT_B_ID, (client) =>
        client.aiMember.update({
          data: { status: "DISABLED" },
          where: { id: MEMBER_ID }
        })
      ),
    /Record to update not found|No .* found|P2025|not found/i
  );
  assert.equal(
    (
      await rlsProbeWithoutContext(prisma, (client) =>
        client.aiMember.findMany({ where: { id: MEMBER_ID } })
      )
    ).length,
    0
  );
}

function rlsProbe(prisma, tenantId, action) {
  return prisma
    .$transaction([
      prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
      prisma.$queryRaw`select set_config(${"app.org_id"}, ${ORG_ID}, true)`,
      prisma.$queryRaw`select set_config(${"app.tenant_id"}, ${tenantId}, true)`,
      action(prisma)
    ])
    .then((rows) => rows.at(-1));
}

function rlsProbeWithoutContext(prisma, action) {
  return prisma
    .$transaction([
      prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
      action(prisma)
    ])
    .then((rows) => rows.at(-1));
}

async function cleanup(prisma) {
  await prisma.aiMember.updateMany({
    data: { activeVersionId: null },
    where: { orgId: ORG_ID }
  });
  await prisma.aiCapabilityToggle.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.aiMemberVersion.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.aiMember.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.auditLog.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.configVersion.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.evalGate.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.tenant.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.org.deleteMany({ where: { id: ORG_ID } });
}

async function residueCount(prisma) {
  const [members, toggles, audits, orgs] = await Promise.all([
    prisma.aiMember.count({ where: { orgId: ORG_ID } }),
    prisma.aiCapabilityToggle.count({ where: { orgId: ORG_ID } }),
    prisma.auditLog.count({ where: { orgId: ORG_ID } }),
    prisma.org.count({ where: { id: ORG_ID } })
  ]);
  return members + toggles + audits + orgs;
}

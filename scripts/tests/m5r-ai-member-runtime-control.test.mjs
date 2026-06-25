import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "node:test";
import ts from "typescript";

import { compileApiRuntime } from "../../apps/api/scripts/runtime-compiler.mjs";
import { runM5rAiMemberRuntimeTrueDbSmoke } from "../../packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111504";
const TENANT_ID = "22222222-2222-4222-8222-222222222504";
const USER_ID = "44444444-4444-4444-8444-444444444504";
const MEMBER_ID = "55555555-5555-4555-8555-555555555504";
const VERSION_ID = "66666666-6666-4666-8666-666666666504";
const PASSED_GATE_ID = "77777777-7777-4777-8777-777777777504";
const BLOCKED_GATE_ID = "77777777-7777-4777-8777-777777777514";
const CONFIG_ID = "88888888-8888-4888-8888-888888888504";
const TOGGLE_ID = "99999999-9999-4999-8999-999999999504";
const runtime = await importAiMemberRuntime();
const adminClient = await importTypescriptSource(
  "apps/admin/src/aiMemberRuntimeApiClient.ts"
);
const source = {
  adminClient: read("apps/admin/src/aiMemberRuntimeApiClient.ts"),
  appModule: read("apps/api/src/app.module.ts"),
  compiler: read("apps/api/scripts/runtime-compiler.mjs"),
  evidence: read("docs/evidence/M5R/M5R-04-ai-member-runtime-control.md"),
  m5rIndex: read("docs/evidence/M5R/README.md"),
  runtime: read("apps/api/src/ai-member-runtime.ts"),
  runtimeContracts: read("apps/api/src/ai-member-runtime.contracts.ts"),
  runtimeRepository: read("apps/api/src/ai-member-runtime.repository.ts"),
  smoke: read("packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs"),
  spec: read("docs/specs/M5R-04-ai-member-runtime-control.md")
};

describe("M5R-04 AI member runtime control", () => {
  it("wires disabled-by-default API runtime and focused admin client routes", async () => {
    assert.match(source.appModule, /AiMemberRuntimeController/);
    assert.match(source.appModule, /createAiMemberRuntimeRepositoryProviderFromEnv/);
    assert.doesNotMatch(source.appModule, /process\.env/);
    assert.match(source.compiler, /importApiAiMemberRuntimeModules/);
    assert.match(source.runtimeRepository, /createRlsTransactionContext/);
    assert.match(
      `${source.runtimeContracts}\n${source.runtimeRepository}`,
      /AI member runtime env must use RLS Prisma gateway/
    );
    assert.match(source.adminClient, /runtime-control\/emergency-stop/);

    const calls = [];
    const client = adminClient.createAiMemberRuntimeApiClient({
      fetcher: async (input, init = {}) => {
        calls.push([input, init]);
        return { json: async () => ({ ok: true }), ok: true, status: 200 };
      }
    });
    await client.getRuntimeState(MEMBER_ID);
    await client.emergencyStop(MEMBER_ID, {
      reasonRef: "controlled://ai-member/m5r-04/emergency"
    });
    await client.recoverOnline(MEMBER_ID, {
      breakerResolvedRef: "controlled://breaker/m5r-04/resolved",
      reasonRef: "controlled://ai-member/m5r-04/recovery"
    });
    await client.toggleCapability(MEMBER_ID, "quote", {
      configVersionId: CONFIG_ID,
      enabled: true,
      evalGateId: PASSED_GATE_ID,
      reasonRef: "controlled://ai-member/m5r-04/toggle"
    });
    assert.deepEqual(
      calls.map(([input]) => input),
      [
        `/ai-members/${MEMBER_ID}/runtime-control`,
        `/ai-members/${MEMBER_ID}/runtime-control/emergency-stop`,
        `/ai-members/${MEMBER_ID}/runtime-control/recover`,
        `/ai-members/${MEMBER_ID}/runtime-control/capabilities/quote`
      ]
    );
    assert.throws(
      () =>
        client.emergencyStop(MEMBER_ID, {
          reasonRef: "controlled://ai-member/m5r-04/raw",
          rawPrompt: "secret"
        }),
      /forbidden/
    );
  });

  it("requires explicit RLS mode, fails closed without env and rejects bypass mode", async () => {
    const disabled = runtime.createAiMemberRuntimeRepositoryProviderFromEnv({
      env: {}
    });
    await assert.rejects(
      () => disabled.getRuntimeState(context(), MEMBER_ID),
      /not configured/
    );
    assert.throws(
      () =>
        runtime.createAiMemberRuntimeRepositoryProviderFromEnv({
          env: { UZMAX_AI_MEMBER_RUNTIME_MODE: "rls_prisma_gateway" }
        }),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    assert.throws(
      () =>
        runtime.createAiMemberRuntimeRepositoryProviderFromEnv({
          env: { UZMAX_AI_MEMBER_RUNTIME_MODE: "prisma_gateway" }
        }),
      /must use RLS Prisma gateway/
    );
    const previous = process.env.UZMAX_RLS_DATABASE_URL;
    delete process.env.UZMAX_RLS_DATABASE_URL;
    await assert.rejects(
      () => runM5rAiMemberRuntimeTrueDbSmoke(),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    restoreEnv("UZMAX_RLS_DATABASE_URL", previous);
  });

  it("updates existing member/toggle rows and writes audit inside RLS transactions", async () => {
    const fake = fakePrisma();
    const repository = runtime.createAiMemberRuntimeRepositoryProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient: fake
    });
    const stopped = await repository.emergencyStop(context(), MEMBER_ID, {
      controlRef: "controlled://ai-member/m5r-04/stop-control",
      reasonRef: "controlled://ai-member/m5r-04/stop-reason"
    });
    assert.equal(stopped.member.status, "disabled");
    assert.equal(fake.audits.at(-1).eventType, "ai_member.emergency_stop");
    await assert.rejects(
      () =>
        repository.recoverOnline(context(), MEMBER_ID, {
          reasonRef: "controlled://ai-member/m5r-04/recover-no-evidence"
        }),
      /breakerResolvedRef/
    );
    const recovered = await repository.recoverOnline(context(), MEMBER_ID, {
      breakerResolvedRef: "controlled://breaker/m5r-04/resolved",
      reasonRef: "controlled://ai-member/m5r-04/recover"
    });
    assert.equal(recovered.member.status, "online");
    assert.equal(
      fake.audits.at(-1).content.after.activeVersion.evalGateId,
      PASSED_GATE_ID
    );
    await assert.rejects(
      () =>
        repository.toggleCapability(context(), MEMBER_ID, "quote", {
          configVersionId: CONFIG_ID,
          enabled: true,
          evalGateId: BLOCKED_GATE_ID,
          reasonRef: "controlled://ai-member/m5r-04/toggle-blocked"
        }),
      /passed eval gate/
    );
    assert.equal(fake.toggles[0].enabled, false);
    await assert.rejects(
      () =>
        repository.toggleCapability(context(), MEMBER_ID, "quote", {
          enabled: true,
          reasonRef: "controlled://ai-member/m5r-04/toggle-missing-gate"
        }),
      /evalGateId.*passed eval gate/
    );
    assert.equal(fake.toggles[0].enabled, false);
    const toggled = await repository.toggleCapability(context(), MEMBER_ID, "quote", {
      configVersionId: CONFIG_ID,
      enabled: true,
      evalGateId: PASSED_GATE_ID,
      reasonRef: "controlled://ai-member/m5r-04/toggle-passed"
    });
    assert.equal(toggled.capability.enabled, true);
    assert.equal(fake.audits.at(-1).content.before.enabled, false);
    assert.deepEqual(fake.transactions.at(-1).slice(0, 3), [
      { kind: "role", sql: 'set local role "uzmax_app_runtime"' },
      { key: "app.org_id", kind: "set_config", value: ORG_ID },
      { key: "app.tenant_id", kind: "set_config", value: TENANT_ID }
    ]);
  });

  it("documents M5R-04 scope, incident and true DB missing-env status", () => {
    assert.match(source.smoke, /same-tenant|wrong-tenant|missing-context/s);
    assert.match(source.smoke, /readRlsDatabaseUrl/);
    assert.match(
      source.spec,
      /docs\/incidents\/INC-2026-06-25-m5r-04-root-readme-pollution\.md/
    );
    assert.match(
      source.evidence,
      /\/private\/tmp\/uzmax-m5r-04-ai-member-runtime-control/
    );
    assert.match(
      `${source.spec}\n${source.evidence}\n${source.m5rIndex}`,
      /(?=.*M5R-04 AI Member Runtime Control)(?=.*ai_member_runtime_audit_supported_not_logs_center_closed)(?=.*runtime_contract_passed_true_db_blocked_missing_env_not_owner_accepted)(?=.*No Sensitive Data Statement)/s
    );
  });
});

async function importAiMemberRuntime() {
  const outDir = await compileApiRuntime({
    outDir: path.join(repoRoot, "node_modules/.cache/uzmax-api-runtime-m5r-04")
  });
  return import(`${pathToFileURL(path.join(outDir, "ai-member-runtime.mjs")).href}`);
}

function fakePrisma() {
  const fake = {
    audits: [],
    gates: [
      { id: PASSED_GATE_ID, orgId: ORG_ID, status: "PASSED", tenantId: TENANT_ID },
      { id: BLOCKED_GATE_ID, orgId: ORG_ID, status: "BLOCKED", tenantId: TENANT_ID }
    ],
    members: [
      {
        activeVersionId: VERSION_ID,
        displayName: "M5R-04 Synthetic AI",
        id: MEMBER_ID,
        memberKey: "m5r-04",
        metadata: {},
        orgId: ORG_ID,
        status: "ONLINE",
        tenantId: TENANT_ID
      }
    ],
    toggles: [
      {
        aiMemberId: MEMBER_ID,
        capabilityKey: "QUOTE",
        enabled: false,
        id: TOGGLE_ID,
        metadata: {},
        orgId: ORG_ID,
        tenantId: TENANT_ID
      }
    ],
    transactions: [],
    versions: [
      {
        evalGateId: PASSED_GATE_ID,
        id: VERSION_ID,
        orgId: ORG_ID,
        personaRef: "manifest://ai-member/m5r-04/persona",
        status: "ACTIVE",
        tenantId: TENANT_ID,
        version: 1
      }
    ]
  };
  Object.assign(fake, {
    aiCapabilityToggle: delegate(fake.toggles),
    aiMember: delegate(fake.members),
    aiMemberVersion: delegate(fake.versions),
    auditLog: {
      create: async ({ data }) => {
        fake.audits.push(data);
        return data;
      }
    },
    evalGate: delegate(fake.gates),
    $executeRawUnsafe: async (sql) => ({ kind: "role", sql }),
    $queryRaw: async (_strings, key, value) => ({ key, kind: "set_config", value }),
    $transaction: async (operations) => {
      const result = await Promise.all(operations);
      fake.transactions.push(result);
      return result;
    }
  });
  return fake;
}

function delegate(rows) {
  const select = (where = {}) =>
    rows.filter((row) =>
      Object.entries(where).every(([key, value]) => row[key] === value)
    );
  return {
    create: async ({ data }) => {
      rows.push(data);
      return data;
    },
    findFirst: async ({ where }) => select(where)[0] ?? null,
    findMany: async ({ where }) => select(where),
    update: async ({ data, where }) => {
      const row = select(where)[0];
      if (!row) throw new Error("Record to update not found");
      Object.assign(row, data);
      return row;
    }
  };
}

function context() {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["ai_member:read", "ai_member:write"],
    selectedTenantId: TENANT_ID,
    tenantIds: [TENANT_ID],
    userId: USER_ID
  };
}

async function importTypescriptSource(relativePath) {
  const { outputText } = ts.transpileModule(read(relativePath), {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2023 },
    fileName: relativePath
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

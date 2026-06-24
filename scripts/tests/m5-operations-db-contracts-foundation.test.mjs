import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const schema = read("packages/db/prisma/schema.prisma");
const migration = read(
  "packages/db/migrations/0007_m5_operations_contracts_foundation.sql"
);
const spec = read("docs/specs/M5-01-db-contract-foundation.md");
const evidence = read("docs/evidence/M5/M5-01-db-contract-foundation.md");
const dbIndexSource = read("packages/db/src/index.ts");
const db = await importTypescriptSource("packages/db/src/m5-operations-contracts.ts");
const dbIndex = await importTypescriptSource("packages/db/src/index.ts");
const m5 = db.m5OperationsContracts;

const ORG_UUID = "11111111-1111-4111-8111-111111111111";
const TENANT_UUID = "22222222-2222-4222-8222-222222222222";
const CONFIRMATION_UUID = "33333333-3333-4333-8333-333333333333";
const DISTILL_RUN_UUID = "44444444-4444-4444-8444-444444444444";
const DISTILL_HEALTH_UUID = "55555555-5555-4555-8555-555555555555";
const AI_MEMBER_UUID = "66666666-6666-4666-8666-666666666666";
const AI_VERSION_UUID = "77777777-7777-4777-8777-777777777777";
const TOGGLE_UUID = "88888888-8888-4888-8888-888888888888";
const EVAL_GATE_UUID = "99999999-9999-4999-8999-999999999999";
const CONFIG_VERSION_UUID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_UUID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const AUDIT_UUID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

describe("M5-01 operations DB contracts foundation", () => {
  it("maps M5 Prisma models and enums to the expected SQL tables", () => {
    for (const [model, table] of [
      ["ConfirmationItem", "confirmation_item"],
      ["DistillRun", "distill_run"],
      ["DistillHealthDaily", "distill_health_daily"],
      ["AiMember", "ai_member"],
      ["AiMemberVersion", "ai_member_version"],
      ["AiCapabilityToggle", "ai_capability_toggle"]
    ]) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
      assert.match(schema, new RegExp(`@@map\\("${table}"\\)`));
      assert.match(migration, new RegExp(`create table if not exists ${table} \\(`));
    }

    for (const enumName of [
      "ConfirmationItemKind",
      "ConfirmationItemStatus",
      "DistillRunStatus",
      "DistillFrequency",
      "AiMemberStatus",
      "AiMemberVersionStatus",
      "AiCapabilityKey"
    ]) {
      assert.match(schema, new RegExp(`enum ${enumName} \\{`));
    }
  });

  it("creates scoped SQL constraints, indexes, RLS policies, grants and no delete grants", () => {
    for (const table of m5Tables) {
      assert.match(migration, new RegExp(`\\('${table}'\\)`));
      assert.match(
        migration,
        new RegExp(
          `grant select, insert, update on table ${table} to uzmax_app_runtime`
        )
      );
      assert.match(migration, new RegExp(`revoke all on table ${table} from public`));
      assert.doesNotMatch(
        migration,
        new RegExp(`grant [^;]*delete[^;]* on table ${table} to uzmax_app_runtime`, "i")
      );
    }

    assert.match(migration, /current_setting\(''app\.org_id'', true\)/);
    assert.match(migration, /current_setting\(''app\.tenant_id'', true\)/);
    assert.match(
      migration,
      /execute format\('alter table %I enable row level security'/
    );
    assert.match(
      migration,
      /execute format\('alter table %I force row level security'/
    );
    assert.match(migration, /m5_operations_/);
    assert.match(migration, /_select_scope/);
    assert.match(migration, /_insert_scope/);
    assert.match(migration, /_update_scope/);

    for (const constraintOrIndex of [
      "distill_run_candidate_limit_max",
      "distill_run_counts_non_negative",
      "distill_run_candidate_count_within_limit",
      "distill_health_daily_pass_rate_range",
      "distill_health_daily_counts_non_negative",
      "distill_health_daily_reviewed_counts_within_candidates",
      "ai_member_key_unique",
      "ai_member_active_version_fk",
      "ai_member_version_member_scoped_reference_unique",
      "ai_member_version_eval_gate_fk",
      "ai_member_version_config_version_fk",
      "ai_capability_toggle_member_capability_unique",
      "confirmation_item_target_pair",
      "confirmation_item_candidate_payload_object",
      "confirmation_item_scope_kind_status_idx"
    ]) {
      assert.match(migration, new RegExp(constraintOrIndex));
    }
    assert.match(migration, /foreign key \(active_version_id, id, org_id, tenant_id\)/);
    assert.match(
      migration,
      /references ai_member_version\(id, ai_member_id, org_id, tenant_id\)/
    );
  });

  it("exports constants and pure builders for all six M5 contracts", () => {
    assert.deepEqual(m5.tableNames, {
      aiCapabilityToggle: "ai_capability_toggle",
      aiMember: "ai_member",
      aiMemberVersion: "ai_member_version",
      confirmationItem: "confirmation_item",
      distillHealthDaily: "distill_health_daily",
      distillRun: "distill_run"
    });
    assert.equal(dbIndex.packageName, "@uzmax/db");
    assert.match(dbIndexSource, /M5OperationsContractInput/);
    assert.match(dbIndexSource, /M5OperationsContracts/);
    assert.equal(m5.confirmationItemKinds.conflictCandidate, "conflict_candidate");
    assert.equal(m5.distillFrequencies.weekly, "weekly");
    assert.equal(m5.aiCapabilityKeys.orderRead, "order_read");

    const distillRun = m5.createDistillRunContract({
      candidateCount: 7,
      candidateLimit: 10,
      frequency: "daily",
      id: DISTILL_RUN_UUID,
      metadata: { manifestRef: "manifest://distill/run/1" },
      orgId: ORG_UUID,
      sourceWindowEnd: "2026-06-24T00:00:00.000Z",
      sourceWindowStart: "2026-06-23T00:00:00.000Z",
      status: "queued",
      tenantId: TENANT_UUID,
      truncatedCount: 2
    });
    assert.equal(distillRun.candidateLimit, 10);

    const confirmationItem = m5.createConfirmationItemContract({
      candidatePayload: { candidateRef: "controlled://candidate/kb/1" },
      diffPayload: {
        beforeRef: "controlled://kb/before",
        afterRef: "controlled://kb/after"
      },
      distillRunId: DISTILL_RUN_UUID,
      id: CONFIRMATION_UUID,
      kind: "knowledge_candidate",
      orgId: ORG_UUID,
      sourceRef: "controlled://distill/source/1",
      status: "pending",
      tenantId: TENANT_UUID
    });
    assert.equal(confirmationItem.kind, "knowledge_candidate");

    const health = m5.createDistillHealthDailyContract({
      approvedCount: 3,
      businessDate: "2026-06-24",
      candidateCount: 5,
      discardedCount: 2,
      downshiftReasonRef: "controlled://distill/downshift/1",
      downshifted: true,
      frequency: "weekly",
      id: DISTILL_HEALTH_UUID,
      orgId: ORG_UUID,
      recoveryAuditLogId: AUDIT_UUID,
      sevenDayPassRateBps: 6000,
      tenantId: TENANT_UUID
    });
    assert.equal(health.sevenDayPassRateBps, 6000);

    const aiMember = m5.createAiMemberContract({
      breakerReasonRef: "controlled://breaker/reason/1",
      displayName: "Tutorial AI",
      id: AI_MEMBER_UUID,
      memberKey: "tutorial-ai",
      metadata: { configRef: "controlled://ai/member/config" },
      orgId: ORG_UUID,
      status: "online",
      tenantId: TENANT_UUID
    });
    assert.equal(aiMember.memberKey, "tutorial-ai");

    const version = m5.createAiMemberVersionContract({
      aiMemberId: AI_MEMBER_UUID,
      configVersionId: CONFIG_VERSION_UUID,
      createdByUserId: USER_UUID,
      evalGateId: EVAL_GATE_UUID,
      id: AI_VERSION_UUID,
      orgId: ORG_UUID,
      personaRef: "manifest://ai-member/tutorial/v1",
      status: "draft",
      tenantId: TENANT_UUID,
      version: 1
    });
    assert.equal(version.personaRef, "manifest://ai-member/tutorial/v1");

    const toggle = m5.createAiCapabilityToggleContract({
      aiMemberId: AI_MEMBER_UUID,
      capabilityKey: "vision",
      configVersionId: CONFIG_VERSION_UUID,
      enabled: true,
      id: TOGGLE_UUID,
      orgId: ORG_UUID,
      tenantId: TENANT_UUID,
      updatedAt: "2026-06-24T00:00:00.000Z",
      updatedByUserId: USER_UUID
    });
    assert.equal(toggle.enabled, true);

    assert.throws(
      () => m5.createAiMemberContract({ ...aiMember, orgId: "org-1" }),
      /ai member orgId must be a UUID/
    );
    assert.throws(
      () => m5.createDistillRunContract({ ...distillRun, candidateLimit: 11 }),
      /candidateLimit must be an integer from 0 to 10/
    );
    assert.throws(
      () =>
        m5.createDistillRunContract({
          ...distillRun,
          candidateCount: 11,
          candidateLimit: 10
        }),
      /candidateCount > limit/
    );
    assert.throws(
      () =>
        m5.createDistillHealthDailyContract({
          ...health,
          sevenDayPassRateBps: 10001
        }),
      /sevenDayPassRateBps must be an integer from 0 to 10000/
    );
    assert.throws(
      () =>
        m5.createDistillHealthDailyContract({
          ...health,
          approvedCount: 4,
          candidateCount: 5,
          discardedCount: 2
        }),
      /reviewed counts > candidates/
    );
    assert.throws(
      () => m5.createAiCapabilityToggleContract({ ...toggle, capabilityKey: "sms" }),
      /ai capability key is invalid/
    );
    assert.throws(
      () =>
        m5.createConfirmationItemContract({
          candidatePayload: { raw: "customer text" },
          id: CONFIRMATION_UUID,
          kind: "knowledge_candidate",
          orgId: ORG_UUID,
          sourceRef: "controlled://distill/source/1",
          status: "pending",
          tenantId: TENANT_UUID
        }),
      /candidatePayload\.raw is a forbidden raw payload key/
    );
    assert.throws(
      () =>
        m5.createAiMemberVersionContract({
          ...version,
          personaRef: "You are a helpful support agent"
        }),
      /ai member version personaRef must be a controlled ref/
    );
    assert.throws(
      () => m5.createAiMemberVersionContract({ ...version, prompt: "raw prompt" }),
      /input\.prompt is a forbidden raw payload key/
    );

    for (const unsafeRef of [
      "http://example.test/ref",
      "https://example.test/ref",
      "data:text/plain;base64,SGVsbG8=",
      "blob://local/ref",
      "file:///tmp/ref",
      "prompt://persona/raw",
      "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo1234567890abcd"
    ]) {
      assert.throws(
        () => m5.createAiMemberVersionContract({ ...version, personaRef: unsafeRef }),
        /ai member version personaRef must be a controlled ref/
      );
    }
    assert.equal(
      m5.createAiMemberContract({
        ...aiMember,
        breakerReasonRef: "storage://ai-member/breaker/1"
      }).breakerReasonRef,
      "storage://ai-member/breaker/1"
    );
  });

  it("records M5-01 scope, boundaries and foundation-only acceptance state", () => {
    assert.match(spec, /M5-01 DB Contract Foundation/);
    assert.match(spec, /changed source files <= 12, net source LOC <= 600/);
    assert.match(spec, /packages\/db\/src\/m5-operations-contracts\.ts/);
    assert.match(spec, /Do not write to `\/Users\/atilla\/Documents\/UZMAX智能运营`/);
    assert.match(spec, /No API\/admin\/worker\/runtime\/distill scheduler/);
    assert.match(evidence, /M5-01 DB Contract Foundation Evidence/);
    assert.match(evidence, /No Sensitive Data Statement/);
    assert.match(evidence, /foundation_supported_not_closed/);
    assert.match(evidence, /queued_foundation_only/);
    assert.match(evidence, /does not approve M5, GA-0, production readiness/);
  });
});

const m5Tables = [
  "confirmation_item",
  "distill_run",
  "distill_health_daily",
  "ai_member",
  "ai_member_version",
  "ai_capability_toggle"
];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importTypescriptSource(relativePath) {
  const outputText = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  }).outputText;
  return import(asDataUrl(outputText));
}

function asDataUrl(outputText) {
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

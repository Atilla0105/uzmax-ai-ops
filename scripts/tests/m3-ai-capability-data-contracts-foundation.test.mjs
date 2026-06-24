import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const schema = read("packages/db/prisma/schema.prisma");
const migrationPath = path.join(
  repoRoot,
  "packages/db/migrations/0004_ai_capability_data_contracts_foundation.sql"
);
const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";
const contracts = read("docs/contracts/README.md");
const evals = read("docs/evals/README.md");
const m3Evidence = read("docs/evidence/M3/README.md");
const dbIndex = read("packages/db/src/index.ts");
const db = await importTypescriptSource("packages/db/src/m3-ai-contracts.ts");
const dbIndexModule = await importTypescriptSource("packages/db/src/index.ts");

const ORG_UUID = "11111111-1111-4111-8111-111111111111";
const TENANT_UUID = "22222222-2222-4222-8222-222222222222";
const KB_ENTRY_UUID = "33333333-3333-4333-8333-333333333333";
const KB_STAGE_UUID = "44444444-4444-4444-8444-444444444444";
const QUOTE_UUID = "55555555-5555-4555-8555-555555555555";
const EVAL_CASE_UUID = "66666666-6666-4666-8666-666666666666";
const EVAL_RUN_UUID = "77777777-7777-4777-8777-777777777777";
const EVAL_RESULT_UUID = "88888888-8888-4888-8888-888888888888";
const EVAL_GATE_UUID = "99999999-9999-4999-8999-999999999999";
const LLM_CALL_UUID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("M3-01 AI capability data contracts foundation", () => {
  it("maps minimal M3 Prisma models to the expected SQL tables", () => {
    for (const [model, table] of [
      ["KbRecord", "kb_entry"],
      ["KbStage", "kb_stage"],
      ["MediaAsset", "media_asset"],
      ["QuoteRecord", "quote_record"],
      ["EvalCase", "eval_case"],
      ["EvalRun", "eval_run"],
      ["EvalResult", "eval_result"],
      ["EvalGate", "eval_gate"],
      ["LlmCallLog", "llm_call_log"]
    ]) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
      assert.match(schema, new RegExp(`@@map\\("${table}"\\)`));
    }

    for (const enumName of [
      "M3RecordStatus",
      "QuoteRecordStatus",
      "QuoteSource",
      "EvalCategory",
      "EvalRunStatus",
      "EvalResultStatus",
      "EvalGateStatus",
      "LlmTask",
      "LlmCallStatus"
    ]) {
      assert.match(schema, new RegExp(`enum ${enumName} \\{`));
    }
  });

  it("keeps all M3 tables tenant-scoped, RLS forced, and least-privileged", () => {
    assert.notEqual(migration, "", "missing M3-01 SQL migration");

    const missingScopedTableChecks = m3Tables.filter(
      (table) =>
        !migration.includes(`create table if not exists ${table} (`) ||
        !migration.includes(`${table}_tenant_fk foreign key`) ||
        !migration.includes(
          `grant select, insert, update on table ${table} to uzmax_app_runtime`
        )
    );
    assert.deepEqual(missingScopedTableChecks, []);
    assert.deepEqual(
      m3Tables.filter((table) =>
        new RegExp(
          `grant [^;]*delete[^;]* on table ${table} to uzmax_app_runtime`,
          "i"
        ).test(migration)
      ),
      []
    );
    assertPolicyGeneratedForAllTables();

    for (const scopedFk of [
      "kb_stage_entry_fk",
      "eval_result_run_fk",
      "eval_result_case_fk",
      "eval_gate_last_run_fk",
      "quote_record_conversation_fk",
      "quote_record_config_version_fk"
    ]) {
      assert.match(migration, new RegExp(`constraint ${scopedFk}`));
    }

    assert.match(migration, /tenant_scope_predicate text/);
    assert.match(migration, /current_setting\(''app\.org_id'', true\)/);
    assert.match(migration, /current_setting\(''app\.tenant_id'', true\)/);
    assert.match(migration, /nullif\(current_setting\(''app\.org_id'', true\), ''''\)/);
    assert.match(
      migration,
      /nullif\(current_setting\(''app\.tenant_id'', true\), ''''\)/
    );
    assert.match(
      migration,
      /execute format\('alter table %I enable row level security'/
    );
    assert.match(
      migration,
      /execute format\('alter table %I force row level security'/
    );
    assert.match(migration, /if action_name = 'insert' then/);
    assert.match(migration, /elsif action_name = 'update' then/);
    assert.match(migration, /quote_record_code_source_only/);
    assert.match(migration, /eval_run_category_quotas_object/);
    assert.match(
      schema,
      /model EvalGate \{[\s\S]*createdAt\s+DateTime[\s\S]*@map\("created_at"\)/
    );
    assert.match(
      migration,
      /create table if not exists eval_gate \([\s\S]*created_at timestamptz not null default now\(\)/
    );
    assertNoRawPromptCompletionColumns();
  });

  it("exports M3 table names, statuses, categories, and pure builders", () => {
    assert.match(dbIndex, /m3-ai-contracts/);
    assert.deepEqual(db.m3AiTableNames, {
      evalCase: "eval_case",
      evalGate: "eval_gate",
      evalResult: "eval_result",
      evalRun: "eval_run",
      kbEntry: "kb_entry",
      kbStage: "kb_stage",
      llmCallLog: "llm_call_log",
      mediaAsset: "media_asset",
      quoteRecord: "quote_record"
    });
    assert.deepEqual(dbIndexModule.m3AiTableNames, db.m3AiTableNames);
    assert.equal(db.evalCategories.redlineAttack, "redline_attack");
    assert.equal(db.evalGateStatuses.blocked, "blocked");
    assert.equal(db.llmTasks.kbAnswer, "kb_answer");
    assert.equal(db.quoteSources.code, "code");

    const kbEntry = db.createKbEntryContract({
      category: "tutorial",
      contentHash: "sha256:kb",
      entryKey: "tutorial.start",
      id: KB_ENTRY_UUID,
      orgId: ORG_UUID,
      sourceRef: "controlled://kb/tutorial.start",
      status: "draft",
      tenantId: TENANT_UUID,
      title: "Start tutorial",
      version: 1
    });
    assert.equal(kbEntry.entryKey, "tutorial.start");

    const kbStage = db.createKbStageContract({
      id: KB_STAGE_UUID,
      kbEntryId: KB_ENTRY_UUID,
      materialRefs: { refs: ["controlled://asset/1"] },
      orgId: ORG_UUID,
      sequence: 1,
      stageKey: "stage-1",
      status: "active",
      tenantId: TENANT_UUID,
      title: "Stage 1"
    });
    assert.equal(kbStage.sequence, 1);

    const quote = db.createQuoteRecordContract({
      configVersionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      id: QUOTE_UUID,
      inputRef: { ref: "structured-params-only" },
      orgId: ORG_UUID,
      result: { totalMinorUnits: 1200 },
      source: "code",
      status: "created",
      tenantId: TENANT_UUID
    });
    assert.equal(quote.source, "code");
    assert.equal(dbIndexModule.createQuoteRecordContract({ ...quote }).source, "code");

    const evalCase = db.createEvalCaseContract({
      caseRef: "controlled://eval/case-1",
      category: "quote",
      id: EVAL_CASE_UUID,
      orgId: ORG_UUID,
      quotaWeight: 1,
      redactedPayload: { shape: "redacted" },
      status: "active",
      tenantId: TENANT_UUID,
      version: 1
    });
    const evalRun = db.createEvalRunContract({
      categoryQuotas: { quote: 20 },
      gateKey: "pricing-release",
      id: EVAL_RUN_UUID,
      orgId: ORG_UUID,
      status: "queued",
      tenantId: TENANT_UUID
    });
    const evalResult = db.createEvalResultContract({
      category: evalCase.category,
      evalCaseId: EVAL_CASE_UUID,
      evalRunId: EVAL_RUN_UUID,
      id: EVAL_RESULT_UUID,
      orgId: ORG_UUID,
      status: "passed",
      tenantId: TENANT_UUID
    });
    const evalGate = db.createEvalGateContract({
      categoryQuotas: { quote: 20 },
      gateKey: "pricing-release",
      id: EVAL_GATE_UUID,
      orgId: ORG_UUID,
      status: "pending",
      targetKind: "model_route",
      targetRef: "route:pricing:v1",
      tenantId: TENANT_UUID
    });
    assert.equal(evalRun.categoryQuotas.quote, 20);
    assert.equal(evalResult.status, "passed");
    assert.equal(evalGate.status, "pending");

    const llmCall = db.createLlmCallLogContract({
      costMicros: 1200,
      id: LLM_CALL_UUID,
      inputTokenCount: 10,
      latencyMs: 123,
      modelId: "model-a",
      orgId: ORG_UUID,
      outputTokenCount: 20,
      providerId: "provider-a",
      routeRef: "route:kb",
      routeVersion: "v1",
      status: "succeeded",
      task: "kb_answer",
      tenantId: TENANT_UUID,
      totalTokenCount: 30,
      traceId: "trace-1"
    });
    assert.equal(llmCall.totalTokenCount, 30);

    assert.throws(
      () => db.createKbEntryContract({ ...kbEntry, orgId: "org-1" }),
      /kb entry orgId must be a UUID/
    );
    assert.throws(
      () => db.createQuoteRecordContract({ ...quote, source: "llm" }),
      /quote source is invalid/
    );
    assert.throws(
      () => db.createQuoteRecordContract(withoutQuoteProvenance(quote)),
      /quote config provenance requires configVersionId or configVersionRef/
    );
    assert.throws(
      () => dbIndexModule.createQuoteRecordContract(withoutQuoteProvenance(quote)),
      /quote config provenance requires configVersionId or configVersionRef/
    );
    assert.throws(
      () => db.createEvalRunContract({ ...evalRun, categoryQuotas: [] }),
      /eval categoryQuotas must be an object/
    );
    assert.throws(
      () => db.createLlmCallLogContract({ ...llmCall, inputTokenCount: -1 }),
      /inputTokenCount must be an integer from 0/
    );
  });

  it("documents M3 contracts and eval persistence boundaries without raw samples", () => {
    assert.match(contracts, /M3 AI Capability Data Contracts Foundation/);
    assert.match(contracts, /M3-01-ai-capability-data-contracts-foundation/);
    assert.match(contracts, /no production, GA-0, real customer traffic, customer LLM/);
    assert.match(contracts, /LLM call log must not store raw prompt or raw completion/);
    assert.match(contracts, /quote source of truth is code/);

    assert.match(evals, /M3 Eval Persistence Boundary/);
    assert.match(evals, /eval_case/);
    assert.match(evals, /eval_run/);
    assert.match(evals, /eval_result/);
    assert.match(evals, /eval_gate/);
    assert.match(evals, /No raw sample content in git/);

    assert.match(m3Evidence, /M3-01-ai-capability-data-contracts-foundation/);
    assert.match(m3Evidence, /owner-input blockers/);
  });

  it("does not introduce Business, order connector, distill, or M4 customer tables in the M3 migration", () => {
    for (const forbidden of [
      /model BusinessConnection/,
      /model CustomerAsset/,
      /model OrderConnector/,
      /model KbCandidate/,
      /model Distill/,
      /create table if not exists business_connection/,
      /create table if not exists customer_asset/,
      /create table if not exists order_connector/,
      /create table if not exists kb_candidate/,
      /create table if not exists distill/i
    ]) {
      assert.doesNotMatch(migration, forbidden);
    }

    for (const m3ForbiddenTable of [
      /create table if not exists customer\b/,
      /create table if not exists customer_identity/,
      /create table if not exists custom_field_definition/,
      /create table if not exists customer_field_value/,
      /create table if not exists tag_definition/,
      /create table if not exists tag_assignment/,
      /create table if not exists order_snapshot/,
      /create table if not exists import_job/,
      /create table if not exists import_row_error/,
      /create table if not exists order_query_log/
    ]) {
      assert.doesNotMatch(migration, m3ForbiddenTable);
    }
  });
});

const m3Tables = [
  "kb_entry",
  "kb_stage",
  "media_asset",
  "quote_record",
  "eval_case",
  "eval_run",
  "eval_result",
  "eval_gate",
  "llm_call_log"
];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function assertPolicyGeneratedForAllTables() {
  for (const table of m3Tables) assert.match(migration, new RegExp(`'${table}'`));
  for (const action of ["select", "insert", "update"]) {
    assert.match(migration, new RegExp(`'${action}'`));
  }
  assert.match(
    migration,
    /'m3_ai_%s_%s_tenant_scope'[\s\S]*table_name[\s\S]*action_name/
  );
  assert.match(migration, /'create policy %I on %I for %s to uzmax_app_runtime %s'/);
}

function assertNoRawPromptCompletionColumns() {
  const forbiddenSql =
    /\b(?:raw_prompt|prompt_text|prompt_body|prompt_content|raw_completion|completion_text|completion_body|completion_content)\b/i;
  const forbiddenPrisma =
    /\b(?:rawPrompt|promptText|promptBody|promptContent|rawCompletion|completionText|completionBody|completionContent)\b/;

  assert.doesNotMatch(schema, forbiddenPrisma);
  assert.doesNotMatch(migration, forbiddenSql);
  assert.doesNotMatch(migration, /llm_call_log_no_raw_prompt_completion/);
}

function withoutQuoteProvenance(quote) {
  const copy = { ...quote };
  delete copy.configVersionId;
  delete copy.configVersionRef;
  return copy;
}

async function importTypescriptSource(relativePath) {
  const source =
    relativePath === "packages/db/src/index.ts"
      ? read(relativePath).replaceAll(
          'from "./m5-operations-contracts"',
          `from "${asDataUrl(transpileTypescript("packages/db/src/m5-operations-contracts.ts"))}"`
        )
      : read(relativePath);
  const outputText = transpileTypescript(relativePath, source);
  return import(asDataUrl(outputText));
}

function transpileTypescript(relativePath, source = read(relativePath)) {
  const outputText = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  }).outputText;
  return outputText;
}

function asDataUrl(outputText) {
  const encoded = Buffer.from(outputText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "node:test";

import { compileApiRuntime } from "../../apps/api/scripts/runtime-compiler.mjs";
import { runM5rTemplateCopyTrueDbSmoke } from "../../packages/db/scripts/run-m5r-template-copy-true-db-smoke.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111506";
const TENANT_ID = "22222222-2222-4222-8222-222222222506";
const USER_ID = "44444444-4444-4444-8444-444444444506";
const runtime = await importTemplateCopyRuntime();
const source = {
  appModule: read("apps/api/src/app.module.ts"),
  compiler: read("apps/api/scripts/runtime-compiler.mjs"),
  contracts: read("apps/api/src/template-copy-runtime.contracts.ts"),
  evidence: read("docs/evidence/M5R/M5R-06-template-copy-runtime.md"),
  m5rIndex: read("docs/evidence/M5R/README.md"),
  opsAssets: read("packages/ops-assets/src/index.ts"),
  repository: read("apps/api/src/template-copy-runtime.repository.ts"),
  schema: read("packages/db/prisma/schema.prisma"),
  smoke: read("packages/db/scripts/tests/run-m5r-template-copy-true-db-smoke.mjs"),
  spec: read("docs/specs/M5R-06-template-copy-runtime.md")
};

describe("M5R-06 template copy runtime", () => {
  it("wires disabled-by-default API runtime and rejects non-RLS mode", async () => {
    assert.match(source.appModule, /TemplateCopyRuntimeController/);
    assert.match(source.compiler, /importApiTemplateCopyRuntimeModules/);
    assert.match(source.repository, /createRlsTransactionContext/);
    assert.match(
      source.contracts,
      /template copy runtime env must use RLS Prisma gateway/
    );

    const disabled = runtime.createTemplateCopyRuntimeRepositoryProviderFromEnv({
      env: {}
    });
    await assert.rejects(
      () => disabled.copyToTenant(context(), validInput()),
      /not configured/
    );
    assert.throws(
      () =>
        runtime.createTemplateCopyRuntimeRepositoryProviderFromEnv({
          env: { UZMAX_TEMPLATE_COPY_RUNTIME_MODE: "rls_prisma_gateway" }
        }),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    assert.throws(
      () =>
        runtime.createTemplateCopyRuntimeRepositoryProviderFromEnv({
          env: { UZMAX_TEMPLATE_COPY_RUNTIME_MODE: "prisma_gateway" }
        }),
      /must use RLS Prisma gateway/
    );
  });

  it("creates a draft tenant-owned template_copy config version and audit row", async () => {
    const fake = fakePrisma();
    const repository = runtime.createTemplateCopyRuntimeRepositoryProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient: fake
    });

    const result = await repository.copyToTenant(context(), validInput());
    assert.equal(result.status, "draft");
    assert.equal(result.templateKind, "quick_reply");
    assert.equal(result.version, 1);
    assert.equal(
      result.copiedPayload.sourceSnapshotRef,
      validInput().sourceSnapshotRef
    );
    assert.equal(result.copiedPayload.formalTenantWrite, false);
    assert.equal(result.copiedPayload.templateAutoOverwrite, false);
    assert.equal(fake.configs[0].domain, "TEMPLATE_COPY");
    assert.equal(fake.configs[0].status, "DRAFT");
    assert.equal(fake.configs[0].activatedAt, undefined);
    assert.equal(fake.audits[0].eventType, "template_copy.copied");
    assert.equal(fake.audits[0].content.after.templateKind, "quick_reply");
    assert.deepEqual(fake.transactions.at(-1).slice(0, 3), [
      { kind: "role", sql: 'set local role "uzmax_app_runtime"' },
      { key: "app.org_id", kind: "set_config", value: ORG_ID },
      { key: "app.tenant_id", kind: "set_config", value: TENANT_ID }
    ]);
  });

  it("validates supported template kinds and rejects unsafe refs or raw fields", () => {
    for (const templateKind of ["ai_member", "config", "eval", "quick_reply"]) {
      assert.equal(
        runtime.copyInput({ ...validInput(), templateKind }).templateKind,
        templateKind
      );
    }
    assert.throws(
      () => runtime.copyInput({ ...validInput(), templateKind: "knowledge" }),
      /unsupported/
    );
    assert.throws(
      () =>
        runtime.copyInput({
          ...validInput(),
          rawPrompt: "do not persist"
        }),
      /forbidden/
    );
    assert.throws(
      () =>
        runtime.copyInput({
          ...validInput(),
          sourceTemplateRef: "https://example.invalid/template"
        }),
      /controlled ref/
    );
    assert.throws(
      () =>
        runtime.copyInput({
          ...validInput(),
          orderRef: "controlled://order/not-allowed"
        }),
      /forbidden/
    );
  });

  it("documents no schema or ops-assets expansion and true DB smoke boundaries", async () => {
    assert.match(source.schema, /TEMPLATE_COPY\s+@map\("template_copy"\)/);
    assert.doesNotMatch(source.schema, /model QuickReplyTemplate/);
    assert.equal(
      source.opsAssets.trim(),
      'export const packageName = "@uzmax/ops-assets";'
    );
    assert.match(source.smoke, /same-tenant|wrong-tenant|missing-context/s);

    const previous = process.env.UZMAX_RLS_DATABASE_URL;
    delete process.env.UZMAX_RLS_DATABASE_URL;
    await assert.rejects(
      () => runM5rTemplateCopyTrueDbSmoke(),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    restoreEnv("UZMAX_RLS_DATABASE_URL", previous);
  });

  it("records status, sensitive-data boundary and non-closures", () => {
    assert.match(
      `${source.spec}\n${source.evidence}\n${source.m5rIndex}`,
      /(?=.*M5R-06 Template Copy Runtime)(?=.*No Sensitive Data Statement)(?=.*quick_reply_template_copy_path_supported_not_full_quick_reply_closed)(?=.*active)/s
    );
    assert.doesNotMatch(source.spec, /owner accepted\s*[:=]\s*true/i);
    assert.doesNotMatch(source.spec, /production readiness\s*[:=]\s*true/i);
  });
});

async function importTemplateCopyRuntime() {
  const outDir = await compileApiRuntime({
    outDir: path.join(process.cwd(), "node_modules/.cache/uzmax-api-runtime-m5r-06")
  });
  const [contracts, api] = await Promise.all([
    import(
      `${pathToFileURL(path.join(outDir, "template-copy-runtime.contracts.mjs")).href}`
    ),
    import(`${pathToFileURL(path.join(outDir, "template-copy-runtime.mjs")).href}`)
  ]);
  return { ...contracts, ...api };
}

function fakePrisma() {
  const fake = { audits: [], configs: [], transactions: [] };
  fake.configVersion = {
    create: async ({ data }) => {
      const row = { ...data, id: data.id, version: data.version };
      fake.configs.push(row);
      return row;
    },
    findFirst: async () => undefined
  };
  fake.auditLog = {
    create: async ({ data }) => {
      fake.audits.push(data);
      return data;
    }
  };
  fake.$executeRawUnsafe = async (sql) => ({ kind: "role", sql });
  fake.$queryRaw = async (_strings, key, value) => ({ key, kind: "set_config", value });
  fake.$transaction = async (steps) => rememberTransaction(fake, steps);
  return fake;
}

async function rememberTransaction(fake, steps) {
  const completed = [];
  for (const pending of steps) completed.push(await pending);
  fake.transactions.push(completed);
  return completed;
}

function validInput() {
  return {
    controlRefs: ["controlled://template-copy/m5r-06/approval"],
    reasonRef: "controlled://template-copy/m5r-06/reason",
    sourceSnapshotRef: "controlled://group-template/quick_reply/m5r-06/v1",
    sourceTemplateRef: "controlled://group-template/quick_reply/m5r-06",
    sourceUpdatedRef: "controlled://group-template/quick_reply/m5r-06/updated",
    targetKey: "m5r-06-quick-reply-copy",
    templateKind: "quick_reply",
    traceId: "m5r-06:test"
  };
}

function context() {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["template:write"],
    selectedTenantId: TENANT_ID,
    tenantIds: [TENANT_ID],
    userId: USER_ID
  };
}

function read(file) {
  return readFileSync(file, "utf8");
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const USER_A = "44444444-4444-4444-8444-444444444444";
const compilerOptions = {
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2023
};
const repositorySource = read("apps/api/src/order-import.repository.ts");
const appModule = read("apps/api/src/app.module.ts");
const spec = read("docs/specs/M4-25-order-import-rls-transaction-gateway-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-25-order-import-rls-transaction-gateway-contract.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const db = await importTypescriptSource("packages/db/src/index.ts");
const defaults = await importTypescriptSource("apps/api/src/order-import.defaults.ts");
const repository = await importTypescriptSource(
  "apps/api/src/order-import.repository.ts",
  {
    "../../../packages/db/src/index.ts": db.moduleUrl,
    "./order-import.defaults.ts": defaults.moduleUrl
  }
);

describe("M4-25 order import RLS transaction gateway contract", () => {
  it("runs Prisma delegate access through an ADR-001 RLS transaction context", async () => {
    const transactions = [];
    const delegateCalls = [];
    const gateway = new repository.module.RlsOrderImportPersistenceGateway(
      async (input) => {
        transactions.push({
          context: input.context,
          scope: input.scope
        });
        return input.query(prismaStub(delegateCalls));
      }
    );

    const jobs = await gateway.listImportJobs(scopeFor(TENANT_A));
    const job = await gateway.getImportJob(scopeFor(TENANT_A), "job-a");
    const rowErrors = await gateway.listImportRowErrors(scopeFor(TENANT_A), "job-a");
    const snapshot = await gateway.findOrderSnapshot(scopeFor(TENANT_A), {
      queryKind: "order_ref",
      queryRef: "controlled://order/ref-a"
    });

    assert.deepEqual(
      transactions.map((transaction) => transaction.context),
      Array.from({ length: 4 }, () => rlsContextFor(TENANT_A))
    );
    assert.deepEqual(
      transactions.map((transaction) => transaction.scope),
      Array.from({ length: 4 }, () => scopeFor(TENANT_A))
    );
    assert.deepEqual(delegateCalls, [
      {
        args: {
          orderBy: { createdAt: "desc" },
          take: 50,
          where: scopeFor(TENANT_A)
        },
        delegate: "importJob.findMany"
      },
      {
        args: { where: { ...scopeFor(TENANT_A), id: "job-a" } },
        delegate: "importJob.findFirst"
      },
      {
        args: {
          orderBy: [{ rowNumber: "asc" }, { createdAt: "asc" }],
          take: 500,
          where: { ...scopeFor(TENANT_A), importJobId: "job-a" }
        },
        delegate: "importRowError.findMany"
      },
      {
        args: {
          orderBy: { sourceUpdatedAt: "desc" },
          where: {
            externalOrderRef: "controlled://order/ref-a",
            orgId: ORG_ID,
            status: "ACTIVE",
            tenantId: TENANT_A
          }
        },
        delegate: "orderSnapshot.findFirst"
      }
    ]);
    assert.equal(jobs[0].id, "job-a");
    assert.equal(job.id, "job-a");
    assert.equal(rowErrors[0].importJobId, "job-a");
    assert.equal(snapshot.externalOrderRef, "controlled://order/ref-a");
  });

  it("fails closed before the transaction runner when scope is incomplete", () => {
    let runnerCalled = false;
    const gateway = new repository.module.RlsOrderImportPersistenceGateway(() => {
      runnerCalled = true;
      return [];
    });

    assert.throws(
      () => gateway.listImportJobs({ orgId: "", tenantId: TENANT_A }),
      /RLS tenant context requires orgId and tenantId/
    );
    assert.throws(
      () => gateway.listImportJobs({ orgId: ORG_ID, tenantId: " " }),
      /RLS tenant context requires orgId and tenantId/
    );
    assert.equal(runnerCalled, false);
  });

  it("keeps RLS Prisma provider explicit and fail-closed", async () => {
    let runnerCalls = 0;
    const provider = repository.module.createOrderImportRepositoryProvider({
      mode: repository.module.orderImportRepositoryRuntimeModes.rlsPrismaGateway,
      rlsTransactionRunner: (input) => {
        runnerCalls += 1;
        return input.query(prismaStub());
      }
    });
    const defaultProvider = repository.module.createOrderImportRepositoryProvider();

    assert.ok(
      defaultProvider instanceof repository.module.InMemoryOrderImportRepository
    );
    await provider.listJobs(contextFor(TENANT_A));
    assert.equal(runnerCalls, 1);
    assert.throws(
      () =>
        repository.module.createOrderImportRepositoryProvider({
          mode: repository.module.orderImportRepositoryRuntimeModes.rlsPrismaGateway
        }),
      /order import RLS transaction runner is required/
    );
    assert.throws(
      () =>
        repository.module.createOrderImportRepositoryProvider({
          mode: repository.module.orderImportRepositoryRuntimeModes.rlsPrismaGateway,
          rlsTransactionRunner: { run: async () => undefined }
        }),
      /order import RLS transaction runner is required/
    );
  });

  it("anchors the contract without default DB runtime side effects", () => {
    assert.match(repositorySource, /createRlsTransactionContext/);
    assert.match(repositorySource, /RlsOrderImportPersistenceGateway/);
    assert.match(repositorySource, /ORDER_IMPORT_RLS_TRANSACTION_RUNNER/);
    assert.match(repositorySource, /rls_prisma_gateway/);
    assert.match(appModule, /RlsOrderImportPersistenceGateway/);
    assert.match(appModule, /ORDER_IMPORT_RLS_TRANSACTION_RUNNER/);
    assert.match(appModule, /orderImportRepositoryRuntimeModes\.inMemory/);
    assert.doesNotMatch(
      appModule,
      /useClass: RlsOrderImportPersistenceGateway|useExisting: RlsOrderImportPersistenceGateway/
    );
    assert.doesNotMatch(
      `${repositorySource}\n${appModule}`,
      /@prisma\/client|new PrismaClient|process\.env|order_connector|fetch\(|https?:\/\//i
    );
  });

  it("records M4-25 scope without closing production runtime blockers", () => {
    assert.match(spec, /RLS transaction gateway contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-25 order import RLS transaction gateway contract/);
    assert.match(m4Index, /RLS transaction gateway contract/);
    assert.match(m4Index, /real DB runtime/);
    assert.match(m4Index, /real BullMQ\/Redis runtime/);
  });
});

function contextFor(selectedTenantId) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["order:read"],
    selectedTenantId,
    tenantIds: [selectedTenantId],
    userId: USER_A
  };
}

function scopeFor(tenantId) {
  return {
    orgId: ORG_ID,
    tenantId
  };
}

function rlsContextFor(tenantId) {
  return {
    roleSql: 'set local role "uzmax_app_runtime"',
    settings: [
      { key: "app.org_id", value: ORG_ID },
      { key: "app.tenant_id", value: tenantId }
    ]
  };
}

function prismaStub(calls = []) {
  return {
    importJob: {
      async findFirst(args) {
        calls.push({ args, delegate: "importJob.findFirst" });
        return jobRow("job-a", TENANT_A);
      },
      async findMany(args) {
        calls.push({ args, delegate: "importJob.findMany" });
        return [jobRow("job-a", TENANT_A)];
      }
    },
    importRowError: {
      async findMany(args) {
        calls.push({ args, delegate: "importRowError.findMany" });
        return [rowErrorRow("row-error-a", "job-a", TENANT_A)];
      }
    },
    orderSnapshot: {
      async findFirst(args) {
        calls.push({ args, delegate: "orderSnapshot.findFirst" });
        return snapshotRow(TENANT_A);
      }
    }
  };
}

function jobRow(id, tenantId) {
  return {
    failedRows: 1,
    fileRef: `storage://order-imports/${id}`,
    id,
    orgId: ORG_ID,
    status: "completed_with_errors",
    successfulRows: 2,
    tenantId,
    totalRows: 3
  };
}

function rowErrorRow(id, importJobId, tenantId) {
  return {
    columnKey: "orderStatusRef",
    errorCode: "order_status_ref_required",
    id,
    importJobId,
    messageRef: "reason://order-import/order-status-ref-required",
    orgId: ORG_ID,
    rowNumber: 3,
    tenantId
  };
}

function snapshotRow(tenantId) {
  return {
    expiresAt: "2026-06-23T00:00:00.000Z",
    externalOrderRef: "controlled://order/ref-a",
    id: "55555555-5555-4555-8555-555555555555",
    orderStatusRef: "status://order/in-transit",
    orgId: ORG_ID,
    payloadSummary: { statusRef: "status://order/in-transit" },
    sourceKind: "import_snapshot",
    sourceRef: "storage://order-imports/snapshot-a",
    sourceUpdatedAt: "2026-06-22T00:00:00.000Z",
    status: "active",
    tenantId
  };
}

async function importTypescriptSource(relativePath, replacements = {}) {
  const sourceText = rewriteModuleImports(read(relativePath), replacements);
  const outputText = ts.transpileModule(sourceText, {
    compilerOptions,
    fileName: relativePath
  }).outputText;
  const moduleUrl = inlineModuleUrl(outputText);
  return { module: await import(moduleUrl), moduleUrl };
}

function rewriteModuleImports(sourceText, replacements) {
  let updatedSource = sourceText;
  for (const [from, to] of Object.entries(replacements)) {
    updatedSource = updatedSource.replaceAll(from, to);
  }
  return updatedSource;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function inlineModuleUrl(sourceText) {
  const payload = Buffer.from(sourceText, "utf8").toString("base64");
  return `data:text/javascript;base64,${payload}`;
}

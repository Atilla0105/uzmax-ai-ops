import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const BUSINESS_RESULT = [{ id: "job-a" }];
const runnerSource = read("apps/api/src/order-import.rls-runner.ts");
const persistenceGatewaySource = read(
  "apps/api/src/order-import.persistence-gateway.ts"
);
const repositorySource = read("apps/api/src/order-import.repository.ts");
const orderImportBarrel = read("apps/api/src/order-import.ts");
const appModule = read("apps/api/src/app.module.ts");
const runtimeCompiler = read("apps/api/scripts/runtime-compiler.mjs");
const spec = read("docs/specs/M4-26-order-import-rls-batch-runner-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-26-order-import-rls-batch-runner-contract.md"
);
const incident = read("docs/incidents/INC-2026-06-23-m4-26-root-write-boundary.md");
const m4Index = read("docs/evidence/M4/README.md");
const db = await importTypescriptSource("packages/db/src/index.ts");
const defaults = await importTypescriptSource("apps/api/src/order-import.defaults.ts");
const persistenceGateway = await importTypescriptSource(
  "apps/api/src/order-import.persistence-gateway.ts",
  {
    "../../../packages/db/src/index.ts": db.moduleUrl
  }
);
const repository = await importTypescriptSource(
  "apps/api/src/order-import.repository.ts",
  {
    "../../../packages/db/src/index.ts": db.moduleUrl,
    "./order-import.defaults.ts": defaults.moduleUrl,
    "./order-import.persistence-gateway.ts": persistenceGateway.moduleUrl
  }
);
const runner = await importTypescriptSource("apps/api/src/order-import.rls-runner.ts");

describe("M4-26 order import RLS batch runner contract", () => {
  it("runs role, context settings and business query in one batch transaction", async () => {
    const transactionCalls = [];
    const prisma = prismaStub(transactionCalls);
    const run = runner.module.createOrderImportRlsBatchTransactionRunner(prisma);

    const result = await run({
      context: rlsContext(),
      query: (client) =>
        client.importJob.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          where: { orgId: ORG_ID, tenantId: TENANT_ID }
        }),
      scope: { orgId: ORG_ID, tenantId: TENANT_ID }
    });

    assert.deepEqual(result, BUSINESS_RESULT);
    assert.equal(transactionCalls.length, 1);
    assert.deepEqual(
      transactionCalls[0].map((operation) => operation.kind),
      ["role", "set_config", "set_config", "business"]
    );
    assert.deepEqual(transactionCalls[0][0], {
      kind: "role",
      result: "role-ok",
      sql: 'set local role "uzmax_app_runtime"'
    });
    assert.deepEqual(transactionCalls[0][1], {
      key: "app.org_id",
      kind: "set_config",
      result: "app.org_id-ok",
      value: ORG_ID
    });
    assert.deepEqual(transactionCalls[0][2], {
      key: "app.tenant_id",
      kind: "set_config",
      result: "app.tenant_id-ok",
      value: TENANT_ID
    });
    assert.deepEqual(transactionCalls[0][3], {
      args: {
        orderBy: { createdAt: "desc" },
        take: 50,
        where: { orgId: ORG_ID, tenantId: TENANT_ID }
      },
      delegate: "importJob.findMany",
      kind: "business",
      result: BUSINESS_RESULT
    });
  });

  it("runs RLS gateway raw operations in the batch and maps after transaction", async () => {
    const transactionCalls = [];
    const run = runner.module.createOrderImportRlsBatchTransactionRunner(
      prismaStub(transactionCalls)
    );
    const gateway = new repository.module.RlsOrderImportPersistenceGateway(run);

    const job = await gateway.getImportJob(scope(), "job-a");
    const snapshot = await gateway.findOrderSnapshot(scope(), {
      queryKind: "order_ref",
      queryRef: "controlled://order/ref-a"
    });

    assert.equal(job.id, "job-a");
    assert.equal(snapshot.externalOrderRef, "controlled://order/ref-a");
    assert.deepEqual(
      transactionCalls.map((operations) =>
        operations.map((operation) => operation.kind)
      ),
      [
        ["role", "set_config", "set_config", "business"],
        ["role", "set_config", "set_config", "business"]
      ]
    );
    assert.deepEqual(
      transactionCalls.map((operations) => operations.at(-1).delegate),
      ["importJob.findFirst", "orderSnapshot.findFirst"]
    );
  });

  it("fails closed before transaction for malformed client, context or query", async () => {
    assert.throws(
      () =>
        runner.module.createOrderImportRlsBatchTransactionRunner({
          ...prismaStub([]),
          $transaction: undefined
        }),
      /requires \$transaction/
    );

    const transactionCalls = [];
    const run = runner.module.createOrderImportRlsBatchTransactionRunner(
      prismaStub(transactionCalls)
    );
    await assert.rejects(
      () =>
        run({ context: { roleSql: " ", settings: [] }, query: () => ({}), scope: {} }),
      /role SQL must use safe set local role/
    );
    await assert.rejects(
      () =>
        run({
          context: {
            roleSql: "select 1",
            settings: [
              { key: "app.org_id", value: ORG_ID },
              { key: "app.tenant_id", value: TENANT_ID }
            ]
          },
          query: () => ({}),
          scope: {}
        }),
      /role SQL must use safe set local role/
    );
    await assert.rejects(
      () =>
        run({
          context: {
            roleSql: 'set local role "uzmax_app_runtime"',
            settings: [{ key: "app.org_id", value: ORG_ID }]
          },
          query: () => ({}),
          scope: {}
        }),
      /app.tenant_id setting is required/
    );
    await assert.rejects(
      () => run({ context: rlsContext(), query: () => undefined, scope: {} }),
      /query operation is required/
    );
    assert.deepEqual(transactionCalls, []);
  });

  it("anchors the runner without default DB runtime side effects", () => {
    assert.match(repositorySource, /export type OrderImportRlsTransactionInput/);
    assert.match(persistenceGatewaySource, /mapResult/);
    assert.match(persistenceGatewaySource, /getImportJobOperation/);
    assert.match(orderImportBarrel, /order-import\.rls-runner/);
    assert.match(appModule, /createOrderImportRlsBatchTransactionRunner/);
    assert.match(appModule, /rlsBatchRunnerFactory/);
    assert.match(appModule, /orderImportRepositoryRuntimeModes\.inMemory/);
    assert.match(runtimeCompiler, /order-import\.rls-runner\.mjs/);
    assert.doesNotMatch(
      appModule,
      /useClass: createOrderImportRlsBatchTransactionRunner|useExisting: createOrderImportRlsBatchTransactionRunner/
    );
    assert.doesNotMatch(
      `${runnerSource}\n${persistenceGatewaySource}\n${appModule}`,
      /@prisma\/client|new PrismaClient|process\.env|order_connector|BullMQ|Redis|fetch\(|https?:\/\//i
    );
  });

  it("records M4-26 and the boundary incident without closing runtime blockers", () => {
    assert.match(spec, /RLS Batch Runner Contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(incident, /root\/main checkout/);
    assert.match(m4Index, /M4-26 order import RLS batch runner contract/);
    assert.match(m4Index, /production RLS batch runner integration/);
    assert.match(m4Index, /real BullMQ\/Redis runtime/);
  });
});

function prismaStub(transactionCalls) {
  return {
    $executeRawUnsafe(sql) {
      return { kind: "role", result: "role-ok", sql };
    },
    $queryRaw(strings, key, value) {
      assert.equal(strings.join("?"), "select set_config(?, ?, true)");
      return { key, kind: "set_config", result: `${key}-ok`, value };
    },
    async $transaction(operations) {
      transactionCalls.push(operations);
      return operations.map((operation) => operation.result);
    },
    importJob: {
      findFirst: businessOperation("importJob.findFirst", jobRow()),
      findMany: businessOperation("importJob.findMany", BUSINESS_RESULT)
    },
    importRowError: {
      findMany: businessOperation("importRowError.findMany", [])
    },
    orderSnapshot: {
      findFirst: businessOperation("orderSnapshot.findFirst", snapshotRow())
    }
  };
}

function businessOperation(delegate, result) {
  return (args) => ({
    args,
    delegate,
    kind: "business",
    result
  });
}

function rlsContext() {
  return {
    roleSql: 'set local role "uzmax_app_runtime"',
    settings: [
      { key: "app.org_id", value: ORG_ID },
      { key: "app.tenant_id", value: TENANT_ID }
    ]
  };
}

function scope() {
  return { orgId: ORG_ID, tenantId: TENANT_ID };
}

function jobRow() {
  return {
    failedRows: 1,
    fileRef: "storage://order-imports/job-a",
    id: "job-a",
    orgId: ORG_ID,
    status: "completed_with_errors",
    successfulRows: 2,
    tenantId: TENANT_ID,
    totalRows: 3
  };
}

function snapshotRow() {
  return {
    expiresAt: "2026-06-24T00:00:00.000Z",
    externalOrderRef: "controlled://order/ref-a",
    orderStatusRef: "controlled://order/status/in_transit",
    orgId: ORG_ID,
    payloadSummary: { statusRef: "controlled://order/status/in_transit" },
    sourceKind: "import_snapshot",
    sourceRef: "storage://order-imports/job-a",
    sourceUpdatedAt: "2026-06-23T00:00:00.000Z",
    status: "ACTIVE",
    tenantId: TENANT_ID
  };
}

async function importTypescriptSource(relativePath, replacements = {}) {
  let compiled = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  }).outputText;
  for (const [from, to] of Object.entries(replacements)) {
    compiled = compiled.replaceAll(`from "${from}"`, `from "${to}"`);
  }
  const moduleUrl = inlineModuleUrl(compiled);
  return { module: await import(moduleUrl), moduleUrl };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function inlineModuleUrl(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText, "utf8").toString(
    "base64"
  )}`;
}

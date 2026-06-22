import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_B = "33333333-3333-4333-8333-333333333333";
const USER_A = "44444444-4444-4444-8444-444444444444";
const repositorySource = read("apps/api/src/order-import.repository.ts");
const serviceSource = read("apps/api/src/order-import.service.ts");
const appModule = read("apps/api/src/app.module.ts");
const spec = read("docs/specs/M4-08-order-import-repository-port.md");
const evidence = read("docs/evidence/M4/M4-08-order-import-repository-port.md");
const m411Spec = read("docs/specs/M4-11-order-import-prisma-gateway.md");
const m411Evidence = read("docs/evidence/M4/M4-11-order-import-prisma-gateway.md");
const m4Index = read("docs/evidence/M4/README.md");
const repository = await importOrderImportRepositorySource();
const orderRead = await importTypescriptSource(
  "packages/capabilities/order-read/src/index.ts"
);

describe("M4-08 order import repository port", () => {
  it("injects a repository port while preserving the default in-memory provider", () => {
    assert.match(repositorySource, /ORDER_IMPORT_REPOSITORY/);
    assert.match(repositorySource, /type OrderImportRepositoryPort/);
    assert.match(serviceSource, /@Inject\(ORDER_IMPORT_REPOSITORY\)/);
    assert.match(
      serviceSource,
      /private readonly repository: OrderImportRepositoryPort/
    );
    assert.match(appModule, /provide: ORDER_IMPORT_REPOSITORY/);
    assert.match(appModule, /useExisting: InMemoryOrderImportRepository/);

    const inMemory = new repository.module.InMemoryOrderImportRepository();
    const fresh = inMemory.findSnapshot(contextFor(TENANT_A), {
      queryKind: "order_ref",
      queryRef: "query://order/fresh-a"
    });
    assert.equal(fresh.orderStatusRef, "status://order/in-transit");
  });

  it("maps persistence gateway jobs and row errors inside the selected tenant", async () => {
    const adapter = new repository.module.PersistenceOrderImportRepository({
      findOrderSnapshot() {
        return undefined;
      },
      getImportJob(_scope, jobId) {
        return jobId === "job-a" ? jobRow("job-a", TENANT_A) : undefined;
      },
      listImportJobs() {
        return [jobRow("job-a", TENANT_A), jobRow("job-b", TENANT_B)];
      },
      listImportRowErrors() {
        return [
          rowError("row-a", "job-a", TENANT_A),
          rowError("row-b", "job-a", TENANT_B)
        ];
      }
    });
    const accessContext = contextFor(TENANT_A);

    assert.deepEqual(
      (await adapter.listJobs(accessContext)).map((job) => job.id),
      ["job-a"]
    );
    assert.equal(
      (await adapter.getJob(accessContext, "job-a")).sourceRef,
      "storage://order-imports/job-a"
    );
    assert.deepEqual(
      (await adapter.listRowErrors(accessContext, "job-a")).map((error) => error.id),
      ["row-a"]
    );
  });

  it("passes query scope to the persistence gateway and feeds order-read safely", async () => {
    const calls = [];
    const adapter = new repository.module.PersistenceOrderImportRepository({
      findOrderSnapshot(scope, lookup) {
        calls.push({ lookup, scope });
        return snapshotRow(TENANT_A, lookup.queryRef, "2026-06-23T00:00:00.000Z");
      },
      getImportJob() {
        return undefined;
      },
      listImportJobs() {
        return [];
      },
      listImportRowErrors() {
        return [];
      }
    });
    const accessContext = contextFor(TENANT_A);
    const snapshot = await adapter.findSnapshot(accessContext, {
      queryKind: "order_ref",
      queryRef: "query://order/fresh-a"
    });

    assert.deepEqual(calls, [
      {
        lookup: { queryKind: "order_ref", queryRef: "query://order/fresh-a" },
        scope: { orgId: ORG_ID, tenantId: TENANT_A }
      }
    ]);
    assert.deepEqual(snapshot.queryRefs, ["query://order/fresh-a"]);

    const fresh = orderRead.module.evaluateOrderSnapshotForRead({
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/fresh-a",
      snapshot
    });
    assert.equal(fresh.status, "snapshot_ready");
    assert.equal(fresh.customerVisible.orderStatusRef, "status://order/in-transit");
  });

  it("fails closed for archived or cross-tenant snapshots and stale reads still hand off", async () => {
    const archived = new repository.module.PersistenceOrderImportRepository(
      gatewayWithSnapshot({
        ...snapshotRow(
          TENANT_A,
          "query://order/archived-a",
          "2026-06-23T00:00:00.000Z"
        ),
        status: "archived"
      })
    );
    assert.equal(
      await archived.findSnapshot(contextFor(TENANT_A), {
        queryKind: "order_ref",
        queryRef: "query://order/archived-a"
      }),
      undefined
    );

    const crossTenant = new repository.module.PersistenceOrderImportRepository(
      gatewayWithSnapshot(
        snapshotRow(TENANT_B, "query://order/b", "2026-06-23T00:00:00.000Z")
      )
    );
    assert.equal(
      await crossTenant.findSnapshot(contextFor(TENANT_A), {
        queryKind: "order_ref",
        queryRef: "query://order/b"
      }),
      undefined
    );

    const staleAdapter = new repository.module.PersistenceOrderImportRepository(
      gatewayWithSnapshot(
        snapshotRow(TENANT_A, "query://order/stale-a", "2026-06-21T00:00:00.000Z")
      )
    );
    const stale = orderRead.module.evaluateOrderSnapshotForRead({
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/stale-a",
      snapshot: await staleAdapter.findSnapshot(contextFor(TENANT_A), {
        queryKind: "order_ref",
        queryRef: "query://order/stale-a"
      })
    });
    assert.equal(stale.status, "handoff_required");
    assert.equal(stale.reasonCode, "order_snapshot_stale");
    assert.doesNotMatch(JSON.stringify(stale.customerVisible), /orderStatusRef/);
  });

  it("records M4-08 scope without adding DB client or order connector runtime", () => {
    assert.match(repositorySource, /import type \{ M4OrderImportContractInput \}/);
    assert.match(spec, /repository-port foundation/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-08 order import repository port/);
    assert.match(m4Index, /DB client wiring, worker import/);
    assert.doesNotMatch(
      `${repositorySource}\n${serviceSource}\n${appModule}`,
      /new PrismaClient|process\.env|order_connector|fetch\(|https?:\/\//i
    );
    assert.doesNotMatch(
      repositorySource,
      /raw payload|csv export|xlsx export|phone|address|payment|secret/i
    );
  });
});

describe("M4-11 order import Prisma gateway", () => {
  it("maps async Prisma import jobs through the repository port", async () => {
    const calls = [];
    const prisma = prismaStub({
      importJob: {
        async findMany(args) {
          calls.push({ args, delegate: "importJob.findMany" });
          return [
            {
              ...jobRow("job-a", TENANT_A),
              completedAt: new Date("2026-06-22T12:00:00.000Z"),
              status: "COMPLETED_WITH_ERRORS"
            },
            jobRow("job-b", TENANT_B)
          ];
        }
      }
    });
    const gateway = new repository.module.PrismaOrderImportPersistenceGateway(prisma);
    const adapter = new repository.module.PersistenceOrderImportRepository(gateway);

    const jobs = await adapter.listJobs(contextFor(TENANT_A));

    assert.deepEqual(calls, [
      {
        args: {
          orderBy: { createdAt: "desc" },
          take: 50,
          where: { orgId: ORG_ID, tenantId: TENANT_A }
        },
        delegate: "importJob.findMany"
      }
    ]);
    assert.deepEqual(
      jobs.map((job) => pick(job, ["completedAt", "id", "status"])),
      [
        {
          completedAt: "2026-06-22T12:00:00.000Z",
          id: "job-a",
          status: "completed_with_errors"
        }
      ]
    );
  });

  it("maps scoped snapshot lookup delegates and misses unsupported query kinds", async () => {
    const calls = [];
    const prisma = prismaStub({
      orderSnapshot: {
        async findFirst(args) {
          calls.push({ args, delegate: "orderSnapshot.findFirst" });
          return {
            ...snapshotRow(
              TENANT_A,
              "controlled://order/ref-a",
              "2026-06-23T00:00:00.000Z"
            ),
            expiresAt: new Date("2026-06-23T00:00:00.000Z"),
            sourceUpdatedAt: new Date("2026-06-22T00:00:00.000Z"),
            status: "ACTIVE"
          };
        }
      }
    });
    const gateway = new repository.module.PrismaOrderImportPersistenceGateway(prisma);
    const adapter = new repository.module.PersistenceOrderImportRepository(gateway);

    const snapshot = await adapter.findSnapshot(contextFor(TENANT_A), {
      queryKind: "order_ref",
      queryRef: "controlled://order/ref-a"
    });
    const missing = await gateway.findOrderSnapshot(
      { orgId: ORG_ID, tenantId: TENANT_A },
      { queryKind: "search_ref", queryRef: "query://order/search-a" }
    );

    assert.deepEqual(calls, [
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
    assert.equal(snapshot.expiresAt, "2026-06-23T00:00:00.000Z");
    assert.equal(snapshot.sourceUpdatedAt, "2026-06-22T00:00:00.000Z");
    assert.equal(missing, undefined);
  });

  it("keeps Prisma gateway contract opt-in and runtime side effects absent", () => {
    assert.match(repositorySource, /type OrderImportPrismaClientPort/);
    assert.match(repositorySource, /class PrismaOrderImportPersistenceGateway/);
    assert.match(appModule, /PrismaOrderImportPersistenceGateway/);
    assert.match(appModule, /useExisting: InMemoryOrderImportRepository/);
    assert.doesNotMatch(
      `${repositorySource}\n${appModule}`,
      /@prisma\/client|new PrismaClient|process\.env|order_connector|fetch\(|https?:\/\//i
    );
    assert.doesNotMatch(
      appModule,
      /useClass: PrismaOrderImportPersistenceGateway|useExisting: PrismaOrderImportPersistenceGateway/
    );
    assert.match(m411Spec, /Prisma gateway contract foundation/);
    assert.match(m411Evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-11 order import Prisma gateway/);
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

function jobRow(id, tenantId) {
  return {
    failedRows: id === "job-a" ? 1 : 0,
    fileRef: `storage://order-imports/${id}`,
    id,
    orgId: ORG_ID,
    status: "completed_with_errors",
    successfulRows: 2,
    tenantId,
    totalRows: 3
  };
}

function rowError(id, importJobId, tenantId) {
  return {
    columnKey: "orderStatusRef",
    errorCode: "order_status_ref_required",
    id,
    importJobId,
    messageRef: "reason://order-import/order-status-ref-required",
    orgId: ORG_ID,
    rowNumber: 3,
    severity: "error",
    tenantId
  };
}

function snapshotRow(tenantId, queryRef, expiresAt) {
  return {
    expiresAt,
    externalOrderRef: "controlled://order/ref-a",
    id: "55555555-5555-4555-8555-555555555555",
    orderStatusRef: "status://order/in-transit",
    orgId: ORG_ID,
    payloadSummary: { queryRef, statusRef: "status://order/in-transit" },
    sourceKind: "import_snapshot",
    sourceRef: "storage://order-imports/snapshot-a",
    sourceUpdatedAt: "2026-06-22T00:00:00.000Z",
    status: "active",
    tenantId
  };
}

function gatewayWithSnapshot(snapshot) {
  return {
    findOrderSnapshot() {
      return snapshot;
    },
    getImportJob() {
      return undefined;
    },
    listImportJobs() {
      return [];
    },
    listImportRowErrors() {
      return [];
    }
  };
}

function prismaStub(overrides = {}) {
  return {
    importJob: {
      findFirst: async () => null,
      findMany: async () => [],
      ...(overrides.importJob ?? {})
    },
    importRowError: {
      findMany: async () => [],
      ...(overrides.importRowError ?? {})
    },
    orderSnapshot: {
      findFirst: async () => null,
      ...(overrides.orderSnapshot ?? {})
    }
  };
}

function pick(record, keys) {
  return Object.fromEntries(keys.map((key) => [key, record[key]]));
}

async function importOrderImportRepositorySource() {
  const moduleUrl = inlineModuleUrl(
    transpileSource(read("apps/api/src/order-import.repository.ts"))
  );
  return { module: await import(moduleUrl), moduleUrl };
}

async function importTypescriptSource(relativePath) {
  const moduleUrl = inlineModuleUrl(transpileSource(read(relativePath)));
  return { module: await import(moduleUrl), moduleUrl };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function transpileSource(sourceText) {
  return ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
}

function inlineModuleUrl(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText, "utf8").toString(
    "base64"
  )}`;
}

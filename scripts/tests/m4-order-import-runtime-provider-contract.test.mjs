import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const USER_A = "44444444-4444-4444-8444-444444444444";
const repositorySource = read("apps/api/src/order-import.repository.ts");
const runtimeSource = read("apps/api/src/order-import.runtime.ts");
const appModule = read("apps/api/src/app.module.ts");
const spec = read("docs/specs/M4-23-order-import-runtime-provider-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-23-order-import-runtime-provider-contract.md"
);
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

describe("M4-23 order import runtime provider contract", () => {
  it("keeps the default runtime provider on the in-memory repository", async () => {
    const provider = repository.module.createOrderImportRepositoryProvider();
    const seededRepository = new repository.module.InMemoryOrderImportRepository();
    const seededProvider = repository.module.createOrderImportRepositoryProvider({
      inMemoryRepository: seededRepository,
      mode: repository.module.orderImportRepositoryRuntimeModes.inMemory
    });

    assert.ok(provider instanceof repository.module.InMemoryOrderImportRepository);
    assert.equal(seededProvider, seededRepository);

    const snapshot = await provider.findSnapshot(contextFor(TENANT_A), {
      queryKind: "order_ref",
      queryRef: "query://order/fresh-a"
    });
    assert.equal(snapshot.orderStatusRef, "status://order/in-transit");
  });

  it("wraps an explicit Prisma client port in the existing persistence adapter", async () => {
    const calls = [];
    const provider = repository.module.createOrderImportRepositoryProvider({
      mode: repository.module.orderImportRepositoryRuntimeModes.prismaGateway,
      prismaClient: prismaStub({
        importJob: {
          async findMany(args) {
            calls.push({ args, delegate: "importJob.findMany" });
            return [jobRow("job-a", TENANT_A)];
          }
        },
        orderSnapshot: {
          async findFirst(args) {
            calls.push({ args, delegate: "orderSnapshot.findFirst" });
            return snapshotRow();
          }
        }
      })
    });

    const jobs = await provider.listJobs(contextFor(TENANT_A));
    const snapshot = await provider.findSnapshot(contextFor(TENANT_A), {
      queryKind: "order_ref",
      queryRef: "controlled://order/ref-a"
    });

    assert.deepEqual(calls, [
      {
        args: {
          orderBy: { createdAt: "desc" },
          take: 50,
          where: { orgId: ORG_ID, tenantId: TENANT_A }
        },
        delegate: "importJob.findMany"
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
    assert.deepEqual(
      jobs.map((job) => job.id),
      ["job-a"]
    );
    assert.equal(snapshot.sourceKind, "import_snapshot");
  });

  it("fails closed when Prisma runtime mode lacks a valid client port", () => {
    assert.throws(
      () =>
        repository.module.createOrderImportRepositoryProvider({
          mode: repository.module.orderImportRepositoryRuntimeModes.prismaGateway
        }),
      /order import Prisma client port is required/
    );
    assert.throws(
      () =>
        repository.module.createOrderImportRepositoryProvider({
          mode: repository.module.orderImportRepositoryRuntimeModes.prismaGateway,
          prismaClient: { importJob: { findMany: async () => [] } }
        }),
      /order import Prisma client port is required/
    );
    assert.throws(
      () =>
        repository.module.createOrderImportRepositoryProvider({
          mode: "external_api"
        }),
      /unsupported order import repository runtime mode/
    );
  });

  it("wires AppModule through the in-memory selector without runtime side effects", () => {
    assert.match(repositorySource, /ORDER_IMPORT_PRISMA_CLIENT/);
    assert.match(repositorySource, /orderImportRepositoryRuntimeModes/);
    assert.match(repositorySource, /createOrderImportRepositoryProvider/);
    assert.match(appModule, /ORDER_IMPORT_PRISMA_CLIENT/);
    assert.match(appModule, /provide: ORDER_IMPORT_REPOSITORY/);
    assert.match(
      appModule,
      /useFactory: \(repository: InMemoryOrderImportRepository\)/
    );
    assert.match(appModule, /createOrderImportRepositoryProviderFromEnv/);
    assert.doesNotMatch(appModule, /process\.env/);
    assert.match(runtimeSource, /process\.env/);
    assert.doesNotMatch(
      appModule,
      /useClass: PrismaOrderImportPersistenceGateway|useExisting: PrismaOrderImportPersistenceGateway/
    );
    assert.doesNotMatch(
      `${repositorySource}\n${appModule}`,
      /@prisma\/client|new PrismaClient|order_connector|fetch\(|https?:\/\//i
    );
  });

  it("records M4-23 scope without closing production runtime blockers", () => {
    assert.match(spec, /runtime repository provider contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-23 order import runtime provider contract/);
    assert.match(m4Index, /provider selector contract/);
    assert.match(m4Index, /real DB runtime/);
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

function snapshotRow() {
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
    tenantId: TENANT_A
  };
}

function prismaStub(overrides = {}) {
  const defaults = {
    importJob: prismaDelegate(["findFirst", "findMany"]),
    importRowError: prismaDelegate(["findMany"]),
    orderSnapshot: prismaDelegate(["findFirst"])
  };
  return {
    importJob: { ...defaults.importJob, ...(overrides.importJob ?? {}) },
    importRowError: {
      ...defaults.importRowError,
      ...(overrides.importRowError ?? {})
    },
    orderSnapshot: { ...defaults.orderSnapshot, ...(overrides.orderSnapshot ?? {}) }
  };
}

function prismaDelegate(methods) {
  return Object.fromEntries(
    methods.map((method) => [
      method,
      method === "findMany" ? async () => [] : async () => null
    ])
  );
}

async function importTypescriptSource(relativePath, replacements = {}) {
  const moduleUrl = inlineModuleUrl(
    ts.transpileModule(replaceImports(read(relativePath), replacements), {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2023
      },
      fileName: relativePath
    }).outputText
  );
  return { module: await import(moduleUrl), moduleUrl };
}

function replaceImports(sourceText, replacements) {
  return Object.entries(replacements).reduce(
    (updated, [from, to]) => updated.replaceAll(from, to),
    sourceText
  );
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function inlineModuleUrl(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText, "utf8").toString(
    "base64"
  )}`;
}

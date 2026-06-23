import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";
import ts from "typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const ORG_ID = "11111111-1111-4111-8111-111111111135";
const TENANT_A_ID = "22222222-2222-4222-8222-222222222135";
const TENANT_B_ID = "33333333-3333-4333-8333-333333333135";
const USER_ID = "44444444-4444-4444-8444-444444444135";
const IMPORT_JOB_ID = "55555555-5555-4555-8555-555555555135";
const SNAPSHOT_ID = "66666666-6666-4666-8666-666666666135";
const ROW_ERROR_ID = "77777777-7777-4777-8777-777777777135";
const SOURCE_REF = "storage://order-imports/m4-35-true-db-runtime-smoke.csv";
const ORDER_REF = "controlled://order/m4-35-ref-a";
const IMPORTED_AT = "2026-06-23T07:30:00.000Z";

const databaseUrl = requireEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});

try {
  await cleanupSyntheticRows();
  await seedSyntheticTenant();

  const worker = await importWorkerEntrypoint();
  const persistence = await importWorkerPrismaPersistenceEntrypoint(worker.moduleUrl);
  const api = await importApiOrderImportEntrypoints();

  const jobResult = await worker.module.runOrderImportCsvTextPersistenceJob(
    jobInput(),
    collectingGateway()
  );
  assert.deepEqual(jobResult.persisted, {
    importJobs: 1,
    rowErrors: 1,
    snapshots: 1
  });

  await persistDraftsInRlsTransaction(persistence.module, jobResult);

  const repository = api.repository.module.createOrderImportRepositoryProvider({
    mode: api.repository.module.orderImportRepositoryRuntimeModes.rlsPrismaGateway,
    rlsTransactionRunner:
      api.runner.module.createOrderImportRlsBatchTransactionRunner(prisma)
  });

  const tenantA = accessContext(TENANT_A_ID);
  const tenantB = accessContext(TENANT_B_ID);
  const jobsA = await repository.listJobs(tenantA);
  const jobA = await repository.getJob(tenantA, IMPORT_JOB_ID);
  const errorsA = await repository.listRowErrors(tenantA, IMPORT_JOB_ID);
  const snapshotA = await repository.findSnapshot(tenantA, {
    queryKind: "order_ref",
    queryRef: ORDER_REF
  });
  const jobsB = await repository.listJobs(tenantB);
  const snapshotB = await repository.findSnapshot(tenantB, {
    queryKind: "order_ref",
    queryRef: ORDER_REF
  });

  assert.equal(
    jobsA.some((job) => job.id === IMPORT_JOB_ID),
    true
  );
  assert.equal(jobA?.id, IMPORT_JOB_ID);
  assert.equal(errorsA.length, 1);
  assert.equal(errorsA[0].id, ROW_ERROR_ID);
  assert.equal(snapshotA?.externalOrderRef, ORDER_REF);
  assert.equal(
    jobsB.some((job) => job.id === IMPORT_JOB_ID),
    false
  );
  assert.equal(snapshotB, undefined);

  await cleanupSyntheticRows();
  const residue = await syntheticResidueCount();
  assert.equal(residue, 0);

  console.log(
    "m4-order-import-true-db-runtime-smoke: passed worker->DB/RLS->API synthetic path; residue=0"
  );
} finally {
  await cleanupSyntheticRows().catch((error) => {
    console.error(
      `m4-order-import-true-db-runtime-smoke: cleanup failed: ${error.message}`
    );
  });
  await prisma.$disconnect();
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function seedSyntheticTenant() {
  await prisma.org.create({
    data: {
      id: ORG_ID,
      name: "M4-35 Synthetic Org",
      slug: "m4-35-synthetic-org"
    }
  });
  await prisma.tenant.createMany({
    data: [
      {
        id: TENANT_A_ID,
        name: "M4-35 Synthetic Tenant A",
        orgId: ORG_ID,
        slug: "tenant-a"
      },
      {
        id: TENANT_B_ID,
        name: "M4-35 Synthetic Tenant B",
        orgId: ORG_ID,
        slug: "tenant-b"
      }
    ]
  });
}

async function cleanupSyntheticRows() {
  await prisma.org.deleteMany({
    where: { id: ORG_ID }
  });
}

async function syntheticResidueCount() {
  const rows = await prisma.$queryRaw`
    select (
      (select count(*) from org where id::text = ${ORG_ID})
      + (select count(*) from import_job where metadata->>'synthetic_spec' = 'M4-35')
      + (select count(*) from order_snapshot where metadata->>'synthetic_spec' = 'M4-35')
      + (select count(*) from import_row_error where metadata->>'synthetic_spec' = 'M4-35')
      + (select count(*) from order_query_log where metadata->>'synthetic_spec' = 'M4-35')
    )::int as residue
  `;
  return Number(rows[0]?.residue ?? -1);
}

function collectingGateway() {
  return {
    async persistImportJob() {},
    async persistImportRowErrors() {},
    async persistOrderSnapshots() {}
  };
}

async function persistDraftsInRlsTransaction(persistence, jobResult) {
  await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${ORG_ID}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${TENANT_A_ID}, true)`,
    prisma.importJob.create({
      data: persistence.toPrismaImportJobCreateData({
        ...jobResult.importJobDraft,
        metadata: { synthetic_spec: "M4-35" }
      })
    }),
    prisma.orderSnapshot.createMany({
      data: persistence.toPrismaOrderSnapshotCreateManyData(
        jobResult.snapshotDrafts.map((draft) => ({
          ...draft,
          metadata: { synthetic_spec: "M4-35" }
        }))
      ),
      skipDuplicates: true
    }),
    prisma.importRowError.createMany({
      data: persistence.toPrismaImportRowErrorCreateManyData(
        jobResult.rowErrorDrafts.map((draft) => ({
          ...draft,
          metadata: { synthetic_spec: "M4-35" }
        }))
      ),
      skipDuplicates: true
    })
  ]);
}

function jobInput() {
  return {
    createdByUserId: USER_ID,
    csvText: [
      "external_order_ref,order_status_ref,source_updated_at,expires_at,external_batch_ref",
      `${ORDER_REF},status://order/ready,${IMPORTED_AT},2026-06-30T07:30:00.000Z,controlled://batch/m4-35`,
      "controlled://order/m4-35-bad,,2026-06-23T07:30:00.000Z,2026-06-30T07:30:00.000Z,"
    ].join("\n"),
    importJobId: IMPORT_JOB_ID,
    importedAt: IMPORTED_AT,
    maxRows: 10,
    orgId: ORG_ID,
    rowErrorIds: [ROW_ERROR_ID],
    snapshotIds: [SNAPSHOT_ID],
    sourceRef: SOURCE_REF,
    tenantId: TENANT_A_ID
  };
}

function accessContext(selectedTenantId) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions: ["order:read"],
    selectedTenantId,
    tenantIds: [TENANT_A_ID, TENANT_B_ID],
    userId: USER_ID
  };
}

async function importWorkerEntrypoint() {
  const orderReadUrl = compileTsModuleUrl(
    readRepoText("packages/capabilities/order-read/src/index.ts")
  );
  const dbUrl = compileTsModuleUrl(
    readRepoText("packages/db/src/m4-order-import-contracts.ts")
  );
  const moduleUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/main.ts")
      .replaceAll('export * from "./order-import-dispatch.ts";', "")
      .replaceAll('export * from "./order-import-file-intake.ts";', "")
      .replaceAll('export * from "./order-import-prisma-persistence.ts";', "")
      .replaceAll(
        "../../../packages/capabilities/order-read/src/index.ts",
        orderReadUrl
      )
      .replaceAll("../../../packages/db/src/m4-order-import-contracts.ts", dbUrl)
  );
  return { module: await import(moduleUrl), moduleUrl };
}

async function importWorkerPrismaPersistenceEntrypoint(workerUrl) {
  const moduleUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-prisma-persistence.ts").replaceAll(
      "./main.ts",
      workerUrl
    )
  );
  return { module: await import(moduleUrl), moduleUrl };
}

async function importApiOrderImportEntrypoints() {
  const dbIndexUrl = compileTsModuleUrl(`
    export function createRlsTransactionContext(context) {
      if (!context?.orgId?.trim() || !context?.tenantId?.trim()) {
        throw new Error("RLS tenant context requires orgId and tenantId");
      }
      return {
        roleSql: 'set local role "uzmax_app_runtime"',
        settings: [
          { key: "app.org_id", value: context.orgId.trim() },
          { key: "app.tenant_id", value: context.tenantId.trim() }
        ]
      };
    }
  `);
  const defaultsUrl = compileTsModuleUrl(
    readRepoText("apps/api/src/order-import.defaults.ts")
  );
  const typesUrl = compileTsModuleUrl(
    readRepoText("apps/api/src/order-import.types.ts")
  );
  const persistenceGatewayUrl = compileTsModuleUrl(
    readRepoText("apps/api/src/order-import.persistence-gateway.ts").replaceAll(
      "../../../packages/db/src/index.ts",
      dbIndexUrl
    )
  );
  const repositoryUrl = compileTsModuleUrl(
    readRepoText("apps/api/src/order-import.repository.ts")
      .replaceAll("../../../packages/db/src/index.ts", dbIndexUrl)
      .replaceAll("./order-import.defaults.ts", defaultsUrl)
      .replaceAll("./order-import.persistence-gateway.ts", persistenceGatewayUrl)
      .replaceAll("./order-import.types.ts", typesUrl)
  );
  const runnerUrl = compileTsModuleUrl(
    readRepoText("apps/api/src/order-import.rls-runner.ts").replaceAll(
      "./order-import.repository.ts",
      repositoryUrl
    )
  );

  return {
    repository: { module: await import(repositoryUrl), moduleUrl: repositoryUrl },
    runner: { module: await import(runnerUrl), moduleUrl: runnerUrl }
  };
}

function readRepoText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function compileTsModuleUrl(sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(compiled, "utf8").toString(
    "base64"
  )}`;
}

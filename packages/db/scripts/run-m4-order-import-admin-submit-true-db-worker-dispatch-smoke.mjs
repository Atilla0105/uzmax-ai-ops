import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, URLSearchParams } from "node:url";

import { PrismaClient } from "@prisma/client";
import ts from "typescript";

import {
  assertVisibleText,
  runAdminVisibleOrderImportSmoke,
  withVisibleSmokePage
} from "./order-import-admin-visible-smoke-harness.mjs";
import {
  createOrderImportHttpFetcher,
  createOrderImportHttpSmokeFixture,
  getOrderImportJson,
  requireSmokeEnv
} from "./order-import-true-db-http-smoke-fixture.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const workerRuntimeCompilerOptions = {
  emitDecoratorMetadata: false,
  experimentalDecorators: true,
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2023
};
const fixture = createOrderImportHttpSmokeFixture({
  orderRef: "controlled://order/m4-40-ref-a",
  payloadSource: "m4-40-admin-submit-worker-dispatch-smoke",
  sourceRef:
    "storage://order-imports/m4-40-admin-submit-true-db-worker-dispatch-smoke.csv",
  suffix: "140",
  syntheticSpec: "M4-40"
});
const submitPayload = {
  csvText: [
    "external_order_ref,order_status_ref,source_updated_at,expires_at,external_batch_ref",
    `${fixture.orderRef},status://order/ready,${fixture.importedAt},${fixture.expiresAt},controlled://batch/m4-40`,
    "controlled://order/m4-40-bad,,2026-06-23T08:30:00.000Z,2026-06-30T08:30:00.000Z,"
  ].join("\n"),
  importJobId: fixture.importJobId,
  importedAt: fixture.importedAt,
  maxRows: 10,
  rowErrorIds: [fixture.rowErrorId],
  snapshotIds: [fixture.snapshotId],
  sourceRef: fixture.sourceRef
};

const databaseUrl = requireSmokeEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});
const submitDispatcher = await createWorkerSubmitDispatcher(prisma, fixture);

await runAdminVisibleOrderImportSmoke({
  assertRuntime: async (runtime) => {
    await assertBrowserSubmitAndReadback(runtime);
    await assertTenantBIsolation(runtime.apiBaseUrl);
  },
  fixture,
  prisma,
  seedRows: false,
  smokeName: "m4-order-import-admin-submit-true-db-worker-dispatch-smoke",
  submitDispatcher,
  successMessage:
    "m4-order-import-admin-submit-true-db-worker-dispatch-smoke: passed browser admin submit->API->worker dispatch->DB/RLS readback synthetic path; residue=0"
});

async function assertBrowserSubmitAndReadback(runtime) {
  await withVisibleSmokePage(
    runtime,
    {
      now: fixture.importedAt,
      permissions: "order:read,order:write",
      queryRef: fixture.orderRef,
      submit: submitPayload
    },
    async (runtimeState) => {
      await assertVisibleText(runtimeState, fixture.sourceRef);
      await assertVisibleText(runtimeState, "order_status_ref_required");
      await assertVisibleText(runtimeState, "snapshot_ready");
      await assertVisibleText(runtimeState, "Status ref: status://order/ready");
      await assertVisibleText(runtimeState, "Handoff: not required");
    }
  );
}

async function assertTenantBIsolation(apiBaseUrl) {
  const tenantBFetcher = createOrderImportHttpFetcher(apiBaseUrl, {
    tenantId: fixture.tenantBId
  });
  const tenantBSearch = new URLSearchParams({
    now: fixture.importedAt,
    queryKind: "order_ref",
    queryRef: fixture.orderRef
  });
  const [jobs, missingSnapshot] = await Promise.all([
    getOrderImportJson(tenantBFetcher, "/order-import/jobs"),
    getOrderImportJson(
      tenantBFetcher,
      `/order-import/snapshots/search?${tenantBSearch}`
    )
  ]);
  assert.deepEqual(
    {
      containsSubmittedJob: jobs.items.some((job) => job.id === fixture.importJobId),
      reasonCode: missingSnapshot.reasonCode,
      status: missingSnapshot.status
    },
    {
      containsSubmittedJob: false,
      reasonCode: "order_snapshot_missing",
      status: "handoff_required"
    }
  );
}

async function createWorkerSubmitDispatcher(prismaClient, syntheticFixture) {
  const worker = await importWorkerSubmitModules();
  return {
    async dispatchCsvText(input) {
      return prismaClient.$transaction(async (tx) => {
        await tx.$executeRawUnsafe('set local role "uzmax_app_runtime"');
        await tx.$queryRaw`select set_config('app.org_id', ${input.orgId}, true)`;
        await tx.$queryRaw`select set_config('app.tenant_id', ${input.tenantId}, true)`;

        const gateway =
          worker.persistence.createOrderImportWorkerPrismaPersistenceGateway(
            syntheticWorkerPrismaClient(tx, syntheticFixture)
          );
        return worker.dispatch.runOrderImportCsvTextDispatchContract(
          input,
          gateway,
          worker.main.runOrderImportCsvTextPersistenceJob
        );
      });
    }
  };
}

function syntheticWorkerPrismaClient(tx, syntheticFixture) {
  return {
    importJob: {
      create(args) {
        return tx.importJob.create({
          data: withSyntheticMetadata(args.data, syntheticFixture)
        });
      }
    },
    importRowError: {
      createMany(args) {
        return tx.importRowError.createMany({
          data: args.data.map((row) => withSyntheticMetadata(row, syntheticFixture)),
          skipDuplicates: args.skipDuplicates
        });
      }
    },
    orderSnapshot: {
      createMany(args) {
        return tx.orderSnapshot.createMany({
          data: args.data.map((row) => withSyntheticMetadata(row, syntheticFixture)),
          skipDuplicates: args.skipDuplicates
        });
      }
    }
  };
}

function withSyntheticMetadata(data, syntheticFixture) {
  return {
    ...data,
    metadata: {
      ...(isRecord(data.metadata) ? data.metadata : {}),
      synthetic_spec: syntheticFixture.syntheticSpec
    }
  };
}

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

async function importWorkerSubmitModules() {
  const orderReadUrl = compileTsModuleUrl(
    readRepoText("packages/capabilities/order-read/src/index.ts")
  );
  const dbUrl = compileTsModuleUrl(
    readRepoText("packages/db/src/m4-order-import-contracts.ts")
  );
  const mainUrl = compileTsModuleUrl(
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
  const persistenceUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-prisma-persistence.ts").replaceAll(
      "./main.ts",
      mainUrl
    )
  );
  const dispatchUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-dispatch.ts").replaceAll(
      "./main.ts",
      mainUrl
    )
  );
  const [main, persistence, dispatch] = await Promise.all([
    import(mainUrl),
    import(persistenceUrl),
    import(dispatchUrl)
  ]);
  return { dispatch, main, persistence };
}

function readRepoText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function compileTsModuleUrl(sourceText) {
  const { outputText } = ts.transpileModule(sourceText, {
    compilerOptions: workerRuntimeCompilerOptions
  });
  const encodedModule = Buffer.from(outputText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encodedModule}`;
}

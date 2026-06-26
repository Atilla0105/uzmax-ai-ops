import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, URLSearchParams } from "node:url";

import ts from "typescript";

import {
  createOrderImportHttpFetcher,
  getOrderImportJson
} from "./order-import-true-db-http-smoke-fixture.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const workerRuntimeCompilerOptions = {
  emitDecoratorMetadata: false,
  experimentalDecorators: true,
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2023
};

export async function assertTenantBOrderImportIsolation({ apiBaseUrl, fixture }) {
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

export async function createWorkerCsvTextSubmitDispatcher({ fixture, prismaClient }) {
  const worker = await importWorkerSubmitModules();
  return createCsvTextDispatcherFromWorker({ fixture, prismaClient, worker });
}

export async function createWorkerStorageObjectSubmitDispatcher({
  fixture,
  prismaClient,
  storageObjectDownloader
}) {
  const worker = await importWorkerSubmitModules();
  const csvTextDispatcher = createCsvTextDispatcherFromWorker({
    fixture,
    prismaClient,
    worker
  });
  return {
    dispatchCsvText: csvTextDispatcher.dispatchCsvText,
    async dispatchStorageObject(input) {
      const content = await storageObjectDownloader(input);
      const intake = worker.fileIntake.createOrderImportCsvTextInputFromStorageObject({
        bucketId: input.bucketId,
        content,
        maxRows: input.maxRows,
        mediaType: input.mediaType,
        objectPath: input.objectPath
      });
      assert.equal(intake.sourceRef, input.sourceRef);
      return csvTextDispatcher.dispatchCsvText({
        ...input,
        csvText: intake.csvText,
        sourceRef: intake.sourceRef
      });
    }
  };
}

function createCsvTextDispatcherFromWorker({ fixture, prismaClient, worker }) {
  return {
    async dispatchCsvText(input) {
      return prismaClient.$transaction(async (tx) => {
        await tx.$executeRawUnsafe('set local role "uzmax_app_runtime"');
        await tx.$queryRaw`select set_config('app.org_id', ${input.orgId}, true)`;
        await tx.$queryRaw`select set_config('app.tenant_id', ${input.tenantId}, true)`;

        const gateway =
          worker.persistence.createOrderImportWorkerPrismaPersistenceGateway(
            syntheticWorkerPrismaClient(tx, fixture)
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
      .replaceAll('export * from "./conversation-runtime.ts";', "")
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
  const fileIntakeUrl = compileTsModuleUrl(
    readRepoText("apps/worker/src/order-import-file-intake.ts")
  );
  const [main, persistence, dispatch, fileIntake] = await Promise.all([
    import(mainUrl),
    import(persistenceUrl),
    import(dispatchUrl),
    import(fileIntakeUrl)
  ]);
  return { dispatch, fileIntake, main, persistence };
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

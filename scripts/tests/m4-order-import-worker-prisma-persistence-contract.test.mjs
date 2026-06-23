import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  importWorkerEntrypoint,
  importWorkerPrismaPersistenceEntrypoint,
  readRepoText
} from "./m4-worker-test-loader.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";
const IMPORT_JOB_ID = "44444444-4444-4444-8444-444444444444";
const SNAPSHOT_ID = "55555555-5555-4555-8555-555555555555";
const ROW_ERROR_ID = "66666666-6666-4666-8666-666666666666";
const workerSource = readRepoText("apps/worker/src/main.ts");
const prismaPersistenceSource = readRepoText(
  "apps/worker/src/order-import-prisma-persistence.ts"
);
const spec = readRepoText(
  "docs/specs/M4-27-order-import-worker-prisma-persistence-gateway-contract.md"
);
const evidence = readRepoText(
  "docs/evidence/M4/M4-27-order-import-worker-prisma-persistence-gateway-contract.md"
);
const m4Index = readRepoText("docs/evidence/M4/README.md");
const worker = await importWorkerEntrypoint();
const persistence = await importWorkerPrismaPersistenceEntrypoint();

describe("M4-27 order import worker Prisma persistence gateway contract", () => {
  it("maps worker drafts to Prisma-shaped create and createMany delegates", async () => {
    const calls = [];
    const gateway = persistence.module.createOrderImportWorkerPrismaPersistenceGateway(
      prismaRecorder(calls)
    );

    const result = await worker.module.runOrderImportCsvTextPersistenceJob(
      {
        ...jobInput(),
        rowErrorIds: [ROW_ERROR_ID],
        snapshotIds: [SNAPSHOT_ID]
      },
      gateway
    );

    assert.deepEqual(result.persisted, { importJobs: 1, rowErrors: 1, snapshots: 1 });
    assert.deepEqual(
      calls.map((call) => call.delegate),
      ["importJob.create", "orderSnapshot.createMany", "importRowError.createMany"]
    );
    assert.equal(calls[0].args.data.id, IMPORT_JOB_ID);
    assert.equal(calls[0].args.data.status, "COMPLETED_WITH_ERRORS");
    assert.equal(calls[1].args.skipDuplicates, true);
    assert.equal(calls[1].args.data.length, 1);
    assert.equal(calls[1].args.data[0].id, SNAPSHOT_ID);
    assert.equal(calls[1].args.data[0].externalOrderRef, "controlled://order/ref-a");
    assert.equal(calls[1].args.data[0].sourceKind, "IMPORT_SNAPSHOT");
    assert.equal(calls[1].args.data[0].status, "ACTIVE");
    assert.equal(calls[2].args.skipDuplicates, true);
    assert.equal(calls[2].args.data.length, 1);
    assert.equal(calls[2].args.data[0].id, ROW_ERROR_ID);
    assert.equal(calls[2].args.data[0].rowNumber, 2);
    assert.equal(calls[2].args.data[0].severity, "ERROR");
  });

  it("skips empty createMany batches while keeping the import job write explicit", async () => {
    const calls = [];
    const gateway = new persistence.module.PrismaOrderImportWorkerPersistenceGateway(
      prismaRecorder(calls)
    );

    await gateway.persistOrderSnapshots([]);
    await gateway.persistImportRowErrors([]);

    assert.deepEqual(calls, []);
  });

  it("fails closed before delegate calls for malformed clients or draft records", async () => {
    assert.throws(
      () =>
        new persistence.module.PrismaOrderImportWorkerPersistenceGateway({
          importJob: {},
          importRowError: { createMany() {} },
          orderSnapshot: { createMany() {} }
        }),
      /worker Prisma persistence client port is required/
    );

    const calls = [];
    const gateway = persistence.module.createOrderImportWorkerPrismaPersistenceGateway(
      prismaRecorder(calls)
    );

    await assert.rejects(
      () => gateway.persistImportJob([]),
      /import job draft must be a record/
    );
    await assert.rejects(
      () => gateway.persistOrderSnapshots([null]),
      /order snapshot draft 1 must be a record/
    );
    await assert.rejects(
      () => gateway.persistImportRowErrors("not an array"),
      /import row error drafts must be an array/
    );
    assert.deepEqual(calls, []);
  });

  it("records M4-27 scope without default runtime wiring or external side effects", () => {
    assert.match(workerSource, /order-import-prisma-persistence/);
    assert.match(
      prismaPersistenceSource,
      /OrderImportWorkerPrismaPersistenceClientPort/
    );
    assert.match(prismaPersistenceSource, /PrismaOrderImportWorkerPersistenceGateway/);
    assert.match(prismaPersistenceSource, /toPrismaImportJobCreateData/);
    assert.match(prismaPersistenceSource, /COMPLETED_WITH_ERRORS/);
    assert.match(prismaPersistenceSource, /IMPORT_SNAPSHOT/);
    assert.match(prismaPersistenceSource, /createMany/);
    assert.doesNotMatch(
      `${workerSource}\n${prismaPersistenceSource}`,
      /@prisma\/client|new PrismaClient|process\.env|order_connector|BullMQ|ioredis|Redis|fetch\(|https?:\/\/|readFileSync|node:fs/i
    );
    assert.match(spec, /worker Prisma persistence gateway contract/);
    assert.match(evidence, /Prisma-shaped worker persistence adapter/);
    assert.match(
      m4Index,
      /M4-27 order import worker Prisma persistence gateway contract/
    );
    assert.match(m4Index, /real BullMQ\/Redis runtime/);
  });
});

function jobInput() {
  return {
    createdByUserId: USER_ID,
    csvText: controlledCsv([
      "external_order_ref,order_status_ref,source_updated_at,expires_at,external_batch_ref",
      "controlled://order/ref-a,status://order/in-transit,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z,controlled://batch/ref-a",
      "controlled://order/ref-b,,2026-06-22T00:00:00.000Z,2026-06-23T00:00:00.000Z,"
    ]),
    importJobId: IMPORT_JOB_ID,
    importedAt: "2026-06-22T12:00:00.000Z",
    orgId: ORG_ID,
    rowErrorIds: [],
    snapshotIds: [],
    sourceRef: "storage://order-imports/worker-prisma-batch-a",
    tenantId: TENANT_ID
  };
}

function controlledCsv(lines) {
  return lines.join("\n");
}

function prismaRecorder(calls) {
  return {
    importJob: {
      async create(args) {
        calls.push({ args, delegate: "importJob.create" });
        return { id: args.data.id };
      }
    },
    importRowError: {
      async createMany(args) {
        calls.push({ args, delegate: "importRowError.createMany" });
        return { count: args.data.length };
      }
    },
    orderSnapshot: {
      async createMany(args) {
        calls.push({ args, delegate: "orderSnapshot.createMany" });
        return { count: args.data.length };
      }
    }
  };
}

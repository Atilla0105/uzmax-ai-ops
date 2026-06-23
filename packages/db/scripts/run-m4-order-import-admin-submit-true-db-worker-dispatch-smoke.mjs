import { PrismaClient } from "@prisma/client";

import {
  assertVisibleText,
  runAdminVisibleOrderImportSmoke,
  withVisibleSmokePage
} from "./order-import-admin-visible-smoke-harness.mjs";
import {
  createOrderImportHttpSmokeFixture,
  requireSmokeEnv
} from "./order-import-true-db-http-smoke-fixture.mjs";
import {
  assertTenantBOrderImportIsolation,
  createWorkerCsvTextSubmitDispatcher
} from "./order-import-worker-submit-smoke-support.mjs";
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
const submitDispatcher = await createWorkerCsvTextSubmitDispatcher({
  fixture,
  prismaClient: prisma
});

await runAdminVisibleOrderImportSmoke({
  assertRuntime: async (runtime) => {
    await assertBrowserSubmitAndReadback(runtime);
    await assertTenantBOrderImportIsolation({
      apiBaseUrl: runtime.apiBaseUrl,
      fixture
    });
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

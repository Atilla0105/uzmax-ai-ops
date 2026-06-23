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

const fixture = createOrderImportHttpSmokeFixture({
  orderRef: "controlled://order/m4-38-ref-a",
  payloadSource: "m4-38-admin-visible-smoke",
  sourceRef: "storage://order-imports/m4-38-admin-visible-true-db-smoke.csv",
  suffix: "138",
  syntheticSpec: "M4-38"
});

const databaseUrl = requireSmokeEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});

await runAdminVisibleOrderImportSmoke({
  assertRuntime: async (runtime) => {
    await withVisibleSmokePage(
      runtime,
      { now: fixture.importedAt, queryRef: fixture.orderRef },
      async (runtimeState) => {
        await assertVisibleText(runtimeState, fixture.sourceRef);
        await assertVisibleText(runtimeState, "order_status_ref_required");
        await assertVisibleText(runtimeState, "snapshot_ready");
        await assertVisibleText(runtimeState, "Status ref: status://order/ready");
        await assertVisibleText(runtimeState, "Handoff: not required");
      }
    );
  },
  fixture,
  prisma,
  smokeName: "m4-order-import-admin-visible-true-db-smoke",
  successMessage:
    "m4-order-import-admin-visible-true-db-smoke: passed browser admin visible true DB synthetic path; residue=0"
});

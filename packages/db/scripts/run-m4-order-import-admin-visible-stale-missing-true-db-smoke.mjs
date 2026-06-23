import { PrismaClient } from "@prisma/client";

import {
  assertNoVisibleText,
  assertVisibleText,
  runAdminVisibleOrderImportSmoke,
  withVisibleSmokePage
} from "./order-import-admin-visible-smoke-harness.mjs";
import {
  createOrderImportHttpSmokeFixture,
  requireSmokeEnv
} from "./order-import-true-db-http-smoke-fixture.mjs";

const fixture = createOrderImportHttpSmokeFixture({
  orderRef: "controlled://order/m4-39-ref-a",
  payloadSource: "m4-39-admin-visible-stale-missing-smoke",
  sourceRef:
    "storage://order-imports/m4-39-admin-visible-stale-missing-true-db-smoke.csv",
  suffix: "139",
  syntheticSpec: "M4-39"
});
const missingOrderRef = "controlled://order/m4-39-missing-ref";
const staleNow = "2026-07-01T08:30:00.000Z";

const databaseUrl = requireSmokeEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});

await runAdminVisibleOrderImportSmoke({
  assertRuntime: async (runtime) => {
    await assertVisibleHandoff({
      expectedReasonCode: "order_snapshot_stale",
      queryRef: fixture.orderRef,
      runtime
    });
    await assertVisibleHandoff({
      expectedReasonCode: "order_snapshot_missing",
      queryRef: missingOrderRef,
      runtime
    });
  },
  fixture,
  prisma,
  smokeName: "m4-order-import-admin-visible-stale-missing-true-db-smoke",
  successMessage:
    "m4-order-import-admin-visible-stale-missing-true-db-smoke: passed browser admin visible stale/missing true DB synthetic path; residue=0"
});

async function assertVisibleHandoff({ expectedReasonCode, queryRef, runtime }) {
  await withVisibleSmokePage(
    runtime,
    { now: staleNow, queryRef },
    async (runtimeState) => {
      await assertVisibleText(runtimeState, fixture.sourceRef);
      await assertVisibleText(runtimeState, "order_status_ref_required");
      await assertVisibleText(runtimeState, "handoff_required");
      await assertVisibleText(runtimeState, `Reason code: ${expectedReasonCode}`);
      await assertVisibleText(runtimeState, `Runtime warning: ${expectedReasonCode}`);
      await assertVisibleText(runtimeState, "Handoff: required");
      await assertNoVisibleText(
        runtimeState,
        /Status ref|orderStatusRef|status:\/\/order\/ready/
      );
    }
  );
}

import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { startOrderImportHttpSmoke } from "../../../apps/api/scripts/order-import-http-smoke-harness.mjs";
import {
  cleanupSyntheticRows,
  createOrderImportHttpSmokeFixture,
  createSyntheticAccessContext,
  requireSmokeEnv,
  seedOrderImportRowsInRlsTransaction,
  seedSyntheticTenant,
  syntheticResidueCount
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

let apiApp;
let browser;
let viteServer;

try {
  const [{ chromium }, { createServer }] = await Promise.all([
    import("@playwright/test"),
    import("vite")
  ]);

  await cleanupSyntheticRows(prisma, fixture);
  await seedSyntheticTenant(prisma, fixture);
  await seedOrderImportRowsInRlsTransaction(prisma, fixture);

  apiApp = await startOrderImportHttpSmoke({
    createAccessContext: (selectedTenantId, permissions) =>
      createSyntheticAccessContext(fixture, selectedTenantId, permissions),
    prisma
  });
  const apiBaseUrl = await apiApp.getUrl();

  viteServer = await createServer({
    logLevel: "error",
    root: fileURLToPath(new URL("../../../apps/admin", import.meta.url)),
    server: { host: "127.0.0.1", port: 0 }
  });
  await viteServer.listen();
  const adminBaseUrl = readViteBaseUrl(viteServer);

  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript(
    ({ now, queryRef }) => {
      globalThis.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__ = {
        enabled: true,
        now,
        queryRef
      };
    },
    { now: fixture.importedAt, queryRef: fixture.orderRef }
  );
  await page.route("**/order-import/**", async (route, request) => {
    const sourceUrl = new URL(request.url());
    const response = await route.fetch({
      headers: {
        authorization: "Bearer m4-order-import-synthetic-token",
        "x-tenant-id": fixture.tenantAId,
        "x-uzmax-smoke-permissions": "order:read"
      },
      method: request.method(),
      timeout: 10_000,
      url: `${apiBaseUrl}${sourceUrl.pathname}${sourceUrl.search}`
    });
    await route.fulfill({ response });
  });

  await page.goto(`${adminBaseUrl}/design`);
  const runtimeState = page.getByTestId("m4-order-runtime-state");
  await assertVisibleText(runtimeState, fixture.sourceRef);
  await assertVisibleText(runtimeState, "order_status_ref_required");
  await assertVisibleText(runtimeState, "snapshot_ready");
  await assertVisibleText(runtimeState, "Status ref: status://order/ready");
  await assertVisibleText(runtimeState, "Handoff: not required");

  await browser.close();
  browser = undefined;
  await viteServer.close();
  viteServer = undefined;
  await apiApp.close();
  apiApp = undefined;
  await cleanupSyntheticRows(prisma, fixture);
  const residue = await syntheticResidueCount(prisma, fixture);
  assert.equal(residue, 0);

  console.log(
    "m4-order-import-admin-visible-true-db-smoke: passed browser admin visible true DB synthetic path; residue=0"
  );
} finally {
  if (browser) await browser.close().catch(() => {});
  if (viteServer) await viteServer.close().catch(() => {});
  if (apiApp) await apiApp.close().catch(() => {});
  await cleanupSyntheticRows(prisma, fixture).catch((error) => {
    console.error(
      `m4-order-import-admin-visible-true-db-smoke: cleanup failed: ${error.message}`
    );
  });
  await prisma.$disconnect().catch((error) => {
    console.error(
      `m4-order-import-admin-visible-true-db-smoke: prisma disconnect failed: ${error.message}`
    );
  });
}

function readViteBaseUrl(server) {
  const address = server.httpServer?.address();
  assert(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}`;
}

async function assertVisibleText(locator, text) {
  await locator.waitFor({ state: "visible", timeout: 10_000 });
  const expected = new RegExp(escapeRegExp(text));
  const deadline = Date.now() + 10_000;
  let content = "";
  while (Date.now() <= deadline) {
    content = (await locator.textContent()) ?? "";
    if (expected.test(content)) return;
    await delay(250);
  }
  assert.match(content, expected);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

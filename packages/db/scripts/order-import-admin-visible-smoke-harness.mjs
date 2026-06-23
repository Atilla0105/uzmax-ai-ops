import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

import { startOrderImportHttpSmoke } from "../../../apps/api/scripts/order-import-http-smoke-harness.mjs";
import {
  cleanupSyntheticRows,
  createSyntheticAccessContext,
  seedOrderImportRowsInRlsTransaction,
  seedSyntheticTenant,
  syntheticResidueCount
} from "./order-import-true-db-http-smoke-fixture.mjs";

const visibleStateTimeoutMs = 65_000;

export async function runAdminVisibleOrderImportSmoke({
  assertRuntime,
  fixture,
  prisma,
  seedRows = true,
  smokeName,
  submitDispatcher,
  successMessage
}) {
  let runtime;
  try {
    runtime = await startAdminVisibleOrderImportRuntime({
      fixture,
      prisma,
      seedRows,
      submitDispatcher
    });
    await assertRuntime(runtime);
    await closeAdminVisibleOrderImportRuntime(runtime, { bestEffort: false });
    runtime = undefined;
    await cleanupSyntheticRows(prisma, fixture);
    const residue = await syntheticResidueCount(prisma, fixture);
    assert.equal(residue, 0);

    console.log(successMessage);
  } finally {
    if (runtime) {
      await closeAdminVisibleOrderImportRuntime(runtime, { bestEffort: true });
    }
    await cleanupSyntheticRows(prisma, fixture).catch((error) => {
      console.error(`${smokeName}: cleanup failed: ${error.message}`);
    });
    await prisma.$disconnect().catch((error) => {
      console.error(`${smokeName}: prisma disconnect failed: ${error.message}`);
    });
  }
}

export async function withVisibleSmokePage(
  runtime,
  { now, permissions = "order:read", queryRef, submit },
  callback
) {
  const page = await runtime.browser.newPage();
  try {
    await page.addInitScript(
      ({ injectedNow, injectedQueryRef, injectedSubmit }) => {
        globalThis.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__ = {
          enabled: true,
          now: injectedNow,
          queryRef: injectedQueryRef,
          submit: injectedSubmit
        };
      },
      { injectedNow: now, injectedQueryRef: queryRef, injectedSubmit: submit }
    );
    await page.route("**/order-import/**", async (route, request) => {
      const sourceUrl = new URL(request.url());
      const response = await route.fetch({
        headers: {
          authorization: "Bearer m4-order-import-synthetic-token",
          "content-type": request.headers()["content-type"] ?? "application/json",
          "x-tenant-id": runtime.fixture.tenantAId,
          "x-uzmax-smoke-permissions": permissions
        },
        method: request.method(),
        postData: request.postData() ?? undefined,
        timeout: visibleStateTimeoutMs,
        url: `${runtime.apiBaseUrl}${sourceUrl.pathname}${sourceUrl.search}`
      });
      await route.fulfill({ response });
    });

    await page.goto(`${runtime.adminBaseUrl}/design`);
    await callback(page.getByTestId("m4-order-runtime-state"), page);
  } finally {
    await page.unrouteAll({ behavior: "ignoreErrors" }).catch(() => {});
    await page.close().catch(() => {});
  }
}

export async function assertVisibleText(locator, text) {
  await locator.waitFor({ state: "visible", timeout: visibleStateTimeoutMs });
  const expected = new RegExp(escapeRegExp(text));
  const deadline = Date.now() + visibleStateTimeoutMs;
  let content = "";
  while (Date.now() <= deadline) {
    content = (await locator.textContent()) ?? "";
    if (expected.test(content)) return;
    await delay(250);
  }
  assert.match(content, expected);
}

export async function assertNoVisibleText(locator, pattern) {
  await locator.waitFor({ state: "visible", timeout: visibleStateTimeoutMs });
  const content = (await locator.textContent()) ?? "";
  assert.doesNotMatch(content, pattern);
}

async function startAdminVisibleOrderImportRuntime({
  fixture,
  prisma,
  seedRows,
  submitDispatcher
}) {
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
    if (seedRows) {
      await seedOrderImportRowsInRlsTransaction(prisma, fixture);
    }

    apiApp = await startOrderImportHttpSmoke({
      createAccessContext: (selectedTenantId, permissions) =>
        createSyntheticAccessContext(fixture, selectedTenantId, permissions),
      prisma,
      submitDispatcher
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
    return { adminBaseUrl, apiApp, apiBaseUrl, browser, fixture, viteServer };
  } catch (error) {
    await closeAdminVisibleOrderImportRuntime(
      { apiApp, browser, viteServer },
      { bestEffort: true }
    );
    throw error;
  }
}

async function closeAdminVisibleOrderImportRuntime(runtime, { bestEffort }) {
  if (runtime.browser) {
    await closeRuntimeResource(runtime.browser, "close", { bestEffort });
  }
  if (runtime.viteServer) {
    await closeRuntimeResource(runtime.viteServer, "close", { bestEffort });
  }
  if (runtime.apiApp) {
    await closeRuntimeResource(runtime.apiApp, "close", { bestEffort });
  }
}

async function closeRuntimeResource(resource, method, { bestEffort }) {
  if (!resource) return;
  const close = resource[method];
  if (typeof close !== "function") return;
  const closePromise = close.call(resource);
  if (bestEffort) {
    await closePromise.catch(() => {});
    return;
  }
  await closePromise;
}

function readViteBaseUrl(server) {
  const address = server.httpServer?.address();
  assert(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

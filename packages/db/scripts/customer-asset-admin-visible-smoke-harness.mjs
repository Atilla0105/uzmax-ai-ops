import assert from "node:assert/strict";
import { fileURLToPath, URL } from "node:url";

import { startCustomerAssetHttpSmoke } from "../../../apps/api/scripts/customer-asset-http-smoke-harness.mjs";
import {
  cleanupSyntheticRows,
  createSyntheticAccessContext,
  seedCustomerAssetRowsInRlsTransaction,
  seedSyntheticTenant,
  syntheticResidueCount
} from "./customer-asset-true-db-http-smoke-fixture.mjs";

const visibleStateTimeoutMs = 65_000;

export async function runAdminVisibleCustomerAssetSmoke({
  assertRuntime,
  fixture,
  prisma,
  smokeName,
  successMessage
}) {
  let runtime;
  try {
    runtime = await startAdminVisibleCustomerAssetRuntime({ fixture, prisma });
    await assertRuntime(runtime);
    await closeAdminVisibleCustomerAssetRuntime(runtime, { bestEffort: false });
    runtime = undefined;
    await cleanupSyntheticRows(prisma, fixture);
    const residue = await syntheticResidueCount(prisma, fixture);
    assert.equal(residue, 0);

    console.log(successMessage);
  } finally {
    if (runtime) {
      await closeAdminVisibleCustomerAssetRuntime(runtime, { bestEffort: true });
    }
    await cleanupSyntheticRows(prisma, fixture).catch((error) => {
      console.error(`${smokeName}: cleanup failed: ${error.message}`);
    });
    await prisma.$disconnect().catch((error) => {
      console.error(`${smokeName}: prisma disconnect failed: ${error.message}`);
    });
  }
}

export async function withCustomerAssetVisibleSmokePage(
  runtime,
  { autoRestore = false, permissions = "customer:read", restoreReasonRef },
  callback
) {
  const page = await runtime.browser.newPage();
  try {
    await page.addInitScript(
      ({ injectedAutoRestore, injectedCustomerId, injectedRestoreReasonRef }) => {
        globalThis.__UZMAX_M4_CUSTOMER_ASSET_RUNTIME_SMOKE__ = {
          autoRestore: injectedAutoRestore,
          customerId: injectedCustomerId,
          enabled: true,
          restoreReasonRef: injectedRestoreReasonRef
        };
      },
      {
        injectedAutoRestore: autoRestore,
        injectedCustomerId: runtime.fixture.customerAId,
        injectedRestoreReasonRef: restoreReasonRef ?? runtime.fixture.auditReasonRef
      }
    );
    await page.route("**/customer-assets/**", (route, request) =>
      forwardCustomerAssetBrowserRequest(route, request, { permissions, runtime })
    );

    await page.goto(`${runtime.adminBaseUrl}/design`);
    await callback(page.getByTestId("m4-customer-runtime-state"), page);
  } finally {
    await page.unrouteAll({ behavior: "ignoreErrors" }).catch(() => {});
    await page.close().catch(() => {});
  }
}

export async function assertVisibleText(locator, text) {
  const { expect } = await import("@playwright/test");
  await expect(locator).toContainText(text, { timeout: visibleStateTimeoutMs });
}

async function startAdminVisibleCustomerAssetRuntime({ fixture, prisma }) {
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
    await seedCustomerAssetRowsInRlsTransaction(prisma, fixture);

    apiApp = await startCustomerAssetHttpSmoke({
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
    const adminBaseUrl = customerAssetViteBaseUrl(viteServer);

    browser = await chromium.launch();
    return { adminBaseUrl, apiApp, apiBaseUrl, browser, fixture, viteServer };
  } catch (error) {
    await closeAdminVisibleCustomerAssetRuntime(
      { apiApp, browser, viteServer },
      { bestEffort: true }
    );
    throw error;
  }
}

async function closeAdminVisibleCustomerAssetRuntime(runtime, { bestEffort }) {
  const resources = [runtime.browser, runtime.viteServer, runtime.apiApp];
  for (const resource of resources) {
    await closeCustomerAssetRuntimeResource(resource, { bestEffort });
  }
}

async function closeCustomerAssetRuntimeResource(resource, { bestEffort }) {
  if (!resource) return;
  const close = resource.close;
  if (typeof close !== "function") return;
  const closePromise = close.call(resource);
  if (bestEffort) {
    await closePromise.catch(() => {});
    return;
  }
  await closePromise;
}

async function forwardCustomerAssetBrowserRequest(
  route,
  request,
  { permissions, runtime }
) {
  const sourceUrl = new URL(request.url());
  const headers = request.headers();
  const response = await route.fetch({
    headers: {
      authorization: "Bearer m4-customer-asset-synthetic-token",
      "content-type": headers["content-type"] ?? "application/json",
      "x-tenant-id": runtime.fixture.tenantAId,
      "x-uzmax-smoke-permissions": permissions
    },
    method: request.method(),
    postData: request.postData() ?? undefined,
    timeout: visibleStateTimeoutMs,
    url: `${runtime.apiBaseUrl}${sourceUrl.pathname}${sourceUrl.search}`
  });
  await route.fulfill({ response });
}

function customerAssetViteBaseUrl(server) {
  const address = server.httpServer?.address();
  assert(address && typeof address === "object");
  return ["http://127.0.0.1", address.port].join(":");
}

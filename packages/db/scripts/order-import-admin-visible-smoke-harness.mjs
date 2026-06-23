import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

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
  {
    autoSubmit,
    now,
    onApiRequest,
    permissions = "order:read",
    queryRef,
    storageSubmit,
    submit
  },
  callback
) {
  const page = await runtime.browser.newPage();
  try {
    await page.addInitScript(
      ({
        injectedAutoSubmit,
        injectedNow,
        injectedQueryRef,
        injectedStorageSubmit,
        injectedSubmit
      }) => {
        globalThis.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__ = {
          autoSubmit: injectedAutoSubmit,
          enabled: true,
          now: injectedNow,
          queryRef: injectedQueryRef,
          storageSubmit: injectedStorageSubmit,
          submit: injectedSubmit
        };
      },
      {
        injectedAutoSubmit: autoSubmit,
        injectedNow: now,
        injectedQueryRef: queryRef,
        injectedStorageSubmit: storageSubmit,
        injectedSubmit: submit
      }
    );
    await page.route("**/order-import/**", async (route, request) => {
      const sourceUrl = new URL(request.url());
      const postData = request.postData() ?? undefined;
      await onApiRequest?.({
        method: request.method(),
        path: sourceUrl.pathname,
        postData
      });
      const response = await route.fetch({
        headers: {
          authorization: "Bearer m4-order-import-synthetic-token",
          "content-type": request.headers()["content-type"] ?? "application/json",
          "x-tenant-id": runtime.fixture.tenantAId,
          "x-uzmax-smoke-permissions": permissions
        },
        method: request.method(),
        postData,
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

export async function waitForCapturedApiPostBody(capturedBodies) {
  const deadline = Date.now() + 10_000;
  while (Date.now() <= deadline) {
    if (capturedBodies.length > 0) return;
    await delay(100);
  }
}

export function createSupabaseStorageSmokeClient({ secretKey, url }) {
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket }
  });
}

export async function prepareSupabaseStorageObject(storageClient, input) {
  const createResult = await storageClient.storage.createBucket(input.bucketId, {
    public: false
  });
  if (createResult.error && !/already exists/i.test(createResult.error.message)) {
    throw new Error(`create storage bucket: ${createResult.error.message}`);
  }

  await ensureNoStorageError(
    `upload ${input.objectPath}`,
    await storageClient.storage
      .from(input.bucketId)
      .upload(input.objectPath, Buffer.from(input.content, "utf8"), {
        contentType: input.contentType,
        upsert: true
      })
  );
}

export async function downloadSupabaseStorageObject(storageClient, input) {
  const result = await storageClient.storage
    .from(input.bucketId)
    .download(input.objectPath);
  await ensureNoStorageError(`download ${input.objectPath}`, result);
  return new Uint8Array(await result.data.arrayBuffer());
}

export async function cleanupSupabaseStorageObject(storageClient, input) {
  const result = await storageClient.storage
    .from(input.bucketId)
    .remove([input.objectPath]);
  if (result.error && !/not found|does not exist/i.test(result.error.message)) {
    throw new Error(`remove ${input.objectPath}: ${result.error.message}`);
  }
}

export async function supabaseStorageObjectResidueCount(storageClient, input) {
  const prefix = input.objectPath.split("/").slice(0, -1).join("/");
  const fileName = input.objectPath.split("/").at(-1);
  const result = await storageClient.storage.from(input.bucketId).list(prefix);
  await ensureNoStorageError(`list ${prefix}`, result);
  return result.data.filter((item) => item.name === fileName).length;
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

async function ensureNoStorageError(action, result) {
  if (result.error) throw new Error(`${action}: ${result.error.message}`);
}

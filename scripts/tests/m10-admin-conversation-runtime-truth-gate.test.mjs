import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const read = (path) => readFileSync(path, "utf8");

const files = {
  adminConfig: read("apps/admin/src/adminRuntimeConfig.ts"),
  conversationClient: read(
    "apps/admin/src/pages/conversations/conversationWorkbenchClient.ts"
  ),
  conversationRuntime: read(
    "apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts"
  ),
  spec: read("docs/specs/M10-02-admin-conversation-runtime-truth-gate.md")
};
const adminConfigModule = await transpileTsModule(
  "apps/admin/src/adminRuntimeConfig.ts"
);
const conversationClientModule = await transpileTsModule(
  "apps/admin/src/pages/conversations/conversationWorkbenchClient.ts"
);

test("M10-02 spec preserves the runtime truth gate scope", () => {
  assert.match(files.spec, /Spec ID: M10-02/);
  assert.match(files.spec, /VITE_UZMAX_API_BASE_URL/);
  assert.match(files.spec, /VITE_UZMAX_RUNTIME_STRICT=true/);
  assert.match(files.spec, /No backend, schema, migration/);
  assert.match(files.spec, /Commit history shows spec\/evidence preflight/);
});

test("admin runtime config derives strict runtime from API base or explicit env flag", () => {
  assert.match(files.adminConfig, /strictRuntime: boolean/);
  assert.match(files.adminConfig, /const apiBaseUrl = normalizeApiBaseUrl/);
  assert.match(
    files.adminConfig,
    /strictRuntime: Boolean\(apiBaseUrl\) \|\| envFlag\(env\.VITE_UZMAX_RUNTIME_STRICT\)/
  );
  assert.match(files.adminConfig, /function envFlag/);
  assert.match(files.adminConfig, /\.toLowerCase\(\) === "true"/);
});

test("admin runtime fetcher uses the selected tenant and fails closed in strict runtime", () => {
  assert.match(
    files.adminConfig,
    /export function createAdminRuntimeFetcher\([\s\S]*options: AdminRuntimeFetcherOptions = \{\}[\s\S]*\) \{/
  );
  assert.match(files.adminConfig, /selectedTenantId\?: string/);
  assert.match(
    files.adminConfig,
    /runtimeTenantHeader\(config, options\.selectedTenantId\)/
  );
  assert.match(files.adminConfig, /headers\.set\("x-tenant-id", tenantId\)/);
  assert.doesNotMatch(
    files.adminConfig,
    /headers\.set\("x-tenant-id", config\.tenants\[0\]\.id\)/
  );
  assert.doesNotMatch(files.adminConfig, /config\.tenants\?\.\[0\]\?\.id/);
  assert.match(
    files.adminConfig,
    /admin runtime selected tenant is required in strict runtime/
  );
  assert.match(
    files.adminConfig,
    /admin runtime tenant configuration is required in strict runtime/
  );
  assert.match(
    files.adminConfig,
    /selected tenant \$\{tenantId\} is not configured for strict runtime/
  );
  assert.match(files.adminConfig, /if \(!config\.strictRuntime\) return tenantId/);
});

test("admin runtime fetcher behavior sends selected tenant and fails closed", async () => {
  const calls = [];
  const previousWindow = globalThis.window;
  globalThis.window = {
    fetch: async (url, init = {}) => {
      calls.push({ headers: init.headers, url });
      return { json: async () => ({ ok: true }), ok: true, status: 200 };
    },
    sessionStorage: {
      getItem: () => "runtime-token"
    }
  };

  try {
    const fetcher = adminConfigModule.createAdminRuntimeFetcher(
      runtimeConfig({ strictRuntime: true }),
      { selectedTenantId: "tenant-b" }
    );
    await fetcher("/conversation-ticket/conversations");
    assert.equal(
      calls[0].url,
      "https://api.example.test/conversation-ticket/conversations"
    );
    assert.equal(calls[0].headers.get("x-org-id"), "org-123");
    assert.equal(calls[0].headers.get("x-tenant-id"), "tenant-b");
    assert.equal(calls[0].headers.get("authorization"), "Bearer runtime-token");

    const missingTenantFetcher = adminConfigModule.createAdminRuntimeFetcher(
      runtimeConfig({ strictRuntime: true })
    );
    assert.throws(
      () => missingTenantFetcher("/conversation-ticket/conversations"),
      /selected tenant is required/
    );

    const invalidTenantFetcher = adminConfigModule.createAdminRuntimeFetcher(
      runtimeConfig({ strictRuntime: true }),
      { selectedTenantId: "tenant-x" }
    );
    assert.throws(
      () => invalidTenantFetcher("/conversation-ticket/conversations"),
      /not configured for strict runtime/
    );

    const localFetcher = adminConfigModule.createAdminRuntimeFetcher(
      runtimeConfig({ apiBaseUrl: "", strictRuntime: false, tenants: undefined })
    );
    await localFetcher("/conversation-ticket/conversations");
    assert.equal(calls[1].url, "/conversation-ticket/conversations");
    assert.equal(calls[1].headers.has("x-tenant-id"), false);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("conversation client no longer captures a module-level browser fetcher", () => {
  assert.doesNotMatch(files.conversationClient, /const browserFetcher/);
  assert.doesNotMatch(files.conversationClient, /createAdminRuntimeFetcher\(\)/);
  assert.match(
    files.conversationClient,
    /export function createConversationClient\(fetcher: ApiFetcher\)/
  );
});

test("strict runtime disables synthetic fallback while local preview keeps it", () => {
  assert.match(
    files.conversationClient,
    /canUseSyntheticFallback\(error: unknown, config: AdminRuntimeConfig\)/
  );
  assert.match(files.conversationClient, /if \(config\.strictRuntime\) return false/);
  assert.match(
    files.conversationClient,
    /error instanceof PreviewRuntimeUnavailableError\) return true/
  );
  assert.match(files.conversationClient, /failed to fetch\|load failed/);
  assert.match(files.conversationRuntime, /canUseSyntheticFallback\(error, config\)/);
});

test("synthetic fallback gate behaves differently in strict and local runtime", () => {
  const networkError = new TypeError("Failed to fetch");
  assert.equal(
    conversationClientModule.canUseSyntheticFallback(
      networkError,
      runtimeConfig({ strictRuntime: true })
    ),
    false
  );
  assert.equal(
    conversationClientModule.canUseSyntheticFallback(
      networkError,
      runtimeConfig({ apiBaseUrl: "", strictRuntime: false, tenants: undefined })
    ),
    true
  );
});

test("workbench creates its API client from the current selected tenant", () => {
  assert.match(files.conversationRuntime, /readAdminRuntimeConfig/);
  assert.match(files.conversationRuntime, /createAdminRuntimeFetcher/);
  assert.match(
    files.conversationRuntime,
    /createAdminRuntimeFetcher\(config, \{ selectedTenantId \}\)/
  );
  assert.match(files.conversationRuntime, /\[config, selectedTenantId\]/);
});

function runtimeConfig(overrides = {}) {
  return {
    apiBaseUrl: "https://api.example.test",
    env: "staging",
    orgId: "org-123",
    strictRuntime: true,
    supabasePublishableKey: "",
    supabaseUrl: "",
    tenants: [tenant("tenant-a"), tenant("tenant-b")],
    ...overrides
  };
}

function tenant(id) {
  return {
    health: "healthy",
    id,
    line: "runtime tenant",
    name: id,
    risk: "none",
    status: "运行中"
  };
}

async function transpileTsModule(relativePath) {
  const ts = await importTypescript();
  const source = read(relativePath);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022
    }
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}

async function importTypescript() {
  try {
    return await import("typescript");
  } catch {
    const commonDir = execFileSync("git", ["rev-parse", "--git-common-dir"], {
      encoding: "utf8"
    }).trim();
    const packageRoot = commonDir.endsWith(".git")
      ? dirname(resolve(commonDir))
      : process.cwd();
    const requireFromRoot = createRequire(join(packageRoot, "package.json"));
    return import(pathToFileURL(requireFromRoot.resolve("typescript")).href);
  }
}

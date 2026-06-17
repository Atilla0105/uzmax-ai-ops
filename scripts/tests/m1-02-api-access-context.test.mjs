import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { URL } from "node:url";

import ts from "typescript";

const repoRoot = process.cwd();
const fetchApi = globalThis.fetch;
const authzUrl = await transpileModule("packages/authz/src/index.ts");
const dbUrl = await transpileModule("packages/db/src/index.ts");
const apiCoreUrl = await transpileModule("apps/api/src/access-context-core.ts", {
  "../../../packages/authz/src/index.ts": authzUrl,
  "../../../packages/db/src/index.ts": dbUrl
});
const apiCore = await import(apiCoreUrl);
const { importApiRuntime } = await import(
  new URL("../../apps/api/scripts/runtime-compiler.mjs", import.meta.url)
);
const apiAdapterSource = read("apps/api/src/access-context.ts");

describe("M1-02 API access context shell", () => {
  it("fails closed on token, tenant, permission, and switch boundaries", async () => {
    const facts = {
      permissionGrants: [
        grant("tenant-a", "tenant:read"),
        grant("tenant-a", "tenant:switch")
      ],
      tenantMemberships: [
        membership("tenant-a", "active", 7),
        membership("tenant-b", "revoked", 2)
      ]
    };
    const auditSink = new apiCore.InMemoryAuditSink();
    const verifier = {
      async verifyBearerToken(token) {
        if (token === "valid-token-with-ignored-claims") return { userId: "user-1" };
        throw new apiCore.ApiAccessError(401, "invalid token");
      }
    };
    const repository = {
      async loadAccessContextFacts(request) {
        assert.equal(request.userId, "user-1");
        return facts;
      }
    };
    const service = new apiCore.ApiAccessContextCore(verifier, repository, auditSink);

    assert.deepEqual(service.health(), { service: "api", status: "ok" });
    assert.equal(JSON.stringify(service.readiness()).includes("SUPABASE"), false);
    assert.equal(service.readiness().status, "ready");

    const request = apiRequest("tenant-a");
    const context = await service.loadContextForRequest(request);
    assert.equal(context.selectedTenantId, "tenant-a");
    assert.equal(context.membershipVersion, 7);
    assert.deepEqual(context.permissions, ["tenant:read", "tenant:switch"]);
    assert.equal(request.accessContext?.userId, "user-1");

    await rejectsStatus(
      () => service.loadContextForRequest(apiRequest("tenant-a", "")),
      401
    );
    await rejectsStatus(
      () => service.loadContextForRequest(apiRequest("tenant-a", "bad-token")),
      401
    );
    await rejectsStatus(
      () => service.loadContextForRequest(apiRequest("tenant-b")),
      403
    );
    await rejectsStatus(
      () => service.loadContextForRequest(apiRequest("tenant-z")),
      403
    );
    assert.equal(auditSink.events.at(-1)?.eventType, "access_context.denied");

    facts.tenantMemberships = [membership("tenant-a", "active", 8)];
    const refreshed = await service.loadContextForRequest(apiRequest("tenant-a"));
    assert.equal(refreshed.membershipVersion, 8);

    assert.throws(() => service.assertPermission(context, "admin:write"), {
      message: "permission is not granted",
      statusCode: 403
    });

    const switched = await service.switchTenant(apiRequest("tenant-a"), "tenant-a");
    assert.equal(switched.accessContext.selectedTenantId, "tenant-a");
    assert.deepEqual(switched.rls.settings, [
      { key: "app.org_id", value: "org-1" },
      { key: "app.tenant_id", value: "tenant-a" }
    ]);
    assert.equal(auditSink.events.at(-1)?.eventType, "tenant_switch.allowed");

    facts.permissionGrants = [grant("tenant-a", "tenant:read")];
    await rejectsStatus(
      () => service.switchTenant(apiRequest("tenant-a"), "tenant-a"),
      403
    );
    assert.equal(auditSink.events.at(-1)?.eventType, "tenant_switch.denied");

    const staleRequest = apiRequest("tenant-a");
    staleRequest.accessContext = context;
    await rejectsStatus(() => service.switchTenant(staleRequest, "tenant-b"), 403);
    assert.equal("accessContext" in staleRequest, false);
    assert.equal(auditSink.events.at(-1)?.eventType, "tenant_switch.denied");
  });

  it("boots the Nest HTTP shell and fails readiness closed by default", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousPort = process.env.PORT;
    process.env.NODE_ENV = "test";
    process.env.PORT = "0";

    const { bootstrap } = await importApiRuntime();
    const app = await bootstrap();

    try {
      const baseUrl = await app.getUrl();
      const health = await fetchApi(`${baseUrl}/healthz`);
      assert.equal(health.status, 200);
      assert.deepEqual(await health.json(), { service: "api", status: "ok" });

      const readiness = await fetchApi(`${baseUrl}/readyz`);
      const readinessBody = await readiness.text();
      assert.equal(readiness.status, 503);
      assert.match(readinessBody, /not_ready/);
      assert.doesNotMatch(readinessBody, /SUPABASE|postgres:\/\//i);

      const protectedRoute = await fetchApi(
        `${baseUrl}/me/access-context?tenant_id=tenant-a`
      );
      assert.equal(protectedRoute.status, 401);
    } finally {
      await app.close();
      restoreEnv("NODE_ENV", previousNodeEnv);
      restoreEnv("PORT", previousPort);
    }
  });

  it("keeps Nest adapter wired to guard and Supabase identity contract", () => {
    assert.match(apiAdapterSource, /@UseGuards\(ApiAccessContextGuard\)/);
    assert.match(apiAdapterSource, /auth\.getUser\(token\)/);
    assert.match(apiAdapterSource, /createIdentityVerifierFromEnv/);
    assert.doesNotMatch(apiAdapterSource, /user_metadata|permissions.*jwt/i);
  });

  it("does not add raw export, jsonl, or csv sample artifacts", () => {
    const forbidden = listRepoFiles().filter((file) => {
      return (
        /\.(?:csv|jsonl)$/i.test(file) || /(?:^|\/)(?:raw|export)[^/]*$/i.test(file)
      );
    });

    assert.deepEqual(forbidden, []);
  });
});

async function transpileModule(relativePath, replacements = {}) {
  let source = read(relativePath);
  for (const [from, to] of Object.entries(replacements)) {
    source = source.replaceAll(from, to);
  }

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  const encoded = Buffer.from(outputText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function listRepoFiles(current = "") {
  return readdirSync(path.join(repoRoot, current), { withFileTypes: true }).flatMap(
    (entry) => {
      if (ignoredDirectory(entry.name)) return [];

      const relativePath = path.posix.join(current, entry.name);
      if (entry.isDirectory()) return listRepoFiles(relativePath);
      return relativePath;
    }
  );
}

function ignoredDirectory(name) {
  return [".git", "node_modules", "dist", "build", "coverage", "test-results"].includes(
    name
  );
}

function apiRequest(tenantId, token = "valid-token-with-ignored-claims") {
  return {
    body: { tenant_id: tenantId },
    headers: token ? { authorization: `Bearer ${token}`, "x-tenant-id": tenantId } : {},
    query: {}
  };
}

function membership(tenantId, status, cacheVersion) {
  return {
    cacheVersion,
    orgId: "org-1",
    role: "member",
    status,
    tenantId,
    userId: "user-1"
  };
}

function grant(tenantId, permission) {
  return {
    orgId: "org-1",
    permission,
    tenantId,
    userId: "user-1"
  };
}

async function rejectsStatus(action, statusCode) {
  try {
    await action();
  } catch (error) {
    assert.equal(error?.statusCode ?? 500, statusCode);
    return;
  }

  throw new Error("expected rejection");
}

function restoreEnv(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

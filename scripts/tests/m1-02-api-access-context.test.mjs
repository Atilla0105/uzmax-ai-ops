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
const ORG_1 = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TENANT_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const TENANT_Z = "99999999-9999-4999-8999-999999999999";
const USER_1 = "22222222-2222-4222-8222-222222222222";
const USER_2 = "33333333-3333-4333-8333-333333333333";
const VERSION_1 = "44444444-4444-4444-8444-444444444441";
const VERSION_2 = "44444444-4444-4444-8444-444444444442";
const VERSION_3 = "44444444-4444-4444-8444-444444444443";
const VERSION_4 = "44444444-4444-4444-8444-444444444444";
const VERSION_5 = "44444444-4444-4444-8444-444444444445";

describe("M1-02 API access context shell", () => {
  it("fails closed on token, tenant, permission, and switch boundaries", async () => {
    const facts = {
      permissionGrants: [
        grant(TENANT_A, "tenant:read"),
        grant(TENANT_A, "tenant:switch")
      ],
      tenantMemberships: [
        membership(TENANT_A, "active", 7),
        membership(TENANT_B, "revoked", 2)
      ]
    };
    const auditSink = new apiCore.InMemoryAuditSink();
    const verifier = {
      async verifyBearerToken(token) {
        if (token === "valid-token-with-ignored-claims") return { userId: USER_1 };
        throw new apiCore.ApiAccessError(401, "invalid token");
      }
    };
    const repository = {
      async loadAccessContextFacts(request) {
        assert.equal(request.userId, USER_1);
        return facts;
      }
    };
    const service = new apiCore.ApiAccessContextCore(verifier, repository, auditSink);

    assert.deepEqual(service.health(), { service: "api", status: "ok" });
    assert.equal(JSON.stringify(service.readiness()).includes("SUPABASE"), false);
    assert.equal(service.readiness().status, "ready");

    const request = apiRequest(TENANT_A);
    const context = await service.loadContextForRequest(request);
    assert.equal(context.selectedTenantId, TENANT_A);
    assert.equal(context.membershipVersion, 7);
    assert.deepEqual(context.permissions, ["tenant:read", "tenant:switch"]);
    assert.equal(request.accessContext?.userId, USER_1);

    await rejectsStatus(
      () => service.loadContextForRequest(apiRequest(TENANT_A, "")),
      401
    );
    await rejectsStatus(
      () => service.loadContextForRequest(apiRequest(TENANT_A, "bad-token")),
      401
    );
    await rejectsStatus(() => service.loadContextForRequest(apiRequest(TENANT_B)), 403);
    await rejectsStatus(() => service.loadContextForRequest(apiRequest(TENANT_Z)), 403);
    assert.equal(auditSink.events.at(-1)?.eventType, "access_context.denied");

    facts.tenantMemberships = [membership(TENANT_A, "active", 8)];
    const refreshed = await service.loadContextForRequest(apiRequest(TENANT_A));
    assert.equal(refreshed.membershipVersion, 8);

    assert.throws(() => service.assertPermission(context, "admin:write"), {
      message: "permission is not granted",
      statusCode: 403
    });

    await exerciseTenantSwitchBoundaries(service, facts, context, auditSink);
  });

  it("records M1-04 permission and config version audit contracts", async () => {
    const auditSink = new apiCore.InMemoryAuditSink();
    const verifier = {
      async verifyBearerToken() {
        return { userId: USER_1 };
      }
    };
    const facts = {
      permissionGrants: [
        grant(TENANT_A, "config:rollback"),
        grant(TENANT_A, "config:write"),
        grant(TENANT_A, "permission:write")
      ],
      tenantMemberships: [membership(TENANT_A, "active", 9)]
    };
    const service = new apiCore.ApiAccessContextCore(
      verifier,
      {
        async loadAccessContextFacts() {
          return facts;
        }
      },
      auditSink
    );

    const permissionAudit = await service.recordPermissionChange(apiRequest(TENANT_A), {
      after: { granted: true },
      before: { granted: false },
      permission: "config:write",
      targetUserId: USER_2,
      traceId: "trace-permission"
    });
    assert.equal(permissionAudit.auditEvent.eventType, "permission_grant.changed");
    assert.equal(permissionAudit.auditEvent.actorUserId, USER_1);
    assert.deepEqual(permissionAudit.auditEvent.content, {
      after: { granted: true },
      before: { granted: false }
    });

    const saved = await service.recordConfigVersionSave(apiRequest(TENANT_A), {
      domain: "feature_flag",
      key: "business-toggle",
      payload: { enabled: false },
      previousVersionId: VERSION_1,
      version: 2,
      versionId: VERSION_2
    });
    assert.equal(saved.configVersion.status, "draft");
    assert.equal(saved.auditEvent.eventType, "config_version.saved");
    assert.equal(saved.auditEvent.beforeVersionId, VERSION_1);
    assert.equal(saved.auditEvent.afterVersionId, VERSION_2);
    assert.deepEqual(saved.auditEvent.content.before, { versionId: VERSION_1 });

    const rollback = await service.recordConfigVersionRollback(apiRequest(TENANT_A), {
      domain: "business_config",
      key: "sla-policy",
      payload: { restoredFrom: VERSION_3 },
      reason: "operator rollback",
      rollbackOfVersionId: VERSION_3,
      version: 4,
      versionId: VERSION_4
    });
    assert.equal(rollback.configVersion.status, "active");
    assert.equal(rollback.auditEvent.eventType, "config_version.rollback_requested");
    assert.equal(rollback.auditEvent.beforeVersionId, VERSION_3);
    assert.equal(rollback.auditEvent.afterVersionId, VERSION_4);

    facts.permissionGrants = [grant(TENANT_A, "config:write")];
    await rejectsStatus(
      () =>
        service.recordConfigVersionRollback(apiRequest(TENANT_A), {
          domain: "business_config",
          key: "sla-policy",
          payload: { restoredFrom: VERSION_4 },
          rollbackOfVersionId: VERSION_4,
          version: 5,
          versionId: VERSION_5
        }),
      403
    );
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
        `${baseUrl}/me/access-context?tenant_id=${TENANT_A}`
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
    orgId: ORG_1,
    role: "member",
    status,
    tenantId,
    userId: USER_1
  };
}

function grant(tenantId, permission) {
  return {
    orgId: ORG_1,
    permission,
    tenantId,
    userId: USER_1
  };
}

async function exerciseTenantSwitchBoundaries(service, facts, context, auditSink) {
  const switched = await service.switchTenant(apiRequest(TENANT_A), TENANT_A);
  assert.equal(switched.accessContext.selectedTenantId, TENANT_A);
  assert.deepEqual(switched.rls.settings, [
    { key: "app.org_id", value: ORG_1 },
    { key: "app.tenant_id", value: TENANT_A }
  ]);
  assert.deepEqual(auditSink.events.at(-1)?.content?.after, {
    membershipVersion: 8,
    tenantId: TENANT_A
  });

  facts.permissionGrants = [grant(TENANT_A, "tenant:read")];
  await rejectsStatus(() => service.switchTenant(apiRequest(TENANT_A), TENANT_A), 403);
  assert.equal(auditSink.events.at(-1)?.module, "access");
  assert.deepEqual(auditSink.events.at(-1)?.content?.after, null);

  const staleRequest = apiRequest(TENANT_A);
  staleRequest.accessContext = context;
  await rejectsStatus(() => service.switchTenant(staleRequest, TENANT_B), 403);
  assert.equal("accessContext" in staleRequest, false);
  assert.equal(auditSink.events.at(-1)?.eventType, "tenant_switch.denied");
  assert.deepEqual(auditSink.events.at(-1)?.content?.before?.targetTenantId, TENANT_B);
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

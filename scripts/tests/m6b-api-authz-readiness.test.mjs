import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111629";
const TENANT_A = "22222222-2222-4222-8222-222222222629";
const TENANT_B = "33333333-3333-4333-8333-333333333629";
const USER_ID = "44444444-4444-4444-8444-444444444629";
const DATABASE_URL = "synthetic-db-url-m6b-10";
const appModuleSource = read("apps/api/src/app.module.ts");
const accessContextSource = read("apps/api/src/access-context.ts");
const spec = read("docs/specs/M6B-10-api-staging-identity-authz-readiness.md");
const evidence = read(
  "docs/evidence/M6B/M6B-10-api-staging-identity-authz-readiness.md"
);
const m6bIndex = read("docs/evidence/M6B/README.md");
const authzUrl = await transpileModule("packages/authz/src/index.ts");
const dbIndexUrl = await transpileModule("packages/db/src/index.ts");
const nestCommonUrl = await transpileText(`
export class BadRequestException extends Error {}
export function Body() { return () => undefined; }
export function Controller() { return () => undefined; }
export class ForbiddenException extends Error {}
export function Get() { return () => undefined; }
export function Inject() { return () => undefined; }
export function Injectable() { return () => undefined; }
export function Post() { return () => undefined; }
export function Req() { return () => undefined; }
export class ServiceUnavailableException extends Error {
  constructor(response) {
    super("ServiceUnavailableException");
    this.response = response;
    this.status = 503;
  }
}
export function SetMetadata() { return () => undefined; }
export class UnauthorizedException extends Error {}
export function UseGuards() { return () => undefined; }
`);
const nestCoreUrl = await transpileText(
  `export class Reflector { get() { return undefined; } }`
);
const supabaseUrl = await transpileText(`
export function createClient() {
  return { auth: { getUser: async () => ({ data: {}, error: new Error("stub") }) } };
}
`);
const dbRuntimeUrl = await transpileText(`
export function createUzmaxPrismaClientFromEnv(env = {}) {
  const databaseUrl = env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("UZMAX_RLS_DATABASE_URL is required for Prisma runtime");
  globalThis.__m6b_10_database_url = databaseUrl;
  return globalThis.__m6b_10_prisma_client;
}
`);
const apiCoreUrl = await transpileModule("apps/api/src/access-context-core.ts", {
  "../../../packages/authz/src/index.ts": authzUrl,
  "../../../packages/db/src/index.ts": dbIndexUrl
});
const apiAdapterUrl = await transpileModule("apps/api/src/access-context.ts", {
  "@nestjs/common": nestCommonUrl,
  "@nestjs/core": nestCoreUrl,
  "@supabase/supabase-js": supabaseUrl,
  "../../../packages/authz/src/index.ts": authzUrl,
  "../../../packages/db/src/prisma-runtime.ts": dbRuntimeUrl,
  "./access-context-core.ts": apiCoreUrl
});
const apiCore = await import(apiCoreUrl);
const apiAdapter = await import(apiAdapterUrl);
const authz = await import(authzUrl);

describe("M6B-10 API authz readiness provider wiring", () => {
  it("keeps default API readiness fail-closed without authz env", () => {
    const repository = apiAdapter.createAuthzRepositoryProviderFromEnv({ env: {} });
    const service = new apiAdapter.ApiAccessContextService(
      apiAdapter.createIdentityVerifierFromEnv({}),
      repository,
      new apiCore.InMemoryAuditSink()
    );
    const controller = new apiAdapter.ApiHealthController(service);

    assert.equal(service.readiness().status, "not_ready");
    assert.equal(service.readiness().checks.authz, "not_configured");
    assert.equal(service.readiness().checks.identity, "not_configured");
    assert.throws(() => controller.readiness(), { status: 503 });
  });

  it("reports configured readiness only when the DB-backed provider is explicit", () => {
    const disabled = apiAdapter.createAuthzRepositoryProviderFromEnv({ env: {} });
    assert.equal(disabled.readinessStatus(), "not_configured");
    assert.throws(
      () =>
        apiAdapter.createAuthzRepositoryProviderFromEnv({
          env: { UZMAX_API_AUTHZ_REPOSITORY_MODE: "rls_prisma_gateway" }
        }),
      /UZMAX_RLS_DATABASE_URL is required/
    );
    assert.throws(
      () =>
        apiAdapter.createAuthzRepositoryProviderFromEnv({
          env: { UZMAX_API_AUTHZ_REPOSITORY_MODE: "prisma_gateway" }
        }),
      /must use RLS Prisma gateway/
    );

    const prisma = fakePrisma();
    globalThis.__m6b_10_prisma_client = prisma;
    const repository = apiAdapter.createAuthzRepositoryProviderFromEnv({
      env: {
        UZMAX_API_AUTHZ_REPOSITORY_MODE: "rls_prisma_gateway",
        UZMAX_RLS_DATABASE_URL: DATABASE_URL
      }
    });
    const service = new apiCore.ApiAccessContextCore(
      {
        readinessStatus: () => "configured",
        verifyBearerToken: async () => ({ userId: USER_ID })
      },
      repository,
      new apiCore.InMemoryAuditSink()
    );

    assert.equal(repository.readinessStatus(), "configured");
    assert.equal(service.readiness().status, "ready");
    assert.equal(globalThis.__m6b_10_database_url, DATABASE_URL);
  });

  it("maps active DB memberships and grants while revoked rows fail closed", async () => {
    const prisma = fakePrisma();
    const repository = apiAdapter.createAuthzRepositoryProviderFromEnv({
      mode: "rls_prisma_gateway",
      prismaClient: prisma
    });

    const facts = await repository.loadAccessContextFacts({
      selectedTenantId: TENANT_A,
      userId: USER_ID
    });
    assert.deepEqual(facts.tenantMemberships, [
      membership(TENANT_A, "active", 7),
      membership(TENANT_B, "revoked", 3)
    ]);
    assert.deepEqual(facts.permissionGrants, [
      grant(TENANT_A, "logs:read"),
      grant(TENANT_A, "tenant:read")
    ]);
    assert.deepEqual(prisma.calls.permissionWhere, {
      tenantId: TENANT_A,
      tenantMember: { status: "ACTIVE" },
      userId: USER_ID
    });

    const context = await authz.resolveAccessContext(repository, {
      selectedTenantId: TENANT_A,
      userId: USER_ID
    });
    assert.deepEqual(context.permissions, ["logs:read", "tenant:read"]);
    assert.deepEqual(context.tenantIds, [TENANT_A]);

    await assert.rejects(
      () =>
        authz.resolveAccessContext(repository, {
          selectedTenantId: TENANT_B,
          userId: USER_ID
        }),
      /tenant membership is not active/
    );
    assert.deepEqual(
      prisma.calls.permissionQueries.map((where) => where.tenantId),
      [TENANT_A, TENANT_A, TENANT_B]
    );
  });

  it("documents and wires AppModule through the env-selected provider", () => {
    assert.match(accessContextSource, /createAuthzRepositoryProviderFromEnv/);
    assert.match(accessContextSource, /tenantMember\.findMany/);
    assert.match(accessContextSource, /permissionGrant\.findMany/);
    assert.match(accessContextSource, /UZMAX_API_AUTHZ_REPOSITORY_MODE/);
    assert.match(appModuleSource, /createAuthzRepositoryProviderFromEnv/);
    assert.doesNotMatch(
      appModuleSource,
      /provide:\s*api\.API_AUTHZ_REPOSITORY,\s*useClass:\s*api\.DisabledAuthzRepository/
    );
    assert.doesNotMatch(
      `${accessContextSource}\n${appModuleSource}`,
      /user_metadata|jwt.*permission|permission.*jwt/i
    );
    assert.match(spec, /M6B-10 API Staging Identity\/Authz Readiness/);
    assert.match(evidence, /implementation_ready_live_env_blocked/);
    assert.match(m6bIndex, /M6B-10/);
  });
});

function fakePrisma() {
  const calls = { permissionQueries: [] };
  const memberships = [
    {
      cacheVersion: 7,
      orgId: ORG_ID,
      role: "operator",
      status: "ACTIVE",
      tenantId: TENANT_A,
      userId: USER_ID
    },
    {
      cacheVersion: 3,
      orgId: ORG_ID,
      role: "operator",
      status: "REVOKED",
      tenantId: TENANT_B,
      userId: USER_ID
    }
  ];
  const grants = [grant(TENANT_A, "logs:read"), grant(TENANT_A, "tenant:read")];
  return {
    calls,
    permissionGrant: {
      findMany(args) {
        calls.permissionWhere = args.where;
        calls.permissionQueries.push(args.where);
        const selectedMembership = memberships.find((row) => {
          return (
            row.tenantId === args.where.tenantId &&
            row.userId === args.where.userId &&
            row.status === args.where.tenantMember.status
          );
        });
        return Promise.resolve(selectedMembership ? grants : []);
      }
    },
    tenantMember: {
      findMany(args) {
        calls.membershipWhere = args.where;
        return Promise.resolve(
          memberships.filter((row) => row.userId === args.where.userId)
        );
      }
    },
    async $transaction(operations) {
      return Promise.all(operations);
    }
  };
}

function membership(tenantId, status, cacheVersion) {
  return {
    cacheVersion,
    orgId: ORG_ID,
    role: "operator",
    status,
    tenantId,
    userId: USER_ID
  };
}

function grant(tenantId, permission) {
  return { orgId: ORG_ID, permission, tenantId, userId: USER_ID };
}

async function transpileModule(relativePath, replacements = {}) {
  let source = read(relativePath);
  for (const [from, to] of Object.entries(replacements)) {
    source = source.replaceAll(from, to);
  }
  return transpileText(source, relativePath);
}

async function transpileText(source, fileName = "inline.ts") {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName
  });
  const encoded = Buffer.from(outputText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

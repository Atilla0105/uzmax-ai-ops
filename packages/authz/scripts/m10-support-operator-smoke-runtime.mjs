import { randomBytes as defaultRandomBytes } from "node:crypto";
import { URL } from "node:url";

import {
  blockedStatus,
  hashPrefix,
  okStatus,
  runApiSmoke,
  runtimeBlocker
} from "./m10-support-operator-smoke-api.mjs";
import {
  cleanupSyntheticRows,
  seedSyntheticRows,
  syntheticResidueCount,
  upsertAccessFacts
} from "./m10-support-operator-smoke-db.mjs";

export { safeMessage } from "./m10-support-operator-smoke-api.mjs";

export const SUPPORT_OPERATOR_PERMISSIONS = Object.freeze([
  "tenant:read",
  "conversation:read",
  "ticket:write"
]);

const defaults = Object.freeze({
  apiBaseUrl: "https://uzmax-api-staging.onrender.com",
  email: "uzmax-support-operator-smoke@example.invalid",
  m9Email: "uzmax-ga0-employee-smoke@example.invalid",
  m9UserId: "90000000-0000-4000-8000-000000000906",
  orgId: "11111111-1111-4111-8111-111111111604",
  role: "support_operator",
  syntheticChannelId: "55555555-5555-4555-8555-555555551003",
  syntheticConversationId: "66666666-6666-4666-8666-666666661003",
  tenantId: "22222222-2222-4222-8222-222222222604",
  userId: "90000000-0000-4000-8000-000000001003"
});

const releaseBoundary = Object.freeze({
  ga0Opened: false,
  productionApproved: false,
  releaseOneApproved: false
});

export const helpText = `M10-03 support operator staging smoke
Usage: node packages/authz/scripts/run-m10-support-operator-smoke.mjs [--help]
Required env: UZMAX_SUPABASE_URL, UZMAX_SUPABASE_SECRET_KEY, UZMAX_SUPABASE_PUBLISHABLE_KEY, UZMAX_RLS_DATABASE_URL
Boundary: owner-gated synthetic staging only; success is not GA-0, 1.0 or production approval.`;

export async function runM10SupportOperatorSmoke(input = {}) {
  const config = readSupportOperatorConfig(input.env ?? process.env);
  let runtime;
  try {
    runtime = await stage("runtime-init", () => createRuntime(input, config));
    const authUser = await stage("auth-provision", () =>
      provisionAuthUser(runtime.supabaseAdmin, config, runtime.password)
    );
    const access = await stage("access-facts", () =>
      upsertAccessFacts(runtime.prisma, config, authUser.id)
    );
    const smoke = await stage("synthetic-smoke", () =>
      withCleanup(
        runtime.prisma,
        async () => {
          await cleanupSyntheticRows(runtime.prisma, config);
          await seedSyntheticRows(runtime.prisma, config);
          return runApiSmoke(runtime.fetchImpl, config, runtime.password);
        },
        config
      )
    );
    const residue = await stage("residue-check", () =>
      syntheticResidueCount(runtime.prisma, config)
    );
    return publicResult({ access, authUser, config, residue, smoke });
  } catch (error) {
    return blockedResult(config, error);
  } finally {
    if (runtime) await disconnectRuntime(runtime);
  }
}

export function readSupportOperatorConfig(env = process.env) {
  const email = envText(env.M10_03_SUPPORT_OPERATOR_EMAIL) || defaults.email;
  const userId = envText(env.M10_03_SUPPORT_OPERATOR_USER_ID) || defaults.userId;
  if (email === defaults.m9Email || userId === defaults.m9UserId) {
    throw new Error("M10-03 support operator must not reuse the M9 employee");
  }
  return {
    apiBaseUrl: envText(env.M10_03_API_BASE_URL) || defaults.apiBaseUrl,
    databaseUrl: requiredDatabaseUrlEnv(env, "UZMAX_RLS_DATABASE_URL"),
    email,
    orgId: envText(env.M10_03_ORG_ID) || defaults.orgId,
    permissions: [...SUPPORT_OPERATOR_PERMISSIONS],
    publishableKey: requiredEnv(env, "UZMAX_SUPABASE_PUBLISHABLE_KEY"),
    role: envText(env.M10_03_SUPPORT_OPERATOR_ROLE) || defaults.role,
    serviceRoleKey: requiredEnv(env, "UZMAX_SUPABASE_SECRET_KEY"),
    supabaseUrl: requiredEnv(env, "UZMAX_SUPABASE_URL"),
    syntheticChannelId: defaults.syntheticChannelId,
    syntheticConversationId: defaults.syntheticConversationId,
    tenantId: envText(env.M10_03_TENANT_ID) || defaults.tenantId,
    userId
  };
}

export function formatSupportOperatorResult(result) {
  return JSON.stringify(result, null, 2);
}

async function createRuntime(input, config) {
  return {
    fetchImpl: input.fetchImpl ?? globalThis.fetch,
    password:
      input.password ?? generatedPassword(input.randomBytes ?? defaultRandomBytes),
    ...(await createRuntimeClients(input, config))
  };
}

async function createRuntimeClients(input, config) {
  const [prisma, supabaseAdmin] = await Promise.all([
    input.prisma ?? loadPrismaClient(config.databaseUrl),
    input.supabaseAdmin ?? loadSupabaseAdmin(config)
  ]);
  return { prisma, shouldDisconnectPrisma: !input.prisma, supabaseAdmin };
}

async function loadSupabaseAdmin(config) {
  const module = await import("@supabase/supabase-js");
  return module.createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function loadPrismaClient(databaseUrl) {
  const module = await import("@prisma/client");
  return new module.PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: ["error"]
  });
}

async function provisionAuthUser(adminClient, config, password) {
  const existing = await adminClient.auth.admin.getUserById(config.userId);
  const attributes = authUserAttributes(config, password);
  if (existing.data?.user?.id) {
    const result = await adminClient.auth.admin.updateUserById(
      config.userId,
      attributes
    );
    await ensureNoSupabaseError("update support operator", result);
    return { id: config.userId, mode: "updated" };
  }
  if (isUnexpectedLookupError(existing.error)) {
    throw new Error(`lookup support operator: ${existing.error.message}`);
  }
  const result = await adminClient.auth.admin.createUser({
    ...attributes,
    id: config.userId
  });
  await ensureNoSupabaseError("create support operator", result);
  return { id: config.userId, mode: "created" };
}

function authUserAttributes(config, password) {
  return {
    app_metadata: {
      m10_03_support_operator_smoke: true,
      purpose: "support_write_smoke"
    },
    email: config.email,
    email_confirm: true,
    password,
    user_metadata: {
      m10_03_org_id: config.orgId,
      m10_03_tenant_id: config.tenantId,
      role: config.role
    }
  };
}

function isUnexpectedLookupError(error) {
  return error && !/not found|does not exist|no user/i.test(error.message ?? "");
}

async function withCleanup(prisma, run, config) {
  try {
    return await run();
  } finally {
    await cleanupSyntheticRows(prisma, config);
  }
}

async function stage(name, run) {
  try {
    return await run();
  } catch (error) {
    throw stagedError(name, error);
  }
}

function stagedError(name, error) {
  const wrapped =
    error && typeof error === "object" ? error : new Error("stage failed");
  wrapped.stage = wrapped.stage ?? name;
  return wrapped;
}

function publicResult({ access, authUser, config, residue, smoke }) {
  const ok = Boolean(smoke.ok) && residue === 0;
  return {
    authUser: {
      emailHashPrefix: hashPrefix(config.email),
      id: authUser.id,
      mode: authUser.mode
    },
    boundary: releaseBoundary,
    cleanup: { residue },
    exitCode: ok ? 0 : smoke.exitCode || 1,
    ok,
    operatorScope: operatorScope(config, access),
    provisioning: {
      orgMember: access.orgMember,
      permissionCount: access.permissionCount,
      tenantMember: access.tenantMember
    },
    smoke: publicSmoke(smoke),
    status: ok ? okStatus : blockedStatus
  };
}

function blockedResult(config, error) {
  const stageName = error?.stage ?? "runtime";
  return publicResult({
    access: {},
    authUser: { id: config.userId, mode: "unknown" },
    config,
    residue: "unknown",
    smoke: runtimeBlocker(stageName, `${stageName} failed`)
  });
}

function operatorScope(config, access = {}) {
  return {
    orgId: config.orgId,
    permissionCount: access.permissionCount ?? config.permissions.length,
    permissions: access.permissions ?? config.permissions,
    role: config.role,
    tenantId: config.tenantId,
    userId: config.userId
  };
}

function publicSmoke(smoke) {
  const safe = { ...smoke };
  for (const key of ["accessToken", "password", "payload", "token"]) delete safe[key];
  return safe;
}

async function disconnectRuntime(runtime) {
  if (runtime.shouldDisconnectPrisma && runtime.prisma?.$disconnect) {
    await runtime.prisma.$disconnect();
  }
}

async function ensureNoSupabaseError(label, result) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

function requiredEnv(env, name) {
  return requireText(env[name], `${name} is required`);
}

function requiredDatabaseUrlEnv(env, name) {
  const databaseUrl = requiredEnv(env, name);
  assertPostgresUrl(databaseUrl, name);
  return databaseUrl;
}

function assertPostgresUrl(value, name) {
  try {
    if (["postgres:", "postgresql:"].includes(new URL(value).protocol)) return;
  } catch {
    // handled by the fail-closed error below
  }
  throw new Error(`${name} must be a postgres URL`);
}

function generatedPassword(randomBytes = defaultRandomBytes) {
  return `${randomBytes(30).toString("base64url")}Aa1!`;
}

function requireText(value, message) {
  const textValue = envText(value);
  if (!textValue) throw new Error(message);
  return textValue;
}

function envText(value) {
  return typeof value === "string" ? value.trim() : "";
}

#!/usr/bin/env node
import { createHash, randomBytes as defaultRandomBytes } from "node:crypto";
import { URL, fileURLToPath } from "node:url";

import {
  formatSmokeResult,
  runEmployeeReadSmoke
} from "../../../scripts/run-m9-admin-employee-read-smoke.mjs";

const defaultAdminUrl = "https://uzmax-admin.vercel.app";
const defaultApiBaseUrl = "https://uzmax-api-staging.onrender.com";
const defaultEmployeeEmail = "uzmax-ga0-employee-smoke@example.invalid";
const defaultEmployeeRole = "owner_operator";
const defaultEmployeeUserId = "90000000-0000-4000-8000-000000000906";
const defaultOrgId = "11111111-1111-4111-8111-111111111604";
const defaultPermissions = ["tenant:read", "conversation:read"];
const defaultTenantId = "22222222-2222-4222-8222-222222222604";

const helpText = `M9-06 GA-0 employee provisioning smoke

Purpose:
- create or update one deterministic Supabase Auth smoke employee in dev/staging
- upsert the formal org/tenant membership and minimal permissions for M9-04
- run the M9-04 employee admin read smoke in the same process
- never print password, service role key, DB URL, raw auth response or customer text

Usage:
  node packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs --help
  node packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs

Required env:
- UZMAX_SUPABASE_URL
- UZMAX_SUPABASE_SECRET_KEY
- UZMAX_SUPABASE_PUBLISHABLE_KEY
- UZMAX_RLS_DATABASE_URL

Optional env:
- M9_06_EMPLOYEE_EMAIL (default: ${defaultEmployeeEmail})
- M9_06_EMPLOYEE_USER_ID (default: ${defaultEmployeeUserId})
- M9_06_EMPLOYEE_ROLE (default: ${defaultEmployeeRole})
- M9_06_ORG_ID (default: ${defaultOrgId})
- M9_06_TENANT_ID (default: ${defaultTenantId})
- M9_06_PERMISSIONS (default: ${defaultPermissions.join(",")})
- M9_06_ADMIN_URL (default: ${defaultAdminUrl})
- M9_06_API_BASE_URL (default: ${defaultApiBaseUrl})

Boundary:
- HTTP 200 from M9-04 is M9-04 evidence only, not GA-0 open
- this script does not approve 1.0, production traffic, customer LLM or AI-quality gates
`;

export async function runM906EmployeeProvisioning(input = {}) {
  const config = readProvisioningConfig(input.env ?? process.env);
  const runtime = await createProvisioningRuntime(input, config);

  try {
    const authUser = await provisionAuthUser(
      runtime.supabaseAdmin,
      config,
      runtime.password
    );
    const permissionWrites = await upsertAccessFacts(
      runtime.prisma,
      config,
      authUser.id
    );
    const smoke = await runtime.smokeRunner({
      live: true,
      env: smokeEnv(config, runtime.password)
    });

    return publicProvisioningResult({
      authUser,
      config,
      permissionWrites,
      smoke
    });
  } finally {
    await disconnectRuntime(runtime);
  }
}

async function createProvisioningRuntime(input, config) {
  return {
    password:
      input.password ?? generatedPassword(input.randomBytes ?? defaultRandomBytes),
    prisma: input.prisma ?? (await createPrismaClient(config)),
    shouldDisconnectPrisma: !input.prisma,
    smokeRunner: input.smokeRunner ?? runEmployeeReadSmoke,
    supabaseAdmin: input.supabaseAdmin ?? (await createSupabaseAdminClient(config))
  };
}

async function disconnectRuntime(runtime) {
  if (runtime.shouldDisconnectPrisma && runtime.prisma?.$disconnect) {
    await runtime.prisma.$disconnect();
  }
}

export function readProvisioningConfig(env = process.env) {
  return {
    adminUrl: envText(env.M9_06_ADMIN_URL) || defaultAdminUrl,
    apiBaseUrl: envText(env.M9_06_API_BASE_URL) || defaultApiBaseUrl,
    databaseUrl: requiredDatabaseUrlEnv(env, "UZMAX_RLS_DATABASE_URL"),
    email: envText(env.M9_06_EMPLOYEE_EMAIL) || defaultEmployeeEmail,
    orgId: envText(env.M9_06_ORG_ID) || defaultOrgId,
    permissions: permissionsFromEnv(env.M9_06_PERMISSIONS),
    publishableKey: requiredEnv(env, "UZMAX_SUPABASE_PUBLISHABLE_KEY"),
    role: envText(env.M9_06_EMPLOYEE_ROLE) || defaultEmployeeRole,
    serviceRoleKey: requiredEnv(env, "UZMAX_SUPABASE_SECRET_KEY"),
    supabaseUrl: requiredEnv(env, "UZMAX_SUPABASE_URL"),
    tenantId: envText(env.M9_06_TENANT_ID) || defaultTenantId,
    userId: envText(env.M9_06_EMPLOYEE_USER_ID) || defaultEmployeeUserId
  };
}

export function formatProvisioningResult(result) {
  return JSON.stringify(result, null, 2);
}

async function createSupabaseAdminClient(config) {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function createPrismaClient(config) {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient({
    datasources: { db: { url: config.databaseUrl } },
    log: ["error"]
  });
}

async function provisionAuthUser(adminClient, config, password) {
  const existing = await adminClient.auth.admin.getUserById(config.userId);
  if (existing.data?.user?.id) {
    await ensureNoSupabaseError(
      "update smoke employee",
      await adminClient.auth.admin.updateUserById(config.userId, {
        app_metadata: employeeAppMetadata(),
        email: config.email,
        email_confirm: true,
        password,
        user_metadata: employeeUserMetadata(config)
      })
    );
    return { id: config.userId, mode: "updated" };
  }

  if (existing.error && !isNotFoundAuthError(existing.error)) {
    throw new Error(`lookup smoke employee: ${existing.error.message}`);
  }

  await ensureNoSupabaseError(
    "create smoke employee",
    await adminClient.auth.admin.createUser({
      app_metadata: employeeAppMetadata(),
      email: config.email,
      email_confirm: true,
      id: config.userId,
      password,
      user_metadata: employeeUserMetadata(config)
    })
  );
  return { id: config.userId, mode: "created" };
}

function employeeAppMetadata() {
  return {
    m9_06_smoke_employee: true,
    purpose: "ga0_employee_admin_read_smoke"
  };
}

function employeeUserMetadata(config) {
  return {
    m9_06_org_id: config.orgId,
    m9_06_tenant_id: config.tenantId,
    role: config.role
  };
}

async function upsertAccessFacts(prisma, config, userId) {
  await prisma.$executeRaw`
    insert into org_member (org_id, user_id, role, status, cache_version)
    values (${config.orgId}::uuid, ${userId}::uuid, ${config.role}, 'active', 1)
    on conflict (org_id, user_id)
    do update set
      role = excluded.role,
      status = 'active',
      cache_version = org_member.cache_version + 1,
      updated_at = now()
  `;
  await prisma.$executeRaw`
    insert into tenant_member (org_id, tenant_id, user_id, role, status, cache_version)
    values (
      ${config.orgId}::uuid,
      ${config.tenantId}::uuid,
      ${userId}::uuid,
      ${config.role},
      'active',
      1
    )
    on conflict (org_id, tenant_id, user_id)
    do update set
      role = excluded.role,
      status = 'active',
      cache_version = tenant_member.cache_version + 1,
      updated_at = now()
  `;

  for (const permission of config.permissions) {
    await prisma.$executeRaw`
      insert into permission_grant (org_id, tenant_id, user_id, permission)
      values (
        ${config.orgId}::uuid,
        ${config.tenantId}::uuid,
        ${userId}::uuid,
        ${permission}
      )
      on conflict (org_id, tenant_id, user_id, permission) do nothing
    `;
  }

  return {
    orgMember: "upserted",
    permissionCount: config.permissions.length,
    tenantMember: "upserted"
  };
}

function smokeEnv(config, password) {
  return {
    UZMAX_ADMIN_EMPLOYEE_EMAIL: config.email,
    UZMAX_ADMIN_EMPLOYEE_PASSWORD: password,
    UZMAX_ADMIN_URL: config.adminUrl,
    UZMAX_API_BASE_URL: config.apiBaseUrl,
    UZMAX_ORG_ID: config.orgId,
    UZMAX_SUPABASE_PUBLISHABLE_KEY: config.publishableKey,
    UZMAX_SUPABASE_URL: config.supabaseUrl,
    UZMAX_TENANT_ID: config.tenantId
  };
}

function publicProvisioningResult({ authUser, config, permissionWrites, smoke }) {
  const ok = Boolean(smoke.ok);
  return {
    authUser: {
      emailHashPrefix: hashPrefix(config.email),
      id: authUser.id,
      mode: authUser.mode
    },
    boundary: {
      aiQualityGatesPassed: false,
      ga0Opened: false,
      productionApproved: false,
      releaseOneApproved: false
    },
    employeeScope: {
      orgId: config.orgId,
      permissionCount: permissionWrites.permissionCount,
      role: config.role,
      tenantId: config.tenantId
    },
    exitCode: ok ? 0 : smoke.exitCode || 1,
    ok,
    provisioning: permissionWrites,
    smoke: publicSmokeResult(smoke),
    status: ok
      ? "m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open"
      : "m9_06_employee_account_provisioned_m9_04_live_blocked_not_ga0"
  };
}

function publicSmokeResult(smoke) {
  return JSON.parse(formatSmokeResult(smoke));
}

function permissionsFromEnv(value) {
  const permissions = envText(value)
    ? envText(value)
        .split(",")
        .map((permission) => permission.trim())
        .filter(Boolean)
    : defaultPermissions;
  return [...new Set(permissions)].sort();
}

function generatedPassword(randomBytes = defaultRandomBytes) {
  return `${randomBytes(30).toString("base64url")}Aa1!`;
}

async function ensureNoSupabaseError(label, result) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

function isNotFoundAuthError(error) {
  return /not found|does not exist|no user/i.test(error.message ?? "");
}

function requiredEnv(env, name) {
  const value = envText(env[name]);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function requiredDatabaseUrlEnv(env, name) {
  const value = requiredEnv(env, name);
  if (!isPostgresUrl(value)) throw new Error(`${name} must be a postgres URL`);
  return value;
}

function isPostgresUrl(value) {
  try {
    return ["postgres:", "postgresql:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function hashPrefix(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function envText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) return { help: true };
  if (argv.length > 0) throw new Error(`unsupported argument: ${argv.join(" ")}`);
  return { help: false };
}

function errorMessage(error) {
  return error instanceof Error && error.message ? error.message : "unknown error";
}

function isMainModule() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log(helpText.trimEnd());
    } else {
      const result = await runM906EmployeeProvisioning();
      console.log(formatProvisioningResult(result));
      process.exitCode = result.exitCode;
    }
  } catch (error) {
    console.error(errorMessage(error));
    process.exitCode = 1;
  }
}

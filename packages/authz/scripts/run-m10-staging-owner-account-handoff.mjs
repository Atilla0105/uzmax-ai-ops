#!/usr/bin/env node
import { createHash } from "node:crypto";
import { fileURLToPath, URL } from "node:url";

export const OWNER_OPERATOR_PERMISSIONS = Object.freeze(
  "ai_member:read ai_member:write config:rollback config:write confirmation:read confirmation:write conversation:read customer:read customer:write logs:export logs:read order:read order:write permission:write template:write tenant:read tenant:switch ticket:write".split(
    " "
  )
);

const settings = Object.freeze({
  actorUserId: "80000000-0000-4000-8000-000000001008",
  orgId: "11111111-1111-4111-8111-111111111604",
  redirectTo: "https://uzmax-admin.vercel.app/",
  role: "owner_operator",
  tenantId: "22222222-2222-4222-8222-222222222604"
});
const emptyCounts = Object.freeze({
  auditRowsWritten: 0,
  membershipRowsUpserted: 0,
  permissionsAfter: 0,
  permissionsBefore: 0
});

export async function runM1008OwnerAccountHandoff(input = {}) {
  const config = readOwnerHandoffConfig(input.env ?? process.env);
  const emailHash = hashPrefix(config.email);
  const runtime = await createRuntime(input, config);

  try {
    const authHandoff = await provisionAuthHandoff(runtime, config);
    const counts = await replaceAccessFacts(runtime.prisma, config, authHandoff);
    return {
      counts,
      emailHash,
      emailRequestStatus: authHandoff.emailRequestStatus,
      status: "m10_08_owner_access_ready_for_email_acceptance"
    };
  } catch (error) {
    return {
      counts: emptyCounts,
      emailHash,
      emailRequestStatus: error?.emailRequestStatus ?? "not_requested",
      status: error?.publicStatus ?? "m10_08_runtime_failed"
    };
  } finally {
    if (runtime.shouldDisconnectPrisma) await runtime.prisma.$disconnect();
  }
}

export function readOwnerHandoffConfig(env = process.env) {
  const email = normalizeEmail(requiredEnv(env, "UZMAX_STAGING_OWNER_EMAIL"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("UZMAX_STAGING_OWNER_EMAIL is invalid");
  }
  return {
    databaseUrl: requiredDatabaseUrl(env),
    email,
    orgId: settings.orgId,
    permissions: [...OWNER_OPERATOR_PERMISSIONS],
    publishableKey: requiredEnv(env, "UZMAX_SUPABASE_PUBLISHABLE_KEY"),
    redirectTo: settings.redirectTo,
    role: settings.role,
    serviceRoleKey: requiredEnv(env, "UZMAX_SUPABASE_SECRET_KEY"),
    supabaseUrl: requiredEnv(env, "UZMAX_SUPABASE_URL"),
    tenantId: settings.tenantId
  };
}

async function createRuntime(input, config) {
  if (input.prisma && input.supabaseAdmin && input.supabasePublic) {
    return {
      prisma: input.prisma,
      shouldDisconnectPrisma: false,
      supabaseAdmin: input.supabaseAdmin,
      supabasePublic: input.supabasePublic
    };
  }
  const { createClient } = await import("@supabase/supabase-js");
  const { PrismaClient } = await import("@prisma/client");
  const auth = { autoRefreshToken: false, persistSession: false };
  return {
    prisma:
      input.prisma ??
      new PrismaClient({
        datasources: { db: { url: config.databaseUrl } },
        log: ["error"]
      }),
    shouldDisconnectPrisma: !input.prisma,
    supabaseAdmin:
      input.supabaseAdmin ??
      createClient(config.supabaseUrl, config.serviceRoleKey, { auth }),
    supabasePublic:
      input.supabasePublic ??
      createClient(config.supabaseUrl, config.publishableKey, { auth })
  };
}

async function provisionAuthHandoff(runtime, config) {
  let existing;
  try {
    existing = await findUserByEmail(runtime.supabaseAdmin, config.email);
  } catch {
    throw handoffFailure("auth_user_lookup_failed", "not_requested");
  }

  if (existing) {
    const result = await runtime.supabasePublic.auth.resetPasswordForEmail(
      config.email,
      { redirectTo: config.redirectTo }
    );
    if (result.error) throw emailFailure("recovery", result.error);
    return {
      authMode: "recovery",
      emailRequestStatus: "recovery_requested",
      userId: existing.id
    };
  }

  const result = await runtime.supabaseAdmin.auth.admin.inviteUserByEmail(
    config.email,
    { redirectTo: config.redirectTo }
  );
  if (result.error) throw emailFailure("invite", result.error);
  const userId = result.data?.user?.id;
  if (!userId) throw handoffFailure("invite_missing_user_no_access_writes", "rejected");
  return {
    authMode: "invite",
    emailRequestStatus: "invite_requested",
    userId
  };
}

async function findUserByEmail(adminClient, email) {
  const perPage = 1000;
  for (let page = 1; page <= 100; page += 1) {
    const result = await adminClient.auth.admin.listUsers({ page, perPage });
    if (result.error) throw result.error;
    const users = result.data?.users ?? [];
    const match = users.find((user) => normalizeEmail(user.email) === email);
    if (match) return match;
    if (users.length < perPage) return undefined;
  }
  throw new Error("Supabase user pagination exceeded safety limit");
}

async function replaceAccessFacts(prisma, config, authHandoff) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.permissionGrant.findMany({
        orderBy: { permission: "asc" },
        select: { permission: true },
        where: accessWhere(config, authHandoff.userId)
      });
      const before = existing.map((row) => row.permission);
      await tx.orgMember.upsert({
        create: membershipData(config, authHandoff.userId, false),
        update: membershipUpdate(config),
        where: { orgId_userId: { orgId: config.orgId, userId: authHandoff.userId } }
      });
      await tx.tenantMember.upsert({
        create: membershipData(config, authHandoff.userId, true),
        update: membershipUpdate(config),
        where: {
          orgId_tenantId_userId: accessWhere(config, authHandoff.userId)
        }
      });
      await tx.permissionGrant.deleteMany({
        where: accessWhere(config, authHandoff.userId)
      });
      await tx.permissionGrant.createMany({
        data: config.permissions.map((permission) => ({
          ...accessWhere(config, authHandoff.userId),
          permission
        }))
      });
      await tx.auditLog.create({
        data: auditData(config, authHandoff, before)
      });
      return {
        auditRowsWritten: 1,
        membershipRowsUpserted: 2,
        permissionsAfter: config.permissions.length,
        permissionsBefore: before.length
      };
    });
  } catch {
    throw handoffFailure("access_transaction_failed", authHandoff.emailRequestStatus);
  }
}

function auditData(config, authHandoff, before) {
  return {
    action: "replace_owner_operator_permissions",
    actorUserId: settings.actorUserId,
    content: {
      actor: { kind: "system", source: "github_actions", workflow: "M10-08" },
      after: { permissions: config.permissions, role: config.role },
      authMode: authHandoff.authMode,
      before: { permissions: before }
    },
    eventType: "staging_owner.access_replaced",
    module: "authz",
    objectId: authHandoff.userId,
    objectType: "owner_operator_access",
    orgId: config.orgId,
    tenantId: config.tenantId
  };
}

function accessWhere(config, userId) {
  return { orgId: config.orgId, tenantId: config.tenantId, userId };
}

function membershipData(config, userId, includeTenant) {
  return {
    orgId: config.orgId,
    role: config.role,
    status: "ACTIVE",
    ...(includeTenant ? { tenantId: config.tenantId } : {}),
    userId
  };
}

function membershipUpdate(config) {
  return {
    cacheVersion: { increment: 1 },
    role: config.role,
    status: "ACTIVE"
  };
}

function emailFailure(mode, error) {
  const code = String(error?.code ?? "");
  if (code === "email_address_not_authorized") {
    return handoffFailure(
      `${mode}_rejected_email_address_not_authorized_no_access_writes`,
      "rejected_email_address_not_authorized"
    );
  }
  return handoffFailure(`${mode}_request_failed_no_access_writes`, "rejected");
}

function handoffFailure(status, emailRequestStatus) {
  return Object.assign(new Error("M10-08 handoff failed closed"), {
    emailRequestStatus,
    publicStatus: status
  });
}

function requiredDatabaseUrl(env) {
  const value = requiredEnv(env, "UZMAX_RLS_DATABASE_URL");
  try {
    if (["postgres:", "postgresql:"].includes(new URL(value).protocol)) return value;
  } catch {
    // Fall through to the sanitized configuration error.
  }
  throw new Error("UZMAX_RLS_DATABASE_URL must be a postgres URL");
}

function requiredEnv(env, name) {
  const value = typeof env[name] === "string" ? env[name].trim() : "";
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function hashPrefix(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let result;
  try {
    result = await runM1008OwnerAccountHandoff();
  } catch {
    result = {
      counts: emptyCounts,
      emailHash: "unavailable",
      emailRequestStatus: "not_requested",
      status: "m10_08_configuration_rejected"
    };
  }
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "m10_08_owner_access_ready_for_email_acceptance") {
    process.exitCode = 1;
  }
}

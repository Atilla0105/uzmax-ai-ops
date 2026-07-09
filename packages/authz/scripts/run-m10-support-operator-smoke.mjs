#!/usr/bin/env node
import { createHash, randomBytes as defaultRandomBytes } from "node:crypto";
import { URL, fileURLToPath } from "node:url";
export const SUPPORT_OPERATOR_PERMISSIONS = Object.freeze(["tenant:read", "conversation:read", "ticket:write"]);
const defaults = Object.freeze({
  apiBaseUrl: "https://uzmax-api-staging.onrender.com", email: "uzmax-support-operator-smoke@example.invalid",
  m9Email: "uzmax-ga0-employee-smoke@example.invalid", m9UserId: "90000000-0000-4000-8000-000000000906",
  orgId: "11111111-1111-4111-8111-111111111604", role: "support_operator",
  syntheticChannelId: "55555555-5555-4555-8555-555555551003",
  syntheticConversationId: "66666666-6666-4666-8666-666666661003",
  tenantId: "22222222-2222-4222-8222-222222222604", userId: "90000000-0000-4000-8000-000000001003"
});
const okStatus = "m10_03_support_operator_write_smoke_passed_not_release";
const blockedStatus = "m10_03_support_operator_write_smoke_blocked_not_release";
const helpText = `M10-03 support operator staging smoke
Purpose: create/update one deterministic support operator, grant tenant:read/conversation:read/ticket:write, run synthetic list/handoff/ticket-actions, cleanup, and never print secrets or payloads.
Usage: node packages/authz/scripts/run-m10-support-operator-smoke.mjs [--help]
Required env: UZMAX_SUPABASE_URL, UZMAX_SUPABASE_SECRET_KEY, UZMAX_SUPABASE_PUBLISHABLE_KEY, UZMAX_RLS_DATABASE_URL
Optional env: M10_03_API_BASE_URL, M10_03_SUPPORT_OPERATOR_EMAIL, M10_03_SUPPORT_OPERATOR_USER_ID, M10_03_SUPPORT_OPERATOR_ROLE, M10_03_ORG_ID, M10_03_TENANT_ID
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
      withCleanup(runtime.prisma, async () => {
        await cleanupSyntheticRows(runtime.prisma, config);
        await seedSyntheticRows(runtime.prisma, config);
        return runApiSmoke(runtime.fetchImpl, config, runtime.password);
      }, config)
    );
    const residue = await stage("residue-check", () => syntheticResidueCount(runtime.prisma, config));
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
    databaseUrl: requiredDatabaseUrlEnv(env, "UZMAX_RLS_DATABASE_URL"), email,
    orgId: envText(env.M10_03_ORG_ID) || defaults.orgId,
    permissions: [...SUPPORT_OPERATOR_PERMISSIONS], publishableKey:
      requiredEnv(env, "UZMAX_SUPABASE_PUBLISHABLE_KEY"),
    role: envText(env.M10_03_SUPPORT_OPERATOR_ROLE) || defaults.role, serviceRoleKey:
      requiredEnv(env, "UZMAX_SUPABASE_SECRET_KEY"),
    supabaseUrl: requiredEnv(env, "UZMAX_SUPABASE_URL"),
    syntheticChannelId: defaults.syntheticChannelId,
    syntheticConversationId: defaults.syntheticConversationId,
    tenantId: envText(env.M10_03_TENANT_ID) || defaults.tenantId, userId
  };
}
export function formatSupportOperatorResult(result) {
  return JSON.stringify(result, null, 2);
}
async function createRuntime(input, config) {
  return {
    fetchImpl: input.fetchImpl ?? globalThis.fetch,
    password: input.password ?? generatedPassword(input.randomBytes ?? defaultRandomBytes),
    prisma: input.prisma ?? (await createPrismaClient(config)),
    shouldDisconnectPrisma: !input.prisma,
    supabaseAdmin: input.supabaseAdmin ?? (await createSupabaseAdminClient(config))
  };
}
async function createSupabaseAdminClient(config) {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
async function createPrismaClient(config) {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient({ datasources: { db: { url: config.databaseUrl } }, log: ["error"] });
}
async function provisionAuthUser(adminClient, config, password) {
  const existing = await adminClient.auth.admin.getUserById(config.userId);
  const attributes = {
    app_metadata: { m10_03_support_operator_smoke: true, purpose: "support_write_smoke" },
    email: config.email, email_confirm: true, password,
    user_metadata: { m10_03_org_id: config.orgId, m10_03_tenant_id: config.tenantId, role: config.role }
  };
  if (existing.data?.user?.id) {
    const result = await adminClient.auth.admin.updateUserById(config.userId, attributes);
    await ensureNoSupabaseError("update support operator", result);
    return { id: config.userId, mode: "updated" };
  }
  if (existing.error && !/not found|does not exist|no user/i.test(existing.error.message ?? "")) {
    throw new Error(`lookup support operator: ${existing.error.message}`);
  }
  const result = await adminClient.auth.admin.createUser({ ...attributes, id: config.userId });
  await ensureNoSupabaseError("create support operator", result);
  return { id: config.userId, mode: "created" };
}
async function upsertAccessFacts(prisma, config, userId) {
  await prisma.$executeRaw`insert into org_member (org_id, user_id, role, status, cache_version) values (${config.orgId}::uuid, ${userId}::uuid, ${config.role}, 'active', 1) on conflict (org_id, user_id) do update set role = excluded.role, status = 'active', cache_version = org_member.cache_version + 1, updated_at = now()`;
  await prisma.$executeRaw`insert into tenant_member (org_id, tenant_id, user_id, role, status, cache_version) values (${config.orgId}::uuid, ${config.tenantId}::uuid, ${userId}::uuid, ${config.role}, 'active', 1) on conflict (org_id, tenant_id, user_id) do update set role = excluded.role, status = 'active', cache_version = tenant_member.cache_version + 1, updated_at = now()`;
  await prisma.$executeRaw`delete from permission_grant where org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and user_id = ${userId}::uuid`;
  for (const permission of config.permissions) {
    await prisma.$executeRaw`insert into permission_grant (org_id, tenant_id, user_id, permission) values (${config.orgId}::uuid, ${config.tenantId}::uuid, ${userId}::uuid, ${permission})`;
  }
  return {
    orgMember: "upserted",
    permissionCount: config.permissions.length,
    permissions: [...config.permissions],
    tenantMember: "upserted"
  };
}
async function seedSyntheticRows(prisma, config) {
  await prisma.$executeRaw`insert into org (id, name, slug) values (${config.orgId}::uuid, 'M10-03 Synthetic Org', 'm10-03-synthetic-org') on conflict (id) do nothing`;
  await prisma.$executeRaw`insert into tenant (id, org_id, name, slug) values (${config.tenantId}::uuid, ${config.orgId}::uuid, 'M10-03 Synthetic Tenant', 'm10-03-synthetic-tenant') on conflict (id) do nothing`;
  await prisma.$executeRaw`insert into channel_connection (id, org_id, tenant_id, provider, external_account_ref, capabilities, metadata) values (${config.syntheticChannelId}::uuid, ${config.orgId}::uuid, ${config.tenantId}::uuid, 'telegram_bot', 'controlled://channel/m10-03', ${JSON.stringify({ supportOperatorSmoke: true })}::jsonb, ${JSON.stringify({ synthetic_spec: "M10-03" })}::jsonb) on conflict (id) do update set metadata = excluded.metadata`;
  await prisma.$executeRaw`insert into conversation (id, org_id, tenant_id, channel_connection_id, external_conversation_ref, participant_external_ref, status, unread_count, last_message_at) values (${config.syntheticConversationId}::uuid, ${config.orgId}::uuid, ${config.tenantId}::uuid, ${config.syntheticChannelId}::uuid, 'controlled://conversation/m10-03', 'controlled://participant/m10-03', 'open', 1, now()) on conflict (id) do update set status = 'open', unread_count = 1, last_message_at = excluded.last_message_at`;
}
async function cleanupSyntheticRows(prisma, config = defaults) {
  await prisma.$executeRaw`delete from ticket_event e using ticket t, conversation c where e.ticket_id = t.id and t.conversation_id = c.id and c.id = ${config.syntheticConversationId}::uuid and c.org_id = ${config.orgId}::uuid and c.tenant_id = ${config.tenantId}::uuid and c.external_conversation_ref = 'controlled://conversation/m10-03'`;
  await prisma.$executeRaw`delete from ticket t using conversation c where t.conversation_id = c.id and c.id = ${config.syntheticConversationId}::uuid and c.org_id = ${config.orgId}::uuid and c.tenant_id = ${config.tenantId}::uuid and c.external_conversation_ref = 'controlled://conversation/m10-03'`;
  await prisma.$executeRaw`delete from conversation where id = ${config.syntheticConversationId}::uuid and org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and external_conversation_ref = 'controlled://conversation/m10-03'`;
  await prisma.$executeRaw`delete from channel_connection where id = ${config.syntheticChannelId}::uuid and org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and metadata->>'synthetic_spec' = 'M10-03'`;
}
async function syntheticResidueCount(prisma, config) {
  const rows = await prisma.$queryRaw`select ((select count(*) from channel_connection where id = ${config.syntheticChannelId}::uuid and org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and metadata->>'synthetic_spec' = 'M10-03') + (select count(*) from conversation where id = ${config.syntheticConversationId}::uuid and org_id = ${config.orgId}::uuid and tenant_id = ${config.tenantId}::uuid and external_conversation_ref = 'controlled://conversation/m10-03') + (select count(*) from ticket t join conversation c on c.id = t.conversation_id where c.id = ${config.syntheticConversationId}::uuid and c.org_id = ${config.orgId}::uuid and c.tenant_id = ${config.tenantId}::uuid and c.external_conversation_ref = 'controlled://conversation/m10-03') + (select count(*) from ticket_event e join ticket t on t.id = e.ticket_id join conversation c on c.id = t.conversation_id where c.id = ${config.syntheticConversationId}::uuid and c.org_id = ${config.orgId}::uuid and c.tenant_id = ${config.tenantId}::uuid and c.external_conversation_ref = 'controlled://conversation/m10-03'))::int as residue`;
  return Number(rows[0]?.residue ?? -1);
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
  if (error && typeof error === "object") {
    error.stage = error.stage ?? name;
    return error;
  }
  const wrapped = new Error("stage failed");
  wrapped.stage = name;
  return wrapped;
}
async function runApiSmoke(fetchImpl, config, password) {
  if (typeof fetchImpl !== "function") return runtimeBlocker("runtime", "fetch unavailable");
  const token = await supportOperatorToken(fetchImpl, config, password);
  if (!token.ok) return token;
  const list = await fetchJson(fetchImpl, conversationUrl(config), {
    headers: apiHeaders(config, token.accessToken),
    method: "GET"
  });
  if (!list.ok) return list;
  if (!Array.isArray(list.payload.items)) {
    return runtimeBlocker("conversation-list", "items array missing");
  }
  if (!list.payload.items.some((item) => item?.id === config.syntheticConversationId)) {
    return runtimeBlocker("conversation-list", "synthetic conversation missing");
  }
  const handoff = await fetchJson(
    fetchImpl,
    `${conversationUrl(config)}/${config.syntheticConversationId}/handoff`,
    {
      body: JSON.stringify({
        reason: "controlled M10-03 support operator smoke",
        slaPolicyRef: "controlled://sla/m10-03"
      }),
      headers: jsonHeaders(config, token.accessToken),
      method: "POST"
    }
  );
  if (!handoff.ok) return handoff;
  const ticketId = recordValue(handoff.payload.ticket ?? {}, "id");
  if (!ticketId) return runtimeBlocker("handoff", "ticket id missing");
  const actions = [];
  for (const action of ticketActions()) {
    const result = await fetchJson(fetchImpl, ticketActionUrl(config, ticketId), {
      body: JSON.stringify(action),
      headers: jsonHeaders(config, token.accessToken),
      method: "POST"
    });
    if (!result.ok) return result;
    actions.push({ httpStatus: result.httpStatus, type: action.type });
  }
  return {
    actionCount: actions.length, actions, category: "pass",
    conversationListStatus: list.httpStatus, exitCode: 0,
    handoffStatus: handoff.httpStatus, live: true, ok: true, status: okStatus,
    tokenHashPrefix: hashPrefix(token.accessToken), tokenSource: "supabase-password"
  };
}
async function supportOperatorToken(fetchImpl, config, password) {
  const result = await fetchJson(
    fetchImpl,
    `${trimTrailingSlash(config.supabaseUrl)}/auth/v1/token?grant_type=password`,
    {
      body: JSON.stringify({ email: config.email, password }),
      headers: { apikey: config.publishableKey, "content-type": "application/json" },
      method: "POST"
    },
    "supabase-auth"
  );
  if (!result.ok) return result;
  const accessToken = recordValue(result.payload, "access_token");
  return accessToken ? { accessToken, ok: true } : runtimeBlocker("supabase-auth", "missing access token");
}
async function fetchJson(fetchImpl, url, options, stage = stageFromUrl(url)) {
  try {
    const response = await fetchImpl(url, options);
    if (response.status === 401 || response.status === 403) {
      return authzBlocker(stage, response.status);
    }
    const payload = response.ok ? await safeJson(response) : {};
    return response.ok
      ? { httpStatus: response.status, ok: true, payload }
      : runtimeBlocker(stage, `http status ${response.status}`);
  } catch (error) {
    return runtimeBlocker(stage, "request failed");
  }
}
function publicResult({ access, authUser, config, residue, smoke }) {
  const ok = Boolean(smoke.ok) && residue === 0;
  const operatorScope = {
    orgId: config.orgId, permissionCount: access.permissionCount,
    permissions: access.permissions, role: config.role,
    tenantId: config.tenantId, userId: config.userId
  };
  return {
    authUser: { emailHashPrefix: hashPrefix(config.email), id: authUser.id, mode: authUser.mode },
    boundary: { ga0Opened: false, productionApproved: false, releaseOneApproved: false },
    cleanup: { residue }, exitCode: ok ? 0 : smoke.exitCode || 1, ok,
    operatorScope,
    provisioning: { orgMember: access.orgMember, permissionCount: access.permissionCount, tenantMember: access.tenantMember },
    smoke: publicSmoke(smoke),
    status: ok ? okStatus : blockedStatus
  };
}
function blockedResult(config, error) {
  const stageName = error?.stage ?? "runtime";
  const operatorScope = {
    orgId: config.orgId, permissionCount: config.permissions.length,
    permissions: config.permissions, role: config.role,
    tenantId: config.tenantId, userId: config.userId
  };
  return {
    authUser: { emailHashPrefix: hashPrefix(config.email), id: config.userId, mode: "unknown" },
    boundary: { ga0Opened: false, productionApproved: false, releaseOneApproved: false },
    cleanup: { residue: "unknown" },
    exitCode: 4,
    ok: false,
    operatorScope,
    provisioning: { permissionCount: config.permissions.length },
    smoke: runtimeBlocker(stageName, `${stageName} failed`),
    status: blockedStatus
  };
}
function publicSmoke(smoke) {
  const safe = { ...smoke };
  delete safe.accessToken;
  delete safe.password;
  delete safe.payload;
  delete safe.token;
  return safe;
}
function ticketActions() {
  return [{ type: "claim" }, { note: "controlled M10-03 operator note", type: "note" },
    { destination: "handled_in_admin", result: "resolved", type: "close" },
    { reason: "controlled M10-03 reopen", type: "reopen" }];
}
function apiHeaders(config, accessToken) {
  return {
    accept: "application/json", authorization: `Bearer ${accessToken}`,
    "x-org-id": config.orgId,
    "x-tenant-id": config.tenantId
  };
}
function jsonHeaders(config, accessToken) {
  return { ...apiHeaders(config, accessToken), "content-type": "application/json" };
}
function authzBlocker(stage, httpStatus) {
  return blocker("authz_blocker", stage, "m10_03_support_operator_authz_blocker_not_release", { httpStatus });
}
function runtimeBlocker(stage, message) {
  return blocker("runtime_blocker", stage, "m10_03_support_operator_runtime_blocker_not_release", { message: safeMessage(message) });
}
function blocker(category, stage, status, extra) {
  return { category, exitCode: category === "authz_blocker" ? 3 : 4, live: true, ok: false, stage, status, ...extra };
}
async function safeJson(response) {
  try {
    const value = await response.json();
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
async function disconnectRuntime(runtime) {
  if (runtime.shouldDisconnectPrisma && runtime.prisma?.$disconnect) await runtime.prisma.$disconnect();
}
async function ensureNoSupabaseError(label, result) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
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
  } catch { return false; }
}
function conversationUrl(config) {
  return `${apiBase(config)}/conversation-ticket/conversations`;
}
function ticketActionUrl(config, ticketId) {
  return `${apiBase(config)}/conversation-ticket/tickets/${ticketId}/actions`;
}
function apiBase(config) {
  return trimTrailingSlash(config.apiBaseUrl);
}
function stageFromUrl(url) {
  if (url.includes("/handoff")) return "handoff";
  if (url.includes("/actions")) return "ticket-action";
  if (url.includes("/auth/v1/token")) return "supabase-auth";
  return "conversation-list";
}
function generatedPassword(randomBytes = defaultRandomBytes) {
  return `${randomBytes(30).toString("base64url")}Aa1!`;
}
function hashPrefix(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
function recordValue(record, key) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : "";
}
function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}
function safeMessage(message) {
  const value = typeof message === "string" && message.trim() ? message : "failed";
  return value.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-db-url]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
    .replace(/service[_-]?role[^\s,;]*/gi, "service-role-[redacted]");
}
function envText(value) {
  return typeof value === "string" ? value.trim() : "";
}
function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) return { help: true };
  if (argv.length > 0) throw new Error("unsupported argument");
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
    if (args.help) console.log(helpText.trimEnd());
    else {
      const result = await runM10SupportOperatorSmoke();
      console.log(formatSupportOperatorResult(result));
      process.exitCode = result.exitCode;
    }
  } catch (error) {
    console.error(safeMessage(errorMessage(error)));
    process.exitCode = 1;
  }
}

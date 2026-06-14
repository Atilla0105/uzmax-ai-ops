import { createHash } from "node:crypto";

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const ORG_ID = "00000000-0000-4000-8000-000000000001";
export const TENANT_A_ID = "10000000-0000-4000-8000-000000000001";
export const TENANT_B_ID = "20000000-0000-4000-8000-000000000002";
export const USER_A_ID = "30000000-0000-4000-8000-000000000001";
export const USER_B_ID = "30000000-0000-4000-8000-000000000002";
const BUCKET_ID = "spk04-dual-auth";
export const TENANT_A_OBJECT = `${TENANT_A_ID}/handoff-note.txt`;
export const TENANT_B_OBJECT = `${TENANT_B_ID}/handoff-note.txt`;

const USER_PASSWORD = "SPK04-local-only-password-2026!";
const ROLE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

export const expectedPayloads = {
  [TENANT_A_ID]: ["tenant-a-authz-row"],
  [TENANT_B_ID]: ["tenant-b-authz-row"]
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function createPrisma() {
  return new PrismaClient({
    datasources: { db: { url: requireEnv("UZMAX_RLS_DATABASE_URL") } },
    log: ["error"]
  });
}

export function createSupabaseClients() {
  const url = requireEnv("UZMAX_SUPABASE_URL");
  const options = {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket }
  };

  return {
    admin: createClient(url, requireEnv("UZMAX_SUPABASE_SECRET_KEY"), options),
    publicClient: createClient(
      url,
      requireEnv("UZMAX_SUPABASE_PUBLISHABLE_KEY"),
      options
    )
  };
}

export function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex").slice(0, 16);
}

export function expiredShapeFrom(token) {
  const [header, , signature] = token.split(".");
  if (!header || !signature) throw new Error("JWT shape is invalid");
  return `${header}.${encodeJwtPayload({
    ...decodeJwtPayload(token),
    exp: Math.floor(Date.now() / 1000) - 60
  })}.${signature}`;
}

export function assertJwtHasNoBusinessClaims(token) {
  const payload = decodeJwtPayload(token);
  const forbiddenClaims = ["permissions", "tenantIds", "tenant_ids", "orgId", "org_id"];
  const present = forbiddenClaims.filter((claim) => payload[claim] !== undefined);
  if (present.length > 0) {
    throw new Error(
      `JWT contains business authorization claims: ${present.join(", ")}`
    );
  }
}

function decodeJwtPayload(token) {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("JWT payload is missing");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

function encodeJwtPayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export async function prepareAuthUsers(admin) {
  await deleteAuthUser(admin, USER_A_ID);
  await deleteAuthUser(admin, USER_B_ID);
  await createAuthUser(admin, USER_A_ID, "spk04-user-a@example.invalid");
  await createAuthUser(admin, USER_B_ID, "spk04-user-b@example.invalid");
}

async function createAuthUser(admin, id, email) {
  await ensureNoSupabaseError(
    `create auth user ${id}`,
    await admin.auth.admin.createUser({
      app_metadata: { spk04_identity_only: true },
      email,
      email_confirm: true,
      id,
      password: USER_PASSWORD,
      user_metadata: { claimed_tenant_id: TENANT_B_ID }
    })
  );
}

export async function deleteAuthUser(admin, id) {
  const result = await admin.auth.admin.deleteUser(id);
  if (result.error && !/not found|user.*does not exist/i.test(result.error.message)) {
    throw new Error(`delete auth user ${id}: ${result.error.message}`);
  }
}

export async function prepareStorage(admin) {
  await removeStorage(admin);
  const createResult = await admin.storage.createBucket(BUCKET_ID, { public: false });
  if (createResult.error && !/already exists/i.test(createResult.error.message)) {
    throw new Error(`create storage bucket: ${createResult.error.message}`);
  }

  await uploadObject(admin, TENANT_A_OBJECT, "tenant-a storage object");
  await uploadObject(admin, TENANT_B_OBJECT, "tenant-b storage object");
}

async function uploadObject(admin, objectPath, content) {
  await ensureNoSupabaseError(
    `upload ${objectPath}`,
    await admin.storage.from(BUCKET_ID).upload(objectPath, Buffer.from(content), {
      contentType: "text/plain",
      upsert: true
    })
  );
}

export async function removeStorage(admin) {
  await admin.storage.from(BUCKET_ID).remove([TENANT_A_OBJECT, TENANT_B_OBJECT]);
  await admin.storage.emptyBucket(BUCKET_ID);
  const result = await admin.storage.deleteBucket(BUCKET_ID);
  if (result.error && !/not found|does not exist/i.test(result.error.message)) {
    throw new Error(`delete storage bucket: ${result.error.message}`);
  }
}

export async function seedDatabase(prisma) {
  await prisma.$executeRaw`delete from spk04.audit_log`;
  await prisma.$executeRaw`delete from spk04.permission_grant`;
  await prisma.$executeRaw`delete from spk04.tenant_member`;
  await prisma.$executeRaw`delete from spk04.storage_objects`;
  await prisma.$executeRaw`delete from spk04.rls_items`;

  await prisma.$executeRaw`
    insert into spk04.tenant_member (user_id, org_id, tenant_id, status, cache_version)
    values
      (${USER_A_ID}::uuid, ${ORG_ID}::uuid, ${TENANT_A_ID}::uuid, 'active', 1),
      (${USER_A_ID}::uuid, ${ORG_ID}::uuid, ${TENANT_B_ID}::uuid, 'revoked', 1),
      (${USER_B_ID}::uuid, ${ORG_ID}::uuid, ${TENANT_B_ID}::uuid, 'active', 1)
  `;
  await prisma.$executeRaw`
    insert into spk04.permission_grant (user_id, org_id, tenant_id, permission)
    values
      (${USER_A_ID}::uuid, ${ORG_ID}::uuid, ${TENANT_A_ID}::uuid, 'asset:read'),
      (${USER_A_ID}::uuid, ${ORG_ID}::uuid, ${TENANT_A_ID}::uuid, 'conversation:read'),
      (${USER_B_ID}::uuid, ${ORG_ID}::uuid, ${TENANT_B_ID}::uuid, 'asset:read')
  `;
  await prisma.$executeRaw`
    insert into spk04.rls_items (org_id, tenant_id, payload)
    values
      (${ORG_ID}::uuid, ${TENANT_A_ID}::uuid, 'tenant-a-authz-row'),
      (${ORG_ID}::uuid, ${TENANT_B_ID}::uuid, 'tenant-b-authz-row')
  `;
  await prisma.$executeRaw`
    insert into spk04.storage_objects (bucket_id, object_path, org_id, tenant_id, audit_tag)
    values
      (${BUCKET_ID}, ${TENANT_A_OBJECT}, ${ORG_ID}::uuid, ${TENANT_A_ID}::uuid, 'tenant-a'),
      (${BUCKET_ID}, ${TENANT_B_OBJECT}, ${ORG_ID}::uuid, ${TENANT_B_ID}::uuid, 'tenant-b')
  `;
}

export async function signIn(publicClient, email) {
  const data = await ensureNoSupabaseError(
    `sign in ${email}`,
    await publicClient.auth.signInWithPassword({ email, password: USER_PASSWORD })
  );
  if (!data.session?.access_token || !data.session.refresh_token) {
    throw new Error(`sign in ${email}: missing session tokens`);
  }
  return data.session;
}

export async function httpWhoami(prisma, publicClient, authorization, tenantId) {
  const auth = await authenticate(publicClient, authorization);
  const context = await buildAccessContext(prisma, auth.userId, tenantId);
  return {
    context,
    rows: await queryTenantRows(prisma, context),
    tokenHash: auth.tokenHash
  };
}

export async function queryRowsWithoutContext(prisma) {
  const rows = await runTransaction(
    prisma,
    prisma.$queryRaw`
      select payload
      from spk04.rls_items
      order by payload asc
    `
  );
  return rows.map((row) => row.payload);
}

export async function refreshSession(publicClient, refreshToken) {
  const data = await ensureNoSupabaseError(
    "refresh session",
    await publicClient.auth.refreshSession({ refresh_token: refreshToken })
  );
  if (!data.session?.access_token)
    throw new Error("refresh session: missing access token");
  return data.session;
}

export async function createSignedUrlForContext(prisma, admin, context, objectPath) {
  assertSafeStoragePath(objectPath);
  const object = await loadStorageObject(prisma, objectPath);
  if (!object || object.tenantId !== context.selectedTenantId) {
    await auditStorage(prisma, context, objectPath, "denied");
    throw authError(403, "storage object is outside selected tenant");
  }

  const data = await ensureNoSupabaseError(
    `create signed URL ${objectPath}`,
    await admin.storage.from(BUCKET_ID).createSignedUrl(objectPath, 60)
  );
  await auditStorage(prisma, context, objectPath, "allowed");
  return { expiresInSeconds: 60, signed: Boolean(data.signedUrl) };
}

export async function revokeTenantMembership(prisma) {
  await prisma.$executeRaw`
    update spk04.tenant_member
    set status = 'revoked', cache_version = cache_version + 1, updated_at = now()
    where user_id = ${USER_A_ID}::uuid and tenant_id = ${TENANT_A_ID}::uuid
  `;
}

export async function assertRows(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${label} expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
    );
  }
}

export async function assertRejects(label, statusCode, action) {
  try {
    await action();
  } catch (error) {
    if (error?.statusCode === statusCode) return { label, status: "passed" };
    throw error;
  }
  throw new Error(`${label} expected HTTP ${statusCode} rejection`);
}

async function authenticate(publicClient, authorization) {
  const token = readBearerToken(authorization);
  rejectExpiredClaim(token);
  const data = await ensureNoSupabaseError(
    "verify auth token",
    await publicClient.auth.getUser(token)
  );
  if (!data.user?.id) throw authError(401, "Supabase user is missing");
  return { tokenHash: tokenHash(token), userId: data.user.id };
}

function readBearerToken(authorization) {
  if (!authorization) throw authError(401, "authorization header is required");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) throw authError(401, "authorization header must be Bearer");
  return match[1];
}

function rejectExpiredClaim(token) {
  const payload = decodeJwtPayload(token);
  if (typeof payload.exp === "number" && payload.exp <= Math.floor(Date.now() / 1000)) {
    throw authError(401, "JWT is expired");
  }
}

async function buildAccessContext(prisma, userId, tenantId) {
  const memberships = await prisma.$queryRaw`
    select org_id::text as "orgId", tenant_id::text as "tenantId",
      status, cache_version as "cacheVersion"
    from spk04.tenant_member
    where user_id = ${userId}::uuid
  `;
  const activeMemberships = memberships.filter((membership) => {
    return membership.status === "active";
  });
  const selected = activeMemberships.find((membership) => {
    return membership.tenantId === tenantId;
  });
  if (!selected) throw authError(403, "tenant membership is not active");

  const grants = await prisma.$queryRaw`
    select permission
    from spk04.permission_grant
    where user_id = ${userId}::uuid and tenant_id = ${tenantId}::uuid
    order by permission asc
  `;
  return {
    membershipVersion: selected.cacheVersion,
    orgId: selected.orgId,
    permissions: grants.map((grant) => grant.permission),
    selectedTenantId: tenantId,
    tenantIds: activeMemberships.map((membership) => membership.tenantId).sort(),
    userId
  };
}

async function queryTenantRows(prisma, context) {
  const rows = await runTransaction(
    prisma,
    prisma.$queryRaw`
      with app_context as (
        select
          set_config('app.org_id', ${context.orgId}, true) as org_context,
          set_config('app.tenant_id', ${context.selectedTenantId}, true) as tenant_context
      )
      select payload
      from app_context
      cross join spk04.rls_items
      order by payload asc
    `
  );
  return rows.map((row) => row.payload);
}

async function runTransaction(prisma, operation) {
  const results = await prisma.$transaction([
    prisma.$executeRawUnsafe(`set local role "${readSafeRole()}"`),
    operation
  ]);
  return results[results.length - 1];
}

function readSafeRole() {
  const role = requireEnv("UZMAX_RLS_SET_ROLE");
  if (!ROLE_IDENTIFIER.test(role)) {
    throw new Error(`Unsafe UZMAX_RLS_SET_ROLE value: ${role}`);
  }
  return role.replaceAll('"', '""');
}

function assertSafeStoragePath(objectPath) {
  const hasBadSegment = objectPath.split("/").some((segment) => segment.length === 0);
  if (
    !objectPath ||
    objectPath.startsWith("/") ||
    objectPath.includes("..") ||
    hasBadSegment
  ) {
    throw authError(403, "storage object path is not safe");
  }
}

async function loadStorageObject(prisma, objectPath) {
  const rows = await prisma.$queryRaw`
    select org_id::text as "orgId", tenant_id::text as "tenantId"
    from spk04.storage_objects
    where bucket_id = ${BUCKET_ID} and object_path = ${objectPath}
  `;
  return rows[0] ?? null;
}

async function auditStorage(prisma, context, objectPath, decision) {
  await prisma.$executeRaw`
    insert into spk04.audit_log (event_type, user_id, org_id, tenant_id, object_path, decision)
    values (
      'storage.signed_url',
      ${context.userId}::uuid,
      ${context.orgId}::uuid,
      ${context.selectedTenantId}::uuid,
      ${objectPath},
      ${decision}
    )
  `;
}

function authError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureNoSupabaseError(label, result) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

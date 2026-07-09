import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

import {
  SUPPORT_OPERATOR_PERMISSIONS,
  formatSupportOperatorResult,
  readSupportOperatorConfig,
  runM10SupportOperatorSmoke
} from "../../packages/authz/scripts/run-m10-support-operator-smoke.mjs";

const requiredEnv = {
  UZMAX_RLS_DATABASE_URL: "postgres://controlled.example/uzmax",
  UZMAX_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
  UZMAX_SUPABASE_SECRET_KEY: "service-role-secret",
  UZMAX_SUPABASE_URL: "https://supabase.example.test"
};

test("missing required secrets fail before provisioning", () => {
  const prisma = fakePrisma();
  assert.throws(
    () => readSupportOperatorConfig({ UZMAX_SUPABASE_URL: "https://example.test" }),
    /UZMAX_RLS_DATABASE_URL is required/
  );
  assert.equal(prisma.calls.length, 0);
});

test("query-only database URL fails before provisioning", () => {
  assert.throws(
    () =>
      readSupportOperatorConfig({
        ...requiredEnv,
        UZMAX_RLS_DATABASE_URL: "&connection_limit=4&pool_timeout=60"
      }),
    /UZMAX_RLS_DATABASE_URL must be a postgres URL/
  );
});

test("provisions independent support operator and runs scoped write smoke", async () => {
  const prisma = fakePrisma();
  const fetchCalls = [];
  const result = await runM10SupportOperatorSmoke({
    env: { ...requiredEnv, M10_03_PERMISSIONS: "permission:write,config:write" },
    fetchImpl: fakeFetch(fetchCalls),
    password: "Do-not-print-this-support-password-Aa1!",
    prisma,
    supabaseAdmin: fakeSupabaseAdmin({ mode: "missing" })
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, "m10_03_support_operator_write_smoke_passed_not_release");
  assert.deepEqual(result.operatorScope.permissions, SUPPORT_OPERATOR_PERMISSIONS);
  assert.equal(result.operatorScope.permissionCount, 3);
  assert.notEqual(result.operatorScope.userId, "90000000-0000-4000-8000-000000000906");

  const permissionInserts = prisma.calls.filter(
    (call) =>
      call.sql.includes("insert into permission_grant") &&
      !call.sql.includes("delete from permission_grant")
  );
  assert.equal(permissionInserts.length, 3);
  assert.deepEqual(
    permissionInserts.map((call) => call.values.at(-1)).sort(),
    [...SUPPORT_OPERATOR_PERMISSIONS].sort()
  );

  assert.deepEqual(
    fetchCalls.map((call) => `${call.method} ${new URL(call.url).pathname}`),
    [
      "POST /auth/v1/token",
      "GET /conversation-ticket/conversations",
      "POST /conversation-ticket/conversations/66666666-6666-4666-8666-666666661003/handoff",
      "POST /conversation-ticket/tickets/77777777-7777-4777-8777-777777771003/actions",
      "POST /conversation-ticket/tickets/77777777-7777-4777-8777-777777771003/actions",
      "POST /conversation-ticket/tickets/77777777-7777-4777-8777-777777771003/actions",
      "POST /conversation-ticket/tickets/77777777-7777-4777-8777-777777771003/actions"
    ]
  );
  for (const call of fetchCalls.slice(1)) {
    assert.equal(call.headers["x-org-id"], "11111111-1111-4111-8111-111111111604");
    assert.equal(call.headers["x-tenant-id"], "22222222-2222-4222-8222-222222222604");
    assert.equal(call.headers.authorization, "Bearer support-access-token-secret");
  }

  const printed = formatSupportOperatorResult(result);
  assert.doesNotMatch(printed, /Do-not-print-this-support-password/);
  assert.doesNotMatch(printed, /service-role-secret/);
  assert.doesNotMatch(printed, /postgres:\/\/controlled/);
  assert.doesNotMatch(printed, /publishable-key/);
  assert.doesNotMatch(printed, /support-access-token-secret/);
  assert.doesNotMatch(printed, /access_token|refresh_token|raw auth response/i);
  assert.doesNotMatch(printed, /controlled M10-03 operator note/);
});

test("existing support operator is updated instead of duplicated", async () => {
  const supabaseAdmin = fakeSupabaseAdmin({ mode: "existing" });
  const result = await runM10SupportOperatorSmoke({
    env: requiredEnv,
    fetchImpl: fakeFetch([]),
    password: "Update-only-password-Aa1!",
    prisma: fakePrisma(),
    supabaseAdmin
  });

  assert.deepEqual(
    supabaseAdmin.calls.map((call) => call.method),
    ["getUserById", "updateUserById"]
  );
  assert.equal(result.authUser.mode, "updated");
});

test("returns sanitized blocked result for auth and DB provisioning failures", async () => {
  const authFailure = await runM10SupportOperatorSmoke({
    env: requiredEnv,
    fetchImpl: fakeFetch([]),
    password: "Do-not-print-this-support-password-Aa1!",
    prisma: fakePrisma(),
    supabaseAdmin: fakeSupabaseAdmin({
      errorMessage:
        "service-role-secret postgres://controlled.example raw auth response",
      mode: "lookup-error"
    })
  });
  assert.equal(authFailure.ok, false);
  assert.equal(
    authFailure.status,
    "m10_03_support_operator_write_smoke_blocked_not_release"
  );
  assert.equal(authFailure.smoke.stage, "auth-provision");
  assert.equal(authFailure.smoke.message, "auth-provision failed");
  assert.doesNotMatch(
    formatSupportOperatorResult(authFailure),
    /service-role-secret|postgres:\/\/controlled|raw auth response/
  );

  const dbFailure = await runM10SupportOperatorSmoke({
    env: requiredEnv,
    fetchImpl: fakeFetch([]),
    password: "Do-not-print-this-support-password-Aa1!",
    prisma: fakePrisma({ failOnSql: /insert into tenant_member/i }),
    supabaseAdmin: fakeSupabaseAdmin({ mode: "missing" })
  });
  assert.equal(dbFailure.ok, false);
  assert.equal(dbFailure.smoke.stage, "access-facts");
  assert.equal(dbFailure.smoke.message, "access-facts failed");
});

test("uses lowercase enum values and scoped synthetic cleanup", async () => {
  const prisma = fakePrisma();
  await runM10SupportOperatorSmoke({
    env: requiredEnv,
    fetchImpl: fakeFetch([]),
    password: "Do-not-print-this-support-password-Aa1!",
    prisma,
    supabaseAdmin: fakeSupabaseAdmin({ mode: "missing" })
  });

  const conversationInsert = prisma.calls.find((call) =>
    call.sql.includes("insert into conversation")
  );
  assert.match(conversationInsert.sql, /'open'/);
  assert.doesNotMatch(conversationInsert.sql, /'OPEN'/);

  const cleanupConversation = prisma.calls.find((call) =>
    call.sql.includes("delete from conversation")
  );
  assert.match(cleanupConversation.sql, /org_id/);
  assert.match(cleanupConversation.sql, /tenant_id/);
  assert.match(cleanupConversation.sql, /external_conversation_ref/);
  const cleanupTicket = prisma.calls.find((call) =>
    call.sql.includes("delete from ticket t using conversation")
  );
  assert.match(cleanupTicket.sql, /external_conversation_ref/);
  const cleanupChannel = prisma.calls.find((call) =>
    call.sql.includes("delete from channel_connection")
  );
  assert.match(cleanupChannel.sql, /metadata->>'synthetic_spec'/);
  const residueQuery = prisma.calls.find((call) => call.sql.includes("as residue"));
  assert.match(residueQuery.sql, /metadata->>'synthetic_spec'/);
  assert.match(residueQuery.sql, /external_conversation_ref/g);
});

test("seed failure still returns blocked result and runs scoped cleanup", async () => {
  const prisma = fakePrisma({ failOnSql: /insert into conversation/i });
  const result = await runM10SupportOperatorSmoke({
    env: requiredEnv,
    fetchImpl: fakeFetch([]),
    password: "Do-not-print-this-support-password-Aa1!",
    prisma,
    supabaseAdmin: fakeSupabaseAdmin({ mode: "missing" })
  });

  assert.equal(result.ok, false);
  assert.equal(result.smoke.stage, "synthetic-smoke");
  assert.equal(
    prisma.calls.filter((call) => call.sql.includes("delete from channel_connection"))
      .length >= 2,
    true
  );
});

test("rejects M9 employee identity reuse", () => {
  assert.throws(
    () =>
      readSupportOperatorConfig({
        ...requiredEnv,
        M10_03_SUPPORT_OPERATOR_EMAIL: "uzmax-ga0-employee-smoke@example.invalid"
      }),
    /must not reuse the M9 employee/
  );
  assert.throws(
    () =>
      readSupportOperatorConfig({
        ...requiredEnv,
        M10_03_SUPPORT_OPERATOR_USER_ID: "90000000-0000-4000-8000-000000000906"
      }),
    /must not reuse the M9 employee/
  );
});

test("unsupported CLI arguments are not echoed back", () => {
  const result = spawnSync(
    process.execPath,
    [
      "packages/authz/scripts/run-m10-support-operator-smoke.mjs",
      "Do-not-print-this-cli-secret-token"
    ],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /unsupported argument/);
  assert.doesNotMatch(result.stderr, /Do-not-print-this-cli-secret-token/);
});

test("documents dispatch workflow, exact permissions and live pass boundary", () => {
  const workflow = readFileSync(
    ".github/workflows/m10-support-operator-smoke.yml",
    "utf8"
  );
  const spec = readFileSync("docs/specs/M10-03-support-operator-smoke.md", "utf8");
  const evidence = readFileSync(
    "docs/evidence/M10/M10-03-support-operator-smoke.md",
    "utf8"
  );

  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /confirm == 'M10-03'/);
  assert.match(workflow, /node-version: 24/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run -w @uzmax\/db prisma:generate/);
  assert.match(
    workflow,
    /UZMAX_RLS_DATABASE_URL: \$\{\{ secrets\.UZMAX_RLS_DATABASE_URL \}\}/
  );
  assert.match(workflow, /m10-03-support-operator-smoke-result/);
  assert.match(workflow, /sanitized/i);
  assert.doesNotMatch(workflow, /M9_06_PERMISSIONS|uzmax-ga0-employee-smoke/);
  assert.doesNotMatch(workflow, /90000000-0000-4000-8000-000000000906/);
  assert.match(spec, /tenant:read`, `conversation:read` and `ticket:write/);
  assert.match(spec, /M10-01 must be merged and deployed/);
  assert.match(evidence, /m10_03_support_operator_write_smoke_passed_not_release/);
  assert.match(evidence, /M10-05-live-staging-evidence-sync/);
  assert.match(evidence, /must not print/);
  assert.doesNotMatch(
    evidence,
    /service-role-secret|Do-not-print-this-support-password|postgres:\/\/controlled/
  );
});

function fakeSupabaseAdmin({ errorMessage, mode }) {
  const calls = [];
  const userId = "90000000-0000-4000-8000-000000001003";
  const userData = (id) => ({ data: { user: { id } }, error: null });
  const missingUser = { data: { user: null }, error: { message: "User not found" } };
  const lookupFailure = {
    data: { user: null },
    error: { message: errorMessage ?? "service unavailable" }
  };
  const admin = {
    async createUser(attributes) {
      calls.push({ attributes, method: "createUser" });
      return userData(attributes.id);
    },
    async getUserById(id) {
      calls.push({ id, method: "getUserById" });
      if (mode === "lookup-error") return lookupFailure;
      if (mode === "existing") return userData(userId);
      return missingUser;
    },
    async updateUserById(id, attributes) {
      calls.push({ attributes, id, method: "updateUserById" });
      return userData(id);
    }
  };
  return {
    calls,
    auth: { admin }
  };
}

function fakePrisma(options = {}) {
  return {
    calls: [],
    async $executeRaw(strings, ...values) {
      const sql = Array.from(strings).join("?");
      this.calls.push({ sql, values });
      if (options.failOnSql?.test(sql)) throw new Error("postgres://controlled failed");
      return 1;
    },
    async $queryRaw(strings, ...values) {
      this.calls.push({ sql: Array.from(strings).join("?"), values });
      return [{ residue: 0 }];
    },
    async $disconnect() {
      this.calls.push({ sql: "disconnect", values: [] });
    }
  };
}

function fakeFetch(calls) {
  return async (url, options = {}) => {
    const method = options.method ?? "GET";
    const headers = options.headers ?? {};
    calls.push({ body: options.body, headers, method, url });

    const path = new URL(url).pathname;
    if (path === "/auth/v1/token") {
      return jsonResponse(200, { access_token: "support-access-token-secret" });
    }
    if (method === "GET" && path === "/conversation-ticket/conversations") {
      return jsonResponse(200, {
        items: [{ id: "66666666-6666-4666-8666-666666661003" }]
      });
    }
    if (path.endsWith("/handoff")) {
      return jsonResponse(201, {
        conversation: { id: "66666666-6666-4666-8666-666666661003" },
        ticket: { id: "77777777-7777-4777-8777-777777771003" }
      });
    }
    if (path.endsWith("/actions")) {
      return jsonResponse(200, {
        ticket: { id: "77777777-7777-4777-8777-777777771003" }
      });
    }
    return jsonResponse(404, {});
  };
}

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    }
  };
}

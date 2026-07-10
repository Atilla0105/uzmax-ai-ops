import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { URL, URLSearchParams } from "node:url";
import vm from "node:vm";

import ts from "typescript";
import {
  OWNER_OPERATOR_PERMISSIONS,
  readOwnerHandoffConfig,
  runM1008OwnerAccountHandoff
} from "../../packages/authz/scripts/run-m10-staging-owner-account-handoff.mjs";

const testEmail = "owner.operator@example.test";
const requiredEnv = {
  UZMAX_RLS_DATABASE_URL: "postgres://controlled.example/uzmax",
  UZMAX_STAGING_OWNER_EMAIL: ` ${testEmail.toUpperCase()} `,
  UZMAX_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
  UZMAX_SUPABASE_SECRET_KEY: "service-role-secret",
  UZMAX_SUPABASE_URL: "https://supabase.example.test"
};

test("requires and normalizes the secret email without accepting invalid config", () => {
  assert.throws(
    () => readOwnerHandoffConfig({ ...requiredEnv, UZMAX_STAGING_OWNER_EMAIL: "" }),
    /UZMAX_STAGING_OWNER_EMAIL is required/
  );
  assert.equal(readOwnerHandoffConfig(requiredEnv).email, testEmail);
});

test("owner allowlist equals every current backend-enforced permission", () => {
  const apiPermissions = permissionLiterals(readTree("apps/api/src"));
  assert.deepEqual(apiPermissions, [...OWNER_OPERATOR_PERMISSIONS]);
  const corePermissions = permissionLiterals(
    readFileSync("apps/api/src/access-context-core.ts", "utf8")
  );
  assert.deepEqual(corePermissions, [
    "config:rollback",
    "config:write",
    "permission:write",
    "tenant:switch"
  ]);
});

test("new user is invited before exact access replacement and sanitized output", async () => {
  const auth = fakeAuth();
  const prisma = fakePrisma({ permissions: ["tenant:read", "stale:write"] });
  const result = await runHandoff(auth, prisma);

  assert.deepEqual(
    auth.calls.map((call) => call.method),
    ["listUsers", "inviteUserByEmail"]
  );
  assert.deepEqual(auth.calls[1].options, {
    redirectTo: "https://uzmax-admin.vercel.app/"
  });
  assert.deepEqual(prisma.state.permissions, [...OWNER_OPERATOR_PERMISSIONS]);
  assert.equal(prisma.state.orgUpserts[0].update.role, "owner_operator");
  assert.equal(prisma.state.tenantUpserts[0].update.role, "owner_operator");
  assert.deepEqual(prisma.state.audits[0].content.before.permissions, [
    "tenant:read",
    "stale:write"
  ]);
  assert.deepEqual(
    prisma.state.audits[0].content.after.permissions,
    OWNER_OPERATOR_PERMISSIONS
  );
  assert.deepEqual(prisma.state.audits[0].content.actor, {
    kind: "system",
    source: "github_actions",
    workflow: "M10-08"
  });
  assert.deepEqual(Object.keys(result).sort(), [
    "counts",
    "emailHash",
    "emailRequestStatus",
    "status"
  ]);
  assert.equal(result.emailRequestStatus, "invite_requested");
  assert.equal(result.counts.permissionsAfter, 18);
  const printed = JSON.stringify(result, null, 2);
  for (const secret of [
    testEmail,
    "service-role-secret",
    "publishable-key",
    "postgres://controlled",
    auth.userId
  ]) {
    assert.doesNotMatch(printed, new RegExp(escapeRegex(secret), "i"));
  }
});

test("existing normalized user receives recovery and reruns stay idempotent", async () => {
  const auth = fakeAuth();
  const prisma = fakePrisma();
  const first = await runHandoff(auth, prisma);
  const second = await runHandoff(auth, prisma);

  assert.equal(first.emailRequestStatus, "invite_requested");
  assert.equal(second.emailRequestStatus, "recovery_requested");
  assert.equal(
    auth.calls.filter((call) => call.method === "inviteUserByEmail").length,
    1
  );
  assert.equal(
    auth.calls.filter((call) => call.method === "resetPasswordForEmail").length,
    1
  );
  assert.deepEqual(prisma.state.permissions, [...OWNER_OPERATOR_PERMISSIONS]);
  assert.equal(prisma.state.audits.length, 2);
});

test("hosted SMTP authorization rejection fails before every DB write", async () => {
  const auth = fakeAuth({
    inviteError: {
      code: "email_address_not_authorized",
      message: "Email address not authorized"
    }
  });
  const prisma = fakePrisma();
  const result = await runHandoff(auth, prisma);

  assert.equal(
    result.status,
    "invite_rejected_email_address_not_authorized_no_access_writes"
  );
  assert.equal(result.emailRequestStatus, "rejected_email_address_not_authorized");
  assert.equal(prisma.state.transactionCount, 0);
  assert.deepEqual(result.counts, {
    auditRowsWritten: 0,
    membershipRowsUpserted: 0,
    permissionsAfter: 0,
    permissionsBefore: 0
  });
});

test("invite success plus DB failure leaves fail-closed unprivileged auth user", async () => {
  const auth = fakeAuth();
  const prisma = fakePrisma({ failTransaction: true });
  const result = await runHandoff(auth, prisma);

  assert.equal(result.status, "access_transaction_failed");
  assert.equal(result.emailRequestStatus, "invite_requested");
  assert.equal(prisma.state.audits.length, 0);
  assert.equal(prisma.state.permissions.length, 0);
});

test("admin auth contract validates blanks and preserves manual token fallback", () => {
  const panel = readFileSync("apps/admin/src/AdminRuntimeAccessPanel.tsx", "utf8");
  const auth = readFileSync("apps/admin/src/adminRuntimeAuth.ts", "utf8");
  assert.match(panel, /!email\.trim\(\) \|\| !password/);
  assert.match(panel, /admin-runtime-reset-password/);
  assert.match(panel, /admin-runtime-password-setup/);
  assert.match(panel, /admin-runtime-save-token/);
  assert.match(auth, /flowType: "implicit"/);
  assert.match(auth, /autoRefreshToken: true/);
  assert.match(auth, /persistSession: true/);
  assert.match(auth, /storage: window\.sessionStorage/);
  assert.match(auth, /storageKey: adminSupabaseSessionStorageKey/);
  assert.match(auth, /uzmax\.admin\.supabase\.session/);
  assert.doesNotMatch(auth, /localStorage/);
  assert.match(auth, /isSessionSyncEvent[\s\S]*storeAccessToken\(accessToken\)/);
  assert.match(auth, /\["SIGNED_IN", "TOKEN_REFRESHED", "INITIAL_SESSION"\]/);
  assert.match(auth, /event === "SIGNED_OUT"[\s\S]*clearAccessToken\(\)/);
  assert.match(auth, /resetPasswordForEmail[\s\S]*adminAuthRedirectUrl/);
  assert.match(auth, /updateUser\(\{ password \}\)[\s\S]*getSession\(\)/);
  assert.match(auth, /getSession\(\)[\s\S]*storeAccessToken\(accessToken\)/);
  assert.match(auth, /saveManualToken/);
  assert.notEqual(
    auth.match(/adminSupabaseSessionStorageKey = "([^"]+)"/)?.[1],
    "uzmax.admin.runtime.accessToken"
  );
  assert.doesNotMatch(auth, /update\.data\.session/);
  assert.doesNotMatch(auth, /console\.(?:log|error|warn)/);
});

test("untyped or code-only callback fails closed and URL cleanup removes auth material", () => {
  const context = authCallbackModule();
  const untyped = context.exports.__readAuthCallback({
    hash: "#access_token=secret-a&refresh_token=secret-r",
    search: ""
  });
  assert.equal(untyped.hasAuthMaterial, true);
  assert.equal(untyped.isSupported, false);
  assert.equal(untyped.kind, null);

  const codeOnly = context.exports.__readAuthCallback({
    hash: "",
    search: "?code=secret-code&type=invite"
  });
  assert.equal(codeOnly.isSupported, false);
  const supported = context.exports.__readAuthCallback({
    hash: "#access_token=secret-a&refresh_token=secret-r&type=invite",
    search: ""
  });
  assert.equal(supported.isSupported, true);
  assert.equal(supported.kind, "invite");

  context.window.location.href =
    "https://admin.example.test/?keep=yes&code=secret-code&type=invite#access_token=secret-a";
  context.exports.__clearAuthCallbackUrl();
  assert.equal(context.replacedUrl, "/?keep=yes");
  const source = readFileSync("apps/admin/src/adminRuntimeAuth.ts", "utf8");
  assert.match(
    source,
    /callback\.hasAuthMaterial && !callback\.isSupported[\s\S]*clearAuthCallbackUrl\(\)/
  );
  assert.ok(
    source.indexOf("clientRef.current = client") <
      source.indexOf("callback.hasAuthMaterial && !callback.isSupported"),
    "unsupported callback must not prevent same-page sign-in/reset client use"
  );
});

test("workflow is exact-confirmation, secret-only and sanitized", () => {
  const workflow = readFileSync(
    ".github/workflows/m10-staging-owner-account-handoff.yml",
    "utf8"
  );
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /inputs\.confirm == 'M10-08'/);
  assert.match(
    workflow,
    /UZMAX_STAGING_OWNER_EMAIL: \$\{\{ secrets\.UZMAX_STAGING_OWNER_EMAIL \}\}/
  );
  assert.match(workflow, /::add-mask::\$\{UZMAX_STAGING_OWNER_EMAIL\}/);
  assert.match(workflow, /emailRequestStatus/);
  assert.doesNotMatch(workflow, /smtp|inviteUserByEmail\([^)]*@/i);
});

async function runHandoff(auth, prisma) {
  return runM1008OwnerAccountHandoff({
    env: requiredEnv,
    prisma,
    supabaseAdmin: auth.admin,
    supabasePublic: auth.public
  });
}

function fakeAuth({ inviteError = null } = {}) {
  const calls = [];
  const users = [];
  const userId = "90000000-0000-4000-8000-000000001008";
  return {
    admin: {
      auth: {
        admin: {
          async inviteUserByEmail(email, options) {
            calls.push({ email, method: "inviteUserByEmail", options });
            if (inviteError) return { data: {}, error: inviteError };
            users.push({ email, id: userId });
            return { data: { user: { id: userId } }, error: null };
          },
          async listUsers(options) {
            calls.push({ method: "listUsers", options });
            return { data: { users: [...users] }, error: null };
          }
        }
      }
    },
    calls,
    public: {
      auth: {
        async resetPasswordForEmail(email, options) {
          calls.push({ email, method: "resetPasswordForEmail", options });
          return { data: {}, error: null };
        }
      }
    },
    userId
  };
}

function fakePrisma({ failTransaction = false, permissions = [] } = {}) {
  const state = {
    audits: [],
    orgUpserts: [],
    permissions: [...permissions],
    tenantUpserts: [],
    transactionCount: 0
  };
  const tx = {
    auditLog: {
      async create({ data }) {
        state.audits.push(data);
      }
    },
    orgMember: {
      async upsert(input) {
        state.orgUpserts.push(input);
      }
    },
    permissionGrant: {
      async createMany({ data }) {
        state.permissions = data.map((row) => row.permission);
      },
      async deleteMany() {
        state.permissions = [];
      },
      async findMany() {
        return state.permissions.map((permission) => ({ permission }));
      }
    },
    tenantMember: {
      async upsert(input) {
        state.tenantUpserts.push(input);
      }
    }
  };
  return {
    state,
    async $disconnect() {},
    async $transaction(action) {
      state.transactionCount += 1;
      if (failTransaction) throw new Error("controlled transaction failure");
      return action(tx);
    }
  };
}

function permissionLiterals(source) {
  return [
    ...new Set(
      [
        ...source.matchAll(/["']([a-z_]+:(?:read|write|rollback|switch|export))["']/g)
      ].map((match) => match[1])
    )
  ].sort();
}

function readTree(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return [readTree(path)];
      return entry.name.endsWith(".ts") ? [readFileSync(path, "utf8")] : [];
    })
    .join("\n");
}

function authCallbackModule() {
  const source = `${readFileSync("apps/admin/src/adminRuntimeAuth.ts", "utf8")}
export { readAuthCallback as __readAuthCallback, clearAuthCallbackUrl as __clearAuthCallbackUrl };`;
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 }
  }).outputText;
  const module = { exports: {} };
  const context = {
    URL,
    URLSearchParams,
    document: { title: "Admin" },
    exports: module.exports,
    module,
    replacedUrl: "",
    window: {
      history: {
        replaceState: (_state, _title, url) => {
          context.replacedUrl = url;
        }
      },
      location: { href: "https://admin.example.test/" }
    }
  };
  const require = createRequire(import.meta.url);
  const load = (specifier) => {
    if (specifier === "react") return {};
    if (specifier === "@supabase/supabase-js") return { createClient() {} };
    if (specifier === "./adminRuntimeConfig") return {};
    return require(specifier);
  };
  vm.runInNewContext(`(function(require,module,exports){${output}\n})`, context)(
    load,
    module,
    module.exports
  );
  context.exports = module.exports;
  return context;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

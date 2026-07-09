import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  formatProvisioningResult,
  readProvisioningConfig,
  runM906EmployeeProvisioning
} from "../../packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs";

const requiredEnv = {
  UZMAX_RLS_DATABASE_URL: "postgres://controlled.example/uzmax",
  UZMAX_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
  UZMAX_SUPABASE_SECRET_KEY: "service-role-secret",
  UZMAX_SUPABASE_URL: "https://supabase.example.test"
};

test("missing required secrets fail before provisioning", () => {
  assert.throws(
    () => readProvisioningConfig({ UZMAX_SUPABASE_URL: "https://example.test" }),
    /UZMAX_RLS_DATABASE_URL is required/
  );
});

test("query-only database URL fails before provisioning", () => {
  assert.throws(
    () =>
      readProvisioningConfig({
        ...requiredEnv,
        UZMAX_RLS_DATABASE_URL: "&connection_limit=4&pool_timeout=60"
      }),
    /UZMAX_RLS_DATABASE_URL must be a postgres URL/
  );
});

test("provisions a deterministic employee, grants scoped read, and runs M9-04 smoke", async () => {
  const prisma = fakePrisma();
  const supabaseAdmin = fakeSupabaseAdmin({ mode: "missing" });
  const password = "Do-not-print-this-password-Aa1!";
  const smokeCalls = [];
  const result = await runM906EmployeeProvisioning({
    env: requiredEnv,
    password,
    prisma,
    smokeRunner: async (input) => {
      smokeCalls.push(input);
      return {
        category: "pass",
        conversationCount: 1,
        conversationStatus: 200,
        exitCode: 0,
        live: true,
        ok: true,
        status: "m9_04_employee_admin_read_passed_not_ga0_open",
        tokenHashPrefix: "abc123def456",
        tokenSource: "supabase-password"
      };
    },
    supabaseAdmin
  });

  assert.equal(supabaseAdmin.calls[0].method, "getUserById");
  assert.equal(supabaseAdmin.calls[1].method, "createUser");
  assert.equal(
    result.status,
    "m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open"
  );
  assert.equal(result.boundary.ga0Opened, false);
  assert.equal(result.boundary.aiQualityGatesPassed, false);
  assert.equal(result.employeeScope.permissionCount, 2);
  assert.deepEqual(
    prisma.calls.map((call) => call.sql.includes("permission_grant")),
    [false, false, true, true]
  );
  assert.equal(smokeCalls[0].env.UZMAX_ADMIN_EMPLOYEE_PASSWORD, password);

  const printed = formatProvisioningResult(result);
  assert.doesNotMatch(printed, /Do-not-print-this-password/);
  assert.doesNotMatch(printed, /service-role-secret/);
  assert.doesNotMatch(printed, /postgres:\/\/controlled/);
  assert.doesNotMatch(printed, /publishable-key/);
});

test("existing employee user is updated instead of duplicated", async () => {
  const supabaseAdmin = fakeSupabaseAdmin({ mode: "existing" });
  const result = await runM906EmployeeProvisioning({
    env: requiredEnv,
    password: "Controlled-update-password-Aa1!",
    prisma: fakePrisma(),
    smokeRunner: async () => ({
      category: "runtime_blocker",
      exitCode: 4,
      live: true,
      ok: false,
      stage: "conversation-read",
      status: "m9_04_runtime_blocker_not_ga0"
    }),
    supabaseAdmin
  });

  assert.deepEqual(
    supabaseAdmin.calls.map((call) => call.method),
    ["getUserById", "updateUserById"]
  );
  assert.equal(result.ok, false);
  assert.equal(result.exitCode, 4);
  assert.equal(
    result.status,
    "m9_06_employee_account_provisioned_m9_04_live_blocked_not_ga0"
  );
});

test("documents the dispatch-only secret boundary", () => {
  const workflow = readFileSync(".github/workflows/m9-ga0-employee-smoke.yml", "utf8");
  const spec = readFileSync(
    "docs/specs/M9-06-ga0-employee-provisioning-smoke.md",
    "utf8"
  );
  const evidence = readFileSync(
    "docs/evidence/M9/M9-06-ga0-employee-provisioning-smoke.md",
    "utf8"
  );

  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /UZMAX_SUPABASE_SECRET_KEY/);
  assert.match(
    workflow,
    /UZMAX_RLS_DATABASE_URL: \$\{\{ secrets\.UZMAX_RLS_DATABASE_URL \}\}/
  );
  assert.doesNotMatch(
    workflow,
    /\$\{\{ secrets\.UZMAX_RLS_DATABASE_URL \}\}[^\n]*connection_limit/
  );
  assert.match(workflow, /confirm/);
  assert.match(spec, /does not open GA-0/i);
  assert.match(evidence, /m9_06_employee_account_provisioning_workflow_ready_not_run/);
  assert.match(evidence, /must not print/);
  assert.doesNotMatch(
    evidence,
    /service-role-secret|Do-not-print-this-password|postgres:\/\/controlled/
  );
});

function fakeSupabaseAdmin({ mode }) {
  const calls = [];
  const userId = "90000000-0000-4000-8000-000000000906";
  return {
    calls,
    auth: {
      admin: {
        async createUser(attributes) {
          calls.push({ attributes, method: "createUser" });
          return { data: { user: { id: attributes.id } }, error: null };
        },
        async getUserById(id) {
          calls.push({ id, method: "getUserById" });
          if (mode === "existing") {
            return { data: { user: { id: userId } }, error: null };
          }
          return { data: { user: null }, error: { message: "User not found" } };
        },
        async updateUserById(id, attributes) {
          calls.push({ attributes, id, method: "updateUserById" });
          return { data: { user: { id } }, error: null };
        }
      }
    }
  };
}

function fakePrisma() {
  return {
    calls: [],
    async $executeRaw(strings, ...values) {
      this.calls.push({
        sql: Array.from(strings).join("?"),
        values
      });
      return 1;
    },
    async $disconnect() {
      this.calls.push({ sql: "disconnect", values: [] });
    }
  };
}

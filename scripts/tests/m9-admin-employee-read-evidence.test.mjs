import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  formatSmokeResult,
  runEmployeeReadSmoke
} from "../run-m9-admin-employee-read-smoke.mjs";

const files = {
  evidence: read("docs/evidence/M9/M9-04-admin-employee-read-evidence.md"),
  release: read("docs/release.md"),
  script: read("scripts/run-m9-admin-employee-read-smoke.mjs"),
  spec: read("docs/specs/M9-04-admin-employee-read-evidence.md")
};

test("missing employee auth fails closed before live network", async () => {
  const calls = [];
  const result = await runEmployeeReadSmoke({
    env: scopedEnv(),
    fetchImpl: fakeFetch(calls),
    live: true
  });

  assert.equal(result.ok, false);
  assert.equal(result.exitCode, 2);
  assert.equal(result.category, "owner_input_blocker");
  assert.equal(result.status, "m9_04_owner_input_employee_session_required_not_ga0");
  assert.equal(calls.length, 0);
});

test("password flow uses Supabase auth then conversation API with scoped headers", async () => {
  const calls = [];
  const result = await runEmployeeReadSmoke({
    env: scopedEnv({
      UZMAX_ADMIN_EMPLOYEE_EMAIL: "employee@example.test",
      UZMAX_ADMIN_EMPLOYEE_PASSWORD: "employee-password",
      UZMAX_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      UZMAX_SUPABASE_URL: "https://supabase.example.test"
    }),
    fetchImpl: fakeFetch(calls, {
      conversationBody: { items: [{ customerName: "secret customer text" }] },
      token: "supabase-access-token-secret"
    }),
    live: true
  });

  assert.equal(result.ok, true);
  assert.equal(result.conversationCount, 1);
  assert.deepEqual(
    calls.map((call) => call.url),
    [
      "https://uzmax-admin.vercel.app",
      "https://supabase.example.test/auth/v1/token?grant_type=password",
      "https://uzmax-api-staging.onrender.com/conversation-ticket/conversations"
    ]
  );
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    email: "employee@example.test",
    password: "employee-password"
  });
  assert.equal(calls[1].init.headers.apikey, "publishable-key");
  assert.equal(
    calls[2].init.headers.authorization,
    "Bearer supabase-access-token-secret"
  );
  assert.equal(calls[2].init.headers["x-org-id"], "org-123");
  assert.equal(calls[2].init.headers["x-tenant-id"], "tenant-456");

  const printed = formatSmokeResult(result);
  assert.match(printed, /tokenHashPrefix/);
  assert.doesNotMatch(printed, /supabase-access-token-secret/);
  assert.doesNotMatch(printed, /employee-password/);
  assert.doesNotMatch(printed, /secret customer text/);
});

test("manual token path skips Supabase auth and reads conversation API", async () => {
  const calls = [];
  const result = await runEmployeeReadSmoke({
    env: scopedEnv({
      UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN: "manual-access-token-secret",
      UZMAX_SUPABASE_PUBLISHABLE_KEY: "unused-publishable-key",
      UZMAX_SUPABASE_URL: "https://unused-supabase.example.test"
    }),
    fetchImpl: fakeFetch(calls),
    live: true
  });

  assert.equal(result.ok, true);
  assert.deepEqual(
    calls.map((call) => call.url),
    [
      "https://uzmax-admin.vercel.app",
      "https://uzmax-api-staging.onrender.com/conversation-ticket/conversations"
    ]
  );
  assert.equal(
    calls[1].init.headers.authorization,
    "Bearer manual-access-token-secret"
  );

  const printed = formatSmokeResult(result);
  assert.match(printed, /tokenHashPrefix/);
  assert.doesNotMatch(printed, /manual-access-token-secret/);
});

test("docs keep GA-0 locked and record M9-04 owner-input blocker", () => {
  for (const doc of [files.spec, files.evidence, files.release]) {
    assert.match(doc, /m9_04_owner_input_employee_session_required_not_ga0/);
    assert.match(doc, /GA-0 remains locked/);
    assert.match(doc, /1\.0 remains blocked|1\.0 remains blocked/i);
    assert.match(doc, /employee Supabase|employee session|employee auth/i);
    assert.match(doc, /owner-input blocker|owner-provided employee-session/i);
    assert.doesNotMatch(doc, /m9_04_employee_admin_read_passed_not_ga0_open.*current/i);
    assert.doesNotMatch(doc, /\b1\.0 (?:approved|ready|released)\b/i);
  }

  assert.match(files.release, /M9-04 employee admin read evidence/);
  assert.match(
    files.release,
    /docs\/evidence\/M9\/M9-04-admin-employee-read-evidence\.md/
  );
  assert.match(files.script, /--live first fetches admin HTML/);
  assert.match(files.script, /conversation-ticket\/conversations/);
  assert.doesNotMatch(files.script, /console\.log\(.*accessToken/s);
});

function scopedEnv(overrides = {}) {
  return {
    UZMAX_ORG_ID: "org-123",
    UZMAX_TENANT_ID: "tenant-456",
    ...overrides
  };
}

function fakeFetch(calls, options = {}) {
  return async (url, init = {}) => {
    calls.push({ init, url });
    if (url === "https://uzmax-admin.vercel.app") {
      return response(200, '<!doctype html><div id="root"></div>', {
        "content-type": "text/html; charset=utf-8"
      });
    }
    if (url.includes("/auth/v1/token")) {
      return response(200, { access_token: options.token ?? "employee-token" });
    }
    if (url.endsWith("/conversation-ticket/conversations")) {
      return response(200, options.conversationBody ?? { items: [] });
    }
    throw new Error(`unexpected URL ${url}`);
  };
}

function response(status, body, headers = {}) {
  return {
    headers: {
      get(name) {
        return headers[name] ?? headers[name.toLowerCase()] ?? "";
      }
    },
    json: async () => (typeof body === "string" ? JSON.parse(body) : body),
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body))
  };
}

function read(path) {
  return readFileSync(path, "utf8");
}

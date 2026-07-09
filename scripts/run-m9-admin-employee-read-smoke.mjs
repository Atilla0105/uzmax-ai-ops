#!/usr/bin/env node
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const defaultAdminUrl = "https://uzmax-admin.vercel.app";
const defaultApiBaseUrl = "https://uzmax-api-staging.onrender.com";
const conversationPath = "/conversation-ticket/conversations";

const helpText = `M9-04 admin employee read smoke

Purpose:
- prove the Vercel admin / Render API conversation read path with a real employee session
- fail closed when employee auth input is absent
- never print token, password, raw auth response, customer text or secret values

Default:
- no live network
- no Supabase auth request
- no conversation API request
- no GA-0 or 1.0 approval

Usage:
  node scripts/run-m9-admin-employee-read-smoke.mjs --help
  node scripts/run-m9-admin-employee-read-smoke.mjs
  node scripts/run-m9-admin-employee-read-smoke.mjs --live

Live env:
- UZMAX_ADMIN_URL (default: https://uzmax-admin.vercel.app)
- UZMAX_API_BASE_URL or VITE_UZMAX_API_BASE_URL (default: https://uzmax-api-staging.onrender.com)
- UZMAX_ORG_ID or VITE_UZMAX_ORG_ID
- UZMAX_TENANT_ID or VITE_UZMAX_TENANT_ID
- UZMAX_SUPABASE_URL or VITE_UZMAX_SUPABASE_URL
- UZMAX_SUPABASE_PUBLISHABLE_KEY or VITE_UZMAX_SUPABASE_PUBLISHABLE_KEY
- UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN
  OR UZMAX_ADMIN_EMPLOYEE_EMAIL plus UZMAX_ADMIN_EMPLOYEE_PASSWORD

Live boundary:
- --live first fetches admin HTML, then uses/obtains an employee token, then reads the conversation API
- HTTP 200 from /conversation-ticket/conversations is M9-04 pass evidence only
- missing employee auth is owner-input blocker m9_04_owner_input_employee_session_required_not_ga0
- HTTP 401/403 is an authz blocker
- this command must not be used as Supabase SQL/admin direct DB evidence
`;

function parseArgs(argv) {
  return argv.reduce(
    (parsed, arg) => {
      if (arg === "--help" || arg === "-h") return { ...parsed, help: true };
      if (arg === "--live") return { ...parsed, live: true };
      throw new Error(`unsupported argument: ${arg}`);
    },
    { help: false, live: false }
  );
}

function readSmokeConfig(env = process.env) {
  const manualToken = envText(env.UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN);
  const email = envText(env.UZMAX_ADMIN_EMPLOYEE_EMAIL);
  const password = envText(env.UZMAX_ADMIN_EMPLOYEE_PASSWORD);
  return {
    adminUrl: envText(env.UZMAX_ADMIN_URL) || defaultAdminUrl,
    apiBaseUrl:
      envText(env.UZMAX_API_BASE_URL) ||
      envText(env.VITE_UZMAX_API_BASE_URL) ||
      defaultApiBaseUrl,
    auth: authConfig({ email, manualToken, password }),
    orgId: envText(env.UZMAX_ORG_ID) || envText(env.VITE_UZMAX_ORG_ID),
    supabasePublishableKey:
      envText(env.UZMAX_SUPABASE_PUBLISHABLE_KEY) ||
      envText(env.VITE_UZMAX_SUPABASE_PUBLISHABLE_KEY),
    supabaseUrl:
      envText(env.UZMAX_SUPABASE_URL) || envText(env.VITE_UZMAX_SUPABASE_URL),
    tenantId: envText(env.UZMAX_TENANT_ID) || envText(env.VITE_UZMAX_TENANT_ID)
  };
}

export async function runEmployeeReadSmoke(input = {}) {
  const args = smokeArgs(input);
  const config = readSmokeConfig(input.env ?? process.env);
  const fetchImpl = input.fetchImpl ?? globalThis.fetch;

  if (args.help) return { exitCode: 0, help: true, ok: true, status: "help" };
  if (!args.live) return dryRunResult(config);
  return runLiveEmployeeReadSmoke(config, fetchImpl);
}

async function runLiveEmployeeReadSmoke(config, fetchImpl) {
  const inputBlocker = ownerInputBlocker(config);
  if (inputBlocker) return inputBlocker;
  if (typeof fetchImpl !== "function")
    return runtimeBlocker("runtime", "fetch unavailable");

  const adminResult = await verifyAdmin(fetchImpl, config.adminUrl);
  if (!adminResult.ok) return adminResult;

  const tokenResult = await employeeToken(fetchImpl, config);
  if (!tokenResult.ok) return tokenResult;

  return withTokenSummary(
    await readConversations(fetchImpl, config, tokenResult.accessToken),
    tokenResult
  );
}

function smokeArgs(input) {
  return Array.isArray(input.args)
    ? parseArgs(input.args)
    : { help: false, live: Boolean(input.live) };
}

export function formatSmokeResult(result) {
  return JSON.stringify(publicResult(result), null, 2);
}

function authConfig(input) {
  if (input.manualToken) return { mode: "manual-token", token: input.manualToken };
  if (input.email && input.password) {
    return { email: input.email, mode: "password", password: input.password };
  }
  return { mode: "missing" };
}

function dryRunResult(config) {
  return {
    authMode: config.auth.mode,
    exitCode: 0,
    live: false,
    ok: true,
    status: "m9_04_dry_run_no_live_network_not_ga0"
  };
}

function ownerInputBlocker(config) {
  if (config.auth.mode === "missing") {
    return ownerInputResult("employee-auth", [
      "UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN or UZMAX_ADMIN_EMPLOYEE_EMAIL/UZMAX_ADMIN_EMPLOYEE_PASSWORD"
    ]);
  }
  if (config.auth.mode === "password" && missingSupabaseConfig(config).length > 0) {
    return ownerInputResult("supabase-auth-config", missingSupabaseConfig(config));
  }
  const missingScope = missingScopedHeaders(config);
  return missingScope.length > 0
    ? ownerInputResult("runtime-scope", missingScope)
    : undefined;
}

function missingSupabaseConfig(config) {
  return [
    !config.supabaseUrl && "UZMAX_SUPABASE_URL or VITE_UZMAX_SUPABASE_URL",
    !config.supabasePublishableKey &&
      "UZMAX_SUPABASE_PUBLISHABLE_KEY or VITE_UZMAX_SUPABASE_PUBLISHABLE_KEY"
  ].filter(Boolean);
}

function missingScopedHeaders(config) {
  return [
    !config.orgId && "UZMAX_ORG_ID or VITE_UZMAX_ORG_ID",
    !config.tenantId && "UZMAX_TENANT_ID or VITE_UZMAX_TENANT_ID"
  ].filter(Boolean);
}

function ownerInputResult(stage, missing) {
  return {
    category: "owner_input_blocker",
    exitCode: 2,
    live: true,
    missing,
    ok: false,
    stage,
    status: "m9_04_owner_input_employee_session_required_not_ga0"
  };
}

async function verifyAdmin(fetchImpl, adminUrl) {
  try {
    const response = await fetchImpl(adminUrl, {
      headers: { accept: "text/html,application/xhtml+xml" },
      method: "GET"
    });
    const body = await safeText(response);
    if (response.ok && isHtmlish(response, body)) {
      return { adminStatus: response.status, ok: true };
    }
    return runtimeBlocker("admin-html", `admin status ${response.status}`);
  } catch (error) {
    return runtimeBlocker("admin-html", errorMessage(error));
  }
}

async function employeeToken(fetchImpl, config) {
  if (config.auth.mode === "manual-token") {
    return {
      accessToken: config.auth.token,
      ok: true,
      tokenHashPrefix: tokenHashPrefix(config.auth.token),
      tokenSource: "manual-token"
    };
  }
  return supabasePasswordToken(fetchImpl, config);
}

async function supabasePasswordToken(fetchImpl, config) {
  try {
    const response = await fetchImpl(
      `${trimTrailingSlash(config.supabaseUrl)}/auth/v1/token?grant_type=password`,
      {
        body: JSON.stringify({
          email: config.auth.email,
          password: config.auth.password
        }),
        headers: {
          apikey: config.supabasePublishableKey,
          "content-type": "application/json"
        },
        method: "POST"
      }
    );
    const payload = await safeJson(response);
    return tokenFromSupabaseResponse(response, payload);
  } catch (error) {
    return runtimeBlocker("supabase-auth", errorMessage(error));
  }
}

function tokenFromSupabaseResponse(response, payload) {
  if (!response.ok) {
    return authzBlocker("supabase-auth", response.status, {
      status: "m9_04_employee_supabase_auth_blocker_not_ga0"
    });
  }
  const accessToken = recordValue(payload, "access_token");
  if (!accessToken) {
    return runtimeBlocker("supabase-auth", "missing access token");
  }
  return {
    accessToken,
    ok: true,
    tokenHashPrefix: tokenHashPrefix(accessToken),
    tokenSource: "supabase-password"
  };
}

async function readConversations(fetchImpl, config, accessToken) {
  try {
    const response = await fetchImpl(
      `${trimTrailingSlash(config.apiBaseUrl)}${conversationPath}`,
      {
        headers: conversationHeaders(config, accessToken),
        method: "GET"
      }
    );
    return conversationResponse(response, await conversationPayload(response));
  } catch (error) {
    return runtimeBlocker("conversation-read", errorMessage(error));
  }
}

function conversationHeaders(config, accessToken) {
  return {
    accept: "application/json",
    authorization: `Bearer ${accessToken}`,
    "x-org-id": config.orgId,
    "x-tenant-id": config.tenantId
  };
}

async function conversationPayload(response) {
  if (!response.ok) return {};
  return safeJson(response);
}

function conversationResponse(response, payload) {
  if (response.status === 401 || response.status === 403) {
    return authzBlocker("conversation-read", response.status);
  }
  if (!response.ok) {
    return runtimeBlocker("conversation-read", `api status ${response.status}`);
  }
  if (!Array.isArray(payload.items)) {
    return runtimeBlocker("conversation-read", "items array missing");
  }
  return {
    category: "pass",
    conversationCount: payload.items.length,
    conversationStatus: response.status,
    exitCode: 0,
    live: true,
    ok: true,
    status: "m9_04_employee_admin_read_passed_not_ga0_open"
  };
}

function withTokenSummary(result, tokenResult) {
  return {
    ...result,
    tokenHashPrefix: tokenResult.tokenHashPrefix,
    tokenSource: tokenResult.tokenSource
  };
}

function authzBlocker(stage, httpStatus, override = {}) {
  return {
    category: "authz_blocker",
    exitCode: 3,
    httpStatus,
    live: true,
    ok: false,
    stage,
    status: "m9_04_employee_admin_read_authz_blocker_not_ga0",
    ...override
  };
}

function runtimeBlocker(stage, message) {
  return {
    category: "runtime_blocker",
    exitCode: 4,
    live: true,
    message,
    ok: false,
    stage,
    status: "m9_04_runtime_blocker_not_ga0"
  };
}

async function safeJson(response) {
  try {
    const value = await response.json();
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

async function safeText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function isHtmlish(response, body) {
  const contentType = headerValue(response.headers, "content-type").toLowerCase();
  return (
    contentType.includes("text/html") ||
    /<!doctype html|<html[\s>]|<div[^>]+id=["']root["']/i.test(body)
  );
}

function headerValue(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") return headers.get(name) ?? "";
  return headers[name] ?? headers[name.toLowerCase()] ?? "";
}

function publicResult(result) {
  const safe = { ...result };
  delete safe.accessToken;
  delete safe.password;
  delete safe.token;
  return safe;
}

function tokenHashPrefix(token) {
  return createHash("sha256").update(token).digest("hex").slice(0, 12);
}

function recordValue(record, key) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : "";
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function envText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function errorMessage(error) {
  return error instanceof Error && error.message ? error.message : "unknown error";
}

function isMainModule() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    const result = await runEmployeeReadSmoke({ args: process.argv.slice(2) });
    if (result.help) console.log(helpText.trimEnd());
    else console.log(formatSmokeResult(result));
    process.exitCode = result.exitCode;
  } catch (error) {
    console.error(errorMessage(error));
    process.exitCode = 1;
  }
}

import { createHash } from "node:crypto";

export const okStatus = "m10_03_support_operator_write_smoke_passed_not_release";
export const blockedStatus = "m10_03_support_operator_write_smoke_blocked_not_release";
const authzBlockerStatus = "m10_03_support_operator_authz_blocker_not_release";
const runtimeBlockerStatus = "m10_03_support_operator_runtime_blocker_not_release";

export async function runApiSmoke(fetchImpl, config, password) {
  if (typeof fetchImpl !== "function") {
    return runtimeBlocker("runtime", "fetch unavailable");
  }
  const token = await supportOperatorToken(fetchImpl, config, password);
  if (!token.ok) return token;
  const list = await fetchConversationList(fetchImpl, config, token.accessToken);
  if (!list.ok) return list;
  const handoff = await createHandoffTicket(fetchImpl, config, token.accessToken);
  if (!handoff.ok) return handoff;
  const actions = await runTicketActions(
    fetchImpl,
    config,
    token.accessToken,
    handoff.ticketId
  );
  if (!actions.ok) return actions;
  return passedSmoke({ actions, handoff, list, token });
}

async function fetchConversationList(fetchImpl, config, accessToken) {
  const list = await fetchJson(fetchImpl, conversationUrl(config), {
    headers: apiHeaders(config, accessToken),
    method: "GET"
  });
  if (!list.ok) return list;
  if (!Array.isArray(list.payload.items)) {
    return runtimeBlocker("conversation-list", "items array missing");
  }
  if (!hasSyntheticConversation(list.payload.items, config)) {
    return runtimeBlocker("conversation-list", "synthetic conversation missing");
  }
  return { httpStatus: list.httpStatus, ok: true };
}

async function createHandoffTicket(fetchImpl, config, accessToken) {
  const handoff = await fetchJson(
    fetchImpl,
    `${conversationUrl(config)}/${config.syntheticConversationId}/handoff`,
    {
      body: JSON.stringify({
        reason: "controlled M10-03 support operator smoke",
        slaPolicyRef: "controlled://sla/m10-03"
      }),
      headers: jsonHeaders(config, accessToken),
      method: "POST"
    }
  );
  if (!handoff.ok) return handoff;
  const ticketId = recordValue(handoff.payload.ticket ?? {}, "id");
  return ticketId
    ? { httpStatus: handoff.httpStatus, ok: true, ticketId }
    : runtimeBlocker("handoff", "ticket id missing");
}

async function runTicketActions(fetchImpl, config, accessToken, ticketId) {
  const actions = [];
  for (const action of ticketActions()) {
    const result = await fetchJson(fetchImpl, ticketActionUrl(config, ticketId), {
      body: JSON.stringify(action),
      headers: jsonHeaders(config, accessToken),
      method: "POST"
    });
    if (!result.ok) return result;
    actions.push({ httpStatus: result.httpStatus, type: action.type });
  }
  return { actions, ok: true };
}

function passedSmoke({ actions, handoff, list, token }) {
  return {
    actionCount: actions.actions.length,
    actions: actions.actions,
    category: "pass",
    conversationListStatus: list.httpStatus,
    exitCode: 0,
    handoffStatus: handoff.httpStatus,
    live: true,
    ok: true,
    status: okStatus,
    tokenHashPrefix: hashPrefix(token.accessToken),
    tokenSource: "supabase-password"
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
  return accessToken
    ? { accessToken, ok: true }
    : runtimeBlocker("supabase-auth", "missing access token");
}

async function fetchJson(fetchImpl, url, options, stageName = stageFromUrl(url)) {
  try {
    const response = await fetchImpl(url, options);
    if (response.status === 401 || response.status === 403) {
      return authzBlocker(stageName, response.status);
    }
    const payload = response.ok ? await safeJson(response) : {};
    return response.ok
      ? { httpStatus: response.status, ok: true, payload }
      : runtimeBlocker(stageName, `http status ${response.status}`);
  } catch {
    return runtimeBlocker(stageName, "request failed");
  }
}

function ticketActions() {
  return [
    { type: "claim" },
    { note: "controlled M10-03 operator note", type: "note" },
    { destination: "handled_in_admin", result: "resolved", type: "close" },
    { reason: "controlled M10-03 reopen", type: "reopen" }
  ];
}

function hasSyntheticConversation(items, config) {
  return items.some((item) => item?.id === config.syntheticConversationId);
}

function apiHeaders(config, accessToken) {
  return {
    accept: "application/json",
    authorization: `Bearer ${accessToken}`,
    "x-org-id": config.orgId,
    "x-tenant-id": config.tenantId
  };
}

function jsonHeaders(config, accessToken) {
  return { ...apiHeaders(config, accessToken), "content-type": "application/json" };
}

function authzBlocker(stageName, httpStatus) {
  return blocker("authz_blocker", stageName, authzBlockerStatus, { httpStatus });
}

export function runtimeBlocker(stageName, message) {
  return blocker("runtime_blocker", stageName, runtimeBlockerStatus, {
    message: safeMessage(message)
  });
}

function blocker(category, stageName, status, extra) {
  return {
    category,
    exitCode: category === "authz_blocker" ? 3 : 4,
    live: true,
    ok: false,
    stage: stageName,
    status,
    ...extra
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

export function hashPrefix(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function recordValue(record, key) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : "";
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

export function safeMessage(message) {
  const value = typeof message === "string" && message.trim() ? message : "failed";
  return value
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-db-url]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted-jwt]")
    .replace(/service[_-]?role[^\s,;]*/gi, "service-role-[redacted]");
}

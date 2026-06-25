type Init = {
  body?: string;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
};
type Fetcher = (
  input: string,
  init?: Init
) => Promise<{ json(): Promise<unknown>; ok: boolean; status: number }>;
type Action = Record<string, unknown> & { reasonRef: string };
type Toggle = Action & { enabled: boolean };

const KEYS = ["business_draft", "order_read", "quote", "tutorial", "vision"] as const;
const BAD =
  /raw|prompt|completion|customer|telegram|order|phone|payment|secret|url|body|content/i;
const REF = /^(controlled|manifest|redaction|storage|ticket):\/\/[^\s]+$/i;
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ROUTE = {
  capabilities: "runtime-control/capabilities",
  recover: "runtime-control/recover",
  state: "runtime-control",
  stop: "runtime-control/emergency-stop"
} as const;
type Route = (typeof ROUTE)[keyof typeof ROUTE];

export function createAiMemberRuntimeApiClient({
  basePath = "/ai-members",
  fetcher
}: {
  basePath?: string;
  fetcher: Fetcher;
}) {
  if (typeof fetcher !== "function") throw new Error("fetcher is required");
  const root = text(basePath, "basePath").replace(/\/+$/, "");
  if (!root.startsWith("/") || root.startsWith("//"))
    throw new Error("basePath must be relative");
  const path = (memberId: string, route: Route = ROUTE.state) =>
    `${root}/${encodeURIComponent(uuid(memberId, "memberId"))}/${route}`;
  const post = (url: string, body: Record<string, unknown>) =>
    json(fetcher, url, {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
      method: "POST"
    });
  return {
    getRuntimeState: (memberId: string) => json(fetcher, path(memberId)),
    emergencyStop: (memberId: string, input: Action) =>
      post(path(memberId, ROUTE.stop), payload(input)),
    recoverOnline: (memberId: string, input: Action) =>
      post(path(memberId, ROUTE.recover), payload(input)),
    toggleCapability: (memberId: string, capabilityKey: string, input: Toggle) =>
      post(
        `${path(memberId, ROUTE.capabilities)}/${capability(capabilityKey)}`,
        payload(input, true)
      )
  };
}

async function json(fetcher: Fetcher, path: string, init: Init = { method: "GET" }) {
  const response = await fetcher(path, init);
  if (!response.ok)
    throw new Error(
      `AI member runtime API request failed with status ${response.status}`
    );
  return record(await response.json(), "AI member runtime response");
}
function payload(input: Action, toggle = false) {
  const value = safe(input, "AI member runtime request");
  const out: Record<string, unknown> = { reasonRef: ref(value.reasonRef, "reasonRef") };
  for (const key of ["breakerResolvedRef", "controlRef"] as const)
    if (value[key] !== undefined) out[key] = ref(value[key], key);
  if (value.traceId !== undefined) out.traceId = trace(value.traceId);
  if (toggle) {
    out.enabled = bool(value.enabled, "enabled");
    if (value.configVersionId !== undefined)
      out.configVersionId = uuid(value.configVersionId, "configVersionId");
    if (value.evalGateId !== undefined)
      out.evalGateId = uuid(value.evalGateId, "evalGateId");
  }
  return out;
}
function safe(value: unknown, name: string) {
  const out = record(value, name);
  for (const [key, child] of Object.entries(out)) {
    if (BAD.test(key)) throw new Error(`${name}.${key} is forbidden`);
    if (child && typeof child === "object") safe(child, `${name}.${key}`);
  }
  return out;
}
function capability(value: string) {
  if (!KEYS.includes(value as (typeof KEYS)[number]))
    throw new Error("AI capability key is invalid");
  return encodeURIComponent(value);
}
function ref(value: unknown, name: string) {
  const out = text(value, name);
  if (!REF.test(out)) throw new Error(`${name} must be a controlled ref`);
  return out;
}
function uuid(value: unknown, name: string) {
  const out = text(value, name);
  if (!ID.test(out)) throw new Error(`${name} must be a UUID`);
  return out;
}
function trace(value: unknown) {
  const out = text(value, "traceId");
  if (!/^[a-z0-9:._-]{1,140}$/i.test(out)) throw new Error("traceId is invalid");
  return out;
}
function bool(value: unknown, name: string) {
  if (typeof value !== "boolean") throw new Error(`${name} must be boolean`);
  return value;
}
function text(value: unknown, name: string) {
  const out = typeof value === "string" ? value.trim() : "";
  if (!out) throw new Error(`${name} is required`);
  return out;
}
function record(value: unknown, name: string) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${name} must be an object`);
  return value as Record<string, unknown>;
}

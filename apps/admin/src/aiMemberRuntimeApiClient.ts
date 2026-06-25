type RequestInitLike = {
  body?: string;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
};

type ResponseLike = { json(): Promise<unknown>; ok: boolean; status: number };

export type AiMemberRuntimeApiFetcher = (
  input: string,
  init?: RequestInitLike
) => Promise<ResponseLike>;

export type AiMemberRuntimeActionRequest = {
  breakerResolvedRef?: string;
  controlRef?: string;
  reasonRef: string;
  traceId?: string;
};

export type AiMemberCapabilityToggleRequest = AiMemberRuntimeActionRequest & {
  configVersionId?: string;
  enabled: boolean;
  evalGateId?: string;
};

const CAPABILITY_KEYS = [
  "business_draft",
  "order_read",
  "quote",
  "tutorial",
  "vision"
] as const;
const FORBIDDEN_KEYS =
  /raw|prompt|completion|customer|telegram|order|phone|payment|secret|url|body|content/i;
const CONTROL_REF = /^(controlled|manifest|redaction|storage|ticket):\/\/[^\s]+$/i;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ROUTE = {
  capability: "runtime-control/capabilities",
  emergencyStop: "runtime-control/emergency-stop",
  recover: "runtime-control/recover",
  state: "runtime-control"
} as const;

export function createAiMemberRuntimeApiClient({
  basePath = "/ai-members",
  fetcher
}: {
  basePath?: string;
  fetcher: AiMemberRuntimeApiFetcher;
}) {
  if (typeof fetcher !== "function") throw new Error("fetcher is required");
  const root = base(basePath);
  const runtimePath = (memberId: string) =>
    `${root}/${encodeURIComponent(uuid(memberId, "memberId"))}`;
  const post = (url: string, body: Record<string, unknown>) =>
    json(fetcher, url, {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
      method: "POST"
    });
  return {
    getRuntimeState: (memberId: string) =>
      json(fetcher, `${runtimePath(memberId)}/${ROUTE.state}`),
    emergencyStop: (memberId: string, input: AiMemberRuntimeActionRequest) =>
      post(`${runtimePath(memberId)}/${ROUTE.emergencyStop}`, action(input)),
    recoverOnline: (memberId: string, input: AiMemberRuntimeActionRequest) =>
      post(`${runtimePath(memberId)}/${ROUTE.recover}`, action(input)),
    toggleCapability: (
      memberId: string,
      capabilityKey: string,
      input: AiMemberCapabilityToggleRequest
    ) =>
      post(
        `${runtimePath(memberId)}/${ROUTE.capability}/${capability(capabilityKey)}`,
        toggle(input)
      )
  };
}

async function json(
  fetcher: AiMemberRuntimeApiFetcher,
  path: string,
  init: RequestInitLike = { method: "GET" }
) {
  const response = await fetcher(path, init);
  if (!response.ok)
    throw new Error(
      `AI member runtime API request failed with status ${response.status}`
    );
  return record(await response.json(), "AI member runtime response");
}
function action(input: AiMemberRuntimeActionRequest) {
  const value = safe(input, "AI member action request");
  return clean({
    breakerResolvedRef: optRef(value.breakerResolvedRef, "breakerResolvedRef"),
    controlRef: optRef(value.controlRef, "controlRef"),
    reasonRef: ref(value.reasonRef, "reasonRef"),
    traceId: trace(value.traceId)
  });
}
function toggle(input: AiMemberCapabilityToggleRequest) {
  const value = safe(input, "AI member capability request");
  return clean({
    configVersionId: optUuid(value.configVersionId, "configVersionId"),
    controlRef: optRef(value.controlRef, "controlRef"),
    enabled: bool(value.enabled, "enabled"),
    evalGateId: optUuid(value.evalGateId, "evalGateId"),
    reasonRef: ref(value.reasonRef, "reasonRef"),
    traceId: trace(value.traceId)
  });
}
function safe(value: unknown, name: string) {
  const output = record(value, name);
  for (const [key, child] of Object.entries(output)) {
    if (FORBIDDEN_KEYS.test(key)) throw new Error(`${name}.${key} is forbidden`);
    if (child && typeof child === "object") safe(child, `${name}.${key}`);
  }
  return output;
}
function base(value: string) {
  const output = text(value, "basePath").replace(/\/+$/, "");
  if (!output.startsWith("/") || output.startsWith("//"))
    throw new Error("basePath must be relative");
  return output;
}
function capability(value: string) {
  if (!CAPABILITY_KEYS.includes(value as (typeof CAPABILITY_KEYS)[number]))
    throw new Error("AI capability key is invalid");
  return encodeURIComponent(value);
}
function ref(value: unknown, name: string) {
  const output = text(value, name);
  if (!CONTROL_REF.test(output)) throw new Error(`${name} must be a controlled ref`);
  return output;
}
function uuid(value: unknown, name: string) {
  const output = text(value, name);
  if (!UUID.test(output)) throw new Error(`${name} must be a UUID`);
  return output;
}
function optRef(value: unknown, name: string) {
  return value === undefined ? undefined : ref(value, name);
}
function optUuid(value: unknown, name: string) {
  return value === undefined ? undefined : uuid(value, name);
}
function trace(value: unknown) {
  if (value === undefined) return undefined;
  const output = text(value, "traceId");
  if (!/^[a-z0-9:._-]{1,140}$/i.test(output)) throw new Error("traceId is invalid");
  return output;
}
function bool(value: unknown, name: string) {
  if (typeof value !== "boolean") throw new Error(`${name} must be boolean`);
  return value;
}
function text(value: unknown, name: string) {
  const output = typeof value === "string" ? value.trim() : "";
  if (!output) throw new Error(`${name} is required`);
  return output;
}
function record(value: unknown, name: string) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${name} must be an object`);
  return value as Record<string, unknown>;
}
function clean(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  );
}

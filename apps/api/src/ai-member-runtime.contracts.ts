import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type { RlsTenantContext } from "../../../packages/db/src/index.ts";
import type { UzmaxPrismaRuntimeEnv } from "../../../packages/db/src/prisma-runtime.ts";

export type Operation<T = unknown> = T | Promise<T>;
export type Row = Record<string, unknown>;
type Model =
  | "aiCapabilityToggle"
  | "aiMember"
  | "aiMemberVersion"
  | "auditLog"
  | "evalGate";
type Delegate = Record<"create" | "findFirst" | "update", (args: Row) => Operation>;
export type PrismaPort = Record<Model, Delegate> & {
  $executeRawUnsafe(sql: string): Operation;
  $queryRaw(...args: readonly unknown[]): Operation;
  $transaction<T extends readonly Operation[]>(
    ops: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
};
export type RlsTxRunner = <T>(input: {
  map?(rows: readonly unknown[]): T;
  ops(client: PrismaPort): readonly Operation[];
  scope: RlsTenantContext;
}) => Promise<T>;
export type RuntimeEnv = UzmaxPrismaRuntimeEnv & {
  UZMAX_AI_MEMBER_RUNTIME_MODE?: string;
};
export type RuntimeMode = "disabled" | "rls_prisma_gateway";
export type RuntimeRequest = { accessContext?: AccessContext };
export type ActionInput = Row & { reasonRef: string } & Partial<
    Record<"breakerResolvedRef" | "controlRef" | "traceId", string>
  >;
export type ToggleInput = ActionInput & { enabled: boolean } & Partial<
    Record<"configVersionId" | "evalGateId", string>
  >;
const KEYS = ["business_draft", "order_read", "quote", "tutorial", "vision"] as const;
export type CapabilityKey = (typeof KEYS)[number];
type ActionMethod = (
  ctx: AccessContext,
  memberId: string,
  input: ActionInput
) => Promise<Row>;
export type AiMemberRuntimeRepositoryPort = {
  getRuntimeState(ctx: AccessContext, memberId: string): Promise<Row>;
  toggleCapability(
    ctx: AccessContext,
    memberId: string,
    key: CapabilityKey,
    input: ToggleInput
  ): Promise<Row>;
} & Record<"emergencyStop" | "recoverOnline", ActionMethod>;

export const AI_MEMBER_RUNTIME_REPOSITORY = Symbol("AI_MEMBER_RUNTIME_REPOSITORY");
export const aiMemberRuntimeModes = {
  disabled: "disabled",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
const REF =
  /^(controlled|manifest|redaction|storage|ticket):\/\/[a-z0-9][\w:/.-]{0,160}$/i;
const INLINE_REF = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const BAD_KEY =
  /raw|prompt|completion|customer|telegram|order|phone|payment|secret|url|body|content/i;

export class AiMemberRuntimeError extends Error {
  constructor(
    readonly statusCode: 400 | 404 | 503,
    message: string
  ) {
    super(message);
    this.name = "AiMemberRuntimeError";
  }
}

export const actionInput = (body: unknown) =>
  payload(body, "AI member action request") as ActionInput;
export const toggleInput = (body: unknown) =>
  payload(body, "AI capability toggle request", true) as ToggleInput;

export function readRuntimeMode(env: RuntimeEnv): RuntimeMode {
  const mode = env.UZMAX_AI_MEMBER_RUNTIME_MODE?.trim() || "disabled";
  if (mode === "prisma_gateway")
    throw new Error("AI member runtime env must use RLS Prisma gateway");
  if (mode === "disabled" || mode === "rls_prisma_gateway") return mode;
  throw new Error(`unsupported AI member runtime mode: ${mode}`);
}

export const setConfig = (
  prisma: Pick<PrismaPort, "$queryRaw">,
  { key, value }: { key: string; value: string }
) => {
  if (key !== "app.org_id" && key !== "app.tenant_id")
    throw new Error("AI member RLS setting is required");
  return prisma.$queryRaw`select set_config(${key}, ${value}, true)`;
};
export const scope = (ctx: AccessContext): RlsTenantContext => ({
  orgId: ctx.orgId,
  tenantId: ctx.selectedTenantId
});
export function capability(value: unknown): CapabilityKey {
  if (typeof value !== "string" || !KEYS.includes(value as CapabilityKey))
    throw bad("AI capability key is invalid");
  return value as CapabilityKey;
}
export const status = (value: unknown) => {
  const out = String(value).toLowerCase();
  if (["breaker_offline", "disabled", "manual_offline", "online"].includes(out))
    return out;
  throw bad("AI member status is invalid");
};
export function record(value: unknown, name: string): Row {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw bad(`${name} must be an object`);
  return value as Row;
}
export const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;
export const uuid = (value: unknown, name: string) => {
  const out = str(value, name);
  if (!UUID.test(out)) throw bad(`${name} must be a UUID`);
  return out;
};
export const bad = (message: string) => new AiMemberRuntimeError(400, message);

function payload(body: unknown, name: string, isToggle = false) {
  const input = record(body, name);
  safe(input);
  const out: Row = { reasonRef: ref(input.reasonRef, "reasonRef") };
  for (const key of ["breakerResolvedRef", "controlRef"] as const)
    if (input[key] !== undefined) out[key] = ref(input[key], key);
  if (input.traceId !== undefined) out.traceId = trace(input.traceId);
  if (isToggle) {
    out.enabled = bool(input.enabled, "enabled");
    if (input.configVersionId !== undefined)
      out.configVersionId = uuid(input.configVersionId, "configVersionId");
    if (input.evalGateId !== undefined)
      out.evalGateId = uuid(input.evalGateId, "evalGateId");
  }
  return out;
}
function safe(value: unknown, path = "request"): void {
  if (typeof value === "string") {
    if (/^(https?|data|blob|file):/i.test(value) || INLINE_REF.test(value))
      throw bad(`${path} must be a controlled ref`);
    return;
  }
  if (Array.isArray(value))
    return value.forEach((item, index) => safe(item, `${path}[${index}]`));
  if (value && typeof value === "object")
    for (const [key, child] of Object.entries(value)) {
      if (BAD_KEY.test(key)) throw bad(`${path}.${key} is a forbidden raw payload key`);
      safe(child, `${path}.${key}`);
    }
}
function str(value: unknown, name: string) {
  const out = typeof value === "string" ? value.trim() : "";
  if (!out) throw bad(`${name} is required`);
  return out;
}
function ref(value: unknown, name: string) {
  const out = str(value, name);
  if (!REF.test(out) || INLINE_REF.test(out))
    throw bad(`${name} must be a controlled ref`);
  return out;
}
function trace(value: unknown) {
  const out = str(value, "traceId");
  if (!/^[a-z0-9:._-]{1,140}$/i.test(out)) throw bad("traceId is invalid");
  return out;
}
function bool(value: unknown, name: string) {
  if (typeof value !== "boolean") throw bad(`${name} must be boolean`);
  return value;
}

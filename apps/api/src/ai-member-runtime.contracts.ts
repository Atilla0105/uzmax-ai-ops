import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type { RlsTenantContext } from "../../../packages/db/src/index.ts";
import type { UzmaxPrismaRuntimeEnv } from "../../../packages/db/src/prisma-runtime.ts";

export type Operation<T = unknown> = T | Promise<T>;
type PrismaMethod = (args: Record<string, unknown>) => Operation;
type PrismaDelegate = Record<
  "create" | "findFirst" | "findMany" | "update",
  PrismaMethod
>;
export type PrismaPort = {
  $executeRawUnsafe(sql: string): Operation;
  $queryRaw(strings: TemplateStringsArray, ...values: readonly unknown[]): Operation;
  $transaction<T extends readonly Operation[]>(
    operations: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
  aiCapabilityToggle: PrismaDelegate;
  aiMember: PrismaDelegate;
  aiMemberVersion: PrismaDelegate;
  auditLog: PrismaDelegate;
  evalGate: PrismaDelegate;
};
export type Row = Record<string, unknown>;
export type Bundle = { activeVersion?: Row; member: Row; toggles?: Row[] };
export type RlsTxRunner = <T>(input: {
  map?(rows: readonly unknown[]): T;
  ops(client: PrismaPort): readonly Operation[];
  scope: RlsTenantContext;
}) => Promise<T>;
export type RuntimeEnv = UzmaxPrismaRuntimeEnv &
  Partial<Record<"UZMAX_AI_MEMBER_RUNTIME_MODE", string>>;
export type RuntimeMode =
  (typeof aiMemberRuntimeModes)[keyof typeof aiMemberRuntimeModes];
export type RuntimeRequest = { accessContext?: AccessContext };
export type ActionInput = {
  breakerResolvedRef?: string;
  controlRef?: string;
  reasonRef: string;
  traceId?: string;
};
export type ToggleInput = ActionInput & {
  configVersionId?: string;
  enabled: boolean;
  evalGateId?: string;
};
export type CapabilityKey = (typeof capabilityKeys)[number];
export type RuntimeAction = "capability_toggle" | "emergency_stop" | "recover_online";

export const AI_MEMBER_RUNTIME_REPOSITORY = Symbol("AI_MEMBER_RUNTIME_REPOSITORY");
export const aiMemberRuntimeModes = {
  disabled: "disabled",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
const CONTROL_REF =
  /^(controlled|manifest|redaction|storage|ticket):\/\/[a-z0-9][\w:/.-]{0,160}$/i;
const INLINE_REF = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const FORBIDDEN_KEY =
  /raw|prompt|completion|customer|telegram|order|phone|payment|secret|url|body|content/i;
const capabilityKeys = [
  "business_draft",
  "order_read",
  "quote",
  "tutorial",
  "vision"
] as const;
export const dbStatus = {
  breaker_offline: "BREAKER_OFFLINE",
  disabled: "DISABLED",
  manual_offline: "MANUAL_OFFLINE",
  online: "ONLINE"
} as const;
export const dbCapability = {
  business_draft: "BUSINESS_DRAFT",
  order_read: "ORDER_READ",
  quote: "QUOTE",
  tutorial: "TUTORIAL",
  vision: "VISION"
} as const;

export class AiMemberRuntimeError extends Error {
  constructor(
    readonly statusCode: 400 | 404 | 503,
    message: string
  ) {
    super(message);
    this.name = "AiMemberRuntimeError";
  }
}

export type AiMemberRuntimeRepositoryPort = {
  emergencyStop(ctx: AccessContext, memberId: string, input: ActionInput): Promise<Row>;
  getRuntimeState(ctx: AccessContext, memberId: string): Promise<Row>;
  recoverOnline(ctx: AccessContext, memberId: string, input: ActionInput): Promise<Row>;
  toggleCapability(
    ctx: AccessContext,
    memberId: string,
    key: CapabilityKey,
    input: ToggleInput
  ): Promise<Row>;
};

export function audit(
  action: RuntimeAction,
  ctx: AccessContext,
  before: Bundle,
  input: ActionInput,
  auditId: string,
  after: Row,
  at: string,
  beforeState: unknown = snap(before)
) {
  const targetRef =
    action === "capability_toggle"
      ? `controlled://ai-member/${before.member.id}/capability`
      : `controlled://ai-member/${before.member.id}`;
  return {
    action,
    actorUserId: ctx.userId,
    content: {
      after: clean({
        ...after,
        action,
        actorUserId: ctx.userId,
        controlRef: input.controlRef,
        reasonRef: input.reasonRef,
        targetRef
      }),
      before: beforeState
    },
    eventType: `ai_member.${action}`,
    id: auditId,
    module: "ai_member_runtime",
    objectId: String(before.member.id),
    objectType: action === "capability_toggle" ? "ai_capability_toggle" : "ai_member",
    occurredAt: new Date(at),
    orgId: ctx.orgId,
    tenantId: ctx.selectedTenantId,
    traceId: input.traceId ?? `ai-member-runtime:${action}:${before.member.id}`
  };
}

export function state(bundle: Bundle) {
  return clean({
    ...snap(bundle),
    capabilityToggles: bundle.toggles?.map(snapToggle),
    displayName: str(bundle.member.displayName, "displayName"),
    id: str(bundle.member.id, "member id"),
    memberKey: str(bundle.member.memberKey, "memberKey"),
    orgId: str(bundle.member.orgId, "orgId"),
    targetRef: `controlled://ai-member/${bundle.member.id}`,
    tenantId: str(bundle.member.tenantId, "tenantId")
  });
}

function snap(bundle: Bundle) {
  return clean({
    activeVersion: version(bundle.activeVersion),
    activeVersionId: text(bundle.member.activeVersionId),
    breakerReasonRef: text(bundle.member.breakerReasonRef),
    emergencyStoppedAt: date(bundle.member.emergencyStoppedAt),
    memberId: text(bundle.member.id),
    status: status(bundle.member.status)
  });
}

export function version(row?: Row) {
  return row
    ? clean({
        configVersionId: text(row.configVersionId),
        evalGateId: text(row.evalGateId),
        id: text(row.id),
        personaRef: text(row.personaRef),
        status: text(row.status)?.toLowerCase(),
        version: typeof row.version === "number" ? row.version : undefined
      })
    : undefined;
}

export function snapToggle(row?: Row) {
  return row
    ? clean({
        capabilityKey: normalizeCapability(row.capabilityKey),
        configVersionId: text(row.configVersionId),
        enabled: row.enabled === true,
        id: text(row.id),
        updatedByUserId: text(row.updatedByUserId)
      })
    : null;
}

export function metadata(
  current: unknown,
  action: RuntimeAction,
  input: Row,
  auditLogId: string,
  extra: Row = {}
) {
  return {
    ...record(current ?? {}, "metadata"),
    runtimeControl: clean({ action, auditLogId, ...input, ...extra })
  };
}

export function result(action: RuntimeAction, auditId: string, member: Row) {
  return {
    action,
    auditLogId: auditId,
    auditRef: `controlled://audit-log/${auditId}`,
    member,
    targetRef: member.targetRef
  };
}

export function actionInput(body: unknown): ActionInput {
  const input = safeRecord(body, "AI member action request");
  return clean({
    breakerResolvedRef: optionalRef(input.breakerResolvedRef, "breakerResolvedRef"),
    controlRef: optionalRef(input.controlRef, "controlRef"),
    reasonRef: ref(input.reasonRef, "reasonRef"),
    traceId: optionalTrace(input.traceId)
  }) as ActionInput;
}

export function toggleInput(body: unknown): ToggleInput {
  const input = safeRecord(body, "AI capability toggle request");
  return clean({
    configVersionId: optionalUuid(input.configVersionId, "configVersionId"),
    controlRef: optionalRef(input.controlRef, "controlRef"),
    enabled: bool(input.enabled, "enabled"),
    evalGateId: optionalUuid(input.evalGateId, "evalGateId"),
    reasonRef: ref(input.reasonRef, "reasonRef"),
    traceId: optionalTrace(input.traceId)
  }) as ToggleInput;
}

function safeRecord(value: unknown, name: string) {
  const out = record(value, name);
  safe(out);
  return out;
}

function safe(value: unknown, path = "request"): void {
  if (assertSafeScalar(value, path)) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => safe(entry, `${path}[${index}]`));
    return;
  }
  safeObject(value, path);
}

function assertSafeScalar(value: unknown, path: string) {
  if (typeof value !== "string") return false;
  if (/^(https?|data|blob|file):/i.test(value) || INLINE_REF.test(value))
    throw bad(`${path} must be a controlled ref`);
  return true;
}

function safeObject(value: unknown, path: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEY.test(key))
      throw bad(`${path}.${key} is a forbidden raw payload key`);
    safe(child, `${path}.${key}`);
  }
}

export function readRuntimeMode(env: RuntimeEnv): RuntimeMode {
  const mode =
    env.UZMAX_AI_MEMBER_RUNTIME_MODE?.trim() || aiMemberRuntimeModes.disabled;
  if (mode === "prisma_gateway")
    throw new Error("AI member runtime env must use RLS Prisma gateway");
  if (
    mode === aiMemberRuntimeModes.disabled ||
    mode === aiMemberRuntimeModes.rlsPrismaGateway
  )
    return mode;
  throw new Error(`unsupported AI member runtime mode: ${mode}`);
}

export function setConfig(
  prisma: Pick<PrismaPort, "$queryRaw">,
  setting: { key: string; value: string }
) {
  if (setting.key !== "app.org_id" && setting.key !== "app.tenant_id")
    throw new Error("AI member RLS setting is required");
  return prisma.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
}

export function scope(ctx: AccessContext): RlsTenantContext {
  return { orgId: ctx.orgId, tenantId: ctx.selectedTenantId };
}

export function capability(value: unknown): CapabilityKey {
  if (typeof value !== "string" || !capabilityKeys.includes(value as CapabilityKey))
    throw bad("AI capability key is invalid");
  return value as CapabilityKey;
}

function normalizeCapability(value: unknown) {
  const out = String(value).toLowerCase();
  return out in dbCapability ? out : String(value);
}

export function status(value: unknown) {
  const out = String(value).toLowerCase();
  if (out in dbStatus) return out;
  throw bad("AI member status is invalid");
}

export function record(value: unknown, name: string): Row {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw bad(`${name} must be an object`);
  return value as Row;
}

export function array(value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) throw bad("AI member runtime expected row array");
  return value;
}

function str(value: unknown, name: string) {
  const out = typeof value === "string" ? value.trim() : "";
  if (!out) throw bad(`${name} is required`);
  return out;
}

export function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function uuid(value: unknown, name: string) {
  const out = str(value, name);
  if (!UUID.test(out)) throw bad(`${name} must be a UUID`);
  return out;
}

function optionalUuid(value: unknown, name: string) {
  return value === undefined ? undefined : uuid(value, name);
}

function ref(value: unknown, name: string) {
  const out = str(value, name);
  if (!CONTROL_REF.test(out) || INLINE_REF.test(out))
    throw bad(`${name} must be a controlled ref`);
  return out;
}

function optionalRef(value: unknown, name: string) {
  return value === undefined ? undefined : ref(value, name);
}

function optionalTrace(value: unknown) {
  if (value === undefined) return undefined;
  const out = str(value, "traceId");
  if (!/^[a-z0-9:._-]{1,140}$/i.test(out)) throw bad("traceId is invalid");
  return out;
}

function bool(value: unknown, name: string) {
  if (typeof value !== "boolean") throw bad(`${name} must be boolean`);
  return value;
}

function date(value: unknown) {
  return value instanceof Date ? value.toISOString() : text(value);
}

function clean<T extends Row>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}

export function bad(message: string) {
  return new AiMemberRuntimeError(400, message);
}

export function assertPrismaPort(value: PrismaPort) {
  for (const [name, method] of prismaMethods(value)) {
    if (typeof method !== "function")
      throw new Error(`AI member runtime Prisma client requires ${name}`);
  }
}

function prismaMethods(value: PrismaPort): [string, unknown][] {
  return [
    ["$executeRawUnsafe", value.$executeRawUnsafe],
    ["$queryRaw", value.$queryRaw],
    ["$transaction", value.$transaction],
    [
      "aiCapabilityToggle.findFirst",
      delegateMethod(value.aiCapabilityToggle, "findFirst")
    ],
    [
      "aiCapabilityToggle.findMany",
      delegateMethod(value.aiCapabilityToggle, "findMany")
    ],
    ["aiCapabilityToggle.update", delegateMethod(value.aiCapabilityToggle, "update")],
    ["aiMember.findFirst", delegateMethod(value.aiMember, "findFirst")],
    ["aiMember.update", delegateMethod(value.aiMember, "update")],
    ["aiMemberVersion.findFirst", delegateMethod(value.aiMemberVersion, "findFirst")],
    ["auditLog.create", delegateMethod(value.auditLog, "create")],
    ["evalGate.findFirst", delegateMethod(value.evalGate, "findFirst")]
  ];
}

function delegateMethod(delegate: unknown, method: string) {
  return delegate && typeof delegate === "object"
    ? (delegate as Record<string, unknown>)[method]
    : undefined;
}

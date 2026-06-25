import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type { RlsTenantContext } from "../../../packages/db/src/index.ts";
import type { UzmaxPrismaRuntimeEnv } from "../../../packages/db/src/prisma-runtime.ts";

export type Operation<T = unknown> = T | Promise<T>;
export type Row = Record<string, unknown>;
type Delegate = Partial<Record<"create" | "findFirst", (args: Row) => Operation>>;
type TxResult<T extends readonly Operation[]> = Promise<{
  [K in keyof T]: Awaited<T[K]>;
}>;
export type PrismaPort = {
  auditLog: Delegate;
  configVersion: Delegate;
  $executeRawUnsafe(sql: string): Operation;
  $queryRaw(...args: readonly unknown[]): Operation;
  $transaction<T extends readonly Operation[]>(ops: T): TxResult<T>;
};
type RlsWork<T> = {
  map?: (rows: readonly unknown[]) => T;
  ops: (client: PrismaPort) => readonly Operation[];
  scope: RlsTenantContext;
};
export type RlsTxRunner = <T>(input: RlsWork<T>) => Promise<T>;
export type RuntimeEnv = UzmaxPrismaRuntimeEnv & {
  UZMAX_TEMPLATE_COPY_RUNTIME_MODE?: string;
};
export type RuntimeMode = "disabled" | "rls_prisma_gateway";
export type RuntimeRequest = { accessContext?: AccessContext };
type TemplateKind = "ai_member" | "config" | "eval" | "quick_reply";
export type TemplateCopyInput = {
  controlRefs: readonly string[];
  reasonRef: string;
  sourceSnapshotRef: string;
  sourceTemplateRef: string;
  sourceUpdatedRef?: string;
  targetKey: string;
  templateKind: TemplateKind;
  traceId?: string;
};
export type TemplateCopyRuntimeRepositoryPort = {
  copyToTenant(ctx: AccessContext, input: TemplateCopyInput): Promise<Row>;
};

export const TEMPLATE_COPY_RUNTIME_REPOSITORY = Symbol(
  "TEMPLATE_COPY_RUNTIME_REPOSITORY"
);
export const templateCopyRuntimeModes = {
  disabled: "disabled",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;

const KINDS = ["ai_member", "config", "eval", "quick_reply"] as const;
const KEY = /^[a-z0-9][a-z0-9_.:-]{0,120}$/i;
const REF = /^(controlled|manifest|storage):\/\/[a-z0-9][\w:/.-]{0,180}$/i;
const INLINE_REF = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const BAD_KEY =
  /raw|prompt|completion|customer|telegram|order|phone|payment|secret|url|body|content|file/i;

export class TemplateCopyRuntimeError extends Error {
  constructor(
    readonly statusCode: 400 | 404 | 503,
    message: string
  ) {
    super(message);
    this.name = "TemplateCopyRuntimeError";
  }
}

export function readRuntimeMode(env: RuntimeEnv): RuntimeMode {
  const mode = env.UZMAX_TEMPLATE_COPY_RUNTIME_MODE?.trim() || "disabled";
  if (mode === "prisma_gateway")
    throw new Error("template copy runtime env must use RLS Prisma gateway");
  if (mode === "disabled" || mode === "rls_prisma_gateway") return mode;
  throw new Error(`unsupported template copy runtime mode: ${mode}`);
}

export const scope = (ctx: AccessContext): RlsTenantContext => ({
  orgId: ctx.orgId,
  tenantId: ctx.selectedTenantId
});

export const setConfig = (
  prisma: Pick<PrismaPort, "$queryRaw">,
  { key, value }: { key: string; value: string }
) => {
  if (key !== "app.org_id" && key !== "app.tenant_id")
    throw new Error("template copy RLS setting is required");
  return prisma.$queryRaw`select set_config(${key}, ${value}, true)`;
};

export function copyInput(body: unknown): TemplateCopyInput {
  const input = record(body, "template copy request");
  safe(input);
  return {
    controlRefs:
      input.controlRefs === undefined
        ? []
        : array(input.controlRefs, "controlRefs").map((item, index) =>
            ref(item, `controlRefs[${index}]`)
          ),
    reasonRef: ref(input.reasonRef, "reasonRef"),
    sourceSnapshotRef: ref(input.sourceSnapshotRef, "sourceSnapshotRef"),
    sourceTemplateRef: groupTemplateRef(input.sourceTemplateRef),
    sourceUpdatedRef:
      input.sourceUpdatedRef === undefined
        ? undefined
        : ref(input.sourceUpdatedRef, "sourceUpdatedRef"),
    targetKey: targetKey(input.targetKey),
    templateKind: templateKind(input.templateKind),
    traceId: input.traceId === undefined ? undefined : trace(input.traceId)
  };
}

export function copiedPayload(input: TemplateCopyInput, copiedAt: string): Row {
  return clean({
    controlRefs: input.controlRefs,
    copiedAt,
    formalTenantWrite: false,
    sourceSnapshotRef: input.sourceSnapshotRef,
    sourceTemplateRef: input.sourceTemplateRef,
    sourceUpdatedRef: input.sourceUpdatedRef,
    templateAutoOverwrite: false,
    templateKind: input.templateKind
  });
}

export function row(value: unknown, name: string): Row {
  return record(value, name);
}

export const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const bad = (message: string) => new TemplateCopyRuntimeError(400, message);

function safe(value: unknown, path = "request"): void {
  if (Array.isArray(value)) return safeArray(value, path);
  if (value && typeof value === "object") return safeObject(value, path);
  if (typeof value === "string") safeString(value, path);
}

function safeArray(value: readonly unknown[], path: string) {
  for (let index = 0; index < value.length; index += 1)
    safe(value[index], path + "[" + index + "]");
}

function safeObject(value: object, path: string) {
  for (const [key, child] of Object.entries(value)) {
    if (BAD_KEY.test(key)) throw bad(path + "." + key + " is forbidden");
    safe(child, path + "." + key);
  }
}

function safeString(value: string, path: string) {
  if (/^(https?|data|blob|file):/i.test(value) || INLINE_REF.test(value))
    throw bad(path + " must be a controlled ref");
}

function record(value: unknown, name: string): Row {
  const isRecord = Boolean(value && typeof value === "object" && !Array.isArray(value));
  if (isRecord) return value as Row;
  throw bad(name + " must be an object");
}

function array(value: unknown, name: string): readonly unknown[] {
  return Array.isArray(value) ? value : failArray(name);
}

function failArray(name: string): never {
  throw bad(name + " must be an array");
}

function requiredText(value: unknown, name: string) {
  const out = trimText(value);
  if (out) return out;
  throw bad(name + " is required");
}

function trimText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ref(value: unknown, name: string) {
  const out = requiredText(value, name);
  if (isControlledRef(out)) return out;
  throw bad(name + " must be a controlled ref");
}

function isControlledRef(value: string) {
  return REF.test(value) && !INLINE_REF.test(value);
}

function groupTemplateRef(value: unknown) {
  const out = ref(value, "sourceTemplateRef");
  if (!/^controlled:\/\/group-template\//i.test(out))
    throw bad("sourceTemplateRef must be a controlled group template ref");
  return out;
}

function targetKey(value: unknown) {
  const out = requiredText(value, "targetKey");
  if (!KEY.test(out)) throw bad("targetKey is invalid");
  return out;
}

function templateKind(value: unknown): TemplateKind {
  if (typeof value !== "string" || !KINDS.includes(value as TemplateKind))
    throw bad("templateKind is unsupported");
  return value as TemplateKind;
}

function trace(value: unknown) {
  const out = requiredText(value, "traceId");
  if (!/^[a-z0-9:._-]{1,140}$/i.test(out)) throw bad("traceId is invalid");
  return out;
}

function clean<T extends Row>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  ) as T;
}

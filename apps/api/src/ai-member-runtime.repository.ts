import { randomUUID } from "node:crypto";

import type { AccessContext } from "../../../packages/authz/src/index.ts";
import { createRlsTransactionContext } from "../../../packages/db/src/index.ts";
import type { RlsTenantContext } from "../../../packages/db/src/index.ts";
import { createUzmaxPrismaClientFromEnv } from "../../../packages/db/src/prisma-runtime.ts";
import * as c from "./ai-member-runtime.contracts.ts";

type Action = "capability_toggle" | "emergency_stop" | "recover_online";
type Bundle = { activeVersion?: c.Row; member: c.Row };
type Op = (p: c.PrismaPort) => c.Operation;
const CAP = {
  business_draft: "BUSINESS_DRAFT",
  order_read: "ORDER_READ",
  quote: "QUOTE",
  tutorial: "TUTORIAL",
  vision: "VISION"
} as const;
const STATUS = { disabled: "DISABLED", online: "ONLINE" } as const;
const off = async () => {
  throw new c.AiMemberRuntimeError(503, "AI member runtime is not configured");
};

export function createAiMemberRuntimeRepositoryProviderFromEnv(
  options: {
    env?: c.RuntimeEnv;
    mode?: c.RuntimeMode;
    prismaClient?: c.PrismaPort;
    repository?: c.AiMemberRuntimeRepositoryPort;
    rlsTransactionRunner?: c.RlsTxRunner;
  } = {}
): c.AiMemberRuntimeRepositoryPort {
  const mode = options.mode ?? c.readRuntimeMode(options.env ?? process.env);
  if (mode === c.aiMemberRuntimeModes.disabled)
    return (
      options.repository ?? {
        emergencyStop: off,
        getRuntimeState: off,
        recoverOnline: off,
        toggleCapability: off
      }
    );
  if (mode !== c.aiMemberRuntimeModes.rlsPrismaGateway)
    throw new Error(`unsupported AI member runtime mode: ${mode}`);
  const prisma =
    options.prismaClient ??
    (createUzmaxPrismaClientFromEnv(options.env) as unknown as c.PrismaPort);
  return repo(options.rlsTransactionRunner ?? rlsRunner(prisma));
}

function repo(tx: c.RlsTxRunner): c.AiMemberRuntimeRepositoryPort {
  const scoped = (rls: RlsTenantContext, extra: c.Row) => ({
    where: { ...rls, ...extra }
  });
  const one = (rls: RlsTenantContext, op: Op, name: string) =>
    tx<c.Row | undefined>({
      map: ([row]) => (row ? c.record(row, name) : undefined),
      ops: (p) => [op(p)],
      scope: rls
    });
  const bundle = async (rls: RlsTenantContext, memberId: string) => {
    const member = await one(
      rls,
      (p) => p.aiMember.findFirst(scoped(rls, { id: memberId })),
      "ai member row"
    );
    if (!member) throw new c.AiMemberRuntimeError(404, "AI member not found");
    const activeVersionId = c.text(member.activeVersionId);
    return {
      activeVersion: activeVersionId
        ? await one(
            rls,
            (p) => p.aiMemberVersion.findFirst(scoped(rls, { id: activeVersionId })),
            "ai member version row"
          )
        : undefined,
      member
    };
  };
  const gate = async (rls: RlsTenantContext, id: string) => {
    const row = await one(
      rls,
      (p) => p.evalGate.findFirst(scoped(rls, { id })),
      "eval gate row"
    );
    if (!row || String(row.status).toUpperCase() !== "PASSED")
      throw c.bad("AI member runtime requires passed eval gate evidence");
  };
  const writeMember = (
    rls: RlsTenantContext,
    memberId: string,
    data: c.Row,
    auditRow: c.Row
  ) =>
    tx<c.Row>({
      map: ([row]) => c.record(row, "ai member row"),
      ops: (p) => [
        p.aiMember.update({ data, where: { id: memberId } }),
        p.auditLog.create({ data: auditRow })
      ],
      scope: rls
    });
  const memberAction = async (
    ctx: AccessContext,
    memberId: string,
    input: c.ActionInput,
    action: Exclude<Action, "capability_toggle">
  ) => {
    const rls = c.scope(ctx);
    const before = await bundle(rls, memberId);
    if (action === "recover_online") {
      if (!["breaker_offline", "disabled"].includes(c.status(before.member.status)))
        throw c.bad("AI member is not in recoverable emergency state");
      if (c.text(before.member.breakerReasonRef) && !input.breakerResolvedRef)
        throw c.bad("recovery requires controlled breakerResolvedRef");
      const gateId = c.text(before.activeVersion?.evalGateId);
      if (!before.activeVersion || !gateId)
        throw c.bad("recovery requires active AI member version with passed eval gate");
      await gate(rls, gateId);
    }
    const auditId = randomUUID();
    const activeVersion = version(before.activeVersion);
    const now = new Date().toISOString();
    const data =
      action === "emergency_stop"
        ? {
            breakerReasonRef: input.reasonRef,
            emergencyStoppedAt: new Date(now),
            metadata: meta(before.member.metadata, action, input, auditId),
            status: STATUS.disabled
          }
        : {
            breakerReasonRef: null,
            emergencyStoppedAt: null,
            metadata: meta(before.member.metadata, action, input, auditId, {
              activeVersion
            }),
            status: STATUS.online
          };
    const member = await writeMember(
      rls,
      memberId,
      data,
      audit(
        action,
        ctx,
        memberId,
        input,
        auditId,
        action === "recover_online" ? { ...data, activeVersion } : data,
        state(before)
      )
    );
    return result(action, auditId, state({ ...before, member }));
  };
  return {
    getRuntimeState: async (ctx, id) => state(await bundle(c.scope(ctx), id)),
    emergencyStop: (ctx, id, input) => memberAction(ctx, id, input, "emergency_stop"),
    recoverOnline: (ctx, id, input) => memberAction(ctx, id, input, "recover_online"),
    toggleCapability: async (ctx, memberId, key, input) => {
      const rls = c.scope(ctx);
      const toggle = await one(
        rls,
        (p) =>
          p.aiCapabilityToggle.findFirst(
            scoped(rls, { aiMemberId: memberId, capabilityKey: CAP[key] })
          ),
        "ai capability toggle row"
      );
      if (!toggle)
        throw new c.AiMemberRuntimeError(404, "AI capability toggle not found");
      if (input.enabled) {
        if (!input.evalGateId)
          throw c.bad(
            "enabling capability requires evalGateId with passed eval gate evidence"
          );
        await gate(rls, input.evalGateId);
      }
      const auditId = randomUUID();
      const before = toggleState(toggle);
      const data = {
        configVersionId: input.configVersionId ?? null,
        enabled: input.enabled,
        metadata: meta(toggle.metadata, "capability_toggle", input, auditId),
        updatedByUserId: ctx.userId
      };
      const after = {
        ...toggleState({ ...toggle, ...data }),
        targetRef: `${target(memberId)}/capability/${key}`
      };
      const changed = await tx<c.Row>({
        map: ([row]) => c.record(row, "ai capability toggle row"),
        ops: (p) => [
          p.aiCapabilityToggle.update({ data, where: { id: String(toggle.id) } }),
          p.auditLog.create({
            data: audit(
              "capability_toggle",
              ctx,
              memberId,
              input,
              auditId,
              after,
              before
            )
          })
        ],
        scope: rls
      });
      return {
        ...result("capability_toggle", auditId, { targetRef: target(memberId) }),
        capability: toggleState(changed)
      };
    }
  };
}

function rlsRunner(prisma: c.PrismaPort): c.RlsTxRunner {
  return async ({ map, ops, scope }) => {
    const context = createRlsTransactionContext(scope);
    const rows = await prisma.$transaction([
      prisma.$executeRawUnsafe(context.roleSql),
      ...context.settings.map((setting) => c.setConfig(prisma, setting)),
      ...ops(prisma)
    ]);
    const businessRows = rows.slice(1 + context.settings.length);
    return map ? map(businessRows) : (businessRows as never);
  };
}

function state({ activeVersion, member }: Bundle) {
  return clean({
    activeVersion: version(activeVersion),
    breakerReasonRef: c.text(member.breakerReasonRef),
    emergencyStoppedAt: date(member.emergencyStoppedAt),
    id: required(member.id, "member id"),
    status: c.status(member.status),
    targetRef: target(member.id)
  });
}
const version = (row?: c.Row) =>
  row
    ? clean({
        configVersionId: c.text(row.configVersionId),
        evalGateId: c.text(row.evalGateId),
        id: c.text(row.id),
        personaRef: c.text(row.personaRef),
        status: c.text(row.status)?.toLowerCase()
      })
    : undefined;
const toggleState = (row: c.Row) =>
  clean({
    capabilityKey: String(row.capabilityKey).toLowerCase(),
    configVersionId: c.text(row.configVersionId),
    enabled: row.enabled === true,
    id: c.text(row.id),
    updatedByUserId: c.text(row.updatedByUserId)
  });
const meta = (
  current: unknown,
  action: Action,
  input: c.Row,
  auditLogId: string,
  extra: c.Row = {}
) => ({
  ...c.record(current ?? {}, "metadata"),
  runtimeControl: clean({ action, auditLogId, ...input, ...extra })
});
const result = (action: Action, auditLogId: string, member: c.Row) => ({
  action,
  auditLogId,
  auditRef: `controlled://audit-log/${auditLogId}`,
  member,
  targetRef: member.targetRef
});
function audit(
  action: Action,
  ctx: AccessContext,
  memberId: string,
  input: c.ActionInput,
  id: string,
  after: c.Row,
  before: unknown
) {
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
        targetRef: target(memberId, action)
      }),
      before
    },
    eventType: `ai_member.${action}`,
    id,
    module: "ai_member_runtime",
    objectId: memberId,
    objectType: action === "capability_toggle" ? "ai_capability_toggle" : "ai_member",
    occurredAt: new Date(),
    orgId: ctx.orgId,
    tenantId: ctx.selectedTenantId,
    traceId: input.traceId ?? `ai-member-runtime:${action}:${memberId}`
  };
}
const target = (memberId: unknown, action?: Action) =>
  `controlled://ai-member/${memberId}${action === "capability_toggle" ? "/capability" : ""}`;
const clean = <T extends c.Row>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  ) as T;
const date = (value: unknown) =>
  value instanceof Date ? value.toISOString() : c.text(value);
function required(value: unknown, name: string) {
  const out = c.text(value);
  if (!out) throw c.bad(`${name} is required`);
  return out;
}

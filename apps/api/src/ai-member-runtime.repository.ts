import { randomUUID } from "node:crypto";

import type { AccessContext } from "../../../packages/authz/src/index.ts";
import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";
import { createUzmaxPrismaClientFromEnv } from "../../../packages/db/src/prisma-runtime.ts";
import {
  AiMemberRuntimeError,
  aiMemberRuntimeModes,
  array,
  assertPrismaPort,
  audit,
  bad,
  dbCapability,
  dbStatus,
  metadata,
  readRuntimeMode,
  record,
  result,
  scope,
  setConfig,
  snapToggle,
  state,
  status,
  text,
  version,
  type ActionInput,
  type AiMemberRuntimeRepositoryPort,
  type Bundle,
  type CapabilityKey,
  type Operation,
  type PrismaPort,
  type RlsTxRunner,
  type Row,
  type RuntimeEnv,
  type RuntimeMode,
  type ToggleInput
} from "./ai-member-runtime.contracts.ts";

class DisabledAiMemberRuntimeRepository implements AiMemberRuntimeRepositoryPort {
  async emergencyStop(): Promise<never> {
    throw new AiMemberRuntimeError(503, "AI member runtime is not configured");
  }
  async getRuntimeState(): Promise<never> {
    throw new AiMemberRuntimeError(503, "AI member runtime is not configured");
  }
  async recoverOnline(): Promise<never> {
    throw new AiMemberRuntimeError(503, "AI member runtime is not configured");
  }
  async toggleCapability(): Promise<never> {
    throw new AiMemberRuntimeError(503, "AI member runtime is not configured");
  }
}

export function createAiMemberRuntimeRepositoryProviderFromEnv(
  options: {
    env?: RuntimeEnv;
    mode?: RuntimeMode;
    prismaClient?: PrismaPort;
    repository?: AiMemberRuntimeRepositoryPort;
    rlsTransactionRunner?: RlsTxRunner;
  } = {}
): AiMemberRuntimeRepositoryPort {
  const mode = options.mode ?? readRuntimeMode(options.env ?? process.env);
  if (mode === aiMemberRuntimeModes.disabled)
    return options.repository ?? new DisabledAiMemberRuntimeRepository();
  if (mode !== aiMemberRuntimeModes.rlsPrismaGateway)
    throw new Error(`unsupported AI member runtime mode: ${mode}`);
  const prisma =
    options.prismaClient ??
    (createUzmaxPrismaClientFromEnv(options.env) as unknown as PrismaPort);
  return new RlsPrismaAiMemberRuntimeRepository(
    options.rlsTransactionRunner ?? createAiMemberRlsTransactionRunner(prisma)
  );
}

class RlsPrismaAiMemberRuntimeRepository implements AiMemberRuntimeRepositoryPort {
  constructor(private readonly tx: RlsTxRunner) {}

  async getRuntimeState(ctx: AccessContext, memberId: string) {
    return state(await this.bundle(scope(ctx), memberId));
  }

  async emergencyStop(ctx: AccessContext, memberId: string, input: ActionInput) {
    const rls = scope(ctx),
      before = await this.bundle(rls, memberId),
      auditId = randomUUID(),
      now = new Date().toISOString();
    const after = {
      breakerReasonRef: input.reasonRef,
      emergencyStoppedAt: new Date(now),
      metadata: metadata(before.member.metadata, "emergency_stop", input, auditId),
      status: dbStatus.disabled
    };
    const member = await this.memberAuditTx(
      rls,
      memberId,
      after,
      audit("emergency_stop", ctx, before, input, auditId, after, now)
    );
    return result("emergency_stop", auditId, state({ ...before, member }));
  }

  async recoverOnline(ctx: AccessContext, memberId: string, input: ActionInput) {
    const rls = scope(ctx),
      before = await this.bundle(rls, memberId);
    if (!["breaker_offline", "disabled"].includes(status(before.member.status)))
      throw bad("AI member is not in recoverable emergency state");
    if (text(before.member.breakerReasonRef) && !input.breakerResolvedRef)
      throw bad("recovery requires controlled breakerResolvedRef");
    await this.assertActiveVersionGate(rls, before.activeVersion);
    const auditId = randomUUID(),
      activeVersion = version(before.activeVersion);
    const after = {
      breakerReasonRef: null,
      emergencyStoppedAt: null,
      metadata: metadata(before.member.metadata, "recover_online", input, auditId, {
        activeVersion
      }),
      status: dbStatus.online
    };
    const member = await this.memberAuditTx(
      rls,
      memberId,
      after,
      audit(
        "recover_online",
        ctx,
        before,
        input,
        auditId,
        { ...after, activeVersion },
        new Date().toISOString()
      )
    );
    return result("recover_online", auditId, state({ ...before, member }));
  }

  async toggleCapability(
    ctx: AccessContext,
    memberId: string,
    key: CapabilityKey,
    input: ToggleInput
  ) {
    const rls = scope(ctx),
      before = await this.bundle(rls, memberId);
    const toggle = await this.one(
      rls,
      (p) =>
        p.aiCapabilityToggle.findFirst({
          where: { ...rls, aiMemberId: memberId, capabilityKey: dbCapability[key] }
        }),
      "ai capability toggle row"
    );
    if (!toggle) throw new AiMemberRuntimeError(404, "AI capability toggle not found");
    if (input.enabled) await this.assertToggleGate(rls, input);
    const auditId = randomUUID(),
      beforeToggle = snapToggle(toggle);
    const after = {
      configVersionId: input.configVersionId ?? null,
      enabled: input.enabled,
      metadata: metadata(toggle.metadata, "capability_toggle", input, auditId),
      updatedByUserId: ctx.userId
    };
    const afterToggle = {
      ...beforeToggle,
      ...snapToggle({ ...toggle, ...after }),
      targetRef: `controlled://ai-member/${memberId}/capability/${key}`
    };
    const changed = await this.tx<Row>({
      map: ([row]) => record(row, "ai capability toggle row"),
      ops: (p) => [
        p.aiCapabilityToggle.update({
          data: after,
          where: { id: String(toggle.id) }
        }),
        p.auditLog.create({
          data: audit(
            "capability_toggle",
            ctx,
            before,
            input,
            auditId,
            afterToggle,
            new Date().toISOString(),
            beforeToggle
          )
        })
      ],
      scope: rls
    });
    return {
      ...result("capability_toggle", auditId, state(before)),
      capability: snapToggle(changed)
    };
  }

  private async bundle(rls: RlsTenantContext, memberId: string): Promise<Bundle> {
    const member = await this.one(
      rls,
      (p) => p.aiMember.findFirst({ where: { ...rls, id: memberId } }),
      "ai member row"
    );
    if (!member) throw new AiMemberRuntimeError(404, "AI member not found");
    const activeVersionId = text(member.activeVersionId);
    const activeVersion = activeVersionId
      ? await this.one(
          rls,
          (p) =>
            p.aiMemberVersion.findFirst({ where: { ...rls, id: activeVersionId } }),
          "ai member version row"
        )
      : undefined;
    const toggles = await this.many(
      rls,
      (p) =>
        p.aiCapabilityToggle.findMany({ where: { ...rls, aiMemberId: member.id } }),
      "toggle row"
    );
    return { activeVersion, member, toggles };
  }

  private one(rls: RlsTenantContext, op: (p: PrismaPort) => Operation, name: string) {
    return this.tx<Row | undefined>({
      map: ([row]) => (row ? record(row, name) : undefined),
      ops: (p) => [op(p)],
      scope: rls
    });
  }

  private many(rls: RlsTenantContext, op: (p: PrismaPort) => Operation, name: string) {
    return this.tx<Row[]>({
      map: ([rows]) => array(rows).map((row) => record(row, name)),
      ops: (p) => [op(p)],
      scope: rls
    });
  }

  private memberAuditTx(
    rls: RlsTenantContext,
    memberId: string,
    data: Row,
    auditRow: Row
  ) {
    return this.tx<Row>({
      map: ([row]) => record(row, "ai member row"),
      ops: (p) => [
        p.aiMember.update({ data, where: { id: memberId } }),
        p.auditLog.create({ data: auditRow })
      ],
      scope: rls
    });
  }

  private async assertActiveVersionGate(rls: RlsTenantContext, active?: Row) {
    const gateId = text(active?.evalGateId);
    if (!active || !gateId)
      throw bad("recovery requires active AI member version with passed eval gate");
    await this.assertPassedGate(rls, gateId);
  }

  private async assertToggleGate(rls: RlsTenantContext, input: ToggleInput) {
    if (!input.configVersionId && !input.evalGateId) return;
    if (!input.evalGateId)
      throw bad("enabling capability with configVersionId requires evalGateId");
    await this.assertPassedGate(rls, input.evalGateId);
  }

  private async assertPassedGate(rls: RlsTenantContext, gateId: string) {
    const gate = await this.one(
      rls,
      (p) => p.evalGate.findFirst({ where: { ...rls, id: gateId } }),
      "eval gate row"
    );
    if (!gate || String(gate.status).toUpperCase() !== "PASSED")
      throw bad("AI member runtime requires passed eval gate evidence");
  }
}

function createAiMemberRlsTransactionRunner(prisma: PrismaPort): RlsTxRunner {
  assertPrismaPort(prisma);
  return async (input) => {
    const context = createRlsTransactionContext(input.scope);
    const rows = await prisma.$transaction([
      prisma.$executeRawUnsafe(context.roleSql),
      ...context.settings.map((setting) => setConfig(prisma, setting)),
      ...input.ops(prisma)
    ]);
    const businessRows = rows.slice(1 + context.settings.length);
    return input.map ? input.map(businessRows) : (businessRows as never);
  };
}

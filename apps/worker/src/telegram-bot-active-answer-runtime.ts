import { answerKbJourneyStage } from "../../../packages/capabilities/kb/src/index.ts";
import { createRlsTransactionContext } from "../../../packages/db/src/index.ts";
import { guardRedlineOutput } from "../../../packages/engine/src/index.ts";
import {
  createLlmRouteConfig,
  createMockLlmProvider,
  invokeLlmRoute,
  llmGatewayTasks
} from "../../../packages/llm-gateway/src/index.ts";
import {
  createTelegramBotAnswerRuntime,
  type TelegramBotAnswerRuntime,
  type TelegramBotAnswerRuntimeRequest,
  type TelegramBotAnswerRuntimeResult
} from "./telegram-bot-answer-runtime.ts";

type Row = Record<string, unknown>;
type Operation = Promise<unknown>;
type Scope = { orgId: string; tenantId: string };
type Delegate = {
  findFirst(input: Row): Operation;
  findMany(input: Row): Operation;
};
type RuntimeInput = {
  aiMemberKey: string;
  kbEntryKey: string;
  locale?: string;
  prisma: TelegramBotAnswerRuntimePrismaPort;
  requiredCapabilityKey: string;
};
type HandoffResolution = { reasonCode: string; status: "handoff" };
type Resolution<T extends object> = (T & { status: "ready" }) | HandoffResolution;
type RuntimeResolution = Resolution<{ answerRuntime: TelegramBotAnswerRuntime }>;
type PersonaResolution = Resolution<{ gateId: string; member: Row; version: Row }>;
type KbResolution = Resolution<{ journey: ReturnType<typeof journeyFromRows> }>;
export type TelegramBotAnswerRuntimePrismaPort = {
  $executeRawUnsafe(sql: string): Operation;
  $queryRaw(strings: TemplateStringsArray, ...values: unknown[]): Operation;
  $transaction(operations: Operation[]): Promise<unknown[]>;
  aiCapabilityToggle: Delegate;
  aiMember: Delegate;
  aiMemberVersion: Delegate;
  evalGate: Delegate;
  kbRecord: Delegate;
  kbStage: Delegate;
};

export type DbBackedTelegramBotAnswerRuntimeOptions = {
  aiMemberKey: string;
  kbEntryKey: string;
  locale?: string;
  prisma: TelegramBotAnswerRuntimePrismaPort;
  requiredCapabilityKey?: string;
};

const HASH = `sha256:${"0".repeat(64)}`;

export function createDbBackedTelegramBotAnswerRuntime(
  options: DbBackedTelegramBotAnswerRuntimeOptions
): TelegramBotAnswerRuntime {
  const aiMemberKey = controlledText(options.aiMemberKey, "aiMemberKey");
  const kbEntryKey = controlledText(options.kbEntryKey, "kbEntryKey");
  const requiredCapabilityKey = options.requiredCapabilityKey ?? "TUTORIAL";

  return {
    async answer(request) {
      try {
        const runtime = await resolveRuntime({
          ...options,
          aiMemberKey,
          kbEntryKey,
          requiredCapabilityKey,
          request
        });
        if (runtime.status !== "ready") return handoff(runtime.reasonCode);
        return runtime.answerRuntime.answer(request);
      } catch {
        return handoff("active_answer_runtime_unavailable");
      }
    }
  };
}

async function resolveRuntime(
  input: RuntimeInput & { request: TelegramBotAnswerRuntimeRequest }
): Promise<RuntimeResolution> {
  const scope = scopeFromRequest(input.request);
  const persona = await resolvePersona(input, scope);
  if (persona.status !== "ready") return miss(persona.reasonCode);

  const kb = await resolveKbJourney(input, scope);
  if (kb.status !== "ready") return miss(kb.reasonCode);

  return readyRuntime(input, persona, kb.journey);
}

async function resolvePersona(
  input: Pick<RuntimeInput, "aiMemberKey" | "prisma" | "requiredCapabilityKey">,
  scope: Scope
): Promise<PersonaResolution> {
  const member = await one(input.prisma, scope, (p) =>
    p.aiMember.findFirst({
      where: { ...scope, memberKey: input.aiMemberKey, status: "ONLINE" }
    })
  );
  const activeVersionId = text(member?.activeVersionId);
  if (!member || !activeVersionId) return miss("missing_persona");

  const [version, capability] = await tx(input.prisma, scope, (p) => [
    p.aiMemberVersion.findFirst({
      where: { ...scope, aiMemberId: member.id, id: activeVersionId, status: "ACTIVE" }
    }),
    p.aiCapabilityToggle.findFirst({
      where: {
        ...scope,
        aiMemberId: member.id,
        capabilityKey: input.requiredCapabilityKey,
        enabled: true
      }
    })
  ]);
  if (!recordLike(version)) return miss("missing_persona");
  if (!recordLike(capability)) return miss("capability_disabled");

  const gateId = text(version.evalGateId);
  if (!gateId) return miss("persona_eval_gate_not_passed");
  const gate = await one(input.prisma, scope, (p) =>
    p.evalGate.findFirst({ where: { ...scope, id: gateId } })
  );
  if (String(gate?.status ?? "").toUpperCase() !== "PASSED") {
    return miss("persona_eval_gate_not_passed");
  }
  return { gateId, member, status: "ready", version };
}

async function resolveKbJourney(
  input: Pick<RuntimeInput, "kbEntryKey" | "locale" | "prisma">,
  scope: Scope
): Promise<KbResolution> {
  const kbEntry = await one(input.prisma, scope, (p) =>
    p.kbRecord.findFirst({
      orderBy: { version: "desc" },
      where: { ...scope, entryKey: input.kbEntryKey, status: "ACTIVE" }
    })
  );
  if (!kbEntry) return miss("missing_kb");

  const kbStages = await many(input.prisma, scope, (p) =>
    p.kbStage.findMany({
      orderBy: { sequence: "asc" },
      where: { ...scope, kbEntryId: kbEntry.id, status: "ACTIVE" }
    })
  );
  const journey = journeyFromRows(kbEntry, kbStages, input.locale);
  if (!journey.stages.length) return miss("missing_kb_stage_card");
  return { journey, status: "ready" };
}

function readyRuntime(
  input: { locale?: string },
  persona: { gateId: string; member: Row; version: Row },
  journey: ReturnType<typeof journeyFromRows>
): RuntimeResolution {
  return {
    answerRuntime: createTelegramBotAnswerRuntime({
      answerKbJourneyStage: (input) =>
        answerKbJourneyStage(input as Parameters<typeof answerKbJourneyStage>[0]),
      guardRedlineOutput: (input) =>
        guardRedlineOutput(input as Parameters<typeof guardRedlineOutput>[0]),
      invokeLlmRoute: (input) =>
        invokeLlmRoute(input as Parameters<typeof invokeLlmRoute>[0]),
      journey,
      llmProviders: [
        createMockLlmProvider({
          modelId: "mock-kb-answer",
          providerId: "provider_mock",
          result: {
            completionHash: HASH,
            costMicros: 0,
            inputTokenCount: 1,
            latencyMs: 1,
            outputTokenCount: 1,
            promptHash: HASH,
            status: "succeeded"
          }
        })
      ],
      llmRoute: createLlmRouteConfig({
        costMicrosBudget: 1,
        evalGate: {
          gateRef: `controlled://eval-gate/${persona.gateId}`,
          lastStatus: "passed"
        },
        fallbackProviderRefs: [],
        inputTokenBudget: 256,
        outputTokenBudget: 256,
        primaryProviderRef: "provider_mock",
        providerRefs: ["provider_mock"],
        routeRef: "controlled://llm-route/mock-kb-answer",
        routeVersion: "mock-fail-closed",
        task: llmGatewayTasks.kbAnswer,
        timeoutMs: 50,
        totalTokenBudget: 512
      }),
      locale: input.locale,
      persona: {
        aiMemberRef: `controlled://ai-member/${persona.member.id}`,
        evalGateStatus: "passed",
        personaVersionRef:
          text(persona.version.personaRef) ??
          `controlled://ai-member-version/${persona.version.id}`
      }
    }),
    status: "ready"
  };
}

function journeyFromRows(kbEntry: Row, stages: Row[], locale?: string) {
  const metadata = record(kbEntry.metadata);
  return {
    defaultLocale: text(metadata.defaultLocale) ?? locale ?? "en",
    journeyKey: text(metadata.journeyKey) ?? text(kbEntry.entryKey) ?? "active_kb",
    journeyRef: `controlled://kb/entry/${text(kbEntry.id)}`,
    stages: stages.flatMap((stage) => stageFromRow(stage)),
    title: text(kbEntry.title) ?? "Active KB"
  };
}

function stageFromRow(stage: Row) {
  const materialRefs = record(stage.materialRefs);
  const card = recordLike(materialRefs.card) ? record(materialRefs.card) : materialRefs;
  const answer = text(card.answer);
  const steps = stringList(card.steps, 5);
  if (!answer || steps.length === 0) return [];
  return [
    {
      answer,
      localizedAnswers: stringMap(card.localizedAnswers),
      localizedSteps: stringListMap(card.localizedSteps),
      localizedTitles: stringMap(card.localizedTitles),
      localizedTriggers: stringListMap(card.localizedTriggers),
      materialRefs: materialList(card.materialRefs),
      nextStageKey: text(card.nextStageKey),
      sequence: integer(stage.sequence, 1),
      stageKey: text(stage.stageKey) ?? text(stage.id) ?? "stage",
      stageRef: `controlled://kb/stage/${text(stage.id)}`,
      status: "active",
      steps,
      title: text(stage.title) ?? text(card.title) ?? "Active stage",
      triggers: stringList(card.triggers, 12)
    }
  ];
}

async function tx(
  prisma: TelegramBotAnswerRuntimePrismaPort,
  scope: { orgId: string; tenantId: string },
  ops: (p: TelegramBotAnswerRuntimePrismaPort) => Operation[]
) {
  const context = createRlsTransactionContext(scope);
  const rows = await prisma.$transaction([
    prisma.$executeRawUnsafe(context.roleSql),
    ...context.settings.map(
      (setting) =>
        prisma.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`
    ),
    ...ops(prisma)
  ]);
  return rows.slice(1 + context.settings.length);
}

async function one(
  prisma: TelegramBotAnswerRuntimePrismaPort,
  scope: { orgId: string; tenantId: string },
  op: (p: TelegramBotAnswerRuntimePrismaPort) => Operation
) {
  const [row] = await tx(prisma, scope, (p) => [op(p)]);
  if (row === null || row === undefined) return undefined;
  if (!recordLike(row)) throw new Error("RLS query row must be an object");
  return row;
}

async function many(
  prisma: TelegramBotAnswerRuntimePrismaPort,
  scope: { orgId: string; tenantId: string },
  op: (p: TelegramBotAnswerRuntimePrismaPort) => Operation
) {
  const [rows] = await tx(prisma, scope, (p) => [op(p)]);
  return Array.isArray(rows) ? rows.filter(recordLike) : [];
}

function scopeFromRequest(request: TelegramBotAnswerRuntimeRequest) {
  return {
    orgId: uuidText(request.orgId, "orgId"),
    tenantId: uuidText(request.tenantId, "tenantId")
  };
}

function handoff(reasonCode: string): TelegramBotAnswerRuntimeResult {
  return { reasonCode, status: "handoff_required", suppressOutbound: true };
}

function miss(reasonCode: string): { reasonCode: string; status: "handoff" } {
  return { reasonCode, status: "handoff" };
}

function recordLike(value: unknown): value is Row {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function record(value: unknown): Row {
  return recordLike(value) ? value : {};
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 4096)
    : undefined;
}

function controlledText(value: unknown, label: string) {
  const out = text(value);
  if (!out || !/^[a-z0-9][a-z0-9:._-]{0,120}$/i.test(out)) {
    throw new Error(`${label} must be controlled text`);
  }
  return out;
}

function uuidText(value: unknown, label: string) {
  const out = text(value);
  if (
    !out ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      out
    )
  ) {
    throw new Error(`${label} must be a UUID`);
  }
  return out;
}

function integer(value: unknown, fallback: number) {
  return Number.isInteger(value) && (value as number) > 0
    ? (value as number)
    : fallback;
}

function stringList(value: unknown, max: number): string[] {
  return Array.isArray(value)
    ? value.flatMap((item) => text(item) ?? []).slice(0, max)
    : [];
}

function stringMap(value: unknown): Record<string, string> | undefined {
  const entries = Object.entries(record(value)).flatMap(([key, item]) => {
    const out = text(item);
    return out ? [[key, out]] : [];
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function stringListMap(value: unknown): Record<string, string[]> | undefined {
  const entries = Object.entries(record(value)).flatMap(([key, item]) => {
    const out = stringList(item, 12);
    return out.length ? [[key, out]] : [];
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function materialList(value: unknown): { kind: string; ref: string; title?: string }[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const row = record(item);
        const kind = text(row.kind);
        const ref = text(row.ref);
        if (!kind || !ref) return [];
        return [{ kind, ref, title: text(row.title) }];
      })
    : [];
}

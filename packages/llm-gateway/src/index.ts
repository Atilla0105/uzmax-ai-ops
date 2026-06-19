export const packageName = "@uzmax/llm-gateway";

export const llmGatewayTasks = {
  distillDaily: "distill_daily",
  draftReply: "draft_reply",
  evalJudge: "eval_judge",
  intentClassify: "intent_classify",
  journeyImport: "journey_import",
  kbAnswer: "kb_answer",
  profileUpdate: "profile_update",
  speechPostprocess: "speech_postprocess",
  summarize: "summarize",
  visionDiag: "vision_diag"
} as const;

export const llmGatewayCallStatuses = {
  failed: "failed",
  fallback: "fallback",
  succeeded: "succeeded"
} as const;

export const llmGatewayEvalGateStatuses = {
  blocked: "blocked",
  failed: "failed",
  passed: "passed",
  pending: "pending"
} as const;

type ValueOf<T> = T[keyof T];
export type LlmGatewayTask = ValueOf<typeof llmGatewayTasks>;
export type LlmGatewayCallStatus = ValueOf<typeof llmGatewayCallStatuses>;
export type LlmGatewayEvalGateStatus = ValueOf<typeof llmGatewayEvalGateStatuses>;

export type RouteConfigInput = {
  costMicrosBudget: number;
  evalGate: { gateRef: string; lastStatus: string };
  fallbackProviderRefs: string[];
  inputTokenBudget: number;
  outputTokenBudget: number;
  primaryProviderRef: string;
  providerRefs: string[];
  routeRef: string;
  routeVersion: string;
  task: string;
  timeoutMs: number;
  totalTokenBudget: number;
};

export type LlmRouteConfig = Omit<RouteConfigInput, "evalGate" | "task"> & {
  evalGate: { gateRef: string; lastStatus: LlmGatewayEvalGateStatus };
  task: LlmGatewayTask;
};

export type MockProviderResult = {
  completionHash?: string;
  costMicros?: number;
  inputTokenCount?: number;
  latencyMs?: number;
  outputTokenCount?: number;
  promptHash?: string;
  status: "failed" | "succeeded" | "timeout";
};

export type LlmProviderPort = {
  invoke: (request: {
    input: Record<string, unknown>;
    route: LlmRouteConfig;
    traceId: string;
  }) => Promise<MockProviderResult>;
  modelId: string;
  providerId: string;
};

export type AccountingDraft = {
  completionHash?: string;
  costMicros: number;
  fallbackSummary?: Record<string, unknown>;
  inputTokenCount: number;
  latencyMs: number;
  modelId: string;
  outputTokenCount: number;
  promptHash?: string;
  providerId: string;
  redactionMetadata?: Record<string, unknown>;
  routeRef: string;
  routeVersion: string;
  status: LlmGatewayCallStatus;
  task: LlmGatewayTask;
  totalTokenCount: number;
  traceId: string;
  truncationMetadata?: Record<string, unknown>;
};

export type LlmInvocationResult = {
  accountingDraft: AccountingDraft;
  attemptAccountingDrafts: AccountingDraft[];
  attempts: { providerId: string; reason?: string; status: LlmGatewayCallStatus }[];
  providerId: string;
  status: LlmGatewayCallStatus;
};

export const taskSafetyProfiles: Record<
  LlmGatewayTask,
  {
    customerVisible: boolean;
    disallowInternalConfigFields: boolean;
    requiresRedactionMetadata: boolean;
  }
> = {
  distill_daily: safetyProfile(false),
  draft_reply: safetyProfile(true),
  eval_judge: safetyProfile(false),
  intent_classify: safetyProfile(false),
  journey_import: safetyProfile(false),
  kb_answer: safetyProfile(true),
  profile_update: safetyProfile(false),
  speech_postprocess: safetyProfile(false),
  summarize: safetyProfile(false),
  vision_diag: safetyProfile(false)
};

export function createLlmRouteConfig(input: RouteConfigInput): LlmRouteConfig {
  const providerRefs = nonEmptyStrings(input.providerRefs, "providerRefs");
  if (!providerRefs.includes(input.primaryProviderRef)) {
    throw new Error("primaryProviderRef must reference a known provider");
  }
  const fallbackProviderRefs = nonEmptyStrings(
    input.fallbackProviderRefs,
    "fallbackProviderRefs",
    true
  );
  for (const providerRef of fallbackProviderRefs) {
    if (!providerRefs.includes(providerRef)) {
      throw new Error("fallbackProviderRefs must reference known providers");
    }
  }

  const route = {
    ...input,
    costMicrosBudget: positiveInt(input.costMicrosBudget, "costMicrosBudget"),
    evalGate: {
      gateRef: nonEmptyString(input.evalGate?.gateRef, "eval gate ref"),
      lastStatus: enumValue(
        input.evalGate?.lastStatus,
        llmGatewayEvalGateStatuses,
        "eval gate status"
      )
    },
    fallbackProviderRefs,
    inputTokenBudget: positiveInt(input.inputTokenBudget, "inputTokenBudget"),
    outputTokenBudget: positiveInt(input.outputTokenBudget, "outputTokenBudget"),
    providerRefs,
    routeRef: nonEmptyString(input.routeRef, "routeRef"),
    routeVersion: nonEmptyString(input.routeVersion, "routeVersion"),
    task: enumValue(input.task, llmGatewayTasks, "task"),
    timeoutMs: positiveInt(input.timeoutMs, "timeoutMs"),
    totalTokenBudget: positiveInt(input.totalTokenBudget, "totalTokenBudget")
  };
  if (
    route.totalTokenBudget < Math.max(route.inputTokenBudget, route.outputTokenBudget)
  ) {
    throw new Error(
      "totalTokenBudget must be at least inputTokenBudget and outputTokenBudget"
    );
  }
  return route;
}

export function createMockLlmProvider(input: {
  modelId: string;
  providerId: string;
  result: MockProviderResult;
}): LlmProviderPort {
  return {
    async invoke() {
      return { ...input.result };
    },
    modelId: nonEmptyString(input.modelId, "modelId"),
    providerId: nonEmptyString(input.providerId, "providerId")
  };
}

export async function invokeLlmRoute(input: {
  input: Record<string, unknown>;
  providers: LlmProviderPort[];
  route: LlmRouteConfig;
  traceId: string;
}): Promise<LlmInvocationResult> {
  validateInvocationBoundary(input.route.task, input.input);
  const providers = providerMap(input.providers);
  const providerOrder = [
    input.route.primaryProviderRef,
    ...input.route.fallbackProviderRefs
  ];
  const attempts: LlmInvocationResult["attempts"] = [];
  const attemptAccountingDrafts: AccountingDraft[] = [];
  let firstFailureReason: string | undefined;

  for (const providerId of providerOrder) {
    const provider = requireProvider(providers, providerId);
    const result = await provider.invoke({
      input: input.input,
      route: input.route,
      traceId: input.traceId
    });
    const failureReason = classifyFailure(result, input.route);
    if (!failureReason) {
      const status = attempts.length ? "fallback" : "succeeded";
      const accountingDraft = createAccountingDraft({
        fallbackSummary: attempts.length
          ? fallbackSummary(firstFailureReason ?? "failure", attempts)
          : undefined,
        input: input.input,
        provider,
        result,
        route: input.route,
        status,
        traceId: input.traceId
      });
      attempts.push({ providerId, status });
      attemptAccountingDrafts.push(accountingDraft);
      return {
        accountingDraft,
        attemptAccountingDrafts,
        attempts,
        providerId,
        status
      };
    }
    firstFailureReason ??= failureReason;
    attempts.push({ providerId, reason: failureReason, status: "failed" });
    attemptAccountingDrafts.push(
      createAccountingDraft({
        fallbackSummary: fallbackSummary(failureReason, attempts),
        input: input.input,
        provider,
        result,
        route: input.route,
        status: "failed",
        traceId: input.traceId
      })
    );
  }

  const accountingDraft = attemptAccountingDrafts.at(-1);
  if (!accountingDraft) throw new Error("route requires at least one provider");
  return {
    accountingDraft,
    attemptAccountingDrafts,
    attempts,
    providerId: accountingDraft.providerId,
    status: "failed"
  };
}

function createAccountingDraft(input: {
  fallbackSummary?: Record<string, unknown>;
  input: Record<string, unknown>;
  provider: LlmProviderPort;
  result: MockProviderResult;
  route: LlmRouteConfig;
  status: LlmGatewayCallStatus;
  traceId: string;
}): AccountingDraft {
  const inputTokenCount = input.result.inputTokenCount ?? 0;
  const outputTokenCount = input.result.outputTokenCount ?? 0;
  return removeUndefined({
    completionHash: input.result.completionHash,
    costMicros: input.status === "failed" ? 0 : (input.result.costMicros ?? 0),
    fallbackSummary: input.fallbackSummary,
    inputTokenCount,
    latencyMs: input.result.latencyMs ?? 0,
    modelId: input.provider.modelId,
    outputTokenCount,
    promptHash: input.result.promptHash,
    providerId: input.provider.providerId,
    redactionMetadata: optionalRecord(input.input.redactionMetadata),
    routeRef: input.route.routeRef,
    routeVersion: input.route.routeVersion,
    status: input.status,
    task: input.route.task,
    totalTokenCount: inputTokenCount + outputTokenCount,
    traceId: input.traceId,
    truncationMetadata: optionalRecord(input.input.truncationMetadata)
  });
}

function classifyFailure(result: MockProviderResult, route: LlmRouteConfig) {
  if (result.status === "failed") return "failure";
  if (result.status === "timeout" || (result.latencyMs ?? 0) > route.timeoutMs) {
    return "timeout";
  }
  return budgetFailure(result, route);
}

function budgetFailure(result: MockProviderResult, route: LlmRouteConfig) {
  const inputTokenCount = result.inputTokenCount ?? 0;
  const outputTokenCount = result.outputTokenCount ?? 0;
  const totalTokenCount = inputTokenCount + outputTokenCount;
  if (
    inputTokenCount > route.inputTokenBudget ||
    outputTokenCount > route.outputTokenBudget ||
    totalTokenCount > route.totalTokenBudget ||
    (result.costMicros ?? 0) > route.costMicrosBudget
  ) {
    return "budget";
  }
  return undefined;
}

function validateInvocationBoundary(
  task: LlmGatewayTask,
  input: Record<string, unknown>
) {
  const profile = taskSafetyProfiles[task];
  if (profile.disallowInternalConfigFields && "internalConfig" in input) {
    throw new Error("customer-facing tasks must not receive internalConfig");
  }
  if (profile.requiresRedactionMetadata && !optionalRecord(input.redactionMetadata)) {
    throw new Error("redactionMetadata is required");
  }
}

function fallbackSummary(reason: string, attempts: LlmInvocationResult["attempts"]) {
  return {
    attemptedProviders: attempts.map((attempt) => attempt.providerId),
    reason
  };
}

function providerMap(providers: LlmProviderPort[]): Map<string, LlmProviderPort> {
  const refs = new Map<string, LlmProviderPort>();
  for (const provider of providers) refs.set(provider.providerId, provider);
  return refs;
}

function requireProvider(providers: Map<string, LlmProviderPort>, providerId: string) {
  const provider = providers.get(providerId);
  if (!provider) throw new Error(`provider ${providerId} is not registered`);
  return provider;
}

function safetyProfile(customerVisible: boolean) {
  return {
    customerVisible,
    disallowInternalConfigFields: customerVisible,
    requiresRedactionMetadata: customerVisible
  };
}

function enumValue<T extends string>(
  value: unknown,
  values: Record<string, T>,
  name: string
): T {
  if (typeof value !== "string" || !Object.values(values).includes(value as T)) {
    throw new Error(`${name} is invalid`);
  }
  return value as T;
}

function positiveInt(value: unknown, name: string): number {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value as number;
}

function nonEmptyString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function nonEmptyStrings(values: unknown, name: string, allowEmpty = false): string[] {
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0)) {
    throw new Error(`${name} must be a non-empty string array`);
  }
  return values.map((value) => nonEmptyString(value, name));
}

function optionalRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

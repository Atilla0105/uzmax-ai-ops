export const packageName = "@uzmax/llm-gateway";
// prettier-ignore
export const llmGatewayTasks = { distillDaily: "distill_daily", draftReply: "draft_reply", evalJudge: "eval_judge", intentClassify: "intent_classify", journeyImport: "journey_import", kbAnswer: "kb_answer", profileUpdate: "profile_update", speechPostprocess: "speech_postprocess", summarize: "summarize", visionDiag: "vision_diag" } as const;
// prettier-ignore
export const llmGatewayCallStatuses = { failed: "failed", fallback: "fallback", succeeded: "succeeded" } as const;
// prettier-ignore
export const llmGatewayEvalGateStatuses = { blocked: "blocked", failed: "failed", passed: "passed", pending: "pending" } as const;

type ValueOf<T> = T[keyof T];
export type LlmGatewayTask = ValueOf<typeof llmGatewayTasks>;
export type LlmGatewayCallStatus = ValueOf<typeof llmGatewayCallStatuses>;

type BudgetKeys =
  | "costMicrosBudget"
  | "inputTokenBudget"
  | "outputTokenBudget"
  | "timeoutMs"
  | "totalTokenBudget";
type RouteRefKeys = "primaryProviderRef" | "routeRef" | "routeVersion" | "task";
export type RouteConfigInput = Record<BudgetKeys, number> &
  Record<RouteRefKeys, string> & {
    evalGate: { gateRef: string; lastStatus: string };
    fallbackProviderRefs: string[];
    providerRefs: string[];
  };

export type LlmRouteConfig = Omit<RouteConfigInput, "evalGate" | "task"> & {
  evalGate: { gateRef: string; lastStatus: ValueOf<typeof llmGatewayEvalGateStatuses> };
  task: LlmGatewayTask;
};

type MetricKey = "costMicros" | "inputTokenCount" | "latencyMs" | "outputTokenCount";
export type MockProviderResult = Partial<Record<MetricKey, number>> &
  Partial<Record<"completionHash" | "promptHash", string>> & {
    status: "failed" | "succeeded" | "timeout";
  };

// prettier-ignore
type AttemptSummary = { providerId: string; reason?: string; status: LlmGatewayCallStatus };
type AttemptResult = { reason?: string; result: MockProviderResult };
const allowedMetadataKey =
  /^(completionHash|contextRef|manifestRef|policy|promptHash|redactedSegments|redactionRef|status|storageRef|truncatedSegments|truncationRef)$/;
const forbiddenMetadataKey =
  /(body|content|cost|customer|key|margin|profit|raw|secret|threshold|token)/i;
// prettier-ignore
const safeMetadataValuePatterns = { hash: /^sha256:[a-f0-9]{64}$/, id: /^[a-z][a-z0-9_-]{1,40}$/i, ref: /^(controlled|manifest|redaction|storage|truncation):\/\/[a-z0-9][a-z0-9:/._-]{0,96}$/i, unsafe: /(address|body|completion|content|customer|order|phone|prompt|raw|secret|text|token)/i };

export type LlmProviderPort = {
  invoke: (request: {
    input: Record<string, unknown>;
    route: LlmRouteConfig;
    traceId: string;
  }) => Promise<MockProviderResult>;
  modelId: string;
  providerId: string;
};

const customerVisibleTasks = new Set<LlmGatewayTask>(["draft_reply", "kb_answer"]);
type TaskSafetyProfile = ReturnType<typeof safetyProfile>;
export const taskSafetyProfiles = Object.fromEntries(
  // prettier-ignore
  Object.values(llmGatewayTasks).map((task) => [
    task,
    safetyProfile(customerVisibleTasks.has(task))
  ])
) as Record<LlmGatewayTask, TaskSafetyProfile>;

export function createLlmRouteConfig(input: RouteConfigInput): LlmRouteConfig {
  const providerRefs = uniqueStrings(input.providerRefs, "providerRefs");
  if (!providerRefs.includes(input.primaryProviderRef)) {
    throw new Error("primaryProviderRef must reference a known provider");
  }
  const fallbackProviderRefs = uniqueStrings(
    input.fallbackProviderRefs,
    "fallbackProviderRefs",
    true
  );
  for (const providerRef of fallbackProviderRefs) {
    if (providerRef === input.primaryProviderRef) {
      throw new Error("fallbackProviderRefs must not include primaryProviderRef");
    }
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
  // prettier-ignore
  if (route.totalTokenBudget < Math.max(route.inputTokenBudget, route.outputTokenBudget)) throw new Error("totalTokenBudget must be at least inputTokenBudget and outputTokenBudget");
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
}) {
  validateInvocationBoundary(input.route.task, input.input);
  const providers = providersById(input.providers);
  // prettier-ignore
  const providerOrder = [input.route.primaryProviderRef, ...input.route.fallbackProviderRefs];
  const attempts: AttemptSummary[] = [];
  const attemptAccountingDrafts: ReturnType<typeof createAccountingDraft>[] = [];
  let firstFailureReason: string | undefined;

  for (const providerId of providerOrder) {
    const provider = providers.get(providerId);
    if (!provider) throw new Error(`provider ${providerId} is not registered`);
    const attempt = await invokeProvider(provider, {
      input: input.input,
      route: input.route,
      traceId: input.traceId
    });
    const result = attempt.result;
    const failureReason = attempt.reason ?? classifyFailure(result, input.route);
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
}) {
  const inputTokenCount = input.result.inputTokenCount ?? 0;
  const outputTokenCount = input.result.outputTokenCount ?? 0;
  return removeUndefined({
    completionHash: input.status === "failed" ? undefined : input.result.completionHash,
    costMicros: input.status === "failed" ? 0 : (input.result.costMicros ?? 0),
    fallbackSummary: input.fallbackSummary,
    inputTokenCount,
    latencyMs: input.result.latencyMs ?? 0,
    modelId: input.provider.modelId,
    outputTokenCount,
    promptHash: input.status === "failed" ? undefined : input.result.promptHash,
    providerId: input.provider.providerId,
    redactionMetadata: metadataRecord(input.input.redactionMetadata),
    routeRef: input.route.routeRef,
    routeVersion: input.route.routeVersion,
    status: input.status,
    task: input.route.task,
    totalTokenCount: inputTokenCount + outputTokenCount,
    traceId: input.traceId,
    truncationMetadata: metadataRecord(input.input.truncationMetadata)
  });
}

function providersById(providers: LlmProviderPort[]) {
  const providerIds = providers.map((provider) => provider.providerId);
  if (new Set(providerIds).size !== providerIds.length)
    throw new Error("providers must not contain duplicate providerId");
  // prettier-ignore
  return new Map(providers.map((provider) => [provider.providerId, provider]));
}
async function invokeProvider(
  provider: LlmProviderPort,
  request: Parameters<LlmProviderPort["invoke"]>[0]
): Promise<AttemptResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const invoke = Promise.resolve()
    .then(() => provider.invoke(request))
    .then((result) => ({ result }))
    .catch(() => ({ reason: "failure", result: { status: "failed" as const } }));
  // prettier-ignore
  const timeout = new Promise<AttemptResult>((resolve) => { timer = setTimeout(() => resolve({ reason: "timeout", result: { status: "timeout" } }), request.route.timeoutMs); });
  try {
    return await Promise.race([invoke, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function classifyFailure(result: MockProviderResult, route: LlmRouteConfig) {
  if (result.status === "failed") return "failure";
  if (result.status === "timeout" || (result.latencyMs ?? 0) > route.timeoutMs) {
    return "timeout";
  }
  // prettier-ignore
  if (!hasValidTelemetry(result) || [result.completionHash, result.promptHash].some((value) => value !== undefined && !safeMetadataValuePatterns.hash.test(value))) return "accounting_invalid";
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
  const redactionMetadata = metadataRecord(input.redactionMetadata);
  metadataRecord(input.truncationMetadata);
  if (profile.requiresRedactionMetadata && !redactionMetadata) {
    throw new Error("redactionMetadata is required");
  }
}

function fallbackSummary(reason: string, attempts: AttemptSummary[]) {
  return {
    attemptedProviders: attempts.map((attempt) => attempt.providerId),
    reason
  };
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

function uniqueStrings(values: unknown, name: string, allowEmpty = false): string[] {
  const items = nonEmptyStrings(values, name, allowEmpty);
  if (new Set(items).size !== items.length)
    throw new Error(`${name} must not contain duplicates`);
  return items;
}

function hasValidTelemetry(result: MockProviderResult): boolean {
  // prettier-ignore
  return ["costMicros", "inputTokenCount", "latencyMs", "outputTokenCount"].every((key) => nonNegativeInt(result[key as keyof MockProviderResult]));
}

function metadataRecord(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("metadata must be an object");
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      safeMetadataKey(key),
      safeMetadataValue(key, entry)
    ])
  );
}

function safeMetadataKey(key: string): string {
  if (!allowedMetadataKey.test(key) || forbiddenMetadataKey.test(key))
    throw new Error("metadata key is not allowed");
  return key;
}

function safeMetadataValue(key: string, value: unknown): string | number {
  if (key.endsWith("Segments")) {
    if (nonNegativeInt(value)) return value as number;
    throw new Error("metadata value is invalid");
  }
  if (typeof value !== "string") throw new Error("metadata value is invalid");
  const text = value.trim();
  if (!text || text.length > 120) throw new Error("metadata value is invalid");
  if (safeMetadataString(key, text)) return text;
  throw new Error("metadata value is invalid");
}

function safeMetadataString(key: string, text: string): boolean {
  // prettier-ignore
  return key.endsWith("Hash") ? safeMetadataValuePatterns.hash.test(text) : key.endsWith("Ref") ? safeMetadataValuePatterns.ref.test(text) : (key === "policy" || key === "status") && safeMetadataValuePatterns.id.test(text) && !safeMetadataValuePatterns.unsafe.test(text);
}

function nonNegativeInt(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) >= 0;
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

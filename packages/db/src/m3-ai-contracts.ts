const UUID_TEXT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Scope = { orgId: string; tenantId: string };
type M3Input = Scope & { id: string } & Record<string, unknown>;
export type M3AiContractInput = M3Input;

// prettier-ignore
export const m3AiTableNames = { evalCase: "eval_case", evalGate: "eval_gate", evalResult: "eval_result", evalRun: "eval_run", kbEntry: "kb_entry", kbStage: "kb_stage", llmCallLog: "llm_call_log", mediaAsset: "media_asset", quoteRecord: "quote_record" } as const;
// prettier-ignore
export const m3RecordStatuses = { active: "active", archived: "archived", draft: "draft" } as const;
// prettier-ignore
export const quoteRecordStatuses = { created: "created", expired: "expired", voided: "voided" } as const;
export const quoteSources = { code: "code" } as const;
// prettier-ignore
export const evalCategories = { businessDraft: "business_draft", degradation: "degradation", intent: "intent", language: "language", quote: "quote", redlineAttack: "redline_attack", redlineFalsePositive: "redline_false_positive", speech: "speech", tutorial: "tutorial", vision: "vision" } as const;
// prettier-ignore
export const evalRunStatuses = { blocked: "blocked", failed: "failed", passed: "passed", queued: "queued", running: "running" } as const;
// prettier-ignore
export const evalResultStatuses = { failed: "failed", passed: "passed", skipped: "skipped" } as const;
// prettier-ignore
export const evalGateStatuses = { blocked: "blocked", failed: "failed", passed: "passed", pending: "pending" } as const;
// prettier-ignore
export const llmTasks = { distillDaily: "distill_daily", draftReply: "draft_reply", evalJudge: "eval_judge", intentClassify: "intent_classify", journeyImport: "journey_import", kbAnswer: "kb_answer", profileUpdate: "profile_update", speechPostprocess: "speech_postprocess", summarize: "summarize", visionDiag: "vision_diag" } as const;
// prettier-ignore
export const llmCallStatuses = { failed: "failed", fallback: "fallback", succeeded: "succeeded" } as const;

export function createKbEntryContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "kb entry"),
    ...optionalRecords(input, ["metadata"]),
    ...optionalText(input, ["contentHash", "sourceRef"]),
    category: text(input, "category", "kb entry category"),
    entryKey: text(input, "entryKey", "kb entry key"),
    id: uuid(input.id, "kb entry id"),
    status: oneOf(input.status, m3RecordStatuses, "kb entry status"),
    title: text(input, "title", "kb entry title"),
    version: int(input.version, "version", 1)
  };
}

export function createKbStageContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "kb stage"),
    id: uuid(input.id, "kb stage id"),
    kbEntryId: uuidField(input, "kbEntryId", "kb stage kbEntryId"),
    materialRefs: record(input.materialRefs, "kb stage materialRefs"),
    sequence: int(input.sequence, "sequence", 0),
    stageKey: text(input, "stageKey", "kb stage key"),
    status: oneOf(input.status, m3RecordStatuses, "kb stage status"),
    title: text(input, "title", "kb stage title")
  };
}

export function createMediaAssetContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "media asset"),
    ...optionalRecords(input, ["metadata"]),
    ...optionalText(input, ["contentHash", "mimeType"]),
    assetKind: text(input, "assetKind", "media asset kind"),
    id: uuid(input.id, "media asset id"),
    status: oneOf(input.status, m3RecordStatuses, "media asset status"),
    storageRef: text(input, "storageRef", "media asset storageRef")
  };
}

export function createQuoteRecordContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "quote"),
    ...optionalInt(input, "totalMinorUnits", 0),
    ...optionalText(input, ["currency", "validUntil"]),
    ...optionalUuid(input, ["conversationId"]),
    ...quoteConfigProvenance(input),
    id: uuid(input.id, "quote id"),
    inputRef: record(input.inputRef, "quote inputRef"),
    result: record(input.result, "quote result"),
    source: oneOf(input.source, quoteSources, "quote source"),
    status: oneOf(input.status, quoteRecordStatuses, "quote status")
  };
}

function quoteConfigProvenance(input: M3Input): Record<string, string> {
  const fields = {
    ...optionalText(input, ["configVersionRef"]),
    ...optionalUuid(input, ["configVersionId"])
  };
  if (!fields.configVersionId && !fields.configVersionRef) {
    throw new Error(
      "quote config provenance requires configVersionId or configVersionRef"
    );
  }
  return fields;
}

export function createEvalCaseContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "eval case"),
    caseRef: text(input, "caseRef", "eval case ref"),
    category: oneOf(input.category, evalCategories, "eval category"),
    id: uuid(input.id, "eval case id"),
    quotaWeight: int(input.quotaWeight, "quotaWeight", 1),
    redactedPayload: record(input.redactedPayload, "eval redactedPayload"),
    status: oneOf(input.status, m3RecordStatuses, "eval case status"),
    version: int(input.version, "version", 1)
  };
}

export function createEvalRunContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "eval run"),
    ...optionalText(input, ["endedAt", "startedAt", "triggerRef"]),
    categoryQuotas: record(input.categoryQuotas, "eval categoryQuotas"),
    gateKey: text(input, "gateKey", "eval gateKey"),
    id: uuid(input.id, "eval run id"),
    status: oneOf(input.status, evalRunStatuses, "eval run status")
  };
}

export function createEvalResultContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "eval result"),
    ...optionalInt(input, "score", 0, 100),
    ...optionalRecords(input, ["redlineSummary"]),
    ...optionalText(input, ["outputRef"]),
    category: oneOf(input.category, evalCategories, "eval category"),
    evalCaseId: uuidField(input, "evalCaseId", "eval result evalCaseId"),
    evalRunId: uuidField(input, "evalRunId", "eval result evalRunId"),
    id: uuid(input.id, "eval result id"),
    status: oneOf(input.status, evalResultStatuses, "eval result status")
  };
}

export function createEvalGateContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "eval gate"),
    ...optionalUuid(input, ["lastEvalRunId"]),
    categoryQuotas: record(input.categoryQuotas, "eval categoryQuotas"),
    gateKey: text(input, "gateKey", "eval gateKey"),
    id: uuid(input.id, "eval gate id"),
    status: oneOf(input.status, evalGateStatuses, "eval gate status"),
    targetKind: text(input, "targetKind", "eval gate targetKind"),
    targetRef: text(input, "targetRef", "eval gate targetRef")
  };
}

export function createLlmCallLogContract(input: M3Input): Record<string, unknown> {
  return {
    ...scope(input, "llm call"),
    ...optionalRecords(input, [
      "evalSummary",
      "fallbackSummary",
      "redactionMetadata",
      "redlineSummary"
    ]),
    ...optionalText(input, [
      "completionHash",
      "promptHash",
      "routeRef",
      "routeVersion",
      "traceId"
    ]),
    costMicros: int(input.costMicros, "costMicros", 0),
    id: uuid(input.id, "llm call id"),
    inputTokenCount: int(input.inputTokenCount, "inputTokenCount", 0),
    latencyMs: int(input.latencyMs, "latencyMs", 0),
    modelId: text(input, "modelId", "modelId"),
    outputTokenCount: int(input.outputTokenCount, "outputTokenCount", 0),
    providerId: text(input, "providerId", "providerId"),
    status: oneOf(input.status, llmCallStatuses, "llm call status"),
    task: oneOf(input.task, llmTasks, "llm task"),
    totalTokenCount: int(input.totalTokenCount, "totalTokenCount", 0)
  };
}

function text(source: M3Input, key: string, name = key): string {
  const value = source[key];
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${name} is required`);
  return value.trim();
}

function uuid(value: unknown, name: string): string {
  if (typeof value !== "string" || !UUID_TEXT.test(value.trim())) {
    throw new Error(`${name} must be a UUID`);
  }
  return value.trim();
}

function uuidField(source: M3Input, key: string, name = key): string {
  return uuid(source[key], name);
}

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function int(
  value: unknown,
  name: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER
): number {
  if (
    !Number.isInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  ) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return value as number;
}

function oneOf<T extends string>(
  value: unknown,
  source: Record<string, T>,
  name: string
): T {
  if (typeof value !== "string" || !Object.values(source).includes(value as T)) {
    throw new Error(`${name} is invalid`);
  }
  return value as T;
}

function scope(input: Scope, name: string): Scope {
  return {
    orgId: uuid(input.orgId, `${name} orgId`),
    tenantId: uuid(input.tenantId, `${name} tenantId`)
  };
}

function optionalText(input: M3Input, keys: readonly string[]): Record<string, string> {
  return Object.fromEntries(
    keys.flatMap((key) => (input[key] ? [[key, text(input, key)]] : []))
  );
}

function optionalUuid(input: M3Input, keys: readonly string[]): Record<string, string> {
  return Object.fromEntries(
    keys.flatMap((key) => (input[key] ? [[key, uuidField(input, key)]] : []))
  );
}

function optionalRecords(
  input: M3Input,
  keys: readonly string[]
): Record<string, Record<string, unknown>> {
  return Object.fromEntries(
    keys.flatMap((key) => (input[key] ? [[key, record(input[key], key)]] : []))
  );
}

function optionalInt(
  input: M3Input,
  key: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER
): Record<string, number> {
  return input[key] === undefined
    ? {}
    : { [key]: int(input[key], key, minimum, maximum) };
}

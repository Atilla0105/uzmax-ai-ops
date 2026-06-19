export const packageName = "@uzmax/engine";

export const engineBreakerScopes = {
  capability: "capability",
  global: "global",
  user: "user",
  userCapability: "user_capability"
} as const;

export const engineSafetyDecisionStatuses = {
  allow: "allow",
  degrade: "degrade",
  handoff: "handoff",
  suppress: "suppress"
} as const;

export const engineRedlineOutputStatuses = {
  passed: "passed",
  suppressed: "suppressed"
} as const;

type ValueOf<T> = T[keyof T];
type BreakerScope = ValueOf<typeof engineBreakerScopes>;
type SafetyStatus = ValueOf<typeof engineSafetyDecisionStatuses>;
type OutputStatus = ValueOf<typeof engineRedlineOutputStatuses>;

type BreakerInput = {
  affectedCapabilityKeys?: string[];
  affectedUserRefs?: string[];
  capabilityKey?: string;
  controlledRefs?: string[];
  eventKind: string;
  repeatedFailureCount?: number;
  userRef?: string;
};

type RedlineOutputInput = {
  controlledRefs?: string[];
  output: string;
  outputRef: string;
};

type SafetyActionInput = {
  breakerDecision: unknown;
  outputGuard: unknown;
};

const breakerEventKinds = {
  capabilityRepeatedFailure: "capability_repeated_failure",
  crossCapabilityRisk: "cross_capability_risk",
  crossUserRisk: "cross_user_risk",
  redlinePolicyCompromise: "redline_policy_compromise",
  singleUserAttack: "single_user_attack",
  singleUserCapabilityAttack: "single_user_capability_attack",
  systemicRisk: "systemic_risk"
} as const;

const globalEventKinds = new Set<string>([
  breakerEventKinds.crossCapabilityRisk,
  breakerEventKinds.crossUserRisk,
  breakerEventKinds.redlinePolicyCompromise,
  breakerEventKinds.systemicRisk
]);

const unsafeOutputPatterns = [
  { kind: "internal_config", pattern: /\binternal\s+config(?:uration)?\b/i },
  { kind: "internal_config", pattern: /\bprivate\s+config(?:uration)?\b/i },
  { kind: "internal_economics", pattern: /\b(?:costs?|profit|margin)s?\b/i },
  { kind: "model_route", pattern: /\bmodel\s+route\b/i },
  { kind: "private_route", pattern: /\bprivate\s+route\b/i },
  { kind: "private_budget", pattern: /\b(?:private\s+)?budget\s+guard\b/i },
  { kind: "private_guard", pattern: /\bguard\s+value\b/i },
  { kind: "public_url", pattern: /\b(?:https?:\/\/|www\.)\S+/i },
  { kind: "raw_completion", pattern: /\braw\s+completion\b/i },
  { kind: "raw_prompt", pattern: /\braw\s+prompt\b/i },
  { kind: "system_prompt", pattern: /\bsystem\s+prompt\b/i },
  { kind: "threshold", pattern: /\bthresholds?\b/i }
] as const;

const breakerEventKindValues = new Set<string>(Object.values(breakerEventKinds));
const controlledRefPattern =
  /^(controlled|manifest|redaction|storage|ticket):\/\/[a-z0-9][a-z0-9:/._-]{0,120}$/i;
const safeCapabilityKeyPattern = /^[a-z][a-z0-9_-]{1,48}$/i;
const safeReasonCodePattern = /^[a-z][a-z0-9_:-]{0,96}$/i;
const outputInputKeys = new Set(["controlledRefs", "output", "outputRef"]);

export function evaluateBreakerRadius(input: BreakerInput) {
  const refs = controlledRefs(input.controlledRefs);
  const eventKind = breakerEventKind(input.eventKind);
  const affectedUserRefs = controlledRefs(input.affectedUserRefs, true);
  const affectedCapabilityKeys = capabilityKeys(input.affectedCapabilityKeys, true);
  const capabilityKey = input.capabilityKey
    ? capabilityKeyValue(input.capabilityKey)
    : undefined;
  const userRef = input.userRef ? controlledRef(input.userRef, "userRef") : undefined;

  if (globalEventKinds.has(eventKind)) {
    return breakerDecision({
      affectedCapabilityKeys,
      affectedUserRefs,
      controlledRefs: refs,
      reasonCodes: [`event:${eventKind}`, "systemic_risk"],
      scope: engineBreakerScopes.global
    });
  }

  if (
    eventKind === breakerEventKinds.capabilityRepeatedFailure &&
    (input.repeatedFailureCount ?? 0) >= 3
  ) {
    return breakerDecision({
      affectedCapabilityKeys: [requireCapabilityKey(capabilityKey)],
      affectedUserRefs,
      controlledRefs: refs,
      reasonCodes: ["event:capability_repeated_failure", "capability_only"],
      scope: engineBreakerScopes.capability
    });
  }

  if (eventKind === breakerEventKinds.singleUserCapabilityAttack) {
    return breakerDecision({
      affectedCapabilityKeys: [requireCapabilityKey(capabilityKey)],
      affectedUserRefs: [requireUserRef(userRef)],
      controlledRefs: refs,
      reasonCodes: ["event:single_user_capability_attack", "user_capability_only"],
      scope: engineBreakerScopes.userCapability
    });
  }

  return breakerDecision({
    affectedCapabilityKeys: capabilityKey ? [capabilityKey] : [],
    affectedUserRefs: [requireUserRef(userRef)],
    controlledRefs: refs,
    reasonCodes: [`event:${eventKind}`, "single_user_only"],
    scope: engineBreakerScopes.user
  });
}

export function guardRedlineOutput(input: RedlineOutputInput) {
  const safeInput = allowedObject(input, outputInputKeys, "redline output input");
  const outputRef = controlledRef(safeInput.outputRef, "outputRef");
  const controlledRefsValue = controlledRefs(safeInput.controlledRefs);
  const output = nonEmpty(safeInput.output, "output");
  const findings = outputFindings(output, outputRef);

  if (findings.length) {
    return {
      controlledRefs: controlledRefsValue,
      degradation: degradationContract(
        "redline_output_suppressed",
        controlledRefsValue
      ),
      findings,
      handoff: handoffContract("redline_output_suppressed", controlledRefsValue),
      reasonCodes: [...new Set(findings.map((finding) => finding.kind))],
      status: engineRedlineOutputStatuses.suppressed as OutputStatus,
      suppressOutbound: true
    };
  }

  return {
    controlledRefs: controlledRefsValue,
    findings,
    output,
    outputRef,
    reasonCodes: [],
    status: engineRedlineOutputStatuses.passed as OutputStatus,
    suppressOutbound: false
  };
}

export function decideEngineSafetyAction(input: SafetyActionInput) {
  const breakerDecision = safeBreakerDecision(input.breakerDecision);
  const outputGuard = safeOutputGuard(input.outputGuard);
  const safeInput = { breakerDecision, outputGuard };
  if (outputGuard.status === engineRedlineOutputStatuses.suppressed) {
    return safetyAction(
      "redline_output_suppressed",
      engineSafetyDecisionStatuses.suppress,
      safeInput
    );
  }
  if (breakerDecision.scope === engineBreakerScopes.global) {
    return safetyAction("global_breaker_active", engineSafetyDecisionStatuses.degrade, {
      breakerDecision,
      outputGuard
    });
  }
  if (breakerDecision.scope !== engineBreakerScopes.user) {
    return safetyAction("scoped_breaker_active", engineSafetyDecisionStatuses.handoff, {
      breakerDecision,
      outputGuard
    });
  }
  if (breakerDecision.reasonCodes.includes("single_user_only")) {
    return safetyAction(
      "single_user_breaker_active",
      engineSafetyDecisionStatuses.handoff,
      safeInput
    );
  }
  return {
    auditRefs: outputGuard.controlledRefs,
    degradation: { required: false },
    disabledCapabilityKeys: [],
    handoff: { required: false },
    reasonCode: "safe_output_allowed",
    status: engineSafetyDecisionStatuses.allow as SafetyStatus,
    suppressOutbound: false
  };
}

function breakerDecision(input: {
  affectedCapabilityKeys: string[];
  affectedUserRefs: string[];
  controlledRefs: string[];
  reasonCodes: string[];
  scope: BreakerScope;
}) {
  const disablesGlobal = input.scope === engineBreakerScopes.global;
  const disablesCapability =
    input.scope === engineBreakerScopes.capability ||
    input.scope === engineBreakerScopes.userCapability;
  const shouldCreateTicket = input.scope !== engineBreakerScopes.user;
  return {
    affectedCapabilityKeys: input.affectedCapabilityKeys,
    affectedUserRefs: input.affectedUserRefs,
    controlledRefs: input.controlledRefs,
    disabledCapabilityKeys: disablesCapability ? input.affectedCapabilityKeys : [],
    globalShutdown: disablesGlobal,
    handoff: {
      draftHold: true,
      required: true,
      ticketRequired: shouldCreateTicket
    },
    reasonCodes: input.reasonCodes,
    safeDegradation: {
      aiMemberState: disablesGlobal ? "breaker_offline" : "scoped_limited",
      preserveAuditRefsOnly: true,
      suppressOutbound: true
    },
    scope: input.scope
  };
}

function safetyAction(
  reasonCode: string,
  status: SafetyStatus,
  input: {
    breakerDecision: ReturnType<typeof safeBreakerDecision>;
    outputGuard: ReturnType<typeof safeOutputGuard>;
  }
) {
  const refs = [
    ...input.breakerDecision.controlledRefs,
    ...input.outputGuard.controlledRefs
  ];
  return {
    auditRefs: [...new Set(refs)],
    degradation: degradationContract(reasonCode, refs),
    disabledCapabilityKeys: input.breakerDecision.disabledCapabilityKeys,
    handoff: handoffContract(reasonCode, refs),
    reasonCode,
    status,
    suppressOutbound: true
  };
}

function outputFindings(output: string, outputRef: string) {
  return unsafeOutputPatterns
    .filter(({ pattern }) => pattern.test(output))
    .map(({ kind }) => ({ kind, outputRef }));
}

function safeBreakerDecision(value: unknown) {
  const record = objectRecord(value, "breakerDecision");
  const scope = enumValue(record.scope, engineBreakerScopes, "breaker scope");
  const globalShutdown = record.globalShutdown === true;
  if (globalShutdown !== (scope === engineBreakerScopes.global)) {
    throw new Error("breakerDecision is invalid");
  }
  return {
    affectedCapabilityKeys: capabilityKeys(record.affectedCapabilityKeys, true),
    affectedUserRefs: controlledRefs(record.affectedUserRefs, true),
    controlledRefs: controlledRefs(record.controlledRefs),
    disabledCapabilityKeys: capabilityKeys(record.disabledCapabilityKeys, true),
    globalShutdown,
    reasonCodes: reasonCodes(record.reasonCodes),
    scope
  };
}

function safeOutputGuard(value: unknown) {
  const record = objectRecord(value, "outputGuard");
  const status = enumValue(record.status, engineRedlineOutputStatuses, "output status");
  const controlledRefsValue = controlledRefs(record.controlledRefs);
  const reasonCodesValue = reasonCodes(record.reasonCodes);
  if (status === engineRedlineOutputStatuses.suppressed) {
    if ("output" in record) throw new Error("outputGuard is invalid");
    return {
      controlledRefs: controlledRefsValue,
      reasonCodes: reasonCodesValue,
      status
    };
  }
  const outputRef = controlledRef(record.outputRef, "outputRef");
  const output = nonEmpty(record.output, "output");
  if (outputFindings(output, outputRef).length) {
    throw new Error("outputGuard is unsafe");
  }
  return {
    controlledRefs: controlledRefsValue,
    output,
    outputRef,
    reasonCodes: [],
    status
  };
}

function degradationContract(reasonCode: string, refs: string[]) {
  return {
    draftHold: true,
    preserveAuditRefsOnly: true,
    reasonCode,
    required: true,
    suppressOutboundAnswer: true,
    ticketRef: refs.find((ref) => ref.startsWith("ticket://"))
  };
}

function handoffContract(reasonCode: string, refs: string[]) {
  return {
    draftHold: true,
    reasonCode,
    required: true,
    ticketRequired: true,
    ticketRef: refs.find((ref) => ref.startsWith("ticket://"))
  };
}

function capabilityKeys(values: unknown, allowEmpty = false) {
  if (values === undefined) return [];
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0)) {
    throw new Error("capability keys must be an array");
  }
  return values.map((value) => capabilityKeyValue(value));
}

function capabilityKeyValue(value: unknown) {
  const text = nonEmpty(value, "capabilityKey");
  if (!safeCapabilityKeyPattern.test(text)) {
    throw new Error("capabilityKey is invalid");
  }
  return text;
}

function breakerEventKind(value: unknown) {
  const text = nonEmpty(value, "eventKind");
  if (!breakerEventKindValues.has(text)) throw new Error("eventKind is invalid");
  return text;
}

function enumValue<T extends string>(
  value: unknown,
  values: Record<string, T>,
  name: string
): T {
  const text = nonEmpty(value, name);
  if (!Object.values(values).includes(text as T)) throw new Error(`${name} is invalid`);
  return text as T;
}

function reasonCodes(values: unknown) {
  if (values === undefined) return [];
  if (!Array.isArray(values)) throw new Error("reasonCodes must be an array");
  return values.map((value) => {
    const text = nonEmpty(value, "reasonCode");
    if (!safeReasonCodePattern.test(text)) throw new Error("reasonCode is invalid");
    return text;
  });
}

function allowedObject(value: unknown, keys: Set<string>, name: string) {
  const record = objectRecord(value, name);
  for (const key of Object.keys(record)) {
    if (!keys.has(key)) throw new Error(`${name} key is not allowed`);
  }
  return record;
}

function objectRecord(value: unknown, name: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function controlledRefs(values: unknown, allowEmpty = true) {
  if (values === undefined) return [];
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0)) {
    throw new Error("controlledRefs must be an array");
  }
  return values.map((value) => controlledRef(value, "controlledRef"));
}

function controlledRef(value: unknown, name: string) {
  const text = nonEmpty(value, name);
  if (!controlledRefPattern.test(text)) throw new Error(`${name} must be controlled`);
  return text;
}

function nonEmpty(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function requireCapabilityKey(value: string | undefined) {
  if (!value) throw new Error("capabilityKey is required");
  return value;
}

function requireUserRef(value: string | undefined) {
  if (!value) throw new Error("userRef is required");
  return value;
}

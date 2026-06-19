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
  breakerDecision: ReturnType<typeof evaluateBreakerRadius>;
  outputGuard: ReturnType<typeof guardRedlineOutput>;
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
  { kind: "private_route", pattern: /\bprivate\s+route\b/i },
  { kind: "private_budget", pattern: /\b(?:private\s+)?budget\s+guard\b/i },
  { kind: "private_guard", pattern: /\bguard\s+value\b/i },
  { kind: "threshold", pattern: /\bthresholds?\b/i }
] as const;

const controlledRefPattern =
  /^(controlled|manifest|redaction|storage|ticket):\/\/[a-z0-9][a-z0-9:/._-]{0,120}$/i;
const safeCapabilityKeyPattern = /^[a-z][a-z0-9_-]{1,48}$/i;

export function evaluateBreakerRadius(input: BreakerInput) {
  const refs = controlledRefs(input.controlledRefs);
  const eventKind = nonEmpty(input.eventKind, "eventKind");
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
  const outputRef = controlledRef(input.outputRef, "outputRef");
  const controlledRefsValue = controlledRefs(input.controlledRefs);
  const output = nonEmpty(input.output, "output");
  const findings = unsafeOutputPatterns
    .filter(({ pattern }) => pattern.test(output))
    .map(({ kind }) => ({ kind, outputRef }));

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
  if (input.outputGuard.status === engineRedlineOutputStatuses.suppressed) {
    return safetyAction(
      "redline_output_suppressed",
      engineSafetyDecisionStatuses.suppress,
      {
        breakerDecision: input.breakerDecision,
        outputGuard: input.outputGuard
      }
    );
  }
  if (input.breakerDecision.scope === engineBreakerScopes.global) {
    return safetyAction("global_breaker_active", engineSafetyDecisionStatuses.degrade, {
      breakerDecision: input.breakerDecision,
      outputGuard: input.outputGuard
    });
  }
  if (input.breakerDecision.scope !== engineBreakerScopes.user) {
    return safetyAction("scoped_breaker_active", engineSafetyDecisionStatuses.handoff, {
      breakerDecision: input.breakerDecision,
      outputGuard: input.outputGuard
    });
  }
  if (input.breakerDecision.reasonCodes.includes("single_user_only")) {
    return safetyAction(
      "single_user_breaker_active",
      engineSafetyDecisionStatuses.handoff,
      {
        breakerDecision: input.breakerDecision,
        outputGuard: input.outputGuard
      }
    );
  }
  return {
    auditRefs: input.outputGuard.controlledRefs,
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
  input: SafetyActionInput
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

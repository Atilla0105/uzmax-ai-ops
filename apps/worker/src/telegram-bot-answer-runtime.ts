type MaybePromise<T> = T | Promise<T>;

export type TelegramBotAnswerRuntimeRequest = {
  channelConnectionId: string;
  chatExternalRef?: string;
  locale?: string;
  orgId: string;
  participantExternalRef?: string;
  providerUpdateId: string;
  tenantId: string;
  text: string;
  traceId: string;
};

export type TelegramBotAnswerRuntimeResult =
  | {
      answerText: string;
      status: "answered";
    }
  | {
      reasonCode: string;
      status: "handoff_required";
      suppressOutbound: true;
    };

export type TelegramBotAnswerRuntime = {
  answer(
    request: TelegramBotAnswerRuntimeRequest
  ): MaybePromise<TelegramBotAnswerRuntimeResult>;
};

type RuntimeHook = (input: Record<string, unknown>) => unknown;
type CreateAnswerRuntimeOptions = {
  answerKbJourneyStage?: RuntimeHook;
  guardRedlineOutput?: RuntimeHook;
  invokeLlmRoute?: (input: Record<string, unknown>) => Promise<unknown>;
  journey?: unknown;
  llmProviders?: unknown[];
  llmRoute?: unknown;
  locale?: string;
  persona?: {
    aiMemberRef: string;
    evalGateStatus?: string;
    personaVersionRef: string;
  };
};

export function createTelegramBotAnswerRuntime(
  options: CreateAnswerRuntimeOptions
): TelegramBotAnswerRuntime {
  return {
    async answer(request) {
      const persona = options.persona;
      if (!persona) return handoff("missing_persona");
      if (persona.evalGateStatus && persona.evalGateStatus !== "passed") {
        return handoff("persona_eval_gate_not_passed");
      }
      if (!options.journey || !options.answerKbJourneyStage) {
        return handoff("missing_kb");
      }

      const kb = asRecord(
        options.answerKbJourneyStage({
          journey: options.journey,
          locale: request.locale ?? options.locale,
          query: request.text
        }),
        "kb answer"
      );
      if (kb.status === "stage_card") {
        return guardedKbAnswer(options, request, kb);
      }
      if (kb.status === "handoff_required") {
        return handoff(`kb_${reasonCode(kb.reasonCode)}`);
      }
      return llmFailClosed(options, request, persona, kb);
    }
  };
}

function guardedKbAnswer(
  options: CreateAnswerRuntimeOptions,
  request: TelegramBotAnswerRuntimeRequest,
  kb: Record<string, unknown>
): TelegramBotAnswerRuntimeResult {
  if (!options.guardRedlineOutput) return handoff("redline_guard_unavailable");
  const outputRef = `controlled://telegram-bot-answer/${refSegment(
    request.providerUpdateId
  )}`;
  const redline = asRecord(
    options.guardRedlineOutput({
      controlledRefs: [],
      output: answerText(asRecord(kb.card, "kb card").answer),
      outputRef
    }),
    "redline result"
  );
  if (redline.status !== "passed" || redline.suppressOutbound === true) {
    return handoff("redline_output_suppressed");
  }
  return {
    answerText: answerText(redline.output),
    status: "answered"
  };
}

async function llmFailClosed(
  options: CreateAnswerRuntimeOptions,
  request: TelegramBotAnswerRuntimeRequest,
  persona: NonNullable<CreateAnswerRuntimeOptions["persona"]>,
  kb: Record<string, unknown>
): Promise<TelegramBotAnswerRuntimeResult> {
  if (!options.invokeLlmRoute || !options.llmRoute || !options.llmProviders?.length) {
    return handoff(`kb_${reasonCode(kb.reasonCode)}`);
  }
  const segment = refSegment(request.providerUpdateId);
  const llm = asRecord(
    await options.invokeLlmRoute({
      input: {
        contextRef: `controlled://telegram-bot-context/${segment}`,
        kbResultStatus: reasonCode(kb.status),
        personaRef: persona.aiMemberRef,
        personaVersionRef: persona.personaVersionRef,
        redactionMetadata: {
          policy: "m8_bot_answer_v0",
          redactedSegments: 1,
          redactionRef: `redaction://telegram-bot/${segment}`
        },
        truncationMetadata: {
          truncatedSegments: 0,
          truncationRef: `truncation://telegram-bot/${segment}`
        }
      },
      providers: options.llmProviders,
      route: options.llmRoute,
      traceId: request.traceId
    }),
    "llm result"
  );
  return llm.status === "succeeded" || llm.status === "fallback"
    ? handoff("llm_answer_unavailable")
    : handoff("provider_failure");
}

function handoff(reason: string): TelegramBotAnswerRuntimeResult {
  return {
    reasonCode: reasonCode(reason),
    status: "handoff_required",
    suppressOutbound: true
  };
}

function answerText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error("answer text is required");
  return text.slice(0, 4096);
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function reasonCode(value: unknown): string {
  const text = typeof value === "string" ? value : "unknown";
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_:.-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 96) || "unknown"
  );
}

function refSegment(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "unknown"
  );
}

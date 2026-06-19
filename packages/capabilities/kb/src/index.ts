export const packageName = "@uzmax/capability-kb";

export const kbJourneyResultStatuses = {
  clarificationRequired: "clarification_required",
  handoffRequired: "handoff_required",
  stageCard: "stage_card"
} as const;

type LocaleText = Record<string, string>;
type LocaleSteps = Record<string, readonly string[]>;
type StageStatus = "active" | "archived" | "draft";

export type KbMaterialRef = {
  kind: string;
  ref: string;
  title?: string;
};

export type KbJourneyStageInput = {
  answer: string;
  localizedAnswers?: LocaleText;
  localizedSteps?: LocaleSteps;
  localizedTitles?: LocaleText;
  localizedTriggers?: Record<string, readonly string[]>;
  materialRefs?: readonly KbMaterialRef[];
  nextStageKey?: string;
  sequence: number;
  stageKey: string;
  stageRef: string;
  status?: StageStatus;
  steps: readonly string[];
  title: string;
  triggers?: readonly string[];
};

export type KbJourneyInput = {
  defaultLocale: string;
  journeyKey: string;
  journeyRef: string;
  stages: readonly KbJourneyStageInput[];
  title: string;
};

export type KbJourneyStage = Required<
  Pick<KbJourneyStageInput, "localizedAnswers" | "localizedSteps" | "localizedTitles">
> &
  Omit<
    KbJourneyStageInput,
    "localizedAnswers" | "localizedSteps" | "localizedTitles" | "materialRefs"
  > & {
    materialRefs: readonly KbMaterialRef[];
    status: StageStatus;
  };

export type KbJourney = Omit<KbJourneyInput, "stages"> & {
  stages: readonly KbJourneyStage[];
};

type StageSummary = {
  key: string;
  ref: string;
  sequence: number;
  title: string;
};

type KbJourneyAnswerInput = {
  journey: KbJourney | KbJourneyInput;
  locale?: string;
  query?: string;
  stageKey?: string;
};

type StageCardResult = {
  card: {
    answer: string;
    materialRefs: readonly KbMaterialRef[];
    nextAction:
      | { stageKey: string; stageRef: string; type: "next_stage" }
      | {
          type: "complete";
        };
    steps: readonly string[];
  };
  locale: string;
  reasonCode: "stage_localized";
  refs: {
    journeyRef: string;
    materialRefs: readonly string[];
    stageRef: string;
  };
  stage: StageSummary;
  status: typeof kbJourneyResultStatuses.stageCard;
};

type ClarificationResult = {
  clarification: {
    kind: "stage";
    options: readonly StageSummary[];
  };
  handoff: {
    reasonCode: "stage_not_found";
    required: false;
  };
  reasonCode: "stage_not_found";
  status: typeof kbJourneyResultStatuses.clarificationRequired;
};

type HandoffRequiredResult = {
  candidates: readonly StageSummary[];
  handoff: {
    reasonCode: "stage_ambiguous" | "stage_unavailable";
    required: true;
  };
  reasonCode: "stage_ambiguous" | "stage_unavailable";
  status: typeof kbJourneyResultStatuses.handoffRequired;
};

export type KbJourneyAnswerResult =
  | ClarificationResult
  | HandoffRequiredResult
  | StageCardResult;

export function createKbJourney(input: KbJourneyInput): KbJourney {
  const defaultLocale = requiredText(input.defaultLocale, "default locale");
  const stages = input.stages.map((stage) => normalizeStage(stage));

  return {
    defaultLocale,
    journeyKey: requiredText(input.journeyKey, "journey key"),
    journeyRef: controlledRef(input.journeyRef, "journey ref"),
    stages: stages.sort((left, right) => left.sequence - right.sequence),
    title: requiredText(input.title, "journey title")
  };
}

export function answerKbJourneyStage(
  input: KbJourneyAnswerInput
): KbJourneyAnswerResult {
  const journey = createKbJourney(input.journey);
  const locale = input.locale?.trim() || journey.defaultLocale;
  const stages = activeStages(journey);
  const match = localizeStage(stages, input, locale);

  if (match.status === "selected") return stageCard(journey, match.stage, locale);
  if (match.status === "ambiguous") {
    return {
      candidates: match.stages.map((stage) => stageSummary(stage, locale)),
      handoff: { reasonCode: "stage_ambiguous", required: true },
      reasonCode: "stage_ambiguous",
      status: kbJourneyResultStatuses.handoffRequired
    };
  }
  if (stages.length === 0) {
    return {
      candidates: [],
      handoff: { reasonCode: "stage_unavailable", required: true },
      reasonCode: "stage_unavailable",
      status: kbJourneyResultStatuses.handoffRequired
    };
  }

  return {
    clarification: {
      kind: "stage",
      options: stages.slice(0, 4).map((stage) => stageSummary(stage, locale))
    },
    handoff: { reasonCode: "stage_not_found", required: false },
    reasonCode: "stage_not_found",
    status: kbJourneyResultStatuses.clarificationRequired
  };
}

function normalizeStage(stage: KbJourneyStageInput): KbJourneyStage {
  return {
    ...stage,
    answer: requiredText(stage.answer, "stage answer"),
    localizedAnswers: { ...(stage.localizedAnswers ?? {}) },
    localizedSteps: { ...(stage.localizedSteps ?? {}) },
    localizedTitles: { ...(stage.localizedTitles ?? {}) },
    localizedTriggers: copyStringLists(stage.localizedTriggers),
    materialRefs: [...(stage.materialRefs ?? [])].map(normalizeMaterialRef),
    sequence: positiveInteger(stage.sequence, "stage sequence"),
    stageKey: requiredText(stage.stageKey, "stage key"),
    stageRef: controlledRef(stage.stageRef, "stage ref"),
    status: stage.status ?? "active",
    steps: boundedTextList(stage.steps, "stage steps", 5),
    title: requiredText(stage.title, "stage title"),
    triggers: boundedTextList(stage.triggers ?? [], "stage triggers", 12)
  };
}

function normalizeMaterialRef(ref: KbMaterialRef): KbMaterialRef {
  return {
    kind: requiredText(ref.kind, "material kind"),
    ref: controlledRef(ref.ref, "material ref"),
    ...(ref.title ? { title: requiredText(ref.title, "material title") } : {})
  };
}

function activeStages(journey: KbJourney): KbJourneyStage[] {
  return journey.stages.filter((stage) => stage.status === "active");
}

function localizeStage(
  stages: readonly KbJourneyStage[],
  input: KbJourneyAnswerInput,
  locale: string
):
  | { stage: KbJourneyStage; status: "selected" }
  | { stages: readonly KbJourneyStage[]; status: "ambiguous" }
  | { status: "not_found" } {
  const stageKey = normalize(input.stageKey ?? "");
  if (stageKey) {
    const keyed = stages.find((stage) => normalize(stage.stageKey) === stageKey);
    if (keyed) return { stage: keyed, status: "selected" };
  }

  const query = normalize(input.query ?? "");
  if (!query) return { status: "not_found" };

  const scored = stages
    .map((stage) => ({ score: scoreStage(stage, query, locale), stage }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
  if (scored.length === 0) return { status: "not_found" };

  const topScore = scored[0]?.score ?? 0;
  const top = scored
    .filter((item) => item.score === topScore)
    .map((item) => item.stage);
  return top.length === 1
    ? { stage: top[0] as KbJourneyStage, status: "selected" }
    : { stages: top, status: "ambiguous" };
}

function scoreStage(stage: KbJourneyStage, query: string, locale: string): number {
  return stageSignals(stage, locale).reduce((score, signal) => {
    const normalizedSignal = normalize(signal);
    if (!normalizedSignal) return score;
    if (query === normalizedSignal) return score + 30;
    if (query.includes(normalizedSignal) || normalizedSignal.includes(query)) {
      return score + 20;
    }
    const signalTokens = normalizedSignal.split(" ").filter(Boolean);
    const matchedTokens = signalTokens.filter((token) => query.includes(token)).length;
    return score + (matchedTokens === signalTokens.length ? 10 : 0);
  }, 0);
}

function stageSignals(stage: KbJourneyStage, locale: string): string[] {
  return [
    stage.stageKey,
    stage.title,
    stage.localizedTitles[locale],
    ...(stage.triggers ?? []),
    ...(stage.localizedTriggers?.[locale] ?? [])
  ].filter((value): value is string => Boolean(value));
}

function stageCard(
  journey: KbJourney,
  stage: KbJourneyStage,
  locale: string
): StageCardResult {
  const materialRefs = stage.materialRefs.slice(0, 5);

  return {
    card: {
      answer: localized(stage.localizedAnswers, locale, stage.answer),
      materialRefs,
      nextAction: nextAction(journey, stage.nextStageKey, locale),
      steps: localizedSteps(stage, locale)
    },
    locale,
    reasonCode: "stage_localized",
    refs: {
      journeyRef: journey.journeyRef,
      materialRefs: materialRefs.map((material) => material.ref),
      stageRef: stage.stageRef
    },
    stage: stageSummary(stage, locale),
    status: kbJourneyResultStatuses.stageCard
  };
}

function nextAction(
  journey: KbJourney,
  nextStageKey: string | undefined,
  locale: string
): StageCardResult["card"]["nextAction"] {
  if (!nextStageKey) return { type: "complete" };
  const next = journey.stages.find((stage) => stage.stageKey === nextStageKey);
  if (!next) return { type: "complete" };
  return {
    stageKey: next.stageKey,
    stageRef: stageSummary(next, locale).ref,
    type: "next_stage"
  };
}

function stageSummary(stage: KbJourneyStage, locale: string): StageSummary {
  return {
    key: stage.stageKey,
    ref: stage.stageRef,
    sequence: stage.sequence,
    title: localized(stage.localizedTitles, locale, stage.title)
  };
}

function localized(map: LocaleText, locale: string, fallback: string): string {
  return requiredText(map[locale] ?? fallback, "localized text");
}

function localizedSteps(stage: KbJourneyStage, locale: string): readonly string[] {
  return boundedTextList(stage.localizedSteps[locale] ?? stage.steps, "stage steps", 5);
}

function copyStringLists(
  input: Record<string, readonly string[]> | undefined
): Record<string, readonly string[]> {
  return Object.fromEntries(
    Object.entries(input ?? {}).map(([locale, values]) => [
      locale,
      boundedTextList(values, "localized triggers", 12)
    ])
  );
}

function boundedTextList(
  values: readonly string[],
  label: string,
  limit: number
): readonly string[] {
  return values.slice(0, limit).map((value) => requiredText(value, label));
}

function controlledRef(value: string, label: string): string {
  const ref = requiredText(value, label);
  if (!/^(controlled|manifest|redaction):\/\/[a-z0-9][a-z0-9./:_-]*$/i.test(ref)) {
    throw new Error(`${label} must be a controlled ref`);
  }
  return ref;
}

function positiveInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value;
}

function requiredText(value: string | undefined, label: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`${label} is required`);
  return trimmed;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

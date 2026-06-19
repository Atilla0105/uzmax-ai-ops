export const packageName = "@uzmax/capability-pricing";

export const pricingQuoteSources = { code: "code" } as const;

export const pricingParameterSources = {
  llmParameterCandidate: "llm_parameter_candidate",
  operatorStructured: "operator_structured",
  systemStructured: "system_structured"
} as const;

type PricingParameterSource =
  (typeof pricingParameterSources)[keyof typeof pricingParameterSources];

type PricingParameters = {
  billableWeightGrams: number;
  inputRef: string;
  laneKey: string;
  parameterSource: PricingParameterSource;
  serviceKey: string;
} & Record<string, unknown>;

type PricingServiceConfig = {
  baseMinorUnits: number;
  minTotalMinorUnits?: number;
  perKgMinorUnits: number;
  serviceKey: string;
} & Record<string, unknown>;

type PricingLaneConfig = {
  laneKey: string;
  rateRefs?: {
    base?: string;
    weight?: string;
  };
  services: readonly PricingServiceConfig[];
};

type PricingConfig = {
  configVersionId?: string;
  configVersionRef?: string;
  currency: string;
  lanes: readonly PricingLaneConfig[];
  quoteTtlSeconds?: number;
};

type NormalizedPricingServiceConfig = {
  baseMinorUnits: number;
  minTotalMinorUnits: number;
  perKgMinorUnits: number;
  serviceKey: string;
};

type NormalizedPricingLaneConfig = Omit<PricingLaneConfig, "rateRefs" | "services"> & {
  rateRefs: NonNullable<PricingLaneConfig["rateRefs"]>;
  services: readonly NormalizedPricingServiceConfig[];
};

type NormalizedPricingConfig = Omit<PricingConfig, "lanes" | "quoteTtlSeconds"> & {
  lanes: readonly NormalizedPricingLaneConfig[];
  quoteTtlSeconds: number;
};

type QuoteLineItem = {
  amountMinorUnits: number;
  code: "base" | "minimum" | "weight";
  quantity?: number;
  ref?: string;
};

export type PricingQuote = {
  configVersionId?: string;
  configVersionRef?: string;
  currency: string;
  inputRef: Record<string, unknown>;
  result: {
    currency: string;
    lineItems: readonly QuoteLineItem[];
    totalMinorUnits: number;
    validUntil: string;
  };
  source: typeof pricingQuoteSources.code;
  totalMinorUnits: number;
  validUntil: string;
};

type PricingQuoteInput = {
  config: PricingConfig;
  now?: string;
  parameters: PricingParameters;
};

type QuoteRecordDraftInput = {
  conversationId?: string;
  orgId: string;
  quote: PricingQuote;
  quoteId: string;
  tenantId: string;
};

type QuoteRecordDraft = {
  configVersionId?: string;
  configVersionRef?: string;
  conversationId?: string;
  currency: string;
  id: string;
  inputRef: Record<string, unknown>;
  orgId: string;
  result: Record<string, unknown>;
  source: typeof pricingQuoteSources.code;
  status: "created";
  tenantId: string;
  totalMinorUnits: number;
  validUntil: string;
};

const UUID_TEXT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const unsafePriceKeys = new Set([
  "calculatedTotalMinorUnits",
  "finalPriceMinorUnits",
  "llmPriceMinorUnits",
  "priceMinorUnits",
  "totalMinorUnits"
]);
const sensitiveKeyPattern = /(cost|internal|margin|profit|threshold)/i;

export function createPricingQuote(input: PricingQuoteInput): PricingQuote {
  const config = normalizeConfig(input.config);
  const parameters = normalizeParameters(input.parameters);
  const lane = config.lanes.find((item) => item.laneKey === parameters.laneKey);
  if (!lane) throw new Error("pricing lane is unknown");
  const service = lane.services.find(
    (item) => item.serviceKey === parameters.serviceKey
  );
  if (!service) throw new Error("pricing service is unknown");

  const weightKg = Math.ceil(parameters.billableWeightGrams / 1000);
  const lineItems: QuoteLineItem[] = [
    {
      amountMinorUnits: service.baseMinorUnits,
      code: "base",
      ...(lane.rateRefs?.base
        ? { ref: controlledRef(lane.rateRefs.base, "base rate ref") }
        : {})
    },
    {
      amountMinorUnits: service.perKgMinorUnits * weightKg,
      code: "weight",
      quantity: weightKg,
      ...(lane.rateRefs?.weight
        ? { ref: controlledRef(lane.rateRefs.weight, "weight rate ref") }
        : {})
    }
  ];
  const subtotal = lineItems.reduce((sum, item) => sum + item.amountMinorUnits, 0);
  const minimumAdjustment = Math.max(0, service.minTotalMinorUnits - subtotal);
  if (minimumAdjustment > 0) {
    lineItems.push({ amountMinorUnits: minimumAdjustment, code: "minimum" });
  }

  const totalMinorUnits = lineItems.reduce(
    (sum, item) => sum + item.amountMinorUnits,
    0
  );
  const validUntil = addSeconds(input.now, config.quoteTtlSeconds);
  const result = {
    currency: config.currency,
    lineItems,
    totalMinorUnits,
    validUntil
  };

  return {
    ...configProvenance(config),
    currency: config.currency,
    inputRef: {
      billableWeightGrams: parameters.billableWeightGrams,
      laneKey: parameters.laneKey,
      parameterSource: parameters.parameterSource,
      ref: parameters.inputRef,
      serviceKey: parameters.serviceKey
    },
    result,
    source: pricingQuoteSources.code,
    totalMinorUnits,
    validUntil
  };
}

export function createQuoteRecordDraft(input: QuoteRecordDraftInput): QuoteRecordDraft {
  const draft = {
    ...configProvenance(input.quote),
    ...(input.conversationId
      ? { conversationId: uuid(input.conversationId, "conversationId") }
      : {}),
    currency: requiredText(input.quote.currency, "quote currency"),
    id: uuid(input.quoteId, "quote id"),
    inputRef: input.quote.inputRef,
    orgId: uuid(input.orgId, "quote orgId"),
    result: input.quote.result,
    source: pricingQuoteSources.code,
    status: "created" as const,
    tenantId: uuid(input.tenantId, "quote tenantId"),
    totalMinorUnits: nonNegativeInteger(input.quote.totalMinorUnits, "totalMinorUnits"),
    validUntil: requiredText(input.quote.validUntil, "validUntil")
  };
  assertNoSensitiveKeys(draft.result, "quote result");
  return draft;
}

function normalizeConfig(config: PricingConfig): NormalizedPricingConfig {
  const currency = requiredText(config.currency, "pricing currency");
  const provenance = configProvenance(config);
  const quoteTtlSeconds = nonNegativeInteger(
    config.quoteTtlSeconds ?? 3600,
    "quoteTtlSeconds"
  );
  const lanes = config.lanes.map((lane) => ({
    laneKey: requiredText(lane.laneKey, "laneKey"),
    rateRefs: normalizeRateRefs(lane.rateRefs),
    services: lane.services.map(normalizeService)
  }));

  return {
    configVersionId: provenance.configVersionId,
    configVersionRef: provenance.configVersionRef,
    currency,
    lanes,
    quoteTtlSeconds
  };
}

function normalizeRateRefs(
  refs: PricingLaneConfig["rateRefs"] | undefined
): NonNullable<PricingLaneConfig["rateRefs"]> {
  if (!refs) return {};
  return {
    ...(refs.base ? { base: controlledRef(refs.base, "base rate ref") } : {}),
    ...(refs.weight ? { weight: controlledRef(refs.weight, "weight rate ref") } : {})
  };
}

function normalizeService(
  service: PricingServiceConfig
): NormalizedPricingServiceConfig {
  assertNoSensitiveKeys(service, "pricing service");
  return {
    baseMinorUnits: nonNegativeInteger(service.baseMinorUnits, "baseMinorUnits"),
    minTotalMinorUnits: nonNegativeInteger(
      service.minTotalMinorUnits ?? 0,
      "minTotalMinorUnits"
    ),
    perKgMinorUnits: nonNegativeInteger(service.perKgMinorUnits, "perKgMinorUnits"),
    serviceKey: requiredText(service.serviceKey, "serviceKey")
  };
}

function normalizeParameters(parameters: PricingParameters): PricingParameters {
  for (const key of unsafePriceKeys) {
    if (parameters[key] !== undefined) {
      throw new Error("LLM price math is not accepted");
    }
  }
  if (
    parameters.source !== undefined &&
    parameters.source !== pricingQuoteSources.code
  ) {
    throw new Error("quote source must be code");
  }
  return {
    ...parameters,
    billableWeightGrams: nonNegativeInteger(
      parameters.billableWeightGrams,
      "billableWeightGrams"
    ),
    inputRef: controlledRef(parameters.inputRef, "pricing input ref"),
    laneKey: requiredText(parameters.laneKey, "laneKey"),
    parameterSource: oneOf(
      parameters.parameterSource,
      pricingParameterSources,
      "pricing parameter source"
    ),
    serviceKey: requiredText(parameters.serviceKey, "serviceKey")
  };
}

function configProvenance(input: {
  configVersionId?: string;
  configVersionRef?: string;
}): { configVersionId?: string; configVersionRef?: string } {
  const fields = {
    ...(input.configVersionId
      ? { configVersionId: uuid(input.configVersionId, "configVersionId") }
      : {}),
    ...(input.configVersionRef
      ? {
          configVersionRef: controlledRef(input.configVersionRef, "configVersionRef")
        }
      : {})
  };
  if (!fields.configVersionId && !fields.configVersionRef) {
    throw new Error(
      "pricing config provenance requires configVersionId or configVersionRef"
    );
  }
  return fields;
}

function addSeconds(now: string | undefined, seconds: number): string {
  const parsed = new Date(now ?? "1970-01-01T00:00:00.000Z");
  if (Number.isNaN(parsed.getTime())) throw new Error("now must be an ISO date");
  return new Date(parsed.getTime() + seconds * 1000).toISOString();
}

function requiredText(value: string | undefined, label: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`${label} is required`);
  return trimmed;
}

function controlledRef(value: string, label: string): string {
  const ref = requiredText(value, label);
  if (!/^(controlled|manifest|redaction):\/\/[a-z0-9][a-z0-9./:_-]*$/i.test(ref)) {
    throw new Error(`${label} must be a controlled ref`);
  }
  return ref;
}

function uuid(value: string, label: string): string {
  const trimmed = requiredText(value, label);
  if (!UUID_TEXT.test(trimmed)) throw new Error(`${label} must be a UUID`);
  return trimmed;
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value as number;
}

function oneOf<T extends string>(
  value: unknown,
  source: Record<string, T>,
  label: string
): T {
  if (typeof value !== "string" || !Object.values(source).includes(value as T)) {
    throw new Error(`${label} is invalid`);
  }
  return value as T;
}

function assertNoSensitiveKeys(value: unknown, label: string): void {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (sensitiveKeyPattern.test(key)) {
      throw new Error(`${label} must not include internal pricing fields`);
    }
    assertNoSensitiveKeys(child, label);
  }
}

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const root = process.cwd();
const pricingSource = readWorkspaceText("packages/capabilities/pricing/src/index.ts");
const contracts = readWorkspaceText("docs/contracts/README.md");
const m3Index = readWorkspaceText("docs/evidence/M3/README.md");
const m3Evidence = readWorkspaceText(
  "docs/evidence/M3/M3-05-pricing-capability-and-quote-record-contract.md",
  "optional"
);
const pricing = await importTypescriptModule(
  "packages/capabilities/pricing/src/index.ts"
);
const db = await importTypescriptModule("packages/db/src/m3-ai-contracts.ts");

const ORG_UUID = "11111111-1111-4111-8111-111111111111";
const TENANT_UUID = "22222222-2222-4222-8222-222222222222";
const QUOTE_UUID = "55555555-5555-4555-8555-555555555555";
const CONVERSATION_UUID = "99999999-9999-4999-8999-999999999999";
const CONFIG_VERSION_UUID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("M3-05 pricing capability and quote record contract", () => {
  it("exports a pure pricing contract without DB, LLM, provider, or sibling capability imports", () => {
    assert.equal(pricing.packageName, "@uzmax/capability-pricing");
    assert.equal(typeof pricing.createPricingQuote, "function");
    assert.equal(typeof pricing.createQuoteRecordDraft, "function");
    assert.deepEqual(pricing.pricingQuoteSources, { code: "code" });
    assert.deepEqual(pricing.pricingParameterSources, {
      llmParameterCandidate: "llm_parameter_candidate",
      operatorStructured: "operator_structured",
      systemStructured: "system_structured"
    });
    assert.doesNotMatch(pricingSource, /@uzmax\/db|@uzmax\/llm-gateway|process\.env/i);
    assert.doesNotMatch(
      pricingSource,
      /from ["'][^"']*capabilities\/(?!pricing)|@uzmax\/capability-(?!pricing)/
    );
  });

  it("calculates a deterministic code-sourced quote from structured parameter candidates", () => {
    const quote = pricing.createPricingQuote({
      config: syntheticConfig(),
      now: "2026-06-19T10:00:00.000Z",
      parameters: {
        billableWeightGrams: 2500,
        inputRef: "controlled://pricing/input/quote-001",
        laneKey: "standard",
        parameterSource: "llm_parameter_candidate",
        serviceKey: "parcel"
      }
    });

    assert.equal(quote.source, "code");
    assert.equal(quote.currency, "USD");
    assert.equal(quote.totalMinorUnits, 1450);
    assert.equal(quote.validUntil, "2026-06-20T10:00:00.000Z");
    assert.equal(quote.configVersionId, CONFIG_VERSION_UUID);
    assert.deepEqual(quote.inputRef, {
      billableWeightGrams: 2500,
      laneKey: "standard",
      parameterSource: "llm_parameter_candidate",
      ref: "controlled://pricing/input/quote-001",
      serviceKey: "parcel"
    });
    assert.deepEqual(quote.result.lineItems, [
      {
        amountMinorUnits: 700,
        code: "base",
        ref: "controlled://pricing/rate/base"
      },
      {
        amountMinorUnits: 750,
        code: "weight",
        quantity: 3,
        ref: "controlled://pricing/rate/weight"
      }
    ]);
    assert.doesNotMatch(
      JSON.stringify(quote),
      /cost|profit|margin|threshold|internal/i
    );
  });

  it("creates an M3-01 compatible quote_record draft with code source and config provenance", () => {
    const quote = pricing.createPricingQuote({
      config: syntheticConfig({ configVersionId: undefined }),
      now: "2026-06-19T10:00:00.000Z",
      parameters: {
        billableWeightGrams: 1000,
        inputRef: "controlled://pricing/input/quote-002",
        laneKey: "standard",
        parameterSource: "operator_structured",
        serviceKey: "parcel"
      }
    });
    const draft = pricing.createQuoteRecordDraft({
      conversationId: CONVERSATION_UUID,
      orgId: ORG_UUID,
      quote,
      quoteId: QUOTE_UUID,
      tenantId: TENANT_UUID
    });
    const contract = db.createQuoteRecordContract(draft);

    assert.equal(draft.source, "code");
    assert.equal(draft.status, "created");
    assert.equal(draft.currency, "USD");
    assert.equal(draft.totalMinorUnits, 950);
    assert.equal(draft.configVersionRef, "controlled://pricing/config/demo:v1");
    assert.equal(contract.source, "code");
    assert.equal(contract.status, "created");
    assert.equal(contract.totalMinorUnits, 950);
    assert.deepEqual(contract.result, quote.result);
    assert.deepEqual(contract.inputRef, quote.inputRef);
  });

  it("fails closed when LLM supplies price math or tries to become quote source", () => {
    for (const forbidden of [
      { totalMinorUnits: 1200 },
      { calculatedTotalMinorUnits: 1200 },
      { finalPriceMinorUnits: 1200 },
      { llmPriceMinorUnits: 1200 },
      { source: "llm" }
    ]) {
      assert.throws(
        () =>
          pricing.createPricingQuote({
            config: syntheticConfig(),
            parameters: {
              billableWeightGrams: 1000,
              inputRef: "controlled://pricing/input/quote-003",
              laneKey: "standard",
              parameterSource: "llm_parameter_candidate",
              serviceKey: "parcel",
              ...forbidden
            }
          }),
        /LLM price math is not accepted|quote source must be code/
      );
    }
  });

  it("rejects unsafe money, missing provenance, missing currency, and unknown lane or service", () => {
    for (const value of [-1, 1.2, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(
        () =>
          pricing.createPricingQuote({
            config: syntheticConfig({ baseMinorUnits: value }),
            parameters: validParameters()
          }),
        /baseMinorUnits must be a non-negative integer/
      );
    }

    assert.throws(
      () =>
        pricing.createPricingQuote({
          config: syntheticConfig({
            configVersionId: undefined,
            configVersionRef: undefined
          }),
          parameters: validParameters()
        }),
      /pricing config provenance requires configVersionId or configVersionRef/
    );
    assert.throws(
      () =>
        pricing.createPricingQuote({
          config: syntheticConfig({ currency: "" }),
          parameters: validParameters()
        }),
      /pricing currency is required/
    );
    assert.throws(
      () =>
        pricing.createPricingQuote({
          config: syntheticConfig(),
          parameters: { ...validParameters(), laneKey: "unknown" }
        }),
      /pricing lane is unknown/
    );
    assert.throws(
      () =>
        pricing.createPricingQuote({
          config: syntheticConfig(),
          parameters: { ...validParameters(), serviceKey: "unknown" }
        }),
      /pricing service is unknown/
    );
    assert.throws(
      () =>
        pricing.createPricingQuote({
          config: syntheticConfig({ internalCostMinorUnits: 100 }),
          parameters: validParameters()
        }),
      /pricing service must not include internal pricing fields/
    );
  });

  it("documents M3-05 as foundation-only F-04 evidence without raw samples or production release", () => {
    assert.match(contracts, /M3 Pricing Capability And Quote Record Contract/);
    assert.match(contracts, /LLM parameter candidates/);
    assert.match(contracts, /quote_record draft/);
    assert.match(m3Index, /M3-05-pricing-capability-and-quote-record-contract/);
    assert.match(m3Index, /F-04/);
    assert.match(m3Evidence, /foundation-only/i);
    assert.match(m3Evidence, /No raw samples/i);
    assert.match(m3Evidence, /no production/i);
    assert.doesNotMatch(m3Evidence, /F-04\s*\|\s*closed/i);
  });
});

function validParameters() {
  return {
    billableWeightGrams: 1000,
    inputRef: "controlled://pricing/input/quote-valid",
    laneKey: "standard",
    parameterSource: "llm_parameter_candidate",
    serviceKey: "parcel"
  };
}

function syntheticConfig(overrides = {}) {
  const service = {
    baseMinorUnits: overrides.baseMinorUnits ?? 700,
    ...(overrides.internalCostMinorUnits === undefined
      ? {}
      : { internalCostMinorUnits: overrides.internalCostMinorUnits }),
    minTotalMinorUnits: overrides.minTotalMinorUnits ?? 0,
    perKgMinorUnits: overrides.perKgMinorUnits ?? 250,
    serviceKey: "parcel"
  };

  return {
    configVersionId:
      "configVersionId" in overrides ? overrides.configVersionId : CONFIG_VERSION_UUID,
    configVersionRef:
      "configVersionRef" in overrides
        ? overrides.configVersionRef
        : "controlled://pricing/config/demo:v1",
    currency: "currency" in overrides ? overrides.currency : "USD",
    lanes: [
      {
        laneKey: "standard",
        rateRefs: {
          base: "controlled://pricing/rate/base",
          weight: "controlled://pricing/rate/weight"
        },
        services: [service]
      }
    ],
    quoteTtlSeconds: 86_400
  };
}

function readWorkspaceText(relativePath, mode = "required") {
  const absolutePath = path.resolve(root, relativePath);
  if (mode === "optional" && !existsSync(absolutePath)) return "";
  return readFileSync(absolutePath, "utf8");
}

async function importTypescriptModule(relativePath) {
  const compilerOptions = {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  };
  const { outputText } = ts.transpileModule(readWorkspaceText(relativePath), {
    compilerOptions,
    fileName: relativePath
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}

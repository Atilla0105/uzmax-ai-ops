import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import ts from "typescript";

const repoRoot = process.cwd();
const tsCompilerOptions = {
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2023
};
const gatewaySource = read("packages/llm-gateway/src/index.ts");
const contracts = read("docs/contracts/README.md");
const evals = read("docs/evals/README.md");
const m3Evidence = read("docs/evidence/M3/README.md");
const gateway = await importTypescriptSource("packages/llm-gateway/src/index.ts");
const db = await importTypescriptSource("packages/db/src/m3-ai-contracts.ts");

const expectedTaskValues = Object.values(db.llmTasks).sort();
const safeHash = `sha256:${"a".repeat(64)}`;

describe("M3-02 LLM gateway routing and accounting foundation", () => {
  it("exports the M3 task and status constants without provider SDK surface", () => {
    assert.deepEqual(Object.values(gateway.llmGatewayTasks).sort(), expectedTaskValues);
    assert.deepEqual(gateway.llmGatewayCallStatuses, {
      failed: "failed",
      fallback: "fallback",
      succeeded: "succeeded"
    });
    assert.equal(gateway.llmGatewayEvalGateStatuses.blocked, "blocked");
    assert.equal(gateway.taskSafetyProfiles.kb_answer.customerVisible, true);
    assert.equal(
      gateway.taskSafetyProfiles.draft_reply.requiresRedactionMetadata,
      true
    );
    assert.doesNotMatch(gatewaySource, /from ["']\.\.\/\.\.\/db|@uzmax\/db/);
    assert.doesNotMatch(
      gatewaySource,
      /openai|anthropic|gemini|api[_-]?key|process\.env/i
    );
  });

  it("validates route config providers, budgets, task, and eval gate metadata", () => {
    const route = baseRoute();

    assert.equal(route.task, "kb_answer");
    assert.equal(route.evalGate.lastStatus, "pending");
    // prettier-ignore
    const invalidRoutes = [
      [{ primaryProviderRef: "mock:missing", providerRefs: ["mock:fallback"] }, /primaryProviderRef must reference a known provider/],
      [{ task: "unknown_task" }, /task is invalid/],
      [{ timeoutMs: 0 }, /timeoutMs must be a positive integer/],
      [{ outputTokenBudget: 100, totalTokenBudget: 50 }, /totalTokenBudget must be at least inputTokenBudget and outputTokenBudget/],
      [{ evalGate: { gateRef: "eval-gate:m3-02-route", lastStatus: "released" } }, /eval gate status is invalid/],
      [{ providerRefs: ["mock:primary", "mock:primary"] }, /providerRefs must not contain duplicates/],
      [{ fallbackProviderRefs: ["mock:fallback", "mock:fallback"] }, /fallbackProviderRefs must not contain duplicates/],
      [{ fallbackProviderRefs: ["mock:primary"] }, /fallbackProviderRefs must not include primaryProviderRef/]
    ];
    for (const [patch, pattern] of invalidRoutes) {
      assert.throws(
        () => gateway.createLlmRouteConfig({ ...route, ...patch }),
        pattern
      );
    }
  });

  it("tries primary then fallback on failure, timeout, and budget failure", async () => {
    const fallbackCases = [
      {
        mode: "failure",
        provider: mockProvider("mock:primary", {
          failureCode: "deterministic_failure",
          status: "failed"
        })
      },
      {
        mode: "timeout",
        provider: mockProvider("mock:primary", { latencyMs: 251, status: "timeout" })
      },
      {
        mode: "budget",
        provider: mockProvider("mock:primary", {
          costMicros: 901,
          inputTokenCount: 10,
          latencyMs: 25,
          outputTokenCount: 20,
          status: "succeeded"
        })
      }
    ];

    for (const { mode, provider } of fallbackCases) {
      const result = await gateway.invokeLlmRoute({
        input: {
          redactionMetadata: { policy: "m3-02-redacted", truncatedSegments: 1 }
        },
        providers: [
          provider,
          mockProvider("mock:fallback", {
            costMicros: 300,
            inputTokenCount: 40,
            latencyMs: 35,
            outputTokenCount: 50,
            status: "succeeded"
          })
        ],
        route: baseRoute(),
        traceId: `trace-${mode}`
      });

      assert.equal(result.providerId, "mock:fallback");
      assert.equal(result.accountingDraft.status, "fallback");
      assert.equal(result.accountingDraft.task, "kb_answer");
      assert.equal(result.accountingDraft.modelId, "mock:fallback:model");
      assert.equal(result.accountingDraft.routeRef, "route:kb-answer");
      assert.equal(result.accountingDraft.routeVersion, "v1");
      assert.equal(result.accountingDraft.inputTokenCount, 40);
      assert.equal(result.accountingDraft.outputTokenCount, 50);
      assert.equal(result.accountingDraft.totalTokenCount, 90);
      assert.equal(result.accountingDraft.costMicros, 300);
      assert.equal(result.accountingDraft.latencyMs, 35);
      assert.equal(result.accountingDraft.traceId, `trace-${mode}`);
      assert.equal(result.accountingDraft.fallbackSummary.reason, mode);
      assert.equal(result.attempts[0].providerId, "mock:primary");
      assert.equal(result.attempts[1].providerId, "mock:fallback");
      assert.equal(result.attemptAccountingDrafts[0].status, "failed");
      assertNoRawPromptOrCompletion(result.accountingDraft);
    }
  });

  it("records failed accounting when all providers fail without exposing raw content", async () => {
    const result = await gateway.invokeLlmRoute({
      input: {
        redactionMetadata: { policy: "m3-02-redacted", truncatedSegments: 0 }
      },
      providers: [
        mockProvider("mock:primary", {
          failureCode: "primary_down",
          latencyMs: 20,
          status: "failed"
        }),
        mockProvider("mock:fallback", {
          failureCode: "fallback_down",
          latencyMs: 30,
          status: "failed"
        })
      ],
      route: baseRoute(),
      traceId: "trace-all-failed"
    });

    assert.equal(result.status, "failed");
    assert.equal(result.accountingDraft.status, "failed");
    assert.equal(result.accountingDraft.providerId, "mock:fallback");
    assert.equal(result.accountingDraft.costMicros, 0);
    assert.equal(result.accountingDraft.totalTokenCount, 0);
    assert.equal(result.accountingDraft.fallbackSummary.attemptedProviders.length, 2);
    assertNoRawPromptOrCompletion(result.accountingDraft);
  });

  it("falls back on wall-clock timeout and thrown provider errors", async () => {
    for (const [mode, provider] of [
      ["wall_clock_timeout", delayedProvider("mock:primary", 30)],
      ["never_resolved_timeout", hangingProvider("mock:primary")],
      ["provider_exception", throwingProvider("mock:primary")],
      ["sync_provider_exception", throwingProvider("mock:primary", true)]
    ]) {
      const result = await gateway.invokeLlmRoute({
        input: safeInput(),
        providers: [provider, successProvider("mock:fallback", { latencyMs: 1 })],
        route: baseRoute({ timeoutMs: 5 }),
        traceId: `trace-${mode}`
      });

      assert.equal(result.accountingDraft.status, "fallback");
      assert.equal(result.providerId, "mock:fallback");
      assert.equal(result.attempts[0].providerId, "mock:primary");
      assert.match(result.attempts[0].reason, /timeout|failure/);
      assertNoRawPromptOrCompletion(result.attemptAccountingDrafts[0]);
    }
    await assert.rejects(
      () =>
        gateway.invokeLlmRoute({
          input: safeInput(),
          providers: [successProvider("mock:primary"), successProvider("mock:primary")],
          route: baseRoute({ fallbackProviderRefs: [] }),
          traceId: "trace-duplicate-runtime"
        }),
      /providers must not contain duplicate providerId/
    );
  });

  it("fails closed on missing or invalid success telemetry before budget checks", async () => {
    // prettier-ignore
    const invalidMetrics = [
      ["missing_input", { costMicros: 1, latencyMs: 1, outputTokenCount: 1 }],
      ["negative_output", { costMicros: 1, inputTokenCount: 1, latencyMs: 1, outputTokenCount: -1 }],
      ["nan_cost", { costMicros: Number.NaN, inputTokenCount: 1, latencyMs: 1, outputTokenCount: 1 }],
      ["fractional_latency", { costMicros: 1, inputTokenCount: 1, latencyMs: 1.25, outputTokenCount: 1 }],
      ["semantic_prompt_hash", { costMicros: 1, inputTokenCount: 1, latencyMs: 1, outputTokenCount: 1, promptHash: "sha256:customer_order_phone" }]
    ];

    for (const [mode, metrics] of invalidMetrics) {
      const result = await gateway.invokeLlmRoute({
        input: safeInput(),
        providers: [
          mockProvider("mock:primary", { ...metrics, status: "succeeded" }),
          successProvider("mock:fallback")
        ],
        route: baseRoute(),
        traceId: `trace-${mode}`
      });

      assert.equal(result.accountingDraft.status, "fallback");
      assert.equal(result.attempts[0].reason, "accounting_invalid");
      assert.equal(result.attemptAccountingDrafts[0].costMicros, 0);
    }
  });

  it("enforces customer-visible redaction boundary and rejects internal config fields", async () => {
    await assert.rejects(
      () =>
        gateway.invokeLlmRoute({
          input: { redactionMetadata: { policy: "ok" }, internalConfig: { margin: 1 } },
          providers: [successProvider("mock:primary")],
          route: baseRoute(),
          traceId: "trace-internal-config"
        }),
      /customer-facing tasks must not receive internalConfig/
    );
    await assert.rejects(
      () =>
        gateway.invokeLlmRoute({
          input: { safeRef: "controlled://context/ref" },
          providers: [successProvider("mock:primary")],
          route: baseRoute(),
          traceId: "trace-missing-redaction"
        }),
      /redactionMetadata is required/
    );

    const safe = await gateway.invokeLlmRoute({
      input: {
        redactionMetadata: safeMetadata(),
        safeRef: "controlled://context/ref"
      },
      providers: [successProvider("mock:primary")],
      route: baseRoute({ fallbackProviderRefs: [] }),
      traceId: "trace-safe"
    });
    assert.equal(safe.accountingDraft.status, "succeeded");
    assert.equal(safe.accountingDraft.promptHash, safeHash);
    assert.deepEqual(safe.accountingDraft.redactionMetadata, safeMetadata());
    await assert.rejects(
      () =>
        gateway.invokeLlmRoute({
          input: {
            redactionMetadata: { rawPrompt: "do not copy", status: "redacted" }
          },
          providers: [successProvider("mock:primary")],
          route: baseRoute({ fallbackProviderRefs: [] }),
          traceId: "trace-unsafe-redaction"
        }),
      /metadata key is not allowed/
    );
    for (const [key, value] of [
      ["contextRef", "customer said raw order address and phone"],
      ["policy", "copy the customer prompt into the answer"],
      ["promptHash", "sha256:customer_order_phone"],
      ["redactedSegments", "two"]
    ]) {
      await assert.rejects(() => invokeWithMetadata({ [key]: value }), /metadata/);
    }
  });

  it("documents the gateway foundation without overclaiming eval or production release", () => {
    assert.match(contracts, /M3 LLM Gateway Routing Accounting Foundation/);
    assert.match(contracts, /deterministic mock provider/);
    assert.match(contracts, /accounting draft/);
    assert.match(evals, /M3 LLM Gateway Eval Hook Boundary/);
    assert.match(evals, /metadata only/);
    assert.match(m3Evidence, /M3-02-llm-gateway-routing-accounting-foundation/);
    assert.match(m3Evidence, /no real provider/);
  });
});

function baseRoute(overrides = {}) {
  return gateway.createLlmRouteConfig({
    costMicrosBudget: 900,
    evalGate: { gateRef: "eval-gate:m3-02-route", lastStatus: "pending" },
    fallbackProviderRefs: ["mock:fallback"],
    inputTokenBudget: 100,
    outputTokenBudget: 80,
    primaryProviderRef: "mock:primary",
    providerRefs: ["mock:primary", "mock:fallback"],
    routeRef: "route:kb-answer",
    routeVersion: "v1",
    task: "kb_answer",
    timeoutMs: 250,
    totalTokenBudget: 160,
    ...overrides
  });
}

function successProvider(providerId, resultOverrides = {}) {
  return mockProvider(providerId, {
    costMicros: 250,
    inputTokenCount: 20,
    latencyMs: 20,
    outputTokenCount: 30,
    promptHash: safeHash,
    status: "succeeded",
    ...resultOverrides
  });
}

function mockProvider(providerId, result) {
  return gateway.createMockLlmProvider({
    modelId: `${providerId}:model`,
    providerId,
    result
  });
}

function delayedProvider(providerId, delayMs) {
  return {
    async invoke() {
      await delay(delayMs);
      return {
        costMicros: 1,
        inputTokenCount: 1,
        latencyMs: delayMs,
        outputTokenCount: 1,
        status: "succeeded"
      };
    },
    modelId: `${providerId}:model`,
    providerId
  };
}

function hangingProvider(providerId) {
  return {
    async invoke() {
      return new Promise(() => {});
    },
    modelId: `${providerId}:model`,
    providerId
  };
}

function throwingProvider(providerId, sync = false) {
  const fail = () => {
    throw new Error("raw provider stack should not be copied");
  };
  return {
    invoke: sync ? fail : async () => fail(),
    modelId: `${providerId}:model`,
    providerId
  };
}

function safeInput() {
  return {
    redactionMetadata: { policy: "m3-02-redacted", truncatedSegments: 0 }
  };
}

function safeMetadata() {
  // prettier-ignore
  return { contextRef: "controlled://context/ref-1", policy: "m3-02-redacted", promptHash: safeHash, truncatedSegments: 2 };
}

function invokeWithMetadata(redactionMetadata) {
  return gateway.invokeLlmRoute({
    input: { redactionMetadata },
    providers: [successProvider("mock:primary")],
    route: baseRoute({ fallbackProviderRefs: [] }),
    traceId: "trace-unsafe-metadata-value"
  });
}

function assertNoRawPromptOrCompletion(value) {
  const serialized = JSON.stringify(value);
  assert.doesNotMatch(
    serialized,
    /rawPrompt|promptText|promptBody|promptContent|rawCompletion|completionText|completionBody|completionContent/
  );
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importTypescriptSource(relativePath) {
  const moduleText = ts.transpile(read(relativePath), tsCompilerOptions, relativePath);
  const moduleHref = Buffer.from(moduleText, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${moduleHref}`);
}

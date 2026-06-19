import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

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
    const route = gateway.createLlmRouteConfig({
      costMicrosBudget: 900,
      evalGate: {
        gateRef: "eval-gate:m3-02-route",
        lastStatus: "pending"
      },
      fallbackProviderRefs: ["mock:fallback"],
      inputTokenBudget: 100,
      outputTokenBudget: 80,
      primaryProviderRef: "mock:primary",
      providerRefs: ["mock:primary", "mock:fallback"],
      routeRef: "route:kb-answer",
      routeVersion: "v1",
      task: "kb_answer",
      timeoutMs: 250,
      totalTokenBudget: 160
    });

    assert.equal(route.task, "kb_answer");
    assert.equal(route.evalGate.lastStatus, "pending");
    assert.throws(
      () =>
        gateway.createLlmRouteConfig({
          ...route,
          primaryProviderRef: "mock:missing",
          providerRefs: ["mock:fallback"]
        }),
      /primaryProviderRef must reference a known provider/
    );
    assert.throws(
      () => gateway.createLlmRouteConfig({ ...route, task: "unknown_task" }),
      /task is invalid/
    );
    assert.throws(
      () => gateway.createLlmRouteConfig({ ...route, timeoutMs: 0 }),
      /timeoutMs must be a positive integer/
    );
    assert.throws(
      () =>
        gateway.createLlmRouteConfig({
          ...route,
          outputTokenBudget: 100,
          totalTokenBudget: 50
        }),
      /totalTokenBudget must be at least inputTokenBudget and outputTokenBudget/
    );
    assert.throws(
      () =>
        gateway.createLlmRouteConfig({
          ...route,
          evalGate: { gateRef: "eval-gate:m3-02-route", lastStatus: "released" }
        }),
      /eval gate status is invalid/
    );
  });

  it("tries primary then fallback on failure, timeout, and budget failure", async () => {
    const fallbackCases = [
      {
        mode: "failure",
        provider: gateway.createMockLlmProvider({
          modelId: "mock-model-primary",
          providerId: "mock:primary",
          result: { failureCode: "deterministic_failure", status: "failed" }
        })
      },
      {
        mode: "timeout",
        provider: gateway.createMockLlmProvider({
          modelId: "mock-model-primary",
          providerId: "mock:primary",
          result: { latencyMs: 251, status: "timeout" }
        })
      },
      {
        mode: "budget",
        provider: gateway.createMockLlmProvider({
          modelId: "mock-model-primary",
          providerId: "mock:primary",
          result: {
            costMicros: 901,
            inputTokenCount: 10,
            latencyMs: 25,
            outputTokenCount: 20,
            status: "succeeded"
          }
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
          gateway.createMockLlmProvider({
            modelId: "mock-model-fallback",
            providerId: "mock:fallback",
            result: {
              costMicros: 300,
              inputTokenCount: 40,
              latencyMs: 35,
              outputTokenCount: 50,
              status: "succeeded"
            }
          })
        ],
        route: baseRoute(),
        traceId: `trace-${mode}`
      });

      assert.equal(result.providerId, "mock:fallback");
      assert.equal(result.accountingDraft.status, "fallback");
      assert.equal(result.accountingDraft.task, "kb_answer");
      assert.equal(result.accountingDraft.modelId, "mock-model-fallback");
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
        gateway.createMockLlmProvider({
          modelId: "mock-model-primary",
          providerId: "mock:primary",
          result: { failureCode: "primary_down", latencyMs: 20, status: "failed" }
        }),
        gateway.createMockLlmProvider({
          modelId: "mock-model-fallback",
          providerId: "mock:fallback",
          result: { failureCode: "fallback_down", latencyMs: 30, status: "failed" }
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
        redactionMetadata: { policy: "m3-02-redacted", truncatedSegments: 2 },
        safeRef: "controlled://context/ref"
      },
      providers: [successProvider("mock:primary")],
      route: baseRoute({ fallbackProviderRefs: [] }),
      traceId: "trace-safe"
    });
    assert.equal(safe.accountingDraft.status, "succeeded");
    assert.deepEqual(safe.accountingDraft.redactionMetadata, {
      policy: "m3-02-redacted",
      truncatedSegments: 2
    });
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

function successProvider(providerId) {
  return gateway.createMockLlmProvider({
    modelId: `${providerId}:model`,
    providerId,
    result: {
      costMicros: 250,
      inputTokenCount: 20,
      latencyMs: 20,
      outputTokenCount: 30,
      status: "succeeded"
    }
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

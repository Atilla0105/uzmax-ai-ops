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
const gateway = await importGatewaySource();
const safeHash = `sha256:${"a".repeat(64)}`;

describe("M8-07 DeepSeek provider seam", () => {
  it("builds chat completion requests and returns bounded output text", async () => {
    const requests = [];
    const provider = gateway.createDeepSeekChatProvider({
      apiKey: "redacted-test-key",
      modelId: "deepseek-v4-flash",
      providerId: "provider:deepseek",
      transport: async (request) => {
        requests.push(request);
        return {
          async json() {
            return {
              choices: [{ message: { content: "Salom, qanday yordam beray?" } }],
              usage: {
                completion_tokens: 6,
                prompt_tokens: 14,
                total_tokens: 20
              }
            };
          },
          ok: true,
          status: 200
        };
      }
    });
    const route = gateway.createLlmRouteConfig({
      costMicrosBudget: 1000,
      evalGate: { gateRef: "eval-gate:m8-07-route", lastStatus: "passed" },
      fallbackProviderRefs: [],
      inputTokenBudget: 100,
      outputTokenBudget: 80,
      primaryProviderRef: "provider:deepseek",
      providerRefs: ["provider:deepseek"],
      routeRef: "route:m8-llm-composed-bot",
      routeVersion: "v1",
      task: "kb_answer",
      timeoutMs: 5000,
      totalTokenBudget: 160
    });

    const result = await gateway.invokeLlmRoute({
      input: {
        maxTokens: 80,
        messages: [
          {
            content: "Answer in the customer's language using the supplied KB facts.",
            role: "system"
          },
          {
            content: "Customer asks about cargo delivery timing.",
            role: "user"
          }
        ],
        redactionMetadata: safeMetadata()
      },
      providers: [provider],
      route,
      traceId: "trace-deepseek"
    });

    assert.equal(result.status, "succeeded");
    assert.equal(result.outputText, "Salom, qanday yordam beray?");
    assert.equal(result.accountingDraft.providerId, "provider:deepseek");
    assert.equal(result.accountingDraft.inputTokenCount, 14);
    assert.equal(result.accountingDraft.outputTokenCount, 6);
    assert.match(result.accountingDraft.promptHash, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.accountingDraft.completionHash, /^sha256:[a-f0-9]{64}$/);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "https://api.deepseek.com/chat/completions");
    assert.equal(requests[0].method, "POST");
    assert.equal(requests[0].headers.authorization, "Bearer redacted-test-key");
    assert.deepEqual(requests[0].body, {
      max_tokens: 80,
      messages: [
        {
          content: "Answer in the customer's language using the supplied KB facts.",
          role: "system"
        },
        {
          content: "Customer asks about cargo delivery timing.",
          role: "user"
        }
      ],
      model: "deepseek-v4-flash",
      stream: false,
      thinking: { type: "disabled" }
    });
    assertNoRawPromptOrCompletion(result.accountingDraft);
  });
});

function safeMetadata() {
  return {
    contextRef: "controlled://context/ref-1",
    policy: "m8-07-redacted",
    promptHash: safeHash,
    truncatedSegments: 2
  };
}

function assertNoRawPromptOrCompletion(value) {
  const serialized = JSON.stringify(value);
  assert.doesNotMatch(
    serialized,
    /rawPrompt|promptText|promptBody|promptContent|rawCompletion|completionText|completionBody|completionContent/
  );
}

function importGatewaySource() {
  const gatewaySource = readText("packages/llm-gateway/src/index.ts")
    .replace(
      '"./deepseek-provider.ts"',
      JSON.stringify(tsDataUrl("packages/llm-gateway/src/deepseek-provider.ts"))
    )
    .replace(
      '"./mock-provider.ts"',
      JSON.stringify(tsDataUrl("packages/llm-gateway/src/mock-provider.ts"))
    );
  const transpiled = ts.transpile(
    gatewaySource,
    tsCompilerOptions,
    "packages/llm-gateway/src/index.ts"
  );
  return import(sourceDataUrl(transpiled));
}

function tsDataUrl(relativePath) {
  return sourceDataUrl(
    ts.transpile(readText(relativePath), tsCompilerOptions, relativePath)
  );
}

function sourceDataUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source, "utf8").toString("base64")}`;
}

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

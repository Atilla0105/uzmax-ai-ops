import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

const repoRoot = process.cwd();
const HASH = `sha256:${"a".repeat(64)}`;

export const ORG_ID = "11111111-1111-4111-8111-111111111801";
export const TENANT_ID = "22222222-2222-4222-8222-222222222801";
export const CHANNEL_ID = "44444444-4444-4444-8444-444444444801";

export const channels = await importChannelsSource();
const importedWorkerRuntime = await importWorkerConversationRuntime(
  channels.moduleUrl,
  channels.inboundModuleUrl
);
export const workerRuntime = {
  ...importedWorkerRuntime,
  processTelegramBotConversationJob(payload, gateway, options = {}) {
    return importedWorkerRuntime.processTelegramBotConversationJob(payload, gateway, {
      admissionPolicy: {
        allowedChatExternalRefs: new Set(["telegram:chat:7801"]),
        allowedParticipantExternalRefs: new Set(["telegram:user:8801"])
      },
      ...options
    });
  }
};

const answerRuntime = await importSource(
  "apps/worker/src/telegram-bot-answer-runtime.ts"
);
const kb = await importSource("packages/capabilities/kb/src/index.ts");
const llm = await importSource("packages/llm-gateway/src/index.ts");
const engine = await importSource("packages/engine/src/index.ts");

export function createAnswerRuntime(overrides = {}) {
  const route = llm.createLlmRouteConfig({
    costMicrosBudget: 1000,
    evalGate: { gateRef: "gate:m8-bot-answer", lastStatus: "passed" },
    fallbackProviderRefs: [],
    inputTokenBudget: 256,
    outputTokenBudget: 256,
    primaryProviderRef: "provider_mock",
    providerRefs: ["provider_mock"],
    routeRef: "route:m8-kb-answer",
    routeVersion: "v0",
    task: llm.llmGatewayTasks.kbAnswer,
    timeoutMs: 50,
    totalTokenBudget: 512
  });
  const provider = llm.createMockLlmProvider({
    modelId: "mock-kb",
    providerId: "provider_mock",
    result: {
      completionHash: HASH,
      costMicros: 20,
      inputTokenCount: 12,
      latencyMs: 5,
      outputText: "LLM composed setup answer.",
      outputTokenCount: 9,
      promptHash: HASH,
      status: "succeeded"
    }
  });

  return answerRuntime.createTelegramBotAnswerRuntime({
    answerKbJourneyStage: kb.answerKbJourneyStage,
    guardRedlineOutput: engine.guardRedlineOutput,
    invokeLlmRoute: llm.invokeLlmRoute,
    journey: baseJourney(),
    llmProviders: [provider],
    llmRoute: route,
    locale: "en",
    persona: {
      aiMemberRef: "controlled://ai/member/m8",
      evalGateStatus: "passed",
      personaVersionRef: "controlled://ai/persona/m8-v0"
    },
    ...overrides
  });
}

export function failingLlmProvider() {
  return llm.createMockLlmProvider({
    modelId: "mock-kb",
    providerId: "provider_mock",
    result: { status: "failed" }
  });
}

export function ambiguousJourney() {
  return {
    ...baseJourney(),
    stages: [
      {
        ...baseJourney().stages[0],
        stageKey: "first",
        stageRef: "controlled://kb/stage/first",
        triggers: ["same trigger"]
      },
      {
        ...baseJourney().stages[0],
        stageKey: "second",
        stageRef: "controlled://kb/stage/second",
        triggers: ["same trigger"]
      }
    ]
  };
}

export function redlineJourney() {
  return {
    ...baseJourney(),
    stages: [
      {
        ...baseJourney().stages[0],
        answer: "This answer exposes internal config.",
        triggers: ["setup help"]
      }
    ]
  };
}

export function payloadFor({
  contentKind = "text",
  fileIds,
  providerUpdateId = "8100",
  text = "setup help"
} = {}) {
  return channels.module.createTelegramBotConversationJobPayload({
    channelConnectionId: CHANNEL_ID,
    enqueuedAt: "2026-07-07T09:00:00.000Z",
    orgId: ORG_ID,
    tenantId: TENANT_ID,
    traceId: `trace:m8-${providerUpdateId}`,
    update: {
      chatExternalRef: "telegram:chat:7801",
      chatType: "private",
      contentKind,
      fileIds,
      messageExternalRef: `telegram:message:${providerUpdateId}`,
      participantExternalRef: "telegram:user:8801",
      provider: "telegram_bot",
      providerUpdateId,
      text,
      updateKind: "message"
    }
  });
}

export function createFakeGateway() {
  const reserved = new Set();
  const summaries = new Map();
  const calls = { persist: [], reserve: [] };
  const prepare = async (input) => {
    const key = dedupeKey(input.dedupe);
    if (reserved.has(key)) return deduped(input);
    reserved.add(key);
    calls.reserve.push(input.dedupe);
    const summary = persistSummary(input);
    summaries.set(key, summary);
    calls.persist.push(summary);
    return {
      conversationId: input.conversation.id,
      disposition: input.runtimeBranch === "answer" ? "answer_ready" : "handoff",
      messageId: input.message.id,
      outboundMessageId: input.outboundMessage?.id,
      providerUpdateId: input.dedupe.providerUpdateId,
      runtimeBranch: input.runtimeBranch,
      status: "accepted",
      ticketId: input.ticket?.id,
      traceId: input.traceId
    };
  };
  return {
    calls,
    async claimPreparedAnswer(input) {
      const summary = summaries.get(dedupeKey(input.dedupe));
      summary.messages[1].content = {
        ...summary.messages[1].content,
        dispatchPhase: "claimed",
        text: input.answerText
      };
      summary.ticket = input.followUp?.ticket;
      return {
        claim: "claimed",
        providerUpdateId: input.dedupe.providerUpdateId,
        runtimeBranch: "answer",
        status: "accepted",
        ticketId: summary.ticket?.id,
        traceId: input.traceId,
        outboundMessageId: input.outboundMessageId
      };
    },
    async finalizePreparedAnswer(input) {
      const summary = summaries.get(dedupeKey(input.dedupe));
      summary.messages[1].deliveryStatus =
        input.outcome === "sent"
          ? "SENT"
          : input.outcome === "failed"
            ? "FAILED"
            : "QUEUED";
      if (input.outcome !== "sent") {
        summary.conversationStatus = "PENDING_HANDOFF";
        summary.runtimeBranch = "handoff";
        summary.ticket = input.ticket;
      }
      return {
        providerUpdateId: input.dedupe.providerUpdateId,
        runtimeBranch: input.outcome === "sent" ? "answer" : "handoff",
        status: "accepted",
        ticketId: summary.ticket?.id,
        traceId: input.traceId
      };
    },
    async handoffPreparedAnswer(input) {
      const summary = summaries.get(dedupeKey(input.dedupe));
      summary.conversationStatus = "PENDING_HANDOFF";
      summary.messages = summary.messages.filter(
        ({ direction }) => direction !== "OUTBOUND"
      );
      summary.runtimeBranch = "handoff";
      summary.ticket = input.ticket;
      return {
        providerUpdateId: input.dedupe.providerUpdateId,
        runtimeBranch: "handoff",
        status: "accepted",
        ticketId: input.ticket.id,
        traceId: input.traceId
      };
    },
    persistAcceptedUpdate: prepare,
    prepareAcceptedUpdate: prepare
  };
}

function baseJourney() {
  return {
    defaultLocale: "en",
    journeyKey: "synthetic_setup",
    journeyRef: "controlled://kb/journey/setup",
    stages: [
      {
        answer: "Use the setup card answer.",
        materialRefs: [
          {
            kind: "guide",
            ref: "controlled://kb/material/setup",
            title: "Setup guide"
          }
        ],
        sequence: 1,
        stageKey: "setup",
        stageRef: "controlled://kb/stage/setup",
        steps: ["Open the setup page.", "Follow the bounded checklist."],
        title: "Setup",
        triggers: ["setup help", "setup"]
      }
    ],
    title: "Synthetic setup"
  };
}

function persistSummary(input) {
  return {
    conversationStatus: input.runtimeBranch === "answer" ? "OPEN" : "PENDING_HANDOFF",
    messages:
      input.runtimeBranch === "answer"
        ? [
            { content: input.message.content, direction: "INBOUND" },
            {
              content: input.outboundMessage.content,
              deliveryStatus: input.outboundMessage.deliveryStatus,
              direction: "OUTBOUND"
            }
          ]
        : [{ content: input.message.content, direction: "INBOUND" }],
    runtimeBranch: input.runtimeBranch,
    ticket: input.ticket
  };
}

function deduped(input) {
  return {
    providerUpdateId: input.dedupe.providerUpdateId,
    runtimeBranch: input.runtimeBranch,
    status: "deduped",
    traceId: input.traceId
  };
}

function dedupeKey(input) {
  return [
    input.orgId,
    input.tenantId,
    input.channelConnectionId,
    input.providerUpdateId
  ].join(":");
}

async function importChannelsSource() {
  const inboundModuleUrl = moduleUrlForFixture(
    "packages/channels/src/telegram-bot-inbound-contract.ts"
  );
  const source = sourceOf("packages/channels/src/index.ts").replaceAll(
    "./telegram-bot-inbound-contract.ts",
    inboundModuleUrl
  );
  const moduleUrl = dataModuleUrl(jsFromTs(source));
  return { inboundModuleUrl, module: await import(moduleUrl), moduleUrl };
}

async function importWorkerConversationRuntime(channelsModuleUrl, inboundModuleUrl) {
  const replacements = [
    ["../../../packages/channels/src/index.ts", channelsModuleUrl],
    [
      "../../../packages/channels/src/telegram-bot-inbound-contract.ts",
      inboundModuleUrl
    ],
    [
      "../../../packages/capabilities/handoff/src/index.ts",
      moduleUrlForFixture("packages/capabilities/handoff/src/index.ts")
    ],
    [
      "../../../packages/db/src/index.ts",
      moduleUrlForFixture("packages/db/src/index.ts")
    ],
    [
      "./telegram-bot-answer-runtime.ts",
      moduleUrlForFixture("apps/worker/src/telegram-bot-answer-runtime.ts")
    ],
    [
      "./telegram-bot-ticket-follow-up.ts",
      moduleUrlForFixture("apps/worker/src/telegram-bot-ticket-follow-up.ts")
    ],
    ['import { Worker, type Job, type QueueOptions } from "bullmq";', ""]
  ];
  let flowSource = sourceOf("apps/worker/src/telegram-bot-conversation.flow.ts");
  for (const [needle, value] of replacements) {
    flowSource = flowSource.replace(needle, value);
  }
  const flowModuleUrl = dataModuleUrl(jsFromTs(flowSource));
  let runtimeSource = sourceOf("apps/worker/src/conversation-runtime.ts");
  for (const [needle, value] of replacements) {
    runtimeSource = runtimeSource.replace(needle, value);
  }
  runtimeSource = runtimeSource.replace(
    "./telegram-bot-conversation.flow.ts",
    flowModuleUrl
  );
  return import(dataModuleUrl(jsFromTs(runtimeSource)));
}

async function importSource(relativePath) {
  return import(moduleUrlForFixture(relativePath));
}

export function moduleUrlForFixture(relativePath) {
  return dataModuleUrl(jsFromTs(sourceForFixture(relativePath)));
}

function sourceForFixture(relativePath) {
  let source = sourceOf(relativePath);
  if (relativePath === "packages/llm-gateway/src/index.ts") {
    source = source.replace(
      '"./deepseek-provider.ts"',
      `"${moduleUrlForFixture("packages/llm-gateway/src/deepseek-provider.ts")}"`
    );
    source = source.replace(
      '"./mock-provider.ts"',
      `"${moduleUrlForFixture("packages/llm-gateway/src/mock-provider.ts")}"`
    );
  }
  if (relativePath !== "packages/capabilities/handoff/src/index.ts") {
    source = source.replace(
      "../../../packages/capabilities/handoff/src/index.ts",
      moduleUrlForFixture("packages/capabilities/handoff/src/index.ts")
    );
  }
  return source;
}

export function jsFromTs(sourceText) {
  const result = ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  });
  return result.outputText;
}

export function dataModuleUrl(sourceText) {
  const encoded = Buffer.from(sourceText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

export function sourceOf(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  assert.equal(existsSync(absolutePath), true, `missing ${relativePath}`);
  return readFileSync(absolutePath, "utf8");
}

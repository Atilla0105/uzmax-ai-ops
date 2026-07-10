import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CHANNEL_ID,
  ORG_ID,
  TENANT_ID,
  ambiguousJourney,
  channels,
  createAnswerRuntime,
  createFakeGateway,
  failingLlmProvider,
  payloadFor,
  redlineJourney,
  workerRuntime
} from "./m8-bot-runtime-answer-loop-support.mjs";

describe("M8-01 bot runtime answer loop v0", () => {
  it("builds a Telegram Bot sendMessage adapter request without a real network call", async () => {
    const requests = [];
    const adapter = channels.module.createTelegramBotSendMessageAdapter({
      botToken: "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ123456",
      now: () => new Date("2026-07-07T09:00:05.000Z"),
      async transport(request) {
        requests.push(request);
        return {
          async json() {
            return { ok: true, result: { message_id: 9901 } };
          },
          ok: true,
          status: 200
        };
      }
    });

    const result = await adapter.sendMessage({
      channelConnectionId: CHANNEL_ID,
      chatExternalRef: "telegram:chat:7801",
      idempotencyKey: "telegram-bot-answer__m8__8101",
      orgId: ORG_ID,
      replyToMessageExternalRef: "telegram:message:8101",
      tenantId: TENANT_ID,
      text: "Use the setup card answer.",
      traceId: "trace:m8-send"
    });

    assert.equal(requests.length, 1);
    assert.equal(
      requests[0].url,
      "https://api.telegram.org/bot1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ123456/sendMessage"
    );
    assert.deepEqual(requests[0].body, {
      chat_id: "7801",
      reply_parameters: { message_id: 8101 },
      text: "Use the setup card answer."
    });
    assert.equal(result.dryRun, false);
    assert.equal(result.providerMessageRef, "telegram:message:9901");
    assert.equal(result.status, "SENT");
  });

  it("answers synthetic Bot text through LLM-composed KB context", async () => {
    const gateway = createFakeGateway();
    let llmCalls = 0;
    const sendCalls = [];
    const sendPort = {
      async sendMessage(request) {
        sendCalls.push(request);
        return dryRunResult(request, {
          sentAt: "2026-07-07T09:00:03.000Z"
        });
      }
    };

    const result = await workerRuntime.processTelegramBotConversationJob(
      payloadFor({ providerUpdateId: "8101", text: "setup help" }),
      gateway,
      {
        answerRuntime: createAnswerRuntime({
          async invokeLlmRoute() {
            llmCalls += 1;
            return {
              outputText: "LLM composed setup answer.",
              providerId: "provider_mock",
              status: "succeeded"
            };
          }
        }),
        sendPort
      }
    );

    const persisted = gateway.calls.persist[0];
    assert.equal(result.status, "accepted");
    assert.equal(result.runtimeBranch, "answer");
    assert.equal(gateway.calls.reserve.length, 1);
    assert.equal(llmCalls, 1);
    assert.equal(sendCalls.length, 1);
    assert.equal(persisted.runtimeBranch, "answer");
    assert.equal(persisted.conversationStatus, "OPEN");
    assert.equal(persisted.messages.length, 2);
    assert.equal(persisted.messages[0].direction, "INBOUND");
    assert.equal(persisted.messages[0].content.textLength, 10);
    assert.equal(persisted.messages[0].content.text, "setup help");
    assert.equal(persisted.messages[1].direction, "OUTBOUND");
    assert.equal(persisted.messages[1].deliveryStatus, "SENT");
    assert.equal(persisted.messages[1].content.text, "LLM composed setup answer.");
    assert.equal(persisted.ticket, undefined);
  });

  it("rejects unapproved or non-private injected jobs before business side effects", async () => {
    const cases = [
      { chatExternalRef: "telegram:chat:7999", providerUpdateId: "reject-chat" },
      {
        participantExternalRef: "telegram:user:8999",
        providerUpdateId: "reject-participant"
      },
      { chatType: "group", providerUpdateId: "reject-group" }
    ];
    for (const input of cases) {
      const gateway = createFakeGateway();
      let answerCalls = 0;
      const sendCalls = [];
      const result = await workerRuntime.processTelegramBotConversationJob(
        { ...payloadFor({ providerUpdateId: input.providerUpdateId }), ...input },
        gateway,
        {
          admissionPolicy: {
            allowedChatExternalRefs: new Set(["telegram:chat:7801"]),
            allowedParticipantExternalRefs: new Set(["telegram:user:8801"])
          },
          answerRuntime: {
            async answer() {
              answerCalls += 1;
              return { answerText: "must not happen", status: "answered" };
            }
          },
          sendPort: {
            async sendMessage(request) {
              sendCalls.push(request);
              return dryRunResult(request);
            }
          }
        }
      );
      assert.equal(result.status, "rejected");
      assert.equal(gateway.calls.reserve.length, 0);
      assert.equal(gateway.calls.persist.length, 0);
      assert.equal(answerCalls, 0);
      assert.equal(sendCalls.length, 0);
    }
  });

  it("rejects untrusted injected-job telemetry refs and dates before persistence", async () => {
    const invalidFields = [
      { traceId: "raw secret text" },
      { providerUpdateId: "raw secret text" },
      { updateKind: "injected" },
      { occurredAt: "not-a-date" }
    ];
    for (const [index, invalid] of invalidFields.entries()) {
      const gateway = createFakeGateway();
      await assert.rejects(
        () =>
          workerRuntime.processTelegramBotConversationJob(
            { ...payloadFor({ providerUpdateId: `83${index}0` }), ...invalid },
            gateway
          ),
        /telegram bot conversation job/
      );
      assert.equal(gateway.calls.reserve.length, 0);
      assert.equal(gateway.calls.persist.length, 0);
    }
  });

  it("answers KB gaps through LLM and persists a follow-up ticket", async () => {
    const cases = [
      {
        name: "kb not found",
        payload: payloadFor({ providerUpdateId: "8202", text: "unknown topic" }),
        runtime: createAnswerRuntime()
      },
      {
        name: "kb ambiguous",
        payload: payloadFor({ providerUpdateId: "8203", text: "same trigger" }),
        runtime: createAnswerRuntime({ journey: ambiguousJourney() })
      }
    ];

    for (const { name, payload, runtime } of cases) {
      const gateway = createFakeGateway();
      const sendCalls = [];
      const result = await workerRuntime.processTelegramBotConversationJob(
        payload,
        gateway,
        {
          answerRuntime: runtime,
          sendPort: {
            async sendMessage(request) {
              sendCalls.push(request);
              return dryRunResult(request);
            }
          }
        }
      );

      const persisted = gateway.calls.persist[0];
      assert.equal(result.status, "accepted", name);
      assert.equal(result.runtimeBranch, "answer", name);
      assert.equal(result.ticketId, persisted.ticket.id, name);
      assert.equal(sendCalls.length, 1, name);
      assert.equal(persisted.runtimeBranch, "answer", name);
      assert.equal(persisted.conversationStatus, "OPEN", name);
      assert.equal(persisted.messages.length, 2, name);
      assert.equal(persisted.messages[1].direction, "OUTBOUND", name);
      assert.equal(persisted.messages[1].content.text, "LLM composed setup answer.");
      assert.match(persisted.ticket.summary, /telegram_bot_text_kb_/);
    }
  });

  it("dedupes repeated text updates before answer runtime or send side effects", async () => {
    const gateway = createFakeGateway();
    let answerCalls = 0;
    const sendCalls = [];
    const answerRuntime = {
      async answer() {
        answerCalls += 1;
        return { answerText: "First send only.", status: "answered" };
      }
    };
    const sendPort = {
      async sendMessage(request) {
        sendCalls.push(request);
        return dryRunResult(request);
      }
    };
    const payload = payloadFor({ providerUpdateId: "8102", text: "setup help" });

    const first = await workerRuntime.processTelegramBotConversationJob(
      payload,
      gateway,
      { answerRuntime, sendPort }
    );
    const duplicate = await workerRuntime.processTelegramBotConversationJob(
      payload,
      gateway,
      { answerRuntime, sendPort }
    );

    assert.equal(first.status, "accepted");
    assert.equal(duplicate.status, "deduped");
    assert.equal(answerCalls, 1);
    assert.equal(sendCalls.length, 1);
    assert.equal(gateway.calls.persist.length, 1);
  });

  it("keeps non-text messages on handoff path and suppresses outbound", async () => {
    const gateway = createFakeGateway();
    let answerCalls = 0;
    const sendCalls = [];

    const result = await workerRuntime.processTelegramBotConversationJob(
      payloadFor({
        contentKind: "image",
        fileIds: ["synthetic-file-id"],
        providerUpdateId: "8103",
        text: undefined
      }),
      gateway,
      {
        answerRuntime: {
          async answer() {
            answerCalls += 1;
            return { answerText: "must not happen", status: "answered" };
          }
        },
        sendPort: {
          async sendMessage(request) {
            sendCalls.push(request);
            return dryRunResult(request);
          }
        }
      }
    );

    assert.equal(result.status, "accepted");
    assert.equal(result.runtimeBranch, "handoff");
    assert.equal(answerCalls, 0);
    assert.equal(sendCalls.length, 0);
    assert.equal(gateway.calls.persist[0].runtimeBranch, "handoff");
    assert.match(gateway.calls.persist[0].ticket.summary, /telegram_bot_image/);
  });

  it("fails closed to handoff without outbound for unsafe answer decisions", async () => {
    const cases = [
      ["missing kb", "missing_kb", createAnswerRuntime({ journey: undefined })],
      [
        "missing persona",
        "missing_persona",
        createAnswerRuntime({ persona: undefined })
      ],
      [
        "provider failure",
        "provider_failure",
        createAnswerRuntime({ llmProviders: [failingLlmProvider()] }),
        payloadFor({ providerUpdateId: "8205", text: "unknown topic" })
      ],
      [
        "redline suppressed",
        "redline_output_suppressed",
        createAnswerRuntime({
          async invokeLlmRoute() {
            return {
              outputText: "This answer exposes internal config.",
              providerId: "provider_mock",
              status: "succeeded"
            };
          },
          journey: redlineJourney()
        })
      ],
      [
        "answer runtime throws",
        "answer_runtime_error",
        {
          async answer() {
            throw new Error("synthetic runtime failure");
          }
        }
      ]
    ];

    for (const [name, reason, runtime, payload] of cases) {
      const gateway = createFakeGateway();
      const sendCalls = [];
      const result = await workerRuntime.processTelegramBotConversationJob(
        payload ?? payloadFor({ providerUpdateId: name.replaceAll(" ", "-") }),
        gateway,
        {
          answerRuntime: runtime,
          sendPort: {
            async sendMessage(request) {
              sendCalls.push(request);
              return dryRunResult(request);
            }
          }
        }
      );

      assert.equal(result.status, "accepted", name);
      assert.equal(result.runtimeBranch, "handoff", name);
      assert.equal(sendCalls.length, 0, name);
      assert.equal(gateway.calls.persist[0].runtimeBranch, "handoff", name);
      assert.match(gateway.calls.persist[0].ticket.summary, new RegExp(reason));
    }
  });
});

function dryRunResult(request, input = {}) {
  return {
    dryRun: true,
    provider: "telegram_bot",
    providerMessageRef:
      input.providerMessageRef ?? `dry-run:telegram-bot:${request.idempotencyKey}`,
    requestId: input.requestId ?? request.idempotencyKey,
    sentAt: input.sentAt ?? "2026-07-07T09:00:00.000Z",
    status: input.status ?? "SENT",
    traceId: request.traceId
  };
}

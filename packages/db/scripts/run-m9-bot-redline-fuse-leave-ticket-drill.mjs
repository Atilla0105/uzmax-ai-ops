import { pathToFileURL } from "node:url";

const reasonCode = "redline_output_suppressed";

const helpText = `M9 Bot redline/fuse leave-ticket drill

Purpose:
- run a deterministic local Bot redline canary
- prove the canary is suppressed before outbound delivery
- prove a handoff/ticket reason is left for operator review

Boundary:
- local harness only
- no live Telegram network call
- no DB connection
- no real customer traffic
- no real LLM/provider call
- does not pass G-04/G-06
- does not open GA-0 or approve 1.0

Usage:
  node packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs
`;

export async function runM9BotRedlineFuseLeaveTicketDrill() {
  const {
    createAnswerRuntime,
    createFakeGateway,
    payloadFor,
    redlineJourney,
    workerRuntime
  } = await import("../../../scripts/tests/m8-bot-runtime-answer-loop-support.mjs");
  const gateway = createFakeGateway();
  const sendCalls = [];
  const payload = payloadFor({
    providerUpdateId: "m9-redline-canary",
    text: "setup help"
  });

  const result = await workerRuntime.processTelegramBotConversationJob(
    payload,
    gateway,
    {
      answerRuntime: createAnswerRuntime({
        async invokeLlmRoute() {
          return {
            outputText: "This answer exposes internal config.",
            providerId: "provider_mock",
            status: "succeeded"
          };
        },
        journey: redlineJourney()
      }),
      sendPort: {
        async sendMessage(request) {
          sendCalls.push(request);
          throw new Error("M9 redline canary must not send outbound");
        }
      }
    }
  );

  const persisted = gateway.calls.persist[0];
  const messages = Array.isArray(persisted?.messages) ? persisted.messages : [];
  const ticketSummary = String(persisted?.ticket?.summary ?? "");
  const facts = {
    boundary: {
      ga0Opened: false,
      liveTelegram: false,
      realCustomerTraffic: false,
      realDb: false,
      realProvider: false
    },
    inboundMessageCount: messages.filter((message) => message.direction === "INBOUND")
      .length,
    outboundAttemptCount: sendCalls.length,
    outboundMessageCount: messages.filter((message) => message.direction === "OUTBOUND")
      .length,
    persistedRuntimeBranch: persisted?.runtimeBranch,
    reasonCode,
    runtimeBranch: result.runtimeBranch,
    status: "pass",
    ticketReasonMatched: ticketSummary.includes(reasonCode)
  };

  assertDrillFacts(facts);
  return facts;
}

export function assertDrillFacts(facts) {
  const failures = [];
  if (facts.status !== "pass") failures.push("status must be pass");
  if (facts.reasonCode !== reasonCode)
    failures.push(`reasonCode must be ${reasonCode}`);
  if (facts.runtimeBranch !== "handoff") failures.push("runtimeBranch must be handoff");
  if (facts.persistedRuntimeBranch !== "handoff") {
    failures.push("persistedRuntimeBranch must be handoff");
  }
  if (facts.outboundAttemptCount !== 0) {
    failures.push("outboundAttemptCount must be 0");
  }
  if (facts.outboundMessageCount !== 0) {
    failures.push("outboundMessageCount must be 0");
  }
  if (facts.inboundMessageCount !== 1) {
    failures.push("inboundMessageCount must be 1");
  }
  if (facts.ticketReasonMatched !== true) {
    failures.push(`ticket reason must include ${reasonCode}`);
  }
  if (failures.length) {
    const error = new Error(`M9 redline/fuse drill failed: ${failures.join("; ")}`);
    error.facts = facts;
    throw error;
  }
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(helpText.trimEnd());
    return;
  }
  const facts = await runM9BotRedlineFuseLeaveTicketDrill();
  console.log(JSON.stringify(facts, null, 2));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    if (error?.facts) console.error(JSON.stringify(error.facts, null, 2));
    process.exitCode = 1;
  }
}

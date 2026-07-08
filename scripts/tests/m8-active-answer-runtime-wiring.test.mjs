import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dataModuleUrl,
  jsFromTs,
  moduleUrlForFixture,
  sourceOf
} from "./m8-bot-runtime-answer-loop-support.mjs";

const ORG_ID = "11111111-1111-4111-8111-111111111803";
const TENANT_ID = "22222222-2222-4222-8222-222222222803";
const CHANNEL_ID = "44444444-4444-4444-8444-444444444803";
const MEMBER_ID = "55555555-5555-4555-8555-555555555803";
const VERSION_ID = "66666666-6666-4666-8666-666666666803";
const GATE_ID = "77777777-7777-4777-8777-777777777803";
const KB_ID = "88888888-8888-4888-8888-888888888803";
const STAGE_ID = "99999999-9999-4999-8999-999999999803";

const runtimeModule = await importActiveRuntime();

describe("M8-03 active answer runtime wiring", () => {
  it("answers from active AI member and active KB through LLM-composed text", async () => {
    const prisma = fakePrisma();
    const runtime = runtimeModule.createDbBackedTelegramBotAnswerRuntime({
      aiMemberKey: "support_bot",
      kbEntryKey: "setup",
      locale: "en",
      prisma,
      requiredCapabilityKey: "TUTORIAL"
    });

    const result = await runtime.answer(requestFor("setup help"));

    assert.equal(result.status, "answered");
    assert.equal(result.answerText, "LLM composed active KB answer.");
    assert.equal(prisma.calls.transactions.length, 5);
    assert.deepEqual(prisma.calls.rlsSettings.slice(0, 2), [
      ["app.org_id", ORG_ID],
      ["app.tenant_id", TENANT_ID]
    ]);
  });

  it("uses LLM-composed text when active KB misses", async () => {
    const runtime = runtimeModule.createDbBackedTelegramBotAnswerRuntime({
      aiMemberKey: "support_bot",
      kbEntryKey: "setup",
      prisma: fakePrisma()
    });

    const result = await runtime.answer(requestFor("unknown topic"));

    assert.deepEqual(result, {
      answerText: "LLM composed active KB answer.",
      followUp: {
        reasonCode: "kb_stage_not_found"
      },
      status: "answered"
    });
  });

  it("requires passed eval gate and enabled capability before answering", async () => {
    const failedGate = fakePrisma({
      evalGates: [{ ...baseRows().evalGates[0], status: "FAILED" }]
    });
    const disabledCapability = fakePrisma({
      aiCapabilityToggles: [{ ...baseRows().aiCapabilityToggles[0], enabled: false }]
    });

    assert.equal(
      (
        await runtimeModule
          .createDbBackedTelegramBotAnswerRuntime({
            aiMemberKey: "support_bot",
            kbEntryKey: "setup",
            prisma: failedGate
          })
          .answer(requestFor("setup help"))
      ).reasonCode,
      "persona_eval_gate_not_passed"
    );
    assert.equal(
      (
        await runtimeModule
          .createDbBackedTelegramBotAnswerRuntime({
            aiMemberKey: "support_bot",
            kbEntryKey: "setup",
            prisma: disabledCapability
          })
          .answer(requestFor("setup help"))
      ).reasonCode,
      "capability_disabled"
    );
  });

  it("documents the service shell hook from worker startup into runtime options", () => {
    const ci = sourceOf(".github/workflows/ci.yml");
    const workerShell = sourceOf("apps/worker/src/worker-service-shell.ts");
    const helper = sourceOf("apps/worker/src/telegram-bot-worker-service-runtime.ts");
    const runtime = sourceOf("apps/worker/src/conversation-runtime.ts");

    assert.match(ci, /M8 active answer worker true DB smoke/);
    assert.match(ci, /run-m8-active-answer-worker-true-db-smoke\.mjs/);
    assert.match(workerShell, /createTelegramBotConversationRuntimeOptions/);
    assert.match(workerShell, /UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE/);
    assert.match(helper, /createDbBackedTelegramBotAnswerRuntime/);
    assert.match(helper, /createTelegramBotSendMessageAdapter/);
    assert.match(helper, /worker\.telegram_bot\.outbound\.dry_run/);
    assert.match(
      runtime,
      /processTelegramBotConversationJob\(job\.data, gateway, options\)/
    );
  });
});

function requestFor(text) {
  return {
    channelConnectionId: CHANNEL_ID,
    chatExternalRef: "telegram:chat:7803",
    orgId: ORG_ID,
    providerUpdateId: `m8-03-${text.replaceAll(" ", "-")}`,
    tenantId: TENANT_ID,
    text,
    traceId: `trace:m8-03:${text.replaceAll(" ", "-")}`
  };
}

function fakePrisma(overrides = {}) {
  const rows = { ...baseRows(), ...overrides };
  const calls = { rlsSettings: [], transactions: [] };
  return {
    calls,
    $executeRawUnsafe: async (sql) => ({ kind: "role", sql }),
    $queryRaw: async (strings, key, value) => {
      calls.rlsSettings.push([key, value]);
      return { key, kind: "setting", sql: strings.join("?"), value };
    },
    $transaction: async (operations) => {
      const result = await Promise.all(operations);
      calls.transactions.push(result);
      return result;
    },
    aiCapabilityToggle: delegate(rows.aiCapabilityToggles),
    aiMember: delegate(rows.aiMembers),
    aiMemberVersion: delegate(rows.aiMemberVersions),
    evalGate: delegate(rows.evalGates),
    kbRecord: delegate(rows.kbRecords),
    kbStage: delegate(rows.kbStages)
  };
}

function delegate(rows) {
  return {
    async findFirst(input) {
      return (
        sorted(
          rows.filter((row) => matchesWhere(row, input.where)),
          input
        )[0] ?? null
      );
    },
    async findMany(input) {
      return sorted(
        rows.filter((row) => matchesWhere(row, input.where)),
        input
      );
    }
  };
}

function matchesWhere(row, where = {}) {
  return Object.entries(where).every(([key, value]) => row[key] === value);
}

function sorted(rows, input) {
  const orderBy = input.orderBy;
  if (!orderBy) return rows;
  const [[key, direction]] = Object.entries(orderBy);
  return [...rows].sort((left, right) => {
    const factor = direction === "desc" ? -1 : 1;
    return left[key] > right[key] ? factor : -factor;
  });
}

function baseRows() {
  return {
    aiCapabilityToggles: [
      {
        aiMemberId: MEMBER_ID,
        capabilityKey: "TUTORIAL",
        enabled: true,
        orgId: ORG_ID,
        tenantId: TENANT_ID
      }
    ],
    aiMemberVersions: [
      {
        aiMemberId: MEMBER_ID,
        evalGateId: GATE_ID,
        id: VERSION_ID,
        orgId: ORG_ID,
        personaRef: "manifest://ai-member/support-bot/persona",
        status: "ACTIVE",
        tenantId: TENANT_ID
      }
    ],
    aiMembers: [
      {
        activeVersionId: VERSION_ID,
        id: MEMBER_ID,
        memberKey: "support_bot",
        orgId: ORG_ID,
        status: "ONLINE",
        tenantId: TENANT_ID
      }
    ],
    evalGates: [
      {
        id: GATE_ID,
        orgId: ORG_ID,
        status: "PASSED",
        tenantId: TENANT_ID
      }
    ],
    kbRecords: [
      {
        entryKey: "setup",
        id: KB_ID,
        metadata: { defaultLocale: "en", journeyKey: "internal_setup" },
        orgId: ORG_ID,
        status: "ACTIVE",
        tenantId: TENANT_ID,
        title: "Internal setup",
        version: 1
      }
    ],
    kbStages: [
      {
        id: STAGE_ID,
        kbEntryId: KB_ID,
        materialRefs: {
          answer: "Use active KB answer.",
          materialRefs: [
            {
              kind: "guide",
              ref: "controlled://kb/material/setup",
              title: "Setup guide"
            }
          ],
          steps: ["Open runtime setup.", "Follow the bounded checklist."],
          triggers: ["setup help", "setup"]
        },
        orgId: ORG_ID,
        sequence: 1,
        stageKey: "setup",
        status: "ACTIVE",
        tenantId: TENANT_ID,
        title: "Setup"
      }
    ]
  };
}

async function importActiveRuntime() {
  let source = sourceOf("apps/worker/src/telegram-bot-active-answer-runtime.ts");
  const replacements = new Map([
    [
      "../../../packages/capabilities/kb/src/index.ts",
      moduleUrlForFixture("packages/capabilities/kb/src/index.ts")
    ],
    [
      "../../../packages/engine/src/index.ts",
      moduleUrlForFixture("packages/engine/src/index.ts")
    ],
    [
      "../../../packages/llm-gateway/src/index.ts",
      moduleUrlForFixture("packages/llm-gateway/src/index.ts")
    ],
    [
      "./telegram-bot-answer-runtime.ts",
      moduleUrlForFixture("apps/worker/src/telegram-bot-answer-runtime.ts")
    ]
  ]);
  replacements.set(
    "../../../packages/db/src/index.ts",
    dataModuleUrl(`
      export function createRlsTransactionContext(context) {
        return {
          roleSql: 'set local role "uzmax_app_runtime"',
          settings: [
            { key: "app.org_id", value: context.orgId },
            { key: "app.tenant_id", value: context.tenantId }
          ]
        };
      }
    `)
  );
  for (const [needle, value] of replacements) {
    source = source.replaceAll(needle, value);
  }
  return import(dataModuleUrl(jsFromTs(source)));
}

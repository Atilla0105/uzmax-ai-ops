import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";

import {
  ORG_ID,
  TENANT_A,
  TENANT_B,
  USER_A,
  contextFor
} from "./m8-conversation-ticket-api-fixture.mjs";

const repoRoot = process.cwd();
const USER_B = "55555555-5555-4555-8555-555555555555";
const raceWinner = (results) => (results[0].status === "fulfilled" ? USER_A : USER_B);
const { compileApiRuntime } = await import(
  pathToFileURL(path.join(repoRoot, "apps/api/scripts/runtime-compiler.mjs")).href
);
const outDir = await compileApiRuntime({
  outDir: path.join(repoRoot, "node_modules/.cache/uzmax-api-runtime-m11-03b")
});
const runtime = (name) =>
  import(`${pathToFileURL(path.join(outDir, `${name}.mjs`)).href}?m11=03b`);
const [repositoryModule, serviceModule] = await Promise.all([
  runtime("conversation-ticket.repository"),
  runtime("conversation-ticket.service")
]);

describe("M11-03B atomic takeover and ticket actions", () => {
  it("implements the exact takeover matrix and keeps every failure zero-write", async () => {
    const created = supportRuntime([conversation("open", "create")]);
    const first = await takeover(created, "create", USER_A, "  needs a human  ");
    assert.equal(first.result, "created");
    assert.equal(first.conversation.status, "handoff");
    assert.equal(first.ticket.status, "locked");
    assert.equal(first.ticket.summary, "Human takeover: needs a human");
    assert.deepEqual(eventTypes(first.ticket), ["created", "claimed", "locked"]);
    assertServerEvents(first.ticket, USER_A);
    const retry = await takeover(created, "create", USER_A, "same actor retry");
    assert.equal(retry.result, "already_owned");
    assert.equal(retry.ticket.id, first.ticket.id);
    assert.deepEqual(eventTypes(retry.ticket), ["created", "claimed", "locked"]);
    await assert.rejects(
      () => takeover(created, "create", USER_B, "cannot overwrite"),
      /support state conflict/
    );

    const positiveCases = [
      {
        events: ["claimed", "locked"],
        label: "open-unowned",
        result: "reused",
        seed: [conversation("open", "open-unowned"), ticket("open-unowned", "open")]
      },
      {
        events: ["claimed", "locked"],
        label: "pending-unowned",
        result: "reused",
        seed: [
          conversation("pending_handoff", "pending-unowned"),
          ticket("pending-unowned", "open")
        ]
      },
      {
        events: ["locked"],
        label: "assigned-self",
        result: "reused",
        seed: [
          conversation("handoff", "assigned-self"),
          ticket("assigned-self", "claimed", USER_A)
        ]
      },
      {
        events: [],
        label: "owned-self",
        result: "already_owned",
        seed: [
          conversation("handoff", "owned-self"),
          ticket("owned-self", "locked", USER_A, USER_A)
        ]
      }
    ];
    for (const item of positiveCases) {
      const runtime = supportRuntime(item.seed);
      const result = await takeover(runtime, item.label);
      assert.equal(result.result, item.result, item.label);
      assert.deepEqual(eventTypes(result.ticket), item.events, item.label);
    }

    const negativeCases = [
      ["pending-none", [conversation("pending_handoff", "pending-none")]],
      ["closed", [conversation("closed", "closed")]],
      [
        "handoff-unowned",
        [conversation("handoff", "handoff-unowned"), ticket("handoff-unowned")]
      ],
      [
        "other-owner",
        [
          conversation("handoff", "other-owner"),
          ticket("other-owner", "locked", USER_B, USER_B)
        ]
      ],
      [
        "multiple",
        [
          conversation("open", "multiple"),
          ticket("multiple", "open", undefined, undefined, "ticket-multiple-a"),
          ticket("multiple", "open", undefined, undefined, "ticket-multiple-b")
        ]
      ]
    ];
    for (const [label, seed] of negativeCases) {
      await expectTakeoverConflictWithoutWrite(label, seed);
    }
    await assert.rejects(
      () =>
        created.service.createHandoffTicket(
          contextFor(TENANT_B, ["conversation:read", "ticket:write"]),
          { conversationId: conversationId("create"), reason: "wrong tenant" }
        ),
      /conversation not found/
    );
  });

  it("enforces the exact legacy action matrix with server-owned fields", async () => {
    const claimed = supportRuntime([
      conversation("open", "claim"),
      ticket("claim", "open")
    ]);
    const claim = await claimed.service.applyTicketAction(actor(USER_A), {
      actorUserId: USER_B,
      now: "2099-01-01T00:00:00.000Z",
      ticketId: ticketId("claim"),
      type: "claim"
    });
    assert.equal(claim.ticket.status, "claimed");
    assert.equal(claim.ticket.assignedUserId, USER_A);
    assert.equal(claim.ticket.events[0].actorUserId, USER_A);
    assert.notEqual(claim.ticket.events[0].occurredAt, "2099-01-01T00:00:00.000Z");
    await assert.rejects(
      () =>
        claimed.service.applyTicketAction(actor(USER_A), {
          ticketId: ticketId("claim"),
          type: "lock"
        }),
      /support state conflict/
    );

    const owned = supportRuntime([
      conversation("handoff", "actions"),
      ticket("actions", "claimed", USER_A)
    ]);
    let result = await owned.service.applyTicketAction(actor(USER_A), {
      ticketId: ticketId("actions"),
      type: "lock"
    });
    assert.equal(result.ticket.status, "locked");
    result = await owned.service.applyTicketAction(actor(USER_A), {
      note: "  bounded note  ",
      ticketId: ticketId("actions"),
      type: "note"
    });
    assert.equal(result.ticket.events.at(-1).note, "bounded note");
    result = await owned.service.applyTicketAction(actor(USER_A), {
      reason: "  senior review  ",
      ticketId: ticketId("actions"),
      type: "escalate"
    });
    assert.equal(result.ticket.status, "escalated");
    assert.equal(result.ticket.events.at(-1).reason, "senior review");
    const beforeBlocked = JSON.stringify(result.ticket);
    for (const type of ["close", "reopen"]) {
      await assert.rejects(
        () =>
          owned.service.applyTicketAction(actor(USER_A), {
            ticketId: ticketId("actions"),
            type
          }),
        /support state conflict/
      );
    }
    const [afterBlocked] = await owned.repository.listTickets(
      actor(USER_A),
      conversationId("actions")
    );
    assert.equal(JSON.stringify(afterBlocked), beforeBlocked);
    await assert.rejects(
      () =>
        owned.service.applyTicketAction(actor(USER_B), {
          note: "cannot overwrite",
          ticketId: ticketId("actions"),
          type: "note"
        }),
      /support state conflict/
    );
  });

  it("serializes same-actor and different-actor takeover races", async () => {
    const same = supportRuntime([conversation("open", "same-race")]);
    const sameResults = await synchronized([
      () => takeover(same, "same-race", USER_A, "first request"),
      () => takeover(same, "same-race", USER_A, "retry request")
    ]);
    assert.deepEqual(sameResults.map((item) => item.value?.result).sort(), [
      "already_owned",
      "created"
    ]);
    const sameTickets = await same.repository.listTickets(
      actor(USER_A),
      conversationId("same-race")
    );
    assert.equal(sameTickets.length, 1);
    assert.deepEqual(eventTypes(sameTickets[0]), ["created", "claimed", "locked"]);

    const different = supportRuntime([conversation("open", "different-race")]);
    const differentResults = await synchronized([
      () => takeover(different, "different-race", USER_A, "actor a"),
      () => takeover(different, "different-race", USER_B, "actor b")
    ]);
    assert.equal(count(differentResults, "fulfilled"), 1);
    assert.equal(count(differentResults, "rejected"), 1);
    assertStateConflictFailures(differentResults);
    const [raceTicket] = await different.repository.listTickets(
      actor(USER_A),
      conversationId("different-race")
    );
    assert.equal(raceTicket.assignedUserId, raceWinner(differentResults));
    assert.equal(raceTicket.lockedByUserId, raceWinner(differentResults));
  });

  it("serializes takeover against same-actor and different-actor claim", async () => {
    const same = supportRuntime([
      conversation("open", "same-claim"),
      ticket("same-claim", "open")
    ]);
    const sameResults = await synchronized([
      () => takeover(same, "same-claim", USER_A, "same actor takeover"),
      () =>
        same.service.applyTicketAction(actor(USER_A), {
          ticketId: ticketId("same-claim"),
          type: "claim"
        })
    ]);
    assert.ok([1, 2].includes(count(sameResults, "fulfilled")));
    assertStateConflictFailures(sameResults);
    const [sameTicket] = await same.repository.listTickets(
      actor(USER_A),
      conversationId("same-claim")
    );
    assert.equal(sameTicket.status, "locked");
    assert.equal(sameTicket.assignedUserId, USER_A);
    assert.deepEqual(eventTypes(sameTicket), ["claimed", "locked"]);

    const different = supportRuntime([
      conversation("open", "different-claim"),
      ticket("different-claim", "open")
    ]);
    const differentResults = await synchronized([
      () => takeover(different, "different-claim", USER_A, "takeover actor"),
      () =>
        different.service.applyTicketAction(actor(USER_B), {
          ticketId: ticketId("different-claim"),
          type: "claim"
        })
    ]);
    assert.equal(count(differentResults, "fulfilled"), 1);
    assert.equal(count(differentResults, "rejected"), 1);
    assertStateConflictFailures(differentResults);
    const [ticketAfterRace] = await different.repository.listTickets(
      actor(USER_A),
      conversationId("different-claim")
    );
    const winner = raceWinner(differentResults);
    assert.equal(ticketAfterRace.assignedUserId, winner);
    if (winner === USER_A) {
      assert.equal(ticketAfterRace.status, "locked");
      assert.equal(ticketAfterRace.lockedByUserId, USER_A);
      assert.deepEqual(eventTypes(ticketAfterRace), ["claimed", "locked"]);
    } else {
      assert.equal(ticketAfterRace.status, "claimed");
      assert.equal(ticketAfterRace.lockedByUserId, undefined);
      assert.deepEqual(eventTypes(ticketAfterRace), ["claimed"]);
    }
  });
});

function supportRuntime(seed) {
  const repository = new repositoryModule.InMemoryConversationTicketRepository({
    conversations: seed.filter((item) => "unreadCount" in item),
    tickets: seed.filter((item) => "priority" in item)
  });
  return {
    repository,
    service: new serviceModule.ConversationTicketService(repository)
  };
}

function actor(userId) {
  return {
    ...contextFor(TENANT_A, ["conversation:read", "ticket:write"]),
    userId
  };
}

function takeover(runtime, label, userId = USER_A, reason = label) {
  return runtime.service.createHandoffTicket(actor(userId), {
    conversationId: conversationId(label),
    reason
  });
}

function conversation(status, label) {
  return {
    channelConnectionId: "66666666-6666-4666-8666-666666666666",
    externalConversationRef: `telegram:chat:${label}`,
    id: conversationId(label),
    orgId: ORG_ID,
    participantExternalRef: `telegram:user:${label}`,
    status,
    tenantId: TENANT_A,
    unreadCount: 1
  };
}

function ticket(
  label,
  status = "open",
  assignedUserId,
  lockedByUserId,
  id = ticketId(label)
) {
  return {
    ...(assignedUserId ? { assignedUserId } : {}),
    conversationId: conversationId(label),
    events: [],
    id,
    ...(lockedByUserId ? { lockedByUserId } : {}),
    orgId: ORG_ID,
    priority: 3,
    sla: {
      policyRef: "value0-staging-support-default-v1",
      source: "config_placeholder"
    },
    status,
    suggestedAction: "Review conversation context and respond from approved data.",
    summary: `ticket ${label}`,
    tenantId: TENANT_A
  };
}

async function expectTakeoverConflictWithoutWrite(label, seed) {
  const runtime = supportRuntime(seed);
  const before = await snapshot(runtime.repository, label);
  await assert.rejects(
    () => takeover(runtime, label, USER_A, "must fail"),
    /support state conflict/
  );
  assert.deepEqual(await snapshot(runtime.repository, label), before, label);
}

async function snapshot(repository, label) {
  return {
    conversation: await repository.getConversation(
      actor(USER_A),
      conversationId(label)
    ),
    tickets: await repository.listTickets(actor(USER_A), conversationId(label))
  };
}

async function synchronized(actions) {
  let ready = 0;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const started = actions.map((action) =>
    (async () => {
      ready += 1;
      if (ready === actions.length) release();
      await gate;
      return action();
    })()
  );
  return Promise.allSettled(started);
}

function assertServerEvents(ticketState, actorUserId) {
  assert.equal(new Set(ticketState.events.map((event) => event.id)).size, 3);
  assert.ok(ticketState.events.every((event) => event.actorUserId === actorUserId));
  const times = ticketState.events.map((event) => Date.parse(event.occurredAt));
  assert.ok(times[1] > times[0] && times[2] > times[1]);
}

function count(results, status) {
  return results.filter((result) => result.status === status).length;
}

function assertStateConflictFailures(results) {
  for (const result of results.filter((item) => item.status === "rejected")) {
    assert.equal(result.reason?.message, "support state conflict");
  }
}

function eventTypes(ticketState) {
  return ticketState.events.map((event) => event.type);
}

function conversationId(label) {
  return `conversation-${label}`;
}

function ticketId(label) {
  return `ticket-${label}`;
}

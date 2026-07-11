import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";

const ORG = "11111111-1111-4111-8111-111111111711",
  TENANT = "22222222-2222-4222-8222-222222222711",
  OTHER_TENANT = "22222222-2222-4222-8222-222222222799",
  USER = "33333333-3333-4333-8333-333333333711",
  OTHER = "44444444-4444-4444-8444-444444444711",
  CHANNEL = "55555555-5555-4555-8555-555555555711";
const id = (suffix) => `70000000-0000-4000-8000-${String(suffix).padStart(12, "0")}`;
const at = (second) => `2026-07-10T00:00:${String(second).padStart(2, "0")}.000Z`;
const root = process.cwd();
const { compileApiRuntime } = await import(
  pathToFileURL(path.join(root, "apps/api/scripts/runtime-compiler.mjs")).href
);
const outDir = await compileApiRuntime({
  outDir: path.join(root, "node_modules/.cache/uzmax-api-runtime-m11-04b1")
});
const runtime = (name) =>
  import(`${pathToFileURL(path.join(outDir, `${name}.mjs`)).href}?m11=04b1`);
const [repositoryModule, serviceModule] = await Promise.all([
  runtime("conversation-ticket.repository"),
  runtime("conversation-ticket.service")
]);

describe("M11-04B1 atomic close and human reopen", () => {
  it("closes LOCKED and ESCALATED tickets for every structured result", async () => {
    const results = [
      "duplicate",
      "invalid",
      "no_response",
      "resolved",
      "transferred_to_human_channel"
    ];
    let index = 0;
    for (const status of ["locked", "escalated"]) {
      for (const result of results) {
        index += 1;
        const conversationId = id(10 + index * 10);
        const ticketId = id(11 + index * 10);
        const eventId = id(12 + index * 10);
        const store = support({
          conversations: [conversation(conversationId, "handoff", 3)],
          tickets: [activeTicket(ticketId, conversationId, eventId, status)]
        });
        const input = closeInput(ticketId, eventId, id(13 + index * 10), result);
        const applied = await store.service.applyTicketAction(actor(), input);
        assert.equal(applied.result, "applied");
        assert.equal(applied.conversation.status, "closed");
        assert.equal(applied.conversation.unreadCount, 0);
        assert.equal(applied.ticket.status, "closed");
        assert.equal(applied.ticket.assignedUserId, USER);
        assert.equal(applied.ticket.lockedByUserId, undefined);
        assert.equal(applied.ticket.closeResult, result);
        assert.equal(applied.ticket.closeDestination, input.destination);
        assert.equal(applied.ticket.closedAt, applied.ticket.events.at(-1).occurredAt);
        assert.equal(eventCount(applied.ticket, "closed"), 1);
        const replay = await store.service.applyTicketAction(actor(), input);
        assert.equal(replay.result, "already_applied");
        assert.equal(eventCount(replay.ticket, "closed"), 1);
      }
    }
  });

  it("reopens for another operator, preserves history, and replays after later state", async () => {
    const conversationId = id(200);
    const ticketId = id(201);
    const store = support({
      conversations: [conversation(conversationId, "handoff")],
      tickets: [activeTicket(ticketId, conversationId, id(202), "locked")]
    });
    const firstClose = closeInput(ticketId, id(202), id(203), "resolved");
    const closed = await store.service.applyTicketAction(actor(), firstClose);
    const firstClosedEventId = closed.ticket.events.at(-1).id;
    const reopen = reopenInput(ticketId, firstClosedEventId, id(204), "continue");
    const reopened = await store.service.applyTicketAction(actor(OTHER), reopen);
    assert.equal(reopened.conversation.status, "handoff");
    assert.equal(reopened.ticket.status, "reopened");
    assert.equal(reopened.ticket.assignedUserId, OTHER);
    assert.equal(reopened.ticket.closedAt, undefined);
    assert.equal(reopened.ticket.closeResult, undefined);
    assert.equal(
      reopened.ticket.events.find(({ id: eventId }) => eventId === firstClosedEventId)
        .result,
      "resolved"
    );
    assert.equal(eventCount(reopened.ticket, "reopened"), 1);

    const locked = await store.service.applyTicketAction(actor(OTHER), {
      ticketId,
      type: "lock"
    });
    const secondClose = closeInput(
      ticketId,
      locked.ticket.events.at(-1).id,
      id(205),
      "duplicate"
    );
    const closedAgain = await store.service.applyTicketAction(
      actor(OTHER),
      secondClose
    );
    const count = closedAgain.ticket.events.length;
    assert.equal(
      (await store.service.applyTicketAction(actor(), firstClose)).result,
      "already_applied"
    );
    assert.equal(
      (await store.service.applyTicketAction(actor(OTHER), reopen)).result,
      "already_applied"
    );
    assert.equal(
      (await snapshot(store, conversationId)).tickets[0].events.length,
      count
    );

    const unread = support({
      conversations: [conversation(id(210), "closed", 2)],
      tickets: [closedTicket(id(211), id(210), closeEvent(id(212), USER))]
    });
    const unreadReopen = await unread.service.applyTicketAction(
      actor(OTHER),
      reopenInput(id(211), id(212), id(213), "handle unread")
    );
    assert.equal(unreadReopen.conversation.unreadCount, 2);
    assert.equal(unreadReopen.ticket.assignedUserId, OTHER);
  });

  it("rejects stale, colliding, multiply matched, unowned and cross-tenant commands", async () => {
    const base = 1200;
    const cases = [
      {
        context: actor(OTHER),
        input: closeInput(id(base + 1), id(base + 2), id(base + 3)),
        seed: activeSeed(base)
      },
      {
        input: closeInput(id(base + 11), id(base + 19), id(base + 13)),
        seed: activeSeed(base + 10)
      },
      {
        input: closeInput(id(base + 21), id(base + 22), id(base + 23)),
        seed: {
          conversations: [conversation(id(base + 20), "handoff")],
          tickets: [
            activeTicket(id(base + 21), id(base + 20), id(base + 22), "locked"),
            activeTicket(id(base + 24), id(base + 20), id(base + 25), "locked")
          ]
        }
      },
      {
        input: closeInput(id(base + 31), id(base + 32), id(base + 33), "duplicate"),
        seed: replaySeed(base + 30, "resolved", false)
      },
      {
        input: closeInput(id(base + 41), id(base + 42), id(base + 43)),
        seed: replaySeed(base + 40, "resolved", true)
      },
      {
        input: closeInput(id(base + 51), id(base + 52), id(base + 53)),
        seed: replaySeed(base + 50, "resolved", false, { type: "note_added" })
      }
    ];
    for (const item of cases) {
      const store = support(item.seed);
      await expectConflictZero(store, item.input, item.context ?? actor());
    }

    const cross = activeStore(1300);
    await expectConflictZero(
      cross,
      closeInput(cross.ticketId, cross.eventId, id(1303)),
      actor(USER, OTHER_TENANT),
      /ticket not found/
    );
  });

  it("selects the latest closed lifecycle first and never falls back", async () => {
    const corruptions = [
      (ticket) => ({ ...ticket, closedAt: undefined }),
      (ticket) => ({ ...ticket, events: [] }),
      (ticket) => ({
        ...ticket,
        events: ticket.events.map((event) => ({ ...event, requestId: undefined }))
      }),
      (ticket) => ({
        ...ticket,
        events: ticket.events.map((event) => ({
          ...event,
          expectedLifecycleEventId: undefined
        }))
      }),
      (ticket) => ({
        ...ticket,
        events: ticket.events.map((event) => ({ ...event, occurredAt: at(8) }))
      }),
      (ticket) => ({
        ...ticket,
        events: ticket.events.map((event) => ({ ...event, actorUserId: OTHER }))
      }),
      (ticket) => ({
        ...ticket,
        assignedUserId: undefined,
        events: ticket.events.map((event) => ({ ...event, actorUserId: undefined }))
      }),
      (ticket) => ({
        ...ticket,
        events: ticket.events.map((event) => ({ ...event, destination: "   " }))
      })
    ];
    for (const [index, corrupt] of corruptions.entries()) {
      const conversationId = id(1400 + index * 10);
      const older = closedTicket(
        id(1401 + index * 10),
        conversationId,
        closeEvent(id(1402 + index * 10), USER, at(1))
      );
      const latestEvent = closeEvent(id(1404 + index * 10), USER, at(2));
      const latest = corrupt(
        closedTicket(id(1403 + index * 10), conversationId, latestEvent)
      );
      const store = support({
        conversations: [conversation(conversationId, "closed")],
        tickets: [older, latest]
      });
      await expectConflictZero(
        store,
        reopenInput(latest.id, latestEvent.id, id(1405 + index * 10), "no fallback")
      );
    }

    const tieConversation = id(1500);
    const lower = closedTicket(id(1501), tieConversation, closeEvent(id(1503), USER));
    const higher = closedTicket(id(1502), tieConversation, closeEvent(id(1504), USER));
    const tie = support({
      conversations: [conversation(tieConversation, "closed")],
      tickets: [lower, higher]
    });
    await expectConflictZero(
      tie,
      reopenInput(lower.id, lower.events[0].id, id(1505), "wrong tie target")
    );
    assert.equal(
      (
        await tie.service.applyTicketAction(
          actor(OTHER),
          reopenInput(higher.id, higher.events[0].id, id(1506), "right tie target")
        )
      ).ticket.id,
      higher.id
    );
  });
});

function support(seed) {
  const conversationId = seed.conversations?.[0]?.id;
  const repository = new repositoryModule.InMemoryConversationTicketRepository({
    conversations: seed.conversations ?? [],
    messages: seed.messages ?? [message(id(9999), conversationId)],
    tickets: seed.tickets ?? []
  });
  const service = new serviceModule.ConversationTicketService(repository);
  return {
    conversationId,
    repository,
    service
  };
}

function activeStore(base) {
  const seed = activeSeed(base);
  return {
    ...support(seed),
    eventId: id(base + 2),
    ticketId: id(base + 1)
  };
}

function activeSeed(base) {
  const conversationId = id(base);
  return {
    conversations: [conversation(conversationId, "handoff")],
    tickets: [activeTicket(id(base + 1), conversationId, id(base + 2), "locked")]
  };
}

function replaySeed(base, result, duplicate, eventPatch = {}) {
  const conversationId = id(base);
  const requestId = id(base + 3);
  const first = {
    ...closeEvent(id(base + 2), USER, at(1), requestId, result),
    ...eventPatch
  };
  const events = duplicate ? [first, { ...first, id: id(base + 4) }] : [first];
  return {
    conversations: [conversation(conversationId, "closed")],
    tickets: [closedTicket(id(base + 1), conversationId, first, events)]
  };
}

const conversation = (conversationId, status, unreadCount = 0) => ({
  aiState: "suspended",
  channelConnectionId: CHANNEL,
  externalConversationRef: `telegram:chat:${conversationId}`,
  id: conversationId,
  orgId: ORG,
  participantExternalRef: `telegram:user:${conversationId}`,
  status,
  tenantId: TENANT,
  unreadCount
});
const ticketBase = (ticketId, conversationId, assignedUserId) => ({
  assignedUserId,
  conversationId,
  id: ticketId,
  orgId: ORG,
  priority: 3,
  sla: { policyRef: "value0-staging-support-default-v1", source: "config_placeholder" },
  suggestedAction: "Review conversation context",
  summary: "controlled lifecycle",
  tenantId: TENANT
});
const activeTicket = (ticketId, conversationId, eventId, status) => ({
  ...ticketBase(ticketId, conversationId, USER),
  events: [{ actorUserId: USER, id: eventId, occurredAt: at(0), type: status }],
  lockedByUserId: USER,
  status
});
const closedTicket = (ticketId, conversationId, close, events = [close]) => ({
  ...ticketBase(ticketId, conversationId, close.actorUserId),
  closeDestination: close.destination,
  closeResult: close.result,
  closedAt: close.occurredAt,
  events,
  status: "closed"
});
const closeEvent = (
  eventId,
  actorUserId,
  occurredAt = at(1),
  requestId = id(9001),
  result = "resolved"
) => ({
  action: "close",
  actorUserId,
  destination: `controlled ${result}`,
  expectedLifecycleEventId: id(9002),
  id: eventId,
  occurredAt,
  requestId,
  result,
  type: "closed"
});
const closeInput = (
  ticketId,
  expectedLifecycleEventId,
  requestId,
  result = "resolved",
  destination = `controlled ${result}`
) => ({
  destination,
  expectedLifecycleEventId,
  requestId,
  result,
  ticketId,
  type: "close"
});

function reopenInput(ticketId, expectedClosedEventId, requestId, reason) {
  return { expectedClosedEventId, reason, requestId, ticketId, type: "reopen" };
}

const actor = (userId = USER, selectedTenantId = TENANT) => ({
  membershipVersion: 1,
  orgId: ORG,
  permissions: ["conversation:read", "ticket:write"],
  selectedTenantId,
  tenantIds: [selectedTenantId],
  userId
});

const message = (messageId, conversationId) => ({
  content: { text: "synthetic" },
  contentKind: "text",
  conversationId,
  deliveryStatus: "received",
  direction: "inbound",
  id: messageId,
  occurredAt: at(0),
  orgId: ORG,
  tenantId: TENANT
});
const eventCount = (ticket, type) =>
  ticket.events.filter((event) => event.type === type).length;

async function snapshot(store, conversationId) {
  return {
    conversation: await store.repository.getConversation(actor(), conversationId),
    messages: await store.repository.listMessages(actor(), conversationId),
    tickets: await store.repository.listTickets(actor(), conversationId)
  };
}

async function expectConflictZero(
  store,
  input,
  context = actor(),
  pattern = /support state conflict/
) {
  const before = await snapshot(store, store.conversationId);
  await assert.rejects(() => store.service.applyTicketAction(context, input), pattern);
  assert.deepEqual(await snapshot(store, store.conversationId), before);
}

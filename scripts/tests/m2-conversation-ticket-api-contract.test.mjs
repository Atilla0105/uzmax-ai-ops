import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CONVERSATION_A_HANDOFF,
  CONVERSATION_A_OPEN,
  CONVERSATION_B,
  NOW,
  ORG_ID,
  TENANT_A,
  TENANT_B,
  TICKET_ID,
  USER_A,
  USER_B,
  contextFor,
  conversation,
  createConversationTicketHarness,
  message
} from "./m2-conversation-ticket-test-harness.mjs";

const harness = await createConversationTicketHarness("uzmax-m2-03-");
const { appModule, contracts, handoff, importConversationTicketApiSource } = harness;

describe("M2-03 conversation handoff ticket API contract", () => {
  it("creates a handoff ticket draft and suspends in-flight AI without sending", () => {
    assert.equal(typeof handoff.module.createHumanHandoff, "function");

    const result = handoff.module.createHumanHandoff({
      conversation: conversation(CONVERSATION_A_OPEN, TENANT_A, "open"),
      now: NOW,
      reason: "latest customer question needs human review",
      requestedByUserId: USER_A,
      slaPolicyRef: "sla-policy:tenant-default"
    });

    assert.equal(result.conversation.status, "pending_handoff");
    assert.equal(result.conversation.aiState, "suspended");
    assert.equal(result.ticketDraft.conversationId, CONVERSATION_A_OPEN);
    assert.match(
      result.ticketDraft.summary,
      /latest customer question needs human review/
    );
    assert.match(result.ticketDraft.suggestedAction, /Review conversation/);
    assert.deepEqual(result.ticketDraft.sla, {
      policyRef: "sla-policy:tenant-default",
      source: "config_placeholder"
    });
    assert.deepEqual(
      result.inFlightAiMessages.map((item) => item.status),
      ["withdrawn", "pending_cancel"]
    );
    assert.equal(
      result.inFlightAiMessages.some((item) => item.status === "sent"),
      false
    );
  });

  it("applies ticket actions with lock ownership and close/reopen state", () => {
    assert.equal(typeof handoff.module.createTicketState, "function");
    assert.equal(typeof handoff.module.applyTicketAction, "function");

    let ticket = baseTicket();
    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      now: NOW,
      type: "claim"
    });
    assert.equal(ticket.status, "claimed");
    assert.equal(ticket.assignedUserId, USER_A);

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      now: NOW,
      type: "lock"
    });
    assert.equal(ticket.status, "locked");
    assert.equal(ticket.lockedByUserId, USER_A);
    assert.throws(
      () =>
        handoff.module.applyTicketAction(ticket, {
          actorUserId: USER_B,
          now: NOW,
          type: "lock"
        }),
      /ticket is locked by another user/
    );

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      note: "Checked the latest conversation fragment.",
      now: NOW,
      type: "note"
    });
    assert.equal(ticket.events.at(-1).type, "note_added");

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      now: NOW,
      reason: "needs senior support",
      type: "escalate"
    });
    assert.equal(ticket.status, "escalated");
    assert.throws(
      () =>
        handoff.module.applyTicketAction(ticket, {
          actorUserId: USER_B,
          now: NOW,
          reason: "spoofed reopen should not bypass lock",
          type: "reopen"
        }),
      /ticket is locked by another user/
    );

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      destination: "handled_in_admin",
      now: NOW,
      result: "resolved",
      type: "close"
    });
    assert.equal(ticket.status, "closed");
    assert.equal(ticket.closedAt, NOW);
    assert.equal(ticket.closeResult, "resolved");

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_B,
      now: NOW,
      reason: "customer replied again",
      type: "reopen"
    });
    assert.equal(ticket.status, "reopened");
    assert.equal(ticket.closedAt, undefined);
    assert.throws(
      () =>
        handoff.module.applyTicketAction(ticket, {
          actorUserId: USER_A,
          now: NOW,
          type: "invalid-action"
        }),
      /ticket action type is invalid/
    );
  });

  it("lists and updates conversations only inside the selected tenant context", async () => {
    const api = await importConversationTicketApiSource();
    const repository = new api.module.InMemoryConversationTicketRepository({
      conversations: [
        conversation(CONVERSATION_A_OPEN, TENANT_A, "open"),
        {
          ...conversation(CONVERSATION_A_HANDOFF, TENANT_A, "pending_handoff"),
          aiState: "suspended",
          slaRisk: true
        },
        conversation(CONVERSATION_B, TENANT_B, "open")
      ],
      messages: [
        message("message-a-1", CONVERSATION_A_OPEN, TENANT_A, "inbound"),
        message("message-a-2", CONVERSATION_A_OPEN, TENANT_A, "outbound"),
        message("message-b-1", CONVERSATION_B, TENANT_B, "inbound")
      ],
      tickets: []
    });
    const service = new api.module.ConversationTicketService(repository);
    const accessContext = contextFor(USER_A, TENANT_A, [
      "conversation:read",
      "ticket:write"
    ]);

    const filtered = await service.listConversations(accessContext, {
      awaitingReply: true,
      slaRiskOnly: true,
      status: "pending_handoff",
      unreadOnly: true
    });
    assert.deepEqual(
      filtered.items.map((item) => item.id),
      [CONVERSATION_A_HANDOFF]
    );

    const detail = await service.getConversationDetail(
      accessContext,
      CONVERSATION_A_OPEN
    );
    assert.equal(detail.messages.length, 2);
    assert.equal(JSON.stringify(detail).includes(CONVERSATION_B), false);
    await assert.rejects(
      () => service.getConversationDetail(accessContext, CONVERSATION_B),
      /conversation not found/
    );

    const handoffResult = await service.createHandoffTicket(accessContext, {
      conversationId: CONVERSATION_A_OPEN,
      reason: "customer asked for a human",
      slaPolicyRef: "sla-policy:tenant-default"
    });
    assert.equal(handoffResult.conversation.status, "pending_handoff");
    assert.equal(handoffResult.ticket.sla.policyRef, "sla-policy:tenant-default");

    const locked = await service.applyTicketAction(accessContext, {
      actorUserId: USER_A,
      now: NOW,
      ticketId: handoffResult.ticket.id,
      type: "lock"
    });
    assert.equal(locked.ticket.lockedByUserId, USER_A);
    await assert.rejects(
      () =>
        service.applyTicketAction(contextFor(USER_B, TENANT_A, ["ticket:write"]), {
          actorUserId: USER_B,
          now: NOW,
          ticketId: handoffResult.ticket.id,
          type: "lock"
        }),
      /ticket is locked by another user/
    );
  });

  it("registers the API shell and documents the contract boundary", async () => {
    const api = await importConversationTicketApiSource();
    assert.match(api.source, /@Controller\("conversation-ticket"\)/);
    assert.match(api.source, /@Get\("conversations"\)/);
    assert.match(api.source, /@Post\("conversations\/:conversationId\/handoff"\)/);
    assert.match(api.source, /@Post\("tickets\/:ticketId\/actions"\)/);
    assert.match(appModule, /ConversationTicketController/);
    assert.match(appModule, /InMemoryConversationTicketRepository/);
    assert.match(contracts, /M2 Conversation Handoff Ticket API Contract/);
    assert.match(contracts, /AI suspended/);
    assert.match(contracts, /no new external API\/SDK/);
  });
});

function baseTicket() {
  return handoff.module.createTicketState({
    conversationId: CONVERSATION_A_OPEN,
    events: [],
    id: TICKET_ID,
    orgId: ORG_ID,
    priority: 3,
    sla: { policyRef: "sla-policy:tenant-default", source: "config_placeholder" },
    status: "open",
    suggestedAction: "Review conversation and respond from approved data.",
    summary: "Customer requested human support.",
    tenantId: TENANT_A
  });
}

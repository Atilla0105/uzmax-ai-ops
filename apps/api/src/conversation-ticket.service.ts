import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";
import {
  applyTicketAction as applyHandoffTicketAction,
  createHumanHandoff,
  createTicketState,
  type TicketAction
} from "../../../packages/capabilities/handoff/src/index.ts";

import { requireFound } from "./conversation-ticket.errors.ts";
import { InMemoryConversationTicketRepository } from "./conversation-ticket.repository.ts";
import type {
  ConversationListFilters,
  TicketActionInput
} from "./conversation-ticket.types.ts";

@Injectable()
export class ConversationTicketService {
  constructor(private readonly repository: InMemoryConversationTicketRepository) {}

  async listConversations(
    accessContext: AccessContext,
    filters: ConversationListFilters
  ) {
    assertPermission(accessContext, "conversation:read");
    return { items: this.repository.listConversations(accessContext, filters) };
  }

  async getConversationDetail(accessContext: AccessContext, conversationId: string) {
    assertPermission(accessContext, "conversation:read");
    const conversation = requireFound(
      this.repository.getConversation(accessContext, conversationId),
      "conversation_not_found",
      "conversation not found"
    );
    return {
      conversation,
      messages: this.repository.listMessages(accessContext, conversationId)
    };
  }

  async createHandoffTicket(
    accessContext: AccessContext,
    input: { conversationId: string; reason: string; slaPolicyRef: string }
  ) {
    assertPermission(accessContext, "conversation:read");
    assertPermission(accessContext, "ticket:write");
    const conversation = requireFound(
      this.repository.getConversation(accessContext, input.conversationId),
      "conversation_not_found",
      "conversation not found"
    );
    const handoff = createHumanHandoff({
      conversation,
      reason: input.reason,
      requestedByUserId: accessContext.userId,
      slaPolicyRef: input.slaPolicyRef
    });
    const ticket = createTicketState({
      conversationId: conversation.id,
      events: [
        {
          actorUserId: accessContext.userId,
          occurredAt: handoff.ticketDraft.timestamp,
          reason: input.reason,
          type: "created"
        }
      ],
      id: randomUUID(),
      orgId: accessContext.orgId,
      priority: handoff.ticketDraft.priority,
      sla: handoff.ticketDraft.sla,
      status: "open",
      suggestedAction: handoff.ticketDraft.suggestedAction,
      summary: handoff.ticketDraft.summary,
      tenantId: accessContext.selectedTenantId
    });

    return {
      conversation: this.repository.saveConversation(handoff.conversation),
      inFlightAiMessages: handoff.inFlightAiMessages,
      ticket: this.repository.saveTicket(ticket)
    };
  }

  async applyTicketAction(accessContext: AccessContext, input: TicketActionInput) {
    assertPermission(accessContext, "ticket:write");
    const ticket = requireFound(
      this.repository.getTicket(accessContext, input.ticketId),
      "ticket_not_found",
      "ticket not found"
    );
    const updated = applyHandoffTicketAction(ticket, {
      ...input,
      actorUserId: accessContext.userId
    } as TicketAction);

    return { ticket: this.repository.saveTicket(updated) };
  }
}

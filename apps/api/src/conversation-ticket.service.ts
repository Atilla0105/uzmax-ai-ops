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
import { operatorStateFor } from "./conversation-ticket.ownership.ts";
import type { ConversationTicketRepositoryPort } from "./conversation-ticket.repository.ts";
import type {
  ConversationListFilters,
  TicketActionInput
} from "./conversation-ticket.types.ts";
import { value0SupportSlaPolicyRef } from "./conversation-ticket.types.ts";

@Injectable()
export class ConversationTicketService {
  constructor(private readonly repository: ConversationTicketRepositoryPort) {}

  async listConversations(
    accessContext: AccessContext,
    filters: ConversationListFilters
  ) {
    assertPermission(accessContext, "conversation:read");
    return { items: await this.repository.listConversations(accessContext, filters) };
  }

  async getConversationDetail(accessContext: AccessContext, conversationId: string) {
    assertPermission(accessContext, "conversation:read");
    const conversation = requireFound(
      await this.repository.getConversation(accessContext, conversationId),
      "conversation_not_found",
      "conversation not found"
    );
    const [customerContext, messages, tickets] = await Promise.all([
      this.repository.getCustomerContext(accessContext, conversation),
      this.repository.listMessages(accessContext, conversationId),
      this.repository.listTickets(accessContext, conversationId)
    ]);
    const readTickets = tickets.map((ticket) => ({
      ...ticket,
      sla: { ...ticket.sla, policyRef: value0SupportSlaPolicyRef }
    }));
    const operatorState = operatorStateFor(
      conversation,
      readTickets,
      accessContext.userId
    );
    return {
      conversation,
      customerContext,
      messages,
      operatorState,
      slaPolicyRef: value0SupportSlaPolicyRef,
      takeoverReadiness: "blocked_pending_m11_03b",
      tickets: readTickets
    };
  }

  async createHandoffTicket(
    accessContext: AccessContext,
    input: { conversationId: string; reason: string; slaPolicyRef: string }
  ) {
    assertPermission(accessContext, "conversation:read");
    assertPermission(accessContext, "ticket:write");
    const conversation = requireFound(
      await this.repository.getConversation(accessContext, input.conversationId),
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
      conversation: await this.repository.saveConversation(handoff.conversation),
      inFlightAiMessages: handoff.inFlightAiMessages,
      ticket: await this.repository.saveTicket(ticket)
    };
  }

  async applyTicketAction(accessContext: AccessContext, input: TicketActionInput) {
    assertPermission(accessContext, "ticket:write");
    const ticket = requireFound(
      await this.repository.getTicket(accessContext, input.ticketId),
      "ticket_not_found",
      "ticket not found"
    );
    const updated = applyHandoffTicketAction(ticket, {
      ...input,
      actorUserId: accessContext.userId
    } as TicketAction);

    return { ticket: await this.repository.saveTicket(updated) };
  }
}

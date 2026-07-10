import { Injectable } from "@nestjs/common";

import {
  assertPermission,
  hasPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";
import { requireFound } from "./conversation-ticket.errors.ts";
import { canTakeoverConversation } from "./conversation-ticket.atomic-state.ts";
import { operatorStateFor } from "./conversation-ticket.ownership.ts";
import type { ConversationTicketRepositoryPort } from "./conversation-ticket.repository.ts";
import type {
  ConversationDetailOperatorState,
  ConversationListFilters,
  TakeoverInput,
  TakeoverReadiness,
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
    const readState = operatorStateFor(conversation, readTickets, accessContext.userId);
    const permitted = hasPermission(accessContext, "ticket:write");
    const canTakeover =
      permitted &&
      canTakeoverConversation(conversation, readTickets, accessContext.userId);
    const operatorState = {
      ...readState,
      canTakeover
    } satisfies ConversationDetailOperatorState;
    const takeoverReadiness: TakeoverReadiness = !permitted
      ? "permission_blocked"
      : canTakeover
        ? "atomic_ready"
        : "state_blocked";
    return {
      conversation,
      customerContext,
      messages,
      operatorState,
      slaPolicyRef: value0SupportSlaPolicyRef,
      takeoverReadiness,
      tickets: readTickets
    };
  }

  async createHandoffTicket(accessContext: AccessContext, input: TakeoverInput) {
    assertPermission(accessContext, "conversation:read");
    assertPermission(accessContext, "ticket:write");
    return this.repository.takeoverConversation(accessContext, input);
  }

  async applyTicketAction(accessContext: AccessContext, input: TicketActionInput) {
    assertPermission(accessContext, "ticket:write");
    return {
      ticket: await this.repository.applyTicketAction(accessContext, input)
    };
  }
}

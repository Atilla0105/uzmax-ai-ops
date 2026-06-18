import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type {
  HandoffConversation,
  TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";

import type {
  ConversationListFilters,
  ConversationMessage,
  ConversationTicketSeed
} from "./conversation-ticket.types.ts";

export class InMemoryConversationTicketRepository {
  private conversations: HandoffConversation[];
  private messages: ConversationMessage[];
  private tickets: TicketState[];

  constructor(seed: ConversationTicketSeed = {}) {
    this.conversations = [...(seed.conversations ?? [])];
    this.messages = [...(seed.messages ?? [])];
    this.tickets = [...(seed.tickets ?? [])];
  }

  listConversations(accessContext: AccessContext, filters: ConversationListFilters) {
    return scoped(this.conversations, accessContext)
      .filter((conversation) => matchesConversationFilters(conversation, filters))
      .sort(compareConversationPriority)
      .map(clone);
  }

  getConversation(accessContext: AccessContext, conversationId: string) {
    return clone(
      scoped(this.conversations, accessContext).find(
        (conversation) => conversation.id === conversationId
      )
    );
  }

  listMessages(accessContext: AccessContext, conversationId: string) {
    return scoped(this.messages, accessContext)
      .filter((message) => message.conversationId === conversationId)
      .map(clone);
  }

  saveConversation(conversation: HandoffConversation) {
    this.conversations = upsertById(this.conversations, conversation);
    return clone(conversation);
  }

  saveTicket(ticket: TicketState) {
    this.tickets = upsertById(this.tickets, ticket);
    return clone(ticket);
  }

  getTicket(accessContext: AccessContext, ticketId: string) {
    return clone(
      scoped(this.tickets, accessContext).find((ticket) => ticket.id === ticketId)
    );
  }
}

function matchesConversationFilters(
  conversation: HandoffConversation,
  filters: ConversationListFilters
): boolean {
  return (
    (!filters.status || conversation.status === filters.status) &&
    (!filters.unreadOnly || conversation.unreadCount > 0) &&
    (!filters.awaitingReply || conversation.awaitingReply === true) &&
    (!filters.slaRiskOnly || conversation.slaRisk === true)
  );
}

function compareConversationPriority(
  left: HandoffConversation,
  right: HandoffConversation
): number {
  return priority(left) - priority(right) || right.id.localeCompare(left.id);
}

function priority(conversation: HandoffConversation): number {
  if (conversation.status === "pending_handoff") return 0;
  if (conversation.slaRisk) return 1;
  return 2;
}

function scoped<T extends { orgId: string; tenantId: string }>(
  items: readonly T[],
  accessContext: AccessContext
): T[] {
  return items.filter((item) => {
    return (
      item.orgId === accessContext.orgId &&
      item.tenantId === accessContext.selectedTenantId
    );
  });
}

function upsertById<T extends { id: string }>(items: readonly T[], item: T): T[] {
  const found = items.some((candidate) => candidate.id === item.id);
  if (!found) return [...items, clone(item)];
  return items.map((candidate) => (candidate.id === item.id ? clone(item) : candidate));
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

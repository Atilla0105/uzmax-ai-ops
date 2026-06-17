import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";
import {
  applyTicketAction as applyHandoffTicketAction,
  createHumanHandoff,
  createTicketState,
  type HandoffConversation,
  type TicketAction,
  type TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";
import { ApiAccessContextGuard } from "./access-context.ts";

type ConversationFilterStatus = "closed" | "handoff" | "open" | "pending_handoff";

export type ConversationListFilters = {
  awaitingReply?: boolean;
  slaRiskOnly?: boolean;
  status?: ConversationFilterStatus;
  unreadOnly?: boolean;
};

type ConversationMessage = Record<
  "conversationId" | "id" | "occurredAt" | "orgId" | "tenantId",
  string
> & {
  content: Record<string, unknown>;
  contentKind: "callback" | "image" | "system" | "text" | "unsupported" | "voice";
  direction: "inbound" | "internal" | "outbound";
};

type Seed = {
  conversations?: readonly HandoffConversation[];
  messages?: readonly ConversationMessage[];
  tickets?: readonly TicketState[];
};

type ApiRequestWithContext = {
  accessContext?: AccessContext;
};

type HandoffBody = {
  reason?: unknown;
  slaPolicyRef?: unknown;
};

type TicketActionBody = TicketAction & {
  actorUserId?: string;
};

export class InMemoryConversationTicketRepository {
  private conversations: HandoffConversation[];
  private messages: ConversationMessage[];
  private tickets: TicketState[];

  constructor(seed: Seed = {}) {
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

  async applyTicketAction(
    accessContext: AccessContext,
    input: TicketAction & { ticketId: string }
  ) {
    assertPermission(accessContext, "ticket:write");
    const ticket = requireFound(
      this.repository.getTicket(accessContext, input.ticketId),
      "ticket not found"
    );
    const updated = applyHandoffTicketAction(ticket, input);
    return { ticket: this.repository.saveTicket(updated) };
  }
}

@Controller("conversation-ticket")
@UseGuards(ApiAccessContextGuard)
export class ConversationTicketController {
  constructor(private readonly service: ConversationTicketService) {}

  @Get("conversations")
  listConversations(
    @Req() request: ApiRequestWithContext,
    @Query() query: Record<string, string | string[] | undefined>
  ) {
    return this.service.listConversations(
      requireAccessContext(request),
      parseConversationFilters(query)
    );
  }

  @Get("conversations/:conversationId")
  getConversationDetail(
    @Req() request: ApiRequestWithContext,
    @Param("conversationId") conversationId: string
  ) {
    return this.service.getConversationDetail(
      requireAccessContext(request),
      conversationId
    );
  }

  @Post("conversations/:conversationId/handoff")
  createHandoffTicket(
    @Req() request: ApiRequestWithContext,
    @Param("conversationId") conversationId: string,
    @Body() body: HandoffBody
  ) {
    return this.service.createHandoffTicket(requireAccessContext(request), {
      conversationId,
      reason: requireText(body.reason, "reason"),
      slaPolicyRef: requireText(body.slaPolicyRef, "slaPolicyRef")
    });
  }

  @Post("tickets/:ticketId/actions")
  applyTicketAction(
    @Req() request: ApiRequestWithContext,
    @Param("ticketId") ticketId: string,
    @Body() body: TicketActionBody
  ) {
    const accessContext = requireAccessContext(request);
    return this.service.applyTicketAction(accessContext, {
      ...body,
      actorUserId: body.actorUserId ?? accessContext.userId,
      ticketId
    });
  }
}

function parseConversationFilters(
  query: Record<string, string | string[] | undefined>
): ConversationListFilters {
  return {
    awaitingReply: readBoolean(query.awaitingReply),
    slaRiskOnly: readBoolean(query.slaRiskOnly),
    status: readStatus(query.status),
    unreadOnly: readBoolean(query.unreadOnly)
  };
}

function readStatus(
  value: string | string[] | undefined
): ConversationFilterStatus | undefined {
  const status = readFirst(value);
  if (!status) return undefined;
  if (["closed", "handoff", "open", "pending_handoff"].includes(status)) {
    return status as ConversationFilterStatus;
  }
  throw new Error("conversation status is invalid");
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

function requireAccessContext(request: ApiRequestWithContext): AccessContext {
  if (!request.accessContext) throw new Error("access context is required");
  return request.accessContext;
}

function requireFound<T>(value: T | undefined, message: string): T {
  if (!value) throw new Error(message);
  return value;
}

function readBoolean(value: string | string[] | undefined): boolean | undefined {
  const text = readFirst(value);
  if (text === undefined) return undefined;
  return text === "true" || text === "1";
}

function readFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function requireText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
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

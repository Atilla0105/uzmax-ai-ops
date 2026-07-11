import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";

import type { AccessContext } from "../../../packages/authz/src/index.ts";
import { ApiAccessContextGuard } from "./access-context.ts";
import {
  missingAccessContext,
  requireText,
  toConversationTicketHttpException,
  validationError
} from "./conversation-ticket.errors.ts";
import { ConversationTicketService } from "./conversation-ticket.service.ts";
import type {
  ApiRequestWithContext,
  ConversationFilterStatus,
  ConversationListFilters,
  HandoffBody,
  TicketActionBody,
  TicketActionRequest
} from "./conversation-ticket.types.ts";

@Controller("conversation-ticket")
@UseGuards(ApiAccessContextGuard)
export class ConversationTicketController {
  constructor(private readonly service: ConversationTicketService) {}

  @Get("conversations")
  listConversations(
    @Req() request: ApiRequestWithContext,
    @Query() query: Record<string, string | string[] | undefined>
  ) {
    return this.handle(() =>
      this.service.listConversations(
        requireAccessContext(request),
        parseConversationFilters(query)
      )
    );
  }

  @Get("conversations/:conversationId")
  getConversationDetail(
    @Req() request: ApiRequestWithContext,
    @Param("conversationId") conversationId: string
  ) {
    return this.handle(() =>
      this.service.getConversationDetail(requireAccessContext(request), conversationId)
    );
  }

  @Post("conversations/:conversationId/handoff")
  createHandoffTicket(
    @Req() request: ApiRequestWithContext,
    @Param("conversationId") conversationId: string,
    @Body() body: unknown = {}
  ) {
    return this.handle(() => {
      const handoffBody = readBodyObject<HandoffBody>(body);
      return this.service.createHandoffTicket(requireAccessContext(request), {
        conversationId,
        reason: requireBoundedText(handoffBody.reason, "reason", 500)
      });
    });
  }

  @Post("tickets/:ticketId/actions")
  applyTicketAction(
    @Req() request: ApiRequestWithContext,
    @Param("ticketId") ticketId: string,
    @Body() body: unknown = {}
  ) {
    return this.handle(() => {
      const accessContext = requireAccessContext(request);
      const actionBody = readBodyObject<TicketActionBody>(body);
      return this.service.applyTicketAction(accessContext, {
        ...readTicketAction(actionBody),
        ticketId
      });
    });
  }

  private async handle<T>(action: () => Promise<T> | T): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toConversationTicketHttpException(error);
    }
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
  throw validationError("conversation status is invalid");
}

function requireAccessContext(request: ApiRequestWithContext): AccessContext {
  if (!request.accessContext) throw missingAccessContext();
  return request.accessContext;
}

function readBodyObject<T extends Record<string, unknown>>(body: unknown): Partial<T> {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  return body as Partial<T>;
}

function readTicketAction(body: Partial<TicketActionBody>): TicketActionRequest {
  const type = typeof body.type === "string" ? body.type.trim() : "";
  if (["claim", "lock"].includes(type)) {
    return { type: type as "claim" | "lock" };
  }
  if (type === "close") {
    return {
      destination: requireBoundedText(body.destination, "destination", 500),
      expectedLifecycleEventId: requireUuid(
        body.expectedLifecycleEventId,
        "expectedLifecycleEventId"
      ),
      requestId: requireUuid(body.requestId, "requestId"),
      result: requireCloseResult(body.result),
      type
    };
  }
  if (type === "reopen") {
    return {
      expectedClosedEventId: requireUuid(
        body.expectedClosedEventId,
        "expectedClosedEventId"
      ),
      reason: requireBoundedText(body.reason, "reason", 500),
      requestId: requireUuid(body.requestId, "requestId"),
      type
    };
  }
  if (type === "note") {
    return { note: requireBoundedText(body.note, "note", 2_000), type };
  }
  if (type === "escalate") {
    return {
      reason: requireBoundedText(body.reason, "reason", 500),
      type
    };
  }
  throw validationError("ticket action type is invalid");
}

function requireCloseResult(
  value: unknown
): Extract<TicketActionRequest, { type: "close" }>["result"] {
  const result = typeof value === "string" ? value.trim() : "";
  if (
    [
      "duplicate",
      "invalid",
      "no_response",
      "resolved",
      "transferred_to_human_channel"
    ].includes(result)
  ) {
    return result as Extract<TicketActionRequest, { type: "close" }>["result"];
  }
  throw validationError("close result is invalid");
}

function requireUuid(value: unknown, name: string): string {
  const text = requireText(value, name);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      text
    )
  ) {
    throw validationError(`${name} must be a UUID`);
  }
  return text;
}

function requireBoundedText(value: unknown, name: string, maximum: number): string {
  const text = requireText(value, name);
  if (text.length > maximum) {
    throw validationError(`${name} must be at most ${maximum} characters`);
  }
  return text;
}

function readBoolean(value: string | string[] | undefined): boolean | undefined {
  const text = readFirst(value);
  if (text === undefined) return undefined;
  return text === "true" || text === "1";
}

function readFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

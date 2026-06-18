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
  TicketActionBody
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
        reason: requireText(handoffBody.reason, "reason"),
        slaPolicyRef: requireText(handoffBody.slaPolicyRef, "slaPolicyRef")
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
        ...actionBody,
        actorUserId: accessContext.userId,
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

function readBoolean(value: string | string[] | undefined): boolean | undefined {
  const text = readFirst(value);
  if (text === undefined) return undefined;
  return text === "true" || text === "1";
}

function readFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

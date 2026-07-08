import { randomUUID } from "node:crypto";

import {
  createHumanHandoff,
  createTicketState
} from "../../../packages/capabilities/handoff/src/index.ts";
import type { RlsTenantContext } from "../../../packages/db/src/index.ts";
import type { TelegramBotConversationJobPayload } from "../../../packages/channels/src/index.ts";

type ConversationDraft = RlsTenantContext & {
  channelConnectionId: string;
  externalConversationRef: string;
  id: string;
  participantExternalRef: string;
};
type TicketDraft = RlsTenantContext &
  Record<"conversationId" | "id" | "summary", string>;
type TicketEventDraft = RlsTenantContext &
  Record<"id" | "ticketId" | "traceId", string>;

export function createTelegramBotTicketFollowUp(input: {
  conversation: ConversationDraft;
  payload: Pick<
    TelegramBotConversationJobPayload,
    "contentKind" | "orgId" | "tenantId" | "traceId"
  >;
  reasonCode: string;
}): { ticket: TicketDraft; ticketEvent: TicketEventDraft } {
  const ticketId = randomUUID();
  const systemUserId = "00000000-0000-4000-8000-000000000005";
  const handoff = createHumanHandoff({
    conversation: {
      ...input.conversation,
      status: "open",
      unreadCount: 1
    },
    reason: `telegram_bot_${input.payload.contentKind}_${safeReasonCode(
      input.reasonCode
    )}`,
    requestedByUserId: systemUserId,
    slaPolicyRef: "m8-01-bot-runtime-answer-loop-v0"
  });
  const ticket = createTicketState({
    conversationId: input.conversation.id,
    events: [],
    id: ticketId,
    orgId: input.payload.orgId,
    priority: handoff.ticketDraft.priority,
    sla: handoff.ticketDraft.sla,
    status: "open",
    suggestedAction: handoff.ticketDraft.suggestedAction,
    summary: handoff.ticketDraft.summary,
    tenantId: input.payload.tenantId
  });

  return {
    ticket: {
      conversationId: input.conversation.id,
      id: ticket.id,
      orgId: input.payload.orgId,
      summary: ticket.summary,
      tenantId: input.payload.tenantId
    },
    ticketEvent: {
      id: randomUUID(),
      orgId: input.payload.orgId,
      tenantId: input.payload.tenantId,
      ticketId: ticket.id,
      traceId: input.payload.traceId
    }
  };
}

function safeReasonCode(value: unknown): string {
  const text = typeof value === "string" ? value : "unknown";
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_:.-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 96) || "unknown"
  );
}

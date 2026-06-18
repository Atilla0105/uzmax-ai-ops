import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type {
  HandoffConversation,
  TicketAction,
  TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";

export type ConversationFilterStatus =
  | "closed"
  | "handoff"
  | "open"
  | "pending_handoff";

export type ConversationListFilters = {
  awaitingReply?: boolean;
  slaRiskOnly?: boolean;
  status?: ConversationFilterStatus;
  unreadOnly?: boolean;
};

export type ConversationMessage = Record<
  "conversationId" | "id" | "occurredAt" | "orgId" | "tenantId",
  string
> & {
  content: Record<string, unknown>;
  contentKind: "callback" | "image" | "system" | "text" | "unsupported" | "voice";
  direction: "inbound" | "internal" | "outbound";
};

export type ConversationTicketSeed = {
  conversations?: readonly HandoffConversation[];
  messages?: readonly ConversationMessage[];
  tickets?: readonly TicketState[];
};

export type ApiRequestWithContext = { accessContext?: AccessContext };

export type HandoffBody = {
  reason?: unknown;
  slaPolicyRef?: unknown;
};

export type TicketActionBody = Partial<TicketAction> & {
  actorUserId?: string;
  [key: string]: unknown;
};

export type TicketActionInput = TicketActionBody & {
  ticketId: string;
};

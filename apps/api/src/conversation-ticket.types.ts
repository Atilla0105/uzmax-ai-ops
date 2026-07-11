import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type {
  HandoffConversation,
  TicketCloseResult,
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
  deliveryStatus: "cancelled" | "failed" | "queued" | "received" | "sent";
  direction: "inbound" | "internal" | "outbound";
  externalMessageRef?: string;
};

export const value0SupportSlaPolicyRef = "value0-staging-support-default-v1";

export type ConversationOperatorState = {
  activeTicketId?: string;
  canTakeover?: boolean;
  mode: "awaiting_operator" | "bot" | "closed" | "conflict" | "human";
  ownership: "conflict" | "none" | "other" | "self" | "unassigned";
};
export type ConversationDetailOperatorState = ConversationOperatorState & {
  canTakeover: boolean;
};

export type TakeoverReadiness = "atomic_ready" | "permission_blocked" | "state_blocked";

type CustomerRead = {
  id: string;
  preferredLanguage?: string;
  status: "active" | "archived";
};
type CustomerIdentityRead = {
  customerId: string;
  externalSubjectRef: string;
  firstSeenAt: string;
  id: string;
  lastSeenAt?: string;
  provider: string;
  status: "active" | "archived" | "merged";
};
type CustomerProfileRead = {
  displayName?: string;
  firstName?: string;
  languageCode?: string;
  lastName?: string;
  username?: string;
};
type ContextWithIdentity = {
  customer?: CustomerRead;
  identity: CustomerIdentityRead;
  profile?: CustomerProfileRead;
};

export type ConversationCustomerContext =
  | {
      state: "identity_ambiguous" | "identity_link_mismatch" | "identity_missing";
    }
  | (ContextWithIdentity & {
      state:
        | "customer_archived"
        | "customer_missing"
        | "identity_archived"
        | "identity_merged"
        | "linked";
    });

type ConversationCustomerContextSeed = Record<
  "conversationId" | "orgId" | "tenantId",
  string
> & { context: ConversationCustomerContext };

export type ConversationTicketSeed = {
  conversations?: readonly HandoffConversation[];
  customerContexts?: readonly ConversationCustomerContextSeed[];
  messages?: readonly ConversationMessage[];
  tickets?: readonly TicketState[];
};

export type ApiRequestWithContext = { accessContext?: AccessContext };

export type HandoffBody = {
  reason?: unknown;
  [key: string]: unknown;
};

export type TicketActionBody = {
  destination?: unknown;
  expectedClosedEventId?: unknown;
  expectedLifecycleEventId?: unknown;
  note?: unknown;
  reason?: unknown;
  requestId?: unknown;
  result?: unknown;
  type?: unknown;
  [key: string]: unknown;
};

export type TicketActionRequest =
  | { type: "claim" | "lock" }
  | {
      destination: string;
      expectedLifecycleEventId: string;
      requestId: string;
      result: TicketCloseResult;
      type: "close";
    }
  | {
      expectedClosedEventId: string;
      reason: string;
      requestId: string;
      type: "reopen";
    }
  | { note: string; type: "note" }
  | { reason: string; type: "escalate" };

export type TicketActionInput = TicketActionRequest & { ticketId: string };

export type TakeoverInput = { conversationId: string; reason: string };

export type TakeoverResult = {
  conversation: HandoffConversation;
  result: "already_owned" | "created" | "reused";
  ticket: TicketState;
};

export type TicketActionResult = {
  conversation: HandoffConversation;
  result: "already_applied" | "applied";
  ticket: TicketState;
};

type MutationResultPlan = {
  conversation: HandoffConversation;
  result?: string;
  ticket: TicketState;
};

export function ticketActionResultFrom(plan: MutationResultPlan): TicketActionResult {
  if (plan.result !== "applied" && plan.result !== "already_applied") {
    throw new Error("ticket action result is missing");
  }
  return structuredClone({
    conversation: plan.conversation,
    result: plan.result,
    ticket: plan.ticket
  });
}

export function takeoverResultFrom(plan: MutationResultPlan): TakeoverResult {
  if (!isTakeoverResult(plan.result)) throw new Error("takeover result is missing");
  return structuredClone({
    conversation: plan.conversation,
    result: plan.result,
    ticket: plan.ticket
  });
}

function isTakeoverResult(value: unknown): value is TakeoverResult["result"] {
  return ["already_owned", "created", "reused"].includes(String(value ?? ""));
}

export const packageName = "@uzmax/capability-handoff";

export type InFlightAiMessage = {
  id: string;
  status: "generating" | "pending_cancel" | "queued" | "withdrawn";
};

export type HandoffConversation = {
  aiState?: "active" | "suspended";
  awaitingReply?: boolean;
  channelConnectionId: string;
  externalConversationRef: string;
  id: string;
  inFlightAiMessages?: readonly InFlightAiMessage[];
  lastMessageAt?: string;
  orgId: string;
  participantExternalRef: string;
  slaRisk?: boolean;
  status: "closed" | "handoff" | "open" | "pending_handoff";
  subject?: string;
  tenantId: string;
  unreadCount: number;
};

export type TicketSlaContract = {
  dueAt?: string;
  policyRef: string;
  source: "config_placeholder";
};

type TicketStatus = "claimed" | "closed" | "escalated" | "locked" | "open" | "reopened";
type TicketEventType = TicketStatus | "created" | "note_added";

export type TicketCloseResult =
  | "duplicate"
  | "invalid"
  | "no_response"
  | "resolved"
  | "transferred_to_human_channel";

export type TicketEvent = {
  action?: "close" | "reopen";
  actorUserId: string;
  destination?: string;
  expectedLifecycleEventId?: string;
  id?: string;
  note?: string;
  occurredAt: string;
  reason?: string;
  requestId?: string;
  result?: TicketCloseResult;
  type: TicketEventType;
};

export type TicketState = {
  assignedUserId?: string;
  closeDestination?: string;
  closeResult?: TicketCloseResult;
  closedAt?: string;
  conversationId: string;
  events: readonly TicketEvent[];
  id: string;
  lockedByUserId?: string;
  orgId: string;
  priority: number;
  sla: TicketSlaContract;
  status: TicketStatus;
  suggestedAction: string;
  summary: string;
  tenantId: string;
};

export type HumanHandoffInput = {
  conversation: HandoffConversation;
  now?: string;
  reason: string;
  requestedByUserId: string;
  slaDueAt?: string;
  slaPolicyRef: string;
};

export type TicketAction =
  | { actorUserId: string; now?: string; type: "claim" }
  | { actorUserId: string; now?: string; type: "lock" }
  | { actorUserId: string; note: string; now?: string; type: "note" }
  | { actorUserId: string; now?: string; reason: string; type: "escalate" }
  | {
      actorUserId: string;
      destination: string;
      now?: string;
      result: TicketCloseResult;
      type: "close";
    }
  | { actorUserId: string; now?: string; reason: string; type: "reopen" };

export type TicketDomainErrorCode =
  | "atomic_lifecycle_required"
  | "invalid_action_type"
  | "invalid_priority"
  | "locked_by_another_user"
  | "missing_required_field";

export class TicketDomainError extends Error {
  constructor(
    readonly code: TicketDomainErrorCode,
    message: string
  ) {
    super(message);
    this.name = "TicketDomainError";
  }
}

export function createHumanHandoff(input: HumanHandoffInput) {
  const occurredAt = input.now ?? new Date().toISOString();
  const inFlightAiMessages = cancelInFlightAiMessages(
    input.conversation.inFlightAiMessages ?? []
  );
  const conversation = {
    ...input.conversation,
    aiState: "suspended" as const,
    inFlightAiMessages,
    slaRisk: true,
    status: "pending_handoff" as const
  };
  const ticketDraft = {
    conversationId: input.conversation.id,
    priority: 3,
    requestedByUserId: input.requestedByUserId,
    sla: createSlaContract(input.slaPolicyRef, input.slaDueAt),
    status: "open" as const,
    suggestedAction: suggestedAction(input.reason),
    summary: handoffSummary(input.conversation, input.reason),
    tenantId: input.conversation.tenantId,
    timestamp: occurredAt
  };

  return { conversation, inFlightAiMessages, ticketDraft };
}

export function createTicketState(input: TicketState): TicketState {
  return {
    ...input,
    events: [...input.events],
    priority: requirePriority(input.priority)
  };
}

export function applyTicketAction(ticket: TicketState, action: TicketAction) {
  switch (action.type) {
    case "claim":
      assertLockOwner(ticket, action.actorUserId);
      return nextTicket(ticket, action, {
        assignedUserId: action.actorUserId,
        status: "claimed"
      });
    case "lock":
      assertLockOwner(ticket, action.actorUserId);
      return nextTicket(ticket, action, {
        lockedByUserId: action.actorUserId,
        status: "locked"
      });
    case "note":
      assertLockOwner(ticket, action.actorUserId);
      return nextTicket(ticket, action, {});
    case "escalate":
      assertLockOwner(ticket, action.actorUserId);
      return nextTicket(ticket, action, { status: "escalated" });
    case "close":
    case "reopen":
      throw new TicketDomainError(
        "atomic_lifecycle_required",
        "close and reopen require the atomic conversation lifecycle writer"
      );
    default:
      throw new TicketDomainError(
        "invalid_action_type",
        "ticket action type is invalid"
      );
  }
}

function cancelInFlightAiMessages(
  messages: readonly InFlightAiMessage[]
): InFlightAiMessage[] {
  return messages.map((message) => ({
    ...message,
    status: message.status === "queued" ? "withdrawn" : "pending_cancel"
  }));
}

function createSlaContract(policyRef: string, dueAt?: string): TicketSlaContract {
  return {
    ...(dueAt ? { dueAt } : {}),
    policyRef: requireText(policyRef, "sla policyRef"),
    source: "config_placeholder"
  };
}

function handoffSummary(conversation: HandoffConversation, reason: string): string {
  const subject = conversation.subject ? `${conversation.subject}: ` : "";
  return `${subject}${requireText(reason, "handoff reason")}`;
}

function suggestedAction(reason: string): string {
  return `Review conversation context and respond from approved data. Reason: ${requireText(
    reason,
    "handoff reason"
  )}`;
}

function nextTicket(
  ticket: TicketState,
  action: TicketAction,
  patch: Partial<TicketState>
): TicketState {
  return {
    ...ticket,
    ...patch,
    events: [
      ...ticket.events,
      {
        actorUserId: action.actorUserId,
        note: action.type === "note" ? requireText(action.note, "note") : undefined,
        occurredAt: action.now ?? new Date().toISOString(),
        reason: "reason" in action ? requireText(action.reason, "reason") : undefined,
        type: eventTypeForAction(action.type)
      }
    ]
  };
}

function eventTypeForAction(action: TicketAction["type"]): TicketEvent["type"] {
  if (action === "claim") return "claimed";
  if (action === "close") return "closed";
  if (action === "escalate") return "escalated";
  if (action === "lock") return "locked";
  if (action === "note") return "note_added";
  return "reopened";
}

function assertLockOwner(ticket: TicketState, actorUserId: string): void {
  if (ticket.lockedByUserId && ticket.lockedByUserId !== actorUserId) {
    throw new TicketDomainError(
      "locked_by_another_user",
      "ticket is locked by another user"
    );
  }
}

function requirePriority(priority: number): number {
  if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
    throw new TicketDomainError(
      "invalid_priority",
      "ticket priority must be an integer from 1 to 5"
    );
  }
  return priority;
}

function requireText(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new TicketDomainError("missing_required_field", `${name} is required`);
  }
  return trimmed;
}

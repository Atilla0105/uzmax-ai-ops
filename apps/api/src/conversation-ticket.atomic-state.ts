import { randomUUID } from "node:crypto";

import type {
  HandoffConversation,
  TicketEvent,
  TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";
import { stateConflict, validationError } from "./conversation-ticket.errors.ts";
import type { TakeoverResult, TicketActionInput } from "./conversation-ticket.types.ts";
import { value0SupportSlaPolicyRef } from "./conversation-ticket.types.ts";

export type AtomicMutationPlan = {
  conversation: HandoffConversation;
  newEvents: TicketEvent[];
  result?: TakeoverResult["result"];
  ticket: TicketState;
};

type ActionType = "claim" | "escalate" | "lock" | "note";
type ActorRelation = "none" | "other" | "self";
type TicketShape = "assigned" | "invalid" | "none" | "owned" | "unassigned";
type TakeoverOutcome = "already_owned" | "create" | "reuse_one" | "reuse_two";

const suggestedAction = "Review conversation context and respond from approved data.";
const actionEventTypes = {
  claim: "claimed",
  escalate: "escalated",
  lock: "locked",
  note: "note_added"
} as const;
const takeoverMatrix: Readonly<Record<string, TakeoverOutcome>> = {
  "handoff:assigned:self": "reuse_one",
  "handoff:owned:self": "already_owned",
  "open:assigned:self": "reuse_one",
  "open:none:none": "create",
  "open:unassigned:none": "reuse_two",
  "pending_handoff:assigned:self": "reuse_one",
  "pending_handoff:unassigned:none": "reuse_two"
};
const allowedActions = new Set([
  "claim:open:open:unassigned:none",
  "claim:pending_handoff:open:unassigned:none",
  "escalate:handoff:locked:owned:self",
  "lock:handoff:claimed:assigned:self",
  "lock:handoff:reopened:assigned:self",
  "note:handoff:claimed:assigned:self",
  "note:handoff:escalated:owned:self",
  "note:handoff:locked:owned:self",
  "note:handoff:reopened:assigned:self"
]);

export function canTakeoverConversation(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  actorUserId: string
): boolean {
  try {
    takeoverDecision(conversation, active(tickets), actorUserId);
    return true;
  } catch {
    return false;
  }
}

export function planTakeover(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  reasonInput: unknown,
  actorUserId: string
): AtomicMutationPlan {
  const reason = bounded(reasonInput, "reason", 500);
  const decision = takeoverDecision(conversation, active(tickets), actorUserId);
  if (decision.outcome === "create") {
    const ticket = newTicket(conversation, reason, actorUserId);
    const newEvents = eventsFor(ticket, actorUserId, reason, [
      "created",
      "claimed",
      "locked"
    ]);
    return {
      conversation: toHandoff(conversation),
      newEvents,
      result: "created",
      ticket: { ...ticket, events: newEvents }
    };
  }
  if (!decision.ticket) throw stateConflict();
  if (decision.outcome === "already_owned") {
    return {
      conversation,
      newEvents: [],
      result: "already_owned",
      ticket: decision.ticket
    };
  }
  const types =
    decision.outcome === "reuse_two"
      ? (["claimed", "locked"] as const)
      : (["locked"] as const);
  const newEvents = eventsFor(decision.ticket, actorUserId, reason, types);
  return {
    conversation: toHandoff(conversation),
    newEvents,
    result: "reused",
    ticket: {
      ...decision.ticket,
      assignedUserId: actorUserId,
      events: [...decision.ticket.events, ...newEvents],
      lockedByUserId: actorUserId,
      status: "locked"
    }
  };
}

export function planTicketAction(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  input: TicketActionInput,
  actorUserId: string
): AtomicMutationPlan {
  const activeTickets = active(tickets);
  const ticket = activeTickets[0];
  if (activeTickets.length !== 1 || ticket?.id !== input.ticketId) {
    throw stateConflict();
  }
  if (input.type === "close" || input.type === "reopen") throw stateConflict();
  const shape = ticketShape(ticket);
  const relation = actorRelation(ticket, actorUserId);
  const key = [input.type, conversation.status, ticket.status, shape, relation].join(
    ":"
  );
  if (!allowedActions.has(key)) throw stateConflict();
  const text = actionText(input);
  const event = eventsFor(ticket, actorUserId, text.reason, [
    actionEventTypes[input.type]
  ])[0];
  if (!event) throw stateConflict();
  if (text.note) event.note = text.note;
  return {
    conversation,
    newEvents: [event],
    ticket: {
      ...ticket,
      ...actionPatch(input.type, actorUserId),
      events: [...ticket.events, event]
    }
  };
}

function takeoverDecision(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  actorUserId: string
): { outcome: TakeoverOutcome; ticket?: TicketState } {
  if (tickets.length > 1) throw stateConflict();
  const ticket = tickets[0];
  const shape = ticket ? ticketShape(ticket) : "none";
  const relation = ticket ? actorRelation(ticket, actorUserId) : "none";
  const outcome = takeoverMatrix[`${conversation.status}:${shape}:${relation}`];
  if (!outcome) throw stateConflict();
  return { outcome, ticket };
}

function actionText(input: TicketActionInput): { note?: string; reason?: string } {
  if (input.type === "note") return { note: bounded(input.note, "note", 2_000) };
  if (input.type === "escalate") {
    return { reason: bounded(input.reason, "reason", 500) };
  }
  return {};
}

function actionPatch(type: ActionType, actorUserId: string): Partial<TicketState> {
  if (type === "claim") return { assignedUserId: actorUserId, status: "claimed" };
  if (type === "lock") {
    return { lockedByUserId: actorUserId, status: "locked" };
  }
  return type === "escalate" ? { status: "escalated" } : {};
}

function newTicket(
  conversation: HandoffConversation,
  reason: string,
  actorUserId: string
): TicketState {
  return {
    assignedUserId: actorUserId,
    conversationId: conversation.id,
    events: [],
    id: randomUUID(),
    lockedByUserId: actorUserId,
    orgId: conversation.orgId,
    priority: 3,
    sla: { policyRef: value0SupportSlaPolicyRef, source: "config_placeholder" },
    status: "locked",
    suggestedAction,
    summary: `Human takeover: ${reason}`,
    tenantId: conversation.tenantId
  };
}

function eventsFor(
  ticket: TicketState,
  actorUserId: string,
  reason: string | undefined,
  types: readonly TicketEvent["type"][]
): TicketEvent[] {
  const base = nextEventTime(ticket.events);
  return types.map((type, index) => ({
    actorUserId,
    id: randomUUID(),
    occurredAt: new Date(base + index).toISOString(),
    reason,
    type
  }));
}

function nextEventTime(events: readonly TicketEvent[]): number {
  const times = events
    .map((event) => Date.parse(event.occurredAt))
    .filter(Number.isFinite);
  return Math.max(Date.now(), (times.length ? Math.max(...times) : 0) + 1);
}

function ticketShape(ticket: TicketState): TicketShape {
  if (ticket.status === "open" && !ticket.assignedUserId && !ticket.lockedByUserId) {
    return "unassigned";
  }
  if (
    ["claimed", "reopened"].includes(ticket.status) &&
    ticket.assignedUserId &&
    !ticket.lockedByUserId
  ) {
    return "assigned";
  }
  if (
    ["locked", "escalated"].includes(ticket.status) &&
    ticket.assignedUserId &&
    ticket.assignedUserId === ticket.lockedByUserId
  ) {
    return "owned";
  }
  return "invalid";
}

function actorRelation(ticket: TicketState, actorUserId: string): ActorRelation {
  if (!ticket.assignedUserId) return "none";
  return ticket.assignedUserId === actorUserId ? "self" : "other";
}

function active(tickets: readonly TicketState[]): TicketState[] {
  return tickets
    .filter((ticket) => ticket.status !== "closed")
    .sort((left, right) => left.id.localeCompare(right.id));
}

function toHandoff(conversation: HandoffConversation): HandoffConversation {
  return { ...conversation, aiState: "suspended", slaRisk: true, status: "handoff" };
}

function bounded(value: unknown, name: string, maximum: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw validationError(`${name} is required`);
  }
  const text = value.trim();
  if (text.length > maximum) {
    throw validationError(`${name} must be at most ${maximum} characters`);
  }
  return text;
}

import { randomUUID } from "node:crypto";

import type {
  HandoffConversation,
  TicketCloseResult,
  TicketEvent,
  TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";
import type { AtomicMutationPlan } from "./conversation-ticket.atomic-state.ts";
import { stateConflict, validationError } from "./conversation-ticket.errors.ts";
import type { TicketActionInput } from "./conversation-ticket.types.ts";

type Anchor = { event: TicketEvent; ticket: TicketState };
type CloseInput = Extract<TicketActionInput, { type: "close" }>;
type ReopenInput = Extract<TicketActionInput, { type: "reopen" }>;

const closeResults = new Set<TicketCloseResult>([
    "duplicate",
    "invalid",
    "no_response",
    "resolved",
    "transferred_to_human_channel"
  ]),
  uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function planLifecycleTicketAction(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  input: CloseInput | ReopenInput,
  actorUserId: string
): AtomicMutationPlan {
  return input.type === "close"
    ? planClose(conversation, tickets, input, actorUserId)
    : planReopen(conversation, tickets, input, actorUserId);
}

function planClose(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  input: CloseInput,
  actorUserId: string
): AtomicMutationPlan {
  const command = commandInput(input.requestId, input.expectedLifecycleEventId);
  const destination = bounded(input.destination, "destination", 500);
  const result = closeResult(input.result);
  const replay = requestEvent(tickets, command.requestId);
  if (replay) {
    exactEvent(replay, input.ticketId, actorUserId, "close", {
      destination,
      expectedLifecycleEventId: command.expectedEventId,
      result,
      type: "closed"
    });
    return noOp(conversation, replay.ticket, "already_applied");
  }
  const target = closeTarget(conversation, tickets, actorUserId);
  if (
    [
      target.ticket.id !== input.ticketId,
      target.event.id !== command.expectedEventId
    ].some(Boolean)
  ) {
    throw stateConflict();
  }
  const occurredAt = eventTime(target.ticket.events);
  const event: TicketEvent = {
    action: "close",
    actorUserId,
    destination,
    expectedLifecycleEventId: command.expectedEventId,
    id: randomUUID(),
    occurredAt,
    requestId: command.requestId,
    result,
    type: "closed"
  };
  return {
    conversation: transition(conversation, "closed"),
    newEvents: [event],
    result: "applied",
    ticket: {
      ...target.ticket,
      closeDestination: destination,
      closeResult: result,
      closedAt: occurredAt,
      events: [...target.ticket.events, event],
      lockedByUserId: undefined,
      status: "closed"
    }
  };
}

function planReopen(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  input: ReopenInput,
  actorUserId: string
): AtomicMutationPlan {
  const command = commandInput(input.requestId, input.expectedClosedEventId);
  const reason = bounded(input.reason, "reason", 500);
  const replay = requestEvent(tickets, command.requestId);
  if (replay) {
    exactEvent(replay, input.ticketId, actorUserId, "reopen", {
      expectedLifecycleEventId: command.expectedEventId,
      reason,
      type: "reopened"
    });
    return noOp(conversation, replay.ticket, "already_applied");
  }
  if (!closedState(conversation, tickets)) throw stateConflict();
  const closed = latestClosedLifecycle(tickets);
  if (
    [
      closed.ticket.id !== input.ticketId,
      closed.event.id !== command.expectedEventId
    ].some(Boolean)
  ) {
    throw stateConflict();
  }
  const event: TicketEvent = {
    action: "reopen",
    actorUserId,
    expectedLifecycleEventId: command.expectedEventId,
    id: randomUUID(),
    occurredAt: eventTime(closed.ticket.events),
    reason,
    requestId: command.requestId,
    type: "reopened"
  };
  return {
    conversation: transition(conversation, "handoff"),
    newEvents: [event],
    result: "applied",
    ticket: {
      ...closed.ticket,
      assignedUserId: actorUserId,
      closeDestination: undefined,
      closeResult: undefined,
      closedAt: undefined,
      events: [...closed.ticket.events, event],
      lockedByUserId: undefined,
      status: "reopened"
    }
  };
}

function closeTarget(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  actorUserId: string
): Anchor {
  const current = active(tickets);
  const ticket = current[0];
  const event = ticket ? latestEvent(ticket.events) : undefined;
  const invalid = [
    conversation.status !== "handoff",
    current.length !== 1,
    !ticket,
    !event?.id,
    !ticket || !["escalated", "locked"].includes(ticket.status),
    ticket?.assignedUserId !== actorUserId,
    ticket?.lockedByUserId !== actorUserId
  ];
  if (invalid.some(Boolean) || !ticket || !event) throw stateConflict();
  return { event, ticket };
}

function latestClosedLifecycle(tickets: readonly TicketState[]): Anchor {
  const closed = tickets.filter((ticket) => ticket.status === "closed");
  if (closed.length === 0 || closed.some(invalidClosedAt)) throw stateConflict();
  const ticket = [...closed].sort(compareClosed)[0] as TicketState;
  const event = latestEvent(ticket.events.filter((item) => item.type === "closed"));
  if (!event || !validClosedEvent(ticket, event)) throw stateConflict();
  return { event, ticket };
}

function requestEvent(
  tickets: readonly TicketState[],
  requestId: string
): Anchor | undefined {
  const matches = tickets.flatMap((ticket) =>
    ticket.events
      .filter((event) => event.requestId === requestId)
      .map((event) => ({ event, ticket }))
  );
  if (matches.length > 1) throw stateConflict();
  return matches[0];
}

function exactEvent(
  replay: Anchor,
  ticketId: string,
  actorUserId: string,
  action: TicketEvent["action"],
  expected: Partial<TicketEvent>
): void {
  const invalid = [
    replay.ticket.id !== ticketId,
    replay.event.actorUserId !== actorUserId,
    replay.event.action !== action,
    ...Object.entries(expected).map(
      ([key, value]) => replay.event[key as keyof TicketEvent] !== value
    )
  ];
  if (invalid.some(Boolean)) throw stateConflict();
}

function validClosedEvent(ticket: TicketState, event: TicketEvent): boolean {
  return [
    Boolean(event.id),
    Boolean(ticket.assignedUserId),
    event.occurredAt === ticket.closedAt,
    event.actorUserId === ticket.assignedUserId,
    event.action === "close",
    validUuid(event.requestId),
    validUuid(event.expectedLifecycleEventId),
    Boolean(event.result && closeResults.has(event.result)),
    typeof event.destination === "string" &&
      Boolean(event.destination.trim()) &&
      event.destination.length <= 500
  ].every(Boolean);
}

function noOp(
  conversation: HandoffConversation,
  ticket: TicketState,
  result: "already_applied"
): AtomicMutationPlan {
  return { conversation, newEvents: [], result, ticket };
}

function commandInput(requestId: string, expectedEventId: string) {
  return {
    expectedEventId: uuid(expectedEventId, "expected lifecycle event id"),
    requestId: uuid(requestId, "request id")
  };
}

function closeResult(value: TicketCloseResult): TicketCloseResult {
  if (!closeResults.has(value)) throw validationError("close result is invalid");
  return value;
}

const closedState = (
  conversation: HandoffConversation,
  tickets: readonly TicketState[]
) => conversation.status === "closed" && active(tickets).length === 0;

const active = (tickets: readonly TicketState[]) =>
  tickets.filter((ticket) => ticket.status !== "closed");

function compareClosed(left: TicketState, right: TicketState): number {
  return (
    Date.parse(right.closedAt as string) - Date.parse(left.closedAt as string) ||
    right.id.localeCompare(left.id)
  );
}

const invalidClosedAt = (ticket: TicketState) =>
  !ticket.closedAt || !Number.isFinite(Date.parse(ticket.closedAt));

function latestEvent(events: readonly TicketEvent[]): TicketEvent | undefined {
  return [...events].sort(
    (left, right) =>
      Date.parse(right.occurredAt) - Date.parse(left.occurredAt) ||
      (right.id ?? "").localeCompare(left.id ?? "")
  )[0];
}

function eventTime(events: readonly TicketEvent[]): string {
  const latest = events
    .map((event) => Date.parse(event.occurredAt))
    .filter(Number.isFinite);
  return new Date(
    Math.max(Date.now(), (latest.length ? Math.max(...latest) : 0) + 1)
  ).toISOString();
}

function transition(
  conversation: HandoffConversation,
  status: "closed" | "handoff"
): HandoffConversation {
  const handoff = status === "handoff";
  return {
    ...conversation,
    aiState: "suspended",
    awaitingReply: handoff && conversation.unreadCount > 0,
    slaRisk: handoff,
    status,
    ...(status === "closed" ? { unreadCount: 0 } : {})
  };
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

function uuid(value: unknown, name: string): string {
  if (!validUuid(value)) {
    throw validationError(`${name} must be a UUID`);
  }
  return value;
}

const validUuid = (value: unknown): value is string =>
  typeof value === "string" && uuidPattern.test(value);

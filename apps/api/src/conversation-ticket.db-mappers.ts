import type {
  HandoffConversation,
  TicketEvent,
  TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";

import type {
  ConversationListFilters,
  ConversationMessage
} from "./conversation-ticket.types.ts";

export type DbRow = Record<string, unknown>;

const systemActorUserId = "00000000-0000-4000-8000-000000000005";
const ticketPolicyRef = "conversation-ticket-db-readback";
const ticketSuggestedAction =
  "Review conversation context and respond from approved data.";

export function matchesConversationFilters(
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

export function compareConversationPriority(
  left: HandoffConversation,
  right: HandoffConversation
): number {
  return priority(left) - priority(right) || right.id.localeCompare(left.id);
}

export function toConversation(row: DbRow): HandoffConversation {
  const status = conversationStatus(row.status);
  const unreadCount = integer(row.unreadCount, "conversation unreadCount", 0);
  return clean({
    aiState:
      status === "handoff" || status === "pending_handoff" ? "suspended" : "active",
    awaitingReply: unreadCount > 0 && status !== "closed",
    channelConnectionId: requiredText(
      row.channelConnectionId,
      "conversation channelConnectionId"
    ),
    externalConversationRef: requiredText(
      row.externalConversationRef,
      "conversation externalConversationRef"
    ),
    id: requiredText(row.id, "conversation id"),
    lastMessageAt: iso(row.lastMessageAt),
    orgId: requiredText(row.orgId, "conversation orgId"),
    participantExternalRef: requiredText(
      row.participantExternalRef,
      "conversation participantExternalRef"
    ),
    slaRisk: status === "handoff" || status === "pending_handoff",
    status,
    tenantId: requiredText(row.tenantId, "conversation tenantId"),
    unreadCount
  }) as HandoffConversation;
}

export function toMessage(row: DbRow): ConversationMessage {
  return {
    content: recordOrEmpty(row.content),
    contentKind: messageContentKind(row.contentKind),
    conversationId: requiredText(row.conversationId, "message conversationId"),
    direction: messageDirection(row.direction),
    id: requiredText(row.id, "message id"),
    occurredAt: requiredIso(row.occurredAt, "message occurredAt"),
    orgId: requiredText(row.orgId, "message orgId"),
    tenantId: requiredText(row.tenantId, "message tenantId")
  };
}

export function toTicket(row: DbRow, eventRows: readonly DbRow[]): TicketState {
  const id = requiredText(row.id, "ticket id");
  const events = eventRows
    .filter((event) => text(event.ticketId) === id)
    .map(toTicketEvent)
    .sort(compareOccurredAt);
  return clean({
    assignedUserId: text(row.assignedUserId),
    closedAt: iso(row.closedAt),
    conversationId: requiredText(row.conversationId, "ticket conversationId"),
    events,
    id,
    lockedByUserId: text(row.lockedByUserId),
    orgId: requiredText(row.orgId, "ticket orgId"),
    priority: integer(row.priority, "ticket priority", 3),
    sla: clean({
      dueAt: iso(row.slaDueAt),
      policyRef: ticketPolicyRef,
      source: "config_placeholder"
    }),
    status: ticketStatus(row.status),
    suggestedAction: ticketSuggestedAction,
    summary: text(row.summary) ?? "Support ticket",
    tenantId: requiredText(row.tenantId, "ticket tenantId")
  }) as TicketState;
}

export function toConversationUpdateData(
  conversation: HandoffConversation
): DbRow {
  return clean({
    lastMessageAt: conversation.lastMessageAt
      ? dateFromIso(conversation.lastMessageAt, "conversation lastMessageAt")
      : undefined,
    status: toDbEnum(conversation.status),
    unreadCount: conversation.unreadCount
  });
}

export function toTicketCreateData(ticket: TicketState): DbRow {
  return {
    ...toTicketUpdateData(ticket),
    conversationId: ticket.conversationId,
    id: ticket.id,
    orgId: ticket.orgId,
    tenantId: ticket.tenantId
  };
}

export function toTicketUpdateData(ticket: TicketState): DbRow {
  return {
    assignedUserId: nullableText(ticket.assignedUserId),
    closedAt: nullableDate(ticket.closedAt, "ticket closedAt"),
    lockedByUserId: nullableText(ticket.lockedByUserId),
    priority: ticket.priority,
    slaDueAt: nullableDate(ticket.sla.dueAt, "ticket sla dueAt"),
    status: toDbEnum(ticket.status),
    summary: ticket.summary
  };
}

export function toTicketEventCreateData(
  ticket: TicketState,
  event: TicketEvent
): DbRow {
  return clean({
    actorUserId: nullableText(event.actorUserId),
    eventType: toDbEnum(event.type),
    id: event.id,
    occurredAt: dateFromIso(event.occurredAt, "ticket event occurredAt"),
    orgId: ticket.orgId,
    payload: ticketEventPayload(ticket, event),
    tenantId: ticket.tenantId,
    ticketId: ticket.id
  });
}

export function rowArray(value: unknown, name: string): DbRow[] {
  if (!Array.isArray(value)) throw new Error(`${name} must be an array`);
  return value.map((item) => record(item, name));
}

export function record(value: unknown, name: string): DbRow {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${name} must be an object`);
  return value as DbRow;
}

export function requiredText(value: unknown, name: string): string {
  const out = text(value);
  if (!out) throw new Error(`${name} is required`);
  return out;
}

export function compareOccurredAt(
  left: { occurredAt: string },
  right: { occurredAt: string }
): number {
  return Date.parse(left.occurredAt) - Date.parse(right.occurredAt);
}

export function compareTicketEventRows(left: DbRow, right: DbRow): number {
  return (
    Date.parse(requiredIso(left.occurredAt, "ticket event occurredAt")) -
      Date.parse(requiredIso(right.occurredAt, "ticket event occurredAt")) ||
    requiredText(left.id, "ticket event id").localeCompare(
      requiredText(right.id, "ticket event id")
    )
  );
}

function priority(conversation: HandoffConversation): number {
  if (conversation.status === "pending_handoff") return 0;
  if (conversation.slaRisk) return 1;
  return 2;
}

function toTicketEvent(row: DbRow): TicketEvent {
  const payload = recordOrEmpty(row.payload);
  return clean({
    actorUserId: text(row.actorUserId) ?? systemActorUserId,
    id: requiredText(row.id, "ticket event id"),
    note: text(payload.note) ?? text(payload.comment),
    occurredAt: requiredIso(row.occurredAt, "ticket event occurredAt"),
    reason: text(payload.reason),
    type: ticketEventType(row.eventType)
  }) as TicketEvent;
}

function ticketEventPayload(ticket: TicketState, event: TicketEvent): DbRow {
  return clean({
    destination: event.type === "closed" ? ticket.closeDestination : undefined,
    note: event.note,
    reason: event.reason,
    result: event.type === "closed" ? ticket.closeResult : undefined
  });
}

function recordOrEmpty(value: unknown): DbRow {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DbRow)
    : {};
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function integer(value: unknown, name: string, fallback: number): number {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "number" || !Number.isInteger(value))
    throw new Error(`${name} must be an integer`);
  return value;
}

function iso(value: unknown): string | undefined {
  return value instanceof Date ? value.toISOString() : text(value);
}

function requiredIso(value: unknown, name: string): string {
  const out = iso(value);
  if (!out) throw new Error(`${name} is required`);
  return out;
}

function dateFromIso(value: string, name: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${name} is invalid`);
  return date;
}

function nullableDate(value: string | undefined, name: string): Date | null {
  return value ? dateFromIso(value, name) : null;
}

function nullableText(value: string | undefined): string | null {
  return text(value) ?? null;
}

function toDbEnum(value: string): string {
  return value.toUpperCase();
}

function conversationStatus(value: unknown): HandoffConversation["status"] {
  return enumValue(value, ["closed", "handoff", "open", "pending_handoff"], "status");
}
function messageDirection(value: unknown): ConversationMessage["direction"] {
  return enumValue(value, ["inbound", "internal", "outbound"], "direction");
}
function messageContentKind(value: unknown): ConversationMessage["contentKind"] {
  return enumValue(
    value,
    ["callback", "image", "system", "text", "unsupported", "voice"],
    "contentKind"
  );
}
function ticketStatus(value: unknown): TicketState["status"] {
  return enumValue(
    value,
    ["claimed", "closed", "escalated", "locked", "open", "reopened"],
    "ticket status"
  );
}
function ticketEventType(value: unknown): TicketEvent["type"] {
  const normalized = normalizeEnum(value);
  if (normalized === "status_changed") return "note_added";
  return enumValue(
    value,
    ["claimed", "closed", "created", "escalated", "locked", "note_added", "reopened"],
    "ticket event type"
  );
}
function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  name: string
): T {
  const normalized = normalizeEnum(value);
  if (allowed.includes(normalized as T)) return normalized as T;
  throw new Error(`${name} is invalid`);
}
function normalizeEnum(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}
function clean<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as T;
}

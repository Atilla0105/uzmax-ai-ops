import { normalizeTelegramBotParticipantProfile } from "../../../packages/channels/src/telegram-bot-inbound-contract.ts";
import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type {
  HandoffConversation,
  TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";
import { scopeFromAccessContext } from "./conversation-ticket.db-mappers.ts";
import type {
  ConversationCustomerContext,
  ConversationOperatorState
} from "./conversation-ticket.types.ts";
type Row = Record<string, unknown>;
export type Scope = { orgId: string; tenantId: string };
type TicketTruth = "assigned" | "invalid" | "owned" | "unassigned";
const modeMatrix: Record<string, ConversationOperatorState["mode"]> = {
  "handoff:assigned": "human",
  "handoff:owned": "human",
  "open:assigned": "awaiting_operator",
  "open:unassigned": "bot",
  "pending_handoff:assigned": "awaiting_operator",
  "pending_handoff:unassigned": "awaiting_operator"
};
const ticketTruthMatrix: Record<string, TicketTruth> = {
  "claimed:assigned": "assigned",
  "escalated:same": "owned",
  "locked:same": "owned",
  "open:empty": "unassigned",
  "reopened:assigned": "assigned"
};
type ReadOperation = unknown | Promise<unknown>;
type CustomerReadClient = {
  channelConnection: { findFirst(input: unknown): ReadOperation };
  customerIdentity: { findMany(input: unknown): ReadOperation };
};
export type RlsReadRunner<Client> = <T>(input: {
  map?(rows: readonly unknown[]): T;
  ops(client: Client): readonly ReadOperation[];
  scope: Scope;
}) => Promise<T>;
export async function readCustomerContext<Client extends CustomerReadClient>(
  run: RlsReadRunner<Client>,
  context: AccessContext,
  conversation: HandoffConversation
) {
  const scope = scopeFromAccessContext(context);
  const provider = await run({
    map: ([row]) => text(object(row).provider),
    ops: (client) => [
      client.channelConnection.findFirst({
        select: { provider: true },
        where: { ...scope, id: conversation.channelConnectionId }
      })
    ],
    scope
  });
  const identityRows = provider
    ? await run({
        map: ([rows]) => (Array.isArray(rows) ? rows : []),
        ops: (client) => [
          client.customerIdentity.findMany({
            orderBy: { id: "asc" },
            select: {
              customer: {
                select: {
                  id: true,
                  orgId: true,
                  preferredLanguage: true,
                  status: true,
                  tenantId: true
                }
              },
              customerId: true,
              externalSubjectRef: true,
              firstSeenAt: true,
              id: true,
              lastSeenAt: true,
              metadata: true,
              orgId: true,
              provider: true,
              status: true,
              tenantId: true
            },
            take: 2,
            where: {
              ...scope,
              externalSubjectRef: conversation.participantExternalRef,
              provider
            }
          })
        ],
        scope
      })
    : [];
  return customerContextFor({
    identityRows,
    participantExternalRef: conversation.participantExternalRef,
    provider,
    scope
  });
}
export function operatorStateFor(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  actorUserId: string
): ConversationOperatorState {
  const active = tickets.filter((ticket) => ticket.status !== "closed");
  if (conversation.status === "closed") {
    return active.length === 0 ? state("closed", "none") : conflict();
  }
  if (active.length === 0) {
    return conversation.status === "open" ? state("bot", "none") : conflict();
  }
  if (active.length !== 1) return conflict();
  const ticket = active[0] as TicketState;
  const truth = ticketTruth(ticket);
  if (truth === "invalid") return conflict(ticket.id);
  const ownership = ownerFor(ticket, truth, actorUserId);
  const mode = modeMatrix[`${conversation.status}:${truth}`];
  return mode ? state(mode, ownership, ticket.id) : conflict(ticket.id);
}
function customerContextFor(input: {
  identityRows: readonly unknown[];
  participantExternalRef: string;
  provider?: string;
  scope: Scope;
}): ConversationCustomerContext {
  if (!input.provider) return { state: "identity_link_mismatch" };
  if (input.identityRows.some((row) => !validIdentity(object(row), input)))
    return { state: "identity_link_mismatch" };
  if (input.identityRows.length === 0) return { state: "identity_missing" };
  if (input.identityRows.length !== 1) return { state: "identity_ambiguous" };
  const row = object(input.identityRows[0]);
  return contextForIdentity(row, input.scope);
}

function contextForIdentity(row: Row, scope: Scope): ConversationCustomerContext {
  const identity = identityRead(row);
  const profile = profileRead(row.metadata);
  const customer = customerRead(row.customer, scope, identity.customerId);
  if (row.customer && !customer) return { state: "identity_link_mismatch" };
  const bounded = { identity, ...(profile ? { profile } : {}) };
  if (identity.status === "archived") {
    return {
      ...bounded,
      ...(customer ? { customer } : {}),
      state: "identity_archived"
    };
  }
  if (identity.status === "merged") {
    return { ...bounded, ...(customer ? { customer } : {}), state: "identity_merged" };
  }
  if (!customer) return { ...bounded, state: "customer_missing" };
  return {
    ...bounded,
    customer,
    state: customer.status === "archived" ? "customer_archived" : "linked"
  };
}
function ticketTruth(ticket: TicketState): TicketTruth {
  return ticketTruthMatrix[`${ticket.status}:${ownershipShape(ticket)}`] ?? "invalid";
}

function ownershipShape(ticket: TicketState) {
  if (!ticket.assignedUserId) return ticket.lockedByUserId ? "locked_only" : "empty";
  if (!ticket.lockedByUserId) return "assigned";
  return ticket.lockedByUserId === ticket.assignedUserId ? "same" : "different";
}
function ownerFor(
  ticket: TicketState,
  truth: TicketTruth,
  actorUserId: string
): ConversationOperatorState["ownership"] {
  if (truth === "unassigned") return "unassigned";
  return ticket.assignedUserId === actorUserId ? "self" : "other";
}
function state(
  mode: ConversationOperatorState["mode"],
  ownership: ConversationOperatorState["ownership"],
  activeTicketId?: string
): ConversationOperatorState {
  return { ...(activeTicketId ? { activeTicketId } : {}), mode, ownership };
}
function conflict(activeTicketId?: string) {
  return state("conflict", "conflict", activeTicketId);
}

function validIdentity(
  row: Row,
  input: {
    participantExternalRef: string;
    provider?: string;
    scope: Scope;
  }
) {
  return (
    text(row.orgId) === input.scope.orgId &&
    text(row.tenantId) === input.scope.tenantId &&
    text(row.provider) === input.provider &&
    text(row.externalSubjectRef) === input.participantExternalRef
  );
}

function identityRead(row: Row) {
  return {
    customerId: required(row.customerId),
    externalSubjectRef: required(row.externalSubjectRef),
    firstSeenAt: requiredIso(row.firstSeenAt),
    id: required(row.id),
    ...(iso(row.lastSeenAt) ? { lastSeenAt: iso(row.lastSeenAt) } : {}),
    provider: required(row.provider),
    status: status(row.status, ["active", "archived", "merged"] as const)
  };
}

function customerRead(value: unknown, scope: Scope, customerId: string) {
  const row = object(value);
  if (
    text(row.id) !== customerId ||
    text(row.orgId) !== scope.orgId ||
    text(row.tenantId) !== scope.tenantId
  )
    return undefined;
  const preferredLanguage = text(row.preferredLanguage)?.slice(0, 64);
  return {
    id: customerId,
    ...(preferredLanguage ? { preferredLanguage } : {}),
    status: status(row.status, ["active", "archived"] as const)
  };
}

function profileRead(metadata: unknown) {
  const stored = object(object(metadata).profile);
  return normalizeTelegramBotParticipantProfile({
    first_name: stored.firstName,
    language_code: stored.languageCode,
    last_name: stored.lastName,
    username: stored.username
  });
}

function object(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Row)
    : {};
}
function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function required(value: unknown) {
  const out = text(value);
  if (!out) throw new Error("customer context row is invalid");
  return out;
}
function iso(value: unknown) {
  return value instanceof Date ? value.toISOString() : text(value);
}
function requiredIso(value: unknown) {
  const out = iso(value);
  if (!out) throw new Error("customer context timestamp is invalid");
  return out;
}
function status<const T extends readonly string[]>(
  value: unknown,
  allowed: T
): T[number] {
  const normalized = String(value ?? "").toLowerCase();
  if (!allowed.includes(normalized))
    throw new Error("customer context status is invalid");
  return normalized as T[number];
}

import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type {
  HandoffConversation,
  TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";

import {
  cloneValue as clone,
  compareTicketEventRows,
  compoundScopeWhere,
  record,
  requiredText,
  rowArray,
  scopeFromAccessContext,
  scopeFromEntity,
  toConversation,
  toConversationUpdateData,
  toTicket,
  toTicketCreateData,
  toTicketEventCreateData,
  toTicketUpdateData,
  upsertById,
  type DbRow
} from "./conversation-ticket.db-mappers.ts";
import { ConversationTicketApiError } from "./conversation-ticket.errors.ts";
import {
  planTakeover,
  planTicketAction,
  type AtomicMutationPlan
} from "./conversation-ticket.atomic-state.ts";
import {
  takeoverResultFrom,
  ticketActionResultFrom,
  type ConversationMessage,
  type TakeoverInput,
  type TakeoverResult,
  type TicketActionInput,
  type TicketActionResult
} from "./conversation-ticket.types.ts";

type AsyncRow = Promise<unknown>;
type Methods<Name extends string> = Record<Name, (input: unknown) => AsyncRow>;
type Delegate = Methods<"findFirst" | "findMany">;
type MutableDelegate = Delegate & Methods<"create" | "update" | "updateMany">;
type AtomicPrismaTransaction = {
  $executeRawUnsafe(sql: string): AsyncRow;
  $queryRaw<T = unknown>(
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): Promise<T>;
  channelConversation: Delegate & Pick<MutableDelegate, "update">;
  channelMessage: Pick<MutableDelegate, "updateMany">;
  supportTicket: MutableDelegate;
  supportTicketEvent: Pick<MutableDelegate, "create" | "findMany">;
};

export type AtomicPrismaPort = AtomicPrismaTransaction & {
  $transaction<T>(
    action: (transaction: AtomicPrismaTransaction) => Promise<T>,
    options: { maxWait: number; timeout: number }
  ): Promise<T>;
};

export type AtomicWriter = {
  applyTicketAction(
    accessContext: AccessContext,
    input: TicketActionInput
  ): Promise<TicketActionResult>;
  takeoverConversation(
    accessContext: AccessContext,
    input: TakeoverInput
  ): Promise<TakeoverResult>;
};

type MemoryState = {
  conversations: HandoffConversation[];
  messages: ConversationMessage[];
  tickets: TicketState[];
};
type MemoryStore = { commit(state: MemoryState): void; snapshot(): MemoryState };
type LockedState = { conversation: HandoffConversation; tickets: TicketState[] };
type MutationInput = TakeoverInput | TicketActionInput;
type NotFoundKind = "conversation" | "ticket";

const runtimeRoleSql = 'set local role "uzmax_app_runtime"';
const rlsKeys = { orgId: "app.org_id", tenantId: "app.tenant_id" } as const;
const atomicTransactionOptions = { maxWait: 60_000, timeout: 60_000 } as const;

export function createInMemoryAtomicWriter(store: MemoryStore): AtomicWriter {
  const mutex = createMutex();
  const mutate = (context: AccessContext, input: MutationInput) =>
    mutex(() => memoryMutation(store, context, input));
  return {
    applyTicketAction: async (context, input) =>
      ticketActionResultFrom(await mutate(context, input)),
    takeoverConversation: async (context, input) =>
      takeoverResultFrom(await mutate(context, input))
  };
}

export function createPrismaAtomicWriter(prisma: AtomicPrismaPort): AtomicWriter {
  const mutate = (context: AccessContext, input: MutationInput) =>
    prisma.$transaction(
      (tx) => prismaMutation(tx, context, input),
      atomicTransactionOptions
    );
  return {
    applyTicketAction: async (context, input) =>
      ticketActionResultFrom(await mutate(context, input)),
    takeoverConversation: async (context, input) =>
      takeoverResultFrom(await mutate(context, input))
  };
}

async function memoryMutation(
  store: MemoryStore,
  context: AccessContext,
  input: MutationInput
): Promise<AtomicMutationPlan> {
  const state = clone(store.snapshot());
  const action = "ticketId" in input;
  const target = action
    ? state.tickets.find(
        (ticket) => ticket.id === input.ticketId && inScope(ticket, context)
      )
    : undefined;
  if (action && !target) throwNotFound("ticket");
  const conversationId = action
    ? (target as TicketState).conversationId
    : input.conversationId;
  const conversation = state.conversations.find(
    (item) => item.id === conversationId && inScope(item, context)
  );
  if (!conversation) throwNotFound(action ? "ticket" : "conversation");
  const tickets = state.tickets.filter(
    (ticket) => ticket.conversationId === conversationId && inScope(ticket, context)
  );
  const plan = planMutation(conversation, tickets, input, context.userId);
  if (hasWrites(plan)) {
    if (needsGeneratingCancellation(input, plan)) {
      state.messages = cancelMemoryGeneratingAiIntents(
        state.messages,
        context,
        conversationId
      );
    }
    commitMemoryPlan(store, state, plan);
  }
  return plan;
}

async function prismaMutation(
  transaction: AtomicPrismaTransaction,
  context: AccessContext,
  input: MutationInput
): Promise<AtomicMutationPlan> {
  await setRlsScope(transaction, context);
  const action = "ticketId" in input;
  const conversationId = action
    ? await ticketConversationId(transaction, context, input.ticketId)
    : input.conversationId;
  const locked = await lockState(
    transaction,
    context,
    conversationId,
    action ? "ticket" : "conversation",
    needsGeneratingLock(input)
  );
  const plan = planMutation(locked.conversation, locked.tickets, input, context.userId);
  if (needsGeneratingCancellation(input, plan)) {
    await cancelPrismaGeneratingAiIntents(transaction, context, conversationId);
  }
  await persistPlan(transaction, locked.conversation, plan);
  return {
    ...plan,
    ...(await readback(
      transaction,
      context,
      plan.ticket.id,
      action ? "ticket" : "conversation"
    ))
  };
}

function planMutation(
  conversation: HandoffConversation,
  tickets: readonly TicketState[],
  input: MutationInput,
  actorUserId: string
): AtomicMutationPlan {
  if ("ticketId" in input) {
    return planTicketAction(conversation, tickets, input, actorUserId);
  }
  return planTakeover(conversation, tickets, input.reason, actorUserId);
}

async function ticketConversationId(
  transaction: AtomicPrismaTransaction,
  context: AccessContext,
  ticketId: string
): Promise<string> {
  const row = await transaction.supportTicket.findFirst({
    select: { conversationId: true },
    where: { ...scopeFromAccessContext(context), id: ticketId }
  });
  if (!row) throwNotFound("ticket");
  return requiredText(record(row, "ticket row").conversationId, "conversation id");
}

async function setRlsScope(
  transaction: AtomicPrismaTransaction,
  context: AccessContext
): Promise<void> {
  await transaction.$executeRawUnsafe(runtimeRoleSql);
  await transaction.$queryRaw`select set_config(${rlsKeys.orgId}, ${context.orgId}, true)`;
  await transaction.$queryRaw`select set_config(${rlsKeys.tenantId}, ${context.selectedTenantId}, true)`;
}

async function lockState(
  transaction: AtomicPrismaTransaction,
  context: AccessContext,
  conversationId: string,
  missing: NotFoundKind,
  lockGenerating: boolean
): Promise<LockedState> {
  const rows = await transaction.$queryRaw<DbRow[]>`
    select id from conversation
    where id = ${conversationId}::uuid and org_id = ${context.orgId}::uuid
      and tenant_id = ${context.selectedTenantId}::uuid for update
  `;
  if (!Array.isArray(rows) || rows.length !== 1) throwNotFound(missing);
  await transaction.$queryRaw<DbRow[]>`
    select id from ticket
    where conversation_id = ${conversationId}::uuid and org_id = ${context.orgId}::uuid
      and tenant_id = ${context.selectedTenantId}::uuid order by id for update
  `;
  if (lockGenerating) {
    await lockPrismaGeneratingAiIntents(transaction, context, conversationId);
  }
  const scoped = scopeFromAccessContext(context);
  const conversationRow = await transaction.channelConversation.findFirst({
    where: { ...scoped, id: conversationId }
  });
  if (!conversationRow) throwNotFound(missing);
  const ticketRows = rowArray(
    await transaction.supportTicket.findMany({
      orderBy: { id: "asc" },
      where: { ...scoped, conversationId }
    }),
    "ticket rows"
  );
  const eventRows = await readEventRows(
    transaction,
    scoped,
    ticketRows.map((row) => requiredText(row.id, "ticket id"))
  );
  return {
    conversation: toConversation(record(conversationRow, "conversation row")),
    tickets: ticketRows.map((row) => toTicket(row, eventRows))
  };
}

async function persistPlan(
  transaction: AtomicPrismaTransaction,
  before: HandoffConversation,
  plan: AtomicMutationPlan
): Promise<void> {
  if (
    before.status !== plan.conversation.status ||
    before.unreadCount !== plan.conversation.unreadCount
  ) {
    await transaction.channelConversation.update({
      data: toConversationUpdateData(plan.conversation),
      where: compoundScopeWhere({
        id: plan.conversation.id,
        ...scopeFromEntity(plan.conversation)
      })
    });
  }
  if (plan.result === "created") {
    await transaction.supportTicket.create({ data: toTicketCreateData(plan.ticket) });
  } else if (plan.newEvents.length > 0) {
    await transaction.supportTicket.update({
      data: toTicketUpdateData(plan.ticket),
      where: compoundScopeWhere(plan.ticket)
    });
  }
  for (const event of plan.newEvents) {
    await transaction.supportTicketEvent.create({
      data: toTicketEventCreateData(plan.ticket, event)
    });
  }
}

async function lockPrismaGeneratingAiIntents(
  transaction: AtomicPrismaTransaction,
  context: AccessContext,
  conversationId: string
): Promise<void> {
  await transaction.$queryRaw<DbRow[]>`
    select id from message
    where conversation_id = ${conversationId}::uuid and org_id = ${context.orgId}::uuid
      and tenant_id = ${context.selectedTenantId}::uuid
      and direction = 'outbound'::message_direction and delivery_status = 'queued'::message_delivery_status
      and content ->> 'runtimeOrigin' = 'telegram_bot_ai' and content ->> 'dispatchPhase' = 'generating'
    order by id for update
  `;
}

function cancelPrismaGeneratingAiIntents(
  transaction: AtomicPrismaTransaction,
  context: AccessContext,
  conversationId: string
): AsyncRow {
  return transaction.channelMessage.updateMany({
    data: { deliveryStatus: "CANCELLED" },
    where: {
      ...scopeFromAccessContext(context),
      AND: [
        { content: { equals: "telegram_bot_ai", path: ["runtimeOrigin"] } },
        { content: { equals: "generating", path: ["dispatchPhase"] } }
      ],
      conversationId,
      deliveryStatus: "QUEUED",
      direction: "OUTBOUND"
    }
  });
}

function cancelMemoryGeneratingAiIntents(
  messages: readonly ConversationMessage[],
  context: AccessContext,
  conversationId: string
): ConversationMessage[] {
  return messages.map((message) => {
    const exactIntent =
      inScope(message, context) &&
      message.conversationId === conversationId &&
      message.direction === "outbound" &&
      message.deliveryStatus === "queued" &&
      message.content.runtimeOrigin === "telegram_bot_ai" &&
      message.content.dispatchPhase === "generating";
    return exactIntent ? { ...message, deliveryStatus: "cancelled" } : message;
  });
}

async function readback(
  transaction: AtomicPrismaTransaction,
  context: AccessContext,
  ticketId: string,
  missing: NotFoundKind
): Promise<{ conversation: HandoffConversation; ticket: TicketState }> {
  const scoped = scopeFromAccessContext(context);
  const ticketRow = await transaction.supportTicket.findFirst({
    where: { ...scoped, id: ticketId }
  });
  if (!ticketRow) throwNotFound(missing);
  const ticketRecord = record(ticketRow, "ticket row");
  const conversationId = requiredText(ticketRecord.conversationId, "conversation id");
  const conversationRow = await transaction.channelConversation.findFirst({
    where: { ...scoped, id: conversationId }
  });
  if (!conversationRow) throwNotFound(missing);
  const events = await readEventRows(transaction, scoped, [ticketId]);
  return {
    conversation: toConversation(record(conversationRow, "conversation row")),
    ticket: toTicket(ticketRecord, events)
  };
}

async function readEventRows(
  transaction: AtomicPrismaTransaction,
  scoped: { orgId: string; tenantId: string },
  ticketIds: readonly string[]
): Promise<DbRow[]> {
  if (ticketIds.length === 0) return [];
  return rowArray(
    await transaction.supportTicketEvent.findMany({
      orderBy: { occurredAt: "asc" },
      where: { ...scoped, ticketId: { in: [...ticketIds] } }
    }),
    "ticket event rows"
  ).sort(compareTicketEventRows);
}

function commitMemoryPlan(
  store: MemoryStore,
  state: MemoryState,
  plan: AtomicMutationPlan
): void {
  state.conversations = upsertById(state.conversations, plan.conversation);
  state.tickets = upsertById(state.tickets, plan.ticket);
  store.commit(state);
}

const hasWrites = (plan: AtomicMutationPlan) =>
    !["already_applied", "already_owned"].includes(plan.result ?? ""),
  needsGeneratingLock = (input: MutationInput) =>
    !("ticketId" in input) || input.type === "close",
  needsGeneratingCancellation = (input: MutationInput, plan: AtomicMutationPlan) =>
    hasWrites(plan) && needsGeneratingLock(input);

function createMutex() {
  let tail = Promise.resolve();
  return async <T>(action: () => Promise<T>): Promise<T> => {
    const previous = tail;
    let release: () => void = () => undefined;
    tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await action();
    } finally {
      release();
    }
  };
}

const inScope = (entity: { orgId: string; tenantId: string }, context: AccessContext) =>
  entity.orgId === context.orgId && entity.tenantId === context.selectedTenantId;

function throwNotFound(kind: NotFoundKind): never {
  throw new ConversationTicketApiError(`${kind}_not_found`, `${kind} not found`);
}

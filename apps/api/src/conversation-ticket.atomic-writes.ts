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
import type {
  TakeoverInput,
  TakeoverResult,
  TicketActionInput
} from "./conversation-ticket.types.ts";

type AsyncRow = Promise<unknown>;
type Delegate = {
  findFirst(input: unknown): AsyncRow;
  findMany(input: unknown): AsyncRow;
};
type MutableDelegate = Delegate & {
  create(input: unknown): AsyncRow;
  update(input: unknown): AsyncRow;
};
type AtomicPrismaTransaction = {
  $executeRawUnsafe(sql: string): AsyncRow;
  $queryRaw<T = unknown>(
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): Promise<T>;
  channelConversation: Delegate & Pick<MutableDelegate, "update">;
  supportTicket: MutableDelegate;
  supportTicketEvent: Pick<MutableDelegate, "create" | "findMany">;
};

export type AtomicPrismaPort = AtomicPrismaTransaction & {
  $transaction<T>(
    action: (transaction: AtomicPrismaTransaction) => Promise<T>
  ): Promise<T>;
};

export type AtomicWriter = {
  applyTicketAction(
    accessContext: AccessContext,
    input: TicketActionInput
  ): Promise<TicketState>;
  takeoverConversation(
    accessContext: AccessContext,
    input: TakeoverInput
  ): Promise<TakeoverResult>;
};

type MemoryState = {
  conversations: HandoffConversation[];
  tickets: TicketState[];
};
type MemoryStore = {
  commit(state: MemoryState): void;
  snapshot(): MemoryState;
};
type LockedState = { conversation: HandoffConversation; tickets: TicketState[] };
type NotFoundKind = "conversation" | "ticket";
type MutationInput = TakeoverInput | TicketActionInput;

const runtimeRoleSql = 'set local role "uzmax_app_runtime"';
const rlsKeys = { orgId: "app.org_id", tenantId: "app.tenant_id" } as const;

export function createInMemoryAtomicWriter(store: MemoryStore): AtomicWriter {
  const mutex = createMutex();
  return {
    applyTicketAction: async (context, input) =>
      clone((await mutex(() => memoryMutation(store, context, input))).ticket),
    takeoverConversation: async (context, input) =>
      takeoverResult(await mutex(() => memoryMutation(store, context, input)))
  };
}

export function createPrismaAtomicWriter(prisma: AtomicPrismaPort): AtomicWriter {
  return {
    applyTicketAction: async (context, input) =>
      (await prisma.$transaction((tx) => prismaMutation(tx, context, input))).ticket,
    takeoverConversation: async (context, input) =>
      takeoverResult(
        await prisma.$transaction((tx) => prismaMutation(tx, context, input))
      )
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
  const plan = action
    ? planTicketAction(conversation, tickets, input, context.userId)
    : planTakeover(conversation, tickets, input.reason, context.userId);
  if (plan.result !== "already_owned") commitMemoryPlan(store, state, plan);
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
    action ? "ticket" : "conversation"
  );
  const plan = action
    ? planTicketAction(locked.conversation, locked.tickets, input, context.userId)
    : planTakeover(locked.conversation, locked.tickets, input.reason, context.userId);
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
  missing: NotFoundKind
): Promise<LockedState> {
  const lockedConversation = await transaction.$queryRaw<DbRow[]>`
    select id from conversation
    where id = ${conversationId}::uuid
      and org_id = ${context.orgId}::uuid
      and tenant_id = ${context.selectedTenantId}::uuid
    for update
  `;
  if (!Array.isArray(lockedConversation) || lockedConversation.length !== 1) {
    throwNotFound(missing);
  }
  await transaction.$queryRaw<DbRow[]>`
    select id from ticket
    where conversation_id = ${conversationId}::uuid
      and org_id = ${context.orgId}::uuid
      and tenant_id = ${context.selectedTenantId}::uuid
      and status <> 'closed'::ticket_status
    order by id
    for update
  `;
  const scoped = scopeFromAccessContext(context);
  const conversationRow = await transaction.channelConversation.findFirst({
    where: { ...scoped, id: conversationId }
  });
  if (!conversationRow) throwNotFound(missing);
  const ticketRows = rowArray(
    await transaction.supportTicket.findMany({
      orderBy: { id: "asc" },
      where: { ...scoped, conversationId, status: { not: "CLOSED" } }
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
  if (plan.result && before.status !== plan.conversation.status) {
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

function takeoverResult(plan: AtomicMutationPlan): TakeoverResult {
  if (!plan.result) throw new Error("takeover result is missing");
  return {
    conversation: clone(plan.conversation),
    result: plan.result,
    ticket: clone(plan.ticket)
  };
}

function inScope(
  entity: { orgId: string; tenantId: string },
  context: AccessContext
): boolean {
  return entity.orgId === context.orgId && entity.tenantId === context.selectedTenantId;
}

function throwNotFound(kind: NotFoundKind): never {
  throw new ConversationTicketApiError(`${kind}_not_found`, `${kind} not found`);
}

import type { AccessContext } from "../../../packages/authz/src/index.ts";
import type {
  HandoffConversation,
  TicketState
} from "../../../packages/capabilities/handoff/src/index.ts";

import {
  cloneValue as clone,
  compareConversationPriority,
  compareOccurredAt,
  compareTicketEventRows,
  matchesConversationFilters,
  record,
  requiredText,
  rowArray,
  scopeFromAccessContext,
  scoped,
  toConversation,
  toMessage,
  toTicket,
  type DbRow
} from "./conversation-ticket.db-mappers.ts";
import {
  createInMemoryAtomicWriter,
  createPrismaAtomicWriter,
  type AtomicPrismaPort,
  type AtomicWriter
} from "./conversation-ticket.atomic-writes.ts";
import {
  readCustomerContext,
  type RlsReadRunner
} from "./conversation-ticket.ownership.ts";
import type {
  ConversationCustomerContext,
  ConversationListFilters,
  ConversationMessage,
  ConversationTicketSeed,
  TakeoverInput,
  TakeoverResult,
  TicketActionInput,
  TicketActionResult
} from "./conversation-ticket.types.ts";

type MaybePromise<T> = T | Promise<T>;
type DbOperation<T = unknown> = MaybePromise<T>;
type RuntimeEnv = Partial<
  Record<"UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE" | "UZMAX_RLS_DATABASE_URL", string>
>;
type RuntimeMode = "in_memory" | "rls_prisma_gateway";
type RlsScope = { orgId: string; tenantId: string };
type MaybeConversation = MaybePromise<HandoffConversation | undefined>;
type MaybeConversations = MaybePromise<HandoffConversation[]>;
type MaybeMessages = MaybePromise<ConversationMessage[]>;
type MaybeTickets = MaybePromise<TicketState[]>;
type PrismaDelegate = {
  findFirst(input: unknown): DbOperation<unknown>;
  findMany(input: unknown): DbOperation<unknown>;
};
type ConversationTicketPrismaClientPort = AtomicPrismaPort & {
  $transaction<T extends readonly DbOperation[]>(
    operations: T
  ): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
  channelConnection: Pick<PrismaDelegate, "findFirst">;
  channelMessage: Pick<PrismaDelegate, "findMany">;
  customerIdentity: Pick<PrismaDelegate, "findMany">;
};
type ConversationTicketRlsTransactionRunner =
  RlsReadRunner<ConversationTicketPrismaClientPort>;
export type ConversationTicketRepositoryPort = {
  applyTicketAction(
    accessContext: AccessContext,
    input: TicketActionInput
  ): MaybePromise<TicketActionResult>;
  getConversation(
    accessContext: AccessContext,
    conversationId: string
  ): MaybeConversation;
  listConversations(
    accessContext: AccessContext,
    filters: ConversationListFilters
  ): MaybeConversations;
  getCustomerContext(
    accessContext: AccessContext,
    conversation: HandoffConversation
  ): MaybePromise<ConversationCustomerContext>;
  listMessages(accessContext: AccessContext, conversationId: string): MaybeMessages;
  listTickets(accessContext: AccessContext, conversationId: string): MaybeTickets;
  takeoverConversation(
    accessContext: AccessContext,
    input: TakeoverInput
  ): MaybePromise<TakeoverResult>;
};
export type ConversationTicketRepositoryProviderInput = {
  env?: RuntimeEnv;
  inMemoryRepository?: ConversationTicketRepositoryPort;
  mode?: RuntimeMode;
  prismaClient?: ConversationTicketPrismaClientPort;
  prismaClientFactory?: (
    databaseUrl: string
  ) => MaybePromise<ConversationTicketPrismaClientPort>;
};

export const CONVERSATION_TICKET_REPOSITORY = Symbol("CONVERSATION_TICKET_REPOSITORY");
const conversationTicketRepositoryRuntimeModes = {
  inMemory: "in_memory",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;

const runtimeRoleSql = 'set local role "uzmax_app_runtime"';
const rlsSettings = { orgId: "app.org_id", tenantId: "app.tenant_id" } as const;

export class InMemoryConversationTicketRepository implements ConversationTicketRepositoryPort {
  private readonly atomicWriter: AtomicWriter;
  private conversations: HandoffConversation[];
  private customerContexts: NonNullable<ConversationTicketSeed["customerContexts"]>;
  private messages: ConversationMessage[];
  private tickets: TicketState[];

  constructor(seed: ConversationTicketSeed = {}) {
    this.conversations = [...(seed.conversations ?? [])];
    this.customerContexts = [...(seed.customerContexts ?? [])];
    this.messages = [...(seed.messages ?? [])];
    this.tickets = [...(seed.tickets ?? [])];
    this.atomicWriter = createInMemoryAtomicWriter({
      commit: (state) => {
        this.conversations = state.conversations;
        this.messages = state.messages;
        this.tickets = state.tickets;
      },
      snapshot: () => ({
        conversations: this.conversations,
        messages: this.messages,
        tickets: this.tickets
      })
    });
  }

  listConversations(accessContext: AccessContext, filters: ConversationListFilters) {
    return scoped(this.conversations, accessContext)
      .filter((conversation) => matchesConversationFilters(conversation, filters))
      .sort(compareConversationPriority)
      .map(clone);
  }

  getConversation(accessContext: AccessContext, conversationId: string) {
    return clone(
      scoped(this.conversations, accessContext).find(
        (conversation) => conversation.id === conversationId
      )
    );
  }

  getCustomerContext(
    accessContext: AccessContext,
    conversation: HandoffConversation
  ): ConversationCustomerContext {
    const item = scoped(this.customerContexts, accessContext).find(
      (candidate) => candidate.conversationId === conversation.id
    );
    return clone(
      item?.context ?? ({ state: "identity_missing" } as ConversationCustomerContext)
    );
  }

  listMessages(accessContext: AccessContext, conversationId: string) {
    return scoped(this.messages, accessContext)
      .filter((message) => message.conversationId === conversationId)
      .sort(compareOccurredAt)
      .map(clone);
  }

  listTickets(accessContext: AccessContext, conversationId: string) {
    return scoped(this.tickets, accessContext)
      .filter((ticket) => ticket.conversationId === conversationId)
      .map(clone);
  }

  applyTicketAction(accessContext: AccessContext, input: TicketActionInput) {
    return this.atomicWriter.applyTicketAction(accessContext, input);
  }

  takeoverConversation(accessContext: AccessContext, input: TakeoverInput) {
    return this.atomicWriter.takeoverConversation(accessContext, input);
  }
}

class RlsPrismaConversationTicketRepository implements ConversationTicketRepositoryPort {
  private readonly atomicWriter: AtomicWriter;
  private readonly transaction: ConversationTicketRlsTransactionRunner;

  constructor(prisma: ConversationTicketPrismaClientPort) {
    this.atomicWriter = createPrismaAtomicWriter(prisma);
    this.transaction = createConversationTicketRlsTransactionRunner(prisma);
  }

  listConversations(
    accessContext: AccessContext,
    filters: ConversationListFilters
  ): Promise<HandoffConversation[]> {
    const scope = scopeFromAccessContext(accessContext);
    return this.transaction({
      map: ([rows]) =>
        rowArray(rows, "conversation rows")
          .map(toConversation)
          .filter((conversation) => matchesConversationFilters(conversation, filters))
          .sort(compareConversationPriority),
      ops: (prisma) => [prisma.channelConversation.findMany({ where: scope })],
      scope
    });
  }

  getConversation(
    accessContext: AccessContext,
    conversationId: string
  ): Promise<HandoffConversation | undefined> {
    const scope = scopeFromAccessContext(accessContext);
    return this.transaction({
      map: ([row]) =>
        row ? toConversation(record(row, "conversation row")) : undefined,
      ops: (prisma) => [
        prisma.channelConversation.findFirst({
          where: { ...scope, id: conversationId }
        })
      ],
      scope
    });
  }

  async getCustomerContext(
    accessContext: AccessContext,
    conversation: HandoffConversation
  ): Promise<ConversationCustomerContext> {
    return readCustomerContext(this.transaction, accessContext, conversation);
  }

  listMessages(
    accessContext: AccessContext,
    conversationId: string
  ): Promise<ConversationMessage[]> {
    const scope = scopeFromAccessContext(accessContext);
    return this.transaction({
      map: ([rows]) =>
        rowArray(rows, "message rows").map(toMessage).sort(compareOccurredAt),
      ops: (prisma) => [
        prisma.channelMessage.findMany({
          orderBy: { occurredAt: "asc" },
          where: { ...scope, conversationId }
        })
      ],
      scope
    });
  }

  async listTickets(
    accessContext: AccessContext,
    conversationId: string
  ): Promise<TicketState[]> {
    const scope = scopeFromAccessContext(accessContext);
    const tickets = await this.transaction({
      map: ([rows]) => rowArray(rows, "ticket rows"),
      ops: (prisma) => [
        prisma.supportTicket.findMany({
          orderBy: { updatedAt: "desc" },
          where: { ...scope, conversationId }
        })
      ],
      scope
    });
    const events = await this.listTicketEvents(
      scope,
      tickets.map((ticket) => requiredText(ticket.id, "ticket id"))
    );
    return tickets.map((ticket) => toTicket(ticket, events));
  }

  applyTicketAction(accessContext: AccessContext, input: TicketActionInput) {
    return this.atomicWriter.applyTicketAction(accessContext, input);
  }

  takeoverConversation(accessContext: AccessContext, input: TakeoverInput) {
    return this.atomicWriter.takeoverConversation(accessContext, input);
  }

  private listTicketEvents(
    scope: RlsScope,
    ticketIds: readonly string[]
  ): Promise<DbRow[]> {
    if (ticketIds.length === 0) return Promise.resolve([]);
    return this.transaction({
      map: ([rows]) => rowArray(rows, "ticket event rows").sort(compareTicketEventRows),
      ops: (prisma) => [
        prisma.supportTicketEvent.findMany({
          orderBy: { occurredAt: "asc" },
          where: { ...scope, ticketId: { in: [...ticketIds] } }
        })
      ],
      scope
    });
  }
}

export function createConversationTicketRepositoryProviderFromEnv(
  input: ConversationTicketRepositoryProviderInput = {}
): MaybePromise<ConversationTicketRepositoryPort> {
  const mode =
    input.mode ?? readConversationTicketRepositoryRuntimeMode(input.env ?? process.env);
  if (mode === conversationTicketRepositoryRuntimeModes.inMemory)
    return input.inMemoryRepository ?? new InMemoryConversationTicketRepository();
  if (mode !== conversationTicketRepositoryRuntimeModes.rlsPrismaGateway)
    throw new Error(`unsupported conversation-ticket repository mode: ${mode}`);
  if (input.prismaClient)
    return new RlsPrismaConversationTicketRepository(input.prismaClient);
  return createPrismaClientFromEnv(
    input.env ?? process.env,
    input.prismaClientFactory
  ).then((prisma) => new RlsPrismaConversationTicketRepository(prisma));
}

async function createPrismaClientFromEnv(
  env: RuntimeEnv,
  prismaClientFactory: (
    databaseUrl: string
  ) => MaybePromise<ConversationTicketPrismaClientPort> = createDefaultConversationTicketPrismaClient
): Promise<ConversationTicketPrismaClientPort> {
  const url = env.UZMAX_RLS_DATABASE_URL?.trim();
  if (!url) throw new Error("UZMAX_RLS_DATABASE_URL is required for Prisma runtime");
  return prismaClientFactory(url);
}

async function createDefaultConversationTicketPrismaClient(
  databaseUrl: string
): Promise<ConversationTicketPrismaClientPort> {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient({
    datasources: { db: { url: databaseUrl } }
  }) as unknown as ConversationTicketPrismaClientPort;
}

function readConversationTicketRepositoryRuntimeMode(env: RuntimeEnv): RuntimeMode {
  const mode = env.UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE?.trim() || "in_memory";
  if (mode === "prisma_gateway")
    throw new Error("conversation-ticket repository env must use RLS Prisma gateway");
  if (
    mode === conversationTicketRepositoryRuntimeModes.inMemory ||
    mode === conversationTicketRepositoryRuntimeModes.rlsPrismaGateway
  )
    return mode;
  throw new Error(`unsupported conversation-ticket repository mode: ${mode}`);
}

function createConversationTicketRlsTransactionRunner(
  prisma: ConversationTicketPrismaClientPort
): ConversationTicketRlsTransactionRunner {
  return async ({ map, ops, scope }) => {
    const rows = await prisma.$transaction([
      prisma.$executeRawUnsafe(runtimeRoleSql),
      prisma.$queryRaw`select set_config(${rlsSettings.orgId}, ${scope.orgId}, true)`,
      prisma.$queryRaw`select set_config(${rlsSettings.tenantId}, ${scope.tenantId}, true)`,
      ...ops(prisma)
    ]);
    const businessRows = rows.slice(3);
    return map ? map(businessRows) : (businessRows as never);
  };
}

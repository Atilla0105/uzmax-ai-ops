import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";
import type {
  RuntimePersistInput,
  RuntimeResult,
  TelegramBotConversationPersistenceGateway
} from "./conversation-runtime.ts";
type MaybePromise<T> = T | Promise<T>;
type PrismaClientPort = {
  $executeRawUnsafe(sql: string): MaybePromise<unknown>;
  $queryRaw(
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): MaybePromise<unknown>;
  $transaction<T>(
    action: (tx: PrismaClientPort) => Promise<T>,
    options?: { maxWait?: number; timeout?: number }
  ): Promise<T>;
  channelConversation: { upsert(input: unknown): MaybePromise<{ id: string }> };
  channelMessage: { create(input: unknown): MaybePromise<unknown> };
  supportTicket: { create(input: unknown): MaybePromise<unknown> };
  supportTicketEvent: { create(input: unknown): MaybePromise<unknown> };
  telegramUpdateDedupe: {
    createMany(input: unknown): MaybePromise<{ count: number }>;
    updateMany(input: unknown): MaybePromise<unknown>;
  };
};
type DedupeDraft = RlsTenantContext &
  Record<"channelConnectionId" | "providerUpdateId" | "updateKind", string> & {
    reserved?: boolean;
  };
type RuntimeDedupeResult = Record<"providerUpdateId" | "traceId", string> & {
  status: "deduped" | "reserved";
};

const TELEGRAM_RUNTIME_TRANSACTION_OPTIONS = { maxWait: 60_000, timeout: 60_000 };

export class PrismaTelegramBotConversationPersistenceGateway implements TelegramBotConversationPersistenceGateway {
  constructor(private readonly prisma: PrismaClientPort) {}

  reserveProviderUpdate(
    input: DedupeDraft & { traceId: string }
  ): Promise<RuntimeDedupeResult> {
    const context = createRlsTransactionContext(scope(input));
    return this.prisma.$transaction(async (tx) => {
      await applyRlsContext(tx, context);
      const dedupe = await tx.telegramUpdateDedupe.createMany({
        data: dedupeData(input),
        skipDuplicates: true
      });
      return {
        providerUpdateId: input.providerUpdateId,
        status: dedupe.count === 0 ? "deduped" : "reserved",
        traceId: input.traceId
      };
    }, TELEGRAM_RUNTIME_TRANSACTION_OPTIONS);
  }

  persistAcceptedUpdate(input: RuntimePersistInput): Promise<RuntimeResult> {
    const context = createRlsTransactionContext(scope(input.dedupe));
    return this.prisma.$transaction(async (tx) => {
      await applyRlsContext(tx, context);
      if (!input.dedupe.reserved) {
        const dedupe = await tx.telegramUpdateDedupe.createMany({
          data: dedupeData(input.dedupe),
          skipDuplicates: true
        });
        if (dedupe.count === 0) return dedupedResult(input);
      }
      const persisted = await persistConversationRuntime(tx, input);
      return {
        conversationId: persisted.conversationId,
        messageId: input.message.id,
        outboundMessageId:
          input.runtimeBranch === "answer" ? input.outboundMessage.id : undefined,
        providerUpdateId: input.dedupe.providerUpdateId,
        runtimeBranch: input.runtimeBranch,
        status: "accepted",
        ticketId: input.runtimeBranch === "handoff" ? input.ticket.id : undefined,
        traceId: input.traceId
      };
    }, TELEGRAM_RUNTIME_TRANSACTION_OPTIONS);
  }
}

function scope(input: RlsTenantContext) {
  return { orgId: input.orgId, tenantId: input.tenantId };
}

function dedupeData(input: DedupeDraft) {
  return {
    channelConnectionId: input.channelConnectionId,
    orgId: input.orgId,
    providerUpdateId: input.providerUpdateId,
    tenantId: input.tenantId,
    updateKind: input.updateKind
  };
}

function dedupedResult(input: RuntimePersistInput): RuntimeResult {
  return {
    providerUpdateId: input.dedupe.providerUpdateId,
    runtimeBranch: input.runtimeBranch,
    status: "deduped",
    traceId: input.traceId
  };
}

async function applyRlsContext(
  tx: PrismaClientPort,
  context: ReturnType<typeof createRlsTransactionContext>
) {
  await tx.$executeRawUnsafe(context.roleSql);
  for (const setting of context.settings) {
    await tx.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
  }
}

async function persistConversationRuntime(
  tx: PrismaClientPort,
  input: RuntimePersistInput
) {
  const c = input.conversation;
  const conversationStatus =
    input.runtimeBranch === "answer" ? "OPEN" : "PENDING_HANDOFF";
  const conversation = await tx.channelConversation.upsert({
    create: {
      ...c,
      lastMessageAt: new Date(c.lastMessageAt),
      status: conversationStatus,
      unreadCount: input.runtimeBranch === "answer" ? 0 : 1
    },
    update:
      input.runtimeBranch === "answer"
        ? { lastMessageAt: new Date(c.lastMessageAt), status: conversationStatus }
        : {
            lastMessageAt: new Date(c.lastMessageAt),
            status: conversationStatus,
            unreadCount: { increment: 1 }
          },
    where: {
      orgId_tenantId_channelConnectionId_externalConversationRef: {
        channelConnectionId: c.channelConnectionId,
        externalConversationRef: c.externalConversationRef,
        orgId: c.orgId,
        tenantId: c.tenantId
      }
    }
  });
  const conversationId = conversation.id as string;
  await tx.channelMessage.create({ data: inboundMessageData(input, conversationId) });
  if (input.runtimeBranch === "answer")
    await persistOutboundMessage(tx, input, conversationId);
  else await persistTicket(tx, input, conversationId);
  await tx.telegramUpdateDedupe.updateMany({
    data: { processedAt: new Date() },
    where: {
      channelConnectionId: input.dedupe.channelConnectionId,
      orgId: input.dedupe.orgId,
      providerUpdateId: input.dedupe.providerUpdateId,
      tenantId: input.dedupe.tenantId
    }
  });
  return { conversationId };
}

function inboundMessageData(input: RuntimePersistInput, conversationId: string) {
  const m = input.message;
  return {
    ...m,
    contentKind: m.contentKind.toUpperCase(),
    conversationId,
    deliveryStatus: "RECEIVED",
    direction: "INBOUND",
    occurredAt: new Date(m.occurredAt)
  };
}

async function persistOutboundMessage(
  tx: PrismaClientPort,
  input: Extract<RuntimePersistInput, { runtimeBranch: "answer" }>,
  conversationId: string
) {
  const m = input.outboundMessage;
  await tx.channelMessage.create({
    data: {
      ...m,
      contentKind: "TEXT",
      conversationId,
      deliveryStatus: m.deliveryStatus,
      direction: "OUTBOUND",
      occurredAt: new Date(m.occurredAt)
    }
  });
}

async function persistTicket(
  tx: PrismaClientPort,
  input: Extract<RuntimePersistInput, { runtimeBranch: "handoff" }>,
  conversationId: string
) {
  await tx.supportTicket.create({
    data: {
      ...input.ticket,
      conversationId,
      priority: 3,
      status: "OPEN"
    }
  });
  await tx.supportTicketEvent.create({
    data: {
      eventType: "CREATED",
      id: input.ticketEvent.id,
      orgId: input.ticketEvent.orgId,
      payload: { traceId: input.ticketEvent.traceId },
      tenantId: input.ticketEvent.tenantId,
      ticketId: input.ticketEvent.ticketId
    }
  });
}

import { randomUUID } from "node:crypto";

import { Worker, type Job, type QueueOptions } from "bullmq";

import {
  createHumanHandoff,
  createTicketState
} from "../../../packages/capabilities/handoff/src/index.ts";
import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";
import {
  telegramBotConversationQueueDefaults,
  type TelegramBotConversationJobPayload
} from "../../../packages/channels/src/index.ts";

type MaybePromise<T> = T | Promise<T>;
type RuntimeStatus = "accepted" | "deduped";
type RuntimeIds = {
  conversationId?: string;
  messageId?: string;
  ticketId?: string;
};
type RuntimeResult = RuntimeIds & {
  providerUpdateId: string;
  status: RuntimeStatus;
  traceId: string;
};

type RuntimePersistInput = {
  conversation: ConversationDraft;
  dedupe: DedupeDraft;
  message: MessageDraft;
  ticket: TicketDraft;
  ticketEvent: TicketEventDraft;
};

type ConversationDraft = RlsTenantContext & {
  channelConnectionId: string;
  externalConversationRef: string;
  id: string;
  lastMessageAt: string;
  participantExternalRef: string;
};
type MessageDraft = RlsTenantContext & {
  channelConnectionId: string;
  content: Record<string, unknown>;
  contentKind: TelegramBotConversationJobPayload["contentKind"];
  conversationId: string;
  externalMessageRef?: string;
  id: string;
  occurredAt: string;
};
type TicketDraft = RlsTenantContext & {
  conversationId: string;
  id: string;
  summary: string;
};
type TicketEventDraft = RlsTenantContext & {
  id: string;
  ticketId: string;
  traceId: string;
};
type DedupeDraft = RlsTenantContext & {
  channelConnectionId: string;
  providerUpdateId: string;
  updateKind: string;
};

export type TelegramBotConversationPersistenceGateway = {
  persistAcceptedUpdate(input: RuntimePersistInput): MaybePromise<RuntimeResult>;
};

type PrismaClientPort = {
  $executeRawUnsafe(sql: string): MaybePromise<unknown>;
  $queryRaw(
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): MaybePromise<unknown>;
  $transaction<T>(action: (tx: PrismaClientPort) => Promise<T>): Promise<T>;
  channelConversation: {
    upsert(input: unknown): MaybePromise<{ id: string }>;
  };
  channelMessage: {
    create(input: unknown): MaybePromise<unknown>;
  };
  supportTicket: {
    create(input: unknown): MaybePromise<unknown>;
  };
  supportTicketEvent: {
    create(input: unknown): MaybePromise<unknown>;
  };
  telegramUpdateDedupe: {
    createMany(input: unknown): MaybePromise<{ count: number }>;
    updateMany(input: unknown): MaybePromise<unknown>;
  };
};

type RuntimeJob = Job<
  TelegramBotConversationJobPayload,
  RuntimeResult,
  typeof telegramBotConversationQueueDefaults.jobName
>;

export async function processTelegramBotConversationJob(
  payload: TelegramBotConversationJobPayload,
  gateway: TelegramBotConversationPersistenceGateway
): Promise<RuntimeResult> {
  assertPayload(payload);
  const occurredAt = payload.occurredAt ?? payload.enqueuedAt;
  const conversationId = randomUUID();
  const messageId = randomUUID();
  const ticketId = randomUUID();
  const systemUserId = "00000000-0000-4000-8000-000000000005";
  const conversation = {
    channelConnectionId: payload.channelConnectionId,
    externalConversationRef:
      payload.chatExternalRef ?? `telegram:update:${payload.providerUpdateId}`,
    id: conversationId,
    lastMessageAt: occurredAt,
    orgId: payload.orgId,
    participantExternalRef: payload.participantExternalRef ?? "telegram:user:unknown",
    tenantId: payload.tenantId
  };
  const handoff = createHumanHandoff({
    conversation: {
      ...conversation,
      status: "open",
      unreadCount: 1
    },
    reason: `telegram_bot_${payload.contentKind}_requires_operator_review`,
    requestedByUserId: systemUserId,
    slaPolicyRef: "m6b-05a-runtime-smoke"
  });
  const ticket = createTicketState({
    conversationId,
    events: [],
    id: ticketId,
    orgId: payload.orgId,
    priority: handoff.ticketDraft.priority,
    sla: handoff.ticketDraft.sla,
    status: "open",
    suggestedAction: handoff.ticketDraft.suggestedAction,
    summary: handoff.ticketDraft.summary,
    tenantId: payload.tenantId
  });

  return gateway.persistAcceptedUpdate({
    conversation,
    dedupe: {
      channelConnectionId: payload.channelConnectionId,
      orgId: payload.orgId,
      providerUpdateId: payload.providerUpdateId,
      tenantId: payload.tenantId,
      updateKind: payload.updateKind
    },
    message: {
      channelConnectionId: payload.channelConnectionId,
      content: safeMessageContent(payload),
      contentKind: payload.contentKind,
      conversationId,
      externalMessageRef: payload.messageExternalRef,
      id: messageId,
      occurredAt,
      orgId: payload.orgId,
      tenantId: payload.tenantId
    },
    ticket: {
      conversationId,
      id: ticket.id,
      orgId: payload.orgId,
      summary: ticket.summary,
      tenantId: payload.tenantId
    },
    ticketEvent: {
      id: randomUUID(),
      orgId: payload.orgId,
      tenantId: payload.tenantId,
      ticketId: ticket.id,
      traceId: payload.traceId
    }
  });
}

export function createTelegramBotConversationBullmqProcessor(
  gateway: TelegramBotConversationPersistenceGateway
) {
  return (job: RuntimeJob) => {
    if (job.name !== telegramBotConversationQueueDefaults.jobName) {
      throw new Error("telegram bot conversation job name is unsupported");
    }
    return processTelegramBotConversationJob(job.data, gateway);
  };
}

export function createTelegramBotConversationBullmqWorker(options: {
  connection: QueueOptions["connection"];
  gateway: TelegramBotConversationPersistenceGateway;
  prefix?: string;
  queueName?: string;
}) {
  return new Worker(
    options.queueName ?? telegramBotConversationQueueDefaults.queueName,
    createTelegramBotConversationBullmqProcessor(options.gateway),
    { connection: options.connection, prefix: options.prefix }
  );
}

export class PrismaTelegramBotConversationPersistenceGateway implements TelegramBotConversationPersistenceGateway {
  constructor(private readonly prisma: PrismaClientPort) {}

  persistAcceptedUpdate(input: RuntimePersistInput): Promise<RuntimeResult> {
    const scope = { orgId: input.dedupe.orgId, tenantId: input.dedupe.tenantId };
    const context = createRlsTransactionContext(scope);
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(context.roleSql);
      for (const setting of context.settings) {
        await tx.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
      }

      const dedupe = await tx.telegramUpdateDedupe.createMany({
        data: {
          channelConnectionId: input.dedupe.channelConnectionId,
          orgId: input.dedupe.orgId,
          providerUpdateId: input.dedupe.providerUpdateId,
          tenantId: input.dedupe.tenantId,
          updateKind: input.dedupe.updateKind
        },
        skipDuplicates: true
      });
      if (dedupe.count === 0) {
        return {
          providerUpdateId: input.dedupe.providerUpdateId,
          status: "deduped",
          traceId: input.ticketEvent.traceId
        };
      }

      const persisted = await persistConversationRuntime(tx, input);
      return {
        conversationId: persisted.conversationId,
        messageId: input.message.id,
        providerUpdateId: input.dedupe.providerUpdateId,
        status: "accepted",
        ticketId: input.ticket.id,
        traceId: input.ticketEvent.traceId
      };
    });
  }
}

async function persistConversationRuntime(
  tx: PrismaClientPort,
  input: RuntimePersistInput
) {
  const conversation = await tx.channelConversation.upsert({
    create: {
      channelConnectionId: input.conversation.channelConnectionId,
      externalConversationRef: input.conversation.externalConversationRef,
      id: input.conversation.id,
      lastMessageAt: new Date(input.conversation.lastMessageAt),
      orgId: input.conversation.orgId,
      participantExternalRef: input.conversation.participantExternalRef,
      status: "PENDING_HANDOFF",
      tenantId: input.conversation.tenantId,
      unreadCount: 1
    },
    update: {
      lastMessageAt: new Date(input.conversation.lastMessageAt),
      status: "PENDING_HANDOFF",
      unreadCount: { increment: 1 }
    },
    where: {
      orgId_tenantId_channelConnectionId_externalConversationRef: {
        channelConnectionId: input.conversation.channelConnectionId,
        externalConversationRef: input.conversation.externalConversationRef,
        orgId: input.conversation.orgId,
        tenantId: input.conversation.tenantId
      }
    }
  });
  const conversationId = conversation.id as string;
  await tx.channelMessage.create({
    data: {
      channelConnectionId: input.message.channelConnectionId,
      content: input.message.content,
      contentKind: dbContentKind(input.message.contentKind),
      conversationId,
      deliveryStatus: "RECEIVED",
      direction: "INBOUND",
      externalMessageRef: input.message.externalMessageRef,
      id: input.message.id,
      occurredAt: new Date(input.message.occurredAt),
      orgId: input.message.orgId,
      tenantId: input.message.tenantId
    }
  });
  await tx.supportTicket.create({
    data: {
      conversationId,
      id: input.ticket.id,
      orgId: input.ticket.orgId,
      priority: 3,
      status: "OPEN",
      summary: input.ticket.summary,
      tenantId: input.ticket.tenantId
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

function safeMessageContent(payload: TelegramBotConversationJobPayload) {
  return {
    callbackDataLength: payload.callbackData?.length ?? 0,
    contentKind: payload.contentKind,
    fileCount: payload.fileIds?.length ?? 0,
    provider: payload.provider,
    providerUpdateId: payload.providerUpdateId,
    textLength: payload.text?.length ?? 0,
    traceId: payload.traceId,
    unsupportedReason: payload.unsupportedReason
  };
}

function dbContentKind(kind: TelegramBotConversationJobPayload["contentKind"]) {
  return kind.toUpperCase();
}

function assertPayload(payload: TelegramBotConversationJobPayload) {
  for (const key of ["channelConnectionId", "orgId", "providerUpdateId", "tenantId"]) {
    if (typeof payload[key as keyof TelegramBotConversationJobPayload] !== "string") {
      throw new Error(`${key} is required`);
    }
  }
  if (payload.contentKind === "unsupported") {
    throw new Error("unsupported telegram bot updates are not conversation jobs");
  }
}

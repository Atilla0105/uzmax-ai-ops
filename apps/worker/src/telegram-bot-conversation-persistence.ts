import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";
import type {
  RuntimePersistInput,
  RuntimeResult,
  TelegramBotConversationPersistenceGateway
} from "./conversation-runtime.ts";
import { createHash } from "node:crypto";
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
  customer: { upsert(input: unknown): MaybePromise<{ id: string }> };
  customerIdentity: {
    findUnique(input: unknown): MaybePromise<{
      customerId: string;
      firstSeenAt: Date;
      lastSeenAt?: Date | null;
      metadata?: unknown;
    } | null>;
    upsert(input: unknown): MaybePromise<unknown>;
  };
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
type TicketPersistInput = RuntimePersistInput & {
  ticket: {
    conversationId: string;
    id: string;
    orgId: string;
    summary: string;
    tenantId: string;
  };
  ticketEvent: {
    id: string;
    orgId: string;
    tenantId: string;
    ticketId: string;
    traceId: string;
  };
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
      if (input.customerIdentity) {
        await persistCustomerIdentity(tx, input.customerIdentity);
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
        ticketId: input.ticket?.id,
        traceId: input.traceId
      };
    }, TELEGRAM_RUNTIME_TRANSACTION_OPTIONS);
  }
}

type CustomerIdentityDraft = NonNullable<RuntimePersistInput["customerIdentity"]>;

async function persistCustomerIdentity(
  tx: PrismaClientPort,
  input: CustomerIdentityDraft
) {
  await lockCustomerIdentity(tx, input);
  const identityWhere = {
    orgId: input.orgId,
    tenantId: input.tenantId,
    provider: input.provider,
    externalSubjectRef: input.externalSubjectRef
  };
  const existing = await tx.customerIdentity.findUnique({
    select: {
      customerId: true,
      firstSeenAt: true,
      lastSeenAt: true,
      metadata: true
    },
    where: { orgId_tenantId_provider_externalSubjectRef: identityWhere }
  });
  const customerId = existing?.customerId ?? deterministicTenantUuid("customer", input);
  await tx.customer.upsert({
    create: {
      displayLabelRef: input.externalSubjectRef,
      id: customerId,
      metadata: { source: "telegram_bot" },
      orgId: input.orgId,
      preferredLanguage: input.participantProfile?.languageCode,
      tenantId: input.tenantId
    },
    update: {},
    where: {
      id_orgId_tenantId: {
        id: customerId,
        orgId: input.orgId,
        tenantId: input.tenantId
      }
    }
  });
  const metadata = mergedIdentityMetadata(existing?.metadata, input);
  const observedAt = new Date(input.seenAt);
  const firstSeenAt =
    existing && existing.firstSeenAt < observedAt ? existing.firstSeenAt : observedAt;
  const seenAt = latestSeenAt(existing, observedAt);
  await tx.customerIdentity.upsert({
    create: {
      ...identityWhere,
      channelConnectionId: input.channelConnectionId,
      customerId,
      firstSeenAt,
      id: deterministicTenantUuid("identity", input),
      identityKind: input.identityKind,
      lastSeenAt: seenAt,
      metadata,
      status: "ACTIVE"
    },
    update: {
      channelConnectionId: input.channelConnectionId,
      firstSeenAt,
      lastSeenAt: seenAt,
      metadata
    },
    where: { orgId_tenantId_provider_externalSubjectRef: identityWhere }
  });
}

async function lockCustomerIdentity(
  tx: PrismaClientPort,
  input: CustomerIdentityDraft
) {
  const lockKey = JSON.stringify([
    input.orgId,
    input.tenantId,
    input.provider,
    input.externalSubjectRef
  ]);
  await tx.$queryRaw`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))::text as lock_result`;
}

function latestSeenAt(
  existing: {
    firstSeenAt: Date;
    lastSeenAt?: Date | null;
  } | null,
  incoming: Date
) {
  return new Date(
    Math.max(
      incoming.getTime(),
      existing?.firstSeenAt.getTime() ?? 0,
      existing?.lastSeenAt?.getTime() ?? 0
    )
  );
}

function mergedIdentityMetadata(previous: unknown, input: CustomerIdentityDraft) {
  const metadata = recordValue(previous);
  const profile = {
    ...recordValue(metadata.profile),
    ...(input.participantProfile ?? {})
  };
  return Object.keys(profile).length > 0
    ? { source: "telegram_bot", ...metadata, profile }
    : { source: "telegram_bot", ...metadata };
}

function deterministicTenantUuid(kind: string, input: CustomerIdentityDraft) {
  const namespace = Buffer.from("6ba7b8119dad11d180b400c04fd430c8", "hex");
  const name = [
    "urn:uzmax",
    kind,
    input.orgId,
    input.tenantId,
    input.provider,
    input.externalSubjectRef
  ].join(":");
  const bytes = createHash("sha1")
    .update(namespace)
    .update(name, "utf8")
    .digest()
    .subarray(0, 16);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const value = bytes.toString("hex");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
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
  if (input.runtimeBranch === "answer") {
    await persistOutboundMessage(tx, input, conversationId);
    if (hasTicket(input)) await persistTicket(tx, input, conversationId);
  } else await persistTicket(tx, input, conversationId);
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
  input: TicketPersistInput,
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

function hasTicket(input: RuntimePersistInput): input is TicketPersistInput {
  return Boolean(input.ticket && input.ticketEvent);
}

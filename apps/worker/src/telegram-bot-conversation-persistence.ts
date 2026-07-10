import {
  createRlsTransactionContext,
  type RlsTenantContext
} from "../../../packages/db/src/index.ts";
import type {
  AnswerPersistInput,
  DedupeDraft,
  RuntimePersistInput
} from "./telegram-bot-conversation.flow.ts";
import { deterministicCustomerIdentityUuid } from "./telegram-bot-conversation.flow.ts";

type AsyncRow = Promise<unknown>;
type Methods<Name extends string> = Record<Name, (input: unknown) => AsyncRow>;
type Delegate = Methods<"findFirst" | "findMany">;
type MutableDelegate = Delegate &
  Methods<"create" | "createMany" | "findUnique" | "update" | "updateMany" | "upsert">;
export type TelegramConversationTransaction = {
  $executeRawUnsafe(sql: string): AsyncRow;
  $queryRaw<T = unknown>(
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): Promise<T>;
  channelConversation: MutableDelegate;
  channelMessage: MutableDelegate;
  customer: Pick<MutableDelegate, "upsert">;
  customerIdentity: Pick<
    MutableDelegate,
    "findFirst" | "findMany" | "findUnique" | "upsert"
  >;
  supportTicket: Pick<MutableDelegate, "create" | "findMany">;
  supportTicketEvent: Pick<MutableDelegate, "create">;
  telegramUpdateDedupe: Pick<
    MutableDelegate,
    "create" | "createMany" | "findFirst" | "updateMany"
  >;
};
export type TelegramConversationPrismaPort = TelegramConversationTransaction & {
  $transaction<T>(
    action: (tx: TelegramConversationTransaction) => Promise<T>,
    options?: { maxWait?: number; timeout?: number }
  ): Promise<T>;
};
export type DbRow = Record<string, unknown>;
export type Scope = { orgId: string; tenantId: string };
export type LockedState = {
  conversation: DbRow;
  disposition: "bot" | "closed" | "operator";
  tickets: DbRow[];
};

const transactionOptions = { maxWait: 60_000, timeout: 60_000 } as const;

export function runTelegramConversationTransaction<T>(
  prisma: TelegramConversationPrismaPort,
  scoped: Scope,
  action: (tx: TelegramConversationTransaction) => Promise<T>
) {
  return prisma.$transaction(async (tx) => {
    await applyRlsContext(tx, createRlsTransactionContext(scoped));
    return action(tx);
  }, transactionOptions);
}

export async function reserveDedupe(
  tx: TelegramConversationTransaction,
  input: DedupeDraft
) {
  const result = record(
    await tx.telegramUpdateDedupe.createMany({
      data: {
        channelConnectionId: input.channelConnectionId,
        orgId: input.orgId,
        providerUpdateId: input.providerUpdateId,
        tenantId: input.tenantId,
        updateKind: input.updateKind
      },
      skipDuplicates: true
    }),
    "dedupe reservation"
  );
  return Number(result.count ?? 0) === 1;
}

type CustomerIdentityDraft = NonNullable<RuntimePersistInput["customerIdentity"]>;

export async function persistCustomerIdentity(
  tx: TelegramConversationTransaction,
  input: CustomerIdentityDraft
) {
  const lockKey = JSON.stringify([
    input.orgId,
    input.tenantId,
    input.provider,
    input.externalSubjectRef
  ]);
  await tx.$queryRaw`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))::text as lock_result`;
  const identityWhere = {
    orgId: input.orgId,
    tenantId: input.tenantId,
    provider: input.provider,
    externalSubjectRef: input.externalSubjectRef
  };
  const existing = optionalRecord(
    await tx.customerIdentity.findUnique({
      select: {
        customerId: true,
        firstSeenAt: true,
        lastSeenAt: true,
        metadata: true
      },
      where: { orgId_tenantId_provider_externalSubjectRef: identityWhere }
    })
  );
  const customerId =
    (existing?.customerId as string | undefined) ??
    deterministicCustomerIdentityUuid("customer", input);
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
  const observedAt = new Date(input.seenAt);
  const firstSeenAt = earlierDate(existing?.firstSeenAt, observedAt);
  const lastSeenAt = laterDate(existing, observedAt);
  await tx.customerIdentity.upsert({
    create: {
      ...identityWhere,
      channelConnectionId: input.channelConnectionId,
      customerId,
      firstSeenAt,
      id: deterministicCustomerIdentityUuid("identity", input),
      identityKind: input.identityKind,
      lastSeenAt,
      metadata: mergedIdentityMetadata(existing?.metadata, input),
      status: "ACTIVE"
    },
    update: {
      channelConnectionId: input.channelConnectionId,
      firstSeenAt,
      lastSeenAt,
      metadata: mergedIdentityMetadata(existing?.metadata, input)
    },
    where: { orgId_tenantId_provider_externalSubjectRef: identityWhere }
  });
}

export async function lockConversationRow(
  tx: TelegramConversationTransaction,
  scoped: Scope,
  conversationId: string
) {
  const locked = await tx.$queryRaw<DbRow[]>`
    select id from conversation
    where id = ${conversationId}::uuid and org_id = ${scoped.orgId}::uuid
      and tenant_id = ${scoped.tenantId}::uuid for update
  `;
  if (!Array.isArray(locked) || locked.length !== 1) throw conflict();
}

export async function lockActiveTickets(
  tx: TelegramConversationTransaction,
  scoped: Scope,
  conversationId: string
) {
  await tx.$queryRaw<DbRow[]>`
    select id from ticket where conversation_id = ${conversationId}::uuid
      and org_id = ${scoped.orgId}::uuid and tenant_id = ${scoped.tenantId}::uuid
      and status <> 'closed'::ticket_status order by id for update
  `;
}

export async function lockIntent(
  tx: TelegramConversationTransaction,
  scoped: Scope,
  conversationId: string,
  messageId: string
) {
  const locked = await tx.$queryRaw<DbRow[]>`
    select id from message where id = ${messageId}::uuid
      and conversation_id = ${conversationId}::uuid
      and org_id = ${scoped.orgId}::uuid and tenant_id = ${scoped.tenantId}::uuid
    for update
  `;
  if (!Array.isArray(locked) || locked.length !== 1) throw conflict();
  return record(
    await tx.channelMessage.findFirst({
      where: { ...scoped, conversationId, id: messageId }
    })
  );
}

export async function lockConversationByNaturalKey(
  tx: TelegramConversationTransaction,
  input: RuntimePersistInput
) {
  const c = input.conversation;
  const found = await tx.$queryRaw<DbRow[]>`
    select id from conversation where org_id = ${c.orgId}::uuid
      and tenant_id = ${c.tenantId}::uuid
      and channel_connection_id = ${c.channelConnectionId}::uuid
      and external_conversation_ref = ${c.externalConversationRef} for update
  `;
  if (!Array.isArray(found) || found.length !== 1) throw conflict();
  return text(found[0]?.id, "conversation id");
}

export async function updateIntent(
  tx: TelegramConversationTransaction,
  scoped: Scope,
  marker: DbRow,
  data: Record<string, unknown>
) {
  await tx.channelMessage.update({
    data,
    where: compoundWhere(scoped, text(marker.id, "intent id"))
  });
}

export async function incrementUnread(
  tx: TelegramConversationTransaction,
  scoped: Scope,
  conversationId: string
) {
  await tx.channelConversation.update({
    data: { unreadCount: { increment: 1 } },
    where: compoundWhere(scoped, conversationId)
  });
}

export async function markProcessed(
  tx: TelegramConversationTransaction,
  dedupe: DedupeDraft
) {
  const result = record(
    await tx.telegramUpdateDedupe.updateMany({
      data: { processedAt: new Date() },
      where: { ...dedupeWhere(dedupe), processedAt: null }
    })
  );
  return Number(result.count ?? 0) === 1;
}

export function inboundMessageData(input: RuntimePersistInput, conversationId: string) {
  return {
    ...input.message,
    contentKind: input.message.contentKind.toUpperCase(),
    conversationId,
    deliveryStatus: "RECEIVED",
    direction: "INBOUND",
    occurredAt: new Date(input.message.occurredAt)
  };
}

export function outboundMessageData(input: AnswerPersistInput, conversationId: string) {
  return {
    ...input.outboundMessage,
    contentKind: "TEXT",
    conversationId,
    deliveryStatus: "QUEUED",
    direction: "OUTBOUND",
    occurredAt: new Date(input.outboundMessage.occurredAt)
  };
}

export function naturalKey(input: RuntimePersistInput) {
  const c = input.conversation;
  return {
    channelConnectionId: c.channelConnectionId,
    externalConversationRef: c.externalConversationRef,
    orgId: c.orgId,
    tenantId: c.tenantId
  };
}

export function dedupeWhere(input: DedupeDraft) {
  return {
    channelConnectionId: input.channelConnectionId,
    orgId: input.orgId,
    providerUpdateId: input.providerUpdateId,
    tenantId: input.tenantId
  };
}

export function compoundWhere(scoped: Scope, id: string) {
  return { id_orgId_tenantId: { id, ...scoped } };
}

export function scope(input: RlsTenantContext): Scope {
  return { orgId: input.orgId, tenantId: input.tenantId };
}

export function markerPhase(marker: DbRow) {
  return String(contentOf(marker).dispatchPhase ?? "");
}

export function contentOf(row: DbRow) {
  return record(row.content, "message content");
}

export function ticketIdOf(state: { tickets: DbRow[] }) {
  return state.tickets[0] ? text(state.tickets[0].id, "ticket id") : undefined;
}

export function rows(value: unknown): DbRow[] {
  if (!Array.isArray(value)) throw conflict();
  return value.map((row) => record(row));
}

export function record(value: unknown, label = "database row"): DbRow {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is invalid`);
  }
  return value as DbRow;
}

export function text(value: unknown, label: string) {
  if (typeof value !== "string" || !value) throw new Error(`${label} is invalid`);
  return value;
}

export function conflict() {
  return new Error("conversation ownership conflict");
}

async function applyRlsContext(
  tx: TelegramConversationTransaction,
  context: ReturnType<typeof createRlsTransactionContext>
) {
  await tx.$executeRawUnsafe(context.roleSql);
  for (const setting of context.settings) {
    await tx.$queryRaw`select set_config(${setting.key}, ${setting.value}, true)`;
  }
}

function earlierDate(value: unknown, incoming: Date) {
  return value instanceof Date && value < incoming ? value : incoming;
}

function laterDate(existing: DbRow | undefined, incoming: Date) {
  return new Date(
    Math.max(
      incoming.getTime(),
      existing?.firstSeenAt instanceof Date ? existing.firstSeenAt.getTime() : 0,
      existing?.lastSeenAt instanceof Date ? existing.lastSeenAt.getTime() : 0
    )
  );
}

function mergedIdentityMetadata(previous: unknown, input: CustomerIdentityDraft) {
  const metadata = optionalRecord(previous) ?? {};
  const profile = {
    ...(optionalRecord(metadata.profile) ?? {}),
    ...(input.participantProfile ?? {})
  };
  return Object.keys(profile).length > 0
    ? { source: "telegram_bot", ...metadata, profile }
    : { source: "telegram_bot", ...metadata };
}

function optionalRecord(value: unknown): DbRow | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DbRow)
    : undefined;
}

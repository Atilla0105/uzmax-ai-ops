export const ORG_ID = "11111111-1111-4111-8111-111111111111";
export const TENANT_A = "22222222-2222-4222-8222-222222222222";
export const TENANT_B = "33333333-3333-4333-8333-333333333333";
export const USER_A = "44444444-4444-4444-8444-444444444444";
const CHANNEL_ID = "66666666-6666-4666-8666-666666666666";
export const CONVERSATION_A_OPEN = "77777777-7777-4777-8777-777777777777";
export const CONVERSATION_A_HANDOFF = "88888888-8888-4888-888888888888";
export const TICKET_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const MESSAGE_INBOUND = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const MESSAGE_OUTBOUND = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const CUSTOMER_ID = "12121212-1212-4212-8212-121212121212";
const IDENTITY_ID = "13131313-1313-4313-8313-131313131313";
const CONVERSATION_B = "99999999-9999-4999-8999-999999999999";
const EVENT_CREATED = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const EVENT_NOTE = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
export const SYSTEM_ACTOR = "00000000-0000-4000-8000-000000000005";
const NOW = "2026-06-17T00:00:00.000Z";

export function fakePrisma() {
  let generatedEventCount = 0;
  const fake = {
    conversations: [
      conversationRow({
        id: CONVERSATION_A_HANDOFF,
        lastMessageAt: "2026-06-17T00:05:00.000Z",
        participantExternalRef: "telegram:user:handoff",
        status: "PENDING_HANDOFF",
        tenantId: TENANT_A,
        unreadCount: 2
      }),
      conversationRow({
        id: CONVERSATION_A_OPEN,
        lastMessageAt: NOW,
        participantExternalRef: "telegram:user:open",
        status: "OPEN",
        tenantId: TENANT_A,
        unreadCount: 0
      }),
      conversationRow({
        id: CONVERSATION_B,
        lastMessageAt: NOW,
        participantExternalRef: "telegram:user:tenant-b",
        status: "PENDING_HANDOFF",
        tenantId: TENANT_B,
        unreadCount: 3
      })
    ],
    events: [
      eventRow({
        actorUserId: null,
        eventType: "CREATED",
        id: EVENT_CREATED,
        occurredAt: "2026-06-17T00:06:00.000Z",
        payload: { traceId: "m8-02:created" }
      }),
      eventRow({
        actorUserId: USER_A,
        eventType: "NOTE_ADDED",
        id: EVENT_NOTE,
        occurredAt: "2026-06-17T00:07:00.000Z",
        payload: { note: "operator note" }
      })
    ],
    messages: [
      messageRow({
        direction: "OUTBOUND",
        id: MESSAGE_OUTBOUND,
        occurredAt: "2026-06-17T00:05:30.000Z"
      }),
      messageRow({
        direction: "INBOUND",
        id: MESSAGE_INBOUND,
        occurredAt: "2026-06-17T00:05:00.000Z"
      }),
      messageRow({
        conversationId: CONVERSATION_B,
        direction: "INBOUND",
        id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        occurredAt: NOW,
        tenantId: TENANT_B
      })
    ],
    channelConnections: [
      {
        id: CHANNEL_ID,
        orgId: ORG_ID,
        provider: "telegram_bot",
        tenantId: TENANT_A
      }
    ],
    customerIdentities: [
      {
        channelConnectionId: "14141414-1414-4414-8414-141414141414",
        customer: {
          id: CUSTOMER_ID,
          orgId: ORG_ID,
          preferredLanguage: "  controlled-language  ",
          status: "ACTIVE",
          tenantId: TENANT_A
        },
        customerId: CUSTOMER_ID,
        externalSubjectRef: "telegram:user:handoff",
        firstSeenAt: new Date("2026-06-16T00:00:00.000Z"),
        id: IDENTITY_ID,
        lastSeenAt: new Date("2026-06-17T00:05:00.000Z"),
        metadata: {
          profile: {
            displayName: "untrusted stored display",
            firstName: "Ada",
            languageCode: "en",
            unknown: "must-not-escape",
            username: "ada_support"
          }
        },
        orgId: ORG_ID,
        provider: "telegram_bot",
        status: "ACTIVE",
        tenantId: TENANT_A
      }
    ],
    tickets: [
      {
        assignedUserId: null,
        closedAt: null,
        conversationId: CONVERSATION_A_HANDOFF,
        id: TICKET_ID,
        lockedByUserId: null,
        orgId: ORG_ID,
        priority: 3,
        slaDueAt: new Date("2026-06-17T01:05:00.000Z"),
        status: "OPEN",
        summary: "telegram_bot_text_requires_operator_review",
        tenantId: TENANT_A
      }
    ],
    transactions: []
  };
  const nextEventId = () => {
    generatedEventCount += 1;
    return `generated-event-${generatedEventCount}`;
  };
  Object.assign(fake, {
    $executeRawUnsafe: async (sql) => ({ kind: "role", sql }),
    $queryRaw: async (_strings, key, value) => ({ key, kind: "set_config", value }),
    $transaction: async (operations) => {
      const result = await Promise.all(operations);
      fake.transactions.push(result);
      return result;
    },
    channelConnection: delegate(fake.channelConnections),
    channelConversation: delegate(fake.conversations),
    channelMessage: delegate(fake.messages),
    customerIdentity: delegate(fake.customerIdentities),
    supportTicket: delegate(fake.tickets),
    supportTicketEvent: delegate(fake.events, { nextId: nextEventId })
  });
  return fake;
}

function conversationRow(patch) {
  return {
    channelConnectionId: CHANNEL_ID,
    externalConversationRef: `telegram:chat:${patch.id}`,
    id: patch.id,
    lastMessageAt: new Date(patch.lastMessageAt),
    orgId: ORG_ID,
    participantExternalRef: patch.participantExternalRef,
    status: patch.status,
    tenantId: patch.tenantId,
    unreadCount: patch.unreadCount
  };
}

function eventRow(patch) {
  return {
    actorUserId: patch.actorUserId,
    eventType: patch.eventType,
    id: patch.id,
    occurredAt: new Date(patch.occurredAt),
    orgId: ORG_ID,
    payload: patch.payload,
    tenantId: TENANT_A,
    ticketId: TICKET_ID
  };
}

function messageRow(patch) {
  return {
    channelConnectionId: CHANNEL_ID,
    content: { contentKind: "text", textLength: 12, traceId: "m8-02:message" },
    contentKind: "TEXT",
    conversationId: patch.conversationId ?? CONVERSATION_A_HANDOFF,
    deliveryStatus: patch.direction === "OUTBOUND" ? "SENT" : "RECEIVED",
    direction: patch.direction,
    externalMessageRef: `telegram:message:${patch.id}`,
    id: patch.id,
    occurredAt: new Date(patch.occurredAt),
    orgId: ORG_ID,
    tenantId: patch.tenantId ?? TENANT_A
  };
}

function delegate(rows, options = {}) {
  return {
    create: async ({ data }) => {
      const row = { ...data, id: data.id ?? options.nextId?.() };
      rows.push(row);
      return row;
    },
    findFirst: async ({ where = {} }) =>
      rows.find((row) => matchesWhere(row, where)) ?? null,
    findMany: async ({ orderBy, where = {} }) => {
      const selected = rows.filter((row) => matchesWhere(row, where));
      return orderBy ? sortRows(selected, orderBy) : selected;
    },
    update: async ({ data, where = {} }) => {
      const row = rows.find((candidate) => matchesWhere(candidate, where));
      if (!row) throw new Error("record not found");
      Object.assign(row, data, { updatedAt: new Date("2026-06-17T00:30:00.000Z") });
      return row;
    },
    upsert: async ({ create, update, where = {} }) => {
      const row = rows.find((candidate) => matchesWhere(candidate, where));
      if (row) {
        Object.assign(row, update, { updatedAt: new Date("2026-06-17T00:30:00.000Z") });
        return row;
      }
      const inserted = {
        ...create,
        createdAt: new Date(NOW),
        updatedAt: new Date(NOW)
      };
      rows.push(inserted);
      return inserted;
    }
  };
}

function matchesWhere(row, where) {
  return Object.entries(where).every(([key, value]) => {
    if (key === "id_orgId_tenantId" && isRecord(value)) {
      return (
        row.id === value.id &&
        row.orgId === value.orgId &&
        row.tenantId === value.tenantId
      );
    }
    if (isRecord(value) && Array.isArray(value.in)) return value.in.includes(row[key]);
    return row[key] === value;
  });
}

function sortRows(rows, orderBy) {
  const [[key, direction]] = Object.entries(orderBy);
  return [...rows].sort((left, right) => {
    const leftValue = sortableValue(left[key]);
    const rightValue = sortableValue(right[key]);
    const comparison = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
    return direction === "desc" ? -comparison : comparison;
  });
}

function sortableValue(value) {
  return value instanceof Date ? value.getTime() : value;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function contextFor(selectedTenantId, permissions = ["conversation:read"]) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [selectedTenantId],
    userId: USER_A
  };
}

export function ticketEventTypes(fake, ticketId) {
  return sortRows(
    fake.events.filter((event) => event.ticketId === ticketId),
    { occurredAt: "asc" }
  ).map((event) => event.eventType);
}

export function ids(rows) {
  return rows.map((row) => row.id);
}

export function renderConfigPatterns() {
  return [
    /UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE\s*\n\s*value: rls_prisma_gateway/,
    /UZMAX_RLS_DATABASE_URL\s*\n\s*sync: false/,
    /UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE\s*\n\s*value: rls_prisma_gateway/,
    /UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE\s*\n\s*value: live/,
    /UZMAX_WORKER_TELEGRAM_BOT_LLM_PROVIDER\s*\n\s*value: deepseek/,
    /UZMAX_WORKER_DEEPSEEK_MODEL\s*\n\s*value: deepseek-v4-flash/,
    /UZMAXADMIN_DEEPSEEK_KEY\s*\n\s*sync: false/,
    /UZMAX_WORKER_TELEGRAM_BOT_AI_MEMBER_KEY\s*\n\s*value: support_bot/,
    /UZMAX_WORKER_TELEGRAM_BOT_KB_ENTRY_KEY\s*\n\s*value: setup/,
    /UZMAX_WORKER_TELEGRAM_BOT_REQUIRED_CAPABILITY_KEY\s*\n\s*value: TUTORIAL/
  ];
}

export function futureActionTimes() {
  const base = Date.now() + 60_000;
  return Array.from({ length: 6 }, (_, index) =>
    new Date(base + index * 60_000).toISOString()
  );
}

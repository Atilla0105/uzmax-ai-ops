import {
  applyM11FixtureData,
  matchesM11FixtureWhere as matchesWhere,
  queryM11ConversationFixture
} from "../../packages/db/scripts/tests/m8-active-answer-worker-smoke-support.mjs";

export const ORG_ID = "11111111-1111-4111-8111-111111111111",
  TENANT_A = "22222222-2222-4222-8222-222222222222",
  TENANT_B = "33333333-3333-4333-8333-333333333333",
  USER_A = "44444444-4444-4444-8444-444444444444";
const CHANNEL_ID = "66666666-6666-4666-8666-666666666666",
  CUSTOMER_ID = "12121212-1212-4212-8212-121212121212",
  IDENTITY_ID = "13131313-1313-4313-8313-131313131313",
  CONVERSATION_B = "99999999-9999-4999-8999-999999999999",
  EVENT_CREATED = "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  EVENT_NOTE = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  NOW = "2026-06-17T00:00:00.000Z";
export const CONVERSATION_A_OPEN = "77777777-7777-4777-8777-777777777777",
  CONVERSATION_A_HANDOFF = "88888888-8888-4888-888888888888",
  TICKET_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  MESSAGE_INBOUND = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  MESSAGE_OUTBOUND = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
export const SYSTEM_ACTOR = "00000000-0000-4000-8000-000000000005";

export function fakePrisma() {
  let generatedEventCount = 0;
  const transactionMutex = createMutex();
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
    customers: [],
    dedupes: [],
    failNextEventCreate: false,
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
    transactionOptions: [],
    transactions: []
  };
  const nextEventId = () => {
    generatedEventCount += 1;
    return `f0000000-0000-4000-8000-${String(generatedEventCount).padStart(12, "0")}`;
  };
  Object.assign(fake, prismaSurface(fake, nextEventId), {
    $transaction: async (operationsOrAction, options) => {
      if (typeof operationsOrAction !== "function") {
        const result = await Promise.all(operationsOrAction);
        fake.transactions.push(result);
        return result;
      }
      fake.transactionOptions.push(options);
      return transactionMutex(async () => {
        const state = cloneState(fake);
        const log = [];
        try {
          const result = await operationsOrAction(
            prismaSurface(state, nextEventId, log)
          );
          commitState(fake, state);
          fake.transactions.push(log);
          return result;
        } catch (error) {
          if (!state.failNextEventCreate) fake.failNextEventCreate = false;
          fake.transactions.push(log);
          throw error;
        }
      });
    }
  });
  return fake;
}

function prismaSurface(state, nextEventId, log) {
  return {
    $executeRawUnsafe: async (sql) => record(log, { kind: "role", sql }),
    $queryRaw: async (strings, ...values) =>
      queryConversationTicketFixture(state, strings, values, log),
    channelConnection: delegate(state.channelConnections),
    channelConversation: delegate(state.conversations),
    channelMessage: delegate(state.messages),
    customer: delegate(state.customers),
    customerIdentity: delegate(state.customerIdentities),
    supportTicket: delegate(state.tickets),
    supportTicketEvent: delegate(state.events, {
      createDefaults: { actorUserId: null, occurredAt: new Date(NOW) },
      failCreate: () => {
        if (!state.failNextEventCreate) return false;
        state.failNextEventCreate = false;
        return true;
      },
      nextId: nextEventId
    }),
    telegramUpdateDedupe: delegate(state.dedupes, {
      uniqueBy: (row) =>
        [row.orgId, row.tenantId, row.channelConnectionId, row.providerUpdateId].join(
          ":"
        )
    })
  };
}

const record = (log, value) => (log?.push(value), value);

function cloneState(fake) {
  return {
    channelConnections: globalThis.structuredClone(fake.channelConnections),
    conversations: globalThis.structuredClone(fake.conversations),
    customers: globalThis.structuredClone(fake.customers),
    customerIdentities: globalThis.structuredClone(fake.customerIdentities),
    dedupes: globalThis.structuredClone(fake.dedupes),
    events: globalThis.structuredClone(fake.events),
    failNextEventCreate: fake.failNextEventCreate,
    messages: globalThis.structuredClone(fake.messages),
    tickets: globalThis.structuredClone(fake.tickets)
  };
}

function queryConversationTicketFixture(state, strings, values, log) {
  const sql = strings.join("?").replaceAll(/\s+/g, " ").trim().toLowerCase();
  const activeLock =
    "select id from ticket where conversation_id = ?::uuid and org_id = ?::uuid and tenant_id = ?::uuid and status <> 'closed'::ticket_status order by id for update";
  const allLock = activeLock.replace(" and status <> 'closed'::ticket_status", "");
  if (sql === allLock && values.length === 3) {
    const tickets = state.tickets.map((ticket) => ({ ...ticket, status: "OPEN" }));
    return queryM11ConversationFixture({ ...state, tickets }, strings, values, log);
  }
  if (sql.includes("from ticket") && (sql !== activeLock || values.length !== 3)) {
    throw new Error("unsupported fake ticket lock query");
  }
  return queryM11ConversationFixture(state, strings, values, log);
}

const commitState = (fake, state) =>
  Object.entries(state).forEach(
    ([key, rows]) =>
      Array.isArray(rows) && fake[key].splice(0, fake[key].length, ...rows)
  );

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
      if (options.failCreate?.()) throw new Error("synthetic event write failure");
      const row = {
        ...(options.createDefaults ?? {}),
        ...data,
        id: data.id ?? options.nextId?.()
      };
      rows.push(row);
      return row;
    },
    findFirst: async ({ where = {} }) =>
      rows.find((row) => matchesWhere(row, where)) ?? null,
    findUnique: async ({ where = {} }) =>
      rows.find((row) => matchesWhere(row, where)) ?? null,
    findMany: async ({ orderBy, where = {} }) => {
      const selected = rows.filter((row) => matchesWhere(row, where));
      return orderBy ? sortRows(selected, orderBy) : selected;
    },
    update: async ({ data, where = {} }) => {
      const row = rows.find((candidate) => matchesWhere(candidate, where));
      if (!row) throw new Error("record not found");
      applyM11FixtureData(row, data);
      row.updatedAt = new Date("2026-06-17T00:30:00.000Z");
      return row;
    },
    updateMany: async ({ data, where = {} }) => {
      const selected = rows.filter((row) => matchesWhere(row, where));
      for (const row of selected) applyM11FixtureData(row, data);
      return { count: selected.length };
    },
    createMany: async ({ data }) => {
      const key = options.uniqueBy?.(data);
      if (key && rows.some((row) => options.uniqueBy(row) === key)) {
        return { count: 0 };
      }
      rows.push({ ...data, processedAt: data.processedAt ?? null });
      return { count: 1 };
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

function sortRows(rows, orderBy) {
  const [[key, direction]] = Object.entries(orderBy);
  return [...rows].sort((left, right) => {
    const leftValue = left[key] instanceof Date ? left[key].getTime() : left[key];
    const rightValue = right[key] instanceof Date ? right[key].getTime() : right[key];
    const comparison = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
    return direction === "desc" ? -comparison : comparison;
  });
}

function createMutex() {
  let tail = Promise.resolve();
  return async (action) => {
    const previous = tail;
    let release;
    tail = new Promise((resolve) => {
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

export const contextFor = (selectedTenantId, permissions = ["conversation:read"]) => ({
  membershipVersion: 1,
  orgId: ORG_ID,
  permissions,
  selectedTenantId,
  tenantIds: [selectedTenantId],
  userId: USER_A
});

export function ticketEventTypes(fake, ticketId) {
  return sortRows(
    fake.events.filter((event) => event.ticketId === ticketId),
    { occurredAt: "asc" }
  ).map((event) => event.eventType);
}

export const ids = (rows) => rows.map((row) => row.id);

export function m11SyntheticSendResult(request, status = "SENT") {
  return {
    dryRun: true,
    provider: "telegram_bot",
    providerMessageRef: `dry-run:${request.idempotencyKey}`,
    requestId: request.idempotencyKey,
    sentAt: "2026-07-10T00:00:01.000Z",
    status,
    traceId: request.traceId
  };
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

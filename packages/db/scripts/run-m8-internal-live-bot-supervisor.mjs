import { setTimeout as delay } from "node:timers/promises";
import { URL } from "node:url";

const requiredPreflightEnv = [
  "TELEGRAM_BOT_WEBHOOK_SECRET",
  "UZMAX_INTERNAL_TEST_WEBHOOK_URL",
  "UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID",
  "UZMAX_TELEGRAM_BOT_ORG_ID",
  "UZMAX_TELEGRAM_BOT_TENANT_ID"
];
const dbVerifyEnv = ["UZMAX_RLS_DATABASE_URL", "UZMAX_INTERNAL_TEST_CHAT_ID"];
const defaultTimeoutMs = 120_000;
const defaultSinceMinutes = 30;
const telegramAllowedUpdates = ["message", "callback_query"];

const helpText = `M8 internal live Bot supervisor

Purpose:
- prepare an owner-approved test Bot webhook
- verify Telegram Bot API reachability without printing token values
- verify a real internal employee message reached DB readback
- confirm either outbound SENT or handoff ticket exists

Default:
- preflight only
- no Telegram network call
- no setWebhook
- no DB connection
- no live/customer/LLM/provider claim

Required env for preflight:
- UZMAX_TELEGRAM_BOT_TOKEN or TELEGRAM_TEST_BOT_TOKEN
- TELEGRAM_BOT_WEBHOOK_SECRET
- UZMAX_INTERNAL_TEST_WEBHOOK_URL
- UZMAX_TELEGRAM_BOT_ORG_ID
- UZMAX_TELEGRAM_BOT_TENANT_ID
- UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID

Additional env for --verify-db:
- UZMAX_RLS_DATABASE_URL
- UZMAX_INTERNAL_TEST_CHAT_ID

Important live boundary:
- use --expect-live when verifying a real Telegram reply
- --set-webhook is explicit and owner-gated
- this command never sends customer data to an LLM/provider

Examples:
  node packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs
  node packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs --check-telegram
  node packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs --set-webhook --drop-pending-updates
  node packages/db/scripts/run-m8-internal-live-bot-supervisor.mjs --expect-live --verify-db
`;

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(helpText.trimEnd());
  process.exit(0);
}

const token = readBotToken();
const missingPreflight = [
  ...(token ? [] : ["UZMAX_TELEGRAM_BOT_TOKEN or TELEGRAM_TEST_BOT_TOKEN"]),
  ...missingEnv(requiredPreflightEnv)
];

if (missingPreflight.length > 0) {
  printMissing(
    "m8-internal-live-bot-supervisor: missing required env",
    missingPreflight
  );
  process.exit(1);
}

if (args.expectLive) {
  const mode = process.env.UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE?.trim();
  if (mode !== "live") {
    console.error(
      "m8-internal-live-bot-supervisor: --expect-live requires UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE=live"
    );
    process.exit(1);
  }
}

if (args.verifyDb) {
  const missing = missingEnv(dbVerifyEnv);
  if (missing.length > 0) {
    printMissing(
      "m8-internal-live-bot-supervisor: --verify-db missing required env",
      missing
    );
    process.exit(1);
  }
}

console.log(
  JSON.stringify(
    {
      event: "m8_internal_live_bot.preflight",
      hasBotToken: true,
      hasWebhookSecret: true,
      mode: process.env.UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE?.trim() || "unset",
      webhookUrl: redactUrl(process.env.UZMAX_INTERNAL_TEST_WEBHOOK_URL),
      willCheckTelegram: args.checkTelegram || args.setWebhook,
      willSetWebhook: args.setWebhook,
      willVerifyDb: args.verifyDb
    },
    null,
    2
  )
);

if (args.checkTelegram || args.setWebhook) {
  await checkTelegram(token);
}

if (args.setWebhook) {
  await setWebhook(token, {
    dropPendingUpdates: args.dropPendingUpdates,
    secretToken: requiredEnv("TELEGRAM_BOT_WEBHOOK_SECRET"),
    webhookUrl: requiredEnv("UZMAX_INTERNAL_TEST_WEBHOOK_URL")
  });
}

if (args.verifyDb) {
  await verifyDbReadback({
    channelConnectionId: requiredEnv("UZMAX_TELEGRAM_BOT_CHANNEL_CONNECTION_ID"),
    chatId: requiredEnv("UZMAX_INTERNAL_TEST_CHAT_ID"),
    databaseUrl: requiredEnv("UZMAX_RLS_DATABASE_URL"),
    orgId: requiredEnv("UZMAX_TELEGRAM_BOT_ORG_ID"),
    sinceMinutes: args.sinceMinutes,
    tenantId: requiredEnv("UZMAX_TELEGRAM_BOT_TENANT_ID"),
    timeoutMs: args.timeoutMs
  });
}

console.log("m8-internal-live-bot-supervisor: finished");

function parseArgs(rawArgs) {
  const parsed = {
    checkTelegram: false,
    dropPendingUpdates: false,
    expectLive: false,
    help: false,
    setWebhook: false,
    sinceMinutes: defaultSinceMinutes,
    timeoutMs: defaultTimeoutMs,
    verifyDb: false
  };
  const flagHandlers = {
    "--check-telegram": () => {
      parsed.checkTelegram = true;
    },
    "--drop-pending-updates": () => {
      parsed.dropPendingUpdates = true;
    },
    "--expect-live": () => {
      parsed.expectLive = true;
    },
    "--help": () => {
      parsed.help = true;
    },
    "--set-webhook": () => {
      parsed.setWebhook = true;
    },
    "--verify-db": () => {
      parsed.verifyDb = true;
    },
    "-h": () => {
      parsed.help = true;
    }
  };

  for (const arg of rawArgs) {
    const handler = flagHandlers[arg];
    if (handler) handler();
    else if (arg.startsWith("--timeout-ms=")) {
      parsed.timeoutMs = positiveInteger(arg.slice("--timeout-ms=".length), arg);
    } else if (arg.startsWith("--since-minutes=")) {
      parsed.sinceMinutes = positiveInteger(arg.slice("--since-minutes=".length), arg);
    } else {
      throw new Error(`unsupported argument: ${arg}`);
    }
  }

  return parsed;
}

function positiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}

function readBotToken() {
  return (
    process.env.UZMAX_TELEGRAM_BOT_TOKEN?.trim() ||
    process.env.TELEGRAM_TEST_BOT_TOKEN?.trim()
  );
}

function missingEnv(names) {
  return names.filter((name) => !process.env[name]?.trim());
}

function printMissing(title, missing) {
  console.error(title);
  for (const name of missing) console.error(`- ${name}`);
  console.error(
    "No live action was started. Provide env values through a trusted internal environment; do not paste secret values into logs."
  );
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function checkTelegram(token) {
  const [me, webhook] = await Promise.all([
    callTelegramMethod(token, "getMe", {}),
    callTelegramMethod(token, "getWebhookInfo", {})
  ]);
  console.log(
    JSON.stringify(
      {
        botId: me.result?.id,
        botUsername: me.result?.username,
        event: "m8_internal_live_bot.telegram_checked",
        pendingUpdateCount: webhook.result?.pending_update_count ?? null,
        webhookUrl: redactUrl(webhook.result?.url)
      },
      null,
      2
    )
  );
}

async function setWebhook(token, { dropPendingUpdates, secretToken, webhookUrl }) {
  assertHttpsUrl(webhookUrl, "UZMAX_INTERNAL_TEST_WEBHOOK_URL");
  const response = await callTelegramMethod(token, "setWebhook", {
    allowed_updates: telegramAllowedUpdates,
    drop_pending_updates: Boolean(dropPendingUpdates),
    secret_token: secretToken,
    url: webhookUrl
  });
  console.log(
    JSON.stringify(
      {
        description: response.description,
        event: "m8_internal_live_bot.webhook_set",
        result: response.result === true,
        webhookUrl: redactUrl(webhookUrl)
      },
      null,
      2
    )
  );
}

async function callTelegramMethod(token, method, body) {
  const apiBase = (
    process.env.UZMAX_TELEGRAM_BOT_API_BASE_URL?.trim() || "https://api.telegram.org"
  ).replace(/\/+$/, "");
  const response = await globalThis.fetch(`${apiBase}/bot${token}/${method}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST"
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.ok !== true) {
    throw new Error(`Telegram ${method} failed with status ${response.status}`);
  }
  return json;
}

async function verifyDbReadback(input) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({
    datasources: { db: { url: input.databaseUrl } }
  });

  try {
    const startedAt = Date.now();
    const since = new Date(startedAt - input.sinceMinutes * 60_000);
    while (Date.now() - startedAt <= input.timeoutMs) {
      const readback = await readConversationState(prisma, { ...input, since });
      if (readback && readback.inboundMessages > 0) {
        if (readback.sentOutboundMessages > 0 || readback.openTickets > 0) {
          console.log(
            JSON.stringify(
              { event: "m8_internal_live_bot.db_verified", ...readback },
              null,
              2
            )
          );
          return;
        }
      }
      await delay(2_000);
    }
  } finally {
    await prisma.$disconnect();
  }

  throw new Error(
    "m8-internal-live-bot-supervisor: DB readback timed out before inbound plus outbound-or-ticket was visible"
  );
}

async function readConversationState(
  prisma,
  { channelConnectionId, chatId, orgId, since, tenantId }
) {
  const chatRef = normalizeChatRef(chatId);
  const rows = await prisma.$transaction([
    prisma.$executeRawUnsafe('set local role "uzmax_app_runtime"'),
    prisma.$queryRaw`select set_config('app.org_id', ${orgId}, true)`,
    prisma.$queryRaw`select set_config('app.tenant_id', ${tenantId}, true)`,
    prisma.$queryRaw`
      select
        c.id::text as "conversationId",
        c.status::text as "conversationStatus",
        c.external_conversation_ref as "externalConversationRef",
        (
          select count(*) from message m
          where m.org_id = c.org_id
            and m.tenant_id = c.tenant_id
            and m.conversation_id = c.id
            and m.direction = 'INBOUND'
        )::int as "inboundMessages",
        (
          select count(*) from message m
          where m.org_id = c.org_id
            and m.tenant_id = c.tenant_id
            and m.conversation_id = c.id
            and m.direction = 'OUTBOUND'
            and m.delivery_status = 'SENT'
        )::int as "sentOutboundMessages",
        (
          select count(*) from ticket t
          where t.org_id = c.org_id
            and t.tenant_id = c.tenant_id
            and t.conversation_id = c.id
            and t.status = 'OPEN'
        )::int as "openTickets"
      from conversation c
      where c.org_id::text = ${orgId}
        and c.tenant_id::text = ${tenantId}
        and c.channel_connection_id::text = ${channelConnectionId}
        and c.external_conversation_ref = ${chatRef}
        and c.updated_at >= ${since}
      order by c.updated_at desc
      limit 1
    `
  ]);
  const row = rows.at(-1)?.[0];
  if (!row) return undefined;
  return {
    conversationId: row.conversationId,
    conversationStatus: row.conversationStatus,
    externalConversationRef: row.externalConversationRef,
    inboundMessages: Number(row.inboundMessages ?? 0),
    openTickets: Number(row.openTickets ?? 0),
    sentOutboundMessages: Number(row.sentOutboundMessages ?? 0)
  };
}

function normalizeChatRef(value) {
  if (value.startsWith("telegram:chat:")) return value;
  if (!/^-?[0-9]{1,32}$/.test(value)) {
    throw new Error("UZMAX_INTERNAL_TEST_CHAT_ID must be a Telegram numeric chat id");
  }
  return `telegram:chat:${value}`;
}

function assertHttpsUrl(value, label) {
  if (!/^https:\/\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+$/.test(value)) {
    throw new Error(`${label} must be an https URL`);
  }
}

function redactUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "unset";
  try {
    const parsed = new URL(value);
    const safePath =
      parsed.pathname === "/telegram/bot/webhook"
        ? parsed.pathname
        : "/<redacted-path>";
    return `${parsed.origin}${safePath}`;
  } catch {
    return "invalid-url";
  }
}

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const schema = read("packages/db/prisma/schema.prisma");
const migration = readOptional(
  "packages/db/migrations/0003_channel_conversation_ticket_foundation.sql"
);
const contracts = read("docs/contracts/README.md");
const db = await importDbSource();

const ORG_UUID = "11111111-1111-4111-8111-111111111111";
const TENANT_UUID = "22222222-2222-4222-8222-222222222222";
const CHANNEL_UUID = "33333333-3333-4333-8333-333333333333";
const CONVERSATION_UUID = "44444444-4444-4444-8444-444444444444";
const MESSAGE_UUID = "55555555-5555-4555-8555-555555555555";
const TICKET_UUID = "66666666-6666-4666-8666-666666666666";

describe("M2-01 channel conversation DB foundation", () => {
  it("defines generic channel, conversation, message, and ticket tables in Prisma", () => {
    for (const [model, table] of [
      ["ChannelConnection", "channel_connection"],
      ["TelegramUpdateDedupe", "telegram_update_dedupe"],
      ["ChannelConversation", "conversation"],
      ["ChannelMessage", "message"],
      ["SupportTicket", "ticket"],
      ["SupportTicketEvent", "ticket_event"]
    ]) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
      assert.match(schema, new RegExp(`@@map\\("${table}"\\)`));
    }

    for (const enumName of [
      "ChannelConnectionStatus",
      "ConversationStatus",
      "MessageDirection",
      "MessageContentKind",
      "MessageDeliveryStatus",
      "TicketStatus",
      "TicketEventType"
    ]) {
      assert.match(schema, new RegExp(`enum ${enumName} \\{`));
    }

    assert.doesNotMatch(schema, /model BusinessConnection/);
    assert.doesNotMatch(
      migration,
      /create table if not exists (customer|customer_identity|order_snapshot)/i
    );
  });

  it("keeps all new tenant tables RLS scoped and least-privileged", () => {
    assert.notEqual(migration, "", "missing M2-01 SQL migration");

    for (const table of tenantScopedTables) {
      assert.match(migration, new RegExp(`create table if not exists ${table} \\(`));
      assert.match(migration, new RegExp(`${table}_tenant_fk foreign key`));
      assert.match(
        migration,
        new RegExp(`alter table ${table} force row level security`)
      );
      assert.match(
        migration,
        new RegExp(
          `grant select, insert, update on table ${table} to uzmax_app_runtime`
        )
      );
      assert.doesNotMatch(
        migration,
        new RegExp(`grant [^;]*delete[^;]* on table ${table} to uzmax_app_runtime`, "i")
      );

      for (const action of ["select", "insert", "update"]) {
        assertPolicyGeneratedFor(table, action);
      }
    }

    assert.match(migration, /tenant_scope_predicate text := \$predicate\$/);
    assert.match(migration, /current_setting\('app\.org_id', true\)/);
    assert.match(migration, /current_setting\('app\.tenant_id', true\)/);
    assert.match(migration, /nullif\(current_setting\('app\.org_id', true\), ''\)/);
    assert.match(migration, /nullif\(current_setting\('app\.tenant_id', true\), ''\)/);
    assert.match(migration, /when 'insert' then format\('with check \(%s\)'/);
    assert.match(
      migration,
      /when 'update' then format\(\s*'using \(%s\) with check \(%s\)'/
    );
    assert.match(migration, /telegram_update_dedupe_identity_unique/);
    assert.match(migration, /conversation_external_ref_unique/);
    assert.match(migration, /ticket_event_payload_object/);
  });

  it("exposes stable table names, status values, and pure contracts", () => {
    assert.deepEqual(db.channelConversationTableNames, {
      channelConnection: "channel_connection",
      conversation: "conversation",
      message: "message",
      telegramUpdateDedupe: "telegram_update_dedupe",
      ticket: "ticket",
      ticketEvent: "ticket_event"
    });
    assert.equal(db.conversationStatuses.pendingHandoff, "pending_handoff");
    assert.equal(db.messageDirections.inbound, "inbound");
    assert.equal(db.ticketStatuses.closed, "closed");

    const conversation = db.createConversationContract({
      channelConnectionId: CHANNEL_UUID,
      externalConversationRef: "tg-chat-1",
      id: CONVERSATION_UUID,
      orgId: ORG_UUID,
      participantExternalRef: "tg-user-1",
      status: "open",
      tenantId: TENANT_UUID,
      unreadCount: 0
    });
    assert.equal(conversation.status, "open");
    assert.equal(conversation.unreadCount, 0);

    const message = db.createMessageContract({
      channelConnectionId: CHANNEL_UUID,
      content: { normalized: true },
      contentKind: "text",
      conversationId: CONVERSATION_UUID,
      deliveryStatus: "received",
      direction: "inbound",
      id: MESSAGE_UUID,
      occurredAt: "2026-06-17T00:00:00.000Z",
      orgId: ORG_UUID,
      tenantId: TENANT_UUID
    });
    assert.equal(message.contentKind, "text");

    const ticket = db.createTicketContract({
      conversationId: CONVERSATION_UUID,
      id: TICKET_UUID,
      orgId: ORG_UUID,
      priority: 3,
      status: "open",
      tenantId: TENANT_UUID
    });
    assert.equal(ticket.priority, 3);

    assert.throws(
      () => db.createConversationContract({ ...conversation, orgId: "org-1" }),
      /conversation orgId must be a UUID/
    );
    assert.throws(
      () => db.createMessageContract({ ...message, content: [] }),
      /message content must be an object/
    );
    assert.throws(
      () => db.createTicketContract({ ...ticket, status: "done" }),
      /ticket status is invalid/
    );
  });

  it("documents the M2 contract boundary without claiming Business or production", () => {
    assert.match(contracts, /M2 Channel Conversation Foundation/);
    assert.match(contracts, /M2-01-channel-conversation-db-contracts-foundation/);
    assert.match(contracts, /does not close C-01\/C-02\/C-06\/D-01\/D-02\/D-03\/I-04/);
    assert.match(contracts, /Business-specific schema remains deferred to SPK-01/);
    assert.match(contracts, /No raw Telegram payloads or customer content/);
  });
});

const tenantScopedTables = [
  "channel_connection",
  "telegram_update_dedupe",
  "conversation",
  "message",
  "ticket",
  "ticket_event"
];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readOptional(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

function assertPolicyGeneratedFor(table, action) {
  assert.match(migration, new RegExp(`'${table}'`));
  assert.match(migration, new RegExp(`'${action}'`));
  assert.match(
    migration,
    /'channel_conversation_%s_%s_tenant_scope'[\s\S]*table_name[\s\S]*action_name/
  );
  assert.match(migration, /'create policy %I on %I for %s to uzmax_app_runtime %s'/);
}

async function importDbSource() {
  const outputText = ts.transpileModule(read("packages/db/src/index.ts"), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: "packages/db/src/index.ts"
  }).outputText;
  const encoded = Buffer.from(outputText, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

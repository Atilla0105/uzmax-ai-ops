import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";

import {
  CONVERSATION_A_HANDOFF,
  ORG_ID,
  TENANT_A,
  USER_A,
  contextFor,
  fakePrisma
} from "./m8-conversation-ticket-api-fixture.mjs";

const repoRoot = process.cwd();
const { compileApiRuntime } = await import(
  pathToFileURL(path.join(repoRoot, "apps/api/scripts/runtime-compiler.mjs")).href
);
const outDir = await compileApiRuntime({
  outDir: path.join(repoRoot, "node_modules/.cache/uzmax-api-runtime-m11-03a")
});
const runtime = (name) =>
  import(`${pathToFileURL(path.join(outDir, `${name}.mjs`)).href}?m11=03a`);
const [ownership, repositoryModule, serviceModule] = await Promise.all([
  runtime("conversation-ticket.ownership"),
  runtime("conversation-ticket.repository"),
  runtime("conversation-ticket.service")
]);

describe("M11-03A conversation customer read truth", () => {
  it("returns exact root truth with bounded message/customer/profile fields", async () => {
    const fake = fakePrisma();
    fake.messages.find((row) => row.direction === "INBOUND").externalMessageRef =
      `  ${"r".repeat(300)}  `;
    const baseIdentity = fake.customerIdentities[0];
    fake.customerIdentities.push({
      ...baseIdentity,
      customer: { ...baseIdentity.customer },
      id: "15151515-1515-4515-8515-151515151515",
      metadata: { ...baseIdentity.metadata },
      provider: "another_provider"
    });
    const repository =
      await repositoryModule.createConversationTicketRepositoryProviderFromEnv({
        mode: "rls_prisma_gateway",
        prismaClient: fake
      });
    const service = new serviceModule.ConversationTicketService(repository);
    const detail = await service.getConversationDetail(
      contextFor(TENANT_A, ["conversation:read"]),
      CONVERSATION_A_HANDOFF
    );

    assert.deepEqual(Object.keys(detail).sort(), [
      "conversation",
      "customerContext",
      "messages",
      "operatorState",
      "slaPolicyRef",
      "takeoverReadiness",
      "tickets"
    ]);
    assert.equal(detail.slaPolicyRef, "value0-staging-support-default-v1");
    assert.equal(detail.takeoverReadiness, "blocked_pending_m11_03b");
    assert.equal("slaPolicyRef" in detail.conversation, false);
    assert.equal("takeoverReadiness" in detail.conversation, false);
    assert.deepEqual(detail.operatorState, {
      activeTicketId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      mode: "awaiting_operator",
      ownership: "unassigned"
    });
    assert.equal("canTakeover" in detail.operatorState, false);
    assert.equal(detail.messages[0].deliveryStatus, "received");
    assert.equal(detail.messages[0].externalMessageRef.length, 256);
    assert.equal(detail.customerContext.state, "linked");
    assert.equal(
      detail.customerContext.customer.preferredLanguage,
      "controlled-language"
    );
    assert.deepEqual(detail.customerContext.profile, {
      displayName: "Ada",
      firstName: "Ada",
      languageCode: "en",
      username: "ada_support"
    });
    assert.equal("unknown" in detail.customerContext.profile, false);
    assert.equal(
      detail.customerContext.identity.channelConnectionId,
      undefined,
      "latest identity connection is not part of the canonical read key"
    );
    assert.ok(
      detail.tickets.every(
        (ticket) =>
          ticket.sla.policyRef === "value0-staging-support-default-v1" &&
          ticket.sla.source === "config_placeholder"
      )
    );
  });

  it("maps exact customer states and reuses M11-02 profile bounds", async () => {
    const row = identityRow({
      customer: customerRow("p".repeat(80)),
      metadata: {
        profile: {
          displayName: "do-not-trust",
          firstName: "f".repeat(150),
          languageCode: "l".repeat(30),
          unknown: "drop",
          username: "u".repeat(90)
        }
      }
    });
    const linked = await customerContext([row]);
    assert.equal(linked.state, "linked");
    assert.equal(linked.customer.preferredLanguage.length, 64);
    assert.equal(linked.profile.firstName.length, 128);
    assert.equal(linked.profile.displayName.length, 128);
    assert.equal(linked.profile.username.length, 64);
    assert.equal(linked.profile.languageCode.length, 16);
    assert.equal(JSON.stringify(linked).includes("do-not-trust"), false);
    assert.deepEqual(await customerContext([]), { state: "identity_missing" });
    assert.deepEqual(await customerContext([row, row]), {
      state: "identity_ambiguous"
    });
    assert.deepEqual(
      await customerContext([row, { ...row, provider: "wrong_provider" }]),
      { state: "identity_link_mismatch" },
      "link mismatch takes precedence over ambiguous cardinality"
    );
    assert.deepEqual(await customerContext([{ ...row, provider: "wrong_provider" }]), {
      state: "identity_link_mismatch"
    });
    assert.equal(
      (await customerContext([{ ...row, status: "ARCHIVED" }])).state,
      "identity_archived"
    );
    assert.equal(
      (await customerContext([{ ...row, status: "MERGED" }])).state,
      "identity_merged"
    );
    assert.equal(
      (await customerContext([{ ...row, customer: undefined }])).state,
      "customer_missing"
    );
    assert.equal(
      (
        await customerContext([
          { ...row, customer: { ...row.customer, status: "ARCHIVED" } }
        ])
      ).state,
      "customer_archived"
    );
  });

  it("keeps operator matrices truthful and the current admin takeover blocked", () => {
    const conversation = conversationRow("HANDOFF");
    const otherUser = "19191919-1919-4919-8919-191919191919";
    const cases = [
      ["OPEN", [], { mode: "bot", ownership: "none" }],
      [
        "OPEN",
        [ticketRow("OPEN")],
        { activeTicketId: "ticket-1", mode: "bot", ownership: "unassigned" }
      ],
      [
        "OPEN",
        [ticketRow("CLAIMED", USER_A)],
        { activeTicketId: "ticket-1", mode: "awaiting_operator", ownership: "self" }
      ],
      [
        "PENDING_HANDOFF",
        [ticketRow("OPEN")],
        {
          activeTicketId: "ticket-1",
          mode: "awaiting_operator",
          ownership: "unassigned"
        }
      ],
      [
        "PENDING_HANDOFF",
        [ticketRow("REOPENED", otherUser)],
        {
          activeTicketId: "ticket-1",
          mode: "awaiting_operator",
          ownership: "other"
        }
      ],
      [
        "HANDOFF",
        [ticketRow("CLAIMED", USER_A)],
        { activeTicketId: "ticket-1", mode: "human", ownership: "self" }
      ],
      [
        "HANDOFF",
        [ticketRow("LOCKED", otherUser, otherUser)],
        { activeTicketId: "ticket-1", mode: "human", ownership: "other" }
      ]
    ];
    for (const [status, tickets, expected] of cases) {
      assert.deepEqual(
        ownership.operatorStateFor(conversationRow(status), tickets, USER_A),
        expected,
        `${status} operator state`
      );
    }
    assert.equal(
      ownership.operatorStateFor(
        conversation,
        [ticketRow("LOCKED", undefined, USER_A)],
        USER_A
      ).mode,
      "conflict"
    );
    assert.equal(
      ownership.operatorStateFor(
        conversationRow("OPEN"),
        [ticketRow("LOCKED", USER_A, USER_A)],
        USER_A
      ).mode,
      "conflict"
    );
    assert.equal(
      ownership.operatorStateFor(
        conversationRow("PENDING_HANDOFF"),
        [ticketRow("ESCALATED", USER_A, USER_A)],
        USER_A
      ).mode,
      "conflict"
    );
    assert.equal(
      ownership.operatorStateFor(conversationRow("PENDING_HANDOFF"), [], USER_A).mode,
      "conflict"
    );
    assert.equal(
      ownership.operatorStateFor(
        conversation,
        [ticketRow("OPEN"), ticketRow("OPEN", undefined, undefined, "ticket-2")],
        USER_A
      ).mode,
      "conflict"
    );
    assert.deepEqual(
      ownership.operatorStateFor(conversationRow("CLOSED"), [], USER_A),
      { mode: "closed", ownership: "none" }
    );

    const client = read(
      "apps/admin/src/pages/conversations/conversationWorkbenchClient.ts"
    );
    const blocker = read(
      "apps/admin/src/pages/conversations/conversationWorkbenchHandoff.ts"
    );
    const ownershipSource = read("apps/api/src/conversation-ticket.ownership.ts");
    assert.match(client, /slaPolicyRef: text\(record\.slaPolicyRef\)/);
    assert.match(blocker, /if \(!conversation\.slaPolicyRef\)/);
    assert.match(blocker, /接管需要 runtime 返回 SLA policyRef/);
    assert.match(
      ownershipSource,
      /channelConnection\.findFirst\(\{[\s\S]*select:\s*\{\s*provider:\s*true\s*\}/
    );
    assert.match(ownershipSource, /customerIdentity\.findMany\(\{/);
    assert.match(ownershipSource, /select:\s*\{[\s\S]*preferredLanguage: true/);
    assert.doesNotMatch(ownershipSource, /include:\s*\{\s*customer:\s*true/);
  });
});

function customerContext(identityRows) {
  const client = {
    channelConnection: {
      findFirst: async () => ({ provider: "telegram_bot" })
    },
    customerIdentity: { findMany: async () => identityRows }
  };
  return ownership.readCustomerContext(
    async ({ map, ops }) => map(await Promise.all(ops(client))),
    contextFor(TENANT_A),
    conversationRow("OPEN")
  );
}

function identityRow(patch = {}) {
  return {
    customerId: "16161616-1616-4616-8616-161616161616",
    externalSubjectRef: "telegram:user:bounded",
    firstSeenAt: new Date("2026-06-16T00:00:00.000Z"),
    id: "17171717-1717-4717-8717-171717171717",
    lastSeenAt: new Date("2026-06-17T00:00:00.000Z"),
    metadata: {},
    orgId: ORG_ID,
    provider: "telegram_bot",
    status: "ACTIVE",
    tenantId: TENANT_A,
    ...patch
  };
}

function customerRow(preferredLanguage) {
  return {
    id: "16161616-1616-4616-8616-161616161616",
    orgId: ORG_ID,
    preferredLanguage,
    status: "ACTIVE",
    tenantId: TENANT_A
  };
}

function conversationRow(status) {
  return {
    channelConnectionId: "18181818-1818-4818-8818-181818181818",
    externalConversationRef: "controlled:conversation",
    id: "conversation-1",
    orgId: ORG_ID,
    participantExternalRef: "telegram:user:bounded",
    status: status.toLowerCase(),
    tenantId: TENANT_A,
    unreadCount: 0
  };
}

function ticketRow(status, assignedUserId, lockedByUserId, id = "ticket-1") {
  return {
    ...(assignedUserId ? { assignedUserId } : {}),
    conversationId: "conversation-1",
    events: [],
    id,
    ...(lockedByUserId ? { lockedByUserId } : {}),
    orgId: ORG_ID,
    priority: 3,
    sla: { policyRef: "ignored", source: "config_placeholder" },
    status: status.toLowerCase(),
    suggestedAction: "controlled",
    summary: "controlled",
    tenantId: TENANT_A
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

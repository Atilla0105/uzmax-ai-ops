import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  CONVERSATION_A_OPEN,
  CONVERSATION_B,
  NOW,
  ORG_ID,
  TENANT_A,
  TICKET_ID,
  USER_A,
  USER_B,
  assertRejectsHttp,
  contextFor,
  contextRequest,
  conversation,
  createConversationTicketHarness,
  read
} from "./m2-conversation-ticket-test-harness.mjs";

const repoRoot = process.cwd();
const harness = await createConversationTicketHarness("uzmax-m2-07-");
const { handoff, importConversationTicketApiSource } = harness;

describe("M2-07 conversation ticket API HTTP hardening", () => {
  it("maps domain, validation and access failures to explicit HTTP statuses", async () => {
    const api = await importConversationTicketApiSource();
    const repository = new api.module.InMemoryConversationTicketRepository({
      conversations: [conversation(CONVERSATION_A_OPEN, TENANT_A, "open")],
      messages: [],
      tickets: [lockedTicket()]
    });
    const service = new api.module.ConversationTicketService(repository);
    const controller = new api.module.ConversationTicketController(service);
    const request = contextRequest(
      contextFor(USER_A, TENANT_A, ["conversation:read", "ticket:write"])
    );

    await assertRejectsHttp(
      () => controller.getConversationDetail(request, CONVERSATION_B),
      404,
      /conversation not found/
    );
    await assertRejectsHttp(
      () => controller.applyTicketAction(request, "missing-ticket", { type: "lock" }),
      404,
      /ticket not found/
    );
    await assertRejectsHttp(
      () =>
        controller.applyTicketAction(
          contextRequest(contextFor(USER_B, TENANT_A, ["ticket:write"])),
          TICKET_ID,
          { type: "lock" }
        ),
      409,
      /ticket is locked by another user/
    );
    await assertRejectsHttp(
      () =>
        controller.applyTicketAction(
          contextRequest(contextFor(USER_B, TENANT_A, ["ticket:write"])),
          TICKET_ID,
          {
            actorUserId: USER_A,
            note: "spoofed lock owner should not be trusted",
            now: NOW,
            type: "note"
          }
        ),
      409,
      /ticket is locked by another user/
    );
    await assertRejectsHttp(
      () => controller.createHandoffTicket(request, CONVERSATION_A_OPEN, {}),
      400,
      /reason is required/
    );
    await assertRejectsHttp(
      () => controller.createHandoffTicket(request, CONVERSATION_A_OPEN, null),
      400,
      /reason is required/
    );
    await assertRejectsHttp(
      () => controller.listConversations(request, { status: "not-a-status" }),
      400,
      /conversation status is invalid/
    );
    await assertRejectsHttp(
      () => controller.applyTicketAction(request, TICKET_ID, { type: "not-an-action" }),
      400,
      /ticket action type is invalid/
    );
    await assertRejectsHttp(
      () => controller.applyTicketAction(request, TICKET_ID, {}),
      400,
      /ticket action type is invalid/
    );
    await assertRejectsHttp(
      () => controller.applyTicketAction(request, TICKET_ID, null),
      400,
      /ticket action type is invalid/
    );
    await assertRejectsHttp(
      () => controller.applyTicketAction(request, TICKET_ID, "not-an-object"),
      400,
      /ticket action type is invalid/
    );

    await assertRejectsHttp(
      () => priorityController(api).listConversations(request, {}),
      400,
      /ticket priority must be an integer from 1 to 5/
    );
    await assertRejectsHttp(
      () =>
        controller.listConversations(
          contextRequest(contextFor(USER_A, TENANT_A, ["ticket:write"])),
          {}
        ),
      403,
      /permission is not granted/
    );
    await assertRejectsHttp(
      () => controller.listConversations({}, {}),
      403,
      /access context is required/
    );
  });

  it("does not rewrite unexpected errors into business HTTP exceptions", async () => {
    const api = await importConversationTicketApiSource();
    const controller = new api.module.ConversationTicketController({
      listConversations() {
        throw new Error("unexpected repository outage");
      }
    });

    await assert.rejects(
      () =>
        controller.listConversations(
          contextRequest(contextFor(USER_A, TENANT_A, ["conversation:read"])),
          {}
        ),
      (error) => {
        assert.equal(error?.statusCode, undefined);
        assert.match(error?.message ?? "", /unexpected repository outage/);
        return true;
      }
    );
  });

  it("keeps claim assignment distinct from lock ownership", () => {
    let ticket = handoff.module.createTicketState({
      ...lockedTicket(),
      lockedByUserId: undefined,
      status: "open"
    });
    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_A,
      now: NOW,
      type: "claim"
    });
    assert.equal(ticket.assignedUserId, USER_A);
    assert.equal(ticket.lockedByUserId, undefined);

    ticket = handoff.module.applyTicketAction(ticket, {
      actorUserId: USER_B,
      now: NOW,
      type: "lock"
    });
    assert.equal(ticket.lockedByUserId, USER_B);
  });

  it("keeps the public barrel split from cohesive implementation files", () => {
    for (const fileName of ["controller", "errors", "repository", "service", "types"]) {
      assert.ok(
        existsSync(
          path.resolve(repoRoot, `apps/api/src/conversation-ticket.${fileName}.ts`)
        ),
        `missing split API file conversation-ticket.${fileName}.ts`
      );
    }
    const barrel = read("apps/api/src/conversation-ticket.ts");
    assert.doesNotMatch(barrel, /class ConversationTicketService/);
    assert.doesNotMatch(barrel, /class InMemoryConversationTicketRepository/);
    assert.doesNotMatch(barrel, /class ConversationTicketController/);
  });
});

function lockedTicket() {
  return handoff.module.createTicketState({
    conversationId: CONVERSATION_A_OPEN,
    events: [],
    id: TICKET_ID,
    lockedByUserId: USER_A,
    orgId: ORG_ID,
    priority: 3,
    sla: { policyRef: "sla-policy:tenant-default", source: "config_placeholder" },
    status: "locked",
    suggestedAction: "Review conversation and respond from approved data.",
    summary: "Customer requested human support.",
    tenantId: TENANT_A
  });
}

function priorityController(api) {
  return new api.module.ConversationTicketController({
    listConversations() {
      throw new handoff.module.TicketDomainError(
        "invalid_priority",
        "ticket priority must be an integer from 1 to 5"
      );
    }
  });
}

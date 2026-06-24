import { strict as assert } from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import path from "node:path";
import * as url from "node:url";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const testTranspileOptions = {
  compilerOptions: {
    emitDecoratorMetadata: false,
    experimentalDecorators: true,
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  }
};
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_B = "33333333-3333-4333-8333-333333333333";
const USER_A = "44444444-4444-4444-8444-444444444444";
const ITEM_KNOWLEDGE_A = "55555555-5555-4555-8555-555555555555";
const ITEM_CONFLICT_A = "66666666-6666-4666-8666-666666666666";
const ITEM_CONFLICT_NO_DIFF = "77777777-7777-4777-8777-777777777777";
const ITEM_EVAL_A = "88888888-8888-4888-8888-888888888888";
const ITEM_PROFILE_A = "99999999-9999-4999-8999-999999999999";
const ITEM_TENANT_B = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const NOW = "2026-06-24T12:00:00.000Z";

const controllerSource = read("apps/api/src/confirmation-queue.controller.ts");
const serviceSource = read("apps/api/src/confirmation-queue.service.ts");
const appModule = read("apps/api/src/app.module.ts");
const spec = read("docs/specs/M5-03-confirmation-queue-api.md");
const evidence = read("docs/evidence/M5/M5-03-confirmation-queue-api.md");
const m5Readme = read("docs/evidence/M5/README.md");
const api = await importConfirmationQueueApiSource();

describe("M5-03 confirmation queue API", () => {
  it("registers a split Nest API shell with in-memory repository only", () => {
    assert.match(controllerSource, /@Controller\("confirmation-queue"\)/);
    assert.match(controllerSource, /@Get\("items"\)/);
    assert.match(controllerSource, /@Get\("items\/:itemId"\)/);
    assert.match(controllerSource, /@Post\("items\/:itemId\/decisions"\)/);
    assert.match(appModule, /ConfirmationQueueController/);
    assert.match(appModule, /InMemoryConfirmationQueueRepository/);
    assert.doesNotMatch(
      `${controllerSource}\n${serviceSource}`,
      /packages\/db|Prisma|Rls/i
    );
  });

  it("lists and reads confirmation items only inside selected tenant scope", async () => {
    const service = createService([
      item(ITEM_KNOWLEDGE_A, TENANT_A, "knowledge_candidate", "pending", {
        createdAt: "2026-06-24T10:00:00.000Z"
      }),
      item(ITEM_CONFLICT_A, TENANT_A, "conflict_candidate", "pending", {
        createdAt: "2026-06-24T11:00:00.000Z",
        diffPayload: sideBySideDiff()
      }),
      item(ITEM_EVAL_A, TENANT_A, "eval_candidate", "approved", {
        createdAt: "2026-06-24T09:00:00.000Z"
      }),
      item(ITEM_TENANT_B, TENANT_B, "knowledge_candidate", "pending")
    ]);
    const tenantARead = contextFor(TENANT_A, ["confirmation:read"]);

    const pending = await service.listItems(tenantARead, { status: "pending" });
    assert.deepEqual(ids(pending), [ITEM_CONFLICT_A, ITEM_KNOWLEDGE_A]);

    const filtered = await service.listItems(tenantARead, {
      kind: "knowledge_candidate",
      status: "pending"
    });
    assert.deepEqual(ids(filtered), [ITEM_KNOWLEDGE_A]);

    const detail = await service.getItemDetail(tenantARead, ITEM_CONFLICT_A);
    assert.equal(detail.item.diffPayload.left.ref, "controlled://kb/current");
    assert.equal(detail.item.diffPayload.right.ref, "controlled://candidate/new");

    await assert.rejects(
      () => service.getItemDetail(tenantARead, ITEM_TENANT_B),
      /confirmation item not found/
    );
    await assert.rejects(
      () => service.listItems(contextFor(TENANT_A, []), { status: "pending" }),
      /permission is not granted/
    );
  });

  it("applies approve, edit, discard and block decisions without formal writes", async () => {
    const service = createService([
      item(ITEM_KNOWLEDGE_A, TENANT_A, "knowledge_candidate", "pending"),
      item(ITEM_CONFLICT_A, TENANT_A, "conflict_candidate", "pending", {
        diffPayload: sideBySideDiff()
      }),
      item(ITEM_CONFLICT_NO_DIFF, TENANT_A, "conflict_candidate", "pending"),
      item(ITEM_EVAL_A, TENANT_A, "eval_candidate", "pending"),
      item(ITEM_PROFILE_A, TENANT_A, "profile_candidate", "pending")
    ]);
    const tenantAWrite = contextFor(TENANT_A, ["confirmation:write"]);

    const approved = await service.applyDecision(
      tenantAWrite,
      decision("approve", ITEM_CONFLICT_A, {
        reasonRef: "controlled://confirmation/reason/approve"
      })
    );
    assert.equal(approved.item.status, "approved");
    assert.equal(approved.item.reviewedByUserId, USER_A);
    assert.equal(approved.item.reviewedAt, NOW);
    assert.equal(approved.formalWrite, false);
    assert.equal(approved.auditDraft.formalWrite, false);
    assert.match(approved.auditDraft.auditRef, /^controlled:\/\/confirmation-queue/);

    const edited = await service.applyDecision(
      tenantAWrite,
      decision("edit", ITEM_KNOWLEDGE_A, {
        editedPayload: { summaryRef: "controlled://candidate/edited-summary" }
      })
    );
    assert.equal(edited.item.status, "edited");
    assert.equal(
      edited.item.metadata.editedPayload.summaryRef,
      "controlled://candidate/edited-summary"
    );
    assert.equal(edited.formalWrite, false);

    const discarded = await service.applyDecision(
      tenantAWrite,
      decision("discard", ITEM_EVAL_A)
    );
    assert.equal(discarded.item.status, "discarded");

    const blocked = await service.applyDecision(
      tenantAWrite,
      decision("block", ITEM_PROFILE_A, {
        reasonRef: "controlled://confirmation/reason/block"
      })
    );
    assert.equal(blocked.item.status, "blocked");

    await assert.rejects(
      () =>
        service.applyDecision(tenantAWrite, decision("approve", ITEM_CONFLICT_NO_DIFF)),
      /conflict candidate requires side-by-side diff payload/
    );
    await assert.rejects(
      () =>
        service.applyDecision(tenantAWrite, decision("edit", ITEM_CONFLICT_NO_DIFF)),
      /edit decision requires editedPayload or editedPayloadRef/
    );
    await assert.rejects(
      () =>
        service.applyDecision(contextFor(TENANT_A, []), {
          action: "discard",
          itemId: ITEM_CONFLICT_NO_DIFF
        }),
      /permission is not granted/
    );
  });

  it("rejects raw carrier keys and unsafe refs in decision payloads", () => {
    assertDecisionBodyRejects(
      { action: "approve", raw: "inline raw carrier" },
      /decision\.raw is a forbidden raw payload key/
    );
    assertDecisionBodyRejects(
      {
        action: "edit",
        editedPayload: {
          prompt: "inline prompt carrier",
          summaryRef: "controlled://candidate/edited-summary"
        }
      },
      /decision\.editedPayload\.prompt is a forbidden raw payload key/
    );
    const unsafeRefs =
      "http://example.test/ref https://example.test/ref data:text/plain;base64,SGVsbG8= blob://local/ref file:///tmp/ref QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo1234567890abcd";
    for (const unsafeRef of unsafeRefs.split(" ")) {
      assertDecisionBodyRejects(
        { action: "approve", reasonRef: unsafeRef },
        /reasonRef must be a controlled ref/
      );
    }
  });

  it("maps controller validation, not found and access failures explicitly", async () => {
    const controller = new api.module.ConfirmationQueueController(
      createService([
        item(ITEM_KNOWLEDGE_A, TENANT_A, "knowledge_candidate", "pending")
      ])
    );
    const readRequest = { accessContext: contextFor(TENANT_A, ["confirmation:read"]) };
    const writeRequest = {
      accessContext: contextFor(TENANT_A, ["confirmation:write"])
    };

    await assertRejectsHttp(
      () => controller.listItems({}, {}),
      403,
      /access context is required/
    );
    await assertRejectsHttp(
      () => controller.listItems({ accessContext: contextFor(TENANT_A, []) }, {}),
      403,
      /permission is not granted/
    );
    await assertRejectsHttp(
      () => controller.listItems(readRequest, { status: "not-a-status" }),
      400,
      /confirmation item status is invalid/
    );
    await assertRejectsHttp(
      () => controller.getItemDetail(readRequest, ITEM_TENANT_B),
      404,
      /confirmation item not found/
    );
    await assertRejectsHttp(
      () =>
        controller.applyDecision(writeRequest, ITEM_KNOWLEDGE_A, {
          action: "approve",
          reasonRef: "https://example.test/ref"
        }),
      400,
      /reasonRef must be a controlled ref/
    );
  });

  it("records M5-03 scope, evidence and not-accepted status", () => {
    assert.match(spec, /M5-03 Confirmation Queue API/);
    assert.match(spec, /changed source files <= 6, net source LOC <= 550/);
    assert.match(spec, /api_contract_supported_not_closed/);
    assert.match(evidence, /M5-03 Confirmation Queue API Evidence/);
    assert.match(evidence, /No Sensitive Data Statement/);
    assert.match(evidence, /formal knowledge\/profile\/eval writes/);
    assert.match(m5Readme, /M5-03 confirmation queue API/);
    assert.match(m5Readme, /m5_03_confirmation_queue_api_recorded__not_accepted/);
  });
});

function createService(items) {
  return new api.module.ConfirmationQueueService(
    new api.module.InMemoryConfirmationQueueRepository({ items })
  );
}

function decision(action, itemId, overrides = {}) {
  return { action, itemId, now: NOW, ...overrides };
}

function ids(response) {
  return response.items.map((entry) => entry.id);
}

function assertDecisionBodyRejects(body, messagePattern) {
  assert.throws(
    () => api.module.parseConfirmationDecisionBody(ITEM_KNOWLEDGE_A, body),
    messagePattern
  );
}

function item(id, tenantId, kind, status, overrides = {}) {
  return {
    candidatePayload: {
      candidateRef: `controlled://candidate/${id}`,
      summaryRef: `controlled://candidate-summary/${id}`
    },
    confidenceBps: 8200,
    createdAt: "2026-06-24T08:00:00.000Z",
    id,
    kind,
    metadata: {},
    orgId: ORG_ID,
    sourceRef: `controlled://distill/source/${id}`,
    status,
    tenantId,
    ...overrides
  };
}

function sideBySideDiff() {
  return {
    left: { ref: "controlled://kb/current" },
    right: { ref: "controlled://candidate/new" },
    summaryRef: "controlled://diff/conflict"
  };
}

function contextFor(selectedTenantId, permissions) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [selectedTenantId],
    userId: USER_A
  };
}

async function assertRejectsHttp(action, statusCode, messagePattern) {
  await assert.rejects(action, (error) => {
    assert.equal(error?.statusCode ?? error?.status, statusCode);
    assert.match(error?.message ?? "", messagePattern);
    return true;
  });
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importConfirmationQueueApiSource() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "uzmax-m5-03-"));
  const writeTempModule = (fileName, sourceText) => {
    const destination = path.join(tmpRoot, fileName);
    fs.writeFileSync(destination, sourceText, "utf8");
    return url.pathToFileURL(destination).href;
  };
  const authz = await importTypescriptSource("packages/authz/src/index.ts");
  const nestCommon = createNestCommonStub(writeTempModule);
  const accessContext = writeTempModule(
    "access-context-stub.mjs",
    "export class ApiAccessContextGuard {}"
  );
  const typesModuleUrl = writeSource(writeTempModule, "confirmation-queue.types");
  const repositoryModuleUrl = writeSource(
    writeTempModule,
    "confirmation-queue.repository",
    {
      "../../../packages/authz/src/index.ts": authz.moduleUrl,
      "./confirmation-queue.types.ts": typesModuleUrl
    }
  );
  const serviceModuleUrl = writeSource(writeTempModule, "confirmation-queue.service", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl,
    "./confirmation-queue.repository.ts": repositoryModuleUrl,
    "./confirmation-queue.types.ts": typesModuleUrl,
    "@nestjs/common": nestCommon
  });
  const controllerModuleUrl = writeSource(
    writeTempModule,
    "confirmation-queue.controller",
    {
      "../../../packages/authz/src/index.ts": authz.moduleUrl,
      "./access-context.ts": accessContext,
      "./confirmation-queue.service.ts": serviceModuleUrl,
      "./confirmation-queue.types.ts": typesModuleUrl,
      "@nestjs/common": nestCommon
    }
  );
  const moduleUrl = writeTempModule(
    "confirmation-queue.mjs",
    [
      `export * from "${controllerModuleUrl}";`,
      `export * from "${repositoryModuleUrl}";`,
      `export * from "${serviceModuleUrl}";`,
      `export * from "${typesModuleUrl}";`
    ].join("\n")
  );
  return { module: await import(moduleUrl), moduleUrl };
}

function writeSource(writeTempModule, stem, replacements = {}) {
  const source = replaceImports(read(`apps/api/src/${stem}.ts`), replacements);
  return writeTempModule(`${stem}.mjs`, transpileSource(source));
}

async function importTypescriptSource(relativePath) {
  const moduleUrl = moduleDataUrl(transpileSource(read(relativePath)));
  return { module: await import(moduleUrl), moduleUrl };
}

function createNestCommonStub(writeTempModule) {
  return writeTempModule(
    "nestjs-common-stub.mjs",
    [
      "const decorator = () => () => undefined;",
      "const exception = (statusCode) => class extends Error { constructor(message) { super(typeof message === 'string' ? message : JSON.stringify(message)); this.status = statusCode; this.statusCode = statusCode; } };",
      "export const BadRequestException = exception(400);",
      "export const ForbiddenException = exception(403);",
      "export const NotFoundException = exception(404);",
      "export const Body = decorator, Controller = decorator, Get = decorator, Injectable = decorator, Param = decorator, Post = decorator, Query = decorator, Req = decorator, UseGuards = decorator;"
    ].join("\n")
  );
}

function replaceImports(sourceText, replacements) {
  return Object.entries(replacements).reduce(
    (source, [from, to]) => source.replaceAll(from, to),
    sourceText
  );
}

function transpileSource(sourceText) {
  return ts.transpileModule(sourceText, testTranspileOptions).outputText;
}

function moduleDataUrl(sourceText) {
  const encoded = Buffer.from(sourceText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, URL } from "node:url";

import ts from "typescript";

export const ORG_ID = "11111111-1111-4111-8111-111111111111";
export const TENANT_A = "22222222-2222-4222-8222-222222222222";
export const TENANT_B = "33333333-3333-4333-8333-333333333333";
export const USER_A = "44444444-4444-4444-8444-444444444444";
export const USER_B = "55555555-5555-4555-8555-555555555555";
const CHANNEL_ID = "66666666-6666-4666-8666-666666666666";
export const CONVERSATION_A_OPEN = "77777777-7777-4777-8777-777777777777";
export const CONVERSATION_A_HANDOFF = "88888888-8888-4888-8888-888888888888";
export const CONVERSATION_B = "99999999-9999-4999-8999-999999999999";
export const TICKET_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const NOW = "2026-06-17T00:00:00.000Z";

const repoRoot = process.cwd();
const testTranspileOptions = {
  compilerOptions: {
    emitDecoratorMetadata: false,
    experimentalDecorators: true,
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023
  }
};

export async function createConversationTicketHarness(prefix) {
  const tmpRoot = mkdtempSync(path.join(tmpdir(), prefix));
  const writeTempModule = (fileName, sourceText) => {
    const destination = new URL(fileName, pathToFileURL(`${tmpRoot}/`));
    writeFileSync(destination, sourceText, "utf8");
    return destination.href;
  };
  const importSource = async (relativePath) => {
    const moduleUrl = inlineModuleUrl(transpileSource(read(relativePath)));
    return { module: await import(moduleUrl), moduleUrl };
  };
  const handoff = await importSource("packages/capabilities/handoff/src/index.ts");
  const authz = await importSource("packages/authz/src/index.ts");
  const nestCommon = createNestCommonStub(writeTempModule);
  const accessContext = writeTempModule(
    "access-context-stub.mjs",
    "export class ApiAccessContextGuard {}"
  );

  return {
    appModule: read("apps/api/src/app.module.ts"),
    contracts: read("docs/contracts/README.md"),
    handoff,
    importConversationTicketApiSource: () =>
      importConversationTicketApiSource({
        accessContext,
        authz,
        handoff,
        nestCommon,
        writeTempModule
      })
  };
}

export function conversation(id, tenantId, status) {
  return {
    aiState: "active",
    awaitingReply: true,
    channelConnectionId: CHANNEL_ID,
    externalConversationRef: `telegram:chat:${id}`,
    id,
    inFlightAiMessages: [
      { id: `${id}:ai-queued`, status: "queued" },
      { id: `${id}:ai-generating`, status: "generating" }
    ],
    lastMessageAt: NOW,
    orgId: ORG_ID,
    participantExternalRef: `telegram:user:${id}`,
    slaRisk: status === "pending_handoff",
    status,
    subject: "Support request",
    tenantId,
    unreadCount: status === "closed" ? 0 : 2
  };
}

export function message(id, conversationId, tenantId, direction) {
  return {
    content: { text: "bounded internal message" },
    contentKind: "text",
    conversationId,
    direction,
    id,
    occurredAt: NOW,
    orgId: ORG_ID,
    tenantId
  };
}

export function contextFor(userId, selectedTenantId, permissions) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId,
    tenantIds: [selectedTenantId],
    userId
  };
}

export function contextRequest(accessContext) {
  return { accessContext };
}

export async function assertRejectsHttp(action, statusCode, messagePattern) {
  await assert.rejects(action, (error) => {
    assert.equal(
      error?.statusCode ?? error?.status,
      statusCode,
      `expected HTTP ${statusCode} for ${error?.constructor?.name}: ${error?.message}`
    );
    assert.match(error?.message ?? "", messagePattern);
    return true;
  });
}

export function read(relativePath) {
  const sourcePath = path.resolve(repoRoot, relativePath);
  assert.ok(existsSync(sourcePath), `missing ${relativePath}`);
  return readFileSync(sourcePath, { encoding: "utf8" });
}

async function importConversationTicketApiSource(context) {
  const typesModuleUrl = writeSource(context, "conversation-ticket.types");
  const errorsModuleUrl = writeSource(context, "conversation-ticket.errors", {
    "../../../packages/authz/src/index.ts": context.authz.moduleUrl,
    "../../../packages/capabilities/handoff/src/index.ts": context.handoff.moduleUrl,
    "@nestjs/common": context.nestCommon
  });
  const repositoryModuleUrl = writeSource(context, "conversation-ticket.repository", {
    "../../../packages/authz/src/index.ts": context.authz.moduleUrl,
    "../../../packages/capabilities/handoff/src/index.ts": context.handoff.moduleUrl,
    "./conversation-ticket.types.ts": typesModuleUrl
  });
  const serviceModuleUrl = writeSource(context, "conversation-ticket.service", {
    "../../../packages/authz/src/index.ts": context.authz.moduleUrl,
    "../../../packages/capabilities/handoff/src/index.ts": context.handoff.moduleUrl,
    "./conversation-ticket.errors.ts": errorsModuleUrl,
    "./conversation-ticket.repository.ts": repositoryModuleUrl,
    "./conversation-ticket.types.ts": typesModuleUrl,
    "@nestjs/common": context.nestCommon
  });
  const controllerSource = replaceImports(
    read("apps/api/src/conversation-ticket.controller.ts"),
    {
      "../../../packages/authz/src/index.ts": context.authz.moduleUrl,
      "./access-context.ts": context.accessContext,
      "./conversation-ticket.errors.ts": errorsModuleUrl,
      "./conversation-ticket.service.ts": serviceModuleUrl,
      "./conversation-ticket.types.ts": typesModuleUrl,
      "@nestjs/common": context.nestCommon
    }
  );
  const controllerModuleUrl = context.writeTempModule(
    "conversation-ticket.controller.mjs",
    transpileSource(controllerSource)
  );
  const barrelSource = replaceImports(read("apps/api/src/conversation-ticket.ts"), {
    "./conversation-ticket.controller.ts": controllerModuleUrl,
    "./conversation-ticket.errors.ts": errorsModuleUrl,
    "./conversation-ticket.repository.ts": repositoryModuleUrl,
    "./conversation-ticket.service.ts": serviceModuleUrl,
    "./conversation-ticket.types.ts": typesModuleUrl
  });
  const moduleUrl = context.writeTempModule(
    "conversation-ticket.mjs",
    transpileSource(barrelSource)
  );
  return {
    barrelSource,
    module: await import(moduleUrl),
    moduleUrl,
    source: controllerSource
  };
}

function writeSource(context, stem, replacements = {}) {
  const source = replaceImports(read(`apps/api/src/${stem}.ts`), replacements);
  return context.writeTempModule(`${stem}.mjs`, transpileSource(source));
}

function createNestCommonStub(writeTempModule) {
  return writeTempModule(
    "nestjs-common-stub.mjs",
    [
      "const decorator = () => () => undefined;",
      "const exception = (statusCode) => class extends Error {",
      "  constructor(message) {",
      "    super(typeof message === 'string' ? message : JSON.stringify(message));",
      "    this.status = statusCode;",
      "    this.statusCode = statusCode;",
      "  }",
      "};",
      "export const BadRequestException = exception(400);",
      "export const Body = decorator;",
      "export const ConflictException = exception(409);",
      "export const Controller = decorator;",
      "export const ForbiddenException = exception(403);",
      "export const Get = decorator;",
      "export const Injectable = decorator;",
      "export const NotFoundException = exception(404);",
      "export const Param = decorator;",
      "export const Post = decorator;",
      "export const Query = decorator;",
      "export const Req = decorator;",
      "export const UseGuards = decorator;"
    ].join("\n")
  );
}

function replaceImports(sourceText, replacements) {
  let source = sourceText;
  for (const [from, to] of Object.entries(replacements)) {
    source = source.replaceAll(from, to);
  }
  return source;
}

function transpileSource(sourceText) {
  return ts.transpileModule(sourceText, testTranspileOptions).outputText;
}

function inlineModuleUrl(sourceText) {
  const encoded = Buffer.from(sourceText, "utf8").toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

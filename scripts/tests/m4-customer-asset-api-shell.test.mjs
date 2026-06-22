import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, URL } from "node:url";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_B = "33333333-3333-4333-8333-333333333333";
const USER_A = "44444444-4444-4444-8444-444444444444";
const CUSTOMER_A = "55555555-5555-4555-8555-555555555555";
const CUSTOMER_B = "66666666-6666-4666-8666-666666666666";
const FIELD_A = "77777777-7777-4777-8777-777777777777";
const TAG_A = "88888888-8888-4888-8888-888888888888";
const controllerSource = read("apps/api/src/customer-asset.controller.ts");
const serviceSource = read("apps/api/src/customer-asset.service.ts");
const repositorySource = read("apps/api/src/customer-asset.repository.ts");
const typesSource = read("apps/api/src/customer-asset.types.ts");
const appModule = read("apps/api/src/app.module.ts");
const runtimeCompiler = read("apps/api/scripts/runtime-compiler.mjs");
const spec = read("docs/specs/M4-14-customer-asset-api-shell.md");
const evidence = read("docs/evidence/M4/M4-14-customer-asset-api-shell.md");
const m4Index = read("docs/evidence/M4/README.md");
const api = await importCustomerAssetApiSource();

describe("M4-14 customer asset API shell", () => {
  it("registers a split API shell without admin, DB runtime or raw data", () => {
    assert.match(controllerSource, /@Controller\("customer-assets"\)/);
    assert.match(controllerSource, /@Get\("customers"\)/);
    assert.match(controllerSource, /@Get\("customers\/:customerId"\)/);
    assert.match(controllerSource, /@Post\("customers\/:customerId\/restore"\)/);
    assert.match(appModule, /CustomerAssetController/);
    assert.match(appModule, /InMemoryCustomerAssetRepository/);
    assert.match(runtimeCompiler, /customer-asset\.controller\.ts/);
    assert.doesNotMatch(
      customerSourceBundle(),
      /PrismaClient|@prisma\/client|process\.env|apps\/admin|apps\/worker|order_connector|fetch\(|https?:\/\//i
    );
    assert.doesNotMatch(
      customerSourceBundle(),
      /raw payload|csv export|xlsx export|phone|address|payment|telegram username|secret/i
    );
  });

  it("lists and details selected-tenant customers with fields, tags and refs", async () => {
    const service = new api.module.CustomerAssetService(
      new api.module.InMemoryCustomerAssetRepository(seed())
    );
    const accessContext = contextFor(TENANT_A, ["customer:read"]);

    const listed = service.listCustomers(accessContext, {
      flag: "blacklisted",
      tagKey: "needs-review"
    });
    assert.deepEqual(
      listed.items.map((item) => item.id),
      [CUSTOMER_A]
    );
    const detail = service.getCustomerDetail(accessContext, CUSTOMER_A).item;
    assert.equal(detail.identities[0].externalSubjectRef, "identity://controlled/a");
    assert.equal(detail.fields[0].definition.fieldKey, "journey.stage");
    assert.equal(detail.tags[0].definition.tagKey, "needs-review");
    assert.deepEqual(detail.relatedRefs.orderSnapshotRefs, [
      "order-snapshot://controlled/a"
    ]);
    assert.throws(
      () => service.getCustomerDetail(accessContext, CUSTOMER_B),
      /customer not found/
    );
    assert.throws(
      () => service.listCustomers(contextFor(TENANT_A, []), {}),
      /permission is not granted/
    );
  });

  it("restores customer flags with an audit draft and write permission", () => {
    const service = new api.module.CustomerAssetService(
      new api.module.InMemoryCustomerAssetRepository(seed())
    );
    const accessContext = contextFor(TENANT_A, ["customer:read", "customer:write"]);

    const result = service.restoreCustomerFlags(accessContext, CUSTOMER_A, {
      reasonRef: "reason://customer/manual-review",
      restoreBlacklisted: true,
      restoreUnreachable: true
    });

    assert.equal(result.item.isBlacklisted, false);
    assert.equal(result.item.isUnreachable, false);
    assert.deepEqual(result.auditDraft, {
      action: "customer_restore_flags",
      actorUserId: USER_A,
      customerId: CUSTOMER_A,
      reasonRef: "reason://customer/manual-review",
      restoredFlags: ["blacklisted", "unreachable"]
    });
    assert.deepEqual(
      service.listCustomers(accessContext, { flag: "blacklisted" }).items,
      []
    );
    assert.throws(
      () =>
        service.restoreCustomerFlags(
          contextFor(TENANT_A, ["customer:read"]),
          CUSTOMER_A,
          {
            reasonRef: "reason://customer/manual-review",
            restoreBlacklisted: true
          }
        ),
      /permission is not granted/
    );
  });

  it("maps controller validation, access and not-found failures to HTTP statuses", async () => {
    const controller = new api.module.CustomerAssetController(
      new api.module.CustomerAssetService(
        new api.module.InMemoryCustomerAssetRepository(seed())
      )
    );
    const request = { accessContext: contextFor(TENANT_A, ["customer:read"]) };

    await assertRejectsHttp(() => controller.listCustomers({}, {}), 403);
    await assertRejectsHttp(
      () => controller.listCustomers(request, { flag: "bad-flag" }),
      400
    );
    await assertRejectsHttp(
      () => controller.getCustomerDetail(request, "missing-customer"),
      404
    );
    await assertRejectsHttp(
      () =>
        controller.restoreCustomer(
          { accessContext: contextFor(TENANT_A, ["customer:write"]) },
          CUSTOMER_A,
          { restoreBlacklisted: true }
        ),
      400
    );
  });

  it("records M4-14 scope and preserves customer asset blockers", () => {
    assert.match(spec, /customer asset API-shell foundation/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-14 customer asset API shell/);
    assert.match(m4Index, /customer asset admin UI\/E2E/);
    assert.doesNotMatch(
      `${controllerSource}\n${serviceSource}\n${repositorySource}\n${typesSource}`,
      /admin UI|Prisma client provider|real customer data/i
    );
  });
});

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

function seed() {
  return {
    customers: [
      customer(CUSTOMER_A, TENANT_A, true, true),
      customer(CUSTOMER_B, TENANT_B, true, false)
    ],
    fieldDefinitions: [
      {
        fieldKey: "journey.stage",
        id: FIELD_A,
        label: "Journey stage",
        orgId: ORG_ID,
        status: "active",
        tenantId: TENANT_A,
        valueType: "text"
      }
    ],
    fieldValues: [
      {
        customerId: CUSTOMER_A,
        fieldDefinitionId: FIELD_A,
        id: "99999999-9999-4999-8999-999999999999",
        orgId: ORG_ID,
        tenantId: TENANT_A,
        value: { controlledValueRef: "controlled://field/a" }
      }
    ],
    identities: [
      {
        customerId: CUSTOMER_A,
        externalSubjectRef: "identity://controlled/a",
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        identityKind: "channel_subject",
        orgId: ORG_ID,
        provider: "telegram_bot",
        status: "active",
        tenantId: TENANT_A
      }
    ],
    tagAssignments: [
      {
        customerId: CUSTOMER_A,
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        orgId: ORG_ID,
        tagDefinitionId: TAG_A,
        tenantId: TENANT_A
      }
    ],
    tagDefinitions: [
      {
        colorToken: "status-warning",
        id: TAG_A,
        label: "Needs review",
        orgId: ORG_ID,
        status: "active",
        tagKey: "needs-review",
        targetKind: "customer",
        tenantId: TENANT_A
      }
    ]
  };
}

function customer(id, tenantId, isBlacklisted, isUnreachable) {
  return {
    blacklistedAt: isBlacklisted ? "2026-06-22T00:00:00.000Z" : undefined,
    displayLabelRef: `controlled://customer/${id}`,
    id,
    isBlacklisted,
    isUnreachable,
    journeyStage: "stage://journey/review",
    orgId: ORG_ID,
    preferredLanguage: "uz",
    preferredScript: "latin",
    relatedRefs: {
      conversationRefs: ["conversation://controlled/a"],
      orderSnapshotRefs: ["order-snapshot://controlled/a"],
      quoteRecordRefs: ["quote://controlled/a"],
      ticketRefs: ["ticket://controlled/a"]
    },
    status: "active",
    tenantId,
    unreachableAt: isUnreachable ? "2026-06-22T00:00:00.000Z" : undefined,
    unresolvedIssueCount: 1
  };
}

function customerSourceBundle() {
  return `${controllerSource}\n${serviceSource}\n${repositorySource}\n${typesSource}`;
}

async function assertRejectsHttp(action, statusCode) {
  await assert.rejects(action, (error) => {
    assert.equal(error?.statusCode ?? error?.status, statusCode);
    return true;
  });
}

async function importCustomerAssetApiSource() {
  const tmpRoot = mkdtempSync(path.join(tmpdir(), "uzmax-m4-14-"));
  const writeTempModule = (fileName, sourceText) => {
    const destination = new URL(fileName, pathToFileURL(`${tmpRoot}/`));
    writeFileSync(destination, sourceText, "utf8");
    return destination.href;
  };
  const authz = await importTypescriptSource("packages/authz/src/index.ts");
  const nestCommon = createNestCommonStub(writeTempModule);
  const accessContext = writeTempModule(
    "access-context-stub.mjs",
    "export class ApiAccessContextGuard {}"
  );
  const typesUrl = writeSource(writeTempModule, "customer-asset.types", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl
  });
  const repositoryUrl = writeSource(writeTempModule, "customer-asset.repository", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl,
    "./customer-asset.types.ts": typesUrl
  });
  const serviceUrl = writeSource(writeTempModule, "customer-asset.service", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl,
    "./customer-asset.repository.ts": repositoryUrl,
    "./customer-asset.types.ts": typesUrl,
    "@nestjs/common": nestCommon
  });
  const controllerUrl = writeSource(writeTempModule, "customer-asset.controller", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl,
    "./access-context.ts": accessContext,
    "./customer-asset.service.ts": serviceUrl,
    "./customer-asset.types.ts": typesUrl,
    "@nestjs/common": nestCommon
  });
  const [controllerModule, repositoryModule, serviceModule] = await Promise.all([
    import(controllerUrl),
    import(repositoryUrl),
    import(serviceUrl)
  ]);
  return {
    module: { ...controllerModule, ...repositoryModule, ...serviceModule },
    moduleUrl: controllerUrl
  };
}

function createNestCommonStub(writeTempModule) {
  return writeTempModule(
    "nestjs-common.mjs",
    `
    export function Body(){ return () => {}; }
    export function Controller(){ return () => {}; }
    export function Get(){ return () => {}; }
    export function Inject(){ return () => {}; }
    export function Injectable(){ return () => {}; }
    export function Param(){ return () => {}; }
    export function Post(){ return () => {}; }
    export function Query(){ return () => {}; }
    export function Req(){ return () => {}; }
    export function UseGuards(){ return () => {}; }
    export class BadRequestException extends Error { constructor(message){ super(message); this.statusCode = 400; this.status = 400; } }
    export class ForbiddenException extends Error { constructor(message){ super(message); this.statusCode = 403; this.status = 403; } }
    export class NotFoundException extends Error { constructor(message){ super(message); this.statusCode = 404; this.status = 404; } }
    `
  );
}

async function importTypescriptSource(relativePath) {
  const moduleUrl = inlineModuleUrl(transpileSource(read(relativePath)));
  return { module: await import(moduleUrl), moduleUrl };
}

function writeSource(writeTempModule, moduleName, replacements) {
  const sourceText = replaceImports(
    read(`apps/api/src/${moduleName}.ts`),
    replacements
  );
  return writeTempModule(`${moduleName}.mjs`, transpileSource(sourceText));
}

function replaceImports(sourceText, replacements) {
  let output = sourceText;
  for (const [from, to] of Object.entries(replacements)) {
    output = output.replaceAll(from, to);
  }
  return output;
}

function inlineModuleUrl(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText, "utf8").toString(
    "base64"
  )}`;
}

function transpileSource(sourceText) {
  return ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

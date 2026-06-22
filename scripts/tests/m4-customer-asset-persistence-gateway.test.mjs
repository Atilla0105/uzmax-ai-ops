import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_B = "33333333-3333-4333-8333-333333333333";
const USER_A = "44444444-4444-4444-8444-444444444444";
const CUSTOMER_A = "55555555-5555-4555-8555-555555555555";
const CUSTOMER_B = "66666666-6666-4666-8666-666666666666";
const CUSTOMER_C = "77777777-7777-4777-8777-777777777777";
const FIELD_A = "88888888-8888-4888-8888-888888888888";
const FIELD_VALUE_A = "99999999-9999-4999-8999-999999999999";
const IDENTITY_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TAG_A = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const TAG_ASSIGNMENT_A = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const repositorySource = read("apps/api/src/customer-asset.repository.ts");
const persistenceSource = read("apps/api/src/customer-asset.persistence.ts");
const serviceSource = read("apps/api/src/customer-asset.service.ts");
const appModule = read("apps/api/src/app.module.ts");
const spec = read("docs/specs/M4-17-customer-asset-persistence-gateway.md");
const evidence = read("docs/evidence/M4/M4-17-customer-asset-persistence-gateway.md");
const m4Index = read("docs/evidence/M4/README.md");
const api = await importCustomerAssetSource();

describe("M4-17 customer asset persistence gateway", () => {
  it("maps selected-tenant customer rows, tags, fields, identities and refs", async () => {
    const gateway = customerAssetGateway();
    const repository = new api.module.PersistenceCustomerAssetRepository(gateway);
    const service = new api.module.CustomerAssetService(repository);
    const accessContext = contextFor(TENANT_A, ["customer:read"]);

    const listed = await repository.listCustomers(accessContext, {
      flag: "blacklisted",
      tagKey: "needs-review"
    });
    const detail = (await service.getCustomerDetail(accessContext, CUSTOMER_A)).item;
    const crossTenant = await repository.getCustomer(accessContext, CUSTOMER_B);

    assert.deepEqual(
      listed.map((customer) => customer.id),
      [CUSTOMER_A]
    );
    assert.equal(crossTenant, undefined);
    assert.equal(detail.customer.displayLabelRef, "controlled://customer/a");
    assert.equal(detail.identities[0].externalSubjectRef, "identity://controlled/a");
    assert.equal(detail.fields[0].definition.fieldKey, "journey.stage");
    assert.equal(detail.tags[0].definition.tagKey, "needs-review");
    assert.deepEqual(detail.relatedRefs.orderSnapshotRefs, [
      "order-snapshot://controlled/a"
    ]);
    assert.deepEqual(gateway.calls[0], {
      method: "listCustomers",
      scope: { orgId: ORG_ID, tenantId: TENANT_A }
    });
  });

  it("passes restore saves through the gateway without audit persistence", async () => {
    const gateway = customerAssetGateway();
    const service = new api.module.CustomerAssetService(
      new api.module.PersistenceCustomerAssetRepository(gateway)
    );
    const accessContext = contextFor(TENANT_A, ["customer:read", "customer:write"]);

    const restoreInput = {
      reasonRef: "reason://customer/manual-review",
      restoreBlacklisted: true,
      restoreUnreachable: true
    };
    const result = await service.restoreCustomerFlags(
      accessContext,
      CUSTOMER_A,
      restoreInput
    );

    assert.deepEqual(
      {
        auditAction: result.auditDraft.action,
        auditReason: result.auditDraft.reasonRef,
        blacklisted: result.item.isBlacklisted,
        restoredFlags: result.auditDraft.restoredFlags,
        unreachable: result.item.isUnreachable
      },
      {
        auditAction: "customer_restore_flags",
        auditReason: restoreInput.reasonRef,
        blacklisted: false,
        restoredFlags: ["blacklisted", "unreachable"],
        unreachable: false
      }
    );
    assert.equal(result.auditDraft.actorUserId, USER_A);
    assert.equal(result.auditDraft.customerId, CUSTOMER_A);
    assert.deepEqual(gateway.saved.scope, { orgId: ORG_ID, tenantId: TENANT_A });
    assert.equal(gateway.saved.customer.isBlacklisted, false);
    assert.equal(gateway.saved.customer.isUnreachable, false);
    assert.deepEqual(gateway.saved.customer.metadata.relatedRefs.ticketRefs, [
      "ticket://controlled/a"
    ]);
  });

  it("fails closed for invalid persistence contract rows", async () => {
    const repository = new api.module.PersistenceCustomerAssetRepository({
      ...customerAssetGateway(),
      listFieldDefinitions() {
        return [{ ...fieldDefinitionRow(), valueType: "money" }];
      }
    });

    await assert.rejects(
      () => repository.listFieldDefinitions(contextFor(TENANT_A, ["customer:read"])),
      /customer field valueType is invalid/
    );
  });

  it("records M4-17 as a contract-only gateway without runtime DB wiring", () => {
    assert.match(persistenceSource, /PersistenceCustomerAssetRepository/);
    assert.match(persistenceSource, /type CustomerAssetPersistenceGateway/);
    assert.match(persistenceSource, /import type \{ M4CustomerAssetContractInput \}/);
    assert.match(appModule, /CustomerAssetPersistenceContractAnchor/);
    assert.doesNotMatch(
      appModule,
      /useClass: PersistenceCustomerAssetRepository|useExisting: PersistenceCustomerAssetRepository/
    );
    assert.match(serviceSource, /await this\.repository\.listCustomers/);
    assert.match(serviceSource, /await this\.repository\.saveCustomer/);
    assert.match(spec, /customer asset persistence-gateway contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-17 customer asset persistence gateway/);
    assert.doesNotMatch(
      `${repositorySource}\n${persistenceSource}\n${serviceSource}`,
      /@prisma\/client|new PrismaClient|process\.env|fetch\(|https?:\/\//i
    );
    assert.doesNotMatch(
      `${repositorySource}\n${persistenceSource}\n${serviceSource}`,
      /raw payload|csv export|xlsx export|phone|address|payment|secret/i
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

function customerAssetGateway() {
  const fixture = {
    calls: [],
    saved: undefined,
    getCustomer(scope, customerId) {
      fixture.calls.push({ customerId, method: "getCustomer", scope });
      return [
        customerRow(CUSTOMER_A, TENANT_A),
        customerRow(CUSTOMER_B, TENANT_B)
      ].find((customer) => customer.id === customerId);
    },
    listCustomers(scope) {
      fixture.calls.push({ method: "listCustomers", scope });
      return [
        customerRow(CUSTOMER_A, TENANT_A),
        customerRow(CUSTOMER_B, TENANT_B),
        customerRow(CUSTOMER_C, TENANT_A, { isBlacklisted: true })
      ];
    },
    listFieldDefinitions(scope) {
      fixture.calls.push({ method: "listFieldDefinitions", scope });
      return [fieldDefinitionRow()];
    },
    listFieldValues(scope, customerId) {
      fixture.calls.push({ customerId, method: "listFieldValues", scope });
      return customerId === CUSTOMER_A ? [fieldValueRow()] : [];
    },
    listIdentities(scope, customerId) {
      fixture.calls.push({ customerId, method: "listIdentities", scope });
      return customerId === CUSTOMER_A ? [identityRow()] : [];
    },
    listTagAssignments(scope, customerId) {
      fixture.calls.push({ customerId, method: "listTagAssignments", scope });
      return customerId === CUSTOMER_A ? [tagAssignmentRow()] : [];
    },
    listTagDefinitions(scope) {
      fixture.calls.push({ method: "listTagDefinitions", scope });
      return [tagDefinitionRow()];
    },
    saveCustomer(scope, customer) {
      fixture.saved = { customer, scope };
      return customer;
    }
  };
  return fixture;
}

function customerRow(id, tenantId, overrides = {}) {
  return {
    blacklistedAt: "2026-06-22T00:00:00.000Z",
    displayLabelRef:
      id === CUSTOMER_A ? "controlled://customer/a" : "controlled://customer/other",
    id,
    isBlacklisted: true,
    isUnreachable: true,
    journeyStage: "stage://journey/review",
    metadata: {
      relatedRefs: {
        conversationRefs: ["conversation://controlled/a"],
        orderSnapshotRefs: ["order-snapshot://controlled/a"],
        quoteRecordRefs: ["quote://controlled/a"],
        ticketRefs: ["ticket://controlled/a"]
      }
    },
    orgId: ORG_ID,
    preferredLanguage: "uz",
    preferredScript: "latin",
    status: "active",
    tenantId,
    unreachableAt: "2026-06-22T00:00:00.000Z",
    unresolvedIssueCount: 1,
    ...overrides
  };
}

function fieldDefinitionRow() {
  return {
    fieldKey: "journey.stage",
    id: FIELD_A,
    label: "Journey stage",
    orgId: ORG_ID,
    status: "active",
    tenantId: TENANT_A,
    valueType: "text"
  };
}

function fieldValueRow() {
  return {
    customerId: CUSTOMER_A,
    fieldDefinitionId: FIELD_A,
    id: FIELD_VALUE_A,
    orgId: ORG_ID,
    tenantId: TENANT_A,
    value: { controlledValueRef: "controlled://field/a" }
  };
}

function identityRow() {
  return {
    customerId: CUSTOMER_A,
    externalSubjectRef: "identity://controlled/a",
    id: IDENTITY_A,
    identityKind: "channel_subject",
    orgId: ORG_ID,
    provider: "telegram_bot",
    status: "active",
    tenantId: TENANT_A
  };
}

function tagDefinitionRow() {
  return {
    colorToken: "status-warning",
    id: TAG_A,
    label: "Needs review",
    orgId: ORG_ID,
    status: "active",
    tagKey: "needs-review",
    targetKind: "customer",
    tenantId: TENANT_A
  };
}

function tagAssignmentRow() {
  return {
    customerId: CUSTOMER_A,
    id: TAG_ASSIGNMENT_A,
    orgId: ORG_ID,
    tagDefinitionId: TAG_A,
    tenantId: TENANT_A
  };
}

async function importCustomerAssetSource() {
  const authzUrl = inlineSource(read("packages/authz/src/index.ts"));
  const nestCommonUrl = inlineJavaScript(`
    export function Inject(){ return () => {}; }
    export function Injectable(){ return () => {}; }
  `);
  const typesUrl = inlineSource(
    replaceImports(read("apps/api/src/customer-asset.types.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl
    })
  );
  const repositoryUrl = inlineSource(
    replaceImports(read("apps/api/src/customer-asset.repository.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl,
      "./customer-asset.types.ts": typesUrl
    })
  );
  const persistenceUrl = inlineSource(
    replaceImports(read("apps/api/src/customer-asset.persistence.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl,
      "./customer-asset.repository.ts": repositoryUrl,
      "./customer-asset.types.ts": typesUrl
    })
  );
  const serviceUrl = inlineSource(
    replaceImports(read("apps/api/src/customer-asset.service.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl,
      "./customer-asset.repository.ts": repositoryUrl,
      "./customer-asset.types.ts": typesUrl,
      "@nestjs/common": nestCommonUrl
    })
  );
  const [repositoryModule, persistenceModule, serviceModule] = await Promise.all([
    import(repositoryUrl),
    import(persistenceUrl),
    import(serviceUrl)
  ]);
  return { module: { ...repositoryModule, ...persistenceModule, ...serviceModule } };
}

function replaceImports(sourceText, replacements) {
  let output = sourceText;
  for (const [from, to] of Object.entries(replacements)) {
    output = output.replaceAll(from, to);
  }
  return output;
}

function inlineSource(sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  });
  return moduleUrl(compiled.outputText);
}

function inlineJavaScript(sourceText) {
  return moduleUrl(sourceText);
}

function moduleUrl(sourceText) {
  const payload = Buffer.from(sourceText).toString("base64");
  return ["data:text/javascript;base64", payload].join(",");
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

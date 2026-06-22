import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const USER_A = "33333333-3333-4333-8333-333333333333";
const CUSTOMER_A = "44444444-4444-4444-8444-444444444444";
const dbSource = read("packages/db/src/index.ts");
const serviceSource = read("apps/api/src/customer-asset.service.ts");
const appModule = read("apps/api/src/app.module.ts");
const runtimeCompiler = read("apps/api/scripts/runtime-compiler.mjs");
const spec = read("docs/specs/M4-19-customer-asset-restore-audit-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-19-customer-asset-restore-audit-contract.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const db = await importTypescriptSource("packages/db/src/index.ts");
const api = await importCustomerAssetSource();

describe("M4-19 customer asset restore audit contract", () => {
  it("creates a controlled audit_log-shaped restore event", () => {
    const event = db.module.createCustomerAssetRestoreAuditContract({
      actorUserId: USER_A,
      after: { isBlacklisted: false, isUnreachable: false },
      before: { isBlacklisted: true, isUnreachable: true },
      customerId: CUSTOMER_A,
      orgId: ORG_ID,
      reasonRef: "reason://customer/manual-review",
      restoredFlags: ["blacklisted", "unreachable", "blacklisted"],
      tenantId: TENANT_A
    });

    assert.deepEqual(
      {
        action: event.action,
        actorUserId: event.actorUserId,
        eventType: event.eventType,
        module: event.module,
        objectId: event.objectId,
        objectType: event.objectType,
        orgId: event.orgId,
        tenantId: event.tenantId
      },
      {
        action: "customer_restore_flags",
        actorUserId: USER_A,
        eventType: "customer.flags_restored",
        module: "customer_asset",
        objectId: CUSTOMER_A,
        objectType: "customer",
        orgId: ORG_ID,
        tenantId: TENANT_A
      }
    );
    assert.deepEqual(event.content.before, {
      isBlacklisted: true,
      isUnreachable: true
    });
    assert.deepEqual(event.content.after, {
      isBlacklisted: false,
      isUnreachable: false,
      reasonRef: "reason://customer/manual-review",
      restoredFlags: ["blacklisted", "unreachable"]
    });
    assert.doesNotMatch(
      JSON.stringify(event),
      /raw payload|csv export|xlsx export|phone|address|payment|secret/i
    );
  });

  it("records restore events through the existing API audit sink port", async () => {
    const recordedEvents = [];
    const auditSink = {
      events: recordedEvents,
      async record(event) {
        recordedEvents.push(event);
      }
    };
    const service = new api.module.CustomerAssetService(
      customerRepository(customer(CUSTOMER_A)),
      auditSink
    );

    const result = await service.restoreCustomerFlags(
      contextFor(["customer:read", "customer:write"]),
      CUSTOMER_A,
      {
        reasonRef: "reason://customer/manual-review",
        restoreBlacklisted: true,
        restoreUnreachable: true
      }
    );

    assert.equal(recordedEvents.length, 1);
    assert.equal(recordedEvents[0].eventType, result.auditDraft.eventType);
    assert.equal(recordedEvents[0].objectId, result.auditDraft.objectId);
    assert.equal(recordedEvents[0].reasonRef, undefined);
    assert.equal(result.auditDraft.eventType, "customer.flags_restored");
    assert.equal(result.auditDraft.customerId, CUSTOMER_A);
    assert.equal(result.auditDraft.objectId, CUSTOMER_A);
    assert.equal(result.auditDraft.reasonRef, "reason://customer/manual-review");
    assert.deepEqual(result.auditDraft.content.after.restoredFlags, [
      "blacklisted",
      "unreachable"
    ]);
    assert.deepEqual(result.auditDraft.restoredFlags, ["blacklisted", "unreachable"]);
    assert.equal(result.item.isBlacklisted, false);
    assert.equal(result.item.isUnreachable, false);
  });

  it("keeps the contract scoped without duplicate audit runtime or real DB wiring", () => {
    assert.match(dbSource, /customerFlagsRestored: "customer\.flags_restored"/);
    assert.match(dbSource, /createCustomerAssetRestoreAuditContract/);
    assert.match(serviceSource, /API_AUDIT_SINK/);
    assert.match(serviceSource, /createCustomerAssetRestoreAuditContract/);
    assert.match(appModule, /provide: api\.API_AUDIT_SINK/);
    assert.match(
      runtimeCompiler,
      /"\.\/access-context\.ts": "\.\/access-context\.mjs"/
    );
    assert.match(spec, /Customer Asset Restore Audit Contract/);
    assert.match(evidence, /contract-shaped audit event/);
    assert.match(m4Index, /M4-19 customer asset restore audit contract/);
    assert.doesNotMatch(
      serviceSource,
      /CUSTOMER_ASSET_AUDIT_SINK|NOOP_AUDIT_SINK|Optional|class .*CustomerAsset.*AuditSink/i
    );
    assert.doesNotMatch(
      `${dbSource}\n${serviceSource}`,
      /new PrismaClient|@prisma\/client|process\.env|fetch\(|https?:\/\//i
    );
  });
});

function contextFor(permissions) {
  return {
    membershipVersion: 1,
    orgId: ORG_ID,
    permissions,
    selectedTenantId: TENANT_A,
    tenantIds: [TENANT_A],
    userId: USER_A
  };
}

function customer(id) {
  return {
    blacklistedAt: "2026-06-22T00:00:00.000Z",
    displayLabelRef: `controlled://customer/${id}`,
    id,
    isBlacklisted: true,
    isUnreachable: true,
    journeyStage: "stage://journey/review",
    orgId: ORG_ID,
    preferredLanguage: "uz",
    preferredScript: "latin",
    status: "active",
    tenantId: TENANT_A,
    unreachableAt: "2026-06-22T00:00:00.000Z",
    unresolvedIssueCount: 1
  };
}

function customerRepository(initialCustomer) {
  let storedCustomer = initialCustomer;
  return {
    getCustomer(_accessContext, customerId) {
      return storedCustomer.id === customerId ? storedCustomer : undefined;
    },
    saveCustomer(customerRecord) {
      storedCustomer = customerRecord;
      return storedCustomer;
    }
  };
}

async function importCustomerAssetSource() {
  const authzUrl = inlineSource(read("packages/authz/src/index.ts"));
  const dbUrl = inlineSource(read("packages/db/src/index.ts"));
  const accessContextUrl = inlineJavaScript(
    'export const API_AUDIT_SINK = "API_AUDIT_SINK";'
  );
  const repositoryUrl = inlineJavaScript(
    'export const CUSTOMER_ASSET_REPOSITORY = "CUSTOMER_ASSET_REPOSITORY";'
  );
  const nestCommonUrl = inlineJavaScript(`
    export function Inject(){ return () => {}; }
    export function Injectable(){ return () => {}; }
  `);
  const typesUrl = inlineSource(
    replaceImports(read("apps/api/src/customer-asset.types.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl
    })
  );
  const serviceUrl = inlineSource(
    replaceImports(read("apps/api/src/customer-asset.service.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl,
      "../../../packages/db/src/index.ts": dbUrl,
      "./access-context.ts": accessContextUrl,
      "./customer-asset.repository.ts": repositoryUrl,
      "./customer-asset.types.ts": typesUrl,
      "@nestjs/common": nestCommonUrl
    })
  );
  return { module: await import(serviceUrl) };
}

async function importTypescriptSource(relativePath) {
  const moduleUrl = inlineSource(read(relativePath));
  return { module: await import(moduleUrl), moduleUrl };
}

function replaceImports(sourceText, replacements) {
  return Object.entries(replacements).reduce(
    (output, [from, to]) => output.replaceAll(from, to),
    sourceText
  );
}

function inlineSource(sourceText) {
  return moduleUrl(
    ts.transpileModule(sourceText, {
      compilerOptions: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2023
      }
    }).outputText
  );
}

function inlineJavaScript(sourceText) {
  return moduleUrl(sourceText);
}

function moduleUrl(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText).toString("base64")}`;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

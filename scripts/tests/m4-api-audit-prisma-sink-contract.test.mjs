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
const sinkSource = read("apps/api/src/audit-log.prisma-sink.ts");
const appModule = read("apps/api/src/app.module.ts");
const contracts = read("docs/contracts/README.md");
const spec = read("docs/specs/M4-20-api-audit-prisma-sink-contract.md");
const evidence = read("docs/evidence/M4/M4-20-api-audit-prisma-sink-contract.md");
const m4Index = read("docs/evidence/M4/README.md");
const tsOptions = {
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2023
};
const db = await loadTsModule("packages/db/src/index.ts");
const api = await importAuditSinkSource();

describe("M4-20 API audit Prisma sink contract", () => {
  it("maps a customer restore audit contract to Prisma auditLog.create data", async () => {
    const calls = [];
    const sink = new api.module.PrismaAuditSink({
      auditLog: {
        async create(args) {
          calls.push(args);
          return { id: "audit://controlled/restore" };
        }
      }
    });
    const event = customerRestoreAuditEvent();

    await sink.record(event);

    assert.equal(calls.length, 1);
    assert.deepEqual(
      {
        action: calls[0].data.action,
        actorUserId: calls[0].data.actorUserId,
        afterVersionId: calls[0].data.afterVersionId,
        beforeVersionId: calls[0].data.beforeVersionId,
        eventType: calls[0].data.eventType,
        module: calls[0].data.module,
        objectId: calls[0].data.objectId,
        objectType: calls[0].data.objectType,
        orgId: calls[0].data.orgId,
        tenantId: calls[0].data.tenantId,
        traceId: calls[0].data.traceId
      },
      {
        action: "customer_restore_flags",
        actorUserId: USER_A,
        afterVersionId: null,
        beforeVersionId: null,
        eventType: "customer.flags_restored",
        module: "customer_asset",
        objectId: CUSTOMER_A,
        objectType: "customer",
        orgId: ORG_ID,
        tenantId: TENANT_A,
        traceId: null
      }
    );
    assert.deepEqual(calls[0].data.content.before, {
      isBlacklisted: true,
      isUnreachable: false
    });
    assert.deepEqual(calls[0].data.content.after, {
      isBlacklisted: false,
      isUnreachable: false,
      reasonRef: "reason://customer/manual-review",
      restoredFlags: ["blacklisted"]
    });
    assert.ok(calls[0].data.occurredAt instanceof Date);
    assert.equal(calls[0].data.occurredAt.toISOString(), event.occurredAt);
  });

  it("fails before create for pre-audit or malformed events", async () => {
    const calls = [];
    const sink = new api.module.PrismaAuditSink({
      auditLog: {
        async create(args) {
          calls.push(args);
          return {};
        }
      }
    });

    await assert.rejects(
      () =>
        sink.record({
          actorUserId: USER_A,
          eventType: "access_context.denied",
          occurredAt: "2026-06-23T00:00:00.000Z",
          reason: "tenant denied",
          tenantId: TENANT_A
        }),
      /audit .* required|audit content/i
    );
    await assert.rejects(
      () =>
        sink.record({
          ...customerRestoreAuditEvent(),
          occurredAt: "not-a-date"
        }),
      /audit occurredAt is invalid/
    );
    assert.deepEqual(calls, []);
  });

  it("keeps Prisma audit persistence opt-in without default runtime wiring", () => {
    assert.match(sinkSource, /class PrismaAuditSink/);
    assert.match(sinkSource, /auditLog\.create/);
    assert.match(sinkSource, /createAuditLogContract/);
    assert.match(appModule, /PrismaAuditSink/);
    assert.match(
      appModule,
      /provide: api\.API_AUDIT_SINK, useClass: api\.InMemoryAuditSink/
    );
    assert.doesNotMatch(
      appModule,
      /useClass: PrismaAuditSink|useExisting: PrismaAuditSink/
    );
    assert.match(contracts, /M4-20-api-audit-prisma-sink-contract/);
    assert.match(contracts, /access_context\.denied/);
    assert.match(spec, /API Audit Prisma Sink Contract/);
    assert.match(evidence, /Prisma-shaped audit sink adapter/);
    assert.match(m4Index, /M4-20 API audit Prisma sink contract/);
    assert.doesNotMatch(
      `${sinkSource}\n${appModule}`,
      /@prisma\/client|new PrismaClient|process\.env|fetch\(|https?:\/\//i
    );
  });
});

function customerRestoreAuditEvent() {
  return db.module.createCustomerAssetRestoreAuditContract({
    actorUserId: USER_A,
    after: { isBlacklisted: false, isUnreachable: false },
    before: { isBlacklisted: true, isUnreachable: false },
    customerId: CUSTOMER_A,
    orgId: ORG_ID,
    reasonRef: "reason://customer/manual-review",
    restoredFlags: ["blacklisted"],
    tenantId: TENANT_A
  });
}

async function importAuditSinkSource() {
  const sinkUrl = tsModuleUrl("apps/api/src/audit-log.prisma-sink.ts", {
    "../../../packages/db/src/index.ts": tsModuleUrl("packages/db/src/index.ts"),
    "./access-context-core.ts": dataModuleUrl("")
  });
  return { module: await import(sinkUrl), moduleUrl: sinkUrl };
}

async function loadTsModule(relativePath) {
  const moduleUrl = tsModuleUrl(relativePath);
  return { module: await import(moduleUrl), moduleUrl };
}

function tsModuleUrl(relativePath, replacements = {}) {
  let sourceText = read(relativePath);
  for (const [from, to] of Object.entries(replacements)) {
    sourceText = sourceText.replaceAll(from, to);
  }
  return dataModuleUrl(
    ts.transpileModule(sourceText, {
      compilerOptions: tsOptions
    }).outputText
  );
}

function dataModuleUrl(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText).toString("base64")}`;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

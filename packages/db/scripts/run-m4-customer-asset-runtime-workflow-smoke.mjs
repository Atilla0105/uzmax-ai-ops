import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";

import { PrismaClient } from "@prisma/client";
import ts from "typescript";

import {
  assertVisibleText,
  runAdminVisibleCustomerAssetSmoke,
  withCustomerAssetVisibleSmokePage
} from "./customer-asset-admin-visible-smoke-harness.mjs";
import {
  createCustomerAssetHttpFetcher,
  createCustomerAssetRuntimeSmokeFixture,
  getCustomerAssetJson,
  getCustomerInRlsTransaction,
  listAuditRowsInRlsTransaction,
  requireSmokeEnv
} from "./customer-asset-true-db-http-smoke-fixture.mjs";

const fixture = createCustomerAssetRuntimeSmokeFixture({
  suffix: "143",
  syntheticSpec: "M4-43"
});

const databaseUrl = requireSmokeEnv("UZMAX_RLS_DATABASE_URL");
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } }
});
const tenantAFetcher = (baseUrl, permissions = "customer:read") =>
  createCustomerAssetHttpFetcher(baseUrl, { permissions, tenantId: fixture.tenantAId });

await runAdminVisibleCustomerAssetSmoke({
  assertRuntime: async (runtime) => {
    const adminClient = await importAdminCustomerAssetApiClient();
    await assertApiReadback(runtime.apiBaseUrl);
    await assertAdminClientReadback(adminClient, runtime.apiBaseUrl);
    await assertTenantBIsolation(runtime.apiBaseUrl);
    await assertPermissionFailure(runtime.apiBaseUrl);
    await assertBrowserRestoreAndAudit(runtime);
  },
  fixture,
  prisma,
  smokeName: "m4-customer-asset-runtime-workflow-smoke",
  successMessage:
    "m4-customer-asset-runtime-workflow-smoke: passed customer asset API/admin/browser->DB/RLS restore audit synthetic workflow; residue=0"
});

async function assertApiReadback(baseUrl) {
  const fetcher = tenantAFetcher(baseUrl);
  const list = await getCustomerAssetJson(
    fetcher,
    "/customer-assets/customers?tagKey=m4-43-needs-review"
  );
  assert.deepEqual(
    list.items.map((customer) => customer.id),
    [fixture.customerAId]
  );
  assert.equal(list.items[0].displayLabelRef, "label://customer/m4-43-alpha");
  assert.equal(list.items[0].isBlacklisted, true);
  assert.equal(list.items[0].isUnreachable, true);

  const detail = await getCustomerAssetJson(
    fetcher,
    `/customer-assets/customers/${fixture.customerAId}`
  );
  assert.equal(
    detail.item.identities[0].externalSubjectRef,
    "identity://m4-43-alpha-primary"
  );
  assert.equal(detail.item.fields[0].definition.fieldKey, "m4_43.journey_stage");
  assert.equal(
    detail.item.fields[0].value.controlledValueRef,
    "field-value://m4-43-alpha-stage"
  );
  assert.equal(detail.item.tags[0].definition.tagKey, "m4-43-needs-review");
  assert.deepEqual(detail.item.relatedRefs, fixture.relatedRefs);

  const [fieldDefinitions, tagDefinitions] = await Promise.all([
    getCustomerAssetJson(fetcher, "/customer-assets/field-definitions"),
    getCustomerAssetJson(fetcher, "/customer-assets/tag-definitions")
  ]);
  assert.equal(fieldDefinitions.items[0].id, fixture.fieldDefinitionId);
  assert.equal(tagDefinitions.items[0].id, fixture.tagDefinitionId);
}

async function assertAdminClientReadback(adminClient, baseUrl) {
  const client = adminClient.createCustomerAssetApiClient({
    fetcher: tenantAFetcher(baseUrl)
  });
  const customers = await client.listCustomers({ tagKey: "m4-43-needs-review" });
  assert.equal(customers[0].id, fixture.customerAId);
  const detail = await client.getCustomerDetail(fixture.customerAId);
  assert.equal(
    detail.identities[0].externalSubjectRef,
    "identity://m4-43-alpha-primary"
  );
  assert.equal(detail.fields[0].definition.label, "M4 43 Journey Stage");
  assert.equal(detail.tags[0].definition.label, "M4 43 Needs Review");
  assert.deepEqual(
    detail.relatedRefs.orderSnapshotRefs,
    fixture.relatedRefs.orderSnapshotRefs
  );
}

async function assertTenantBIsolation(baseUrl) {
  const fetcher = createCustomerAssetHttpFetcher(baseUrl, {
    permissions: "customer:read",
    tenantId: fixture.tenantBId
  });
  const list = await getCustomerAssetJson(fetcher, "/customer-assets/customers");
  assert.equal(
    list.items.some((customer) => customer.id === fixture.customerAId),
    false
  );
  assert.equal(
    list.items.some((customer) => customer.id === fixture.customerBId),
    true
  );
  await getCustomerAssetJson(
    fetcher,
    `/customer-assets/customers/${fixture.customerAId}`,
    { expectedStatus: 404 }
  );
}

async function assertPermissionFailure(baseUrl) {
  await getCustomerAssetJson(
    tenantAFetcher(baseUrl, "none"),
    "/customer-assets/customers",
    { expectedStatus: 403 }
  );
}

async function assertBrowserRestoreAndAudit(runtime) {
  await withCustomerAssetVisibleSmokePage(
    runtime,
    {
      autoRestore: true,
      permissions: "customer:read,customer:write",
      restoreReasonRef: fixture.auditReasonRef
    },
    async (runtimeState) => {
      for (const text of [
        "Customer asset runtime DB/RLS smoke",
        "label://customer/m4-43-alpha",
        "identity://m4-43-alpha-primary",
        "m4_43.journey_stage",
        "m4-43-needs-review",
        fixture.relatedRefs.orderSnapshotRefs[0],
        fixture.relatedRefs.quoteRecordRefs[0],
        fixture.relatedRefs.ticketRefs[0],
        "customer.flags_restored",
        "customer_restore_flags",
        "blacklisted,unreachable",
        fixture.auditReasonRef
      ]) {
        await assertVisibleText(runtimeState, text);
      }
    }
  );

  const auditRows = await listAuditRowsInRlsTransaction(prisma, fixture);
  assert.equal(auditRows.length, 1);
  assert.equal(auditRows[0].eventType, "customer.flags_restored");
  assert.deepEqual(auditRows[0].content.before, {
    isBlacklisted: true,
    isUnreachable: true
  });
  assert.deepEqual(auditRows[0].content.after, {
    isBlacklisted: false,
    isUnreachable: false,
    reasonRef: fixture.auditReasonRef,
    restoredFlags: ["blacklisted", "unreachable"]
  });

  const customer = await getCustomerInRlsTransaction(prisma, fixture);
  assert.equal(customer.isBlacklisted, false);
  assert.equal(customer.isUnreachable, false);
  assert.equal(customer.blacklistedAt, null);
  assert.equal(customer.unreachableAt, null);
}

async function importAdminCustomerAssetApiClient() {
  const source = await readFile(
    new URL("../../../apps/admin/src/customerAssetApiClient.ts", import.meta.url),
    "utf8"
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(compiled, "utf8").toString("base64")}`
  );
}

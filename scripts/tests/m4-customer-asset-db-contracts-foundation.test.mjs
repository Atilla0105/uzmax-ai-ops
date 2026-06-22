import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const schema = read("packages/db/prisma/schema.prisma");
const migration = read(
  "packages/db/migrations/0005_customer_asset_contracts_foundation.sql"
);
const spec = read("docs/specs/M4-02-customer-asset-db-contracts-foundation.md");
const evidence = read(
  "docs/evidence/M4/M4-02-customer-asset-db-contracts-foundation.md"
);
const db = await importTypescriptSource(
  "packages/db/src/m4-customer-asset-contracts.ts"
);
const m4 = db.m4CustomerAssetContracts;

const ORG_UUID = "11111111-1111-4111-8111-111111111111";
const TENANT_UUID = "22222222-2222-4222-8222-222222222222";
const CUSTOMER_UUID = "33333333-3333-4333-8333-333333333333";
const IDENTITY_UUID = "44444444-4444-4444-8444-444444444444";
const CHANNEL_UUID = "55555555-5555-4555-8555-555555555555";
const FIELD_UUID = "66666666-6666-4666-8666-666666666666";
const VALUE_UUID = "77777777-7777-4777-8777-777777777777";
const TAG_UUID = "88888888-8888-4888-8888-888888888888";
const ASSIGNMENT_UUID = "99999999-9999-4999-8999-999999999999";
const USER_UUID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("M4-02 customer asset DB contracts foundation", () => {
  it("maps customer asset Prisma models to the expected SQL tables", () => {
    for (const [model, table] of [
      ["Customer", "customer"],
      ["CustomerIdentity", "customer_identity"],
      ["CustomFieldDefinition", "custom_field_definition"],
      ["CustomerFieldValue", "customer_field_value"],
      ["TagDefinition", "tag_definition"],
      ["TagAssignment", "tag_assignment"]
    ]) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
      assert.match(schema, new RegExp(`@@map\\("${table}"\\)`));
      assert.match(migration, new RegExp(`create table if not exists ${table} \\(`));
    }

    for (const enumName of [
      "CustomerAssetRecordStatus",
      "CustomerIdentityStatus",
      "CustomFieldValueType",
      "TagTargetKind"
    ]) {
      assert.match(schema, new RegExp(`enum ${enumName} \\{`));
    }
  });

  it("keeps M4 customer asset tables tenant-scoped and least-privileged", () => {
    for (const table of m4CustomerTables) {
      assert.match(migration, new RegExp(`'${table}'`));
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
    }

    assert.match(migration, /tenant_scope_predicate text/);
    assert.match(migration, /current_setting\(''app\.org_id'', true\)/);
    assert.match(migration, /current_setting\(''app\.tenant_id'', true\)/);
    assert.match(
      migration,
      /execute format\('alter table %I enable row level security'/
    );
    assert.match(
      migration,
      /execute format\('alter table %I force row level security'/
    );
    assert.match(migration, /policy_prefix := format\('m4_customer_asset_%s'/);
    assert.match(migration, /for select to uzmax_app_runtime using/);
    assert.match(migration, /for insert to uzmax_app_runtime with check/);
    assert.match(migration, /for update to uzmax_app_runtime using/);
    assert.match(migration, /_select_tenant_scope/);
    assert.match(migration, /_insert_tenant_scope/);
    assert.match(migration, /_update_tenant_scope/);

    for (const scopedFk of [
      "customer_identity_customer_fk",
      "customer_identity_channel_fk",
      "customer_field_value_customer_fk",
      "customer_field_value_definition_fk",
      "tag_assignment_customer_fk",
      "tag_assignment_definition_fk"
    ]) {
      assert.match(migration, new RegExp(`constraint ${scopedFk}`));
    }

    assert.match(migration, /customer_blacklisted_timestamp_matches_flag/);
    assert.match(migration, /customer_unreachable_timestamp_matches_flag/);
    assert.match(migration, /customer_field_value_object/);
    assert.match(migration, /tag_definition_key_unique/);
  });

  it("exports M4 customer asset constants and pure builders", () => {
    assert.deepEqual(m4.tableNames, {
      customer: "customer",
      customerFieldValue: "customer_field_value",
      customerIdentity: "customer_identity",
      customFieldDefinition: "custom_field_definition",
      tagAssignment: "tag_assignment",
      tagDefinition: "tag_definition"
    });
    assert.equal(m4.recordStatuses.active, "active");
    assert.equal(m4.identityStatuses.merged, "merged");
    assert.equal(m4.customFieldValueTypes.json, "json");
    assert.equal(m4.tagTargetKinds.customer, "customer");

    const customer = m4.createCustomerContract({
      displayLabelRef: "controlled://customer/display-label",
      id: CUSTOMER_UUID,
      isBlacklisted: true,
      blacklistedAt: "2026-06-22T00:00:00.000Z",
      metadata: { source: "controlled-ref" },
      orgId: ORG_UUID,
      preferredLanguage: "uz",
      preferredScript: "latin",
      status: "active",
      tenantId: TENANT_UUID,
      unresolvedIssueCount: 1
    });
    assert.equal(customer.id, CUSTOMER_UUID);
    assert.equal(customer.isBlacklisted, true);

    const identity = m4.createCustomerIdentityContract({
      channelConnectionId: CHANNEL_UUID,
      customerId: CUSTOMER_UUID,
      externalSubjectRef: "controlled://identity/channel-subject",
      id: IDENTITY_UUID,
      identityKind: "channel_subject",
      orgId: ORG_UUID,
      provider: "telegram_bot",
      status: "active",
      tenantId: TENANT_UUID
    });
    assert.equal(identity.customerId, CUSTOMER_UUID);

    const field = m4.createCustomFieldDefinitionContract({
      config: { controlled: true },
      fieldKey: "journey.stage",
      id: FIELD_UUID,
      isRequired: false,
      label: "Journey stage",
      orgId: ORG_UUID,
      status: "active",
      tenantId: TENANT_UUID,
      valueType: "text"
    });
    assert.equal(field.valueType, "text");

    const value = m4.createCustomerFieldValueContract({
      customerId: CUSTOMER_UUID,
      fieldDefinitionId: FIELD_UUID,
      id: VALUE_UUID,
      orgId: ORG_UUID,
      tenantId: TENANT_UUID,
      updatedByUserId: USER_UUID,
      value: { controlledValueRef: "controlled://field/value" }
    });
    assert.equal(value.updatedByUserId, USER_UUID);

    const tag = m4.createTagDefinitionContract({
      colorToken: "status-warning",
      id: TAG_UUID,
      label: "Needs review",
      orgId: ORG_UUID,
      status: "active",
      tagKey: "needs-review",
      targetKind: "customer",
      tenantId: TENANT_UUID
    });
    assert.equal(tag.targetKind, "customer");

    const assignment = m4.createTagAssignmentContract({
      assignedByUserId: USER_UUID,
      customerId: CUSTOMER_UUID,
      id: ASSIGNMENT_UUID,
      orgId: ORG_UUID,
      tagDefinitionId: TAG_UUID,
      tenantId: TENANT_UUID
    });
    assert.equal(assignment.tagDefinitionId, TAG_UUID);

    assert.throws(
      () => m4.createCustomerContract({ ...customer, orgId: "org-1" }),
      /customer orgId must be a UUID/
    );
    assert.throws(
      () =>
        m4.createCustomerContract({
          ...customer,
          unresolvedIssueCount: -1
        }),
      /unresolvedIssueCount must be an integer from 0/
    );
    assert.throws(
      () => m4.createCustomerIdentityContract({ ...identity, status: "blocked" }),
      /customer identity status is invalid/
    );
    assert.throws(
      () => m4.createCustomerFieldValueContract({ ...value, value: "raw string" }),
      /customer field value must be an object/
    );
    assert.throws(
      () => m4.createTagDefinitionContract({ ...tag, targetKind: "conversation" }),
      /tag targetKind is invalid/
    );
  });

  it("does not introduce order import snapshot or API connector tables", () => {
    for (const forbidden of [
      /model OrderConnector/,
      /model OrderSnapshot/,
      /model OrderQueryLog/,
      /model ImportJob/,
      /model ImportRowError/,
      /create table if not exists order_connector/,
      /create table if not exists order_snapshot/,
      /create table if not exists order_query_log/,
      /create table if not exists import_job/,
      /create table if not exists import_row_error/
    ]) {
      assert.doesNotMatch(schema, forbidden);
      assert.doesNotMatch(migration, forbidden);
    }
  });

  it("records scope and redaction boundaries in M4 docs", () => {
    assert.match(spec, /no order\/import\/API tables/);
    assert.match(spec, /no raw samples\/customer data/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(evidence, /no order runtime or connector table/);
  });
});

const m4CustomerTables = [
  "customer",
  "customer_identity",
  "custom_field_definition",
  "customer_field_value",
  "tag_definition",
  "tag_assignment"
];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importTypescriptSource(relativePath) {
  const moduleText = transpileM4Contract(relativePath);
  return import(asDataUrl(moduleText));
}

function transpileM4Contract(relativePath) {
  return ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  }).outputText;
}

function asDataUrl(outputText) {
  const encoded = Buffer.from(outputText).toString("base64");
  return `data:text/javascript;base64,${encoded}`;
}

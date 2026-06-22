import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { URLSearchParams } from "node:url";

import ts from "typescript";

const repoRoot = process.cwd();
const source = read("apps/admin/src/customerAssetApiClient.ts");
const entrySource = read("apps/admin/src/main.tsx");
const spec = read("docs/specs/M4-15-admin-customer-asset-api-client-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-15-admin-customer-asset-api-client-contract.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const clientModule = await loadCustomerAssetClientModule();

describe("M4-15 admin customer asset API client contract", () => {
  it("calls M4 customer asset API paths with an explicit fetcher", async () => {
    const { calls, fetcher } = scriptedCustomerFetcher([
      { payload: { items: [customerSummary()] } },
      { payload: { item: customerDetail() } },
      { payload: { items: [fieldDefinition()] } },
      { payload: { items: [tagDefinition()] } },
      { payload: restorePayload() }
    ]);
    const client = clientModule.createCustomerAssetApiClient({
      basePath: "/customer-assets",
      fetcher
    });

    const customers = await client.listCustomers({
      flag: "blacklisted",
      tagKey: "needs-review"
    });
    const detail = await client.getCustomerDetail("customer/a");
    const fields = await client.listFieldDefinitions();
    const tags = await client.listTagDefinitions();
    const restored = await client.restoreCustomer("customer/a", {
      reasonRef: "reason://customer/manual-review",
      restoreBlacklisted: true
    });

    assert.equal(customers[0].id, "customer-a");
    assert.equal(detail.identities[0].externalSubjectRef, "identity://controlled/a");
    assert.equal(fields[0].fieldKey, "journey.stage");
    assert.equal(tags[0].tagKey, "needs-review");
    assert.deepEqual(restored.auditDraft.restoredFlags, ["blacklisted"]);
    assert.equal(calls[0].input.split("?")[0], "/customer-assets/customers");
    const query = new URLSearchParams(calls[0].input.split("?")[1]);
    assert.equal(query.get("flag"), "blacklisted");
    assert.equal(query.get("tagKey"), "needs-review");
    assert.deepEqual(calls[0].init, { method: "GET" });
    assert.equal(calls[1].input, "/customer-assets/customers/customer%2Fa");
    assert.equal(calls[2].input, "/customer-assets/field-definitions");
    assert.equal(calls[3].input, "/customer-assets/tag-definitions");
    assert.equal(calls[4].input, "/customer-assets/customers/customer%2Fa/restore");
    assert.deepEqual(calls[4].init, {
      body: JSON.stringify({
        reasonRef: "reason://customer/manual-review",
        restoreBlacklisted: true
      }),
      headers: { "content-type": "application/json" },
      method: "POST"
    });
  });

  it("fails closed for restore request and audit response shape", async () => {
    const client = clientModule.createCustomerAssetApiClient({
      fetcher: scriptedCustomerFetcher([{ payload: restorePayload(["blocked"]) }])
        .fetcher
    });
    await assert.rejects(
      () =>
        clientModule
          .createCustomerAssetApiClient({
            fetcher: scriptedCustomerFetcher([]).fetcher
          })
          .restoreCustomer("customer/a", {
            reasonRef: "reason://customer/manual-review"
          }),
      /restore flag is required/
    );
    await assert.rejects(
      () =>
        client.restoreCustomer("customer/a", {
          reasonRef: "reason://customer/manual-review",
          restoreBlacklisted: true
        }),
      /restored flag is invalid/
    );
  });

  it("rejects bad HTTP responses, malformed payloads and unsafe base paths", async () => {
    const failed = clientModule.createCustomerAssetApiClient({
      fetcher: scriptedCustomerFetcher([{ ok: false, payload: {}, status: 500 }])
        .fetcher
    });
    await assert.rejects(() => failed.listCustomers(), /status 500/);

    const malformed = clientModule.createCustomerAssetApiClient({
      fetcher: scriptedCustomerFetcher([{ payload: { items: [{ id: "customer-a" }] } }])
        .fetcher
    });
    await assert.rejects(() => malformed.listCustomers(), /isBlacklisted/);

    assert.throws(
      () =>
        clientModule.createCustomerAssetApiClient({
          basePath: "https://example.invalid",
          fetcher: scriptedCustomerFetcher([]).fetcher
        }),
      /basePath must be relative/
    );
    assert.throws(
      () =>
        clientModule.createCustomerAssetApiClient({
          basePath: "//example.invalid/customer-assets",
          fetcher: scriptedCustomerFetcher([]).fetcher
        }),
      /basePath must be relative/
    );
    assert.throws(
      () => clientModule.createCustomerAssetApiClient({ fetcher: undefined }),
      /fetcher is required/
    );
  });

  it("records M4-15 scope without backend imports or runtime connectors", () => {
    assert.match(source, /createCustomerAssetApiClient/);
    assert.match(entrySource, /createCustomerAssetApiClient/);
    assert.match(spec, /admin-to-API bridge foundation/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-15 admin customer asset API client contract/);
    assert.doesNotMatch(
      source,
      /from\s+["'].*(?:apps\/api|packages\/db|packages\/capabilities|@uzmax\/api|@uzmax\/db)["']|order_connector|process\.env|globalThis\.fetch|\bfetch\(|https?:\/\//i
    );
    assert.doesNotMatch(
      entrySource,
      /from\s+["'].*(?:apps\/api|packages\/db|packages\/capabilities|@uzmax\/api|@uzmax\/db)["']/i
    );
  });
});

function scriptedCustomerFetcher(responses) {
  const queue = [...responses];
  const calls = [];
  async function fetcher(input, init) {
    calls.push({ init, input });
    const response = queue.shift() ?? { payload: {} };
    return {
      json: async () => response.payload,
      ok: response.ok ?? true,
      status: response.status ?? 200
    };
  }
  return { calls, fetcher };
}

async function loadCustomerAssetClientModule() {
  const outputText = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  const moduleHref = `data:text/javascript;base64,${Buffer.from(
    outputText,
    "utf8"
  ).toString("base64")}`;
  return import(moduleHref);
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function customerSummary() {
  return {
    displayLabelRef: "controlled://customer/a",
    id: "customer-a",
    isBlacklisted: true,
    isUnreachable: false,
    journeyStage: "stage://journey/review",
    preferredLanguage: "uz",
    preferredScript: "latin",
    relatedRefs: { orderSnapshotRefs: ["order-snapshot://controlled/a"] },
    status: "active",
    unresolvedIssueCount: 1
  };
}

function customerDetail() {
  return {
    customer: customerSummary(),
    fields: [
      {
        customerId: "customer-a",
        definition: fieldDefinition(),
        fieldDefinitionId: "field-a",
        id: "field-value-a",
        value: { controlledValueRef: "controlled://field/a" }
      }
    ],
    identities: [
      {
        customerId: "customer-a",
        externalSubjectRef: "identity://controlled/a",
        id: "identity-a",
        identityKind: "channel_subject",
        provider: "telegram_bot",
        status: "active"
      }
    ],
    relatedRefs: { orderSnapshotRefs: ["order-snapshot://controlled/a"] },
    tags: [
      {
        customerId: "customer-a",
        definition: tagDefinition(),
        id: "tag-assignment-a",
        tagDefinitionId: "tag-a"
      }
    ]
  };
}

function fieldDefinition() {
  return {
    fieldKey: "journey.stage",
    id: "field-a",
    label: "Journey stage",
    status: "active",
    valueType: "text"
  };
}

function tagDefinition() {
  return {
    colorToken: "status-warning",
    id: "tag-a",
    label: "Needs review",
    status: "active",
    tagKey: "needs-review",
    targetKind: "customer"
  };
}

function restorePayload(restoredFlags = ["blacklisted"]) {
  return {
    auditDraft: {
      action: "customer_restore_flags",
      actorUserId: "user-a",
      customerId: "customer-a",
      reasonRef: "reason://customer/manual-review",
      restoredFlags
    },
    item: { ...customerSummary(), isBlacklisted: false }
  };
}

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const USER_A = "44444444-4444-4444-8444-444444444444";
const apiServiceSource = read("apps/api/src/order-import.service.ts");
const adminClientSource = read("apps/admin/src/orderImportApiClient.ts");
const spec = read("docs/specs/M4-21-order-import-runtime-warning-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-21-order-import-runtime-warning-contract.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const contracts = read("docs/contracts/README.md");
const apiCompilerOptions = {
  emitDecoratorMetadata: false,
  experimentalDecorators: true,
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2023
};
const api = await importOrderImportApiSource();
const adminClient = await importAdminClientSource();

describe("M4-21 order import runtime warning contract", () => {
  it("adds runtimeWarning to stale and missing API results but not fresh snapshots", async () => {
    const service = new api.module.OrderImportService(
      new api.module.InMemoryOrderImportRepository()
    );
    const accessContext = contextFor(TENANT_A, ["order:read"]);

    const fresh = await service.searchSnapshot(accessContext, {
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/fresh-a"
    });
    assert.equal(fresh.status, "snapshot_ready");
    assert.equal("runtimeWarning" in fresh, false);

    const stale = await service.searchSnapshot(accessContext, {
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/stale-a"
    });
    assert.equal(stale.status, "handoff_required");
    assert.deepEqual(stale.runtimeWarning, {
      code: "order_snapshot_stale",
      expiresAt: "2026-06-21T00:00:00.000Z",
      handoffRequired: true,
      messageRef: "reason://order-read/snapshot-stale",
      sourceUpdatedAt: "2026-06-20T00:00:00.000Z",
      staleSnapshotUsed: true
    });
    assert.doesNotMatch(JSON.stringify(stale), /orderStatusRef/);

    const missing = await service.searchSnapshot(accessContext, {
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/missing-a"
    });
    assert.equal(missing.reasonCode, "order_snapshot_missing");
    assert.equal(missing.runtimeWarning.code, "order_snapshot_missing");
    assert.equal(missing.runtimeWarning.handoffRequired, true);
    assert.equal(
      missing.runtimeWarning.messageRef,
      "reason://order-read/snapshot-missing"
    );
    assert.equal(missing.runtimeWarning.staleSnapshotUsed, false);
  });

  it("admin client accepts handoff results only with a matching runtime warning", async () => {
    const client = adminClient.createOrderImportApiClient({
      fetcher: fetcherFrom([
        {
          payload: staleHandoffPayload()
        }
      ]).fetcher
    });

    const result = await client.searchSnapshot({ queryRef: "query://order/stale-a" });
    assert.equal(result.status, "handoff_required");
    assert.equal(result.runtimeWarning.code, "order_snapshot_stale");
    assert.equal(result.runtimeWarning.staleSnapshotUsed, true);
    assert.equal(result.runtimeWarning.handoffRequired, true);
  });

  it("admin client rejects missing, mismatched or misplaced runtime warnings", async () => {
    await assert.rejects(
      () =>
        adminClient
          .createOrderImportApiClient({
            fetcher: fetcherFrom([
              {
                payload: withoutKey(staleHandoffPayload(), "runtimeWarning")
              }
            ]).fetcher
          })
          .searchSnapshot({ queryRef: "query://order/stale-a" }),
      /runtimeWarning must be an object/
    );

    await assert.rejects(
      () =>
        adminClient
          .createOrderImportApiClient({
            fetcher: fetcherFrom([
              {
                payload: {
                  ...staleHandoffPayload(),
                  runtimeWarning: {
                    ...staleHandoffPayload().runtimeWarning,
                    code: "order_snapshot_missing"
                  }
                }
              }
            ]).fetcher
          })
          .searchSnapshot({ queryRef: "query://order/stale-a" }),
      /runtimeWarning code must match reasonCode/
    );

    await assert.rejects(
      () =>
        adminClient
          .createOrderImportApiClient({
            fetcher: fetcherFrom([
              {
                payload: {
                  ...staleHandoffPayload(),
                  customerVisible: {
                    ...staleHandoffPayload().customerVisible,
                    warningCode: "order_snapshot_missing"
                  }
                }
              }
            ]).fetcher
          })
          .searchSnapshot({ queryRef: "query://order/stale-a" }),
      /runtimeWarning code must match customerVisible warningCode/
    );

    await assert.rejects(
      () =>
        adminClient
          .createOrderImportApiClient({
            fetcher: fetcherFrom([
              {
                payload: {
                  ...staleHandoffPayload(),
                  runtimeWarning: {
                    ...staleHandoffPayload().runtimeWarning,
                    staleSnapshotUsed: false
                  }
                }
              }
            ]).fetcher
          })
          .searchSnapshot({ queryRef: "query://order/stale-a" }),
      /runtimeWarning staleSnapshotUsed must match queryLogDraft/
    );

    await assert.rejects(
      () =>
        adminClient
          .createOrderImportApiClient({
            fetcher: fetcherFrom([
              {
                payload: {
                  ...staleHandoffPayload(),
                  queryLogDraft: {
                    ...staleHandoffPayload().queryLogDraft,
                    handoffRequired: false
                  }
                }
              }
            ]).fetcher
          })
          .searchSnapshot({ queryRef: "query://order/stale-a" }),
      /handoff queryLogDraft must require handoff/
    );

    await assert.rejects(
      () =>
        adminClient
          .createOrderImportApiClient({
            fetcher: fetcherFrom([
              {
                payload: {
                  ...staleHandoffPayload(),
                  queryLogDraft: {
                    ...staleHandoffPayload().queryLogDraft,
                    reasonRef: "reason://order-read/snapshot-missing"
                  }
                }
              }
            ]).fetcher
          })
          .searchSnapshot({ queryRef: "query://order/stale-a" }),
      /runtimeWarning messageRef must match queryLogDraft reasonRef/
    );

    await assert.rejects(
      () =>
        adminClient
          .createOrderImportApiClient({
            fetcher: fetcherFrom([
              {
                payload: {
                  customerVisible: { orderStatusRef: "status://order/in-transit" },
                  handoff: { required: false },
                  queryLogDraft: { outcome: "hit", staleSnapshotUsed: false },
                  runtimeWarning: staleHandoffPayload().runtimeWarning,
                  status: "snapshot_ready"
                }
              }
            ]).fetcher
          })
          .searchSnapshot({ queryRef: "query://order/fresh-a" }),
      /snapshot_ready result must not include runtimeWarning/
    );
  });

  it("records M4-21 scope without API connectors, raw data or release claims", () => {
    assert.match(apiServiceSource, /runtimeWarning/);
    assert.match(adminClientSource, /runtimeWarningPayload/);
    assert.match(spec, /runtime warning contract/);
    assert.match(evidence, /root_untracked_duplicate_docs_block_full_local_preflight/);
    assert.match(m4Index, /M4-21 order import runtime warning contract/);
    assert.match(contracts, /M4 Order Import Runtime Warning Contract/);
    assert.doesNotMatch(
      `${apiServiceSource}\n${adminClientSource}`,
      /order_connector|process\.env|globalThis\.fetch|https?:\/\//i
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

function staleHandoffPayload() {
  return {
    customerVisible: {
      expiresAt: "2026-06-22T11:00:00.000Z",
      sourceUpdatedAt: "2026-06-22T09:00:00.000Z",
      warningCode: "order_snapshot_stale"
    },
    handoff: { required: true },
    queryLogDraft: {
      handoffRequired: true,
      outcome: "stale",
      reasonRef: "reason://order-read/snapshot-stale",
      staleSnapshotUsed: true
    },
    reasonCode: "order_snapshot_stale",
    runtimeWarning: {
      code: "order_snapshot_stale",
      expiresAt: "2026-06-22T11:00:00.000Z",
      handoffRequired: true,
      messageRef: "reason://order-read/snapshot-stale",
      sourceUpdatedAt: "2026-06-22T09:00:00.000Z",
      staleSnapshotUsed: true
    },
    status: "handoff_required"
  };
}

function withoutKey(source, key) {
  const copy = { ...source };
  delete copy[key];
  return copy;
}

function fetcherFrom(responses) {
  let index = 0;
  return {
    fetcher: async () => {
      const response = responses[index++] ?? { payload: {} };
      return {
        json: async () => response.payload,
        ok: response.ok ?? true,
        status: response.status ?? 200
      };
    }
  };
}

async function importOrderImportApiSource() {
  const authzUrl = moduleUrlFromTs(read("packages/authz/src/index.ts"));
  const dbUrl = moduleUrlFromTs(read("packages/db/src/index.ts"));
  const orderReadUrl = moduleUrlFromTs(
    read("packages/capabilities/order-read/src/index.ts")
  );
  const typesModuleUrl = moduleUrlFromTs(
    rewriteImports(read("apps/api/src/order-import.types.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl,
      "../../../packages/capabilities/order-read/src/index.ts": orderReadUrl
    })
  );
  const defaultsModuleUrl = moduleUrlFromTs(
    rewriteImports(read("apps/api/src/order-import.defaults.ts"), {
      "./order-import.types.ts": typesModuleUrl
    })
  );
  const repositoryModuleUrl = moduleUrlFromTs(
    rewriteImports(read("apps/api/src/order-import.repository.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl,
      "../../../packages/db/src/index.ts": dbUrl,
      "./order-import.defaults.ts": defaultsModuleUrl,
      "./order-import.types.ts": typesModuleUrl
    })
  );
  const serviceModuleUrl = moduleUrlFromTs(
    rewriteImports(read("apps/api/src/order-import.service.ts"), {
      "../../../packages/authz/src/index.ts": authzUrl,
      "../../../packages/capabilities/order-read/src/index.ts": orderReadUrl,
      "./order-import.repository.ts": repositoryModuleUrl,
      "./order-import.types.ts": typesModuleUrl,
      "@nestjs/common": nestCommonStubUrl()
    })
  );
  return {
    module: {
      ...(await import(repositoryModuleUrl)),
      ...(await import(serviceModuleUrl))
    },
    moduleUrl: serviceModuleUrl
  };
}

async function importAdminClientSource() {
  return import(moduleUrlFromTs(adminClientSource));
}

function read(relativePath) {
  const sourcePath = path.resolve(repoRoot, relativePath);
  assert.ok(existsSync(sourcePath), `missing ${relativePath}`);
  return readFileSync(sourcePath, "utf8");
}

function rewriteImports(sourceText, replacements) {
  return Object.entries(replacements).reduce(
    (updated, [from, to]) => updated.replaceAll(from, to),
    sourceText
  );
}

function moduleUrlFromTs(sourceText) {
  const outputText = ts.transpileModule(sourceText, {
    compilerOptions: apiCompilerOptions
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

function nestCommonStubUrl() {
  return `data:text/javascript,${encodeURIComponent(
    "const d=()=>()=>undefined;export const Inject=d;export const Injectable=d;"
  )}`;
}

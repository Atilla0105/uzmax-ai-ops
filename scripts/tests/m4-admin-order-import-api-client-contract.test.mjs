import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { URLSearchParams } from "node:url";

import ts from "typescript";

const repoRoot = process.cwd();
const source = read("apps/admin/src/orderImportApiClient.ts");
const shellSource = read("apps/admin/src/M4OrderPathStatusShell.tsx");
const spec = read("docs/specs/M4-13-admin-order-import-api-client-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-13-admin-order-import-api-client-contract.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const clientModule = await importAdminClientSource();

describe("M4-13 admin order import API client contract", () => {
  it("calls M4 order import API paths with an explicit fetcher", async () => {
    const { calls, fetcher } = fetcherFrom([
      {
        payload: {
          items: [
            {
              failedRows: 1,
              id: "job-a",
              sourceRef: "storage://order-imports/job-a",
              status: "completed_with_errors",
              successfulRows: 2,
              totalRows: 3
            }
          ]
        }
      },
      {
        payload: {
          items: [
            {
              errorCode: "order_status_ref_required",
              id: "row-error-a",
              importJobId: "job/a",
              messageRef: "reason://order-import/order-status-ref-required",
              rowNumber: 3
            }
          ]
        }
      },
      {
        payload: {
          customerVisible: { orderStatusRef: "status://order/in-transit" },
          handoff: { required: false },
          queryLogDraft: { outcome: "hit" },
          status: "snapshot_ready"
        }
      }
    ]);
    const client = clientModule.createOrderImportApiClient({
      basePath: "/order-import",
      fetcher
    });

    const jobs = await client.listImportJobs();
    const rowErrors = await client.listImportRowErrors("job/a");
    const snapshot = await client.searchSnapshot({
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/fresh-a"
    });

    assert.equal(jobs[0].id, "job-a");
    assert.equal(rowErrors[0].rowNumber, 3);
    assert.equal(snapshot.status, "snapshot_ready");
    assert.equal(calls[0].input, "/order-import/jobs");
    assert.deepEqual(calls[0].init, { method: "GET" });
    assert.equal(calls[1].input, "/order-import/jobs/job%2Fa/errors");
    assert.equal(calls[2].input.split("?")[0], "/order-import/snapshots/search");
    const query = new URLSearchParams(calls[2].input.split("?")[1]);
    assert.equal(query.get("queryKind"), "order_ref");
    assert.equal(query.get("queryRef"), "query://order/fresh-a");
    assert.equal(query.get("now"), "2026-06-22T12:00:00.000Z");
  });

  it("fails closed for handoff responses that expose status refs", async () => {
    const leaked = clientModule.createOrderImportApiClient({
      fetcher: fetcherFrom([
        {
          payload: {
            customerVisible: { orderStatusRef: "status://order/in-transit" },
            handoff: { required: true },
            queryLogDraft: { outcome: "handoff" },
            status: "handoff_required"
          }
        }
      ]).fetcher
    });
    await assert.rejects(
      () => leaked.searchSnapshot({ queryRef: "query://order/stale-a" }),
      /handoff result must not expose orderStatusRef/
    );

    const nonHandoff = clientModule.createOrderImportApiClient({
      fetcher: fetcherFrom([
        {
          payload: {
            customerVisible: {},
            handoff: { required: false },
            queryLogDraft: { outcome: "miss" },
            status: "handoff_required"
          }
        }
      ]).fetcher
    });
    await assert.rejects(
      () => nonHandoff.searchSnapshot({ queryRef: "query://order/missing-a" }),
      /handoff result must require handoff/
    );
  });

  it("rejects bad HTTP responses and malformed payloads", async () => {
    const failed = clientModule.createOrderImportApiClient({
      fetcher: fetcherFrom([{ ok: false, payload: {}, status: 500 }]).fetcher
    });
    await assert.rejects(() => failed.listImportJobs(), /status 500/);

    const malformed = clientModule.createOrderImportApiClient({
      fetcher: fetcherFrom([{ payload: { items: [{ id: "job-a" }] } }]).fetcher
    });
    await assert.rejects(() => malformed.listImportJobs(), /failedRows/);

    assert.throws(
      () =>
        clientModule.createOrderImportApiClient({
          basePath: "https://example.invalid",
          fetcher: fetcherFrom([]).fetcher
        }),
      /basePath must be relative/
    );
    assert.throws(
      () =>
        clientModule.createOrderImportApiClient({
          basePath: "//example.invalid/order-import",
          fetcher: fetcherFrom([]).fetcher
        }),
      /basePath must be relative/
    );
    assert.throws(
      () => clientModule.createOrderImportApiClient({ fetcher: undefined }),
      /fetcher is required/
    );
  });

  it("records M4-13 scope without backend imports or runtime connectors", () => {
    assert.match(source, /createOrderImportApiClient/);
    assert.match(shellSource, /createOrderImportApiClient/);
    assert.match(spec, /admin-to-API bridge foundation/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-13 admin order import API client contract/);
    assert.doesNotMatch(
      source,
      /from\s+["'].*(?:apps\/api|packages\/db|packages\/capabilities|@uzmax\/api|@uzmax\/db)["']|order_connector|process\.env|globalThis\.fetch|\bfetch\(|https?:\/\//i
    );
    assert.doesNotMatch(
      shellSource,
      /from\s+["'].*(?:apps\/api|packages\/db|packages\/capabilities|@uzmax\/api|@uzmax\/db)["']/i
    );
  });
});

function fetcherFrom(responses) {
  const calls = [];
  let index = 0;
  return {
    calls,
    fetcher: async (input, init) => {
      calls.push({ init, input });
      const response = responses[index++] ?? { payload: {} };
      return {
        json: async () => response.payload,
        ok: response.ok ?? true,
        status: response.status ?? 200
      };
    }
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importAdminClientSource() {
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

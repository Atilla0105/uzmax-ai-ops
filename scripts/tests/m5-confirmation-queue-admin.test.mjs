import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { URLSearchParams } from "node:url";

import ts from "typescript";

const repoRoot = process.cwd();
const source = read("apps/admin/src/confirmationQueueApiClient.ts");
const shellSource = read("apps/admin/src/M5ConfirmationQueueShell.tsx");
const runtimeSource = read("apps/admin/src/m5ConfirmationQueueRuntime.ts");
const appSource = read("apps/admin/src/App.tsx");
const playwrightSpec = read("apps/admin/tests/m5-confirmation-queue.spec.ts");
const spec = read("docs/specs/M5-04-confirmation-queue-admin.md");
const evidence = read("docs/evidence/M5/M5-04-confirmation-queue-admin.md");
const m5Index = read("docs/evidence/M5/README.md");
const clientModule = await importAdminClientSource();

describe("M5-04 confirmation queue admin", () => {
  it("calls M5-03 confirmation queue API paths with an explicit fetcher", async () => {
    const { calls, fetcher } = scriptedQueueResponses([
      { payload: { items: [queueItem()] } },
      { payload: { item: conflictItem() } },
      { payload: decisionPayload("edited") }
    ]);
    const client = clientModule.createConfirmationQueueApiClient({
      basePath: "/confirmation-queue",
      fetcher
    });

    const items = await client.listItems({
      kind: "knowledge_candidate",
      status: "pending"
    });
    const detail = await client.getItem("item/a");
    const decision = await client.submitDecision("item/a", {
      action: "edit",
      editedPayload: { summaryRef: "controlled://candidate/edited-summary" },
      reasonRef: "controlled://confirmation/reason/edit"
    });

    assert.equal(items[0].id, "item-a");
    assert.equal(detail.diffPayload.left.ref, "controlled://kb/current");
    assert.equal(decision.formalWrite, false);
    assert.equal(calls[0].input.split("?")[0], "/confirmation-queue/items");
    const query = new URLSearchParams(calls[0].input.split("?")[1]);
    assert.equal(query.get("kind"), "knowledge_candidate");
    assert.equal(query.get("status"), "pending");
    assert.deepEqual(calls[0].init, { method: "GET" });
    assert.equal(calls[1].input, "/confirmation-queue/items/item%2Fa");
    assert.equal(calls[2].input, "/confirmation-queue/items/item%2Fa/decisions");
    assert.deepEqual(JSON.parse(calls[2].init.body), {
      action: "edit",
      editedPayload: { summaryRef: "controlled://candidate/edited-summary" },
      reasonRef: "controlled://confirmation/reason/edit"
    });
  });

  it("fails closed for malformed responses, mismatched formal writes and unsafe payloads", async () => {
    await assert.rejects(
      () =>
        clientModule
          .createConfirmationQueueApiClient({
            fetcher: scriptedQueueResponses([
              { payload: { items: [queueItem({ prompt: "x" })] } }
            ]).fetcher
          })
          .listItems(),
      /candidatePayload\.prompt is a forbidden raw payload key/
    );
    await assert.rejects(
      () =>
        clientModule
          .createConfirmationQueueApiClient({
            fetcher: scriptedQueueResponses([
              { payload: { items: [queueItem({ summary: "customer private text" })] } }
            ]).fetcher
          })
          .listItems(),
      /candidatePayload\.summary must be a controlled ref/
    );
    await assert.rejects(
      () =>
        clientModule
          .createConfirmationQueueApiClient({
            fetcher: scriptedQueueResponses([
              { payload: { items: [conflictItem(false)] } }
            ]).fetcher
          })
          .listItems(),
      /conflict candidate requires diffPayload/
    );
    await assert.rejects(
      () =>
        clientModule
          .createConfirmationQueueApiClient({
            fetcher: scriptedQueueResponses([
              {
                payload: {
                  items: [
                    conflictItem(true, {
                      left: {},
                      right: { ref: "controlled://candidate/new" }
                    })
                  ]
                }
              }
            ]).fetcher
          })
          .listItems(),
      /diffPayload requires side-by-side refs/
    );
    assert.equal(
      (
        await clientModule
          .createConfirmationQueueApiClient({
            fetcher: scriptedQueueResponses([
              { payload: decisionPayload("approved", true) }
            ]).fetcher
          })
          .submitDecision("item/a", { action: "approve" })
      ).formalWrite,
      true
    );
    await assert.rejects(
      () =>
        clientModule
          .createConfirmationQueueApiClient({
            fetcher: scriptedQueueResponses([
              {
                payload: {
                  ...decisionPayload("approved", true),
                  auditDraft: {
                    ...decisionPayload("approved", true).auditDraft,
                    formalWrite: false
                  }
                }
              }
            ]).fetcher
          })
          .submitDecision("item/a", { action: "approve" }),
      /auditDraft\.formalWrite must match formalWrite/
    );
    await assert.rejects(
      () =>
        clientModule
          .createConfirmationQueueApiClient({
            fetcher: scriptedQueueResponses([]).fetcher
          })
          .submitDecision("item/a", {
            action: "edit",
            editedPayload: { summary: "inline text" }
          }),
      /editedPayload\.summary must be a controlled ref field/
    );
    assert.throws(
      () =>
        clientModule.createConfirmationQueueApiClient({
          basePath: "//example.invalid/confirmation-queue",
          fetcher: scriptedQueueResponses([]).fetcher
        }),
      /basePath must be relative/
    );
    assert.throws(
      () => clientModule.createConfirmationQueueApiClient({ fetcher: undefined }),
      /fetcher is required/
    );
  });

  it("records scope and source boundaries without backend imports or runtime fetches", () => {
    assert.match(source, /createConfirmationQueueApiClient/);
    assert.match(source, /\/confirmation-queue/);
    assert.match(runtimeSource, /createConfirmationQueueApiClient/);
    assert.match(shellSource, /listRuntimeQueueCards/);
    assert.match(appSource, /M5ConfirmationQueueShell/);
    assert.match(playwrightSpec, /M5-04 confirmation queue/);
    assert.match(
      `${spec}\n${evidence}\n${m5Index}`,
      /(?=.*M5-04 Confirmation Queue Admin)(?=.*changed source files <= 4, net source LOC <= 600)(?=.*admin_ui_supported_not_closed)(?=.*M5-04 Confirmation Queue Admin Evidence)(?=.*No Sensitive Data Statement)(?=.*m5_04_confirmation_queue_admin_recorded__not_accepted)/s
    );
    assert.doesNotMatch(
      `${source}\n${shellSource}\n${appSource}`,
      /from\s+["'].*(?:apps\/api|packages\/db|packages\/distill|packages\/capabilities|@uzmax\/api|@uzmax\/db)["']|process\.env|globalThis\.fetch|\bfetch\(/i
    );
  });
});

function scriptedQueueResponses(responses) {
  const calls = [];
  const queue = [...responses];
  return {
    calls,
    fetcher: async (input, init) => {
      calls.push({ init, input });
      const response = queue.shift() ?? { payload: {} };
      return {
        json: async () => response.payload,
        ok: response.ok ?? true,
        status: response.status ?? 200
      };
    }
  };
}

function queueItem(candidatePayload = {}) {
  return {
    candidatePayload: {
      candidateRef: "controlled://candidate/item-a",
      summaryRef: "controlled://candidate-summary/item-a",
      ...candidatePayload
    },
    confidenceBps: 9200,
    createdAt: "2026-06-24T10:00:00.000Z",
    id: "item-a",
    kind: "knowledge_candidate",
    metadata: { sourceRef: "controlled://metadata/source-a" },
    orgId: "org-a",
    sourceRef: "controlled://distill/source-a",
    status: "pending",
    targetRef: "controlled://target/item-a",
    tenantId: "tenant-a"
  };
}

function conflictItem(withDiff = true, diffPayload = sideBySideDiff()) {
  return {
    ...queueItem(),
    diffPayload: withDiff ? diffPayload : undefined,
    id: "conflict-a",
    kind: "conflict_candidate"
  };
}

function sideBySideDiff() {
  return {
    left: { ref: "controlled://kb/current" },
    right: { ref: "controlled://candidate/new" },
    summaryRef: "controlled://diff/conflict"
  };
}

function decisionPayload(status, formalWrite = false) {
  return {
    auditDraft: {
      action: status === "edited" ? "edit" : "approve",
      auditRef: "controlled://confirmation-queue/audit/item-a",
      formalWrite,
      itemId: "item-a",
      reviewedAt: "2026-06-24T10:10:00.000Z",
      reviewerUserId: "user-a"
    },
    formalWrite,
    item: { ...queueItem(), status }
  };
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importAdminClientSource() {
  const outputText = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  const encodedModule = Buffer.from(outputText, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encodedModule}`);
}

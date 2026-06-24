import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const contractSource = readProjectFile("apps/admin/src/templateCenterContracts.ts");
const shellSource = readProjectFile("apps/admin/src/M5TemplateCenterShell.tsx");
const appSource = readProjectFile("apps/admin/src/App.tsx");
const playwrightSpec = readProjectFile("apps/admin/tests/m5-template-center.spec.ts");
const spec = readProjectFile("docs/specs/M5-07-template-center.md");
const evidence = readProjectFile("docs/evidence/M5/M5-07-template-center.md");
const incident = readProjectFile(
  "docs/incidents/INC-2026-06-24-m5-07-root-patch-target.md"
);
const m5Index = readProjectFile("docs/evidence/M5/README.md");
const contracts = await importContracts();

describe("M5-07 template center", () => {
  it("exposes the template kinds and local cards", () => {
    assert.deepEqual(contracts.templateCenterKinds, [
      "knowledge",
      "ai_member",
      "config",
      "eval",
      "quick_reply"
    ]);
    for (const title of [
      "Transit starter pack",
      "Operations AI baseline",
      "SLA and fuse defaults",
      "Redline launch pack",
      "Human handoff replies"
    ]) {
      assert.ok(contracts.templateCenterCards.some((card) => card.title === title));
    }
  });

  it("creates copy drafts without formal tenant writes or auto-overwrite", () => {
    const draft = contracts.createTemplateCopyDraft({
      sourceTemplateRef: "controlled://template/knowledge",
      targetTenantRef: "controlled://tenant/current",
      templateKind: "knowledge",
      tenantVersionRef: "controlled://tenant-version/knowledge"
    });
    assert.equal(draft.action, "copy_to_tenant");
    assert.equal(draft.formalTenantWrite, false);
    assert.equal(draft.templateAutoOverwrite, false);
    assert.equal(draft.requiresOwnerConfirmation, true);
    assert.equal(draft.tenantVersionRef, "controlled://tenant-version/knowledge");
  });

  it("fails closed for unsafe kinds, refs and payload fields", () => {
    assert.throws(
      () =>
        contracts.createTemplateCopyDraft({
          sourceTemplateRef: "controlled://template/knowledge",
          targetTenantRef: "controlled://tenant/current",
          templateKind: "marketing",
          tenantVersionRef: "controlled://tenant-version/knowledge"
        }),
      /template kind is invalid/
    );
    assert.throws(
      () =>
        contracts.createTemplateCopyDraft({
          sourceTemplateRef: "https://example.invalid/template",
          targetTenantRef: "controlled://tenant/current",
          templateKind: "knowledge",
          tenantVersionRef: "controlled://tenant-version/knowledge"
        }),
      /sourceTemplateRef must not be a URL or inline payload/
    );
    for (const unsafeRef of [
      "controlled://template/customerProfile",
      "controlled://template/rawPayload",
      "controlled://template/secretRef",
      "controlled://template/orderStatus",
      "controlled://template/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    ]) {
      assert.throws(
        () =>
          contracts.createTemplateCopyDraft({
            sourceTemplateRef: unsafeRef,
            targetTenantRef: "controlled://tenant/current",
            templateKind: "knowledge",
            tenantVersionRef: "controlled://tenant-version/knowledge"
          }),
        /sourceTemplateRef must be a safe controlled ref/
      );
    }
    assert.throws(
      () =>
        contracts.createTemplateCopyDraft({
          sourceTemplateRef: "controlled://template/knowledge",
          targetTenantRef: "controlled://tenant/customerProfile",
          templateKind: "knowledge",
          tenantVersionRef: "controlled://tenant-version/knowledge"
        }),
      /targetTenantRef must be a safe controlled ref/
    );
    assert.throws(
      () =>
        contracts.createTemplateCopyDraft({
          sourceTemplateRef: "controlled://template/knowledge",
          targetTenantRef: "controlled://tenant/current",
          templateKind: "knowledge",
          tenantVersionRef: "controlled://tenant-version/rawPayload"
        }),
      /tenantVersionRef must be a safe controlled ref/
    );
    assert.throws(
      () =>
        contracts.createTemplateCopyDraft({
          rawPayload: "inline text",
          sourceTemplateRef: "controlled://template/knowledge",
          targetTenantRef: "controlled://tenant/current",
          templateKind: "knowledge",
          tenantVersionRef: "controlled://tenant-version/knowledge"
        }),
      /rawPayload is a forbidden raw payload key/
    );
  });

  it("records scope and boundaries without backend imports or sensitive data", () => {
    assert.match(contractSource, /formalTenantWrite: false/);
    assert.match(shellSource, /M5TemplateCenterShell/);
    assert.match(appSource, /M5TemplateCenterShell/);
    assert.match(playwrightSpec, /M5-07 template center/);
    assert.match(incident, /M5-07 Root Patch Target/);
    assert.match(
      `${spec}\n${evidence}\n${m5Index}`,
      /(?=.*M5-07 Template Center)(?=.*changed source files <= 4, net source LOC <= 600)(?=.*frontend_local_contract_supported_not_closed)(?=.*m5_07_template_center_recorded__not_accepted)(?=.*No Sensitive Data Statement)/s
    );
    assert.doesNotMatch(
      `${contractSource}\n${shellSource}\n${appSource}`,
      /from\s+["'].*(?:apps\/api|apps\/worker|apps\/cron|packages\/db|packages\/ops-assets|packages\/distill|packages\/capabilities|packages\/engine|packages\/llm-gateway|packages\/evals|@uzmax\/api|@uzmax\/db)["']|process\.env|globalThis\.fetch|\bfetch\(|\bWebSocket\b|\bEventSource\b|\bXMLHttpRequest\b|navigator\.sendBeacon/i
    );
    assert.doesNotMatch(shellSource, /ORD-|PAY-|TG-|telegram payload|xlsx|@[\w_]+/i);
  });
});

function readProjectFile(relativePath) {
  return readFileSync(path.resolve(repoRoot, relativePath), { encoding: "utf8" });
}

async function importContracts() {
  const transpiledContract = ts.transpileModule(contractSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  const dataModule = Buffer.from(transpiledContract, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${dataModule}`);
}

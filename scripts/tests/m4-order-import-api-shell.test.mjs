import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, URL } from "node:url";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const TENANT_B = "33333333-3333-4333-8333-333333333333";
const USER_A = "44444444-4444-4444-8444-444444444444";
const source = read("apps/api/src/order-import.controller.ts");
const serviceSource = read("apps/api/src/order-import.service.ts");
const repositorySource = read("apps/api/src/order-import.repository.ts");
const appModule = read("apps/api/src/app.module.ts");
const spec = read("docs/specs/M4-07-order-import-api-shell.md");
const evidence = read("docs/evidence/M4/M4-07-order-import-api-shell.md");
const m4Index = read("docs/evidence/M4/README.md");
const api = await importOrderImportApiSource();

describe("M4-07 order import API shell", () => {
  it("registers a split Nest API shell without DB repository or connector claims", () => {
    assert.match(source, /@Controller\("order-import"\)/);
    assert.match(source, /@Get\("jobs"\)/);
    assert.match(source, /@Get\("jobs\/:jobId\/errors"\)/);
    assert.match(source, /@Get\("snapshots\/search"\)/);
    assert.match(appModule, /OrderImportController/);
    assert.match(appModule, /InMemoryOrderImportRepository/);
    for (const fileName of ["controller", "repository", "service", "types"]) {
      assert.ok(
        existsSync(path.resolve(repoRoot, `apps/api/src/order-import.${fileName}.ts`)),
        `missing split API file order-import.${fileName}.ts`
      );
    }
    assert.doesNotMatch(
      `${source}\n${serviceSource}\n${repositorySource}`,
      /order_connector/i
    );
    assert.doesNotMatch(
      `${source}\n${serviceSource}`,
      /process\.env|@uzmax\/db|packages\/db/i
    );
  });

  it("lists import jobs and row errors only in the selected tenant scope", async () => {
    const repository = new api.module.InMemoryOrderImportRepository({
      jobs: [job("job-a", TENANT_A), job("job-b", TENANT_B)],
      rowErrors: [
        rowError("row-error-a", "job-a", TENANT_A),
        rowError("row-error-b", "job-b", TENANT_B)
      ]
    });
    const service = new api.module.OrderImportService(repository);
    const tenantA = contextFor(TENANT_A, ["order:read"]);

    const jobs = await service.listImportJobs(tenantA);
    assert.deepEqual(
      jobs.items.map((item) => item.id),
      ["job-a"]
    );
    const errors = await service.listImportRowErrors(tenantA, "job-a");
    assert.deepEqual(
      errors.items.map((item) => item.id),
      ["row-error-a"]
    );
    await assert.rejects(
      () => service.listImportRowErrors(tenantA, "job-b"),
      /import job not found/
    );
    await assert.rejects(
      () => service.listImportJobs(contextFor(TENANT_A, [])),
      /permission is not granted/
    );
  });

  it("returns fresh, stale and missing snapshot decisions without fabrication", async () => {
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
    assert.equal(fresh.customerVisible.orderStatusRef, "status://order/in-transit");
    assert.equal(fresh.queryLogDraft.outcome, "hit");

    const stale = await service.searchSnapshot(accessContext, {
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/stale-a"
    });
    assert.equal(stale.status, "handoff_required");
    assert.equal(stale.reasonCode, "order_snapshot_stale");
    assert.equal(stale.queryLogDraft.staleSnapshotUsed, true);
    assert.doesNotMatch(JSON.stringify(stale.customerVisible), /orderStatusRef/);

    const missing = await service.searchSnapshot(accessContext, {
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/missing-a"
    });
    assert.equal(missing.status, "handoff_required");
    assert.equal(missing.reasonCode, "order_snapshot_missing");
    assert.doesNotMatch(JSON.stringify(missing), /invented|generated|llm/i);
  });

  it("maps controller validation, not found and access failures to HTTP statuses", async () => {
    const controller = new api.module.OrderImportController(
      new api.module.OrderImportService(new api.module.InMemoryOrderImportRepository())
    );
    const request = { accessContext: contextFor(TENANT_A, ["order:read"]) };

    await assertRejectsHttp(
      () => controller.searchSnapshot(request, {}),
      400,
      /queryRef is required/
    );
    await assertRejectsHttp(
      () =>
        controller.searchSnapshot(request, {
          queryKind: "not-a-kind",
          queryRef: "query://order/fresh-a"
        }),
      400,
      /order query kind is invalid/
    );
    await assertRejectsHttp(
      () => controller.listImportRowErrors(request, "missing-job"),
      404,
      /import job not found/
    );
    await assertRejectsHttp(
      () => controller.listImportJobs({ accessContext: contextFor(TENANT_A, []) }),
      403,
      /permission is not granted/
    );
    await assertRejectsHttp(
      () => controller.listImportJobs({}),
      403,
      /access context is required/
    );
  });

  it("records M4-07 scope and keeps raw data and runtime blockers visible", () => {
    assert.match(spec, /no-API 分支/);
    assert.match(spec, /不新增 `order_connector`/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(evidence, /no `order_connector`/);
    assert.match(m4Index, /M4-07 order import API shell/);
    assert.match(m4Index, /DB repository\/runtime wiring, worker integration/);
    assert.doesNotMatch(
      `${source}\n${serviceSource}\n${repositorySource}`,
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

function job(id, tenantId) {
  return {
    failedRows: id === "job-a" ? 1 : 0,
    id,
    orgId: ORG_ID,
    sourceRef: `storage://order-imports/${id}`,
    status: "completed_with_errors",
    successfulRows: 2,
    tenantId,
    totalRows: 3
  };
}

function rowError(id, importJobId, tenantId) {
  return {
    columnKey: "orderStatusRef",
    errorCode: "order_status_ref_required",
    id,
    importJobId,
    messageRef: "reason://order-import/order-status-ref-required",
    orgId: ORG_ID,
    rowNumber: 3,
    severity: "error",
    tenantId
  };
}

async function assertRejectsHttp(action, statusCode, messagePattern) {
  await assert.rejects(action, (error) => {
    assert.equal(error?.statusCode ?? error?.status, statusCode);
    assert.match(error?.message ?? "", messagePattern);
    return true;
  });
}

async function importOrderImportApiSource() {
  const tmpRoot = mkdtempSync(path.join(tmpdir(), "uzmax-m4-07-"));
  const writeTempModule = (fileName, sourceText) => {
    const destination = new URL(fileName, pathToFileURL(`${tmpRoot}/`));
    writeFileSync(destination, sourceText, "utf8");
    return destination.href;
  };
  const authz = await importTypescriptSource("packages/authz/src/index.ts");
  const db = await importTypescriptSource("packages/db/src/index.ts");
  const orderRead = await importTypescriptSource(
    "packages/capabilities/order-read/src/index.ts"
  );
  const nestCommon = createNestCommonStub(writeTempModule);
  const accessContext = writeTempModule(
    "access-context-stub.mjs",
    "export class ApiAccessContextGuard {}"
  );
  const typesModuleUrl = writeSource(writeTempModule, "order-import.types", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl,
    "../../../packages/capabilities/order-read/src/index.ts": orderRead.moduleUrl
  });
  const defaultsModuleUrl = writeSource(writeTempModule, "order-import.defaults", {
    "./order-import.types.ts": typesModuleUrl
  });
  const repositoryModuleUrl = writeSource(writeTempModule, "order-import.repository", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl,
    "../../../packages/db/src/index.ts": db.moduleUrl,
    "./order-import.defaults.ts": defaultsModuleUrl,
    "./order-import.types.ts": typesModuleUrl
  });
  const serviceModuleUrl = writeSource(writeTempModule, "order-import.service", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl,
    "../../../packages/capabilities/order-read/src/index.ts": orderRead.moduleUrl,
    "./order-import.repository.ts": repositoryModuleUrl,
    "./order-import.types.ts": typesModuleUrl,
    "@nestjs/common": nestCommon
  });
  const controllerModuleUrl = writeSource(writeTempModule, "order-import.controller", {
    "../../../packages/authz/src/index.ts": authz.moduleUrl,
    "./access-context.ts": accessContext,
    "./order-import.service.ts": serviceModuleUrl,
    "./order-import.types.ts": typesModuleUrl,
    "@nestjs/common": nestCommon
  });
  const barrelSource = replaceImports(read("apps/api/src/order-import.ts"), {
    "./order-import.controller.ts": controllerModuleUrl,
    "./order-import.repository.ts": repositoryModuleUrl,
    "./order-import.service.ts": serviceModuleUrl,
    "./order-import.types.ts": typesModuleUrl
  });
  const moduleUrl = writeTempModule("order-import.mjs", transpileSource(barrelSource));
  return { module: await import(moduleUrl), moduleUrl };
}

async function importTypescriptSource(relativePath) {
  const moduleUrl = inlineModuleUrl(transpileSource(read(relativePath)));
  return { module: await import(moduleUrl), moduleUrl };
}

function writeSource(writeTempModule, stem, replacements = {}) {
  const source = replaceImports(read(`apps/api/src/${stem}.ts`), replacements);
  return writeTempModule(`${stem}.mjs`, transpileSource(source));
}

function createNestCommonStub(writeTempModule) {
  return writeTempModule(
    "nestjs-common-stub.mjs",
    [
      "const decorator = () => () => undefined;",
      "const exception = (statusCode) => class extends Error {",
      "  constructor(message) {",
      "    super(typeof message === 'string' ? message : JSON.stringify(message));",
      "    this.status = statusCode;",
      "    this.statusCode = statusCode;",
      "  }",
      "};",
      "export const BadRequestException = exception(400);",
      "export const Controller = decorator;",
      "export const ForbiddenException = exception(403);",
      "export const Get = decorator;",
      "export const Inject = decorator;",
      "export const Injectable = decorator;",
      "export const NotFoundException = exception(404);",
      "export const Param = decorator;",
      "export const Query = decorator;",
      "export const Req = decorator;",
      "export const UseGuards = decorator;"
    ].join("\n")
  );
}

function read(relativePath) {
  const sourcePath = path.resolve(repoRoot, relativePath);
  assert.ok(existsSync(sourcePath), `missing ${relativePath}`);
  return readFileSync(sourcePath, { encoding: "utf8" });
}

function replaceImports(sourceText, replacements) {
  let source = sourceText;
  for (const [from, to] of Object.entries(replacements)) {
    source = source.replaceAll(from, to);
  }
  return source;
}

function transpileSource(sourceText) {
  return ts.transpileModule(sourceText, {
    compilerOptions: {
      emitDecoratorMetadata: false,
      experimentalDecorators: true,
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
}

function inlineModuleUrl(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText, "utf8").toString(
    "base64"
  )}`;
}

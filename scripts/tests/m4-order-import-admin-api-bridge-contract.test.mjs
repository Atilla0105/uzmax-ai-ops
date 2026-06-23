import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL, URL } from "node:url";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const USER_A = "44444444-4444-4444-8444-444444444444";
const adminClientSource = read("apps/admin/src/orderImportApiClient.ts");
const apiControllerSource = read("apps/api/src/order-import.controller.ts");
const apiServiceSource = read("apps/api/src/order-import.service.ts");
const spec = read("docs/specs/M4-31-order-import-admin-api-bridge-contract.md");
const evidence = read(
  "docs/evidence/M4/M4-31-order-import-admin-api-bridge-contract.md"
);
const m4Index = read("docs/evidence/M4/README.md");
const adminClient = await importAdminClientSource();
const api = await importOrderImportRuntime();

describe("M4-31 order import admin API bridge contract", () => {
  it("bridges admin client jobs, row errors and fresh snapshot search to the API controller", async () => {
    const bridge = createOrderImportApiBridge(contextFor(["order:read"]));
    const client = adminClient.createOrderImportApiClient({
      fetcher: bridge.fetcher
    });

    const jobs = await client.listImportJobs();
    const errors = await client.listImportRowErrors("job-a");
    const fresh = await client.searchSnapshot({
      now: "2026-06-22T12:00:00.000Z",
      queryKind: "order_ref",
      queryRef: "query://order/fresh-a"
    });

    assert.equal(jobs[0].id, "job-a");
    assert.equal(jobs[0].status, "completed_with_errors");
    assert.equal(errors[0].id, "row-error-a");
    assert.equal(errors[0].errorCode, "order_status_ref_required");
    assert.equal(fresh.status, "snapshot_ready");
    assert.equal(fresh.customerVisible.orderStatusRef, "status://order/in-transit");
    assert.deepEqual(
      bridge.calls.map((call) => call.input.split("?")[0]),
      [
        "/order-import/jobs",
        "/order-import/jobs/job-a/errors",
        "/order-import/snapshots/search"
      ]
    );
  });

  it("preserves stale and missing handoff semantics through the admin/API bridge", async () => {
    const client = adminClient.createOrderImportApiClient({
      fetcher: createOrderImportApiBridge(contextFor(["order:read"])).fetcher
    });

    const stale = await client.searchSnapshot({
      now: "2026-06-22T12:00:00.000Z",
      queryRef: "query://order/stale-a"
    });
    assert.equal(stale.status, "handoff_required");
    assert.equal(stale.reasonCode, "order_snapshot_stale");
    assert.equal(stale.runtimeWarning.code, "order_snapshot_stale");
    assert.equal(stale.runtimeWarning.handoffRequired, true);
    assert.doesNotMatch(JSON.stringify(stale.customerVisible), /orderStatusRef/);

    const missing = await client.searchSnapshot({
      now: "2026-06-22T12:00:00.000Z",
      queryRef: "query://order/missing-a"
    });
    assert.equal(missing.status, "handoff_required");
    assert.equal(missing.reasonCode, "order_snapshot_missing");
    assert.equal(missing.runtimeWarning.staleSnapshotUsed, false);
    assert.doesNotMatch(JSON.stringify(missing), /invented|generated|llm/i);
  });

  it("maps API access and not-found failures into admin client HTTP failures", async () => {
    const denied = adminClient.createOrderImportApiClient({
      fetcher: createOrderImportApiBridge(contextFor([])).fetcher
    });
    await assert.rejects(() => denied.listImportJobs(), /status 403/);

    const missingJob = adminClient.createOrderImportApiClient({
      fetcher: createOrderImportApiBridge(contextFor(["order:read"])).fetcher
    });
    await assert.rejects(
      () => missingJob.listImportRowErrors("missing-job"),
      /status 404/
    );
  });

  it("records M4-31 scope without source changes, DB runtime, queue or external API", () => {
    assert.match(adminClientSource, /createOrderImportApiClient/);
    assert.match(apiControllerSource, /@Controller\("order-import"\)/);
    assert.match(apiServiceSource, /withOrderSnapshotRuntimeWarning/);
    assert.match(spec, /admin API bridge contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-31 order import admin API bridge contract/);
    assert.doesNotMatch(
      adminClientSource,
      /from\s+["'].*(?:apps\/api|packages\/db|packages\/capabilities|@uzmax\/api|@uzmax\/db)["']|order_connector|process\.env|globalThis\.fetch|\bfetch\(|https?:\/\//i
    );
    assert.doesNotMatch(
      `${apiControllerSource}\n${apiServiceSource}`,
      /order_connector|PrismaClient|@prisma\/client|BullMQ|Redis|process\.env|fetch\(/i
    );
  });
});

function createOrderImportApiBridge(accessContext) {
  const controller = new api.OrderImportController(
    new api.OrderImportService(new api.InMemoryOrderImportRepository())
  );
  const calls = [];
  return {
    calls,
    fetcher: async (input, init) => {
      calls.push({ init, input });
      if (init?.method !== "GET") {
        return apiResponse(405, { message: "method not allowed" });
      }

      const url = new URL(input, "https://admin.local");
      try {
        return apiResponse(
          200,
          await dispatchOrderImport(controller, accessContext, url)
        );
      } catch (error) {
        return apiResponse(httpStatus(error), {
          message: error instanceof Error ? error.message : "order import bridge failed"
        });
      }
    }
  };
}

async function dispatchOrderImport(controller, accessContext, url) {
  const request = { accessContext };
  if (url.pathname === "/order-import/jobs") {
    return controller.listImportJobs(request);
  }
  const errorsMatch = /^\/order-import\/jobs\/([^/]+)\/errors$/.exec(url.pathname);
  if (errorsMatch) {
    return controller.listImportRowErrors(request, decodeURIComponent(errorsMatch[1]));
  }
  if (url.pathname === "/order-import/snapshots/search") {
    return controller.searchSnapshot(request, Object.fromEntries(url.searchParams));
  }
  const error = new Error("order import API route not found");
  error.status = 404;
  throw error;
}

function apiResponse(status, payload) {
  return {
    json: async () => payload,
    ok: status >= 200 && status < 300,
    status
  };
}

function httpStatus(error) {
  return error?.statusCode ?? error?.status ?? 500;
}

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

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

async function importAdminClientSource() {
  const compiled = ts.transpileModule(adminClientSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    }
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(compiled, "utf8").toString("base64")}`
  );
}

async function importOrderImportRuntime() {
  const writeRuntimeModule = createRuntimeModuleWriter();
  const authzUrl = inlineModuleUrl(compile(read("packages/authz/src/index.ts")));
  const dbUrl = inlineModuleUrl(compile(read("packages/db/src/index.ts")));
  const orderReadUrl = inlineModuleUrl(
    compile(read("packages/capabilities/order-read/src/index.ts"))
  );
  const nestCommonUrl = writeRuntimeModule(
    "nestjs-common-stub.mjs",
    [
      "const passthrough = () => () => undefined;",
      "const exception = (statusCode) => class extends Error {",
      "  constructor(message) {",
      "    super(typeof message === 'string' ? message : JSON.stringify(message));",
      "    this.status = statusCode;",
      "    this.statusCode = statusCode;",
      "  }",
      "};",
      "export const BadRequestException = exception(400);",
      "export const Controller = passthrough;",
      "export const ForbiddenException = exception(403);",
      "export const Get = passthrough;",
      "export const Inject = passthrough;",
      "export const Injectable = passthrough;",
      "export const NotFoundException = exception(404);",
      "export const Param = passthrough;",
      "export const Query = passthrough;",
      "export const Req = passthrough;",
      "export const UseGuards = passthrough;"
    ].join("\n")
  );
  const accessContextUrl = writeRuntimeModule(
    "access-context.mjs",
    "export class ApiAccessContextGuard {}"
  );
  const typesUrl = compileApiModule(writeRuntimeModule, "order-import.types", {
    "../../../packages/authz/src/index.ts": authzUrl,
    "../../../packages/capabilities/order-read/src/index.ts": orderReadUrl
  });
  const defaultsUrl = compileApiModule(writeRuntimeModule, "order-import.defaults", {
    "./order-import.types.ts": typesUrl
  });
  const persistenceUrl = compileApiModule(
    writeRuntimeModule,
    "order-import.persistence-gateway",
    {
      "../../../packages/db/src/index.ts": dbUrl
    }
  );
  const repositoryUrl = compileApiModule(
    writeRuntimeModule,
    "order-import.repository",
    {
      "../../../packages/authz/src/index.ts": authzUrl,
      "../../../packages/db/src/index.ts": dbUrl,
      "./order-import.defaults.ts": defaultsUrl,
      "./order-import.persistence-gateway.ts": persistenceUrl,
      "./order-import.types.ts": typesUrl
    }
  );
  const serviceUrl = compileApiModule(writeRuntimeModule, "order-import.service", {
    "../../../packages/authz/src/index.ts": authzUrl,
    "../../../packages/capabilities/order-read/src/index.ts": orderReadUrl,
    "./order-import.repository.ts": repositoryUrl,
    "./order-import.types.ts": typesUrl,
    "@nestjs/common": nestCommonUrl
  });
  const controllerUrl = compileApiModule(
    writeRuntimeModule,
    "order-import.controller",
    {
      "../../../packages/authz/src/index.ts": authzUrl,
      "./access-context.ts": accessContextUrl,
      "./order-import.service.ts": serviceUrl,
      "./order-import.types.ts": typesUrl,
      "@nestjs/common": nestCommonUrl
    }
  );

  const [controller, repository, service] = await Promise.all([
    import(controllerUrl),
    import(repositoryUrl),
    import(serviceUrl)
  ]);
  return { ...controller, ...repository, ...service };
}

function createRuntimeModuleWriter() {
  const runtimeRoot = mkdtempSync(path.join(tmpdir(), "uzmax-m4-31-order-import-"));
  return (fileName, sourceText) => {
    const url = pathToFileURL(path.join(runtimeRoot, fileName));
    writeFileSync(url, sourceText, "utf8");
    return url.href;
  };
}

function compileApiModule(writeRuntimeModule, moduleStem, replacements) {
  return writeRuntimeModule(
    `${moduleStem}.mjs`,
    compile(replaceImports(read(`apps/api/src/${moduleStem}.ts`), replacements))
  );
}

function replaceImports(sourceText, replacements) {
  let nextSource = sourceText;
  for (const [from, to] of Object.entries(replacements)) {
    nextSource = nextSource.replaceAll(from, to);
  }
  return nextSource;
}

function compile(sourceText) {
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

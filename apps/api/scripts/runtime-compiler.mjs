import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
const repoRoot = path.resolve(import.meta.dirname, "../../..");
const defaultOutDir = path.join(repoRoot, "node_modules/.cache/uzmax-api-runtime");
const compilerOptions = {
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2023
};
export async function importApiRuntime() {
  const outDir = await compileApiRuntime();
  const entry = pathToFileURL(path.join(outDir, "main.mjs")).href;
  return import(`${entry}?t=${Date.now()}`);
}
export async function importApiOrderImportRuntimeModules(options = {}) {
  return importApiRuntimeModules(options, [
    ["accessContext", "access-context"],
    ["orderImport", "order-import"],
    ["orderImportRuntime", "order-import.runtime"]
  ]);
}
export async function importApiCustomerAssetRuntimeModules(options = {}) {
  return importApiRuntimeModules(options, [
    ["accessContext", "access-context"],
    ["customerAssetController", "customer-asset.controller"],
    ["customerAssetRepository", "customer-asset.repository"],
    ["customerAssetRuntime", "customer-asset.runtime"],
    ["customerAssetService", "customer-asset.service"]
  ]);
}
export async function importApiAiMemberRuntimeModules(options = {}) {
  return importApiRuntimeModules(options, [["aiMemberRuntime", "ai-member-runtime"]]);
}
export async function importApiLogsAnalyticsRuntimeModules(options = {}) {
  return importApiRuntimeModules(options, [
    ["logsAnalyticsRuntime", "logs-analytics-runtime"]
  ]);
}
export async function importApiTemplateCopyRuntimeModules(options = {}) {
  return importApiRuntimeModules(options, [
    ["templateCopyRuntime", "template-copy-runtime"]
  ]);
}
async function importApiRuntimeModules(options, entries) {
  const outDir = await compileApiRuntime(options);
  const modules = { outDir };
  await Promise.all(
    entries.map(async ([key, fileName]) => {
      modules[key] = await import(
        pathToFileURL(path.join(outDir, `${fileName}.mjs`)).href
      );
    })
  );
  return modules;
}
export async function compileApiRuntime(options = {}) {
  const outDir = options.outDir ?? defaultOutDir;
  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });

  await writeModule(outDir, "packages/authz/src/index.ts", "authz-index.mjs");
  await writeModule(outDir, "packages/db/src/index.ts", "db-index.mjs");
  await writeModule(
    outDir,
    "apps/api/src/access-context-core.ts",
    "access-context-core.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs"
    }
  );
  await writeModule(outDir, "apps/api/src/access-context.ts", "access-context.mjs", {
    "../../../packages/authz/src/index.ts": "./authz-index.mjs",
    "../../../packages/db/src/index.ts": "./db-index.mjs",
    "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs",
    "./access-context-core.ts": "./access-context-core.mjs"
  });
  for (const [sourcePath, outputName, replacements] of conversationTicketModules()) {
    await writeModule(outDir, sourcePath, outputName, replacements);
  }
  for (const [name, replacements] of confirmationQueueRuntimeModules()) {
    await writeModule(
      outDir,
      `apps/api/src/confirmation-queue.${name}.ts`,
      `confirmation-queue.${name}.mjs`,
      replacements
    );
  }
  await writeModule(
    outDir,
    "packages/capabilities/handoff/src/index.ts",
    "handoff-index.mjs"
  );
  await writeModule(
    outDir,
    "apps/api/src/audit-log.prisma-sink.ts",
    "audit-log.prisma-sink.mjs",
    {
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "./access-context-core.ts": "./access-context-core.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/ai-member-runtime.contracts.ts",
    "ai-member-runtime.contracts.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/ai-member-runtime.repository.ts",
    "ai-member-runtime.repository.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs",
      "./ai-member-runtime.contracts.ts": "./ai-member-runtime.contracts.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/ai-member-runtime.ts",
    "ai-member-runtime.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs",
      "./access-context.ts": "./access-context.mjs",
      "./ai-member-runtime.contracts.ts": "./ai-member-runtime.contracts.mjs",
      "./ai-member-runtime.repository.ts": "./ai-member-runtime.repository.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/logs-analytics-runtime.contracts.ts",
    "logs-analytics-runtime.contracts.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/logs-analytics-runtime.repository.ts",
    "logs-analytics-runtime.repository.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs",
      "./logs-analytics-runtime.contracts.ts": "./logs-analytics-runtime.contracts.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/logs-analytics-runtime.ts",
    "logs-analytics-runtime.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs",
      "./access-context.ts": "./access-context.mjs",
      "./logs-analytics-runtime.contracts.ts": "./logs-analytics-runtime.contracts.mjs",
      "./logs-analytics-runtime.repository.ts":
        "./logs-analytics-runtime.repository.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/template-copy-runtime.contracts.ts",
    "template-copy-runtime.contracts.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/template-copy-runtime.repository.ts",
    "template-copy-runtime.repository.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "../../../packages/db/src/index.ts": "./db-index.mjs",
      "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs",
      "./template-copy-runtime.contracts.ts": "./template-copy-runtime.contracts.mjs"
    }
  );
  await writeModule(
    outDir,
    "apps/api/src/template-copy-runtime.ts",
    "template-copy-runtime.mjs",
    {
      "../../../packages/authz/src/index.ts": "./authz-index.mjs",
      "./access-context.ts": "./access-context.mjs",
      "./template-copy-runtime.contracts.ts": "./template-copy-runtime.contracts.mjs",
      "./template-copy-runtime.repository.ts": "./template-copy-runtime.repository.mjs"
    }
  );
  for (const [name, replacements] of customerAssetRuntimeModules()) {
    await writeModule(
      outDir,
      `apps/api/src/customer-asset.${name}.ts`,
      `customer-asset.${name}.mjs`,
      replacements
    );
  }
  await writeModule(outDir, "packages/db/src/prisma-runtime.ts", "prisma-runtime.mjs");
  await writeModule(
    outDir,
    "packages/channels/src/telegram-bot-inbound-contract.ts",
    "telegram-bot-inbound-contract.mjs"
  );
  await writeModule(outDir, "packages/channels/src/index.ts", "channels-index.mjs", {
    "./telegram-bot-inbound-contract.ts": "./telegram-bot-inbound-contract.mjs"
  });
  await writeModule(outDir, "apps/api/src/telegram-bot.ts", "telegram-bot.mjs", {
    "../../../packages/channels/src/index.ts": "./channels-index.mjs",
    "../../../packages/channels/src/telegram-bot-inbound-contract.ts":
      "./telegram-bot-inbound-contract.mjs"
  });
  for (const [sourcePath, outputName, replacements] of orderImportModules()) {
    await writeModule(outDir, sourcePath, outputName, replacements);
  }
  await writeModule(outDir, "apps/api/src/app.module.ts", "app.module.mjs", {
    "./access-context.ts": "./access-context.mjs",
    "./ai-member-runtime.ts": "./ai-member-runtime.mjs",
    "./confirmation-queue.controller.ts": "./confirmation-queue.controller.mjs",
    "./confirmation-queue.formal-write-contracts.ts":
      "./confirmation-queue.formal-write-contracts.mjs",
    "./confirmation-queue.formal-write.ts": "./confirmation-queue.formal-write.mjs",
    "./confirmation-queue.prisma-mapper.ts": "./confirmation-queue.prisma-mapper.mjs",
    "./confirmation-queue.repository.ts": "./confirmation-queue.repository.mjs",
    "./confirmation-queue.runtime.ts": "./confirmation-queue.runtime.mjs",
    "./confirmation-queue.service.ts": "./confirmation-queue.service.mjs",
    "./conversation-ticket.ts": "./conversation-ticket.mjs",
    "./customer-asset.controller.ts": "./customer-asset.controller.mjs",
    "./customer-asset.repository.ts": "./customer-asset.repository.mjs",
    "./customer-asset.runtime.ts": "./customer-asset.runtime.mjs",
    "./customer-asset.service.ts": "./customer-asset.service.mjs",
    "./logs-analytics-runtime.ts": "./logs-analytics-runtime.mjs",
    "./order-import.ts": "./order-import.mjs",
    "./order-import.runtime.ts": "./order-import.runtime.mjs",
    "./telegram-bot.ts": "./telegram-bot.mjs",
    "./template-copy-runtime.ts": "./template-copy-runtime.mjs"
  });
  await writeModule(outDir, "apps/api/src/main.ts", "main.mjs", {
    "./app.module.ts": "./app.module.mjs"
  });
  return outDir;
}
async function writeModule(outDir, sourcePath, outputName, replacements = {}) {
  let source = await readFile(path.join(repoRoot, sourcePath), "utf8");
  for (const [from, to] of Object.entries(replacements)) {
    source = source.replaceAll(from, to);
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions,
    fileName: sourcePath
  });
  await writeFile(path.join(outDir, outputName), outputText);
}
function confirmationQueueRuntimeModules() {
  const authz = { "../../../packages/authz/src/index.ts": "./authz-index.mjs" };
  const db = { "../../../packages/db/src/index.ts": "./db-index.mjs" };
  const prismaRuntime = {
    "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs"
  };
  const types = { "./confirmation-queue.types.ts": "./confirmation-queue.types.mjs" };
  return [
    ["types", authz],
    ["prisma-mapper", types],
    ["repository", { ...authz, ...types }],
    [
      "formal-write-contracts",
      {
        ...authz,
        ...db,
        ...types
      }
    ],
    [
      "formal-write",
      {
        ...authz,
        ...db,
        ...prismaRuntime,
        ...types,
        "./audit-log.prisma-sink.ts": "./audit-log.prisma-sink.mjs",
        "./confirmation-queue.formal-write-contracts.ts":
          "./confirmation-queue.formal-write-contracts.mjs",
        "./confirmation-queue.prisma-mapper.ts":
          "./confirmation-queue.prisma-mapper.mjs"
      }
    ],
    [
      "runtime",
      {
        ...authz,
        ...db,
        ...prismaRuntime,
        ...types,
        "./confirmation-queue.prisma-mapper.ts":
          "./confirmation-queue.prisma-mapper.mjs",
        "./confirmation-queue.repository.ts": "./confirmation-queue.repository.mjs"
      }
    ],
    [
      "service",
      {
        ...authz,
        ...types,
        "./confirmation-queue.formal-write.ts": "./confirmation-queue.formal-write.mjs",
        "./confirmation-queue.repository.ts": "./confirmation-queue.repository.mjs"
      }
    ],
    [
      "controller",
      {
        ...authz,
        ...types,
        "./access-context.ts": "./access-context.mjs",
        "./confirmation-queue.service.ts": "./confirmation-queue.service.mjs"
      }
    ]
  ];
}
function conversationTicketModules() {
  const authz = { "../../../packages/authz/src/index.ts": "./authz-index.mjs" };
  const handoff = {
    "../../../packages/capabilities/handoff/src/index.ts": "./handoff-index.mjs"
  };
  const dbMappers = {
    "./conversation-ticket.db-mappers.ts": "./conversation-ticket.db-mappers.mjs"
  };
  const types = { "./conversation-ticket.types.ts": "./conversation-ticket.types.mjs" };
  return [
    [
      "apps/api/src/conversation-ticket.types.ts",
      "conversation-ticket.types.mjs",
      { ...authz, ...handoff }
    ],
    [
      "apps/api/src/conversation-ticket.errors.ts",
      "conversation-ticket.errors.mjs",
      { ...authz, ...handoff }
    ],
    [
      "apps/api/src/conversation-ticket.db-mappers.ts",
      "conversation-ticket.db-mappers.mjs",
      { ...authz, ...handoff, ...types }
    ],
    [
      "apps/api/src/conversation-ticket.lifecycle-state.ts",
      "conversation-ticket.lifecycle-state.mjs",
      {
        ...handoff,
        "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
        ...types
      }
    ],
    [
      "apps/api/src/conversation-ticket.atomic-state.ts",
      "conversation-ticket.atomic-state.mjs",
      {
        ...handoff,
        "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
        "./conversation-ticket.lifecycle-state.ts":
          "./conversation-ticket.lifecycle-state.mjs",
        ...types
      }
    ],
    [
      "apps/api/src/conversation-ticket.atomic-writes.ts",
      "conversation-ticket.atomic-writes.mjs",
      {
        ...authz,
        ...dbMappers,
        ...handoff,
        "./conversation-ticket.atomic-state.ts":
          "./conversation-ticket.atomic-state.mjs",
        "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
        ...types
      }
    ],
    [
      "apps/api/src/conversation-ticket.ownership.ts",
      "conversation-ticket.ownership.mjs",
      {
        ...authz,
        ...dbMappers,
        ...handoff,
        "../../../packages/channels/src/telegram-bot-inbound-contract.ts":
          "./telegram-bot-inbound-contract.mjs",
        ...types
      }
    ],
    [
      "apps/api/src/conversation-ticket.repository.ts",
      "conversation-ticket.repository.mjs",
      {
        ...authz,
        ...dbMappers,
        ...handoff,
        "./conversation-ticket.atomic-writes.ts":
          "./conversation-ticket.atomic-writes.mjs",
        "./conversation-ticket.ownership.ts": "./conversation-ticket.ownership.mjs",
        ...types
      }
    ],
    [
      "apps/api/src/conversation-ticket.service.ts",
      "conversation-ticket.service.mjs",
      {
        ...authz,
        ...handoff,
        "./conversation-ticket.atomic-state.ts":
          "./conversation-ticket.atomic-state.mjs",
        "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
        "./conversation-ticket.ownership.ts": "./conversation-ticket.ownership.mjs",
        "./conversation-ticket.repository.ts": "./conversation-ticket.repository.mjs",
        ...types
      }
    ],
    [
      "apps/api/src/conversation-ticket.controller.ts",
      "conversation-ticket.controller.mjs",
      {
        ...authz,
        "./access-context.ts": "./access-context.mjs",
        "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
        "./conversation-ticket.service.ts": "./conversation-ticket.service.mjs",
        ...types
      }
    ],
    [
      "apps/api/src/conversation-ticket.ts",
      "conversation-ticket.mjs",
      {
        "./conversation-ticket.controller.ts": "./conversation-ticket.controller.mjs",
        "./conversation-ticket.errors.ts": "./conversation-ticket.errors.mjs",
        "./conversation-ticket.repository.ts": "./conversation-ticket.repository.mjs",
        "./conversation-ticket.service.ts": "./conversation-ticket.service.mjs",
        ...types
      }
    ]
  ];
}

function orderImportModules() {
  const source = "apps/api/src/order-import";
  const authz = { "../../../packages/authz/src/index.ts": "./authz-index.mjs" };
  const db = { "../../../packages/db/src/index.ts": "./db-index.mjs" };
  const orderRead = {
    "../../../packages/capabilities/order-read/src/index.ts": "./order-read-index.mjs"
  };
  const types = { "./order-import.types.ts": "./order-import.types.mjs" };
  const repository = {
    "./order-import.repository.ts": "./order-import.repository.mjs"
  };
  return [
    ["packages/capabilities/order-read/src/index.ts", "order-read-index.mjs"],
    [
      "apps/api/src/order-import.types.ts",
      "order-import.types.mjs",
      { ...authz, ...orderRead }
    ],
    [`${source}.defaults.ts`, "order-import.defaults.mjs", types],
    [`${source}.persistence-gateway.ts`, "order-import.persistence-gateway.mjs", db],
    [
      `${source}.repository.ts`,
      "order-import.repository.mjs",
      {
        ...authz,
        ...db,
        "./order-import.defaults.ts": "./order-import.defaults.mjs",
        "./order-import.persistence-gateway.ts":
          "./order-import.persistence-gateway.mjs",
        ...types
      }
    ],
    [`${source}.rls-runner.ts`, "order-import.rls-runner.mjs", repository],
    [
      `${source}.runtime.ts`,
      "order-import.runtime.mjs",
      {
        "../../../packages/db/src/prisma-runtime.ts": "./prisma-runtime.mjs",
        ...repository,
        "./order-import.rls-runner.ts": "./order-import.rls-runner.mjs"
      }
    ],
    [`${source}.submit.ts`, "order-import.submit.mjs", types],
    [
      `${source}.service.ts`,
      "order-import.service.mjs",
      {
        ...authz,
        ...orderRead,
        ...repository,
        "./order-import.submit.ts": "./order-import.submit.mjs",
        ...types
      }
    ],
    [
      `${source}.controller.ts`,
      "order-import.controller.mjs",
      {
        ...authz,
        "./access-context.ts": "./access-context.mjs",
        "./order-import.service.ts": "./order-import.service.mjs",
        ...types
      }
    ],
    [
      `${source}.ts`,
      "order-import.mjs",
      {
        "./order-import.controller.ts": "./order-import.controller.mjs",
        ...repository,
        "./order-import.rls-runner.ts": "./order-import.rls-runner.mjs",
        "./order-import.service.ts": "./order-import.service.mjs",
        "./order-import.submit.ts": "./order-import.submit.mjs",
        ...types
      }
    ]
  ];
}

function customerAssetRuntimeModules() {
  return [
    ["types", { "../../../packages/authz/src/index.ts": "./authz-index.mjs" }],
    [
      "repository",
      {
        "../../../packages/authz/src/index.ts": "./authz-index.mjs",
        "./customer-asset.types.ts": "./customer-asset.types.mjs"
      }
    ],
    [
      "persistence",
      {
        "../../../packages/authz/src/index.ts": "./authz-index.mjs",
        "../../../packages/db/src/m4-customer-asset-contracts.ts": "./db-index.mjs",
        "./customer-asset.repository.ts": "./customer-asset.repository.mjs",
        "./customer-asset.types.ts": "./customer-asset.types.mjs"
      }
    ],
    [
      "prisma-gateway",
      {
        "../../../packages/db/src/m4-customer-asset-contracts.ts": "./db-index.mjs",
        "./customer-asset.persistence.ts": "./customer-asset.persistence.mjs"
      }
    ],
    [
      "runtime",
      {
        "../../../packages/db/src/index.ts": "./db-index.mjs",
        "./access-context-core.ts": "./access-context-core.mjs",
        "./audit-log.prisma-sink.ts": "./audit-log.prisma-sink.mjs",
        "./customer-asset.repository.ts": "./customer-asset.repository.mjs",
        "./customer-asset.prisma-gateway.ts": "./customer-asset.prisma-gateway.mjs",
        "./customer-asset.persistence.ts": "./customer-asset.persistence.mjs",
        "./customer-asset.types.ts": "./customer-asset.types.mjs"
      }
    ],
    [
      "service",
      {
        "../../../packages/authz/src/index.ts": "./authz-index.mjs",
        "../../../packages/db/src/index.ts": "./db-index.mjs",
        "./access-context.ts": "./access-context.mjs",
        "./access-context-core.ts": "./access-context-core.mjs",
        "./customer-asset.repository.ts": "./customer-asset.repository.mjs",
        "./customer-asset.types.ts": "./customer-asset.types.mjs"
      }
    ],
    [
      "controller",
      {
        "../../../packages/authz/src/index.ts": "./authz-index.mjs",
        "./access-context.ts": "./access-context.mjs",
        "./customer-asset.service.ts": "./customer-asset.service.mjs",
        "./customer-asset.types.ts": "./customer-asset.types.mjs"
      }
    ]
  ];
}

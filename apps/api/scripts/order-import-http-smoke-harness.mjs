import "reflect-metadata";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { importApiOrderImportRuntimeModules } from "./runtime-compiler.mjs";

export async function startOrderImportHttpSmoke({ createAccessContext, prisma }) {
  const runtimeModules = await importApiOrderImportRuntimeModules();
  return startOrderImportHttpSmokeFromModules({
    createAccessContext,
    prisma,
    runtimeModules
  });
}

async function startOrderImportHttpSmokeFromModules({
  createAccessContext,
  prisma,
  runtimeModules
}) {
  const { accessContext, orderImport } = runtimeModules;
  const repository = orderImport.createOrderImportRepositoryProvider({
    mode: orderImport.orderImportRepositoryRuntimeModes.rlsPrismaGateway,
    rlsTransactionRunner: orderImport.createOrderImportRlsBatchTransactionRunner(prisma)
  });

  const syntheticAccessContextService = {
    async loadContextForRequest(request) {
      const tenantId =
        readHeader(request, "x-tenant-id") ??
        readHeader(request, "x-uzmax-smoke-tenant-id");
      if (!tenantId) throw new Error("tenant_id is required");
      const accessContext = createAccessContext(tenantId, readPermissions(request));
      request.accessContext = accessContext;
      return accessContext;
    },
    assertPermission(accessContext, permission) {
      if (!accessContext.permissions.includes(permission)) {
        throw new Error("permission is not granted");
      }
      return accessContext;
    }
  };

  class OrderImportHttpSmokeModule {}
  Module({
    controllers: [orderImport.OrderImportController],
    providers: [
      orderImport.OrderImportService,
      { provide: orderImport.ORDER_IMPORT_REPOSITORY, useValue: repository },
      {
        provide: accessContext.ApiAccessContextService,
        useValue: syntheticAccessContextService
      },
      accessContext.ApiAccessContextGuard
    ]
  })(OrderImportHttpSmokeModule);

  const smokeApp = await NestFactory.create(OrderImportHttpSmokeModule, {
    bufferLogs: false,
    logger: ["error"]
  });
  await smokeApp.listen(0, "127.0.0.1");
  return smokeApp;
}

function readHeader(request, name) {
  const header = request.headers[name];
  return Array.isArray(header) ? header[0] : header;
}

function readPermissions(request) {
  const header = readHeader(request, "x-uzmax-smoke-permissions");
  if (header === "" || header === "none") return [];
  return header?.split(",").map((permission) => permission.trim()) ?? ["order:read"];
}

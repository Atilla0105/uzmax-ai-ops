import "reflect-metadata";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { importApiCustomerAssetRuntimeModules } from "./runtime-compiler.mjs";

export async function startCustomerAssetHttpSmoke({ createAccessContext, prisma }) {
  const {
    accessContext,
    customerAssetController,
    customerAssetRepository,
    customerAssetRuntime,
    customerAssetService
  } = await importApiCustomerAssetRuntimeModules();
  const rlsTransactionRunner =
    customerAssetRuntime.createCustomerAssetRlsBatchTransactionRunner(prisma);
  const repository = customerAssetRuntime.createCustomerAssetRepositoryProvider({
    mode: customerAssetRuntime.customerAssetRuntimeModes.rlsPrismaGateway,
    rlsTransactionRunner
  });
  const auditSink = customerAssetRuntime.createCustomerAssetAuditSinkProvider({
    rlsTransactionRunner
  });

  const syntheticAccessContextService = {
    async loadContextForRequest(request) {
      const tenantId =
        readHeader(request, "x-tenant-id") ??
        readHeader(request, "x-uzmax-smoke-tenant-id");
      if (!tenantId) throw new Error("tenant_id is required");
      const accessContextValue = createAccessContext(
        tenantId,
        readPermissions(request)
      );
      request.accessContext = accessContextValue;
      return accessContextValue;
    },
    assertPermission(accessContextValue, permission) {
      if (!accessContextValue.permissions.includes(permission)) {
        throw new Error("permission is not granted");
      }
      return accessContextValue;
    }
  };

  class CustomerAssetHttpSmokeModule {}
  Module({
    controllers: [customerAssetController.CustomerAssetController],
    providers: [
      customerAssetService.CustomerAssetService,
      {
        provide: customerAssetRepository.CUSTOMER_ASSET_REPOSITORY,
        useValue: repository
      },
      { provide: accessContext.API_AUDIT_SINK, useValue: auditSink },
      {
        provide: accessContext.ApiAccessContextService,
        useValue: syntheticAccessContextService
      },
      accessContext.ApiAccessContextGuard
    ]
  })(CustomerAssetHttpSmokeModule);

  const app = await NestFactory.create(CustomerAssetHttpSmokeModule, {
    bufferLogs: false,
    logger: ["error"]
  });
  await app.listen(0, "127.0.0.1");
  return app;
}

function readHeader(request, name) {
  const headerValue = request.headers?.[name];
  if (Array.isArray(headerValue)) return headerValue.at(0);
  return typeof headerValue === "string" ? headerValue : undefined;
}

function readPermissions(request) {
  const rawPermissions = readHeader(request, "x-uzmax-smoke-permissions");
  if (rawPermissions === undefined) return ["customer:read"];
  const normalized = rawPermissions.trim();
  if (!normalized || normalized === "none") return [];
  return normalized
    .split(",")
    .map((permission) => permission.trim())
    .filter(Boolean);
}

import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.ts";

const apiCorsAllowedHeaders = [
  "authorization",
  "content-type",
  "x-org-id",
  "x-tenant-id"
] as const;

type ApiStartupLog = {
  event: "api.startup";
  port: number;
  service: "api";
  status: "listening";
  traceId: string;
};

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const corsOrigins = readCorsOrigins(process.env.UZMAX_API_CORS_ORIGINS);
  if (corsOrigins.length > 0) {
    app.enableCors({
      allowedHeaders: [...apiCorsAllowedHeaders],
      credentials: false,
      methods: ["GET", "POST", "OPTIONS"],
      origin: corsOrigins
    });
  }
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  await app.listen(port);
  console.log(JSON.stringify(createApiStartupLog(port)));
  return app;
}

if (process.env.NODE_ENV !== "test") {
  await bootstrap();
}

function readCorsOrigins(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function createApiStartupLog(port: number): ApiStartupLog {
  return {
    event: "api.startup",
    port,
    service: "api",
    status: "listening",
    traceId:
      process.env.UZMAX_API_STARTUP_TRACE_ID ??
      `api-startup:${process.pid}:${Date.now()}`
  };
}

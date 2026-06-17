import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.ts";

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  await app.listen(port);
  return app;
}

if (process.env.NODE_ENV !== "test") {
  await bootstrap();
}

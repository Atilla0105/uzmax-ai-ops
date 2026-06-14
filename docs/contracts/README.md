# Contracts

本目录记录 schema、DTO、OpenAPI 或前后端共享契约的入口。

当前触发来源是 `SPK-03` 的 Prisma/RLS spike schema：`packages/db/prisma/schema.prisma`。该 schema 只用于生成 Prisma Client 与运行 RLS 连接池 harness，不定义正式业务 DTO、OpenAPI 或前后端共享请求/响应契约。

正式业务 schema、migration 或 DTO 生成器出现时，必须在对应 spec 中更新本目录，并引用生成命令、所有者、兼容性和验收证据。

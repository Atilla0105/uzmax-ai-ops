# Contracts

本目录记录 schema、DTO、OpenAPI 或前后端共享契约的入口。

## Platform Schema And Authz

`M1-01-platform-schema-authz-foundation` 引入第一组正式平台契约：

- `packages/db/prisma/schema.prisma` 定义 `org`、`tenant`、`org_member`、`tenant_member`、`permission_grant` 的 Prisma model。
- `packages/db/migrations/0001_platform_schema_authz_foundation.sql` 定义同名 Postgres tables、enum、RLS baseline 和 `uzmax_app_runtime` 受限 role。
- `packages/db/src/index.ts` 暴露平台表名、`app.org_id` / `app.tenant_id` RLS context key、runtime role 与 role identifier 校验。
- `packages/authz/src/index.ts` 暴露 `AuthzRepository`、`AccessContext` 和纯 resolver；权限事实源只允许来自 `tenant_member` 与 `permission_grant`，不得使用 JWT 或 `user_metadata` 的业务授权 claim。

## RLS Context

平台 RLS baseline 沿用 ADR-001 / ADR-002：

- runtime 查询先在事务内 `SET LOCAL ROLE` 到受限 role。
- 同一事务内注入 `set_config('app.org_id', orgId, true)` 与 `set_config('app.tenant_id', tenantId, true)`。
- 缺失 org/tenant context 时 policy 默认拒绝。
- `tenant_member` 与 `permission_grant` 是后端生成 `AccessContext` 的事实源；后续 API guard 可以用服务端受控路径读取事实源，再把 selected tenant context 注入业务查询。

## Verification

本契约的本地验证入口：

- `UZMAX_RLS_DATABASE_URL=postgresql://user:pass@localhost:5432/db npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma`
- `npm run typecheck`
- `npm run lint`
- `npm run test`

SPK-03 / SPK-04 live harness 仍保留为外部环境验证入口：

- `npm run -w @uzmax/db spike:rls-prisma-pool`
- `npm run -w @uzmax/authz spike:dual-auth`

live harness 需要真实 Supabase/Postgres/Auth/Storage 环境变量和 secret；缺失 secret 时应 fail closed，不得用 mock 结果替代。

## Compatibility Boundary

M1-01 只提供平台 schema/authz 地基，不关闭完整 A-02 或 B-01：后台 E2E、Nest HTTP/WS guard、租户切换缓存失效、审计写入闭环、业务表 RLS、eval runner、Telegram/AI/订单能力均由后续 spec 单独实现。不得提交 raw/export/jsonl/csv 样本、客户明文、截图或语音转写。

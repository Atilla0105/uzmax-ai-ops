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

## API Access Context

`M1-02-api-access-context-shell` 引入最小 Nest API access-context 契约：

- `GET /healthz` 只返回 API shell 存活状态，不包含 secret、连接串或客户数据。
- `GET /readyz` 只返回组件契约状态：identity verifier、authz repository、database、audit 和 access-context contract；缺少 runtime identity/authz 配置时返回 `not_ready` / HTTP 503，staging/prod Supabase 路线未定时不关闭生产 readiness。
- API 请求通过 `Authorization: Bearer <jwt>` 提供 Supabase Auth 身份；后端只调用 Supabase Auth `getUser(jwt)` 取 `user.id`，不得信任 JWT 或 `user_metadata` 中的业务权限 claim。
- selected tenant 来自 `x-tenant-id`、`tenant_id` query 或请求体 `tenant_id`；后端必须用 `tenant_member` 与 `permission_grant` 事实源生成 `AccessContext`，未授权、撤权或伪造 tenant 默认拒绝。
- `GET /me/access-context` 由 `ApiAccessContextGuard` 保护，并要求 `tenant:read` 权限。
- `POST /tenant/switch` 每次重新生成目标 tenant 的 `AccessContext`，要求 `tenant:switch` 权限，不复用旧 context；成功时返回目标 tenant 的 RLS transaction context helper 输出。
- `packages/db/src/index.ts` 的 `createRlsTransactionContext` 输出 `SET LOCAL ROLE` 语句和 `app.org_id` / `app.tenant_id` settings，供后续 repository 在事务内注入；本契约不允许裸用 Prisma 业务查询绕过 context。

M1-02 审计只定义 event port/shape，不新增正式 `audit_log` schema：

| event_type | 必填语义 | 备注 |
|---|---|---|
| `access_context.denied` | `actorUserId`、`tenantId`、`reason`、`occurredAt` | token 已验证但 tenant/access-context 被拒绝时记录 |
| `tenant_switch.allowed` | `actorUserId`、`orgId`、`tenantId`、`membershipVersion`、`occurredAt` | tenant switch 成功且 `tenant:switch` 权限通过 |
| `tenant_switch.denied` | `actorUserId`、`tenantId`、`reason`、`occurredAt` | target tenant 不可用、撤权或缺 `tenant:switch` 权限 |

M1-02 不关闭完整 A-02、B-01 或 B-05：后台 E2E、业务表 RLS、正式审计表/配置版本、发布验收入口仍由 M1-03/M1-04 单独实现。

## Verification

本契约的本地验证入口：

- `UZMAX_RLS_DATABASE_URL=postgresql://user:pass@localhost:5432/db npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `node --test scripts/tests/m1-02-api-access-context.test.mjs`

SPK-03 / SPK-04 live harness 仍保留为外部环境验证入口：

- `npm run -w @uzmax/db spike:rls-prisma-pool`
- `npm run -w @uzmax/authz spike:dual-auth`

live harness 需要真实 Supabase/Postgres/Auth/Storage 环境变量和 secret；缺失 secret 时应 fail closed，不得用 mock 结果替代。

## Compatibility Boundary

M1-01/M1-02 只提供平台 schema/authz 地基与 API access-context shell，不关闭完整 A-02、B-01 或 B-05：后台 E2E、WebSocket guard、正式审计写入闭环、业务表 RLS、eval runner、Telegram/AI/订单能力均由后续 spec 单独实现。不得提交 raw/export/jsonl/csv 样本、客户明文、截图或语音转写。

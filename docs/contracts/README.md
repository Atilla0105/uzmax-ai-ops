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

## Audit And Config Version Foundation

`M1-04-audit-config-version-foundation` 引入第一组正式治理契约：

- `packages/db/prisma/schema.prisma` 定义 `audit_log`、`config_version`、`config_version_domain` 和 `config_version_status`。
- `packages/db/migrations/0002_audit_config_version_foundation.sql` 定义同名 Postgres tables、enum、RLS select/insert baseline 和约束。
- `packages/db/src/index.ts` 暴露治理表名、审计事件类型、配置版本 domain/status 和纯 contract helper。
- `apps/api/src/access-context-core.ts` 将 tenant switch 成功事件升级为正式 audit payload，并新增权限变更、配置保存、配置回滚的 contract methods。

正式 `audit_log` 的 M1 必填语义：

| 字段 | 语义 |
|---|---|
| `actor_user_id` | 执行动作的 Supabase Auth user id；关键动作不得匿名 |
| `org_id` / `tenant_id` | RLS scope，必须匹配当前 `app.org_id` / `app.tenant_id` |
| `event_type` | `tenant_switch.allowed`、`permission_grant.changed`、`config_version.saved`、`config_version.rollback_requested` 等 contract event |
| `module` / `action` | 操作模块与功能，如 `access/tenant_switch`、`authz/permission_change`、`config/save` |
| `object_type` / `object_id` | 可跳回的业务对象；M1-04 只覆盖 tenant、permission grant、config version |
| `content` | JSON object，必须包含 `before` 与 `after` 键 |
| `before_version_id` / `after_version_id` | 配置保存/回滚时引用配置版本；非配置动作可为空 |
| `occurred_at` | 服务端事件时间 |

正式 `config_version` 的 M1 domain/status：

| contract | values |
|---|---|
| `config_domain` | `business_config`、`feature_flag`、`template_copy` |
| `status` | `draft`、`active`、`rolled_back`、`archived` |

M1-04 只关闭 schema/API/admin contract 地基：默认 API 仍使用 contract audit sink，不连接生产数据库；后台只提供审计与配置版本只读入口，不实现完整日志中心、配置中心、角色编辑、feature flag 发布、模板中心或生产 readiness。M1-04 不提交 raw/export/jsonl/csv 样本，不消费真实客户消息，不开启第三方 LLM 客户流量。

`access_context.denied` 是无法安全得到 org/tenant scope 时的 pre-audit 拒绝事件，不直接映射到正式 `audit_log`。`tenant_switch.denied` 在能够解析当前 audit context 时必须使用正式 `AuditLogContract`，包含 `module`、`action`、`object_type`、`content.before` / `content.after` 和当前 tenant scope。

## M2 Channel Conversation Foundation

`M2-01-channel-conversation-db-contracts-foundation` 引入 M2 渠道/对话/消息/工单 DB contracts foundation：

- `packages/db/prisma/schema.prisma` 定义 `channel_connection`、`telegram_update_dedupe`、`conversation`、`message`、`ticket`、`ticket_event` 的 Prisma model mapping、enum/status values 和 tenant-scoped relations。
- `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql` 定义同名 Postgres tables、enum、tenant FK、RLS select/insert/update policies 和 `uzmax_app_runtime` least-privilege grants。
- `packages/db/src/index.ts` 暴露 `channelConversationTableNames`、channel/conversation/message/ticket status values，以及 `createConversationContract`、`createMessageContract`、`createTicketContract` 纯 builders/validators。

M2-01 的正式 SQL 表名为 `conversation`、`message`、`ticket`、`ticket_event`；Prisma model 使用 `ChannelConversation`、`ChannelMessage`、`SupportTicket`、`SupportTicketEvent`，避免泛型 model 名与 M1 pre-M2 tests 的边界语义冲突。

所有 M2-01 tenant-scoped table 都必须：

- 带 `org_id` 与 `tenant_id`。
- FK 到 `tenant(org_id, id)`；跨表引用同时带 scope。
- `enable` + `force row level security`。
- 在缺少 `app.org_id` 或 `app.tenant_id` 时 fail closed。
- 只授予 runtime role `select`、`insert`、`update`；不得授予 delete。

M2-01 does not close C-01/C-02/C-06/D-01/D-02/D-03/I-04. It only provides foundation for later Bot ingress, conversation/handoff/ticket API, admin shell, and realtime specs.

Business-specific schema remains deferred to SPK-01 / ADR-B01. This PR deliberately does not add `business_connection`, customer asset center, order/customer asset tables, Bot runtime, API/admin/worker/WS, LLM, prompts, distill, production traffic, or Business feasibility claims. No raw Telegram payloads or customer content belong in this contract or its evidence.

## Verification

本契约的本地验证入口：

- `UZMAX_RLS_DATABASE_URL=postgresql://user:pass@localhost:5432/db npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `node --test scripts/tests/m2-channel-conversation-foundation.test.mjs`
- `node --test scripts/tests/m1-02-api-access-context.test.mjs`
- `node --test scripts/tests/m1-platform-foundation.test.mjs`

SPK-03 / SPK-04 live harness 仍保留为外部环境验证入口：

- `npm run -w @uzmax/db spike:rls-prisma-pool`
- `npm run -w @uzmax/authz spike:dual-auth`

live harness 需要真实 Supabase/Postgres/Auth/Storage 环境变量和 secret；缺失 secret 时应 fail closed，不得用 mock 结果替代。

## Compatibility Boundary

M1-01/M1-02/M1-04 只提供平台 schema/authz 地基、API access-context shell、审计与配置版本 contract，不关闭完整 A-02、B-01、I-07 或生产 B-05：后台多账号 E2E、WebSocket guard、真实数据库审计 repository、业务表 RLS、完整日志中心/配置中心、eval runner、Telegram/AI/订单能力均由后续 spec 单独实现。不得提交 raw/export/jsonl/csv 样本、客户明文、截图或语音转写。

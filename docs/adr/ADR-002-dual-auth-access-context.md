# ADR-002 双鉴权链路与 AccessContext

> status: accepted
> date: 2026-06-14
> spec: M0-03 / SPK-04
> evidence: `docs/evidence/M0/spikes/SPK-04-dual-auth/manifest.md`

## 背景

技术架构 v1.1 要求 Supabase Auth 只负责身份认证，业务权限唯一事实源来自后端表 `tenant_member` 与 `permission_grant`。API 请求进入后端后必须生成 `AccessContext{orgId, tenantIds, permissions}`，再把 `orgId` / `tenantId` 注入 Postgres RLS 会话变量，形成 JWT -> backend guard -> AccessContext -> RLS 的完整链路。

SPK-03 已证明在 Supabase transaction pooler、Prisma batch `$transaction`、`SET LOCAL ROLE` 与事务内 `set_config(..., true)` 组合下可以做到两租户 2000 次交错请求零串话。SPK-04 在此基础上验证 Auth、HTTP/WS 上下文重建、权限撤销、租户切换与 Storage signed URL。

## 决策

1. Supabase Auth 是身份源，不是业务权限源。后端 guard 对用户 JWT 调用 Supabase Auth 验证，取得 `user.id` 后只从后端权限事实表读取租户和权限。
2. JWT 中不得写入 `permissions`、`tenantIds`、`orgId` 等业务授权 claim。即使 `user_metadata` 存在用户可控字段，后端也不得用它做授权。
3. HTTP 与 WS 使用同一 AccessContext 生成路径。WS handshake 只能建立当时有效的上下文；token 刷新、租户切换、权限撤销或 membership `cache_version` 变化后必须重建上下文，无法安全重建时断开重连。
4. RLS 仍沿用 ADR-001 路径：业务查询必须在同一 Prisma 事务内先 `SET LOCAL ROLE` 到受限 role，再通过 `set_config('app.org_id', ..., true)` 与 `set_config('app.tenant_id', ..., true)` 注入上下文。
5. Storage signed URL 只能由后端生成。后端先用 AccessContext 校验对象归属租户，再用服务端 secret/service key 调用 Storage；跨租户对象、伪造路径和已撤权用户默认拒绝，并记录审计占位。
6. Signed URL 有独立签名与有效期；授权撤销不会自动收回已经签出的 URL。因此敏感对象 signed URL 必须短有效期、只在后端生成，并带审计事件。

## Spike 实现

本 PR 新增 `packages/authz/scripts/run-dual-auth-spike.mjs`，用真实 Supabase dev 项目执行：

- Admin API 创建两个 confirmed Auth 测试用户。
- 用户通过 Supabase Auth password flow 获得真实 access/refresh token。
- 后端 guard 使用 `auth.getUser(jwt)` 验证身份，再读取 `spk04.tenant_member` / `spk04.permission_grant` 生成 AccessContext。
- HTTP `/spike/whoami` 与 WS handshake 在 harness 中共享同一 guard 流程。
- RLS 查询通过 `uzmax_spk04_ci` 受限 role 和 `spk04.rls_items` policy 验证租户隔离。
- Storage 使用私有 bucket `spk04-dual-auth`，只在 AccessContext 与 `spk04.storage_objects` 匹配时生成 signed URL。

## 依据

- Supabase Auth `auth.getUser(jwt)` 官方文档说明该方法请求 Auth server，返回值可用于服务端授权前的身份校验。
- Supabase JWT 文档说明 JWT 是认证令牌；业务授权必须由应用/RLS 策略表达。
- Supabase RLS 文档和 Database API security 文档说明 grants 与 RLS 分层控制访问。
- Supabase Storage access-control 与 signed URL 文档说明 Storage 与 RLS 集成，服务端 key 可绕过 RLS，signed URL 有独立时效。
- Supabase database advisor 在 dev 项目对 `spk04` schema 返回 0 security lints。

## 风险与后续

- CI 依赖 GitHub Actions secrets：`UZMAX_SUPABASE_PUBLISHABLE_KEY` 与 `UZMAX_SUPABASE_SECRET_KEY`。这些值只能存在于 GitHub Actions secrets 或本地后端环境；缺失或失效时 SPK-04 job fail-closed。
- 当前 harness 用“过期 claim 形态”的 JWT 覆盖后端过期拒绝分支；未通过修改 Supabase 项目 token lifetime 等方式等待真实 access token 自然过期。进入 staging 前应补一次低过期时间环境或等价真实过期 token 证据。
- dev 证据不能替代 staging/prod；真实客户数据进入前必须按环境重跑 Auth/RLS/Storage 链路。
- 后续正式 API guard 应从本 ADR 的链路落地到 NestJS guard/interceptor/repository helper，不允许业务代码裸用 Prisma Client 或直接由前端生成 signed URL。

## 结果

Accepted。SQL/RLS 基线已在 Supabase dev 建立并通过 security advisor；GitHub Actions 已使用真实 Supabase Auth、RLS、Storage signed URL 和撤权/重连 harness 完成 SPK-04 验证。

Accepted GitHub Actions evidence:

- Run: `https://github.com/Atilla0105/uzmax-ai-ops/actions/runs/27501825423`
- Job: `https://github.com/Atilla0105/uzmax-ai-ops/actions/runs/27501825423/job/81286057137`
- Head SHA: `0105bfd938a04ce1866d12b8f8c8703710026e6a`
- SPK-04 result: `status = passed`, 12 / 12 cases passed, `checkedAt = 2026-06-14T14:31:57.801Z`.
- Full CI gate passed: format, typecheck, lint, depcruise, jscpd, knip, forbidden terms, eval/doc guards, PR shape, Prisma generate, SPK-03, SPK-04, test, build, size and Playwright.

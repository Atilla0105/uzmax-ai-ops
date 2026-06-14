# ADR-001 RLS x Prisma x 连接池

> 状态：accepted
> 日期：2026-06-14
> 关联 spec：`docs/specs/SPK-03-rls-prisma-pool.md`
> 关联验收：A-02 / B-01 / J-06 / K-04
> Owner：项目 owner 确认隔离风险；AI agent 执行 spike、压测和证据归档
> 时间盒：M0 内 2 个工作日

## 背景

UZMAX 1.0 的租户隔离不能只依赖 repository 层 `where tenant_id = ...`。技术架构 v1.1 要求 Prisma 查询路径在事务内注入 RLS 上下文，并证明连接池并发下 `app.org_id` / `app.tenant_id` 不会串话。

Supabase 官方连接文档把 direct connection 定位为长连接服务路径；direct connection 默认走 IPv6，IPv4-only 环境应使用 Supavisor pooler。Supavisor transaction pooler 适合短连接/serverless，但需要 Prisma 使用 `pgbouncer=true` 避免 prepared statement 问题。

## 当前决策

当前推荐路径是：

1. M1 bootstrap 的默认数据库连接路径使用 Supabase transaction pooler `aws-1-ap-south-1.pooler.supabase.com:6543`，Prisma URL 必须包含 `pgbouncer=true` 与 `sslmode=require`；CI 额外追加 `connection_limit=16&pool_timeout=60`。
2. Prisma 访问必须由封装层统一包裹 `$transaction`；优先使用 batch `$transaction([...])`，避免 interactive transaction callback 在 transaction pooler 下产生长时间等待。业务代码禁止裸用 Prisma Client。
3. 每次租户数据查询事务中必须先执行 `SET LOCAL ROLE <non_bypass_rls_role>`，当连接用户本身有 `bypassrls` 时必须切到受限 role。
4. 租户上下文必须在同一事务内注入 `set_config('app.org_id', orgId, true)` 与 `set_config('app.tenant_id', tenantId, true)`；当前 harness 通过查询 CTE 与业务查询绑定，保证读表时 RLS policy 已能读取上下文。
5. RLS policy 必须默认拒绝缺失上下文：`current_setting(..., true)` 为空时不可返回数据。
6. CI 必须常驻运行 `npm run -w @uzmax/db spike:rls-prisma-pool`，使用 GitHub Actions secret `UZMAX_RLS_DATABASE_URL`、`UZMAX_RLS_SET_ROLE=uzmax_spk03_ci` 与 `UZMAX_RLS_SPIKE_CONCURRENCY=16`。

## 已验证证据

- Supabase dev 项目 `uzmax-dev` / `enyocaykcgcfcswycujg` 上已创建 spike-only `spk03.rls_items` 表、RLS policy、受限 role `uzmax_spk03_ci`。
- Supabase connector SQL 证实 `SET LOCAL ROLE uzmax_spk03_ci` 后 `current_user = uzmax_spk03_ci` 且 `row_security_active('spk03.rls_items') = true`。
- 同一 connector 查询在 tenant A 上下文只返回 tenant A 两条样本行。
- Prisma 6.19.3 client 可在本仓库生成，spike harness 已实现 2000 次并发交错请求、缺失上下文、错误上下文和事务后上下文清除断言。
- GitHub Actions run `27499077532` / job `81278472494` 在 head `ee399f99a591c34814c69fdfeada5494cf2ac215` 上通过完整 CI。
- SPK-03 step `2026-06-14T12:38:08Z` 至 `2026-06-14T12:41:17Z` 通过：`totalRequests = 2000`、`requestsPerTenant = 1000`、两个租户各 1000 次、`crossTenantRows = 0`、`concurrency = 16`。
- 同一 CI run 的 format、typecheck、lint、depcruise、jscpd、knip、forbidden terms、eval/doc guards、PR shape、Prisma generate、test、build、size 和 Playwright 全部通过。

## 已排除路径与失败样例

- 缺失 GitHub secret 时 CI 失败，错误为 `UZMAX_RLS_DATABASE_URL is required`；这是预期 fail-closed 行为。
- session pooler `aws-1-ap-south-1.pooler.supabase.com:5432` 在 GitHub Actions 中不可达，返回 `P1001 Can't reach database server`。
- pooler host `aws-0-ap-south-1.pooler.supabase.com` 与本项目不匹配，返回 `tenant/user postgres.enyocaykcgcfcswycujg not found`。
- interactive `$transaction(async tx => ...)` 在 transaction pooler 下出现 `P2028 Unable to start a transaction in the given time` 或长时间等待；不作为推荐封装方式。
- Supavisor session pooler 对 SQL 创建的自定义 login role 返回 `tenant/user ... not found` 或 `no tenant identifier provided`；不作为本次 accepted path。
- Supabase SQL 权限不允许 AI agent 通过 `ALTER ROLE postgres PASSWORD ...` 自行轮换 privileged role 密码；真实 secret 必须由项目 owner / 平台安全流程配置。

## 备选方案

| 方案 | 优点 | 风险 | 判定 |
|---|---|---|---|
| Transaction pooler + Prisma batch `$transaction([...])` + `SET LOCAL ROLE` + CTE `set_config(..., true)` | 已在真实 Supabase + CI 证明 2000 次零串话；适合短连接/serverless；CI 可常驻 | 需要 `pgbouncer=true`、连接池参数和统一封装；不能让业务代码裸用 Prisma | accepted |
| Transaction pooler + Prisma interactive `$transaction(async tx => ...)` | 代码直观 | CI 中出现 P2028 或长时间等待 | rejected for default path |
| Session pooler + Prisma | 理论上适合长连接运行时 | GitHub Actions 中 5432 不可达；自定义 pooler login role 不被 Supavisor 接受 | fallback only |
| Direct connection | 最贴近 Postgres 原生行为 | 当前 direct host 未解析成功；可能受 IPv6/IPv4 add-on 限制 | 仅作为有 IPv6 或 IPv4 add-on 时的对照 |
| Repository 强制租户条件 + RLS 纵深防御 | 即使连接池路径受限也能继续设计业务层 | 不能替代 RLS/pooler 证明；仍需 CI 越权测试 | 必须叠加采用，不替代 RLS |

## 失败分支

- 若 GitHub Actions secret 缺失或失效：CI fail-closed，SPK-03 不能视为通过。
- 若 accepted transaction pooler path 在后续环境出现任一串话：关闭 M1 数据 schema 合并授权，改测 direct connection 或 dedicated/session 替代路径，并记录失败样例。
- 若 transaction pooler prepared statement 相关错误复发：确认 `pgbouncer=true` 与 Prisma/Supavisor 版本；不能修复时不作为 Prisma 默认路径。
- 若 Prisma 注入封装无法强制：后续业务代码必须禁止裸用 Prisma Client，只允许 repository/helper 入口。

## 影响范围

- `packages/db`
- CI `checks`
- 后续 `packages/authz` / `apps/api` repository 设计
- `docs/runbooks/rls-misconfig.md`

## 后续执行要求

1. 任何正式业务 repository/helper 必须复用本 ADR 的事务上下文模式，不得裸读 Prisma Client。
2. staging/production 使用真实客户数据前，必须在对应环境重跑 SPK-03 等价证据，不得复用 dev evidence 代替。
3. 若 Prisma、Supabase pooler、region、pool size 或连接 URL 参数变化，必须重跑 `npm run -w @uzmax/db spike:rls-prisma-pool` 并更新 evidence。
4. `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md` 是本 ADR 的执行证据索引。

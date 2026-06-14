# ADR-001 RLS x Prisma x 连接池

> 状态：proposed
> 日期：2026-06-14
> 关联 spec：`docs/specs/SPK-03-rls-prisma-pool.md`
> 关联验收：A-02 / B-01 / J-06 / K-04
> Owner：项目 owner 确认隔离风险与数据库 secret；AI agent 执行 spike、压测和证据归档
> 时间盒：M0 内 2 个工作日

## 背景

UZMAX 1.0 的租户隔离不能只依赖 repository 层 `where tenant_id = ...`。技术架构 v1.1 要求 Prisma 查询路径在事务内注入 RLS 上下文，并证明连接池并发下 `app.org_id` / `app.tenant_id` 不会串话。

Supabase 官方连接文档把 direct connection 定位为长连接服务路径；direct connection 默认走 IPv6，IPv4-only 环境应使用 Supavisor session pooler。Supavisor transaction pooler 适合短连接/serverless，但不支持 prepared statements。Prisma 官方 Supabase 指南推荐使用 Supavisor session pooler 连接 Prisma。

## 当前决策

当前推荐路径是：

1. 后端生产运行时优先使用 Supavisor session pooler 或可用 direct connection。
2. Prisma 访问必须由封装层统一包裹 `$transaction`；业务代码禁止裸用 Prisma Client。
3. 每次租户数据查询事务开始时必须先注入：
   - `SET LOCAL ROLE <non_bypass_rls_role>`，当连接用户本身有 `bypassrls` 时必须切到受限 role。
   - `set_config('app.org_id', orgId, true)`。
   - `set_config('app.tenant_id', tenantId, true)`。
4. RLS policy 必须默认拒绝缺失上下文：`current_setting(..., true)` 为空时不可返回数据。
5. CI 必须常驻运行 `npm run -w @uzmax/db spike:rls-prisma-pool`，使用 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 和 `UZMAX_RLS_SET_ROLE=uzmax_spk03_ci`。

## 已验证证据

- Supabase dev 项目 `uzmax-dev` / `enyocaykcgcfcswycujg` 上已创建 spike-only `spk03.rls_items` 表、RLS policy、受限 role `uzmax_spk03_ci`。
- Supabase connector SQL 证实 `SET LOCAL ROLE uzmax_spk03_ci` 后 `current_user = uzmax_spk03_ci` 且 `row_security_active('spk03.rls_items') = true`。
- 同一 connector 查询在 tenant A 上下文只返回 tenant A 两条样本行。
- Prisma 6.19.3 client 可在本仓库生成，spike harness 已实现 2000 次并发交错请求、缺失上下文、错误上下文和事务后上下文清除断言。

## 未闭合证据

CI 和本地 Prisma pooler 实测尚未完成，原因是当前仓库没有 Supabase database pooler password 或等价数据库连接 secret：

- GitHub Actions secrets 当前没有 `UZMAX_RLS_DATABASE_URL`。
- `.env.local` 当前没有 Supabase database URL。
- Supavisor session pooler 对 SQL 创建的自定义 login role 返回 `tenant/user ... not found`。
- Supabase SQL 权限不允许 AI agent 通过 `ALTER ROLE postgres PASSWORD ...` 自行轮换 privileged role 密码。

因此，本 ADR 目前仍是 `proposed`。Gate 1 不得通过，直到 `UZMAX_RLS_DATABASE_URL` 被安全配置并且 Prisma harness 在 CI 中跑出 2000 次零串话。

## 备选方案

| 方案 | 优点 | 风险 | 判定 |
|---|---|---|---|
| Session pooler + Prisma `$transaction` + `SET LOCAL ROLE` + `set_config(..., true)` | 对 Prisma 兼容性最好；符合 Supabase Prisma 指南；可在 IPv4 环境运行 | 需要 database pooler password；必须证明上下文不串话 | 当前推荐，待 CI secret 后验收 |
| Transaction pooler + Prisma | 适合短连接/serverless | Supabase 文档提示 transaction mode 不支持 prepared statements；Prisma 需额外禁用 prepared statements 或改适配 | 暂不推荐为默认路径 |
| Direct connection | 最贴近 Postgres 原生行为 | 当前 direct host 未解析成功；可能受 IPv6/IPv4 add-on 限制 | 仅作为有 IPv6 或 IPv4 add-on 时的对照 |
| Repository 强制租户条件 + RLS 纵深防御 | 即使连接池路径受限也能继续设计业务层 | 不能替代 RLS/pooler 证明；仍需 CI 越权测试 | 失败分支时采用 |

## 失败分支

- 若 owner 暂不能提供 database pooler secret：SPK-03 保持 proposed，Gate 1 顺延，不得开始 M1 业务 schema。
- 若 session pooler + Prisma 2000 次并发出现任一串话：改测 direct connection 或 dedicated/session 替代路径，并记录失败样例。
- 若 transaction pooler 无法禁用 prepared statements 或出现不稳定：不作为 Prisma 默认路径。
- 若 Prisma 注入封装无法强制：后续业务代码必须禁止裸用 Prisma Client，只允许 repository/helper 入口。

## 影响范围

- `packages/db`
- CI `checks`
- 后续 `packages/authz` / `apps/api` repository 设计
- `docs/runbooks/rls-misconfig.md`

## 后续签收条件

1. 项目 owner 或受控平台配置 `UZMAX_RLS_DATABASE_URL`，不得提交明文。
2. 本地或 CI 执行：
   - `npm run -w @uzmax/db prisma:generate`
   - `UZMAX_RLS_SET_ROLE=uzmax_spk03_ci npm run -w @uzmax/db spike:rls-prisma-pool`
3. GitHub Actions `checks` 包含 SPK-03 job 且通过。
4. `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md` 更新为 `accepted`。

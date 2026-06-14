# SPK-03 RLS x Prisma x 连接池 Spike

## 目标

在真实 Supabase Postgres 环境中验证 RLS、Prisma 与连接池的组合是否能支撑租户强隔离。重点验证事务内 `set_config(key, value, true)` 注入上下文、查询结束后变量清除、连接池并发下零串话，并把结论写入 ADR-001 与 CI 常驻用例。

## Owner

Owner：AI agent 执行 spike、压测和 ADR 草案；项目 owner 确认隔离风险与改路径决定。

## 时间盒

M0 内 2 个工作日。到期仍无可证明结论时，默认按保守不可行分支推进，不允许无限挂起。

## 触碰模块/文件

- `packages/db` 的 spike-only migration、Prisma schema 片段、RLS policy
- `packages/db` 或 `apps/api` 的 spike 测试 harness
- CI 中的 RLS 并发压测 job
- `docs/adr/ADR-001-rls-prisma-pool.md`
- `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/`
- `docs/runbooks/rls-misconfig.md`
- 本 spec 文件

## 前置条件

- 可访问真实 Supabase Postgres 测试项目，含 transaction/session pooler 连接信息。
- Prisma Client 可连接测试库，CI 可通过安全环境变量访问测试库。
- 准备两个 org/tenant 上下文、隔离样本数据与最小 spike 表；样本表只服务验证，不进入业务 schema。

## 实施步骤

1. 创建最小 spike 表，例如 `spike_rls_items(org_id, tenant_id, payload)`，启用 RLS，并用 `current_setting('app.org_id', true)`、`current_setting('app.tenant_id', true)` 编写只读策略。
2. 实现 Prisma 访问 harness：所有查询必须包在 `$transaction` 内，先执行 `set_config('app.org_id', ..., true)` 与 `set_config('app.tenant_id', ..., true)`，再执行查询。
3. 断言事务结束后上下文变量不可继续影响下一次查询；无上下文查询必须默认拒绝。
4. 在 transaction pooler 下运行两个租户各 1000 次交错请求，断言每次只能读到本租户数据，零越权、零串话、零偶发污染。
5. 对比 Prisma `$transaction` 包裹与 Prisma Client Extension 统一注入两种实现复杂度，只选择一种推荐路径写入 ADR-001。
6. 将并发压测沉淀为 CI 常驻用例，并在 runbook 记录 RLS policy 误配、连接池模式变更、测试库凭据失效的处理步骤。

## 通过条件

- 两租户并发交错压测通过，至少 2000 次请求零串话。
- 未设置上下文、设置错误上下文、事务后复用连接三类负例全部被拒绝或返回空集。
- ADR-001 明确推荐连接方式、Prisma 注入方式、已知风险和回滚路径。
- CI 中存在可重复运行的 RLS spike job，失败时阻断合并。
- `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md` 记录环境、命令、结果、失败样例和签收状态。

## 失败分支

- 若 transaction pooler 下无法证明变量隔离，按顺序验证 session mode 专用连接池、关键路径直连、repository 强制租户条件 + RLS 纵深防御。
- 若 Prisma 无法稳定注入上下文，必须禁止业务代码裸用 Prisma Client，改由 repository/helper 统一封装后再进入实现。
- 若真实 Supabase 测试环境不可用，到期按不可行分支记录 ADR-001，不允许假设可行后继续业务开发。

## 不做什么

- 不实现客户、会话、订单、知识库等业务 schema。
- 不迁移生产数据，不设计完整多租户数据模型。
- 不实现业务 repository 或业务 API。
- 不用纯 mock 代替真实 Supabase/Postgres/连接池结论。

## 验收映射

- J-06：ADR-001 存在，SPK-03 压测用例进入 CI 常驻。
- K-03：实现 PR 必须引用本 spec 编号。
- K-04：触碰 `packages/db`，与任何 schema 相关 PR 全局串行。
- B-01/A-02：本 spike 为后续租户越权自动化验收提供地基证据，但不直接交付业务验收。

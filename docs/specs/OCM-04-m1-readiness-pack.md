# OCM-04 M1 Readiness Pack

## 目标

在 SPK-03、SPK-04 与 ADR-003 已合入后，关闭进入 M1 前的范围歧义：产出 M1 readiness pack、M1 spec 队列、项目 owner 输入排期与平台骨架边界说明。本 spec 只做 M1 开工准备，不实现 M1 业务骨架。

## Owner

Owner：项目 owner 确认 OCM-04 的 M1 范围、历史样本输入排期、后续 spec 队列和合并许可；AI agent 执行文档拆分、复核 M0 证据、暴露 Gate 1 剩余风险。

项目 owner 合并本 spec PR 即表示：OCM-04 readiness pack 的范围确认通过；但 Gate 1 是否 Go 仍以 `docs/preflight/00-opening-control-matrix.md` 的 Gate 1 条件和后续证据复判为准。

## 时间盒

1 个工作日。到期未能确认 M1 scope 或项目输入排期时，顺延 Gate 1，不允许进入 M1 业务骨架实现。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/OCM-04-m1-readiness-pack.md`
  - `docs/evidence/M0/kickoff-readiness-rollup.md`
  - `docs/evidence/M1/**`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 允许新增 `docs/evidence/M1/` 目录与 M1 readiness/eval-seed manifest。
  - 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec、M1 evidence 入口、M1 readiness pack、历史样本 manifest，并更新 M0 kickoff readiness rollup。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `OCM-04`、`M1`、`readiness`、`平台骨架`、`种子评测`、`历史真实咨询` 和现有 `docs/evidence/M1`，当前无活跃 OCM-04/M1 readiness spec 或 M1 evidence 目录。
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`。本 PR 只新增闸门证据与 readiness 文档，不引入真实能力路径；同时按 `docs/evidence/README.md` 的 M1 目录建议建立 M1 evidence。
- 备注：不触发 `docs/evals/README.md`、`docs/contracts/README.md`、`docs/environment.md` 或 `docs/release.md`。

## 前置条件

- PR #9 / SPK-03 已合入，`docs/adr/ADR-001-rls-prisma-pool.md` accepted。
- PR #10 / SPK-04 已合入，`docs/adr/ADR-002-dual-auth-access-context.md` accepted。
- PR #11 / ADR-003 dev-only 签收已合入，`docs/adr/ADR-003-llm-data-processing.md` 为 `accepted_dev_only__customer_llm_blocked`。
- M0 CI 与治理目录可用，`guard:pr-shape`、`guard:doc-triggers` 和完整 CI 已在 GitHub Actions 常驻。

## 实施步骤

1. 新增 OCM-04 spec，锁定本 PR 为 docs-only readiness pack。
2. 新增 M1 evidence 入口、M1 platform readiness pack 与历史样本 manifest。
3. 更新 M0 kickoff readiness rollup，反映 SPK-03、SPK-04、ADR-003 已闭合，下一步为 OCM-04 review。
4. 在 readiness pack 中拆出后续 M1 spec 队列，明确一 spec 一 PR、schema 串行和禁止夹带 M2/M3/M4 能力。
5. 记录历史真实咨询样本导出责任、截止时间、脱敏边界和失败分支。

## 通过条件

- `docs/evidence/M1/M1-platform-skeleton-readiness-pack.md` 明确 M1 scope、非范围、后续 spec 队列、执行顺序、并行限制和 Gate 1 状态。
- `docs/evidence/M1/eval-seed/history-samples-manifest.md` 明确历史样本责任、截止时间、脱敏规则、受控存储规则和缺失时的失败分支。
- `docs/evidence/M0/kickoff-readiness-rollup.md` 不再把 SPK-03、SPK-04、ADR-003 记录为未闭合 P0。
- 本 PR 不改 `apps/`、`packages/`、schema、CI 工作流、provider、connector 或 adapter。
- 本 PR 通过 Prettier、doc triggers、PR shape 与 diff whitespace 检查。

## 失败分支

- M1 scope 过大：降级拆分 spec，OCM-04 不通过。
- 历史样本责任或截止时间未确认：顺延 M1 智能能力相关工作；需要改变里程碑边界时写 ADR。
- 平台骨架依赖缺失：改路径并记录到 readiness pack，不允许直接进入实现。
- M2/M3/M4 能力混入：关闭该范围并拆到对应里程碑 spec。
- 任一 P0 残项无法关闭：Gate 1 保持 No-Go。

## 不做什么

- 不实现 M1 schema、API、authz、后台页面、seed eval runner 或测试。
- 不创建真实客户样本、不提交客户明文、不把样本发给第三方 LLM。
- 不批准 M2 渠道、M3 AI 能力、M4 订单客户能力或 GA-0 真实流量。
- 不修改 GitHub ruleset、CI workflow、Supabase/Render/Vercel/Sentry 配置。

## 验收映射

- A-01：集团层只读健康与风险聚合的后续 scope 准备。
- A-02：租户层授权工作台的后续 scope 准备。
- B-01 / B-02 / B-03 / B-04 / B-05：租户隔离、权限与审计的后续 scope 准备。
- G-06：种子评测集责任、配额和输入排期准备。
- J-05：里程碑证据滚动归档。
- K-03 / K-04：一 PR 一 spec 与并行治理。

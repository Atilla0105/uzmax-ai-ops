# M0-09 M0 Closeout And Gate 1 Handoff

## 目标

在 OCM-04 readiness pack 已通过 PR #12 合入后，修正合并后 evidence 中仍停留在 `ready_for_review` / `pending_pr_review` 的状态，产出 Gate 1 handoff 记录。目标是证明 M0 剩余工作已闭合，同时明确 Gate 1 仍因 M1 项目输入未齐而不得放行业务骨架实现。

## Owner

Owner：项目 owner 确认 M0 closeout 与 Gate 1 No-Go / pending handoff 口径；AI agent 执行证据更新、复核 PR/CI 状态、保持分支卫生。

## 时间盒

0.25 个工作日。若发现 OCM-04 合并事实或 CI 证据不成立，则关闭本 closeout，回到对应 PR/证据修复。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M0-09-m0-closeout-gate1-handoff.md`
  - `docs/evidence/M0/kickoff-readiness-rollup.md`
  - `docs/evidence/M1/README.md`
  - `docs/evidence/M1/M1-platform-skeleton-readiness-pack.md`
  - `docs/evidence/M1/eval-seed/history-samples-manifest.md`
  - `docs/evidence/M1/gates/**`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只更新合并后事实与 Gate 1 handoff 证据。
  - 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec、Gate 1 decision evidence，更新 M0/M1 evidence 状态。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `Gate-1`、`Gate 1`、`OCM-04`、`pending_pr_review`、`ready_for_review`，当前缺少 Gate 1 decision evidence，且 OCM-04 合并后状态需要同步。
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated
- 判断依据：本 PR 只更新 evidence 与 closeout spec，不引入真实 eval/contracts/observability/environment/release 能力路径；无需新增 `docs/evals/README.md`、`docs/contracts/README.md`、`docs/environment.md` 或 `docs/release.md`。

## 前置条件

- PR #12 / OCM-04 已合入 `main`。
- PR #12 的 GitHub Actions CI run `27504014486` 已通过。
- 当前 `main` 无 open PR、无未合并 feature branch、无额外 worktree。

## 实施步骤

1. 新增 M0-09 closeout spec。
2. 更新 M0 kickoff readiness rollup，记录 M0 P0 已闭合，OCM-04 已 accepted。
3. 更新 M1 readiness pack 和 history sample manifest，把 PR #12 merge 后仍 stale 的 signoff 状态改为合并后事实。
4. 新增 Gate 1 decision evidence，明确当前为 No-Go / owner inputs pending，不允许 M1 业务骨架实现。
5. 运行格式、doc trigger、PR shape 与 whitespace 检查。

## 通过条件

- `docs/evidence/M0/kickoff-readiness-rollup.md` 不再声称 OCM-04 等待 merge。
- `docs/evidence/M1/M1-platform-skeleton-readiness-pack.md` 记录 OCM-04 accepted，同时 Gate 1 仍未 Go。
- `docs/evidence/M1/gates/Gate-1-decision.md` 逐条复判 Gate 1 条件并给出 No-Go / pending owner inputs 结论。
- 本 PR 不改 `apps/`、`packages/`、schema、CI workflow、provider、connector 或 adapter。
- 本 PR 通过 Prettier、doc triggers、PR shape 与 diff whitespace 检查。

## 失败分支

- 若发现 PR #12 未实际合并或 CI 未通过：关闭本 PR，回到 OCM-04 修复。
- 若发现 Gate 1 条件已全部满足：改为 Gate 1 Go evidence，但仍不得夹带 M1 实现。
- 若发现 Gate 1 输入缺失需要 owner 决策：保持 No-Go / pending，写清失败分支，不允许以局部实现绕过。

## 不做什么

- 不实现 M1 schema、API、authz、后台页面、eval runner 或测试。
- 不创建、提交或处理真实客户样本。
- 不批准 M2/M3/M4 能力、GA-0 真实流量或客户明文进入第三方 LLM。
- 不修改 GitHub ruleset、CI workflow、Supabase/Render/Vercel/Sentry 配置。

## 验收映射

- J-05：里程碑证据滚动归档，不把 M0/Gate 1 状态推迟到 M6。
- K-03：本 PR 有独立 spec。
- K-04：触碰模块清单用于并行治理；本 PR docs-only，不触碰 schema 串行点。

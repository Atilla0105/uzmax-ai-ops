# M0-08 CI Workflow Hygiene

## 目标

对现有 GitHub Actions CI 做小型治理补强：为 workflow 声明最小 `GITHUB_TOKEN` 权限，取消同一 PR 上被新 commit 取代的旧 CI run，并让基于 diff 的 guard 在 PR 与 `main` push 场景使用有意义的 base ref。

## Owner

Owner：项目 owner 确认本 PR 的 CI 治理口径与合并许可；AI agent 执行 workflow 修改、复核 guard base 行为、产验证证据。项目 owner 仍决定仓库规则、runner 成本与最终合并。

## 时间盒

0.25 个工作日。若 workflow 语法或 ruleset 行为与预期冲突，必须收窄到显式权限与 guard base 修复，取消策略顺延为后续 infra spec。

## Spec 类型

infra

## 触碰模块/文件

- `.github/workflows/ci.yml`
- `docs/specs/M0-08-ci-workflow-hygiene.md`
- `docs/evidence/M0/infra/git-ci-manifest.md`

说明/备注：

本 spec 只调整 CI 编排和对应 evidence，不改变任何 `apps/`、`packages/`、guard 脚本实现或业务代码。

未列出的模块默认不可改。

## 变更预算与路径分类

- path categories：config、docs。
- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：更新 `.github/workflows/ci.yml`；新增本 spec；同步 Git/CI manifest。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `concurrency`、`permissions`、`origin/main`、`guard:eval-triggers`、`guard:pr-shape`；本 PR 不新增 source 文件，只扩展现有 workflow 配置。
- 外部 API/SDK/provider/connector/adapter 依据：GitHub Actions workflow syntax official docs；本 PR 不新增外部 provider、connector 或 adapter。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated。
- 判断依据：本 PR 只更新 CI workflow 和对应 Git/CI evidence，不触发 `docs/doc-gates.md` 的 eval/contracts/observability/environment/release 新文档要求；Git/CI manifest 需要同步当前 CI 配置事实。

## 前置条件

- 当前分支从最新 `main` 创建。
- 当前没有开放 PR；没有未合并本地分支需要串行处理。
- M0-01/M0-07 已启用 CI 与 guard 脚本，本 PR 不改变 guard 语义。

## 实施步骤

1. 在 `.github/workflows/ci.yml` 声明 workflow-level `permissions: contents: read`。
2. 增加 workflow-level concurrency，按 PR number 聚合同一 PR 的 CI run，仅对 `pull_request` 事件启用 `cancel-in-progress`，保留 `main` push 的每次合并后证据。
3. 在 checkout 后解析 guard base：PR 使用 `origin/${{ github.base_ref }}`；push 使用 `github.event.before`，全零或缺失时回退 `HEAD^`。
4. 将 `guard:eval-triggers` 与 `guard:pr-shape` 改为显式使用解析出的 base；`guard:pr-shape` 仅在 PR 事件执行。
5. 更新 Git/CI manifest，记录最小权限、PR 取消策略和动态 guard base。

## 通过条件

- Workflow YAML 可由 GitHub Actions 接受。
- `npm run guard:eval-triggers -- --base origin/main` 通过。
- `npm run guard:doc-triggers` 通过。
- `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M0-08-ci-workflow-hygiene.md` 通过。
- `git diff --check` 通过。
- GitHub Actions `checks` 通过。

## 失败分支

- 若 workflow-level concurrency 影响 main push 证据归档，则改为 job-level 或仅保留权限/base-ref 改动。
- 若 push 事件的 `github.event.before` 不可用，则回退 `HEAD^` 并在 evidence 中记录限制。
- 若 `guard:pr-shape` 的 PR-only 执行被 ruleset 误判为缺失检查，则恢复在 push 上执行但保留动态 base。

## 不做什么

- 不修改 guard 脚本实现。
- 不修改 GitHub ruleset、CODEOWNERS、PR 模板或仓库保护设置。
- 不改 `apps/`、`packages/`、业务代码、schema、provider、connector 或 adapter。
- 不删除、跳过或弱化测试。
- 不使用 `large_change_exception`、`test_weakening_exception` 或 `external_dependency_exception`。

## 验收映射

- K-02：评测触发检查在 PR 与 `main` push 场景使用有意义的 diff base。
- K-03：本 PR 有独立 spec，保持一 PR 一 spec。

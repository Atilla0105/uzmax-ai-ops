# M0-07 Guard Script Hardening

## 目标

从最新 `main` 重新实现一组小型治理补强：`lint` 文件枚举改为 null-delimited 管道，ESLint 复杂度/文件长度覆盖 hand-written `.mjs`/`.cjs` scripts，并把 `guard:pr-shape` 拆成有边界的小模块。同步补充分支生命周期规则，避免有价值的本地分支长期隐藏在未合并、未提交、未转 spec 的状态。本 spec 不替代 SPK-03，也不阻断 SPK-03；它是多 agent 开工前的治理小补强。

## Owner

Owner：项目 owner 确认本 PR 的治理口径与合并许可；AI agent 执行脚本重构、复核现有 guard 行为、产验证证据。项目 owner 仍是唯一真人决策者，AI agent 不得把本 PR 视为 SPK-03 或 Gate 1 放行。

## 时间盒

0.5 个工作日。若脚本拆分导致默认预算无法满足，必须缩小拆分边界或顺延为后续 spec，不得在本 PR 使用 `large_change_exception`。

## Spec 类型

refactor

## 触碰模块/文件

- `AGENTS.md`
- `docs/specs/M0-07-guard-script-hardening.md`
- `package.json`
- `eslint.config.mjs`
- `scripts/guards/pr-shape.mjs`
- `scripts/guards/pr-shape/**`
- `scripts/tests/guards.test.mjs`

说明/备注：

`scripts/tests/guards.test.mjs` 只允许在保持现有行为或补充 guard 回归测试时触碰；不得删除、跳过或弱化测试。

未列出的模块默认不可改。

## 变更预算与路径分类

- path categories：docs、config、source、test。
- source 预算：changed source files <= 6、net source LOC <= 180、new source files <= 5。
- test/generated/lock/config/docs 预计变更：新增本 spec；更新 `AGENTS.md` 分支生命周期规则；更新 `package.json` lint 命令与 `eslint.config.mjs` scripts lint 规则；按需补充 guard 测试。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `pr-shape`、`guard:pr-shape`、`xargs`、`complexity`、`branch`、`分支`；当前只有单文件 `scripts/guards/pr-shape.mjs` 承载 PR shape 行为，没有既有内部模块可扩展。本 PR 新增 `scripts/guards/pr-shape/**` 只作为该 guard 的内部边界拆分，保留 `scripts/guards/pr-shape.mjs` 为稳定 CLI/export 入口。
- 外部 API/SDK/provider/connector/adapter 依据：无；本 PR 不新增外部适配器。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated。
- 判断依据：本 PR 更新既有 agent governance 规则和一个新的 spec，不触发 `docs/doc-gates.md` 中 eval/contracts/observability/environment/release 等新文档要求。

## 前置条件

- PR #5 已合并，当前分支从最新 `main` 创建。
- 本地旧分支 `codex/uzmax-governance-drift-hardening` 不 cherry-pick；只复用经当前代码重新验证后仍成立的治理意图。
- 当前没有开放 PR；本 PR 与 SPK-03 不并行触碰 `packages/db` 或业务代码。

## 实施步骤

1. 将 `lint` 的 `find | xargs` 改为 `find -print0 | xargs -0`，避免路径含空格或特殊字符时丢失参数边界。
2. 将 ESLint complexity/max-lines 规则覆盖到 `scripts/**/*.mjs` 与 `scripts/**/*.cjs`，让 hand-written guard scripts 也受 `AGENTS.md` 的复杂度和文件长度约束。
3. 保留 `scripts/guards/pr-shape.mjs` 为 CLI 和测试导入入口，把参数/PR body/spec/git diff/violations 等逻辑拆到 `scripts/guards/pr-shape/**` 内部模块，新增 source 文件不超过 5 个。
4. 在 `AGENTS.md` 补充分支生命周期规则：每个工作切片结束前必须检查未合并分支与开放 PR；有价值但未合并的工作必须转为 spec/PR、显式 superseded，或删除前留下结论。
5. 跑 guard 测试、lint、PR shape guard 和全量 `npm run check`。

## 通过条件

- `npm run lint` 通过，并实际覆盖 `scripts/**/*.mjs` / `scripts/**/*.cjs` 的 complexity/max-lines。
- `npm test` 通过，现有 `guard:pr-shape` 正/负例行为保持不变。
- `npm run guard:pr-shape -- --base origin/main` 在 PR context 或显式 PR body/spec 下通过。
- `npm run check` 通过。
- `git diff --check` 通过。
- GitHub Actions `checks` 通过。

## 失败分支

- 若 `.mjs` complexity 覆盖暴露出超预算的大重构，先收窄到 `guard:pr-shape` 必要拆分；剩余脚本另开后续 cleanup/refactor spec。
- 若 `pr-shape` 拆分影响 CLI 或测试导入兼容性，回到单入口少量内部 helper 拆分；不得改变 PR Hygiene 语义。
- 若全量 `npm run check` 受外部环境而非本 PR 阻断，必须记录失败命令和原因；不能跳过对应局部门禁。

## 不做什么

- 不实现 SPK-03、SPK-04 或 ADR-003。
- 不改 `apps/`、`packages/`、业务代码、schema、provider、connector 或 adapter。
- 不新增测试弱化例外，不删除测试，不新增 `.skip`/`.only`/`xit`/`xfail`。
- 不修改 GitHub ruleset 或仓库保护设置。
- 不从旧分支 cherry-pick 提交。

## 验收映射

- K-03：本 PR 有独立 spec，保持一 PR 一 spec。
- K-04：用分支生命周期规则和 PR shape 入口边界减少多 agent 并行时的隐藏工作与越界风险。
- 作者期补充验收项：继续落实 M0-01 对 `guard:pr-shape`、ESLint complexity/max-lines、formatter 和 owner approval 的治理要求。

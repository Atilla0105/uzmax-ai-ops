# M7-UI-00 Prototype Migration Index

## Goal

建立 M7 UI 迁移第一波的 prototype migration index / 迁移总索引，把 owner 当前视觉真源：

- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6`

结构化映射到当前 repo 的后台 UI 分层：`packages/ui-tokens`、`apps/admin/src/primitives`、`apps/admin/src/patterns`、`AppShell`、`pages`、fixtures/tests 与 docs/evidence。

本 slice 只产出索引、spec 和 evidence，不实现 UI，不迁移源码，不复制原型原始文件，不提交 `unpacked 6`。

## Owner Confirmation Points

- Owner 当前原型和 `/Users/atilla/源码/unpacked 6` 是 M7+ 后台 UI 视觉与结构迁移输入真源。
- v1.1 后台 IA、权限、安全、RLS、验收、release gate、真实业务事实和 owner 决策边界仍优先于原型视觉表达。
- 本索引可以决定后续 worker 的切片顺序和适配边界，但不等于批准任何页面、fixture、mock、真实数据、GA-0 或 1.0 release。
- `unpacked 6` 必须冻结，只读使用；不得修改、移动、格式化或写入。

## AI Agent Responsibilities

- 读取 `AGENTS.md`、M7-05 spec/evidence、M7 design docs、当前 `apps/admin` / `packages/ui-tokens` 结构和两个输入真源。
- 只做结构化摘要，不保存大段 HTML 原文，不复制敏感样本或原型包。
- 输出 `docs/admin-ui-prototype-migration-index.md`，覆盖目录映射、组件依赖图、页面清单与迁移优先级、第一阶段切片建议、可借鉴/必须适配/禁止直接进入 repo 的内容。
- 输出本 spec 与 M7 evidence，记录命令、关键发现、未完成项和 `gh` / open PR 检查限制。
- 不提交、不 push、不 merge；留下未提交 diff 给 coordinator 验收。

## Timebox

0.5 个工作日。若需要实现 token package、primitives、patterns、AppShell、页面、tests、Playwright、依赖安装、Figma 写入或真实 API wiring，停止并拆给后续 `M7-UI-*` implementation spec。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-00-prototype-migration-index.md`
  - `docs/evidence/M7/M7-UI-00-prototype-migration-index.md`
  - `docs/admin-ui-prototype-migration-index.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 可只读读取 `AGENTS.md`、`docs/specs/M7-05-prototype-visual-source-reset.md`、`docs/evidence/M7/M7-05-prototype-visual-source-reset.md`、`docs/admin-design-system.md`、`DESIGN.md`、`PRODUCT.md`、v1.1 后台设计文档、`apps/admin/**`、`packages/ui-tokens/**`、owner HTML 和 `/Users/atilla/源码/unpacked 6/**`。
  - 不得写入、移动、格式化、删除或提交 `/Users/atilla/源码/unpacked 6`。
- 未列出的 repo 文件默认不可改。

## Change Budget / Path Classification

- Source files changed: 0
- Source net LOC: 0
- New source files: 0
- Docs files changed: 3
- New docs files: 3
- Test/generated/lock/config changes: 0
- External API/provider/connector/adapter basis: none
- Dependency changes: none
- Exceptions: none

## Documentation Trigger Check

- Result: `updated`
- Basis: M7-05 reset changed the UI migration source priority, and parallel page/foundation workers need one repo-local migration index to avoid page-local styling drift, fixture leakage and worker overlap.

## Preconditions

- Worker worktree: `/Users/atilla/.codex/worktrees/m7-ui-00-prototype-migration-index/UZMAX智能运营`
- Worker branch: `codex/m7-ui-00-prototype-migration-index`
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
- Required entry evidence:
  - `pwd` = worker path
  - `git status --short --branch` = `## codex/m7-ui-00-prototype-migration-index`
  - `git branch --show-current` = `codex/m7-ui-00-prototype-migration-index`

## Dispatch Evidence

Worker 00 is docs-only and may run alongside implementation-planning workers only if their write sets do not include the three files above. This slice does not touch `apps/admin/**`, `packages/ui-tokens/**`, package files, lockfiles, generated artifacts, CI/guard scripts, DB schema or release gates.

## Implementation Steps

1. Record and verify worker `pwd`, status and branch.
2. Read required AGENTS/spec/evidence plus M7 design docs and current admin/token structure.
3. Inspect owner HTML and `/Users/atilla/源码/unpacked 6` read-only; summarize directory shape, page inventory, token/component layers and fixture/hook boundaries.
4. Write migration index with source-to-target mapping, dependency graph, v1.1 IA page inventory, first-phase slice recommendations and direct/adapt/forbid rules.
5. Write evidence with commands, findings, open PR check limitations and unresolved items.
6. Run `git diff --check`.
7. Attempt `guard:pr-shape` with base `codex/m7-05-prototype-visual-source-reset` and spec `docs/specs/M7-UI-00-prototype-migration-index.md`; record failure reason if local tooling cannot run or if the guard fails.

## Pass Conditions

- Only the three allowed docs files are changed.
- `docs/admin-ui-prototype-migration-index.md` maps every `unpacked 6` top-level directory to the target repo layer and explicitly covers `packages/ui-tokens`, primitives, patterns, `AppShell`, pages, fixtures/tests and docs/evidence.
- The component graph makes the required order clear: tokens before primitives, primitives before patterns, patterns before shell, shell before pages.
- Page inventory follows v1.1 IA order and marks page ID, source file, migration priority and direct/adapt/forbid boundary.
- First phase recommends foundation before pages and requires page workers to connect real ApiClient/hook plus loading/empty/error/permission/degraded states.
- Evidence records commands, key findings, incomplete items, `git branch --no-merged main` and `gh pr list --state open` limitation if `gh` is unavailable.
- `git diff --check` passes.
- `guard:pr-shape` is attempted against `codex/m7-05-prototype-visual-source-reset` and result is recorded.

## Failure Branch

- If the owner HTML or `unpacked 6` cannot be read, stop at an evidence-only partial index and mark missing input explicitly.
- If `unpacked 6` contains sensitive or production-like values required to explain a pattern, do not copy them; describe only the structure and require a fixture sanitization worker.
- If `guard:pr-shape` cannot run due to missing local runtime or dependency, record the exact command and failure.
- If writing outside the assigned worktree or outside the three allowed files is detected, stop and report for coordinator cleanup/incident handling.

## Out Of Scope

- No `apps/admin/**` source changes.
- No `packages/ui-tokens/**` implementation.
- No primitives, patterns, AppShell, router, page, hook, API client or test migration.
- No dependency changes, lockfile updates, formatter churn or generated files.
- No `/design` page, Playwright screenshot, visual regression or browser verification.
- No raw HTML copy, raw prototype package copy, screenshot storage, fixture import, real customer/order data, phone/account values, secrets or provider keys.
- No commit, push, merge or PR creation.
- No GA-0, production, customer LLM, Telegram Business automatic reply, real traffic or 1.0 approval.

## Acceptance Mapping

- I-05 remains open; this slice only creates the migration index.
- K-03/K-04: one spec, one branch, docs-only touch list.
- M7-05 boundary: prototype-first visual source is preserved, while v1.1/AGENTS/owner boundaries remain authoritative for product, permissions, security, acceptance and release.

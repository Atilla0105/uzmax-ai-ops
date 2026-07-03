# M7-UI-00B Token Foundation Contract

## 目标

为 M7+ 后台 UI 迁移第一波建立 token / foundation implementation contract：把 owner 当前原型 `/Users/atilla/Downloads/运营塔台1.0.html` 与母版源码 `/Users/atilla/源码/unpacked 6` 中的视觉令牌、基础组件、patterns、AppShell 落地边界整理成后续实现 worker 可执行的契约。

本 slice 只产出 spec、evidence 与 `docs/admin-ui-token-foundation-contract.md`。不实现 `packages/ui-tokens`、不修改 `apps/admin/**`、不复制或提交 raw prototype / fixtures、不关闭 I-05。

## Owner Confirmation Points

- owner 已指定当前 HTML 与 `/Users/atilla/源码/unpacked 6` 是 M7+ 后台视觉输入真源，旧后台 shell 和旧 `--uzmax-*` token 只能作为 legacy implementation evidence。
- owner 需要的是第一刀实现契约：先 `packages/ui-tokens + apps/admin primitives + patterns + AppShell`，页面迁移必须等 foundation 合入后再派发。
- owner 最终决定真实产品范围、发布、真实账号、真实客户/订单数据、LLM key、成本和合规风险；本 docs-only slice 不替 owner 做这些决策。

## AI Agent Responsibilities

- 只在指定 worktree 与分支执行，只写本 spec、对应 evidence 和 token foundation contract 三个文件。
- 读取 AGENTS、M7-05 spec/evidence、admin design system、现有 token package、`apps/admin` 结构/scripts/tests、v1.1 正式文档、Impeccable product register 和 owner 输入真源。
- 扫描并记录 repo token/design docs 与 `unpacked 6` 的差异：font、color、spacing、radius、shadow/elevation、motion、density、state colors、component chrome。
- 明确后续 foundation worker 应触碰的文件/目录、页面暂不触碰边界、token 命名/兼容策略、验收要求和 page slice 依赖条件。
- 不改 raw source；不提交、push、merge；留下未提交 docs diff 给 coordinator 验收。

## 时间盒

0.25 个工作日。若需要源码实现、截图基线、storybook/preview 实例、Playwright 测试、依赖安装、doc index 更新或 owner 范围决策，停止并拆到后续 implementation / docs spec。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-00B-token-foundation-contract.md`
  - `docs/evidence/M7/M7-UI-00B-token-foundation-contract.md`
  - `docs/admin-ui-token-foundation-contract.md`
- 未列出的模块默认不可改。

## Change Budget / Path Classification

- Source files changed: 0
- Source net LOC: 0
- New source files: 0
- Docs files changed: <= 3
- Test/generated/lock/config changes: 0
- External API/provider/connector/adapter basis: none
- Exceptions: none

## Documentation Trigger Check

- Result: `updated`
- Basis: M7-05 已把未来 UI 视觉源重置到当前 prototype-first；后续实现前需要一份可执行的 token/foundation contract，否则 page worker 容易把旧 `--uzmax-*` shell、页面局部样式或旧文档表格重新当成实现来源。

## Preconditions

- 已读取 `AGENTS.md`、`docs/specs/M7-05-prototype-visual-source-reset.md`、`docs/evidence/M7/M7-05-prototype-visual-source-reset.md`、`docs/admin-design-system.md`、`packages/ui-tokens/src/tokens.css`。
- 已只读核对 `apps/admin/src` 结构、`apps/admin/package.json` 和 root `package.json` scripts。
- 已读取对应 v1.1 正式文档相关章节：PRD、技术架构、后台设计与前端架构、1.0 验收矩阵。
- 已读取 Impeccable skill、`reference/product.md`，并使用 bundled Node 运行 `context.mjs --target apps/admin`。
- 已只读扫描 `/Users/atilla/Downloads/运营塔台1.0.html` 与 `/Users/atilla/源码/unpacked 6`；`unpacked 6` 必须保持冻结，不得修改、移动、格式化或写入。

## Worktree / Branch Preconditions

- worker worktree: `/Users/atilla/.codex/worktrees/m7-ui-02-token-foundation-contract/UZMAX智能运营`
- worker branch: `codex/m7-ui-00b-token-foundation-contract`
- forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
- entry evidence:
  - `pwd` = `/Users/atilla/.codex/worktrees/m7-ui-02-token-foundation-contract/UZMAX智能运营`
  - `git status --short --branch` = `## codex/m7-ui-00b-token-foundation-contract`
  - `git branch --show-current` = `codex/m7-ui-00b-token-foundation-contract`

## Dispatch Evidence

Worker 02 is docs-only and must be serial with any worker touching the same three docs paths. It is read-only against `packages/ui-tokens/**`, `apps/admin/**`, root entrypoints, `docs/evidence/M7/README.md`, raw HTML and `/Users/atilla/源码/unpacked 6`.

## Implementation Steps

1. Record entry state, required reads and local branch / open PR audit limitations in evidence.
2. Scan current repo token/design docs and `apps/admin` structure for legacy `--uzmax-*`, page-local CSS and missing primitives/patterns.
3. Scan owner HTML and `unpacked 6` for token CSS/TS, primitives, patterns, shell, motion, state and sensitive fixture boundaries.
4. Add `docs/admin-ui-token-foundation-contract.md` with diff table, foundation implementation boundary, token naming/compat strategy, acceptance requirements and page-slice dependencies.
5. Add this spec and `docs/evidence/M7/M7-UI-00B-token-foundation-contract.md`.
6. Validate with `git diff --check` and attempt `guard:pr-shape --base codex/m7-05-prototype-visual-source-reset --spec docs/specs/M7-UI-00B-token-foundation-contract.md --include-worktree`; record failures honestly.

## Pass Conditions

- The contract states that `unpacked 6` / current HTML are the implementation value source when current repo docs or legacy `--uzmax-*` conflict with the prototype.
- The contract includes the required difference table for font, color, spacing, radius, shadow/elevation, motion, density, state colors and component chrome.
- The contract defines the first implementation boundary: `packages/ui-tokens + apps/admin primitives + patterns + AppShell`, including paths to touch and pages not to touch.
- The contract defines token naming and compatibility rules that allow new prototype-derived tokens while preventing old docs or `--uzmax-*` bridge values from controlling new UI implementation.
- The contract defines acceptance requirements for preview/storybook or Vite screenshot, Playwright visual validation, desktop/mobile, loading/empty/error/permission/degraded states and no page-local styling drift.
- The contract states page workers must wait until foundation is merged and verified.
- Evidence records scan commands, key findings, recommended scope, incomplete items and `gh`/open PR audit limitation.
- No source, raw prototype, lockfile, package dependency, README, shared index, `tokens.css` or AppShell changes are made by this slice.

## Failure Branch

- If the raw prototype source cannot be read, record the read failure and make the contract temporary, requiring foundation worker to rescan before implementation.
- If `docs/admin-design-system.md` and `unpacked 6` disagree on visual values, keep this docs-only slice as a contract note and require foundation/doc-sync work to resolve the mismatch through its own spec.
- If local Node/guard tooling is unavailable, record exact command failure and leave the docs diff for coordinator validation.
- If sensitive fixtures from `unpacked 6` are needed to explain UI, do not copy them; reference only file categories and abstract visual/interaction structure.

## Out Of Scope

- No source implementation in `packages/ui-tokens/**` or `apps/admin/**`.
- No `docs/admin-design-system.md`, README, DESIGN, evidence index or shared index update.
- No raw HTML/source move, format, copy-in or screenshot artifact.
- No Storybook, `/design`, preview route, Vite screenshot or Playwright baseline implementation.
- No dependency installation, lockfile update, branch push, merge or PR creation.
- No GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply, external SaaS onboarding or 1.0 release approval.

## Acceptance Mapping

- I-05: `foundation_contract_only_not_closed`. This spec defines the token/foundation implementation contract; lint, `/design` or preview, visual regression and core screen evidence remain future.
- I-01/I-02: `queued_after_foundation`. Desktop core and mobile fallback validation are acceptance requirements for later implementation, not closed here.
- K-03/K-04: one spec / one branch / docs-only touch list.

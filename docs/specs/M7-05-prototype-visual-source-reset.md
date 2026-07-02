# M7-05 Prototype Visual Source Reset

## Goal

把 M7+ 后台 UI 的视觉、组件、动效与交互规则重置为 owner 当前原型体系：`/Users/atilla/Downloads/运营塔台1.0.html` 与 `/Users/atilla/源码/unpacked 6`。旧后台 shell、旧 `--uzmax-*` token、旧视觉文档口径只能作为 legacy implementation / historical evidence，不得继续作为新 UI 的设计依据。

本 slice 只改治理和文档入口，不实现 token package、不改 `apps/admin/**`、不引入 `lucide-react`、不迁移页面、不关闭 I-05。

## Owner Confirmation Points

- 项目 owner 已明确：旧设计规范和规则必须抛弃，不能影响后续工作。
- 后续字体、颜色、组件、动画、交互、布局密度、状态表达与微文案形态服务于当前原型设计，而不是旧后台 shell。
- PRD、技术架构、验收矩阵、权限、安全、RLS、release gate、真实业务事实、真实数据、LLM key、成本与合规边界仍不被视觉源重置覆盖。

## AI Agent Responsibilities

- 在 AGENTS / DESIGN / docs index / M7 evidence / admin design system 中记录新的视觉源优先级。
- 明确 `--uzmax-*` 和现有 admin shell 是 legacy implementation，不能为新页面、组件或迁移切片提供视觉判断。
- 保留 v1.1 文档在产品范围、技术边界、后台 IA、权限、验收和发布治理上的权威性。
- 不改运行时代码、不提交原型原始文件、不提交真实客户/订单/账号/电话等敏感样本。

## Timebox

0.25 个工作日。若需要 token implementation、`/design` 页面、Playwright visual regression、页面迁移或 package dependency 变更，停止并拆到后续 `M7-UI-*` implementation spec。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `AGENTS.md`
  - `README.md`
  - `DESIGN.md`
  - `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
  - `docs/README.md`
  - `docs/admin-design-system.md`
  - `docs/evidence/M7/README.md`
  - `docs/evidence/M7/M7-05-prototype-visual-source-reset.md`
  - `docs/specs/M7-05-prototype-visual-source-reset.md`
- 未列出的模块默认不可改。

## Change Budget / Path Classification

- Source files changed: 0
- Source net LOC: 0
- New source files: 0
- Docs files changed: <= 9
- Test/generated/lock/config changes: 0
- External API/provider/connector/adapter basis: none
- Exceptions: none

## Documentation Trigger Check

- Result: `updated`
- Basis: owner changed the visual-governance source priority for future admin UI work; stale design entrypoints would mislead implementation.

## Preconditions

- Read `AGENTS.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/evidence/M7/README.md`, M7-03/M7-04 status, and the owner-provided source package summary.
- Impeccable context for `apps/admin` was already loaded in this conversation; register is `product`.
- Current root checkout remains coordination-only.

## Worktree / Branch Preconditions

- worker worktree: `/Users/atilla/.codex/worktrees/m7-05-prototype-visual-source-reset/UZMAX智能运营`
- worker branch: `codex/m7-05-prototype-visual-source-reset`
- forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
- entry evidence:
  - `pwd` = worker path
  - `git status --short --branch` = `## codex/m7-05-prototype-visual-source-reset`
  - `git branch --show-current` = `codex/m7-05-prototype-visual-source-reset`

## Dispatch Evidence

Single worker. This docs/governance reset touches M7 design entrypoints only and must be serial with other M7 design/governance edits.

## Incident / Closeout Record

None at start. If edits land in root/main, if prototype raw customer/contact samples are copied, or if runtime source changes occur, stop and record an incident under `docs/incidents/`.

## Implementation Steps

1. Add this spec and M7-05 evidence.
2. Update AGENTS source-of-truth wording so visual implementation source is owner prototype + `unpacked 6` normalized by `docs/admin-design-system.md`.
3. Update DESIGN.md to replace the old bridge hierarchy with prototype-first visual hierarchy.
4. Update `docs/admin-design-system.md` to mark `--uzmax-*` and existing admin shell as legacy-only, remove “until aligned” bridge language, and preserve prototype dimensions where the old doc conflicts.
5. Update README, docs index and M7 evidence index so future UI slices start from the new visual source.
6. Run focused grep for stale bridge wording, `git diff --check`, and docs-only PR-shape if local tooling permits.

## Pass Conditions

- New UI work is directed to `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6`, `docs/admin-design-system.md`, and `DESIGN.md`.
- `--uzmax-*` and existing milestone shell CSS are explicitly legacy implementation only.
- No document tells new UI slices to use old `--uzmax-*` bridge tokens as the preferred visual source.
- v1.1 source-of-truth authority remains intact for product scope, technical boundary, IA, permissions, security, release and acceptance.
- I-05 remains open.
- No `apps/admin/**`, `packages/ui-tokens/**`, lockfile, runtime or test file changes.

## Failure Branch

- If root v1.1 visual wording is too broad to safely supersede in one docs slice, mark only the entrypoint conflict and require a separate v1.1 visual rewrite spec.
- If token package implementation is required, stop and create `M7-UI-00` token/primitives spec.
- If the prototype source contains sensitive raw values needed for examples, do not copy them; reference the package path only.

## Out Of Scope

- No admin UI source migration.
- No token package implementation.
- No `/design` route.
- No Playwright screenshot or visual-regression baseline.
- No dependency changes.
- No GA-0, production, customer LLM, real traffic, Telegram Business automatic reply or 1.0 approval.

## Acceptance Mapping

- I-05: remains open; this slice removes stale visual governance only.
- K-03/K-04: one spec / one branch / docs-only scope.

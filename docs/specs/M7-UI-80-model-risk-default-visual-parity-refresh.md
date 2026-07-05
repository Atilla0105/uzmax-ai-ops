# M7-UI-80 Model Risk Default Visual Parity Refresh

## Goal

Refresh the existing `group.modelRisk` / `模型/成本/风险` visible UI candidate on top of `origin/codex/m7-ui-79-ticket-default-visual-parity-refresh` so the default desktop, collapsed and mobile page body no longer exposes engineering/runtime labels that are absent from the owner HTML and unpacked source.

This is a default-visual-parity cleanup only. Runtime boundaries must remain testable through hidden DOM/data attributes and deliberate local-action toast/evidence. This slice does not implement model DB/API/runtime, provider health, production model routing, cost accounting, export jobs, audit write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-79-ticket-default-visual-parity-refresh`.
- Confirm `group.modelRisk` remains a GROUP layer page: `data-shell-level=group`, active page `group.modelRisk`, group categories `总览/平台/治理`, no tenant nav by default.
- Decide later whether model runtime, provider health, cost accounting, production export or audit closure proceeds through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-80-model-risk-default-visual-parity-refresh` on branch `codex/m7-ui-80-model-risk-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-70 spec/evidence, current group model source/tests, owner HTML, unpacked group model page and fixture before edits.
- Remove default visible occurrences of `degraded`, `mock`, `read-only`, `not production cost metrics`, `no production model routing` and `local action only` from the page body.
- Preserve boundary evidence via hidden DOM/data attributes and local-action toasts.

## Timebox

0.5 workday. If the fix requires shared shell/topbar/sidebar/tokens/router/PageOutlet/API/DB/package/lock changes, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M7-UI-80-model-risk-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-80-model-risk-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
- `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
- `apps/admin/src/pages/group/groupModelRiskFallback.ts`
- `apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`

Unlisted modules are out of scope.

## Budget And Path Classes

- source changed files: <= 3
- source net LOC: <= 160
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/shared shell/sidebar/topbar/router/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none

## Required Reads And Source Mapping

- `AGENTS.md`
- `docs/specs/M7-UI-70-model-cost-risk-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-70-model-cost-risk-source-parity-refresh.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
- `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
- `apps/admin/src/pages/group/groupModelRiskFallback.ts`
- `apps/admin/tests/m7-ui-model-cost-risk-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupModel.ts`

## Impeccable / Design Decision Record

Adopted: product-register guidance for dense operational UI, owner/source-shaped labels, hidden-but-present runtime evidence, local-action-only disclosure when a user deliberately triggers an action, mobile readable/no-overflow fallback.

Rejected: visible default runtime caveat strip, visible `mock/degraded/read-only` KPI suffixes, visible no-production panel subtitles, production-looking runtime claims, shared shell changes and any runtime/release closure claim.

## Pass Conditions

- Default desktop, collapsed and mobile visible body does not include `degraded`, `mock`, `read-only`, `not production cost metrics`, `no production model routing` or `local action only`.
- Runtime boundary strings remain present in hidden DOM/data attributes and focused test evidence.
- Export/model switch/risk resolve still surface local/no-production boundary in toast or action state after deliberate user action.
- `group.modelRisk` remains in group shell with `data-shell-level=group`, group nav categories `总览/平台/治理`, no tenant nav, 232/68 sidebar widths and 320px no overflow.
- No shared shell/topbar/sidebar/tokens/router/PageOutlet/API/DB/package/lock changes.

## Validation Plan

- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-79-ticket-default-visual-parity-refresh --spec docs/specs/M7-UI-80-model-risk-default-visual-parity-refresh.md --include-worktree`
- touched Prettier/ESLint equivalent
- admin build
- focused Playwright default/source parity and existing model-cost-risk spec if practical

## Not Doing

- No model runtime, DB/API/provider health, cost accounting, production export, production route switch or audit write.
- No production metrics/data claim.
- No owner visual acceptance, runtime closure, GA-0, production/staging action, release approval or real customer/order/LLM operation.

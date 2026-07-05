# M7-UI-81 Eval Default Visual Parity Refresh

## Goal

Refresh the existing `tenant.eval` / `评测中心` page on top of `origin/codex/m7-ui-80-model-risk-default-visual-parity-refresh` so the default visible desktop, collapsed-sidebar and mobile bodies no longer carry engineering/runtime caveat labels such as `degraded`, `mock`, `read-only`, `not-production-eval-data`, `no-production-publish` or `manual-review-local-only`, while preserving truthful hidden DOM/data-attribute evidence and deliberate local-action/modal boundaries.

This is a visual-parity and evidence slice. It does not implement eval DB/API/runner/runtime, LLM/provider calls, production eval data, production publish, owner visual acceptance, merge closure, runtime closure, GA-0 or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-80-model-risk-default-visual-parity-refresh`.
- Confirm `tenant.eval` remains TENANT layer only and visible-parity-first.
- Decide later whether real eval DB/API/runner/runtime or production publish proceeds through separate approved specs.
- Keep production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-81-eval-default-visual-parity-refresh` on branch `codex/m7-ui-81-eval-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Read `AGENTS.md`, M7-UI-68 spec/evidence, current eval source/tests, owner HTML, unpacked eval page/constants/hook/fixture and design-system context before claiming evidence.
- Preserve synthetic fallback rows and browser-local run/blind-review/manual-review/publish-preview interactions.

## Timebox

0.5 workday. If the page requires shared shell/topbar/sidebar/router/PageOutlet/registry/API/DB/package/lock/global config/CI guard edits, real eval runtime, production eval data, broad redesign or edits outside the allowed paths, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-81-eval-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-81-eval-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/pages/evals/EvalPage.tsx`
  - `apps/admin/src/pages/evals/EvalViews.tsx`
  - `apps/admin/src/pages/evals/evalFallback.ts`
  - `apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-eval-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-eval-center.spec.ts`
- 未列出的模块默认不可改。

## Change Budget And Path Classification

- source changed files: <= 3
- source net LOC: <= 120
- new source files: 0
- test files changed/added: <= 3 focused Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

```yaml
source:
  - apps/admin/src/pages/evals/EvalPage.tsx
  - apps/admin/src/pages/evals/EvalViews.tsx
  - apps/admin/src/pages/evals/evalFallback.ts
test:
  - apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts
  - apps/admin/tests/m7-ui-eval-default-visual-parity.spec.ts
  - apps/admin/tests/m7-ui-eval-center.spec.ts
docs:
  - docs/specs/M7-UI-81-eval-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-81-eval-default-visual-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-68-eval-center-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-68-eval-center-source-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/evals/EvalPage.tsx`
- `apps/admin/src/pages/evals/EvalViews.tsx`
- `apps/admin/src/pages/evals/evalFallback.ts`
- `apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-eval-center.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx`
- `/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts`
- `/Users/atilla/源码/unpacked 6/hooks/useEvals.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/evals.ts`

| Source | Required use |
|---|---|
| Owner HTML rendered state | Browser-comparable source for eval shell/context and default body anatomy. |
| Unpacked `EvalPage.tsx` | Structured source for header, Production Gate, production version note, 300px list, detail meta, blind review, failed-case diff and reasoned confirmations. |
| Unpacked `useEvals.ts` | Structured source for local-only gate calculation, run, blind review, override and publish state. |
| Unpacked `fixtures/evals.ts` | Field-shape reference for source-shaped synthetic rows. |
| M7-UI-68 evidence | Runtime caveat baseline to refresh: default-visible labels must become hidden evidence or deliberate action/modal evidence. |

## Source Parity Decision

- Default eval body follows owner/unpacked anatomy: header, Production Gate, 300px eval set list, selected-set detail, blind review status/action, failed-case diff and publish/manual review affordances.
- Visible engineering/runtime caveat row is removed from the default body.
- Runtime labels remain present in `data-runtime-state`, `data-runtime-source`, `data-runtime-boundary` and hidden `m7-eval-runtime-note`.
- Deliberate manual-review and publish-preview modals remain allowed to display no-production/local-only boundaries.
- Browser-local interactions remain local state only and are covered by focused tests/evidence.

## Impeccable / Design Decision Record

Adopted: product-register guidance for dense, restrained admin UI; source-like eval anatomy; hidden-but-present runtime boundary evidence; tenant-only shell parity; stable `300px` list geometry; deliberate local-action/modal boundary copy; 320px no-overflow fallback.

Rejected: visible body caveat pollution, old shell visual vocabulary, old `--uzmax-*` as visual source, broad eval redesign, production-looking runtime claims, real eval API/DB/runner wiring, real LLM/provider calls, production eval data, production publish and owner-acceptance/runtime/release claims.

## Pass Conditions

- `tenant.eval` default desktop/collapsed/mobile visible body does not contain `degraded`, `mock`, `read-only`, `not production eval data`, `no production publish` or `manual review local only`.
- Runtime boundary remains inspectable through data attributes and hidden DOM.
- Focused evidence includes owner HTML sample, unpacked mapping, React desktop default, collapsed sidebar, mobile 320, local manual-review modal and metrics.
- Metrics assert tenant shell, topbar/sidebar/category/collapse, source-like eval content, local modal evidence and 320px no overflow.
- Existing eval interaction coverage remains local-only and passing.
- No disallowed files are changed.

## Validation Plan

- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-80-model-risk-default-visual-parity-refresh --spec docs/specs/M7-UI-81-eval-default-visual-parity-refresh.md --include-worktree`
- Touched Prettier/ESLint equivalent for changed source/tests/docs.
- Admin build.
- Focused Playwright:
  - `apps/admin/tests/m7-ui-eval-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-eval-center.spec.ts`

## Failure Branches

- If hidden runtime evidence cannot be preserved without visible body pollution, keep the boundary visible and report the owner-source conflict.
- If dependencies are unavailable after cleanup, record exact dependency failure and do not fake evidence.
- If source geometry requires shared shell/router/PageOutlet/registry/API/DB edits, stop and report the dependency instead of editing forbidden files.

## Not Doing

- No shared shell/topbar/sidebar/router/PageOutlet/registry/API/DB/schema/migration/generated/package/lock/global config/CI guard changes.
- No raw prototype fixture import.
- No eval DB/API/runner/runtime, LLM/provider call, production eval data, production publish, real customer/order-data use, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness or 1.0 release approval.

# M7-UI-40 Eval Center Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `tenant.eval` / 评测中心 candidate with sanitized synthetic mock data on cleanstack branch `codex/m7-ui-40-eval-center-page-cleanstack`, based on `origin/codex/m7-ui-31-orders-visible-ui` (current clean visible UI trunk after #254, commit `b490914860462dc255cb8d878f72d2217b9d018f`).

It does not claim owner visual acceptance, merge, runtime closure, production eval data readiness, production publish readiness, GA-0 or 1.0 release approval.

## Scope

| Item | Value |
|---|---|
| Spec | `docs/specs/M7-UI-40-eval-center-page.md` |
| Route | `tenant.eval` |
| Worker path | `/Users/atilla/.codex/worktrees/m7-ui-40-eval-center-page-cleanstack` |
| Worker branch | `codex/m7-ui-40-eval-center-page-cleanstack` |
| Base | `origin/codex/m7-ui-31-orders-visible-ui` |
| Source target | `apps/admin/src/pages/evals/EvalPage.tsx`; `apps/admin/src/pages/evals/EvalViews.tsx`; `apps/admin/src/pages/evals/evalFallback.ts` |
| Test target | `apps/admin/tests/m7-ui-eval-center.spec.ts` |

## Source Review

- Read `AGENTS.md`.
- Read `PRODUCT.md`, `DESIGN.md` via Impeccable context.
- Read `docs/admin-design-system.md`.
- Read v1.1 source references for eval/page boundaries:
  - `UZMAX智能运营系统-PRD-v1.1.md`
  - `UZMAX智能运营系统-技术架构-v1.1.md`
  - `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
  - `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts`
  - `/Users/atilla/源码/unpacked 6/hooks/useEvals.ts`
  - `/Users/atilla/源码/unpacked 6/fixtures/evals.ts`
- Inspected old eval reference branch for implementation shape only:
  - `origin/codex/m7-ui-40-eval-center-visible-ui:apps/admin/src/pages/evals/EvalPage.tsx`
  - `origin/codex/m7-ui-40-eval-center-visible-ui:apps/admin/src/pages/evals/EvalViews.tsx`
  - `origin/codex/m7-ui-40-eval-center-visible-ui:apps/admin/src/pages/evals/evalFallback.ts`
  - `origin/codex/m7-ui-40-eval-center-visible-ui:apps/admin/tests/m7-ui-eval-center.spec.ts`
- Inspected current implementation/test neighbors:
  - `apps/admin/src/pages/knowledge/*`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`

## React / Owner / Unpacked Mapping

| Source feature | Owner/unpacked source | React implementation |
|---|---|---|
| Page title | `评测中心` in owner/unpacked EvalPage | `EvalPage` header `评测中心` |
| Production Gate | `GATE_INFO`, gate status and disabled publish copy | `m7-eval-gate` shows blocked/running/pass and disables/enables local publish preview |
| Eval set list | Prototype 300px left list | `.uz-eval-list` width `300px`; metrics assert width `300` |
| Selected detail | Unpacked selected set state | `EvalDetail` renders selected set detail |
| prompt/knowledge/model/cases meta | Unpacked `promptV`, `knowV`, `model`, total cases | React meta row shows `prompt`, `knowledge`, `model`, `cases` |
| Blind review | `BLIND_STATUS`, `setBlind` | `BlindToggle` cycles pending/running/done locally |
| Failed-case diff | `expected` / `actual` failed cases | `CaseCard` renders visible `Expected` / `Actual` diff |
| Manual override | `overrideReason` modal path | `ConfirmModal` requires reason; browser-local only |
| Publish preview | `publishReason` modal path | `ConfirmModal` requires reason; local preview only; no production publish |

## Data Boundary

- All data is synthetic and centralized in `evalFallback.ts`.
- IDs use `SYN-EVAL-*`.
- Refs use `controlled://mock/evals/...`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `not production eval data`, `no production publish`, `manual review local only`.
- Manual override and publish confirmation mutate only browser-local state.
- No DB/API/eval runner/LLM/provider call or production publish exists in this slice.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/`

- Owner/source sample: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/owner-html-eval-source-sample.png`
- Owner/source DOM sample or unavailable artifact: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/owner-html-eval-source-dom-sample.json`
- Unpacked source mapping or unavailable artifact: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/unpacked-eval-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/react-eval-center-desktop.png`
- React running screenshot: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/react-eval-center-running.png`
- React manual override modal screenshot: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/react-eval-center-manual-override-modal.png`
- React local publish preview modal screenshot: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/react-eval-center-publish-modal.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/react-eval-center-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/react-eval-center-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-40-eval-center-page-cleanstack/metrics.json`

Metrics summary:

```json
{
  "desktop": {
    "activePageId": "tenant.eval",
    "shellLevel": "tenant",
    "navWidth": 232,
    "topbarHeight": 53,
    "leftListWidth": 300,
    "bodyScrollWidth": 1440,
    "documentScrollWidth": 1440,
    "runtimeLabelsVisible": true,
    "diffVisible": true
  },
  "collapsed": {
    "navWidth": 68,
    "tenantCategories": ["运营", "数据", "智能", "管理", "洞察"],
    "groupButtonCount": 0,
    "groupCategoryCount": 0
  },
  "mobile": {
    "bodyScrollWidth": 320,
    "documentScrollWidth": 320,
    "mobileReadable": true
  }
}
```

## Validation

Local validation used the Codex-bundled Node 24.14.0 / npm 11.9.0 runtime after `npm ci` installed this worktree's isolated `node_modules`.

| Command | Result | Notes |
|---|---|---|
| `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD` | pass | Diff is limited to the 10 allowed spec files. |
| `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD` | pass | No whitespace errors. |
| `npm run format:check` | pass | All matched files use Prettier style. |
| `npm run jscpd` | pass | No duplicates found. |
| `npm run knip` | pass | No unused exports/files reported. |
| `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-40-eval-center-page.md --include-worktree` | pass | `changedFiles: 10`; categories `source: 5`, `test: 1`, `docs: 4`; source `changedFiles: 5`, `netLoc: 594`, `newFiles: 3`. |
| `npx playwright test apps/admin/tests/m7-ui-eval-center.spec.ts` | pass | 2/2 passed; Vite emitted the existing large-chunk warning and Node printed the existing `NO_COLOR`/`FORCE_COLOR` warning. |
| `npm run typecheck` | pass | TypeScript no emit passed. |
| `npm run lint` | pass | ESLint passed. |

## Remaining Deltas

- Runtime eval runner/gate evidence is not wired and remains intentionally blocked.
- Production publish is not wired and remains intentionally blocked.
- Owner visual acceptance is still required after PR review/browser comparison.
- This slice does not alter release acceptance or production readiness state.

## Non-Claims

- No production eval data.
- No production publish.
- No LLM/provider call.
- No backend/API/DB/schema/RLS/runtime closure.
- No owner visual acceptance.
- No GA-0 or 1.0 release approval.

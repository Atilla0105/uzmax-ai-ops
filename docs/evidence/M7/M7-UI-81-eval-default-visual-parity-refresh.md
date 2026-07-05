# M7-UI-81 Eval Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default visual parity for `tenant.eval` / `评测中心` on top of `origin/codex/m7-ui-80-model-risk-default-visual-parity-refresh`. It removes engineering/runtime caveat pollution from the default visible eval body while preserving hidden DOM/data-attribute evidence and deliberate local-action/modal boundaries. It does not claim eval DB/API/runner/runtime, LLM/provider calls, production eval data, production publish, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval.

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-81-eval-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-81-eval-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-81-eval-default-visual-parity-refresh`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/evals` with the Codex runtime Node; read product-register guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior eval spec/evidence: `M7-UI-68`.
- Read current eval source and tests:
  - `apps/admin/src/pages/evals/EvalPage.tsx`
  - `apps/admin/src/pages/evals/EvalViews.tsx`
  - `apps/admin/src/pages/evals/evalFallback.ts`
  - `apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-eval-center.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts`
  - `/Users/atilla/源码/unpacked 6/hooks/useEvals.ts`
  - `/Users/atilla/源码/unpacked 6/fixtures/evals.ts`

## Source Parity Changes

- Replaced the visible `m7-eval-runtime-note` row with hidden runtime evidence.
- Added `data-runtime-boundary` and `data-runtime-source` to the eval page root while preserving `data-runtime-state="degraded"`.
- Removed engineering caveat wording from default gate copy and visible fallback labels/refs while preserving synthetic fallback data ownership.
- Kept deliberate modal/toast boundaries for manual review and local publish preview.
- Updated source-parity and existing interaction tests from visible caveat checks to hidden-present/body-clean checks.
- Added focused Playwright evidence for owner HTML sample, unpacked mapping, default React desktop, local manual-review modal, collapsed sidebar, mobile 320 and runtime-label visibility checks.

## Data And Runtime Boundary

- All eval rows remain centralized synthetic/prototype-shaped fallback data in `evalFallback.ts`.
- Run, blind-review, manual-review override and publish preview actions remain browser-local React state only.
- Runtime labels remain present in DOM/data attributes: `degraded`, `mock`, `read-only`, `not production eval data`, `no production publish`, `manual review local only`.
- Default desktop/collapsed/mobile evidence requires `runtimeLabelsPresent=true` and `runtimeLabelsVisibleInBody=false`.
- No eval API request, DB read/write, eval runner, LLM/provider call, production eval data, audit write or production publish is implemented.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/`

Expected captured artifacts:

- Owner HTML sample screenshot: `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/owner-html-eval-source-sample.png`
- Owner HTML DOM sample: `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/owner-html-eval-source-dom-sample.json`
- Unpacked/source mapping: `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/unpacked-eval-source-mapping.json`
- React desktop default screenshot: `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/react-eval-desktop-default.png`
- React manual-review local boundary modal screenshot: `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/react-eval-manual-local-boundary-modal.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/react-eval-collapsed-default.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/react-eval-mobile-320-default.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/metrics.json`

Measured evidence will record:

- `shellLevel=tenant`, `activePageId=tenant.eval`
- nav `232` expanded / `68` collapsed
- topbar height `52-53`
- eval set list width `300`
- tenant categories `运营/数据/智能/管理/洞察`, group categories/buttons absent
- body/document scrollWidth <= viewport on desktop and mobile
- primary source-like eval content visible: `评测中心`, `Production Gate`, `报价意图`, `红线攻击`, `Expected`, `Actual`, `盲评`
- runtime labels present in DOM/data attributes but not visible in default body
- manual-review modal can deliberately show local/no-production boundary evidence

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-80-model-risk-default-visual-parity-refresh --spec docs/specs/M7-UI-81-eval-default-visual-parity-refresh.md --include-worktree` | pass | Ran after removing temporary `node_modules` symlink and generated artifacts; all changed paths are spec-listed. |
| `node node_modules/prettier/bin/prettier.cjs --check ...` | pass | Touched source/test/docs use Prettier style. |
| `node node_modules/eslint/bin/eslint.js ...` | pass | Focused ESLint equivalent for changed eval source and Playwright specs. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-eval-default-visual-parity.spec.ts apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts apps/admin/tests/m7-ui-eval-center.spec.ts` | pass | 7/7 passed using a manually started `vite preview` on `127.0.0.1:4173`; writes owner/source sample, unpacked mapping, desktop default, manual modal, collapsed/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-81-eval-default-visual-parity-refresh/`. |

Validation environment note: plain `node`, `npm` and `npx` were not on the shell PATH. This worker used `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` and a temporary `node_modules` symlink to `/Users/atilla/.codex/worktrees/m7-ui-65-customer-assets-source-parity-refresh/node_modules`; the symlink and generated `apps/admin/dist`, `test-results` and `playwright-report` artifacts were removed before final status/commit.

## Remaining Non-Claims

- This branch is a visual-parity refresh only; it does not claim owner visual acceptance.
- Eval DB/API/runner/runtime, LLM/provider calls, production eval data and production publish remain future approved specs.
- Mobile is a readable/no-overflow fallback, not a pixel-level mobile redesign.

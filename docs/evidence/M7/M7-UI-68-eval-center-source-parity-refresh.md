# M7-UI-68 Eval Center Source Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.eval` / 评测中心 on stacked branch `codex/m7-ui-68-eval-center-source-parity-refresh`, based on `origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh` (#209 stack).

This slice adds a focused source-parity Playwright pass for the existing eval center page on the latest tenant shell stack. It does not claim eval DB/API/runner/runtime, LLM/provider call, production eval data, production publish, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| root path at entry | `/Users/atilla/Applications/UZMAX智能运营` |
| root branch at entry | `main` |
| root status at entry | `## main...origin/main` plus unrelated untracked files under `apps/admin/src/pages/knowledge/`, `apps/admin/src/pages/team/`, `apps/admin/tests/m7-ui-tenant-entry-topbar.spec.ts`, `docs/evidence/M7/M7-UI-62-tenant-entry-topbar-parity.md`, `docs/specs/M7-UI-32-knowledge-resources-page.md`, `docs/specs/M7-UI-62-tenant-entry-topbar-parity.md` |
| root HEAD at entry | `c39ba3be6bbb993300338ae557ff458b4078b7aa` |
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-68-eval-center-source-parity-refresh` |
| worker branch | `codex/m7-ui-68-eval-center-source-parity-refresh` |
| worker status at entry | `## codex/m7-ui-68-eval-center-source-parity-refresh...origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh` |
| worker entry HEAD | `f6077cb322046b4bc8bcd5fd9d050548bac14c1b` |
| base | `origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh` / #209 stack |

## Required Reads / Mapping

- `AGENTS.md`
- `docs/specs/M7-UI-40-eval-center-page.md`
- `docs/evidence/M7/M7-UI-40-eval-center-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/evals/EvalPage.tsx`
- `apps/admin/src/pages/evals/EvalViews.tsx`
- `apps/admin/src/pages/evals/evalFallback.ts`
- `apps/admin/tests/m7-ui-eval-center.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx`
- `/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts`
- `/Users/atilla/源码/unpacked 6/hooks/useEvals.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/evals.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 eval boundaries: admin §4.7, architecture eval-gate/prompt/knowledge/model-routing boundaries and acceptance gate rules.

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source opened by Playwright for eval center owner/source sample. |
| Unpacked eval page | Source anatomy: title, Production Gate badge, blocked/running/pass states, first blocked action, 300px eval-set list, selected-set meta, blind review status/action, failed-case diff, manual override confirmation and publish confirmation. |
| Unpacked `useEvals.ts` | Local state source for gate calculation, running sets, blind review, first blocked jump, manual override and publish version/toast state. |
| Unpacked `fixtures/evals.ts` | Field-shape source for prototype-like eval sets/cases; React keeps centralized synthetic/degraded fallback labeling. |

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-68-eval-center-source-parity-refresh.md` | Adds scoped source-parity refresh spec for eval center on the latest #209 stack. |
| `apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts` | Adds focused Playwright evidence for owner/source sample, unpacked mapping, tenant shell, active page, nav/topbar/list/detail geometry, tenant-only categories, eval anatomy, degraded caveat, blocked/running/pass modal/collapsed/mobile screenshots and metrics. |
| `docs/evidence/M7/README.md` | Records M7-UI-68 as visible refresh candidate, not runtime or owner acceptance. |
| `docs/admin-ui-page-migration-ledger.md` | Updates the `tenant.eval` row/status to include this source-parity refresh. |

No UI source changes are included unless later validation records a conditional fix.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/`

- Owner/source sample: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/owner-html-eval-source-sample.png`
- Owner/source DOM sample: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/owner-html-eval-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/unpacked-eval-source-mapping.json`
- React blocked desktop screenshot: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/react-eval-blocked-desktop.png`
- React running screenshot: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/react-eval-running.png`
- React manual override modal screenshot: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/react-eval-manual-override-modal.png`
- React pass publish modal screenshot: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/react-eval-pass-publish-modal.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/react-eval-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/react-eval-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/metrics.json`

Expected assertions:

- tenant shell and active page `tenant.eval`;
- topbar height about `53`, nav `232` expanded / `68` collapsed, eval set list about `300`;
- tenant nav sections exactly `运营/数据/智能/管理/洞察`, group sections absent;
- source-like eval title, Production Gate, blocked/running/pass gate states, first blocked action, disabled/enabled publish, detail meta, blind review toggle, Expected/Actual diff, reason-required manual override modal and reason-required local publish preview modal;
- degraded/mock/read-only/not-production-eval-data/no-production-publish/manual-review-local-only caveat visible but not replacing content;
- `320px` mobile body scrollWidth `<= 320`.

Measured React metrics:

| Metric | Blocked desktop | Running desktop | Pass publish modal | Collapsed | Mobile 320 |
|---|---:|---:|---:|---:|---:|
| shell level | `tenant` | `tenant` | `tenant` | `tenant` | `tenant` |
| active page | `tenant.eval` | `tenant.eval` | `tenant.eval` | `tenant.eval` | `tenant.eval` |
| nav width | `232` | `232` | `232` | `68` | `320` |
| topbar height | `53` | `53` | `53` | `53` | `53` |
| page width | `1208` | `1208` | `1208` | `1372` | `320` |
| list/detail width | `300 / 908` | `300 / 908` | `300 / 908` | `300 / 1072` | `320 / 320` |
| body/document scrollWidth | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `320 / 320` |
| tenant categories | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` |
| group category/button count | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` |
| runtime caveat | visible | visible | visible | visible | visible |
| gate state | blocked | running | pass | blocked | blocked |
| publish state | disabled | disabled | enabled | disabled | disabled |

Unpacked source mapping records all key anatomy booleans as true: title, Production Gate, blocked/running/pass states, first blocked action, 300px eval-set list, detail meta, blind review status/toggle, failed-case diff, manual override confirmation and publish confirmation. It also records the 10 source eval-set names and local hook terms `sets/selId/running/publishedVer/publishedAt/publishToast/setBlind/overrideCase/runSet/publish/gotoFirstBlocked`.

## Runtime / Data Boundary

- Eval data remains synthetic/prototype-shaped degraded mock fallback.
- Run, blind review, manual override and local publish preview remain browser-local React state only.
- Production Gate is UI evidence only.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar files are touched.
- No eval DB/API/runner/runtime, LLM/provider call, production eval data or production publish is implemented or implied.

## Branch / PR Hygiene

- `git branch --no-merged main` ran from the worker worktree and listed the current branch `codex/m7-ui-68-eval-center-source-parity-refresh` plus existing stacked visible UI branches.
- `gh pr list --state open --limit 80 --json number,headRefName,title,state,url` could not run because `gh` is not installed or not on PATH in this worker environment.
- Temporary validation `node_modules` symlink was removed before final `git diff --check` and `pr-shape`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh...HEAD` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh --spec docs/specs/M7-UI-68-eval-center-source-parity-refresh.md --include-worktree` | pass | Ran after removing the temporary untracked `node_modules` symlink; docs/test-only diff within spec touch list, `source.changedFiles: 0`. |
| `node node_modules/prettier/bin/prettier.cjs --check ...` | pass | Touched spec/evidence/README/ledger/test files use Prettier style. |
| `node node_modules/eslint/bin/eslint.js apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts` | pass | Focused new test passes ESLint; source was not changed. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` | pass | TypeScript completed cleanly. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts apps/admin/tests/m7-ui-eval-center.spec.ts` | pass | 6/6 passed with manual `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173` because local `npm` is unavailable; writes owner/source sample, unpacked mapping, desktop blocked/running/pass-modal/collapsed/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-68-eval-center-source-parity-refresh/`. |

## Remaining Differences / Non-Claims

- This slice records parity evidence on the current #209 visible stack; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before real eval sets, runner execution, DB/API wiring, LLM/provider calls or production publish actions can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.

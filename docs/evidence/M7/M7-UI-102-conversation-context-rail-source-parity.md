# M7-UI-102 Conversation Context Rail Source Parity Evidence

## Scope

- Spec: `docs/specs/M7-UI-102-conversation-context-rail-source-parity.md`
- Branch: `codex/m7-ui-102-conversation-context-rail-source-parity`
- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-102-conversation-context-rail-source-parity`
- Base/upstream: `origin/codex/m7-ui-31-orders-visible-ui` at `ea4658a`

This slice fixes only the visible `tenant.conversations` right customer context rail source parity in the default synthetic conversation view. It does not claim owner visual acceptance, runtime closure, production readiness, GA-0, real customer/order-data use, Telegram Business automatic reply, customer LLM, staging/production action or 1.0 release approval.

## Entry Evidence

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-102-conversation-context-rail-source-parity` |
| `git status --short --branch` | `## codex/m7-ui-102-conversation-context-rail-source-parity...origin/codex/m7-ui-31-orders-visible-ui` |
| `git branch --show-current` | `codex/m7-ui-102-conversation-context-rail-source-parity` |
| branch hygiene check | `git branch --no-merged main` showed this worker branch plus existing M7/UI and earlier feature branches; no branch was edited or cleaned by this worker. |
| open PR check | `gh pr list --state open` returned existing draft M7 UI PRs; no PR was opened or changed by this worker. |
| dependency setup | Worktree had no `node_modules`; ran the task-provided `pnpm dlx npm@11.9.0 ci` command inside this worktree. `package-lock.json` and package metadata were not changed. |

## Source Reads / Design Boundary

| Source | Use |
|---|---|
| `AGENTS.md` | UZMAX source-of-truth, worktree isolation, spec-first rule, M7+ owner prototype boundary and no legacy `--uzmax-*` visual source. |
| `docs/specs/M7-UI-101-conversation-thread-header-source-parity.md` | Spec shape, budget table, Impeccable section and validation style. |
| `docs/evidence/M7/M7-UI-101-conversation-thread-header-source-parity.md` | Validation/artifact reporting shape and 4174/4175 dedicated-server precedent. |
| `docs/admin-design-system.md` | Current owner prototype plus `/Users/atilla/源码/unpacked 6` are the visual implementation source; conversation workbench remains 3-column with right customer context. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Owner visual source evidence for the current prototype; matched via unpacked source because the HTML is bundled/minified. |
| `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx` | Owner rail source: single initial, handle secondary ref, `累计订单` / `未决问题` / `建档时间`, tags plus `+ 添加`, custom fields, dual-track rows and bottom 2x2 actions. |
| `/Users/atilla/源码/unpacked 6/fixtures/customers.ts` | Owner Dilnoza fixture: `initial: D`, `name: Dilnoza Rashidova`, `tg: @dilnoza_r`, `tgId: 59284013`, `orders: 4`, `spend: ¥1,026`, `open: 退款`, `created: 2026-03-02`, tags and custom fields. |
| `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx` | Current rail render/data ownership point. |
| `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts` | Current `ConversationRow` local type; added optional synthetic source-profile rows only. |
| `apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts` | Current synthetic Dilnoza row; added source-profile rows. |
| `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` | Confirmed rail width/density and quick-action styles already exist; no style edit needed. |
| `apps/admin/src/pages/conversations/ConversationsPage.tsx` | Confirmed rail is rendered in tenant conversation workbench; no page/grid edit needed. |
| `apps/admin/tests/conversationWorkbenchLocators.ts` | Reused existing rail/degraded locators without changing shared helpers. |
| `apps/admin/tests/m7-ui-100-conversation-handoff-default-visual-parity.spec.ts` and `apps/admin/tests/m7-ui-101-conversation-thread-header-source-parity.spec.ts` | Matched route/open/geometry expectations while keeping helper structure distinct for `jscpd`. |

## Owner-Source Comparison Notes

| Area | Owner source | Previous React | M7-UI-102 result |
|---|---|---|---|
| Header avatar | `D` from `cust.initial` | `Di` from two-character Avatar slice of `Dilnoza R.` | `D` via single-character source initial. |
| Header primary | `Dilnoza Rashidova` | `Dilnoza Rashidova` | Preserved. |
| Header secondary | `@dilnoza_r` | `CU-59284013` | `@dilnoza_r`; customer ID moved to profile row only. |
| Stage chip | `售后` | `售后` | Preserved. |
| Profile rows | `客户ID`, `语言`, `旅程阶段`, `累计订单`, `未决问题`, `建档时间` | `客户ID`, `语言`, `旅程阶段`, `未决工单`, `订单快照`, `报价记录` | Source rows exactly. |
| Tags | `VIP`, `退款敏感`, `+ 添加` | `VIP`, `退款敏感` | Added `+ 添加` using existing badge/pill vocabulary. |
| Custom fields | `客户来源 广告投放`, `偏好品类 面部护理`, `累计积分 1280`, `生日 —` | Already present in synthetic fallback | Preserved. |
| Dual track | `报价 06-25 · 教程旅程自动定位`; `售后 06-26 · 红线转人工` | Already present in synthetic fallback | Preserved. |
| Quick actions | `创建工单`, `生成报价`, `身份归并`, `完整档案` in bottom 2x2 | Already present | Preserved. |

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts` | Added optional `profileRows` to the local conversation row type for source-like synthetic profile display. |
| `apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts` | Added Dilnoza source profile rows: customer ID, language, journey stage, cumulative orders, open issue and created date. |
| `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx` | Rail header now uses a single source initial and prefers a real participant ref for the secondary ref, falling back to valid `customerRef` when the parser supplies `customer-ref-unavailable`; profile tab renders `profileRows` when present and suppresses operational refs only for that explicit source-profile path; non-profileRows API data keeps the previous six-row operational fallback; tag section appends `+ 添加`. |
| `apps/admin/tests/m7-ui-102-conversation-context-rail-source-parity.spec.ts` | Added focused Playwright coverage for the synthetic source-profile route plus an API/non-profileRows regression case that confirms `customer-ref-unavailable` does not override `customerRef` and that `未决工单`, `订单快照`, `报价记录` remain visible for API fallback data. |
| `docs/specs/M7-UI-102-conversation-context-rail-source-parity.md` | Added narrow fix spec, allowed files, budgets, source boundary, implementation requirements and validation plan. |

Source budget: changed source files = 3; source net LOC = +24; new source files = 0. No package/lock/config/backend/API/DB/AppShell/global primitive changes.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-102-conversation-context-rail-source-parity/`

- `react-context-rail-1280x800.png`
- `react-context-rail-mobile-320x800.png`
- `react-context-rail-metrics.json`
- `playwright-4175.config.cjs`

Focused metrics from dedicated assigned-worktree Vite server on `127.0.0.1:4175`:

| Metric | Desktop 1280x800 | Mobile 320x800 |
|---|---:|---:|
| nav width | 232 | 320 |
| topbar height | 53 | 53 |
| list width | 316 | 320 |
| rail width | 340 | 320 |
| body scroll width | 1280 | 320 |

Focused rail assertions confirmed:

- Header: `D`, `Dilnoza Rashidova`, `@dilnoza_r`, `售后`.
- Profile rows: `客户ID CU-59284013`, `语言 乌兹别克语（拉丁）`, `旅程阶段 售后`, `累计订单 4 单 · ¥1,026`, `未决问题 退款`, `建档时间 2026-03-02`.
- Profile section exclusions: no `未决工单`, no `订单快照`, no `报价记录`.
- Tags: `VIP`, `退款敏感`, `+ 添加`.
- Custom fields: `客户来源 广告投放`, `偏好品类 面部护理`, `累计积分 1280`, `生日 —`.
- Dual-track rows and quick actions preserved.

## Impeccable / Design Skill Layer

- Adopted: product-register guidance for dense, stable, familiar admin controls that disappear into the task.
- Adopted: owner-source rail profile data and existing rail density/pill/action structure.
- Rejected: global shell/grid/style redesign, new page-local colors/tokens, visible runtime-unavailable copy in the rail header/profile, API/DB/runtime expansion beyond optional local synthetic profile rows, and legacy `--uzmax-*` visual language.
- Detector result after edit: `[]` for `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx` and the new focused test.

## Validation

| Command | Result |
|---|---|
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 ci` | pass; 361 packages installed in this worktree; no vulnerabilities; no package/lock edits. |
| `git diff --check` | pass |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx apps/admin/tests/m7-ui-102-conversation-context-rail-source-parity.spec.ts` | pass, `[]` |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/vite/bin/vite.js apps/admin --host 127.0.0.1 --port 4175 --strictPort` | pass, dedicated assigned-worktree source server for browser validation. |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-102-conversation-context-rail-source-parity.spec.ts --config /tmp/uzmax-m7-ui-102-conversation-context-rail-source-parity/playwright-4175.config.cjs --project=desktop-chromium` | pass, 2/2. |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run typecheck` | pass. |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run build:admin` | pass; Vite emitted existing large-chunk warning, build succeeded. |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run lint` | pass. |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run jscpd` | pass after helper rewrite; final result `Found 0 clones`. |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm dlx npm@11.9.0 run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui` | pass; no PR context detected for this branch, so PR-only checks were skipped. |

Note: first `jscpd` attempt found a 10-line helper clone with M7-UI-101. The test navigation helper was rewritten into selector-state assertions, then `jscpd` and the focused Playwright test were rerun successfully.

Code-quality follow-up validation:

- Fixed Major issue 1: `contextRows()` now preserves the previous operational six-row fallback for API/non-profileRows data and only suppresses `未决工单`, `订单快照`, `报价记录` when explicit `profileRows` exist.
- Fixed Major issue 2: `railHeader()` now ignores the parser sentinel `customer-ref-unavailable` before falling back to valid `customerRef`; a real participant ref still wins.
- Focused Playwright rerun: `2 passed` for source-profile synthetic coverage and API/non-profileRows regression coverage.
- Required reruns after the follow-up: `git diff --check` pass; `npm run typecheck` pass; `npm run build:admin` pass with existing Vite large-chunk warning; `npm run jscpd` pass with `Found 0 clones`.
- Lint follow-up: extracted `sourceProfileRows()`, `operationalContextRows()`, `customerIdentity()` and `fieldOr()` so `contextRows()` stays below ESLint complexity 10 without changing source-profile or API fallback behavior. Required reruns after this lint fix: `npm run lint` pass; `git diff --check` pass; focused M7-UI-102 Playwright pass, `2 passed`; `npm run typecheck` pass.

## Remaining Differences / Non-Claims

- Tags use the existing React `StatusBadge` neutral pill vocabulary rather than inventing page-local colors; this preserves shape/density and avoids new token/color work in this narrow slice.
- Runtime remains synthetic/degraded in local fallback; degraded evidence remains hidden/attribute-based and is not exposed in rail header/profile copy.
- No AppShell, sidebar, topbar, grid, thread, list, composer, API, DB, backend, package, lockfile or global config changes were made.

# M7-UI-101 Conversation Thread Header Source Parity Evidence

## Scope

- Spec: `docs/specs/M7-UI-101-conversation-thread-header-source-parity.md`
- Branch: `codex/m7-ui-101-conversation-thread-header-source-parity`
- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-101-conversation-thread-header-source-parity`
- Base/upstream: `origin/codex/m7-ui-31-orders-visible-ui`

This slice fixes only the visible `tenant.conversations` thread header identity squeeze at 1280px. It does not claim owner visual acceptance, runtime closure, production readiness, GA-0, real customer/order-data use, Telegram Business automatic reply, customer LLM, staging/production action or 1.0 release approval.

## Entry Evidence

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-101-conversation-thread-header-source-parity` |
| `git status --short --branch` | `## codex/m7-ui-101-conversation-thread-header-source-parity...origin/codex/m7-ui-31-orders-visible-ui` |
| `git branch --show-current` | `codex/m7-ui-101-conversation-thread-header-source-parity` |
| root/main checkout | Read-only reference. An accidental spec file write to root was removed before closeout; remaining root untracked files were pre-existing/unrelated and not touched. |

## Source Reads / Design Boundary

| Source | Use |
|---|---|
| `AGENTS.md` | UZMAX source-of-truth, worktree isolation, spec-first and allowed-file boundaries. |
| `/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx` | Owner header source: compact 46px row, readable identity/subtitle, status/SLA chips and compact actions. |
| `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` | Current React header styles and ownership point. |
| `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx` | Confirmed context rail is out of scope. |
| `apps/admin/tests/m7-ui-100-conversation-handoff-default-visual-parity.spec.ts` | Compared existing route/open/geometry coverage and default header text requirements while keeping M7-UI-101 helpers locally distinct for jscpd. |
| Impeccable product register/context | Adopted dense product UI guidance; no decorative redesign. Detector result after edit: `[]`. |

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` | CSS-only header fix: gives `.uz-conv-thread__title` an 82px readable floor, compacts header gap/badge/action padding and keeps the 46px source-like row geometry. No grid/AppShell/runtime changes. |
| `apps/admin/tests/m7-ui-101-conversation-thread-header-source-parity.spec.ts` | Adds focused Playwright coverage for visible default header copy, hidden degraded copy exclusion, 1280x800/840 geometry, measured readable identity width, compact action width and 320px mobile no-overflow fallback; the CI follow-up keeps route/navigation/layout helpers structurally distinct from M7-UI-100 so `jscpd` reports no clones. |
| `docs/specs/M7-UI-101-conversation-thread-header-source-parity.md` | Records narrow header-only spec, allowed files, budgets, source boundary and validation plan. |

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-101-conversation-thread-header-source-parity/`

- `react-thread-header-1280x800.png`
- `react-thread-header-1280x840.png`
- `react-thread-header-mobile-320.png`
- `react-thread-header-metrics.json`

Focused metrics from dedicated assigned-worktree Vite server on `127.0.0.1:4174`:

| Metric | 1280x800 | 1280x840 |
|---|---:|---:|
| nav width | 232 | 232 |
| topbar height | 53 | 53 |
| list width | 316 | 316 |
| thread width | 392 | 392 |
| rail width | 340 | 340 |
| body scroll width | 1280 | 1280 |
| header height | 47 | 47 |
| title width | 82 | 82 |
| `Dilnoza R.` measured text width | 68 | 68 |
| `Telegram Bot` measured text width | 70 | 70 |
| takeover button width | 93 | 93 |

Default visible header primary text:

`Dilnoza R. Telegram Bot · UZ-20413 · 乌兹别克语（拉丁） 待人工 SLA 04:12 AI 已暂停 接管会话 T`

Visible header exclusions confirmed:

- no `只读预览`
- no `runtime-unavailable`
- no `放回 AI`

Mobile fallback:

- `320px` viewport body scroll width: `320`

## Validation

| Command | Result |
|---|---|
| `git diff --check` | pass |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips` | pass, `Found 0 clones` |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-101-conversation-thread-header-source-parity.md apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx apps/admin/tests/m7-ui-101-conversation-thread-header-source-parity.spec.ts` | pass |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` | pass, `[]` |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/vite/bin/vite.js apps/admin --host 127.0.0.1 --port 4174 --strictPort` | pass, dedicated assigned-worktree source server for browser validation. |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-101-conversation-thread-header-source-parity.spec.ts --config /tmp/uzmax-m7-ui-101-conversation-thread-header-source-parity/playwright-4174.config.mjs --project=desktop-chromium` | pass, 1/1 |
| `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-100-conversation-handoff-default-visual-parity.spec.ts --config /tmp/uzmax-m7-ui-101-conversation-thread-header-source-parity/playwright-4174.config.mjs --project=desktop-chromium` | pass, 1/1 |

Note: port `4173` was already occupied by another local preview and returned stale squeezed-header metrics, so final browser validation used a dedicated `4174` source server from this assigned worktree.

## Remaining Differences / Non-Claims

- Header remains compact and source-like; long subtitle still ellipsizes after readable `Telegram Bot`, as expected in a 392px residual thread column.
- Runtime remains synthetic/degraded in local fallback and no `/conversation-ticket/conversations/*/handoff` POST is made by this test.
- No conversation grid, AppShell, rail, list, composer, fallback data, runtime or backend behavior changed.

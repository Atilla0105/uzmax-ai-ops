# M7-UI-60 Conversation Workbench Detail Parity Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This slice calibrates the visible `tenant.conversations` detail surface on top of `origin/codex/m7-ui-31-orders-visible-ui` / #248. It remains mock/degraded UI only and does not claim owner final visual acceptance, runtime/API/DB/authz closure, production readiness, GA-0 or 1.0 release approval.

## Worktree Boundary

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-60-conversation-detail-parity-cleanstack`
- Branch: `codex/m7-ui-60-conversation-detail-parity-cleanstack`
- Base: `origin/codex/m7-ui-31-orders-visible-ui`
- Pre-edit worker record: `pwd=/Users/atilla/.codex/worktrees/m7-ui-60-conversation-detail-parity-cleanstack`; `git status --short --branch` showed a clean branch tracking `origin/codex/m7-ui-31-orders-visible-ui`; `git branch --show-current=codex/m7-ui-60-conversation-detail-parity-cleanstack`.
- Root/main checkout: coordination/read-only source only; no scoped source edits performed there.

## Source Material Read

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-20-conversation-workbench-page.md`
- `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- `docs/evidence/M7/M7-UI-58-conversation-viewport-parity.md`
- `docs/specs/M7-UI-62B-tenant-entry-visible-proof.md`
- `docs/evidence/M7/M7-UI-62B-tenant-entry-visible-proof.md`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`
- `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationList.tsx`
- `/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx`
- `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx`
- `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/conversations.ts`
- Current `apps/admin/src/pages/conversations/**` and conversation Playwright specs.

## Implementation Summary

| Area | Change |
|---|---|
| List detail | Tightened header count badge, filter pills, row/avatar/text/meta density, selected stripe and ellipsis treatment against `ConversationList.tsx`. |
| Thread detail | Tightened participant header, action buttons, internal system pill, message metadata, AI trace label/table and composer controls against `MessageThread.tsx` and `Composer.tsx`. |
| Context rail | Moved quick actions into a rail footer sibling so the profile/tags/fields/guidance/notes area scrolls internally and the action area remains visible like `ContextRail.tsx`. |
| Runtime honesty | Existing degraded/mock labels remain in place but visually secondary; Business send, external human send, aggregation and WS are still disabled/not closed. |
| 62B boundary | Preserves selected-tenant entry into tenant shell, tenant-only sidebar/topbar/context and no mixed universal dashboard fallback. |

Source budget: 2 source files changed, raw source diff `20 insertions` / `21 deletions`; PR-shape reported `source.changedFiles=2`, `source.netLoc=0`, `source.newFiles=0`.

## Browser Comparison

Artifacts are under `/tmp/uzmax-m7-ui-60-conversation-detail-parity/`:

- `owner-html-conversation-detail-1280x840.png` when `/Users/atilla/Downloads/运营塔台1.0.html` exists locally.
- `owner-html-conversation-detail-unavailable.json` when the frozen local owner HTML is absent, including CI.
- `react-conversation-detail-1280x840.png`
- `react-conversation-detail-mobile-320.png`
- `conversation-detail-metrics.json`
- `conversation-detail-mobile-metrics.json`

Local owner HTML existed during this run, so the owner capture was recorded. CI is expected not to have the local owner HTML path; the test keeps owner sampling conditional and still runs the hard React geometry assertions.

| Metric | Owner HTML | React | Result |
|---|---:|---:|---|
| Viewport | `1280x840` | `1280x840` | matched capture size |
| Body scroll width | `1280` | `1280` | no horizontal body overflow |
| Body scroll height | `840` | `840` | no global vertical overflow |
| Workbench width | `1048` | `1048` | matched |
| Workbench height | `788` | `787` | React topbar baseline is 1px taller |
| Nav width | owner source shell target | `232` | expanded sidebar retained |
| Topbar height | owner shell `52` region | `53` | current React baseline retained |
| List width | `316` | `316` | matched |
| Thread width | `392` | `392` | matched |
| Rail width | `340` | `340` | matched |
| Rail right edge | `1280` | `1280` | contained |
| Visible list rows | `8` | `8` | matched acceptance floor |
| Selected row stripe | source 3px status stripe | `3px` | matched |
| Row avatar | source 22px avatar | `22x22` | matched |
| Active filter | dark owner pill | `rgb(26, 29, 33)` | source-like, not loud red |
| Rail body | internal scroll expected | `railBodyScrollable: true` | matched |
| Quick actions footer | visible in owner detail | bottom `840`, width `339` | visible and contained |
| Sidebar groups | owner grouped tenant sidebar | `运营, 数据, 智能, 管理, 洞察` | tenant-only groups retained |
| Mobile fallback | readable/no horizontal overflow | `bodyScrollWidth: 320`, `workbenchWidth: 320`, `quickActionsWidth: 320` | passed |

## Impeccable Record

- Context loaded via project Impeccable skill for `apps/admin/src/pages/conversations`.
- Product register read and applied: dense, familiar, status-first operational UI rather than decorative redesign.
- Adopted: source-derived geometry, internal scroll ownership, secondary degraded labels, fixed rail action footer and mobile readable fallback.
- Rejected: old shell/token visual language, assistant-invented layout, page redesign, louder mock banners, runtime/API invention and owner-acceptance claims.
- Detect result on changed UI source: `[]`.

## Validation

All commands ran from the assigned worktree. The local shell had bundled `node` but no `npm`/`npx`; dependencies were copied into this worktree's ignored `node_modules/` for worker isolation, and equivalent direct Node entrypoints were used.

| Command | Result |
|---|---|
| `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui` | pass; only allowed 7 files |
| `git diff --check origin/codex/m7-ui-31-orders-visible-ui` | pass |
| `node node_modules/prettier/bin/prettier.cjs --check <allowed 7 files>` | pass |
| `node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips` | pass; `No duplicates found` |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-60-conversation-detail-parity.md --include-worktree` | pass; `source.changedFiles=2`, `source.netLoc=0`, `source.newFiles=0` |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass; Vite large chunk warning only |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-conversation-detail-parity.spec.ts --reporter=line` | pass; `2 passed` |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts --reporter=line` | pass; `9 passed` |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | pass |
| `find apps packages scripts ... -print0 \| xargs -0 /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/eslint/bin/eslint.js eslint.config.mjs dependency-cruiser.config.cjs playwright.config.ts` | pass |

## Remaining Visual Deltas

- React topbar starts at `y=53` while owner HTML measured the content region from `y=52`; this is the current React shell baseline and not changed in this slice.
- React keeps explicit degraded/read-only/runtime caveat copy required by UZMAX governance; owner prototype does not carry the same runtime-disclaimer weight.
- Mobile is readable/no-overflow fallback only; exact mobile pixel parity remains out of scope.

## Non-Claims

No DB/API/runtime/authz foundation, WebSocket closure, Telegram Business send, human external send, customer aggregation runtime, owner final visual acceptance, production readiness, GA-0 or 1.0 release approval is claimed.

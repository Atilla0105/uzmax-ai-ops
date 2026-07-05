# M7-UI-60 Conversation Workbench Detail Parity Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This slice calibrates the visible `tenant.conversations` detail surface on top of M7-58/M7-59. It does not claim owner visual acceptance, runtime/API closure, production readiness, GA-0 or 1.0 release approval.

## Worktree Boundary

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-60-conversation-detail-parity`
- Branch: `codex/m7-ui-60-conversation-detail-parity`
- Base: `origin/codex/m7-ui-59-sidebar-icon-density-parity`
- Root/main checkout: coordination only; no scoped source work performed there.

## Source Material Read

- `AGENTS.md`
- `docs/specs/M7-UI-20-conversation-workbench-page.md`
- `docs/evidence/M7/M7-UI-20-conversation-workbench-page.md`
- `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- `docs/evidence/M7/M7-UI-58-conversation-viewport-parity.md`
- `docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md`
- `docs/evidence/M7/M7-UI-59-shared-sidebar-icon-treatment-parity.md`
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
| Import scope | Lucide imports remain named imports: `Bot`, `Hand`, `MessageSquareQuote`, `MoreHorizontal`, `Paperclip`, `SendHorizontal`. No namespace import or AppShell/token/API change. |

Source budget: 2 source files changed, raw source diff `20 insertions` / `21 deletions`; PR-shape reported `source.netLoc=0`, no new source files.

## Browser Comparison

Artifacts are under `/tmp/uzmax-m7-ui-60-conversation-detail-parity/`:

- `owner-html-conversation-detail-1280x840.png`
- `react-conversation-detail-1280x840.png`
- `react-conversation-detail-mobile-320.png`
- `conversation-detail-metrics.json`
- `conversation-detail-mobile-metrics.json`

| Metric | Owner HTML | React | Result |
|---|---:|---:|---|
| Viewport | `1280x840` | `1280x840` | matched capture size |
| Body scroll width | `1280` | `1280` | no horizontal body overflow |
| Body scroll height | `840` | `840` | no global vertical overflow |
| Workbench width | `1048` | `1048` | matched |
| Nav width | n/a owner shell source target | `232` | M7-59 expanded sidebar retained |
| Topbar height | owner shell `52` region | `53` | M7-58/M7-59 React baseline retained |
| List width | `316` | `316` | matched |
| Thread width | `392` | `392` | matched |
| Rail width | `340` | `340` | matched |
| Rail right edge | `1280` | `1280` | contained |
| Visible list rows | `8` | `8` | matched acceptance floor |
| Selected row stripe | source 3px status stripe | `3px` | matched |
| Row avatar | source 22px avatar | `22x22` | matched |
| Active filter | dark owner pill | `rgb(26, 29, 33)` | source-like, not loud red |
| Rail body | internal scroll expected | `railBodyScrollable: true` | matched |
| Quick actions footer | visible in owner detail | bottom `840`, right `1280` | visible and contained |
| Sidebar groups | owner grouped tenant sidebar | `运营, 数据, 智能, 管理, 洞察` | M7-59 grouping retained |
| Mobile fallback | readable/no horizontal overflow | `bodyScrollWidth: 320`, `workbenchWidth: 320`, `quickActionsWidth: 320` | passed |

## Unpacked Source Comparison

- `ConversationList.tsx`: React preserves list `316px`, source-like filter row, 8 visible rows at desktop, 22px row avatar and 3px status stripe.
- `MessageThread.tsx`: React preserves compact header/actions, inbound/outbound bubble rhythm, centered internal pill and AI trace table.
- `Composer.tsx`: React preserves visible draft textarea/tool row/send rhythm while disabled with truthful degraded runtime caveat.
- `ContextRail.tsx`: React preserves `340px` rail, compact profile/tabs/sections/tags/custom fields/guidance/notes density and fixed quick-action footer.
- `fixtures/conversations.ts`: React still uses centralized synthetic/degraded fallback state; no runtime/API/DB foundation was added.

## Impeccable Record

- Context loaded via project Impeccable skill for `apps/admin/src/pages/conversations`.
- Adopted: dense operational UI, source-derived geometry, internal scroll ownership, secondary degraded labels and mobile fallback.
- Rejected: namespace lucide import churn, old shell/token visual language, page redesign, louder mock banners, runtime/API invention and owner-acceptance claims.
- Detect result on changed UI source: `[]`.

## Validation

| Command | Result |
|---|---|
| `node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx apps/admin/tests/m7-ui-conversation-detail-parity.spec.ts docs/specs/M7-UI-60-conversation-detail-parity.md` | pass |
| `find apps packages scripts ... -print0 \| xargs -0 node node_modules/eslint/bin/eslint.js eslint.config.mjs dependency-cruiser.config.cjs playwright.config.ts` | pass |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | pass |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass; Vite large chunk warning only |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-conversation-detail-parity.spec.ts --config=playwright.config.ts --reporter=line` | pass, `2 passed` |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts apps/admin/tests/m7-ui-conversation-detail-parity.spec.ts --config=playwright.config.ts --reporter=line` | pass, `15 passed` |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-*.spec.ts --config=playwright.config.ts --reporter=line` | pass, `110 passed` |
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx` | pass, `[]` |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-59-sidebar-icon-density-parity --spec docs/specs/M7-UI-60-conversation-detail-parity.md --include-worktree` | pass; `source.changedFiles=2`, `source.netLoc=0`, `source.newFiles=0` |

All Node commands used `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH`.

## Remaining Visual Deltas

- React topbar starts at `y=53` while owner HTML measured the content region from `y=52`; this is the existing M7-58/M7-59 React shell baseline and not changed in this slice.
- React keeps explicit degraded/read-only/runtime caveat copy required by UZMAX governance; owner prototype does not carry the same runtime-disclaimer weight.
- Mobile is only no-overflow/readable fallback; exact mobile pixel parity remains out of scope.

## Non-Claims

No DB/API/runtime foundation, WebSocket closure, Telegram Business send, human external send, customer aggregation runtime, owner acceptance, production readiness, GA-0 or 1.0 release approval is claimed.

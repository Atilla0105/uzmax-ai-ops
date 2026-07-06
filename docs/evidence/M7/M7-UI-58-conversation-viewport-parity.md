# M7-UI-58 Conversation Viewport Parity v2 Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This clean-stack branch replays accepted `M7-UI-58 conversation viewport parity v2` changes on `origin/codex/m7-ui-31-orders-visible-ui` at `01388a0c428a9b07c981367d91ebb445b0465e74`. It fixes a narrow desktop viewport parity issue for `tenant.conversations`: the desktop shell remains locked to the viewport while conversation list/thread/rail content scrolls internally.

It does not claim old failed-stack cleanup, owner visual acceptance, conversation runtime closure, merge closure, GA-0, production readiness or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- Route: `tenant.conversations`
- Branch: `codex/m7-ui-58-conversation-viewport-parity-cleanstack`
- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-58-conversation-viewport-parity-cleanstack`
- Base: `origin/codex/m7-ui-31-orders-visible-ui`
- Base SHA: `01388a0c428a9b07c981367d91ebb445b0465e74`
- Replayed accepted commit: `05f23fe9e20a8826d08c9bd5e36534509e210b87`
- Source targets: `apps/admin/src/shell/AppShell.css`, `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
- Test target: `apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`

## Source Review

- Read `AGENTS.md` in root and in the assigned worktree.
- Read the v1.1 source-of-truth docs for product scope, technical boundaries, admin IA/front-end quality and acceptance blockers.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, and Impeccable product-register guidance.
- Ran Impeccable context for `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`.
- Inspected current shell/outlet/conversation implementation:
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/conversations/ConversationsPage.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationList.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx`
- Replayed only accepted commit `05f23fe9e20a8826d08c9bd5e36534509e210b87`; no old failed stack merge or unrelated rescue was used.

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate after v2 fix | Result |
|---|---|---|---|
| Desktop shell height | Owner HTML/prototype keeps the operational shell viewport-locked | React desktop now keeps `.uz-app-shell`, nav, topbar and workbench within the viewport | Aligned for viewport lock |
| Workbench columns | Unpacked source uses list `316px`, thread `flex:1`, context rail `340px` | React preserves fixed list `316px` and rail `340px`, and uses a shrinkable middle column so the rail right edge stays inside the viewport | Aligned |
| Scroll ownership | Owner workbench keeps shell fixed; lists/threads/rail scroll internally | React sets definite shell/workspace/outlet heights; list rows, message body and rail body keep internal overflow | Aligned |
| Collapsed nav | Owner shell collapse keeps topbar/nav anchored | React collapse keeps nav width `68`, nav/topbar y `0` and no body scroll | Covered by focused test |
| Mobile fallback | Prototype is desktop-primary | React mobile keeps 320px no horizontal overflow; body vertical scroll remains allowed | Required fallback |

## Implementation Notes

- `.uz-app-shell` now has a definite desktop `height: 100vh` as well as `min-height`.
- `.uz-app-nav` receives desktop `height: 100vh` so the nav does not stretch to content height.
- `.uz-app-main`, `.uz-shell-workspace` and `.uz-conversation-outlet` receive the missing `min-height: 0` / flex behavior needed for the conversation workbench to consume the remaining topbar height.
- `.uz-page-conversations` keeps `316px` list and `340px` rail columns, while the middle thread column now uses `minmax(0, 1fr)` so the grid fits the actual shell workspace at `1280x840`.
- The existing mobile media query resets shell/nav height to `auto` and keeps body vertical scroll available for fallback readability.
- No conversation runtime, fallback data, API routes, DB, authz, handoff or tenant-switching logic changed.

## Data Boundary

- Default no-API behavior remains synthetic/degraded/read-only.
- The viewport parity test routes the list request to a Vite HTML fallback to prove the default degraded fixture path still shows synthetic rows/messages.
- No production customer data, conversation runtime mutation, real handoff, DB/API wiring, provider call, LLM call or external connector is introduced.

## Validation

Current clean-stack validation:

- `pwd`
  - `/Users/atilla/.codex/worktrees/m7-ui-58-conversation-viewport-parity-cleanstack`
- `git status --short --branch`
  - clean branch after commit; branch ahead of `origin/codex/m7-ui-31-orders-visible-ui`.
- `git branch --show-current`
  - `codex/m7-ui-58-conversation-viewport-parity-cleanstack`
- `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD`
  - passed.
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-58-conversation-viewport-parity.md --include-worktree`
  - passed; `changedFiles: 7`, categories `source: 2`, `test: 1`, `docs: 4`, source `changedFiles: 2`, source `netLoc: 16`, new source files `0`.
- `npx playwright test apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`
  - blocked in this clean worktree because local dependencies are not installed: Playwright config cannot import `@playwright/test`.
- `npm run typecheck`
  - blocked in this clean worktree because `node_modules/typescript/lib/tsc.js` is missing.
- `npm run lint -- apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`
  - blocked in this clean worktree because `node_modules/eslint/bin/eslint.js` is missing.

No dependency install, lockfile change, DB/API change, runtime change or global config change was performed in this clean-stack worktree.

## Browser Evidence

Accepted commit artifact references use the focused test's `/tmp/uzmax-m7-ui-58-conversation-viewport-parity-v2/` output path. This clean-stack replay did not regenerate them because Playwright was blocked by missing local `@playwright/test` dependencies:

- Desktop screenshot: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity-v2/react-conversation-viewport-desktop.png`
- Collapsed screenshot: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity-v2/react-conversation-viewport-collapsed.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity-v2/react-conversation-viewport-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity-v2/react-conversation-viewport-metrics.json`

Metrics summary:

- React desktop at `1280x840`: `activePageId=tenant.conversations`, `shellLevel=tenant`, `bodyScrollHeight=840`, `bodyScrollWidth=1280`, `nav.y=0`, `topbar.y=0`, `nav.width=232`, `workspace.width=1048`, `workbench.width=1048`, `workbench.height=787`, `list.width=316`, `thread.width=392`, `rail.width=340`, `rail.right=1280`, `rows=8`, `messages=6`.
- React collapsed at `1280x840`: `bodyScrollHeight=840`, `bodyScrollWidth=1280`, `nav.y=0`, `topbar.y=0`, `nav.width=68`, `workspace.width=1212`, `workbench.width=1212`, `workbench.height=787`, `rail.right=1280`, `rows=8`, `messages=6`.
- React mobile `320px`: focused Playwright asserts `document.body.scrollWidth <= 320`; body vertical scroll remains allowed for fallback readability.

## Known Visual / Runtime Deltas

- This is a viewport parity fix for the existing conversation candidate; it is not a full owner visual acceptance pass.
- Mobile remains a readable fallback, not a source-identical desktop workbench.
- Runtime stays degraded/mock/read-only unless the existing conversation runtime endpoints respond; no runtime closure is claimed.

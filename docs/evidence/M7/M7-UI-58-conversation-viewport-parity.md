# M7-UI-58 Conversation Viewport Parity v2 Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This v2 branch cleanly rebuilds the old #200 viewport fix on `origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2` at `286bf0222dac64e9ccaa518e50038f3839d98512`. It fixes a narrow desktop viewport parity issue for `tenant.conversations`: the desktop shell remains locked to the viewport while conversation list/thread/rail content scrolls internally.

It does not claim old failed-stack cleanup, owner visual acceptance, conversation runtime closure, merge closure, GA-0, production readiness or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- Route: `tenant.conversations`
- Branch: `codex/m7-ui-58-conversation-viewport-parity-v2`
- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-58-conversation-viewport-parity-v2`
- Base: `origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2`
- Base SHA: `286bf0222dac64e9ccaa518e50038f3839d98512`
- Old source-material ref only: `origin/codex/m7-ui-58-conversation-viewport-parity` / `7b401f647f47df4aac2ced8a27a11c0201037f0f`
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
- Inspected old #200 allowed paths only with `git diff` / `git show`; no old stack merge, cherry-pick or whole-commit copy was used.

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

Passed locally on this v2 branch:

- `git status --short --branch`
  - cleanly showed only the seven allowed changed/untracked paths before commit.
- `git diff --name-only origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2...HEAD`
  - expected empty output before commit because changes were still in the worktree; rerun after commit/push is required for the final changed-file list.
- `npm run format:check`
  - passed; all matched files use Prettier style.
- `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2`
  - passed; `8` baseline file(s), `89/89` marker(s), diff check ok.
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2 --spec docs/specs/M7-UI-58-conversation-viewport-parity.md --include-worktree`
  - passed; `changedFiles: 7`, categories `source: 2`, `docs: 4`, `test: 1`, source `changedFiles: 2`, source `netLoc: 0`, new source files `0`.
- `npm run typecheck`
  - passed after local validation setup generated the worktree Prisma client.
- `npm run lint`
  - passed.
- `npm run build:admin`
  - passed; Vite emitted the existing large chunk warning and exited `0`.
- `npx playwright test apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`
  - passed; `2/2` focused tests passed.

Validation setup notes:

- This new isolated worktree initially had no `node_modules`, so `npm ci --ignore-scripts --prefer-offline` was run inside the assigned worktree only. No lockfile, package file or tracked dependency file changed.
- The fresh install needed the existing generated client step before full repo typecheck: `npm --workspace @uzmax/db run prisma:generate`. It generated Prisma Client into ignored local `node_modules` only.
- The first `npm run typecheck` attempt failed before generation with missing `@prisma/client` exports; the rerun after `prisma:generate` passed.

## Browser Evidence

Artifacts under `/tmp/uzmax-m7-ui-58-conversation-viewport-parity-v2/`:

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

# M7-UI-58 Conversation Viewport Parity Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch fixes a narrow desktop viewport parity issue for `tenant.conversations`: the desktop shell remains locked to the viewport while conversation list/thread/rail content scrolls internally. It does not claim owner visual acceptance, conversation runtime closure, merge closure, GA-0, production readiness, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- Route: `tenant.conversations`
- Source targets: `apps/admin/src/shell/AppShell.css`, `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
- Test target: `apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read the v1.1 source-of-truth docs for product scope, technical boundaries, admin IA/front-end quality and acceptance blockers.
- Read `PRODUCT.md`, `DESIGN.md` and `docs/admin-design-system.md`.
- Ran Impeccable context for `apps/admin/src/pages/conversations` and read the product-register guidance.
- Inspected current shell/outlet/conversation implementation:
  - `apps/admin/src/shell/AppShell.tsx`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/conversations/ConversationsPage.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationList.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx`
  - `/Users/atilla/Downloads/运营塔台1.0.html`

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate after fix | Result |
|---|---|---|---|
| Desktop shell height | Owner HTML screenshot/metrics baseline has `bodyScrollHeight=840` at `1280x840`; shell is viewport-locked | React desktop now keeps `.uz-app-shell`, nav, topbar and workbench within the viewport | Aligned for viewport lock |
| Workbench columns | Unpacked source uses list `316px`, thread `flex:1`, context rail `340px`; available desktop shell content width is `1048px` at `1280x840` | React preserves fixed list `316px` and rail `340px`, and uses a shrinkable middle column so the rail right edge stays inside the viewport | Aligned |
| Scroll ownership | Owner workbench keeps shell fixed; lists/threads/rail scroll internally | React sets definite shell/workspace/outlet heights; list rows, message body and rail body keep internal overflow | Aligned |
| Collapsed nav | Owner shell collapse keeps topbar/nav anchored | React collapse keeps nav width `68`, nav/topbar y `0` and no body scroll | Aligned |
| Mobile fallback | Prototype is desktop-primary | React mobile keeps 320px no horizontal overflow; body vertical scroll remains allowed | Required fallback |

## Implementation Notes

- `.uz-app-shell` now has a definite desktop `height: 100vh` as well as `min-height`.
- `.uz-app-nav` receives desktop `height: 100vh` so the nav does not stretch to content height.
- `.uz-app-main`, `.uz-shell-workspace` and `.uz-conversation-outlet` receive the missing `min-height: 0` / flex behavior needed for the conversation workbench to consume the remaining topbar height.
- `.uz-page-conversations` keeps `316px` list and `340px` rail columns, while the middle thread column now uses `minmax(0, 1fr)` so the grid fits the actual `1048px` shell workspace at `1280x840`.
- The existing mobile media query resets shell/nav height to `auto` and keeps body vertical scroll available for fallback readability.
- No conversation runtime, fallback data, API routes, DB, authz, handoff or tenant-switching logic changed.

## Data Boundary

- Default no-API behavior remains synthetic/degraded/read-only.
- The viewport parity test routes the list request to a Vite HTML fallback to prove the default degraded fixture path still shows synthetic rows/messages.
- No production customer data, conversation runtime mutation, real handoff, DB/API wiring, provider call, LLM call or external connector is introduced.

## Validation

Passed locally on this branch:

- `git diff --check origin/codex/m7-ui-56-logs-visible-ui`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-58-conversation-viewport-parity.md docs/evidence/M7/M7-UI-58-conversation-viewport-parity.md docs/admin-ui-page-migration-ledger.md docs/evidence/M7/README.md apps/admin/src/shell/AppShell.css apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/eslint/bin/eslint.js apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
- `export PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH; find apps/admin/src apps/admin/tests -path '*/dist' -prune -o -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | xargs -0 node node_modules/typescript/lib/tsc.js --ignoreConfig --noEmit --allowImportingTsExtensions --jsx react-jsx --lib ES2023,DOM,DOM.Iterable --module ESNext --target ES2023 --moduleResolution Bundler --strict --skipLibCheck --types vite/client,node --noUncheckedIndexedAccess --baseUrl . --ignoreDeprecations 6.0`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-56-logs-visible-ui --spec docs/specs/M7-UI-58-conversation-viewport-parity.md --include-worktree`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts --config=playwright.config.ts --reporter=line`

Validation notes:

- The assigned worktree already had a non-symlink `node_modules` directory; no dependency install or lockfile change was needed.
- Validation used the Codex primary runtime Node path at `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin`.
- CSS is covered by Prettier, Vite build and Playwright geometry assertions; ESLint was run only on changed TS/TSX files.
- `pr-shape` passed with `changedFiles: 7`, categories `source: 2`, `docs: 4`, `test: 1`, source `changedFiles: 2`, source `netLoc: 15`, new source files `0`.
- Vite emitted the existing large chunk warning and exited 0.
- Focused viewport Playwright: `2/2 passed`.

## Browser Evidence

Artifacts under `/tmp/uzmax-m7-ui-58-conversation-viewport-parity/`:

- Desktop screenshot: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity/react-conversation-viewport-desktop.png`
- Collapsed screenshot: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity/react-conversation-viewport-collapsed.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity/react-conversation-viewport-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity/react-conversation-viewport-metrics.json`
- Owner HTML desktop screenshot: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity/owner-html-viewport-desktop.png`
- Owner HTML metrics JSON: `/tmp/uzmax-m7-ui-58-conversation-viewport-parity/owner-html-viewport-metrics.json`

Metrics summary:

- Owner HTML at `1280x840`: `bodyScrollHeight=840`, `bodyScrollWidth=1280`, `documentScrollHeight=840`, active text includes the conversation workbench and 8 conversation rows.
- React desktop at `1280x840`: `activePageId=tenant.conversations`, `shellLevel=tenant`, `bodyScrollHeight=840`, `bodyScrollWidth=1280`, `nav.y=0`, `topbar.y=0`, `nav.width=232`, `workspace.width=1048`, `workbench.width=1048`, `workbench.height=787`, `list.width=316`, `thread.width=392`, `rail.width=340`, `rail.right=1280`, `rows=8`, `messages=6`.
- React collapsed at `1280x840`: `bodyScrollHeight=840`, `bodyScrollWidth=1280`, `nav.y=0`, `topbar.y=0`, `nav.width=68`, `workspace.width=1212`, `workbench.width=1212`, `workbench.height=787`, `rail.right=1280`, `rows=8`, `messages=6`.
- React mobile `320px`: focused Playwright asserts `document.body.scrollWidth <= 320`; body vertical scroll remains allowed for fallback readability.

## Known Visual / Runtime Deltas

- This is a viewport parity fix for the existing conversation candidate; it is not a full owner visual acceptance pass.
- Mobile remains a readable fallback, not a source-identical desktop workbench.
- Runtime stays degraded/mock/read-only unless the existing conversation runtime endpoints respond; no runtime closure is claimed.

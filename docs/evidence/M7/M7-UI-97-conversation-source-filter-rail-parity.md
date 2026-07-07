# M7-UI-97 Conversation Source Filter Rail Parity Evidence

## Preflight

- Worker pwd: `/Users/atilla/.codex/worktrees/m7-ui-97-conversation-source-filter-rail-parity`
- Branch: `codex/m7-ui-97-conversation-source-filter-rail-parity`
- Base: `origin/codex/m7-ui-31-orders-visible-ui`
- Root checkout `/Users/atilla/Applications/UZMAX智能运营` was used only for read/fetch/worktree creation; code edits were made in the worker worktree.

## Source Mapping

- Filters and count behavior: `/Users/atilla/源码/unpacked 6/hooks/useConversationWorkbench.ts`
- List header source behavior: `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationList.tsx`
- Right rail source sections: `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx`
- Runtime fixture reference: `/Users/atilla/源码/unpacked 6/fixtures/conversations.ts`

## React Metrics

- Active page id: `tenant.conversations`
- Shell level: `tenant`
- Filter order: `全部`, `待人工`, `SLA风险`, `我接管`, `AI处理`
- Filter counts: `全部 8`, `待人工 1`, `SLA风险 3`, `我接管 1`, `AI处理 3`
- Removed visible filter labels: `未读`, `未回`, `已解决`
- Default header badge: `8`
- Non-all header pattern: `1 / 8`, `3 / 8`, `1 / 8`, `3 / 8`
- Synthetic fallback rows: `8`
- Desktop list width: `316`
- Desktop right rail width: `340`
- Right rail order: `客户档案`, `客户标签`, `自定义字段`, `双轨引导`, `快捷动作`, `人工备注`
- Notes default state: collapsed, after quick actions
- Mobile body scroll width at 320px viewport: `320`

Metrics files:

- `/tmp/uzmax-m7-ui-97-conversation-source-filter-rail-parity/react-conversation-source-filter-rail-metrics.json`
- `/tmp/uzmax-m7-ui-97-conversation-source-filter-rail-parity/react-conversation-source-filter-rail-mobile-metrics.json`

## Screenshots

- Desktop React: `/tmp/uzmax-m7-ui-97-conversation-source-filter-rail-parity/react-conversation-source-filter-rail-desktop.png`
- Mobile 320 React: `/tmp/uzmax-m7-ui-97-conversation-source-filter-rail-parity/react-conversation-source-filter-rail-mobile-320.png`

## Runtime Boundary

Local preview uses degraded/synthetic conversation data when `conversation-ticket` runtime returns non-JSON or is absent. This evidence does not claim live Business send, handoff execution, customer aggregation, WS sync, or production API closure.

## Source Parity Note

Header badge rendering is declarative in `ConversationList`: all-filter renders the visible row count (`8`), and non-all filters render `visible / all`. The rejected runtime DOM mutation path was removed; this PR has no `document.querySelector`, `requestAnimationFrame`, or manual `textContent` mutation in conversation source or focused M7-UI-97 test code.

## Verification

- `npm run typecheck`: blocked in this runtime, `npm: command not found`.
- `npm run build:admin`: blocked in this runtime, `npm: command not found`.
- Full Prettier check equivalent: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH pnpm exec prettier --check .` failed on unrelated baseline formatting in 20 pre-existing files outside this PR scope.
- Focused Prettier check: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH pnpm exec prettier --check apps/admin/src/pages/conversations/ConversationsPage.tsx apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx apps/admin/tests/m7-ui-97-conversation-source-filter-rail-parity.spec.ts docs/specs/M7-UI-97-conversation-source-filter-rail-parity.md docs/evidence/M7/M7-UI-97-conversation-source-filter-rail-parity.md` passed.
- Equivalent admin build: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` passed.
- Full typecheck equivalent: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` failed on unrelated missing baseline backend deps (`@nestjs/common`, `@nestjs/core`, `@supabase/supabase-js`, `bullmq`, `@prisma/client`, `reflect-metadata`).
- Focused Playwright: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH pnpm exec playwright test apps/admin/tests/m7-ui-97-conversation-source-filter-rail-parity.spec.ts --project=desktop-chromium --reporter=line` passed, 2/2.
- PR shape: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-97-conversation-source-filter-rail-parity.md --include-worktree` passed: 8 changed files, source 5, test 1, docs 2, source net LOC +30, new source files 0.

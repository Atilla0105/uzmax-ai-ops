# M7-UI-96 Conversation Workbench Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default-visible copy and boundary placement for `tenant.conversations` / `对话工作台` on top of `codex/m7-ui-95-group-logs-default-visual-parity-refresh`. It keeps the conversation runtime downgraded: no DB/API/WebSocket runtime foundation, Business send, human external send, customer aggregation runtime, ticket/order/quote write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-96-conversation-workbench-default-visual-parity-refresh.md`
- Route: `tenant.conversations`
- Base: `codex/m7-ui-95-group-logs-default-visual-parity-refresh` / `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- Branch/worktree: `codex/m7-ui-96-conversation-workbench-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-96-conversation-workbench-default-visual-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/conversations/ConversationsPage.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
- Test targets:
  - `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-96-conversation-workbench-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-96-conversation-workbench-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-96-conversation-workbench-default-visual-parity-refresh`
- `git rev-parse HEAD`: `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- `git merge-base HEAD codex/m7-ui-95-group-logs-default-visual-parity-refresh`: `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/conversations/ConversationsPage.tsx` with the Codex runtime Node and read the product register.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior/default-refresh inputs:
  - `docs/specs/M7-UI-20-conversation-workbench-page.md`
  - `docs/specs/M7-UI-58-conversation-viewport-parity.md`
  - `docs/specs/M7-UI-60-conversation-detail-parity.md`
  - `docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-20-conversation-workbench-page.md`
  - `docs/evidence/M7/M7-UI-58-conversation-viewport-parity.md`
  - `docs/evidence/M7/M7-UI-60-conversation-detail-parity.md`
  - `docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationList.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx`
  - `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx`
- Reviewed current `apps/admin/src/pages/conversations/**` and focused conversation Playwright specs.

## Default Visual Refresh Changes

- Added `data-runtime-boundary` to the conversation workbench root so runtime source/state/reason stay available as hidden machine evidence while default visible text stays product-facing.
- Replaced visible loading/empty/error/permission state copy with Chinese operational copy; runtime/fixture/API boundary strings are preserved in `data-runtime-boundary` and `aria-description`.
- Replaced right-rail empty/fallback English values such as `customer context runtime missing` and `unavailable` with `上下文待接入`, `待接入` and `待识别`.
- Replaced thread no-selection copy and empty detail state visible copy with product-state Chinese while preserving runtime boundary metadata.
- Added focused default visual parity Playwright coverage that captures owner HTML, React desktop and React mobile screenshots, writes geometry JSON and asserts:
  - tenant shell and `data-tenant-id`
  - tenant nav present and group nav absent
  - desktop `316px` list / center thread / `340px` rail geometry
  - body overflow lock
  - default visible text contains none of the forbidden English engineering terms
  - runtime boundary remains in `data-*` and `title`
  - mobile `body.scrollWidth <= 320`
- Updated existing fallback state assertions to check hidden boundary attributes instead of requiring visible engineering copy.

## Three-Way Comparison

| Surface | Owner / unpacked source | React after this refresh | Result |
|---|---|---|---|
| Tenant layer | Owner shell enters tenant conversation route with tenant sidebar categories | React keeps `data-tenant-id`, shell level tenant, tenant nav and no group nav | Preserved |
| Workbench columns | Unpacked conversation page uses list `316px`, thread flex and context rail `340px` | React keeps `316px / minmax(0, 1fr) / 340px` and focused geometry assertions | Preserved |
| List/thread/rail anatomy | Source maps filter capsules, dense rows, AI trace, Business draft, profile/tags/custom fields/dual-track/quick actions | React keeps M7-60 density and removes visible engineering labels from default state surfaces | Refreshed |
| Runtime boundary | Owner prototype has demo/runtime state; UZMAX governance requires honesty | React keeps boundary in `data-runtime-source`, `data-runtime-state`, `data-runtime-boundary`, `title`, ARIA and evidence, not in primary visual text | Refreshed |
| Mobile | Desktop-primary source; mobile is fallback only | React keeps readable stacked fallback and `body.scrollWidth <= 320` | Preserved |

## Data And Runtime Boundary

- Default no-API path remains centralized synthetic fallback data in `conversationWorkbenchFallback.ts`.
- Rows remain tenant-scoped by selected tenant id; fallback rows set `tenantId` from `selectedTenantId`.
- Business send, human external send, customer aggregation, ticket/order/quote actions and WebSocket realtime remain disabled/not closed.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `synthetic`, `runtime-unavailable`, `not production metrics`, no production truth and no runtime/API closure labels.
- No raw prototype fixture import, DB/API/backend, WebSocket, provider call, customer/order production data or write path was added.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-96-conversation-workbench-default-visual-parity-refresh/`

Focused artifacts from Playwright:

- Owner HTML desktop screenshot: `/tmp/uzmax-m7-ui-96-conversation-workbench-default-visual-parity-refresh/owner-html-conversation-default-1280x840.png`
- React desktop screenshot: `/tmp/uzmax-m7-ui-96-conversation-workbench-default-visual-parity-refresh/react-conversation-default-1280x840.png`
- React mobile screenshot: `/tmp/uzmax-m7-ui-96-conversation-workbench-default-visual-parity-refresh/react-conversation-default-mobile-320.png`
- Desktop metrics JSON: `/tmp/uzmax-m7-ui-96-conversation-workbench-default-visual-parity-refresh/conversation-default-metrics.json`
- Mobile metrics JSON: `/tmp/uzmax-m7-ui-96-conversation-workbench-default-visual-parity-refresh/conversation-default-mobile-metrics.json`

Desktop geometry (`1280x840`):

| Metric | Owner HTML | React |
|---|---:|---:|
| body scroll width / height | `1280 / 840` | `1280 / 840` |
| sidebar width / height | owner shell `232 / 840` | `232 / 840` |
| topbar height | owner `52` | `53` |
| workbench width / height | `1048 / 788` | `1048 / 787` |
| list x / width / height | `232 / 316 / 788` | `232 / 316 / 787` |
| thread x / width / height | `548 / 392 / 788` | `548 / 392 / 787` |
| rail x / width / right / height | `940 / 340 / 1280 / 788` | `940 / 340 / 1280 / 787` |
| visible list rows | `8` | `8` |
| active page / shell | owner rendered conversation screen | `tenant.conversations` / `tenant` |

Navigation evidence:

- Tenant nav labels present: `对话`, `工单`, `确认队列`, `客户资产`, `订单`, `知识与资源`, `评测中心`, `AI 成员`, `团队`, `配置`, `分析`, `日志`.
- Group nav labels absent from tenant sidebar: `集团总览`, `模型/成本/风险`, `模板中心`, `连接中心`, `发布与验收`, `租户管理`, `集团日志`.

Mobile geometry (`320x900`):

- `bodyScrollWidth`: `320`
- `pageWidth`: `320`
- `listWidth`: `320`
- `railWidth`: `320`

## Impeccable / Design Skill Layer

- Adopted: dense product UI, source-derived geometry, status-first hierarchy, hidden-but-present runtime boundaries, desktop internal scroll ownership and mobile no-overflow fallback.
- Rejected: visible engineering labels in the default body, old shell/token visual language, broad redesign, production-looking runtime claims, raw prototype fixture import, backend/API/runtime invention and owner-acceptance/release claims.
- Detect result: `[]`.

## Validation

Validation status: `PASS`.

Commands/results:

- `git diff --check codex/m7-ui-95-group-logs-default-visual-parity-refresh...HEAD`: PASS, no output.
- `node scripts/guards/pr-shape.mjs --base codex/m7-ui-95-group-logs-default-visual-parity-refresh --spec docs/specs/M7-UI-96-conversation-workbench-default-visual-parity-refresh.md --include-worktree`: PASS.
  - `changedFiles`: `9`
  - categories: `source=3`, `test=2`, `docs=4`
  - `source.changedFiles`: `3`
  - `source.netLoc`: `7`
  - `source.newFiles`: `0`
- Touched Prettier: PASS.
- Touched ESLint: PASS.
- Admin build: PASS with existing Vite chunk-size warning only.
- Impeccable detect: PASS, `[]`.
- Focused Playwright: PASS, `17 passed (2.6s)`.
  - `apps/admin/tests/m7-ui-conversation-workbench.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-detail-parity.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench-default-visual-parity.spec.ts`

Local environment note: the repo Playwright config starts `npm`, but bare `npm` is unavailable in this Codex shell. Validation used a temporary no-webServer config against a manually started Vite preview at `http://127.0.0.1:4176`; the temp config was not intended for the PR diff and is removed before commit.

## Remaining Deltas

- This branch is default visual parity/evidence refresh only; it does not claim owner visual acceptance.
- Conversation DB/API/WebSocket runtime foundation, Business external send, human external send, customer aggregation runtime, ticket/order/quote writes and production permission enforcement remain future specs.
- Mobile is readable/no-overflow fallback only, not pixel-level mobile parity.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.

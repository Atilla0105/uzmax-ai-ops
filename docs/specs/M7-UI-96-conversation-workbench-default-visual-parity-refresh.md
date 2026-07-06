# M7-UI-96 Conversation Workbench Default Visual Parity Refresh

## Goal

Refresh the default visible tenant-layer `tenant.conversations` / `对话工作台` page on top of `codex/m7-ui-95-group-logs-default-visual-parity-refresh` so the first viewport reads like the owner conversation workbench rather than a runtime/fallback explanation surface.

This is a default visual parity slice only. It preserves the M7-UI-20 implementation candidate, M7-UI-58 viewport lock and M7-UI-60 detail-density baseline. It does not implement DB/API/WebSocket/runtime foundation, Business send, human external send, customer context aggregation, ticket/order/quote writes, owner visual acceptance, runtime closure, GA-0, production deployment, real customer/order data, customer LLM or 1.0 release approval.

Default visible `tenant.conversations` body, thread header, composer, rail, loading/empty/error/permission states and mobile fallback must not visibly contain `mock`, `fixture`, `synthetic`, `degraded`, `runtime-unavailable`, `not production metrics`, `fallback`, `read-only`, `prototype`, `conversation-ticket`, `customer context runtime`, `runtime action contract`, or `unavailable`. Runtime boundaries must remain available in hidden DOM, `data-*`, `title`, ARIA/sr-only text, evidence and PR metadata.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a tenant-layer default visual refresh only, not runtime closure.
- Confirm `tenant.conversations` remains tenant-only: `data-tenant-id` present, shell level tenant, tenant nav categories visible and group nav absent.
- Keep owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide future conversation DB/API/WebSocket/customer context/Business send/handoff runtime work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-96-conversation-workbench-default-visual-parity-refresh` on branch `codex/m7-ui-96-conversation-workbench-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register, `docs/admin-design-system.md`, M7-UI-20/58/60 specs/evidence, current conversation source/tests/evidence, owner HTML and unpacked conversation source before edits.
- Modify only the allowed conversation page/test/doc paths.
- Preserve tenant shell/outlet, `data-tenant-id`, selected-tenant scoping, three-column geometry, internal scroll ownership, disabled writes and hidden runtime boundary evidence.

## Timebox

0.5 workday. If API client expansion, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, conversation runtime, Business send, human send, customer aggregation or write actions are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/conversations/ConversationsPage.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/tests/m7-ui-conversation-workbench.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-detail-parity.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-96-conversation-workbench-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-96-conversation-workbench-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 4
- source net LOC: <= 220
- new source files: 0
- test files changed/added: <= 5
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/topbar/router/PageOutlet/registry/API: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/conversations/ConversationsPage.tsx
  - apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts
  - apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx
  - apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx
test:
  - apps/admin/tests/m7-ui-conversation-workbench.spec.ts
  - apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts
  - apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts
  - apps/admin/tests/m7-ui-conversation-detail-parity.spec.ts
  - apps/admin/tests/m7-ui-conversation-workbench-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-96-conversation-workbench-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-96-conversation-workbench-default-visual-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads before source edits:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- Impeccable project context and product register
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-20-conversation-workbench-page.md`
- `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- `docs/specs/M7-UI-60-conversation-detail-parity.md`
- `docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-20-conversation-workbench-page.md`
- `docs/evidence/M7/M7-UI-58-conversation-viewport-parity.md`
- `docs/evidence/M7/M7-UI-60-conversation-detail-parity.md`
- `docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- current `apps/admin/src/pages/conversations/**`
- current focused conversation Playwright specs/helpers
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`
- `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationList.tsx`
- `/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx`
- `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx`
- `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx`

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Browser-rendered visual oracle for tenant conversation first viewport, sidebar/topbar geometry and row/thread/rail density. |
| Unpacked `ConversationList.tsx` | Preserve `316px` list, `46px` header, filter capsules, 3px selected/status stripe, 22px avatar, compact rows and status/SLA rhythm. |
| Unpacked `MessageThread.tsx` | Preserve compact thread header, status/SLA chips, AI trace table, internal/system pill, message bubble rhythm and source-like actions. |
| Unpacked `Composer.tsx` | Preserve Business draft/caveat rhythm, textarea, tool buttons, redline/language meta and disabled confirmation controls. |
| Unpacked `ContextRail.tsx` | Preserve `340px` rail, profile/tags/custom fields/dual-track/notes and fixed quick-action footer. |
| M7-UI-95 default refresh | Preserve hidden/data/title/ARIA boundary pattern while cleaning default-visible engineering copy. |
| Existing React conversation page | Extend in place; no raw prototype fixture import, shared shell edits or runtime expansion. |

`rg` conclusions:

- `rg -n "mock|fixture|synthetic|degraded|runtime-unavailable|not production metrics|fallback|read-only|prototype|conversation-ticket|customer context runtime|unavailable|runtime" apps/admin/src/pages/conversations apps/admin/tests/m7-ui-conversation*.ts` found visible or test-asserted engineering copy in default state expectations, loading/empty/error/permission states and customer-context fallbacks. Boundary strings also exist in `data-*`, `title`, test ids and runtime helpers; those are allowed if hidden from the main visual body.
- `rg --files apps/admin/src/pages/conversations apps/admin/tests docs/specs docs/evidence/M7 | rg 'conversation|M7-UI-(20|58|60|95|96)|admin-ui-page-migration-ledger|README'` found the existing page-local implementation and focused tests. This slice extends them in place and adds one focused default visual parity test.
- `rg -n "会话|对话|SLA|Business|草稿|客户|标签|自定义|双轨|快捷" /Users/atilla/Downloads/运营塔台1.0.html "/Users/atilla/源码/unpacked 6/pages/conversations"` confirmed the owner/unpacked source structure; owner HTML is bundled, so detailed component mapping uses unpacked source and browser screenshots.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-96-conversation-workbench-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-96-conversation-workbench-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-96-conversation-workbench-default-visual-parity-refresh` |
| worker `git rev-parse HEAD` | `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6` |
| base | `codex/m7-ui-95-group-logs-default-visual-parity-refresh` / `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.conversations` visible body uses business-readable Chinese and source-like operational copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `read-only`, `synthetic`, `runtime-unavailable`, `not production metrics`, no runtime/API closure and no production truth labels.
- Page root retains `data-tenant-id`, `data-runtime-source` and `data-runtime-state`; default synthetic/no-API path remains visibly disabled and does not pretend to be production runtime.
- Tenant nav remains active and group nav remains absent on the tenant route.
- Desktop preserves `316px / minmax / 340px`, topbar/sidebar geometry, body overflow lock and internal pane scrolling.
- Mobile remains readable and `document.body.scrollWidth <= 320`.

## Design Skill Layer

Adopted Impeccable/product-register guidance: restrained dense product UI, source-derived geometry and copy hierarchy, hidden-but-present runtime boundaries, familiar operational controls, desktop-first internal scroll, and mobile no-overflow fallback.

Rejected: visible engineering labels in the default body, old shell/token visual vocabulary, broad redesign, production-looking runtime claims, raw prototype fixture import, backend/API/runtime invention, owner-acceptance/runtime/release claims and mobile pixel redesign.

## Pass Conditions

- Default visible `tenant.conversations` body contains no forbidden engineering terms listed in this spec.
- Hidden/data/title/ARIA evidence still contains runtime/fallback/non-production boundary labels.
- Focused Playwright covers tenant layer, three-column geometry, visible forbidden-term absence, hidden boundary presence, desktop and mobile screenshots, owner HTML/unpacked/React comparison metrics and mobile `body.scrollWidth <= 320`.
- Existing conversation workbench, fallback, viewport and detail parity specs still pass after updated expectations.
- `git diff --check`, `guard:pr-shape`, touched Prettier/ESLint, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client expansion, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No conversation DB/API/WebSocket runtime foundation, Business external send, human external send, customer aggregation runtime, ticket/order/quote writes, audit writes, production customer/order data, provider calls, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness or 1.0 release approval.
- No broad redesign, marketing/card-heavy layout, raw production fixture import or group-layer navigation mixing.

# M7-UI-79 Ticket Default Visual Parity Refresh

## Goal

Refresh the existing `tenant.tickets` / `工单` page on top of `origin/codex/m7-ui-78-logs-source-parity-refresh` so the default visible body no longer carries engineering/runtime caveat labels such as `mock`, `degraded`, `read-only` or `not production`, while preserving truthful hidden DOM/data-attribute evidence and local-only interaction boundaries.

This is a visual-parity and evidence slice. It does not implement ticket DB/API/runtime, production ticket data, real writes, owner visual acceptance, merge closure, runtime closure, GA-0 or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on `origin/codex/m7-ui-78-logs-source-parity-refresh`.
- Confirm `tenant.tickets` remains TENANT layer only and visible-parity-first.
- Decide later whether real ticket DB/API/runtime proceeds through separate approved specs.
- Keep production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-79-ticket-default-visual-parity-refresh` on branch `codex/m7-ui-79-ticket-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Read `AGENTS.md`, current ticket specs/evidence/tests/source, owner HTML, unpacked tickets page/hook/fixture and design-system context before claiming evidence.
- Preserve synthetic fallback rows and browser-local claim/transfer/note/close interactions.

## Timebox

0.5 workday. If the page requires shared shell/router/PageOutlet/registry/API/DB/package/lock/global config/CI guard edits, real ticket runtime, production ticket data, broad redesign or edits outside the allowed paths, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-79-ticket-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-79-ticket-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/pages/tickets/TicketHtml.ts`
  - `apps/admin/src/pages/tickets/TicketsPage.tsx`
  - `apps/admin/src/pages/tickets/ticketFallback.ts`
  - `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-ticket-default-visual-parity.spec.ts`
- 未列出的模块默认不可改。

## Change Budget And Path Classification

- source changed files: <= 3
- source net LOC: <= 120
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

```yaml
source:
  - apps/admin/src/pages/tickets/TicketHtml.ts
  - apps/admin/src/pages/tickets/TicketsPage.tsx
  - apps/admin/src/pages/tickets/ticketFallback.ts
test:
  - apps/admin/tests/m7-ui-ticket-source-parity.spec.ts
  - apps/admin/tests/m7-ui-ticket-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-79-ticket-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-79-ticket-default-visual-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-21-ticket-page.md`
- `docs/evidence/M7/M7-UI-21-ticket-page.md`
- `docs/specs/M7-UI-64-ticket-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-64-ticket-source-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/tickets/**`
- `apps/admin/tests/m7-ui-ticket-page.spec.ts`
- `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useTickets.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/tickets.ts`

| Source | Required use |
|---|---|
| Owner HTML rendered state | Browser-comparable source for ticket shell/context and default body anatomy. |
| Unpacked `TicketsPage.tsx` | Structured source for the `380px` list, detail header, body card stack, `248px` side column and absence of a default runtime banner. |
| Unpacked `useTickets.ts` | Structured source for local-only tab/select/claim/reassign/add-note/close-required-note behavior. |
| Unpacked `fixtures/tickets.ts` | Field-shape reference for source-shaped synthetic rows. |
| v1.1/docs/admin-design-system | Runtime boundary and visual source hierarchy: this slice hides engineering caveat from the default body but does not claim runtime closure. |

## Source Parity Decision

- Default ticket body follows owner/unpacked anatomy: ticket list, detail header, summary, AI recommendation, snippet, quote, timeline, notes, customer/order and close-ticket side column.
- Visible engineering/runtime caveat row is removed from the default body.
- Runtime labels remain present in `data-runtime-state`, `data-runtime-source`, `data-runtime-boundary` and hidden `m7-ticket-runtime-note`.
- Browser-local interactions remain local state only and are covered by focused tests/evidence.

## Impeccable / Design Decision Record

Adopted: dense restrained product UI, source-like ticket anatomy, hidden-but-present runtime boundary evidence, tenant-only shell parity, stable `380px / 248px` geometry, browser-local interaction evidence and 320px no-overflow fallback.

Rejected: old shell visual vocabulary, visible body caveat pollution, old `--uzmax-*` as visual source, broad ticket redesign, production-looking runtime claims, real ticket API/DB writes, real customer/order data and owner-acceptance/runtime/release claims.

## Pass Conditions

- `tenant.tickets` default desktop body does not visibly contain `mock`, `degraded`, `read-only` or `not production ticket data`.
- Runtime boundary remains inspectable through data attributes and hidden DOM.
- Focused evidence includes owner HTML sample, unpacked mapping, React desktop default, collapsed sidebar, mobile 320 and metrics.
- Metrics assert tenant shell, topbar/sidebar/category/collapse, source-like ticket content, local interaction evidence and 320px no overflow.
- Existing ticket interaction coverage remains local-only and passing.
- No disallowed files are changed.

## Validation Plan

- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-78-logs-source-parity-refresh --spec docs/specs/M7-UI-79-ticket-default-visual-parity-refresh.md --include-worktree`
- Touched ESLint/Prettier equivalent for changed source/tests/docs.
- Admin build.
- Focused Playwright:
  - `apps/admin/tests/m7-ui-ticket-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-ticket-page.spec.ts`

## Failure Branches

- If hidden runtime evidence cannot be preserved without visible body pollution, keep the boundary visible and report the owner-source conflict.
- If dependencies are unavailable after cleanup, record exact dependency failure and do not fake evidence.
- If source geometry requires shared shell/router/PageOutlet/registry/API/DB edits, stop and report the dependency instead of editing forbidden files.

## Not Doing

- No shared shell/topbar/sidebar/router/PageOutlet/registry/API/DB/schema/migration/generated/package/lock/global config/CI guard changes.
- No raw prototype fixture import.
- No ticket DB/API/runtime, production ticket data, real writes, customer/order-data use, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness or 1.0 release approval.

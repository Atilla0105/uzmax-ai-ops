# M7-UI-64 Ticket Source Parity Refresh

## 目标

Refresh the existing visible UI-first `tenant.tickets` / 工单 page on top of `origin/codex/m7-ui-63-confirmation-queue-visible-parity` (#205) so the ticket page remains aligned with the latest calibrated tenant shell, sidebar, topbar, tenant entry and confirmation-queue visible fallback stack.

This is a source parity refresh, not a rewrite. It may add focused browser evidence and make small `apps/admin/src/pages/tickets/**` corrections only where current React visibly drifts from the owner source. It does not implement ticket DB/API/runtime, does not touch shared shell/topbar/sidebar, and does not claim owner visual acceptance, runtime closure, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Existing synthetic/degraded ticket data may stay centralized and local-only, but it must remain clearly labeled as mock/degraded/read-only without dominating the source-like operational surface.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm the current M7 lane remains visible-UI-first while ticket runtime/API/DB are downgraded.
- Confirm this branch is stacked on #205 / `origin/codex/m7-ui-63-confirmation-queue-visible-parity`.
- Decide later whether a ticket runtime lane proceeds through a separate approved spec.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh` on branch `codex/m7-ui-64-ticket-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-21 spec/evidence, current tickets source/tests, owner unpacked ticket page/hook/fixtures and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React desktop/collapsed/mobile metrics.
- Preserve existing ticket interactions: tab, row select, claim, transfer, note, close required note, tenant switch reset, collapse and mobile fallback.

## 时间盒

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar edits, a broad page rewrite, raw owner fixture import, production data, external API behavior or release action, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-64-ticket-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-64-ticket-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/pages/tickets/TicketHtml.ts`
  - `apps/admin/src/pages/tickets/TicketsPage.tsx`
  - `apps/admin/src/pages/tickets/ticketFallback.ts`
  - `apps/admin/tests/m7-ui-ticket-source-parity.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3
- source net LOC: <= 180
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/confirmation queue/customer/order/knowledge: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

## 文档触发检查

updated

## 前置读取与 source mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-21-ticket-page.md`
- `docs/evidence/M7/M7-UI-21-ticket-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/src/pages/tickets/**`
- `apps/admin/tests/m7-ui-ticket-page.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useTickets.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/tickets.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM sample for tickets/source shell terms. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked `TicketsPage.tsx` | Primary structured source for `380px` ticket list, compact tabs/counts, row anatomy, detail header, card stack, `248px` side column and close-ticket flow. |
| Unpacked `useTickets.ts` | Interaction source for tab switching, row selection, claim, transfer, add note and required-note close. |
| Unpacked `fixtures/tickets.ts` | Field-shape reference only. React must continue using centralized sanitized synthetic fallback data with visible degraded/mock labels. |
| `docs/admin-design-system.md` | Normalize shell geometry: `232/68` nav, `52/53` topbar, ticket `380px / 1fr`, detail side `248px`, desktop primary and 320px readable fallback. |

## Required Evidence

- Owner/source screenshot or DOM sample for tickets-related owner HTML region.
- Unpacked source mapping summary for `TicketsPage.tsx`, `useTickets.ts` and `fixtures/tickets.ts`.
- React desktop screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `tenant`
  - active page `tenant.tickets`
  - nav width `232` expanded / `68` collapsed
  - topbar height `52-53`
  - ticket list width around `380/381`
  - detail visible
  - side column around `248` desktop
  - body/document scrollWidth <= viewport desktop/mobile
  - mobile `320` readable fallback
  - tenant sidebar categories only: `运营/数据/智能/管理/洞察`; group categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, status-first ticket rows, source-derived geometry, restrained runtime caveat, complete local interaction states, tenant-only sidebar parity and mobile readable/no-overflow fallback.

Rejected: old shell visual language, old `--uzmax-*` as visual target, page redesign, louder mock banners, raw prototype fixture imports, backend/API invention and any owner-acceptance/runtime/release claim.

If Design Skill Layer suggests a visual correction that conflicts with AGENTS, v1.1 docs, data boundary, permissions, release gates or owner source boundaries, record the rejection in evidence instead of implementing it.

## Pass Conditions

- `tenant.tickets` renders inside tenant shell after selecting a tenant on the latest #205 stack.
- Focused browser evidence proves owner/source/React comparison, desktop geometry, collapsed nav, tenant-only sidebar categories and 320px no-overflow fallback.
- Existing ticket interaction coverage remains intact.
- Synthetic/degraded/mock/read-only label remains visible but not dominant.
- Any React visual corrections are small and limited to `apps/admin/src/pages/tickets/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check origin/codex/m7-ui-63-confirmation-queue-visible-parity...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-63-confirmation-queue-visible-parity --spec docs/specs/M7-UI-64-ticket-source-parity-refresh.md --include-worktree`
- touched Prettier check
- ESLint on touched ticket source/tests
- `npm run typecheck`
- `npm run build:admin`
- Focused Playwright for ticket page/parity, including existing ticket interaction spec and new parity spec.

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If ticket data labels cannot stay honest without visually overwhelming the page, keep the label and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## 不做什么

- No backend/API/DB/runtime implementation.
- No package, lockfile, generated, CI/global config, shared AppShell/topbar/sidebar, confirmation queue, customer, order or knowledge edits.
- No raw owner fixture import or production-looking unlabeled ticket data.
- No fake writes, production/staging action, real customer/order-data use, owner visual acceptance, runtime closure, GA-0 or 1.0 release claim.

# M7-UI-21 Ticket Page

## 目标

Implement the visible UI-first `tenant.tickets` / 工单 page in `apps/admin`.

This is a page-level M7 migration worker slice stacked on `origin/codex/m7-ui-12-group-overview-visible-ui`. It renders the real tenant-layer ticket route using centralized synthetic degraded/mock fallback state. It does not implement DB/API/runtime, does not import raw prototype fixtures, does not claim production ticket metrics, owner visual acceptance, runtime closure, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and frozen source `/Users/atilla/源码/unpacked 6` are the visible UI baseline. Old M2 shell visuals and old `--uzmax-*` bridge values are legacy evidence only.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this PR is a UI-first implementation candidate, not runtime closure.
- Confirm this branch remains stacked on PR #195 / `origin/codex/m7-ui-12-group-overview-visible-ui`.
- Decide later whether ticket DB/API/runtime contracts proceed through a separate runtime lane; AI agents must not invent runtime truth.
- Keep final scope, production/staging, real customer/order data, customer LLM, LLM key, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-21-ticket-page-visible-ui` on branch `codex/m7-ui-21-ticket-page-visible-ui`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, this spec, M7 ledger/evidence, registry/page outlet state, owner HTML, unpacked ticket source and enough #182/#195 files before editing.
- Implement only the visible tenant ticket page with centralized synthetic degraded/mock fallback data and focused Playwright coverage.

## 时间盒

0.5 workday. If implementation requires backend/API changes, package/lock updates, raw fixture copying, DB/schema changes, shared shell changes, CI/global config changes, release/production action or edits outside the allowed paths, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-21-ticket-page.md`
  - `docs/evidence/M7/M7-UI-21-ticket-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `docs/incidents/INC-2026-07-04-m7-ui-21-root-patch-target.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/tickets/TicketsPage.tsx`
  - `apps/admin/src/pages/tickets/ticketFallback.ts`
  - `apps/admin/tests/m7-ui-ticket-page.spec.ts`
- `docs/incidents/INC-2026-07-04-m7-ui-21-root-patch-target.md` is included only because AGENTS §6A and `docs/incidents/README.md` require a durable record after this worker briefly wrote initial untracked files to root/main before moving them back into the assigned worktree.
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 4
- source net LOC: <= 600
- new source files: <= 2
- test files changed: <= 1 focused Playwright spec
- docs changed: <= 5 evidence/ledger/spec updates including the required incident record
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- external API/SDK/provider/connector/adapter basis: none; render truthful degraded/read-only mock state only.

## 文档触发检查

updated

## 前置条件与读取记录

Required reads completed for this implementation PR:

- `AGENTS.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/tickets.ts`
- `/Users/atilla/源码/unpacked 6/hooks/useTickets.ts`
- `apps/admin/src/pages/group/GroupOverviewPage.tsx` and `groupOverviewFallback.ts` from PR #195
- `apps/admin/src/pages/conversations/**` enough to preserve PR #182 route behavior
- Impeccable context/product register: dense product UI, status-first hierarchy, complete degraded/mock labels, desktop control-room primary, mobile fallback only, no legacy-shell visual drift.

Worktree / branch entry evidence:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-21-ticket-page-visible-ui` |
| worker `git status --short --branch` | `## codex/m7-ui-21-ticket-page-visible-ui...origin/codex/m7-ui-12-group-overview-visible-ui` |
| worker `git branch --show-current` | `codex/m7-ui-21-ticket-page-visible-ui` |
| worker HEAD | `6f3581431905992e217f40384b21ccf1140402d1` |
| stacked base | `origin/codex/m7-ui-12-group-overview-visible-ui` / `6f3581431905992e217f40384b21ccf1140402d1` |

## Source Mapping

| Source | Required use |
|---|---|
| `/Users/atilla/Downloads/运营塔台1.0.html` | Hard visual baseline for ticket workbench layout, tenant shell relationship, tab/list/detail density and close-ticket flow. |
| `/Users/atilla/源码/unpacked 6/pages/tickets/TicketsPage.tsx` | Primary structured source for 380px list, tab pills/counts, ticket rows, detail header, main cards, 248px side column and close two-step flow. |
| `/Users/atilla/源码/unpacked 6/fixtures/tickets.ts` | Field-shape reference only. Production page code must use sanitized centralized synthetic fallback data and visible mock/degraded labels. |
| `/Users/atilla/源码/unpacked 6/hooks/useTickets.ts` | Interaction reference for tab switching, row select, claim, transfer, note add and close-ticket required note. |
| `docs/admin-design-system.md` | Normalization layer: ticket workbench grid `380px / 1fr`, detail side column `248px`, tokenized product UI, mobile readable fallback and honest degraded state. |

## Page Matrix

| Object | Required fields / behavior |
|---|---|
| Ticket list | fixed about `380px`, title `工单`, tab pills with counts, row select, ticket id, priority, SLA, title, customer/channel/assignee. |
| Detail header | ticket id, status badge, SLA, claim button, transfer select and title. |
| Detail main | 摘要, AI 建议处理, 会话片段, 报价记录, 事件时间线, 备注 with note input/add. |
| Detail side | about `248px`, 客户, 相关订单, 关闭工单 two-step picker, required note, confirm/cancel and closed state. |
| State labels | Visible degraded/mock/read-only labeling; no ticket data presented as production truth. |
| Mobile fallback | 320px readable stacked workbench, no body overflow. |

## Runtime Contract

Current implementation is local UI only:

- `tenant.tickets` renders centralized synthetic mock/degraded data from `ticketFallback.ts`.
- Claim, transfer, note and close flows mutate only local React state.
- No backend/API/DB/ticket runtime is implemented or implied.
- Customer/order snippets are synthetic/prototype-shaped and safe; they are not real customer/order data.

Future runtime must be split into an approved ticket API/client/hook spec before this page can render production ticket data or claim runtime closure.

## Impeccable / Design Decision Record

- Adopted: dense product layout, tokenized status palette, fixed typography, visible degraded/read-only state, complete interaction states and 320px no-overflow fallback.
- Adapted: the owner prototype row status rail is preserved as a narrow status marker because this worker prompt explicitly lists it as required source anatomy. It is recorded as source-parity debt and must not be generalized into shared card/list patterns.
- Rejected: raw inline prototype styles, raw fixture imports, old M2 shell visuals, old `--uzmax-*` visual target and production-looking metrics.

## Evidence / Validation Plan

Implementation must record:

- `npm run format:check`
- `git diff --check`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-12-group-overview-visible-ui --spec docs/specs/M7-UI-21-ticket-page.md --include-worktree`
- `npm run lint`
- `npm run typecheck -- --pretty false`
- `npm run build:admin`
- focused Playwright for ticket route plus required stacked router/group/conversation specs
- desktop/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-21-ticket-page-visible-ui/`

## Pass Conditions

- Only allowed files change.
- `tenant.tickets` renders a visible page, not scaffold.
- Registry, ledger and M7 README mark this as implementation candidate pending PR review, not merged, owner accepted or runtime closed.
- Focused Playwright covers tenant entry, tenant-only nav, tabs/counts, row select, claim, transfer, note add, close two-step required note, degraded/mock labels, sidebar collapse, 320px no overflow and no mixed group nav.

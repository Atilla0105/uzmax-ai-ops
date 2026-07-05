# M7-UI-61 Group Overview First-Viewport Parity

## Goal

Implement one narrow visible-UI polish slice for `group.overview` on top of `origin/codex/m7-ui-60-conversation-detail-parity`.

The default `/design` group homepage should look closer to the owner prototype first viewport: title/result/search, six health cards and visible tenant rows/table are all present immediately. This slice may use centralized sanitized mock/degraded rows by default, but must clearly avoid claiming production metrics, real runtime aggregation, real authorization closure, owner visual acceptance, GA-0, production readiness or release approval.

## Owner / Agent Boundary

- Owner visual source: `/Users/atilla/Downloads/运营塔台1.0.html`.
- Unpacked source references: `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx` and `/Users/atilla/源码/unpacked 6/fixtures/group.ts`.
- Worker path: `/Users/atilla/.codex/worktrees/m7-ui-61-group-overview-first-viewport-parity`.
- Branch: `codex/m7-ui-61-group-overview-first-viewport-parity`.
- Base: `origin/codex/m7-ui-60-conversation-detail-parity`.
- Root/main checkout is coordination only and must remain unedited.
- Preserve M7-58 viewport lock, M7-59 sidebar density and M7-60 tenant conversation detail baseline.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-61-group-overview-first-viewport-parity.md`
  - `docs/evidence/M7/M7-UI-61-group-overview-first-viewport-parity.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/pages/group/GroupOverviewPage.tsx`
  - `apps/admin/src/pages/group/groupOverviewFallback.ts`
  - `apps/admin/tests/m7-ui-group-overview.spec.ts`
- 未列出的模块默认不可改。

## Budget

- source changed files <= 2.
- source net LOC <= 180.
- new source files = 0.
- test changed files <= 1.
- docs changed files <= 4.
- generated/lock/config/backend/API/DB/worker/cron/shared shell/tokens/primitives/patterns = 0.
- external API/SDK/provider/connector/adapter basis: none.
- exceptions: none.

## Source Mapping

| Source | Required use |
|---|---|
| Owner HTML browser render | Compare first viewport shell geometry, group page content density, health strip position and visible table rows at `1280x840`. |
| `unpacked 6/pages/group/GroupOverviewPage.tsx` | Preserve page anatomy: compact header, result label, clear filter chip, search, six health cards, sortable table and tenant entry into tenant conversations. |
| `unpacked 6/fixtures/group.ts` | Use sanitized/source-like tenant names and values as centralized mock/degraded UI fallback shape only; do not import the fixture or claim runtime truth. |
| Current `GroupOverviewPage.tsx` | Remove default empty-table gating while retaining search/filter/sort, mobile fallback and compact runtime disclaimer. |
| Current `groupOverviewFallback.ts` | Centralize sanitized degraded/mock rows, source-shaped values and runtime labels. |
| M7-60 evidence | Preserve `tenant.conversations` baseline when row click/keyboard enters tenant layer. |

## Implementation Plan

1. Re-read AGENTS, M7-UI-12, M7-UI-58/59/60 specs/evidence, owner HTML, unpacked group source and current React group overview files/tests.
2. Keep changes page-local: make default rows visible, switch generic mock names to sanitized source-like tenant/business names and keep runtime honesty in compact label/note.
3. Update focused Playwright coverage for default visible rows, search/filter/clear/sort, tenant-entry click/keyboard, shell geometry and 320px no-overflow fallback.
4. Capture owner HTML / unpacked source / React screenshots and metrics under `/tmp/uzmax-m7-ui-61-group-overview-first-viewport-parity/`.
5. Record validation, Impeccable detect and remaining visual deltas.

## Pass Conditions

- `/design` at `1280x840` opens `data-shell-level="group"` and `data-active-page-id="group.overview"` with grouped sidebar/topbar intact.
- React default first viewport shows title/result/search, six health cards and visible tenant rows/table.
- Default table is not empty; empty state appears only when search/filter genuinely yields no results.
- Compact copy says mock/degraded/not production metrics; no unqualified `实时` is used.
- Health card values remain `4 / 2 / 1 / 0 / 1 / 7` as centralized mock/degraded values.
- Table uses the source-like 9 columns: 租户, 会话量, 待人工, SLA风险, 转人工率, AI成本/日, 评测状态, 订单状态, 最后异常.
- Tenant row click and keyboard activation enter `tenant.conversations` with the selected tenant id and tenant-only navigation.
- Desktop geometry remains source-like: nav `232`, topbar about `53`, health strip above table, no body horizontal overflow or overlapping text.
- Mobile `320px` remains readable with no body horizontal overflow.

## Failure Branch

- If worktree/branch/base are wrong, stop and report `BLOCKED`.
- If owner HTML or unpacked group sources are missing, stop before claiming visual evidence.
- If parity requires AppShell/topbar/sidebar/conversation/token/backend/API/DB/package/lock/config changes, stop and split a separate spec.
- If validation is blocked by environment tooling, record exact command/output and do not claim full closure.

## Out Of Scope

- No backend/API/DB/runtime/authz/customer-data/LLM/provider work.
- No AppShell/sidebar/topbar/conversation/token/primitive/pattern/package/lock/CI/config changes.
- No owner HTML or unpacked source edits.
- No production metrics, owner visual acceptance, runtime closure, GA-0, production readiness or release approval claims.

## Impeccable / Design Skill Layer

- Adopted: dense product UI, visible operational table, source-derived health strip/table rhythm, compact secondary runtime disclaimer, desktop control-room primary and mobile fallback.
- Rejected: old shell visual source, old `--uzmax-*` visual target, loud degraded banner, default empty homepage, runtime/API invention, customer plaintext and owner-acceptance/release claims.

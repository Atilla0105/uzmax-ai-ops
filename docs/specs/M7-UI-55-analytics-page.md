# M7-UI-55 Analytics Page Cleanstack

## Goal

Implement the visible tenant-layer `tenant.analytics` page from the owner current prototype and `/Users/atilla/源码/unpacked 6` analytics source. The page is a cleanstack M7 admin slice: it shows the analytics surface only after a tenant is selected, keeps group and tenant layers separated, and records that all analytics data is synthetic/browser-local until a future runtime spec wires real metrics.

## Owner Confirmation Points

- Owner current prototype visual source: `/Users/atilla/Downloads/运营塔台1.0.html`.
- Prototype-derived source: `/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx` and `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`.
- Source hierarchy and visual rules: `AGENTS.md` and `docs/admin-design-system.md`.
- This spec does not approve runtime analytics, export jobs, audit writes, owner visual acceptance, GA, or release closure.

## AI Agent Responsibilities

- Implement the React/Vite visible page in the assigned worktree only:
  `/Users/atilla/.codex/worktrees/m7-ui-55-analytics-page-cleanstack`.
- Preserve owner-source information structure: time range, KPI grid, handoff distribution, top issues, dimension table.
- Add production-page state coverage required by M7: channel/language filters, trend/queue/latency hints, empty/delayed/loading/error/permission/degraded states, and 320px mobile fallback.
- Keep all data centralized as synthetic fallback/mock/degraded data and make runtime boundaries visible.
- Run validation and archive screenshot/metrics/source-sampling evidence under `/tmp/uzmax-m7-ui-55-analytics-page-cleanstack/` and `docs/evidence/M7/M7-UI-55-analytics-page.md`.

## Time Box

2026-07-07. If source sampling or visual verification fails, keep the page browser-local, record the delta in evidence, and do not claim runtime or owner acceptance.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/analytics/**`
- `apps/admin/tests/m7-ui-analytics-page.spec.ts`
- `docs/specs/M7-UI-55-analytics-page.md`
- `docs/evidence/M7/M7-UI-55-analytics-page.md`

- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：No `packages/db`, lockfile, CI/global config, root checkout, sidebar/topbar/shell rewrite, incidents, ledger, or unrelated docs.

## Change Budget

- Changed source files: <= 12.
- Net source LOC: <= 600.
- New source files: ideally <= 3, hard max 5.
- React component file: <= 250 lines.
- Fixture/fallback file: <= 180 lines.
- No `// prettier-ignore`.
- No lockfile, DB/API/authz/RLS/audit, CI/global config, shell/sidebar/topbar, `docs/incidents`, `docs/evidence/M7/README`, or ledger changes.

## Pass Conditions

- `tenant.analytics` registry row uses `targetSpecId: M7-UI-55-analytics-page`, status/evidence are no longer `not_started`, and required states include delayed data and filters.
- `PageOutlet` renders `{ content: <AnalyticsPage key={selectedTenantId} selectedTenantId={selectedTenantId} /> }` for `tenant.analytics`.
- Group nav does not show tenant analytics before tenant selection; after tenant selection the tenant nav shows analytics and hides group nav items.
- Page shows core metrics, time/channel/language filters, handoff distribution, Top issues, trend/queue/latency hints, dimension chips and table.
- `loading`, `empty`, `error`, `permission`, `degraded`, and `delayed` states are deterministic via URL query.
- Export and dimension actions remain browser-local and visibly state `no export file write`, `no analytics runtime`, and `no audit write`.
- Desktop screenshot has no large blank/misaligned regions; collapsed sidebar and 320px mobile fallback have no document-level horizontal overflow and keep key content compact.

## Failure Branches

- If owner HTML or unpacked source is unavailable in CI, write unavailable sampling artifacts and keep React assertions hard.
- If full Playwright is too slow locally, run the focused analytics spec, record the limitation, and rely on GitHub CI for the full suite.
- If any runtime/API boundary is needed, stop and open a separate future runtime spec instead of wiring it here.

## Not Doing

- No real metrics query, export job, file download, DB/API/authz/RLS/audit write, cost calculation, production analytics runtime, owner visual acceptance, GA, or release closure.
- No old `--uzmax-*` visual target, page-local tokens, parallel component library, sidebar/topbar/shell changes, or legacy incident carryover.

## Impeccable / Design Skill Layer

- Adopted: product/admin register, restrained dense control-room layout, state-first copy, visible permission/degraded/delayed boundaries, mobile fallback as read-only compact review.
- Rejected: decorative dashboard gradients, glassmorphism, hero metrics, side stripes, old shell tokens, runtime overclaiming, and direct untracked export.

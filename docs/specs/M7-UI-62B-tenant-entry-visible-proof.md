# M7-UI-62B Tenant Entry Visible Proof

## Goal

Prove the smallest browser-visible closed loop from `/design` group homepage to a tenant conversation workbench:

`group.overview` -> click `玉珠跨境美妆` -> `tenant.conversations`.

This is a visible-UI-first proof slice on top of `origin/codex/m7-ui-61-group-overview-first-viewport-parity`. It should not redesign the shell or conversation page. If the existing UI already satisfies the path, this slice only adds focused test/spec/evidence.

## Owner / Agent Boundary

- Owner visual source: `/Users/atilla/Downloads/运营塔台1.0.html`.
- Unpacked source baseline: `/Users/atilla/源码/unpacked 6`, especially shell navigation/topbar and conversation page sources.
- Design system baseline: `docs/admin-design-system.md`.
- Worker path: `/Users/atilla/.codex/worktrees/m7-ui-62b-tenant-entry-visible-proof`.
- Branch: `codex/m7-ui-62b-tenant-entry-visible-proof`.
- Base: `origin/codex/m7-ui-61-group-overview-first-viewport-parity`.
- Root/main checkout is coordination only and must remain unedited.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-62B-tenant-entry-visible-proof.md`
  - `docs/evidence/M7/M7-UI-62B-tenant-entry-visible-proof.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-tenant-entry-visible-proof.spec.ts`
- 未列出的模块默认不可改。

## Budget

- source changed files = 0 unless focused test exposes a required copy/selector mismatch.
- source net LOC = 0 unless a minimal shell/group-page calibration is required.
- test changed files <= 1.
- docs changed files <= 4.
- generated/lock/config/backend/API/DB/worker/cron/global config/package changes = 0.
- external API/SDK/provider/connector/adapter basis: none.
- exceptions: none.

## Source Baseline

| Source | Required use |
|---|---|
| Current `App.tsx` route state | `/design` starts at group level and `onEnterTenant` enters `tenant.conversations` with selected tenant id. |
| Current `AppShell.tsx` | Topbar must expose breadcrumb, tenant capsule/switcher, search, `PRODUCTION`, heartbeat latency and user menu. |
| Current `AppShellNavigation.tsx` | Group nav sections and tenant nav sections remain separate, never mixed into one universal sidebar. |
| Current `GroupOverviewPage.tsx` | Tenant row button triggers tenant entry. |
| M7-58/59/60/61 evidence | Preserve conversation viewport, sidebar collapse/icon treatment and group overview first-viewport baseline. |

## Pass Conditions

- `/design` defaults to `data-shell-level="group"` and `data-active-page-id="group.overview"`.
- Group sidebar sections are exactly `总览 / 平台 / 治理`, with tenant nav labels absent.
- Topbar visibly includes `集团`, `玉珠跨境美妆`, search placeholder, `PRODUCTION`, `68ms` and `韩雪`.
- Clicking the `玉珠跨境美妆` tenant row enters `data-shell-level="tenant"`, `data-active-page-id="tenant.conversations"` and `data-tenant-id="tenant-a"`.
- Tenant sidebar sections are exactly `运营 / 数据 / 智能 / 管理 / 洞察`, with group nav labels absent.
- Collapse control works on the tenant route: width is about `68px`, text labels are hidden and icons remain visible.
- A `320px` mobile fallback stays readable with `document.body.scrollWidth <= 320`.
- Owner/source DOM sample plus React screenshots and metrics are captured under `/tmp/uzmax-m7-ui-62b-tenant-entry-visible-proof/`.

## Failure Branch

- If the current implementation fails due to copy/selector mismatch, apply the smallest shell/group-page patch needed and document it.
- If satisfying this path requires conversation internals, backend/API/DB/authz/package/lock/CI/global config work, stop and split a separate spec.
- If validation is blocked by tooling, record exact command/output and do not claim full closure.

## Out Of Scope

- No redesign or broad UI refactor.
- No conversation internals.
- No backend/API/DB/runtime/authz/customer-data/LLM/provider work.
- No production metrics, owner visual acceptance, runtime closure, GA-0, production readiness or release approval claims.

## Impeccable / Design Skill Layer

- Adopted: product UI restraint, source-derived shell dimensions, separated group/tenant IA, topbar state visibility, collapsed rail `68px`, mobile fallback no-overflow.
- Rejected: old universal sidebar, old shell visual source as acceptance target, decorative redesign, runtime/API invention and owner-acceptance/release claims.

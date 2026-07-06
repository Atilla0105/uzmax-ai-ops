# M7-UI-62B Tenant Entry Visible Proof

## Goal

Prove the smallest browser-visible boundary from the default `/design` group homepage to a selected tenant conversation workbench:

`group.overview` -> click `玉珠跨境美妆` -> `tenant.conversations`.

This is a visible-UI-first proof slice on top of `origin/codex/m7-ui-31-orders-visible-ui`. It should not redesign the shell or conversation page. If the existing UI already satisfies the path, this slice only adds focused test/spec/evidence.

Owner instruction preserved by this spec: group layer and tenant layer are separate; the default homepage is the group layer; selecting a tenant enters the tenant layer. The proof must reject a single mixed universal dashboard where group and tenant navigation/pages are visible together.

## Owner / Agent Boundary

- Owner visual source: `/Users/atilla/Downloads/运营塔台1.0.html`.
- Unpacked source baseline: `/Users/atilla/源码/unpacked 6`, especially shell navigation/topbar and conversation page sources.
- Design system baseline: `docs/admin-design-system.md`.
- UZMAX governance/product/admin/acceptance source-of-truth: `AGENTS.md`, `UZMAX智能运营系统-PRD-v1.1.md`, `UZMAX智能运营系统-技术架构-v1.1.md`, `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`, `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`.
- Worker path: `/Users/atilla/.codex/worktrees/m7-ui-62b-tenant-entry-visible-proof-cleanstack`.
- Branch: `codex/m7-ui-62b-tenant-entry-visible-proof-cleanstack`.
- Base: `origin/codex/m7-ui-31-orders-visible-ui`.
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
| Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` | Current visual/source boundary for shell, layer, tenant and topbar evidence. |
| `/Users/atilla/源码/unpacked 6` | Prototype-derived source package for owner shell/navigation/topbar/conversation references. |
| `docs/admin-design-system.md` | M7+ design-system source for group/tenant layer expression, topbar, tenant switcher and App Rail states. |
| AGENTS + v1.1 docs | Product scope, technical boundary, admin IA, acceptance blockers, permissions/RLS/release boundaries. |
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
- Tenant-layer sidebar, topbar and tenant context are visible after entry; the page must not fall back to a single mixed group/tenant universal dashboard.
- Collapse control works on the tenant route: width is about `68px`, text labels are hidden and icons remain visible.
- A `320px` mobile fallback stays readable with `document.body.scrollWidth <= 320`.
- When `/Users/atilla/Downloads/运营塔台1.0.html` is available locally, owner/source DOM sample and screenshot are captured under `/tmp/uzmax-m7-ui-62b-tenant-entry-visible-proof/`; when it is not mounted in CI, the test writes an `available:false` JSON artifact with the path and reason, then continues.
- CI hard-gates the React route/sidebar/topbar/layer proof: group layer visible first, tenant selection action, tenant-layer sidebar/topbar/context visible after entry, no single mixed universal dashboard, collapse behavior and 320px fallback.

## Failure Branch

- If the current implementation fails due to copy/selector mismatch, apply the smallest shell/group-page patch needed and document it.
- If satisfying this path requires conversation internals, backend/API/DB/authz/package/lock/CI/global config work, stop and split a separate spec.
- If validation is blocked by tooling, record exact command/output and do not claim full closure.

## Out Of Scope

- No redesign or broad UI refactor.
- No conversation internals.
- No new runtime/API/DB implementation and no authz/cache-invalidation closure.
- No backend/API/DB/runtime/authz/customer-data/LLM/provider work.
- No production metrics, owner visual acceptance, runtime closure, GA-0, production readiness or release approval claims.
- Mock/degraded visual shell is acceptable for this proof only.
- CI absence of the local owner HTML path does not dilute the owner HTML as visual source of truth; it only makes local owner/source sampling conditional while keeping React route/layer proof required.

## Impeccable / Design Skill Layer

- Adopted: product UI restraint, source-derived shell dimensions, separated group/tenant IA, topbar state visibility, collapsed rail `68px`, mobile fallback no-overflow and explicit degraded/mock boundary copy.
- Rejected: old universal sidebar, single mixed group/tenant dashboard, old shell visual source as acceptance target, decorative redesign, runtime/API/DB invention and owner-acceptance/release claims.

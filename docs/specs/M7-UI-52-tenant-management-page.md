# M7-UI-52 Tenant Management Page

## Goal

Implement a UI-first `group.tenants` / `租户管理` visible page on top of `origin/codex/m7-ui-51-connection-center-visible-ui`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`, and `docs/admin-design-system.md`.
- This supersedes the old ledger placeholder `M7-UI-04F-group-tenant`.
- This is a GROUP layer page. It renders group-only navigation and never carries a tenant id.
- Tenant rows are centralized synthetic/mock/degraded data derived from owner fixture values.
- Language, timezone, channel capability, disable and restore controls are browser-local only. They do not change production tenants, persist config, write audit logs, modify connectors or feature flags, or close runtime readiness.
- No owner visual acceptance, tenant runtime closure, audit-write closure, real tenant-management readiness, export/release closure, GA-0, or 1.0 release approval is claimed.

## 时间盒

One focused worker slice. If the page cannot render with visible UI plus state/test/evidence coverage inside this branch, stop and mark `blocked_by_visual_or_validation_failure`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-52-tenant-management-page.md`
  - `docs/evidence/M7/M7-UI-52-tenant-management-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
  - `apps/admin/tests/m7-ui-tenant-management.spec.ts`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/group/GroupTenantPage.tsx
  - apps/admin/src/pages/group/GroupTenantViews.tsx
  - apps/admin/src/pages/group/groupTenantFallback.ts
test:
  - apps/admin/tests/m7-ui-tenant-management.spec.ts
docs:
  - docs/specs/M7-UI-52-tenant-management-page.md
  - docs/evidence/M7/M7-UI-52-tenant-management-page.md
  - docs/admin-ui-page-migration-ledger.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## Change Budget

- Changed source files <= 5.
- New source files <= 3.
- Net source LOC <= 600.
- Each React component file <= 250 lines.
- No `large_change_exception` planned.

## PR Hygiene Notes

- New source `rg` conclusion: searched `GroupTenant`, `group.tenants`, `租户管理`, `tenant management`, `M7-UI-04F`, current registry/router entries, existing M7 group pages and tests. The current route was registry/scaffold-only; no existing M7 tenant-management page implementation existed in `apps/admin/src/pages/group/**`. New page source belongs under `apps/admin/src/pages/group/**` to match current M7 page workers.
- External API/SDK/provider/connector/adapter basis: none. This page intentionally does not call API/DB/runtime/authz/connectors or external providers.
- Exceptions: none.

## 文档触发检查

- 结果：`updated`.
- 判断依据：page migration ledger and M7 evidence index are owned outputs for this UI page slice.

## Preconditions

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-52-tenant-management-visible-ui`.
- Branch: `codex/m7-ui-52-tenant-management-visible-ui`.
- Base: `origin/codex/m7-ui-51-connection-center-visible-ui`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, and `git branch --show-current`.

## Implementation Contract

- Update `registry.ts` so `group.tenants` targets `M7-UI-52-tenant-management-page`, implemented pending PR, evidence pending not accepted/not runtime closed.
- Update `PageOutlet.tsx` to render `<GroupTenantPage />` for `group.tenants`; it must not carry `data-tenant-id`.
- Preserve source structure adapted to the requested card grid: group-layer page header, title `租户管理`, subtitle adapted from `N 个租户 · 创建 / 停用写审计` with local-only boundary, tenant card grid with status dot/name/status badge, line/template, members/AI/connection stats, click opens right-side management drawer, drawer header, language/timezone fields, channel capability toggles, disabled notice, restore/disable action, disable confirm modal with required reason.
- Centralize synthetic data and styles in `groupTenantFallback.ts`; use `SYN-TENANT-*` refs.
- URL query `?state=loading|empty|error|permission|degraded` and `?m7TenantState=...` render deterministic states. Default is degraded/interactive mock.
- Local interactions only: language/timezone/capability/disable/restore mutate browser state only and emit local-only toast copy.

## Impeccable / Design Skill Layer

- Adopted: dense, restrained, status-first product UI; owner prototype layout and copy shape; visible degraded/mock/read-only/local-only boundaries; group-only nav separation; keyboard-operable cards and switches; accessible drawer/modal behavior; mobile 320 no-overflow fallback.
- Rejected: old shell visuals, old `--uzmax-*` visual source, production-looking tenant metrics, real tenant creation/disable/restore, persisted language/timezone/capability config, connector/feature-flag mutation, audit writes, runtime/export/release closure copy, and owner-acceptance claims because this slice is UI-first and local-only.

## Not Doing

- No API/DB/runtime/authz/connector calls.
- No real tenant creation, disable, restore, tenant config persistence, connector or feature-flag mutation, audit write, export, release gate change, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness, or 1.0 release approval.
- No changes to lockfiles, DB/API/backend, global config, old release pages, or unrelated pages.

## Acceptance

- Focused Playwright coverage for `activePageId=group.tenants`, `shellLevel=group`, group-only nav, no tenant id, title/subtitle/runtime note, four tenant cards, local drawer opens, language/timezone local-only toast, capability toggle local-only toast, disable confirm requires reason, disable/restore mutate browser state only with no production tenant change/no audit write, forced URL states, collapsed sidebar width and mobile 320 no-overflow fallback.
- Browser evidence under `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/` with desktop screenshot, drawer screenshot, mobile 320 screenshot and metrics JSON.
- Evidence doc records source HTML/unpacked/React three-way comparison summary, mock/degraded boundary, screenshot paths, metrics and validation commands/results.

## 失败分支

- If source parity cannot be achieved without runtime data, keep the UI visibly degraded/mock/local-only and record the visual/runtime delta.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

## Closeout / Incident 记录

- Incident: none planned.

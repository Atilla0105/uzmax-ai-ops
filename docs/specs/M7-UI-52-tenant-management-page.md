# M7-UI-52 Tenant Management Page

## Goal

Implement a UI-first `group.tenants` / `租户管理` visible page on top of `origin/codex/m7-ui-31-orders-visible-ui` at `d7c06b3ed1ef753b4f79ecac1b381f0638f07be9`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/group/GroupTenantPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` `GROUP_TENANTS` / `TENANT_STATUS_COLORS`, and `docs/admin-design-system.md`.
- This supersedes the old ledger placeholder `M7-UI-04F-group-tenant`.
- This is a GROUP layer page. It renders under group shell/nav and the page outlet must not carry `data-tenant-id`.
- Tenant cards and drawer state are centralized synthetic/mock/degraded/browser-local data derived from owner fixture values.
- Language, timezone, capability toggles, disable and restore interactions are browser-local only. They do not persist tenant config, mutate connectors or feature flags, change production tenants, call API/DB/authz/external providers, or write audits.
- No owner visual acceptance, runtime closure, production tenant change, tenant config persistence, connector/feature flag mutation, audit write, GA-0, or 1.0 release approval is claimed.

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
- `GroupTenantViews.tsx` <= 245 lines.
- `groupTenantFallback.ts` <= 160 lines.
- Each React component file <= 250 lines.
- Each ordinary source file <= 400 lines.
- No `large_change_exception` planned.

## PR Hygiene Notes

- New source `rg` conclusion: searched `group.tenants`, `GroupTenant`, `租户管理`, existing registry/page outlet wiring, existing group page patterns, owner/unpacked `GroupTenantPage.tsx`, and `GROUP_TENANTS` / `TENANT_STATUS_COLORS` in `groupPlatform.ts`. The current route was registry/scaffold-only and no suitable implemented React group tenant page existed in `apps/admin/src/pages/group/**`. New page source belongs under `apps/admin/src/pages/group/**` to match current M7 page workers.
- External API/SDK/provider/connector/adapter basis: none. This page intentionally does not call API/DB/authz/runtime, external providers, tenant config persistence, connector/feature flag mutation, or audit sinks.
- Exceptions: none.

## 文档触发检查

- 结果：`updated`.
- 判断依据：page migration ledger and M7 evidence index are owned outputs for this UI page slice.

## Preconditions

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-52-tenant-management-page-cleanstack`.
- Branch: `codex/m7-ui-52-tenant-management-page-cleanstack`.
- Base: `origin/codex/m7-ui-31-orders-visible-ui` at `d7c06b3ed1ef753b4f79ecac1b381f0638f07be9`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, and `git branch --show-current`.

## Implementation Contract

- Update `registry.ts` so `group.tenants` targets `M7-UI-52-tenant-management-page`, implemented pending PR, evidence pending not accepted/not runtime closed.
- Update `PageOutlet.tsx` to render `<GroupTenantPage />` for `group.tenants`; the rendered group section must not carry `data-tenant-id`.
- Preserve source structure: title bar, four tenant cards, status dot/badge, business line/template, member/AI/connection facts, right management drawer, language/timezone fields, channel capability toggles, disabled note, disable/restore action.
- Use `ConfirmModal` with required reason and disabled confirm until reason is present.
- Drawer accessibility: `role="dialog"`, `aria-modal="true"`, close button initial focus, Escape close, focus returns to tenant card, and no simultaneous drawer/modal `aria-modal=true`.
- Centralize synthetic data and styles in `groupTenantFallback.ts`; use `SYN-TENANT-*` refs.
- URL query `?m7TenantState=loading|empty|error|permission|degraded` and legacy-compatible `?state=...` render deterministic states. Default is degraded/interactive mock.
- Local interactions only: language/timezone/capability/disable/restore mutate browser-local React state and show no-production/no-persistence/no-audit/no-connector-feature-flag toasts.

## Impeccable / Design Skill Layer

- Adopted: dense, restrained, status-first product UI; owner prototype card/drawer density and copy shape; visible degraded/mock/read-only/browser-local boundaries; group-only nav separation; reason-required destructive confirmation; explicit no-overflow 320px mobile fallback.
- Rejected: old backend shell visual source, old `--uzmax-*` visual source, production-looking tenant persistence, real tenant create/disable/restore, real tenant config save, connector/feature flag mutation, audit write, and any owner-acceptance/release/runtime closure copy because this slice is UI-first and local-only.

## Not Doing

- No DB/API/authz/runtime tenant wiring.
- No real tenant creation, disable, restore, config persistence, connector/feature flag mutation, audit write, external provider call, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness, or 1.0 release approval.
- No changes to lockfiles, DB/API/backend, global config, release page, old M5/M6 runtime files, or unrelated pages.

## Acceptance

- Focused Playwright coverage for source availability artifacts, `activePageId=group.tenants`, `shellLevel=group`, group-only nav, hidden tenant nav, no `data-tenant-id` on page outlet, four tenant cards, drawer controls, local-only toasts, required disable reason, local disable/restore, forced loading/empty/error/permission/degraded states, collapsed sidebar width `68px`, and mobile 320 no body/document horizontal overflow.
- Mobile evidence must measure `bodyScrollWidth`, `documentScrollWidth`, page width and drawer width at 320px; page content and drawer must not horizontally overflow.
- Browser evidence under `/tmp/uzmax-m7-ui-52-tenant-management-visible-ui/` with desktop screenshot, drawer screenshot, mobile 320 screenshot, source availability artifacts and metrics JSON.
- Evidence doc records owner/unpacked/source mapping, mock/degraded boundary, screenshot paths, metrics and validation commands/results.

## 失败分支

- If source parity cannot be achieved without runtime tenant data, keep the UI visibly degraded/mock/read-only/browser-local and record the visual/runtime delta.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

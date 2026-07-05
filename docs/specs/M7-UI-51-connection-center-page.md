# M7-UI-51 Connection Center Page

## Goal

Implement a UI-first `group.connections` / `连接中心` visible page on top of `origin/codex/m7-ui-50-template-center-visible-ui`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`, and `docs/admin-design-system.md`.
- This supersedes the old ledger placeholder `M7-UI-04D-group-connection`.
- This is a GROUP layer page. It renders group-only navigation and never carries a tenant id.
- Connection rows are centralized synthetic/mock/degraded data derived from owner fixture values.
- Toggle and test-connection controls are browser-local only. They do not change production connector flags, test real Telegram/order/import connections, persist state, write audit, change feature flags, or close ADR/runtime readiness.
- No owner visual acceptance, runtime closure, real connector readiness, export/release closure, GA-0, or 1.0 release approval is claimed.

## 时间盒

One focused worker slice. If the page cannot render with visible UI plus state/test/evidence coverage inside this branch, stop and mark `blocked_by_visual_or_validation_failure`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-51-connection-center-page.md`
  - `docs/evidence/M7/M7-UI-51-connection-center-page.md`
  - `docs/incidents/INC-2026-07-05-m7-ui-51-root-patch-target.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
  - `apps/admin/tests/m7-ui-connection-center.spec.ts`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/group/GroupConnectionPage.tsx
  - apps/admin/src/pages/group/GroupConnectionViews.tsx
  - apps/admin/src/pages/group/groupConnectionFallback.ts
test:
  - apps/admin/tests/m7-ui-connection-center.spec.ts
docs:
  - docs/specs/M7-UI-51-connection-center-page.md
  - docs/evidence/M7/M7-UI-51-connection-center-page.md
  - docs/incidents/INC-2026-07-05-m7-ui-51-root-patch-target.md
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

- New source `rg` conclusion: searched `group.connections`, `GroupConnection`, `连接中心`, `M7-UI-04D`, current registry/router entries, existing M7 group pages and tests. The current route was registry/scaffold-only; no existing M7 connection page implementation existed in `apps/admin/src/pages/group/**`. New page source belongs under `apps/admin/src/pages/group/**` to match current M7 page workers.
- Worker-boundary incident note: this slice also records `docs/incidents/INC-2026-07-05-m7-ui-51-root-patch-target.md` because an early relative `apply_patch` targeted root/main before cleanup. The accidental files were untracked, removed from root/main, and copied into the assigned worktree before implementation continued.
- External API/SDK/provider/connector/adapter basis: none. This page intentionally does not call API/DB/runtime/connectors or external providers.
- Exceptions: none.

## 文档触发检查

- 结果：`updated`.
- 判断依据：page migration ledger and M7 evidence index are owned outputs for this UI page slice.

## Preconditions

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-51-connection-center-visible-ui`.
- Branch: `codex/m7-ui-51-connection-center-visible-ui`.
- Base: `origin/codex/m7-ui-50-template-center-visible-ui`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, and `git branch --show-current`.

## Implementation Contract

- Update `registry.ts` so `group.connections` targets `M7-UI-51-connection-center-page`, implemented pending PR, evidence pending not accepted/not runtime closed.
- Update `PageOutlet.tsx` to render `<GroupConnectionPage />` for `group.connections`; it must not carry `data-tenant-id`.
- Preserve source structure: group-layer page header, title `连接中心`, subtitle `集团级连接类型 · 启停/测试写审计` adapted with local-only boundary, vertical connection card list, icon block, health badge, optional ADR badge, description, tenant count, spike/ADR classification, recent error, tenant chips, right-side enable/disabled control and `测试连接` action.
- Centralize synthetic data and styles in `groupConnectionFallback.ts`; use `SYN-CONN-*` refs.
- URL query `?state=loading|empty|error|permission|degraded` and `?m7ConnectionState=...` render deterministic states. Default is degraded/interactive mock.
- Local interactions only: toggle browser-local enabled state and run a synthetic test action that only updates UI/toast copy.

## Impeccable / Design Skill Layer

- Adopted: dense, restrained, status-first product UI; owner prototype layout and copy shape; visible degraded/mock/read-only/local-only boundaries; group-only nav separation; mobile 320 no-overflow fallback; no modal because source does not require one.
- Rejected: old shell visuals, old `--uzmax-*` visual source, production-looking connector health, real connector tests, feature-flag persistence, audit writes, ADR/runtime/export/release closure copy, and owner-acceptance claims because this slice is UI-first and local-only.

## Not Doing

- No API/DB/runtime/connector calls.
- No real Telegram Bot, Telegram Business, order API, import, feature-flag or audit-log mutation.
- No persistence of connection flags, no real connection test, no audit write, no export, no release gate change, no owner visual acceptance, no merge closure, no runtime closure, no GA-0, no production readiness, and no 1.0 release approval.
- No changes to lockfiles, DB/API/backend, global config, old release pages, or unrelated pages.

## Acceptance

- Focused Playwright coverage for `activePageId=group.connections`, `shellLevel=group`, group-only nav, no tenant id, title/subtitle/runtime note, four connection cards, health/ADR/error/tenant chips, local toggle, local test toast with `role=status`/`aria-live`, forced URL states, collapsed sidebar width and mobile 320 no-overflow fallback.
- Browser evidence under `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/` with desktop screenshot, mobile 320 screenshot and metrics JSON.
- Evidence doc records source HTML/unpacked/React three-way comparison summary, mock/degraded boundary, screenshot paths, metrics and validation commands/results.

## 失败分支

- If source parity cannot be achieved without runtime data, keep the UI visibly degraded/mock/local-only and record the visual/runtime delta.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

## Closeout / Incident 记录

- Incident: `docs/incidents/INC-2026-07-05-m7-ui-51-root-patch-target.md`.
- Institutionalized status: `pending_merge`.

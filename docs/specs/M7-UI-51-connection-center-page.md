# M7-UI-51 Connection Center Page

## Goal

Implement a UI-first `group.connections` / `连接中心` visible page on top of `origin/codex/m7-ui-31-orders-visible-ui` at `c08f887ba87069e01705a3b788d317196302c29e`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`, and `docs/admin-design-system.md`.
- This supersedes the old ledger placeholder `M7-UI-04D-group-connection`.
- This is a GROUP layer page. It renders group-only navigation and the page outlet must not carry `data-tenant-id`.
- Connection cards are centralized synthetic/mock/degraded data derived from owner fixture values: Telegram Bot, Telegram Business, 订单 API, 导入兜底.
- Toggle and test interactions are browser-local only. They do not persist connector state, call Telegram, call order APIs, write audit logs, write feature flags, mutate production connectors, or close runtime readiness.
- No owner visual acceptance, connector runtime closure, production connector change, real connection test, external API call, audit write, feature flag write, GA-0, or 1.0 release approval is claimed.

## 时间盒

One focused worker slice. If the page cannot render with visible UI plus state/test/evidence coverage inside this branch, stop and mark `blocked_by_visual_or_validation_failure`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-51-connection-center-page.md`
  - `docs/evidence/M7/M7-UI-51-connection-center-page.md`
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
- Each ordinary source file <= 400 lines.
- No `large_change_exception` planned.

## PR Hygiene Notes

- New source `rg` conclusion: searched `group.connections`, `GroupConnection`, `连接中心`, existing registry/page outlet wiring, existing group page patterns, owner/unpacked `GroupConnectionPage.tsx`, and `CONN_DEFS` / `CONN_HEALTH` in `groupPlatform.ts`. The current route was registry/scaffold-only and no suitable implemented React group connection page existed in `apps/admin/src/pages/group/**`. New page source belongs under `apps/admin/src/pages/group/**` to match current M7 page workers.
- External API/SDK/provider/connector/adapter basis: none. This page intentionally does not call API/DB/runtime, Telegram, order API, production connector, audit sink, or external providers.
- Exceptions: none.

## 文档触发检查

- 结果：`updated`.
- 判断依据：page migration ledger and M7 evidence index are owned outputs for this UI page slice.

## Preconditions

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-51-connection-center-page-cleanstack`.
- Branch: `codex/m7-ui-51-connection-center-page-cleanstack`.
- Base: `origin/codex/m7-ui-31-orders-visible-ui` at `c08f887ba87069e01705a3b788d317196302c29e`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, and `git branch --show-current`.

## Implementation Contract

- Update `registry.ts` so `group.connections` targets `M7-UI-51-connection-center-page`, implemented pending PR, evidence pending not accepted/not runtime closed.
- Update `PageOutlet.tsx` to render `<GroupConnectionPage />` for `group.connections`; the rendered group section must not carry `data-tenant-id`.
- Preserve source structure: owner-style page header, four dense connector cards, icon tile, status badge, ADR/spike labels, covered tenant count/list, recent error, enable/disable switch, test connection action and toast.
- Centralize synthetic data and styles in `groupConnectionFallback.ts`; use `SYN-CONN-*` refs.
- URL query `?m7ConnectionState=loading|empty|error|permission|degraded` and legacy-compatible `?state=...` render deterministic states. Default is degraded/interactive mock.
- Local interactions only: toggle connector preview state and run synthetic browser-local connection test toast.

## Impeccable / Design Skill Layer

- Adopted: dense, restrained, status-first product UI; owner prototype card density and copy shape; visible degraded/mock/read-only/browser-local boundaries; group-only nav separation; explicit no-overflow 320px mobile fallback.
- Rejected: old backend shell visual source, old `--uzmax-*` visual source, production-looking connector persistence, real Telegram/order API probes, production connector mutation, audit write, feature flag write, and any owner-acceptance/release/runtime closure copy because this slice is UI-first and local-only.

## Not Doing

- No DB/API/runtime connector wiring.
- No Telegram Bot, Telegram Business, order API, production connector, feature flag, audit, runbook, provider, or external API call.
- No production connector enable/disable, no real connection test, no tenant authorization write, no audit write, no feature flag write, no owner visual acceptance, no merge closure, no runtime closure, no GA-0, production readiness, or 1.0 release approval.
- No changes to lockfiles, DB/API/backend, global config, release page, old M5/M6 runtime files, or unrelated pages.

## Acceptance

- Focused Playwright coverage for source availability artifacts, `activePageId=group.connections`, `shellLevel=group`, group-only nav, hidden tenant nav, no `data-tenant-id` on page outlet, four connector cards and ADR/spike/source labels, runtime note/toast disclaimers, browser-local toggle/test interactions, forced loading/empty/error/permission/degraded states, collapsed sidebar width `68px`, and mobile 320 no body/document horizontal overflow.
- Mobile evidence must measure `bodyScrollWidth`, `documentScrollWidth`, header width, runtime note width and card width at 320px; page content must not be horizontally clipped.
- Browser evidence under `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/` with desktop screenshot, collapsed screenshot, mobile 320 screenshot, source availability artifacts and metrics JSON.
- Evidence doc records owner/unpacked/source mapping, mock/degraded boundary, screenshot paths, metrics and validation commands/results.

## 失败分支

- If source parity cannot be achieved without runtime connector data, keep the UI visibly degraded/mock/read-only/browser-local and record the visual/runtime delta.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

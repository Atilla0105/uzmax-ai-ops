# M7-UI-56 Tenant Logs Minimal Visible Page

## Goal

Implement one narrow visible UI slice for tenant-layer `tenant.logs` / `日志` on top of `origin/codex/m7-ui-31-orders-visible-ui`.

## Scope

- Route/page id: `tenant.logs`.
- Source: `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx` and the tenant log fixture rows in `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`.
- Visible structure: title `日志`, search placeholder `搜索本页记录…`, tabs `登录日志` / `在线日志` / `操作日志`, dense table, filtered empty text, and operation detail cells as link-like navigation affordances.
- Runtime boundary: local mock/degraded browser data only. No API, DB, authz, RLS, audit runtime, export, file write, or production log closure is claimed.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/logs/**`
  - `apps/admin/tests/m7-ui-logs-page.spec.ts`
  - `docs/specs/M7-UI-56-logs-page.md`
  - `docs/evidence/M7/M7-UI-56-logs-page.md`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/logs/LogsPage.tsx
test:
  - apps/admin/tests/m7-ui-logs-page.spec.ts
docs:
  - docs/specs/M7-UI-56-logs-page.md
  - docs/evidence/M7/M7-UI-56-logs-page.md
generated: []
lock: []
config: []
```

## Allowed Touch Paths

- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/logs/**`
- `apps/admin/tests/m7-ui-logs-page.spec.ts`
- `docs/specs/M7-UI-56-logs-page.md`
- `docs/evidence/M7/M7-UI-56-logs-page.md`

## Budget

- New source files <= 4.
- Source net LOC <= 450.
- Main React file <= 220 lines.

## States

The page must expose default/degraded plus loading, empty, error and permission denied variants through query-driven local state for Playwright coverage.

## Not In Scope

- Group logs content.
- Full audit center.
- Runtime/API wiring.
- Release or acceptance evidence as page content.
- Root/main checkout edits.

# M7-UI-32 Knowledge Resources Page

## Goal

Implement a visible, testable, UI-first `tenant.knowledge` / 知识与资源 page on top of `origin/codex/m7-ui-31-orders-visible-ui`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6/pages/knowledge/KnowledgePage.tsx`.
- Page preserves the source structure: header, six tabs, toolbar, journey stages, facts table/detail, public/private snippets, assets table/detail/edit and template source table.
- This slice does not claim owner visual acceptance, runtime closure, release approval or production knowledge-data readiness.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-32-knowledge-resources-page.md`
  - `docs/evidence/M7/M7-UI-32-knowledge-resources-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/knowledge/KnowledgePage.tsx`
  - `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
  - `apps/admin/src/pages/knowledge/KnowledgeViews.tsx`
  - `apps/admin/tests/m7-ui-knowledge-resources.spec.ts`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/knowledge/KnowledgePage.tsx
  - apps/admin/src/pages/knowledge/knowledgeFallback.ts
  - apps/admin/src/pages/knowledge/KnowledgeViews.tsx
test:
  - apps/admin/tests/m7-ui-knowledge-resources.spec.ts
docs:
  - docs/specs/M7-UI-32-knowledge-resources-page.md
  - docs/evidence/M7/M7-UI-32-knowledge-resources-page.md
  - docs/admin-ui-page-migration-ledger.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## Change Budget

- Changed source files <= 6.
- New source files <= 3.
- Net source LOC <= 900.
- Every React component source file <= 250 lines.
- Non-component source files <= 400 lines.
- Complexity <= 10.

## Implementation Contract

- Route `tenant.knowledge` through `PageOutlet` with `key={selectedTenantId}` to reset tenant-local state.
- Use synthetic degraded/mock/read-only data only.
- Synthetic IDs must use `SYN-KB-*`; refs must use `controlled://mock/...`.
- Persistent runtime labels must include `degraded`, `mock`, `read-only`, `not production knowledge data`, `no formal knowledge write` and `no automatic publish`.
- URL query `?m7KnowledgeState=loading|empty|error|permission|gate` renders deterministic visible states.
- No DB/API/storage/eval runtime, real knowledge write, automatic publish or production knowledge data.

## Not Doing

- No backend/API/DB/worker/cron/package/lock/global config changes.
- No real customer, order, Telegram, address, phone or production knowledge data.
- No automatic formal knowledge-base write.
- No automatic publish.
- No owner acceptance or release closure claim.

## Acceptance

- Focused Playwright coverage for tenant navigation, tenant-only sidebar, topbar/sidebar dimensions, runtime labels, tabs, journey, facts keyboard/detail/redline, snippets, assets local edit/save/cancel/delete, template source, URL states, tenant-switch reset and mobile 320 no body overflow.
- Evidence records validation results and screenshot paths under `/tmp/uzmax-m7-ui-32-knowledge-resources-visible-ui-v2`.

# M7-UI-42 Model Cost Risk Page

## Goal

Implement a cleanstack UI-first `group.modelRisk` / `模型/成本/风险` visible page on top of current visible UI trunk `origin/codex/m7-ui-31-orders-visible-ui` at `375417253e49a98c1bb1f2ee5f2f357b02bdc3be`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/groupModel.ts`, and `docs/admin-design-system.md`.
- This is a GROUP layer page. It may enter tenant layer only through existing tenant ids `tenant-a` / `tenant-b` / `tenant-c` / `tenant-d`, and this slice uses cost rows to enter `tenant.conversations`.
- All displayed model, cost, latency, failure-rate and risk numbers are synthetic UI fallback values only. Key areas must visibly say `degraded`, `mock`, `read-only`, `not production cost metrics`, `no production model routing`, and `local action only`.
- No owner visual acceptance, runtime closure, production model/cost/risk readiness, production export, GA-0, or 1.0 release approval is claimed.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-42-model-cost-risk-page.md`
  - `docs/evidence/M7/M7-UI-42-model-cost-risk-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
  - `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
  - `apps/admin/src/pages/group/groupModelRiskFallback.ts`
  - `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/group/GroupModelRiskPage.tsx
  - apps/admin/src/pages/group/GroupModelRiskViews.tsx
  - apps/admin/src/pages/group/groupModelRiskFallback.ts
test:
  - apps/admin/tests/m7-ui-model-cost-risk.spec.ts
docs:
  - docs/specs/M7-UI-42-model-cost-risk-page.md
  - docs/evidence/M7/M7-UI-42-model-cost-risk-page.md
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

## Implementation Contract

- Update `registry.ts` so `group.modelRisk` targets `M7-UI-42-model-cost-risk-page`, source path `/Users/atilla/源码/unpacked 6/pages/group/GroupModelPage.tsx`, implemented pending PR, evidence pending not accepted/not runtime closed.
- Update `PageOutlet.tsx` to render `<GroupModelRiskPage onEnterTenant={onEnterTenant} />` for `group.modelRisk`; the section must not carry `data-tenant-id`.
- Centralize synthetic data in `groupModelRiskFallback.ts`; use `SYN-MODEL-*` refs and only existing tenant ids.
- URL query `?m7ModelState=loading|empty|error|permission|degraded` renders deterministic states. Default is degraded/interactive mock.
- Preserve source structure: header/export, KPI grid, model task matrix, tenant cost composition, risk queue.
- Local interactions only: export toast, matrix primary/fallback swap, AllProvidersDown local resolve/KPI update, tenant cost-row transition into `tenant.conversations`.

## Impeccable / Design Skill Layer

- Adopted: dense, restrained, status-first product UI; visible degraded/mock/read-only boundaries in every major area; no legacy shell visuals or old `--uzmax-*` tokens as design source.
- Rejected: production-looking cost/provider/export semantics and full runtime charting, because this is explicitly UI-first and cannot imply true accounting, route, provider-health or export readiness.

## Not Doing

- No DB/API/runtime/LLM/provider/cost accounting wiring.
- No production model routing, cost metrics, latency metrics, failure-rate metrics, provider health, CSV export or audit write.
- No owner visual acceptance, merge closure, runtime closure, GA-0, production readiness, or 1.0 release approval.

## Acceptance

- Focused Playwright coverage for group-only shell, runtime copy, local export toast, local primary/fallback switch, local risk resolve/KPI update, tenant cost-row transition into `tenant.conversations`, forced URL states, collapsed sidebar width and 320px no-overflow fallback.
- CI-safe source availability evidence must use `existsSync` and write unavailable evidence if `/Users/atilla/...` source artifacts are absent, while React page assertions stay hard.
- Browser evidence under `/tmp/uzmax-m7-ui-42-model-cost-risk-page-cleanstack/` with desktop screenshot, mobile 320 screenshot, source availability/sampling, and desktop/mobile metrics JSON.

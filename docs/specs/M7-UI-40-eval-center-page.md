# M7-UI-40 Eval Center Page

## Goal

Implement a visible, browser-testable, UI-first `tenant.eval` / 评测中心 page on top of `origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx`, `/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts`, `/Users/atilla/源码/unpacked 6/hooks/useEvals.ts` and `/Users/atilla/源码/unpacked 6/fixtures/evals.ts`.
- Page preserves the source structure: title, Production Gate badge, 300px eval-set list, selected-set detail, run eval action, prompt/knowledge/model/cases meta, blind-review status/action, failed-case expected/actual diff, manual override confirmation and publish confirmation.
- This slice does not claim owner visual acceptance, runtime closure, release approval, production eval data readiness or production publish readiness.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-40-eval-center-page.md`
  - `docs/evidence/M7/M7-UI-40-eval-center-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/evals/EvalPage.tsx`
  - `apps/admin/src/pages/evals/EvalViews.tsx`
  - `apps/admin/src/pages/evals/evalFallback.ts`
  - `apps/admin/tests/m7-ui-eval-center.spec.ts`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/evals/EvalPage.tsx
  - apps/admin/src/pages/evals/EvalViews.tsx
  - apps/admin/src/pages/evals/evalFallback.ts
test:
  - apps/admin/tests/m7-ui-eval-center.spec.ts
docs:
  - docs/specs/M7-UI-40-eval-center-page.md
  - docs/evidence/M7/M7-UI-40-eval-center-page.md
  - docs/admin-ui-page-migration-ledger.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## Change Budget

- Changed source files <= 5.
- New source files <= 3.
- Net source LOC <= 600 if feasible.
- Every React component source file <= 250 lines.
- Non-component source files <= 400 lines.
- Complexity <= 10.

## Exceptions

- None proposed at spec creation.

## Implementation Contract

- Route `tenant.eval` through `PageOutlet` with `key={selectedTenantId}` to reset tenant-local state.
- Use centralized synthetic degraded/mock/read-only data only.
- Synthetic IDs must use `SYN-EVAL-*`; refs must use `controlled://mock/evals/...`.
- Persistent runtime labels must include `degraded`, `mock`, `read-only`, `not production eval data`, `no production publish` and `manual review local only`.
- URL query `?m7EvalState=loading|empty|error|permission|degraded|pass|running` renders deterministic visible states; default is degraded/blocked.
- Manual review override and publish confirmation require a reason before accepting and mutate only browser-local state.
- Publish config stays disabled unless the gate passes by local overrides or forced pass URL state.
- No DB/API/eval runner/runtime wiring, LLM/provider call, real production eval data or production publish.

## Impeccable / Design Skill Layer

- Adopted: product-register guidance for dense, restrained, task-first admin UI; owner prototype structure; visible state labels; reason-required confirmation; mobile fallback without body overflow.
- Rejected: none. Design Skill Layer recommendations did not conflict with AGENTS/source-of-truth boundaries.

## Not Doing

- No backend/API/DB/worker/cron/package/lock/global config changes.
- No real customer, order, account, secret, production eval or provider data.
- No LLM/provider call.
- No production publish, production gate closure, owner acceptance or release approval.

## Acceptance

- Focused Playwright coverage for tenant navigation, tenant-only sidebar, collapse width, topbar height, left list width, runtime labels, gate blocked/running/pass, run state, blind review toggle, reason-required manual override, reason-required local publish preview, URL states, tenant-switch reset and mobile 320 no body overflow.
- Evidence records validation results and screenshot/metrics paths under `/tmp/uzmax-m7-ui-40-eval-center-visible-ui`.

# M7-UI-09 M4 Visible Smoke Legacy Route Compat

## Goal

Repair the M4 visible true DB smoke harness after the M7-UI-05 layered navigation shell changed `/design` to open `group.overview`.

The M4 visible smoke scripts still begin at `/design`, but the legacy M4 shell now lives behind the explicit `legacy.evidence` route. This slice updates the visible smoke harnesses so M4-38 fresh, M4-39 stale/missing and M4-43 customer asset true DB browser smokes click `Open legacy evidence route`, wait for `legacy-evidence-route`, and only then wait for their legacy M4 runtime state test ids.

This is a compatibility fix only. It must not touch PR #191 group overview DB/API code, PR #182 page work, backend/API/DB schema/migrations, package/lock files, CI workflow wiring, or admin source. It does not create new M4 runtime evidence and does not weaken true DB/browser assertions.

## Owner Confirmation Points And AI Agent Responsibilities

Owner/coordinator:

- Confirm this slice is only a smoke harness compatibility repair for the existing explicit legacy evidence route.
- Keep final scope, CI merge policy, production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-09-m4-visible-smoke-legacy-route-compat` on branch `codex/m7-ui-09-m4-visible-smoke-legacy-route-compat`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Do not edit PR #191, PR #182, backend/API/DB schema/migrations/package/lock/group overview implementation, admin source or CI workflow unless a separate proven blocker exists.
- Preserve the existing smoke global injection, `**/order-import/**` and `**/customer-assets/**` route proxies, true DB assertions, fail-closed env behavior and cleanup residue checks.
- Record preflight, required reads, validation and residual risk honestly.

## Timebox

0.25 workday for spec, harness compatibility patch, focused structure tests, evidence, validation and Draft PR creation if tooling is available. If the repair requires admin source changes, CI workflow edits, backend/API/DB/schema changes, dependency updates, true DB assertion weakening or root/main writes, stop and report `BLOCKED`.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-09-m4-visible-smoke-legacy-route-compat.md`
  - `docs/evidence/M7/M7-UI-09-m4-visible-smoke-legacy-route-compat.md`
  - `docs/evidence/M7/README.md`
  - `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`
  - `packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs`
  - `scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs`
  - `scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs`
  - `scripts/tests/m4-customer-asset-runtime-workflow.test.mjs`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 2
- source net LOC: <= 120
- new source files: 0
- test files changed: <= 3
- docs changed: <= 3
- generated/lock/config/backend/API/DB schema/migrations/package/CI/admin source/group overview/page PR files: 0
- binary screenshots/artifacts committed: 0
- external API/SDK/provider/connector/adapter basis: none; existing Playwright locator behavior and existing admin route button only.
- new source file ownership: none.
- exceptions: none.

## 文档触发检查

- 结果：`updated`。
- 判断依据：this slice changes a CI-facing M4 visible smoke harness and adds compatibility evidence under M7; it does not change product scope, runtime API, release gates or runbooks.

## Required Reads / Source Mapping

Required reads before implementation:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-05-layered-navigation-shell.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `docs/specs/M4-38-order-import-admin-visible-true-db-smoke.md`
- `docs/specs/M4-39-order-import-admin-visible-stale-missing-true-db-smoke.md`
- `docs/specs/M4-43-customer-asset-runtime-workflow.md`
- `docs/evidence/M4/README.md`
- `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs`
- `packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs`
- `packages/db/scripts/run-m4-order-import-admin-visible-true-db-smoke.mjs`
- `packages/db/scripts/run-m4-order-import-admin-visible-stale-missing-true-db-smoke.mjs`
- `packages/db/scripts/run-m4-customer-asset-runtime-workflow-smoke.mjs`
- `scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs`
- `scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs`
- `scripts/tests/m4-customer-asset-runtime-workflow.test.mjs`
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/tests/helpers/openLegacyEvidence.ts`

Source mapping:

| Source | Finding / required use |
|---|---|
| `docs/specs/M7-UI-05-layered-navigation-shell.md` | `/design` must open group overview; legacy evidence remains reachable only through an explicit route. |
| `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md` | Existing Playwright tests were migrated to click `Open legacy evidence route` after `/design`. |
| `apps/admin/src/pages/PageOutlet.tsx` | Existing button text is `Open legacy evidence route`; legacy route marker is `data-testid="legacy-evidence-route"`. |
| `apps/admin/tests/helpers/openLegacyEvidence.ts` | Existing admin tests use the same click-and-wait sequence. Harness can mirror it locally without importing admin test helpers into DB scripts. |
| `packages/db/scripts/order-import-admin-visible-smoke-harness.mjs` | Shared M4-38/M4-39 visible smoke path injects the smoke global, proxies `**/order-import/**`, goes to `/design`, then currently looks for `m4-order-runtime-state` too early. |
| `packages/db/scripts/customer-asset-admin-visible-smoke-harness.mjs` | M4-43 visible smoke path injects the customer asset smoke global, proxies `**/customer-assets/**`, goes to `/design`, then currently looks for `m4-customer-runtime-state` too early. |
| M4-38/M4-39 scripts and tests | Both scripts reuse `withVisibleSmokePage()`, so one harness repair covers fresh and stale/missing true DB browser smokes. |
| M4-43 script and test | The customer asset runtime workflow smoke reuses `withCustomerAssetVisibleSmokePage()`, so the analogous harness repair covers the later CI failure without touching admin source. |

## Implementation Contract

- Add a local harness helper that clicks `getByRole("button", { name: "Open legacy evidence route" })` and waits for `getByTestId("legacy-evidence-route")`.
- In `withVisibleSmokePage()` and `withCustomerAssetVisibleSmokePage()`, preserve smoke global injection and route proxy setup before navigation.
- Navigate to `${runtime.adminBaseUrl}/design`, enter the explicit legacy evidence route, then invoke the callback with `page.getByTestId("m4-order-runtime-state")` or `page.getByTestId("m4-customer-runtime-state")` as before.
- Do not import `apps/admin/tests/helpers/openLegacyEvidence.ts` into the DB harness; keep the DB script self-contained.
- Do not change the M4 runtime assertions, true DB fixture seed/cleanup, route proxy headers, fail-closed env checks or success messages.
- Add focused structure tests proving the legacy route is entered before the order-import and customer-asset runtime-state lookups.

## Tests / Evidence Requirements

Implementation evidence must include:

- preflight `pwd`, `git status --short --branch`, `git branch --show-current`, `git branch --no-merged main` and open PR check or `gh` unavailable note;
- exact changed files;
- focused structure tests for the order-import and customer asset M4 visible smoke test files;
- `git diff --check`;
- touched-file Prettier check, plus full `format:check` if feasible;
- `guard:doc-triggers`;
- `guard:pr-shape` against this spec;
- `lint`;
- `typecheck` or exact local dependency blocker;
- true DB smoke status recorded honestly. If `UZMAX_RLS_DATABASE_URL` is unavailable locally, do not claim true DB smoke pass.

Required validation:

- `git diff --check`
- touched-file Prettier check
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-09-m4-visible-smoke-legacy-route-compat.md --include-worktree`
- `node --test scripts/tests/m4-order-import-admin-visible-true-db-smoke.test.mjs scripts/tests/m4-order-import-admin-visible-stale-missing-true-db-smoke.test.mjs scripts/tests/m4-customer-asset-runtime-workflow.test.mjs`
- `npm run lint`
- `npm run typecheck`

## Pass Conditions

- `withVisibleSmokePage()` opens `/design`, enters the explicit legacy evidence route and only then resolves `m4-order-runtime-state`.
- `withCustomerAssetVisibleSmokePage()` opens `/design`, enters the explicit legacy evidence route and only then resolves `m4-customer-runtime-state`.
- Both M4-38 and M4-39 smoke entrypoints remain behaviorally true DB/browser smokes through the existing shared harness.
- The M4-43 customer asset runtime workflow smoke remains behaviorally true DB/browser smoke through its existing harness.
- Focused structure tests fail if the legacy route entry is removed or moved after the runtime-state lookup.
- No CI workflow, admin source, backend/API, DB schema/migration, package/lock, group overview or page PR files are changed.
- Evidence and M7 README make the compatibility repair discoverable without claiming M4 or release closure.

## Failure Branch

- If `legacy.evidence` is not reachable through the existing button/marker, stop and report `BLOCKED`; do not edit admin source in this slice.
- If local runtime lacks `UZMAX_RLS_DATABASE_URL`, record true DB browser smoke as CI-only/pending and do not run it as a pass.
- If validation fails because of unrelated baseline dependency gaps, record exact blockers and keep the compatibility diff narrow.
- If push/PR creation is unavailable, leave the branch committed locally and report the exact blocker.

## Out Of Scope

- No PR #191 group overview DB/API foundation changes.
- No PR #182 conversation page work.
- No admin source changes.
- No `.github/workflows/ci.yml` change unless CI wiring is separately proven wrong.
- No backend/API/worker/cron/authz/DB schema/migrations/generated/package/lock changes.
- No true DB assertion weakening, skip, mock expansion or fake pass.
- No M4 acceptance remapping, owner signoff, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

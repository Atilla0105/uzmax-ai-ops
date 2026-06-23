# M4-44 Order-Read Runtime Eval Gate Evidence

> spec: `docs/specs/M4-44-order-read-runtime-eval-gate.md`
> branch: `codex/m4-44-order-read-runtime-eval-gate`
> worktree: `/Users/atilla/Documents/uzmax-m4-44-order-read-runtime-eval-gate`
> status: implementation complete; local validation passed; PR CI run `28047187051`, job `83028183462`, passed for implementation head `9485f79`; later commits still require current-head PR checks before merge

## Scope

M4-44 adds a controlled runtime-to-eval bridge for the ADR-B02 no-API order-read path:

- `packages/capabilities/order-read` now exports `createOrderReadRuntimeEvalCandidate`, a pure helper that maps real `OrderReadResult` objects into the bounded M4-22 candidate shape.
- Fresh `snapshot_ready` runtime results produce `order_snapshot_summary`, `handoffRequired: false` and only the controlled `orderStatusRef`.
- Missing, stale and degraded `handoff_required` runtime results produce only `handoff`, `handoffRequired: true`; they do not expose `orderStatusRef` or `logisticsStatusRef`.
- Focused tests feed real `evaluateOrderSnapshotForRead` fresh/stale/missing/degraded synthetic outputs into `evaluateM4OrderReadNoFabrication`.
- The test also proves `apps/api/src/order-import.service.ts` and `packages/capabilities/order-read/src/index.ts` do not import `packages/evals`.

This is not a production eval gate. Real eval fixtures, provider judge calls, prompt/completion capture, LLM routing, production release gates and final M4 closeout remain future scope.

## Synthetic Cases

| Case | Runtime source | Candidate | Eval result |
|---|---|---|---|
| fresh | `snapshot_ready` / `snapshot_fresh` from `evaluateOrderSnapshotForRead` | `order_snapshot_summary`, no handoff, controlled `orderStatusRef` | expected passed |
| stale | `handoff_required` / `order_snapshot_stale` from `evaluateOrderSnapshotForRead` | `handoff`, `handoffRequired: true`, no status refs | expected passed |
| missing | `handoff_required` / `order_snapshot_missing` from `evaluateOrderSnapshotForRead` | `handoff`, `handoffRequired: true`, no status refs | expected passed |
| degraded | `handoff_required` / `order_data_degraded` from `evaluateOrderSnapshotForRead` | `handoff`, `handoffRequired: true`, no status refs | expected passed |
| fabricated handoff | stale runtime metadata plus hand-written order/logistics status refs | fabricated snapshot summary | expected failed |

## Validation

| Command / Check | Result |
|---|---|
| `npm ci` | passed; existing audit output reports 3 high severity vulnerabilities |
| `npm run lint -- --quiet` | passed after source helper line-budget adjustment |
| `node --test scripts/tests/m4-order-read-runtime-eval-gate.test.mjs` | passed; 5 tests |
| `node --test scripts/tests/m4-order-read-import-snapshot-contract.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs scripts/tests/m4-order-read-runtime-eval-gate.test.mjs` | passed; 20 tests |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed; 89/89 baseline markers |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; 96 modules, no dependency violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-44-order-read-runtime-eval-gate UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-44-order-read-runtime-eval-gate.md --include-worktree` | passed; changed files 6, categories docs 4/source 1/test 1, source within budget, new source files 0 |
| GitHub Actions CI | passed in PR run `28047187051`, job `83028183462`; path scope `run_core=true`, `true_db_smoke_changed=false`, `frontend_changed=false`; `guard:pr-shape` reported docs 4/source 1/test 1, source net LOC 3, new source files 0; `npm test` passed 314 tests; `npm run build` passed |
| `git diff --check` | passed |
| `npm test` | passed; 314 tests |
| `npm run build` | passed |
| `npm run size` | passed locally; 61.78 kB brotlied under 250 kB limit; CI skipped because no frontend path changed |
| `npm run playwright` | passed locally; 11 tests; CI skipped because no frontend path changed |

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `runtime_eval_bridge_supported_not_new_import_runtime` | Reuses current import snapshot runtime outputs; no new import runtime, real samples or connector added. |
| E-03 | `runtime_eval_bridge_supported_not_persisted_warning_store` | Stale/missing/degraded runtime outputs map to handoff candidates without status refs before eval pass; persisted warning storage remains future scope. |
| E-04 | `order_read_runtime_eval_gate_supported_not_production_gate` | Runtime order-read outputs can be evaluated for no-fabrication; real fixtures, provider judge and production eval gate remain future scope. |
| I-01 | `partial_runtime_eval_bridge_not_full_desktop_core` | API/order-read runtime behavior is machine-evaluable; broader desktop core and formal production auth remain future scope. |
| J-02 | `still_requires_m4_45_queue_security_closeout` | No queue/security closeout changes. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system, network call, env read or production connector is added.
- No raw customer/order data, real order IDs, phone numbers, addresses, payment information, CSV/XLSX exports, screenshots, raw prompts, raw completions, credentials or env files are committed.
- `packages/evals` is used only by the focused test harness; it is not imported by `apps/api/src/order-import.service.ts` or `packages/capabilities/order-read/src/index.ts`.
- No `apps/api/src/order-import.service.ts`, `packages/evals/src/m4-order-read-no-fabrication.ts`, package/lock/config/CI, DB schema/migration/generated file or real/raw fixture is modified.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | docs 4, source 1, test 1 |
| Changed source files | 1 |
| Net source LOC | +3 |
| New source files | 0 |
| Source gross churn | +14 / -11 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none expected |

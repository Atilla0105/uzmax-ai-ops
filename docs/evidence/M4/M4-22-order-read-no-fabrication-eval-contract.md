# M4-22 Order-Read No-Fabrication Eval Contract Evidence

> spec: `docs/specs/M4-22-order-read-no-fabrication-eval-contract.md`
> branch: `codex/m4-22-order-read-no-fabrication-eval`
> worktree: `/Users/atilla/Documents/uzmax-m4-22-order-read-no-fabrication-eval`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_read_no_fabrication_eval_contract__pure_no_runtime`
> redaction_status: no raw customer/order data, eval fixtures, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, raw prompts, raw completions, credentials, token values or env files included

## Scope

M4-22 adds a narrow pure eval contract for E-04. `evaluateM4OrderReadNoFabrication` checks synthetic/ref-only order-read candidate behavior: missing, stale or degraded order reads must hand off without exposing order/logistics status refs; fresh snapshot reads may expose only a controlled order status ref.

It does not wire AI runtime, engine/API/admin/worker integration, provider judge calls, production eval gates, DB persistence, real eval fixtures, external order API connectors, production config or real customer/order data.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-22-order-read-no-fabrication-eval` | passed |
| Branch | `codex/m4-22-order-read-no-fabrication-eval` | passed |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity vulnerabilities, not introduced by this PR |
| Baseline tests | `npm test` before edits | passed; 222 tests |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no index lock | passed |
| Handoff eval cases | missing/stale/degraded require handoff and no status exposure | passed focused test |
| Fresh eval case | controlled status ref required and handoff forbidden | passed focused test |
| Status/reason mismatch | stale marked fresh and fresh marked handoff fail closed | passed focused test after code-quality review residual-risk follow-up |
| Eval package entrypoint | index re-export loads through existing eval tests | passed related eval tests |
| Sensitive data/runtime | no raw data, env reads, DB connection, provider call or external API call | passed focused test, diff review and guards |

## Boundary Preflight Note

The full local worker boundary guard failed before implementation because root/main contained five existing untracked duplicate docs:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-22 worker did not write those files. Because they may be user-retained local files, this PR does not delete or move them. The worker proceeded with absolute assigned worktree paths plus CI-mode boundary check and manual tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-22 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `eval_contract_supported_not_closed` | Keeps import snapshot as the current main path; evaluates candidate behavior only. DB/queue/admin E2E remains future scope. |
| E-03 | `eval_contract_supported_not_closed` | Stale eval cases must hand off without status exposure; persisted warning, real DB wiring and E2E stale sample evidence remain future scope. |
| E-04 | `eval_contract_supported_not_closed` | Adds pure no-fabrication eval contract for missing/stale/degraded order-read candidates. AI runtime integration, real fixtures and production gate remain future scope. |
| I-01 | `partial_eval_contract_not_closed` | Eval package can validate order-read candidate behavior; full desktop order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw eval fixtures, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, raw prompts, raw completions, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `packages/capabilities/**`, `apps/**`, `packages/engine/**`, `packages/llm-gateway/**`, package/lock/config/CI files were modified.
- Existing eval test loaders were updated only to support the package index's local TS re-export; no assertions were weakened.
- M4-22 evaluates candidate behavior only; it does not change the M4-05 order-read runtime contract.
- M4 evidence index and evals README were synchronized while preserving production DB runtime, queue runtime, admin E2E, AI runtime integration, real fixtures, production eval gate and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | No findings. Reviewer confirmed touch list, no API/DB/raw/runtime boundary, M4 evidence closeout wording and worker boundary record are in scope. | No code/docs change required. |
| Code quality | No blocking findings. Reviewer noted residual risk that status/reason mismatch lacked direct tests. | Added explicit stale-marked-fresh and fresh-marked-handoff negative assertions; focused and full validation pass. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | docs 4, source 2, test 3 |
| Changed source files | 2 |
| Net source LOC | +237 |
| New source files | 1 |
| Source gross churn | 237 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs` | passed; 5 tests |
| `node --test scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs scripts/tests/eval-gate.test.mjs scripts/tests/m3-eval-gate-redline-runner.test.mjs scripts/tests/m4-order-read-import-snapshot-contract.test.mjs` | passed; 24 tests |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed; 89/89 baseline markers |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; 64 modules, no dependency violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers -- --base origin/main --include-worktree` | passed before commit; no eval-triggering paths detected from uncommitted diff |
| `npm run guard:eval-triggers -- --base origin/main` | passed post-commit; minimal eval job ran for `packages/evals/src/index.ts` and `packages/evals/src/m4-order-read-no-fabrication.ts`, 4 tests |
| `npm run guard:doc-triggers` | passed |
| `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-22-order-read-no-fabrication-eval UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | passed CI-mode assigned worktree check |
| `npm run guard:workspace` | passed |
| `git diff --check` | passed |
| `CI=true npm run check` | passed; 227 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-22-order-read-no-fabrication-eval-contract.md` | passed post-commit; 9 changed files, categories docs 4/source 2/test 3, source changed files 2, source netLoc +237, new source files 1 |
| assigned worktree final status | pending |
| root/main final status | pending; root tracked/index clean expected, existing untracked duplicate docs remain unless owner authorizes cleanup |

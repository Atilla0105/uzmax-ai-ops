# M4-21 Order Import Runtime Warning Contract Evidence

> spec: `docs/specs/M4-21-order-import-runtime-warning-contract.md`
> branch: `codex/m4-21-order-import-runtime-warning`
> worktree: `/Users/atilla/Documents/uzmax-m4-21-order-import-runtime-warning`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_runtime_warning_contract__api_admin_fail_closed`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-21 adds a narrow runtime warning contract to the ADR-B02 no-API import snapshot path. `OrderImportService.searchSnapshot` still delegates the order decision to the M4-05 pure `order-read` contract, but handoff results now include an explicit `runtimeWarning` envelope. `createOrderImportApiClient` accepts the warning only when it matches the handoff reason, stale flag and visible metadata, and rejects malformed or misplaced warning payloads.

It does not wire production DB runtime, queue consumers, admin visible E2E, TanStack Query runtime, file upload/download, external order API connectors, AI runtime/eval, production config or real customer/order data.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-21-order-import-runtime-warning` | passed |
| Branch | `codex/m4-21-order-import-runtime-warning` | passed |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity vulnerabilities, not introduced by this PR |
| Baseline tests | `npm test` before edits | passed; 218 tests |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no index lock | passed |
| API handoff warning | stale/missing results include `runtimeWarning` | passed focused test |
| API fresh path | fresh result has no `runtimeWarning` | passed focused test |
| Admin fail-closed | missing/mismatched/misplaced warning rejected | passed focused test |
| Sensitive data/runtime | no raw data, env reads, DB connection or external API call | passed focused test, diff review and guards |

## Boundary Preflight Note

The full local worker boundary guard failed before implementation because root/main contained five existing untracked duplicate docs:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-21 worker did not write those files. Two were byte-identical duplicates of tracked files; three were older or alternate SPK-02/M4 evidence versions. Because they may be user-retained local files, this PR does not delete or move them. The worker proceeded with absolute assigned worktree paths plus CI-mode boundary check and manual tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-21 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `runtime_warning_contract_supported_not_closed` | Keeps import snapshot as the current main path and strengthens snapshot handoff response shape; DB/queue/admin E2E remains future scope. |
| E-03 | `runtime_warning_contract_supported_not_closed` | Adds API/admin client warning envelope validation for stale/missing handoff results; persisted runtime warning, real DB wiring and E2E stale sample evidence remain future scope. |
| E-04 | `foundation_supported_not_closed` | Stale/missing/degraded reads still hand off without status fabrication; AI runtime/eval integration remains future scope. |
| I-01 | `partial_admin_client_not_closed` | Admin client can enforce warning shape; full desktop order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `apps/worker/**`, `packages/engine/**`, `packages/llm-gateway/**`, package/lock/config/CI files were modified.
- M4-21 does not change `packages/capabilities/order-read`; the warning envelope is API/admin client contract glue around the existing M4-05 handoff result.
- M4 evidence index and contracts README were synchronized while preserving production DB runtime, queue runtime, admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | Admin client accepted payloads where `customerVisible.warningCode` did not match `runtimeWarning.code`. | Fixed: admin client now requires `customerVisible.warningCode` to match `runtimeWarning.code`; focused test covers mismatch. |
| Code quality | Admin client accepted payloads where `runtimeWarning.messageRef` did not match `queryLogDraft.reasonRef`, or `queryLogDraft.handoffRequired` was false. | Fixed: admin client now requires handoff query log and message ref consistency; focused test covers both malformed cases. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 2, docs 4, test 1 |
| Changed source files | 2 |
| Net source LOC | +102 |
| New source files | 0 |
| Source gross churn | 108 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-runtime-warning-contract.test.mjs` | passed; 4 tests |
| `node --test scripts/tests/m4-order-import-runtime-warning-contract.test.mjs scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-admin-order-import-api-client-contract.test.mjs` | passed; 13 tests |
| `npm run format:check` | passed |
| `npm run jscpd` | passed; 0 clones |
| `git diff --check` | passed |
| `CI=true npm run check` | passed; 222 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-21-order-import-runtime-warning-contract.md` | passed post-commit; 7 changed files, categories source 2/docs 4/test 1, source changed files 2, source netLoc +102, new source files 0 |
| assigned worktree final status | pending |
| root/main final status | pending; root tracked/index clean expected, existing untracked duplicate docs remain unless owner authorizes cleanup |

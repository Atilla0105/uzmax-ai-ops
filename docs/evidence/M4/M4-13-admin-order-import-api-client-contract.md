# M4-13 Admin Order Import API Client Contract Evidence

> spec: `docs/specs/M4-13-admin-order-import-api-client-contract.md`
> branch: `codex/m4-13-admin-order-import-api-client`
> worktree: `/Users/atilla/Documents/uzmax-m4-13-admin-order-import-api-client`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `admin_order_import_api_client_contract__no_default_network_no_backend_import`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-13 adds an admin-side API client contract for the ADR-B02 no-API import snapshot path: `createOrderImportApiClient` accepts an explicit fetcher and targets the existing M4-07 `/order-import/jobs`, `/order-import/jobs/:jobId/errors` and `/order-import/snapshots/search` API contract.

It does not wire visible UI runtime, default to real network calls, read env, import backend packages, connect to or write a real database, add upload/download, add worker queues, add external order API connectors or access real customer/order data.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-13-admin-order-import-api-client` | passed |
| Branch | `codex/m4-13-admin-order-import-api-client` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Admin API paths | jobs, row errors and snapshot search match M4-07 routes | passed focused test |
| Explicit fetcher | no default real network/global fetch call | passed focused test |
| Handoff fail-closed | stale/missing handoff responses cannot expose `orderStatusRef` | passed focused test |
| Admin boundary | no backend package imports, DB, worker, env or connector runtime | passed focused test, diff review and guards |
| Sensitive data/env/runtime | no raw data, env reads, DB connection or external API call | passed focused test, diff review and guards |

## Acceptance Mapping

| Item | Current M4 branch | M4-13 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `admin_api_client_supported_not_closed` | Adds admin client contract for import jobs/errors/snapshot search; production DB/runtime, queue and UI E2E remain future scope. |
| E-03 | `admin_api_client_supported_not_closed` | Client preserves stale/missing handoff contract and blocks status ref exposure on handoff responses. |
| E-04 | `foundation_supported_not_closed` | Client consumes order-read API results without fabricating status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_admin_client_not_closed` | Adds admin-to-API client foundation; full desktop core workflow remains future scope. |
| J-02 | `not_closed` | No real queue/retry/idempotency runtime is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `apps/worker/**`, `packages/db/**`, `packages/capabilities/**`, package/lock/config/CI files were modified.
- `M4OrderPathStatusShell.tsx` only anchors the client contract into the admin module graph; it does not change visible UI behavior or call the client at runtime.
- M4 evidence index was synchronized to include M4-13 while preserving production DB runtime, worker queue runtime, upload/download, admin visible E2E, AI runtime/eval and release blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 2, docs 3, test 1 |
| Changed source files | 2 |
| Net source LOC | +165 |
| New source files | 1 |
| Source gross churn | 165 |
| Test weakening | none |
| External API/provider/connector evidence | existing M4-07 internal API contract only; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-admin-order-import-api-client-contract.test.mjs` | passed; 4 tests |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; 54 modules, 43 dependencies, no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed |
| `git diff --check` | passed |
| `npm run check` | passed; 195 Node tests, build, size 55.99 kB brotlied, 9 Playwright tests |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-13-admin-order-import-api-client-contract.md` | passed post-commit; 6 changed files, categories source 2/docs 3/test 1, source net +165, new source files 1 |
| assigned worktree final status | clean after evidence amend |
| root/main final status | clean before implementation; open PRs `[]`; `git branch --no-merged main` empty; coordinator performs post-merge sync |

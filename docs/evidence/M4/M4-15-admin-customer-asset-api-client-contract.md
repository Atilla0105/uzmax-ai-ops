# M4-15 Admin Customer Asset API Client Contract Evidence

> spec: `docs/specs/M4-15-admin-customer-asset-api-client-contract.md`
> branch: `codex/m4-15-admin-customer-asset-api-client`
> worktree: `/Users/atilla/Documents/uzmax-m4-15-admin-customer-asset-api-client`
> decision_type: `admin_customer_asset_api_client_contract__no_default_network_no_backend_import`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, Telegram usernames, credentials, token values or env files included

## Scope

M4-15 adds an admin-side API client contract for customer asset workflows: customer list/detail, field definitions, tag definitions and restore flags. `createCustomerAssetApiClient` accepts an explicit fetcher and targets the existing M4-14 `/customer-assets` API contract.

It does not wire visible UI runtime, default to real network calls, read env, import backend packages, connect to or write a real database, add audit persistence, add history/order/quote/ticket aggregation, add field/tag config UI, add external connectors or access real customer/order data.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-15-admin-customer-asset-api-client` | passed |
| Branch | `codex/m4-15-admin-customer-asset-api-client` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Admin API paths | customers, detail, field/tag definitions and restore match M4-14 routes | passed focused test |
| Explicit fetcher | no default real network/global fetch call | passed focused test |
| Restore contract | reason ref, restore flag and audit draft shape fail closed | passed focused test |
| Admin boundary | no backend package imports, DB, worker, env or connector runtime | passed focused test, diff review and guards |
| Sensitive data/env/runtime | no raw data, env reads, DB connection or external API call | passed focused test, diff review and guards |

## Acceptance Mapping

| Item | Current M4 branch | M4-15 contribution |
|---|---|---|
| D-04 | `admin_api_client_supported_not_closed` | Adds admin client contract for customer list/detail and related controlled refs; full customer asset UI/history/order/quote/ticket aggregation remains future scope. |
| D-05 | `admin_api_client_supported_not_closed` | Client validates restore request/response and audit draft; real audit persistence/admin owner flow remains future scope. |
| D-07 | `admin_api_client_supported_not_closed` | Client reads field/tag definitions; conversation tags, admin config and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_admin_client_not_closed` | Adds admin-to-API client foundation; full desktop core customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, Telegram usernames, customer plaintext, credentials or env files were read into or committed by this slice.
- `main.tsx` only anchors the client contract into the admin module graph; it does not change visible UI behavior or call the client at runtime.
- M4 evidence index was synchronized to include M4-15 while preserving customer asset visible UI/admin E2E, real DB runtime, audit persistence, history/order/quote/ticket aggregation, conversation tag config, analysis filtering and release blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 2, docs 3, test 1 |
| Changed source files | 2 |
| Net source LOC | +306 |
| New source files | 1 |
| Source gross churn | 306 |
| Test weakening | none |
| External API/provider/connector evidence | existing M4-14 internal API contract only; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-admin-customer-asset-api-client-contract.test.mjs` | passed; 4 tests |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; 58 modules, 53 dependencies, no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed |
| `git diff --check` | passed |
| `npm run check` | passed; 204 Node tests, build, size 55.99 kB brotlied, 9 Playwright tests |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-15-admin-customer-asset-api-client-contract.md` | passed post-commit; 6 changed files, categories source 2/docs 3/test 1, source net +306, new source files 1 |
| assigned worktree final status | clean after evidence amend |
| root/main final status | clean before implementation; open PRs `[]`; `git branch --no-merged main` empty; coordinator performs post-merge sync |

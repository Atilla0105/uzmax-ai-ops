# M4-14 Customer Asset API Shell Evidence

> spec: `docs/specs/M4-14-customer-asset-api-shell.md`
> branch: `codex/m4-14-customer-asset-api-shell`
> worktree: `/Users/atilla/Documents/uzmax-m4-14-customer-asset-api-shell`
> decision_type: `customer_asset_api_shell__in_memory_no_db_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, Telegram usernames, credentials, token values or env files included

## Scope

M4-14 adds a Nest API shell for customer asset workflows: customer list/detail, field definitions, tag definitions and restore flags. It uses an in-memory repository with controlled refs only and registers the module in the API runtime compiler smoke graph.

It does not implement admin UI, real DB runtime, Prisma client wiring, schema/migration changes, history/order/quote/ticket aggregation runtime, conversation tag config, analysis filtering, audit log persistence, production config or real customer data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-14-customer-asset-api-shell` | passed |
| Branch | `codex/m4-14-customer-asset-api-shell` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| API registration | `CustomerAssetController` registered in `AppModule` and runtime compiler | passed focused and API smoke tests |
| Customer scope | list/detail/config restore selected tenant only | passed focused test |
| Restore action | clears blacklisted/unreachable flags and returns audit draft | passed focused test |
| Admin/source boundary | no admin UI, DB runtime, worker, order import, env or connector runtime | passed focused test, diff review and guards |
| Sensitive data/env/runtime | no raw data, env reads, DB connection or external API call | passed focused test, diff review and guards |

## Acceptance Mapping

| Item | Current M4 branch | M4-14 contribution |
|---|---|---|
| B-01 | `api_shell_supported_not_closed` | Adds selected-tenant API shell checks; full SQL/RLS integration evidence remains future scope. |
| D-04 | `api_shell_supported_not_closed` | Lists customers and returns detail with identities, fields, tags and controlled related refs; full history/order/quote/ticket aggregation UI/E2E remains future scope. |
| D-05 | `api_shell_supported_not_closed` | Restore action clears flags in memory and returns audit draft; real audit persistence/admin owner flow remains future scope. |
| D-07 | `api_shell_supported_not_closed` | Field/tag definitions are readable through API shell; conversation tags, admin config and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_api_not_closed` | Adds API backing shape for future customer asset center; full desktop core workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, Telegram usernames, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/admin/**`, `apps/worker/**`, `packages/db/prisma/**`, `packages/db/migrations/**`, `packages/capabilities/**`, package/lock/config/CI files were modified.
- Restore emits an audit draft only; it does not persist real audit logs.
- M4 evidence index was synchronized to include M4-14 while preserving customer asset UI/admin E2E, real DB runtime, audit persistence, history/order/quote/ticket aggregation, conversation tag config, analysis filtering and release blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 6, docs 3, test 1 |
| Changed source files | 6 |
| Net source LOC | +597 |
| New source files | 4 |
| Source gross churn | 597 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-customer-asset-api-shell.test.mjs scripts/tests/m1-02-api-access-context.test.mjs` | passed; 10 tests |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; 58 modules, 52 dependencies, no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed |
| `git diff --check` | passed |
| `npm run check` | passed; 200 Node tests, build, size 55.99 kB brotlied, 9 Playwright tests |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-14-customer-asset-api-shell.md` | passed post-commit; 10 changed files, categories source 6/docs 3/test 1, source net +597, new source files 4 |
| assigned worktree final status | clean after evidence amend |
| root/main final status | clean before implementation; open PRs `[]`; `git branch --no-merged main` empty; coordinator performs post-merge sync |

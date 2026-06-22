# M4-17 Customer Asset Persistence Gateway Evidence

> spec: `docs/specs/M4-17-customer-asset-persistence-gateway.md`
> branch: `codex/m4-17-customer-asset-persistence-gateway`
> worktree: `/Users/atilla/Documents/uzmax-m4-17-customer-asset-persistence-gateway`
> decision_type: `customer_asset_persistence_gateway_contract__no_default_db_runtime_no_env_no_audit_persistence`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-17 adds a customer asset persistence gateway contract for the M4 customer asset path: the existing customer asset repository/service become async-compatible and `PersistenceCustomerAssetRepository` maps M4-02 customer asset DB contract-shaped rows into the M4-14 API domain.

It does not default-enable a DB provider, instantiate PrismaClient, import `@prisma/client`, read env, connect to or write a real database, change schema/migrations/generated client, add admin UI, worker queues, audit persistence, history/order/quote/ticket aggregation runtime, production config, external connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-17-customer-asset-persistence-gateway` | passed |
| Branch | `codex/m4-17-customer-asset-persistence-gateway` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Async repository port | service awaits repository calls and in-memory behavior remains compatible | passed focused tests and `npm run check` |
| Persistence gateway | selected-tenant rows map to customers, identities, fields, tags and controlled refs | passed focused test |
| Restore save handoff | restore clears flags through gateway and returns audit draft only | passed focused test |
| Default runtime | no default DB provider, env read, PrismaClient or real DB connection | passed focused test, depcruise, forbidden-term guard and check |
| Sensitive data | no raw customer/order data, screenshots, exports, env files or secret values | passed focused test and diff review |

## Acceptance Mapping

| Item | Current M4 branch | M4-17 contribution |
|---|---|---|
| B-01 | `api_shell_supported_not_closed` | Adds selected-tenant persistence mapper contract; full SQL/RLS transaction evidence remains future scope. |
| D-04 | `admin_shell_supported_not_closed` | Maps customer details, identities, fields, tags and controlled related refs from DB contract rows; real history/order/quote/ticket aggregation runtime remains future scope. |
| D-05 | `admin_shell_supported_not_closed` | Restore flag changes can hand off to the gateway while still returning only an audit draft; real audit persistence/admin owner flow remains future scope. |
| D-07 | `admin_shell_supported_not_closed` | Field/tag definitions and assignments map through the gateway; conversation tags, admin config and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_admin_shell_not_closed` | Adds API repository gateway foundation for future customer workflow; full desktop core workflow with runtime data remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system, production DB or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/prisma/**`, `packages/db/migrations/**`, `apps/admin/**`, `apps/worker/**`, `packages/capabilities/**`, generated client, package/lock/config/CI files were modified.
- M4 evidence index was synchronized to include M4-17 while preserving future production DB runtime, RLS transaction wrapper, audit persistence, customer asset admin E2E, history-order-quote-ticket aggregation, AI runtime/eval and release blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source: 4; test: 2; docs: 3; generated: 0; lock: 0; config: 0 |
| Changed source files | 4 |
| Net source LOC | +440 by `git diff --numstat` plus untracked source line count |
| New source files | 1 |
| Source gross churn | 540 |
| Test weakening | none |
| External API/provider/connector evidence | none added; repo-local DB contract type only |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-customer-asset-persistence-gateway.test.mjs scripts/tests/m4-customer-asset-api-shell.test.mjs` | passed, 9 tests |
| `npm run check` | passed, 208 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `git diff --check` | passed |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-17-customer-asset-persistence-gateway.md` | passed post-commit, 9 files: source 4 / docs 3 / test 2; source net +440 / new files 1 |
| assigned worktree final status | dirty with intended M4-17 files before commit |
| root/main final status | clean before PR; open PRs `[]`; `git branch --no-merged main` empty |

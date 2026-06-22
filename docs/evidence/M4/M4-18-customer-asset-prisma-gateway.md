# M4-18 Customer Asset Prisma Gateway Evidence

> spec: `docs/specs/M4-18-customer-asset-prisma-gateway.md`
> branch: `codex/m4-18-customer-asset-prisma-gateway`
> worktree: `/Users/atilla/Documents/uzmax-m4-18-customer-asset-prisma-gateway`
> decision_type: `customer_asset_prisma_delegate_gateway__no_default_runtime_no_env_no_db_write`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-18 adds a Prisma-shaped delegate gateway contract for the M4 customer asset path. `PrismaCustomerAssetPersistenceGateway` wraps generated-model-shaped delegates and feeds M4-17 `CustomerAssetPersistenceGateway` rows for customer list/detail, field/tag definitions, field values, identities, tag assignments and restore flag updates.

It does not default-enable a DB provider, instantiate PrismaClient, import `@prisma/client`, read env, connect to or write a real database, change schema/migrations/generated client, add admin UI, worker queues, RLS transaction wrapper, audit persistence, history/order/quote/ticket aggregation runtime, production config, external connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-18-customer-asset-prisma-gateway` | passed |
| Branch | `codex/m4-18-customer-asset-prisma-gateway` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Delegate scope | customer asset delegates carry org/tenant scope and bounded ordering | passed focused test |
| Restore update | customer update uses scoped compound key and flag/timestamp data only | passed focused test |
| Default runtime | no default DB provider, env read, PrismaClient or real DB connection | passed focused test, depcruise, forbidden-term guard and check |
| Sensitive data | no raw customer/order data, screenshots, exports, env files or secret values | passed focused test and diff review |

## Acceptance Mapping

| Item | Current M4 branch | M4-18 contribution |
|---|---|---|
| B-01 | `api_shell_supported_not_closed` | Adds tenant-scoped Prisma delegate contract; full SQL/RLS transaction evidence remains future scope. |
| D-04 | `admin_shell_supported_not_closed` | Adds DB delegate gateway for customer details, identities, fields and tags; real history/order/quote/ticket aggregation runtime remains future scope. |
| D-05 | `admin_shell_supported_not_closed` | Restore flag updates can target a scoped customer delegate; real audit persistence/admin owner flow remains future scope. |
| D-07 | `admin_shell_supported_not_closed` | Field/tag definition and assignment delegates are covered; conversation tags, admin config and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_admin_shell_not_closed` | Adds API DB delegate gateway foundation for future customer workflow; full desktop core workflow with runtime data remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system, production DB or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/prisma/**`, `packages/db/migrations/**`, `apps/admin/**`, `apps/worker/**`, `packages/capabilities/**`, generated client, package/lock/config/CI files were modified.
- M4 evidence index was synchronized to include M4-18 while preserving future production DB runtime, RLS transaction wrapper, audit persistence, customer asset admin E2E, history-order-quote-ticket aggregation, AI runtime/eval and release blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source: 2; test: 1; docs: 3; generated: 0; lock: 0; config: 0 |
| Changed source files | 2 |
| Net source LOC | +136 by `git diff --numstat` plus untracked source line count |
| New source files | 1 |
| Source gross churn | 136 |
| Test weakening | none |
| External API/provider/connector evidence | existing Prisma dependency/generated schema model names only; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-customer-asset-prisma-gateway.test.mjs scripts/tests/m4-customer-asset-persistence-gateway.test.mjs` | passed, 8 tests |
| `npm run check` | passed, 212 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `git diff --check` | passed |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-18-customer-asset-prisma-gateway.md` | passed post-commit, 6 files: source 2 / docs 3 / test 1; source net +136 / new files 1 |
| assigned worktree final status | dirty with intended M4-18 files before commit |
| root/main final status | clean before PR; open PRs `[]`; `git branch --no-merged main` empty |

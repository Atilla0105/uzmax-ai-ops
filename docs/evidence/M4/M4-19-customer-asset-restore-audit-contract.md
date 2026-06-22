# M4-19 Customer Asset Restore Audit Contract Evidence

> spec: `docs/specs/M4-19-customer-asset-restore-audit-contract.md`
> branch: `codex/m4-19-customer-asset-restore-audit-contract`
> worktree: `/Users/atilla/Documents/uzmax-m4-19-customer-asset-restore-audit-contract`
> decision_type: `customer_asset_restore_audit_contract__api_sink_recorded_no_real_audit_persistence`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-19 upgrades the customer asset restore path from a display-only audit draft to a contract-shaped audit event. `packages/db/src/index.ts` now exposes `customer.flags_restored` and `createCustomerAssetRestoreAuditContract`; `CustomerAssetService.restoreCustomerFlags` records the event through the existing API `AuditSink`.

It does not persist to a real `audit_log` repository, default-enable a DB provider, instantiate PrismaClient, import `@prisma/client`, read env, connect to or write a real database, change schema/migrations/generated client, add admin UI, worker queues, RLS transaction wrapper, history/order/quote/ticket aggregation runtime, production config, external connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-19-customer-asset-restore-audit-contract` | passed |
| Branch | `codex/m4-19-customer-asset-restore-audit-contract` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Audit contract | restore helper creates actor/time/before/after customer flag event | passed focused test |
| API sink | restore records exactly one event through existing `API_AUDIT_SINK` port | passed focused test |
| Default runtime | no real audit persistence, env read, PrismaClient or real DB connection | passed focused test, depcruise, forbidden-term guard and check |
| Sensitive data | no raw customer/order data, screenshots, exports, env files or secret values | passed focused test and diff review |

## Acceptance Mapping

| Item | Current M4 branch | M4-19 contribution |
|---|---|---|
| B-05 | `audit_contract_supported_not_closed` | Adds contract-shaped restore audit event and API sink record; real audit_log persistence/integration evidence remains future scope. |
| D-05 | `audit_contract_supported_not_closed` | Restore action now records controlled before/after flag audit event while preserving compatibility response fields; admin owner flow and real audit persistence remain future scope. |
| I-01 | `partial_customer_asset_api_runtime_not_closed` | Adds audit contract behavior to customer restore API foundation; full desktop core workflow with runtime data remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system, production DB or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/prisma/**`, `packages/db/migrations/**`, `apps/admin/**`, `apps/worker/**`, `packages/capabilities/**`, generated client, package/lock/config/CI files were modified.
- The API response keeps the previous `auditDraft.customerId`, `reasonRef` and `restoredFlags` compatibility fields for the M4-15 admin client, while the audit sink records the pure `AuditLogContract` event.
- M4 evidence index was synchronized to include M4-19 while preserving future production DB runtime, RLS transaction wrapper, real audit persistence, customer asset admin E2E, history-order-quote-ticket aggregation, AI runtime/eval and release blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source: 3; test: 4; docs: 3; generated: 0; lock: 0; config: 0 |
| Changed source files | 3 |
| Net source LOC | +86 by `git diff --numstat origin/main` for source files |
| New source files | 0 |
| Source gross churn | 118 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m1-platform-foundation.test.mjs scripts/tests/m4-customer-asset-api-shell.test.mjs scripts/tests/m4-customer-asset-persistence-gateway.test.mjs scripts/tests/m4-customer-asset-restore-audit-contract.test.mjs` | passed, 22 tests |
| `npm run check` | passed, 215 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `git diff --check` | passed |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-19-customer-asset-restore-audit-contract.md` | passed post-commit, 10 files: source 3 / docs 3 / test 4; source net +86 / new files 0 |
| assigned worktree final status | dirty with intended M4-19 files before commit |
| root/main final status | clean before commit; open PRs `[]`; `git branch --no-merged main` empty |

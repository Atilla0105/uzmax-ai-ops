# M4-20 API Audit Prisma Sink Contract Evidence

> spec: `docs/specs/M4-20-api-audit-prisma-sink-contract.md`
> branch: `codex/m4-20-api-audit-prisma-sink`
> worktree: `/Users/atilla/Documents/uzmax-m4-20-api-audit-prisma-sink`
> decision_type: `api_audit_prisma_sink_contract__opt_in_no_default_db_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-20 adds an opt-in Prisma-shaped audit sink adapter for API audit events. `apps/api/src/audit-log.prisma-sink.ts` exposes `AuditLogPrismaClientPort`, `PrismaAuditSink` and `toPrismaAuditLogCreateData`; the adapter validates incoming events through the existing `AuditLogContract` helper before calling `auditLog.create`.

It does not persist to a real database in default runtime, default-enable a DB provider, instantiate PrismaClient, import `@prisma/client`, read env, connect to or write a real database, change schema/migrations/generated client, add admin UI, worker queues, RLS transaction wrapper, audit query API/UI, history/order/quote/ticket aggregation runtime, production config, external connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-20-api-audit-prisma-sink` | passed |
| Branch | `codex/m4-20-api-audit-prisma-sink` | passed |
| Boundary preflight | root/main and assigned worktree tracked clean; no index locks | passed by manual tracked-clean checks; full local guard root untracked scan hung, while `CI=true` guard mode passed |
| Prisma create mapping | restore `AuditLogContract` maps to Prisma `auditLog.create({ data })` fields | passed focused test |
| Fail-before-create | pre-audit/malformed events fail before delegate create | passed focused test |
| Default runtime | no real audit persistence, env read, PrismaClient or real DB connection | passed focused test, depcruise, forbidden-term guard and check |
| Sensitive data | no raw customer/order data, screenshots, exports, env files or secret values | passed focused test and diff review |

## Acceptance Mapping

| Item | Current M4 branch | M4-20 contribution |
|---|---|---|
| B-05 | `audit_prisma_sink_contract_supported_not_closed` | Adds opt-in Prisma-shaped audit sink adapter for `AuditLogContract`; real DB runtime provider, transaction/RLS evidence and audit query UI remain future scope. |
| D-05 | `audit_prisma_sink_contract_supported_not_closed` | Customer restore audit event can be mapped to `audit_log` create data; admin owner flow and real audit persistence integration remain future scope. |
| I-01 | `partial_customer_asset_api_runtime_not_closed` | Strengthens API audit persistence foundation for customer restore path; full desktop core workflow with runtime data remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system, production DB or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/prisma/**`, `packages/db/migrations/**`, `apps/admin/**`, `apps/worker/**`, `packages/capabilities/**`, generated client, package/lock/config/CI files were modified.
- `access_context.denied` remains a pre-audit event and is not directly persisted unless a later scoped contract can supply the full `AuditLogContract` shape.
- M4 evidence index was synchronized to include M4-20 while preserving future production DB runtime, RLS transaction wrapper, real audit persistence integration, customer asset admin E2E, history-order-quote-ticket aggregation, AI runtime/eval and release blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source: 2; test: 1; docs: 4; generated: 0; lock: 0; config: 0 |
| Changed source files | 2 |
| Net source LOC | +87 by `git diff --cached --numstat` for source files |
| New source files | 1 |
| Source gross churn | 87 |
| Test weakening | none |
| External API/provider/connector evidence | existing Prisma dependency/generated schema model names only; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `npm test` before edits | passed, 215 Node tests |
| `node --test scripts/tests/m4-api-audit-prisma-sink-contract.test.mjs scripts/tests/m4-customer-asset-restore-audit-contract.test.mjs scripts/tests/m1-platform-foundation.test.mjs` | passed, 16 tests |
| `CI=true npm run check` | passed, 218 Node tests, build, size 57.17 kB brotlied, 11 Playwright tests |
| `git diff --cached --check` | passed |
| boundary guard/manual boundary evidence | local full guard hung on root `git status --untracked-files=all`; `CI=true` guard mode passed and manual root/worker tracked-clean/no-index-lock checks passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-20-api-audit-prisma-sink-contract.md` | passed post-commit, 7 files: source 2 / docs 4 / test 1; source net +87 / new files 1 |
| assigned worktree final status | dirty with intended M4-20 files before commit |
| root/main final status | clean before commit; open PRs `[]`; `git branch --no-merged main` empty |

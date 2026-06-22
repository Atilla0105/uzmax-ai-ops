# M4-09 Order Import Worker Contract Evidence

> spec: `docs/specs/M4-09-order-import-worker-contract.md`
> branch: `codex/m4-09-order-import-worker-contract`
> worktree: `/Users/atilla/Documents/uzmax-m4-09-order-import-worker-contract`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_worker_contract__no_parser_no_queue_no_runtime_db`
> redaction_status: no raw customer/order data, CSV/XLSX, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-09 adds a pure worker contract for the ADR-B02 no-API import snapshot path: controlled row input becomes order-read batch output and DB contract drafts for import jobs, order snapshots and row errors.

It does not implement a real CSV/XLSX parser, Storage downloader, Prisma client, DB connection, RLS transaction wrapper, BullMQ/Redis queue, admin-to-API client calls, generated Prisma client artifacts, production config, external order API connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-09-order-import-worker-contract` | passed |
| Branch | `codex/m4-09-order-import-worker-contract` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Batch conversion | controlled rows become order-read batch summary | passed focused test |
| DB contract drafts | import job, snapshots and row errors are generated | passed focused test |
| Scope propagation | org/tenant/user and IDs fail closed when missing | passed focused test |
| No order API connector | no `order_connector`, provider, adapter or external API call | passed static test and full check |
| Sensitive data | no raw order/customer identifiers or payloads | passed static test and diff review |

## Acceptance Mapping

| Item | Current M4 branch | M4-09 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `worker_contract_supported_not_closed` | Adds controlled-row import worker drafts for jobs/errors/snapshots; real parser, DB client and admin E2E remain future scope. |
| E-03 | `worker_contract_supported_not_closed` | Snapshot drafts preserve source/update/expiry fields; persisted/runtime warning remains future scope. |
| E-04 | `worker_contract_supported_not_closed` | Worker creates data contracts only; AI eval/runtime integration remains future scope. |
| J-02 | `not_closed` | No real queue/retry/idempotency runtime is added. |
| I-01 | `partial_worker_contract_not_closed` | Adds worker-side import shape for future order workflow; full order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX import/export, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `packages/capabilities/**`, `apps/api/**`, `apps/admin/**`, `packages/engine/**`, generated client, package/lock/config/CI files were modified.
- M4 evidence index was synchronized to include M4-09 while preserving future real parser, DB client wiring, queue runtime, admin API client, AI runtime/eval and E2E blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 1, test 1, docs 3 |
| Changed source files | 1 / budget 1 |
| Net source LOC | +113 / budget <= 320 |
| New source files | 0 / budget 0 |
| Source gross churn | 113 |
| Test weakening | none |
| External API/provider/connector evidence | none required; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-worker-contract.test.mjs` | passed: 5 tests, 1 suite |
| `npm run format:check` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed: no dependency violations |
| `npm run jscpd` | passed: 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed: no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-09-order-import-worker-contract.md` | passed: 5 changed files, source 1, docs 3, test 1, net source LOC 113, new source 0 |
| `git diff --check` | passed |
| `npm run check` | passed: 181 Node tests, build, size 55.99 kB brotlied, 9 Playwright tests |
| assigned worktree final status | clean after local commit |
| root/main final status | clean before local commit; clean after local commit; open PRs `[]`; `git branch --no-merged main` empty |

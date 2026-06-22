# M4-10 Order Import Parser Contract Evidence

> spec: `docs/specs/M4-10-order-import-parser-contract.md`
> branch: `codex/m4-10-order-import-parser-contract`
> worktree: `/Users/atilla/Documents/uzmax-m4-10-order-import-parser-contract`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_parser_contract__csv_text_no_file_no_queue_no_runtime_db`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-10 adds a pure parser contract for the ADR-B02 no-API import snapshot path: controlled synthetic CSV text becomes M4-09 worker row objects, then the existing worker/order-read contracts create import job, order snapshot and row error drafts.

It does not implement real file reading, XLSX parsing, Storage downloads, Prisma client, DB connection, RLS transaction wrapper, BullMQ/Redis queue, admin-to-API client calls, generated Prisma client artifacts, production config, external order API connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-10-order-import-parser-contract` | passed |
| Branch | `codex/m4-10-order-import-parser-contract` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Parser success | controlled CSV text becomes worker rows | passed focused test |
| Worker integration | parsed rows feed import job, snapshot and row error drafts | passed focused test |
| Header validation | unknown, duplicate or missing required headers fail closed | passed focused test |
| Parser budget | blank rows skipped and maxRows enforced | passed focused test |
| No order API connector | no `order_connector`, provider, adapter or external API call | passed static test and full check |
| Sensitive data | no raw order/customer identifiers or payloads | passed static test and diff review |

## Acceptance Mapping

| Item | Current M4 branch | M4-10 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `parser_contract_supported_not_closed` | Adds bounded CSV text parser contract for controlled rows; real file/XLSX ingestion, DB client and admin E2E remain future scope. |
| E-03 | `parser_contract_supported_not_closed` | Preserves source/update/expiry fields for downstream stale warning contracts; persisted/runtime warning remains future scope. |
| E-04 | `parser_contract_supported_not_closed` | Parser only shapes controlled data; order-read still owns no-fabrication handoff decisions. |
| J-02 | `not_closed` | No real queue/retry/idempotency runtime is added. |
| I-01 | `partial_worker_contract_not_closed` | Adds parser shape for future order workflow; full order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/db/**`, `packages/capabilities/**`, `apps/api/**`, `apps/admin/**`, `packages/engine/**`, generated client, package/lock/config/CI files were modified.
- M4 evidence index was synchronized to include M4-10 while preserving future real file/XLSX parser, Storage ingestion, DB client wiring, queue runtime, admin API client, AI runtime/eval and E2E blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 1, test 3, docs 3 |
| Changed source files | 1 / budget 1 |
| Net source LOC | +202 / budget <= 260 |
| New source files | 0 / budget 0 |
| Source gross churn | 202 |
| Test weakening | none |
| External API/provider/connector evidence | none required; none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-parser-contract.test.mjs scripts/tests/m4-order-import-worker-contract.test.mjs` | passed: 9 tests, 2 suites |
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
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-10-order-import-parser-contract.md` | passed: 7 changed files, source 1, docs 3, test 3, net source LOC 202, new source 0 |
| `git diff --check` | passed |
| `npm run check` | passed: 185 Node tests, build, size 55.99 kB brotlied, 9 Playwright tests |
| assigned worktree final status | clean after local commit |
| root/main final status | clean before implementation; clean after local commit; open PRs `[]`; `git branch --no-merged main` empty |

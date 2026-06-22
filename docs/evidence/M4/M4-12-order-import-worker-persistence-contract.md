# M4-12 Order Import Worker Persistence Contract Evidence

> spec: `docs/specs/M4-12-order-import-worker-persistence-contract.md`
> branch: `codex/m4-12-order-import-worker-persistence`
> worktree: `/Users/atilla/Documents/uzmax-m4-12-order-import-worker-persistence`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_worker_persistence_contract__no_queue_no_db_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-12 adds a worker-side persistence contract for the ADR-B02 no-API import snapshot path: controlled CSV text is parsed, converted into M4-09 import job/snapshot/row-error drafts and handed to an injected `OrderImportWorkerPersistenceGateway` in deterministic order.

It does not read files or Supabase Storage, instantiate Prisma, connect to or write a real database, add BullMQ/Redis queue runtime, add retry/idempotency runtime, change schema/migrations/generated client, add admin/API wiring, add external order API connectors or access real customer/order data.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-12-order-import-worker-persistence` | passed |
| Branch | `codex/m4-12-order-import-worker-persistence` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Persistence order | import job, snapshots, row errors are handed to gateway in order | passed focused test |
| Fail-before-persistence | invalid CSV/draft IDs trigger no gateway calls | passed focused test |
| No order API connector | no `order_connector`, provider, adapter or external API call | passed diff/test/guards |
| Sensitive data/env/runtime | no raw data, file/Storage/env reads, DB connection or BullMQ/Redis runtime | passed diff/test/guards |

## Acceptance Mapping

| Item | Current M4 branch | M4-12 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `worker_persistence_contract_supported_not_closed` | Parser/drafts can be handed to an injected persistence gateway; production DB runtime, queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Expiry/source fields pass through parser/draft path; persisted/runtime warning still requires runtime evidence. |
| E-04 | `foundation_supported_not_closed` | Worker only shapes import data; order-read handoff/no-fabrication path remains the AI boundary. |
| J-02 | `worker_persistence_contract_supported_not_closed` | Adds deterministic gateway order and fail-before-persistence behavior; no real queue/retry/idempotency runtime is added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `apps/admin/**`, `packages/db/**` schema/migration/generated client, `packages/capabilities/**`, package/lock/config/CI files were modified.
- M4 evidence index was synchronized to include M4-12 while preserving production DB runtime, RLS transaction wrapper, BullMQ/Redis queue runtime, retry/idempotency, backlog alerting, admin API client, AI runtime/eval and E2E blockers.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source: 1; test: 1; docs: 3; generated: 0; lock: 0; config: 0 |
| Changed source files | 1 |
| Net source LOC | +51 |
| New source files | 0 |
| Source gross churn | 51 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-worker-persistence-contract.test.mjs scripts/tests/m4-order-import-worker-contract.test.mjs scripts/tests/m4-order-import-parser-contract.test.mjs` | passed, 12 tests |
| `npm run format:check` | passed via `npm run check` |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed, 52 modules / 42 dependencies / no violations |
| `npm run jscpd` | passed, 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed, no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed via `npm run check` |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-12-order-import-worker-persistence-contract.md --include-worktree` | passed pre-commit, 5 files: source 1 / docs 3 / test 1 |
| `git diff --check` | passed |
| `npm run check` | passed, 191 Node tests, build, size 55.99 kB brotlied, 9 Playwright tests |
| assigned worktree final status | pre-commit validation passed; coordinator performs post-merge cleanout |
| root/main final status | clean before implementation; open PRs `[]`; `git branch --no-merged main` empty; coordinator performs post-merge sync |

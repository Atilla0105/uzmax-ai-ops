# M4-28 Order Import CSV File Intake Contract Evidence

> spec: `docs/specs/M4-28-order-import-csv-file-intake-contract.md`
> branch: `codex/m4-28-order-import-csv-file-intake`
> worktree: `/Users/atilla/Documents/uzmax-m4-28-order-import-csv-file-intake`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_csv_file_intake_contract__no_storage_no_xlsx_no_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-28 adds a controlled CSV file intake contract for the ADR-B02 no-API import snapshot path. It exports `createOrderImportCsvTextInputFromFile`, which validates already-provided CSV file content and metadata, strips a UTF-8 BOM if present, preserves parser row budgets and returns an input compatible with the existing M4-10 `parseOrderImportCsvText` contract.

It does not read local files, download Supabase Storage, implement XLSX parsing, default-enable Prisma/RLS runtime wiring, instantiate `PrismaClient`, read env, connect to or write a real database, change schema/migrations/generated client, add BullMQ/Redis queues, production config, external order API connectors, AI runtime/eval or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-28-order-import-csv-file-intake` | pending final validation |
| Branch | `codex/m4-28-order-import-csv-file-intake` | pending final validation |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity findings |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no open PRs | passed before edits |
| CSV byte payload | UTF-8 bytes become existing parser input | passed focused test |
| BOM and row budget | string content strips BOM and preserves `maxRows` | passed focused test |
| Fail-closed metadata/content | filename, media type, source ref, invalid UTF-8 and byte budget fail closed | passed focused test |
| Sensitive data/runtime | no raw data, fs read, Storage download, env, DB, PrismaClient, BullMQ/Redis or external API call | passed focused test and static source checks |

## Boundary Preflight Note

The full local worker boundary guard is expected to keep failing on root/main untracked duplicate docs that predate this worker:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-28 slice does not delete those files. It proceeds with absolute assigned worktree paths plus CI-mode boundary check and manual root tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-28 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `csv_file_intake_contract_supported_not_closed` | Adds controlled CSV file payload intake before the existing parser; real Storage ingestion, XLSX parser, DB client runtime/RLS integration, queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Intake preserves source refs and row budgets for downstream parser/stale-warning contracts; persisted warning runtime remains future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; no fabricated order status path is added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting is added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `apps/admin/**`, `packages/db/**` schema/migration/generated client, `packages/capabilities/**`, package/lock/config/CI files were modified.
- M4-28 does not change API routes, admin UI/client, Prisma schema/migrations/generated client, production provider config, Redis connection, retry executor, Storage downloader or XLSX parser.
- M4 evidence index was synchronized to include M4-28 while preserving production DB runtime, RLS integration, queue runtime, Storage ingestion, XLSX parser, admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | no issues found | Changes are limited to the M4-28 touch list and preserve no-Storage/no-XLSX/no-runtime boundaries. |
| Code quality | no issues found | Intake helper is fail-closed, bounded, parser-compatible and covered by focused tests. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 2, docs 3, test 2 |
| Changed source files | 2 |
| Net source LOC | +124 |
| New source files | 1 |
| Source gross churn | 124 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-csv-file-intake-contract.test.mjs scripts/tests/m4-order-import-parser-contract.test.mjs scripts/tests/m4-order-import-worker-persistence-contract.test.mjs scripts/tests/m4-order-import-worker-queue-job-contract.test.mjs scripts/tests/m4-order-import-worker-contract.test.mjs` | passed; 20 tests |
| `npm run format:check` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed; no dependency violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed |
| `npm run guard:doc-triggers` | passed |
| `git diff --check && git diff --cached --check` | passed |
| `CI=true npm run check` | passed; 254 Node tests, build, 57.17 kB brotli size limit and 11 Playwright tests |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M4-28-order-import-csv-file-intake-contract.md --include-worktree` | passed |
| assigned worktree final status | pending final commit/PR |
| root/main final status | pending final audit |

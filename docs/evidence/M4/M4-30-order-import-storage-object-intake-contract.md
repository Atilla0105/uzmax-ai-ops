# M4-30 Order Import Storage Object Intake Contract Evidence

> spec: `docs/specs/M4-30-order-import-storage-object-intake-contract.md`
> branch: `codex/m4-30-order-import-storage-object-intake`
> worktree: `/Users/atilla/Documents/uzmax-m4-30-order-import-storage-object-intake`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_storage_object_intake_contract__no_downloader_no_xlsx_no_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-30 adds a controlled Storage object intake contract for the ADR-B02 no-API import snapshot path. It exports `createOrderImportCsvTextInputFromStorageObject`, which validates already-provided object content plus `bucketId`/`objectPath` metadata, derives a controlled `storage://bucket/path` sourceRef, dispatches `.csv` objects to M4-28 CSV file intake and `.tsv` objects to M4-29 table file intake, and returns input compatible with the existing M4-10 parser.

It does not read local files, download Supabase Storage, create signed URLs, implement XLSX parsing, default-enable Prisma/RLS runtime wiring, instantiate `PrismaClient`, read env, connect to or write a real database, change schema/migrations/generated client, add BullMQ/Redis queues, production config, external order API connectors, AI runtime/eval or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-30-order-import-storage-object-intake` | passed |
| Branch | `codex/m4-30-order-import-storage-object-intake` | passed |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity findings |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no open PRs | passed before edits |
| CSV Storage object | safe bucket/path + UTF-8 CSV bytes become existing parser input | passed focused test |
| TSV Storage object | safe bucket/path + UTF-8 TSV text become existing parser input | passed focused test |
| Fail-closed metadata/content | bucket, path, extension, media type, invalid UTF-8 and byte budget fail closed | passed focused test |
| Sensitive data/runtime | no raw data, fs read, Storage download, signed URL, env, DB, PrismaClient, BullMQ/Redis or external API call | passed focused test and static source checks |

## Boundary Preflight Note

The full local worker boundary guard is expected to keep failing on root/main untracked duplicate docs that predate this worker:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-30 slice does not delete those files. It proceeds with absolute assigned worktree paths plus CI-mode boundary check and manual root tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-30 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `storage_object_intake_contract_supported_not_closed` | Adds controlled Storage object metadata/content intake before existing CSV/TSV parser intake; real Storage downloader/upload runtime, XLSX parser, DB client runtime/RLS integration, queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Intake preserves storage source refs and row budgets for downstream parser/stale-warning contracts; persisted warning runtime remains future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; no fabricated order status path is added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting is added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `apps/admin/**`, `packages/db/**` schema/migration/generated client, `packages/capabilities/**`, package/lock/config/CI files were modified.
- M4-30 does not change API routes, admin UI/client, Prisma schema/migrations/generated client, production provider config, Redis connection, retry executor, Storage downloader/upload runtime, signed URL path or XLSX parser.
- M4 evidence index was synchronized to include M4-30 while preserving production DB runtime, RLS integration, queue runtime, real Storage ingestion, XLSX parser, admin E2E, AI runtime/eval and release blockers.
- A first full-check attempt that exported `UZMAX_PRIMARY_ROOT` failed only inside `worker-write-boundary.test` because the negative test inherited the real root path and then saw the existing duplicate docs. The final full check unset `UZMAX_PRIMARY_ROOT` for child tests while keeping `CI=true` and the assigned worktree, and passed.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | no issues found | Changes are limited to the M4-30 touch list and preserve no-downloader/no-XLSX/no-runtime boundaries. |
| Code quality | no issues found | Storage object intake reuses the existing file-intake module, fails closed, preserves parser budgets and is covered by focused tests. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source 1, docs 3, test 1 |
| Changed source files | 1 |
| Net source LOC | +89 by git numstat; within spec budget |
| New source files | 0 |
| Source gross churn | 89 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-storage-object-intake-contract.test.mjs scripts/tests/m4-order-import-table-file-intake-contract.test.mjs scripts/tests/m4-order-import-csv-file-intake-contract.test.mjs scripts/tests/m4-order-import-parser-contract.test.mjs` | passed; 16 tests |
| `npm run format:check` | passed via `env -u UZMAX_PRIMARY_ROOT CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-30-order-import-storage-object-intake npm run check` |
| `npm run typecheck` | passed via full check |
| `npm run lint` | passed via full check |
| `npm run depcruise` | passed; 69 modules / 67 dependencies / no violations |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `git diff --check && git diff --cached --check` | passed before final commit |
| `env -u UZMAX_PRIMARY_ROOT CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-30-order-import-storage-object-intake npm run check` | passed; 262 Node tests, build, 57.17 kB brotli size limit and 11 Playwright tests |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M4-30-order-import-storage-object-intake-contract.md --include-worktree` | passed |
| assigned worktree final status | pending final commit/PR |
| root/main final status | pending final audit |

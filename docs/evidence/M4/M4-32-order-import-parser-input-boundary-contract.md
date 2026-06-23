# M4-32 Order Import Parser Input Boundary Contract Evidence

> spec: `docs/specs/M4-32-order-import-parser-input-boundary-contract.md`
> branch: `codex/m4-32-order-import-parser-input-boundary`
> worktree: `/Users/atilla/Documents/uzmax-m4-32-order-import-parser-input-boundary`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_parser_input_boundary__direct_text_path_fail_closed`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-32 adds a direct parser input boundary for the ADR-B02 no-API import snapshot path. `parseOrderImportCsvText` now validates controlled `sourceRef` values and rejects NUL-bearing CSV text before row generation, so future direct queue/parser calls cannot bypass the M4-28/M4-29/M4-30 file/Storage intake boundary and still write unsafe source refs into worker drafts.

It does not modify DB schema/migrations/generated client, start a real HTTP/auth runtime, read env, connect to or write a real database, download Storage, create signed URLs, implement XLSX parsing, add BullMQ/Redis queues, production config, external order API connectors, AI runtime/eval or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-32-order-import-parser-input-boundary` | pending final validation |
| Branch | `codex/m4-32-order-import-parser-input-boundary` | pending final validation |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity findings |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no open PRs | passed before edits |
| Direct parser sourceRef boundary | unsafe direct `sourceRef` fails before row/draft generation | passed focused test |
| Direct parser text boundary | NUL-bearing CSV text fails before parser state machine processing | passed focused test |
| Existing intake compatibility | M4-28/M4-29/M4-30 parser paths still pass | passed focused test |
| Sensitive data/runtime | no raw data, env, DB, PrismaClient, BullMQ/Redis, Storage downloader or external API call | passed focused test and static source checks |

## Boundary Preflight Note

The full local worker boundary guard is expected to keep failing on root/main untracked duplicate docs that predate this worker:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-32 slice does not delete those files. It proceeds with absolute assigned worktree paths plus CI-mode boundary check and manual root tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-32 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `parser_input_boundary_supported_not_closed` | Adds direct parser sourceRef/text fail-closed boundaries before worker draft generation; real Storage downloader/upload runtime, XLSX parser, DB runtime, queue and visible UI E2E remain future scope. |
| E-03 | `parser_input_boundary_supported_not_closed` | Keeps future direct queue/parser paths from bypassing controlled source refs; persisted warning runtime remains future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added and no fabricated status path is added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `apps/admin/**`, `packages/db/**` schema/migration/generated client, `packages/capabilities/**`, package/lock/config/CI files were modified.
- M4-32 does not change API routes, admin UI/client, Prisma schema/migrations/generated client, production provider config, Redis connection, retry executor, Storage downloader/upload runtime, signed URL path or XLSX parser.
- M4 evidence index was synchronized to include M4-32 while preserving production HTTP/auth runtime, production DB runtime, RLS integration, queue runtime, real Storage ingestion, XLSX parser, visible admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | no finding | M4-32 touched only the allowed worker parser, existing parser test, spec/evidence and M4 README paths; no package/lock/config/DB/API/admin files changed. |
| Code quality | no finding | Parser boundary is local and fail-closed; `apps/worker/src/main.ts` is 390 lines after the change, within the 400-line ESLint budget, and full validation passed. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | source=1, docs=3, test=1, generated=0, lock=0, config=0 |
| Changed source files | 1 |
| Net source LOC | +19 by git numstat; guard source budget passed |
| New source files | 0 |
| Source gross churn | 23 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-parser-contract.test.mjs scripts/tests/m4-order-import-csv-file-intake-contract.test.mjs scripts/tests/m4-order-import-table-file-intake-contract.test.mjs scripts/tests/m4-order-import-storage-object-intake-contract.test.mjs scripts/tests/m4-order-import-worker-queue-job-contract.test.mjs` | passed; 20 tests, 5 suites, 0 failures |
| `npm run format:check` | passed via full check |
| `npm run typecheck` | passed via full check |
| `npm run lint` | passed via full check |
| `npm run depcruise` | passed via full check; 70 modules, 67 dependencies, no violations |
| `npm run jscpd` | passed via full check; 0 clones |
| `npm run knip` | passed via full check |
| `npm run guard:forbidden-terms` | passed via full check |
| `npm run guard:eval-triggers` | passed via full check; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed via full check |
| `git diff --check && git diff --cached --check` | passed |
| `env -u UZMAX_PRIMARY_ROOT CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-32-order-import-parser-input-boundary npm run check` | passed; 266 Node tests, build, size 57.17 kB brotlied, Playwright 11 passed |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M4-32-order-import-parser-input-boundary-contract.md --include-worktree` | passed; changedFiles=5, source=1, docs=3, test=1, source changedFiles=1/netLoc=0/newFiles=0 |
| assigned worktree final status | pending final commit/PR |
| root/main final status | pending final audit |

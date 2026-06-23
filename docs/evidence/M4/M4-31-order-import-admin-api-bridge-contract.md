# M4-31 Order Import Admin API Bridge Contract Evidence

> spec: `docs/specs/M4-31-order-import-admin-api-bridge-contract.md`
> branch: `codex/m4-31-order-import-admin-api-bridge`
> worktree: `/Users/atilla/Documents/uzmax-m4-31-order-import-admin-api-bridge`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_import_admin_api_bridge_contract__test_only_no_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-31 adds a test-only bridge contract for the ADR-B02 no-API import snapshot path. The focused test compiles/imports the existing admin order import API client and the existing API order import controller/service/repository through a test-private temporary module compiler, then supplies a controller-backed fetcher so admin client requests can be checked against real API contract methods. The bridge test does not call the shared `apps/api/scripts/runtime-compiler.mjs` cache path, so it can run safely beside the full concurrent Node test suite.

It does not modify source files, start a real HTTP/auth runtime, read env, connect to or write a real database, download Storage, create signed URLs, implement XLSX parsing, change schema/migrations/generated client, add BullMQ/Redis queues, production config, external order API connectors, AI runtime/eval or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-31-order-import-admin-api-bridge` | pending final validation |
| Branch | `codex/m4-31-order-import-admin-api-bridge` | pending final validation |
| Dependency install | `npm ci` | passed; npm audit reported existing 3 high severity findings |
| Full local boundary preflight | assigned worker + root/main clean | `root_untracked_duplicate_docs_block_full_local_preflight` |
| CI-mode boundary fallback | assigned worktree check | passed |
| Manual root tracked/index evidence | root tracked diff/index clean, no open PRs | passed before edits |
| Admin/API bridge happy path | jobs, row errors and fresh snapshot search pass from admin client to API controller/service | passed focused test |
| Handoff semantics | stale/missing bridge results require handoff, include runtime warning and hide `orderStatusRef` | passed focused test |
| API failure mapping | missing permission and missing job map to admin client HTTP failures | passed focused test |
| Test cache isolation | no shared `node_modules/.cache/uzmax-api-runtime` deletion during concurrent full test suite | passed after switching M4-31 helper to a test-private temp compiler |
| Sensitive data/runtime | no source changes, raw data, env, DB, PrismaClient, BullMQ/Redis, Storage downloader or external API call | passed focused test and static source checks |

## Boundary Preflight Note

The full local worker boundary guard is expected to keep failing on root/main untracked duplicate docs that predate this worker:

- `docs/adr/ADR-B02-order-api 2.md`
- `docs/adr/README 2.md`
- `docs/evidence/M4/README 2.md`
- `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
- `docs/specs/SPK-02-order-api 2.md`

This M4-31 slice does not delete those files. It proceeds with absolute assigned worktree paths plus CI-mode boundary check and manual root tracked/index clean evidence.

## Acceptance Mapping

| Item | Current M4 branch | M4-31 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `admin_api_bridge_contract_supported_not_closed` | Verifies admin client jobs/errors/snapshot search against the existing API controller/service contract; production DB/runtime, queue and visible UI E2E remain future scope. |
| E-03 | `admin_api_bridge_contract_supported_not_closed` | Verifies stale/missing warning handoff remains fail-closed through admin client and API controller/service bridge. |
| E-04 | `foundation_supported_not_closed` | Bridge consumes order-read API results without fabricating status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_admin_api_bridge_not_closed` | Adds admin-client-to-API-controller bridge evidence; full desktop core workflow with runtime data remains future scope. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting is added. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX files, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `apps/admin/**`, `apps/worker/**`, `packages/db/**` schema/migration/generated client, `packages/capabilities/**`, package/lock/config/CI files were modified.
- M4-31 does not change API routes, admin UI/client, Prisma schema/migrations/generated client, production provider config, Redis connection, retry executor, Storage downloader/upload runtime, signed URL path or XLSX parser.
- The M4-31 bridge test uses a unique temporary module directory rather than the shared API runtime cache, after the first full validation attempt exposed concurrent test cache deletion against the existing M1 HTTP shell test.
- M4 evidence index was synchronized to include M4-31 while preserving production HTTP/auth runtime, production DB runtime, RLS integration, queue runtime, real Storage ingestion, XLSX parser, visible admin E2E, AI runtime/eval and release blockers.

## Review Closure

| Review | Finding | Resolution |
|---|---|---|
| Spec compliance | no finding | M4-31 touched only the allowed spec/evidence/M4 README/test paths, added no source files and preserved all no-runtime/no-API/no-DB/no-queue boundaries. |
| Code quality | no finding | Focused bridge test uses injected fetcher/controller/service contracts and an isolated temp compiler; full validation passed without duplicate-code, lint, type or concurrency failures. |

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | docs=3, test=1, source=0, generated=0, lock=0, config=0 |
| Changed source files | 0 |
| Net source LOC | 0 |
| New source files | 0 |
| Source gross churn | 0 |
| Test weakening | none |
| External API/provider/connector evidence | none added |
| Exceptions | none |

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-import-admin-api-bridge-contract.test.mjs scripts/tests/m4-admin-order-import-api-client-contract.test.mjs scripts/tests/m4-order-import-api-shell.test.mjs scripts/tests/m4-order-import-runtime-warning-contract.test.mjs` | passed; 17 tests, 4 suites, 0 failures |
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
| `env -u UZMAX_PRIMARY_ROOT CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-31-order-import-admin-api-bridge npm run check` | passed; 266 Node tests, build, size 57.17 kB brotlied, Playwright 11 passed |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M4-31-order-import-admin-api-bridge-contract.md --include-worktree` | passed; changedFiles=4, docs=3, test=1, source changedFiles=0/netLoc=0/newFiles=0 |
| assigned worktree final status | pending final commit/PR |
| root/main final status | pending final audit |

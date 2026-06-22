# M4-06 Admin Order Import Snapshot Shell Evidence

> spec: `docs/specs/M4-06-admin-order-import-snapshot-shell.md`
> branch: `codex/m4-06-admin-order-import-snapshot-shell`
> worktree: `/Users/atilla/Documents/uzmax-m4-06-admin-order-import-snapshot-shell`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `admin_order_import_snapshot_shell__synthetic_local_no_runtime`
> redaction_status: no raw customer/order data, CSV/XLSX, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-06 extends the existing M4 admin order path shell with a synthetic/local import snapshot admin surface: import job summary, visible row errors, snapshot search states, stale warning and handoff-required wording.

It does not implement DB persistence, CSV/XLSX parsing, admin-to-API network calls, API routes, worker queues, generated Prisma client artifacts, production config, external order API connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-06-admin-order-import-snapshot-shell` | passed |
| Branch | `codex/m4-06-admin-order-import-snapshot-shell` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Import job summary | successful/failed/total rows visible | passed Playwright |
| Row errors | controlled error rows visible without raw data | passed Playwright |
| Stale/missing states | warning and handoff required, no status ref | passed Playwright |
| No order API connector | no `order_connector`, provider, adapter or external API call | passed diff/review |
| Sensitive data | no raw order/customer identifiers or payloads | passed Playwright and diff/review |
| Source budget | 2 changed source files, +287 source lines, 0 new source files | passed under spec budget |

## Acceptance Mapping

| Item | Current M4 branch | M4-06 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `admin_shell_supported_not_closed` | Shows import job summary, successful rows/search and row errors in admin shell; runtime import/admin E2E remains future scope. |
| E-03 | `admin_shell_supported_not_closed` | Shows stale snapshot warning and handoff-required state; runtime/admin persistence warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Missing/stale UI does not show fabricated status; AI eval/runtime integration remains future scope. |
| I-01 | `partial_admin_shell_not_closed` | Extends desktop/mobile order admin shell; full order/customer workflow remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX import/export, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/api/**`, `packages/db/**`, `packages/capabilities/**`, `packages/engine/**`, generated client, package/lock/config/CI files were modified.
- M4 evidence index was synchronized to include M4-06 while preserving future runtime/API/worker/AI/E2E blockers.

## Final Validation

| Command | Result |
|---|---|
| `npm run playwright` | passed, 9 tests |
| `npm run format:check` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed, no dependency violations |
| `npm run jscpd` | passed, 0 clones |
| `npm run knip` | passed |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers` | passed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| boundary guard with assigned/root env | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-06-admin-order-import-snapshot-shell.md --include-worktree` | passed after implementation |
| `git diff --check` | passed after final evidence update |
| `npm run check` | passed: 166 Node tests, build, size limit 55.99 kB brotlied, 9 Playwright tests |
| assigned worktree final status | clean after amended local commit |
| root/main final status | clean before push |

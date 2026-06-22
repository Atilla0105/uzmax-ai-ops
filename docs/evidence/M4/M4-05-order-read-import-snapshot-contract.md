# M4-05 Order-Read Import Snapshot Contract Evidence

> spec: `docs/specs/M4-05-order-read-import-snapshot-contract.md`
> branch: `codex/m4-05-order-read-import-snapshot-contract`
> worktree: `/Users/atilla/Documents/uzmax-m4-05-order-read-import-snapshot-contract`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `order_read_import_snapshot_pure_contract__no_order_api_connector`
> redaction_status: no raw customer/order data, CSV/XLSX, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-05 adds pure `order-read` contracts for import snapshot row validation, batch summaries, row errors and fresh/stale/missing/degraded read decisions.

It does not implement DB persistence, CSV/XLSX parsing, admin UI, API routes, worker queues, generated Prisma client artifacts, production config, external order API connectors or real customer/order data access.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-05-order-read-import-snapshot-contract` | passed |
| Branch | `codex/m4-05-order-read-import-snapshot-contract` | passed |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Import rows | accepted snapshot drafts and row errors from controlled refs only | passed focused test |
| Stale/missing/degraded read | handoff required and no fabricated status | passed focused test |
| No order API connector | no `order_connector`, provider, adapter or external API call | passed focused test and diff review |
| Sensitive data | no raw order/customer identifiers or payloads | passed focused test and diff review |
| Source budget | 1 changed source file, +410 source lines, 0 new source files | passed under spec budget |

## Acceptance Mapping

| Item | Current M4 branch | M4-05 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | Adds no API connector and no `order_connector`. |
| E-02 | `foundation_supported_not_closed` | Adds pure import row, snapshot draft, row error and batch summary contract; import runtime/admin E2E remains future scope. |
| E-03 | `foundation_supported_not_closed` | Adds stale snapshot handoff decision contract; runtime/admin warning remains future scope. |
| E-04 | `foundation_supported_not_closed` | Missing/stale/degraded paths hand off without status fabrication; AI eval/runtime integration remains future scope. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX import/export, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `apps/**`, `packages/db/**`, `packages/engine/**`, API routes, admin UI, generated client, package/lock/config/CI files were modified.
- M4 evidence index was synchronized to include M4-04 and M4-05 while preserving future runtime/admin/E2E blockers.

## Final Validation

| Command | Result |
|---|---|
| `node --test scripts/tests/m4-order-read-import-snapshot-contract.test.mjs` | passed, 6 tests |
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
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-05-order-read-import-snapshot-contract.md --include-worktree` | passed after final evidence update |
| `git diff --check` | passed after final evidence update |
| `npm run check` | passed after source budget compression: 166 Node tests, build, size limit 55.39 kB brotlied, 8 Playwright tests |
| assigned worktree final status | clean after amended local commit |
| root/main final status | clean before push |

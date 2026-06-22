# M4-01 Admin Order-Path Status Shell Evidence

> spec: `docs/specs/M4-01-admin-order-path-status-shell.md`
> branch: `codex/m4-01-admin-order-path-status-shell`
> worktree: `/Users/atilla/Documents/uzmax-m4-01-admin-order-path-status-shell`
> adr: `docs/adr/ADR-B02-order-api.md`
> decision_type: `no_api_for_m4__import_snapshot_main_path`
> redaction_status: no raw order/customer data, CSV/XLSX, screenshots, order IDs, phone numbers, addresses, payment data, credentials, token values or env files included

## Scope

M4-01 adds a static admin UI status shell for the current ADR-B02 branch. It does not implement order import, order search, customer linkage, DB contracts, API routes, connectors, workers or production evidence.

The UI wording is anchored on `订单数据主路径：导入快照`. Direct order API is shown as not configured by current project decision, not as a live outage or temporary degradation.

## Validation Table

| Check | Expected | Result |
|---|---|---|
| Worktree path | `/Users/atilla/Documents/uzmax-m4-01-admin-order-path-status-shell` | pass |
| Branch | `codex/m4-01-admin-order-path-status-shell` | pass |
| Boundary preflight | `worker-write-boundary: ok` | passed before edits |
| Admin UI | M4 shell visible from `/design` admin flow | passed focused Playwright |
| Required wording | `订单数据主路径：导入快照` | passed focused Playwright |
| No API semantics | no direct order API configured; project decision, not live API degradation | passed focused Playwright |
| Future gates | import jobs, order search and customer linkage are later M4 specs | passed focused Playwright |
| Sensitive data | no raw order/customer identifiers or payloads | passed focused Playwright and diff review |

## Acceptance Mapping

| Item | Current M4 branch | M4-01 contribution |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | UI does not claim an API connector exists. |
| E-02 | `p0_current_main_path__import_snapshot` | UI makes import snapshots the order-data main path. |
| E-03 | `p0_remains__stale_snapshot_warning` | UI keeps stale warning as a required gate, not implemented runtime. |
| E-04 | `p0_remains__no_fabricated_order_status` | UI keeps missing/stale/degraded order data on handoff gate, not AI judgment. |
| I-01 | desktop core admin flow | Adds visible order-path shell; full order workflow remains future gated. |

## Boundary Notes

- No external order API, LLM/provider, Telegram, real customer system or production connector was called.
- No raw CSV/XLSX import/export, screenshots, order IDs, phone numbers, addresses, payment information, customer plaintext, credentials or env files were read into or committed by this slice.
- No `packages/**`, `apps/api/**`, DB schema/migration, generated DTO, package/lock/config/CI/script files or `docs/evidence/M4/README.md` were modified.
- M4-02 DB contracts are intentionally untouched. The stalled uncommitted M4-02 spec draft was not adopted and its empty worktree/branch was cleaned; the DB slice must restart from latest `main` as a separate serial worker.

## Final Validation

To be filled after final command run:

| Command | Result |
|---|---|
| `npm run format:check` | pass |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm run guard:doc-triggers` | pass |
| `npm run guard:workspace` | pass |
| boundary guard with assigned/root env | pass |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-01-admin-order-path-status-shell.md --include-worktree` | pass; before commit this reported 6 changed files, categories source 3, test 1, docs 2 |
| focused Playwright/design test | pass: `npx playwright test apps/admin/tests/design.spec.ts --grep "M4-01|narrow mobile"`; 2/2 passed |
| `git diff --check origin/main...HEAD` | pass |
| `npm run check` | pass; full chain completed after resolving an initial CSS duplicate found by `jscpd` |
| assigned worktree final status | pass: `## codex/m4-01-admin-order-path-status-shell` after commit |
| root/main final status | pass: `## main...origin/main` after commit |

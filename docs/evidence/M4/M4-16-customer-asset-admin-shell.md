# M4-16 Customer Asset Admin Shell Evidence

Spec: `docs/specs/M4-16-customer-asset-admin-shell.md`

Branch/worktree: `codex/m4-16-customer-asset-admin-shell` / `/Users/atilla/Documents/uzmax-m4-16-customer-asset-admin-shell`

## Scope

- Adds a synthetic local customer asset admin shell to `/design`.
- Covers customer list filters, selected customer detail, identity/profile/custom fields/customer tags, related refs for conversations/tickets/order snapshots/quotes/dual-track guide records, secondary management entries and a local restore action with audit draft wording.
- Does not call real API runtime, connect DB/worker, import backend packages, persist audit events, save field/tag configuration, aggregate real history/order/quote/ticket data, read env/secrets or render real customer/order data.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm run guard:worker-boundary` | `passed` | Preflight passed before edits. |
| `npm run typecheck` | `passed` | TypeScript no-emit passed. |
| `npm run lint` | `passed` | Max-lines fixed at 250 counted lines; admin imports remain frontend-only. |
| `npm run jscpd` | `passed` | `Found 0 clones` after avoiding duplicate M4 card markup. |
| `npx playwright test apps/admin/tests/design.spec.ts --grep "M4-16\|narrow mobile\|tablet"` | `passed` | 4 focused design tests passed, including mobile/tablet floor checks. |
| `node --test scripts/tests/m4-customer-asset-api-shell.test.mjs` | `passed` | 5 M4-14 compatibility tests passed after preserving the customer asset admin UI/E2E blocker wording. |
| `npm run check` | `passed` | 204 Node tests, build, size `57.17 kB brotlied`, and 11 Playwright tests passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-16-customer-asset-admin-shell.md` | `passed` | 7 files: source 2, test 1, docs 4; source net +272 LOC, new source files 1. |

## Acceptance Mapping

| Item | Status | Notes |
| --- | --- | --- |
| D-04 | `admin_shell_supported_not_closed` | Adds visible customer list/detail shell with controlled related refs; real history/order/quote/ticket aggregation runtime remains future scope. |
| D-05 | `admin_shell_supported_not_closed` | Adds visible local restore action and audit draft wording; real audit persistence/admin owner flow remains future scope. |
| D-07 | `admin_shell_supported_not_closed` | Adds visible custom field/customer tag/conversation tag surfaces; config save and analysis reuse remain future scope. |
| I-01 | `partial_customer_asset_admin_shell_not_closed` | Adds desktop-visible customer asset workflow shell; full core workflow with runtime data remains future scope. |

## Boundary Notes

- M4 no-API branch remains active: owner input is still "暂时没有api"; this slice does not reopen external order/customer API work.
- All visible refs are controlled placeholders such as `customer://alpha`, `identity://alpha-primary`, `snapshot://order-alpha` and `quote://alpha-draft`.
- Remaining future work: real API runtime wiring, DB runtime/RLS integration, audit persistence, history/order/quote/ticket aggregation, field/tag config save, conversation tag analysis reuse and release signoff.

## Incident

- Recorded `docs/incidents/INC-2026-06-23-m4-16-root-patch-target.md` because initial relative `apply_patch` wrote this M4-16 draft into root/main checkout instead of the assigned worker worktree.
- Impact was limited to six unstaged/uncommitted M4-16 files in root/main checkout; worker was still clean at detection time and no raw data, secret, generated artifact or commit was created.
- Cleanup evidence: root/main returned to clean `## main...origin/main`; worker branch carries the intended M4-16 changes and full `npm run check` passed.

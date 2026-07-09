# M9-04 Admin Employee Read Evidence

Spec: `docs/specs/M9-04-admin-employee-read-evidence.md`
Status: `m9_04_employee_admin_read_passed_not_ga0_open`
Recorded: 2026-07-09
Branch: `codex/m9-04-admin-employee-read-evidence`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-04-admin-employee-read-evidence`

## Current Truth

M9-04 is now closed by the M9-06 employee provisioning workflow. The workflow created the deterministic smoke employee, upserted formal org/tenant membership and permission facts, obtained an employee Supabase password-session token in memory, and read the Render staging conversation list through the Vercel admin / Render API path.

The pass condition was HTTP 200 from `GET https://uzmax-api-staging.onrender.com/conversation-ticket/conversations` with an employee bearer token plus `x-org-id` and `x-tenant-id`.

This evidence closes M9-04 only. It does not approve 1.0, production, broad real customer traffic, customer LLM, Telegram Business automatic reply or formal knowledge write.

## Required Success Path

M9-04 can pass only when `scripts/run-m9-admin-employee-read-smoke.mjs --live` proves all of the following with a real employee session:

1. `GET https://uzmax-admin.vercel.app/` returns a 2xx HTML-ish Vercel admin response.
2. The script uses either `UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN` or obtains a Supabase password-session token from `UZMAX_ADMIN_EMPLOYEE_EMAIL` plus `UZMAX_ADMIN_EMPLOYEE_PASSWORD`.
3. `GET https://uzmax-api-staging.onrender.com/conversation-ticket/conversations` returns HTTP 200 with the employee bearer token plus `x-org-id` and `x-tenant-id`.
4. Output records only status, token hash prefix and item counts. It does not print the token, password, raw auth response, customer text, secret values or conversation payloads.

The M9-04 pass token is `m9_04_employee_admin_read_passed_not_ga0_open`. At M9-04 creation time this token did not open GA-0 by itself because M9-05 and M9-06 still remained. Those follow-up records are now closed for the minimal Bot-only package and aggregated in GA0-01.

## Superseded Blocker

Previous status token: `m9_04_owner_input_employee_session_required_not_ga0`.

Previous reason:

- No trusted `UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN` is available in this worker environment.
- No trusted `UZMAX_ADMIN_EMPLOYEE_EMAIL` plus `UZMAX_ADMIN_EMPLOYEE_PASSWORD` pair is available in this worker environment.
- The slice is explicitly forbidden from substituting Supabase SQL/admin direct database reads for employee-session admin/API read evidence.

This blocker was superseded on 2026-07-09 by M9-06 workflow run `29006898466`, after the project owner authorized creating the smoke employee account.

## Superseding Live Smoke Result

Workflow:

- `M9 GA-0 Employee Smoke`

Run:

- `29006898466`

Job:

- `86080558072`

Head SHA:

- `735934b6b8b15cda4b1aaf80996a18af4895ea5d`

Result:

- Workflow conclusion: `success`
- M9-06 status: `m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open`
- Nested M9-04 status: `m9_04_employee_admin_read_passed_not_ga0_open`
- Category: `pass`
- Conversation HTTP status: `200`
- Conversation count: `2`
- Token source: `supabase-password`
- Token evidence: hash prefix only, no token value
- Sanitized artifact: no password key, service role key, database URL, access token, refresh token, raw auth response, customer text or conversation payload

## Boundary

This evidence does not approve:

- 1.0 release.
- Production traffic.
- Broad real customer traffic.
- Real customer/order data expansion beyond a future owner-provided employee-session read path.
- Customer LLM/provider use.
- Telegram Business automatic reply.
- Formal knowledge write, distill auto-write or confirmation bypass.

## Original Local Smoke Result

Command:

- `node scripts/run-m9-admin-employee-read-smoke.mjs --live`

Result:

- Exit code: `2`
- Category: `owner_input_blocker`
- Stage: `employee-auth`
- Status: `m9_04_owner_input_employee_session_required_not_ga0`
- Missing input: `UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN or UZMAX_ADMIN_EMPLOYEE_EMAIL/UZMAX_ADMIN_EMPLOYEE_PASSWORD`
- Network calls: none; the script fails closed before admin, Supabase or API fetch when employee auth input is absent.

This was not a validation failure for that worker environment. It is retained as historical evidence that the standalone M9-04 script failed closed before owner authorization and employee provisioning existed.

## Validation

Focused validation:

- `node --test scripts/tests/m9-admin-employee-read-evidence.test.mjs`
  - Result: pass, 4/4 tests.
- `node scripts/run-m9-admin-employee-read-smoke.mjs --help`
  - Result: pass, exit 0.
- `node scripts/run-m9-admin-employee-read-smoke.mjs --live`
  - Result: expected owner-input blocker, exit 2, status `m9_04_owner_input_employee_session_required_not_ga0`.
- `node node_modules/eslint/bin/eslint.js scripts/run-m9-admin-employee-read-smoke.mjs scripts/tests/m9-admin-employee-read-evidence.test.mjs`
  - Result: pass after linking ignored worktree `node_modules` to the root checkout dependency install; no package or lockfile change.
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M9-04-admin-employee-read-evidence.md docs/evidence/M9/M9-04-admin-employee-read-evidence.md docs/release.md scripts/run-m9-admin-employee-read-smoke.mjs scripts/tests/m9-admin-employee-read-evidence.test.mjs`
  - Result: pass.
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-04-admin-employee-read-evidence.md --include-worktree`
  - Result: blocked by base-ref drift. `origin/main` is still `fe4f27d` (M9-02), while assigned local `main` is `150ad71` (M9-03). The guard therefore includes inherited M9-03 files and reports out-of-scope inherited files: `apps/admin/src/releaseGateContracts.ts`, `scripts/tests/m6-release-gate-console.test.mjs` and `scripts/tests/m9-ga0-minimal-boundary.test.mjs`.
- Diagnostic local-base shape check: `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M9-04-admin-employee-read-evidence.md --include-worktree`
  - Result: pass, changed files `5`, categories `docs=3`, `source=1`, `test=1`.
- `git diff --check`
  - Result: pass.

# M9-06 GA-0 Employee Provisioning Smoke

Spec: `docs/specs/M9-06-ga0-employee-provisioning-smoke.md`
Status: `m9_06_employee_account_provisioning_workflow_ready_not_run`
Recorded: 2026-07-09
Branch: `codex/m9-06-employee-provisioning`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-06-employee-provisioning`

## Current Truth

This evidence adds the controlled workflow and script needed to create or update one dev/staging smoke employee and run the M9-04 employee admin read smoke through Supabase/Vercel/Render.

The workflow has not been dispatched from `main` yet in this evidence file. Therefore this record does not claim M9-04 pass and does not open GA-0.

GA-0 remains locked. 1.0 remains blocked.

## Provisioning Boundary

The M9-06 workflow is dispatch-only:

- Workflow: `.github/workflows/m9-ga0-employee-smoke.yml`
- Dispatch confirmation input: `confirm=M9-06`
- Supabase project: `uzmax-dev` / `enyocaykcgcfcswycujg`
- Smoke employee email: stored only as a configured workflow input and emitted in result as a hash prefix, not as a password-bearing credential.
- Smoke employee user id: `90000000-0000-4000-8000-000000000906`
- Scope org: `11111111-1111-4111-8111-111111111604`
- Scope tenant: `22222222-2222-4222-8222-222222222604`
- Role: `owner_operator`
- Permissions: `tenant:read`, `conversation:read`

The script uses:

- Supabase Admin API to create/update the smoke Auth user.
- Formal DB writes only to upsert `org_member`, `tenant_member` and `permission_grant`.
- The existing M9-04 smoke runner for the live Vercel admin HTML plus Render API conversation read.

Supabase SQL/admin direct database reads are not counted as M9-04 success.

## Sanitization

The workflow and script must not print:

- password value;
- service role key;
- database URL;
- publishable key;
- raw Supabase auth response;
- customer text;
- conversation payload.

The result may print only sanitized operational facts such as status, smoke status, conversation count, token hash prefix, employee email hash prefix, org/tenant ids and permission count.

## Expected Success Token

If the workflow creates/updates the smoke employee, upserts the permission facts and M9-04 returns HTTP 200 from `/conversation-ticket/conversations`, the script status is:

- `m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open`

The nested M9-04 status is:

- `m9_04_employee_admin_read_passed_not_ga0_open`

These tokens still do not open GA-0 by themselves. A separate owner signoff/open record remains required before GA-0 can be marked open.

## Current Status

Current status token:

- `m9_06_employee_account_provisioning_workflow_ready_not_run`

Reason:

- The script, tests and workflow are present in this branch.
- The workflow must be merged to `main` before manual dispatch.
- No live dispatch result is recorded yet.

## Boundary

This evidence does not approve:

- GA-0 open.
- 1.0 release.
- Production traffic.
- Broad real customer traffic.
- Real customer/order data expansion beyond the M9-04 employee-session read path.
- Customer LLM/provider use.
- Telegram Business automatic reply.
- Formal knowledge write, distill auto-write or confirmation bypass.
- AI quality gates G-04/G-06 as passed; they remain owner-deferred for minimal GA-0 only.

## Validation

Required before PR merge:

- `node --test scripts/tests/m9-ga0-employee-provisioning.test.mjs`
- `node packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs --help`
- `node node_modules/eslint/bin/eslint.js packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs scripts/tests/m9-ga0-employee-provisioning.test.mjs`
- `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/m9-ga0-employee-smoke.yml docs/specs/M9-06-ga0-employee-provisioning-smoke.md docs/evidence/M9/M9-06-ga0-employee-provisioning-smoke.md docs/release.md packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs scripts/tests/m9-ga0-employee-provisioning.test.mjs`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-06-ga0-employee-provisioning-smoke.md --include-worktree`
- `git diff --check`

Required after PR merge:

- Dispatch `M9 GA-0 Employee Smoke` with `confirm=M9-06`.
- Inspect sanitized status and artifact.
- If the nested M9-04 smoke passes, record the result as M9-04 pass evidence and proceed only to the owner signoff/open record. If it fails, keep GA-0 locked and record the exact blocker.

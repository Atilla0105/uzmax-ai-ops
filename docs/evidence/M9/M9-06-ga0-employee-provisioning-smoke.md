# M9-06 GA-0 Employee Provisioning Smoke

Spec: `docs/specs/M9-06-ga0-employee-provisioning-smoke.md`
Status: `m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open`
Recorded: 2026-07-09
Branch: `main`
Workflow: `M9 GA-0 Employee Smoke`

## Current Truth

This evidence records the controlled workflow and script that created one dev/staging smoke employee and ran the M9-04 employee admin read smoke through Supabase/Vercel/Render.

The controlling live dispatch is workflow run `29006898466`. It passed and returned nested M9-04 status `m9_04_employee_admin_read_passed_not_ga0_open`.

This evidence closes M9-04 and M9-06 inputs for the minimal Bot-only GA-0 signoff package. It does not approve 1.0, production, broad real customer traffic, customer LLM, Telegram Business automatic reply or formal knowledge write.

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

These tokens do not approve 1.0 or production by themselves. The separate minimal Bot-only owner signoff record is now `docs/evidence/GA-0/GA0-01-minimal-bot-signoff.md`.

## Current Status

Current status token:

- `m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open`

Result:

- Workflow run `29006898466` completed with conclusion `success`.
- Job `86080558072` completed with conclusion `success`.
- Head SHA was `735934b6b8b15cda4b1aaf80996a18af4895ea5d`.
- The smoke employee user id was `90000000-0000-4000-8000-000000000906`.
- The workflow created the smoke employee in this run.
- Formal provisioning wrote `org_member`, `tenant_member` and `permission_grant`.
- Permission count was `2`.
- Nested M9-04 status was `m9_04_employee_admin_read_passed_not_ga0_open`.
- Conversation HTTP status was `200`.
- Conversation count was `2`.

Superseded run:

- Workflow run `29005953274` failed before provisioning because the workflow used Node 20. PR #288 switched the workflow to Node 24. Run `29006898466` is the controlling evidence.

## Boundary

This evidence does not approve:

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

- `M9 GA-0 Employee Smoke` was dispatched with `confirm=M9-06`.
- Run `29006898466` passed.
- The downloaded artifact was parsed locally.
- Sanitized JSON shape check passed: no password key, service role key, database URL, access token, refresh token, raw response, customer text or conversation payload was present.

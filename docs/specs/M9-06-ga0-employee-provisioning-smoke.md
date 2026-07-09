# M9-06 GA-0 Employee Provisioning Smoke

Spec ID: M9-06
Status: `m9_06_employee_account_provisioning_workflow_ready_not_run`
Owner confirmation point: project owner authorized creating an employee account so the minimal Bot-only GA-0 path can continue. This spec does not open GA-0 by itself and does not approve 1.0.
Timebox: one narrow CI-only operational smoke lane.

## Spec 类型

infra

## Goal

Create the smallest auditable path to provision one dev/staging smoke employee and run the existing M9-04 employee admin read smoke without exposing secrets:

1. Add a dispatch-only GitHub Actions workflow that uses existing masked Supabase/DB secrets.
2. Create or update one deterministic Supabase Auth smoke employee using Supabase Admin API.
3. Upsert the matching formal `org_member`, `tenant_member` and `permission_grant` rows for the existing M6B staging synthetic org/tenant.
4. Run `scripts/run-m9-admin-employee-read-smoke.mjs` in the same process with generated employee password, Vercel admin URL, Render API URL and scoped org/tenant headers.
5. Output only sanitized status, hash prefixes and counts; never print password, service role key, DB URL, raw auth response, customer text or conversation payloads.

## Owner Confirmation Point

- Owner authorized creating an employee account in the Codex thread on 2026-07-09.
- Owner still owns final GA-0 open/signoff and 1.0 release decisions.
- If the workflow returns `m9_04_employee_admin_read_passed_not_ga0_open`, that closes M9-04 evidence only. It does not by itself open GA-0.

## AI Agent Responsibilities

- Read `AGENTS.md`, M9-03, M9-04, M9-05 and `docs/release.md` before edits.
- Implement only the allowed workflow/script/test/docs files.
- Use Supabase Admin API for Auth user provisioning; do not hand-write `auth.users`.
- Use DB writes only to provision formal membership/permission facts; do not count Supabase SQL/admin direct database reads as M9-04 success.
- Keep all secrets masked and out of logs, evidence, PR descriptions and artifacts.
- Keep G-04/G-06 deferred for minimal GA-0 only, not passed; keep 1.0 blocked.

## Preconditions

- Current branch is `codex/m9-06-employee-provisioning`.
- Current worktree is `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-06-employee-provisioning`.
- Base is `origin/main` at `87e5b04`.
- GitHub repo secrets exist: `UZMAX_RLS_DATABASE_URL`, `UZMAX_SUPABASE_PUBLISHABLE_KEY`, `UZMAX_SUPABASE_SECRET_KEY`.
- Supabase dev project is `enyocaykcgcfcswycujg` (`uzmax-dev`).
- Existing staging synthetic scope:
  - org `11111111-1111-4111-8111-111111111604`
  - tenant `22222222-2222-4222-8222-222222222604`

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-06-employee-provisioning` |
| branch | `codex/m9-06-employee-provisioning` |
| start commit | `87e5b0459c11771b575430b61116075eb0606436` |
| open PR audit before work | `[]` from `gh pr list --state open --json number,title,headRefName,url` |
| no-merged branch audit before work | no output from `git branch --no-merged main` in root checkout |

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `.github/workflows/m9-ga0-employee-smoke.yml`
  - `docs/specs/M9-06-ga0-employee-provisioning-smoke.md`
  - `docs/evidence/M9/M9-06-ga0-employee-provisioning-smoke.md`
  - `docs/release.md`
  - `packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs`
  - `scripts/tests/m9-ga0-employee-provisioning.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M9-03-ga0-minimal-signoff-boundary.md`
- `docs/specs/M9-04-admin-employee-read-evidence.md`
- `docs/evidence/M9/M9-04-admin-employee-read-evidence.md`
- `docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md`
- `docs/release.md`
- `scripts/run-m9-admin-employee-read-smoke.mjs`
- `apps/api/src/access-context.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `packages/db/prisma/schema.prisma`

## Path Classification And Budget

| Classification | Paths | Budget |
|---|---|---|
| config | `.github/workflows/m9-ga0-employee-smoke.yml` | changed config files <= 1 |
| docs | M9-06 spec/evidence and `docs/release.md` | changed docs files <= 3 |
| source | `packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs` | changed source files <= 1, new source files <= 1, net source LOC <= 360 |
| test | `scripts/tests/m9-ga0-employee-provisioning.test.mjs` | changed test files <= 1, new test files <= 1 |
| generated | none | none |
| lock | none | no lockfile changes |

No `large_change_exception`, `external_dependency_exception` or `test_weakening_exception` is requested.

## Pass Conditions

- The provisioning script can be imported and tested without live secrets.
- Missing required env fails before Auth/DB/API calls.
- The script creates a missing smoke employee with Supabase Admin API or updates the deterministic existing smoke employee.
- The script writes formal `org_member`, `tenant_member` and at least `tenant:read`/`conversation:read` permission grants for the smoke employee.
- The script invokes M9-04 live smoke with employee email/password in memory only.
- The script and workflow output no password, service role key, DB URL, raw auth response, customer text or conversation payload.
- The workflow is `workflow_dispatch` only and requires explicit `confirm=M9-06`.
- The workflow artifact is sanitized.
- `m9_04_employee_admin_read_passed_not_ga0_open` is treated as M9-04 pass evidence only, not GA-0 open.

## Failure Branches

- If required GitHub secrets are absent, workflow fails closed and does not claim M9-04 pass.
- If Supabase Auth create/update fails, workflow fails closed and does not write a pass token.
- If formal membership/permission writes fail, workflow fails closed and does not run a pass claim.
- If M9-04 live smoke returns 401/403/runtime blocker, record blocker status and keep GA-0 locked.
- If any raw secret/customer payload appears in output, treat as release-blocking incident candidate and do not reuse the run.
- If GA-0 open/audit record needs to be changed, it must be a separate owner signoff/open record after M9-04 and M9-05 are proven.

## Not Doing

- No GA-0 opening action in this PR.
- No 1.0 approval.
- No production deployment or production traffic approval.
- No broad real customer traffic approval.
- No customer LLM/provider approval.
- No Telegram Business automatic reply or Business expansion.
- No formal knowledge write, distill auto-write or confirmation bypass.
- No Supabase SQL/admin direct database read as M9-04 success.
- No app source, API/worker/DB schema, package, lockfile or release gate contract change.

## Validation

Required local validation:

- `node --test scripts/tests/m9-ga0-employee-provisioning.test.mjs`
- `node packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs --help`
- `node node_modules/eslint/bin/eslint.js packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs scripts/tests/m9-ga0-employee-provisioning.test.mjs`
- `node node_modules/prettier/bin/prettier.cjs --check .github/workflows/m9-ga0-employee-smoke.yml docs/specs/M9-06-ga0-employee-provisioning-smoke.md docs/evidence/M9/M9-06-ga0-employee-provisioning-smoke.md docs/release.md packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs scripts/tests/m9-ga0-employee-provisioning.test.mjs`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-06-ga0-employee-provisioning-smoke.md --include-worktree`
- `git diff --check`

Required live validation after this workflow exists on `main`:

- Dispatch `M9 GA-0 Employee Smoke` with `confirm=M9-06`.
- Confirm sanitized workflow result status.
- If M9-04 passes, create/record the owner GA-0 open/signoff evidence separately; if it does not pass, keep GA-0 locked with exact blocker.

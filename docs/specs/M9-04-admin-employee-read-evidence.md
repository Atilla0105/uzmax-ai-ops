# M9-04 Admin Employee Read Evidence

Spec ID: M9-04
Status: `m9_04_owner_input_employee_session_required_not_ga0`
Owner confirmation point: project owner must provide or approve a real employee Supabase session path through either `UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN` or `UZMAX_ADMIN_EMPLOYEE_EMAIL` plus `UZMAX_ADMIN_EMPLOYEE_PASSWORD`. Without that input, M9-04 records an owner-input blocker and cannot be treated as GA-0 open evidence.
Timebox: one narrow evidence harness and release-boundary documentation slice.

## Spec 类型

cleanup

## Goal

Create the minimal employee-admin read evidence path for GA-0 without opening GA-0:

1. Add a live-gated Node smoke script for the Vercel admin HTML plus Render API conversation read path.
2. Require a real employee Supabase session or access token before any live conversation read claim.
3. Record the current status truthfully as blocked when no employee auth input is available.
4. Keep `docs/release.md` explicit that GA-0 remains locked and 1.0 remains blocked.
5. Add focused tests that prove the script fails closed without auth, scopes live requests, and does not print secrets or customer text.

## Owner Confirmation Point

- Owner must provide a trusted employee access token, or employee email/password plus Supabase runtime config, before live M9-04 can pass.
- Owner must decide whether a 200 read from `https://uzmax-api-staging.onrender.com/conversation-ticket/conversations` using that employee session is sufficient M9-04 evidence for later M9-06 owner signoff.
- Owner has not approved GA-0 open, 1.0 release, production traffic, broad customer data expansion, customer LLM, Telegram Business automatic reply or formal knowledge write.

## AI Agent Responsibilities

- Read `AGENTS.md`, M9-03, GA0-00, M9-02, current release docs, admin runtime config/auth client code and the conversation-ticket API read path before edits.
- Implement only the allowed docs, script and test files for this spec.
- Default the smoke script to no live network unless `--live` is passed.
- Never print access tokens, passwords, raw Supabase auth responses, customer text, secret values or conversation payloads.
- Report 200 conversation read as M9-04 pass evidence only, not GA-0 open.
- Report missing employee auth as `m9_04_owner_input_employee_session_required_not_ga0`.

## Preconditions

- Current branch is `codex/m9-04-admin-employee-read-evidence`.
- Current worktree is `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-04-admin-employee-read-evidence`.
- Base is local `main` at `150ad71`.
- M9-03 records that M9-04 must use real employee session evidence through Vercel admin/Supabase, or explicitly record an owner-input blocker.
- M9-02 records the Vercel admin and Render API staging platform boundary.
- No known real employee Supabase access token, email/password pair or session evidence is available in this worker environment at spec creation time.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-04-admin-employee-read-evidence` |
| branch | `codex/m9-04-admin-employee-read-evidence` |
| start commit | `150ad710063c1ab509964803c3b090c268fdadfa` |
| linked worktree check | `.git/worktrees/codex-m9-04-admin-employee-read-evidence`; no superproject |
| no-merged branch audit before work | no output from `git branch --no-merged main` |
| open PR audit before work | no output from `gh pr list --state open` |

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M9-04-admin-employee-read-evidence.md`
  - `docs/evidence/M9/M9-04-admin-employee-read-evidence.md`
  - `docs/release.md`
  - `scripts/run-m9-admin-employee-read-smoke.mjs`
  - `scripts/tests/m9-admin-employee-read-evidence.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M9-03-ga0-minimal-signoff-boundary.md`
- `docs/evidence/GA-0/GA0-00-minimal-boundary.md`
- `docs/specs/M9-02-admin-vercel-staging-closeout.md`
- `docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md`
- `apps/admin/src/adminRuntimeConfig.ts`
- `apps/admin/src/adminRuntimeAuth.ts`
- `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.service.ts`

## Path Classification And Budget

| Classification | Paths | Budget |
|---|---|---|
| docs | M9-04 spec, M9-04 evidence, `docs/release.md` | changed docs files <= 3 |
| source | `scripts/run-m9-admin-employee-read-smoke.mjs` | changed source files <= 1, new source files <= 1, net source LOC <= 420 |
| test | `scripts/tests/m9-admin-employee-read-evidence.test.mjs` | changed test files <= 1, new test files <= 1 |
| generated | none | none |
| lock | none | no lockfile changes |
| config | none | no config changes |

No `large_change_exception`, `external_dependency_exception` or `test_weakening_exception` is requested.

## Pass Conditions

- The smoke script prints help and performs no live network by default.
- With `--live`, missing employee auth returns `m9_04_owner_input_employee_session_required_not_ga0` before network calls.
- With `--live` and a manual employee token, the script fetches Vercel admin HTML first, skips Supabase auth and then requests the Render conversation list with `authorization`, `x-org-id` and `x-tenant-id`.
- With `--live` and employee email/password, the script fetches Vercel admin HTML first, obtains a Supabase password-session access token, and then requests the Render conversation list with scoped headers.
- The script never prints token, password, raw auth response, customer text or secret values.
- HTTP 200 from `/conversation-ticket/conversations` is the only M9-04 live pass condition.
- HTTP 401/403 from the conversation API is an authz blocker, not a pass.
- Missing auth input is an owner-input blocker, not a validation pass and not GA-0 open.
- `docs/release.md` points to M9-04 evidence and keeps GA-0 locked and 1.0 blocked.

## Failure Branches

- If the branch or worktree does not match this assigned M9-04 path, stop and report blocked.
- If employee auth env is absent, record `m9_04_owner_input_employee_session_required_not_ga0` and keep GA-0 locked.
- If Supabase sign-in fails or the conversation API returns 401/403, record an authz blocker and keep GA-0 locked.
- If Vercel admin HTML, Supabase auth or Render API network/runtime behavior fails outside 401/403, record a runtime blocker and keep GA-0 locked.
- If a 200 conversation response contains no parseable `items` array, record a runtime contract blocker and keep GA-0 locked.
- If any edit would require app source, API/worker/DB, lockfile, env file, release gate contract or unrelated evidence changes, stop and request a new spec.

## Not Doing

- No GA-0 opening action.
- No 1.0 approval.
- No production deployment or production traffic approval.
- No broad real customer traffic approval.
- No real customer/order data expansion beyond the owner-provided employee-session read path.
- No customer LLM/provider approval.
- No Telegram Business automatic reply or Business expansion.
- No formal knowledge write, distill auto-write or confirmation bypass.
- No Supabase SQL/admin direct database read as M9-04 success.
- No app source, API/worker/DB, package, lockfile, env-file or release gate contract change.

## Smoke Script Contract

Default env aliases:

- Admin URL: `UZMAX_ADMIN_URL`, default `https://uzmax-admin.vercel.app`
- API base: `UZMAX_API_BASE_URL`, `VITE_UZMAX_API_BASE_URL`, default `https://uzmax-api-staging.onrender.com`
- Org: `UZMAX_ORG_ID`, `VITE_UZMAX_ORG_ID`
- Tenant: `UZMAX_TENANT_ID`, `VITE_UZMAX_TENANT_ID`
- Supabase URL: `UZMAX_SUPABASE_URL`, `VITE_UZMAX_SUPABASE_URL`
- Supabase publishable key: `UZMAX_SUPABASE_PUBLISHABLE_KEY`, `VITE_UZMAX_SUPABASE_PUBLISHABLE_KEY`
- Auth: `UZMAX_ADMIN_EMPLOYEE_ACCESS_TOKEN`, or both `UZMAX_ADMIN_EMPLOYEE_EMAIL` and `UZMAX_ADMIN_EMPLOYEE_PASSWORD`

## Validation

Required focused validation:

- `node --test scripts/tests/m9-admin-employee-read-evidence.test.mjs`
- `node scripts/run-m9-admin-employee-read-smoke.mjs --help`
- `node scripts/run-m9-admin-employee-read-smoke.mjs --live`
- `node node_modules/eslint/bin/eslint.js scripts/run-m9-admin-employee-read-smoke.mjs scripts/tests/m9-admin-employee-read-evidence.test.mjs`
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M9-04-admin-employee-read-evidence.md docs/evidence/M9/M9-04-admin-employee-read-evidence.md docs/release.md scripts/run-m9-admin-employee-read-smoke.mjs scripts/tests/m9-admin-employee-read-evidence.test.mjs`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-04-admin-employee-read-evidence.md --include-worktree`
- `git diff --check`

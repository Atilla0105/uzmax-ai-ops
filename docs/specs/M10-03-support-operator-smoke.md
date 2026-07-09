# M10-03 Support Operator Smoke

Spec ID: M10-03
Status: `m10_03_support_operator_smoke_workflow_ready_not_run`
Owner confirmation point: project owner asked Codex to make the customer-service workbench product-grade with real backend data, but live mutating staging smoke still requires an explicit owner-approved dispatch after this workflow lands on `main`.
Timebox: one narrow staging support-operator smoke lane.

## Spec 类型

infra

## Goal

Create an auditable staging smoke for a real support-operator account and the conversation-ticket API write path:

1. Provision or update one deterministic dev/staging Supabase Auth support operator that is separate from the M9 GA-0 read-only employee.
2. Upsert formal `org_member`, `tenant_member` and `permission_grant` rows for the existing synthetic staging org/tenant.
3. Grant only the hard-coded permissions `tenant:read`, `conversation:read` and `ticket:write`.
4. Exercise the real conversation-ticket HTTP path with a scoped bearer token: list conversations, create a handoff ticket and apply ticket actions.
5. Emit only sanitized status, counts and hash prefixes; never print passwords, tokens, service-role keys, DB URLs, raw auth responses, customer text or conversation payloads.

## Owner Confirmation Point

- Owner authorized creating the product-grade closure goal and using workers in the Codex thread on 2026-07-09.
- Owner still owns live mutating staging dispatch, production, real customer data, 1.0 release and any real account/cost/compliance decisions.
- This spec only prepares a workflow and local fake-testable implementation. It does not claim live pass until the workflow is dispatched after the backend write implementation is merged and deployed.

## AI Agent Responsibilities

- Read `AGENTS.md`, this spec, M9-06 provisioning evidence, M10-01 backend write evidence and v1.1 product/technical/acceptance boundaries before edits.
- Keep writes inside the assigned M10-03 worktree and listed touch files.
- Use Supabase Admin API for Auth user provisioning; do not hand-write `auth.users`.
- Keep the permission allowlist hard-coded and exact; do not accept arbitrary permission env input.
- Treat live mutating smoke as owner-gated and synthetic-only.
- Keep M10-03 from implying GA-0, 1.0, production, broad customer traffic, customer LLM, Telegram Business or formal knowledge-write approval.

## Preconditions

- Current branch is `codex/m10-03-support-operator-smoke`.
- Current worktree is `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-03-support-operator-smoke`.
- Forbidden write checkout is `/Users/atilla/Applications/UZMAX智能运营` root/main.
- Base is local `main` at `8767572`.
- Existing synthetic staging scope is inherited from M9-06:
  - org `11111111-1111-4111-8111-111111111604`
  - tenant `22222222-2222-4222-8222-222222222604`
- M10-01 must be merged and deployed before a live mutating M10-03 pass can be claimed, because current `main` does not yet include DB-backed conversation-ticket writes.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-03-support-operator-smoke` |
| branch | `codex/m10-03-support-operator-smoke` |
| start status | `## codex/m10-03-support-operator-smoke` |
| root/main status | `## main...origin/main` |
| open PR audit before work | `[]` from `gh pr list --state open --json number,title,headRefName,url` |
| no-merged branch audit before work | `codex/m10-01-conversation-ticket-db-writes`, `codex/m10-02-admin-conversation-runtime-truth-gate`, `codex/m10-03-support-operator-smoke` |

## Concurrent Dispatch Evidence

| Check | Evidence |
|---|---|
| Worktree isolation | M10-01, M10-02 and M10-03 use separate physical worktrees under `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/`. |
| Branch isolation | M10-03 uses `codex/m10-03-support-operator-smoke`; no other active worker is assigned to that branch. |
| Touch-module isolation | M10-03 touches only support-operator smoke docs/workflow/authz script/test. It does not touch M10-01 backend write files or M10-02 admin runtime files. |
| Global serial points | No DB schema, lockfile, shared guard script or release/production gate change is in scope. `.github/workflows/m10-support-operator-smoke.yml` is a new dispatch-only workflow and no other active worker is editing workflows. |

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `.github/workflows/m10-support-operator-smoke.yml`
  - `docs/specs/M10-03-support-operator-smoke.md`
  - `docs/evidence/M10/M10-03-support-operator-smoke.md`
  - `packages/authz/scripts/m10-support-operator-smoke-api.mjs`
  - `packages/authz/scripts/m10-support-operator-smoke-db.mjs`
  - `packages/authz/scripts/m10-support-operator-smoke-runtime.mjs`
  - `packages/authz/scripts/run-m10-support-operator-smoke.mjs`
  - `scripts/tests/m10-support-operator-smoke.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/specs/M9-06-ga0-employee-provisioning-smoke.md`
- `docs/evidence/M9/M9-06-ga0-employee-provisioning-smoke.md`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`

## Path Classification And Budget

| Classification | Paths | Budget |
|---|---|---|
| config | `.github/workflows/m10-support-operator-smoke.yml` | changed config files <= 1, new config files <= 1 |
| docs | M10-03 spec/evidence | changed docs files <= 2 |
| source | `packages/authz/scripts/run-m10-support-operator-smoke.mjs`, `packages/authz/scripts/m10-support-operator-smoke-runtime.mjs`, `packages/authz/scripts/m10-support-operator-smoke-api.mjs`, `packages/authz/scripts/m10-support-operator-smoke-db.mjs` | changed source files <= 4, new source files <= 4, net source LOC <= 600 |
| test | `scripts/tests/m10-support-operator-smoke.test.mjs` | changed test files <= 1, new test files <= 1 |
| generated | none | none |
| lock | none | no lockfile changes |

No `large_change_exception`, `external_dependency_exception` or `test_weakening_exception` is requested.

## Document Trigger Check

updated

This spec and evidence are new operational smoke records. No product source-of-truth rewrite is required because the change is a narrow workflow-ready validation lane, not a product scope change.

## Implementation Steps

1. Commit this spec and initial evidence before any source/config/test files.
2. Add a support-operator smoke script that can be imported and tested without live secrets.
3. Add a dispatch-only GitHub Actions workflow requiring `confirm=M10-03`.
4. Add fake-run tests for config failure, exact permission grants, scoped HTTP sequence and sanitization.
5. Record local validation and the live-dispatch boundary in evidence.

## Pass Conditions

- Missing required secrets fail before Auth, DB or API provisioning calls.
- Query-only/non-Postgres `UZMAX_RLS_DATABASE_URL` fails before provisioning calls.
- The support operator is deterministic and separate from the M9 smoke employee.
- The script creates or updates the Supabase Auth user through Admin API.
- The script upserts exactly three permission grants: `tenant:read`, `conversation:read`, `ticket:write`.
- The fake live smoke sequence proves token fetch, conversation list, handoff and ticket actions use scoped `authorization`, `x-org-id` and `x-tenant-id` headers.
- The workflow is dispatch-only, uses Node 24, runs `npm ci`, runs `npm run -w @uzmax/db prisma:generate`, requires `confirm=M10-03` and writes a sanitized summary/artifact.
- Local validation passes: script tests, `--help`, `guard:pr-shape` and `git diff --check`.

## Failure Branches

- If secrets are absent or malformed, return `m10_03_owner_input_required_support_operator_smoke_not_run` or fail closed before provisioning.
- If Supabase Auth provisioning fails, return a blocked status and do not claim live API pass.
- If membership or permission writes fail, return a blocked status and do not run write smoke.
- If API list/handoff/action calls fail, record the failing stage/status and keep M10-03 not passed.
- If output contains any secret, token, raw auth response, customer text or conversation payload, treat the run as invalid and candidate incident evidence.
- If M10-01 backend writes are not deployed, the workflow may be ready but live M10-03 pass remains blocked.

## Not Doing

- No live mutating staging dispatch from local Codex.
- No production traffic or production account action.
- No real customer/order-data smoke.
- No Telegram outbound, Telegram Business approval or LLM/provider call.
- No knowledge/distill auto-write or confirmation bypass.
- No admin UI, API implementation, DB schema, migration, generated client, lockfile or release signoff change.
- No reuse of the M9 GA-0 read-only smoke employee.

## Validation

Required local validation:

- `node --test scripts/tests/m10-support-operator-smoke.test.mjs`
- `node packages/authz/scripts/run-m10-support-operator-smoke.mjs --help`
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-03-support-operator-smoke.md --include-worktree`
- `git diff --check main...HEAD`

Required live validation after M10-01 and M10-03 are on `main` and the API deployment contains DB-backed ticket writes:

- Dispatch `M10 Support Operator Smoke` with `confirm=M10-03`.
- Confirm only sanitized workflow summary/artifact is emitted.
- Treat success as staging synthetic support-operator write evidence only, not GA-0, 1.0 or production approval.

# M9-07 GA-0 Minimal Signoff Record

Spec ID: M9-07
Status: `ga0_minimal_bot_only_signoff_recorded_not_1_0`
Owner confirmation point: project owner directed Codex to complete the minimal GA-0 signoff path and authorized creating the smoke employee account on 2026-07-09. This spec records that evidence only; it does not approve 1.0 or production expansion.
Timebox: docs-only evidence sync.

## Spec 类型

cleanup

## Goal

Record the minimal Bot-only GA-0 signoff package after M9-04, M9-05 and M9-06 evidence are closed:

1. Update M9-04 evidence from owner-input blocked to live employee read passed via the M9-06 workflow.
2. Update M9-06 evidence from workflow-ready-not-run to live workflow passed.
3. Add a GA-0 minimal Bot-only signoff evidence record.
4. Update `docs/release.md` so it distinguishes minimal Bot-only GA-0 signoff from 1.0, production, broad customer traffic, customer LLM and Telegram Business approval.

## AI Agent Responsibilities

- Use only sanitized GitHub run/artifact facts.
- Do not print or store password, service role key, DB URL, raw auth response, access token, customer text or conversation payload.
- Keep G-04/G-06 as owner-deferred for minimal GA-0 only, not passed.
- Keep 1.0 blocked.
- Keep production, broad real customer traffic, customer LLM, Telegram Business automatic reply and formal knowledge write unapproved.

## Evidence Inputs

- PR #287: `M9-06: add employee provisioning smoke`, merge commit `1bc77ea7fa0bdfa9f03d89852344af73147aea5e`.
- PR #288: `M9-06: run employee smoke on Node 24`, merge commit `735934b6b8b15cda4b1aaf80996a18af4895ea5d`.
- Superseded failed workflow run: `29005953274`, failed before provisioning because the workflow used Node 20.
- Passing workflow run: `29006898466`, workflow `M9 GA-0 Employee Smoke`, job `86080558072`, head SHA `735934b6b8b15cda4b1aaf80996a18af4895ea5d`.
- Passing sanitized result token: `m9_06_employee_account_provisioned_m9_04_live_passed_not_ga0_open`.
- Nested M9-04 pass token: `m9_04_employee_admin_read_passed_not_ga0_open`.
- M9-05 pass evidence: `docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md`.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M9-07-ga0-minimal-signoff-record.md`
  - `docs/evidence/GA-0/GA0-01-minimal-bot-signoff.md`
  - `docs/evidence/M9/M9-04-admin-employee-read-evidence.md`
  - `docs/evidence/M9/M9-06-ga0-employee-provisioning-smoke.md`
  - `docs/release.md`

## Path Classification And Budget

| Classification | Paths | Budget |
|---|---|---|
| docs | M9-07 spec, GA0-01 evidence, M9-04 evidence, M9-06 evidence, `docs/release.md` | changed docs files <= 5 |
| source | none | changed source files = 0 |
| test | none | changed test files = 0 |
| config | none | changed config files = 0 |
| generated | none | none |
| lock | none | no lockfile changes |

No `large_change_exception`, `external_dependency_exception` or `test_weakening_exception` is requested.

## Pass Conditions

- M9-04 evidence records the live employee read pass through the Vercel admin / Render API path.
- M9-06 evidence records the passing workflow dispatch and sanitized result.
- GA0-01 records minimal Bot-only GA-0 signoff and its exact boundaries.
- `docs/release.md` no longer says M9-04 is owner-input blocked or M9-06 is workflow-ready-not-run.
- `docs/release.md` still blocks 1.0 and all out-of-scope production/customer/LLM/Business expansions.

## Failure Branches

- If the sanitized result cannot be read or does not contain both M9-06 and nested M9-04 pass tokens, do not record signoff.
- If any evidence would require raw secrets, raw auth response, customer text or conversation payload, stop and treat the run as unusable evidence.
- If owner scope expands beyond minimal Bot-only GA-0, stop and create a separate release/acceptance spec.

## Not Doing

- No runtime, API, worker, admin UI, DB schema, package, lockfile or workflow change.
- No 1.0 approval.
- No production traffic approval.
- No broad real customer traffic approval.
- No customer LLM/provider approval.
- No Telegram Business automatic reply.
- No formal knowledge write, distill auto-write or confirmation bypass.
- No G-04/G-06 pass claim.

## Validation

Required validation:

- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M9-07-ga0-minimal-signoff-record.md docs/evidence/GA-0/GA0-01-minimal-bot-signoff.md docs/evidence/M9/M9-04-admin-employee-read-evidence.md docs/evidence/M9/M9-06-ga0-employee-provisioning-smoke.md docs/release.md`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-07-ga0-minimal-signoff-record.md --include-worktree`
- `node scripts/guards/doc-trigger-paths.mjs --base origin/main`
- `node scripts/guards/eval-trigger-paths.mjs --base origin/main`
- `node scripts/guards/workspace-isolation.mjs`
- `git diff --check`

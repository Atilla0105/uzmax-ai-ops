# M6B-16 Safe Restore Drill

Spec ID: M6B-16
Tracking issue: Linear LAY-24
Status: `m6b_16_safe_restore_drill_passed_rolled_up_by_m6b17_not_ga0`
Owner confirmation point: project owner authorized a temporary Supabase safe restore target at the minimum available branch cost and staging/test-only synthetic data. Production, real customer/order data, customer LLM/provider use, GA-0 and 1.0 remain not approved.
Timebox: 0.5 work day.

Postscript: M6B-17 later rolls this evidence into the external-input blocker closure for LAY-24. This slice remains safe branch restore proof only and does not approve GA-0, PITR or production-data restore.

## Spec 类型

docs

## 目标

Close the owner-gated safe restore target blocker with a real Supabase branch restore drill, without touching production or real customer/order data.

This drill uses a Supabase development branch as the safe restore target. Supabase branch creation restores the parent project's migrations/schema into an isolated preview project with `with_data=false`. The branch is then validated with controlled synthetic rows and RLS read/isolation smoke.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: has authorized creating the temporary branch at the returned cost `$0.01344/hour`.

AI agent: create only the safe branch target, run schema/RLS validation with synthetic rows, avoid secret printing, and state clearly that this is a branch schema restore drill rather than PITR or production-data restore.

## Source Links

- `AGENTS.md`
- `docs/runbooks/backup-restore.md`
- `docs/evidence/M6/M6-08-backup-restore-asset-safety.md`
- `docs/evidence/M6B/README.md`
- `packages/db/prisma/schema.prisma`
- `packages/db/migrations/0001_platform_schema_authz_foundation.sql`

## 触碰模块/文件

- `docs/specs/M6B-16-safe-restore-drill.md`
- `docs/evidence/M6B/M6B-16-safe-restore-drill.md`
- `docs/evidence/M6B/README.md`
- `docs/release.md`

## 变更预算与路径分类

- Source/test/generated/lock/config budget: none.
- Docs budget: 4 files.
- New source files: none.
- External API basis: Supabase connector `get_cost`, `confirm_cost`, `create_branch`, `list_branches`, and SQL execution on the branch project.

## 实施步骤

1. Confirm branch cost and owner authorization.
2. Create Supabase branch `uzmax-restore-drill-20260627` from parent `uzmax-dev`.
3. Wait until branch preview project is active.
4. Verify restored public schema and RLS-enabled tables.
5. Insert controlled synthetic org/tenant/member/grant rows into the safe branch only.
6. Run RLS positive smoke as `uzmax_app_runtime` with matching `app.org_id` / `app.tenant_id`.
7. Run RLS negative smoke with a mismatched tenant context.
8. Record evidence and update LAY-24 only if the drill passes.

## 通过条件

- Branch exists with an independent project ref and `preview_project_status=ACTIVE_HEALTHY`.
- Branch records `with_data=false`.
- Core public tables exist and have RLS enabled.
- Positive RLS context sees the expected synthetic rows.
- Negative tenant context sees zero rows.
- Evidence records cost, target ref, boundary, and non-PITR limitation.

## 失败分支

- If branch creation fails or cost confirmation cannot be completed, keep LAY-24 open with `safe_restore_target_missing`.
- If schema/RLS smoke fails, keep LAY-24 open and record the failing query/result.
- If PITR or production backup restore becomes required, stop and create a separate owner-approved drill.

## 不做什么

- No production restore.
- No dev/staging/prod overwrite.
- No real customer/order data.
- No service role key, DB URL or backup material recorded.
- No PITR claim.
- No GA-0 or 1.0 approval.

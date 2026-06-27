# M6B-14 Admin Staging Deploy Target

Spec ID: M6B-14
Tracking issue: Linear LAY-23 prerequisite
Status: `m6b_14_admin_staging_deploy_prerequisite_superseded_by_m6b17_not_ga0`
Owner confirmation point: project owner authorized Vercel admin staging deploy target creation/use. GA-0, production release approval, real customer/order data and 1.0 remain not approved.
Timebox: 0.5 work day.

Postscript: this slice created the admin deploy prerequisite. M6B-17 later records the full API/worker/cron/admin rollback drill closure for LAY-23. This slice remains prerequisite evidence and does not open GA-0.

## Spec 类型

fix

## 目标

Create a real Vercel deployment target for the existing `uzmax-admin` project so LAY-23 can later run an admin rollback drill.

The admin console must remain release-locked. This slice does not open GA-0 and does not approve production traffic.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: has authorized using the existing Vercel team/project and staging API base URL.

AI agent: link to the existing Vercel project, configure the minimal build/output settings required for `apps/admin`, deploy, verify the page loads and the GA-0 action remains disabled, and record any deployment target limitations honestly.

## Source Links

- `AGENTS.md`
- `docs/release.md`
- `apps/admin/package.json`
- `apps/admin/src/releaseGateContracts.ts`
- `package.json`

## 触碰模块/文件

- `vercel.json`
- `.gitignore`
- `docs/specs/M6B-14-admin-staging-deploy.md`
- `docs/evidence/M6B/M6B-14-admin-staging-deploy.md`
- `docs/evidence/M6B/README.md`
- `docs/release.md`

## 变更预算与路径分类

- Config budget: 2 files.
- Docs budget: 4 files.
- Source/test/generated/lock budget: none.
- New source files: none.
- External API basis: Vercel CLI authenticated as the project owner account and Vercel connector project/deployment listing.
- New config rationale: `vercel.json` is required because the existing Vercel project expected root `dist`, while this monorepo emits `apps/admin/dist`; `.gitignore` keeps local `.vercel` project metadata out of git after Vercel linking.

## 实施步骤

1. Link the worktree to existing Vercel project `uzmax-admin`.
2. Add minimal Vercel config for admin build output.
3. Build `apps/admin`.
4. Deploy the linked project.
5. Verify deployment exists and page loads.
6. Verify release gate remains locked/disabled.
7. Record evidence and keep LAY-23 open until full API/worker/cron/admin rollback drill completes.

## 通过条件

- Vercel deployment for `uzmax-admin` reaches READY.
- Admin page is reachable.
- Release gate console still presents GA-0 as locked and the open action is disabled.
- Evidence records deployment id/url and does not claim GA-0.

## 失败分支

- If Vercel deploy fails due build/output config, add minimal project config in this slice.
- If deployment lands in the wrong project, do not count it as evidence and record cleanup separately.
- If GA-0 action is enabled, stop and treat as release gate bug.

## 不做什么

- No GA-0 opening.
- No production release approval.
- No real customer/order data.
- No Render worker/cron changes.
- No LAY-23 closure from admin-only deploy.

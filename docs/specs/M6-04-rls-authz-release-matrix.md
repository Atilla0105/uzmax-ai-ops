# M6-04 RLS Authz Release Matrix

Spec ID: M6-04
Tracking issue: Linear LAY-9
Owner confirmation point: project owner review of this PR and follow-up M6 release-gate decision.
Timebox: one docs/test-only PR.

## Spec 类型

infra

## Goal

Record the release-level RLS and authorization matrix for M6, tying existing RLS, API guard, permission, audit and true-DB evidence back to the v1.1 acceptance matrix.

This slice closes the documentation and verification gap for the repo release matrix. It does not redesign authz, change schema, approve production use, or run real tenant/customer/order data.

## Source Links

- `AGENTS.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `docs/adr/ADR-001-rls-prisma-pool.md`
- `docs/adr/ADR-002-dual-auth-access-context.md`
- `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md`
- `docs/runbooks/rls-misconfig.md`
- `packages/authz/src/index.ts`
- `apps/api/src/access-context.ts`
- `apps/api/src/order-import.rls-runner.ts`

## Scope

- Add M6-04 evidence that maps acceptance matrix A/B/J/K/L RLS and authorization items to current repo evidence.
- Record forged tenant/org, missing context, wrong role, front-end-only permission hiding and RLS misconfiguration drill coverage.
- Add a release-matrix guard test that checks the evidence, runbook, ADR links and sensitive-data boundary.
- Update M6 evidence index and release boundary docs to show M6-04 status.
- Update the RLS misconfiguration runbook with the M6 release-drill commands and failure branches.

## Out Of Scope

- Broad authorization redesign.
- Prisma schema, migration or generated-client changes.
- New production RLS policies.
- Runtime backend/admin implementation.
- Real tenant, customer, order or Telegram data.
- Production database, production Redis, production worker, GA-0 or 1.0 approval.
- External SaaS, real LLM/provider calls or secret handling.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-04-rls-authz-release-matrix.md`
  - `docs/evidence/M6/M6-04-rls-authz-release-matrix.md`
  - `docs/evidence/M6/README.md`
  - `docs/release.md`
  - `docs/runbooks/rls-misconfig.md`
  - `scripts/tests/m6-rls-authz-release-matrix.test.mjs`
- 说明/备注：
  - This slice may read `AGENTS.md`, the v1.1 source-of-truth docs, ADR-001, ADR-002, SPK-03, M1/M4/M5R evidence and current authz/RLS source files.
  - Do not modify app runtime source, backend packages, schema/migrations, generated files, lockfile, CI/guard config, deployment config or admin UI.

## 变更预算与路径分类

- Source files: 0 changed, 0 new, 0 net LOC.
- Test files: 1 new.
- Docs files: up to 5 changed/new.
- Generated, lockfile, migration, schema, CI/config changes: none.

## Agent Responsibilities

- Re-read `AGENTS.md`, this spec and referenced source/evidence before editing.
- Keep implementation docs/test-only.
- Verify no `packages/db/**`, `packages/authz/**`, `apps/api/**`, `apps/admin/**`, schema, migration, generated client, lockfile, CI or deployment config files changed.
- Run focused validation for the new M6-04 test and any repo guards available in the local worktree.
- Record PR/CI result and update Linear only as tracking.

## Acceptance

- M6-04 evidence maps B-01 through B-05 and relevant J/K/L items to concrete repo sources and evidence.
- Forged tenant/org, missing context, wrong role, front-end-only permission hiding and RLS misconfiguration handling are explicitly recorded.
- RLS misconfiguration runbook contains a release-drill path and failure branches.
- Evidence states that true DB evidence remains dev/staging/masked and does not approve production or GA-0.
- New test passes and enforces the no-source-change, evidence-link and no-sensitive-data-overclaim boundaries.

## Dependencies

- M6-00 readiness baseline.
- M1 platform/access-context evidence.
- M4 order-import RLS gateway/batch-runner contract evidence.
- M5R true integration closeout evidence.
- ADR-001, ADR-002 and SPK-03 evidence.
- No concurrent DB/schema work.

## Failure Branches

- If backend/API guard evidence cannot be mapped, leave affected B items open and block GA-0.
- If schema or RLS policy changes are required, stop this PR and create a serialized DB/schema spec.
- If real data or secrets are needed, stop and request owner-controlled evidence handling outside the repo.
- If the work cannot stay docs/test-only, split the implementation into a later spec.

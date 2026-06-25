# M6-09 Final Acceptance Rollup And GA-0 Decision Package

Spec ID: M6-09
Tracking issue: Linear LAY-14
Status: `m6_final_acceptance_rollup_recorded_no_go_recommended_owner_decision_pending_not_ga0`
Owner confirmation point: project owner review of the final GA-0 go/no-go package and any later explicit GA-0 or 1.0 decision.
Timebox: one docs/test-only PR.

## Spec 类型

docs

## Goal

Roll up M6-00 through M6-08 evidence against the v1.1 acceptance matrix and produce a final owner decision package for GA-0 and 1.0 readiness.

This slice does not approve GA-0, production deployment, real customer/order data, customer LLM, real provider calls, P1 risk acceptance or 1.0 release. It records the repo-evidence status, identifies no-go blockers and separates items that require explicit owner classification before they can become P1/P2 or backlog.

From current repo evidence, GA-0 remains closed and 1.0 remains blocked until owner decisions and missing evidence close the remaining gaps.

## Source Links

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/evidence/README.md`
- `docs/evidence/M6/README.md`
- `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`
- `docs/evidence/M6/M6-01-release-gate-console.md`
- `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`
- `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`
- `docs/evidence/M6/M6-04-rls-authz-release-matrix.md`
- `docs/evidence/M6/M6-05-ai-safety-eval-gates.md`
- `docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md`
- `docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md`
- `docs/evidence/M6/M6-08-backup-restore-asset-safety.md`
- `docs/release.md`
- `docs/runbooks/README.md`

## Scope

- Add the final M6-09 acceptance evidence and owner decision package.
- Roll up M6-00 through M6-08 status, remaining blockers and repo evidence links.
- Classify GA-0 and 1.0 status from current repo evidence without replacing owner approval.
- Record that no P1 risk acceptance, fix date, impact note or P2 backlog decision is currently present unless explicit owner evidence exists.
- Add a focused docs/evidence contract test.
- Update M6 evidence index and release boundary.

## Out Of Scope

- Owner release approval on behalf of the owner.
- New runtime, admin, API, worker, cron, schema, migration, generated, lockfile, CI/guard or deployment implementation.
- Real production deployment, real restore, real Telegram Bot traffic, real customer/order data, customer LLM, real provider calls or external SaaS onboarding.
- Creating P1/P2 downgrade decisions without explicit owner signoff, fix date and impact note.
- Formal 1.0 production launch.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-09-final-acceptance-rollup.md`
  - `docs/evidence/M6/M6-09-final-acceptance-rollup.md`
  - `docs/evidence/M6/README.md`
  - `docs/release.md`
  - `scripts/tests/m6-final-acceptance-rollup.test.mjs`
- 说明/备注：
  - This slice may read AGENTS, v1.1 source-of-truth docs, evidence indexes, M6-00 through M6-08 evidence and runbook indexes.
  - Do not modify runtime source, apps, packages, schema/migrations, generated files, lockfile, CI/guard config, deployment config or runbook behavior.

## 变更预算与路径分类

- Source files: 0 changed, 0 new, 0 net LOC.
- Test files: 1 new.
- Docs files: up to 4 changed/new.
- Generated, lockfile, migration, schema, CI/config changes: none.
- Exceptions: none.

## Agent Responsibilities

- Re-read `AGENTS.md`, this spec and referenced evidence before editing.
- Keep the change docs/test-only.
- Do not mark unresolved blockers as pass.
- Do not downgrade any open item to P1/P2 without explicit owner signoff, fix date and impact note evidence.
- Keep Linear as tracking only; repo files remain source of truth.
- Run the focused M6-09 evidence test and governance guards.

## Acceptance

- M6-09 evidence links M6-00 through M6-08 and the v1.1 source-of-truth docs.
- GA-0 package records a concrete current decision posture for owner review without approving GA-0.
- All open blocker items are visible as pass, no-go/blocker or owner-decision-required. No unresolved item is silently dropped.
- P1 risk signoffs and P2 backlog decisions are recorded as absent unless explicit owner evidence exists.
- Final status is ready for owner decision and keeps GA-0/1.0 closed from repo evidence.
- New focused test passes and prevents GA-0/production/1.0 overclaim.

## Dependencies

- M6-00 through M6-08 complete or explicitly blocked with evidence.
- Acceptance matrix v1.1.
- PRD and technical architecture v1.1 release/GA-0 rules.
- Current clean main / CI / PR / branch state.

## Failure Branches

- If any M6-00 through M6-08 slice is missing or unmerged, keep M6-09 blocked.
- If any P0-equivalent blocker lacks pass or explicit owner no-go/deferral evidence, keep GA-0 and 1.0 closed.
- If a P1/P2 classification is useful but lacks owner signoff/fix date/impact note, record it as owner-decision-required, not accepted.
- If evidence would require secrets, raw customer/order data, raw Telegram payloads, screenshots, voice transcripts or prompt/completion logs in repo, stop and keep only controlled refs or blocker status.
- If an implementation fix is required after closeout starts, split a new spec/branch/PR instead of bundling it into M6-09.

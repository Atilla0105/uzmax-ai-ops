# M6-08 Backup Restore And Asset Safety

Spec ID: M6-08
Tracking issue: Linear LAY-13
Owner confirmation point: project owner review of this PR and later explicit GA-0/1.0 release decision.
Timebox: one docs/test-only PR unless owner provides a safe restore target and secrets in a separate implementation/drill spec.

## Spec 类型

docs

## Goal

Record M6-08 backup/restore and asset/material safety readiness from current repo evidence.

This slice does not run a destructive restore and does not mutate Supabase. It records the current J-03 posture, the concrete external blockers for a real safe restore drill, and the current asset/material/template safety evidence that prevents formal knowledge/config writes without confirmation.

GA-0 is not open, production restore is not approved, real customer/order data is not approved, customer LLM is not approved, and 1.0 release remains not approved by this spec.

## Source Links

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/runbooks/backup-restore.md`
- `docs/evidence/M0/infra/supabase-env-manifest.md`
- `packages/db/prisma/schema.prisma`
- `packages/db/src/m3-ai-contracts.ts`
- `packages/capabilities/vision/src/index.ts`
- `packages/channels/src/index.ts`
- `docs/evidence/M3/M3-01-ai-capability-data-contracts-foundation.md`
- `docs/evidence/M3/M3-04-kb-journey-capability-foundation.md`
- `docs/evidence/M3/M3-16-kb-material-candidates.md`
- `docs/evidence/M3/M3-20-vision-screenshot-samples.md`
- `docs/evidence/M5/M5-07-template-center.md`
- `docs/evidence/M5R/M5R-02-formal-write-pipeline.md`
- `docs/evidence/M5R/M5R-06-template-copy-runtime.md`
- `docs/evidence/M5R/M5R-08-true-integration-closeout.md`
- `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`
- `docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md`

## Scope

- Add M6-08 evidence for J-03 backup/restore status and concrete external blockers.
- Expand `docs/runbooks/backup-restore.md` with safe-target, restore validation and asset/material safety drill steps.
- Map H-01, H-02, H-03, H-05 and H-06 asset/material safety status to current repo evidence.
- Add a docs/test-only evidence contract for M6-08.
- Update M6 evidence index, release boundary and runbook index.

## Out Of Scope

- Production destructive restore, production DB mutation, production Storage mutation or real customer/order-data drill.
- Creating, pausing, deleting or restoring a Supabase project from this PR.
- Reading or printing database URLs, service role keys, storage keys, Bot tokens, webhook secrets, LLM keys or provider secrets.
- Schema, migration, generated Prisma client, runtime source, admin UI, worker/cron or storage architecture changes.
- Full H-01 knowledge authoring UI, full H-05 real storage rebuild drill, full H-06 public/private quick-reply library workflow.
- GA-0 opening, production deployment or 1.0 approval.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-08-backup-restore-asset-safety.md`
  - `docs/evidence/M6/M6-08-backup-restore-asset-safety.md`
  - `docs/evidence/M6/README.md`
  - `docs/release.md`
  - `docs/runbooks/README.md`
  - `docs/runbooks/backup-restore.md`
  - `scripts/tests/m6-backup-restore-asset-safety.test.mjs`
- 说明/备注：
  - This slice may read AGENTS, v1.1 source-of-truth docs, M0 infra manifests, M3 material/media evidence, M5/M5R confirmation/template evidence, M6 evidence and focused tests.
  - Do not modify runtime source, packages, apps, schema/migrations, generated files, lockfile, CI/guard config, deployment config or admin UI.

## 变更预算与路径分类

- Source files: 0 changed, 0 new, 0 net LOC.
- Test files: 1 new.
- Docs files: up to 6 changed/new.
- Generated, lockfile, migration, schema, CI/config changes: none.
- Exceptions: none.

## Agent Responsibilities

- Re-read `AGENTS.md`, this spec and referenced evidence before editing.
- Keep implementation docs/test-only.
- Do not run destructive DB/Storage restore commands.
- Verify backup/restore status is not overclaimed when no owner-approved safe restore target is recorded.
- Verify asset/material safety evidence keeps formal writes behind confirmation and does not claim full H-01/H-05/H-06 closure when the current repo evidence is partial.
- Run the new focused test and supporting evidence/guard tests where local dependencies allow.
- Record PR/CI result and update Linear only as tracking.

## Acceptance

- J-03 has explicit current status: either safe restore evidence exists, or a concrete external blocker is recorded. Current repo status is expected to be a blocker unless safe target evidence is added before merge.
- Backup/restore runbook covers safe target selection, forbidden production overwrite, post-restore RLS/audit/storage validation and failure branches.
- Asset/material safety evidence records that formal knowledge/config/template writes must pass through confirmation or a named approved path.
- `storageRef` remains the durable material source-of-truth; Telegram `file_id` remains cache/provider metadata and cannot be treated as rebuild source.
- Remaining H-01/H-05/H-06 gaps are classified for M6-09 or later implementation slices.
- New test passes and enforces evidence links, docs/test-only scope and no GA/production/real-data overclaim.

## Dependencies

- M6-02 runtime baseline.
- M6-07 core operations synthetic E2E.
- M0 Supabase environment manifest.
- M3 media/material/vision controlled-ref contracts.
- M5R-02 formal write pipeline.
- M5R-06 template copy runtime.
- Owner-approved safe database environment or equivalent drill target for any future real restore.

## Failure Branches

- If no owner-approved safe restore target, backup snapshot ref and restore command evidence exist, keep J-03 blocked with concrete external blockers.
- If restore validation would require production DB/Storage mutation, stop and split a separate owner-approved drill.
- If any evidence requires raw customer/order data, raw screenshots, raw Telegram payloads, secrets or LLM keys in repo, stop and move source material to owner-controlled storage.
- If formal writes can bypass confirmation queue or named approved path, keep H-01/H-02/H-03 open and split a fix spec.
- If Telegram `file_id` is treated as the durable material source instead of `storageRef`, keep H-05 open and split an asset recovery spec.
- If full quick-reply public/private search, classification, import/export or permission behavior is required, keep H-06 open and split a later implementation spec.

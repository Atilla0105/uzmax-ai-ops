# M6-07 Core Operations Synthetic E2E

Spec ID: M6-07
Tracking issue: Linear LAY-12
Owner confirmation point: project owner review of this PR and later explicit GA-0 open decision.
Timebox: one docs/test-only PR.

## Spec 类型

docs

## Goal

Record one repo-level synthetic golden path across conversation, handoff ticket, customer asset, order snapshot, confirmation queue, logs/analytics and admin visibility.

This slice does not implement a new runtime E2E harness. It closes the M6-07 planning gap by linking existing merged source/test/evidence into one reproducible release-readiness path, classifying the remaining P0/P1/P2 gaps, and keeping GA-0 closed.

GA-0 is not open, real customer traffic is not approved, real customer/order data is not approved, customer LLM is not approved, and 1.0 release remains not approved by this spec.

## Source Links

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/evidence/M6/M6-01-release-gate-console.md`
- `docs/evidence/M6/M6-04-rls-authz-release-matrix.md`
- `docs/evidence/M6/M6-05-ai-safety-eval-gates.md`
- `docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md`
- `docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md`
- `docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md`
- `docs/evidence/M2/M2-07-conversation-ticket-api-http-hardening.md`
- `docs/evidence/M4/M4-37-order-import-admin-true-db-http-smoke.md`
- `docs/evidence/M4/M4-42-order-import-operator-workflow.md`
- `docs/evidence/M4/M4-43-customer-asset-runtime-workflow.md`
- `docs/evidence/M4/M4-44-order-read-runtime-eval-gate.md`
- `docs/evidence/M5/M5-03-confirmation-queue-api.md`
- `docs/evidence/M5/M5-04-confirmation-queue-admin.md`
- `docs/evidence/M5/M5-06-logs-analytics.md`
- `docs/evidence/M5/M5-08-integration-smoke-closeout.md`
- `docs/evidence/M5R/M5R-01-confirmation-queue-persistence.md`
- `docs/evidence/M5R/M5R-02-formal-write-pipeline.md`
- `docs/evidence/M5R/M5R-05-logs-analytics-runtime.md`
- `docs/evidence/M5R/M5R-07-admin-runtime-wiring.md`
- `docs/evidence/M5R/M5R-08-true-integration-closeout.md`

## Scope

- Add M6-07 evidence describing a bounded synthetic golden path from conversation intake to operator/admin readback.
- Map A/D/E/H/I acceptance items to current repo evidence and classify unresolved release gaps.
- Add a core operations synthetic E2E runbook for replaying the evidence path without real customer/order data.
- Add a docs/test-only evidence contract for M6-07.
- Update M6 evidence index, release boundary and runbook index.

## Out Of Scope

- Runtime source changes, new API routes, new admin screens, broad UX redesign or new business capability.
- New DB schema, migration, generated Prisma client, worker/cron changes or queue architecture changes.
- Full live browser-to-DB E2E implementation, production auth hardening or real multi-account production drill.
- Real customer/order data, raw exports, screenshots, Telegram payloads, voice transcripts, support personal accounts, Bot tokens, webhook secrets, LLM keys or real provider calls.
- Backup/restore, asset safety and final acceptance rollup, which remain M6-08/M6-09 scope.
- GA-0 opening, production deployment or 1.0 approval.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-07-core-ops-synthetic-e2e.md`
  - `docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md`
  - `docs/evidence/M6/README.md`
  - `docs/release.md`
  - `docs/runbooks/README.md`
  - `docs/runbooks/core-ops-synthetic-e2e.md`
  - `scripts/tests/m6-core-ops-synthetic-e2e.test.mjs`
- 说明/备注：
  - This slice may read AGENTS, v1.1 source-of-truth docs, M2/M4/M5/M5R/M6 evidence and focused tests.
  - Do not modify runtime source, packages, apps, schema/migrations, generated files, lockfile, CI/guard config, deployment config or admin UI.

## 变更预算与路径分类

- Source files: 0 changed, 0 new, 0 net LOC.
- Test files: 1 new.
- Docs files: up to 6 changed/new.
- Generated, lockfile, migration, schema, CI/config changes: none.
- Exceptions: none.

## Agent Responsibilities

- Re-read `AGENTS.md`, this spec and referenced source/evidence before editing.
- Keep implementation docs/test-only.
- Verify M6-07 does not claim full live production E2E, GA-0, production deploy, real customer/order data or 1.0 approval.
- Verify remaining P0/P1/P2 gaps are explicit rather than hidden behind the golden path.
- Run the new focused test and supporting evidence/guard tests where local dependencies allow.
- Record PR/CI result and update Linear only as tracking.

## Acceptance

- Evidence records a reproducible synthetic golden path across conversation, ticket, customer asset, order snapshot, confirmation queue, logs and admin visibility.
- Acceptance mapping covers A/D/E/H/I items with current evidence status and remaining release gaps.
- Operator-facing replay steps use only controlled refs and synthetic evidence paths.
- Remaining P0/P1/P2 gaps are classified for M6-08/M6-09 instead of being overclaimed closed.
- New test passes and enforces evidence links, docs/test-only scope and no GA/production/real-data overclaim.

## Dependencies

- M6-01 release gate console.
- M6-04 RLS/authz release matrix.
- M6-05 AI safety/eval gates.
- M6-06 Telegram Bot GA-0 main path.
- M2 conversation/ticket API and admin shell evidence.
- M4 customer asset and order snapshot/runtime evidence.
- M5/M5R confirmation queue, logs/analytics, formal write and admin runtime wiring evidence.

## Failure Branches

- If a stage cannot be tied to current merged source/test/evidence, mark that stage open and split a later spec instead of filling with intent.
- If the path needs runtime/source/schema/provider changes, stop this PR and split a later implementation spec.
- If any evidence requires raw customer/order data, raw Telegram payloads, screenshots, transcripts, secrets or LLM keys in repo, stop and move source material to owner-controlled storage.
- If the path reveals a release-blocking P0 gap, keep GA-0 closed and classify it for M6-08 or M6-09.
- If a future reviewer needs a live browser-to-DB E2E harness, create a separate implementation spec; this docs/test slice must not grow into a broad harness build.

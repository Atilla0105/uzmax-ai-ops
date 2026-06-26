# M6B-06a BullMQ Bot Job ID Fix

Spec ID: M6B-06a
Tracking issue: Linear LAY-22
Status: `m6b_06a_bullmq_job_id_fix_validated_not_ga0`
Owner confirmation point: project owner has authorized default staging-equivalent work for M6B-04/06/07/08, test Bot only, no production, no outbound and no real customer traffic.
Timebox: 0.25 work day.

## Spec 类型

fix

## 目标

Fix the real BullMQ enqueue blocker found during M6B-04/M6B-06 staging-equivalent bring-up: `createTelegramBotConversationJobId()` currently emits `:` separators, while BullMQ rejects custom job IDs containing `:`.

This fix keeps Bot conversation job IDs stable and scoped by org, tenant, channel connection and provider update ID, but switches the delimiter to a BullMQ-safe value.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: authorized default staging-equivalent processing for the owner-gated outer slices, while production, outbound, real customer/order data, customer LLM/provider calls, GA-0 and 1.0 remain not approved.

AI agent: implement the narrow job ID compatibility fix, add focused regression coverage, rerun relevant tests and record evidence without storing Bot tokens, webhook secrets, raw Telegram payloads, DB URLs or customer/order data.

## 时间盒

0.25 work day. If the fix requires schema, migration, generated client, lockfile, production deploy, real DB restore, outbound send or external provider changes, stop and split.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
- `docs/evidence/M6B/README.md`
- `packages/channels/src/index.ts`
- `apps/api/src/telegram-bot.ts`
- `scripts/tests/m6b-conversation-runtime.test.mjs`
- `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs`

## 触碰模块/文件

- `packages/channels/src/index.ts`
- `scripts/tests/m6b-conversation-runtime.test.mjs`
- `scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs`
- `docs/specs/M6B-06a-bullmq-job-id-fix.md`
- `docs/evidence/M6B/M6B-06a-bullmq-job-id-fix.md`

## 变更预算与路径分类

- Source budget: changed source files <= 1, net source LOC <= 20, new source files <= 0.
- Tests: changed test files <= 2.
- Docs: 2 new docs files.
- Generated/lock/config/CI/migration changes: none.
- New source `rg` conclusion: searched `createTelegramBotConversationJobId`, `telegram-bot:`, `jobId` and BullMQ enqueue tests. Existing ownership is `packages/channels/src/index.ts`; no new source file is needed.
- External API/SDK/provider/connector/adapter basis: local BullMQ runtime error `Custom Id cannot contain :` from real enqueue attempt.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, M6B contract/index and relevant Bot runtime tests.
- Confirm root/main remains coordination-only.
- Confirm the blocker is reproducible from a real BullMQ enqueue attempt, not a synthetic assertion.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-06-bullmq-job-id-fix` |
| branch | `codex/m6b-06-bullmq-job-id-fix` |
| base | `main` at current HEAD |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current` |

## 并发派发证据

Single worker. This fix touches the channels job ID helper and focused tests only. It is serial with Bot enqueue/runtime work and does not touch DB schema, migrations, lockfile, CI, release gates or production config.

## 实施步骤

1. Change Bot conversation job ID delimiter from `:` to a BullMQ-safe delimiter.
2. Update M6B tests to assert no colon exists in generated job IDs.
3. Rerun focused M6B conversation/webhook tests.
4. Rebuild the API artifact and retry the staging-equivalent enqueue.
5. Record evidence and remaining M6B-06 boundaries.

## 通过条件

- Generated Bot conversation job IDs remain stable and contain org, tenant, channel connection and provider update ID.
- Generated job IDs do not contain `:`.
- Focused M6B tests pass.
- Real BullMQ enqueue no longer fails with `Custom Id cannot contain :`.

## 失败分支

- If BullMQ rejects another job ID character, choose the smallest safe encoding and update tests.
- If enqueue requires DB/RLS/outbound/staging/prod mutation, stop and keep that in M6B-06 outer-slice evidence.
- If the fix touches unlisted modules, stop and split.

## 不做什么

- No production deploy.
- No real customer/order data.
- No customer LLM/provider call.
- No outbound Bot send.
- No schema/migration/generated client/lockfile/CI changes.
- No GA-0 or 1.0 approval.

## 验收映射

- L-02/C-01: removes a real enqueue blocker for the test Bot staging webhook path.
- J-02: keeps queue dedupe key stable while making it accepted by BullMQ.
- L-01: does not open GA-0; M6B-06 still needs real public webhook delivery and DB/RLS ticket readback evidence.

## 事故与 Closeout 记录

No incident created at spec start. If a write-boundary, secret or customer-data issue appears, record it under `docs/incidents/` before closeout.

# M8-05 Live Readback Runtime Config

Spec ID: M8-05
Status: `runtime_config_in_progress`
Owner confirmation point: project owner asked to move the Telegram Bot closed loop toward internal staff use with the existing backend, KB/persona and handoff pieces, adding only missing development where the loop is genuinely blocked. Owner still decides live Telegram token activation, webhook cutover, real customer traffic, real LLM/provider keys, cost, production deploy, GA-0 and 1.0 release.
Timebox: narrow runtime-config closeout PR.

## Spec 类型

infra

## 目标

Remove the concrete runtime gap between the already-verified M8 true DB smoke and a deployable internal dry-run loop:

1. The API can create its DB-backed conversation-ticket repository from env in real service startup, not only from a test-injected Prisma client.
2. Render API config declares DB-backed conversation-ticket readback.
3. Render worker config declares DB-backed Telegram Bot persistence and active-answer dry-run mode.
4. Render keeps live outbound send gated: answer mode remains `dry_run`; token is a secret placeholder; no real Telegram send is enabled by this PR.
5. Existing M8 DB/API test covers both the env Prisma factory path and the deploy manifest regression.

This slice turns the current loop from "code can pass a synthetic smoke" toward "deployment config can run the same DB-backed dry-run loop." It does not reopen governance or UI work.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide when to supply a live Bot token, test chat boundary, webhook target, real provider/LLM keys, customer-data boundary, deployment action, GA-0 opening and 1.0 release.

AI agent: patch only the runtime gap above, keep real send and customer/LLM boundaries closed, run focused verification, create PR, and merge only after CI passes.

## 时间盒

0.25 个工作日. If this requires schema/RLS/migration/generated changes, live Telegram credentials, production deploy, real customer data, real LLM calls or broader admin UI work, stop and report the blocker instead of widening this PR.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M8-05-live-readback-runtime-config.md`
  - `docs/evidence/M8/M8-05-live-readback-runtime-config.md`
  - `apps/api/src/conversation-ticket.repository.ts`
  - `scripts/tests/m8-db-backed-conversation-ticket-api.test.mjs`
  - `render.yaml`
  - `apps/api/package.json`
  - `package-lock.json`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/doc-gates.md`
- `docs/specs/M8-01-bot-runtime-answer-loop-v0.md`
- `docs/specs/M8-02-db-backed-conversation-ticket-api.md`
- `docs/specs/M8-03-runtime-active-answer-wiring.md`
- `docs/specs/M8-04-internal-bot-loop-smoke.md`
- `docs/evidence/M8/M8-03-runtime-active-answer-wiring.md`
- `docs/evidence/M8/M8-04-internal-bot-loop-smoke.md`
- `render.yaml`

## 变更预算与路径分类

- source: 1 existing source file, net source LOC target <= 40.
- test: 1 existing focused M8 DB/API test.
- config: `render.yaml` and API package dependency metadata.
- lock: workspace package dependency metadata only; no package version resolution change.
- docs/evidence: this spec plus one evidence file.
- generated, migration, schema, lock, CI workflow, admin UI runtime and worker runtime source: none.
- New source `rg` conclusion: searched `conversation-ticket`, `rls_prisma_gateway`, `createConversationTicketRepositoryProviderFromEnv`, `UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE`, `UZMAX_WORKER_TELEGRAM_BOT_ANSWER_MODE`, `render.yaml`, `M8-03`, `M8-04`, `active answer`, and `telegram-bot-conversation`. Existing API/worker runtime already implements the loop; the missing source change is the env Prisma client creation path in the existing conversation-ticket repository. No new source file is needed.
- External API/SDK/provider/connector/adapter basis: `@prisma/client` is already the generated local DB client used by the monorepo. This PR adds no external network call and no provider adapter.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md` and `docs/doc-gates.md`.
- Read M8-01 through M8-04 specs/evidence for the closed-loop chain.
- Check `git branch --no-merged main` and `gh pr list --state open`.
- Do not activate live Telegram send, real provider, real customer data or production deploy.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-05-live-readback-runtime-config` |
| branch | `codex/m8-05-live-readback-runtime-config` |
| base HEAD | `34fbb65f3f6d98782d68cbfeb1df03cf05ffba32` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, open PR audit and no-merged branch audit |

## 并发派发证据

Single writer in one worktree. Subagent dispatch was attempted for parallel review but the agent runtime reported `agent thread limit reached`, so this PR is executed by the main agent only. The touched files do not include DB schema, migrations, generated client, CI workflow, shared runtime config, production release gates or admin UI source. Lockfile scope is limited to API workspace dependency metadata for an already-resolved package.

## 事故与 closeout 记录

Known M8 incident before this PR:

- `docs/incidents/INC-2026-07-07-m8-01-root-patch-target.md`.

If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference incident evidence before continuing.

## 实施步骤

1. Extend the existing API conversation-ticket repository env path to create a Prisma client from `UZMAX_RLS_DATABASE_URL`.
2. Preserve explicit test injection via `prismaClient` and `prismaClientFactory`.
3. Set Render API conversation-ticket repository mode to `rls_prisma_gateway`.
4. Declare `@prisma/client` in the API workspace dependency metadata because the API package now imports the generated Prisma client at runtime.
5. Set Render worker Telegram Bot persistence to `rls_prisma_gateway` and active-answer mode to `dry_run`.
6. Add focused tests for env factory creation and Render manifest dry-run DB-backed closed-loop config.
7. Record validation, CI and merge evidence.

## 通过条件

- API repository env mode `rls_prisma_gateway` no longer throws "Prisma client injection is required" when `UZMAX_RLS_DATABASE_URL` is present.
- Missing `UZMAX_RLS_DATABASE_URL` still fails closed.
- Render API declares `UZMAX_CONVERSATION_TICKET_REPOSITORY_MODE=rls_prisma_gateway` and secret `UZMAX_RLS_DATABASE_URL`.
- Render worker declares `UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE=rls_prisma_gateway`, dry-run answer config and secret token placeholder.
- API workspace dependency metadata declares `@prisma/client`.
- Tests prove Render config does not set live answer mode.
- No schema, migration, generated client, CI workflow or admin UI changes are included. Lockfile scope is only the API workspace dependency metadata for the existing Prisma client version.

## 失败分支

- If `@prisma/client` cannot be resolved by API build/lint after this dependency metadata update, keep this PR blocked and report the package/runtime issue.
- If Render worker requires a separate staging DB/service setup outside repo config, record the deployment blocker and do not claim internal live readiness.
- If true live Telegram send is required, split an owner-approved live internal Bot activation spec.
- If real provider/LLM calls are required, split an owner-approved provider/eval-gated spec.
- If schema/RLS/generated changes are required, stop and split a DB-serial spec.

## 不做什么

- No live Telegram send, `setWebhook`, real customer chat, production deploy, GA-0 or 1.0 release claim.
- No real provider SDK/key/cost-bearing LLM call.
- No schema, migration, generated Prisma client, RLS policy, CI workflow or new dependency version resolution.
- No admin UI redesign or prototype work.
- No new repository/module parallel implementation.

## 验收映射

| Item | M8-05 status | Notes |
|---|---|---|
| C-01 | `deploy_config_db_backed_dry_run_loop_ready_not_live_send` | Render config can run DB-backed dry-run worker loop, but live Bot send remains owner-gated. |
| I-01 | `conversation_ticket_readback_env_runtime_unblocked` | API service can create DB readback repository from env instead of test-only injection. |
| G-03/K-02 | `persona_kb_dry_run_config_declared` | Worker config points active-answer dry-run to configured AI member and KB entry. |
| L-01/J-05 | `not_ga0_not_release` | No live token activation, production deploy, real customer traffic or owner release approval in this PR. |

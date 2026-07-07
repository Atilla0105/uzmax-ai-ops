# M8-04 Internal Bot Loop Smoke

Spec ID: M8-04
Status: `internal_bot_loop_smoke_in_progress`
Owner confirmation point: project owner asked to stop framework/document churn and make the existing Bot-to-backend loop usable for internal staff. Owner still decides real Telegram token activation, webhook cutover, real customer traffic, real provider keys, LLM cost, production deploy, GA-0 and 1.0 release.
Timebox: narrow operator smoke PR.

## Spec 类型

infra

## 目标

Turn the already-merged M8 runtime smoke into an operator-facing internal closed-loop command:

1. One command names the current internal Bot loop smoke instead of requiring operators to know the CI-only script path.
2. The command preflights `UZMAX_RLS_DATABASE_URL` and `UZMAX_REDIS_URL` without printing secret values.
3. The command reuses the canonical M8 true DB smoke, which runs webhook -> Redis -> worker service -> active KB answer -> dry-run outbound -> KB miss ticket -> conversation-ticket API readback -> tenant isolation -> residue cleanup.
4. The command remains dry-run outbound only; it does not use live Telegram token, real customer chat, real provider/LLM key or production traffic.

This slice makes the current backend closed loop runnable and explainable for internal test preparation. It does not add a new framework or reopen UI work.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide when to provide live Bot token/chat boundary, when to point a test webhook at staging, whether to allow real LLM/provider cost, and whether any GA-0 or production traffic can start.

AI agent: add only the missing operator smoke entrypoint, keep it wired to the existing canonical M8 smoke, record real local/CI evidence honestly, and preserve all live/customer/LLM/release boundaries.

## 时间盒

0.25 个工作日. If this requires runtime source rewrites, schema/RLS/migration/generated changes, live Telegram credentials, production deploy, real customer data or real LLM calls, stop and report the blocker instead of widening this PR.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M8-04-internal-bot-loop-smoke.md`
  - `docs/evidence/M8/M8-04-internal-bot-loop-smoke.md`
  - `packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs`
  - `scripts/tests/m8-internal-bot-loop-smoke.test.mjs`
  - `package.json`

Read-only anchors:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/specs/M8-01-bot-runtime-answer-loop-v0.md`
- `docs/specs/M8-02-db-backed-conversation-ticket-api.md`
- `docs/specs/M8-03-runtime-active-answer-wiring.md`
- `docs/evidence/M8/M8-03-runtime-active-answer-wiring.md`
- `.github/workflows/ci.yml`
- `packages/db/scripts/run-m8-active-answer-worker-true-db-smoke.mjs`
- `packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs`

## 变更预算与路径分类

- source: 1 new operator wrapper file under `packages/db/scripts`, net source LOC target <= 120.
- test: 1 focused test file.
- config: `package.json` script entry only; no lockfile change.
- docs/evidence: this spec plus one evidence file.
- generated, migration, schema, lock, CI workflow, runtime source, deploy config: none.
- New source `rg` conclusion: searched `internal bot`, `bot loop`, `closed loop`, `active answer worker`, `operator workflow`, `run-m8-active-answer-worker-true-db-smoke`, `dry-run outbound`, and `conversation-ticket API readback` across scripts, tests, specs, evidence, API/worker source and CI. Existing canonical M8 smoke already proves the runtime loop; the missing piece is a named operator entrypoint with preflight and clear dry-run/live boundaries. The new wrapper belongs under `packages/db/scripts` beside the canonical true DB smoke.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external call; the canonical smoke remains dry-run outbound and synthetic-only.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`.
- Read relevant v1.1 source-of-truth lines for Telegram Bot, worker, KB/persona, backend readback, GA-0 and acceptance boundaries.
- Read M8-01, M8-02 and M8-03 specs/evidence.
- Check `git branch --no-merged main` and `gh pr list --state open`.
- Confirm local secret names only, without printing values.
- Do not activate live Telegram send, real provider, real customer data or production deploy.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m8-04-internal-bot-loop-smoke` |
| branch | `codex/m8-04-internal-bot-loop-smoke` |
| base HEAD | `0597cb22208171c832d871f8079f649d6fe9dd84` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, open PR audit and no-merged branch audit |

## 并发派发证据

Single writer in one worktree. This spec touches only docs/evidence, one operator wrapper, one focused test and one package script. It does not touch DB schema, migrations, generated client, runtime source, CI, lockfile, production deploy or release gates.

## 事故与 closeout 记录

Known M8 incident before this PR:

- `docs/incidents/INC-2026-07-07-m8-01-root-patch-target.md`.

If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference incident evidence before continuing.

## 实施步骤

1. Add an operator-facing wrapper `packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs`.
2. Add a root script `smoke:m8-internal-bot-loop`.
3. Add focused tests for wrapper help, missing-env preflight, package script, canonical smoke reuse and boundary wording.
4. Add evidence with validation and explicit live-test blockers.
5. Run focused validation, pr-shape and diff checks.

## 通过条件

- `node packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs --help` prints the internal loop contract and exits 0.
- Missing `UZMAX_RLS_DATABASE_URL` or `UZMAX_REDIS_URL` fails before importing/running the DB smoke and does not print secret values.
- Root package script `smoke:m8-internal-bot-loop` points at the wrapper.
- Wrapper delegates to the canonical M8 active-answer true DB smoke instead of duplicating runtime logic.
- Existing CI true DB scope still runs the canonical M8 smoke when package/script paths change.
- Evidence states current status is internal dry-run smoke support, not live Telegram, not customer traffic, not customer LLM, not GA-0, not release.

## 失败分支

- If local env lacks RLS DB or Redis: record local true DB smoke blocked and rely on GitHub CI true DB smoke; do not fake pass.
- If canonical smoke fails in CI: keep M8-04 blocked and record the failing layer.
- If live Telegram network/token is required: stop and split a live internal test-bot activation spec.
- If real LLM/provider key or customer-data LLM processing is required: stop and split an owner-approved provider/eval-gated spec.
- If wrapper would duplicate runtime smoke logic: remove duplication and delegate to the canonical smoke.

## 不做什么

- No runtime source rewrite.
- No DB schema, migration, generated client, RLS policy or lockfile changes.
- No CI workflow redesign.
- No live Telegram token, `setWebhook`, real customer chat, customer data, production deploy, GA-0 or 1.0 release claim.
- No real provider SDK/key/cost-bearing LLM call.
- No admin UI redesign or prototype work.

## 验收映射

| Item | M8-04 status | Notes |
|---|---|---|
| C-01 | `internal_dry_run_loop_smoke_entry_supported_not_live_bot_closed` | Command exercises webhook -> queue -> worker -> DB/readback via canonical M8 smoke; live staging bot remains owner-gated. |
| H-01 | `active_kb_synthetic_runtime_smoke_supported_not_full_knowledge_ops_closed` | Synthetic active KB stage answers in true DB smoke; full knowledge authoring/publish remains separate. |
| G-03/K-02 | `persona_eval_gate_preserved_by_canonical_m8_smoke` | M8-03 canonical smoke keeps active AI member/eval gate/capability checks. |
| I-01 | `conversation_ticket_readback_smoke_supported` | Canonical M8 smoke reads worker-written conversations/messages/tickets through backend service. |
| L-01/J-05 | `not_ga0_not_release` | This is internal dry-run evidence only; no owner acceptance, GA-0 opening or production release. |

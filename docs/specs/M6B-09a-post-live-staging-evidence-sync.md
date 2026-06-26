# M6B-09a Post-live Staging Evidence Sync

Spec ID: M6B-09a
Tracking issue: Linear LAY-28
Status: `m6b_09a_post_live_staging_evidence_sync_ready_for_review_not_ga0`
Owner confirmation point: project owner review of the synchronized staging evidence and any later explicit decision for worker/cron live services, alert fire proof, deploy/rollback, restore, GA-0 or 1.0.
Timebox: 0.5 work day.

## Spec 类型

docs

## 目标

Synchronize the M6B evidence docs after the live staging API and Telegram test bot webhook hygiene work completed outside the earlier M6B-09 rollup.

This docs-only slice records these current facts without widening release scope:

- Durable staging API base is `https://uzmax-api-staging.onrender.com`.
- `GET /healthz` returns HTTP 200.
- `GET /readyz` returns HTTP 503 because `authz=not_configured` and `identity=not_configured`.
- `POST /telegram/bot/webhook` without the secret reaches the app and returns HTTP 401.
- Telegram `getWebhookInfo` for the test bot points to the Render staging webhook endpoint, has pending updates 0, allowed updates `message` and `callback_query`, and no last error.
- Linear LAY-22 and LAY-27 are Done within their scoped boundaries.
- Worker/cron live heartbeat, alert fire proof, full M6B-07 rollback, M6B-08 restore and GA-0/1.0 approval remain open/not pass.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide whether and when to provide worker/cron paid service creation, alert bot/chat, deploy/rollback target and drill window, safe restore target and snapshot, outbound test-account permission, real customer/order data, customer LLM/provider/cost/compliance risk, GA-0 and 1.0 approval inputs.

AI agent: read current repo evidence, Linear comments and safe live endpoint probes; update docs/evidence only; preserve release blockers; do not print or request token/secret values; do not mutate Telegram, Render, production, restore targets, customer data or Linear state.

## 时间盒

0.5 work day. If this sync requires runtime source, tests, config, lockfile, CI/guard, deployment, Telegram `setWebhook`, secret-valid webhook, outbound send, restore execution or Linear status mutation, stop and report instead of widening this docs-only slice.

## Source Links

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/specs/M6B-04-thin-staging-render-env.md`
- `docs/evidence/M6B/M6B-04-thin-staging-render-env.md`
- `docs/specs/M6B-09-ga0-runtime-evidence-rollup.md`
- `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`
- `docs/evidence/M6B/README.md`
- Linear LAY-22, LAY-27 and LAY-28 comments read by connector; no secret values copied.
- Safe live probes against `https://uzmax-api-staging.onrender.com`.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-09a-post-live-staging-evidence-sync.md`
  - `docs/evidence/M6B/M6B-09a-post-live-staging-evidence-sync.md`
  - `docs/evidence/M6B/README.md`
  - `docs/evidence/M6B/M6B-04-thin-staging-render-env.md`
  - `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`
- 说明/备注：
  - Docs-only evidence sync. No runtime source, tests, config, generated files, lockfile, CI/guard scripts, release gate code, deployment state, Telegram state or Linear status changes.

## 变更预算与路径分类

- Source budget: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- Docs: 2 new docs files and 3 existing M6B evidence docs updated.
- Source/test/generated/lock/config/CI/migration/runtime changes: none.
- New source `rg` conclusion: searched M6B evidence/specs for LAY-22, LAY-27, getWebhookInfo, staging URL, `/healthz`, `/readyz` and webhook wording. Existing docs/evidence paths are the right home; no source file is required.
- External API/SDK/provider/connector/adapter basis: none added. Safe HTTP probes are read-only evidence; Telegram facts come from Linear comments that already redacted token/secret values.
- Exceptions: none.

## 文档触发检查

updated

M6B-09a adds a docs-only evidence sync under the existing M6B evidence path. It does not introduce a new runtime, runbook, connector, release gate or production operation.

## 前置条件

- Read `AGENTS.md` and all four v1.1 source-of-truth docs.
- Read M6B-04, M6B-06a, M6B-06b and M6B-09 specs/evidence.
- Confirm assigned worktree and branch match this spec.
- Confirm root/main is clean and remains coordinator-only.
- Confirm open PR audit is clean if possible.
- Use only safe probes that do not require or reveal secret values.

## Worktree / branch 前置条件

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Applications/UZMAX智能运营-lay-28-evidence-sync` |
| assigned `git status --short --branch` before edits | `## codex/lay-28-evidence-sync...origin/main` |
| assigned branch | `codex/lay-28-evidence-sync` |
| assigned `HEAD` | `98416106be8bc881ad4ac8ce33f84f5d28eab2d1` |
| assigned `origin/main` | `98416106be8bc881ad4ac8ce33f84f5d28eab2d1` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before edits | `## main...origin/main` |
| root `git branch --no-merged main` before edits | no output |
| open PR audit before edits | GitHub API returned `[]`; `gh` was not available in PATH |

## 并发派发证据

Single worker in a dedicated physical worktree and branch. Touch list is docs-only and does not overlap runtime source, DB schema, lockfile, shared config, CI/guard scripts, generated artifacts or release/production gates.

## 事故与 closeout 记录

No incident expected for this docs-only sync. If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data risk, stop and create/reference an incident before continuing.

## 实施步骤

1. Add this M6B-09a spec.
2. Add `docs/evidence/M6B/M6B-09a-post-live-staging-evidence-sync.md`.
3. Update `docs/evidence/M6B/README.md` to include current post-live staging facts and remaining blockers.
4. Update M6B-04 evidence to distinguish repo wiring, live API/webhook carrier facts and remaining worker/cron/alert gaps.
5. Update M6B-09 rollup to point at this post-live sync while keeping GA-0 locked.
6. Run focused formatting and guard validation.

## 通过条件

- Diff stays inside the five allowed docs paths.
- M6B evidence records live `/healthz` and webhook route facts without claiming `/readyz` pass.
- Telegram `getWebhookInfo` facts are recorded as redacted Linear/control-plane evidence, not as a fresh local token call.
- LAY-22 and LAY-27 are listed as Done only within their scoped boundaries.
- Worker/cron heartbeat, alert fire proof, M6B-07 rollback, M6B-08 restore and GA-0/1.0 remain explicitly open/not pass.
- No token, webhook secret, DB URL, customer/order data, raw Telegram payload or outbound proof is added.

## 失败分支

- If a safe live probe fails, record the failing result and do not claim the corresponding pass.
- If Telegram control-plane facts require token access, rely only on existing redacted Linear evidence or leave the field unresolved.
- If validation requires source/config/CI/guard/lockfile changes, stop and report before widening.
- If wording implies production readiness, owner approval, P1/P2 acceptance, restore authorization, worker/cron closure, alert closure, GA-0 opening or 1.0 approval without evidence, correct it before closeout.

## 不做什么

- No runtime source, tests, DB schema, migrations, generated client, lockfile, package/config, CI/guard, release gate code or script changes.
- No Render/Vercel mutation, Telegram `setWebhook`, secret-valid webhook call, outbound Bot send, restore execution or Linear status update.
- No real customer/order data, raw Telegram payloads, screenshots, voice transcripts, prompts/completions, provider keys, DB URLs, Bot tokens or webhook secrets.
- No owner decision fabrication, P1/P2 downgrade, GA-0 opening or 1.0 release approval.

## 验证计划

- `git diff --check`
- Markdown Prettier check/write for changed docs files using bundled Node/pnpm if local npm is absent.
- `node scripts/guards/workspace-isolation.mjs`
- `node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/Applications/UZMAX智能运营-lay-28-evidence-sync --root /Users/atilla/Applications/UZMAX智能运营`
- `node scripts/guards/doc-trigger-paths.mjs`
- `node scripts/guards/eval-trigger-paths.mjs --base origin/main`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-09a-post-live-staging-evidence-sync.md --include-worktree`
- `git diff --name-status origin/main`

## 验收映射

- J-01: API live health exists; full api/worker/cron/admin rollback remains open.
- J-02: LAY-22 code/CI queue-worker path is Done within boundary; live worker/cron heartbeat and alert fire proof remain open.
- J-03: restore remains blocked by missing safe target/snapshot/authorization.
- J-04: live webhook route now reaches app and fails closed without secret; full operational drill remains open.
- J-05: evidence posture is synchronized; this is not release approval.
- K-03/K-04: one spec / one branch / one worktree, docs-only touch list.
- L-01: GA-0 remains locked because checklist is not green and owner approval is not recorded.
- L-02: real Bot webhook hygiene is improved; outbound and live leave-ticket drill remain not approved/not proven.

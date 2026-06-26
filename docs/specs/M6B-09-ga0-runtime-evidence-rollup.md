# M6B-09 GA-0 Runtime Evidence Rollup

Spec ID: M6B-09
Tracking issue: Linear LAY-25
Status: `m6b_09_runtime_evidence_rollup_recorded_no_go_blocked_owner_inputs_missing_not_ga0`
Owner confirmation point: project owner review of this GA-0 runtime evidence package and any later explicit decision to provide staging, Telegram, rollback, restore, alert, outbound, real-data, cost/compliance or GA-0 approval inputs.
Timebox: 0.5 work day.

## Spec 类型

docs

## 目标

Create the GA-0 runtime evidence rollup and go/no-go package for the current M6B state.

M6B-09 must aggregate only existing M6B evidence and must preserve these boundaries:

- M6B-01, M6B-02, M6B-03, M6B-05a and M6B-05b have runnable/local/CI evidence and count only within their recorded boundaries.
- M6B-04, M6B-06, M6B-07 and M6B-08 are not pass. They are explicitly blocked by missing owner-gated staging, Telegram, rollback and restore inputs.
- Synthetic, in-memory or doc-only proof cannot be reclassified as staging, production or true DB proof.
- GA-0 remains No-Go unless the checklist is green and the project owner explicitly opens it. Current repo evidence has neither.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide whether and when to provide owner-gated inputs for staging infrastructure, real Telegram test bot credentials, webhook registration authorization, outbound test-account permission, deploy/rollback targets, safe restore target and snapshot, alert bot credentials, real customer/order data, customer LLM/provider/cost/compliance risk and any GA-0 open decision.

AI agent: read the current M6B evidence, create the rollup spec/evidence, update the M6B evidence index, distinguish runnable local/CI evidence from owner-gated blockers, and recommend No-Go or continued lock if checklist conditions are not green. AI agents must not invent owner decisions, downgrade blockers to P1/P2, call staging/production services, configure Telegram webhooks or approve GA-0/1.0.

## 时间盒

0.5 work day. If the rollup requires runtime implementation, staging/prod access, Telegram credentials, deploy/rollback execution, restore execution, DB schema/migration/generated changes, CI/guard changes, lockfile changes or source changes, stop and report instead of widening this docs-only slice.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/evidence/README.md`
- `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`
- `docs/evidence/M6B/README.md`
- `docs/specs/M6B-01-api-production-artifact.md`
- `docs/evidence/M6B/M6B-01-api-production-artifact.md`
- `docs/specs/M6B-02-worker-service-shell.md`
- `docs/evidence/M6B/M6B-02-worker-service-shell.md`
- `docs/specs/M6B-03-cron-service-shell.md`
- `docs/evidence/M6B/M6B-03-cron-service-shell.md`
- `docs/specs/M6B-05a-conversation-runtime-build.md`
- `docs/evidence/M6B/M6B-05a-conversation-runtime-build.md`
- `docs/specs/M6B-05b-equivalent-bot-webhook-drive.md`
- `docs/evidence/M6B/M6B-05b-equivalent-bot-webhook-drive.md`
- `docs/evidence/M6/M6-09-final-acceptance-rollup.md`
- `docs/release.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-09-ga0-runtime-evidence-rollup.md`
  - `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`
  - `docs/evidence/M6B/README.md`
  - `docs/release.md`
- 说明/备注：
  - Docs-only rollup. May read current M6B specs/evidence, M6 final acceptance rollup, release boundary and v1.1 acceptance matrix.
  - `docs/release.md` is touched only to replace stale M6-era worker/cron placeholder wording with the current M6B runtime rollup boundary.
  - Do not modify runtime source, DB schema/migrations/generated files, lockfile, CI/guard scripts, release gates or owner-gated infrastructure.

## 变更预算与路径分类

- Source budget: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- Docs: 2 new docs files, 1 M6B evidence index update and 1 release boundary wording sync.
- Source/test/generated/lock/config/CI/migration/runtime changes: none.
- New source `rg` conclusion: searched existing M6B specs/evidence and README for `M6B-04`, `M6B-06`, `M6B-07`, `M6B-08`, `M6B-09`, `M6B-05a branch`, `owner_review_pending`, `M0 deployment placeholder` and rollup/status wording. No source file is required; stale current-state wording belongs in the M6B evidence index and release boundary docs only.
- External API/SDK/provider/connector/adapter basis: none added. This PR does not call or configure external services.
- Exceptions: none.

## 文档触发检查

updated

M6B-09 adds a docs-only evidence rollup under the existing M6B evidence path and updates the M6B evidence index. It does not introduce a new runtime, runbook, external integration or release gate document.

## 前置条件

- Read `AGENTS.md`, `docs/specs/M6B-00-ga0-runtime-bring-up-contract.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6/M6-09-final-acceptance-rollup.md`, `docs/release.md` and `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`.
- Read existing M6B specs/evidence for M6B-01, M6B-02, M6B-03, M6B-05a and M6B-05b.
- Confirm no existing M6B-04, M6B-06, M6B-07 or M6B-08 pass evidence exists.
- Confirm M6B-05a and M6B-05b are already merged on current `main` / `origin/main`.
- Confirm `docs/release.md` is synced only where its current release boundary contradicts this rollup.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-09-runtime-rollup` |
| branch | `codex/m6b-09-runtime-rollup` |
| base | `81fdc6480914795a9737cdf8c16d4c0daa50d1e9` / `origin/main` |
| forbidden checkout | root/main `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker HEAD, worker origin/main |

Pre-edit evidence recorded before this spec was created:

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-09-runtime-rollup` |
| assigned `git status --short --branch` before edits | `## codex/m6b-09-runtime-rollup...origin/main` |
| assigned branch | `codex/m6b-09-runtime-rollup` |
| assigned `HEAD` | `81fdc6480914795a9737cdf8c16d4c0daa50d1e9` |
| assigned `origin/main` | `81fdc6480914795a9737cdf8c16d4c0daa50d1e9` |

## 并发派发证据

Single M6B-09 worker in a dedicated physical worktree and branch. Touch list is limited to M6B docs/evidence. This slice does not touch global serial DB schema/migrations/RLS/generated, lockfile, shared config, CI/guard scripts, release/production gates, runtime source or external service state.

## 事故与 closeout 记录

No incident is expected for this docs-only rollup. If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path or includes secret/customer-data boundary risk, stop and create/reference an incident before continuing.

## 实施步骤

1. Create this M6B-09 spec with required governance fields and touch list.
2. Create `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md` with the evidence manifest and rollup tables.
3. Update `docs/evidence/M6B/README.md` so the slice index reflects current merged/pass/blocker status and no longer says M6B-05a is a branch or owner-review-pending item.
4. Update `docs/release.md` only to remove stale worker/cron placeholder statements and add the M6B runtime rollup boundary.
5. Run focused Markdown formatting and repo guard validation.
6. Record validation results and remaining blockers in the final response.

## 通过条件

- M6B-09 evidence records only current source files and existing M6B evidence.
- M6B-01/02/03/05a/05b evidence is counted only within its recorded runnable/local/CI boundary.
- M6B-04/06/07/08 are explicitly listed as blocked/no-go blockers, not pass.
- GA-0 recommendation is No-Go or continued lock unless every checklist item is green and owner explicit approval exists.
- `docs/release.md` no longer contradicts current M6B API/worker/cron artifact facts.
- Evidence does not fabricate staging/prod/true DB proof, owner input, P1/P2 downgrade, GA-0 approval or 1.0 release approval.
- Diff stays inside the four allowed docs paths.

## 失败分支

- If a required pass depends on owner-gated staging/Telegram/rollback/restore input that is absent, record the exact blocker and keep GA-0 No-Go.
- If current evidence contradicts prior M6/M6B status, record the contradiction and do not resolve it by inventing runtime proof.
- If validation requires source/config/CI/guard/lockfile changes, stop and report before widening.
- If wording implies production readiness, owner approval, P1/P2 risk acceptance, real customer/order data approval, customer LLM/provider approval, staging proof, true DB proof or GA-0 opening without evidence, correct it before closeout.

## 不做什么

- No runtime source, tests, DB schema, migrations, generated client, lockfile, package/config, CI/guard, release gate code, app/admin/API/worker/cron/script changes.
- No staging/production/Render/Vercel/Telegram/setWebhook/restore calls or configuration.
- No real customer/order data, raw Telegram payloads, screenshots, voice transcripts, prompts/completions, provider keys, DB URLs, Bot tokens or webhook secrets.
- No owner decision fabrication, P1/P2 downgrade, GA-0 opening or 1.0 release approval.

## 验证计划

- `git diff --check`
- Markdown Prettier check for changed docs files, using bundled Node and root `node_modules` only if this isolated worktree lacks local dependencies.
- `node scripts/guards/workspace-isolation.mjs`
- `node scripts/guards/worker-write-boundary.mjs --assigned <assigned worktree> --root /Users/atilla/Applications/UZMAX智能运营`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-09-ga0-runtime-evidence-rollup.md --include-worktree` while this local slice is uncommitted
- `node scripts/guards/doc-trigger-paths.mjs`
- `node scripts/guards/eval-trigger-paths.mjs --base origin/main`
- `git diff --name-status origin/main`

## 验收映射

- J-01: M6B-01 API artifact, M6B-02 worker artifact and M6B-03 cron artifact have local runnable proof; real deploy/rollback remains M6B-04/M6B-07 blocked.
- J-02: M6B-02 proves BullMQ jobId dedupe and M6B-05a/05b prove Bot runtime/dedupe within local/CI boundaries; production alerting and real staging queue remain blocked.
- J-03: backup/restore remains blocked by missing owner safe restore target and snapshot.
- J-04: local/CI operational evidence exists, but owner-gated staging drills remain open.
- J-05: this rollup records evidence posture; it is not owner release approval.
- K-03/K-04: one spec / one branch / one worktree, docs-only touch list.
- L-01: GA-0 remains locked because checklist is not green and owner has not opened it.
- L-02: real Bot leave-ticket path remains blocked pending M6B-06 owner-gated staging Telegram evidence.

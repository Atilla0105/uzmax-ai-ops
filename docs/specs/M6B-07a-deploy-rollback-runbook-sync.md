# M6B-07a Deploy Rollback Runbook Sync

Spec ID: M6B-07a
Tracking issue: Linear LAY-26
Related blocker: LAY-23 / M6B-07 deploy rollback drill
Status: `m6b_07a_deploy_rollback_runbook_sync_ready_for_review_not_j01_pass`
Owner confirmation point: project owner review of this docs-only runbook sync and any later explicit decision to provide owner-approved staging/equivalent deploy rollback targets and A-to-B-to-A drill evidence.
Timebox: 0.25 work day.

## Spec 类型

docs

## 目标

Synchronize `docs/runbooks/deploy-rollback.md` with current `main` after M6B-01, M6B-02 and M6B-03 replaced API/worker/cron placeholder starts with emitted-artifact starts.

This spec must preserve the release blocker boundary:

- API, worker and cron package `start` scripts now boot emitted artifacts.
- Local artifact proof from M6B-01/02/03 is not real Render/Vercel deploy or rollback proof.
- J-01 / M6B-07 remains blocked until the owner provides staging/equivalent deploy rollback targets and A-to-B-to-A evidence for api, worker, cron and admin.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: decide whether and when to provide staging or equivalent deploy/rollback targets, platform access, approved drill window, env/secret placement, cost/risk approvals, real customer/order-data permissions, GA-0 open approval and 1.0 release decisions.

AI agent: read current repo evidence, create this docs-only spec, update the deploy/rollback runbook wording, optionally add traceability evidence, run the required docs/guard validation and keep all staging, production, Telegram, secret, customer/order data, GA-0 and P1/P2 decisions out of scope.

## 时间盒

0.25 work day. If this sync requires runtime source/config/package/lock/CI/guard changes, external platform calls, deploy/rollback execution, setWebhook, secret access or customer/order data, stop and report instead of widening this docs-only slice.

## Source Links

- `AGENTS.md`
- `docs/specs/README.md`
- `docs/runbooks/deploy-rollback.md`
- `docs/evidence/M6B/README.md`
- `docs/evidence/M6B/M6B-02-worker-service-shell.md`
- `docs/evidence/M6B/M6B-03-cron-service-shell.md`
- `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`
- `docs/release.md`
- `apps/api/package.json`
- `apps/worker/package.json`
- `apps/cron/package.json`
- `docs/incidents/README.md`

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6B-07a-deploy-rollback-runbook-sync.md`
  - `docs/runbooks/deploy-rollback.md`
  - `docs/evidence/M6B/README.md`
  - `docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md`
  - `docs/incidents/INC-2026-06-26-m6b-07a-root-worktree-write.md`
- 说明/备注：
  - Docs-only sync for stale deploy/rollback runbook wording.
  - `docs/evidence/M6B/README.md` is touched only to index this traceability evidence.
  - The incident file is required because this slice hit the `docs/incidents/README.md` threshold for a root/main write outside the assigned worktree.
  - Do not modify runtime source, tests, app package files, lockfiles, CI/guard scripts, generated artifacts, DB schema/migrations, release gate code or external service state.

## 变更预算与路径分类

- Source budget: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- Docs: 1 new spec, 1 runbook wording sync, 1 M6B evidence index update, 1 new traceability evidence file and 1 incident record.
- Source/test/generated/lock/config/CI/migration/runtime changes: none.
- New source `rg` conclusion: searched `docs/runbooks/deploy-rollback.md`, `docs/evidence/M6B/README.md`, `docs/release.md`, `docs/incidents`, M6B specs/evidence and app package manifests for `M0 deployment placeholder`, `placeholder`, `worker`, `cron`, `M6B-07`, `LAY-23`, `root worktree write` and `rollback`. No source file is required; this slice corrects stale docs-only current-state wording and records a docs-only workspace incident.
- External API/SDK/provider/connector/adapter basis: none added. This PR does not call or configure external services.
- Exceptions: none.

## 文档触发检查

updated

This slice updates an existing runbook and adds a spec/evidence record for traceability. It does not introduce a new runtime, new platform integration, new release gate or new operational procedure beyond the existing deploy/rollback runbook boundary.

## 前置条件

- Read the source links listed above.
- Confirm `apps/api/package.json` `start` is `node dist/apps/api/src/main.js`.
- Confirm `apps/worker/package.json` `start` is `node dist/apps/worker/src/main.js`.
- Confirm `apps/cron/package.json` `start` is `node dist/apps/cron/src/main.js`.
- Confirm M6B-02 and M6B-03 evidence record local emitted-artifact worker/cron starts.
- Confirm M6B-09 and `docs/release.md` keep M6B-07 blocked pending owner-approved deploy/rollback targets and A-to-B-to-A evidence.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-07a-deploy-rollback-runbook-sync` |
| branch | `codex/m6b-07a-deploy-rollback-runbook-sync` |
| base | `b2ca2defe61dac1abe22520eb06e9a33b313dcfb` / `origin/main` |
| forbidden checkout | root/main `/Users/atilla/Applications/UZMAX智能运营` for writing |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, worker HEAD, worker origin/main |

Pre-edit evidence recorded before this spec was created:

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-07a-deploy-rollback-runbook-sync` |
| assigned `git status --short --branch` before edits | `## codex/m6b-07a-deploy-rollback-runbook-sync...origin/main` |
| assigned branch | `codex/m6b-07a-deploy-rollback-runbook-sync` |
| assigned `HEAD` | `b2ca2defe61dac1abe22520eb06e9a33b313dcfb` |
| assigned `origin/main` | `b2ca2defe61dac1abe22520eb06e9a33b313dcfb` |

## 并发派发证据

Single LAY-26 worker in a dedicated physical worktree and branch. Touch list is docs-only. This slice does not touch global serial DB schema/migrations/RLS/generated files, lockfiles, shared config, CI/guard scripts, release/production gates, runtime source or external service state.

## 事故与 closeout 记录

Boundary event recorded during this slice: the first patch application targeted root/main instead of the assigned worktree. Affected paths were the same four docs-only paths listed in this spec: this spec, this evidence file, `docs/runbooks/deploy-rollback.md` and `docs/evidence/M6B/README.md`. No runtime source, config, package, lockfile, CI/guard, secret, customer/order data, platform call, deploy, rollback or Telegram mutation occurred.

Cleanup performed before validation: extracted the exact patch, applied it to the assigned worktree, reversed the same patch from root/main, and confirmed root/main `git status --short --branch` returned `## main...origin/main`.

This reaches the workspace write-boundary incident threshold. `docs/incidents/INC-2026-06-26-m6b-07a-root-worktree-write.md` records the incident, cleanup, unknowns and permanent controls. The LAY-26 allowlist includes that exact file so the incident is not hidden in chat or PR comments.

If any further write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path or includes secret/customer-data boundary risk, stop and create/reference an incident before continuing.

## 实施步骤

1. Create this M6B-07a docs-only spec with required governance fields and start evidence.
2. Update `docs/runbooks/deploy-rollback.md` to replace stale worker/cron current-state blocker wording with current emitted-artifact start facts.
3. Preserve J-01 / M6B-07 as blocked pending owner-approved staging/equivalent targets and A-to-B-to-A deploy rollback evidence.
4. Add minimal M6B evidence traceability and index it from `docs/evidence/M6B/README.md`.
5. Add the required incident record for the root/main write-boundary event.
6. Run required Markdown and guard validation.
7. Return changed files, validation results, risks and final status without pushing.

## 通过条件

- `docs/runbooks/deploy-rollback.md` no longer says current worker or cron `start` is an M0 deployment placeholder.
- Runbook reflects that API, worker and cron current `start` scripts boot emitted artifacts.
- Runbook keeps local artifact proof separate from real Render/Vercel deploy/rollback proof.
- J-01 / M6B-07 remains explicitly blocked until owner-approved staging/equivalent targets and A-to-B-to-A evidence exist.
- Diff stays inside the allowed docs paths.
- The root/main write-boundary event is recorded in a formal incident file.
- No runtime source/config/package/lock/CI/guard/external platform mutation occurs.

## 失败分支

- If current package scripts still show placeholder starts, record the exact package blocker and do not claim emitted-artifact readiness.
- If current runbook wording cannot be corrected without changing runtime/config/package files, stop and report the required follow-up spec.
- If owner-approved staging/equivalent targets or A-to-B-to-A evidence are absent, keep J-01 / M6B-07 blocked and do not substitute local artifact proof.
- If validation requires source/config/CI/guard/lockfile changes, stop and report before widening.

## 不做什么

- No runtime source, tests, DB schema, migrations, generated client, lockfile, package/config, CI/guard, release gate code, app/admin/API/worker/cron/script changes.
- No staging/production/Render/Vercel/Telegram/setWebhook/restore calls or configuration.
- No deploy/rollback execution.
- No real customer/order data, raw Telegram payloads, screenshots, voice transcripts, prompts/completions, provider keys, DB URLs, Bot tokens or webhook secrets.
- No owner decision fabrication, P1/P2 downgrade, GA-0 opening or 1.0 release approval.

## 验证计划

- `git diff --check`
- Markdown Prettier check for changed Markdown files, using bundled Node and root `node_modules` only if this isolated worktree lacks local dependencies.
- `node scripts/guards/workspace-isolation.mjs`
- `node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-07a-deploy-rollback-runbook-sync --root /Users/atilla/Applications/UZMAX智能运营`
- `node scripts/guards/doc-trigger-paths.mjs`
- `node scripts/guards/eval-trigger-paths.mjs --base origin/main`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-07a-deploy-rollback-runbook-sync.md --include-worktree`
- `node scripts/guards/forbidden-terms.mjs`
- `rg -n "M0 deployment placeholder" docs/runbooks/deploy-rollback.md`
- root/main `git status --short --branch`

## PR Hygiene Fields

| Category | Expected diff |
|---|---|
| Docs | `docs/specs/M6B-07a-deploy-rollback-runbook-sync.md`, `docs/runbooks/deploy-rollback.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md`, `docs/incidents/INC-2026-06-26-m6b-07a-root-worktree-write.md` |
| Source | none |
| Test support | none |
| Config/CI/package/lock/generated/migration/schema/runtime changes | none |
| Changed source files | 0 |
| New source files | 0 |
| Net source LOC | 0 |
| Test weakening | none; no test deletion, `.skip`, `.only`, `xit` or `xfail` |
| External dependency | none |
| Exceptions | none |

## 验收映射

- J-01: current local API/worker/cron artifact starts are accurately documented, but J-01 real deploy/rollback remains blocked pending owner-approved targets and A-to-B-to-A evidence.
- J-04: deploy/rollback runbook current-state accuracy improves incident drill readiness without executing a drill.
- K-03/K-04: one spec, one branch, one worktree and docs-only touch list.
- L-01: GA-0 remains locked because real deploy/rollback evidence and owner approval are absent.

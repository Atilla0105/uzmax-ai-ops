# M6B-07a Deploy Rollback Runbook Sync Evidence

> evidence_id: M6B-07a-deploy-rollback-runbook-sync
> milestone: M6B
> acceptance_items: J-01, J-04, K-03, K-04, L-01
> owner: project owner owns staging/equivalent deploy rollback targets, platform access, env/secret placement, approved drill window, real customer/order data, GA-0, P1/P2 decisions and 1.0 release; AI agents own docs sync, review and evidence honesty
> status: ready_for_review_not_j01_pass
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M6B-07a-deploy-rollback-runbook-sync.md`, `docs/runbooks/deploy-rollback.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-02-worker-service-shell.md`, `docs/evidence/M6B/M6B-03-cron-service-shell.md`, `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`, `docs/release.md`, `docs/incidents/README.md`, `docs/incidents/INC-2026-06-26-m6b-07a-root-worktree-write.md`, `apps/api/package.json`, `apps/worker/package.json`, `apps/cron/package.json`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets, DB URLs, staging URLs or platform secrets
> review_notes: M6B-07a syncs the deploy rollback runbook to current emitted-artifact start facts while keeping M6B-07/J-01 real deploy rollback blocked pending owner-approved targets and A-to-B-to-A evidence
> signoff: pending owner review of this docs-only PR; no owner GA-0 approval recorded

## Summary

M6B-07a updates the deploy/rollback runbook after current `main` moved API, worker and cron starts to emitted artifacts.

Current status:

`m6b_07a_deploy_rollback_runbook_sync_ready_for_review_not_j01_pass`

This is docs-only. It does not approve staging, production, real deploy/rollback execution, real customer/order data, Telegram mutation, GA-0 or 1.0 release.

## Start Audit

Recorded at M6B-07a entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| Linear tracking | LAY-26 `M6B-07a deploy rollback runbook sync` |
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-07a-deploy-rollback-runbook-sync` |
| assigned `git status --short --branch` before edits | `## codex/m6b-07a-deploy-rollback-runbook-sync...origin/main` |
| assigned branch | `codex/m6b-07a-deploy-rollback-runbook-sync` |
| assigned `HEAD` | `b2ca2defe61dac1abe22520eb06e9a33b313dcfb` |
| assigned `origin/main` | `b2ca2defe61dac1abe22520eb06e9a33b313dcfb` |
| assigned path isolation | linked worktree git dir under `/Users/atilla/Applications/UZMAX智能运营/.git/worktrees/codex-m6b-07a-deploy-rollback-runbook-sync`; no superproject path |

## Boundary Event

The first patch application targeted root/main instead of the assigned worktree. Impact was limited to the same four docs-only files in this slice: this spec, this evidence file, `docs/runbooks/deploy-rollback.md` and `docs/evidence/M6B/README.md`.

Cleanup:

- extracted the exact patch from root/main;
- applied it to the assigned worktree;
- reversed the same patch from root/main;
- confirmed root/main `git status --short --branch` returned `## main...origin/main` after cleanup.

Formal incident record: `docs/incidents/INC-2026-06-26-m6b-07a-root-worktree-write.md`.

## Current Start Facts

| Surface | Current package fact | Evidence boundary |
|---|---|---|
| api | `apps/api/package.json` `start` is `node dist/apps/api/src/main.js`. | M6B-01 local artifact/health proof only; not real staging deploy/rollback. |
| worker | `apps/worker/package.json` `start` is `node dist/apps/worker/src/main.js`. | M6B-02 local Redis worker artifact proof only; not real staging deploy/rollback. |
| cron | `apps/cron/package.json` `start` is `node dist/apps/cron/src/main.js`. | M6B-03 local file-backed cron artifact proof only; not real staging deploy/rollback. |
| admin | Vercel rollback strategy remains owner/platform pending. | No real Vercel rollback evidence recorded by this slice. |

## Change Summary

| File | Change |
|---|---|
| `docs/runbooks/deploy-rollback.md` | Replaces stale worker/cron current-state blocker wording with emitted-artifact start facts and keeps real M6B-07 A-to-B-to-A rollback evidence blocked. |
| `docs/evidence/M6B/README.md` | Adds M6B-07a traceability row without changing M6B-07 blocker status. |
| `docs/specs/M6B-07a-deploy-rollback-runbook-sync.md` | Records docs-only scope, owner/AI boundary, touch list, budget, start evidence and validation plan. |
| `docs/incidents/INC-2026-06-26-m6b-07a-root-worktree-write.md` | Records the root/main write-boundary event required by `docs/incidents/README.md`. |

## Boundary

M6B-07a does not close J-01. M6B-07 remains:

`blocked_owner_gated_staging_rollback_inputs_missing_no_pass`

Minimum evidence still required before J-01 can close:

- owner-approved staging or equivalent deploy/rollback targets;
- A-to-B-to-A version trace for api, worker, cron and admin;
- health/heartbeat recovery evidence;
- worker queue safety evidence showing no job loss or duplication;
- admin release gate remains locked unless a later owner-approved gate opens it;
- sanitized evidence with no secrets, real customer/order data or platform-sensitive values.

## PR Hygiene

| Category | Current diff |
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

## Validation

Recorded on 2026-06-26 from the assigned worktree.

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors in tracked diff. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH pnpm dlx prettier@3.8.4 --check docs/specs/M6B-07a-deploy-rollback-runbook-sync.md docs/runbooks/deploy-rollback.md docs/evidence/M6B/README.md docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md docs/incidents/INC-2026-06-26-m6b-07a-root-worktree-write.md` | pass | All matched files use Prettier code style. Used bundled pnpm/Node, not root checkout node_modules. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/workspace-isolation.mjs` | pass | Linked worktree on `codex/m6b-07a-deploy-rollback-runbook-sync`; dirty allowed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-07a-deploy-rollback-runbook-sync --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed after root/main cleanup. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-07a-deploy-rollback-runbook-sync.md --include-worktree` | pass | Reports 5 changed docs files, 0 source files, 0 net source LOC and 0 new source files. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `if rg -n "M0 deployment placeholder" docs/runbooks/deploy-rollback.md; then exit 1; else echo "no stale M0 deployment placeholder in docs/runbooks/deploy-rollback.md"; fi` | pass | No stale M0 deployment placeholder phrase remains in the deploy rollback runbook. |
| root/main `git status --short --branch` after cleanup | pass | `## main...origin/main`. |

## Not Approved

- J-01 real deploy/rollback closure;
- M6B-07 pass;
- staging or production deployment;
- Render/Vercel mutation;
- Telegram setWebhook or outbound send;
- backup/restore execution;
- real customer/order data;
- customer LLM/provider calls;
- P1/P2 downgrade or risk acceptance;
- GA-0 opening or 1.0 release.

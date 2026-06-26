# M6B-09a Post-live Staging Evidence Sync

> evidence_id: M6B-09a-post-live-staging-evidence-sync
> milestone: M6B
> spec: `docs/specs/M6B-09a-post-live-staging-evidence-sync.md`
> acceptance_items: J-01, J-02, J-03, J-04, J-05, K-03, K-04, L-01, L-02
> owner: project owner owns worker/cron paid service creation, alert fire proof, deploy/rollback targets, safe restore target and snapshot, outbound test-account permission, real customer/order data, customer LLM/provider/cost/compliance, P1/P2 handling, GA-0 and 1.0 decisions; AI agents own docs sync, review and evidence honesty
> status: ready_for_review_post_live_staging_evidence_synced_not_ga0
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, four v1.1 source-of-truth docs, `docs/specs/M6B-09a-post-live-staging-evidence-sync.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-04-thin-staging-render-env.md`, `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md`, Linear LAY-22/LAY-27/LAY-28 redacted comments, safe live HTTP probes
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, raw Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens, webhook secrets, DB URLs, restore target secrets or platform secrets
> review_notes: This sync updates repo evidence after live Render staging API and Telegram test bot webhook hygiene evidence landed in Linear; it preserves `/readyz`, worker/cron, alert, rollback, restore and GA-0 blockers
> signoff: pending coordinator/owner review; no owner GA-0 approval recorded

## Summary

M6B-09a synchronizes the repo evidence layer with the post-live staging facts recorded after the earlier M6B-09 rollup.

Current status:

`m6b_09a_post_live_staging_evidence_sync_ready_for_review_not_ga0`

This is docs-only. It does not approve production, real customer/order data, customer LLM/provider calls, outbound Bot sends, restore execution, GA-0 or 1.0 release.

## Start Audit

Recorded before edits on 2026-06-26.

| Fact | Evidence |
|---|---|
| Linear tracking | LAY-28 `M6B-09a: Post-live staging evidence sync` |
| assigned worktree `pwd` | `/Users/atilla/Applications/UZMAX智能运营-lay-28-evidence-sync` |
| assigned `git status --short --branch` before edits | `## codex/lay-28-evidence-sync...origin/main` |
| assigned branch | `codex/lay-28-evidence-sync` |
| assigned `HEAD` | `98416106be8bc881ad4ac8ce33f84f5d28eab2d1` |
| assigned `origin/main` | `98416106be8bc881ad4ac8ce33f84f5d28eab2d1` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before edits | `## main...origin/main` |
| root/main `git branch --no-merged main` before edits | no output |
| open PR audit before edits | GitHub API returned `[]`; `gh` was not available in PATH |

## Current Live Staging Facts

| Surface | Current evidence | Boundary |
|---|---|---|
| Durable API base | `https://uzmax-api-staging.onrender.com` | Staging API web service only; not production. |
| API health | Safe live probe `GET /healthz` returned HTTP 200 with `service=api`, `status=ok`. | Health only; not readiness or GA-0. |
| API readiness | Safe live probe `GET /readyz` returned HTTP 503 with `authz=not_configured` and `identity=not_configured`. | Remains not pass. |
| Webhook route fail-closed | Safe live probe `POST /telegram/bot/webhook` without secret returned HTTP 401 `telegram secret token mismatch`. | Proves the route reaches the app and rejects missing secret; no secret-valid call was made by this docs sync. |
| Telegram test bot webhook | Linear LAY-27/28 redacted evidence records `getWebhookInfo` URL as `https://uzmax-api-staging.onrender.com/telegram/bot/webhook`, pending updates 0, allowed updates `message` and `callback_query`, and no last error. | Recorded from existing control-plane evidence; this worker did not call Telegram with a token. |
| LAY-22 | Linear LAY-22 records Done for scoped M6B-06 closure: PR #147/#148 merged and CI run `28250801530` passed the synthetic webhook -> Redis -> worker -> DB/RLS smoke. | No outbound send, no production, no customer/order data. |
| LAY-27 | Linear LAY-27 records Done for test bot webhook hygiene on the durable Render staging endpoint. | Test bot only; no production, no outbound send, no real customer traffic. |

## Still Open / Not Pass

| Area | Current posture | Why it remains open |
|---|---|---|
| `/readyz` | `not_ready` | `authz=not_configured` and `identity=not_configured`. |
| Live worker heartbeat | `no_live_heartbeat_proof` | Render worker paid service was not created; no live heartbeat evidence recorded. |
| Live cron heartbeat | `no_live_heartbeat_proof` | Render cron paid service was not created; no live heartbeat evidence recorded. |
| Alert fire proof | `no_alert_fire_proof` | No ops alert bot/chat fire evidence recorded. |
| M6B-07 rollback | `blocked_no_pass` | No api/worker/cron/admin A-to-B-to-A version trace and recovery evidence. |
| M6B-08 restore | `blocked_no_pass` | No owner-approved safe restore target, backup snapshot or restore authorization/evidence. |
| GA-0 | `locked_not_approved` | Checklist is not green and no owner explicit approval is recorded. |
| 1.0 release | `blocked_p0_gaps_open` | v1.1 acceptance matrix P0 evidence is not complete. |

## Evidence Red Line Review

Accepted within boundary:

- HTTP status/body from safe live probes that do not require secrets.
- Redacted Linear comments for Telegram `getWebhookInfo`, LAY-22 Done and LAY-27 Done facts.
- Git history showing M6B-06a at `8316829`, M6B-06b at `2342d43` and current base `9841610`.

Not accepted as pass evidence:

- `/healthz` 200 as `/readyz` pass.
- Missing-secret HTTP 401 as secret-valid delivery or outbound proof.
- Telegram `getWebhookInfo` as worker/cron heartbeat, alert fire, rollback, restore, GA-0 or 1.0 approval.
- CI true DB/RLS smoke as live Render worker/cron heartbeat.

## PR Hygiene

| Category | Current diff |
|---|---|
| Docs | `docs/specs/M6B-09a-post-live-staging-evidence-sync.md`, `docs/evidence/M6B/M6B-09a-post-live-staging-evidence-sync.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-04-thin-staging-render-env.md`, `docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md` |
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
| Safe live `GET /healthz` probe | pass | HTTP 200; body `{"service":"api","status":"ok"}`. |
| Safe live `GET /readyz` probe | expected fail-closed | HTTP 503; body includes `authz=not_configured` and `identity=not_configured`. |
| Safe live missing-secret webhook POST | pass | HTTP 401 `telegram secret token mismatch`; no token/secret value used. |
| `git diff --check` | pass | No whitespace errors in tracked diff. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH pnpm dlx prettier@3.8.4 --check docs/specs/M6B-09a-post-live-staging-evidence-sync.md docs/evidence/M6B/M6B-09a-post-live-staging-evidence-sync.md docs/evidence/M6B/README.md docs/evidence/M6B/M6B-04-thin-staging-render-env.md docs/evidence/M6B/M6B-09-ga0-runtime-evidence-rollup.md` | pass | All matched files use Prettier code style; bundled pnpm/Node used because local npm and local `node_modules` are absent. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/workspace-isolation.mjs` | pass | Linked worker worktree on `codex/lay-28-evidence-sync`; dirty allowed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/Applications/UZMAX智能运营-lay-28-evidence-sync --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/eval-trigger-paths.mjs --base origin/main` | pass | `no eval-triggering paths changed`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6B-09a-post-live-staging-evidence-sync.md --include-worktree` | pass | Reports 5 changed docs files, 0 changed source files, 0 net source LOC and 0 new source files. |
| `git status --short --branch` | pass | Only the five allowed docs paths are modified/untracked. |

## Boundaries

M6B-09a does not approve:

- `/readyz` pass;
- live worker/cron heartbeat closure;
- alert fire proof;
- M6B-07 deploy/rollback closure;
- M6B-08 restore closure;
- staging outbound Bot send;
- production deployment;
- real customer/order data;
- customer LLM/provider calls;
- P1/P2 downgrade or risk acceptance;
- GA-0 opening or 1.0 release.

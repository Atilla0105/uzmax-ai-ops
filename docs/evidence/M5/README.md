# M5 Evidence

M5 evidence tracks the operations loop milestone: distill health guardrails, confirmation queue, AI member console, analytics center, log center and template center.

M5 should let owner/operators process candidate changes quickly, see distill health/downshift alerts, control AI member state, and review logs/analytics/templates, without implying release approval.

Current readiness spec: `docs/specs/M5-00-operations-loop-readiness-pack.md`.

M5 current status: `m5_readiness_opened__not_accepted`. This means M5 entrypoint docs and planned slice queue are opened for follow-up specs. It does not approve the items listed in the Boundary section.

M4 prior state: `owner_accepted_m4_milestone_evidence`. Project owner accepted M4 milestone evidence on 2026-06-24. M4 acceptance does not approve production, GA-0, real customer traffic, customer LLM, production Redis/worker deployment, formal alert routing, real customer/order data, production eval gate or 1.0 release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m5-00-operations-loop-readiness-pack` |
| `git status --short --branch` | `## codex/m5-00-operations-loop-readiness-pack` before edits |
| `git branch --show-current` | `codex/m5-00-operations-loop-readiness-pack` |
| worker `HEAD` | `a317b6ca5d45768176bf9a69555ab9764bf3605f` |
| worker `origin/main` | `a317b6ca5d45768176bf9a69555ab9764bf3605f` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` before edits |
| no-merged branch audit | root `git branch --no-merged main` returned no branch output before edits |

## Planned Slices

| Order | Planned slice | Scope | Parallelism rule |
|---:|---|---|---|
| 1 | M5-01 DB/contract foundation | Distill health, confirmation queue, AI member, analytics/log/template contracts | Global serial for schema/migrations/generated contracts. |
| 2 | M5-02 distill guardrails | Candidate cap, 7-day pass rate, downshift, owner alert, manual recovery audit | Depends on M5-01; serial with worker/cron shared paths. |
| 3 | M5-03 confirmation queue API | Approve/edit/discard/conflict diff API and no formal write before confirmation | Depends on M5-01/M5-02; serial with shared API/authz routes. |
| 4 | M5-04 confirmation queue admin | Keyboard-first queue, amber health banner, mobile pass/discard fallback | Depends on M5-03; frontend-only parallelism only with disjoint admin paths. |
| 5 | M5-05 AI member console | AI member status, toggles, offline/breaker state, emergency stop/recovery audit | Serial with shared audit/log/API paths. |
| 6 | M5-06 logs + analytics | Fixed analytics board, dimensions, login/presence/operation logs | Serial with shared metric/log/audit paths. |
| 7 | M5-07 template center | Knowledge, AI member, config and eval templates; copy creates tenant-owned version | Serial with schema/config/template shared paths. |
| 8 | M5-08 integration smoke + closeout | Integration smoke, evidence sync and owner closeout readiness request | Runs after M5-01..M5-07 are merged, or explicitly superseded/deferred by owner-approved evidence with affected items still `not_closed`. |

Future workers must use distinct physical worktree paths, distinct branches and non-overlapping machine-readable touch lists. `packages/db` schema and migrations, lockfile, shared config, CI/guard scripts, global generated artifacts and release/production gates are global serial. Root/main remains coordination/read-only only.

## Acceptance Mapping

| Item | M5 current status | Planned closure path |
|---|---|---|
| H-01 | queued_not_closed | M5 may contribute confirmation-backed updates through M5-03/M5-04 and template governance through M5-07. Full facts/journeys/stages/materials edit, import, publish and media-upload closure remains future-scoped unless a dedicated M5 implementation spec explicitly covers that full workflow. |
| H-02 | queued_not_closed | M5-03/M5-04 must prove candidates require human approve/edit/discard before formal write. |
| H-03 | queued_not_closed | M5-03/M5-04 must prove conflict diff is mandatory and cannot be skipped into formal storage. |
| H-04 | queued_not_closed | M5-07 template copy must create tenant-independent versions. |
| H-05 | not_primary_m5_scope_not_closed | Future template/material refs must preserve storageRef as source and Telegram file_id as cache; runbook evidence remains later scope. |
| H-06 | queued_not_closed | M5-07 may cover quick-reply/template governance if scoped; public/private quick-reply workflow is not closed by M5-00. |
| H-07 | queued_not_closed | M5-01/M5-02/M5-04/M5-06 cover cap, pass rate, downshift, owner alert, manual recovery and audit. |
| I-02 | queued_not_closed | M5-04 covers mobile confirmation fallback; M5-05 covers AI emergency stop/recovery fallback. |
| I-06 | queued_not_closed | M5-06 covers fixed analytics board, dimensions and export governance. |
| I-07 | queued_not_closed | M5-05/M5-06 cover AI state/action audit and login/presence/operation log readback. |
| J-05 | opened_for_m5 | M5 evidence entrypoint exists so M5 evidence is not deferred to M6; no release signoff. |
| K-03 | active | One spec / one PR; current branch implements only M5-00. |
| K-04 | active | Planned queue and serial/parallel rules recorded. |

## Boundary

This M5 entrypoint does not approve:

- M5 accepted status;
- M6 release hardening;
- GA-0 opening;
- production readiness;
- real customer traffic/data;
- customer LLM;
- production Redis/worker deployment;
- external SaaS onboarding;
- automatic knowledge write without confirmation;
- 1.0 release.

M5 evidence must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. Future sensitive source material must stay in controlled storage; repo evidence may only record manifests, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Required because `node_modules` was missing at start; installed 360 packages and found 0 vulnerabilities. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` in linked M5-00 worktree. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-00-operations-loop-readiness-pack --root /Users/atilla/Documents/UZMAX智能运营` | pass | Explicit assigned/root boundary check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-00-operations-loop-readiness-pack.md --include-worktree` | pass | Reported 2 docs files, source changed files 0, net source LOC 0 and new source files 0. No PR existed yet for this branch. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |

# M6-00 M5 Signoff And M6 Readiness Pack

> evidence_id: M6-00-m5-signoff-and-m6-readiness-pack
> milestone: M6
> acceptance_items: J-05, K-03, K-04, L-01, L-02 readiness tracking
> owner: project owner accepted M5 milestone/runtime evidence in the Codex thread on 2026-06-25; owner still owns GA-0, production, real data, customer LLM, P1 risk and 1.0 release decisions
> status: ready_for_review
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, four v1.1 source-of-truth docs, `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md`, `docs/evidence/M5/README.md`, `docs/evidence/M5R/README.md`, Git/GitHub current-state evidence
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets
> review_notes: M6-00 records M5 owner signoff and creates the M6 plan/readiness baseline only; it does not start M6-01, open GA-0, approve production, or approve 1.0 release
> signoff: pending owner review of this M6-00 PR; M5 owner signoff itself was provided in the Codex thread on 2026-06-25

## Summary

M6 can now start as a spec-governed release-hardening phase because the project owner accepted M5 milestone/runtime evidence with "同意签收m5，可以启动m6".

This file is the M6-00 repo truth source for:

- M5 owner signoff / M5R current evidence state;
- current main / CI / PR / branch status;
- M6-00 through M6-09 execution slices;
- acceptance-matrix gap table;
- M6 readiness / remaining-gap list;
- M6 evidence directory entry.

Linear `LAY-5` is tracking only and is not a source of truth.

The M5/M5R README files remain historical M5R-08 closeout inputs and may still contain pre-signoff `not_owner_accepted` status strings required by the M5R closeout test contract. This M6-00 evidence records the later owner M5 signoff and M6 handoff.

## Owner Signoff Scope

| Decision | Current status | Boundary |
|---|---|---|
| M5 milestone/runtime evidence | `owner_accepted_m5_runtime_evidence` | Accepted for milestone evidence and M6 start only. |
| M5R final true DB closeout | `m5r_08_true_integration_closeout_passed_true_db_owner_accepted_for_m5_runtime_evidence` | Accepted as part of M5 runtime evidence; not a production/GA release proof. |
| GA-0 opening | `not_approved` | Requires GA-0 checklist green, audit write path and owner decision. |
| Production deploy / real traffic | `not_approved` | M6 will produce hardening evidence; owner decides real traffic. |
| Real customer/order data | `not_approved` | No real data is approved by M5/M6-00. |
| Customer LLM / real provider calls | `not_approved` | Requires owner/provider/key/cost/compliance decision and gates. |
| 1.0 release | `not_approved` | Requires all P0 pass and P1/P2 handling per acceptance matrix. |

## Start Audit

Recorded at M6-00 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-00-m5-signoff-readiness` |
| assigned `git status --short --branch` before docs edits | `## codex/m6-00-m5-signoff-readiness...origin/main` |
| assigned branch | `codex/m6-00-m5-signoff-readiness` |
| assigned `HEAD` | `698a7edde0a33c1bb0280aa82175f0671427342e` |
| assigned `origin/main` | `698a7edde0a33c1bb0280aa82175f0671427342e` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| root/main branch | `main` |
| root/main `HEAD` | `698a7edde0a33c1bb0280aa82175f0671427342e` |
| root/main `origin/main` | `698a7edde0a33c1bb0280aa82175f0671427342e` |
| open PR audit | GitHub REST `pulls?state=open&per_page=100` returned `open_pr_count 0` |
| latest main CI | GitHub Actions `CI` run `28185173893`, `M5R-08 true DB CI closeout (#128)`, head SHA `698a7edde0a33c1bb0280aa82175f0671427342e`, conclusion `success` |
| branch protection audit | GitHub REST branch-protection endpoint returned `Requires authentication`; not relied on for completion |
| local no-merged branch audit before edits | root `git branch --no-merged main` returned no output before this branch had commits |
| remote branch audit | stale-looking remote `origin/codex/*` branches remain while open PR count is 0; classify/cleanup later under a dedicated hygiene slice if still present |
| M6-00 closeout PR | GitHub PR #129, branch `codex/m6-00-m5-signoff-readiness`, docs-only |

## Repo Plan Presence Before M6-00

| Check | Result |
|---|---|
| `docs/specs/M6-*` | none found before this PR |
| `docs/evidence/M6/` | absent before this PR |
| `docs/release.md` | absent; `docs/doc-gates.md` still says release doc is待触发 |
| Repo M6 complete plan | absent before this PR |
| Linear M6 plan | existed as tracking issues only; not source of truth |

## M6 Execution Slices

| Slice | Goal | Scope | Out of scope | Acceptance / evidence | Dependencies |
|---|---|---|---|---|---|
| M6-00 | Record M5 signoff and M6 readiness plan. | Docs-only source-of-truth setup, gap table, current-state evidence. | Source/runtime changes, M6-01 start, GA-0 approval. | This spec and evidence file; M6 evidence records the later M5 signoff while M5/M5R README files stay historical. | Owner M5 signoff; clean main. |
| M6-01 | Evidence-driven release gate console. | Align admin release gate state to repo evidence and blockers. | Broad admin redesign; production approval. | Admin gate no longer stale; evidence links and blocker states traceable. | M6-00. |
| M6-02 | Runtime deploy and rollback baseline. | api/worker/cron/admin health, env manifests, rollback dry-run/runbook evidence. | Real production cutover; secret creation. | J-01/J-04 baseline evidence or explicit external blocker. | M6-00; staging/runtime access as needed. |
| M6-03 | Queue and failure injection drills. | Retry, idempotency, backlog alert, worker accumulation, order import abnormal path. | New queue architecture; real customer/order data. | J-02 and final fault-drill evidence. | M6-02; Redis/BullMQ-compatible test target. |
| M6-04 | RLS/authz release matrix. | Cross-tenant read/write denial, forged tenant/org, missing context, backend permission checks and audit. | Broad auth redesign; real tenant data. | B-01..B-05 release matrix passes or blockers recorded. | M6-00; no concurrent DB/schema work. |
| M6-05 | AI safety and eval gates. | Redline, outbound filter, eval gate, model-all-down, AI fuse, language/quality risk status. | New provider integration; lowered eval assertions. | F/G/L-02 evidence; owner risk items explicit. | M6-02; owner language/blind-review inputs if required. |
| M6-06 | Telegram Bot GA-0 main path. | Bot-only synthetic/test path, webhook/queue/engine/log/ticket/manual handoff evidence. | Business auto-reply; real customer broadcast. | C-01/C-02/C-03b/C-06 and GA-0 preflight evidence. | M6-02/M6-03/M6-05. |
| M6-07 | Core operations synthetic E2E. | One reproducible synthetic flow across conversation, ticket, customer asset, order snapshot, confirmation, logs, admin visibility. | Broad UX redesign; new business capability. | A/D/E/H/I golden-path evidence and remaining P1/P2 classification. | M6-01/M6-04/M6-05/M6-06. |
| M6-08 | Backup restore and asset safety drills. | Backup/restore drill and material/template/knowledge write safety. | Production destructive restore; storage architecture rewrite. | J-03, H-01/H-05/H-06 asset-safety evidence or blocker. | M6-02; safe DB target. |
| M6-09 | Final acceptance closure. | P0/P1/P2 rollup and owner GA-0 go/no-go decision package. | New implementation except separately scoped blockers; 1.0 production launch. | All P0 pass or no-go; P1 risk signoff/fix date; P2 backlog. | M6-00 through M6-08 complete or explicitly blocked. |

## Dependency / Parallelism Matrix

| Slice | Depends on | May run parallel with | Serial points |
|---|---|---|---|
| M6-00 | M5 owner signoff | none | M6 planning/evidence source of truth |
| M6-01 | M6-00 | M6-02 if touch lists are disjoint | release gate contract, admin release surface |
| M6-02 | M6-00 | M6-01 if touch lists are disjoint | deploy config, env manifests, rollback runbooks |
| M6-03 | M6-02 | M6-05 only if no shared worker/queue/eval paths | worker, Redis/BullMQ, queue semantics, order-import abnormal path |
| M6-04 | M6-00 | none by default | DB/RLS/schema/authz/API guard global serial |
| M6-05 | M6-02 | M6-03 only if disjoint; otherwise serial | eval gate, redline, model route, AI fuse, prompt/knowledge/persona release gates |
| M6-06 | M6-02/M6-03/M6-05 | none by default | channel ingress, queue, engine, ticket/log path |
| M6-07 | M6-01/M6-04/M6-05/M6-06 | M6-08 only if DB/runtime touch lists are disjoint | cross-domain E2E path and acceptance blockers |
| M6-08 | M6-02 and safe DB target | M6-07 only if disjoint | backup/restore, DB target, storage/material safety |
| M6-09 | M6-00..M6-08 | none | final acceptance rollup and owner decision package |

Global serial points for M6: `packages/db`, Prisma schema, migrations, RLS policy changes, shared runtime helpers, lockfile, shared config, CI/guard scripts, global generated artifacts, release/production gates, owner-facing release-console contracts, and any real environment drill that could affect shared state.

## Acceptance Matrix Gap Table

| Items | Current M6-entry status | Gap / risk | Closure slice |
|---|---|---|---|
| A-01, A-05 | not release-verified | Group overview and connector center health/risks need final release evidence. | M6-01, M6-07 |
| A-02 | partially evidenced earlier, not final release matrix | Needs release-level RLS/API/admin permission proof. | M6-04 |
| A-03 | runtime evidence ready and M5 accepted | Template copy independence proven by M5R; include in final rollup. | M6-09 |
| A-04 | needs final static/UI audit | Non-goal surfaces must remain absent at release gate. | M6-01, M6-07 |
| B-01..B-05 | not closed at release-hardening level | Tenant isolation, forged context, permission and audit matrix must be rerun as final release gate. | M6-04 |
| C-01, C-02, C-06 | M2 evidence exists, not GA-0 runtime proof | Bot/test traffic main path and takeover race need final proof. | M6-06 |
| C-03/C-04/C-05 | conditionally out by ADR-B01 branch unless future owner/spec changes it | Must not accidentally reopen Business auto-reply. | M6-06, M6-09 |
| C-03b/C-05b | needs final disabled/alternative-state audit | Business disabled/no-auto-send state must remain enforced. | M6-06 |
| D-01..D-07 | contract/evidence exists across M2/M4/M5, not one release E2E | Conversation/ticket/customer closure needs one synthetic golden-path proof and remaining P1/P2 classification. | M6-07 |
| E-01 | conditional on SPK-02 branch | If no API branch remains active, release evidence must not depend on API connector. | M6-03, M6-07, M6-09 |
| E-02..E-04 | M4 evidence exists, not final fault drill | Import main path abnormal handling and no-fabrication behavior need final release drill/rollup. | M6-03, M6-07 |
| F-01..F-04 | M3/M4 evidence exists, not final release eval rollup | AI capability regressions must be included in final eval gate. | M6-05 |
| F-05, F-06 | needs final redline/fuse drills | Redline, sensitive context, user/capability/global fuse radius must pass release drills. | M6-05 |
| G-01..G-05 | not final release verified | Routing/fallback/cost/eval gate/language/false-positive surfaces need release gate proof. | M6-05 |
| G-06 | gap likely open | 1.0 full candidate target is >= 200; current repo evidence previously records seed/current set, not final M6 full-set signoff. | M6-05, M6-09 |
| H-01 | partial | M5R proved a named formal write path only; full facts/journeys/stages/materials edit/publish remains a gap unless owner scopes it down or a future slice closes it. | M6-08, M6-09 |
| H-02, H-03, H-04, H-07 | runtime evidence ready and M5 accepted | Include in final rollup; rerun only if affected by later changes. | M6-09 |
| H-05 | open | StorageRef/file_id recovery runbook/evidence remains missing. | M6-08 |
| H-06 | partial | Quick-reply/template kind proof exists but full public/private search/classification/import/export/permission path is not closed. | M6-08, M6-09 |
| I-01 | not full release E2E | Desktop core workflows need synthetic release path evidence. | M6-07 |
| I-02, I-06, I-07 | runtime evidence ready and M5 accepted | Include in final rollup; verify if release gate changes touch these paths. | M6-09 |
| I-03, I-04, I-05 | not final release verified | Performance, realtime latency and design-token/visual regression gates need final classification. | M6-07, M6-09 |
| J-01 | open | api/worker/cron/admin independent deploy rollback not drilled for release. | M6-02 |
| J-02 | open | queue retry/idempotency/backlog alert release drill missing. | M6-03 |
| J-03 | open | DB backup/restore drill missing. | M6-08 |
| J-04 | open/partial | Existing runbooks are present but bot no response, model all down, redline bad send, order API/import abnormal and RLS misconfig need drill/review closure. | M6-02, M6-03, M6-05, M6-08 |
| J-05 | active, not closed | Prior milestone evidence exists; M5 signoff is now recorded; full P0 rollup still required. | M6-00, M6-09 |
| J-06 | earlier M0 evidence exists | Include ADR/spike/CI status in final rollup. | M6-09 |
| K-01, K-02 | needs final governance rollup | Dependency/eval-trigger negative controls should be included in release evidence. | M6-09 |
| K-03, K-04 | active | M6-00 records one spec/one PR and serial/parallel rules; future slices must comply. | M6-00..M6-09 |
| L-01 | open | GA-0 checklist all green and audit write not closed. | M6-01, M6-06, M6-09 |
| L-02 | open | GA-0 redline incident fuse and leave-ticket path not drilled. | M6-05, M6-06, M6-09 |

## M6 Readiness / Remaining Gap List

### Ready To Start

- M5/M5R runtime evidence is owner accepted for milestone evidence.
- `main` and `origin/main` are aligned at `698a7edde0a33c1bb0280aa82175f0671427342e`.
- Latest main CI for that SHA is successful.
- Open PR count is 0 by GitHub REST.
- M6 source-of-truth files now exist in repo through this slice.

### Remaining Gaps Before GA-0

- Release gate console still needs current-state evidence wiring and blocker display.
- Deploy/rollback drills for api/worker/cron/admin are not closed.
- Queue retry/idempotency/backlog fault injection is not closed.
- RLS/authz release matrix is not closed.
- AI redline/eval/fuse/model-all-down release drills are not closed.
- Bot-only GA-0 main path is not closed.
- Backup/restore drill and asset safety evidence are not closed.
- Full synthetic core operations E2E is not closed.
- Full P0/P1/P2 final acceptance rollup is not closed.
- Owner-provided GA-0 bilingual guidance/template final copy remains a GA-0 input dependency.
- G-06 full 1.0 eval candidate set >= 200 remains a release-tracked item unless later evidence proves closure.

### Branch Hygiene Follow-Up

Open PR count is 0, but remote `origin/codex/*` branches still exist for older slices. M6-00 does not delete them because this slice is docs-only planning/signoff. They should be classified as merged/superseded/deleted by a dedicated hygiene step before final M6 closeout if still present.

## Evidence Directory Entry

`docs/evidence/M6/README.md` is now the M6 evidence entrypoint. Future M6 evidence must be linked there and must keep sensitive data out of repo.

## Validation

Recorded on 2026-06-26 from the assigned worktree.

| Command | Result | Notes |
|---|---|---|
| `npm ci` | blocked_local_tooling | This worktree starts without `node_modules`; the available bundled runtime provides `node` but no `npm`, so no package-manager install was performed. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH /Users/atilla/Applications/UZMAX智能运营/node_modules/.bin/prettier --check docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md docs/evidence/M6/README.md docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` | pass | Docs formatting passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/workspace-isolation.mjs` | pass | `workspace-isolation: ok (codex/m6-00-m5-signoff-readiness, linked worktree, dirty allowed)`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-00-m5-signoff-readiness --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md --include-worktree` | pass | Changed files: 3 docs; source changed files: 0; source net LOC: 0; new source files: 0. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `node --test scripts/tests/*.test.mjs` | blocked_local_dependency | With a temporary local `node_modules` symlink to the root checkout dependencies, 389/390 tests passed. `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs` failed because local dependencies do not include `bullmq`; latest main CI for `698a7edde0a33c1bb0280aa82175f0671427342e` is successful. No source or test files are changed by M6-00. |

## Boundary

M6-00 does not approve:

- M6-01 implementation;
- GA-0 opening;
- production readiness;
- real customer traffic/data;
- real order data;
- customer LLM or real LLM/provider calls;
- production Redis/worker deployment;
- external SaaS onboarding;
- Telegram Business automatic reply;
- broad UI redesign;
- 1.0 release.

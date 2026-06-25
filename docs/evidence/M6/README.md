# M6 Evidence

M6 evidence tracks release hardening, final fault drills, GA-0 readiness evidence, full acceptance rollup, and residual cleanup before any owner GA-0 or 1.0 release decision.

Current M6 readiness spec: `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md`.
Current M6 entry evidence: `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.
Current active M6 implementation spec: none beyond M6-00 docs-only readiness.

M6 current status: `m6_readiness_pack_recorded_not_ga0_not_release`. Project owner accepted M5 milestone/runtime evidence in the Codex thread on 2026-06-25 with "同意签收m5，可以启动m6". That acceptance allows the repo to open M6 planning and future spec-governed M6 work. It does not approve GA-0 opening, production deployment, real customer/order-data use, customer LLM, real LLM/provider keys or cost risk, external SaaS onboarding, P1 risk acceptance, or 1.0 release.

The M5/M5R README files remain historical M5R-08 closeout inputs and may still contain pre-signoff `not_owner_accepted` status strings required by the M5R closeout test contract. This M6 evidence directory records the later owner signoff and M6 handoff.

## Source Of Truth

| Scope | Source |
|---|---|
| Product scope | `UZMAX智能运营系统-PRD-v1.1.md` |
| Technical/release boundary | `UZMAX智能运营系统-技术架构-v1.1.md` |
| Admin/release console boundary | `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` |
| Release blockers | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| Project rules | `AGENTS.md` |
| M6 readiness spec | `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md` |
| M6 entry evidence | `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` |
| M5 milestone/runtime evidence | `docs/evidence/M5/README.md`; `docs/evidence/M5R/README.md` |

## M6 Execution Queue

M6-00 is the only active M6 slice in this branch. Future slices must each create or update a dedicated spec before implementation.

| Order | Slice | Status | Evidence / expected next source |
|---:|---|---|---|
| 0 | M6-00 M5 signoff and M6 readiness pack | `active_docs_only` | `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md`; `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` |
| 1 | M6-01 Evidence-driven release gate console | `not_started` | Future `docs/specs/M6-01-*` |
| 2 | M6-02 Runtime deploy and rollback baseline | `not_started` | Future `docs/specs/M6-02-*` |
| 3 | M6-03 Queue and failure injection drills | `not_started` | Future `docs/specs/M6-03-*` |
| 4 | M6-04 RLS/authz release matrix | `not_started` | Future `docs/specs/M6-04-*` |
| 5 | M6-05 AI safety and eval gates | `not_started` | Future `docs/specs/M6-05-*` |
| 6 | M6-06 Telegram Bot GA-0 main path | `not_started` | Future `docs/specs/M6-06-*` |
| 7 | M6-07 Core operations synthetic E2E | `not_started` | Future `docs/specs/M6-07-*` |
| 8 | M6-08 Backup restore and asset safety drills | `not_started` | Future `docs/specs/M6-08-*` |
| 9 | M6-09 Final acceptance closure | `not_started` | Future `docs/specs/M6-09-*` |

## Readiness Boundary

M6 exists to close final runtime evidence gaps and release-readiness drills:

- deploy/rollback drills for api, worker, cron and admin;
- queue retry/idempotency/backlog drills;
- DB backup/restore evidence;
- runbook review and drill evidence;
- release gate evidence rollup;
- RLS/authz over-permission tests;
- model-all-down, AI fuse and redline failure drills;
- Bot-only GA-0 main-path readiness;
- full synthetic operations E2E;
- P0/P1/P2 final acceptance rollup.

M6 does not approve:

- GA-0 opening;
- production deployment;
- real customer/order-data work;
- customer LLM or real provider calls;
- production Redis/worker deployment;
- external SaaS onboarding;
- Telegram Business automatic reply expansion;
- broad UI redesign;
- 1.0 release.

## Current M5/M5R Entry State

| Area | Current status | Evidence |
|---|---|---|
| M5 owner signoff | `owner_accepted_m5_runtime_evidence` | Owner Codex-thread signoff on 2026-06-25; recorded by M6-00 |
| M5R final runtime closeout | `m5r_08_true_integration_closeout_passed_true_db_owner_accepted_for_m5_runtime_evidence` | `docs/evidence/M5R/M5R-08-true-integration-closeout.md`; latest main CI run #28185173893 |
| Production / GA / release | `not_approved` | v1.1 PRD, architecture and acceptance matrix boundaries |

## Current Main / CI / PR / Branch State

Recorded at M6-00 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| root/main HEAD | `698a7edde0a33c1bb0280aa82175f0671427342e` |
| root/main origin/main | `698a7edde0a33c1bb0280aa82175f0671427342e` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-00-m5-signoff-readiness` |
| assigned branch | `codex/m6-00-m5-signoff-readiness` |
| assigned branch base | `origin/main` at `698a7edde0a33c1bb0280aa82175f0671427342e` |
| open PR audit | GitHub REST returned `open_pr_count 0` on 2026-06-26 |
| latest main CI | GitHub Actions `CI`, run `28185173893`, title `M5R-08 true DB CI closeout (#128)`, conclusion `success`, head SHA `698a7edde0a33c1bb0280aa82175f0671427342e` |
| branch protection audit | GitHub REST branch protection endpoint returned `Requires authentication`; not used as completion proof |
| remote branch note | `origin/codex/m4-22-order-read-no-fabrication-eval` and `origin/codex/m5r-04..07-*` remote branches still exist with no open PR; cleanup/classification remains a branch-hygiene follow-up, not M6-00 source work |
| M6-00 closeout PR | GitHub PR #129, branch `codex/m6-00-m5-signoff-readiness`, docs-only |

## Acceptance-Gap Summary

The detailed gap table is in `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.

Current high-level M6 entry posture:

- M0-M4 milestone evidence is accepted in prior evidence records.
- M5/M5R runtime evidence is now owner accepted for milestone evidence only.
- M6 has not yet closed J-01/J-02/J-03/J-04/J-05/L-01/L-02.
- GA-0 remains closed until its checklist is green and owner explicitly opens it.
- 1.0 release remains blocked until all P0 items pass and P1/P2 handling matches the acceptance matrix.

## Validation

M6-00 validation is tracked in `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.

## Sensitive Data Boundary

M6 evidence must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. Future sensitive source material must stay in controlled storage; repo evidence may only record manifests, redaction method, storage refs, access scope, retention period and project owner confirmation status.

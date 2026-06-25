# M6 Evidence

M6 evidence tracks release hardening, final fault drills, GA-0 readiness evidence, full acceptance rollup, and residual cleanup before any owner GA-0 or 1.0 release decision.

Current M6 readiness spec: `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md`.
Current M6 entry evidence: `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.
Current active M6 implementation spec: `docs/specs/M6-03-queue-failure-injection-drills.md`.
Current active M6 evidence: `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`.

M6 current status: `m6_queue_failure_drill_recorded_j02_supported_not_production_deployment`. Project owner accepted M5 milestone/runtime evidence in the Codex thread on 2026-06-25 with "同意签收m5，可以启动m6". That acceptance allows the repo to open M6 planning and future spec-governed M6 work. It does not approve GA-0 opening, production deployment, real customer/order-data use, customer LLM, real LLM/provider keys or cost risk, external SaaS onboarding, P1 risk acceptance, or 1.0 release.

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

M6-02 is the active M6 slice in this branch. Future slices must each create or update a dedicated spec before implementation.

| Order | Slice | Status | Evidence / expected next source |
|---:|---|---|---|
| 0 | M6-00 M5 signoff and M6 readiness pack | `merged_ready_for_owner_review` | `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md`; `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` |
| 1 | M6-01 Release Gate Console | `merged_ready_for_owner_review` | `docs/specs/M6-01-release-gate-console.md`; `docs/evidence/M6/M6-01-release-gate-console.md` |
| 2 | M6-02 Runtime deploy and rollback baseline | `merged_ready_for_owner_review` | `docs/specs/M6-02-runtime-deploy-baseline.md`; `docs/evidence/M6/M6-02-runtime-deploy-baseline.md` |
| 3 | M6-03 Queue and failure injection drills | `active` | `docs/specs/M6-03-queue-failure-injection-drills.md`; `docs/evidence/M6/M6-03-queue-failure-injection-drills.md` |
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

Recorded at M6-03 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| root/main HEAD | `ead0b901dec16fc4de89972729e6834d3718516c` |
| root/main origin/main | `ead0b901dec16fc4de89972729e6834d3718516c` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-03-queue-failure-drills` |
| assigned branch | `codex/m6-03-queue-failure-drills` |
| assigned branch base | `origin/main` at `ead0b901dec16fc4de89972729e6834d3718516c` |
| open PR audit | GitHub connector returned no open PRs before M6-03 PR |
| latest merged M6 PR | GitHub PR #131 merged to main at `ead0b901dec16fc4de89972729e6834d3718516c` |
| current commit workflow/status audit | GitHub PR #131 CI passed before merge; M6-03 merge readiness will rely on this PR's CI before merge |
| branch hygiene | M6-02 branch/worktree deleted; root `git branch --no-merged main` returned no output before M6-03 work |

## Acceptance-Gap Summary

The detailed gap table is in `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.

Current high-level M6 entry posture:

- M0-M4 milestone evidence is accepted in prior evidence records.
- M5/M5R runtime evidence is now owner accepted for milestone evidence only.
- M6-01 release gate console is merged and records current gate state in admin.
- M6-02 runtime deploy/rollback baseline is merged and records J-01/J-04 partial state without closing real rollback drills.
- M6-03 queue/failure-injection drill is active and records J-02 synthetic BullMQ/Redis retry/idempotency/backlog support without production Redis/worker approval.
- M6 has not yet closed J-01/J-03/J-04/J-05/L-01/L-02.
- J-01 remains open because real Render/Vercel rollback drills are pending and worker/cron starts are still placeholders.
- J-02 has synthetic release-drill evidence from the M4-45 Redis smoke and M6-03 runbook, but production Redis/worker deployment and formal alert-channel routing remain not approved.
- J-04 deploy/rollback runbook coverage is improved; remaining fault drills stay open for later M6 slices.
- GA-0 remains closed until its checklist is green and owner explicitly opens it.
- 1.0 release remains blocked until all P0 items pass and P1/P2 handling matches the acceptance matrix.

## Validation

M6-00 validation is tracked in `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.
M6-01 validation is tracked in `docs/evidence/M6/M6-01-release-gate-console.md`.
M6-02 validation is tracked in `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`.
M6-03 validation is tracked in `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`.

## Sensitive Data Boundary

M6 evidence must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. Future sensitive source material must stay in controlled storage; repo evidence may only record manifests, redaction method, storage refs, access scope, retention period and project owner confirmation status.

# M6 Evidence

M6 evidence tracks release hardening, final fault drills, GA-0 readiness evidence, full acceptance rollup, and residual cleanup before any owner GA-0 or 1.0 release decision.

Current M6 readiness spec: `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md`.
Current M6 entry evidence: `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.
Current active M6 implementation spec: `docs/specs/M6-07-core-ops-synthetic-e2e.md`.
Current active M6 evidence: `docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md`.

M6 current status: `m6_core_ops_synthetic_e2e_recorded_a_d_e_h_i_supported_not_ga0`. Project owner accepted M5 milestone/runtime evidence in the Codex thread on 2026-06-25 with "同意签收m5，可以启动m6". That acceptance allows the repo to open M6 planning and future spec-governed M6 work. It does not approve GA-0 opening, production deployment, real customer/order-data use, customer LLM, real provider calls, real LLM/provider keys or cost risk, external SaaS onboarding, Telegram Business automatic reply, P1 risk acceptance, or 1.0 release.

GA-0 is not open. Production DB/RLS approval is not granted. Customer LLM is not approved. Real provider calls are not approved. Real customer traffic is not approved. Telegram Business automatic reply is not approved.

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

M6-07 is the active M6 slice in this branch. Future slices must each create or update a dedicated spec before implementation.

| Order | Slice | Status | Evidence / expected next source |
|---:|---|---|---|
| 0 | M6-00 M5 signoff and M6 readiness pack | `merged_ready_for_owner_review` | `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md`; `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` |
| 1 | M6-01 Release Gate Console | `merged_ready_for_owner_review` | `docs/specs/M6-01-release-gate-console.md`; `docs/evidence/M6/M6-01-release-gate-console.md` |
| 2 | M6-02 Runtime deploy and rollback baseline | `merged_ready_for_owner_review` | `docs/specs/M6-02-runtime-deploy-baseline.md`; `docs/evidence/M6/M6-02-runtime-deploy-baseline.md` |
| 3 | M6-03 Queue and failure injection drills | `merged_ready_for_owner_review` | `docs/specs/M6-03-queue-failure-injection-drills.md`; `docs/evidence/M6/M6-03-queue-failure-injection-drills.md` |
| 4 | M6-04 RLS/authz release matrix | `merged_ready_for_owner_review` | `docs/specs/M6-04-rls-authz-release-matrix.md`; `docs/evidence/M6/M6-04-rls-authz-release-matrix.md` |
| 5 | M6-05 AI safety and eval gates | `merged_ready_for_owner_review` | `docs/specs/M6-05-ai-safety-eval-gates.md`; `docs/evidence/M6/M6-05-ai-safety-eval-gates.md` |
| 6 | M6-06 Telegram Bot GA-0 main path | `merged_ready_for_owner_review` | `docs/specs/M6-06-telegram-bot-ga0-main-path.md`; `docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md` |
| 7 | M6-07 Core operations synthetic E2E | `active` | `docs/specs/M6-07-core-ops-synthetic-e2e.md`; `docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md` |
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

Recorded at M6-07 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| root/main HEAD | `7a57f2ac7a0b5a88854b971c2aff28166954db08` |
| root/main origin/main | `7a57f2ac7a0b5a88854b971c2aff28166954db08` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-07-core-ops-synthetic-e2e` |
| assigned branch | `codex/m6-07-core-ops-synthetic-e2e` |
| assigned branch base | `origin/main` at `7a57f2ac7a0b5a88854b971c2aff28166954db08` |
| open PR audit | GitHub connector returned no open PRs after M6-06 closeout and before M6-07 PR |
| latest merged M6 PR | GitHub PR #135 merged to main at `7a57f2ac7a0b5a88854b971c2aff28166954db08` |
| current commit workflow/status audit | GitHub PR #135 CI run #28201662651 passed before merge; M6-07 merge readiness will rely on this PR's CI before merge |
| branch hygiene | M6-06 branch/worktree deleted; root `git branch --no-merged main` returned no output before M6-07 work |

## Acceptance-Gap Summary

The detailed gap table is in `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.

Current high-level M6 entry posture:

- M0-M4 milestone evidence is accepted in prior evidence records.
- M5/M5R runtime evidence is now owner accepted for milestone evidence only.
- M6-01 release gate console is merged and records current gate state in admin.
- M6-02 runtime deploy/rollback baseline is merged and records J-01/J-04 partial state without closing real rollback drills.
- M6-03 queue/failure-injection drill is merged and records J-02 synthetic BullMQ/Redis retry/idempotency/backlog support without production Redis/worker approval.
- M6-04 RLS/authz release matrix is merged and records A-02/B-01 through B-05 support from repo source, ADR, test and M5R true-DB evidence without approving production DB/RLS.
- M6-05 AI safety/eval gates is merged and records F-01 through F-06, G-01 through G-06, J-04 and L-02 support from ADR-003, M3 eval/LLM/engine evidence, M4 no-fabrication evidence and M5R AI member runtime evidence without approving customer LLM, real provider calls or GA-0.
- M6-06 Telegram Bot GA-0 main path is merged and records C-01/C-02/C-03b/C-06/J-04/L-01/L-02 support from M2 Bot ingress, M2 handoff/ticket, ADR-B01, M6 queue and M6 AI-safety evidence without approving GA-0, real customer traffic or Business auto-reply.
- M6-07 Core operations synthetic E2E is active and records A/D/E/H/I synthetic golden-path support from existing M2/M4/M5/M5R/M6 evidence without approving a new live production E2E, real customer/order data, GA-0 or 1.0.
- M6 has not yet closed J-01/J-03/J-04/J-05/L-01/L-02.
- J-01 remains open because real Render/Vercel rollback drills are pending and worker/cron starts are still placeholders.
- J-02 has synthetic release-drill evidence from the M4-45 Redis smoke and M6-03 runbook, but production Redis/worker deployment and formal alert-channel routing remain not approved.
- J-04 deploy/rollback runbook coverage is improved; remaining fault drills stay open for later M6 slices.
- B-01 through B-05 have release-matrix support recorded by M6-04, but production DB/RLS, production customer-plaintext review and final high-risk audit rollup remain release-gate concerns.
- F/G/J-04/L-02 have release-support evidence recorded by M6-05, but G-04 owner blind review, G-06 full >=200 eval set, L-02 real Bot leave-ticket drill and production `llm_call_log` rollup remain release-gate concerns.
- C-01/C-02/C-03b/C-06/J-04/L-01/L-02 have Bot-only synthetic/test support recorded by M6-06, but real staging Bot webhook evidence, DB-backed dedupe/order restore, worker/engine consumer processing, outbound leave-ticket behavior and final owner GA-0 open decision remain release-gate concerns.
- A/D/E/H/I have core-operations synthetic E2E support recorded by M6-07, but D-06 anonymization, H-01/H-05/H-06 asset/authoring/quick-reply gaps, I-03 performance, I-04 realtime, I-05 final visual/token evidence and final owner release decisions remain open.
- GA-0 remains closed until its checklist is green and owner explicitly opens it.
- 1.0 release remains blocked until all P0 items pass and P1/P2 handling matches the acceptance matrix.

## Validation

M6-00 validation is tracked in `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.
M6-01 validation is tracked in `docs/evidence/M6/M6-01-release-gate-console.md`.
M6-02 validation is tracked in `docs/evidence/M6/M6-02-runtime-deploy-baseline.md`.
M6-03 validation is tracked in `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`.
M6-04 validation is tracked in `docs/evidence/M6/M6-04-rls-authz-release-matrix.md`.
M6-05 validation is tracked in `docs/evidence/M6/M6-05-ai-safety-eval-gates.md`.
M6-06 validation is tracked in `docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md`.
M6-07 validation is tracked in `docs/evidence/M6/M6-07-core-ops-synthetic-e2e.md`.

## Sensitive Data Boundary

M6 evidence must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. Future sensitive source material must stay in controlled storage; repo evidence may only record manifests, redaction method, storage refs, access scope, retention period and project owner confirmation status.

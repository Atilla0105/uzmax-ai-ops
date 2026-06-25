# Release Gate Boundary

This document records the current repo release-gate contract. It is not a production launch runbook and does not approve GA-0, production traffic, real customer/order data, customer LLM, external SaaS onboarding or 1.0 release.

## Source Of Truth

| Scope | Source |
|---|---|
| Release blockers | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| GA-0 rules | `UZMAX智能运营系统-技术架构-v1.1.md` §11.1 |
| Admin release console | `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` |
| Current M6 entry | `docs/evidence/M6/README.md` |
| Admin gate contract | `apps/admin/src/releaseGateContracts.ts` |

## Current Boundary

GA-0 remains locked. The admin console may show current gate state and evidence links, but it must not expose an enabled open action until:

- GA-0 checklist is green;
- required release-hardening drills are closed or explicitly no-go;
- audit write path is implemented and verified;
- project owner explicitly opens GA-0.

1.0 remains blocked until all P0 acceptance items pass and P1/P2 handling matches the acceptance matrix.

## M6-01 Console Contract

The M6-01 admin contract renders M0-M6, GA-0 and 1.0 status from one maintained source:

- M0-M4: accepted milestone evidence.
- M5: owner accepted for milestone/runtime evidence only.
- M6: release hardening in progress.
- GA-0: locked by L-01 checklist and owner decision.
- 1.0: blocked by final P0/P1/P2 rollup.

Evidence links in the admin shell are repo paths only. They are not sensitive artifacts and must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.

## M6-02 Runtime Baseline

The M6-02 runtime baseline records deploy/rollback readiness from repo manifests and app package commands:

- api: Render service definition, package start command and `/healthz`/`/readyz` are present; real rollback drill is still pending.
- worker: Render service definition exists, but package `start` is still an M0 deployment placeholder.
- cron: Render service definition exists, but package `start` is still an M0 deployment placeholder.
- admin: Vercel project and app build/start scripts exist; deployment strategy and rollback drill remain owner-pending.

`docs/runbooks/deploy-rollback.md` now covers api, worker, cron and admin rollback dry-run evidence. This does not close J-01, because real rollback drills and owner/platform decisions remain open.

## M6-03 Queue Failure Injection

The M6-03 queue drill records J-02 support from the existing M4-45 BullMQ/Redis order-import smoke:

- duplicate deterministic `jobId` enqueue does not create duplicate successful dispatch effects;
- first-attempt handler failure reaches a completed job through retry;
- permanent failed job and backlog counts produce `order_import_queue_failed_high` and `order_import_queue_backlog_high`;
- Storage source lock duplicate/release behavior is token-checked;
- disposable Redis queue and run-scoped lock keys are cleaned with `run residue 0`.

`docs/runbooks/queue-failure-injection.md` now covers the safe synthetic drill path and failure branches. This does not approve production Redis/worker deployment, production alert-channel routing, real customer/order data or GA-0.

## M6-04 RLS Authz Matrix

The M6-04 RLS/authz matrix records B-01 through B-05 support from current repo evidence:

- ADR-001, SPK-03, M1 platform tests, M4 order-import RLS tests and M5R true-DB closeout support the dev/staging RLS boundary without approving production DB/RLS use.
- ADR-002, `packages/authz/src/index.ts`, `apps/api/src/access-context.ts` and M1 access-context tests support server-side tenant selection, forged-context rejection and backend permission enforcement.
- Group aggregate-only behavior is recorded as contract-level support; production customer-plaintext surface review remains a final-release concern.
- Permission/config audit contracts and selected true-DB writes support B-05 for known paths; full high-risk action coverage remains in final rollup.
- `docs/runbooks/rls-misconfig.md` now contains the M6-04 release drill and failure branches.

This matrix does not approve production DB/RLS, GA-0, real customer/order data, customer LLM, external SaaS onboarding or 1.0 release.

## Not Approved

- GA-0 is not open.
- Production readiness is not approved.
- Real customer traffic or order data.
- Customer LLM or real provider calls.
- Production Redis/worker deployment.
- External SaaS onboarding.
- Telegram Business automatic reply expansion.
- 1.0 approval is not granted.

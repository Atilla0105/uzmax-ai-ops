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

## Not Approved

- GA-0 is not open.
- Production readiness is not approved.
- Real customer traffic or order data.
- Customer LLM or real provider calls.
- Production Redis/worker deployment.
- External SaaS onboarding.
- Telegram Business automatic reply expansion.
- 1.0 approval is not granted.

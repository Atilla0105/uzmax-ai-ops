# Runbook: Runtime Deploy And Rollback Baseline

## 适用场景

API、worker、cron、admin 部署失败，或 GA-0/正式发布前需要执行 deploy/rollback dry-run 与真实演练。

本 runbook 是 M6-02 基线文档，不批准 GA-0、生产部署、真实客户/order 数据或 1.0 release。真实 Render/Vercel 服务创建、secret/env 配置、preview/prod 暴露和费用仍由项目 owner 决定。

## Source Of Truth

| Scope | Source |
|---|---|
| Deploy architecture | `UZMAX智能运营系统-技术架构-v1.1.md` §10 |
| Release blockers | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` J-01/J-04 |
| Runtime baseline check | `scripts/guards/m6-runtime-baseline-check.mjs` |
| M6-02 evidence | `docs/evidence/M6/M6-02-runtime-deploy-baseline.md` |
| Render manifest | `docs/evidence/M0/infra/render-env-manifest.md`; `render.yaml` |
| Vercel manifest | `docs/evidence/M0/infra/vercel-env-manifest.md` |

## Surface Matrix

| Surface | Platform | Current entry | Health / recovery check | Rollback dry-run expectation | Current M6-02 state |
|---|---|---|---|---|---|
| api | Render `uzmax-api` | `npm --workspace @uzmax/api run start` | `/healthz`, `/readyz`, access-context readiness, logs with traceId | Identify previous stable deploy, redeploy/rollback through Render dashboard, verify health endpoints before reopening traffic | baseline supported; real Render service and rollback drill pending |
| worker | Render `uzmax-worker` | `npm --workspace @uzmax/worker run start` | worker process health, queue backlog/failed counts, idempotent retry evidence | Pause consumers, redeploy/rollback worker, verify backlog does not duplicate customer sends | blocked: package `start` is still M0 deployment placeholder |
| cron | Render `uzmax-cron` | `npm --workspace @uzmax/cron run start` | scheduled job heartbeat, distill/import/archive job status, logs with traceId | disable schedule if needed, rollback/redeploy cron service, verify next safe heartbeat/job plan | blocked: package `start` is still M0 deployment placeholder |
| admin | Vercel `uzmax-admin` | Vite build/preview scripts | preview/prod URL loads, release gate remains locked, API base URL env present in platform only | rollback to previous Vercel deployment, verify owner-facing release console and no enabled GA-0 open action | baseline supported; Vercel deployment/strategy pending owner |

## Deploy / Rollback Procedure

1. Identify affected surface: api, worker, cron, admin or shared platform dependency.
2. Record candidate version, previous stable version, environment, operator and reason in the evidence file or incident record.
3. Freeze risky entry points before rollback:
   - api: reduce or pause incoming traffic if platform allows.
   - worker: pause queue consumers before redeploy/rollback.
   - cron: disable schedule or skip the next run if job duplication risk exists.
   - admin: keep release actions disabled if backend/API state is uncertain.
4. Execute platform rollback or redeploy from previous stable version:
   - Render: use service rollback/redeploy from the dashboard or Blueprint-managed service.
   - Vercel: use previous deployment rollback/promote controls for `uzmax-admin`.
5. Verify recovery before reopening:
   - api: `/healthz` succeeds and `/readyz` matches expected readiness state.
   - worker: queue backlog, delayed, failed and retry counts are understood; no duplicate customer send path is possible.
   - cron: next heartbeat/job plan is safe and does not double-write.
   - admin: release gate UI loads, GA-0 action remains disabled unless owner opened it through a later approved gate.
6. Attach dry-run or real-drill evidence:
   - command or platform action taken;
   - before/after version IDs;
   - health snapshots;
   - rollback duration;
   - unresolved blockers;
   - owner/external decision needed, if any.

## M6-02 Dry-Run Evidence Rules

- Dry-run evidence may use repo manifests, package commands, health route checks and platform manifests.
- Dry-run evidence must label pending owner/platform decisions explicitly.
- Dry-run evidence must not include secrets, env values, customer messages, order IDs, phone/address/payment data, raw prompts/completions, screenshots with sensitive data or provider keys.
- Dry-run evidence must not mark J-01 closed until every core process has an executable rollback path and a real or owner-approved staging/equivalent drill.

## Failure Branches

| Failure | Required result |
|---|---|
| Any core surface cannot identify a rollback target | J-01 remains failed/open; GA-0 and 1.0 stay locked |
| worker or cron start command is still a placeholder | J-01 remains blocked for that surface; split implementation before real drill |
| queue backlog state is unknown during worker rollback | keep queue consumers paused; record J-02/J-04 blocker |
| `/healthz` or `/readyz` cannot prove API recovery | keep api rollback open; record blocker and incident if customer-facing |
| Vercel admin rollback cannot preserve locked release gate | keep GA-0 locked; split admin/release gate fix |
| platform access, service creation, env or cost decision is missing | record owner/external blocker; do not fake closure |


# Queue Failure Injection Runbook

This runbook covers the synthetic M6-03 queue drill for worker accumulation, retry, idempotency, failed-state alert evidence and order-import abnormal paths.

It is not a production Redis/worker deployment guide and does not approve GA-0, production traffic, real customer/order data, customer LLM, external SaaS onboarding or 1.0 release.

## Scope

| Surface | Included | Excluded |
|---|---|---|
| Order import BullMQ runtime | synthetic duplicate enqueue, retry, failed job, backlog/failed alert snapshot, source lock duplicate/release, cleanup | production queue migration, real order connector, real customer/order payload |
| Worker failure path | injected first-attempt failure and permanent failure in disposable smoke | production incident response or live worker restart |
| Alert evidence | runtime health snapshot alert codes | real paging channel, Sentry routing or owner notification policy |
| Data | controlled synthetic refs only | raw CSV/XLSX, real order IDs, phone/address/payment data, Telegram payloads |

## Preconditions

- Use a disposable Redis/BullMQ-compatible target.
- Set `UZMAX_REDIS_URL` only for the disposable target.
- Do not point this drill at production Redis.
- Do not use real customer/order data.
- Keep output free of secrets and raw payloads.
- Run from a clean assigned worker worktree, not root/main.

## Drill Steps

1. Verify fail-closed behavior when Redis URL is absent:

   ```sh
   env -u UZMAX_REDIS_URL node apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs
   ```

   Expected: non-zero exit and `UZMAX_REDIS_URL is required`.

2. Start a disposable Redis target. In GitHub CI this is `redis:7-alpine` bound to `127.0.0.1:6379`.

3. Run the synthetic smoke:

   ```sh
   UZMAX_REDIS_URL=redis://127.0.0.1:6379 node apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs
   ```

4. Record the evidence link, CI run/job, and final line:

   ```text
   m4-order-import-bullmq-redis-smoke: passed duplicate enqueue, retry, run-scoped lock and health checks; run residue 0
   ```

## Expected Evidence

| Check | Expected evidence |
|---|---|
| Retry | first attempt fails, BullMQ retry completes the deterministic job |
| Idempotency | duplicate deterministic `jobId` enqueue leaves one waiting job and one successful dispatch effect |
| Backlog alert | health snapshot includes `order_import_queue_backlog_high` |
| Failed alert | health snapshot includes `order_import_queue_failed_high` |
| Abnormal path | malformed jobs fail before dispatch; permanent failure reaches failed state |
| Source lock | duplicate lock acquisition fails; release requires matching token |
| Cleanup | queue and run-scoped lock keys are removed; run residue is `0` |

## Failure Branches

| Failure | Action |
|---|---|
| Redis URL missing check does not fail closed | block J-02 and inspect smoke script before retrying |
| retry does not reach completed | block J-02 and split a worker/queue fix spec |
| duplicate enqueue produces more than one successful dispatch effect | block J-02 and split an idempotency fix spec |
| backlog or failed alert code missing | keep J-02 open and split alert-health fix or observability spec |
| run residue is not `0` | block J-02 until cleanup behavior is understood and recorded |
| output contains secret, raw payload or real customer/order data | stop, clean up, and create or reference an incident |
| production Redis or real data was used | stop, preserve safe metadata only, and create an incident before further work |

## Closeout Record

Queue drill closeout must record:

- repo path to `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`;
- PR number and CI run/job;
- whether Redis smoke passed;
- whether duplicate dispatch remained single-effect;
- whether backlog/failed alert codes appeared;
- whether `run residue 0` was observed;
- any blocker or owner/platform decision still open.

## Boundary

Passing this runbook supports J-02 synthetic release-drill evidence. It does not approve production Redis/worker deployment, formal alert routing, real customer/order data, GA-0 or 1.0 release.

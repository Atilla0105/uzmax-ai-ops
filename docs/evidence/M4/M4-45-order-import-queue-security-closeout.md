# M4-45 Order Import Queue Security Closeout Evidence

> spec: `docs/specs/M4-45-order-import-queue-security-closeout.md`
> branch: `codex/m4-45-order-import-queue-security-closeout`
> worktree: `/Users/atilla/Documents/uzmax-m4-45-order-import-queue-security-closeout`
> status: local validation passed except local Docker Redis unavailable; PR CI Redis smoke pending; npm audit remains `unresolved_security_blocker`

## Scope

M4-45 adds an opt-in BullMQ/Redis runtime adapter for the existing M4-24 `order_import_csv_text` dispatch contract. It maps the existing dispatch payload into BullMQ job options, supports explicit enqueue/worker construction, validates jobs before calling an injected handler, adds a Redis-backed Storage source lock with token-checked release, and exposes backlog/failed queue health alerts.

The Redis smoke is synthetic and Redis-only. It requires `UZMAX_REDIS_URL`, enqueues duplicate jobs with deterministic `jobId`, injects a first-attempt failure, proves BullMQ retry succeeds, proves duplicate enqueue does not create a second dispatch success, exercises Storage source lock duplicate/release behavior, verifies backlog/failed health alerts, obliterates queue keys and reports `residue 0`.

This is not production worker deployment, Render Redis creation, formal alert routing, real customer/order data evidence, M4 final owner signoff, GA-0 or 1.0 release approval.

## Audit Status

`npm audit --json` still reports 3 high vulnerabilities:

- `@nestjs/core`
- `@nestjs/platform-express`
- `multer`

The concrete path is `@uzmax/api -> @nestjs/platform-express@11.1.27 -> multer@2.1.1`. A bounded root npm override was attempted before implementation status reporting and did not change the resolved `multer` version or the audit result, so the ineffective override was removed. M4-45 must not claim final security closeout while this remains high.

Current audit decision: `unresolved_security_blocker`.

## Validation

| Command / Check | Result |
|---|---|
| `npm ci` | passed on 2026-06-24; installed 360 packages, audited 381 packages, reported 3 high |
| `node --test scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs` | passed; 5/5 tests |
| `env -u UZMAX_REDIS_URL node apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs` | passed fail-closed check; printed `UZMAX_REDIS_URL is required`, exit `1` |
| Real Redis smoke | not run locally; Docker failed with `failed to connect to the docker API at unix:///Users/atilla/.docker/run/docker.sock`; PR CI Redis smoke pending |
| CI Redis smoke wiring | added for applicable worker/package/CI/test changes and this M4-45 spec/evidence path using disposable `redis:7-alpine` and `UZMAX_REDIS_URL=redis://127.0.0.1:6379` |
| `npm audit --json` | exit `1`; high `3`, total `3`; names `@nestjs/core`, `@nestjs/platform-express`, `multer` |
| `npm run format:check` | passed |
| `npm run guard:prettier-ignore` | passed |
| `npm run typecheck` | passed |
| `npm run lint` | passed |
| `npm run depcruise` | passed |
| `npm run jscpd` | passed; 0 clones |
| `npm run knip` | passed after `package.json#knip` declared the opt-in worker runtime/smoke as worker entries |
| `npm run guard:forbidden-terms` | passed |
| `npm run guard:eval-triggers -- --base origin/main` | passed; no eval-triggering paths changed |
| `npm run guard:doc-triggers` | passed |
| `npm run guard:workspace` | passed |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-45-order-import-queue-security-closeout UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | passed |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-45-order-import-queue-security-closeout.md` | passed post-commit; changedFiles=11; categories config=3/source=2/docs=3/lock=1/test=2; source netLoc=494 |
| `npm test` | passed; 319/319 tests |
| `npm run build` | passed |

## Runtime Assertions

| Check | Expected |
|---|---|
| Adapter startup | no default worker startup; caller must explicitly create queue/worker |
| Runtime config | no env read in `order-import-bullmq-runtime.ts` |
| DB boundary | no `PrismaClient`, DB connection or Storage downloader in runtime adapter |
| Existing contract reuse | enqueue/worker processor uses M4-24 dispatch contract and injected handler |
| Retry evidence | first attempt can fail and BullMQ retry reaches completed state |
| Duplicate evidence | duplicate deterministic `jobId` enqueue does not produce duplicate successful dispatch |
| Storage lock | duplicate source lock fails closed; release requires matching token |
| Health alert | waiting/delayed backlog and failed counts produce alert snapshots |
| Cleanup | Redis queue keys are removed; smoke reports `residue 0` |

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No external order API connector or `order_connector` was added. |
| E-02 | `order_import_queue_runtime_supported_for_m4_no_api_branch` | Existing import snapshot dispatch contract can run through opt-in BullMQ/Redis queue runtime. Production worker deployment and real customer/order evidence remain future owner decisions. |
| E-03 | `order_import_stale_missing_warning_closed_for_m4_no_api_branch` | M4-45 does not change warning shape; it preserves existing dispatch/persistence path boundaries. |
| E-04 | `order_read_runtime_eval_gate_supported_not_production_gate` | No AI eval/runtime change. |
| I-01 | `order_import_operator_and_queue_supported_not_full_desktop_core` | Queue support backs the order import path; broader desktop core and production auth remain future scope. |
| J-02 | `queue_security_closeout_supported_not_production_deployment__unresolved_security_blocker` | BullMQ/Redis runtime, retry/fault, duplicate enqueue, Storage lock and backlog/failed alert evidence are added. Final security closeout is not accepted because npm audit high remains unresolved. |

## Boundary Notes

- No raw CSV/XLSX export, raw customer/order payload, screenshot, real order ID, phone number, address, payment data, credential, token value or env file is committed.
- No external order API, fake connector, LLM/provider, Telegram runtime, production Redis/Render service or real worker deployment is added.
- CI Redis smoke uses a disposable Redis container and `UZMAX_REDIS_URL=redis://127.0.0.1:6379`; it must not print secrets.
- Final M4/security closeout remains blocked until audit high is resolved or explicitly accepted as a tracked blocker by the project owner.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | docs 3, source 2, test 2, config 3, lock 1 |
| Changed files | 11 total |
| Changed source files | 2: `apps/worker/src/order-import-bullmq-runtime.ts`, `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs` |
| Net source LOC | 494 added lines by raw staged numstat (`254` runtime + `240` smoke), within the 500 LOC budget |
| New source files | 2 |
| Gross churn | 1365 total added+deleted lines |
| Test changes | added focused M4-45 runtime test and extended the existing M4 worker test loader |
| Test weakening | none |
| Config rationale | root `package.json#knip` mirrors existing Knip config and adds a worker workspace entry for the opt-in runtime/smoke so static analysis does not require importing BullMQ from `main.ts` |
| External API/provider/connector evidence | none added; BullMQ/ioredis package versions verified through npm registry and local installed types |
| Exceptions | none; audit blocker remains unresolved rather than using an ineffective override |

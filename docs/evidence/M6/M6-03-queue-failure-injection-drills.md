# M6-03 Queue Failure Injection Drills Evidence

## Manifest

| Field | Value |
|---|---|
| evidence_id | `M6-03-queue-failure-injection-drills` |
| milestone | `M6` |
| acceptance_items | `J-02`, `J-04`, `L-01`, `K-03`, `K-04` |
| owner | Project owner decides production Redis/worker deployment, formal alert-channel routing, GA-0 and 1.0 release. AI agent records synthetic drill evidence and blockers. |
| status | `ready_for_review` |
| created_at | `2026-06-26` |
| updated_at | `2026-06-26` |
| source_files | `docs/specs/M6-03-queue-failure-injection-drills.md`; `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`; `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs`; `apps/worker/src/order-import-bullmq-runtime.ts`; `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`; `docs/runbooks/queue-failure-injection.md`; `docs/release.md` |
| sensitive_data_location | none; synthetic Redis/BullMQ drill only |
| redaction_status | no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets |
| review_notes | Records release-level J-02 support from existing M4-45 queue evidence; does not approve production Redis/worker deployment or formal alert routing. |
| signoff | pending project owner review; M5 owner signoff allowed M6 work but did not approve GA-0 or production |

## Status

M6-03 status: `m6_queue_failure_drill_recorded_j02_supported_not_production_deployment`.

This slice records J-02 release-drill evidence from the existing M4-45 BullMQ/Redis order-import smoke. It does not add or change queue runtime source. The drill remains synthetic and disposable; it must not use real customer/order data or production Redis.

## Source Links

| Scope | Repo source |
|---|---|
| M6-03 spec | `docs/specs/M6-03-queue-failure-injection-drills.md` |
| M4-45 queue closeout evidence | `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md` |
| Redis/BullMQ smoke | `apps/worker/scripts/run-m4-order-import-bullmq-redis-smoke.mjs` |
| Queue runtime | `apps/worker/src/order-import-bullmq-runtime.ts` |
| Dispatch contract | `apps/worker/src/order-import-dispatch.ts` |
| Focused runtime test | `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs` |
| M6 runbook | `docs/runbooks/queue-failure-injection.md` |
| Release boundary | `docs/release.md` |

## Drill Coverage

| J-02 requirement | Evidence | Status |
|---|---|---|
| Retry | M4-45 Redis smoke injects a first-attempt handler failure and waits for the deterministic job to reach `completed`. | `supported_by_synthetic_redis_smoke` |
| Idempotency | M4-45 Redis smoke enqueues the same deterministic `jobId` twice and asserts only one waiting job and one successful dispatch effect. | `supported_by_synthetic_redis_smoke` |
| Backlog alert | Runtime health snapshot emits `order_import_queue_backlog_high` when waiting/delayed backlog crosses threshold. | `supported_by_runtime_test_and_smoke` |
| Failed alert | Runtime health snapshot emits `order_import_queue_failed_high` when failed count crosses threshold. | `supported_by_runtime_test_and_smoke` |
| Abnormal worker path | M4-45 runtime test fails closed before dispatch on malformed jobs; Redis smoke creates a permanent failed job and verifies failed-state alert coverage. | `supported_by_runtime_test_and_smoke` |
| Source lock duplicate/release | Redis-backed Storage source lock rejects duplicate acquisition and only releases with matching token. | `supported_by_runtime_test_and_smoke` |
| Cleanup | Redis smoke obliterates run queue and run-scoped lock keys and reports `run residue 0`. | `supported_by_ci_smoke` |

## Existing M4-45 CI Evidence

| Evidence | Result |
|---|---|
| PR CI run | `28056312343` |
| CI job | `83059437609` |
| Redis smoke step | `M4 order import BullMQ Redis smoke` |
| Result | passed |
| Scope | disposable `redis:7-alpine`, `UZMAX_REDIS_URL=redis://127.0.0.1:6379`, synthetic order-import jobs only |

M6-03 intentionally updates the M4-45 evidence cross-reference because that file is already in the CI `redis_smoke_changed` path scope. This PR should therefore rerun the same Redis smoke before merge without adding new CI config.

## Acceptance Mapping

| Item | M6-03 result | Remaining boundary |
|---|---|---|
| J-02 | `release_drill_supported_by_synthetic_bullmq_redis_smoke` | Production Redis/worker deployment, production backlog monitoring and formal alert-channel routing remain not approved. |
| J-04 | `queue_failure_runbook_added` | Other J-04 drills remain for model-all-down, redline bad send, order API outage, RLS misconfig and owner runbook review. |
| L-01 | `ga0_remains_locked` | GA-0 still requires full checklist and explicit owner open decision. |
| K-03/K-04 | `one_spec_one_pr_serial_queue_drill` | M6-04 must start in its own spec/branch/PR after M6-03 closeout. |

## Validation

| Command / Check | Result |
|---|---|
| `node --test scripts/tests/m6-queue-failure-injection-drills.test.mjs` | passed; 4/4 tests |
| `prettier --check .` | passed |
| `node scripts/guards/prettier-ignore-boundary.mjs --base origin/main` | passed |
| `node scripts/guards/doc-trigger-paths.mjs` | passed |
| `node scripts/guards/eval-trigger-paths.mjs --base origin/main` | passed; no eval-triggering paths changed |
| `node scripts/guards/forbidden-terms.mjs` | passed |
| `node scripts/guards/workspace-isolation.mjs` | passed |
| `node scripts/guards/worker-write-boundary.mjs` | passed with assigned worktree and primary root |
| `node node_modules/eslint/bin/eslint.js ...` | passed |
| `node node_modules/dependency-cruiser/bin/dependency-cruise.mjs apps packages --config dependency-cruiser.config.cjs` | passed |
| `node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips` | passed; 0 clones |
| `node node_modules/knip/bin/knip.js -c package.json#knip --no-progress --duration --no-config-hints --no-tag-hints` | passed |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6-03-queue-failure-injection-drills.md` | pending post-commit; pre-commit staged changes are not included by this guard without a commit |
| PR CI Redis smoke | pending before PR; expected because M6-03 touches `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md` |

Local full-suite limitations:

- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` is blocked in this checkout because the shared root `node_modules` is missing `bullmq`; CI `npm ci` is required for the final typecheck signal.
- `node --test scripts/tests/*.test.mjs` reports 394/399 passing locally, with failures caused by the same missing `bullmq` and guard fixture subprocesses using `/usr/bin/env node` while this shell has no global `node`. CI runs after `npm ci` and remains the merge gate.

## Remaining Gaps

- Production Redis/worker deployment is not approved.
- Formal alert-channel routing for queue backlog is not approved or closed by this slice.
- This slice does not prove Telegram/customer-message queue production behavior.
- This slice does not close J-01 deploy/rollback, J-03 backup/restore, full J-04 runbook drill list, L-01 GA-0 or L-02 redline incident handling.
- M6-04 must start separately and must not be bundled into this PR.

## No Sensitive Data Statement

M6-03 uses only synthetic order-import job payloads and repo evidence. No raw customer/order exports, real order IDs, phone numbers, addresses, payment data, Telegram payloads, screenshots, voice transcripts, raw prompts/completions, LLM keys, service tokens or env files are committed.

## PR Hygiene

| Metric | Result |
|---|---|
| Path categories | docs + test only |
| Changed source files | 0 |
| Net source LOC | 0 |
| New source files | 0 |
| Test changes | focused M6-03 evidence/runbook/smoke-contract test |
| Test weakening | none |
| Generated/lock/config changes | none |
| External API/provider/connector evidence | none added; M4-45 remains the underlying BullMQ/ioredis evidence |
| Exceptions | none |

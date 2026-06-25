# Runbook: Core Operations Synthetic E2E

## Scope

Use this runbook to replay the M6-07 repo-level synthetic operations path before GA-0 review.

This runbook does not approve GA-0, production traffic, real customer/order data, customer LLM, real provider calls, production Redis/worker deployment, external SaaS onboarding or 1.0 release.

## Safe Evidence Inputs

Use only controlled refs and repo evidence paths:

- conversation ref: `conversation://m6-07-core-ops`
- ticket ref: `ticket://m6-07-handoff`
- customer ref: `customer://m6-07-alpha`
- identity ref: `identity://m6-07-alpha-primary`
- order snapshot ref: `snapshot://m6-07-order`
- confirmation ref: `confirmation://m6-07-decision`
- audit/log refs: `audit://m6-07-*`, `log://m6-07-*`

Do not paste raw Telegram payloads, customer plaintext, exports, screenshots, voice transcripts, phone/address/payment data, real order IDs, support personal accounts, Bot tokens, webhook secrets, prompts/completions, LLM keys or provider secrets into repo evidence.

## Release Drill Commands

Run the focused M6-07 evidence contract first:

```bash
node --test scripts/tests/m6-core-ops-synthetic-e2e.test.mjs
```

Then run supporting path checks when local dependencies are available:

```bash
node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs
node --test scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs
node --test scripts/tests/m4-customer-asset-runtime-workflow.test.mjs
node --test scripts/tests/m4-order-import-operator-workflow.test.mjs
node --test scripts/tests/m4-order-read-runtime-eval-gate.test.mjs
node --test scripts/tests/m5-confirmation-queue-api.test.mjs
node --test scripts/tests/m5r-formal-write-pipeline.test.mjs
node --test scripts/tests/m5r-logs-analytics-runtime.test.mjs
node --test scripts/tests/m5r-admin-runtime-wiring.test.mjs
```

## Replay Path

1. Conversation and ticket:
   Verify M2 evidence covers conversation filters, handoff ticket draft, AI suspended state, in-flight AI cancel semantics, ticket actions and HTTP error hardening.

2. Customer asset:
   Verify M4-43 evidence covers list/detail, identity, fields, tags, controlled related refs, restore writeback, audit persistence, tenant isolation and permission failure.

3. Order snapshot:
   Verify M4-37/M4-42 evidence covers admin/API/Storage metadata submit, row error visibility, fresh snapshot readback, stale/missing handoff and residue cleanup.

4. No-fabrication:
   Verify M4-44 and M6-05 evidence keep missing/stale/degraded order reads in handoff/no-status-ref behavior.

5. Confirmation and formal write:
   Verify M5-03/M5-04/M5R-01/M5R-02 evidence keeps human confirmation, diff enforcement and named formal-write boundaries visible.

6. Logs and admin visibility:
   Verify M5-06/M5R-05/M5R-07/M5R-08 evidence covers fixed board, login/presence/operation logs, controlled export draft and admin runtime API paths.

7. Release boundary:
   Verify `docs/evidence/M6/README.md` and `docs/release.md` still say GA-0 is closed and list remaining gaps.

## Failure Branches

| Failure | Required action |
|---|---|
| A stage lacks merged source/test/evidence | Keep the stage open and split a later spec. |
| Replay requires runtime/source/schema/provider edits | Stop this docs/test slice and create an implementation spec. |
| Raw customer/order/TG/secret material is needed | Stop and move source material to owner-controlled storage; do not commit it. |
| The path exposes D-06/I-03/I-04/I-05/H-01/H-05/H-06 release gaps | Keep GA-0/1.0 closed and classify the gap for M6-08/M6-09. |
| A run produces real customer traffic or real provider calls | Stop the drill, record an incident if threshold is met, and wait for owner direction. |
| Evidence wording implies GA-0, production or 1.0 approval | Fix wording before merge; Linear is tracking only and cannot override repo evidence. |

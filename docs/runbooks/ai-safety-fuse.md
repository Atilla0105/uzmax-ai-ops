# Runbook: AI Safety Fuse

## Scope

Use this runbook for release drills or incidents involving model-all-down, redline bad send, unsafe output, eval-gate bypass attempts, AI member emergency stop, AI fuse radius or recovery.

This runbook does not approve real customer LLM, provider keys, GA-0, production traffic or 1.0 release. Real customer messages, screenshots, voice transcripts and customer profiles must not enter third-party LLM providers while ADR-003 remains `accepted_dev_only__customer_llm_blocked`.

## Release Drill Commands

Run the repo-level synthetic drills before GA-0 review:

```bash
node --test scripts/tests/m6-ai-safety-eval-gates.test.mjs
node --test scripts/tests/eval-gate.test.mjs
node --test scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs
node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs
node --test scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs
node --test scripts/tests/m4-order-read-no-fabrication-eval-contract.test.mjs
node --test scripts/tests/m4-order-read-runtime-eval-gate.test.mjs
node --test scripts/tests/m5r-ai-member-runtime-control.test.mjs
```

If true DB/runtime smoke is required for AI member control, run only in dev/staging with a masked `UZMAX_RLS_DATABASE_URL`:

```bash
node packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs
```

## Model All Down

1. Confirm the failure is model/provider-route scoped, not Bot ingress or API health.
2. Verify the route has no successful provider and accounting records `failed`, zero cost/tokens, attempted providers and trace ID.
3. Close customer-facing AI answer generation for affected tasks.
4. Open handoff/ticket path or draft hold; do not emit a fabricated customer answer.
5. Record controlled evidence refs only: trace ID, route ref/version, provider refs, redaction policy and ticket/draft refs.
6. Do not paste raw prompt/completion, customer plaintext, provider key, stack trace with secrets or provider request body into repo evidence.

## Redline Bad Send

1. Treat any unsafe output, internal config/economics leak or raw prompt/system/model-route leak as release blocking.
2. Suppress outbound answer and preserve only controlled audit refs.
3. Put the AI member into emergency stop or scoped fuse state according to the radius decision.
4. Create or verify a ticket/draft hold so the customer side is not silent or exposed to raw failure details.
5. Keep F-05/L-02 open until the unsafe output is not echoed and the ticket/handoff path is evidenced.

## AI Fuse And Recovery

1. Classify radius: single user, user+capability, capability, or global.
2. Single-user attack must not trigger global shutdown.
3. Capability repeated failure must disable only the named capability.
4. Cross-user/cross-capability/systemic risk must trigger global breaker and safe degradation.
5. Recovery requires controlled reason refs and, where capability enabling is involved, a passed existing eval gate.
6. Recovery must write audit evidence; it must not publish a new prompt, knowledge item, model route or persona.

## Failure Branches

| Failure | Required action |
|---|---|
| Model-all-down still emits customer-facing answer | Close GA-0/release authorization; force handoff/ticket behavior before reopening. |
| Unsafe redline output is echoed in logs, traces or response | Close GA-0/release authorization; remove echo path and prove controlled refs only. |
| Eval-gate bypass allows prompt/knowledge/model route/persona production publish | Close GA-0/release authorization; fix gate before any AI release. |
| AI fuse radius escalates single-user attack globally or misses systemic risk | Close GA-0/release authorization; fix radius decision and rerun drill. |
| Capability enable bypasses passed eval-gate evidence | Keep AI member recovery/capability release closed. |
| G-04 language blind review or G-06 full-set evidence is missing | Record risk item and defer final acceptance; do not silently mark closed. |
| Drill requires real customer data or LLM keys in repo | Stop and move handling to owner-controlled storage; do not commit sensitive data. |

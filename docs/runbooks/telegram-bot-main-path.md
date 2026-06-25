# Runbook: Telegram Bot Main Path

## Scope

Use this runbook for Telegram Bot-only GA-0 main-path drills and bot-no-response incidents.

This runbook does not approve GA-0, production traffic, real customer data, Telegram Business automatic reply, production Bot token, production webhook secret, support personal accounts, customer LLM or 1.0 release.

## Release Drill Commands

Run the repo-level synthetic drills before GA-0 review:

```bash
node --test scripts/tests/m6-bot-ga0-main-path-readiness.test.mjs
node --test scripts/tests/m2-telegram-bot-ingress.test.mjs
node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs
node --test scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs
node --test scripts/tests/m6-queue-failure-injection-drills.test.mjs
node --test scripts/tests/m6-ai-safety-eval-gates.test.mjs
```

## Bot No Response

1. Confirm API health before treating the incident as Telegram-specific: check `/healthz` and `/readyz`.
2. Check whether the webhook secret is configured. Missing or mismatched `X-Telegram-Bot-Api-Secret-Token` must fail closed and must not enqueue.
3. Check queue posture. `DisabledTelegramBotIngressQueue` means the runtime is intentionally not configured and GA-0 must stay closed.
4. For synthetic/test ingress, record controlled refs only: `providerUpdateId`, `updateKind`, `contentKind`, conversation/ticket refs, trace/audit refs and PR/CI refs.
5. Do not paste raw Telegram payloads, customer plaintext, support personal accounts, Bot tokens, webhook secrets or screenshots into repo evidence.
6. If the Bot cannot safely answer, open or verify manual handoff/ticket path. Customer-facing silence or raw error exposure keeps L-02 open.

## Duplicate And Out Of Order Ingress

1. Use Telegram `update_id` / normalized `providerUpdateId` as the dedupe and trace handle.
2. Duplicate `update_id` must return `deduped` and must not create a second queue job.
3. Out-of-order updates must remain bounded and traceable; if ordering changes the user-visible answer, stop AI response and create a handoff/ticket.
4. Do not claim DB-backed ordering/restore until a later DB/worker spec proves it.

## Business Disabled Handling

1. Telegram Business updates must stay `unsupported` / `telegram_business_deferred`.
2. Business entry, API, draft-send and automatic reply paths must remain unavailable under ADR-B01.
3. If any Business send path becomes visible or callable, close GA-0/release authorization and fix C-03b before reopening.
4. Future Business work requires owner-provided real account evidence and a new spec/ADR revision.

## Manual Escalation

1. Create or verify a handoff ticket using controlled conversation refs only.
2. Expected state: conversation `pending_handoff`, AI suspended, in-flight AI messages `withdrawn` or `pending_cancel`.
3. Ticket must carry summary, suggested action and SLA policy ref; SLA is a config placeholder, not an LLM promise.
4. Use ticket claim/lock/note/escalate/close/reopen flow for operator action. Lock conflicts must fail closed.
5. Real customer notification and production Bot leave-ticket message remain final GA-0 preflight evidence, not this runbook's repo-local proof.

## Failure Branches

| Failure | Required action |
|---|---|
| Secret missing/mismatch still enqueues | Close GA-0/release authorization; fix webhook fail-closed behavior. |
| Duplicate `update_id` creates a second job | Keep C-01/C-02 open; split a dedupe fix spec. |
| Out-of-order update causes an unsafe answer | Stop AI response, create handoff/ticket and keep ordering/worker evidence open. |
| Business update opens draft-send or auto-reply path | Keep C-03b open and close GA-0/release authorization. |
| Manual handoff does not suspend AI or cancel in-flight messages | Keep C-06/L-02 open; split handoff/engine fix spec. |
| Evidence requires real customer data or tokens in repo | Stop and move source material to owner-controlled storage; do not commit sensitive data. |

# M6-06 Telegram Bot GA-0 Main Path Evidence

Spec: `docs/specs/M6-06-telegram-bot-ga0-main-path.md`
Tracking issue: Linear LAY-11
Status: `m6_bot_ga0_main_path_recorded_c01_c02_c03b_c06_supported_not_ga0`
Recorded: 2026-06-26

## Boundary

This evidence records repo-level Telegram Bot-only GA-0 main-path readiness from synthetic/test evidence. It does not approve GA-0, production deployment, real customer traffic, raw Telegram payloads, production Bot token, production webhook secret, support personal accounts, customer LLM, Telegram Business automatic reply, Business draft-send implementation, production worker/queue deployment or 1.0 release.

No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys, Bot tokens or webhook secrets are stored here.

## Source Manifest

| Area | Source |
|---|---|
| Acceptance matrix | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| PRD Bot/Business boundary | `UZMAX智能运营系统-PRD-v1.1.md` |
| GA-0 rules | `UZMAX智能运营系统-技术架构-v1.1.md` |
| Bot webhook core | `apps/api/src/telegram-bot.ts`; `packages/channels/src/index.ts` |
| Bot ingress evidence | `docs/evidence/M2/M2-02-telegram-bot-ingress-dedupe-queue.md`; `scripts/tests/m2-telegram-bot-ingress.test.mjs` |
| Handoff/ticket contract | `packages/capabilities/handoff/src/index.ts`; `apps/api/src/conversation-ticket.service.ts`; `apps/api/src/conversation-ticket.controller.ts` |
| Handoff/ticket evidence | `docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md`; `docs/evidence/M2/M2-07-conversation-ticket-api-http-hardening.md`; `scripts/tests/m2-conversation-ticket-api-contract.test.mjs` |
| Admin conversation/ticket shell | `docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md` |
| Business disabled branch | `docs/adr/ADR-B01-telegram-business.md`; `docs/evidence/M2/spikes/SPK-01-telegram-business/manifest.md` |
| Queue release dependency | `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`; `docs/runbooks/queue-failure-injection.md` |
| AI safety dependency | `docs/evidence/M6/M6-05-ai-safety-eval-gates.md`; `docs/runbooks/ai-safety-fuse.md` |
| M6 runbook | `docs/runbooks/telegram-bot-main-path.md` |

## Main-Path Trace Contract

| Stage | Traceable artifact | Current evidence | Remaining gap |
|---|---|---|---|
| Webhook ingress | `providerUpdateId`, update kind, content kind, controlled chat/message/participant refs | M2-02 normalizes text, image, voice and callback updates without raw payload retention. | Real staging Bot webhook evidence remains owner/platform dependent. |
| Secret and queue boundary | `accepted`, `deduped` or `unsupported` queue result | M2-02 fails closed on missing/mismatched secret, dedupes duplicate `update_id` and keeps unsupported updates out of queue jobs. | Default app queue remains disabled; DB-backed dedupe/worker consumer remains future scope. |
| Duplicate/out-of-order safety | `providerUpdateId` for dedupe/trace | Duplicate ingress is deduped; out-of-order updates remain bounded and traceable rather than raw-retained. | Ordering/restore semantics are not closed without DB-backed dedupe/worker evidence. |
| Manual escalation | conversation ref, ticket ref, SLA policy ref, event refs | M2-03 creates handoff ticket draft, marks conversation `pending_handoff`, sets AI suspended and marks in-flight AI messages `withdrawn` or `pending_cancel`. | Real Bot leave-ticket drill and production notification path remain later M6/final scope. |
| Business boundary | unsupported/deferred reason and ADR-B01 refs | Business updates are classified as `telegram_business_deferred`; ADR-B01 keeps Business module closed. | Future Business re-open requires real owner-provided accounts and new spec/ADR evidence. |

## Acceptance Matrix Mapping

| Item | Current M6-06 release status | Evidence |
|---|---|---|
| C-01 Bot normal path | `synthetic_bot_ingress_supported_not_staging_bot_closed` | M2-02 covers Bot text, image, voice and callback normalization, secret fail-closed and queue-port `accepted`/`deduped` results. Staging Bot, outbound send, worker processing and production config remain open. |
| C-02 Bot edge path | `safe_unsupported_and_dedupe_contract_supported_not_full_edge_closed` | Unsupported and Business updates return safe unsupported/deferred classification; duplicate `update_id` is deduped. Blocked Bot/unreachable real Telegram cases and DB-backed out-of-order restore remain open. |
| C-03 / C-04 / C-05 Business feasible branch | `not_current_branch_by_adr_b01` | ADR-B01/SPK-01 records `no_go_owner_inputs_missing`; current branch must not claim Business feasibility, draft-send or support-person anti-race behavior. |
| C-03b Business disabled branch | `supported_by_adr_b01_and_deferred_update_contract` | ADR-B01 makes C-03b the current P0 Business branch; Bot ingress classifies Business updates as unsupported/deferred and no Business auto-reply launch is approved. |
| C-06 takeover / in-flight AI | `supported_by_handoff_contract_not_real_worker_concurrency_closed` | M2-03 handoff marks `pending_handoff`, AI suspended and in-flight AI messages `withdrawn`/`pending_cancel`. Real engine/worker concurrency remains future evidence. |
| D-02 / D-03 manual ticket path | `contract_supported_not_full_e2e_closed` | M2-03/M2-07 cover ticket summary, suggested action, SLA placeholder, claim/lock/note/escalate/close/reopen and HTTP errors. Real repository, notification and full admin E2E remain final scope. |
| J-04 Bot no response runbook | `bot_no_response_runbook_added` | `docs/runbooks/telegram-bot-main-path.md` covers bot no response, duplicate/out-of-order ingress, Business-disabled handling and manual escalation failure branches. |
| L-01 GA-0 checklist | `not_open` | M6-06 records Bot-only readiness inputs; GA-0 remains locked until all checklist items are green and project owner explicitly opens it. |
| L-02 redline/fuse leave-ticket path | `bot_handoff_contract_supported_real_bot_leave_ticket_pending` | M6-05 covers AI safety/fuse; M6-06 links handoff/ticket contract. Real Bot leave-ticket behavior remains M6-09/final GA-0 preflight scope. |

## Release Drill Matrix

| Drill | Expected result | Repo evidence |
|---|---|---|
| Bot webhook accepted | Valid synthetic message/callback/image/voice with matching secret normalizes to bounded ingress and returns `accepted`. | `scripts/tests/m2-telegram-bot-ingress.test.mjs`; `apps/api/src/telegram-bot.ts` |
| Duplicate ingress | Same `update_id` returns `deduped` and does not enqueue a second job. | M2-02 focused test and evidence |
| Unsupported / Business update | Unsupported update returns `unsupported`; Business update is `telegram_business_deferred`; no Business auto-reply path opens. | `packages/channels/src/index.ts`; ADR-B01/SPK-01 |
| Manual escalation | Handoff creates ticket draft, AI suspended state and canceled in-flight AI messages. | `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`; M2-03 evidence |
| Bot no response | Operator checks API health, webhook secret, disabled queue/readiness, queue result and then opens handoff/ticket/manual path. | `docs/runbooks/telegram-bot-main-path.md` |

## Remaining Risk Items

- Real staging/production Telegram Bot webhook evidence is not recorded in repo.
- Default app queue is still disabled unless a later runtime provider is configured.
- DB-backed dedupe, ordering/restore, worker consumer and engine orchestration remain future scope.
- Outbound Bot sending and customer-visible leave-ticket message are not proven by this slice.
- Business auto-reply remains disabled; Business feasibility can only reopen through new owner-provided real-account evidence and spec/ADR revision.
- GA-0 remains locked and requires an explicit project owner open decision after all checklist items are green.

## Validation Commands

Focused validation for this PR:

```bash
node --test scripts/tests/m6-bot-ga0-main-path-readiness.test.mjs
```

Supporting release evidence commands:

```bash
node --test scripts/tests/m2-telegram-bot-ingress.test.mjs
node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs
node --test scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs
node --test scripts/tests/m6-queue-failure-injection-drills.test.mjs
node --test scripts/tests/m6-ai-safety-eval-gates.test.mjs
```

# M2-02 Telegram Bot Ingress Dedupe Queue

> evidence_id: M2-02-telegram-bot-ingress-dedupe-queue
> milestone: M2
> spec: `docs/specs/M2-02-telegram-bot-ingress-dedupe-queue.md`
> status: implemented_local_validation_passed
> created_at: 2026-06-17
> updated_at: 2026-06-17
> sensitive_data_location: none
> redaction_status: no raw customer data, Telegram payload files, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts, or token values

## Scope

This evidence records only the M2-02 Telegram Bot ingress baseline:

- Bounded Telegram Bot `Update` normalization in `packages/channels/src/index.ts`.
- Minimal webhook core plus default Nest fail-closed shell at `POST /telegram/bot/webhook`.
- `X-Telegram-Bot-Api-Secret-Token` fail-closed secret validation.
- Explicit queue port with in-memory test implementation and disabled default module provider.
- Local queue-port dedupe by Telegram `update_id` / `providerUpdateId`.
- Safe `unsupported` / Business-deferred classification.

Not included:

- DB schema changes, DB-backed dedupe repository, Telegram Business feasibility/adapter/schema/feature flag, outbound Bot sending, conversation engine, handoff/ticket API, admin UI, worker consumer processing, WebSocket, real Redis/BullMQ, LLM, prompts, model routing, distill, production deployment, GA-0, real customer traffic, or raw payload/customer samples.

## External API Evidence

Official source: Telegram Bot API official docs, https://core.telegram.org/bots/api.

Facts used in this PR:

- Telegram webhooks deliver HTTPS POST requests containing JSON-serialized `Update`.
- Telegram retries webhook delivery when the response is not 2xx.
- `Update` includes update types such as `message` and `callback_query`.
- `allowed_updates` can limit which update types the bot receives.
- `update_id` is the update identifier used to ignore repeated updates or restore order when webhook updates arrive out of order.
- `secret_token` is delivered as `X-Telegram-Bot-Api-Secret-Token`.

No blogs or unofficial Telegram behavior are used.

## TDD Evidence

| Step | Command | Result | Summary |
|---|---|---|---|
| RED | `node --test scripts/tests/m2-telegram-bot-ingress.test.mjs` | failed as expected | Missing `apps/api/src/telegram-bot.ts`; focused test failed before implementation |
| GREEN | `node --test scripts/tests/m2-telegram-bot-ingress.test.mjs` | passed | 4/4 tests passed after normalizer, pure webhook core, queue port, AppModule fail-closed shell and contract docs implementation |

## Contract Behavior

| Behavior | Evidence |
|---|---|
| bounded normalization | focused test covers text, photo/image, voice, callback, unsupported and Business-deferred updates |
| no raw payload retention | focused test seeds extra raw field and asserts it is absent from normalized queue jobs |
| secret fail closed | focused test covers missing configured secret and mismatched header; both reject and do not enqueue |
| dedupe | focused test sends the same `update_id` twice and asserts one queued job plus `deduped` response |
| unsupported safe 2xx | focused test sends unsupported update and asserts `unsupported` response without queue job |
| default queue posture | focused test and AppModule wiring assert default provider is disabled, not real Redis/BullMQ |

## Acceptance Mapping

| Item | M2-02 status | Notes |
|---|---|---|
| C-01 | foundation_partial_evidence | Bot text/image/voice/callback normalize and hand off to explicit queue port with local dedupe; staging bot, DB dedupe and worker processing remain later |
| C-02 | foundation_partial_evidence | Unsupported/deferred updates return safe contract without retry loop; unreachable/blocking and broader Telegram edge cases remain later |
| C-03 / C-04 / C-05 | remains_SPK-01 | Business updates are deferred unsupported; SPK-01 / ADR-B01 remains the Business feasibility path |
| D-01 | not_closed | Conversation filters/states remain M2-04 |
| D-02 | not_closed | Handoff/ticket creation, summary, SLA and notification remain M2-03 |
| D-03 | not_closed | Claim/lock/note/escalate/close/reopen remain M2-03/M2-04 |
| I-01 | not_closed | Desktop conversation/ticket workflows remain M2-04 and broader 1.0 |
| I-04 | not_closed | WS/realtime or degraded polling evidence remains M2-05 |
| J-05 | active | This manifest records M2-02 milestone evidence |
| K-03 | active | One spec / one PR |
| K-04 | active | Touch list is explicit; `packages/db` remains untouched |

## Validation

| Command | Result | Summary |
|---|---|---|
| `node --test scripts/tests/m2-telegram-bot-ingress.test.mjs` | pass | 4/4 focused tests passed |
| `npm run format:check` | pass | Prettier check passed |
| `npm run typecheck` | pass | TypeScript check passed |
| `npm run lint` | pass | ESLint check passed |
| `npm run depcruise` | pass | no dependency violations found |
| `npm run jscpd` | pass | no duplicates found |
| `npm run knip` | pass | no unused files, exports or unlisted dependencies after pure-core/type-only AppModule anchor fix |
| `npm run test` | pass | 50/50 tests passed; negative guard fixtures printed expected failure text inside passing tests |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok` |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-02-telegram-bot-ingress-dedupe-queue.md` | pass | 7 changed files; categories source 3 / docs 3 / test 1; source net LOC 451; new source files 1 |
| `npm run build` | pass | API/worker/cron typecheck and admin Vite build passed |

## Boundary Review

- No `packages/db/**` files changed; DB-backed dedupe remains later repository work.
- No `packages/engine/**`, `packages/capabilities/**`, `apps/admin/**`, `apps/worker/**`, configs, generated files, lockfile or raw payload/customer sample files changed.
- No outbound Bot sending, Business automation, real Redis/BullMQ, LLM, prompt, model route, production deployment, GA-0 or real customer traffic was implemented.
- Default `AppModule` maps `/telegram/bot/webhook` to a disabled fail-closed shell via a type-only contract import; tests instantiate `TelegramBotWebhookCore` with `InMemoryTelegramBotIngressQueue` directly. Real queue provider/runtime wiring remains later work.

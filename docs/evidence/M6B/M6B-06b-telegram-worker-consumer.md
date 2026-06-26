# M6B-06b Telegram Worker Consumer Evidence

> evidence_id: M6B-06b-telegram-worker-consumer
> status: in_progress_not_ga0
> redaction_status: no Bot token, webhook secret, DB URL, raw Telegram payload, customer/order data, outbound send or production endpoint stored

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-06b-telegram-worker-consumer` |
| assigned branch | `codex/m6b-06b-telegram-worker-consumer` |
| base | `main` after M6B-06a merge at `8316829` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` remained coordination-only |
| M6B-06a prerequisite | PR #147 squash-merged after CI success; merge SHA `83168294fbc658e09500efbcbf95920bf1c66ab0` |

## Runtime Gap

M6B-06 staging-equivalent webhook work proved API ingress and Redis enqueue, but the current worker service shell only started the order-import worker. That left `telegram-bot-conversation` jobs waiting in Redis unless the conversation processor was invoked directly by tests.

## Change

`apps/worker/src/worker-service-shell.ts` now supports explicit multi-queue startup:

- default: `order-import`;
- opt-in: `UZMAX_WORKER_QUEUES=telegram-bot-conversation`;
- combined: `UZMAX_WORKER_QUEUES=order-import,telegram-bot-conversation`.

The Telegram Bot worker uses the existing `createTelegramBotConversationBullmqWorker()` and existing `PrismaTelegramBotConversationPersistenceGateway`.

Persistence behavior:

- default Bot persistence mode: `rls_prisma_gateway`;
- default Bot mode requires `UZMAX_RLS_DATABASE_URL`;
- explicit artifact-smoke mode: `UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE=telemetry`.

M6B-06b also adds:

- a CI true DB/RLS runner for synthetic webhook core -> BullMQ Redis -> worker service shell -> DB/RLS ticket readback;
- CI wiring with a disposable Redis container and masked `UZMAX_RLS_DATABASE_URL`.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m6b-worker-telegram-consumer.test.mjs` | passed | 3/3 focused static contract tests passed. |
| `npm run typecheck` | passed | Root TypeScript no-emit check passed. |
| `npm run lint` | passed | ESLint passed after removing duplicate global annotation. |
| `npm run depcruise` | passed | No dependency-cruiser violations. |
| `npm run knip` | passed | DB BullMQ dependency metadata registered. |
| `npm --workspace @uzmax/worker run build` | passed | Worker artifact compile passed. |
| `env -u UZMAX_RLS_DATABASE_URL UZMAX_REDIS_URL=redis://127.0.0.1:6379 node packages/db/scripts/run-m6b-webhook-worker-true-db-smoke.mjs` | expected fail-closed | Throws `Error: UZMAX_RLS_DATABASE_URL is required` before opening a DB connection. |
| `npm run guard:forbidden-terms` | passed | forbidden-terms: ok. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M6B-06b-telegram-worker-consumer.md --include-worktree` | passed | 11 changed files; source 3, config 4, lock 1, docs 2, test 1; within spec budget. |
| GitHub Actions `M6B webhook to worker true DB smoke` | pending PR CI | Expected to run with masked `UZMAX_RLS_DATABASE_URL` and disposable Redis after PR creation. |

## Boundary

M6B-06b wires the worker consumer and adds synthetic full-chain verification support. True queue/worker/DB/RLS closure is only claimable after PR CI passes the new masked-secret `M6B webhook to worker true DB smoke`.

This does not approve outbound Bot send, production deployment, real customer/order data, ephemeral tunnel completion evidence, GA-0 or 1.0.

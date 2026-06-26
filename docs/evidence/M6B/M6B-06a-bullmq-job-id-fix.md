# M6B-06a BullMQ Bot Job ID Fix Evidence

> evidence_id: M6B-06a-bullmq-job-id-fix
> status: validated_not_ga0
> redaction_status: no Bot token, webhook secret, raw Telegram payload, DB URL, customer/order data, outbound send or production endpoint stored

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-06-bullmq-job-id-fix` |
| assigned branch | `codex/m6b-06-bullmq-job-id-fix` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |

## Runtime Blocker

During staging-equivalent webhook enqueue, API returned HTTP 500 and the API log showed:

`Custom Id cannot contain :`

The failing path was the real BullMQ `Queue.add()` call used by `apps/api/src/telegram-bot.ts`.

## Fix

`packages/channels/src/index.ts` now uses `__` as the stable Bot conversation job ID delimiter instead of `:`.

The generated job ID still includes:

- static prefix `telegram-bot`;
- org id;
- tenant id;
- channel connection id;
- provider update id.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m6b-conversation-runtime.test.mjs` | pass | 4/4 tests passed; job ID assertion now checks no `:` appears. |
| `node --test scripts/tests/m6b-equivalent-bot-webhook-drive.test.mjs` | pass | 2/2 tests passed; duplicate webhook-equivalent jobs keep the same BullMQ-safe job ID. |
| fixed API artifact on port `3001` + Redis | pass | Synthetic webhook returned HTTP 201 with `status: accepted`; Redis queue had waiting count `1` and job key used `__` delimiters. |

## Closeout

M6B-06a is validated as a narrow fix. M6B-06 still requires real Telegram delivery evidence and DB/RLS ticket readback before it can be marked passed.

## Boundary

This evidence removes a real BullMQ enqueue compatibility blocker only. It does not claim real Telegram delivery, DB/RLS ticket readback, outbound send, production deploy, GA-0 or 1.0.

# M6B-04 Thin Staging Render Env Evidence

> evidence_id: M6B-04-thin-staging-render-env
> spec: `docs/specs/M6B-04-thin-staging-render-env.md`
> status: repo_wiring_ready_live_render_deploy_pending
> created_at: 2026-06-26
> sensitive_data_location: none; this file contains no secret values, Telegram tokens, webhook secret values, DB URLs, customer data, order data or raw Telegram payloads

## Start Evidence

| Check | Result |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Applications/UZMAX智能运营-m6b-04-staging-render-env` |
| assigned branch | `codex/m6b-04-staging-render-env` |
| assigned `git status --short --branch` before edits | `## codex/m6b-04-staging-render-env` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before slice | `## main...origin/main` |
| unmerged branch audit before slice | no output from `git branch --no-merged main` |
| remote branch conflict audit | no existing `origin/codex/m6b-04-staging-render-env` |

## Repo Wiring

| Area | Result |
|---|---|
| API service | `render.yaml` injects `UZMAX_REDIS_URL` from Render Key Value `uzmax-redis`; sets `UZMAX_TELEGRAM_BOT_INGRESS_QUEUE_MODE=bullmq`; requires `TELEGRAM_BOT_WEBHOOK_SECRET` through `sync: false`; uses synthetic org/tenant/channel IDs. |
| Worker service | `render.yaml` injects the same `UZMAX_REDIS_URL`; starts `telegram-bot-conversation` queue only; sets `UZMAX_WORKER_TELEGRAM_BOT_PERSISTENCE_MODE=telemetry` to avoid DB/customer-data writes in staging without a staging DB. |
| Redis | `uzmax-redis` remains Render Key Value with `maxmemoryPolicy: noeviction` and no external IP allowlist. |
| Cron | Existing cron service definition is unchanged; this slice does not claim cron live heartbeat evidence. |

## Boundary

This evidence is not a live staging deploy pass yet. It only records that `main` can create a Render staging API/worker/cron/Redis Blueprint with the minimum API/Redis wiring needed for the Telegram test bot replacement path.

Live pass evidence still requires all of the following after merge:

- Render Blueprint services created or updated from `main`.
- `TELEGRAM_BOT_WEBHOOK_SECRET` set in Render without printing the value.
- API external base URL recorded without secrets.
- `GET /healthz` returns HTTP 200 from the Render API URL.
- `POST /telegram/bot/webhook` accepts a safe synthetic update with the secret header, or the documented failure is recorded before Telegram `setWebhook`.
- Only then may LAY-27 replace the Telegram test bot webhook URL and verify `getWebhookInfo`.

## Red Lines

- No production deploy.
- No outbound Telegram send.
- No real customer traffic.
- No real customer/order data.
- No DB/RLS staging proof claimed by telemetry worker mode.
- No ephemeral tunnel completion evidence.
- No secret values printed or committed.

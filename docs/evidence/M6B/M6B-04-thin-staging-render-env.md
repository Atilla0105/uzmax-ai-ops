# M6B-04 Thin Staging Render Env Evidence

> evidence_id: M6B-04-thin-staging-render-env
> spec: `docs/specs/M6B-04-thin-staging-render-env.md`
> status: live_api_base_health_pass_readyz_fail_closed_worker_cron_open_not_ga0
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

## Post-live Staging Sync

Recorded by M6B-09a on 2026-06-26 after the live staging carrier and Telegram test bot webhook hygiene path completed in Linear.

| Check | Result | Boundary |
|---|---|---|
| Durable API base | `https://uzmax-api-staging.onrender.com` | Staging API web service only; not production. |
| `GET /healthz` | HTTP 200; body reports `service=api`, `status=ok`. | Health only; not readiness or GA-0. |
| `GET /readyz` | HTTP 503; body reports `authz=not_configured` and `identity=not_configured`. | Remains not pass. |
| Missing-secret webhook POST | HTTP 401; body reports `telegram secret token mismatch`. | Route reaches the app and fails closed without a secret; no token/secret value recorded. |
| Telegram test bot webhook | Linear LAY-27/28 records `getWebhookInfo` URL as `https://uzmax-api-staging.onrender.com/telegram/bot/webhook`, pending updates 0, allowed updates `message` and `callback_query`, no last error. | Existing redacted control-plane evidence; M6B-09a did not call Telegram with a token. |

Implementation note from Linear LAY-27: Render Blueprint with paid worker/cron was blocked by payment requirements, so the live staging carrier was created as free Render Web Service `uzmax-api-staging` plus free Render Key Value `uzmax-redis-staging`; worker/cron paid services were not created.

## Boundary

This evidence now records a live staging API carrier and test bot webhook hygiene evidence, but it is still not a full M6B-04/J-01 pass.

Still required before full staging deploy/ops closure:

- `/readyz` must stop failing on `authz=not_configured` and `identity=not_configured`.
- live worker heartbeat evidence.
- live cron heartbeat evidence.
- alert fire proof.
- full M6B-07 api/worker/cron/admin deploy/rollback A-to-B-to-A evidence.
- M6B-08 safe restore target/snapshot/restore evidence.
- owner explicit GA-0 decision after checklist is green.

## Red Lines

- No production deploy.
- No outbound Telegram send.
- No real customer traffic.
- No real customer/order data.
- No DB/RLS staging proof claimed by telemetry worker mode.
- No live worker/cron heartbeat proof claimed.
- No alert fire proof claimed.
- No ephemeral tunnel completion evidence.
- No secret values printed or committed.

# M6B-12 Live Readyz Identity/Authz Activation Evidence

> evidence_id: M6B-12-live-readyz-activation
> spec: `docs/specs/M6B-12-live-readyz-activation.md`
> tracking: Linear LAY-30, write-back to LAY-19
> status: `historical_render_env_write_path_missing_superseded_by_m6b17_not_ga0`
> recorded_at: 2026-06-27
> sensitive_data_location: none; no DB URL, token, Telegram secret, provider secret, customer/order data or raw payload is recorded

## Scope

M6B-12 attempted the live `/readyz` activation slice for the existing Render staging API:

- API base: `https://uzmax-api-staging.onrender.com`
- Supabase project: `uzmax-dev`, ref `enyocaykcgcfcswycujg`, region `ap-south-1`
- Controlled staging UUIDs from `render.yaml`:
  - org `11111111-1111-4111-8111-111111111604`
  - tenant `22222222-2222-4222-8222-222222222604`
  - channel connection `33333333-3333-4333-8333-333333333604`

Postscript: this file records the first failed activation attempt. Later M6B-12a/M6B-12b/M6B-17 evidence supersedes the blocker and records LAY-30 Done with live `/readyz` HTTP 200. Do not use this historical file to reopen LAY-30.

## What Was Completed

| Area | Result | Evidence |
|---|---|---|
| Repo/worktree preflight | pass | Root checkout was on `main`; assigned worktree branch is `codex/m6b-12-readyz-activation` at `0e025b5c947d71a2e386cc9b69f65485e9b867da`. |
| Supabase project access | pass | Supabase connector listed `uzmax-dev` as `ACTIVE_HEALTHY`; SQL probe returned Postgres 17.6 runtime metadata. |
| Authz tables | pass | `tenant_member` and `permission_grant` exist with RLS enabled. |
| Synthetic staging facts | pass | SQL readback returned `org_rows=1`, `tenant_rows=1`, `channel_rows=1`, `tenant_member_rows=1`, permissions `conversation:read` and `tenant:read`. |
| Synthetic Auth user | pass | Public signup created a synthetic user; email confirmation was enabled through SQL for that synthetic user only. |
| Synthetic bearer token | pass | Public sign-in returned an access token; only token hash `dcc48b4c2a20b8ef` was recorded. |
| Live `/healthz` | pass | `GET /healthz` returned HTTP 200 with `service=api`, `status=ok`. |
| Live `/readyz` before Render env activation | blocked as expected | `GET /readyz` returned HTTP 503 with `authz=not_configured` and `identity=not_configured`. |
| Live access-context before Render env activation | blocked as expected | `GET /me/access-context` with synthetic token and `x-tenant-id` returned HTTP 401 `identity verifier is not configured`. |

## Current Blocker

Render write access is still missing in the active execution environment:

- No `render` CLI was available on `PATH`.
- No `RENDER_API_KEY` or Render service token was present in shell env.
- Render public API `GET https://api.render.com/v1/services` returned HTTP 401 without a token.
- In-app browser navigation to `https://dashboard.render.com/` timed out twice before a dashboard login/service page could be reached.

At the time of this worker slice, the staging API env could not be changed or redeployed, so this slice could not claim live `/readyz` HTTP 200 and could not close LAY-30.

## Required Next Action

Provide one Render write path, then rerun this slice:

- preferred: `RENDER_API_KEY` with access to service `uzmax-api-staging`;
- acceptable: authenticated Render dashboard session usable in browser;
- acceptable: Render MCP/API tooling with service/env update capability.

Set only staging API env, then redeploy:

- `UZMAX_SUPABASE_URL`
- `UZMAX_SUPABASE_PUBLISHABLE_KEY`
- `UZMAX_API_AUTHZ_REPOSITORY_MODE=rls_prisma_gateway`
- `UZMAX_RLS_DATABASE_URL`

After redeploy, rerun:

- `GET https://uzmax-api-staging.onrender.com/healthz`
- `GET https://uzmax-api-staging.onrender.com/readyz`
- `GET https://uzmax-api-staging.onrender.com/me/access-context` with the synthetic bearer token and `x-tenant-id`
- missing-secret POST to `/telegram/bot/webhook`

## Linear Disposition

- Historical result: LAY-30 could not move to Done from this evidence alone.
- Current superseding result: M6B-17 records LAY-30 Done from later live staging/test evidence.
- Historical result: LAY-19 could not close from this evidence alone; this file closed DB/Auth fact preparation only, not live API readiness.
- No production, outbound Bot send, real customer/order data, customer LLM/provider call, backup restore or GA-0 approval occurred.

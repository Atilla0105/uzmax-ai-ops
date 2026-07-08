# M9-01 Admin Staging Runtime Closeout Evidence

Spec: `docs/specs/M9-01-admin-staging-runtime-closeout.md`
Branch: `codex/m9-01-admin-staging-runtime-closeout`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-01-admin-staging-runtime-closeout`

## Baseline

- Root/main was clean before work.
- `git branch --no-merged main` returned no output before work.
- `gh pr list --state open --json number,title,headRefName,state,url` returned `[]` before work.
- Render staging services before work: `uzmax-api-staging`, `uzmax-worker-staging`, `uzmax-cron-staging`, `uzmax-redis-staging`; no admin web service.
- Live API `/readyz` before work returned HTTP 200 with `identity=configured` and `authz=configured`.
- Admin local Vite build already passed before work, but local browser preview still showed mock/degraded group data and no deployed admin URL.

## Closeout Changes

- `render.yaml` now declares `uzmax-admin-staging` as a Node web service that builds `apps/admin` and runs the existing `@uzmax/admin start` Vite preview server.
- `render.yaml` declares staging admin build env: API base, org id, tenant id/name/line and public Supabase env placeholders.
- `render.yaml` declares `UZMAX_API_CORS_ORIGINS` for the staging admin origin and local preview origins.
- `apps/api/src/main.ts` enables CORS only when `UZMAX_API_CORS_ORIGINS` is configured, and allows `authorization`, `content-type`, `x-org-id` and `x-tenant-id`.
- `apps/admin/src/adminRuntimeConfig.ts` adds staging runtime config and a fetcher that prefixes the API base and attaches session/scope headers.
- `apps/admin/src/adminRuntimeAuth.ts` adds Supabase Auth REST password sign-in plus manual access-token fallback without adding the Supabase SDK to the admin bundle.
- `apps/admin/src/AdminRuntimeAccessPanel.tsx` renders the staging access state under the topbar only when a runtime API base is configured.
- `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts` now uses the runtime fetcher and treats HTTP 401/403 as permission state.
- `apps/admin/package.json` defaults Vite preview's additional allowed host to `uzmax-admin-staging.onrender.com`, fixing the initial live 403 host-validation failure.

## Runtime Boundary

- Conversation read path: targeted for real staging API through `conversation-ticket`.
- Conversation handoff/ticket writes: must remain unclaimed until live DB-backed mutation evidence proves `saveConversation` and `saveTicket` are writable in staging DB mode.
- Knowledge management: remains degraded/read-only in this slice; no formal KB write or automatic publish is added.

## Validation

- `node --test scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`
  - Result: pass, 6/6 tests.
- `node node_modules/prettier/bin/prettier.cjs --check apps/admin/package.json render.yaml scripts/tests/m9-admin-staging-runtime-closeout.test.mjs docs/specs/M9-01-admin-staging-runtime-closeout.md docs/evidence/M9/M9-01-admin-staging-runtime-closeout.md`
  - Result: pass.
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
  - Result: pass.
- `node node_modules/eslint/bin/eslint.js apps/api/src/main.ts apps/admin/src/adminRuntimeConfig.ts apps/admin/src/adminRuntimeAuth.ts apps/admin/src/AdminRuntimeAccessPanel.tsx apps/admin/src/App.tsx apps/admin/src/shell/AppShell.tsx apps/admin/src/pages/conversations/conversationWorkbenchClient.ts scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`
  - Result: pass.
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Result: pass. JS gzip size after removing Supabase SDK: `246.81 kB`.
- `node node_modules/size-limit/bin.js --json`
  - Result: pass. `admin design harness` size `178899`, limit `250000`.
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-01-admin-staging-runtime-closeout.md --include-worktree`
  - Result: pass. `changedFiles=13`, categories `source=8`, `docs=2`, `config=2`, `test=1`, source `netLoc=499`, new source files `3`.
- `git diff --check`
  - Result: pass.

## Browser Smoke

Local staging-env preview was built with:

- `VITE_UZMAX_RUNTIME_ENV=staging`
- `VITE_UZMAX_API_BASE_URL=https://uzmax-api-staging.onrender.com`
- `VITE_UZMAX_ORG_ID=11111111-1111-4111-8111-111111111604`
- `VITE_UZMAX_TENANT_ID=22222222-2222-4222-8222-222222222604`
- `VITE_UZMAX_TENANT_NAME=Laylak Cargo`
- `VITE_UZMAX_TENANT_LINE=Logistics staging`

Browser smoke results:

- Desktop root rendered `STAGING` marker.
- Runtime access panel rendered `API session required` and `Laylak Cargo`.
- Tenant switcher rendered `Laylak Cargo · 运行中`.
- Conversation route reached `tenant.conversations`.
- Unsigned request targeted `https://uzmax-api-staging.onrender.com/conversation-ticket/conversations` and included `x-org-id` / `x-tenant-id`.
- With a fake browser smoke token in session storage and Playwright route interception, the conversation request included:
  - `authorization: Bearer fake-browser-smoke-token`
  - `x-org-id: 11111111-1111-4111-8111-111111111604`
  - `x-tenant-id: 22222222-2222-4222-8222-222222222604`
- Mobile smoke at 390px rendered the runtime access panel and conversation empty state with `document.body.scrollWidth=390`.

## Live Staging Evidence

- Render admin service created:
  - service: `uzmax-admin-staging`
  - service id: `srv-d97avhurnols73ckibp0`
  - URL: `https://uzmax-admin-staging.onrender.com`
- Render env updates applied without printing values:
  - API service `srv-d8vblsrtqb8s73fd4ga0`: `UZMAX_API_CORS_ORIGINS`
  - Admin service `srv-d97avhurnols73ckibp0`: runtime env, tenant env, Supabase public URL/key env and `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`
- Initial admin deploy on commit `c6e31e4a961e4573297819f5eeb1d18ae4021456` returned `live`, but admin root returned HTTP 403 because Vite preview rejected the Render host header.
- Host-validation fix was added and deployed on commit `e38d184f2d3ed411fa9ef3c302922e903a42830e`:
  - admin deploy `dep-d97b2mbtqb8s73fmj0tg`, status `live`
  - API deploy `dep-d97b2mernols73ckoddg`, status `live`
- Live HTTP probes after the host fix:
  - `GET https://uzmax-admin-staging.onrender.com/` returned HTTP 200 and served the admin HTML.
  - `GET https://uzmax-api-staging.onrender.com/readyz` returned HTTP 200 with `status:"ready"`, `identity:"configured"` and `authz:"configured"`.
  - CORS preflight from `Origin: https://uzmax-admin-staging.onrender.com` to `/conversation-ticket/conversations` returned HTTP 204 with `access-control-allow-origin: https://uzmax-admin-staging.onrender.com` and allowed `authorization,content-type,x-org-id,x-tenant-id`.
  - Unsigned live conversation read returned HTTP 401 with CORS allow-origin, confirming the browser can receive the permission-safe failure instead of being blocked by CORS.
- Live browser smoke on `https://uzmax-admin-staging.onrender.com/` at 390px:
  - rendered `STAGING`
  - rendered runtime access text `staging API session active Laylak Cargo 退出` when a fake smoke token was in session storage
  - reached `tenant.conversations`
  - sent a request to `https://uzmax-api-staging.onrender.com/conversation-ticket/conversations`
  - request included `authorization: Bearer fake-live-smoke-token`, `x-org-id: 11111111-1111-4111-8111-111111111604`, and `x-tenant-id: 22222222-2222-4222-8222-222222222604`
  - rendered at `document.body` width `390`

## Remaining Boundary

- Local env does not contain employee Supabase email/password or access token. It only lists OpenAI/Telegram/DeepSeek-related keys. Therefore real authenticated conversation data read is not claimed in this evidence; it is the next employee-login validation step through the deployed admin access panel.
- Ticket mutations and knowledge writes remain out of scope/degraded in this slice.
- API staging was temporarily pointed at branch `codex/m9-01-admin-staging-runtime-closeout` for pre-merge verification. After PR merge, API and admin services must be pointed at `main` and redeployed.

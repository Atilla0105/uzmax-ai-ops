# M9-02 Admin Vercel Staging Closeout Evidence

Spec: `docs/specs/M9-02-admin-vercel-staging-closeout.md`
Branch: `codex/m9-02-admin-vercel-staging-closeout`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex/m9-02-admin-vercel-staging-closeout`

## Baseline

- Root/main was clean before work.
- `git branch --no-merged main` returned no output before work.
- `gh pr list --state open --json number,title,headRefName,state,url` returned `[]` before work.
- Formal architecture says Render is backend runtime and Vercel is the React/Vite admin frontend platform.
- Vercel project `uzmax-admin` exists under team `muxukk222-7795s-projects`.
- Render services before work include temporary admin service `uzmax-admin-staging` (`srv-d97avhurnols73ckibp0`) and API service `uzmax-api-staging` (`srv-d8vblsrtqb8s73fd4ga0`).

## Closeout Changes

- `render.yaml` no longer declares the temporary `uzmax-admin-staging` Render web service.
- `render.yaml` no longer contains the temporary Render admin origin `uzmax-admin-staging.onrender.com`.
- `render.yaml` API CORS now points at the Vercel production alias, stable Vercel admin domains and local preview origins.
- `apps/admin/package.json` now defaults Vite preview's additional allowed host to `uzmax-admin.vercel.app`.
- `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs` was adjusted so the previous temporary Render admin is no longer treated as the desired end state.
- `scripts/tests/m9-admin-vercel-staging-closeout.test.mjs` now guards the Vercel admin / Render backend platform boundary.

## Validation

- `node --test scripts/tests/m9-admin-staging-runtime-closeout.test.mjs scripts/tests/m9-admin-vercel-staging-closeout.test.mjs`
  - Result: pass, 11/11 tests.
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
  - Result: pass.
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Result: pass. JS gzip size `246.81 kB`.
- `node node_modules/prettier/bin/prettier.cjs --check apps/admin/package.json render.yaml scripts/tests/m9-admin-staging-runtime-closeout.test.mjs scripts/tests/m9-admin-vercel-staging-closeout.test.mjs docs/specs/M9-02-admin-vercel-staging-closeout.md docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md`
  - Result: pass.
- `node node_modules/size-limit/bin.js --json`
  - Result: pass. `admin design harness` size `178899`, limit `250000`.
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-02-admin-vercel-staging-closeout.md --include-worktree`
  - Result: pass. `changedFiles=6`, categories `config=2`, `test=2`, `docs=2`, source `netLoc=0`, new source files `0`.
- `git diff --check`
  - Result: pass.

## Vercel Runtime Evidence

- Vercel project env set for production without printing values:
  - `VITE_UZMAX_RUNTIME_ENV`
  - `VITE_UZMAX_API_BASE_URL`
  - `VITE_UZMAX_ORG_ID`
  - `VITE_UZMAX_TENANT_ID`
  - `VITE_UZMAX_TENANT_NAME`
  - `VITE_UZMAX_TENANT_LINE`
  - `VITE_UZMAX_SUPABASE_URL`
  - `VITE_UZMAX_SUPABASE_PUBLISHABLE_KEY`
- Vercel production deployment:
  - deployment id: `dpl_AL9LUmHTujrLQhxjzqv6xE2A3f3W`
  - deployment URL: `https://uzmax-admin-l3rgz0daw-muxukk222-7795s-projects.vercel.app`
  - production alias: `https://uzmax-admin.vercel.app`
  - ready state: `READY`
- `GET https://uzmax-admin.vercel.app/`
  - Result: HTTP 200, served admin HTML from Vercel.

## Render Runtime Evidence

- Render API service `srv-d8vblsrtqb8s73fd4ga0` env updated without printing secrets:
  - `UZMAX_API_CORS_ORIGINS=https://uzmax-admin.vercel.app,https://uzmax-admin-muxukk222-7795s-projects.vercel.app,https://uzmax-admin-atilla0105-muxukk222-7795s-projects.vercel.app,http://localhost:4173,http://127.0.0.1:4173`
- Render API deploy after CORS update:
  - deploy id: `dep-d97hk0eq1p3s73eqhd50`
  - status: `live`
- `GET https://uzmax-api-staging.onrender.com/readyz`
  - Result: HTTP 200 with `status:"ready"`, `identity:"configured"` and `authz:"configured"`.
- CORS preflight from `Origin: https://uzmax-admin.vercel.app` to `/conversation-ticket/conversations`
  - Result: HTTP 204.
  - `access-control-allow-origin: https://uzmax-admin.vercel.app`
  - `access-control-allow-headers: authorization,content-type,x-org-id,x-tenant-id`
- Unsigned live conversation read from `Origin: https://uzmax-admin.vercel.app`
  - Result: HTTP 401 with `access-control-allow-origin: https://uzmax-admin.vercel.app`.
  - This confirms the browser receives the permission-safe API failure instead of being blocked by CORS.
- Temporary Render admin service removal:
  - preview confirmed service id `srv-d97avhurnols73ckibp0`, name `uzmax-admin-staging`, URL `https://uzmax-admin-staging.onrender.com`.
  - `render services delete srv-d97avhurnols73ckibp0 --confirm --output json` returned `deleted:true`.
  - Post-delete Render service list contains `uzmax-api-staging`, `uzmax-worker-staging` and `uzmax-cron-staging`; it no longer contains `uzmax-admin-staging`.

## Browser Smoke

- Live browser smoke on `https://uzmax-admin.vercel.app/` at 1440px:
  - rendered `STAGING`.
  - rendered `Laylak Cargo`.
  - rendered `API session active` after a fake smoke token was placed in browser `sessionStorage`.
  - entered tenant context from the group page.
  - reached the conversations route.
  - sent `GET https://uzmax-api-staging.onrender.com/conversation-ticket/conversations`.
  - request included `authorization: Bearer [smoke-token]`.
  - request included `x-org-id: 11111111-1111-4111-8111-111111111604`.
  - request included `x-tenant-id: 22222222-2222-4222-8222-222222222604`.
  - page rendered the expected permission/degraded state for the fake token: `缺少 conversation:read 或 ticket:write`.

## PR And Cleanup Evidence

- PR #283 merged to `main` at commit `fe4f27d3014bcb10855ece8ee29106c262f41b59`.
- CI `checks` succeeded before merge on 2026-07-09.

## Remaining Boundary

- Authenticated employee conversation data read requires a real Supabase employee session. If no employee credentials/token are provided, this evidence will verify the admin shell, API base, CORS and scoped request path without claiming real employee data access.
- Ticket mutations and formal knowledge writes remain out of scope/degraded in this deployment correction slice.

# M9-01 Admin Staging Runtime Closeout

Spec ID: M9-01
Status: `staging_live_verified_pending_merge`
Owner confirmation point: project owner asked to stop spinning on docs/framework work and make the existing admin usable for internal employees on staging. Owner still owns production traffic, real customer/order data approval, Supabase user provisioning, provider cost/compliance, GA and 1.0 release.
Timebox: narrow staging runtime closeout.

## Spec 类型

feature

## Goal

Turn the existing local-preview admin shell into a staging admin runtime that employees can open and use against the existing staging API for the first internal loop:

1. Deployable admin web service exists for staging.
2. Admin API calls can target `https://uzmax-api-staging.onrender.com` instead of the admin origin.
3. Staging API accepts the admin origin through explicit CORS.
4. Employee session can provide a Supabase Auth access token, and admin requests send `Authorization`, `x-org-id` and `x-tenant-id`.
5. Conversation workbench can read staging conversation-ticket data when the employee has `conversation:read`.
6. Handoff/ticket writes and knowledge management must either use real APIs or remain visibly degraded/read-only with evidence; no mock surface may be claimed as a real runtime closeout.

## Current Repo Facts

- Render currently has API, worker, cron and Redis staging resources; no admin web service exists.
- `apps/admin` already builds as a Vite React app and has an `@uzmax/admin start` preview server.
- `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts` currently calls relative `/conversation-ticket/...` paths.
- `apps/api/src/main.ts` does not enable CORS.
- API access context requires a Supabase Auth bearer token plus tenant selection. RLS authz requires `x-org-id` in staging.
- `apps/api/src/conversation-ticket.repository.ts` DB-backed repository is read-backed and still rejects save mutations in DB mode, so handoff/ticket writes may stay degraded unless explicitly proven otherwise.
- `tenant.tickets` and `tenant.knowledge` are still local/degraded UI pages and must not be represented as production/staging runtime data.

## External API Basis

- Supabase Auth Server Reference documents `POST /token?grant_type=password` as the password sign-in endpoint, with `email`, `password` or `phone` body fields and an `access_token` in the 200 response: https://supabase.com/docs/reference/self-hosting-auth/introduction
- Render official API docs document adding/updating service env vars with `PUT /v1/services/{serviceId}/env-vars/{envVarKey}` and that env var changes require a deploy to apply: https://api-docs.render.com/reference/update-env-var

## Scope

- Add admin runtime config and session handling for staging API base, org/tenant scope and Supabase email/password or manual token access.
- Route conversation workbench fetches through the runtime API fetcher.
- Enable API CORS from configured origins.
- Add Render admin web service configuration and API CORS env declaration.
- Add focused contract tests for runtime config/fetcher/CORS/Render boundaries.
- Record local, browser and live staging evidence.

## Out Of Scope

- No production release or GA approval.
- No new DB schema, migration, RLS policy or generated Prisma client.
- No automatic formal knowledge-base write or distill/confirmation bypass.
- No customer/order data export or broad admin page rewrite.
- No backend imports from `apps/admin`.
- No secrets committed to source, tests, docs or logs.
- No claim that ticket mutation or knowledge management is real unless live/runtime evidence proves it.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M9-01-admin-staging-runtime-closeout.md`
  - `docs/evidence/M9/M9-01-admin-staging-runtime-closeout.md`
  - `render.yaml`
  - `apps/api/src/main.ts`
- `apps/admin/package.json`
  - `package-lock.json`
  - `apps/admin/src/adminRuntimeConfig.ts`
  - `apps/admin/src/adminRuntimeAuth.ts`
  - `apps/admin/src/AdminRuntimeAccessPanel.tsx`
  - `apps/admin/src/App.tsx`
  - `apps/admin/src/shell/AppShell.tsx`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts`
  - `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M8-02-db-backed-conversation-ticket-api.md`
- `docs/specs/M8-08-staging-runtime-closeout.md`
- `docs/evidence/M8/M8-08-staging-runtime-closeout.md`
- `apps/api/src/access-context-core.ts`
- `apps/api/src/conversation-ticket.repository.ts`

## Change Budget

- Source: changed source files <= 8, new source files <= 3, net source LOC target <= 600.
- Test: one focused Node test file plus existing build/type/browser checks.
- Config/lock: Render config and admin dependency lock only.
- Docs/evidence: this spec plus one evidence file.
- Exceptions: none.

## Acceptance

- `render.yaml` declares an `uzmax-admin-staging` web service that builds and starts `@uzmax/admin`, with staging API base and org/tenant env.
- API CORS reads `UZMAX_API_CORS_ORIGINS` and allows `authorization`, `content-type`, `x-org-id`, `x-tenant-id`.
- Admin runtime fetcher prefixes configured API base and adds auth/org/tenant headers without committing tokens.
- Admin offers staging access via Supabase email/password when public Supabase env is present, and manual access-token fallback otherwise.
- Conversation workbench uses the runtime fetcher, so deployed admin can call staging API instead of its own origin.
- Ticket/knowledge pages remain visibly degraded/read-only unless real runtime evidence is added.
- Focused M9 test passes.
- Admin build passes.
- API build/type or focused compile check passes.
- Browser smoke proves local admin renders the staging access state and conversation route without mock-only hidden failure.
- Render staging admin deploy is live and serving.
- Safe live probes record API `/readyz` 200 and admin root 200.
- PR is merged, stale branch/worktree state is cleaned or explicitly accounted for.

## Live Validation Boundary

- Staging admin web is live at `https://uzmax-admin-staging.onrender.com`.
- API CORS and browser request headers are live-verified against
  `https://uzmax-api-staging.onrender.com`.
- No employee Supabase email/password or access token is present in repo or local env, so
  authenticated conversation data read remains an employee-login/owner-input validation step.
  The deployed admin supports Supabase password login and manual access-token fallback; the
  request path, tenant scope headers and CORS are verified without claiming real employee data.

## Failure Branches

- If Render cannot create a static site through CLI, use the existing Node/Vite preview server as the staging web service and record the tradeoff.
- If Supabase public env cannot be read or set in admin, keep manual token fallback and record login env as deploy-time required.
- If live employee credentials/token are unavailable, verify signed-out/permission-safe browser state and do not claim authenticated conversation read closure.
- If DB-backed handoff/ticket mutation still rejects writes, keep ticket actions degraded/read-only and record the DB mutation follow-up instead of broadening this PR.

## Start Audit

| Fact | Evidence |
|---|---|
| root checkout before work | `/Users/atilla/Applications/UZMAX智能运营` on `main`, clean against `origin/main` |
| no-merged branch audit before work | no output from `git branch --no-merged main` |
| open PR audit before work | `[]` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m9-01-admin-staging-runtime-closeout` |
| assigned branch | `codex/m9-01-admin-staging-runtime-closeout` |
| assigned HEAD | `57c3ab557e3d5259a03b192ff7c0cc8b0334729d` |
| assigned status before edits | `## codex/m9-01-admin-staging-runtime-closeout` |

## Validation

Required focused validation:

- `PATH="/Users/atilla/Applications/Codex/tools/bin:$PATH" npm install --package-lock-only --ignore-scripts`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node node_modules/eslint/bin/eslint.js apps/api/src/main.ts apps/admin/src/adminRuntimeConfig.ts apps/admin/src/adminRuntimeAuth.ts apps/admin/src/AdminRuntimeAccessPanel.tsx apps/admin/src/App.tsx apps/admin/src/shell/AppShell.tsx apps/admin/src/pages/conversations/conversationWorkbenchClient.ts scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-01-admin-staging-runtime-closeout.md --include-worktree`
- `git diff --check`

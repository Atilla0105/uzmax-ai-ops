# M9-02 Admin Vercel Staging Closeout

Spec ID: M9-02
Status: `live_verified_pending_merge`
Owner confirmation point: project owner corrected the deployment boundary: the admin backend-console frontend belongs on Vercel, while Render is the backend runtime platform. Owner still owns production traffic, real customer/order data approval, Supabase employee account provisioning, provider cost/compliance, GA and 1.0 release.
Timebox: narrow deployment correction and runtime closeout.

## Spec 类型

cleanup

## Goal

Close the staging admin runtime loop on the formal platform boundary:

1. Vercel project `uzmax-admin` serves the admin frontend.
2. Render no longer carries the temporary admin web service.
3. Render API CORS explicitly accepts the Vercel admin origins and local preview origins.
4. The Vercel admin build points at `https://uzmax-api-staging.onrender.com` with the existing staging org/tenant scope.
5. Live smoke proves the Vercel admin can render and send scoped API requests to the Render staging API without CORS blocking.
6. PR/CI/merge and post-merge deploy state leave no hidden local branch or temporary runtime surface.

## Current Repo Facts

- `vercel.json` already builds `apps/admin/dist` with `npm run build:admin`.
- `render.yaml` currently declares the temporary `uzmax-admin-staging` Render web service from M9-01.
- `render.yaml` currently points API CORS at the temporary Render admin origin.
- `apps/admin/package.json` currently defaults Vite preview host allowance to the temporary Render admin host.
- `docs/evidence/M9/M9-01-admin-staging-runtime-closeout.md` records that the temporary Render admin was a staging runtime closeout surface, not the final platform boundary.
- Vercel already has project `uzmax-admin` under team `muxukk222-7795s-projects`.

## External API Basis

- Vercel official deployment docs describe production deployments and project deployments: https://vercel.com/docs/deployments
- Vercel official CLI docs describe project linking, environment variables and production deploy commands: https://vercel.com/docs/cli
- Render official API docs document service environment variable updates and that env var changes require a deploy to apply: https://api-docs.render.com/reference/update-env-var

## Scope

- Remove the temporary Render admin service declaration from source-controlled runtime config.
- Change API CORS source config from the temporary Render admin origin to the Vercel admin origins plus local preview origins.
- Change the admin preview default allowed host from Render admin to the stable Vercel admin domain.
- Add focused tests guarding the Vercel admin / Render backend platform boundary.
- Configure Vercel project env for staging admin build without committing secrets.
- Deploy and verify Vercel admin against Render staging API.
- Remove or suspend the temporary Render admin service after Vercel admin is verified.
- Record validation, PR, CI, merge, deploy and cleanup evidence.

## Out Of Scope

- No new user-facing admin feature or page redesign.
- No production GA, real customer/order data approval or employee rollout signoff.
- No new DB schema, migration, RLS policy or generated Prisma client.
- No formal knowledge-base write, distill publish or confirmation bypass.
- No LLM prompt/model routing change.
- No secrets committed to source, tests, docs or logs.
- No claim that authenticated conversation data read is closed unless an employee Supabase session is provided and live evidence proves it.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M9-02-admin-vercel-staging-closeout.md`
  - `docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md`
  - `render.yaml`
  - `apps/admin/package.json`
  - `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`
  - `scripts/tests/m9-admin-vercel-staging-closeout.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `docs/specs/M9-01-admin-staging-runtime-closeout.md`
- `docs/evidence/M9/M9-01-admin-staging-runtime-closeout.md`
- `vercel.json`
- `apps/api/src/main.ts`
- `apps/admin/src/adminRuntimeConfig.ts`
- `apps/admin/src/AdminRuntimeAccessPanel.tsx`

## Change Budget

- Source: changed source files <= 1, new source files <= 0, net source LOC target <= 10.
- Test: one new focused Node test file plus one adjusted M9 guard test.
- Config/lock: `render.yaml` and admin package script only.
- Docs/evidence: this spec plus one evidence file.
- External runtime: Vercel env/deploy, Render API env/deploy, temporary Render admin service removal or suspension.
- Exceptions: none.

## Acceptance

- `render.yaml` no longer declares `uzmax-admin-staging`.
- `render.yaml` no longer contains `uzmax-admin-staging.onrender.com`.
- `render.yaml` API CORS contains:
  - `https://uzmax-admin.vercel.app`
  - `https://uzmax-admin-muxukk222-7795s-projects.vercel.app`
  - `https://uzmax-admin-atilla0105-muxukk222-7795s-projects.vercel.app`
  - `http://localhost:4173`
  - `http://127.0.0.1:4173`
- `apps/admin/package.json` no longer defaults the preview allowed host to the Render admin domain.
- `vercel.json` remains the source-controlled admin frontend build contract.
- Vercel project `uzmax-admin` has staging admin build env set without printing secrets.
- Vercel production deployment is `READY` and serves admin HTML.
- Live Vercel browser smoke reaches the admin shell and sends conversation API requests to `https://uzmax-api-staging.onrender.com` with tenant scope headers when a smoke token is present.
- Render API CORS preflight from the Vercel admin origin succeeds.
- Temporary Render service `uzmax-admin-staging` is removed or explicitly suspended after Vercel admin is verified.
- Focused tests, admin build, type check, PR shape and diff check pass.
- PR is merged, stale branch/worktree state is cleaned or explicitly accounted for.

## Live Validation Boundary

- Vercel admin is the target staging admin surface.
- Render remains the target staging backend runtime for API, worker, cron and Redis.
- Authenticated employee conversation data read requires a real Supabase employee session; this spec can verify browser/API/CORS/request scope without claiming employee data access if credentials are unavailable.
- Ticket mutations and formal knowledge writes remain out of scope/degraded unless separate specs close those APIs.

## Failure Branches

- If Vercel env cannot be set through CLI/MCP, stop before deploy and record the missing external-state blocker.
- If Vercel deployment fails, keep temporary Render admin until a replacement admin URL is live.
- If API CORS cannot be updated/redeployed on Render, do not delete temporary Render admin; record the exact API deploy blocker.
- If temporary Render admin deletion is unsupported, suspend it and record the service id plus follow-up deletion path.
- If live employee credentials/token are unavailable, verify signed-out and smoke-token request paths only and do not claim authenticated employee data read.

## Start Audit

| Fact | Evidence |
|---|---|
| root checkout before work | `/Users/atilla/Applications/UZMAX智能运营` on `main`, clean against `origin/main` |
| no-merged branch audit before work | no output from `git branch --no-merged main` |
| open PR audit before work | `[]` |
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex/m9-02-admin-vercel-staging-closeout` |
| assigned branch | `codex/m9-02-admin-vercel-staging-closeout` |
| Vercel project | `uzmax-admin`, id `prj_5XhdIOD2zxmDASwimiYCXZICC1F5` |
| temporary Render admin service | `uzmax-admin-staging`, id `srv-d97avhurnols73ckibp0` |
| Render staging API service | `uzmax-api-staging`, id `srv-d8vblsrtqb8s73fd4ga0` |

## Validation

Required focused validation:

- `node --test scripts/tests/m9-admin-staging-runtime-closeout.test.mjs scripts/tests/m9-admin-vercel-staging-closeout.test.mjs`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `node node_modules/prettier/bin/prettier.cjs --check apps/admin/package.json render.yaml scripts/tests/m9-admin-staging-runtime-closeout.test.mjs scripts/tests/m9-admin-vercel-staging-closeout.test.mjs docs/specs/M9-02-admin-vercel-staging-closeout.md docs/evidence/M9/M9-02-admin-vercel-staging-closeout.md`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M9-02-admin-vercel-staging-closeout.md --include-worktree`
- `git diff --check`

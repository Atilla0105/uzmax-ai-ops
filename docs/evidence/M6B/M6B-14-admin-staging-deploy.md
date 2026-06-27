# M6B-14 Admin Staging Deploy Target Evidence

> evidence_id: M6B-14-admin-staging-deploy
> spec: `docs/specs/M6B-14-admin-staging-deploy.md`
> tracking: Linear LAY-23 prerequisite
> status: `admin_preview_deploy_prerequisite_superseded_by_m6b17_not_ga0`
> recorded_at: 2026-06-27
> sensitive_data_location: none; no tokens, customer/order data or provider secrets are recorded

## Scope

M6B-14 creates the Vercel admin deploy target needed before the full LAY-23 rollback drill.

Postscript: M6B-17 later records the full API/worker/cron/admin rollback drill closure for LAY-23. This file remains prerequisite deployment evidence and does not by itself open GA-0.

Existing project:

- Vercel team: `team_HNqH4hBWA2Nr40SVU1uKE4XZ`
- Project: `uzmax-admin`
- Project id: `prj_5XhdIOD2zxmDASwimiYCXZICC1F5`

## Current Evidence

| Area | Result | Notes |
|---|---|---|
| Vercel auth | pass | Vercel CLI returned account `atilla0105`. |
| Existing project | pass | Vercel connector returned `uzmax-admin`, framework `vite`, with no prior deployments. |
| Local admin build | pass | `vite build apps/admin --emptyOutDir` emitted `apps/admin/dist`. |
| Project link | pass | `vercel link --yes --project uzmax-admin --scope muxukk222-7795s-projects` linked the worktree to the existing project. |
| First linked deploy | failed | Vercel built the repo but failed because project output directory expected root `dist` while admin outputs `apps/admin/dist`. |
| Config fix | pass | Added `vercel.json` with `buildCommand=npm run build:admin`, `installCommand=npm install`, `outputDirectory=apps/admin/dist`; added `.gitignore` entry for local `.vercel` metadata. |
| Linked deploy | pass | Vercel deployment `dpl_FUymF9iFuZ8WMRe17UTDHLbp7Prg` reached `READY`, target `preview`, URL `https://uzmax-admin-1ojwi1epw-muxukk222-7795s-projects.vercel.app`. |
| Page load | pass | During a short controlled SSO-off window, the deployment returned HTTP 200, title `UZMAX Admin`, app root present, bundle `/assets/index-zZtYp_OR.js`, and no Vercel login page content. SSO protection was restored to `all_except_custom_domains`. |
| Release gate locked | pass | Protected remote bundle `/assets/index-zZtYp_OR.js` was fetched via Vercel CLI protection bypass and contained `GA-0`, `locked` and `disabled`; it was not a Vercel login page. Local source also has `ga0Action.disabled = true` and label `GA-0 open action locked`. |
| Protection residue cleanup | pass_with_boundary | Vercel CLI generated automation bypass records while fetching a protected deployment. The non-env record was revoked; the env-var record was rotated so the exposed old value is invalid. One env-var automation bypass remains because Vercel requires it for protected deployment automation access. No bypass secret is recorded here. |
| Wrong project cleanup | pass | Accidental `dist` Vercel project/deployment was deleted; `vercel projects ls` no longer lists `dist`. |

## Boundary

M6B-14 closes only the admin staging deploy prerequisite for LAY-23. At the time of this slice, LAY-23 still required the full API, worker, cron and admin A -> B -> A rollback drill. M6B-17 later records that full drill closure.

No GA-0 action was opened and no production/customer data was used.

# M10-05 Live Staging Evidence Sync

Spec: `docs/specs/M10-05-live-staging-evidence-sync.md`
Status: `m10_customer_service_staging_live_passed_not_release`
Recorded: 2026-07-09
Branch: `codex/m10-05-live-staging-evidence-sync`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-05-live-staging-evidence-sync`

## Current Truth

The customer-service workbench staging closure is now live for the controlled synthetic scope:

- Backend conversation-ticket writes from M10-01 are on `main`.
- Admin runtime truth gate from M10-02 is on `main`.
- Support-operator write smoke workflow from M10-03 is on `main`.
- Render API staging and Vercel admin staging surface both deploy `main@a6a8990efbf5e5c3542f47cb23395ca90e34fb15`.
- M10-03 support-operator synthetic write smoke passed against staging API.

This is not a 1.0 release, production traffic approval, broad customer-data approval, customer LLM/provider approval, Telegram Business automatic reply approval or formal knowledge-write approval.

## Main And CI Evidence

| Check | Evidence |
|---|---|
| Main commit | `a6a8990efbf5e5c3542f47cb23395ca90e34fb15` |
| Main CI | Run `29027366919`, workflow `CI`, conclusion `success`, job `86150576571`, duration `6m17s` |
| M10-03 PR CI | Run `29026914487`, workflow `CI`, conclusion `success`, job `86149040853`, duration `5m41s` |
| Main cleanup | Root checkout clean, `HEAD == origin/main == a6a8990efbf5e5c3542f47cb23395ca90e34fb15`, no open PRs, no local `git branch --no-merged main` entries, only the root worktree remained before this docs-only follow-up worktree was opened. |

## Render API Staging Evidence

| Check | Evidence |
|---|---|
| Service | `uzmax-api-staging` / `srv-d8vblsrtqb8s73fd4ga0` |
| Deploy id | `dep-d97rhqa8qa3s73f9d5v0` |
| Deploy status | `live` |
| Commit | `a6a8990efbf5e5c3542f47cb23395ca90e34fb15` |
| Started | `2026-07-09T15:06:17.893275Z` |
| Finished | `2026-07-09T15:07:33.017387Z` |
| Trigger | `api` |
| `/healthz` | HTTP 200, body status `ok` |
| `/readyz` | HTTP 200, body status `ready`, checks include `authz=configured`, `identity=configured`, `database=contract` |

Earlier blocker resolved: before this deploy, the service had `autoDeploy=no`, the live deploy was still `17ab1d0d5c7496534653d410877e5b800c6e6c9c`, and `/healthz` plus `/readyz` timed out at 20 seconds. The manual deploy above moved staging API to the current main commit.

## Vercel Admin Evidence

| Check | Evidence |
|---|---|
| Project | `uzmax-admin` |
| Deployment id | `dpl_4RXavkDoG9ZfQiJRqvPfjwVuMBeg` |
| Deployment URL | `https://uzmax-admin-n7cw8dpmo-muxukk222-7795s-projects.vercel.app` |
| Production alias | `https://uzmax-admin.vercel.app` |
| Deployment state | `READY` |
| Target | `production` |
| Commit | `a6a8990efbf5e5c3542f47cb23395ca90e34fb15` |
| Admin HTML | `GET https://uzmax-admin.vercel.app/` returned HTTP 200 and served `UZMAX Admin` HTML with `/assets/index-D_0PELs9.js`. |
| Browser smoke | Playwright loaded `https://uzmax-admin.vercel.app/` with HTTP 200, title `UZMAX Admin`, root text length `678`, console/page error count `0`. |

API boundary checks from the Vercel origin:

- CORS preflight from `Origin: https://uzmax-admin.vercel.app` to `/conversation-ticket/conversations` returned HTTP 204 with `access-control-allow-origin: https://uzmax-admin.vercel.app` and allowed `authorization,content-type,x-org-id,x-tenant-id`.
- Unsigned conversation read from the same origin returned the expected HTTP 401 with CORS origin preserved, proving the page is not blocked by CORS while auth still fails closed.

Earlier blocker resolved: the previous Vercel production deployment was still `fe4f27d3014bcb10855ece8ee29106c262f41b59` from M9-02, so it did not include M10-02 runtime truth gate until deployment `dpl_4RXavkDoG9ZfQiJRqvPfjwVuMBeg`.

## M10-03 Support Operator Smoke Evidence

| Check | Evidence |
|---|---|
| Workflow | `M10 Support Operator Smoke` |
| Run id | `29028244916` |
| Event | `workflow_dispatch` |
| Head SHA | `a6a8990efbf5e5c3542f47cb23395ca90e34fb15` |
| Job | `support-operator-smoke`, job `86153715073` |
| Conclusion | `success` |
| Duration | `2m4s` |
| Artifact | `m10-03-support-operator-smoke-result`, artifact id `8202621760`, digest `sha256:8d1625874de3c310595a9394cbd53a89e0b7817a33e4ca22177642e642462297` |
| Sanitized status | `m10_03_support_operator_write_smoke_passed_not_release` |
| Permissions | exactly `tenant:read`, `conversation:read`, `ticket:write` |
| Permission count | `3` |
| Conversation list | HTTP 200 |
| Handoff | HTTP 201 |
| Ticket actions | `claim`, `note`, `close`, `reopen`, each HTTP 201 |
| Action count | `4` |
| Cleanup residue | `0` |

Artifact fields reviewed were sanitized operational fields only: status, permission count, permission names, HTTP statuses, action types, cleanup residue, deterministic org/tenant/user ids and a token hash prefix. No password value, access token, refresh token, service role key, DB URL, raw auth response, customer text or conversation payload was printed or committed.

## Boundary

This evidence proves controlled staging synthetic support-operator write closure for the customer-service workbench. It does not approve:

- 1.0 release;
- production traffic;
- broad real customer or order data;
- customer LLM/provider use;
- Telegram Business automatic reply;
- formal knowledge write, distill auto-write or confirmation bypass;
- owner acceptance for any scope beyond this staged synthetic evidence.

## Validation Log

- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-05-live-staging-evidence-sync.md --include-worktree`
  - Result: pass.
  - Shape: changed files `3`; categories `docs=3`; source changed files `0`; source net LOC `0`; new source files `0`.
- `git diff --check main...HEAD`
  - Result: pass.

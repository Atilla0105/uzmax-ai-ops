# M6B-12a RLS Access Context Provider Evidence

> evidence_id: M6B-12a-rls-access-context-provider
> spec: `docs/specs/M6B-12a-rls-access-context-provider.md`
> tracking: Linear LAY-30, LAY-19
> status: `code_unblock_passed_live_render_validation_pending_not_ga0`
> recorded_at: 2026-06-27
> sensitive_data_location: none; no DB URL, Supabase key, JWT, webhook secret, bot token, customer/order data, or raw secret is recorded

## Scope

M6B-12a fixes the API authz provider gap found while activating staging `/readyz`:

- existing RLS policies require both `app.org_id` and `app.tenant_id`;
- API access-context requests previously passed tenant only;
- the env-selected Prisma authz repository previously queried authz tables without setting RLS role/context.

This is code unblock evidence only. It does not claim live Render `/readyz` 200 or LAY-30 closure by itself.

## Evidence

| Area | Result | Notes |
|---|---|---|
| Authz request contract | pass | `AccessContextRequest` now accepts optional `selectedOrgId`; `buildAccessContext` rejects an org mismatch. |
| API request parsing | pass | API reads `org_id` from `x-org-id`, query, or body while preserving existing `tenant_id` behavior. |
| RLS Prisma authz provider | pass | `RlsPrismaAuthzRepository` requires `org_id`, creates the existing RLS transaction context, runs `SET LOCAL ROLE`, sets `app.org_id` and `app.tenant_id`, then reads `tenant_member` and `permission_grant`. |
| Fail-closed missing org | pass | Focused test rejects DB-backed authz facts without `org_id`. |
| Default disabled runtime | pass | Default authz/identity readiness remains fail-closed without env. |
| Regression coverage | pass | M1 access-context shell regression still passes. |

## Validation

Commands were run in the assigned worktree `codex/m6b-12a-rls-access-context`.

| Command | Result |
|---|---|
| `node --test scripts/tests/m6b-api-authz-readiness.test.mjs` | pass; 4/4 tests |
| `node --test scripts/tests/m1-02-api-access-context.test.mjs` | pass; 5/5 tests |
| `npm run typecheck -- --pretty false` | pass |

The worktree uses its own local `node_modules` installed with `npm ci`; that directory is untracked and not part of this evidence package.

## Boundary

M6B-12a does not close LAY-30 yet. LAY-30 can move to Done only after the follow-up Render staging validation records:

- `/healthz` HTTP 200;
- `/readyz` HTTP 200;
- `/me/access-context` synthetic Supabase/Auth/RLS smoke with `x-org-id`, `x-tenant-id`, and a valid synthetic bearer token;
- missing webhook secret remains 401;
- secret-valid synthetic webhook stays in staging/test-only path.

GA-0 remains locked.

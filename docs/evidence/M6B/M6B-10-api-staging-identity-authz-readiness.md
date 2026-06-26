# M6B-10 API Staging Identity/Authz Readiness Provider Wiring Evidence

> evidence_id: M6B-10-api-staging-identity-authz-readiness
> spec: `docs/specs/M6B-10-api-staging-identity-authz-readiness.md`
> tracking: Linear LAY-29
> status: implementation_ready_live_env_blocked
> owner: project owner owns staging Supabase/Auth/env/facts, live `/readyz` acceptance, production, real data, outbound Bot send, provider/cost/compliance risk, GA-0 and 1.0 decisions
> sensitive_data_location: none; this file contains no DB URL, token, customer/order data, Telegram payload or secret value

## Scope

M6B-10 removes the code-level readiness blocker where `AppModule` always used `DisabledAuthzRepository`.

The implementation keeps the default API path disabled/fail-closed and adds explicit `UZMAX_API_AUTHZ_REPOSITORY_MODE=rls_prisma_gateway` wiring for a DB-backed authz repository. Business authorization facts come only from `tenant_member` and `permission_grant`; JWT metadata is not used for permissions.

## Runtime Boundary

| Area | Status | Evidence |
|---|---|---|
| Default local API readiness | fail closed | No authz env selected means authz readiness remains `not_configured` and `/readyz` remains HTTP 503. |
| Configured provider readiness | implementation ready | Unit coverage injects fake Prisma into `rls_prisma_gateway` mode and observes authz readiness `configured`. |
| Fact source | implemented | Repository loads `tenantMember.findMany` and `permissionGrant.findMany`; active membership/grant facts map into `packages/authz` contracts. |
| Revoked/inactive behavior | implemented | Unit coverage proves revoked selected tenant access is denied and grants do not authorize revoked membership. |
| Live staging `/readyz` | not claimed | Owner-gated staging Supabase Auth env, `UZMAX_RLS_DATABASE_URL` and matching authz fact rows are not verified in this worker environment. |

## Validation

Validation was run in the assigned worker worktree. Coordinator reruns used a
temporary `node_modules` symlink to the root checkout's installed dependencies;
the symlink was removed before final guard/status checks.

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `node --test scripts/tests/m6b-api-authz-readiness.test.mjs` | pass | 4/4 focused tests passed: default fail-closed readiness, explicit configured provider readiness, DB fact mapping/revoked behavior and AppModule/source wiring. |
| `node --test scripts/tests/m1-02-api-access-context.test.mjs scripts/tests/m6b-api-authz-readiness.test.mjs` | pass | 9/9 regression tests passed under bundled Node with temporary dependency symlink removed afterward. |
| `prettier --check <touched files>` | pass | All matched touched files use Prettier style. |
| `eslint <touched source/test files>` | pass | No lint errors after focused cleanup. |
| `tsc --noEmit -p tsconfig.json` | pass | Typecheck passed under bundled Node with temporary dependency symlink removed afterward. |
| `guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `guard:eval-triggers --base origin/main` | pass | No eval-triggering paths changed. |
| `guard:workspace` | pass | Linked worker worktree detected; dirty worktree allowed. |
| `guard:worker-write-boundary --assigned /Users/atilla/Applications/UZMAX智能运营-lay-29-api-authz-readiness --root /Users/atilla/Applications/UZMAX智能运营` | pass | Boundary guard reports assigned worktree path and branch OK. |
| `guard:pr-shape --base origin/main --spec docs/specs/M6B-10-api-staging-identity-authz-readiness.md --include-worktree` | pass | 8 changed files: source 3, docs 4, test 1; within spec budget. |
| `guard:forbidden-terms` | pass | No forbidden engine/business-term violation. |
| safe live staging `GET /readyz` before deploying this branch | expected blocked | Current deployed staging still returns HTTP 503 with `authz=not_configured` and `identity=not_configured`; this branch has not been deployed and does not claim live closure. |

## Remaining Live Blockers

- Staging API needs `UZMAX_SUPABASE_URL` and `UZMAX_SUPABASE_PUBLISHABLE_KEY` for identity readiness.
- Staging API needs explicit `UZMAX_API_AUTHZ_REPOSITORY_MODE=rls_prisma_gateway`.
- Staging API needs masked `UZMAX_RLS_DATABASE_URL`.
- Staging DB needs owner-approved synthetic or staging-safe `tenant_member` and `permission_grant` facts for the test user/tenant.
- Live `/readyz` 200 may only be recorded after an actual HTTP check against the configured staging API.

No production mutation, Render/TG mutation, outbound Bot send, restore, real customer/order data or GA-0/1.0 approval occurred in this slice.

## Workspace Boundary Incident

During implementation, the agent initially wrote the LAY-29 diff into root/main by mistake. The affected root files were transferred into the assigned worktree, then root/main was restored clean before validation. The required incident record is `docs/incidents/INC-2026-06-26-lay29-root-write-boundary.md`.

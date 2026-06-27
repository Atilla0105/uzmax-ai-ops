# M6B-12a RLS Access Context Provider

Spec ID: M6B-12a
Tracking issue: Linear LAY-30, LAY-19
Status: `m6b_12a_ready_for_review_not_live_readyz`
Owner confirmation point: owner has authorized staging/test-only runtime activation. This slice is a code fix only and does not approve GA-0, production, real customer/order data, customer LLM/provider use, or 1.0.
Timebox: 0.5 work day.

## Spec 类型

fix

## 目标

Unblock live `/readyz` and synthetic access-context validation by making the env-selected API authz repository usable with the existing RLS policy shape.

The current RLS policies require both `app.org_id` and `app.tenant_id`. The API access-context path had only selected tenant input and the Prisma authz repository read `tenant_member` / `permission_grant` without setting RLS role or tenant context. This slice adds the minimum request contract and repository transaction wiring needed for staging synthetic facts to pass without bypassing RLS.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: has authorized staging/test-only activation and minimal runtime changes needed to clear external blockers.

AI agent: keep the change scoped to API authz context generation, preserve fail-closed behavior, avoid secrets, and do not mark LAY-30 done until live Render `/readyz` and synthetic access-context smoke pass.

## Source Links

- `AGENTS.md`
- `docs/adr/ADR-002-dual-auth-access-context.md`
- `docs/specs/M6B-10-api-staging-identity-authz-readiness.md`
- `docs/evidence/M6B/M6B-10-api-staging-identity-authz-readiness.md`
- `packages/db/migrations/0001_platform_schema_authz_foundation.sql`
- `apps/api/src/access-context.ts`
- `apps/api/src/access-context-core.ts`
- `packages/authz/src/index.ts`

## 触碰模块/文件

- `apps/api/src/access-context.ts`
- `apps/api/src/access-context-core.ts`
- `apps/api/scripts/runtime-compiler.mjs`
- `packages/authz/src/index.ts`
- `scripts/tests/m6b-api-authz-readiness.test.mjs`
- `docs/specs/M6B-12a-rls-access-context-provider.md`
- `docs/evidence/M6B/M6B-12a-rls-access-context-provider.md`
- `docs/evidence/M6B/README.md`

## 变更预算与路径分类

- Source budget: changed source files <= 4, net source LOC <= 180, new source files = 0.
- Test budget: changed test files <= 1.
- Docs budget: 3 files.
- Generated/lock/config: none.
- External API basis: none. This slice uses existing Supabase Auth and existing Prisma/RLS runtime contracts.

## 实施步骤

1. Extend access-context request facts with optional `selectedOrgId`.
2. Read `org_id` from `x-org-id`, query, or body while keeping tenant selection unchanged.
3. Make the RLS Prisma authz repository require `org_id` and set `SET LOCAL ROLE` plus `app.org_id` / `app.tenant_id` in the same Prisma transaction before reading authz facts.
4. Preserve default disabled/fail-closed authz and identity behavior.
5. Keep API runtime compiler mappings in sync for smoke harnesses that import compiled runtime modules.
6. Update focused tests for explicit RLS setup and missing org fail-closed behavior.

## 通过条件

- `scripts/tests/m6b-api-authz-readiness.test.mjs` passes.
- `scripts/tests/m1-02-api-access-context.test.mjs` passes.
- `npm run typecheck -- --pretty false` passes.
- PR shape and workspace isolation guards pass.
- Evidence clearly says live `/readyz` is not closed by this code slice alone.

## 失败分支

- If RLS requires a DB schema/security-definer change instead of request `org_id`, stop and open a DB-serial spec.
- If the change requires JWT business claims, stop and return to ADR-002; business authorization must not move into JWT claims.
- If live Render still lacks a valid RLS DB URL or Supabase identity env, keep LAY-30 open with platform/env blocker evidence.

## 不做什么

- No DB schema or migration.
- No public admin UI change.
- No production env or customer data.
- No service role key or DB URL recorded.
- No GA-0, production, or 1.0 approval.

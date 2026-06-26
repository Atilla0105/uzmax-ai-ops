# M6B-10 API Staging Identity/Authz Readiness Provider Wiring

Spec ID: M6B-10
Tracking issue: Linear LAY-29
Status: `m6b_10_api_authz_readiness_in_progress_not_ga0`
Owner confirmation point: project owner authorized an independent worker branch for staging readiness provider wiring. Owner still owns staging Supabase/Auth/env/facts, any live `/readyz` acceptance, production, real customer/order data, outbound Bot send, LLM/provider keys, cost/compliance risk, GA-0 and 1.0 decisions.
Timebox: 0.5 work day.

## Spec 类型

fix

## 目标

Remove the API readiness blocker where `AppModule` always wires `API_AUTHZ_REPOSITORY` to `DisabledAuthzRepository`.

M6B-10 adds an env-selected API authz repository provider. The default remains disabled/fail-closed. Explicit staging/runtime configuration can select a DB-backed repository that reads authorization facts from the existing `tenant_member` and `permission_grant` contracts.

This slice is implementation-ready without claiming live staging `/readyz` 200 unless the owner-gated Supabase Auth env, RLS DB env and authz fact rows are actually present and verified.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: provides/approves staging Supabase Auth settings, `UZMAX_RLS_DATABASE_URL`, synthetic staging member/grant facts and any live `/readyz` 200 acceptance.

AI agent: implement the narrow provider wiring, keep default fail-closed behavior, avoid secrets and production mutation, validate locally with unit/fake Prisma coverage, and record live-env blockers honestly.

## Source Links

- `AGENTS.md`
- `UZMAX智能运营系统-技术架构-v1.1.md` §2.1 and §3
- `UZMAX智能运营系统-PRD-v1.1.md` §3
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` B-01 through B-05
- `docs/evidence/M6B/README.md`
- `docs/incidents/INC-2026-06-26-lay29-root-write-boundary.md`
- `apps/api/src/access-context.ts`
- `apps/api/src/app.module.ts`
- `packages/authz/src/index.ts`
- `packages/db/prisma/schema.prisma`
- `packages/db/src/prisma-runtime.ts`

## 触碰模块/文件

- `apps/api/src/access-context.ts`
- `apps/api/src/app.module.ts`
- `apps/api/scripts/runtime-compiler.mjs`
- `scripts/tests/m6b-api-authz-readiness.test.mjs`
- `docs/specs/M6B-10-api-staging-identity-authz-readiness.md`
- `docs/evidence/M6B/M6B-10-api-staging-identity-authz-readiness.md`
- `docs/evidence/M6B/README.md`
- `docs/incidents/INC-2026-06-26-lay29-root-write-boundary.md`

## 变更预算与路径分类

- Source budget: changed source files <= 3, net source LOC <= 220, new source files <= 0.
- Test budget: new focused test files <= 1.
- Docs: 4 files, including one required workspace-boundary incident record.
- Generated/lock/config: none.
- New source `rg` conclusion: searched `API_AUTHZ_REPOSITORY`, `DisabledAuthzRepository`, `createIdentityVerifierFromEnv`, `createUzmaxPrismaClientFromEnv`, `UZMAX_RLS_DATABASE_URL`, `AuthzRepository`, `tenantMember`, `permissionGrant`, `tenant_member` and `permission_grant`. Existing `packages/authz` already defines the resolver contract and existing Prisma schema already contains the required models. The missing owner is API provider wiring plus a DB-backed repository implementation in the existing access-context adapter surface, so no new source file is needed.
- External API/SDK/provider/connector/adapter basis: no new external provider or API. Prisma usage relies on the existing generated Prisma client and repo-local `createUzmaxPrismaClientFromEnv()` / `UZMAX_RLS_DATABASE_URL` runtime pattern.

## 文档触发检查

updated

## 前置条件

- Root/main checkout remains coordination-only and clean.
- Assigned worktree is `/Users/atilla/Applications/UZMAX智能运营-lay-29-api-authz-readiness`.
- Assigned branch is `codex/lay-29-api-authz-readiness`.
- Base is current `origin/main` at `471b8b58ee928b1cbef35e625b73efbb58d9520a` or later if main moves.
- No DB schema/migration is expected; stop and split if the current `TenantMember` / `PermissionGrant` contracts are insufficient.

## 实施步骤

1. Add env-selected API authz repository runtime mode with default `disabled`.
2. Add explicit `rls_prisma_gateway` mode backed by `createUzmaxPrismaClientFromEnv()`.
3. Implement repository fact loading from `tenant_member` and `permission_grant`, mapping Prisma membership status into `packages/authz` facts and ignoring/rejecting revoked or inactive business authorization rows through the existing resolver contract.
4. Change `AppModule` to call the provider factory instead of hard-wiring `DisabledAuthzRepository`.
5. Add focused tests for default `/readyz` fail-closed status, configured readiness status, DB fact mapping/revocation behavior and AppModule source wiring.
6. Record evidence and live-env status honestly.

## 通过条件

- Default API `/readyz` remains HTTP 503 with authz `not_configured` when no explicit authz repository mode is set.
- Explicit DB-backed provider reports authz readiness `configured` with fake Prisma/client injection.
- DB-backed repository maps active `tenant_member` rows and selected-tenant `permission_grant` rows into `AccessContextFacts`.
- Revoked/inactive membership rows do not authorize access and revoked selected tenants do not leak grants into the selected access context.
- `AppModule` no longer hard-wires `DisabledAuthzRepository` as the only API authz provider.
- No JWT `user_metadata` or JWT permission claims are used for business authorization.

## 失败分支

- If live staging lacks Supabase Auth env, DB URL or matching `tenant_member` / `permission_grant` facts, record `implementation_ready_live_env_blocked` and do not claim live `/readyz` 200.
- If the existing schema cannot represent the needed facts, stop and create a follow-up DB/schema spec instead of adding migration churn here.
- If production deploy, real customer/order data, outbound Bot send, real LLM/provider calls or restore are required, stop and request owner approval.

## 不做什么

- No production deploy or Render/TG mutation.
- No outbound Bot send.
- No real customer/order data.
- No customer LLM/provider call.
- No Supabase secret printing or committing.
- No schema, migration, generated client or lockfile change.
- No GA-0 or 1.0 approval.

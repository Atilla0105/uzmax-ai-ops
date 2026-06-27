# M6B-12 Live Readyz Identity/Authz Activation

Spec ID: M6B-12
Tracking issues: Linear LAY-30, write-back to LAY-19
Status: `historical_m6b_12_readyz_activation_attempt_superseded_by_m6b17_not_ga0`
Owner confirmation point: project owner authorized staging/test-only Supabase/Auth/RLS facts, Render staging env activation, minimal cost if needed, and Linear blocker write-back. Production, real customer/order data, outbound Bot send, customer LLM/provider use, GA-0 and 1.0 remain not approved.
Timebox: 0.5 work day.

Postscript: this worker slice recorded the first failed activation attempt. Later M6B-12a/M6B-12b/M6B-17 evidence supersedes the Render write-path blocker and records LAY-30 Done with live `/readyz` HTTP 200. This historical spec remains useful only as the failed-branch evidence trail.

## Spec 类型

docs

## 目标

Close LAY-30 only if the existing staging API reports live `/readyz` HTTP 200 and a synthetic Supabase/Auth/RLS access-context smoke proves the configured identity/authz path is not empty wiring.

This slice uses the existing staging API `https://uzmax-api-staging.onrender.com`, existing staging UUIDs from `render.yaml`, and the existing Supabase dev project as a staging-safe synthetic fact source. It must write the result back to LAY-19 because LAY-30 is only LAY-19's `/readyz` sub-blocker.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: has authorized the staging/test-only platform mutations and minimum necessary cost for this activation pass.

AI agent: create only controlled synthetic facts, avoid secret printing, activate Render env only if a Render write path exists, verify live HTTP results, and leave LAY-30 open unless `/readyz` 200 and access-context smoke both pass.

## Source Links

- `AGENTS.md`
- `docs/evidence/M6B/README.md`
- `docs/evidence/M6B/M6B-10-api-staging-identity-authz-readiness.md`
- `apps/api/src/access-context.ts`
- `packages/authz/src/index.ts`
- `packages/db/prisma/schema.prisma`
- `render.yaml`

## 触碰模块/文件

- `docs/specs/M6B-12-live-readyz-activation.md`
- `docs/evidence/M6B/M6B-12-live-readyz-activation.md`
- `docs/evidence/M6B/README.md`

## 变更预算与路径分类

- Source/test/generated/lock/config budget: none.
- Docs budget: 3 files.
- New source files: none.
- External API basis: Supabase connector for project URL, publishable key, SQL execution and branch listing; Render public API probe for auth boundary; live HTTP probes against the existing Render staging API.

## 实施步骤

1. Confirm root/main and worker worktree state.
2. Confirm Supabase project and existing authz tables.
3. Insert only controlled synthetic org/tenant/channel/member/grant facts aligned with `render.yaml` staging UUIDs.
4. Create a synthetic Supabase Auth user and token without printing token values.
5. Probe current live staging `/healthz`, `/readyz`, and `/me/access-context`.
6. If Render write access exists, set staging API env and redeploy; then re-run probes.
7. If Render write access is absent, record the precise remaining blocker and do not close LAY-30.

## 通过条件

- `GET /healthz` returns HTTP 200.
- `GET /readyz` returns HTTP 200.
- `GET /me/access-context` with the synthetic bearer token and `x-tenant-id` returns HTTP 200 and includes `tenant:read`.
- Missing-secret Telegram webhook still returns HTTP 401.
- LAY-30 is marked Done only after the above live evidence exists, and the exact closure is written back to LAY-19.

## 失败分支

- If Render env write access is unavailable, keep LAY-30 open and record `render_env_write_path_missing`.
- If Supabase Auth cannot produce a synthetic token, record `synthetic_auth_session_missing`.
- If DB facts cannot be inserted safely, record `synthetic_authz_facts_missing`.
- Do not use production, real customer/order data, outbound Bot send, or secret values to force a pass.

## 不做什么

- No production deploy or production env mutation.
- No real customer/order data.
- No outbound Telegram Bot send.
- No customer LLM/provider call.
- No schema, migration, source, generated, lockfile or CI change.
- No GA-0 or 1.0 approval.

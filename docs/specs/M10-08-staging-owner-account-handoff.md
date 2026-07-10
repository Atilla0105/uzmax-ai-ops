# M10-08 Staging Owner Account Handoff

Spec ID: M10-08
Status: `evidence_ready`
Owner confirmation point: project owner authorized one human staging operator account, supplied the address out of band, corrected its domain, and approved granting exactly every permission currently enforced by the backend. The address must only enter runtime through the GitHub secret `UZMAX_STAGING_OWNER_EMAIL`; it must not be committed, printed, or placed in evidence. Owner still owns production, real customer/order-data expansion, LLM/provider keys, cost/compliance, GA and 1.0 release.
Timebox: one narrow authz provisioning plus admin authentication vertical slice.

## Spec 类型

feature

## Goal

Close the human operator login gap for staging without creating a shared password or bypassing backend authorization:

1. A dispatch-only GitHub workflow receives the operator address only from `UZMAX_STAGING_OWNER_EMAIL` and requires exact confirmation `M10-08`.
2. A missing Supabase Auth user receives an official invite; an existing user receives an official password-recovery email. Both return to `https://uzmax-admin.vercel.app/`.
3. The existing org and tenant membership are idempotently activated with role `owner_operator`.
4. The selected tenant receives exactly the current backend-enforced permission set, replacing any stale grants and recording before/after permissions in `audit_log` with explicit workflow/system actor semantics.
5. The admin login strip rejects blank submissions, can request password recovery, consumes invite/recovery callbacks, lets the user set a password, stores only the real access token in the existing session-storage contract, removes auth material from the URL, and enters the existing API session.
6. Manual token fallback, local preview, strict runtime truth, tenant scope and the prototype-derived compact design system remain intact.

## Owner Facts

- Operator email: runtime secret `UZMAX_STAGING_OWNER_EMAIL` only; no literal address in source, tests, docs, workflow inputs, summaries or logs.
- Role: `owner_operator`.
- Org: `11111111-1111-4111-8111-111111111604`.
- Tenant: `22222222-2222-4222-8222-222222222604`.
- Redirect: `https://uzmax-admin.vercel.app/`.
- Exact backend-enforced permissions:

  - `ai_member:read`
  - `ai_member:write`
  - `config:rollback`
  - `config:write`
  - `confirmation:read`
  - `confirmation:write`
  - `conversation:read`
  - `customer:read`
  - `customer:write`
  - `logs:export`
  - `logs:read`
  - `order:read`
  - `order:write`
  - `permission:write`
  - `template:write`
  - `tenant:read`
  - `tenant:switch`
  - `ticket:write`

Focused tests must derive the permission literals from all current `apps/api/src/**/*.ts` checks and fail on drift, including `access-context-core.ts` checks for configuration, permission administration and tenant switching.

## AI Agent Responsibilities

- Implementation worker writes only in `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-08-staging-owner-account-handoff` on `codex/m10-08-staging-owner-account-handoff`.
- Implementation worker must not edit root/main, dispatch the workflow, send a real email, provision a real account, deploy, or print/commit operator identity or credentials.
- Implementation worker implements and validates the provisioning/authentication contracts with fakes and browser interception only.
- Coordinator later owns setting `UZMAX_STAGING_OWNER_EMAIL`, dispatching `M10-08`, deployment, and live owner handoff/acceptance.
- Reviewers verify spec compliance first, then code quality, secret hygiene, exact permission replacement and browser callback behavior.

## Source Of Truth

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`
- Existing session contract: `apps/admin/src/adminRuntimeConfig.ts`
- Existing authz provisioning patterns: `packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs` and `packages/authz/scripts/m10-support-operator-smoke-*.mjs`
- Supabase official JavaScript references:
  - https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail
  - https://supabase.com/docs/reference/javascript/auth-admin-listusers
  - https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
  - https://supabase.com/docs/reference/javascript/auth-updateuser
  - https://supabase.com/docs/reference/javascript/auth-onauthstatechange
  - https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession
  - https://supabase.com/docs/guides/auth/debugging/error-codes
  - https://supabase.com/docs/guides/auth/rate-limits

## Current Repo Facts

| Fact | Evidence |
|---|---|
| Live admin correctly fails closed with HTTP 401 when no real session exists. | M10-07 live verification and current `apps/admin/src/adminRuntimeAuth.ts`/runtime clients. |
| Existing UI posts empty email/password to Supabase and has no recovery action or invite/recovery password form. | `apps/admin/src/AdminRuntimeAccessPanel.tsx`. |
| Existing browser auth uses a handwritten password-token request and stores the access token in session storage; manual token fallback is already supported. | `apps/admin/src/adminRuntimeAuth.ts`, `apps/admin/src/adminRuntimeConfig.ts`. |
| Existing smoke provisioning creates or updates deterministic test users with random passwords; it is not a human handoff path and does not use invite/recovery. | M9/M10 authz scripts and workflows. |
| Supabase JS is pinned in the workspace but not declared by `@uzmax/admin`. | root lockfile and `apps/admin/package.json`. |
| Current backend checks enforce exactly the 18 permissions listed above. | Literal `RequirePermission`/`assertPermission` checks under `apps/api/src`, including `access-context-core.ts`. |
| Existing Prisma schema already supports org membership, tenant membership, permission grants and audit logs. | `packages/db/prisma/schema.prisma`. |
| Coordinator confirmed the email secret is set, no matching Auth user exists, both org/tenant rows exist, and current grants are smoke-only. | Coordinator runtime preflight; identity remains secret and is not copied into this spec/evidence. |
| Hosted Supabase default SMTP can reject non-organization-team recipients with `email_address_not_authorized` and is limited/best-effort. | Supabase official Auth error-code and rate-limit documentation. |

## Scope

- Add one server-side provisioning script using `@supabase/supabase-js` Admin APIs and the existing Prisma schema.
- Find an existing auth user by normalized email through paginated `auth.admin.listUsers`; invite a missing user with `auth.admin.inviteUserByEmail`; request recovery for an existing user with `auth.resetPasswordForEmail`.
- Keep Supabase Auth metadata non-authoritative: invite options contain no role or permission metadata; authorization facts live only in `org_member`, `tenant_member` and `permission_grant` per ADR-002.
- Upsert active org/tenant membership, replace the exact selected-tenant permission set, and write one `audit_log` event in the same DB transaction.
- Keep the CLI result to sanitized email hash, status, invite delivery-request status and counts only; mask workflow secrets and keep the service-role key server-side.
- Add a dispatch-only workflow with exact confirmation and existing Supabase/DB secrets.
- Replace the admin handwritten auth calls with the pinned Supabase JS client; persist its refreshable session only in `sessionStorage` under a unique key while preserving the existing API access-token contract.
- Configure the browser client with explicit `flowType: "implicit"`; accept only complete implicit invite/recovery callbacks. Code-only PKCE or token callbacks without a recognized `type=invite|recovery` fail closed and are cleaned from the URL.
- Add blank validation, recovery request state, invite/recovery callback state, password update state, URL cleanup and session activation.
- Add focused Node/static and Playwright coverage plus evidence.

## Out Of Scope

- No real workflow dispatch, real invite/recovery email, live account mutation or owner identity in evidence.
- No production deploy, Vercel/Render/Supabase configuration mutation, GA/1.0 approval or real customer/order-data expansion.
- No schema, migration, generated client, API route, backend authorization behavior, RLS policy, worker or cron change.
- No password generation, password printing, password persistence, frontend service-role key or direct `auth.users` write.
- No custom SMTP setup or SMTP configuration change; this slice fails closed on the hosted-provider restriction.
- No broad admin redesign or local-preview/runtime fallback change.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `.github/workflows/m10-staging-owner-account-handoff.yml`
  - `apps/admin/package.json`
  - `apps/admin/src/AdminRuntimeAccessPanel.tsx`
  - `apps/admin/src/adminRuntimeAuth.ts`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/tests/m10-staging-owner-account-handoff.spec.ts`
  - `docs/specs/M10-08-staging-owner-account-handoff.md`
  - `docs/evidence/M10/M10-08-staging-owner-account-handoff.md`
  - `package-lock.json`
  - `packages/authz/scripts/run-m10-staging-owner-account-handoff.mjs`
  - `scripts/tests/m10-staging-owner-account-handoff.test.mjs`
  - `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`

Read-only anchors:

- `apps/admin/src/adminRuntimeConfig.ts`
- `apps/admin/src/App.tsx`
- `apps/api/src`
- `packages/db/prisma/schema.prisma`
- `packages/authz/scripts/run-m9-ga0-employee-provisioning.mjs`
- `.github/workflows/m9-ga0-employee-smoke.yml`

## Change Budget

- Source: changed source files <= 4, new source files <= 1, net source LOC <= 600.
- Test: new/changed focused test files <= 3; no deleted/weakened tests and no skip/only.
- Docs/evidence: this spec and one evidence file.
- Config/lock: one new workflow, one admin dependency declaration and mechanical lockfile update.
- Schema/migration/generated/API/backend behavior: none.
- Exceptions: none.

## New Source Search / Ownership

`rg` searched existing Supabase admin provisioning, `inviteUserByEmail`, `resetPasswordForEmail`, `listUsers`, password recovery, auth callbacks and access-fact writes. Existing M9/M10 scripts are smoke-specific and mutate deterministic test users/passwords; extending them would mix human handoff with synthetic smoke behavior. The new source belongs under `packages/authz/scripts` as the dispatch-only authz provisioning entrypoint. Admin authentication remains an in-place extension of the existing `adminRuntimeAuth.ts`/access panel.

## Acceptance

- Workflow runs only on `workflow_dispatch`, only when `confirm == 'M10-08'`, and receives the address only from `secrets.UZMAX_STAGING_OWNER_EMAIL`.
- No source, test fixture, doc, workflow input/default, output, summary or log contains the real operator address, password, access/refresh token, service-role key or DB URL.
- Missing normalized email calls `inviteUserByEmail` once with the approved redirect; existing normalized email calls `resetPasswordForEmail` once with the approved redirect; repeated runs do not duplicate auth users or access facts.
- `email_address_not_authorized`, rate-limit or any other invite/recovery rejection records a sanitized rejected/request-failed delivery status and stops before all org/tenant/permission/audit writes.
- Org/tenant memberships are active `owner_operator`; permission writes replace rather than append and equal the sorted 18-item backend-derived allowlist.
- One audit event records workflow/system actor semantics plus before/after permission arrays without exposing the email.
- CLI/public result contains only sanitized email hash, status, invite/recovery delivery-request status and counts; it does not claim inbox delivery from an accepted API request.
- Static tests fail if any backend-enforced permission is missing from or extra to the owner allowlist, explicitly covering `access-context-core.ts`.
- Blank sign-in and blank reset controls remain disabled; submit handlers and the auth hook also reject blank values without calling Supabase.
- Reset request uses `resetPasswordForEmail` with the approved redirect and shows loading/error/success.
- `PASSWORD_RECOVERY` and invite callbacks (`SIGNED_IN` plus URL `type=invite`) show a compact new-password form. Password update uses `updateUser({ password })`, then calls `getSession()` and stores that current session's `access_token` through `storeAccessToken`; `updateUser` is not treated as a token response. URL token/code/type material is removed only after callback session capture, then the existing API session is entered.
- Supabase Auth enables session persistence and automatic refresh with a unique `sessionStorage` key. `SIGNED_IN`, `TOKEN_REFRESHED` and reload-time `INITIAL_SESSION` synchronize the current access token into `uzmax.admin.runtime.accessToken`; `SIGNED_OUT` clears it. A missing Supabase session never clears an existing manual token.
- A callback containing a session/token or code but no recognized invite/recovery type never enters password setup or API session, removes auth material from the URL, and shows a fail-closed error instead of remaining in a verifying state. Supabase client initialization still completes so normal sign-in/reset works in the same page without reload.
- Manual token save/sign-out remains functional; no token is rendered or logged.
- Focused tests, typecheck, lint, admin build, PR shape and diff checks pass.

## Failure Branches

- Missing/invalid email secret or Supabase/DB secret: fail before any mutation with sanitized CLI output.
- Auth user lookup error or pagination failure: stop before membership/permission writes.
- Invite/recovery error, including exact Supabase code `email_address_not_authorized`: record a sanitized fail-closed delivery-request status, stop before DB writes, and do not create a password or custom-SMTP fallback.
- Invite API success: record `invite_requested`, not delivered/received; live workflow evidence must capture the sanitized request status and owner inbox acceptance remains a coordinator/owner check.
- DB transaction failure: roll back membership, permission and audit changes; return sanitized failure.
- Invite accepted before a later DB transaction failure can leave an Auth user with no UZMAX memberships/grants. This is fail-closed (no API authorization); rerunning M10-08 finds that user, sends recovery and retries the exact access transaction.
- Callback has no valid session: remove auth material from the URL, keep API session signed out and show a recovery error.
- Reload with no persisted Supabase session: retain any existing manual API token; do not interpret absence as sign-out.
- Password update fails, or post-update `getSession()` has no session/access token: keep the callback form active, do not store a token, and show a sanitized Supabase error without token material.
- Supabase runtime env absent in local preview: retain disabled Supabase controls and manual token fallback.

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-08-staging-owner-account-handoff` |
| assigned branch | `codex/m10-08-staging-owner-account-handoff` |
| preflight `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-08-staging-owner-account-handoff` |
| preflight status | `## codex/m10-08-staging-owner-account-handoff` |
| preflight current branch | `codex/m10-08-staging-owner-account-handoff` |
| base | `895b6fdc62a0cacc1571e2a7481f6665ad3e2c50` |
| root/main preflight | clean at the same base; coordination-only |
| Impeccable context | product register; compact familiar controls, explicit state, no decoration |

## Impeccable Design Layer

Adopted:

- Keep authentication inside the existing compact runtime strip and use familiar form controls/actions.
- Add explicit default, loading, error, success and callback states with visible focus and status text.
- Use progressive inline recovery/password controls rather than a modal or decorative onboarding surface.
- Keep permission/runtime truth visible and preserve manual token fallback.

Rejected:

- Skeleton loading: authentication actions are short command states where button loading and inline status are clearer than content skeletons.
- New page/route or modal: the existing runtime strip owns API session entry; a separate auth surface would add navigation and state duplication without product value.

## Validation

- `node --test scripts/tests/m10-staging-owner-account-handoff.test.mjs`
- `npm run playwright -- apps/admin/tests/m10-staging-owner-account-handoff.spec.ts`
- `npm run typecheck -- --pretty false`
- `npm run lint`
- `npm run build:admin`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M10-08-staging-owner-account-handoff.md --include-worktree`
- `git diff --check origin/main...HEAD`

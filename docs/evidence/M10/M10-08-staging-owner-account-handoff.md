# M10-08 Staging Owner Account Handoff Evidence

> evidence_id: M10-08-staging-owner-account-handoff
> spec: `docs/specs/M10-08-staging-owner-account-handoff.md`
> branch: `codex/m10-08-staging-owner-account-handoff`
> status: `evidence_ready_not_dispatched`

## Summary

M10-08 closes the implementation gap between a fail-closed staging admin and a human operator handoff without committing identity, creating a shared password or bypassing backend authorization.

- The dispatch-only workflow accepts exact confirmation `M10-08` and reads the operator address only from `UZMAX_STAGING_OWNER_EMAIL`.
- Missing normalized users use Supabase Admin `inviteUserByEmail`; existing users use `resetPasswordForEmail`. No role or permission is placed in user metadata.
- Invite/recovery rejection stops before all membership, permission and audit writes.
- Successful email request is followed by one DB transaction that activates `owner_operator` org/tenant membership, replaces the exact 18-item permission set and writes before/after permission arrays to `audit_log` with explicit GitHub Actions system-actor semantics.
- Public workflow output contains only a hash prefix, status, email-request status and counts.
- Admin auth now uses the pinned Supabase JS client, keeps the existing session-storage access-token contract, preserves manual token fallback and supports sign-in, reset, invite/recovery password setup and token URL cleanup.
- Supabase is dynamically loaded into a separate chunk; the existing size limit remains green.

## Runtime Facts And Boundary

Coordinator preflight confirmed, without exposing the address:

- `UZMAX_STAGING_OWNER_EMAIL` is set to the corrected owner address.
- No matching Supabase Auth user existed at preflight, so the first live run is expected to use the invite path.
- The target org and tenant rows exist.
- Existing permission rows are smoke grants only.

This worker did not dispatch the workflow, send an email, mutate Supabase/DB, deploy, or verify an owner inbox. The implementation is evidence-ready; live handoff remains coordinator/owner work.

## Hosted SMTP Fail-Closed Boundary

Supabase hosted default SMTP can reject a recipient with exact code `email_address_not_authorized` when the address is not authorized for the project organization. M10-08 records this as `rejected_email_address_not_authorized`, returns zero write counts and never opens the DB transaction. No custom SMTP configuration belongs to this slice.

An accepted invite API request is recorded as `invite_requested`, not inbox delivery. Inbox receipt and link acceptance require owner verification.

If Supabase accepts the invite but the later DB transaction fails, an Auth user can remain without UZMAX membership or permission grants. That state is fail-closed: API authorization still denies access. Rerunning M10-08 finds the existing user, sends recovery and retries the exact access transaction; it does not escalate access through Auth metadata.

## Exact Permission Contract

The provisioning allowlist contains exactly 18 permissions and focused tests derive every matching permission literal from `apps/api/src` to detect drift. The test also separately proves `access-context-core.ts` contributes:

- `config:rollback`
- `config:write`
- `permission:write`
- `tenant:switch`

The remaining backend-enforced permissions cover AI member, confirmation, conversation/ticket, customer, logs, order, template and tenant read/write paths. Permission replacement deletes the selected user's existing tenant grants and recreates only the sorted allowlist inside the same transaction as membership and audit writes.

## Browser Acceptance

Focused Playwright used a controlled local Vite runtime and intercepted fake Supabase/API endpoints. It did not use the owner address or a real token.

| Flow | Result |
|---|---|
| blank sign-in/reset | buttons disabled; no Supabase request |
| reset request | `resetPasswordForEmail` request observed; explicit success shown |
| manual token | existing sessionStorage save/sign-out contract preserved |
| unsupported `?code` callback | auth URL cleaned; fail-closed error shown; same-page password sign-in still succeeds |
| invite implicit callback | callback session captured; URL tokens removed; password form shown |
| `PASSWORD_RECOVERY` implicit callback | callback session captured; URL tokens removed; password form shown |
| password update | `updateUser({ password })` observed; then `getSession()` supplies the stored access token |

No token is rendered or logged. A missing post-update session/access token remains signed out and fail-closed.

## Changed Files

| Category | Files |
|---|---|
| source | `apps/admin/src/AdminRuntimeAccessPanel.tsx`; `apps/admin/src/adminRuntimeAuth.ts`; `apps/admin/src/shell/AppShell.css`; `packages/authz/scripts/run-m10-staging-owner-account-handoff.mjs` |
| test | `apps/admin/tests/m10-staging-owner-account-handoff.spec.ts`; `scripts/tests/m10-staging-owner-account-handoff.test.mjs`; `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs` |
| config | `.github/workflows/m10-staging-owner-account-handoff.yml`; `apps/admin/package.json` |
| lock | `package-lock.json` mechanical workspace dependency update |
| docs | `docs/specs/M10-08-staging-owner-account-handoff.md`; this evidence file |

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m10-staging-owner-account-handoff.test.mjs` | pass | 9/9 focused provisioning, permission drift, SMTP, callback and workflow tests. |
| `npm run playwright -- apps/admin/tests/m10-staging-owner-account-handoff.spec.ts` | pass | 3/3 controlled browser tests. |
| `npm run test` | pass | 555/555 Node tests. |
| `npm run typecheck -- --pretty false` | pass | TypeScript exit 0 after Prisma client generation. |
| `npm run lint` | pass | ESLint exit 0. |
| `npm run build:admin` | pass | Supabase split to a separate dynamic chunk; existing Vite large-chunk warning remains. |
| `npm run size` | pass | Admin bundle 226.61 kB brotlied under the 250 kB limit. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M10-08-staging-owner-account-handoff.md` | pass | 12 files; source 4; net source LOC 600; new source 1; test 3; docs 2; config 2; lock 1. |
| `git diff --check` | pass | No whitespace errors. |

## Impeccable Review

Adopted the product-register guidance: compact familiar controls in the existing runtime strip, explicit loading/error/success states, progressive inline password setup, visible focus behavior and no decorative/modal auth surface. Manual token remains available as the existing operational fallback.

No new visual system, route, modal, card or decorative motion was introduced.

## Remaining Coordinator/Owner Steps

1. Merge the reviewed M10-08 PR and allow CI to pass.
2. Dispatch the merged workflow with exact confirmation `M10-08`.
3. Record sanitized workflow status. Stop on `email_address_not_authorized` or any non-success status; do not add custom SMTP in this slice.
4. Owner verifies invite receipt, sets a password and signs in through the deployed admin callback.
5. Coordinator verifies `/me/access-context`, conversations, tickets and confirmation queue with the real session without exposing the token or customer payload.

This evidence does not approve production, GA, 1.0, real customer/order-data expansion, LLM/provider use, custom SMTP or release closure.

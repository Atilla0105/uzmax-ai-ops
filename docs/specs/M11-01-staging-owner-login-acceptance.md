# M11-01 Staging Owner Login Acceptance

Spec ID: M11-01
Status: `owner_action_pending`
Owner confirmation point: the project owner authorized one human staging operator account in M10-08 and asked the AI agents to complete the Value-0 loop on 2026-07-10. The owner alone enters a password, accepts the invitation and confirms the live browser session. AI agents may inspect sanitized workflow status and navigate to the sign-in/password handoff point, but must not read, generate, store or submit the password.
Timebox: machine preflight plus one bounded owner action.

## Spec 类型

infra

## Goal

Convert M10-08 from an accepted invite request into one verified human staging session:

1. confirm the merged M10-08 workflow requested the invite and provisioned the exact current access facts;
2. confirm the deployed admin remains signed out until a real Supabase session exists;
3. owner accepts the invite, chooses a password and signs in at `https://uzmax-admin.vercel.app/`;
4. authenticated `/me/access-context` returns the selected tenant and the current 18-permission allowlist without exposing the token or owner identity;
5. record the live acceptance in M11-09, where the later `conversation:reply` permission will also be provisioned and read back.

M11-01 is not complete until steps 3-4 pass. Because final password submission is an owner-only action, M11-00's owner-action failure branch permits M11-02 through M11-08 machine-verifiable implementation to proceed on isolated branches without any live deployment or Value-0 signoff. M11-09 remains blocked on this login acceptance.

## Source Of Truth

- `AGENTS.md`
- `docs/specs/M10-08-staging-owner-account-handoff.md`
- `docs/evidence/M10/M10-08-staging-owner-account-handoff.md`
- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- current deployed staging admin

## Current Facts

- GitHub Actions run `29077638994` completed successfully with sanitized status `m10_08_owner_access_ready_for_email_acceptance`.
- The run reported `invite_requested`, 18 permissions, two memberships and one audit event; it did not claim inbox receipt or invite acceptance.
- The deployed admin still shows `API session required`; no real owner session is active in the inspected browser.
- A bounded search of the connected Gmail mailbox found no matching Supabase invite, so the approved owner address belongs to another mailbox or the message is not present there.

## AI Agent Responsibilities

- Keep the owner address, email headers, password, access/refresh token and callback URL material out of source, evidence, logs and chat.
- Do not trigger another invite/recovery while the accepted request may still be valid.
- Do not create a shared password or use a service-role/manual token as owner-login acceptance.
- Leave the deployed admin at a safe sign-in/handoff point and request only the owner password action.
- Continue only machine-verifiable M11 implementation while login is pending; do not deploy or issue a live pass token.

## Preconditions

- Base main: `ecf2672ef7c6271223e3dc66148c21e2717fbeb4`.
- Assigned worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-01-staging-owner-login-acceptance`.
- Assigned branch: `codex/m11-01-staging-owner-login-acceptance`.
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`.
- M11-00 is merged; root/main is clean; no open PR or unmerged branch existed before this worktree.

## 触碰模块/文件

- `docs/specs/M11-01-staging-owner-login-acceptance.md`
- `docs/evidence/M11/M11-01-staging-owner-login-acceptance.md`
- `docs/evidence/M10/M10-08-staging-owner-account-handoff.md`

## Change Budget

- Source/test/config/generated/lock/schema/migration: none.
- Docs: this spec, one M11 evidence record and one factual M10-08 evidence status update.
- Exceptions: none.

## 文档触发检查

updated

## Implementation Steps

1. Verify the sanitized M10-08 workflow result and current deployed admin sign-in state.
2. Search only an already connected mailbox for the invite without changing message state or exposing identity.
3. Update evidence to distinguish invite requested from invite accepted.
4. Ask the owner to accept the invite and enter the password only in the deployed admin flow.
5. In M11-09, verify the real session against `/me/access-context`, update the evidence to accepted and include the later `conversation:reply` grant.

## Pass Conditions

- Owner confirms invite acceptance and password setup.
- Deployed admin holds a real Supabase session, not a manual/service-role token.
- `/me/access-context` returns HTTP 200 for the approved org/tenant and exact current permission set.
- Wrong-tenant access remains denied/empty.
- No credential, owner identity or auth material appears in evidence.

## Failure Branches

- Invite not found in the connected mailbox: keep status `owner_action_pending`, ask the owner to use the approved mailbox and continue only non-live machine work.
- Invite expired: after owner confirmation, rerun the existing M10-08 recovery path; do not invent a password or bypass email ownership.
- `email_address_not_authorized`, rate limit or recovery rejection: stop; do not add shared credentials or custom SMTP without a separate owner-approved infra spec.
- Login succeeds but `/me/access-context` fails: keep M11-09 blocked and open a narrow authz/runtime defect spec rather than accepting a UI-only session.

## Out Of Scope

- Authentication source/workflow changes, custom SMTP, shared passwords or password-manager access.
- API/worker/admin feature implementation, deployment, Telegram traffic or DeepSeek calls.
- Production/GA/1.0 approval or real customer/order data.

## Acceptance Mapping

| Requirement | Evidence |
|---|---|
| invite/access request succeeded | workflow run `29077638994` sanitized outputs |
| owner inbox/password action | owner confirmation only; never copied into evidence |
| deployed real session | M11-09 browser + `/me/access-context` readback |
| no bypass/secret disclosure | this spec/evidence and M10-08 boundaries |

## Incident And Closeout

- No M11 process incident found.
- M11-01 remains pending on the bounded owner action; this is not a code/runtime completion claim.

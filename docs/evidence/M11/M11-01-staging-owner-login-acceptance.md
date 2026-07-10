# M11-01 Staging Owner Login Acceptance Evidence

> evidence_id: M11-01-staging-owner-login-acceptance
> spec: `docs/specs/M11-01-staging-owner-login-acceptance.md`
> branch: `codex/m11-01-staging-owner-login-acceptance`
> status: `owner_action_pending`

## Outcome

The machine-verifiable handoff is complete, but human login acceptance is not:

- M10-08 workflow run `29077638994` succeeded.
- Sanitized result: `m10_08_owner_access_ready_for_email_acceptance`, `invite_requested`, 18 permissions, two memberships and one audit event.
- The deployed admin still shows `API session required`.
- The invite was not present in the connected Gmail mailbox; no other mailbox was inspected and no email identity was recorded.

This is not a login pass. The owner must accept the invitation and enter a password in the approved mailbox/deployed admin flow. M11-02 through M11-08 may continue as machine-only implementation, but M11-09 live deployment/E2E remains blocked until real `/me/access-context` readback succeeds.

## Safety

- No owner address, email body/header, password, token, callback parameter or raw auth response was printed or committed.
- No second invite/recovery was requested.
- No shared password, service-role token or manual API token was used as a substitute.

## Start Audit

| Fact | Evidence |
|---|---|
| base | `ecf2672ef7c6271223e3dc66148c21e2717fbeb4` |
| worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-01-staging-owner-login-acceptance` |
| branch | `codex/m11-01-staging-owner-login-acceptance` |
| root/main | clean and coordination-only |
| open PRs / unmerged branches before start | none |

## Reviews And Validation

- Spec compliance: pass; the owner-only password boundary, machine-only continuation branch and M11-09 live gate are explicit.
- Documentation quality: pass; M10-08 now distinguishes invite request from invite acceptance without copying identity or auth material.

| Command | Result |
|---|---|
| `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M11-01-staging-owner-login-acceptance.md --include-worktree` | pass; 3 docs, 0 source |
| `prettier --check` on the three touched docs | pass |
| `git diff --check` | pass |

## Owner Handoff

Open the Supabase invite in the approved owner mailbox, set the password only on the deployed callback flow, then sign in at `https://uzmax-admin.vercel.app/`. Report completion without sending the password or token in chat.

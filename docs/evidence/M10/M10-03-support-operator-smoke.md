# M10-03 Support Operator Smoke

Spec: `docs/specs/M10-03-support-operator-smoke.md`
Status: `m10_03_support_operator_smoke_workflow_ready_not_run`
Recorded: 2026-07-09
Branch: `codex/m10-03-support-operator-smoke`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-03-support-operator-smoke`

## Current Truth

M10-03 exists to create the missing support-operator validation lane for the customer-service workbench:

- M9-06 proved a deterministic read-only employee session for conversation read evidence.
- M10-01 is the backend write closure branch for conversation-ticket DB mutations.
- M10-02 is the admin runtime truth gate branch that prevents configured runtime from silently falling back to synthetic rows.
- M10-03 will add the independent support-operator staging smoke for the write-capable customer-service path.

This evidence is preflight-only at creation time. No source, workflow or test implementation has been added yet, and no live staging mutation has been run.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-03-support-operator-smoke` |
| branch | `codex/m10-03-support-operator-smoke` |
| status before preflight docs | `## codex/m10-03-support-operator-smoke` |
| root/main status | `## main...origin/main` |
| open PR audit before work | `[]` |
| no-merged branch audit before work | `codex/m10-01-conversation-ticket-db-writes`, `codex/m10-02-admin-conversation-runtime-truth-gate`, `codex/m10-03-support-operator-smoke` |

## Boundary

This evidence does not approve:

- live mutating staging dispatch;
- production traffic;
- 1.0 release;
- broad real customer traffic;
- customer/order data expansion;
- customer LLM/provider use;
- Telegram Business automatic reply;
- formal knowledge write, distill auto-write or confirmation bypass.

The live M10-03 pass remains owner-gated and also depends on M10-01 being merged and deployed to the staging API runtime.

## Required Sanitization

The M10-03 workflow/script must not print:

- password value;
- access token or refresh token;
- service role key;
- database URL;
- publishable key;
- raw Supabase auth response;
- customer text;
- conversation payload.

Allowed evidence is limited to sanitized operational facts such as status, HTTP status codes, counts, hash prefixes, org/tenant ids, deterministic smoke ids and permission count.

## Expected Success Token

If the workflow provisions the support operator, writes the exact permission facts and the synthetic staging API list/handoff/action sequence passes, the script status is:

- `m10_03_support_operator_write_smoke_passed_not_release`

Until that live workflow run exists, the current status remains:

- `m10_03_support_operator_smoke_workflow_ready_not_run`

## Validation Log

Pending implementation.

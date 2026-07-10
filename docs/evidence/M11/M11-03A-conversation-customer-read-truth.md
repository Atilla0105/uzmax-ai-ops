# M11-03A Conversation Customer Read Truth Evidence

Status: `implementation_in_progress`
Spec: `docs/specs/M11-03A-conversation-customer-read-truth.md`
Base: `9b49a779af4ec88e37f2ff6321383df7c184d164`
Branch: `codex/m11-03a-conversation-customer-read`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-03a-conversation-customer-read`

## Split Evidence

- The combined M11-03 spec was independently reviewed to decision-complete PASS.
- Its first source shape stopped at 615 net source lines before repository/test/CI
  wiring; the new ownership file alone was 559 lines.
- No budget exception was requested and no schema/deploy/external mutation ran.
- M11-03A now owns read truth; M11-03B will own atomic takeover/action locks only
  after this slice merges.

## Split-Spec Pre-Review

The read-slice pre-review required and recorded three hardening decisions before
implementation continued:

- SLA/readiness live only at detail root; the nested conversation has no SLA or
  actionable takeover signal, preserving the current admin's blocked state;
- exact ownership mapping is defined separately from mode mapping;
- the reviewed M11-03B lock/event/action/race contract is preserved in the 03A
  appendix so squash merge and branch cleanup cannot erase it.

## Preflight

- M11-02 merged as PR #300 at `9b49a779af4ec88e37f2ff6321383df7c184d164`.
- Root/main is clean and read-only.
- The worktree/branch were renamed to the M11-03A assignment after the split and
  verified to match.
- AGENTS, M11-00, M11-02 and the existing conversation/customer/runner seams were
  read before source work.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| split spec before resumed source work | pass | this spec/evidence replaces combined slice |
| focused read tests | pending | implementation in progress |
| true-DB read/RLS smoke | pending | CI wiring not implemented |
| full static/test/build | pending | implementation in progress |
| spec compliance review | pending | runs before quality review |
| code quality/privacy/RLS review | pending | runs after compliance |
| PR CI | pending | PR not opened |

## Current Conclusion

M11-03A is approved and isolated, not complete. Atomic takeover, M11-03 overall,
aligned staging, production, GA and 1.0 remain open.

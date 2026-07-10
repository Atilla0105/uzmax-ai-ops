# M11-03A Conversation Customer Read Truth Evidence

Status: `local_gates_passed__ci_true_db_pending`
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
| focused read tests | pass | M8/M10/M11 focused command: 8/8 pass, 0 fail/skip |
| local true-DB read/RLS smoke | blocked as expected | fail-closed token `conversation-ticket-true-db-smoke-failed`; neither process env nor worktree `.env.local` contains `UZMAX_RLS_DATABASE_URL`; no local true-DB pass is claimed |
| CI true-DB read/RLS smoke wiring | pass locally | explicit `M11 conversation/customer read true DB smoke` step calls the existing wrapper after M6B DB smoke |
| static gates | pass | Prettier, ESLint, typecheck, dependency-cruiser, jscpd, knip and repository guards pass |
| full repository tests | pass | 561/561 pass, 0 fail/skip after final data-minimizing selects |
| four application builds | pass | API, worker, cron and admin build; existing admin chunk-size warning only |
| spec compliance review | pass | final read contract, mismatch precedence, identity/customer edge cases and operator matrix reviewed after fixes |
| code quality/privacy/RLS review | pass | final review after explicit identity/customer/channel-connection selects found no blocker, major or minor issue |
| PR CI | pending | PR not opened |

## Data-Minimization and Safety Review

- Channel connection lookup selects only `provider`.
- Identity lookup selects only the bounded identity/profile inputs needed by the
  read contract, with a two-row ambiguity bound.
- Customer lookup selects only scoped ID/status/preferred language fields.
- No content, external participant reference, provider message reference,
  profile, DB URL or secret is copied into evidence/logging.
- The root-only readiness contract keeps the existing admin takeover action
  blocked until M11-03B owns the atomic write protocol.

## Final Change Budget

- Source: 6 changed files, +413 net LOC, 1 new source file; allowed maximum is
  6 / 450 / 1. Gross source churn is 519 lines (+466/-53).
- Test/support: 6 changed files, 1 new test file; allowed maximum is 7 / 2.
- Config: 1 CI workflow; docs: this spec and this evidence record.
- Schema, migration, generated client, lockfile, deployment and external
  provider changes: none.
- Exception: none.

## Pending Controlled Gate

The true-DB runner now exercises message/customer/identity detail plus tenant
isolation and RLS in CI. The controlled CI result is still pending; local gates
cannot substitute for it. This evidence must be updated with the latest-SHA CI
run before merge.

## Current Conclusion

M11-03A is locally implementation-complete but not merge-complete until the PR's
latest commit passes the controlled true-DB CI gate. Atomic takeover, M11-03
overall, aligned staging, production, GA and 1.0 remain open.

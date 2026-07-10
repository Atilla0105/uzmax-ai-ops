# M11-04B Atomic Close, Human Reopen And Explicit Bot Resume Evidence

Status: `spec_frozen__implementation_pending`
Spec: `docs/specs/M11-04B-atomic-close-reopen-bot-resume.md`
Base: `5520bc7f4522b73d92d9c896e0a59888058deec7`
Branch: `codex/m11-04b-close-resume`
Worktree:
`/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-04b-close-resume`

## Preflight

- PR #303/M11-04A latest-SHA CI run `29127065610`, job `86474805488`
  completed successfully before squash merge.
- PR #303 merged as `5520bc7f4522b73d92d9c896e0a59888058deec7`;
  root main was fast-forwarded and its M11-04A worktree/local/remote branch were
  removed.
- `git branch --no-merged main`, open PRs and extra worktrees were empty before
  this worktree was created.
- Assigned `pwd`, branch, clean status and base SHA matched; root/main stayed
  clean/read-only.
- This worktree received an independent copied `node_modules` directory.
- `AGENTS.md`, M11-00, M11-03A/03B, M11-04A, PRD/architecture/admin/acceptance
  anchors, current API planner/writer/mappers, worker fence, schema and
  M10/M11 true-DB harnesses were reread.
- No production, real customer/order data, secret mutation, deployment, schema
  or migration is authorized.

## Existing Seam Evidence

- API close/reopen are intentionally blocked and resume has no endpoint.
- Controller parsing drops required close/reopen business fields.
- Current atomic writes cannot select closed history and would not persist a
  conversation change planned by a ticket action.
- Close event payload is not reconstructed in the read model and
  `STATUS_CHANGED` is currently mislabeled as `note_added`.
- Worker M11-04A already enforces the required closed/human/Bot dispositions, so
  worker source changes are unnecessary; API transitions and joint proof are
  the missing seam.
- Existing schema/RLS enums, payloads, timestamps and `audit_log` are sufficient.

## Frozen Decisions

- Close, human reopen and Bot resume are three distinct server-authoritative
  actions.
- Close uses five exact result tokens plus one bounded required
  route/explanation, resets unread and keeps Bot suspended.
- Human reopen selects the latest closed candidate first, then requires that
  candidate to be complete; it never falls back to older history. It assigns
  the authorized reopener, returns `HANDOFF + REOPENED` and preserves history.
- Explicit resume is a separate conversation endpoint. It requires closed
  state, zero unread, zero active ticket and zero all-origin queued outbound.
- Resume leaves the ticket closed, does no LLM/send/replay, and atomically writes
  truthful `STATUS_CHANGED/bot_resumed` plus `audit_log`.
- Close/reopen/resume require a client-stable request UUID plus the exact server
  lifecycle-event anchor. Exact request replay is no-op success even after a
  later lifecycle; reused request ID with different command data, stale anchor
  or a race loser is conflict/zero-write.
- Resume audit uses the canonical `conversation.bot_resumed` event token, a
  server-owned audit UUID shared by event/row/response, and exact tenant-scoped
  audit verification before any retry returns `auditRef`.
- Closed-ticket selection chooses the newest candidate before completeness
  validation and never falls back to an older valid-looking ticket.
- The legacy ticket-only capability close/reopen path fails closed; the API
  atomic planner is the only lifecycle writer.
- One new outbound-fence helper is justified by the existing atomic writer's
  383-nonblank-line ceiling; it cannot own lifecycle decisions.

## Read-only Pre-reviews

- Initial freeze commit: `a432b5c` (`M11-04B: freeze close and Bot resume
  contract`), containing docs only.
- State/security/RLS audit result: `NO-GO source`. Blockers were cross-lifecycle
  delayed replay without request/expected-event tokens, non-canonical audit
  event type and conflicting unread precedence. Majors were latest-ticket
  fallback, unverified auditRef, the parallel legacy capability writer and
  missing in-memory audit parity.
- Product/acceptance audit: required structured close result, human-only reopen,
  explicit resume, unread/queue gates, audit truth and no production/usable-UI
  overclaim.
- Test/true-DB audit result: `NO-GO source`. The frozen 400-line rule contradicted
  the pre-existing runtime compiler, audit write ownership was underspecified,
  race/audit failpoints were not deterministic, readiness proof was incomplete,
  and fake/RLS/sanitizer coverage was too broad.
- Corrective docs now freeze request-bound commands, canonical audit, exact
  replay precedence, no-fallback history selection, stored in-memory audit,
  fail-closed legacy lifecycle actions, the measured compiler allowance,
  runner-only PostgreSQL barriers/failpoint, exhaustive readiness/queue/RLS and
  sanitized-failure matrices. Source remains untouched pending corrected
  re-review.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| root/worktree isolation | pass | clean synchronized root/main; assigned worktree/branch/base matched; independent dependencies |
| existing implementation search | pass | one API planner/writer path and one worker fence path; no parallel runtime authorized |
| schema/migration need | none | existing statuses, event payload, closedAt, audit table and RLS are sufficient |
| initial spec frozen before source | pass | docs-only commit `a432b5c`; no source edit followed the NO-GO review |
| corrected spec freeze | pending commit/re-review | corrective docs only; record exact SHA before source |
| independent corrected spec review | pending | must pass before source edits |
| independent test-plan review | pending | must pass before source edits |
| implementation | pending | no source edit started |
| local gates | pending | no implementation claim |
| true DB/CI | pending | no runtime claim |

## Current Conclusion

M11-04B still has no schema, migration, worker-source or owner-input blocker.
The initial freeze correctly separated close/reopen/resume but was not safe
enough to implement. The corrective contract now addresses every recorded
blocker/major; implementation remains blocked until the corrective docs are
committed and both independent reviewers return `GO source` on the exact SHA.

M11-05 and later Value-0 slices remain serially blocked until M11-04B
implementation, true-DB/CI evidence, merge and branch/worktree cleanup complete.

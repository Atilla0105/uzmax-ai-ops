# M11-04B Atomic Close, Human Reopen And Explicit Bot Resume Evidence

Status: `source_budget_split__M11-04B1_local_pass_true_db_ci_pending`
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
- Two private helpers are justified by measured line gates: lifecycle-state
  holds only pure planning behind the existing atomic-state public facade, and
  outbound-fence holds writer queue locks/cancellation. Neither is a parallel
  repository/runtime/provider path.

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
- Corrected spec freeze commit: `736cb9d9ae4de90786661da2cc296d0cc0a05d3d`
  (`M11-04B: harden lifecycle replay contract`), containing docs only.
- Independent implementation-map audit found the corrected path feasible within
  changed source <=11, net source <=600 and one new helper, with no schema,
  migration, worker-source, audit-sink or app-module change.
- Corrected state/security/RLS re-review: `GO source`; all prior replay, audit,
  precedence, history, legacy-writer and in-memory parity findings are closed.
- Corrected test/true-DB re-review: `GO source`; compiler allowance,
  deterministic barriers/failpoint, readiness, exact fake matching, RLS,
  sanitizer and source/test budgets are closed with no remaining blocker/major.
- Implementation reminders are non-blocking but enforced: keep the M8 fixture
  under its repository line gate through narrow behavior-equivalent cleanup,
  extract outbound fencing before growing the writer, and keep the new true-DB
  runner data-driven.

## Implementation Budget Recheck

- Source implementation began only after both corrected reviews returned GO;
  no source commit has been created.
- The first incomplete in-file lifecycle draft caused ESLint to report
  `File has too many lines (520). Maximum allowed is 400` plus planner
  complexity 13/16, before replay/audit helpers were complete.
- This invalidates only the earlier one-helper file-placement estimate, not the
  approved behavior/schema/owner contract. Compressing the matrix was rejected
  because it would reduce reviewability.
- Work paused at the failed budget gate. The spec now authorizes a second pure
  lifecycle-state helper behind the existing atomic-state facade, raises source
  changed/new limits from 11/1 to 12/2, keeps net source <=600 and forbids a
  third helper. Existing WIP source remains uncommitted until this narrow
  amendment receives state/security and test/budget re-review.
- First placement re-review accepted the single authoritative facade and both
  helper boundaries but found the compiler allowance mentioned only outbound/
  audit wiring. The docs-only correction now explicitly covers registrations
  and rewrites for both helpers plus the audit mapper and freezes a measured
  ceiling of baseline 581 + 25 nonblank lines; unrelated compiler churn remains
  forbidden.
- Compiler correction commit:
  `781a1db9d88cdd4440004d030f0d80c18bd74395`; both independent reviewers
  returned `GO resume source` with no remaining blocker/major.
- The completed WIP shape then measured approximately +984 net source lines:
  +440 across tracked source edits plus 434/110 lines in the two untracked
  helpers. This exceeds the unchanged +600 parent cap by roughly 384 lines.
- `guard:pr-shape --include-worktree` listed all 12 source paths but displayed
  net LOC/new source as zero because its numstat reader uses only
  `base...HEAD`; that output is not accepted as budget evidence for uncommitted
  source.
- Per the parent failure branch and M11-00, implementation is now split
  serially without a source-size exception. `M11-04B1` owns close/reopen first;
  `M11-04B2` will own safe explicit resume after B1 is merged.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| root/worktree isolation | pass | clean synchronized root/main; assigned worktree/branch/base matched; independent dependencies |
| existing implementation search | pass | one API planner/writer path and one worker fence path; no parallel runtime authorized |
| schema/migration need | none | existing statuses, event payload, closedAt, audit table and RLS are sufficient |
| initial spec frozen before source | pass | docs-only commit `a432b5c`; no source edit followed the NO-GO review |
| corrected spec freeze | pass | docs-only commit `736cb9d9ae4de90786661da2cc296d0cc0a05d3d`; no source edit |
| independent corrected spec review | pass | state/security/RLS reviewer returned `GO source`; no blocker/major |
| independent test-plan review | pass | test/true-DB reviewer returned `GO source`; no blocker/major |
| implementation placement amendment | pass | two-helper/single-facade amendment plus compiler correction `781a1db9`; both reviewers returned GO |
| implementation | B1 reviewed local pass | source changed 10/new 1/net +496; final implementation reviews have 0 blocker/major; B2 unimplemented |
| local gates | B1 pass | focused 21/21; repository 578/578; builds/size; Playwright 149/149 |
| true DB/CI | pending | no runtime claim |

## Current Conclusion

M11-04B still has no schema, migration, worker-source or owner-input blocker.
The parent +984 WIP was correctly split without exception. B1 has now been
narrowed to source changed 10/new 1/net +496 and its local static, 21 focused,
578 repository, four-build, size and 149 browser gates pass. Final current-WIP
spec and code-quality reviews have 0 blocker/major. True PostgreSQL CI remains
mandatory before merge; B2 explicit Bot resume/audit/queue work has not started.
This is not a staging, production or completion claim.

M11-05 and later Value-0 slices remain serially blocked until M11-04B1 and
M11-04B2 implementation, true-DB/CI evidence, merges and branch/worktree cleanup
complete.

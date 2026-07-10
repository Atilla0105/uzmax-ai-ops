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
- Human reopen selects only the latest complete closed ticket, assigns the
  authorized reopener, returns `HANDOFF + REOPENED` and preserves close history.
- Explicit resume is a separate conversation endpoint. It requires closed
  state, zero unread, zero active ticket and zero all-origin queued outbound.
- Resume leaves the ticket closed, does no LLM/send/replay, and atomically writes
  truthful `STATUS_CHANGED/bot_resumed` plus `audit_log`.
- Exact state replay is no-op success; different payload/actor or race loser is
  conflict/zero-write.
- One new outbound-fence helper is justified by the existing atomic writer's
  383-nonblank-line ceiling; it cannot own lifecycle decisions.

## Read-only Pre-reviews

- State audit: no schema/worker-source blocker; identified controller payload,
  closed-ticket lock, conversation persistence, mapper and queued-outbound gaps.
- Product/acceptance audit: required structured close result, human-only reopen,
  explicit resume, unread/queue gates, audit truth and no production/usable-UI
  overclaim.
- Test/true-DB audit: required deterministic close/worker, closed-inbound,
  reopen/resume, queue, audit rollback, RLS and residue matrices; existing
  compilers/runners are reusable.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| root/worktree isolation | pass | clean synchronized root/main; assigned worktree/branch/base matched; independent dependencies |
| existing implementation search | pass | one API planner/writer path and one worker fence path; no parallel runtime authorized |
| schema/migration need | none | existing statuses, event payload, closedAt, audit table and RLS are sufficient |
| spec frozen before source | pass on freeze commit | only this spec/evidence are changed; the commit SHA is recorded before implementation |
| independent corrected spec review | pending | must pass before source edits |
| independent test-plan review | pending | must pass before source edits |
| implementation | pending | no source edit started |
| local gates | pending | no implementation claim |
| true DB/CI | pending | no runtime claim |

## Current Conclusion

M11-04B now has a decision-complete draft contract and no known schema or owner
blocker. Implementation remains blocked until this spec/evidence pair is
committed and independent pre-reviews accept the exact lifecycle, history,
unread, queued-outbound, audit, race and budget boundaries.

M11-05 and later Value-0 slices remain serially blocked until M11-04B
implementation, true-DB/CI evidence, merge and branch/worktree cleanup complete.

# M11-03B Atomic Takeover And Ticket Actions Evidence

Status: `implementation_validated_locally__true_db_ci_pending`
Spec: `docs/specs/M11-03B-atomic-takeover-ticket-actions.md`
Base: `ebdb05c31ded16e160729ae4050249bdcd46baa1`
Branch: `codex/m11-03b-atomic-takeover`
Worktree:
`/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-03b-atomic-takeover`

## Preflight

- `pwd`, `git status --short --branch`, `git branch --show-current` and exact
  base SHA matched the assigned worktree/branch.
- Root/main was clean and synchronized to PR #301; no open PR or other unmerged
  branch existed before worktree creation.
- M11-03A latest-SHA CI run `29104345624` attempt 2 passed before PR #301 was
  squash-merged; its worktree, local branch and remote branch were removed.
- `AGENTS.md`, M11-00, the M11-03A durable appendix, current controller/service/
  repository/mappers, fake Prisma and true-DB runner were reread.
- No production, real customer data, secret, deployment, schema or migration was
  touched.

## Existing Seam Evidence

- Current handoff performs read -> separate conversation save -> separate ticket
  save; current actions perform read -> separate ticket save.
- Repository physical length is already 430 lines; the authorized pure planner
  plus runtime writer keep atomic responsibilities out of that capped file, and
  old save bypasses must be removed.
- Current fake Prisma uses eager batch `Promise.all` and has no interactive
  transaction rollback/mutex proof.
- Current M10 true-DB helper encodes the pre-M11 close/reopen behavior and must be
  adapted while preserving its M11-03A read/RLS proof.

## Pre-Review Corrections

The first independent read-only pre-review returned FAIL before source work and
was addressed in the spec:

- removed the top-level true-DB wrapper that would have exceeded source/new-file
  budget; the test runner self-invokes instead;
- split same-actor versus different-actor takeover/claim race outcomes;
- moved read-only anchors outside the machine-readable touched-path section;
- limited exclusivity claims to the API path until M11-04 fences the worker;
- defined permission-before-state readiness precedence, non-authoritative read
  hints and same-interactive-transaction ticket lookup/locking.

## Source Shape Stop

- The first one-file atomic source shape stopped before repository/service/test
  wiring at 642 nonblank lines, above the 400-line lint ceiling.
- No source commit, budget exception, schema/deploy/external mutation or test
  weakening occurred.
- The spec now separates the single pure transition/event planner from the two
  runtime transaction adapters. Total source remains capped at 600, with 8
  changed/2 new source files and no exception.

## Implemented Contract Evidence

- One data-driven planner now owns takeover eligibility, takeover transitions,
  allowed legacy ticket actions, server UUID events, bounded business text and
  monotonic server time. Read readiness calls the same takeover decision.
- In-memory writes use one async mutex around cloned snapshot, validation and
  commit. Prisma writes use one interactive RLS transaction with role/scope
  setup, scoped conversation lock, stable active-ticket locks, validation,
  writes and readback before commit.
- Repository/service `saveConversation` and `saveTicket` seams were removed.
  Takeover and ticket actions can no longer compose separate public saves.
- The HTTP layer accepts only bounded `reason`, `note` and known action types;
  actor, SLA, owner, lock and time remain server-owned. Root detail readiness is
  permission-aware while the current admin remains blocked on its legacy nested
  signal.
- Fake Prisma now supports serialized interactive callbacks and rollback. A
  synthetic event-write failure proves the preceding ticket update does not
  commit, and its one-shot fault flag is consumed without committing business
  rows. Focused barrier races prove same/different actor takeover and both
  takeover-versus-claim variants without duplicate tickets or ownership
  overwrite.
- The existing M10/M11 read runner now asserts atomic takeover semantics and
  close/reopen fail-closed behavior. A separate self-invoking sanitized true-DB
  runner and CI step cover real PostgreSQL races, RLS isolation and cleanup.
- Final source shape is 8 changed source files, 2 new source files and net
  source LOC 591; both new modules and the repository remain under the 400
  nonblank-line ceiling. Test/support is 9 files with 2 new files. There are no
  schema, migration, generated, lock, deploy or provider changes.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| spec frozen before source | pass | this spec/evidence only |
| existing implementation search | pass | one replacement seam; new source rationale recorded |
| first spec compliance pre-review | fail then fixed | budget, race, path parsing and global-claim findings addressed before source |
| second spec compliance pre-review | pass | all prior blocker/major/minor findings closed; no new issue |
| two-source shape pre-review | pass after minor fix | 8 source / 2 new, 9 test-support / 2 new, no exception; stale evidence wording removed |
| focused atomic/matrix/race tests | pass | exact matrices, server fields, zero-write failures, rollback and four barrier race classes pass |
| full repository tests | pass | 565 tests passed, 0 failed |
| format/type/lint | pass | Prettier, TypeScript and full ESLint pass; new files remain within line/complexity limits |
| architecture/quality static gates | pass | dependency-cruiser, jscpd, knip, forbidden-terms and repository guards pass |
| build | pass | API, worker, cron TypeScript builds and admin Vite production build pass |
| source/test budget | pass | 8 source / 2 new / net 591; 9 test-support / 2 new; no exception |
| local true-DB race/RLS/residue | not run | `UZMAX_RLS_DATABASE_URL` is absent locally; no DB claim is made |
| final implementation spec compliance review | pass | no implementation blocker/major/minor; stale evidence and RLS anchor corrected here |
| code quality/security/RLS review | pass | no blocker/major/minor; the only test-fake fault-flag finding was fixed and spot-checked |
| CodeRabbit | pass with transparent rerun boundary | complete review found no production issue; an independent review's only fake minor was fixed; latest remote rerun was rate-limited, so no fresh zero-issue claim is made |
| PR latest-SHA CI | pending | PR not opened |

## Current Conclusion

M11-03B is locally implementation-complete and reviewable. It is not mergeable
until the controlled PR CI runs both the existing M11 read smoke and the new
true-PostgreSQL atomic race/RLS/residue smoke on the latest SHA. M11-03 overall
also remains open until this slice merges. Worker ownership/send fencing,
explicit Bot resume, aligned staging, production, GA and 1.0 remain open.

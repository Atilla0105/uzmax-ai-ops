# M11-04A Worker Ownership And Send Fence Evidence

Status: `spec_frozen__implementation_pending`
Spec: `docs/specs/M11-04A-worker-ownership-send-fence.md`
Base: `da5e808b9bac377252acd953c9ca2d7335ba67c2`
Branch: `codex/m11-04a-worker-fence`
Worktree:
`/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-04a-worker-fence`

## Preflight

- PR #302/M11-03B latest-SHA CI run `29114336879`, job `86433928443`
  completed successfully in 20m14s before merge.
- PR #302 merged as `da5e808b9bac377252acd953c9ca2d7335ba67c2`;
  root main was fast-forwarded and its old worktree/local/remote branch were
  removed.
- `git branch --no-merged main`, open PRs and extra worktrees were empty before
  this worktree was created.
- Assigned `pwd`, branch, clean status and base SHA matched, and this worktree
  received an independent copied `node_modules` directory.
- `AGENTS.md`, M11-00, M11-03B, PRD/architecture/acceptance anchors, current
  worker runtime/persistence, API atomic writer, schema and M6B/M8/M11 test
  harnesses were reread.
- No production, real customer data, secret, deployment, schema or migration was
  touched.

## Existing Seam Evidence

- The worker currently orders answer work as dedupe reserve -> LLM -> Telegram
  send -> persistence, with no ownership read or pre-send recheck.
- Answer persistence forces `OPEN`; handoff persistence forces
  `PENDING_HANDOFF` and always creates a new ticket/event.
- Existing human/closed conversations can therefore call LLM/send, lose their
  owner state and gain duplicate tickets.
- The schema already provides conversation ownership states plus message
  `QUEUED/CANCELLED`; no DB change is required.
- Runtime/persistence are already 398/372 nonblank lines, so the spec authorizes
  two moved/refined source modules instead of growing capped files.

## Pre-implementation Review

- A read-only runtime audit confirmed the unsafe send-before-persist sequence,
  forced status overwrite, unconditional ticket creation and lack of durable
  queued AI intent.
- A separate read-only test audit confirmed schema sufficiency, identified the
  M6B two-ticket assertion that must be strengthened, and defined a no-Redis
  true-DB barrier runner reusing M8 compilation and M11-03B API takeover.
- The frozen contract uses a committed DB dispatch claim as the honest send
  linearization point. It does not place external Telegram I/O inside a DB
  transaction and does not claim that a later takeover can retract an already
  claimed send.
- Both independent pre-reviews returned NO-GO before implementation. Corrections
  now distinguish Bot-eligible `OPEN` from assigned operator state, make invalid
  ticket matrices win with transaction rollback, add deterministic intent IDs
  and generating/claimed crash recovery, scope API cancellation by exact tenant/
  conversation/marker predicates, require in-memory/Prisma parity and correct
  the source/test budget classification.
- Telegram ambiguity is now one durable `QUEUED/uncertain` intent followed by a
  still-open-only automatic handoff, with no blind resend; only a definitive
  provider failure becomes `FAILED`.
- Both corrected pre-reviews passed with no blocker/major. The test review's one
  nonblocking precision suggestion was applied: both principal race barriers
  now return a follow-up draft so each ordering proves ticket non-duplication.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| spec frozen before source | pass | only this spec/evidence added |
| existing implementation search | pass | one existing worker/API path to refactor; two new source files justified by file ceilings |
| root/worktree isolation | pass | root clean/read-only; assigned worktree/branch/base matched; dependencies independently copied |
| schema/migration need | none | existing statuses, scoped keys and RLS are sufficient |
| implementation | pending | no source edit yet |
| focused/full/static/build | pending | run after implementation |
| local true DB | not run | no local DB claim before implementation |
| CI true DB | pending | required before merge |
| pre-implementation spec compliance reviews | pass after fail/corrections | ownership matrix, retry recovery, cancellation scope/parity, budgets and both follow-up race orders accepted before source |
| final implementation spec compliance review | pending | must precede quality review |
| code quality/security/RLS review | pending | after compliance |

## Current Conclusion

M11-04A is decision-complete and approved through M11-00, but implementation has
not started. The spec/evidence freeze is ready to commit before source work.
M11-04B and all later Value-0 slices remain serially blocked until this slice
passes its real PostgreSQL race gate, merges and is cleaned.

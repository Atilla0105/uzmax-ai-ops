# M11-04A Worker Ownership And Send Fence Evidence

Status: `implementation_and_source_equivalent_ci_complete`
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

## Implementation Result

- The worker now persists scoped dedupe/customer/inbound state and a deterministic
  `QUEUED/generating` AI intent before LLM/send, then uses a separate committed
  claim as the one-send linearization point.
- Existing valid `PENDING_HANDOFF`, `HANDOFF` and `CLOSED` ownership stores one
  inbound and increments unread once with zero intent/LLM/send/new ticket; every
  invalid or multi-ticket matrix rolls the transaction back.
- `processedAt IS NULL` is the conditional once-latch for terminal work. Recovery,
  stale worker completion and API-cancel retry cannot produce unread 0/2 or a
  second ticket.
- Claimed recovery terminalizes as `QUEUED/uncertain`; a late real `SENT/FAILED`
  acknowledgement may only refine that intent. It clears `deliveryUncertain`
  and cannot repeat handoff, ticket creation or unread increment.
- Returned `FAILED`, returned `QUEUED` and thrown Telegram ambiguity are covered
  separately. Only `SENT/FAILED` become `terminal`; ambiguity remains
  `QUEUED/uncertain` and is never blindly resent.
- API takeover cancels only exact scoped `OUTBOUND + QUEUED + telegram_bot_ai +
  generating` rows. Claimed AI sends and future operator queued messages are not
  cancelled; in-memory and Prisma paths use the same predicate.
- The original compound-key defect found during production-shaped fake testing
  was corrected: every Prisma compound update now receives only `{orgId,
  tenantId}`, never the full dedupe draft.
- No schema, migration, provider adapter, deployment, production secret or real
  customer data was added or changed.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| spec frozen before source | pass | commit `f44b94a`; only this spec/evidence preceded source edits |
| existing implementation search | pass | one existing worker/API path to refactor; two new source files justified by file ceilings |
| root/worktree isolation | pass | root clean/read-only; assigned worktree/branch/base matched; dependencies independently copied |
| schema/migration need | none | existing statuses, scoped keys and RLS are sufficient |
| implementation | pass | ownership matrix, intent preparation/claim/finalize, once-latch recovery, late ack refinement and exact takeover cancellation implemented |
| focused regression | pass | 42/42 related M6B/M8/M9/M11 tests; M11-04A has 8 scenarios including both takeover-first outcomes, claim-first, crash recovery, late SENT and FAILED/QUEUED/throw |
| full Node tests | pass | 573/573, zero skipped/cancelled/todo |
| format/type/lint | pass | full Prettier check, TypeScript and repository-wide ESLint |
| architecture/static | pass | dependency-cruiser, jscpd zero clones, knip, forbidden/eval/doc/workspace/write-boundary guards |
| build/size/browser | pass | API/worker/cron/admin builds; 226.55 kB brotli <= 250 kB; Playwright 149/149 using the built admin preview |
| source/test budget | pass | 8 source files including 2 new, net source +596 <= 600; 7 test/support files including 2 new; config 1; docs 2; all bounded files <= 400 nonblank lines |
| local true DB | not run | `UZMAX_RLS_DATABASE_URL` is absent locally; no PostgreSQL pass is claimed |
| no-DB sanitizer | pass | exit 1 and exactly `m11-worker-ownership-fence-true-db-smoke-failed`, with no raw cause, path or stack |
| CI attempts 1-2 metadata preflight | failed before true DB | run `29125525284`, attempts 1-2, read the original pull-request event snapshot where the spec path still contained Markdown backticks; the live PR body was corrected, but a rerun preserves the old event payload, so evidence commit `6911a04` created a fresh `synchronize` event |
| CI true DB | pass | source-equivalent SHA `6911a0409697a1b5b015efb7ff129bd71603e1da`; run `29125779354`, job `86470939643`, completed in 24m28s with the new worker ownership fence step plus every prior PostgreSQL/RLS integration step green |
| pre-implementation spec compliance reviews | pass after fail/corrections | ownership matrix, retry recovery, cancellation scope/parity, budgets and both follow-up race orders accepted before source |
| final implementation spec compliance review | pass | second independent review found no blocker/major and confirmed all pass conditions plus net source +596 |
| code quality/security/RLS review | pass | second independent review confirmed once-latch, late ack refinement, lock order, enum/compound scope and network-outside-transaction semantics |
| final verification/CI review | GO | no blocker/major; source-equivalent latest-SHA CI, true DB, full Node tests and builds are green |

## Current Conclusion

M11-04A implementation and its production-shaped verification are complete. The
real PostgreSQL/RLS race runner passed on source-equivalent SHA
`6911a0409697a1b5b015efb7ff129bd71603e1da` together with every prior database,
full-test and build gate. Any successor that only updates this evidence remains
subject to the repository's latest-SHA CI requirement before merge.

One nonblocking observability improvement remains outside this ownership slice:
terminal `RuntimeResult` values do not consistently preserve every optional
conversation/message/outbound ID. No current consumer or M11-04A safety contract
depends on those optional fields; a later narrow compatibility slice may restore
them without reopening this ownership/send fence.

M11-04B and all later Value-0 slices remain serially blocked until this evidence-
only successor passes latest-SHA CI, the PR merges and the branch/worktree are
cleaned.

# M11-04B1 Atomic Close And Human Reopen Evidence

Status: `pr_304_true_db_closed_inbound_failure__substage_diagnosis_pending`
Spec: `docs/specs/M11-04B1-atomic-close-human-reopen.md`
Parent: `docs/specs/M11-04B-atomic-close-reopen-bot-resume.md`
Base: `5520bc7f4522b73d92d9c896e0a59888058deec7`
Branch: `codex/m11-04b-close-resume`
Worktree:
`/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-04b-close-resume`

## Split Trigger

- Parent implementation remained uncommitted after its pre-reviews.
- Tracked source edits measured +440 net lines and the two untracked helpers
  added 434 and 110 physical lines, approximately +984 total.
- Parent budget is +600. The apparent guard net-zero result is invalid for WIP
  accounting because `--include-worktree` does not include worktree numstat.
- Parent failure rules and M11-00 require a serial split; no exception is used.
- B1 owns atomic close/human reopen. B2 will own explicit safe Bot resume after
  B1 merge/cleanup.

## Preflight Truth

- Root/main remains read-only at merged M11-04A SHA `5520bc7`.
- Assigned worktree/branch remain the only edit location.
- No schema, migration, worker source, deployment, production, secret or real
  customer/order-data mutation is required.
- Existing parent WIP has no source commit and makes no runtime claim. It must be
  narrowed only after both B1 reviews return GO.

## Validation Record

| Gate | Result | Evidence |
|---|---|---|
| source-budget measurement | split required | approximately +984 > +600; untracked helpers counted manually |
| parent behavior preservation | pass | B1 inherits close/reopen safety; B2 retains all resume/audit/queue obligations |
| B1 state/security/spec review | pass | corrected `ccfea21`; reviewer GO with no blocker/major |
| B1 test/budget review | pass | corrected `85ac2e7`; reviewer GO with no blocker/major |
| implementation budget | pass | source changed 10/new 1/net +496; test/support changed 9/new 2; compiler 581 -> 592 nonblank (+11) |
| focused close/reopen | pass | 21/21 Node tests, including exact fake-lock rejection and HTTP bounds |
| repository static gates | pass | format, prettier-ignore 89/89, typecheck, lint, dependency-cruiser, jscpd 0 clones, knip and all scoped guards |
| full Node regression | pass | 578/578, 93 suites, zero skip/failure |
| builds and size | pass | API, worker, cron and admin builds; admin 226.55 kB brotli <= 250 kB |
| browser regression | pass | Playwright 149/149 against the built admin preview |
| implementation spec review | pass | final current-WIP review: 0 blocker/major/minor; local implementation/evidence spec-compliant |
| implementation code-quality review | pass | 0 blocker/major; exact-cancellation and fake-lock proof corrections applied |
| PR shape | pass after metadata correction | PR #304; source 10/new 1/net +496; exact 24-path scope |
| initial CI attempt | metadata-only failure | run `29139932722` read the pre-correction backticked spec path and stopped at `guard:pr-shape`; all true-DB/runtime steps were skipped |
| second CI attempt | B1 true-DB failure | run `29139984354` passed PR shape and every prior step through M11 worker ownership fence, then the new close/reopen runner failed with its sanitized marker; later gates were skipped |
| third CI attempt | `closed_inbound` failure | run `29140478175` again passed every prior gate through worker ownership fence; the new runner failed only after close-first and claim-first, inside the closed/reopened inbound lifecycle stage |
| true DB/CI | diagnosis pending | no B1 runtime claim and no merge |

## First Pre-review Corrections

- State/security/spec pre-review returned `NO-GO` on the first child draft.
- The execution spec now uses the exact machine-readable `## Spec 类型` and
  `## 触碰模块/文件` headings required by `pr-shape`.
- The claim-first success fixture now requires exactly one send after release,
  with final conversation still CLOSED and no second send.
- B1 now explicitly forbids every parent lifecycle-readiness response field;
  the complete readiness contract is owned only by B2.
- Test/budget pre-review also required exact SENT/final-state proof for the
  claim-first order; explicit 1/500 and empty/501 field tables; no-fallback
  corruption cases; full state snapshots; per-table Tenant-B RLS zero; opaque
  wrong-tenant snapshots; and a mid-run fatal sanitizer whose success and
  forced-failure paths both leave privileged residue zero. The corrected spec
  now freezes each requirement without adding a third test file.
- These are docs-only corrections. Source remains uncommitted and may not resume
  until corrected state/security and test/budget re-reviews both return GO.

## Corrected Pre-review Result

- State/security/spec re-review on `ccfea21` returned GO with no remaining
  blocker/major.
- Test/true-DB/budget re-review on `85ac2e7` returned GO with no remaining
  blocker/major.
- B1 source may now resume only by removing the parent resume/audit/queue/
  readiness work and proving the real B1 diff stays within the child budget.

## Implemented B1 Boundary

- Close and human reopen are implemented only through the existing atomic API
  facade. The legacy capability lifecycle path returns
  `atomic_lifecycle_required`.
- Close validates request/event anchors and structured result/destination,
  writes conversation plus ticket plus exact event/readback atomically, clears
  unread/lock, preserves assignment and cancels only exact generating AI
  intent. Reopen validates the newest closed lifecycle without fallback,
  assigns the authorized reopener and preserves history/unread.
- Exact command replay precedes current-state checks and returns
  `already_applied`; collisions, stale anchors, malformed history, ownership or
  tenant conflicts are zero-write failures.
- B1 publishes no resume endpoint, lifecycle-readiness field, resume audit,
  all-origin queue gate, UI or worker-source change. Those obligations remain
  exclusively in B2.

## Current Local Verification

- Focused tests: 21 passed, 0 failed/skipped.
- Full repository Node tests: 578 passed across 93 suites, 0 failed/skipped.
- Static gates: formatting, frozen prettier-ignore boundary (89/89), typecheck,
  full lint, dependency boundary, clone detection (0), knip, forbidden terms,
  eval/doc triggers and workspace/worker isolation all passed.
- Current builds: API, worker, cron and admin passed. Admin size is 226.55 kB
  brotlied against a 250 kB limit. Playwright passed 149/149.
- The true-DB runner is structured to prove both worker race orders, exact
  close/reopen readback/replay, wrong-tenant/RLS isolation and cleanup. For
  closed and human-reopened inbound it directly requires INBOUND +1, the exact
  external-message row, processed dedupe, unchanged OUTBOUND count, correct
  unread, then a `deduped` retry with the complete proof unchanged.
- `UZMAX_RLS_DATABASE_URL` is absent locally and the local Docker daemon is not
  available. Therefore this runner has only passed syntax/lint locally; its
  PostgreSQL/RLS/transaction assertions remain a required CI gate and are not
  claimed yet.
- The first implementation compliance review found only the missing direct
  inbound/dedupe/outbound/no-replay DB assertions plus the expected pending
  evidence/CI state. The assertion gap is corrected within the runner's exact
  400-line lint ceiling.
- Code-quality review then found that event uniqueness inspected the first
  response rather than retry readback; both close and reopen now count events
  on the replay response. Raw proof SQL uses the database's lowercase message
  enum values.
- The M8 DB-backed fixture now executes close then reopen and requires the raw
  all-ticket lock to return the closed ticket ID. Close-first true-DB setup also
  seeds a nonmatching operator-origin queued outbound and requires it to remain
  `QUEUED` while the exact AI-generating intent becomes `CANCELLED`.
- Final independent spec compliance returned 0 blocker/major/minor. Final code
  quality/security/RLS/concurrency review returned 0 blocker/major; its only
  remaining maintenance note is future consolidation of the five currently
  consistent close-result tokens. This is not a B1 correctness or merge block.

## PR And CI Record

- Implementation commit: `641e82c99fafe3208a82216b9b5d5045ecbe95eb`.
- PR: `#304`, `M11-04B1: atomic close and human reopen`.
- The committed-diff `pr-shape` result is exact: 24 changed paths, categories
  config 1/source 10/docs 4/test 9, source net +496 and one new source file.
- Initial CI run `29139932722` used the pull-request event payload created
  before the PR body correction. Its `Spec file` value still contained Markdown
  backticks, so `guard:pr-shape` tried to open a backticked path and failed.
  Prisma generation, every true-DB smoke, full tests, builds and Playwright were
  skipped; this run is not runtime evidence.
- The live PR body now contains the plain machine-readable spec path and the
  same local PR guard passes. This evidence-only follow-up commit intentionally
  triggered fresh run `29139984354`.
- Run `29139984354` passed static/shape/Prisma gates and the M4, M6B,
  conversation/customer read, atomic-takeover and worker-ownership true-DB
  smokes. The new close/reopen runner then emitted only its sanitized failure
  marker after 119 seconds; no raw error or data was exposed. Redis, remaining
  true-DB, full test/build/size and Playwright steps were skipped.
- The runner now emits one bounded safe stage token only for ordinary failures,
  while the controlled fatal child still emits exactly the original marker and
  exit 17. Run `29140478175` returned `closed_inbound`, proving setup,
  close-first and claim-first completed before failure; it does not identify a
  cause yet.
- The closed-inbound stage is now split into safe `ci1`, `reopen` and `ci2`
  tokens. The runner remains exactly within its 400-line lint ceiling and the
  next CI run will distinguish first closed inbound, reopen/replay, or second
  human-owned inbound/reclose without exposing assertion values or data.

## Current Conclusion

M11-04B1 is locally implemented, regression-clean and independently reviewed,
but it is not yet merged: current-SHA PostgreSQL CI remains mandatory. After it
passes, M11-04B2 must still merge explicit Bot resume before M11-05 can start.
Nothing here claims a usable workbench, staging/production closure, GA or 1.0.

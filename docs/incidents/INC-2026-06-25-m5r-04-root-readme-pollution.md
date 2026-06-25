# INC-2026-06-25 M5R-04 Root README Pollution

## Summary

During an earlier M5R-04 worker attempt on 2026-06-25, root/main
`docs/evidence/M5R/README.md` was briefly modified from the root checkout
`/Users/atilla/Documents/UZMAX智能运营` instead of only from the assigned M5R-04
linked worktree.

The coordinator restored the root/main README before moving the same linked
worktree to `/private/tmp/uzmax-m5r-04-ai-member-runtime-control` with
`git worktree move`. The relocation preserved branch/worktree isolation while
putting the worker path inside this thread's writable roots.

## Impact

Known impact was limited to root/main documentation pollution in:

- `docs/evidence/M5R/README.md`

No runtime source, apps, packages, scripts, lockfile, config, generated files,
schema, migrations, RLS policy, validation output, commit, push, PR, secret,
customer data, order data, raw payload, real LLM call or production/runtime
deployment was reported as affected.

## Detection

The coordinator detected that the earlier worker path
`/Users/atilla/Documents/uzmax-m5r-04-ai-member-runtime-control` was outside this
thread's writable roots and that earlier worker attempts had made no progress in
the assigned branch. The coordinator also identified and restored the root/main
README pollution before this worker resumed.

This worker's startup evidence records the post-cleanup state:

- assigned worktree: `/private/tmp/uzmax-m5r-04-ai-member-runtime-control`
- assigned branch: `codex/m5r-04-ai-member-runtime-control`
- root/main status: `## main...origin/main`
- open PR audit: no PR rows
- root no-merged branch audit: no branch output

## Cleanup

The root/main README was restored by the coordinator before this worker began
implementation edits. This worker did not modify root/main and recorded the
relocation and clean root status in
`docs/evidence/M5R/M5R-04-ai-member-runtime-control.md`.

## Cause

Confirmed root cause is an AI worktree-boundary failure: an earlier M5R-04
worker wrote documentation against the root/main checkout instead of the
assigned linked worktree. The earlier path was also outside this thread's
writable roots, which prevented useful worker progress until relocation.

## Permanent Control

The durable control for this slice is recorded rather than newly implemented:

- root/main remains read-only for the M5R-04 worker;
- assigned worktree facts are updated to `/private/tmp/uzmax-m5r-04-ai-member-runtime-control`;
- startup evidence records assigned/root status, open PR audit, no-merged branch
  audit and worktree list before implementation edits;
- validation must run `npm run guard:worker-boundary -- --assigned
  /private/tmp/uzmax-m5r-04-ai-member-runtime-control --root
  /Users/atilla/Documents/UZMAX智能运营`.

No new guard or script preventive control lands in M5R-04.

Institutionalized status: `pending_merge`.

## Evidence Links

- Spec: `docs/specs/M5R-04-ai-member-runtime-control.md`
- Evidence: `docs/evidence/M5R/M5R-04-ai-member-runtime-control.md`
- M5R index: `docs/evidence/M5R/README.md`

## Owner / AI Boundary

This is an AI process incident. AI is responsible for recording the incident,
keeping root/main read-only, validating assigned/root boundaries and avoiding
further out-of-worktree writes. Project owner remains responsible for final risk
acceptance, scope, release, real data/account, LLM key, cost and compliance
decisions.

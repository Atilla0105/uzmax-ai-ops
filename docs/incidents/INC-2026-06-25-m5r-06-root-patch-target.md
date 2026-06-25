# INC-2026-06-25 M5R-06 Root Patch Target

## Status

contained_cleaned_recorded

## What Happened

During M5R-06 implementation, the first patch operation targeted `/Users/atilla/Documents/UZMAX智能运营` root/main instead of the assigned worker worktree `/private/tmp/uzmax-m5r-06-template-copy-runtime`.

The root/main checkout received uncommitted M5R-06 tracked edits and untracked M5R-06 files before the focused test command showed that the assigned worktree did not contain the new test file.

## Impact

- Root/main was temporarily dirty with M5R-06-only files and edits.
- No commit, push, PR, merge, production deploy, real customer/order data, real LLM call, secret, external SaaS action or generated artifact was created from root/main.
- No unrelated user changes were overwritten.

## Detection

The focused M5R-06 test command from the assigned worktree failed with `Could not find 'scripts/tests/m5r-template-copy-runtime.test.mjs'`. A follow-up status audit showed root/main dirty and the assigned worker missing the new files.

## Containment And Cleanup

- The tracked root diff for `apps/api/scripts/runtime-compiler.mjs`, `apps/api/src/app.module.ts` and `docs/evidence/M5R/README.md` was applied to the assigned worktree.
- The untracked M5R-06 files were moved from root/main to the assigned worktree.
- The tracked root files were restored to root/main state.
- Post-cleanup root/main status returned to `## main...origin/main`.
- The assigned worktree now contains the M5R-06 diff and this incident record.

## Root Cause

The patch tool was invoked without an explicit worktree target and used root/main as its patch target. The worker did not verify the patch landing path before running the focused test.

## Permanent Control

For the rest of M5R-06, root/main status is checked after boundary-sensitive file movement and before validation/commit. Edits must land in `/private/tmp/uzmax-m5r-06-template-copy-runtime`; root/main remains read-only coordination only.

## Institutionalized

This incident is recorded in the M5R-06 spec/evidence and M5R incident index. It is process evidence only and does not expand M5R-06 product scope.

## Owner / AI Boundary

AI agent owns containment, cleanup, evidence and validation. Project owner remains the only decision-maker for milestone acceptance, production readiness, real accounts, real customer/order data, LLM keys/cost and release decisions.

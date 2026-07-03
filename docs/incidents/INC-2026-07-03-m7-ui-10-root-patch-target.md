# INC-2026-07-03 M7-UI-10 Root Patch Target

## Summary

During M7-UI-10 Phase 1 spec drafting, the first `apply_patch` call used the root checkout `/Users/atilla/Applications/UZMAX智能运营` as its working directory instead of the assigned worktree `/Users/atilla/.codex/worktrees/m7-ui-10-confirmation-queue-page`.

The accidental root changes were docs-only:

- `docs/specs/M7-UI-10-confirmation-queue-page.md`
- `docs/evidence/M7/M7-UI-10-confirmation-queue-page.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`

No source, test, package, lockfile, DB, backend/API, worker/cron, CI/global config, secret, customer/order data or raw prototype file was changed.

## Impact

The root/main checkout briefly became dirty, violating the root/main coordination-only boundary. The intended docs changes were not lost and were transferred to the assigned worktree before continuing.

## Detection

Validation in the assigned worktree returned no changed files and `guard:pr-shape` could not find the new spec there. A root checkout status check then showed the accidental docs modifications and untracked files.

## Cleanup

Containment steps:

1. Copied the two new docs files into the assigned worktree.
2. Applied the root docs diff for `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md` to the assigned worktree.
3. Reversed only the accidental root diffs for those two tracked docs.
4. Removed only the two accidental root untracked M7-UI-10 docs files.
5. Confirmed root/main returned to `## main...origin/main`.

## Root Cause

The patch tool had no explicit workdir and followed the thread cwd/root checkout. The worker used relative paths in `apply_patch` after creating an external worktree.

## Permanent Control

For this worker, any further patch touching the assigned worktree must use absolute paths or a tool command with explicit workdir. Before validation, run both:

- `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch`
- `git -C /Users/atilla/.codex/worktrees/m7-ui-10-confirmation-queue-page status --short --branch`

Future M7 page workers should avoid relative `apply_patch` paths when the assigned worktree is outside the thread cwd.

## Status

`institutionalized_in_this_spec`: the M7-UI-10 spec/evidence references this incident, and root/main cleanliness is part of final validation.

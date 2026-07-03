# INC-2026-07-03 M7-UI-05 Root Patch Target

## Status

Institutionalized status: `pending_merge`

This incident record is created because `docs/incidents/README.md` requires a repo record when a worker writes outside its assigned worktree.

## What Happened

During the `M7-UI-05-layered-navigation-shell` docs-only spec worker, an `apply_patch` invocation created/updated the intended UI-05 docs paths in the root/main checkout `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned worktree `/Users/atilla/.codex/worktrees/m7-ui-05-layered-navigation-shell-spec`.

Detected root/main paths:

- `docs/specs/M7-UI-05-layered-navigation-shell.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`

The write was detected before validation, staging, commit, push or PR creation.

## Impact

- No source, test, package, lockfile, backend/API/DB, CI, binary media, secret or customer/order data paths were touched.
- The root/main checkout temporarily had uncommitted docs changes.
- The assigned UI-05 worktree was still clean when the mistake was detected.
- There was no commit, push, PR update, CI run or release action from the wrong checkout.

## Root Cause / Unknowns

Confirmed:

- The `apply_patch` tool was anchored to the session/root checkout rather than the assigned worker worktree.
- The patch filenames were relative paths, so they resolved under `/Users/atilla/Applications/UZMAX智能运营`.

Unknown:

- No repo-local guard intercepted the patch target before write time. This record does not claim a tool-level fix exists.

## Detection

The worker checked both worktrees immediately after a patch verification failure:

- root/main `git status --short --branch` showed the four unintended docs changes;
- assigned worktree `git status --short --branch` was clean.

## Cleanup

Cleanup performed in this PR flow:

- Recreated the UI-05 docs edits in the assigned worktree using explicit worktree paths.
- Restored only the worker-created accidental root/main changes.
- Rechecked root/main status after cleanup.

## Permanent Controls

- For this worker, subsequent manual patches used explicit assigned-worktree paths.
- The UI-05 spec now records the incident and includes this incident path in its docs-only touch list.
- Future workers using `apply_patch` with non-root worktrees must either ensure the patch target is the assigned worktree path or validate both root/main and worker status immediately after the first patch.

## Evidence Links

- Spec: `docs/specs/M7-UI-05-layered-navigation-shell.md`
- Evidence: `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- Assigned worktree: `/Users/atilla/.codex/worktrees/m7-ui-05-layered-navigation-shell-spec`
- Assigned branch: `codex/m7-ui-05-layered-navigation-shell-spec`

## Owner / AI Boundary

AI is responsible for recording, cleaning and proposing controls for this process incident. Project owner remains the only final decision maker for scope, release, real data/accounts, cost and compliance risk.

# INC-2026-06-23 M4-26 Root Write Boundary

## Status

institutionalized_in_docs

## What Happened

During M4-26 planning, coordinator spawned worker `019ef25a-e2f0-7440-b5e9-3ce968f4d4a8` for assigned worktree `/Users/atilla/Documents/uzmax-m4-26-order-import-rls-batch-runner` and branch `codex/m4-26-order-import-rls-batch-runner`. The worker produced M4-26 draft files in the root/main checkout `/Users/atilla/Documents/UZMAX智能运营` instead of the assigned worktree.

The boundary failure was detected by `npm run guard:worker-boundary` from the assigned worktree. Root/main showed tracked modifications to API order-import files plus untracked M4-26 draft files. The assigned M4-26 worktree remained clean at detection time.

## Impact

- Root/main temporarily contained implementation draft changes and a draft spec outside the assigned worker boundary.
- No commit, push, PR, secret, env file, raw customer/order data, CSV/XLSX export, screenshot, order ID, phone, address or payment data was introduced by the root write.
- The failure reduced confidence in chat-only delegation state, so M4-26 records this incident in repo evidence instead of closing it only in conversation.

## Root Cause / Unknowns

- Confirmed: the root/main checkout had the M4-26 draft changes while the assigned worktree had no local changes.
- Confirmed: the coordinator closed the worker after no progress response, then discovered the root write during worker-boundary preflight.
- Unknown from repo evidence: whether the worker inherited or selected the wrong cwd internally before shutdown.

## Detection

- `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-26-order-import-rls-batch-runner UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` failed and listed root/main M4-26 draft changes.
- Root/main `git status --short --branch` showed the accidental tracked and untracked M4-26 draft files.
- Assigned worktree `git status --short --branch` was clean before the coordinator migrated the draft.

## Cleanup

- The coordinator copied the M4-26 draft intent into the assigned worktree through reviewed patches, not by continuing implementation in root/main.
- Root/main accidental M4-26 changes were removed after migration; the known pre-existing duplicate docs remain untouched.
- Final closeout must record root/main tracked/index clean evidence and assigned worktree validation.

## Permanent Control

- M4-26 evidence keeps this incident linked to the slice that detected it.
- Coordinator stopped delegating implementation for this slice after the boundary failure and continued only in the assigned worktree.
- Future worker dispatches should require an early post-dispatch `pwd`/branch/status response before accepting any generated output as valid worktree output.

## Evidence Links

- Spec: `docs/specs/M4-26-order-import-rls-batch-runner-contract.md`
- Evidence: `docs/evidence/M4/M4-26-order-import-rls-batch-runner-contract.md`
- Guard: `scripts/guards/worker-write-boundary.mjs`

## Owner / AI Boundary

AI agents are responsible for recording, cleaning and validating this process failure. The project owner retains final risk acceptance and release decisions.

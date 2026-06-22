# INC-2026-06-23 M4-16 Root Patch Target

Institutionalized status: `institutionalized_in_docs`

Spec: `docs/specs/M4-16-customer-asset-admin-shell.md`

## What Happened

- During M4-16 implementation, the first `apply_patch` used relative paths while the tool target was the root/main checkout instead of the assigned worker worktree.
- It created or modified only M4-16 draft files in `/Users/atilla/Documents/UZMAX智能运营`: `apps/admin/src/App.tsx`, `apps/admin/tests/design.spec.ts`, `docs/evidence/M4/README.md`, `apps/admin/src/M4CustomerAssetShell.tsx`, `docs/evidence/M4/M4-16-customer-asset-admin-shell.md` and `docs/specs/M4-16-customer-asset-admin-shell.md`.
- The mistaken root/main changes were not staged, committed, pushed or used as CI evidence.

## Impact

- Root/main checkout became temporarily dirty, which violates the workspace isolation rule even though the content belonged to the active M4-16 slice.
- The assigned worker worktree was still clean at detection time, so no cross-worker source state had been mixed into a commit.
- No raw customer/order data, secrets, env files, generated artifacts, lockfiles, DB schema, API runtime or production config were touched.

## Root Cause / Unknown

- Confirmed root cause: `apply_patch` has no per-call `workdir` parameter in this environment, and relative paths targeted the default checkout rather than the worker worktree.
- Unknown: whether future desktop sessions will keep the same default `apply_patch` target after worktree creation. Treat it as unsafe to rely on relative paths for worker edits.

## Detection

- `npx prettier --write ...` executed in the worker reported the new M4-16 files were missing there.
- Immediate dual status check showed root/main dirty with the six M4-16 files and the worker branch still clean.

## Cleanup

- Reapplied the intended M4-16 changes to `/Users/atilla/Documents/uzmax-m4-16-customer-asset-admin-shell` using absolute file paths.
- Removed the mistaken unstaged root/main draft files and verified `/Users/atilla/Documents/UZMAX智能运营` returned to clean `main` with `## main...origin/main`.
- Verified the worker branch has the intended M4-16 diff and passes worker boundary plus full validation; final PR-shape is rerun after staging/commit.

## Permanent Control

- For all future worker edits in this desktop environment, `apply_patch` file paths must be absolute paths under the assigned worktree.
- After the first patch in a worker slice, run a dual status check: assigned worker `git status --short --branch` and root/main `git status --short --branch`.
- If root/main becomes dirty during worker work, stop implementation, record or update an incident, clean the root/main checkout, and only continue after root/main is clean.

## Evidence Links

- Spec: `docs/specs/M4-16-customer-asset-admin-shell.md`
- Evidence: `docs/evidence/M4/M4-16-customer-asset-admin-shell.md`
- Detection commands: root/main `git status --short --branch`; worker `git status --short --branch`; worker `npx prettier --write ...`
- Cleanup commands: root/main `git status --short --branch`; worker `npm run guard:worker-boundary`; worker `npm run check`

## Owner / AI Boundary

- AI agent is responsible for recording the incident, cleaning its own mistaken root/main draft edits, adding the absolute-path patch control and proving root/worker cleanliness before merge.
- Project owner remains responsible for final risk acceptance, release decisions, real customer data, real accounts, cost and compliance choices.

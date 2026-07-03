# INC-2026-07-03 M7-UI-03 Root Write Boundary

## Status

Institutionalized status: `pending_merge`.

This incident is recorded by M7-UI-03 and links to `docs/evidence/M7/M7-UI-03-page-migration-ledger-and-router.md`.

## What Happened

During the first M7-UI-03 implementation attempt, the worker used the harness `apply_patch` tool while intending to edit the assigned worktree `/Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router` on branch `codex/m7-ui-03-page-migration-ledger-router`.

The patch instead landed in the forbidden root/main checkout `/Users/atilla/Applications/UZMAX智能运营`. The worker detected that the assigned worktree was still clean and stopped with `BLOCKED` before validation or commit.

Detected root/main impact at block time:

- modified `apps/admin/src/App.tsx`
- modified `apps/admin/src/shell/AppShell.tsx`
- modified `docs/evidence/M7/README.md`
- untracked `apps/admin/src/pages/PageOutlet.tsx`
- untracked `apps/admin/src/pages/registry.ts`
- untracked `apps/admin/tests/m7-ui-page-router.spec.ts`
- untracked `docs/admin-ui-page-migration-ledger.md`
- untracked `docs/evidence/M7/M7-UI-03-page-migration-ledger-and-router.md`
- untracked `docs/specs/M7-UI-03-page-migration-ledger-and-router.md`

## Impact

The incident crossed the `docs/incidents/README.md` threshold for writing outside the assigned worktree and into root/main. It created temporary root/main pollution and could have invalidated worker isolation if unnoticed.

No commit, push, merge, PR, package/lockfile update, backend/API/DB/worker/cron edit, raw prototype edit, secret/customer-data copy or production/release action occurred from this incident.

## Detection

The worker detected the issue by comparing `git status --short --branch` in the assigned worktree and root/main after the initial draft edits. The assigned worktree remained clean while root/main showed the files listed above.

## Cleanup

Coordinator cleaned root/main and reported the cleanup result on 2026-07-03:

```text
/Users/atilla/Applications/UZMAX智能运营
## main...origin/main
```

Coordinator preserved the incident evidence outside the repo:

- `/tmp/uzmax-m7-ui-03-incident/tracked-root-pollution.patch`
- `/tmp/uzmax-m7-ui-03-incident/untracked-root-pollution.tgz`

M7-UI-03 resumed by restoring the draft into the assigned worktree only with explicit path commands:

```text
git -C /Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router apply /tmp/uzmax-m7-ui-03-incident/tracked-root-pollution.patch
tar -xzf /tmp/uzmax-m7-ui-03-incident/untracked-root-pollution.tgz -C /Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router
```

## Root Cause / Unknowns

Confirmed failure mode: the harness `apply_patch` operation did not target the assigned worktree despite the worker intending to work there.

Unknown from repo evidence: whether this was caused by tool cwd state, harness behavior, or model-side invocation context. The safe assumption for this slice is that `apply_patch` is unsafe unless its target worktree is demonstrably correct.

## Permanent Controls

- Worker implementation edits for this slice must use the assigned worktree path explicitly through command `workdir`, absolute paths, or `git -C /Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router`.
- `apply_patch` must not be used for the resumed M7-UI-03 implementation.
- If future workers use `apply_patch`, they must first demonstrate that the harness targets the assigned worktree, or use `git apply` / editor-safe commands from the assigned worktree instead.
- Evidence must record the cleanup result and the command path discipline used after resume.

## Owner / AI Boundary

AI agents are responsible for incident recording, cleanup evidence, and permanent-control recommendations. The project owner remains the only authority for final risk acceptance, release scope, production, real accounts, real customer/order data, LLM key, cost and compliance decisions.

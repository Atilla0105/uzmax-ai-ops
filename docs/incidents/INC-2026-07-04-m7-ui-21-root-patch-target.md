# INC-2026-07-04 M7-UI-21 Root Patch Target

## Status

Institutionalized status: `pending_merge`

## What Happened

During the `M7-UI-21-ticket-page` worker, the first `apply_patch` calls created untracked files in the root/main checkout `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned worktree `/Users/atilla/.codex/worktrees/m7-ui-21-ticket-page-visible-ui`.

The files were:

- `docs/specs/M7-UI-21-ticket-page.md`
- `docs/evidence/M7/M7-UI-21-ticket-page.md`
- `apps/admin/src/pages/tickets/TicketsPage.tsx`
- `apps/admin/src/pages/tickets/ticketFallback.ts`

No commit was made in root/main.

## Impact

Root/main briefly carried untracked worker files for the wrong physical checkout. This could have confused workspace isolation, status audits or a later coordinator if left in place.

No package/lock, DB/API, shared shell, CI/global config, secret, customer data or tracked root/main file was modified.

## Detection

The worker detected the issue when `wc` and `sed` in the assigned worktree could not find the newly added ticket files. A root/main `git status --short --branch` then showed the untracked files.

## Cleanup

The worker moved those exact untracked files from root/main into the assigned worktree and removed the empty root `apps/admin/src/pages/tickets` directory.

Post-cleanup root/main evidence:

```text
## main...origin/main
```

## Permanent Control

For this worker, all subsequent patch paths use explicit worktree-relative paths from the root checkout:

```text
../../.codex/worktrees/m7-ui-21-ticket-page-visible-ui/...
```

Future Codex workers should prefer absolute or explicitly worktree-relative patch targets when the conversation cwd differs from the assigned worktree.

## Owner / AI Boundary

AI is responsible for recording and cleaning this process incident. The project owner remains the final decision-maker for risk acceptance, merge, release and production boundaries.

## Evidence Links

- Spec: `docs/specs/M7-UI-21-ticket-page.md`
- Evidence: `docs/evidence/M7/M7-UI-21-ticket-page.md`

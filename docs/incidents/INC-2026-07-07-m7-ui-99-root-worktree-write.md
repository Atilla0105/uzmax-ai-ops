# INC-2026-07-07 M7-UI-99 Root Worktree Write

> incident_id: INC-2026-07-07-m7-ui-99-root-worktree-write
> severity: medium
> status: pending_merge
> detected_at: 2026-07-07
> milestone: M7
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: contained

## Summary

During the M7-UI-99 group overview source-copy parity worker on 2026-07-07, one spec file write intended for the assigned worktree `/Users/atilla/.codex/worktrees/m7-ui-99-group-overview-source-copy-parity` accidentally targeted the root/main checkout `/Users/atilla/Applications/UZMAX智能运营`.

The transient root/main path was `docs/specs/M7-UI-99-group-overview-source-copy-parity.md`. The coordinator detected the unexpected root/main untracked file before source edits continued. The worker stopped implementation, confirmed assigned worktree and root/main git status, moved the file into the assigned worktree, removed the root/main stray path by that move, and confirmed root/main returned to its pre-existing untracked set.

This incident record exists because `docs/incidents/README.md` requires recording writes outside the assigned worktree/root coordination boundary.

## Impact

- Actual impact: root/main was temporarily dirtied by one untracked docs/spec file: `docs/specs/M7-UI-99-group-overview-source-copy-parity.md`.
- Cleanup impact: the file was moved into the assigned worktree and the root/main stray path no longer exists.
- Potential impact: if unnoticed, root/main could have retained UI-99 governance content outside the assigned implementation branch, weakening worktree isolation and evidence trust.
- Not observed / not claimed: no source/runtime/lock/config/backend/API/DB edits, no package changes, no generated artifacts, no secret/customer/order data, no production/staging action, no commit, no push, no merge and no PR happened from the accidental root/main state.

## Root Cause And Unknowns

- Confirmed failure mode: an `apply_patch` operation used a relative file path and targeted the thread/root checkout instead of the assigned UI-99 worktree.
- Repeated class: this matches the root patch-target / root worktree write class already documented in earlier M7 incidents.
- Unknown timeline or facts: repo evidence does not prove the internal patch-tool cwd transition or exact duration of the temporary root/main dirty state.
- Why the unknown remains: only coordinator status checks, worker report and git state evidence are available; no lower-level patch-tool target audit log is stored in the repo.

## Detection

- Detected by coordinator check showing root/main had a new untracked file: `docs/specs/M7-UI-99-group-overview-source-copy-parity.md`.
- Worker follow-up checks before cleanup:
  - root/main `pwd`: `/Users/atilla/Applications/UZMAX智能运营`
  - root/main branch: `main`
  - root/main status included the stray UI-99 spec plus pre-existing untracked knowledge/team/topbar files.
  - assigned worktree `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-99-group-overview-source-copy-parity`
  - assigned branch: `codex/m7-ui-99-group-overview-source-copy-parity`
  - assigned worktree status was clean before the moved spec appeared there.
- Post-cleanup checks confirmed root/main no longer had the UI-99 spec and assigned worktree had the intended untracked spec file.

## Cleanup

- Completed cleanup: moved `docs/specs/M7-UI-99-group-overview-source-copy-parity.md` from root/main into the assigned UI-99 worktree.
- The worker did not remove or modify pre-existing root/main untracked files:
  - `apps/admin/src/pages/knowledge/KnowledgePage.css`
  - `apps/admin/src/pages/team/teamFallback.ts`
  - `apps/admin/tests/m7-ui-tenant-entry-topbar.spec.ts`
  - `docs/evidence/M7/M7-UI-62-tenant-entry-topbar-parity.md`
  - `docs/specs/M7-UI-32-knowledge-resources-page.md`
  - `docs/specs/M7-UI-62-tenant-entry-topbar-parity.md`
- Verification after cleanup: root/main status returned to that pre-existing untracked set with no `M7-UI-99` file.
- Remaining unknowns: no repo evidence proves there were no transient filesystem artifacts outside git-tracked/untracked status during the event; no such residue is currently known.

## Permanent Controls

- Control: all resumed UI-99 writes must use absolute assigned worktree paths or command `workdir` pinned to `/Users/atilla/.codex/worktrees/m7-ui-99-group-overview-source-copy-parity`.
- Control: run and record pre-write checks for assigned `pwd`, assigned `git status --short --branch --untracked-files=all`, assigned `git branch --show-current`, assigned `git rev-parse --short HEAD`, and root/main `git status --short --branch --untracked-files=all`.
- Control: after the first resumed write, run and record both root/main and assigned worktree status checks.
- Control: before final reporting, run and record both root/main and assigned worktree status checks again.
- Control: root/main `/Users/atilla/Applications/UZMAX智能运营` remains read-only coordination only for this worker; do not touch pre-existing untracked root files.
- Status: recorded in this incident and applied by the resumed UI-99 worker; not yet enforced by tooling.

## Institutionalized Status

`pending_merge`

This status should become `institutionalized_in_docs` only after the PR containing this incident record merges.

## Evidence Links

- Spec: `docs/specs/M7-UI-99-group-overview-source-copy-parity.md`
- Evidence: `docs/evidence/M7/M7-UI-99-group-overview-source-copy-parity.md`
- Incident: `docs/incidents/INC-2026-07-07-m7-ui-99-root-worktree-write.md`
- PR / CI / commit: pending this UI-99 PR.

## Owner / AI Boundary

- AI agent responsibility: record the incident, verify root/main and assigned worktree cleanup evidence, keep resumed implementation inside the assigned worktree, and preserve permanent controls in evidence and final reporting.
- Project owner decision boundary: owner decides final risk acceptance, release scope, production/staging actions, real accounts, real customer/order data, LLM keys, cost and compliance.

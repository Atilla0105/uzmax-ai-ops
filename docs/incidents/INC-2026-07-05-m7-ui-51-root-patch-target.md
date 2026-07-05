# INC-2026-07-05 M7-UI-51 Root Patch Target

> incident_id: INC-2026-07-05-m7-ui-51-root-patch-target
> severity: medium
> status: pending_merge
> detected_at: 2026-07-05
> milestone: M7
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: contained

## Summary

During the M7-UI-51 implementation worker on 2026-07-05, an early relative `apply_patch` intended for `/Users/atilla/.codex/worktrees/m7-ui-51-connection-center-visible-ui` on branch `codex/m7-ui-51-connection-center-visible-ui` accidentally targeted the root/main checkout `/Users/atilla/Applications/UZMAX智能运营`.

The worker detected the mismatch before route wiring continued, stopped implementation edits, inspected both checkouts, copied the four intended new files into the assigned worktree and removed only the accidental root/main files. This record exists because `docs/incidents/README.md` requires recording writes outside the assigned worktree/root coordination boundary.

## Impact

- Actual impact: root/main was temporarily dirtied by untracked M7-UI-51 files.
- Temporary root/main files created by this worker:
  - `apps/admin/src/pages/group/GroupConnectionPage.tsx`
  - `apps/admin/src/pages/group/GroupConnectionViews.tsx`
  - `apps/admin/src/pages/group/groupConnectionFallback.ts`
  - `docs/specs/M7-UI-51-connection-center-page.md`
- Potential impact: if unnoticed, root/main could have retained implementation files outside the assigned worktree, weakening worker isolation and page evidence trust.
- Not observed / not claimed: no commit, push, PR, merge, package/lock, backend/API/DB/CI/global config, secret, customer/order data, production/staging action, GA-0 or 1.0 release happened from the accidental root state.

## Root Cause And Unknowns

- Confirmed failure mode: a relative `apply_patch` operation targeted the thread/root checkout instead of the assigned implementation worktree.
- Repeated class: this matches the M7 UI root patch-target class already recorded in earlier M7 incidents, including `INC-2026-07-03-m7-ui-11-root-patch-target.md`.
- Unknown timeline or facts: repo evidence does not prove the internal patch-tool cwd transition or the exact duration of the temporary root/main dirty state.

## Detection

- The worker noticed the patch-target mismatch when a follow-up `apply_patch` attempted to update root/main `PageOutlet.tsx` and failed against the expected assigned-worktree content.
- Immediate verification checked:
  - assigned worktree status: `## codex/m7-ui-51-connection-center-visible-ui...origin/codex/m7-ui-50-template-center-visible-ui`
  - root/main status before cleanup: `## main...origin/main` with the four M7-UI-51 accidental untracked files plus unrelated pre-existing untracked work.
  - assigned worktree did not yet contain the new M7-UI-51 files before containment.

## Cleanup

- Completed cleanup: copied the four intended files into the assigned worktree, removed the four accidental root/main files, and removed the now-empty accidental root/main `apps/admin/src/pages/group` directory.
- Root/main after cleanup still showed only unrelated pre-existing untracked work:
  - `apps/admin/src/pages/knowledge/`
  - `docs/specs/M7-UI-32-knowledge-resources-page.md`
- Remaining unknowns: no repo evidence proves there were no transient filesystem artifacts outside git-tracked/untracked status during the event; no such residue is currently known.

## Permanent Controls

- Control: all remaining M7-UI-51 implementation writes use explicit absolute assigned-worktree paths in `apply_patch`.
- Control: after containment, both root/main and assigned worktree statuses were rechecked before implementation resumed.
- Control: before validation and final delivery, recheck root/main and assigned worktree status again and record the result in page evidence.
- Status: recorded in this incident; not yet enforced by tooling.

## Institutionalized Status

`pending_merge`

This status should become `institutionalized_in_docs` only after the PR containing this incident record merges.

## Evidence Links

- Spec: `docs/specs/M7-UI-51-connection-center-page.md`
- Evidence: `docs/evidence/M7/M7-UI-51-connection-center-page.md`
- Related incident: `docs/incidents/INC-2026-07-03-m7-ui-11-root-patch-target.md`
- PR / CI / commit: pending this implementation PR.

## Owner / AI Boundary

- AI agent responsibility: record the incident, verify root/main and assigned-worktree cleanup evidence, keep implementation writes pinned to the assigned worktree, and preserve permanent controls for this page slice.
- Project owner decision boundary: owner decides final risk acceptance, release scope, production/staging, real accounts, real customer/order data, LLM keys, cost and compliance.

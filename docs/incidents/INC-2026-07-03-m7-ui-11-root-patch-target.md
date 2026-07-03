# INC-2026-07-03 M7-UI-11 Root Patch Target

> incident_id: INC-2026-07-03-m7-ui-11-root-patch-target
> severity: medium
> status: pending_merge
> detected_at: 2026-07-03
> milestone: M7
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: contained

## Summary

During the M7-UI-11 implementation worker attempt on 2026-07-03, one `apply_patch` intended for `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page-impl` on branch `codex/m7-ui-11-release-acceptance-page-impl` accidentally targeted the root/main checkout `/Users/atilla/Applications/UZMAX智能运营`.

The worker detected the patch-target mismatch immediately, stopped with `BLOCKED`, and cleaned only its own accidental root changes. This incident record exists because `docs/incidents/README.md` requires recording writes outside the assigned worktree/root coordination boundary.

## Impact

- Actual impact: root/main was temporarily dirtied by M7-UI-11 page implementation files before the worker cleaned its own accidental changes.
- Temporary root/main impact reported by the worker:
  - modified `apps/admin/src/pages/PageOutlet.tsx`
  - modified `apps/admin/src/pages/registry.ts`
  - untracked `apps/admin/src/pages/group/GroupReleasePage.tsx`
  - untracked `apps/admin/src/pages/group/GroupReleaseSupport.tsx`
- Potential impact: if unnoticed, root/main could have retained implementation changes outside the assigned implementation worktree, weakening branch isolation and page evidence trust.
- Not observed / not claimed: no commit, push, PR, merge, package/lock, backend/API/DB/CI/global config, secret, customer/order data, production/staging action, GA-0 or 1.0 release happened from the accidental root state.
- Current incident-record PR impact: docs-only governance record; no page implementation or runtime/source change.

## Root Cause And Unknowns

- Confirmed failure mode: a relative or context-dependent `apply_patch` operation targeted the thread/root checkout instead of the assigned implementation worktree.
- Repeated class: this matches the M7 UI patch-target class already recorded in `INC-2026-07-02-m7-ui-root-patch-target.md`, `INC-2026-07-03-m7-ui-03-root-write-boundary.md` and `INC-2026-07-03-m7-ui-10-root-patch-target.md`.
- Unknown timeline or facts: repo evidence does not prove the internal tool cwd transition or the exact duration of the temporary root/main dirty state.
- Why the unknown remains: only worker report, coordinator status checks and git state evidence are available; no lower-level patch-tool target audit log is stored in the repo.

## Detection

- How it was detected: the worker noticed the accidental root/main target immediately after the `apply_patch`, stopped with `BLOCKED`, and reported the root/main file impact.
- Coordinator read-only verification after the blocker:
  - root/main status: `## main...origin/main`
  - assigned implementation worktree status: `## codex/m7-ui-11-release-acceptance-page-impl...origin/main`
  - implementation worktree had no diff or cached diff
  - GitHub open PR list was empty
  - root worktree list contained root/main and the clean implementation worktree.
- This incident-record PR also checked root/main immediately after its first write and saw `## main...origin/main`.

## Cleanup

- Completed cleanup: the implementation worker cleaned only its own accidental root/main changes and left no commit, push, PR or merge from the accidental state.
- Verification: coordinator status checks showed root/main clean and the assigned implementation worktree clean after the blocker; this incident PR rechecked root/main and the implementation worktree before recording.
- Remaining unknowns: no repo evidence proves there were no transient filesystem artifacts outside git-tracked/untracked status during the event; no such residue is currently known.

## Permanent Controls

- Control: the resumed M7-UI-11 implementation must avoid relative `apply_patch` paths.
- Control: resumed implementation writes must use explicit assigned worktree paths or commands scoped to `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page-impl`, for example `git -C` or command `workdir` pinned to that worktree.
- Control: after the first resumed implementation write, run and record both root/main and assigned implementation worktree status checks.
- Control: before validation in the resumed implementation, run and record the same root/assigned dual status checks again.
- Status: recorded in this incident PR; not yet enforced by tooling.
- Follow-up spec/PR if any: the resumed M7-UI-11 implementation must reference this incident and its controls before continuing page work. Tooling guard changes are out of scope for this docs-only PR.

## Institutionalized Status

`pending_merge`

This status should become `institutionalized_in_docs` only after the PR containing this incident record merges.

## Evidence Links

- Spec: `docs/specs/M7-UI-11A-worker-boundary-incident.md`
- Evidence: `docs/evidence/M7/M7-UI-11A-worker-boundary-incident.md`
- Related implementation spec: `docs/specs/M7-UI-11-release-acceptance-page.md`
- Related implementation evidence: `docs/evidence/M7/M7-UI-11-release-acceptance-page.md`
- Related incidents:
  - `docs/incidents/INC-2026-07-02-m7-ui-root-patch-target.md`
  - `docs/incidents/INC-2026-07-03-m7-ui-03-root-write-boundary.md`
  - `docs/incidents/INC-2026-07-03-m7-ui-10-root-patch-target.md`
- PR / CI / commit: pending this incident-record PR.

## Owner / AI Boundary

- AI agent responsibility: record the incident, verify root/main and implementation-worktree cleanup evidence, keep this PR docs-only, and preserve permanent controls for resumed implementation.
- Project owner decision boundary: owner decides final risk acceptance, whether and when M7-UI-11 implementation resumes, release scope, production/staging, real accounts, real customer/order data, LLM keys, cost and compliance.

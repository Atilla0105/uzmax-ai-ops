# INC-2026-07-04 REQ-G01 Runtime Root Patch Target

> incident_id: INC-2026-07-04-req-g01-runtime-root-patch-target
> severity: medium
> status: pending_merge
> detected_at: 2026-07-04
> milestone: M7
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: none

## Summary

During the worker for PR #186 / `REQ-G01-group-overview-runtime-contract`, the worker initially wrote the intended docs to the root/main checkout `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned #186 worktree.

The worker self-detected early before commit/push, cleaned only its own accidental root/main changes with reverse `apply_patch`, and final root/main evidence returned to clean at `ef6c40264280b4d5366e0895a2556a08c72b3f54`.

This record exists because `docs/incidents/README.md` lines 7-15 require an incident when a worker writes outside the assigned worktree, including root/main checkout.

## Impact

- Actual impact: transient root/main working-tree write only.
- Wrong root/main paths touched transiently:
  - `docs/specs/REQ-G01-group-overview-runtime-contract.md`
  - `docs/evidence/M7/REQ-G01-group-overview-runtime-contract.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Content type: new runtime contract spec, new M7 evidence, README queue/blocker update and ledger runtime blocker update.
- Potential impact: if unnoticed, root/main could have retained docs changes outside the assigned #186 branch/worktree, weakening branch isolation and M7 evidence trust.
- Not observed / not claimed: no root commit, no staged changes, no remote branch/PR/CI impact, no prototype/user files touched, no known other worktree impact, no source/runtime/package/lock/config/backend/API/DB change, no secret/customer data exposure, no production/staging action, no GA-0 or 1.0 release action.
- Current incident-record PR impact: docs-only governance record; no #186 runtime contract or implementation change.

## Root Cause And Unknowns

- Confirmed failure mode: the worker's initial patch target was root/main instead of the assigned #186 worktree.
- Process gap: the worker did not effectively enforce `cd assigned worktree && test $(pwd) = assigned_path` immediately before the first `apply_patch`.
- Repeated class: this matches the broader M7 patch-target/root-main incident class already recorded in prior incident docs.
- Unknown timeline or facts: repo evidence does not prove the exact duration of the temporary root/main dirty state or the internal patch-tool target transition.
- Why the unknown remains: only worker report, coordinator status checks and git state evidence are available; no lower-level patch-tool target audit log is stored in the repo.

## Detection

- How it was detected: the worker self-detected early before commit/push and reported the incident in final output.
- Coordinator verification: `docs/incidents/README.md` lines 7-15 classify writes outside the assigned worktree, including root/main checkout, as incident-threshold events.
- Root cleanup evidence reported after cleanup:
  - `git status --short --branch` -> `## main...origin/main`
  - `git diff --name-only` -> no output
  - root HEAD -> `ef6c40264280b4d5366e0895a2556a08c72b3f54`

## Cleanup

- Completed cleanup: the worker used reverse `apply_patch` only.
- Removed from root/main: the two accidental new root files:
  - `docs/specs/REQ-G01-group-overview-runtime-contract.md`
  - `docs/evidence/M7/REQ-G01-group-overview-runtime-contract.md`
- Restored in root/main: README/ledger text in:
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Explicitly not used: no `git reset` and no `git checkout`.
- Verification: root/main returned to `## main...origin/main`, `git diff --name-only` returned no output, and root HEAD remained `ef6c40264280b4d5366e0895a2556a08c72b3f54`.
- Remaining unknowns: no repo evidence proves there were no transient filesystem artifacts outside git-tracked/untracked status during the event; no such residue is currently known.

## Permanent Controls

- Control: future worker prompts for docs/spec creation must include explicit `cd assigned worktree && test $(pwd) = assigned_path` before any `apply_patch`.
- Control: coordinator must treat any reported root/main transient write as an incident before marking a worker PR ready or merging it.
- Control: affected worker evidence must include a pre-edit status/pwd evidence table covering assigned worktree path, branch, HEAD, root/main status and root/main diff state.
- Status: recorded in this incident PR; not yet enforced by tooling.
- Follow-up spec/PR if any: none proposed in this slice. Tooling guard changes are out of scope for this docs-only PR.

## Institutionalized Status

`pending_merge`

This status should become `institutionalized_in_docs` only after the PR containing this incident record merges.

## Evidence Links

- Spec: `docs/specs/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`
- Evidence: `docs/evidence/M7/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`
- Affected PR: #186, Draft/Open runtime contract PR
- Affected branch: `codex/req-g01-group-overview-runtime-contract`
- Affected head at incident recording: `13b4b340c58493d36f93a8f85311f6ea68331fc0`
- PR / CI / commit for this incident record: pending this incident-record PR.

## Owner / AI Boundary

- AI agent responsibility: record the incident, preserve cleanup evidence, keep this PR docs-only, avoid touching #186, keep root/main clean, run validation and surface residual process risk.
- Project owner decision boundary: owner decides final risk acceptance, whether/when #186 proceeds from Draft, release scope, production/staging, real accounts, real customer/order data, LLM keys, cost and compliance.

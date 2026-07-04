# INC-2026-07-04 REQ-G01A Root Patch Target

> incident_id: INC-2026-07-04-req-g01a-root-patch-target
> severity: medium
> status: pending_merge
> detected_at: 2026-07-04
> milestone: M7
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: none_known

## Summary

During the worker for PR #188 / `REQ-G01A-group-overview-runtime-implementation`, the worker initially applied intended docs changes to the root/main checkout `/Users/atilla/Applications/UZMAX智能运营` instead of only the assigned #188 worktree.

The #188 worker reported that the initial patch-target slip was immediately cleaned, the same docs content was reapplied to the assigned #188 worktree, and final diff/commit/push were only from the assigned worktree.

This record exists because `docs/incidents/README.md` requires an incident when a worker writes outside the assigned worktree, including root/main checkout.

## Impact

- Actual impact: transient root/main working-tree write reported by PR #188 worker/evidence.
- Affected PR: #188, `docs: plan REQ-G01A group overview runtime implementation`.
- Affected branch: `codex/req-g01a-group-overview-runtime-implementation-spec`.
- Affected commit: `f18a7e9c6edb9818f5fa4087c3910304206db003`.
- PR #188 final changed files were four docs paths only:
  - `docs/specs/REQ-G01A-group-overview-runtime-implementation.md`
  - `docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Potential impact: if unnoticed, root/main could have retained docs changes outside the assigned #188 branch/worktree, weakening branch isolation and M7 evidence trust.
- Not observed / not claimed: no root/main commit, no current root/main diff, no known other worktree impact from this incident-record PR, no source/runtime/package/lock/config/backend/API/DB/admin code implementation, no secret/customer data known, no production/staging action, no GA-0 or 1.0 release action.
- Current incident-record PR impact: docs-only governance record; no #188 implementation-plan content change.

## Root Cause And Unknowns

- Confirmed failure mode: the worker's initial patch target was root/main instead of only the assigned #188 worktree.
- Process gap: the first patch target was not effectively constrained to the assigned worktree immediately before write.
- Repeated class: this matches the broader M7 patch-target/root-main incident class and the prior REQ-G01 runtime incident record.
- Unknown timeline or facts: repo evidence does not prove the exact duration of the temporary root/main dirty state or the lower-level patch-tool target transition.
- Why the unknown remains: only worker report, PR #188 evidence, coordinator status checks and git state evidence are available; no lower-level patch-tool target audit log is stored in the repo.

## Detection

- How it was detected: the #188 worker self-reported the patch-target slip and recorded it in the PR #188 evidence file.
- Evidence:
  - PR #188 evidence states root/main was inspected read-only only, writes were transferred to the assigned worker worktree after an initial patch-target slip, an initial patch accidentally landed in root/main, the same docs content was reapplied to assigned worktree, and root/main was cleaned before validation.
  - Coordinator verification before this incident-record worker: `git status --short --branch` in root/main -> `## main...origin/main`; `git diff --name-only` in root/main -> no output.
  - `docs/incidents/README.md` classifies writes outside the assigned worktree, including root/main checkout, as incident-threshold events.

## Cleanup

- Completed cleanup: #188 evidence reports root/main was cleaned before validation and final diff/commit/push were only from assigned #188 worktree.
- Verification: coordinator verified root/main current status as `## main...origin/main` with no root diff before this incident-record worker.
- Incident-record worker execution note: while creating this record, the first patch attempt briefly created these same three incident docs files as untracked files in root/main due to patch target resolution. The worker detected it immediately, deleted only those three untracked files with reverse `apply_patch`, and wrote the files by absolute path into the assigned incident worktree before validation continued.
- Explicitly not claimed: this incident-record worker did not edit #188 worktree.
- Remaining unknowns: no repo evidence proves there were no transient filesystem artifacts outside git-tracked/untracked status during the event; no such residue is currently known.

## Permanent Controls

- Control: future worker prompts must require assigned worktree `pwd`, branch and status checks immediately before the first `apply_patch`.
- Control: coordinator must treat any reported root/main transient write as an incident before marking the affected worker PR ready or merging it.
- Control: affected worker evidence must include a pre-edit status/pwd evidence table covering assigned worktree path, branch, HEAD, root/main status and root/main diff state.
- Status: recorded in this incident PR; not yet enforced by tooling.
- Follow-up spec/PR if any: none proposed in this slice. Tooling guard changes are out of scope for this docs-only PR.

## Institutionalized Status

`pending_merge`

This status should become `institutionalized_in_docs` only after the PR containing this incident record merges.

## Evidence Links

- Spec: `docs/specs/REQ-G01A-worker-boundary-incident.md`
- Evidence: `docs/evidence/M7/REQ-G01A-worker-boundary-incident.md`
- Affected PR: `https://github.com/Atilla0105/uzmax-ai-ops/pull/188`
- Affected branch: `codex/req-g01a-group-overview-runtime-implementation-spec`
- Affected commit: `f18a7e9c6edb9818f5fa4087c3910304206db003`
- Affected PR evidence: `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec/docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md`
- PR / CI / commit for this incident record: pending this incident-record PR.

## Owner / AI Boundary

- AI agent responsibility: record the incident, preserve cleanup evidence, keep this PR docs-only, avoid touching #188, keep root/main clean, run validation and surface residual process risk.
- Project owner decision boundary: owner decides final risk acceptance, whether/when #188 proceeds from Draft, release scope, production/staging, real accounts, real customer/order data, LLM keys, cost and compliance.

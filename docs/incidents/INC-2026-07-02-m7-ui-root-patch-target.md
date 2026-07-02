# INC-2026-07-02 M7 UI Root Patch Target

> incident_id: INC-2026-07-02-m7-ui-root-patch-target
> severity: medium
> status: pending_merge
> detected_at: 2026-07-02
> milestone: M7
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: contained

## Summary

During M7 UI preflight worker execution on 2026-07-02, two docs-only workers reported first-patch writes landing in the root/main checkout `/Users/atilla/Applications/UZMAX智能运营` instead of their assigned worker worktrees.

The workers removed or moved only their own unintended root files, regenerated the intended docs in their assigned worktrees, and the coordinator later verified root/main as clean.

## Impact

- Actual impact: root/main temporarily received untracked docs-only files for M7 UI preflight outputs.
- Potential impact: if not detected, root/main could retain local-only docs changes outside the assigned branch/worktree, reducing branch and evidence trust.
- Not observed / not claimed: no admin source, backend source, DB schema, runtime config, lockfile, secret, production/staging setting, raw customer/order data, raw Telegram payload, provider key, Bot token or webhook secret is known to have remained in root/main.

## Root Cause And Unknowns

- Confirmed failure mode: `apply_patch` was invoked from the thread/root checkout context rather than the assigned worker worktree, causing docs files to appear in root/main before cleanup.
- Repeated class: this matches prior root patch-target incidents and therefore cannot be closed as a one-off chat-only note.
- Unknown timeline or facts: repo evidence does not prove the exact duration the temporary root files existed or the internal tool cwd transition.
- Why the unknown remains: only worker evidence, git status results and command logs are available; no lower-level tool cwd audit log is stored in the repo.

## Detection

- How it was detected: workers reported the patch-target mismatch in their evidence, and coordinator validation rechecked root/main.
- Evidence:
  - `docs/evidence/M7/M7-UI-00A-fixture-sanitization-map.md`
  - `docs/evidence/M7/M7-UI-00B-token-foundation-contract.md`
  - coordinator root/main `git status --short --branch` returned `## main...origin/main`.

## Cleanup

- Completed cleanup: workers removed or relocated the unintended docs-only files from root/main and recreated final docs in their assigned worktrees.
- Verification: coordinator rechecked root/main after worker completion and saw `## main...origin/main`.
- Remaining unknowns: no repo evidence proves there were no transient filesystem artifacts outside git-tracked/untracked status during the event; no such residue is currently known.

## Permanent Controls

- Control: future M7 UI worker prompts must explicitly warn that `apply_patch` can default to the thread/root checkout and must require absolute file targets or worker-local patching plus immediate root/main status verification.
- Status: recorded in this incident; not yet guarded by tooling.
- Follow-up spec/PR if any: none required for docs-only closeout unless the failure recurs again in M7 UI implementation slices or a tooling guard becomes feasible.

## Evidence Links

- Spec: `docs/specs/M7-06-m7-ui-worker-boundary-incident.md`
- Evidence: `docs/evidence/M7/M7-06-m7-ui-worker-boundary-incident.md`
- Related evidence:
  - `docs/evidence/M7/M7-UI-00A-fixture-sanitization-map.md`
  - `docs/evidence/M7/M7-UI-00B-token-foundation-contract.md`
- PR / CI / commit: pending future PR/commit.

## Owner / AI Boundary

- AI agent responsibility: record the incident, verify root/main cleanliness, keep worker outputs in assigned branches, and improve future worker prompts.
- Project owner decision boundary: owner decides final acceptance of the branches and any broader process changes beyond this documented control.

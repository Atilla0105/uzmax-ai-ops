# INC-2026-07-03 M7-07 Root Patch Target

> incident_id: INC-2026-07-03-m7-07-root-patch-target
> severity: medium
> status: pending_merge
> detected_at: 2026-07-03
> milestone: M7
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: none

## Summary

During M7-07, the AI worker used the patch tool without an absolute worktree path. The patch tool applied the initial M7-07 spec and test edit to the root checkout at `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned worktree `/Users/atilla/.codex/worktrees/m7-07-pr-shape-quote-path/UZMAX智能运营`.

## Impact

- Actual impact: root checkout briefly had an unstaged modification to `scripts/tests/guards.test.mjs` and an untracked `docs/specs/M7-07-pr-shape-quote-path.md`.
- Potential impact: if left in place, root/main could carry worker-only test/spec changes and confuse coordinator validation.
- Not observed / not claimed: no commit, push, merge, PR, lockfile change, CI workflow change, app/admin change, customer data, secret, production config or generated artifact was involved.

## Root Cause And Unknowns

- Confirmed root cause or failure mode: `apply_patch` was invoked with relative file paths from a thread whose default patch target was the root checkout, while shell commands were correctly using the assigned worktree.
- Unknown timeline or facts: no unknown file set remains; the root diff was inspected before cleanup.
- Why the unknown remains: not applicable.

## Detection

- How it was detected: the focused test run in the assigned worktree did not show the newly added test, so the worker compared `git status --short --branch` and searched for the new test/spec in both the assigned worktree and root checkout.
- Evidence: root showed `M scripts/tests/guards.test.mjs` and `?? docs/specs/M7-07-pr-shape-quote-path.md`; assigned worktree remained clean.

## Cleanup

- Completed cleanup: the root checkout patch was reverted with an absolute-path patch that removed the added test block, restored the original `specContent` helper, and deleted the accidental root spec file.
- Verification: root checkout `git status --short --branch` returned only `## main...origin/main` after cleanup.
- Remaining unknowns: none for the known touched files.

## Permanent Controls

- Control: all subsequent file edits in this worker use absolute paths under the assigned worktree.
- Status: applied for this branch after incident detection.
- Follow-up spec/PR if any: M7-07 includes this incident record in its spec touch list so the guard can validate it instead of relying on chat-only memory.

## Evidence Links

- Spec: `docs/specs/M7-07-pr-shape-quote-path.md`
- Evidence: `docs/evidence/M7/M7-07-pr-shape-quote-path.md`
- PR / CI / commit: none yet; worker was instructed not to commit, push, merge or open PR.

## Owner / AI Boundary

- AI agent responsibility: disclose the boundary mistake, clean root, keep further writes inside the assigned worktree, record this incident, and provide validation evidence.
- Project owner decision boundary: final risk acceptance, release decisions, real account/data/LLM/cost/compliance choices and merge approval remain with the project owner.

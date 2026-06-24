# INC-2026-06-24 M5R-00 Root Main Worktree Pollution

## Summary

During M5R-00 startup on 2026-06-24, the initial patch for `docs/specs/M5R-00-runtime-integration-plan.md` and `docs/evidence/M5R/README.md` was applied relative to the root/main checkout `/Users/atilla/Documents/UZMAX智能运营` instead of the assigned worktree `/Users/atilla/Documents/uzmax-m5r-00-runtime-integration-plan`.

## Impact

Impact was limited to two untracked docs in root/main:

- `docs/specs/M5R-00-runtime-integration-plan.md`
- `docs/evidence/M5R/README.md`

No tracked root/main files were modified. No runtime source, apps, packages, scripts, lockfile, config, generated files, validation output, commit, push, PR, secret, customer data, order data, raw payload, real LLM call or production/runtime file was involved.

## Detection

The worker checked the assigned worktree after the patch and found it still clean while root/main had untracked docs:

- root `git status --short --branch` returned `## main...origin/main` plus `?? docs/evidence/M5R/` and `?? docs/specs/M5R-00-runtime-integration-plan.md`;
- assigned worktree `git status --short --branch` returned `## codex/m5r-00-runtime-integration-plan...origin/main`;
- root `git status --short --untracked-files=all` later expanded the dirty set to exactly `?? docs/evidence/M5R/README.md` and `?? docs/specs/M5R-00-runtime-integration-plan.md`.

## Cleanup

Coordinator-authorized cleanup verified the only dirty root paths were exactly the two untracked files above. The worker deleted only:

- `docs/specs/M5R-00-runtime-integration-plan.md`
- `docs/evidence/M5R/README.md`

The worker then removed the empty `docs/evidence/M5R` directory and re-ran root status. Root/main returned to `## main...origin/main`, and `git status --short --untracked-files=all` returned no output.

## Cause

The worker used the patching tool without an assigned-worktree working directory. The runtime applied the patch relative to the root/main checkout. This matches the known failure mode recorded in prior root patch-target incidents.

## Permanent Control

Containment and cleanup landed in this PR: the two untracked root docs were removed, root/main returned clean, and the assigned worktree carries the intended docs. The required worker-boundary guard remains detective evidence that the assigned/root state is clean at validation time; it is not a new preventive control for patch-target mistakes.

No new guard or script preventive control lands in M5R-00. Repeated patch-target failures remain a known orchestration risk to monitor and handle in later guard or tooling work if needed.

Institutionalized status: `pending_merge`.

## Evidence Links

- Spec: `docs/specs/M5R-00-runtime-integration-plan.md`
- Evidence: `docs/evidence/M5R/README.md`
- Root cleanup evidence: recorded in `docs/evidence/M5R/README.md`

## Owner / AI Boundary

This is an AI process incident. AI is responsible for recording the incident, limiting cleanup to authorized files, preserving evidence and avoiding further out-of-worktree writes. Project owner remains responsible for final risk acceptance, scope, release, real data/account, LLM key, cost and compliance decisions.

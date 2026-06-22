# INC-2026-06-22 SPK-02 Root Main Worktree Pollution

> incident_id: INC-2026-06-22-spk02-root-main-worktree-pollution
> severity: medium
> status: pending_merge
> detected_at: 2026-06-22
> milestone: M4 / SPK-02
> spec: `docs/specs/SPK-02-order-api.md`
> evidence: `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, merge, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: none_observed

## Summary

During SPK-02 docs-only work, the initial `apply_patch` operation wrote the same five SPK-02 docs changes into the root/main checkout at `/Users/atilla/Documents/UZMAX智能运营` instead of the assigned worker worktree `/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure`.

Affected root/main paths before cleanup:

- `docs/specs/SPK-02-order-api.md`
- `docs/adr/ADR-B02-order-api.md`
- `docs/adr/README.md`
- `docs/evidence/M4/README.md`
- `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`

No commit, push, PR creation or merge happened from the polluted root/main checkout.

## Impact

- Actual impact: root/main briefly carried uncommitted SPK-02 docs edits that belonged only in the assigned worker branch.
- Potential impact: if undetected, root/main could have become an implicit implementation workspace, invalidating one worker / one worktree / one branch evidence and hiding branch-specific process history.
- Not observed / not claimed: no raw order/customer data, CSV/XLSX export, credentials, env files, secrets, screenshots, customer identifiers, payment data, LLM/provider call, external API call or production data were introduced.

## Root Cause And Unknowns

- Confirmed root cause or failure mode: path-agnostic relative `apply_patch` used the session/root current directory rather than the assigned worker worktree.
- Structural failure mode: shell `workdir`, `pwd` and branch checks do not bind path-agnostic edit tools to the assigned worktree unless edits use absolute assigned paths or write through commands scoped by `git -C /Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure`.
- Unknown timeline or facts: git metadata cannot prove the patch tool's internal current directory beyond the observed root/main dirty status and assigned worktree clean status.
- Why the unknown remains: the edit tool resolution context is not represented in repository history.

## Detection

- How it was detected: after the patch, the assigned worktree remained clean while root/main showed the SPK-02 modified and untracked docs paths. A dual status check exposed the mismatch.
- Evidence:
  - Assigned worktree initially after mistaken patch: `## codex/spk-02-order-api-no-api-closure` with no SPK-02 docs changes.
  - Root/main after mistaken patch: modified `docs/adr/README.md`, modified `docs/specs/SPK-02-order-api.md`, untracked `docs/adr/ADR-B02-order-api.md`, untracked `docs/evidence/M4/`.
  - The worker stopped, reported the boundary problem and migrated only the intended SPK-02 docs changes into the assigned worktree.

## Cleanup

- Completed cleanup:
  - The tracked root/main diff for the allowed SPK-02 docs files was piped into `git -C /Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure apply`.
  - The same tracked root/main diff was reverse-applied in root/main.
  - The untracked root/main SPK-02 docs files were copied into the assigned worktree and then removed from root/main.
  - The SPK-02 docs-only closure was committed from the assigned worktree as `b7f823e48da05683567d4a7f4bfbf2540ca3285a`.
- Verification:
  - Root/main returned clean: `git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch` -> `## main...origin/main`.
  - Assigned worktree contained only the allowed SPK-02 docs changes before commit and returned clean after commit: `git -C /Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure status --short --branch` -> `## codex/spk-02-order-api-no-api-closure`.
  - `git diff --check origin/main...HEAD` passed after the SPK-02 docs-only closure commit.
- Remaining unknowns: no sealed `/tmp` artifact was created because the pollution was the same five allowed docs changes and was immediately migrated/removed. The repository records final cleanup state rather than a retained root pollution archive.

## Permanent Controls

- Control: for the remainder of SPK-02, all writes must use absolute assigned paths under `/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure` or commands scoped with `git -C /Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure`.
- Status: active for this branch.
- Control: after edits, formatters, archive restores, generated writes, validation that may produce residue, or cleanup, run both:
  - `git -C /Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure status --short --branch`
  - `git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch`
- Status: active for this branch.
- Control: continue running the explicit worker boundary command:
  - `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary`
- Status: active for this branch.
- Control: runtime/harness write prevention remains outside the in-repo guard. The repo guard is forensic and detects assigned/root mismatches; it is not a complete technical jail for path-agnostic edit tools.
- Status: documented.
- Follow-up spec/PR if any: none required inside SPK-02 before coordinator review/merge after this incident record is included. Broader runtime/harness prevention remains a future coordinator/tooling decision if the project wants stronger prevention for path-agnostic edit tools.

## Institutionalized Status

`pending_merge`

This incident will become institutionalized after the SPK-02 PR merges with this incident file, the SPK-02 spec touch-list update and the SPK-02 evidence manifest update. Until then it remains `pending_merge`.

## Evidence Links

- Spec: `docs/specs/SPK-02-order-api.md`
- Evidence: `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`
- ADR: `docs/adr/ADR-B02-order-api.md`
- Initial SPK-02 closure commit: `b7f823e48da05683567d4a7f4bfbf2540ca3285a`
- Worker boundary runbook: `docs/runbooks/worker-worktree-boundary.md`
- Prior pattern: `docs/incidents/INC-2026-06-19-m3-09-root-main-worktree-pollution.md`

## Owner / AI Boundary

- AI agent responsibility: record the incident, keep root/main clean, keep all further writes scoped to the assigned worktree, run validation, report remaining unknowns and maintain sensitive-data boundaries.
- Project owner decision boundary: accept or reject the SPK-02 PR process risk closure and decide any merge, release, real customer data, real account, LLM key, cost or compliance implications.

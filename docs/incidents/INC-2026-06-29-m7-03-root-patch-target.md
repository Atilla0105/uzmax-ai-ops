# INC-2026-06-29 M7-03 Root Patch Target

> incident_id: INC-2026-06-29-m7-03-root-patch-target
> severity: medium
> status: institutionalized_in_docs
> detected_at: 2026-06-29
> milestone: M7
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: contained

## Summary

During M7-03 docs generation on 2026-06-29, the first `apply_patch` invocation wrote the newly generated docs files into the root/main checkout `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned worker worktree `/Users/atilla/.codex/worktrees/m7-03-admin-design-system/UZMAX智能运营`.

## Impact

- Actual impact: root/main temporarily showed one modified tracked file and three untracked docs-only files: `docs/evidence/M7/README.md`, `docs/admin-design-system.md`, `docs/specs/M7-03-admin-design-system-from-prototype.md`, and `docs/evidence/M7/M7-03-admin-design-system-from-prototype.md`.
- Potential impact: if not detected, root/main could have retained hidden local-only docs changes outside the assigned branch/worktree, reducing branch/evidence trust.
- Not observed / not claimed: no admin source, backend source, DB schema, runtime config, lockfile, secret, production/staging setting, raw customer/order data, raw Telegram payload, provider key, Bot token or webhook secret was written.

## Root Cause And Unknowns

- Confirmed root cause or failure mode: the tool-level `apply_patch` invocation did not target the worker worktree; it applied relative to the root checkout context.
- Unknown timeline or facts: no extended duration is claimed beyond the current turn; the exact internal tool cwd behavior is not proven by repo evidence.
- Why the unknown remains: only git status and command outputs are available; no tool-level cwd log is stored in the repo.

## Detection

- How it was detected: follow-up validation in the worker worktree could not find the newly added files, while root/main showed the unexpected docs diff.
- Evidence: root/main `git status --short --branch` showed `## main...origin/main`, `M docs/evidence/M7/README.md` and the three untracked M7-03 docs files; worker status initially showed only `## codex/m7-03-admin-design-system` with no diff.

## Cleanup

- Completed cleanup: copied the generated docs-only files to the assigned worker worktree, removed the three root untracked files, and restored root `docs/evidence/M7/README.md` to HEAD.
- Verification: root/main `git status --short --branch` returned `## main...origin/main`; worker status showed the intended M7-03 docs diff only.
- Remaining unknowns: none for repo file residue; this incident does not prove broader tool behavior beyond this patch-target failure.

## Permanent Controls

- Control: for this slice, subsequent patching is done through the shell `apply_patch` command with `workdir` set to the assigned worker worktree, followed by root/main status checks.
- Status: institutionalized in this incident and M7-03 spec/evidence.
- Follow-up spec/PR if any: none required unless repeated patch-target incidents occur in later M7 UI slices.

## Evidence Links

- Spec: `docs/specs/M7-03-admin-design-system-from-prototype.md`
- Evidence: `docs/evidence/M7/M7-03-admin-design-system-from-prototype.md`
- PR / CI / commit: pending future PR/commit.

## Owner / AI Boundary

- AI agent responsibility: detect, clean, verify root/main cleanliness, keep the generated docs in the assigned worker branch, and record this incident.
- Project owner decision boundary: owner decides final acceptance of the branch and any future process changes beyond this documented control.

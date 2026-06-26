# INC-2026-06-26 LAY-29 Root Write Boundary

> incident_id: INC-2026-06-26-lay29-root-write-boundary
> status: pending_merge
> related_spec: `docs/specs/M6B-10-api-staging-identity-authz-readiness.md`
> related_branch: `codex/lay-29-api-authz-readiness`
> owner_boundary: AI agent owns cleanup, evidence and control recommendation; project owner owns final risk acceptance and release decisions.

## What Happened

During LAY-29 implementation, the AI agent created the assigned worktree `/Users/atilla/Applications/UZMAX智能运营-lay-29-api-authz-readiness` on branch `codex/lay-29-api-authz-readiness`, but then used a patch tool from the root/main checkout context. The first implementation edits were written to `/Users/atilla/Applications/UZMAX智能运营` on `main` instead of the assigned worker worktree.

Affected root paths were:

- `apps/api/scripts/runtime-compiler.mjs`
- `apps/api/src/access-context.ts`
- `apps/api/src/app.module.ts`
- `docs/evidence/M6B/README.md`
- `docs/evidence/M6B/M6B-10-api-staging-identity-authz-readiness.md`
- `docs/specs/M6B-10-api-staging-identity-authz-readiness.md`
- `scripts/tests/m6b-api-authz-readiness.test.mjs`

No commit was made on root/main.

## Impact

The incident temporarily violated AGENTS.md workspace isolation rule 6A: root/main checkout is coordinator-only and must not carry worker edits. The affected content was LAY-29 implementation/spec/evidence/test content only. No secret, customer/order data, production mutation, Render/TG mutation, outbound Bot send, restore, DB migration, generated client or lockfile change was involved.

## Root Cause

The patch tool applied relative to the thread root checkout, while the intended edit target was the assigned git worktree. The agent did not re-check `git status --short --branch` in the assigned worktree immediately before the first patch.

## Detection

The coordinator asked for a status check and observed the worker worktree had no diff. The agent then checked both root and worker git status and found the LAY-29 diff in root/main.

## Cleanup

The agent copied the exact LAY-29 diff into `/Users/atilla/Applications/UZMAX智能运营-lay-29-api-authz-readiness`, then restored only the root paths listed above and removed the three untracked LAY-29 files from root/main. After cleanup, root/main `git status --short --branch` returned only `## main...origin/main`.

## Permanent Control

For the rest of this LAY-29 slice, all edits are performed with commands whose working directory is the assigned worktree. Before final validation, the branch must run `guard:worker-write-boundary --assigned /Users/atilla/Applications/UZMAX智能运营-lay-29-api-authz-readiness --root /Users/atilla/Applications/UZMAX智能运营` and record root/main clean status.

A broader permanent control would be a patch/edit tool wrapper that requires explicit assigned worktree path for worker branches. That wrapper is not added in this product slice.

## Evidence

- Root/main status after cleanup: `## main...origin/main`.
- Worker status after transfer: branch `codex/lay-29-api-authz-readiness` contains the LAY-29 diff.
- This incident is included in the LAY-29 branch so the boundary issue is visible in review.

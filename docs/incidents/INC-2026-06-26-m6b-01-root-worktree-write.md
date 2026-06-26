# INC-2026-06-26 M6B-01 Root Worktree Write

Incident ID: INC-2026-06-26-m6b-01-root-worktree-write
Status: `pending_merge`
Milestone: M6B
Related spec: `docs/specs/M6B-01-api-production-artifact.md`
Related issue: Linear LAY-16
Detected at: 2026-06-26

## What Happened

During M6B-01 implementation, the first `apply_patch` invocation landed in the root/main checkout `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned worker worktree `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-01-api-production-artifact`.

Observed root/main changes before cleanup were limited to the intended M6B-01 draft files:

- modified `package.json`
- modified `apps/api/package.json`
- modified `apps/api/src/main.ts`
- untracked `apps/api/scripts/run-m6b-api-artifact-smoke.mjs`
- untracked `apps/api/tsconfig.build.json`
- untracked `docs/specs/M6B-01-api-production-artifact.md`

No commit, push, PR, production deploy, secret, customer/order data, Telegram payload, provider call, generated artifact, DB schema change, migration or release-gate mutation occurred from root/main.

## Impact

The incident affected local git checkout hygiene and delivery governance. It did not affect committed repository history, CI, production, external services, secrets or customer data.

## Root Cause / Unknowns

Confirmed root cause: the patch tool applied relative to the coordinator root checkout rather than the assigned worker worktree. The worker did not verify the patch target immediately before applying the first edits.

Unknown: whether this is a stable tool default for all future `apply_patch` calls in this desktop session or a one-time current-working-directory mismatch. Treat it as stable risk until proven otherwise.

## Detection

Detection came from build evidence mismatch: `npm run build:api` in the assigned worktree still showed the old typecheck-only script. A boundary audit then showed root/main dirty and the assigned worktree unchanged.

## Cleanup

Cleanup performed immediately after detection:

- captured the root/main tracked diff to `/tmp/m6b-01-root-tracked.patch`;
- copied the three untracked intended M6B-01 files into the assigned worktree;
- applied the tracked diff to the assigned worktree;
- reversed the tracked diff from root/main;
- removed the three root/main untracked files;
- verified root/main returned to `## main...origin/main` with no dirty files;
- verified the intended M6B-01 diff exists only in the assigned worktree.

## Permanent Control

For the remainder of M6B-01, all patch operations must be executed from inside the assigned worktree with the local `apply_patch` command via `exec_command` and `workdir` set to `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-01-api-production-artifact`.

Before final closeout, run:

- root/main `git status --short --branch`;
- assigned worktree `git status --short --branch`;
- `worker-write-boundary` with explicit `--assigned` and `--root` paths.

No new repo guard is added in this PR because the existing `worker-write-boundary` guard covers detection; the missing control was operator-side patch targeting.

## Evidence Links

- Spec: `docs/specs/M6B-01-api-production-artifact.md`
- Evidence: `docs/evidence/M6B/M6B-01-api-production-artifact.md`
- Cleanup evidence will be summarized in the M6B-01 evidence validation table before PR review.

## Owner / AI Boundary

AI agent owns this incident record, cleanup, evidence honesty and the local patch-target control. Project owner owns final risk acceptance, release decisions, production/staging credentials, real customer/order data, provider costs and compliance decisions.

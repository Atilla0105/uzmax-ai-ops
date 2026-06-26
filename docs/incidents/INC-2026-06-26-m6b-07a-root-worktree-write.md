# INC-2026-06-26 M6B-07a Root Worktree Write

> incident_id: INC-2026-06-26-m6b-07a-root-worktree-write
> severity: medium
> status: pending_merge
> detected_at: 2026-06-26
> milestone: M6B
> owner_ai_boundary: AI agent records evidence, cleanup and controls; project owner decides final risk acceptance, release, real accounts, real customer data, LLM keys, cost and compliance.
> sensitive_data_status: none

## Summary

During LAY-26 / M6B-07a docs-only runbook sync, the first patch application targeted the root/main checkout `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned worker worktree `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6b-07a-deploy-rollback-runbook-sync`.

The root/main write was a workspace isolation incident. It did not commit, push, open a PR, deploy, call Render/Vercel/Telegram, expose secrets, touch customer/order data, change runtime source, change package/lock/config/CI/guard files, or alter DB schema/migrations.

## Impact

- Actual impact: temporary root/main dirty state on docs-only files.
- Potential impact: if unnoticed, a later branch or PR could have mixed coordinator-root edits with LAY-26 worktree edits, weakening one-branch/one-worktree governance evidence.
- Not observed / not claimed: no committed history pollution, CI effect, external service mutation, production effect, secret exposure, customer/order data exposure, deploy/rollback execution or GA-0/release approval.

## Affected Paths

Temporary root/main edits were limited to the intended M6B-07a docs-only paths:

- `docs/specs/M6B-07a-deploy-rollback-runbook-sync.md`
- `docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md`
- `docs/runbooks/deploy-rollback.md`
- `docs/evidence/M6B/README.md`

## Root Cause And Unknowns

- Confirmed root cause or failure mode: a patch operation applied relative to the coordinator root/main checkout instead of the assigned worker worktree.
- Unknown timeline or facts: the repo cannot prove whether the patch-target mismatch was a one-time command context error or a stable tool/session default.
- Why the unknown remains: only the resulting filesystem/git state is recorded; the lower-level tool target decision is outside repo evidence.

## Detection

- How it was detected: the worker reported the boundary event and root/main cleanup; coordinator then verified root/main status and read `docs/incidents/README.md`, which marks writes outside the assigned worktree as incident-threshold events.
- Evidence:
  - root/main `git status --short --branch` after cleanup returned `## main...origin/main`;
  - assigned worktree contains the intended LAY-26 diff on `codex/m6b-07a-deploy-rollback-runbook-sync`;
  - `docs/specs/M6B-07a-deploy-rollback-runbook-sync.md` and `docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md` record the boundary event.

## Cleanup

- Completed cleanup:
  - extracted the exact patch from root/main;
  - applied that patch to the assigned worktree;
  - reversed the same patch from root/main;
  - verified root/main was clean and still matched `origin/main`.
- Verification:
  - root/main `git status --short --branch`: `## main...origin/main`;
  - root/main `HEAD` and `origin/main`: `b2ca2defe61dac1abe22520eb06e9a33b313dcfb`;
  - assigned worktree validation includes `workspace-isolation` and `worker-write-boundary`.
- Remaining unknowns: no additional hidden root/main writes are indicated by git status; path-agnostic future patch operations remain a known process risk.

## Permanent Controls

- Control: LAY-26 spec allowlist now includes this exact incident file, so the threshold event is recorded in repo evidence rather than only in chat or PR comments.
- Control: before future file edits in worker slices, verify `pwd`, branch and `git status --short --branch` in the assigned worktree, and prefer patch execution from inside the assigned worktree path.
- Control: before PR closeout, run root/main status, assigned worktree status, `workspace-isolation`, and `worker-write-boundary` with explicit `--assigned` and `--root` paths.
- Status: pending merge with LAY-26 PR; existing guards detect the boundary after writes, while the immediate prevention remains operator-side patch target discipline.
- Follow-up spec/PR if any: none proposed unless this pattern recurs in the same milestone after this incident record.

## Evidence Links

- Spec: `docs/specs/M6B-07a-deploy-rollback-runbook-sync.md`
- Evidence: `docs/evidence/M6B/M6B-07a-deploy-rollback-runbook-sync.md`
- Runbook: `docs/runbooks/deploy-rollback.md`
- Related issue: Linear LAY-26
- PR / CI / commit: pending at incident creation

## Owner / AI Boundary

- AI agent responsibility: record the incident, keep root/main clean, keep LAY-26 scoped to docs, run boundary validation and report residual process risk.
- Project owner decision boundary: decide final risk acceptance, release scope, production/staging credentials, real customer/order data, provider costs and compliance.

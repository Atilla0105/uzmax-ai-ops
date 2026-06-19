# M3-11 Pre-M4 Worker Write-Boundary Governance Evidence

> evidence_id: M3-11-pre-m4-worker-write-boundary-governance
> milestone: M3
> status: implemented_validated
> created_at: 2026-06-19
> updated_at: 2026-06-19
> spec: `docs/specs/M3-11-pre-m4-worker-write-boundary-governance.md`
> owner_ai_boundary: Project owner decides final governance risk acceptance and M3 owner signoff. AI agent implements guard/test/docs evidence only and does not claim downstream milestone start, runtime jail, production readiness, real data release, provider release, GA-0 or 1.0 release.
> sensitive_data_status: none included

## Scope

This slice implements the M3-07/M3-09 root/main worktree pollution follow-up as M3 signoff前治理 and pre-M4 governance preparation:

- `scripts/guards/worker-write-boundary.mjs` detects assigned worktree mismatch, missing primary-root discovery, wrong explicit primary-root topology, root/main dirty/ahead/off-main state, unreadable root/main upstream and unreadable root/main git status from a linked worker worktree.
- `scripts/tests/worker-write-boundary.test.mjs` covers normal linked worker pass, assigned mismatch fail, CI explicit assigned mismatch fail, missing primary-root discovery fail, wrong explicit primary-root fail, root off-main fail, root/main dirty fail, root ahead upstream fail, unreadable root upstream fail and unreadable root git status fail.
- `package.json` adds `guard:worker-boundary` and runs it after `guard:workspace` in `npm run check`.
- `AGENTS.md` and `docs/runbooks/worker-worktree-boundary.md` clarify runtime/harness prevention versus in-repo detection/forensics.

This is governance-only preparation and does not indicate downstream milestone start or M4 business capability implementation.

## Preflight Evidence

| Check | Result | Evidence |
|---|---|---|
| `pwd` | pass | `/Users/atilla/Documents/uzmax-m3-11-pre-m4-worker-write-boundary-governance` |
| `git status --short --branch` | pass | `## codex/m3-11-pre-m4-worker-write-boundary-governance...origin/main [ahead 1]` before this residue-only fix |
| `git branch --show-current` | pass | `codex/m3-11-pre-m4-worker-write-boundary-governance` |
| root/main status | pass | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| `node_modules` | installed | Initial check found `node_modules missing`; `npm ci` passed and lockfile was not intentionally edited. npm reported existing audit findings. |
| required source reads | pass | Read `AGENTS.md`, M3 closeout evidence, M3-07/M3-09 incident records, existing `workspace-isolation` guard/test and `package.json`. |

## Boundary Honesty

The new guard is an in-repo detection and evidence control. It can fail when:

- the current git top-level realpath does not match `UZMAX_ASSIGNED_WORKTREE`;
- the configured or discovered root/main checkout is not `main`;
- root/main has tracked or untracked changes;
- root/main is ahead of upstream;
- root/main upstream cannot be read;
- root/main git status cannot be read;
- an explicit primary root is not part of the same git worktree topology as the worker.

It cannot technically prevent every edit tool from writing to an arbitrary absolute path. Prevention must come from runtime/harness sandboxing and operator discipline: absolute assigned paths, tool cwd binding, and repeated root/main clean evidence when tools cannot be jailed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/worker-write-boundary.test.mjs` | pass | 11/11 tests passed, including CI assigned mismatch, missing primary-root discovery, wrong explicit primary-root topology, root off-main, root/main dirty RED forensic case, root ahead upstream, unreadable root upstream and unreadable root git status. |
| `node --test scripts/tests/workspace-isolation.test.mjs scripts/tests/worker-write-boundary.test.mjs` | pass | 18/18 focused workspace and worker-boundary tests passed. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style after scoped formatting. |
| `npm run guard:workspace` | pass | Historical pre-squash run used a superseded pre-rename branch name; active branch evidence is `codex/m3-11-pre-m4-worker-write-boundary-governance`. |
| `npm run guard:worker-boundary` | pass | `worker-write-boundary: ok (codex/m3-11-pre-m4-worker-write-boundary-governance, /Users/atilla/Documents/uzmax-m3-11-pre-m4-worker-write-boundary-governance)`. |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m3-11-pre-m4-worker-write-boundary-governance UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | pass | Explicit assigned/root invocation passed with the active M3-11 worktree and root/main checkout. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-11-pre-m4-worker-write-boundary-governance.md --include-worktree` | pass | Follow-up rename worktree context reports 9 changed files, including old docs path deletion and new M3-11 docs path addition; categories docs 6/config 1/source 1/test 1. |
| `npm run jscpd` | pass | Initially failed on helper duplication; after refactoring only new files, rerun found 0 clones. |
| `npm run test` | pass | First sandboxed run failed with `EPERM` creating `node_modules/.cache/uzmax-api-runtime`; rerun with approved escalation passed 136/136. |
| `npm run lint` | pass | ESLint completed without findings. |
| `npm run check` | pass | Full local gate passed: format, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/worker-boundary/pr-shape guards, 143/143 Node tests, build, size and Playwright 7/7. |
| `git diff --check` | pass | No whitespace errors in worktree diff before final evidence update. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors after commit. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec | pass | Implements only M3-11 pre-M4 governance preparation. |
| Touch list | pass | Intended changes are limited to AGENTS, M3 spec/evidence/runbook, worker boundary guard/test and package script wiring. |
| Concurrent worker isolation | pass | Does not touch `packages/evals/**`, `packages/engine/**`, `packages/llm-gateway/**`, `packages/db/**`, apps, lockfile or generated/dist. |
| Runtime jail claim | pass | Docs and guard output explicitly distinguish detection/forensics from runtime/harness prevention. |
| Sensitive data | pass | No raw/customer/personal/secret material. |
| External API evidence | pass | none; no external provider/SDK/connector/adapter. |
| Exceptions | pass | none. |

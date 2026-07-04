# M7-UI-12A REQ-G01 Runtime Worker Boundary Incident Evidence

## Status

Docs-only incident evidence for the PR #186 / `REQ-G01-group-overview-runtime-contract` root/main patch-target slip.

This evidence does not modify #186, does not approve the REQ-G01 runtime contract, does not implement `group.overview`, and does not approve GA-0, production/staging, owner acceptance or 1.0 release.

## Entry State

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.codex/worktrees/m7-ui-12a-req-g01-runtime-worker-boundary-incident` |
| assigned branch | `codex/m7-ui-12a-req-g01-runtime-worker-boundary-incident` |
| base | `origin/main` at `ef6c40264280b4d5366e0895a2556a08c72b3f54` |
| PR target | `main` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-12a-req-g01-runtime-worker-boundary-incident` |
| entry `git status --short --branch` | `## codex/m7-ui-12a-req-g01-runtime-worker-boundary-incident...origin/main` |
| entry `git branch --show-current` | `codex/m7-ui-12a-req-g01-runtime-worker-boundary-incident` |
| entry HEAD | `ef6c40264280b4d5366e0895a2556a08c72b3f54` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before first write | `## main...origin/main` |
| root/main diff before first write | no output from `git diff --name-only` |
| root/main HEAD before first write | `ef6c40264280b4d5366e0895a2556a08c72b3f54` |
| affected #186 branch not modified by this PR | `codex/req-g01-group-overview-runtime-contract` |
| affected #186 worktree not modified by this PR | `/Users/atilla/.codex/worktrees/req-g01-group-overview-runtime-contract` |

## Sources Read

| Source | Use |
|---|---|
| `AGENTS.md` | Workspace isolation, root/main read-only coordination, incident escalation and PR hygiene rules. |
| `docs/incidents/README.md` | Incident trigger threshold and required record fields; lines 7-15 require recording writes outside assigned worktree. |
| `docs/incidents/INCIDENT-template.md` | Incident field shape. |
| `docs/incidents/INC-2026-07-02-m7-ui-root-patch-target.md` | Similar M7 UI patch-target precedent. |
| `docs/incidents/INC-2026-07-03-m7-ui-11-root-patch-target.md` | Similar M7 implementation patch-target precedent. |
| `docs/specs/M7-06-m7-ui-worker-boundary-incident.md` | Prior docs-only incident spec shape. |
| `docs/evidence/M7/M7-06-m7-ui-worker-boundary-incident.md` | Prior docs-only incident evidence shape. |

## Incident Facts Recorded

- Date: 2026-07-04.
- During the worker for #186 / `REQ-G01-group-overview-runtime-contract`, the worker initially wrote the intended docs to the root/main checkout instead of the assigned #186 worktree.
- Wrong root/main paths touched transiently:
  - `docs/specs/REQ-G01-group-overview-runtime-contract.md`
  - `docs/evidence/M7/REQ-G01-group-overview-runtime-contract.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Content type of the transient root/main writes:
  - new runtime contract spec
  - new M7 evidence
  - README queue/blocker update
  - ledger runtime blocker update
- Detection: the worker self-detected early before commit/push and reported the incident in final output.
- Coordinator verification: `docs/incidents/README.md` lines 7-15 require an incident when a worker writes outside the assigned worktree, including root/main checkout.
- Cleanup: the worker used reverse `apply_patch` only; deleted the two new root files and restored README/ledger text; no `git reset` or `git checkout` was used.
- Root evidence after cleanup:
  - `git status --short --branch` -> `## main...origin/main`
  - `git diff --name-only` -> no output
  - root HEAD -> `ef6c40264280b4d5366e0895a2556a08c72b3f54`
- Impact: transient root/main working-tree write only; no root commit, no staged changes, no remote branch/PR/CI impact, no prototype/user files touched, no known other worktree impact.
- Actual committed #186 changes live only in the assigned #186 worktree/branch.
- Status: `pending_merge`.

## Incident PR Scope

Changed docs paths expected in this PR:

- `docs/specs/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`
- `docs/evidence/M7/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`
- `docs/incidents/INC-2026-07-04-req-g01-runtime-root-patch-target.md`

No source, test, runtime, package/lock, `.github`, `scripts`, backend/API/DB, generated/config, `docs/evidence/M7/README.md`, `docs/admin-ui-page-migration-ledger.md` or binary media paths are in scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch` before first write | pass | `## main...origin/main`. |
| `git -C /Users/atilla/Applications/UZMAX智能运营 diff --name-only` before first write | pass | No output. |
| `git -C /Users/atilla/Applications/UZMAX智能运营 rev-parse HEAD` before first write | pass | `ef6c40264280b4d5366e0895a2556a08c72b3f54`. |
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md --include-worktree` | pass | Reports `changedFiles: 3`, `categories.docs: 3`, source changed files/net LOC/new files all 0. |
| focused forbidden-path check | pass | No `apps`, `packages`, package/lock, `.github`, `scripts`, `docs/evidence/M7/README.md`, `docs/admin-ui-page-migration-ledger.md` or binary media changes. |
| final root/main status | pass | `## main...origin/main`, no root diff/cached diff, HEAD `ef6c40264280b4d5366e0895a2556a08c72b3f54`. |

## Boundary

This incident PR records governance evidence only. It does not modify PR #186, does not change the REQ-G01 runtime contract, does not implement a page, does not create runtime/API behavior, does not open GA-0, does not perform production/staging actions, and does not approve 1.0 release.

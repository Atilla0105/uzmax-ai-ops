# REQ-G01A Worker Boundary Incident Evidence

## Status

Docs-only incident evidence for the PR #188 / `REQ-G01A-group-overview-runtime-implementation` root/main patch-target slip.

This evidence does not modify PR #188, does not approve the REQ-G01A runtime implementation plan, does not implement `group.overview`, and does not approve owner acceptance, visual acceptance, GA-0, production/staging or 1.0 release.

## Entry State

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.codex/worktrees/req-g01a-worker-boundary-incident` |
| assigned branch | `codex/req-g01a-worker-boundary-incident` |
| base | `origin/main` at `4af55f27f849ba197a114b4b76a8830dc3509d0d` / `4af55f2 docs: define REQ-G01 group overview runtime contract (#186)` |
| PR target | `main` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/req-g01a-worker-boundary-incident` |
| entry `git status --short --branch` | `## codex/req-g01a-worker-boundary-incident...origin/main` |
| entry `git branch --show-current` | `codex/req-g01a-worker-boundary-incident` |
| entry HEAD | `4af55f27f849ba197a114b4b76a8830dc3509d0d` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before first incident-record write | `## main...origin/main` |
| root/main diff before first incident-record write | no output from `git diff --name-only` |
| root/main HEAD before first incident-record write | `4af55f2` |
| affected #188 branch not modified by this PR | `codex/req-g01a-group-overview-runtime-implementation-spec` |
| affected #188 worktree not modified by this PR | `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec` |

## Sources Read

| Source | Use |
|---|---|
| `AGENTS.md` | Workspace isolation, root/main read-only coordination, incident escalation and PR hygiene rules. |
| `docs/incidents/README.md` | Incident trigger threshold and required record fields. |
| `docs/incidents/INCIDENT-template.md` | Incident field shape. |
| `docs/incidents/INC-2026-07-04-req-g01-runtime-root-patch-target.md` | Similar REQ-G01 runtime root patch-target precedent. |
| `docs/specs/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md` | Prior docs-only incident spec shape. |
| `docs/evidence/M7/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md` | Prior docs-only incident evidence shape. |
| `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec/docs/specs/REQ-G01A-group-overview-runtime-implementation.md` | Read-only affected PR #188 scope and boundaries. |
| `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec/docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md` | Read-only affected PR #188 incident statement and validation facts. |

## Incident Facts Recorded

- Date: 2026-07-04.
- PR #188: `https://github.com/Atilla0105/uzmax-ai-ops/pull/188`
- PR #188 title: `docs: plan REQ-G01A group overview runtime implementation`
- PR #188 branch: `codex/req-g01a-group-overview-runtime-implementation-spec`
- PR #188 commit: `f18a7e9c6edb9818f5fa4087c3910304206db003`
- PR #188 changed four docs files only:
  - `docs/specs/REQ-G01A-group-overview-runtime-implementation.md`
  - `docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Worker self-reported: `One concern is recorded in evidence: there was an initial patch-target slip into root/main, immediately cleaned; final diff/commit/push were only from the assigned worktree.`
- PR #188 evidence says:
  - root/main was inspected read-only only;
  - writes were transferred to the assigned worker worktree after an initial patch-target slip;
  - an initial patch accidentally landed in root/main;
  - the same docs content was reapplied to the assigned worktree;
  - root/main was cleaned before validation.
- Coordinator verified root/main currently clean: `git status --short --branch` -> `## main...origin/main`; `git diff --name-only` -> no output.
- Incident trigger: `docs/incidents/README.md` requires an incident for writes outside assigned worktree, including root/main checkout.
- Status: `pending_merge`.

## Impact

- Actual impact: transient root/main working-tree write reported by #188 worker and evidence.
- Known affected scope: docs content for the PR #188 runtime-implementation planning slice.
- Actual committed/pushed PR #188 scope: assigned #188 worktree/branch only, four docs files only.
- Potential impact: if unnoticed, root/main could have retained docs changes outside the assigned #188 branch/worktree, weakening branch isolation and M7 evidence trust.
- Not observed / not claimed:
  - no root/main commit;
  - no root/main diff remains now;
  - no source/runtime/DB/API/admin code implementation;
  - no package/lock/config/generated/test/binary media changes in this incident PR;
  - no known #188 worktree edits by this incident PR;
  - no known secret/customer data exposure;
  - no production/staging action;
  - no GA-0, owner acceptance, visual acceptance or 1.0 release approval.

## Cleanup And Unknowns

- Completed cleanup reported by #188 evidence: the same docs content was reapplied to assigned #188 worktree and root/main was cleaned before validation.
- Coordinator verification before this incident-record worker: root/main status was `## main...origin/main` and root diff had no output.
- Incident-record worker execution note: the first attempt to create this incident record also briefly created these same three new docs files as untracked files in root/main because the patch target resolved to the root checkout; the worker detected it immediately from `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch`, deleted only those three untracked files with reverse `apply_patch`, then wrote the files by absolute path into the assigned incident worktree.
- Remaining unknowns:
  - repo evidence does not prove the exact duration of the temporary root/main dirty state;
  - repo evidence does not prove the lower-level patch-tool target transition;
  - no transient filesystem artifacts outside git-tracked/untracked status are currently known.

## Permanent Controls

- Future worker prompts must require assigned worktree `pwd`, branch and status checks immediately before the first `apply_patch`.
- Coordinator must treat any reported root/main transient write as an incident before marking the affected worker PR ready or merging it.
- Affected worker evidence must include assigned worktree path/branch/HEAD, root/main status and root/main diff state.
- Status: recorded in this incident PR; not yet enforced by tooling.
- Follow-up guard/tooling changes are out of scope for this docs-only incident PR.

## Incident PR Scope

Changed docs paths expected in this PR:

- `docs/specs/REQ-G01A-worker-boundary-incident.md`
- `docs/evidence/M7/REQ-G01A-worker-boundary-incident.md`
- `docs/incidents/INC-2026-07-04-req-g01a-root-patch-target.md`

No source, test, runtime, package/lock, `.github`, `scripts`, backend/API/DB, generated/config, `docs/evidence/M7/README.md`, `docs/admin-ui-page-migration-ledger.md` or binary media paths are in scope.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch` before first incident-record write | pass | `## main...origin/main`. |
| `git -C /Users/atilla/Applications/UZMAX智能运营 diff --name-only` before first incident-record write | pass | No output. |
| `git -C /Users/atilla/Applications/UZMAX智能运营 rev-parse --short HEAD` before first incident-record write | pass | `4af55f2`. |
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01A-worker-boundary-incident.md --include-worktree` | pass | Reports `changedFiles: 3`, category `docs: 3`, source changed files/net LOC/new files all 0. |
| focused forbidden-path check | pass | Changed path list contained only `docs/specs/REQ-G01A-worker-boundary-incident.md`, `docs/evidence/M7/REQ-G01A-worker-boundary-incident.md`, `docs/incidents/INC-2026-07-04-req-g01a-root-patch-target.md`; inverted allow-list check had no output. |
| final root/main status and diff | pass | `## main...origin/main`; root `git diff --name-only` had no output. |
| incident-record worker root/main cleanup after its own patch-target slip | pass | Root/main returned to `## main...origin/main` and `git diff --name-only` had no output before validation continued. |

## Boundary

This incident PR records governance evidence only. It does not modify PR #188, does not change the REQ-G01A runtime implementation plan, does not implement a page, does not create runtime/API behavior, does not open GA-0, does not perform production/staging actions, does not approve owner acceptance, does not use known secret/customer data, and does not approve 1.0 release.

# M7-06 M7 UI Worker Boundary Incident Evidence

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/.codex/worktrees/m7-06-m7-ui-worker-boundary-incident/UZMAX智能运营` |
| worker branch | `codex/m7-06-m7-ui-worker-boundary-incident` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/m7-06-m7-ui-worker-boundary-incident/UZMAX智能运营` |
| entry `git status --short --branch` | `## codex/m7-06-m7-ui-worker-boundary-incident` |
| entry `git branch --show-current` | `codex/m7-06-m7-ui-worker-boundary-incident` |

## Sources Read

| Source | Use |
|---|---|
| `AGENTS.md` | Workspace isolation and incident escalation rule. |
| `docs/incidents/README.md` | Incident trigger threshold and required fields. |
| `docs/incidents/INCIDENT-template.md` | Incident format. |
| `docs/incidents/INC-2026-06-29-m7-03-root-patch-target.md` | Prior M7 patch-target precedent. |
| `docs/evidence/M7/M7-UI-00A-fixture-sanitization-map.md` | Worker 00A root patch-target repair evidence. |
| `docs/evidence/M7/M7-UI-00B-token-foundation-contract.md` | Worker 00B root patch-target repair evidence. |

## Findings

- Worker 00A reported that its first `apply_patch` invocation created the intended fixture-map docs in root/main before cleanup and worker-local regeneration.
- Worker 00B reported that its first `apply_patch` created token-foundation docs in root/main before the files were moved or recreated in the assigned worktree.
- Root/main was rechecked by the coordinator after worker completion and returned `## main...origin/main`.
- The repeated failure mode matches `docs/incidents/README.md`: writing to root/main checkout / outside assigned worktree.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git status --short --branch` | pass | Incident worktree only has the three intended docs files after creation. |
| root/main `git status --short --branch` | pass | `## main...origin/main`. |
| `git diff --check` | pass | No whitespace errors. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base codex/m7-05-prototype-visual-source-reset --spec docs/specs/M7-06-m7-ui-worker-boundary-incident.md --include-worktree` | pass | `changedFiles: 3`, categories `docs: 3`, source changed files `0`, source net LOC `0`, new source files `0`. |

## Open Items

- This slice records the incident and establishes coordinator control; it does not change `apply_patch` tooling.
- Future worker prompts should require absolute file-path patching or worker-local shell patching plus immediate root/main status verification when `apply_patch` is involved.
- Open PR state cannot be checked through `gh` in this shell because `gh` is not installed.

## Boundary

This slice does not approve source changes, UI migration, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.

# M7-UI-03 Page Migration Ledger And Router Evidence

## Entry State

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router`
- Branch: `codex/m7-ui-03-page-migration-ledger-router`
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营` root/main.
- Root/main was used only to create the assigned worktree and fetch current `main`.

Required preflight:

```text
$ pwd
/Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router

$ git status --short --branch
## codex/m7-ui-03-page-migration-ledger-router

$ git branch --show-current
codex/m7-ui-03-page-migration-ledger-router

$ git branch --no-merged main
(no output)
```

`gh pr list --state open` was attempted during branch hygiene review but `gh` is not installed in this shell:

```text
zsh:1: command not found: gh
```


## Write-Boundary Incident And Cleanup

During the first implementation attempt, the harness `apply_patch` invocation wrote the intended M7-UI-03 draft files to the forbidden root/main checkout instead of the assigned worktree. I stopped at `BLOCKED` before validation or commit.

Coordinator cleanup result, reported on 2026-07-03:

```text
/Users/atilla/Applications/UZMAX智能运营
## main...origin/main
```

Coordinator preserved incident evidence outside the repo:

- `/tmp/uzmax-m7-ui-03-incident/tracked-root-pollution.patch`
- `/tmp/uzmax-m7-ui-03-incident/untracked-root-pollution.tgz`

Resume control used for this implementation:

- All commands use the assigned worktree path through `workdir` and/or `git -C /Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router`.
- No `apply_patch` is used after resume.
- Tracked draft changes were restored with `git -C /Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router apply /tmp/uzmax-m7-ui-03-incident/tracked-root-pollution.patch`.
- Untracked draft files were restored with `tar -xzf /tmp/uzmax-m7-ui-03-incident/untracked-root-pollution.tgz -C /Users/atilla/.codex/worktrees/m7-ui-03-page-migration-ledger-router`.

Permanent control recorded for this incident: worker implementation edits must use the assigned worktree path explicitly; do not use `apply_patch` unless the harness demonstrably targets the assigned worktree.

Incident record: `docs/incidents/INC-2026-07-03-m7-ui-03-root-write-boundary.md`.

## Required Reads

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/impeccable/reference/product.md`
- `docs/specs/M7-05-prototype-visual-source-reset.md`
- `docs/specs/M7-UI-00-prototype-migration-index.md`
- `docs/specs/M7-UI-00A-fixture-sanitization-map.md`
- `docs/specs/M7-UI-00B-token-foundation-contract.md`
- `docs/specs/M7-UI-01-foundation-layer.md`
- `docs/specs/M7-UI-02-icon-shell-calibration.md`
- `docs/admin-ui-prototype-migration-index.md`
- `docs/admin-ui-token-foundation-contract.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/App.tsx`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/patterns/index.tsx`
- `apps/admin/src/primitives/index.tsx`
- read-only source lists under `/Users/atilla/源码/unpacked 6` and `/Users/atilla/源码/unpacked 6/pages`

Impeccable setup:

- `node .agents/skills/impeccable/scripts/context.mjs --target apps/admin` failed because plain `node` is not on PATH.
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/context.mjs --target apps/admin` succeeded and reported register `product`.
- Product register guidance was accepted: restrained product UI, density, standard controls, clear states, no decorative page motion or display styling.

## `rg` Before New Source Files

Command:

```text
rg -n "activeNav|NavItem|PageState|legacy|evidence|route|pages|AppShell|data-testid=\"admin-shell\"|group-layer|tenant-layer" apps/admin/src apps/admin/tests docs/admin-ui-prototype-migration-index.md docs/admin-ui-token-foundation-contract.md
```

Findings:

- `apps/admin/src/shell/AppShell.tsx` owns private `activeNav` state and never exposes a page outlet contract.
- `apps/admin/src/App.tsx` renders all M2-M6 legacy evidence content at once.
- `apps/admin/src/pages` did not exist before this slice.
- `apps/admin/src/patterns/index.tsx` already provides `PageState`, so planned routes can render a clear scaffold without adding page-local styling.
- Existing `App.tsx` and `AppShell.tsx` cannot hold all route/ledger contracts alone without mixing governance ledger data, nav identity and outlet rendering into shell/application glue. A small `apps/admin/src/pages/**` registry is the correct admin-internal ownership boundary.

## Design / Spec Decisions

| Decision | Result | Reason |
|---|---|---|
| Initial route | `legacy.evidence` | Preserves existing M2-M6 evidence visibility and current tests. |
| Planned pages | scaffold only | M7-UI-03 explicitly forbids page content migration. |
| Registry location | `apps/admin/src/pages/**` | Existing page layer was absent and the migration index reserves this layer for page contracts. |
| Styling | existing classes and `PageState` only | Avoid page-local styling and shared pattern changes in this slice. |
| Legacy route nav exposure | reachable from scaffold action, not added as a 20th nav item | Keeps the shell nav to the 19 planned IA pages while preserving explicit legacy route reachability. |

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | `pass` | No whitespace errors. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-03-page-migration-ledger-and-router.md --include-worktree` | `pass` | Reported `changedFiles: 10`, categories `source: 4`, `docs: 5`, `test: 1`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | `blocked_by_local_tooling` | Failed with `MODULE_NOT_FOUND` for `node_modules/typescript/lib/tsc.js`; this isolated worktree has no `node_modules`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | `blocked_by_local_tooling` | Failed with `MODULE_NOT_FOUND` for `node_modules/vite/bin/vite.js`; this isolated worktree has no `node_modules`. |
| `npx playwright test apps/admin/tests/m7-ui-page-router.spec.ts` | `blocked_by_local_tooling` | Failed with `zsh:1: command not found: npx`. |

Additional tooling check:

```text
$ command -v npm && npm --version
(no output; exit 1)
```

The requested dependency-backed validations could not be completed in this worker shell because `npm`, `npx` and local `node_modules` are unavailable. The implementation did not borrow root/main dependencies to preserve worker isolation.

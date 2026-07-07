# M7-UI-99 Group Overview Source Copy Parity Evidence

> Status: draft evidence for PR review.
> Spec: `docs/specs/M7-UI-99-group-overview-source-copy-parity.md`
> Branch: `codex/m7-ui-99-group-overview-source-copy-parity`
> Base: `origin/codex/m7-ui-31-orders-visible-ui`
> Worker path:
> `/Users/atilla/.codex/worktrees/m7-ui-99-group-overview-source-copy-parity`

This slice repairs one copy-parity mismatch in the `group.overview` fallback rows:
row-local business-line sublabels, eval labels, order labels and last-exception
copy now match the unpacked group overview fixture while the global result label
and runtime note still disclose `mock/degraded`, unavailable aggregate runtime
and not-production metrics.

This evidence does not claim owner visual acceptance, group aggregate runtime
closure, DB/API/authz wiring, production metrics, GA-0, production readiness or
1.0 release approval.

## Pre-Write / Pre-Cleanup State

Assigned worktree precheck:

```text
pwd
/Users/atilla/.codex/worktrees/m7-ui-99-group-overview-source-copy-parity

git status --short --branch --untracked-files=all
## codex/m7-ui-99-group-overview-source-copy-parity...origin/codex/m7-ui-31-orders-visible-ui
 M apps/admin/src/pages/group/groupOverviewFallback.ts
?? apps/admin/tests/m7-ui-99-group-overview-source-copy-parity.spec.ts
?? docs/incidents/INC-2026-07-07-m7-ui-99-root-worktree-write.md
?? docs/specs/M7-UI-99-group-overview-source-copy-parity.md
?? node_modules

git branch --show-current
codex/m7-ui-99-group-overview-source-copy-parity

git rev-parse --short HEAD
89eac31
```

Root/main coordination checkout read-only status at takeover:

```text
## main...origin/main
?? apps/admin/src/pages/knowledge/KnowledgePage.css
?? apps/admin/src/pages/team/teamFallback.ts
?? apps/admin/tests/m7-ui-tenant-entry-topbar.spec.ts
?? docs/evidence/M7/M7-UI-62-tenant-entry-topbar-parity.md
?? docs/specs/M7-UI-32-knowledge-resources-page.md
?? docs/specs/M7-UI-62-tenant-entry-topbar-parity.md
```

Local generated artifact cleanup:

```text
lrwxr-xr-x@ 1 atilla  staff  86 Jul  7 06:31 node_modules -> /Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity/node_modules
removed node_modules symlink only
```

The symlink target was not removed or modified by this worker.

## Source Refs

| Source | Evidence Use |
| --- | --- |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Owner HTML render sample and screenshot artifact. |
| `/Users/atilla/源码/unpacked 6/fixtures/group.ts` | Exact row copy source for the four visible group overview rows. |
| `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx` | Confirms the unpacked page renders `r.line`, `r.eval`, `r.order` and `r.last` directly. |
| `apps/admin/src/pages/group/groupOverviewFallback.ts` | Centralized React fallback row copy updated in this slice. |

Owner HTML caveat: the local owner HTML default render sample is
conversation-first and did not expose the group overview row strings in body
text. The unpacked `fixtures/group.ts` file provides the exact group row copy,
and the unpacked `GroupOverviewPage.tsx` shows those fixture fields are rendered
directly.

## Accepted Copy

| Row | Business line | Eval | Order | Last copy |
| --- | --- | --- | --- | --- |
| 玉珠跨境美妆 | 美妆 · 中亚 | 阻断 | 降级 | 退款红线 · 9分钟前 |
| 丝路数码 | 3C · 俄语区 | 通过 | 正常 | 成本超预算 · 1小时前 |
| 天净家居 | 家居 · 哈萨克 | 运行中 | 故障 | connector 故障 · 22分钟前 |
| 白桦母婴 | 母婴 · 俄语区 | 通过 | 正常 | AI 熔断 · 3小时前 |

Row-local cells were checked to avoid `mock` or `degraded`; global disclosure
remains in `m7-group-overview-result-label` and
`m7-group-overview-runtime-note`.

## Artifacts

Artifacts under `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/`:

| Artifact | Path |
| --- | --- |
| Source mapping JSON | `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/source-copy-mapping.json` |
| Owner HTML sample JSON | `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/owner-html-source-sample.json` |
| Owner HTML screenshot | `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/owner-html-group-overview-source-sample.png` |
| React desktop screenshot | `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/react-group-overview-source-copy-1280x840.png` |
| React mobile screenshot | `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/react-group-overview-source-copy-mobile-320.png` |
| React metrics | `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/metrics.json` |
| Temporary admin build | `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/admin-dist/` |

Metrics summary from `metrics.json`:

```text
desktop.activePageId: group.overview
desktop.shellLevel: group
desktop.rowCount: 4
desktop.rowLocalMockOrDegraded: false
desktop.globalResultHasMockDisclosure: true
desktop.runtimeHasNotProductionDisclosure: true
desktop.bodyScrollWidth: 1280

mobile.activePageId: group.overview
mobile.shellLevel: group
mobile.rowCount: 4
mobile.rowLocalMockOrDegraded: false
mobile.globalResultHasMockDisclosure: true
mobile.runtimeHasNotProductionDisclosure: true
mobile.bodyScrollWidth: 320
```

## Incident Cleanup Evidence

Incident record:
`docs/incidents/INC-2026-07-07-m7-ui-99-root-worktree-write.md`.

The incident records the previous worker's accidental root/main untracked spec
write, cleanup by moving the spec to the assigned worktree, and the permanent
control that resumed UI-99 writes stay pinned to the assigned worktree path.

Current worker cleanup:

- confirmed root/main status before writes showed only the pre-existing
  unrelated untracked files listed above;
- removed only the assigned worktree's untracked `node_modules` symlink;
- did not touch owner HTML, unpacked source, root/main files, symlink target,
  backend/API/DB/package/lock/config/shared shell/topbar/sidebar/tokens,
  primitives or patterns.

## Validation Log

Initial validation before symlink cleanup:

| Command | Status | Output |
| --- | --- | --- |
| `git diff --check` | pass | exit 0 |
| `node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/group/groupOverviewFallback.ts apps/admin/tests/m7-ui-99-group-overview-source-copy-parity.spec.ts docs/incidents/INC-2026-07-07-m7-ui-99-root-worktree-write.md docs/specs/M7-UI-99-group-overview-source-copy-parity.md` | pass | `All matched files use Prettier code style!` |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-99-group-overview-source-copy-parity.md --include-worktree` | fail before cleanup | `guard:pr-shape failed: out-of-scope file: node_modules` |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-99-group-overview-source-copy-parity.spec.ts` | fail before manual preview | `Process from config.webServer was not able to start. Exit code: 127`; webServer stderr `/bin/sh: npm: command not found` |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir --outDir /tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/admin-dist` | pass | `✓ built in 114ms`; large chunk warning only |
| manual preview + focused Playwright | pass | `6 passed (1.4s)` |

Final validation after removing the symlink is recorded below after the rerun.

| Command | Final Status | Output |
| --- | --- | --- |
| `git status --short --branch --untracked-files=all` | pass | branch `codex/m7-ui-99-group-overview-source-copy-parity` tracking `origin/codex/m7-ui-31-orders-visible-ui`; only the 6 intended changed files were present; no `node_modules`, dist, test-results or temp artifacts in worktree status |
| `git diff --check` | pass | exit 0 |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity/node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/group/groupOverviewFallback.ts apps/admin/tests/m7-ui-99-group-overview-source-copy-parity.spec.ts docs/evidence/M7/README.md docs/evidence/M7/M7-UI-99-group-overview-source-copy-parity.md docs/incidents/INC-2026-07-07-m7-ui-99-root-worktree-write.md docs/specs/M7-UI-99-group-overview-source-copy-parity.md` | pass | `All matched files use Prettier code style!` |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-99-group-overview-source-copy-parity.md --include-worktree` | pass | no PR existed yet; `changedFiles=6`; categories `source=1`, `docs=4`, `test=1`; source `changedFiles=1`, `netLoc=0`, `newFiles=0` |
| `NODE_PATH=/Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity/node_modules /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity/node_modules/vite/bin/vite.js build --config /tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/vite.config.mjs --emptyOutDir` | pass | built `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/admin-dist`; `✓ built in 102ms`; existing large chunk warning and Vite optional `esbuild` unresolved-import warning only |
| `NODE_PATH=/Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity/node_modules /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity/node_modules/vite/bin/vite.js preview --config /tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/vite.config.mjs --host 127.0.0.1 --port 4179 --strictPort` plus `NODE_PATH=/Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity/node_modules NODE_OPTIONS="--loader /tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/playwright-module-loader.mjs" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity/node_modules/@playwright/test/cli.js test --config /tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/playwright.config.mjs apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-99-group-overview-source-copy-parity.spec.ts` | pass | manual preview served `/tmp` dist at `http://127.0.0.1:4179`; `6 passed (1.4s)`; Node loader and `NO_COLOR`/`FORCE_COLOR` warnings only |
| `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch --untracked-files=all` | pass | read-only root/main status unchanged: `## main...origin/main` plus the pre-existing untracked `apps/admin/src/pages/knowledge/KnowledgePage.css`, `apps/admin/src/pages/team/teamFallback.ts`, `apps/admin/tests/m7-ui-tenant-entry-topbar.spec.ts`, `docs/evidence/M7/M7-UI-62-tenant-entry-topbar-parity.md`, `docs/specs/M7-UI-32-knowledge-resources-page.md`, `docs/specs/M7-UI-62-tenant-entry-topbar-parity.md` |

## PR Hygiene

- Source changed files: 1.
- Source net LOC: 0 (`14 insertions`, `14 deletions` in
  `apps/admin/src/pages/group/groupOverviewFallback.ts`).
- New source files: 0.
- Test files: one new focused Playwright spec.
- Docs files: spec, incident, evidence and M7 README index.
- Generated, lock, config, backend, API, DB, package, shared shell/topbar,
  sidebar, tokens, primitives and patterns changes: none.
- Test weakening: none.
- External API/SDK/provider/connector/adapter basis: none.

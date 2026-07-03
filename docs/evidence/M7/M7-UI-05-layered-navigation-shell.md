# M7-UI-05 Layered Navigation Shell Evidence

## Status

Spec-only evidence stub for `M7-UI-05-layered-navigation-shell`.

This PR creates the foundation contract for splitting AppShell/navigation into group layer and tenant layer. It updates the M7 queue and page migration ledger, but does not implement React, route rendering, API hooks, tests, CSS, backend/API/runtime contracts, authz, DB changes, package/lock changes, CI/global config, screenshots or fixture imports.

This is not M7 closeout, owner acceptance, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-05-layered-navigation-shell-spec` |
| worker branch | `codex/m7-ui-05-layered-navigation-shell-spec` |
| worker status at entry | `## codex/m7-ui-05-layered-navigation-shell-spec...origin/main` |
| worker HEAD / origin main | `da33a089663e4547ba3a2ffd56928f8a7cddec04` / `da33a089663e4547ba3a2ffd56928f8a7cddec04` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status at entry | `## main...origin/main` |
| root/main branch | `main` |
| `git branch --no-merged main` at entry | `+ codex/m7-ui-11-release-acceptance-page-impl` |
| open PR audit | `gh` unavailable; equivalent GitHub REST audit completed. The open PR list returned only PR #178 (`codex/m7-ui-11-release-acceptance-page-impl` -> `main`, open, non-draft). |

Queue/concurrency note:

- PR #178 is the current `M7-UI-11` release page implementation PR and is blocked/pending as a page-body candidate because the shared AppShell still renders mixed group+tenant navigation.
- PR #178 touches source/tests and shared M7 docs. This docs-only UI-05 spec has no source/test path overlap; if README/ledger lines conflict later, rebase and preserve both boundary notes.

## Required Reads / Mapping

Required reads completed before drafting:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/specs/M7-UI-03-page-migration-ledger-and-router.md`
- `docs/specs/M7-UI-11-release-acceptance-page.md`
- `docs/evidence/M7/M7-UI-11-release-acceptance-page.md`
- owner prototype shell sources under `/Users/atilla/源码/unpacked 6`
- owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`
- current AppShell, registry, App and focused admin tests under `apps/admin`
- Impeccable project context and product register; detector baseline on current shell files.

Owner-rule summary:

- Admin/home starts in group layer.
- Selecting a tenant enters tenant layer.
- Group sidebar contains only group pages.
- Tenant sidebar contains only tenant pages.
- Group release page is a group page and must not show tenant nav.
- A tenant page such as confirmation queue must not show group nav as primary sidebar.

Source mapping:

| Source | Finding |
|---|---|
| `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx` | Uses route `level: "group" \| "tenant"` and chooses `GROUP_NAV` or `TENANT_NAV` based on that level. |
| `/Users/atilla/源码/unpacked 6/shell/navigation.ts` | Defines separate group and tenant nav arrays. |
| `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx` | Topbar supports breadcrumb/back-to-group and tenant switcher as transition affordance. |
| `/Users/atilla/源码/unpacked 6/App.tsx` | Dispatches group pages only under group level and tenant pages only under tenant level. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Packaged owner HTML contains the same `level`, group/tenant nav, `g_release` and release-page vocabulary; use as visual baseline. |
| `apps/admin/src/shell/AppShell.tsx` | Current blocker: renders both `groupNav` and `tenantNav` in one sidebar. |
| `apps/admin/src/pages/registry.ts` | Contains group/tenant page metadata, but current shell does not use active layer to render exactly one nav set. |
| `apps/admin/tests/m7-ui-page-router.spec.ts` | Current test protects legacy mixed evidence route and must be rewritten for future layer-specific assertions. |

Impeccable/design-skill note:

- Adopted: product-register guidance for trusted, dense, standard admin navigation; current layer recognition and status-first hierarchy.
- Detector baseline: `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/shell/AppShell.tsx apps/admin/src/shell/AppShell.css` returned one current warning, `layout-transition` at `apps/admin/src/shell/AppShell.css:20` (`transition: width`). This docs-only PR does not change CSS; future shell implementation should avoid adding motion debt and should record whether the baseline is fixed or left unchanged.
- Rejected: mixed sidebar, CSS-hidden tenant pages that remain accessible as group nav, old `--uzmax-*` as visual source, and any full parity claim without screenshots.

## Incident Note

One `apply_patch` invocation initially targeted root/main `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned worktree. The accidental root edits were limited to intended docs paths, detected before validation/commit, recreated in the assigned worktree, and cleaned from root/main. Because `docs/incidents/README.md` requires recording writes outside the assigned worktree, this PR includes `docs/incidents/INC-2026-07-03-m7-ui-05-root-patch-target.md`.

## Spec Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-05-layered-navigation-shell.md` | Defines route model, page mapping, navigation rules, visual parity contract, runtime boundaries, future touch list, tests/evidence and PR #178 relationship. |
| `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md` | Records this spec-only evidence stub. |
| `docs/evidence/M7/README.md` | Adds UI-05 to the execution queue as spec-ready/pending PR review and records the queue boundary. |
| `docs/admin-ui-page-migration-ledger.md` | Records UI-05 as a foundation blocker before broad page migration/full shell parity. |
| `docs/incidents/INC-2026-07-03-m7-ui-05-root-patch-target.md` | Records the root patch-target incident, impact, cleanup and controls. |

## Runtime / Contract Notes

- No implementation is included.
- Future route state must model `level: group | tenant`.
- Future `group.release` visual/IA parity remains blocked until group-only nav exists.
- Future tenant pages such as `tenant.queue` must render with tenant-only nav.
- If new backend/API/authz contracts are required, implementation must stop and split a separate spec.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-05-layered-navigation-shell.md --include-worktree` | pass | Reports 5 changed docs files; source changed files/net LOC/new files all 0. |
| `git status --porcelain` | pass | Only 5 docs paths changed: spec, evidence, incident, M7 README and page ledger. |
| focused source/test/config/binary checks | pass | No `apps/admin`, `packages`, package/lock, `.github`, `scripts` or binary media changes/untracked files. |
| root/main status clean | pass | `/Users/atilla/Applications/UZMAX智能运营` returned `## main...origin/main` after cleanup. |

## Boundary

This evidence does not approve shell implementation, page implementation, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.

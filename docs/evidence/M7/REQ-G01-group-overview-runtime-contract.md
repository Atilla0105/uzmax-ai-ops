# REQ-G01 Group Overview Runtime Contract Evidence

## Status

Docs-only evidence for `REQ-G01-group-overview-runtime-contract`.

This slice defines the runtime/API/DB contract required before `group.overview` / 集团总览 may render populated REQ-G01 aggregate data. It does not implement React pages, DB migrations, Prisma models/views, NestJS controllers/services, admin ApiClients/hooks, tests, runtime queries, CSS, package/lock changes, CI/config changes, owner acceptance, GA-0, production or 1.0 release.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/req-g01-group-overview-runtime-contract` |
| worker branch | `codex/req-g01-group-overview-runtime-contract` |
| worker status at entry | `## codex/req-g01-group-overview-runtime-contract...origin/main` |
| worker HEAD | `ef6c40264280b4d5366e0895a2556a08c72b3f54` / `docs: add M7 group overview page spec (#185)` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head before worktree creation | `## main...origin/main`; `ef6c40264280b4d5366e0895a2556a08c72b3f54` |
| root/main boundary | Root/main was used only for read/fetch/worktree creation; docs edits were made only in the assigned worktree. |

## GitHub State

Verified before creating this PR with bundled `gh`:

| Item | State |
|---|---|
| Open PRs | #182 `Implement M7 conversation workbench page` and #178 `Paused: transitional M7 release acceptance page`; both Draft, both targeting `main`. |
| PR #184 | `MERGED`; merge commit `d7ea07154b6c39d955d26783e1e7bcf021526113`; records M7 page visual acceptance notes. |
| PR #185 | `MERGED`; merge commit `ef6c40264280b4d5366e0895a2556a08c72b3f54`; adds M7 group overview page spec as docs-only planning. |

## Process Incident Reference

- The process incident for the initial root/main patch target slip is merged via PR #187 / commit `7045967` at `docs/incidents/INC-2026-07-04-req-g01-runtime-root-patch-target.md`.
- This reference is process evidence only. It does not change #186 scope, does not implement runtime/API/DB/admin code, and does not approve owner acceptance, runtime closure, GA-0, production or 1.0 release.

## Required Reads / Mapping

- `AGENTS.md`
- `docs/specs/M7-UI-12-group-overview-page.md`
- `docs/evidence/M7/M7-UI-12-group-overview-page.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`

Read-only explorer code references:

| Reference | Finding |
|---|---|
| `apps/admin/src/pages/registry.ts:39-51` | `group.overview` exists as a registry row, still `status: "not_started"` and points at the older placeholder target spec. |
| `apps/admin/src/pages/PageOutlet.tsx:20-34` | Only legacy evidence and `tenant.queue` get concrete route handling. |
| `apps/admin/src/pages/PageOutlet.tsx:36-91` | All other pages, including `group.overview`, render the planned-page scaffold. |
| `apps/admin/src/App.tsx:17-50` | Tenant list is a local const array with demo labels/statuses. |
| `apps/admin/src/App.tsx:52-92` | Selected tenant/routing are React local state, not backend authority. |
| `apps/admin/src/App.tsx:218-229` | Local tenants are passed into `AppShell`. |
| `apps/admin/src/shell/AppShell.tsx:52-69` | Shell derives selected tenant from props. |
| `apps/admin/src/shell/AppShell.tsx:143-157` | Tenant switcher options are local props. |
| `apps/admin/src/shell/AppShell.tsx:243-257` | Shell creates frontend routes from selected ids. |
| `apps/api/src/**` inventory | Existing controllers include confirmation queue and conversation ticket; no `group-overview` controller/service/repository/contracts path exists. |
| `apps/admin/src/**` `rg` | Existing ApiClients cover other features; no `groupOverview`, `GroupOverview` or `group-overview` aggregate client/hook exists. |

## Spec Summary

| Path | Summary |
|---|---|
| `docs/specs/REQ-G01-group-overview-runtime-contract.md` | Defines aggregate-only DTO, auth/RLS boundary, data provenance, state semantics, page dependency and future implementation validation plan for REQ-G01 group overview runtime. |
| `docs/evidence/M7/REQ-G01-group-overview-runtime-contract.md` | Records this docs-only evidence, explorer findings, GitHub state and validation results. |
| `docs/evidence/M7/README.md` | Adds REQ-G01 runtime contract to the M7 queue and marks it as the blocker before a populated group overview page. |
| `docs/admin-ui-page-migration-ledger.md` | Points `group.overview` runtime blocker at this spec and preserves no-implementation/no-runtime-closure language. |

## Boundary / No-Claim Notes

- #184 and #185 are merged into `main`; this PR does not reopen or reinterpret their visual/source-baseline and docs-only conclusions.
- #178 and #182 remain the only open PRs verified before this PR was created; both are Draft and not merged.
- `M7-UI-12-group-overview-page` remains a page-planning spec. This REQ-G01 spec is the runtime contract precondition for real aggregate data.
- A page worker may only render a populated health strip/table after this contract or an equivalent owner/coordinator-approved runtime contract exists and is implemented.
- Without that runtime path, the page may only render an honest degraded/read-only shell and must not use fixtures, AppShell local tenant state or LLM-generated numbers as truth.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace output after rebase onto `origin/main` commit `7045967`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01-group-overview-runtime-contract.md --include-worktree` | pass | After rebase, reported `changedFiles: 4`, category `docs: 4`, source changed files `0`, source net LOC `0`, new source files `0`. |

## Final Boundary

This evidence does not approve page implementation, runtime implementation, DB/API source changes, owner acceptance, visual acceptance, M7 closeout, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.

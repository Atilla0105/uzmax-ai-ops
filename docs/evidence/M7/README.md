# M7 Evidence

M7 tracks two post-M6B documentation/governance lanes:

- current-state release/doc/admin-gate alignment after M6B closure;
- the UZMAX Design Skill Layer and visual system: repo-scoped design context, M7-03 admin design-system extraction, M7-05 prototype visual-source reset, Impeccable installation evidence, detector baseline, admin UX map and follow-up UI slice recommendations.

M7 does not approve GA-0, production deployment, real customer/order-data use, customer LLM, external SaaS onboarding, Telegram Business automatic reply or 1.0 release.

## Source Of Truth

| Scope | Source |
|---|---|
| Product scope | `UZMAX智能运营系统-PRD-v1.1.md` |
| Technical boundary | `UZMAX智能运营系统-技术架构-v1.1.md` |
| Admin experience | `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` |
| Acceptance blockers | `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` |
| Project rules | `AGENTS.md` |
| Design execution context | `docs/admin-design-system.md`, `PRODUCT.md`, `DESIGN.md` |
| M7 design-layer spec | `docs/specs/M7-00-uzmax-design-skill-layer.md` |
| M7 current-state alignment spec | `docs/specs/M7-01-current-state-release-doc-alignment.md` |
| M7 visual-system standard spec | `docs/specs/M7-03-admin-design-system-from-prototype.md` |
| M7 visual-source reset spec | `docs/specs/M7-05-prototype-visual-source-reset.md` |
| M7 UI migration index | `docs/admin-ui-prototype-migration-index.md` |
| M7 UI token foundation contract | `docs/admin-ui-token-foundation-contract.md` |
| M7 UI page migration ledger | `docs/admin-ui-page-migration-ledger.md` |

## Execution Queue

| Order | Slice | Status | Evidence |
|---:|---|---|---|
| 0 | M7-00 Design Skill Layer | `merged_to_main` | `docs/evidence/M7/M7-00-uzmax-design-skill-layer.md` |
| 1 | M7-01 Current State Release Doc Alignment | `merged_to_main` | docs/spec records current-state alignment; no GA-0/1.0 approval |
| 3 | M7-03 Admin Design System From Prototype | `merged_to_main` | `docs/evidence/M7/M7-03-admin-design-system-from-prototype.md` |
| 4 | M7-04 Post-Merge Status Cleanup | `merged_to_main` | `docs/evidence/M7/M7-04-postmerge-status-cleanup.md` |
| 5 | M7-05 Prototype Visual Source Reset | `merged_to_main` | `docs/evidence/M7/M7-05-prototype-visual-source-reset.md` |
| UI-00 | M7-UI-00 Prototype Migration Index | `merged_to_main` | `docs/evidence/M7/M7-UI-00-prototype-migration-index.md` |
| UI-00A | M7-UI-00A Fixture Sanitization Map | `merged_to_main` | `docs/evidence/M7/M7-UI-00A-fixture-sanitization-map.md` |
| UI-00B | M7-UI-00B Token Foundation Contract | `merged_to_main` | `docs/evidence/M7/M7-UI-00B-token-foundation-contract.md` |
| UI-01 | M7-UI-01 Foundation Layer | `merged_to_main` | `docs/evidence/M7/M7-UI-01-foundation-layer.md` |
| UI-02 | M7-UI-02 Icon Shell Calibration | `merged_to_main` | `docs/evidence/M7/M7-UI-02-icon-shell-calibration.md` |
| UI-03 | M7-UI-03 Page Migration Ledger And Router | `merged_to_main` | `docs/evidence/M7/M7-UI-03-page-migration-ledger-and-router.md` |
| UI-04 | M7-UI-04 Shared Operational Patterns | `merged_to_main` | `docs/evidence/M7/M7-UI-04-shared-operational-patterns.md`; base includes commit `5877029` / PR #173 |
| UI-05 | M7-UI-05 Layered Navigation Shell | `merged_to_main` | `docs/specs/M7-UI-05-layered-navigation-shell.md`; `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`; merged via commit `8804414`; group/tenant sidebar separation is mandatory baseline |
| UI-06 | M7-UI-06 Shared Shell Topbar Calibration | `merged_to_main` | `docs/specs/M7-UI-06-shared-shell-topbar-calibration.md`; `docs/evidence/M7/M7-UI-06-shared-shell-topbar-calibration.md`; merged via PR #183 / commit `2193a51`; shared AppShell/topbar visual calibration only; `PRODUCTION` marker is visual parity, not deployment/release approval |
| UI-07 | M7-UI-07 Page Visual Acceptance Notes | `merged_to_main` | `docs/specs/M7-UI-07-page-visual-acceptance-notes.md`; `docs/evidence/M7/M7-UI-07-page-visual-acceptance-notes.md`; merged via PR #184 / commit `d7ea071`; durable planning notes only: owner HTML and frozen unpacked page source are the hard visual/source baseline; #182 is broadly aligned but not accepted or merge-ready |
| UI-10 | M7-UI-10 Confirmation Queue Page | `merged_to_main` | `docs/specs/M7-UI-10-confirmation-queue-page.md`; `docs/evidence/M7/M7-UI-10-confirmation-queue-page.md`; focused Playwright `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`; merged via PR #175 / commit `c82fa4d` |
| UI-11 | M7-UI-11 Release Acceptance Page | `draft_paused_transitional_candidate` | `docs/specs/M7-UI-11-release-acceptance-page.md`; `docs/evidence/M7/M7-UI-11-release-acceptance-page.md`; PR #178 is Draft/Paused with an implementation candidate branch, not merged to main, not owner accepted, not a completed page migration |
| UI-11A | M7-UI-11 Worker Boundary Incident | `merged_to_main` | `docs/specs/M7-UI-11A-worker-boundary-incident.md`; `docs/evidence/M7/M7-UI-11A-worker-boundary-incident.md`; `docs/incidents/INC-2026-07-03-m7-ui-11-root-patch-target.md`; incident record merged via `da33a08` / PR #177 |
| UI-12 | M7-UI-12 Group Overview Page | `spec_ready_docs_pr_only` | `docs/specs/M7-UI-12-group-overview-page.md`; `docs/evidence/M7/M7-UI-12-group-overview-page.md`; replaces the older `M7-UI-04A-group-overview` ledger placeholder for planning; no `group.overview` implementation, runtime closure, owner acceptance or release approval is claimed |
| UI-20 | M7-UI-20 Conversation Workbench Page | `main_no_conversation_implementation` | `docs/specs/M7-UI-20-conversation-workbench-page.md`; `docs/evidence/M7/M7-UI-20-conversation-workbench-page.md`; on `main`, no conversation implementation is merged, no owner visual acceptance exists, and no runtime/release closure exists; Draft PR #182 is a conversation workbench implementation candidate pending PR review and owner visual acceptance, not merge-ready and not runtime/release closed |
| UI-04A+ | Page migration implementation queue | `page_specific_specs_required` | UI-05 is merged baseline, UI-10 is merged, UI-11 is Draft/Paused transitional; subsequent page implementations still require approved page-specific specs, runtime contracts, state matrices, tests and evidence |

## Boundary

Impeccable is the default design judgment source for layout, density, hierarchy, interaction states, loading/empty/error/permission/degraded states, mobile fallback, component expression and microcopy shape.

UZMAX source-of-truth, permissions, security, RLS, release gates, real business facts, production/staging operations, real customer/order data, LLM key/cost/compliance decisions and owner approval boundaries veto conflicts.

## Current Visual Boundary

M7-05 resets future UI visual judgment to the owner current prototype `/Users/atilla/Downloads/运营塔台1.0.html`, the prototype-derived source package `/Users/atilla/源码/unpacked 6`, `docs/admin-design-system.md` and `DESIGN.md`. Fonts, colors, component expression, radius, spacing, motion, interaction states, layout density and microcopy shape should follow that prototype system.

The canonical product/admin truth remains the v1.1 source-of-truth docs, AGENTS and owner decisions for product scope, technical boundaries, IA, permissions, security, RLS, release gates, acceptance and real-world risk. Existing `--uzmax-*` tokens and current milestone shell CSS are legacy implementation evidence only; they may remain in untouched legacy code but must not guide new M7+ UI design.

The M7-00 detector baseline still has `side-tab` findings in current admin CSS. M7-03/M7-05 reject/adapt side stripes in the standard, but these docs slices do not change source CSS and do not close acceptance item I-05. Future visual UI slices must not add new detector debt, and I-05 remains open until lint/visual-regression evidence proves the core screens comply.

## Current M7 UI Queue Boundary

M7-UI-00 through M7-UI-02 establish the migration index, fixture safety, token/foundation contract, shared foundation layer and shell icon calibration on `main`. M7-UI-03 adds only the permanent page ledger, typed admin page registry and router/page-outlet scaffold. M7-UI-04 adds shared operational patterns for later page workers. M7-UI-05 is merged to `main` via `8804414`: group pages render group-only nav, tenant pages render tenant-only nav, `/design` or admin/home opens group layer/group overview, selecting a tenant enters tenant layer at `tenant.conversations`, and older legacy evidence Playwright specs use the explicit legacy evidence route. This group/tenant separation is now the baseline for every later page worker. M7-UI-06 is merged to `main` via `2193a51` as shared shell/topbar calibration only. M7-UI-07 is merged to `main` via PR #184 / commit `d7ea071` and records durable visual acceptance notes only: desktop page acceptance requires detailed adjustment against owner HTML and exact unpacked page source; shared sidebar acceptance must verify owner category grouping and bottom collapse control; mobile remains readable fallback for now. M7-UI-10 is merged to `main` for `tenant.queue` via PR #175 / commit `c82fa4d`; it does not close GA-0, M7, M5 owner acceptance, production, release, distill health recovery API, or keep-current runtime semantics. M7-UI-11 / PR #178 is Draft/Paused transitional owner/governance work with an implementation candidate branch, but it is not merged to main, not owner accepted, not a completed page migration and no further visual parity work should be prioritized unless the owner reopens it. M7-UI-12 records `group.overview` / 集团总览 as a spec-ready docs-only planning slice that replaces the older `M7-UI-04A-group-overview` placeholder; it does not implement the page or close runtime, owner acceptance or release gates. For M7-UI-20, `main` has no merged conversation implementation, no owner visual acceptance, and no runtime or release closure. PR #182 is only a Draft conversation workbench implementation candidate pending PR review and owner visual acceptance; current direction is broadly aligned, but it is not one-to-one visual acceptance, owner approval, merge readiness or runtime/release closure.

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
| UI-03 | M7-UI-03 Page Migration Ledger And Router | `in_progress_in_worker` | `docs/evidence/M7/M7-UI-03-page-migration-ledger-and-router.md` |
| UI-04 | Page migration implementation queue | `queued_after_M7_UI_03` | page-specific specs required; all 19 page rows remain `not_started` |

## Boundary

Impeccable is the default design judgment source for layout, density, hierarchy, interaction states, loading/empty/error/permission/degraded states, mobile fallback, component expression and microcopy shape.

UZMAX source-of-truth, permissions, security, RLS, release gates, real business facts, production/staging operations, real customer/order data, LLM key/cost/compliance decisions and owner approval boundaries veto conflicts.

## Current Visual Boundary

M7-05 resets future UI visual judgment to the owner current prototype `/Users/atilla/Downloads/运营塔台1.0.html`, the prototype-derived source package `/Users/atilla/源码/unpacked 6`, `docs/admin-design-system.md` and `DESIGN.md`. Fonts, colors, component expression, radius, spacing, motion, interaction states, layout density and microcopy shape should follow that prototype system.

The canonical product/admin truth remains the v1.1 source-of-truth docs, AGENTS and owner decisions for product scope, technical boundaries, IA, permissions, security, RLS, release gates, acceptance and real-world risk. Existing `--uzmax-*` tokens and current milestone shell CSS are legacy implementation evidence only; they may remain in untouched legacy code but must not guide new M7+ UI design.

The M7-00 detector baseline still has `side-tab` findings in current admin CSS. M7-03/M7-05 reject/adapt side stripes in the standard, but these docs slices do not change source CSS and do not close acceptance item I-05. Future visual UI slices must not add new detector debt, and I-05 remains open until lint/visual-regression evidence proves the core screens comply.

## Current M7 UI Queue Boundary

M7-UI-00 through M7-UI-02 establish the migration index, fixture safety, token/foundation contract, shared foundation layer and shell icon calibration on `main`. M7-UI-03 adds only the permanent page ledger, typed admin page registry and router/page-outlet scaffold. M7-UI-04 remains a future page migration queue: no page is migrated until a page-specific spec, real runtime/API or documented read-only contract, full state matrix, synthetic tests and evidence are present.

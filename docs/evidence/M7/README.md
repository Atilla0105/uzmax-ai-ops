# M7 Evidence

M7 tracks two post-M6B documentation/governance lanes:

- current-state release/doc/admin-gate alignment after M6B closure;
- the UZMAX Design Skill Layer and visual system: repo-scoped design context, M7-03 admin design-system source, Impeccable installation evidence, detector baseline, admin UX map and follow-up UI slice recommendations.

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

## Execution Queue

| Order | Slice | Status | Evidence |
|---:|---|---|---|
| 0 | M7-00 Design Skill Layer | `merged_to_main` | `docs/evidence/M7/M7-00-uzmax-design-skill-layer.md` |
| 1 | M7-01 Current State Release Doc Alignment | `merged_to_main` | docs/spec records current-state alignment; no GA-0/1.0 approval |
| 3 | M7-03 Admin Design System From Prototype | `merged_to_main` | `docs/evidence/M7/M7-03-admin-design-system-from-prototype.md` |
| 4 | M7-04 Post-Merge Status Cleanup | `merged_to_main` | `docs/evidence/M7/M7-04-postmerge-status-cleanup.md` |
| UI-1 | M7-UI-01 Global Admin Frame | `planned_after_m7_03` | follow-up spec required |
| UI-2 | M7-UI-02 Confirmation Queue Interaction Upgrade | `planned_after_m7_03` | follow-up spec required |

## Boundary

Impeccable is the default design judgment source for layout, density, hierarchy, interaction states, loading/empty/error/permission/degraded states, mobile fallback, component expression and microcopy shape.

UZMAX source-of-truth, permissions, security, RLS, release gates, real business facts, production/staging operations, real customer/order data, LLM key/cost/compliance decisions and owner approval boundaries veto conflicts.

## Current Visual Boundary

`docs/admin-design-system.md` is the M7-03 visual-system standard source draft for future UI work, but it is derived context. The canonical product/admin truth remains the v1.1 source-of-truth docs, AGENTS and owner decisions. The current implementation bridge is the `--uzmax-*` namespace in `packages/ui-tokens/src/tokens.css` until a dedicated token/UI spec reconciles aliases and source usage.

The M7-00 detector baseline still has `side-tab` findings in current admin CSS. M7-03 rejects/adapts side stripes in the standard, but this docs slice does not change source CSS and does not close acceptance item I-05. Future visual UI slices must not add new detector debt, and I-05 remains open until lint/visual-regression evidence proves the core screens comply.

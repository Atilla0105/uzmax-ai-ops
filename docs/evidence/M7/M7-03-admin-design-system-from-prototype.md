# M7-03 Admin Design System From Prototype Evidence

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/.codex/worktrees/m7-03-admin-design-system/UZMAX智能运营` |
| worker branch | `codex/m7-03-admin-design-system` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status at entry | `## main...origin/main` |
| worker status at entry | `## codex/m7-03-admin-design-system` |
| local open PR audit | `gh` unavailable in local shell; GitHub CLI audit could not be run from this environment |
| local no-merged branch audit | no output at branch creation |

## Source Inputs Read

| Source | Use |
|---|---|
| `AGENTS.md` | source-of-truth, Design Skill Layer, workspace isolation, spec/PR governance |
| `UZMAX智能运营系统-PRD-v1.1.md` | product scope, non-goals, release principles |
| `UZMAX智能运营系统-技术架构-v1.1.md` | admin pure API client, UI tokens package, release/eval/LLM boundaries |
| `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` | official admin IA, visual tokens, layout and quality budgets |
| `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` | I-01/I-02/I-05 and release blocker context |
| `PRODUCT.md` / `DESIGN.md` | installed M7 design operating brief |
| `packages/ui-tokens/src/tokens.css` | current implementation bridge namespace |
| `.agents/skills/impeccable/SKILL.md` and `reference/product.md` | product UI design constraints and Design Skill Layer rules |
| `/Users/atilla/Downloads/uzmax需求的原型设计/UZMAX 运营塔台.dc.html` | prototype visual/component/interaction source |
| `/Users/atilla/Downloads/uzmax需求的原型设计/support.js` | generated dc-runtime support; treated as runtime, not product design source |

Impeccable context loader was run with bundled Node:

```bash
/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/context.mjs --target apps/admin
```

It resolved the project register as `product` and required reading `reference/product.md`.

## Prototype Extraction

The prototype file is a dc-runtime HTML template. It contains a single operations tower shell with grouped rail, topbar, tenant switcher, tenant-level pages and group-level pages. `support.js` is generated runtime code and contributes no durable product token beyond confirming the template environment.

### Extracted Screen Inventory

| Layer | Screens / Patterns |
|---|---|
| Global | rail, topbar, tenant switcher, environment marker, heartbeat, search, notification, user menu |
| Tenant | conversations, confirmation queue, tickets, customer assets, orders, knowledge/resources, eval center, AI members, team, config, analytics, logs |
| Group | overview, model/cost/risk, template center, connection center, release/acceptance, tenant management, group logs |
| Overlays | confirmation modal, quick-reply editor, customer tag/field editor, persona editor |

### Extracted Token Frequency Summary

| Category | Most Frequent Values |
|---|---|
| Colors | `#7A828C`, `#E8EAEC`, `#FFFFFF/#fff`, `#3F454D`, `#FAFAF8`, `#F2F3F4`, `#1A1D21`, `#D4502B`, `#2E7D4F`, `#C98A1B`, `#30518C` |
| Font sizes | `11px`, `12px`, `13px`, `10px`, `16px`, `14px`, `15px` |
| Radii | `7px`, `10px`, `5px`, `8px`, `6px`, `50%`, `12px`, `4px` |
| Layout anchors | `52px` topbar, `316px` conversation side panels, `380px` ticket list, `680px` queue flow, `232px` expanded nav, prototype `68px` collapsed nav |
| Icon source | Lucide UMD; icon wrapper uses `strokeWidth=1.75`, sizes mostly `13-20px` |

### Impeccable / Design Audit Decisions

| Prototype Finding | Decision | Evidence Boundary |
|---|---|---|
| Core palette matches backend v1.1 and `DESIGN.md` | accepted | neutral + semantic status roles carried into design system |
| Dense workbench layout and queue structure | accepted | maps to backend design §4.1 and §4.6 |
| `J/K/A/E/D` confirmation queue keyboard model | accepted | maps to backend design §4.6 |
| High-risk confirmation dialogs with reason field | accepted | maps to management loop and auditability principles |
| 3px colored side bars | rejected/adapted | M7-00 detector found `side-tab` debt; Impeccable forbids side stripes as default |
| Prototype inline styles | rejected for implementation | AGENTS and backend design require tokens/primitives/patterns/pages |
| One-off color values | normalized | design system maps them to existing semantic/data tokens |
| Prototype personal/contact sample values | not copied | design system abstracts component patterns only |

## Deliverables

| File | Result |
|---|---|
| `docs/specs/M7-03-admin-design-system-from-prototype.md` | docs-only scoped spec |
| `docs/admin-design-system.md` | complete design system source draft |
| `docs/evidence/M7/M7-03-admin-design-system-from-prototype.md` | this evidence file |
| `docs/evidence/M7/README.md` | M7 queue updated with M7-03 as the visual-system standard and `M7-UI-*` follow-up implementation names |
| root/docs entrypoints | `README.md`, `docs/README.md`, `docs/doc-gates.md`, `docs/evidence/README.md`, `DESIGN.md` and M7-00 evidence updated so M7-03 is discoverable and does not conflict with M7-01 current-state alignment |
| `docs/incidents/INC-2026-06-29-m7-03-root-patch-target.md` | records and closes the root/main patch-target incident discovered during this slice |

## Required Section Coverage

| Requested Section | Covered In |
|---|---|
| Design Principles | `docs/admin-design-system.md` §1 |
| Design Tokens | §2 |
| Grid & Layout | §3 |
| Iconography | §4 |
| Typography | §5 |
| Color System | §6 |
| Component Library | §7 |
| Interaction | §8 |
| Motion | §9 |
| Responsive | §10 |
| Accessibility | §11 |
| Design Patterns | §12 |
| Naming Convention | §13 |
| Figma Organization | §14 |
| Developer Guidelines | §15 |

## Boundary Check

This slice does not:

- change `apps/admin/**`, `packages/ui-tokens/**`, API, DB, worker, cron, runtime, tests, lockfiles or config;
- implement `/design`, primitives, patterns or Playwright screenshots;
- enable Impeccable hooks or Live Mode;
- store raw prototype screenshots, customer/order exports, secrets, DB URLs, Bot tokens, webhook secrets, raw Telegram payloads or provider keys;
- approve GA-0, production, customer LLM, real traffic, Telegram Business automatic reply or 1.0 release.

I-05 remains open until token implementation, `/design` living spec, lint and visual regression evidence exist.

## Priority / Supersession Note

Per project owner direction, M7-03 is the higher-priority visual-system standard. Earlier visual-doc alignment work should defer to this branch: keep only non-conflicting entrypoint, numbering and boundary fixes after they are ported into M7-03; do not maintain a parallel M7-02 visual-system standard.

The lower-priority `codex/m7-design-doc-alignment` worktree/branch was cleaned after M7-03 absorbed the useful entrypoint, numbering, token-bridge and I-05 boundary fixes. Current visual-system follow-up work should proceed from `main` after M7-03 is present there, using new `M7-UI-*` specs/branches, not the deleted M7-02 alignment branch or the now-merged M7-03 worker branch.

## Post-Priority Verification

After the owner clarified that M7-03 has higher priority and should be the standard, this branch absorbed the non-conflicting entrypoint, doc-gate, M7 numbering, token-bridge and I-05 boundary fixes.

| Command | Result | Notes |
|---|---|---|
| focused grep for stale M7 UI follow-up labels across README, DESIGN, docs indexes, M7 evidence, this spec and `docs/admin-design-system.md` | pass | No stale `M7-01`/`M7-02` UI follow-up labels remained. |
| `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-03-admin-design-system-from-prototype.md --include-worktree` | pass | Reported `changedFiles: 11`, categories `docs: 11`, source changed files `0`, source net LOC `0`, new source files `0`. |
| `git diff --check` | pass | No whitespace errors. |
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src` | expected exit code `2` | Current output remains the known M7-00 baseline: 12 `side-tab` findings in admin CSS. M7-03 rejects/adapts this pattern in the standard but does not change source CSS or close I-05. |
| `git worktree list` / `git branch --list 'codex/m7-*'` after cleanup | pass | Only root `main` and `codex/m7-03-admin-design-system` remained; `codex/m7-design-doc-alignment` was removed. |

## Incident / Cleanup Evidence

The first patch application for this slice wrote the generated docs files into root/main instead of the assigned worker worktree. The generated files were copied into the worker worktree, the root untracked files were removed, root `docs/evidence/M7/README.md` was restored to HEAD, and root/main returned to `## main...origin/main`.

Incident record: `docs/incidents/INC-2026-06-29-m7-03-root-patch-target.md`.

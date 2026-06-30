# M7-00 Design Skill Layer Evidence

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/Applications/UZMAX智能运营-m7-design-skill-layer` |
| worker branch | `codex/m7-design-skill-layer` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status at entry | `## main...origin/main` |
| unmerged branch audit at entry | `codex/m6b-12b-render-prisma-generate` existed and is unrelated to this M7 design-layer slice |
| open PR audit at entry | `gh pr list --state open --limit 50` unavailable or returned no output in local shell |
| existing design skill files before M7-00 | none found for `PRODUCT.md`, `DESIGN.md`, `.impeccable/**`, `.codex/**` or `.agents/**` |

## Installation / Tooling Evidence

| Item | Evidence |
|---|---|
| install command | `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" pnpm dlx impeccable@latest install --providers=codex --scope=project --no-hooks` |
| install result | success; CLI output: `Installed impeccable into: .agents (project)` |
| CLI version command | `pnpm dlx impeccable@latest --version` |
| CLI version | `3.1.0` |
| installed skill version | `.agents/skills/impeccable/SKILL.md` reports `version: 3.8.0` |
| installed files | `.agents/skills/impeccable/**`, 99 files |
| node runtime | bundled Codex Node `v24.14.0` |
| pnpm runtime | bundled Codex `pnpm 11.7.0`; emitted workspace warning because repo uses npm workspaces |
| shell node/npm/npx | not present in default shell |
| hook status | not enabled; `.impeccable/config.json` sets `hook.enabled=false` and no `.codex/hooks.json` exists |
| Live Mode | not used; no `.impeccable/live/config.json` created by this slice |
| global/user install | not used |
| CI unused-file boundary | `.gitignore` excludes `.agents/skills/impeccable/scripts/**` from generic unused-file scanning while the vendored tool scripts remain committed as skill assets |

The installed `.agents/skills/impeccable/**` package contains tool scripts that are required for the project-scoped skill. They are a vendored design-skill package, not UZMAX app/backend source. This PR therefore requires `large_change_exception` in the PR Hygiene table for `.agents/skills/impeccable/**` only.

## Design Context Evidence

| File | Evidence |
|---|---|
| `PRODUCT.md` | created with `product` register, UZMAX users, product purpose, brand personality, anti-references, design principles and accessibility boundaries |
| `DESIGN.md` | created from backend design v1.1, AGENTS constraints, current `packages/ui-tokens/src/tokens.css`, admin layout rules and I-05 design-system requirements |
| precedence header | both files begin with `Derived design operating brief. If this conflicts with AGENTS.md, PRD v1.1, backend design v1.1, technical architecture, or acceptance matrix, those files win.` |
| context loader | `node .agents/skills/impeccable/scripts/context.mjs --target apps/admin` now loads both files and reports register `product` |
| product reference | `.agents/skills/impeccable/reference/product.md` read before producing design output |

Design context is deliberately derived. It does not replace the PRD, architecture, backend design source, acceptance matrix or AGENTS constitution.

## Detector Baseline

Command:

```bash
PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" pnpm dlx impeccable@latest detect --json apps/admin/src
```

Result: exit code `2`, expected for findings. Baseline is non-blocking for M7-00.

| Rule | Count | Files |
|---|---:|---|
| `side-tab` | 12 | `apps/admin/src/m2-conversation-ticket-shell.css`, `apps/admin/src/m3-knowledge-eval-shell.css`, `apps/admin/src/m4-order-path-status-shell.css`, `apps/admin/src/m5-ai-member-console-shell.css`, `apps/admin/src/m5-confirmation-queue-shell.css`, `apps/admin/src/m5-logs-analytics-shell.css`, `apps/admin/src/m5-template-center-shell.css`, `apps/admin/src/styles.css` |

Detector interpretation: the current admin shell repeatedly uses thick colored side borders as state/accent markers. This is now known design debt. It must not be fixed in M7-00; it should be addressed in the first UI slice that extracts a proper status/accent pattern. This baseline does not close acceptance item I-05; I-05 still requires later lint and visual-regression evidence for the core screens.

## Admin UX Map

| Surface | Current category | Reason | Follow-up |
|---|---|---|---|
| Global admin frame | `needs interaction redesign` | Existing rail/topbar exposes the required shell but uses placeholder one-letter buttons, disabled tools and shallow tenant switcher behavior. | M7-UI-01 global frame spec |
| Tenant switcher / environment state | `needs interaction redesign` | Tenant selection exists, but searchable health-aware switcher, environment contrast and heartbeat behavior are not yet full operator UI. | M7-UI-01 |
| Conversation + ticket workbench | `needs token/pattern extraction` | Three-column/list/detail concepts and state coverage exist, but shell copy and side-tab styling show evidence-oriented UI rather than finished operator workflow. | Later conversation workbench spec after M7-UI-01/M7-UI-02 |
| Confirmation queue | `needs interaction redesign` | Keyboard `J/K/A/E/D`, amber health, conflict diff and daily review flow exist; this is the best bounded slice to prove high-density design improvement. | M7-UI-02 confirmation queue spec |
| Release + acceptance console | `operator-ready` | Gate state is contract-driven and conservative after M6-01; broad redesign is not needed before design debt cleanup. | Keep as evidence-first console; only polish with M7 patterns |
| Knowledge + eval | `needs token/pattern extraction` | Gate and resource concepts exist, but hierarchy and visual state treatment need system patterns before production polish. | Later pattern extraction |
| Orders / import path | `operator-ready` | It correctly states import snapshot as the primary path and avoids fake API degradation; styling debt remains. | Pattern cleanup only |
| Customer assets | `needs interaction redesign` | Runtime state coverage exists, but customer search/asset workflows need real information architecture beyond shell presentation. | Later customer asset UX spec |
| AI member console | `needs token/pattern extraction` | Runtime control concepts exist; status cards and warning presentation share detector debt. | Pattern cleanup after M7-UI-02 |
| Logs + analytics | `needs token/pattern extraction` | Log/analytics shell exists; table density, filters and metric hierarchy need durable primitives. | Later analytics/log pattern spec |
| Template center | `needs token/pattern extraction` | Template copy flow exists; cards and state accents need design-system treatment. | Later template pattern cleanup |
| Mobile fallback | `needs interaction redesign` | Mobile is covered by tests and constraints, but there is no dedicated emergency-first mobile operator surface yet. | Dedicated mobile fallback spec after desktop core slices |

## Follow-up UI Slices

M7-01 was later used for current-state release-doc alignment, and M7-03 is now the visual-system standard source from owner prototype. UI follow-up specs therefore use the `M7-UI-*` prefix to avoid conflicting with existing M7 docs/governance slice numbers.

1. `M7-UI-01-admin-global-frame-design-skill-slice`
   - Scope: `apps/admin/src/App.tsx`, `apps/admin/src/styles.css`, `packages/ui-tokens/**`, focused Playwright design tests and evidence.
   - Goal: replace placeholder global shell with real operator frame: icon rail, label expansion behavior, searchable tenant switcher, environment marker, heartbeat, search/notifications/user controls and stable desktop/mobile layout.
   - Impeccable responsibility: shape layout, density, hierarchy, interaction states and mobile fallback.
   - UZMAX vetoes: no backend API, no real tenant/customer data, no release gate approval changes.

2. `M7-UI-02-confirmation-queue-interaction-design-skill-slice`
   - Scope: `apps/admin/src/M5ConfirmationQueueShell.tsx`, `apps/admin/src/m5-confirmation-queue-shell.css`, confirmation queue tests/evidence and token/pattern extraction if needed.
   - Goal: upgrade the confirmation queue from shell/evidence UI to a high-density daily review tool with clear selected state, keyboard-first flow, compact conflict diff, visible pending/decision states and mobile pass/discard fallback.
   - Impeccable responsibility: shape task flow, card density, keyboard affordances, status hierarchy and empty/loading/error/degraded states.
   - UZMAX vetoes: no automatic write to formal knowledge, no bypass of confirmation queue guardrails, no backend/runtime contract expansion in this UI slice.

## Boundary Check

M7-00 does not change API, DB, worker, cron, runtime release gates, production/staging config, secrets, frontend source or lockfiles.

Changed areas are limited to the M7 spec/evidence, AGENTS design-layer rule, project-scoped Impeccable skill files, design context files, `.impeccable/config.json` and `.gitignore` hygiene for local outputs plus vendored Impeccable script scanning. No dependency or lockfile change is included.

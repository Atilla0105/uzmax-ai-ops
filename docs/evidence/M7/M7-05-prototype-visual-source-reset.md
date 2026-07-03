# M7-05 Prototype Visual Source Reset Evidence

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/.codex/worktrees/m7-05-prototype-visual-source-reset/UZMAX智能运营` |
| worker branch | `codex/m7-05-prototype-visual-source-reset` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| worker status at entry | `## codex/m7-05-prototype-visual-source-reset` |
| root/main status at entry | `## main...origin/main` |

## Owner Direction

The project owner clarified that the old repository design rules, old visual docs and existing milestone-shell visual system must not influence the next admin UI migration.

Future visual implementation should serve the current prototype system:

- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6`
- `docs/admin-design-system.md`
- `DESIGN.md`

Fonts, colors, components, animation/motion, interaction states, layout density and microcopy shape should follow the current prototype-derived design system.

## Updated Sources

| File | Result |
|---|---|
| `docs/specs/M7-05-prototype-visual-source-reset.md` | Added this docs/governance reset spec. |
| `AGENTS.md` | Added M7+ visual implementation source priority and legacy-shell boundary. |
| `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` | Added M7-05 visual inheritance note and updated global rail value to the current prototype. |
| `DESIGN.md` | Replaced old bridge-first hierarchy with prototype-first visual hierarchy. |
| `docs/admin-design-system.md` | Marked `--uzmax-*` and existing shell styles as legacy-only; preserved prototype token/radius/layout priorities. |
| `README.md` / `docs/README.md` | Updated human entrypoints to point future UI work at the current prototype system. |
| `docs/evidence/M7/README.md` | Added M7-05 to the M7 evidence queue and visual boundary. |

## Boundary

This slice does not:

- change `apps/admin/**`, `packages/ui-tokens/**`, runtime code, tests, lockfiles or package dependencies;
- implement token migration, `/design`, primitives, patterns, pages or visual regression;
- copy raw prototype files, screenshots, customer/order exports, secrets, DB URLs, Bot tokens, webhook secrets, raw Telegram payloads or provider keys;
- approve GA-0, production, customer LLM, real traffic, Telegram Business automatic reply or 1.0 release.

I-05 remains open until token implementation, living `/design`, lint and visual-regression evidence exist.

## Validation

| Command | Result | Notes |
|---|---|---|
| focused grep for stale bridge-first wording | pass | No stale bridge-first wording, old rail-as-canonical wording or stale M7 UI follow-up status remains in the updated entrypoints. Remaining `--uzmax-*` references are legacy-only. |
| `git diff --check` | pass | No whitespace errors. |
| `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.quotePath GIT_CONFIG_VALUE_0=false node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-05-prototype-visual-source-reset.md --include-worktree` | pass | `changedFiles: 9`, categories `docs: 9`, source changed files `0`, source net LOC `0`, new source files `0`. `core.quotePath=false` is needed so the Chinese v1.1 filename matches the spec touch list. |

## Closeout

No incident found at evidence creation time.

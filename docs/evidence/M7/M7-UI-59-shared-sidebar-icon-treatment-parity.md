# M7-UI-59 Shared Sidebar Icon Treatment Parity v2 Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch cleanly rebuilds old PR #201 on the new v2 baseline. It calibrates the shared `AppShell` sidebar icon treatment, row density, active row treatment and bottom collapse-control geometry against the owner HTML and `/Users/atilla/源码/unpacked 6` shell sources.

It does not claim page migration completion, glyph replacement, owner visual acceptance, runtime closure, merge closure, GA-0, production readiness or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-59-sidebar-icon-density-parity-v2` |
| worker branch | `codex/m7-ui-59-sidebar-icon-density-parity-v2` |
| base | `origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2` |
| base SHA | `05f23fe9e20a8826d08c9bd5e36534509e210b87` |
| old source-material head | `origin/codex/m7-ui-59-sidebar-icon-density-parity` / `43e5f35f131716f967c8b648c0acc08b2b50c50a` |
| pre-edit `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-59-sidebar-icon-density-parity-v2` |
| pre-edit status | `## codex/m7-ui-59-sidebar-icon-density-parity-v2...origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2` |
| pre-edit branch | `codex/m7-ui-59-sidebar-icon-density-parity-v2` |
| pre-edit HEAD | `05f23fe9e20a8826d08c9bd5e36534509e210b87` |
| root/main boundary | `/Users/atilla/Applications/UZMAX智能运营` root/main was used only for coordination/fetch/worktree creation and was not edited by this worker |

## Required Reads / Source Mapping

Required reads completed before implementation edits:

- `AGENTS.md`
- Impeccable context output for `apps/admin` plus `.agents/skills/impeccable/reference/product.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `docs/admin-design-system.md`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx`
- `/Users/atilla/源码/unpacked 6/primitives/Icon.tsx`
- `docs/specs/M7-UI-08-shared-sidebar-calibration.md`
- `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- old #201 allowed-path patch at `43e5f35f131716f967c8b648c0acc08b2b50c50a`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/src/shell/AppShellNavigation.tsx`
- `apps/admin/src/shell/AppShellIcons.ts`
- `apps/admin/tests/m7-ui-foundation.spec.ts`

Source mapping:

| Source | Finding / implementation use |
|---|---|
| Owner HTML / owner source hierarchy | Sidebar must retain category grouping, visible icon treatment, 232/68 rail widths and bottom collapse control. |
| `unpacked 6/shell/NavSidebar.tsx` | Confirms expanded `232px`, collapsed `68px`, brand header `52px`, grouped scroll body and bottom collapse `40px`. |
| `unpacked 6/patterns/NavItem.tsx` | Confirms row height `36px`, gap `11px`, padding `10px`, radius `7px`, active weight `600`, inactive weight `500`, collapsed labels/badges hidden and icon size `19`. |
| `unpacked 6/primitives/Icon.tsx` | Confirms Lucide-only wrapper, viewBox `0 0 24 24` and stroke width `1.75`; no emoji/text fallback. |
| `unpacked 6/shell/navigation.ts` | Confirms the current group/tenant glyph mapping remains aligned; `AppShellIcons.ts` is not changed. |
| Current `AppShell.css` | Existing shared CSS already owns rail widths and SVG stroke; this slice corrects section/active weight, nav row gap and `.uz-button.uz-nav-collapse` overrides. |
| Old #201 allowed-path patch | Reused only the narrow CSS/test intent; base, docs, evidence and validation are rebuilt for v2. |

## Implementation Summary

- `apps/admin/src/shell/AppShell.css`
  - section label font weight `700 -> 600`;
  - nav row gap `var(--s-6) -> 11px`;
  - active nav item font weight `700 -> 600`;
  - bottom collapse button receives a specific `.uz-button.uz-nav-collapse` override for left alignment, `11px` gap, `18px` padding, top border, no radius and `500` weight.
- `apps/admin/tests/m7-ui-foundation.spec.ts`
  - adds browser-measured nav SVG anatomy checks;
  - asserts active row height/gap/padding/radius/font weight;
  - asserts collapse control is bottom-placed and `40px` tall;
  - asserts collapsed group and tenant states hide visible labels while preserving icon counts;
  - preserves group/tenant separation and mobile readable fallback.

## Browser Evidence

Artifacts are generated under `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/`.

| Artifact | Path |
|---|---|
| Owner HTML desktop screenshot | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/owner-html-desktop.png` |
| Owner HTML sidebar metrics | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/owner-html-sidebar-metrics.json` |
| React group expanded screenshot | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/react-after-desktop-group-expanded.png` |
| React group collapsed screenshot | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/react-after-desktop-group-collapsed.png` |
| React tenant expanded screenshot | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/react-after-desktop-tenant-expanded.png` |
| React tenant collapsed screenshot | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/react-after-desktop-tenant-collapsed.png` |
| React sidebar metrics | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/react-after-sidebar-metrics.json` |
| React mobile screenshot | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/react-after-mobile-320.png` |
| React mobile metrics | `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/react-after-mobile-320-metrics.json` |

Metrics summary:

- Owner HTML default tenant sidebar: nav width `232`, active row `215x36`, row gap `11px`, row padding `10px`, active weight `600`, inactive weight `500`, SVG `19x19`, viewBox `0 0 24 24`, stroke `1.75`, bottom collapse `231x40`, collapse padding `18px`.
- React group expanded: nav width `232`, sections `总览/平台/治理`, icon count `7`, active row `集团总览` at `215x36`, gap `11px`, padding `10px`, weight `600`, SVG `19x19`, collapse `231x40`.
- React group collapsed: nav width `68`, icon count `7`, row labels empty, section label opacity `0`, active icon remains `19x19`, collapse label hidden.
- React tenant expanded: nav width `232`, sections `运营/数据/智能/管理/洞察`, icon count `12`, active row `对话7` at `215x36`, gap `11px`, padding `10px`, weight `600`, SVG `19x19`.
- React tenant collapsed: nav width `68`, icon count `12`, row labels empty, section label opacity `0`, active icon remains `19x19`, collapse label hidden.
- React mobile `320px`: `document.body.scrollWidth=320`, `viewportWidth=320`; vertical scroll remains allowed as mobile fallback.

## Validation

Validation used local worktree dependencies from `npm ci --ignore-scripts`; because that skips Prisma postinstall, `npm --workspace @uzmax/db run prisma:generate` was run to generate Prisma Client only inside local `node_modules`. No package, lockfile, DB schema or migration changed.

| Command | Result | Notes |
|---|---|---|
| `npm ci --ignore-scripts` | pass | local dependency setup only; `package-lock.json` unchanged |
| `npm --workspace @uzmax/db run prisma:generate` | pass | generated local Prisma Client for validation only |
| `npm run format:check` | pass | all matched files use Prettier style |
| `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2` | pass | `prettier-ignore-boundary: ok`; diff check ok |
| `npm run guard:pr-shape -- --base origin/codex/m7-ui-32-knowledge-resources-visible-ui-v2 --spec docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md --include-worktree` | pass | `changedFiles=6`; categories `source=1`, `test=1`, `docs=4`; source `netLoc=0`, `newFiles=0` |
| `npm run typecheck` | pass | passed after local Prisma Client generation |
| `npm run lint` | pass | full lint passed |
| `npm run build:admin` | pass | Vite build passed; existing chunk-size warning only |
| `npx playwright test apps/admin/tests/m7-ui-foundation.spec.ts --config=playwright.config.ts --reporter=line` | pass | 2/2 focused foundation tests passed |
| `npx playwright test apps/admin/tests/m7-ui-foundation.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts --config=playwright.config.ts --reporter=line` | pass | 5/5 shell/sidebar/router tests passed |
| `npm run playwright` | pass | 80/80 Playwright tests passed |
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/shell/AppShell.css apps/admin/tests/m7-ui-foundation.spec.ts` | pass | detector result `[]` |

## Boundary

This evidence does not approve page migration completion, owner visual acceptance, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply, release approval, runtime closure or merge closure.

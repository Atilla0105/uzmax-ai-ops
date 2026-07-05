# M7-UI-59 Shared Sidebar Icon Treatment And Density Parity Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch calibrates the shared `AppShell` sidebar icon treatment, row density, active/section weight and bottom collapse-control geometry against the owner HTML and `/Users/atilla/源码/unpacked 6` shell sources. It does not claim page migration completion, glyph replacement, owner visual acceptance, runtime closure, merge closure, GA-0, production readiness or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-59-sidebar-icon-density-parity` |
| worker branch | `codex/m7-ui-59-sidebar-icon-density-parity` |
| base | `origin/codex/m7-ui-58-conversation-viewport-parity` |
| pre-edit `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-59-sidebar-icon-density-parity` |
| pre-edit status | `## codex/m7-ui-59-sidebar-icon-density-parity...origin/codex/m7-ui-58-conversation-viewport-parity` |
| pre-edit branch | `codex/m7-ui-59-sidebar-icon-density-parity` |
| `git branch --no-merged main` | includes current stacked M7 UI worker branches plus `codex/m7-ui-59-sidebar-icon-density-parity`; recorded before editing |
| open PR check | `gh unavailable` |
| dependency boundary | temporary `node_modules` symlink created from `/Users/atilla/.codex/worktrees/m7-ui-58-conversation-viewport-parity/node_modules` for validation only; it is removed before commit |
| root/main boundary | `/Users/atilla/Applications/UZMAX智能运营` root/main was not edited by this worker |

## Required Reads / Source Mapping

Required reads completed before implementation edits:

- `AGENTS.md`
- Impeccable context output for `apps/admin` plus `.agents/skills/impeccable/reference/product.md`
- `/Users/atilla/Downloads/运营塔台1.0.html` through browser-rendered owner metrics
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TenantSwitcher.tsx`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx`
- `/Users/atilla/源码/unpacked 6/primitives/Icon.tsx`
- `docs/specs/M7-UI-08-shared-sidebar-calibration.md`
- `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/src/shell/AppShellNavigation.tsx`
- `apps/admin/src/shell/AppShellIcons.ts`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- `apps/admin/tests/m7-ui-page-router.spec.ts`

Source mapping:

| Source | Finding / implementation use |
|---|---|
| Owner HTML browser render | Default owner HTML opens tenant conversation shell. Browser metrics show tenant nav rows `215x36`, gap `11px`, padding `10px`, active weight `600`, inactive weight `500`, SVG `19x19`, viewBox `0 0 24 24`, stroke `1.75`, and bottom collapse control `40px`. |
| `unpacked 6/shell/NavSidebar.tsx` | Confirms shared rail dimensions: expanded `232px`, collapsed `68px`, brand header `52px` source intent and bottom collapse `40px`. |
| `unpacked 6/patterns/NavItem.tsx` | Confirms row height `36px`, gap `11px`, icon size `19`, active weight `600`, inactive weight `500`, collapsed label hiding and badge hiding. |
| `unpacked 6/primitives/Icon.tsx` | Confirms Lucide-only wrapper and stroke width `1.75`; no emoji/text fallback. |
| `unpacked 6/shell/navigation.ts` | Confirms current glyph mapping remains aligned; `apps/admin/src/shell/AppShellIcons.ts` was not touched. |
| Current `AppShell.css` | Existing shared CSS already had rail widths and SVG stroke; this slice only corrected weight/gap/collapse-button overrides. |
| Current focused tests | Existing tests already covered route/layer/topbar/mobile. This slice adds browser-measured SVG anatomy and collapsed visible-label checks. |

## Browser Comparison

| Surface | Owner / unpacked source | React after fix | Result |
|---|---|---|---|
| Default layer | Owner HTML defaults to tenant conversation shell; unpacked supports group/tenant route state | `/design` defaults to `data-shell-level="group"` and `data-active-page-id="group.overview"` per M7-UI-05 | Intentional repo route baseline preserved |
| Section groups | Owner source defines group `总览/平台/治理` and tenant `运营/数据/智能/管理/洞察` | React renders exact active-layer groups; opposite layer absent | Aligned |
| Row density | Owner tenant row metric `215x36`, gap `11px`, padding `10px` | React group/tenant rows `215x36`, gap `11px`, padding `10px` | Aligned |
| Icon anatomy | Owner SVG `19x19`, viewBox `0 0 24 24`, stroke `1.75` | React nav item SVG `19x19`, viewBox `0 0 24 24`, stroke `1.75`, one visible SVG per item | Aligned |
| Active and section weight | Owner active nav `600`; unpacked group label source `600` | React active nav and section labels now `600` | Aligned |
| Collapse control | Owner bottom control is `40px`, left-aligned, gap `11px`, padding-left `18px`, text `收起导航` | React bottom control is `40px`, left-aligned, gap `11px`, padding `0 18px`, text `收起导航`; collapsed aria `Expand navigation` with no visible text | Aligned |
| Collapsed rail | Unpacked rail width `68px`, labels hidden | React group and tenant collapsed rail width `68px`, nav label text empty, section labels opacity `0`, group icons `7`, tenant icons `12` | Aligned |
| Topbar anchors | Owner topbar has tenant switcher, search, production marker, heartbeat, notifications and user chip | React retains tenant switcher, Chinese search placeholder, `PRODUCTION`, `68ms`, notification badge and user chip | Preserved |
| Mobile fallback | Mobile is fallback, not pixel parity | React `320px` screenshot has `document.body.scrollWidth=320` | Pass |

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/shell/AppShell.css` | Sets section label and active nav weight to `600`, nav item gap to `11px`, and restores collapse button left alignment, `18px` padding, `11px` gap, top border and `500/12px` typography against later `.uz-button` defaults. |
| `apps/admin/tests/m7-ui-foundation.spec.ts` | Adds reusable assertions that each nav item has exactly one visible Lucide SVG with viewBox `0 0 24 24`, stroke `1.75`, about `19x19` rendered size, empty icon-slot text and `36px` row height; also asserts collapsed group/tenant labels are visually hidden. |
| `docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md` | Adds the narrow visible UI polish/fix spec, touch list, budget, source mapping and pass conditions. |
| `docs/evidence/M7/M7-UI-59-shared-sidebar-icon-treatment-parity.md` | Records source mapping, browser comparison, screenshots/metrics and validation. |
| `docs/evidence/M7/README.md` | Records UI-59 as a stacked visible UI fix candidate, not page migration/owner acceptance/runtime closure. |
| `docs/admin-ui-page-migration-ledger.md` | Adds shared shell row `0.8` and ledger state language for UI-59. |

## Impeccable / Design Audit

| Command | Result | Notes |
|---|---|---|
| `node .agents/skills/impeccable/scripts/context.mjs --target apps/admin` | pass | Product/admin context loaded; owner prototype and unpacked source hierarchy confirmed. |
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/shell/AppShell.css apps/admin/tests/m7-ui-foundation.spec.ts` | pass | Final detector result `[]`. |

## Browser Evidence

Artifacts under `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/`:

- Owner screenshot: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/owner-html-desktop.png`
- Owner initial metrics: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/owner-html-sidebar-metrics.json`
- Owner DOM sample metrics: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/owner-html-sidebar-dom-sample.json`
- React before screenshot: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/react-before-desktop-group.png`
- React after group expanded screenshot: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/react-after-desktop-group-expanded.png`
- React after group collapsed screenshot: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/react-after-desktop-group-collapsed.png`
- React after tenant expanded screenshot: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/react-after-desktop-tenant-expanded.png`
- React after tenant collapsed screenshot: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/react-after-desktop-tenant-collapsed.png`
- React after sidebar metrics: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/react-after-sidebar-metrics.json`
- React mobile screenshot: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/react-after-mobile-320.png`
- React mobile metrics: `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/react-after-mobile-320-metrics.json`

Metrics summary:

- Owner HTML tenant rows: `215x36`, gap `11px`, padding `10px`, active weight `600`, inactive weight `500`, SVG `19x19`, viewBox `0 0 24 24`, stroke `1.75`, bottom collapse `40px`.
- React group expanded: nav width `232`, brand height `53`, topbar height `53`, section labels `600`, active row `600`, row gap `11px`, SVG `19x19`, collapse `40px`.
- React group collapsed: nav width `68`, row text empty, section label opacity `0`, icon count `7`.
- React tenant expanded: `data-shell-level="tenant"`, `data-active-page-id="tenant.conversations"`, sections `运营/数据/智能/管理/洞察`, SVG `19x19`, icon count `12`.
- React tenant collapsed: nav width `68`, row text empty, section label opacity `0`, icon count `12`, collapse aria `Expand navigation`.
- React mobile `320px`: `document.body.scrollWidth=320`.

## Validation

Validation uses the bundled Codex runtime Node path:

`export PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH`

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/shell/AppShell.css apps/admin/tests/m7-ui-foundation.spec.ts docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md docs/evidence/M7/M7-UI-59-shared-sidebar-icon-treatment-parity.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md` | pass | All changed files use Prettier style. |
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/shell/AppShell.css apps/admin/tests/m7-ui-foundation.spec.ts` | pass | Detector result `[]`. |
| `find apps packages scripts -path '*/node_modules' -prune -o -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.mjs" -o -name "*.cjs" \) -print0 \| xargs -0 node node_modules/eslint/bin/eslint.js eslint.config.mjs dependency-cruiser.config.cjs playwright.config.ts` | pass | Full root lint equivalent passed after simplifying the Playwright helper. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | pass | Root typecheck passed. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build passed; Vite emitted the existing large chunk warning and exited 0. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-58-conversation-viewport-parity --spec docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md --include-worktree` | pass | `changedFiles=6`; categories `source=1`, `test=1`, `docs=4`; source `changedFiles=1`, `netLoc=0`, `newFiles=0`. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-foundation.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts --config=playwright.config.ts --reporter=line` | pass | 5 focused shell/router tests passed against production preview on port `4173`. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-*.spec.ts --config=playwright.config.ts --reporter=line` | pass | 108/108 M7 UI tests passed against production preview on port `4173`. |

## Boundary

This evidence does not approve page migration completion, owner visual acceptance, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply, release approval, runtime closure or merge closure.

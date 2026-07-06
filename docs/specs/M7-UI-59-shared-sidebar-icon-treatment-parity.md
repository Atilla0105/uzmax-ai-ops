# M7-UI-59 Shared Sidebar Icon Treatment Parity v2

## Goal

Cleanly replay the accepted `M7-UI-59 sidebar icon density parity` v2 change as a narrow clean-stack slice based on `origin/codex/m7-ui-31-orders-visible-ui` with M7-UI-58 clean-stack merge `6fdf5e9cf64ca7f967ab199741f7afa82647a9d0`.

This slice calibrates the shared `AppShell` sidebar icon treatment, row density, active row treatment and bottom collapse-control geometry against the owner prototype and `/Users/atilla/源码/unpacked 6` shell sources. It does not rescue the old #200-#238 stack, does not merge old branches, and does not change glyph mapping, routing, page bodies, runtime/API/DB/authz behavior, package dependencies, CI/global config, owner HTML or unpacked source.

## Owner Confirmation Points And AI Agent Responsibilities

Owner/coordinator:

- Review this as a small visible UI clean-stack PR on the M7-UI-58 base, not a redesign or old-stack cleanup.
- Keep final scope, owner visual acceptance, production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-59-sidebar-icon-density-parity-cleanstack` on branch `codex/m7-ui-59-sidebar-icon-density-parity-cleanstack`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Preserve M7-UI-05 group/tenant layer separation, M7-UI-06 topbar anchors, M7-UI-08 sidebar grouping and M7-UI-58 v2 conversation viewport behavior.
- Replay accepted commit `8fdae9867aee480dc93653134556e215a3096f37` only for the six allowed paths; do not copy unrelated topology.
- Preserve owner HTML / unpacked source / React browser comparison evidence language from the accepted slice and record clean-stack validation in this PR.

## Timebox

One focused worker slice. If parity requires changing icons, routing, page bodies, runtime/API/DB/authz, global config or lockfiles, stop and record `blocked_by_scope`.

## Spec 类型

fix

## 触碰模块/文件

- Touch module set (machine-readable glob/path, one line each; `guard:pr-shape` reads this list):
  - `docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md`
  - `docs/evidence/M7/M7-UI-59-shared-sidebar-icon-treatment-parity.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
- Unlisted modules are out of scope.

## 变更预算与路径分类

- source budget: changed source files <= 1, net source LOC <= 80, new source files 0.
- test budget: changed test files <= 1.
- docs budget: changed docs files <= 4.
- generated/lock/config/backend/API/DB/worker/cron: 0.
- external API/SDK/provider/connector/adapter basis: none; existing `lucide-react` through existing `IconSlot` only.
- `rg` search conclusion before source changes: searched current shell CSS/tests, prior M7 sidebar specs/evidence, old #201 allowed paths and owner unpacked shell/navigation/pattern/icon sources. Existing `AppShell.css`, `NavItem` and `IconSlot` already own the behavior; no new source file is needed.
- exceptions: none.

## Documentation Trigger Check

- result: `updated`.
- rationale: shared visible UI behavior and focused Playwright coverage changed; M7 spec/evidence/index and migration ledger record the v2 candidate state.

## Required Reads / Source Mapping

Required reads before implementation:

- `AGENTS.md`
- `PRODUCT.md` / `DESIGN.md` via Impeccable context for `apps/admin`
- `.agents/skills/impeccable/reference/product.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `docs/admin-design-system.md`
- `/Users/atilla/Downloads/运营塔台1.0.html` as browser-rendered owner visual source
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx`
- `/Users/atilla/源码/unpacked 6/primitives/Icon.tsx`
- current `apps/admin/src/shell/AppShell.tsx`
- current `apps/admin/src/shell/AppShell.css`
- current `apps/admin/src/shell/AppShellNavigation.tsx`
- current `apps/admin/src/shell/AppShellIcons.ts`
- current `apps/admin/tests/m7-ui-foundation.spec.ts`
- `docs/specs/M7-UI-08-shared-sidebar-calibration.md`
- `docs/specs/M7-UI-58-conversation-viewport-parity.md`
- old #201 allowed-path patch for source material only

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML browser render | Compare the visible sidebar/sidebar collapse control and capture screenshots/metrics for this v2 evidence. |
| `unpacked 6/shell/NavSidebar.tsx` | Confirms `232px` expanded rail, `68px` collapsed rail, `52px` brand header and `40px` bottom collapse affordance. |
| `unpacked 6/patterns/NavItem.tsx` | Confirms nav item height `36px`, icon size `19`, gap `11`, active weight `600`, inactive weight `500`, collapsed label hiding and badge hiding. |
| `unpacked 6/primitives/Icon.tsx` | Confirms Lucide-only wrapper, viewBox `24` and stroke width `1.75`; no emoji/text fallback. |
| `unpacked 6/shell/navigation.ts` | Confirms glyph mapping remains aligned; no `AppShellIcons.ts` edit needed. |
| Current `AppShell.css` | Calibrate shared sidebar CSS only: section weight, active weight, item gap and collapse button geometry. |
| Current focused tests | Preserve group/tenant separation, topbar anchors and mobile fallback while adding icon anatomy, active row density and collapsed visible-text assertions. |

## Impeccable / Product-Register Decision Record

| Decision | Status | Reason |
|---|---|---|
| Treat this as restrained product UI polish, not redesign. | accepted | Product register favors earned familiarity, dense task UI and predictable controls over decoration. |
| Keep Lucide icon mapping unchanged. | accepted | Owner `navigation.ts` and current `AppShellIcons.ts` align; issue is treatment/geometry/density. |
| Use owner/source `11px` nav gap and `600` active/section weight. | accepted | `unpacked 6/patterns/NavItem.tsx` and owner metrics both agree. |
| Restore collapse button left alignment, `18px` padding and `11px` gap despite shared `.uz-button` defaults. | accepted | Owner `NavSidebar.tsx` defines the bottom control as a left-aligned 40px affordance. |
| Add focused Playwright anatomy checks for nav SVGs and active row density. | accepted | Gives browser-measured parity without snapshot bloat. |
| Page body, runtime/API, DB/authz, router or glyph replacement changes. | rejected | Out of scope and unnecessary for the observed parity delta. |

## Pass Conditions

- Default `/design` desktop opens group layer: `data-shell-level="group"`, `data-active-page-id="group.overview"`.
- Group sidebar sections are exactly `总览 / 平台 / 治理`; tenant sections absent.
- Tenant selection `tenant-b` enters tenant layer `tenant.conversations`; breadcrumb contains `丝路数码`.
- Tenant sidebar sections are exactly `运营 / 数据 / 智能 / 管理 / 洞察`; group buttons absent.
- Expanded sidebar width is `232px`; collapsed width is `68px`.
- Collapse control is bottom-aligned, `40px` tall, expanded text exactly `收起导航`; collapsed accessible label is `Expand navigation` and no visible `收起导航`.
- Collapsed group and tenant states hide labels/group text while keeping group icon count `7` and tenant icon count `12`.
- Every nav item uses exactly one visible Lucide SVG icon: viewBox `0 0 24 24`, visible box about `19x19`, stroke-width `1.75`, and no emoji/text fallback inside the icon slot.
- Active nav item height remains `36px`, gap `11px`, padding `10px`, radius `7px` and font weight `600`.
- Topbar anchors survive: tenant switcher, Chinese search placeholder, `PRODUCTION`, `68ms`, notification badge and user chip.
- Mobile `320px` fallback remains readable with `document.body.scrollWidth <= 320`.
- Evidence includes owner HTML / unpacked source / React comparison language, screenshots/metrics under `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity-v2/`, and validation commands.

## Validation Plan

- `git status --short --branch`
- `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `npm run format:check`
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md --include-worktree`
- `npm run typecheck`
- `npm run lint`
- `npm run build:admin`
- focused Playwright for `apps/admin/tests/m7-ui-foundation.spec.ts`
- smallest feasible shell/sidebar suite that covers foundation + shell/sidebar
- Impeccable detector for changed shell/test files

## Failure Branch

- If assigned worktree/branch is wrong, stop and report `BLOCKED`.
- If root/main or another worktree is modified, stop and report impact; record an incident if policy threshold is met.
- If validation blocks on baseline environment/runtime issues, record exact command/output and whether changed files are coherent.
- If parity requires non-CSS shell rewrites, icon replacement, router changes, page body changes, backend/API/DB/authz/package/lock/config changes or owner/unpacked source edits, stop and split a separate spec.

## Out Of Scope

- No backend/API/authz/DB/worker/cron/package/lock/CI/global config changes.
- No page-local conversation or other page body work.
- No glyph replacement or `AppShellIcons.ts` changes.
- No old `--uzmax-*` visual-source revival.
- No mobile pixel parity redesign beyond readable/no-overflow fallback.
- No old #200-#238 branch merge, cherry-pick, rescue or readiness claim.
- No GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply, owner signoff fabrication or 1.0 release approval.

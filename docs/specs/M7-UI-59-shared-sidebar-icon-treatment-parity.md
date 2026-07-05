# M7-UI-59 Shared Sidebar Icon Treatment And Density Parity

## Goal

Implement a narrow visible UI polish/fix for the shared `AppShell` sidebar on top of `origin/codex/m7-ui-58-conversation-viewport-parity`.

This slice calibrates sidebar icon treatment, row density, active/section weight and collapse-control geometry against the owner prototype and `/Users/atilla/源码/unpacked 6` shell sources. It does not change glyph mapping, routing, page bodies, runtime/API/DB/authz behavior, package dependencies, CI/global config, owner HTML or unpacked source.

## Owner Confirmation Points And AI Agent Responsibilities

Owner/coordinator:

- Review this as a small visible UI PR, not a redesign or foundation rewrite.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-59-sidebar-icon-density-parity` on branch `codex/m7-ui-59-sidebar-icon-density-parity`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Preserve M7-UI-05 group/tenant layer separation, M7-UI-06 topbar anchors, M7-UI-08 sidebar grouping and M7-UI-58 conversation viewport behavior.
- Do not touch `apps/admin/src/shell/AppShellIcons.ts` unless direct owner source evidence proves the glyph mapping wrong. This slice found no glyph mapping issue.
- Record owner HTML / unpacked source / React browser comparison evidence under `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/`.

## Timebox

One focused worker slice. If parity requires changing icons, routing, page bodies, runtime/API/DB/authz, global config or lockfiles, stop and record `blocked_by_scope`.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md`
  - `docs/evidence/M7/M7-UI-59-shared-sidebar-icon-treatment-parity.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1, net source LOC <= 80, new source files 0.
- test 预算：changed test files <= 1.
- docs 预算：changed docs files <= 4.
- generated/lock/config/backend/API/DB/worker/cron: 0.
- external API/SDK/provider/connector/adapter basis: none; existing `lucide-react` through existing `IconSlot` only.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：searched current shell CSS/tests and owner unpacked shell/navigation/pattern/icon sources. Existing `AppShell.css`, `NavItem` and `IconSlot` already own the behavior; no new source file is needed.
- exceptions: none.

## 文档触发检查

- 结果：`updated`.
- 判断依据：shared visible UI behavior and focused Playwright coverage changed; M7 spec/evidence/index and migration ledger record the candidate state.

## Required Reads / Source Mapping

Required reads before implementation:

- `AGENTS.md`
- `PRODUCT.md` / `DESIGN.md` via Impeccable context for `apps/admin`
- `.agents/skills/impeccable/reference/product.md`
- `/Users/atilla/Downloads/运营塔台1.0.html` as browser-rendered owner visual source
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TenantSwitcher.tsx`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx`
- `/Users/atilla/源码/unpacked 6/primitives/Icon.tsx`
- current `apps/admin/src/shell/AppShell.tsx`
- current `apps/admin/src/shell/AppShell.css`
- current `apps/admin/src/shell/AppShellNavigation.tsx`
- current `apps/admin/src/shell/AppShellIcons.ts`
- current `apps/admin/tests/m7-ui-foundation.spec.ts`
- current `apps/admin/tests/m7-ui-page-router.spec.ts`
- `docs/specs/M7-UI-08-shared-sidebar-calibration.md`
- `docs/specs/M7-UI-58-conversation-viewport-parity.md`

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML browser render | Confirms expanded tenant sidebar row `215x36`, gap `11px`, padding `10px`, active weight `600`, inactive weight `500`, SVG `19x19`, viewBox `0 0 24 24`, stroke `1.75`, and bottom collapse control `40px`. |
| `unpacked 6/shell/NavSidebar.tsx` | Confirms `232px` expanded rail, `68px` collapsed rail, `52px` brand header and `40px` bottom collapse affordance. |
| `unpacked 6/patterns/NavItem.tsx` | Confirms nav item height `36px`, icon size `19`, gap `11`, active weight `600`, inactive weight `500`, collapsed label hiding and badge hiding. |
| `unpacked 6/primitives/Icon.tsx` | Confirms Lucide-only wrapper, viewBox `24` and stroke width `1.75`; no emoji/text fallback. |
| `unpacked 6/shell/navigation.ts` | Confirms glyph mapping remains aligned; no `AppShellIcons.ts` edit needed. |
| Current `AppShell.css` | Calibrate shared sidebar CSS only: section weight, active weight, item gap and collapse button geometry. |
| Current focused tests | Preserve group/tenant separation, topbar anchors and mobile fallback while adding icon anatomy and collapsed visible-text assertions. |

## Impeccable / Product-Register Decision Record

| Decision | Status | Reason |
|---|---|---|
| Treat this as restrained product UI polish, not redesign. | accepted | Product register favors earned familiarity and exact task UI over decoration. |
| Keep Lucide icon mapping unchanged. | accepted | Owner `navigation.ts` and current `AppShellIcons.ts` align; issue is treatment/geometry/density. |
| Use owner measured `11px` nav gap and `600` active/section weight. | accepted | Browser metrics and unpacked `NavItem.tsx` both agree. |
| Restore collapse button left alignment, `18px` padding and `11px` gap despite shared `.uz-button` defaults. | accepted | Owner `NavSidebar.tsx` defines bottom control as left-aligned 40px affordance. |
| Add focused Playwright anatomy checks for nav SVGs. | accepted | Makes visible icon parity browser-comparable without snapshot bloat. |
| Page body, runtime/API, DB/authz, router or glyph replacement changes. | rejected | Out of scope and unnecessary for the observed parity delta. |

## Pass Conditions

- Default `/design` desktop opens group layer: `data-shell-level="group"`, `data-active-page-id="group.overview"`.
- Group sidebar sections are exactly `总览 / 平台 / 治理`; tenant sections absent.
- Tenant selection `tenant-b` enters tenant layer `tenant.conversations`; breadcrumb contains `丝路数码`.
- Tenant sidebar sections are exactly `运营 / 数据 / 智能 / 管理 / 洞察`; group buttons absent.
- Expanded sidebar width is `232px`; collapsed width is `68px`; topbar and nav brand/header remain current `52/53px` measured behavior.
- Collapse control is bottom-aligned, `40px` tall, expanded text exactly `收起导航`; collapsed accessible label is `Expand navigation` and no visible `收起导航`.
- Collapsed group and tenant states hide labels/group text while keeping group icon count `7` and tenant icon count `12`.
- Every nav item uses exactly one visible Lucide SVG icon: viewBox `0 0 24 24`, visible box about `19x19`, stroke-width `1.75`, and no emoji/text fallback inside the icon slot.
- Nav item height remains `36px`; active and group label weight are owner-like `600`.
- Topbar anchors survive: tenant switcher, Chinese search placeholder, `PRODUCTION`, `68ms`, notification badge and user chip.
- Mobile `320px` fallback remains readable with `document.body.scrollWidth <= 320`.
- Evidence includes owner HTML / unpacked source / React comparison language, screenshots/metrics under `/tmp/uzmax-m7-ui-59-sidebar-icon-density-parity/`, and validation commands.

## Validation Plan

- `git diff --check`
- Prettier check changed files only
- Lint equivalent from root `package.json`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-58-conversation-viewport-parity --spec docs/specs/M7-UI-59-shared-sidebar-icon-treatment-parity.md --include-worktree`
- Focused Playwright for `apps/admin/tests/m7-ui-foundation.spec.ts` and `apps/admin/tests/m7-ui-page-router.spec.ts`
- Full `apps/admin/tests/m7-ui-*.spec.ts` if feasible
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
- No GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply, owner signoff fabrication or 1.0 release approval.

# M7-UI-98 AppShell Sidebar Category/Collapse Source Parity

## Goal

Align the shared `AppShell` sidebar category layer and collapse behavior with the owner prototype source while preserving the existing group homepage and tenant-entry routing semantics on top of `origin/codex/m7-ui-31-orders-visible-ui`.

This is a visible UI slice, not docs-only. It may calibrate the shell navigation and add focused browser evidence only. It must not touch page content, conversation internals, runtime/API/DB/authz, package/lock/config, global CI or root/main state.

## Owner Confirmation Points And AI Agent Responsibilities

Owner/coordinator:

- Review this as one narrow shell/sidebar visual parity PR based on `codex/m7-ui-31-orders-visible-ui`.
- Keep final visual acceptance, production/staging actions, real customer/order data, LLM key, cost/compliance, GA-0 and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-98-sidebar-category-collapse-parity` on branch `codex/m7-ui-98-sidebar-category-collapse-parity`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, the M7+ visual source set, v1.1 admin/product/tech/acceptance references, current shell files and the owner unpacked shell/navigation/pattern sources before editing.
- Preserve group and tenant navigation as separate layers; do not mix group and tenant nav items in one universal sidebar.

## Timebox

One focused worker slice. If parity requires page-body changes, routing rewrites, backend/API/DB/authz, global config, package/lock changes or icon replacement, stop and record `blocked_by_scope`.

## Spec 类型

fix

## 触碰模块/文件

- `apps/admin/src/shell/AppShellNavigation.tsx`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/tests/m7-ui-98-sidebar-category-collapse-parity.spec.ts`
- `docs/specs/M7-UI-98-sidebar-category-collapse-parity.md`
- `docs/evidence/M7/M7-UI-98-sidebar-category-collapse-parity.md`

## 变更预算与路径分类

- source budget: changed source files <= 3, net source LOC <= 120, new source files 0.
- test budget: changed test files <= 1, new test files <= 1.
- docs budget: changed docs files <= 2.
- generated/lock/config/backend/API/DB/worker/cron/global CI/package changes = 0.
- external API/SDK/provider/connector/adapter basis: none; existing `lucide-react` icons through existing `IconSlot` only.
- `rg` search conclusion before source changes: searched current shell/navigation/pattern files, prior M7 sidebar and tenant-entry specs/tests, token definitions, route harness and v1.1 admin references. Existing `AppShellNavigation.tsx`, `AppShell.tsx`, `AppShell.css` and `patterns/NavItem` own this behavior; no new source file and no icon replacement are needed.
- exceptions: none.

## Required Reads / Source Mapping

| Source | Required use |
|---|---|
| `AGENTS.md` | Governance, allowed source-of-truth hierarchy, spec-first and worker isolation rules. |
| Impeccable `PRODUCT.md` / `DESIGN.md` context and `reference/product.md` | Treat the shell as restrained product UI; preserve density and familiar controls. |
| `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` | Confirms separate group/tenant layers, left nav `68px` collapsed / `232px` expanded, `52px` topbar, and tenant IA boundary. |
| `UZMAX智能运营系统-PRD-v1.1.md` | Confirms multi-tenant operations scope and group/tenant isolation principles. |
| `UZMAX智能运营系统-技术架构-v1.1.md` | Confirms admin is a pure API client; this PR must not import backend packages or change runtime boundaries. |
| `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` | Confirms backend experience/front-end quality is acceptance evidence, not release approval. |
| `docs/admin-design-system.md` | Confirms prototype-derived tokens, `232px`/`68px` rail, `52px` topbar, Lucide-only icons and no old `--uzmax-*` visual-source revival. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Owner browser-rendered visual oracle sampled by Playwright when mounted. |
| `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx` | Confirms expanded width `232`, collapsed width `68`, brand height `52`, category opacity suppression when collapsed and bottom `40px` collapse control. |
| `/Users/atilla/源码/unpacked 6/shell/navigation.ts` | Confirms group categories `总览/平台/治理` and tenant categories `运营/数据/智能/管理/洞察` with source item order. |
| `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx` | Confirms `36px` nav rows, `19px` icons, collapsed label/badge hiding and Lucide wrapper usage. |
| `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx` | Confirms group/tenant route state and left-nav/main-column shell structure. |
| current `apps/admin/src/shell/*` and `apps/admin/src/patterns/index.tsx` | Preserve current routing semantics and use existing primitives/patterns rather than parallel implementations. |

## Impeccable / Design Skill Layer Decision Record

| Decision | Status | Reason |
|---|---|---|
| Treat this as source-parity product UI calibration, not redesign. | accepted | Product register favors restrained, predictable controls for operational tools. |
| Keep `IconSlot` + Lucide icon mapping unchanged. | accepted | Current `AppShellIcons.ts` already matches the owner source mapping and icon treatment. |
| Use existing canonical tokens for rail/topbar dimensions. | accepted | `--nav-expanded-width`, `--nav-collapsed-width` and `--topbar-height` already match owner source values. |
| Add browser-measured category/order/collapse/mobile evidence. | accepted | This catches the current source-parity risk without snapshot bloat. |
| Old `--uzmax-*` shell namespace or page-local raw visual system. | rejected | AGENTS and design system mark old namespace as legacy-only for new shell work. |
| Page content, conversation internals, runtime/API/DB/authz or package changes. | rejected | Out of scope and unnecessary for sidebar category/collapse parity. |

## Pass Conditions

- `/design` defaults to group layer: `data-shell-level="group"`, `data-active-page-id="group.overview"`.
- Expanded sidebar width is exactly `232px`; collapsed sidebar width is exactly `68px`; brand height is exactly `52px`; bottom collapse control is `40px`.
- Expanded group layer categories are exactly `总览 / 平台 / 治理`; tenant categories and labels are absent.
- Selecting a tenant from the default group homepage enters tenant layer and `tenant.conversations` without mixing group nav.
- Expanded tenant categories exactly preserve owner source order/categories: `运营 / 数据 / 智能 / 管理 / 洞察`.
- Tenant item order exactly preserves source grouping: `运营` contains `对话 / 工单 / 确认队列`; `数据` contains `客户资产 / 订单 / 知识与资源`; `智能` contains `评测中心 / AI 成员`; `管理` contains `团队 / 配置`; `洞察` contains `分析 / 日志`.
- Collapse control is fixed at the nav bottom, label `收起导航` is visible only when expanded, and icon transform indicates collapsed state.
- Collapsed tenant sidebar shows only icons: no labels, no badges, category headings visually suppressed, all icons remain Lucide SVGs around `19px`, and nav/body have no horizontal overflow.
- Mobile `320px` fallback after tenant entry remains readable with `document.body.scrollWidth <= 320`.
- Evidence includes source mapping, desktop expanded screenshot, desktop collapsed screenshot, tenant/group metrics JSON, mobile screenshot/metrics and explicit comparison to source values.

## Validation Plan

- `git status --short --branch`
- `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- format check / Prettier check for changed files or repository equivalent
- focused Playwright: `apps/admin/tests/m7-ui-98-sidebar-category-collapse-parity.spec.ts`
- admin build equivalent
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-98-sidebar-category-collapse-parity.md --include-worktree`

## Failure Branch

- If assigned worktree/branch is wrong, stop and report `BLOCKED`.
- If root/main or another worktree is modified, stop and report impact; record an incident if policy threshold is met.
- If validation blocks on baseline environment/runtime dependency issues, record exact command/output and whether changed files are coherent.
- If satisfying parity requires unlisted files or non-shell behavior, stop and split a separate spec.

## Out Of Scope

- No conversation page files or page content.
- No DB/API/authz/runtime/worker/cron/package/lock/global CI changes.
- No `AppShellIcons.ts` edit unless icon parity is proven broken.
- No `patterns/index.tsx` edit unless NavItem source parity is proven broken.
- No owner HTML or unpacked source edits.
- No old `--uzmax-*` visual-source revival.
- No production/staging action, real customer/order data, customer LLM, owner signoff fabrication, GA-0 or 1.0 release approval claim.

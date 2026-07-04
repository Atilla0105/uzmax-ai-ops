# M7-UI-08 Shared Sidebar Calibration

## Goal

Calibrate the shared `AppShell` sidebar to the owner current prototype and `/Users/atilla/源码/unpacked 6` shell sources.

This is a narrow shared sidebar slice. It does not implement or alter conversation page body work, release acceptance page body work, backend/API/DB/authz behavior, package dependencies, CI/global config or owner prototype files.

Required visible target:

- Sidebar renders owner-style navigation groups instead of one generic `GROUP` or `TENANT` bucket.
- Group layer groups are exactly `总览`, `平台`, `治理`, sourced from `/Users/atilla/源码/unpacked 6/shell/navigation.ts`.
- Tenant layer groups are exactly `运营`, `数据`, `智能`, `管理`, `洞察`, sourced from `/Users/atilla/源码/unpacked 6/shell/navigation.ts`.
- Only the active layer groups render. Group pages must not expose tenant nav; tenant pages must not expose group nav.
- Preserve `/design` or admin home initial `group.overview`, tenant selection to `tenant.conversations`, and back-to-group behavior from M7-UI-05.
- Keep prototype dimensions: expanded sidebar `232px`, collapsed sidebar `68px`, topbar `52px`, nav item `36px`, bottom collapse control `40px`.
- Bottom collapse control remains stable at the bottom when the sidebar is visible; expanded visible text is `收起导航`; collapsed state uses rotated icon / equivalent owner behavior with accessible labels.

## Owner Confirmation Points And AI Agent Responsibilities

Owner/coordinator:

- Confirm this slice addresses the shared sidebar mismatch called out after page-level migration review.
- Keep final scope, owner visual acceptance, production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-08-shared-sidebar-calibration` on branch `codex/m7-ui-08-shared-sidebar-calibration`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Do not edit PR #182 conversations worktree, page-local conversation files, backend/API/DB, package/lock, CI/global config, owner HTML or unpacked source.
- Read AGENTS, PRODUCT, DESIGN, M7 UI ledger/index, UI-05/UI-06 specs/evidence, owner sidebar source files and current shared shell/tests before editing.
- Record preflight, source mapping, Impeccable result and validation honestly.

## Timebox

0.5 workday for spec, shared sidebar implementation, focused tests, evidence, validation and local commit. If the work requires page-local fixes, backend/API/DB/authz changes, package/lock changes, raw prototype import, global config/CI changes or root/main writes, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-08-shared-sidebar-calibration.md`
  - `docs/evidence/M7/M7-UI-08-shared-sidebar-calibration.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/shell/AppShell.tsx`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/src/shell/AppShellNavigation.tsx`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3
- source net LOC: <= 220
- new source files: <= 1
- test files changed: <= 2
- docs changed: <= 4
- package/lock/generated/backend/API/DB/worker/cron/CI/global config: 0
- binary screenshots/artifacts committed: 0
- external API/SDK/provider/connector/adapter basis: none; existing `lucide-react` icons and shell primitives only.
- new source file ownership: `apps/admin/src/shell/AppShellNavigation.tsx` is a shell-local helper for owner sidebar group metadata and focused sidebar group rendering; it keeps `AppShell.tsx` under the React file line limit without creating a parallel shell.
- exceptions: none.

## 文档触发检查

- 结果：`updated`。
- 判断依据：this PR changes shared admin shell/sidebar behavior, focused Playwright assertions and M7 evidence/ledger state.

## Required Reads / Source Mapping

Required reads before implementation:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/admin-ui-prototype-migration-index.md`
- `docs/evidence/M7/README.md`
- `docs/specs/M7-UI-05-layered-navigation-shell.md`
- `docs/specs/M7-UI-06-shared-shell-topbar-calibration.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `docs/evidence/M7/M7-UI-06-shared-shell-topbar-calibration.md`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx`
- `/Users/atilla/源码/unpacked 6/primitives/Icon.tsx`
- current `apps/admin/src/shell/AppShell.tsx`
- current `apps/admin/src/shell/AppShell.css`
- current `apps/admin/src/shell/AppShellIcons.ts`
- current `apps/admin/src/pages/registry.ts`
- focused admin Playwright tests.

Source mapping:

| Source | Required use |
|---|---|
| `unpacked 6/shell/navigation.ts` | Defines group labels and item membership: group `总览/平台/治理`; tenant `运营/数据/智能/管理/洞察`. |
| `unpacked 6/shell/NavSidebar.tsx` | Defines 232/68 rail, 52px brand header, grouped scroll body, 36px nav item and 40px bottom collapse affordance. |
| `unpacked 6/patterns/NavItem.tsx` | Confirms 36px item height, Lucide icon anatomy, collapsed labels hidden and badge hidden when collapsed. |
| `unpacked 6/primitives/Icon.tsx` | Confirms Lucide-only icon wrapper and `1.75` stroke width. |
| Current `AppShell.tsx` | Preserve M7-UI-05 route model and M7-UI-06 topbar; replace only flat layer nav rendering with owner-style grouped nav. |
| New `AppShellNavigation.tsx` | Owns owner-style sidebar group metadata and group rendering only; no route state, topbar, page body or backend behavior. |
| Current `AppShell.css` | Preserve existing tokenized dimensions; tune group labels and bottom collapse control. |
| Current focused tests | Assert active layer group headings, item labels, icon counts, collapse width and 320px fallback. |

## Impeccable / Product-Register Decision Record

| Decision | Status | Reason |
|---|---|---|
| Use owner `shell/navigation.ts` category groups as the sidebar IA source. | accepted | Matches the current prototype/source hierarchy and product-register guidance that task navigation should be familiar, dense and trustworthy. |
| Keep group and tenant nav trees mutually exclusive in rendered DOM. | accepted | Preserves M7-UI-05 governance separation and avoids misleading mixed-scope navigation. |
| Keep 232/68/52/36/40 shell dimensions and bottom collapse affordance. | accepted | Matches owner `NavSidebar.tsx` and keeps the shared shell stable for page workers. |
| Extract sidebar metadata/rendering into `AppShellNavigation.tsx`. | adapted | Keeps `AppShell.tsx` under the React file line limit while avoiding a parallel shell or unrelated icon-helper dumping. |
| Use existing `NavItem`, `IconSlot` and Lucide icon mapping. | accepted | Maintains the existing shared primitive/pattern vocabulary and avoids custom SVG/icon drift. |
| Generic visible `GROUP` / `TENANT` sidebar buckets. | rejected | Conflicts with owner category grouping and makes the sidebar less scannable. |
| Rendering the inactive layer and hiding it with CSS. | rejected | Violates the active-layer-only navigation contract and weakens accessible-nav separation. |
| Page-local conversation/sidebar fixes in this slice. | rejected | Out of scope; PR #182 conversation page must not own shared shell/sidebar calibration. |

## Navigation Contract

Group layer must render exactly:

- `总览`: `集团总览`, `模型/成本/风险`
- `平台`: `模板中心`, `连接中心`, `发布与验收`
- `治理`: `租户管理`, `集团日志`

Tenant layer must render exactly:

- `运营`: `对话`, `工单`, `确认队列`
- `数据`: `客户资产`, `订单`, `知识与资源`
- `智能`: `评测中心`, `AI 成员`
- `管理`: `团队`, `配置`
- `洞察`: `分析`, `日志`

Runtime rules:

- AppShell renders only the group list when `route.level === "group"`.
- AppShell renders only the tenant list when `route.level === "tenant"`.
- Do not render hidden opposite-layer nav via CSS.
- Do not alter `initialAdminPageId`, tenant selection default, back-to-group behavior or page body routing.
- Do not import backend packages into admin.

## Tests / Evidence Requirements

Implementation evidence must include:

- preflight `pwd`, `git status --short --branch`, `git branch --show-current`, `git branch --no-merged main` and open PR check or `gh` unavailable note;
- exact source mapping from owner navigation source;
- focused tests asserting active layer group headings and hidden opposite-layer headings/items;
- focused tests preserving 232px expanded, 68px collapsed, 7 group icons, 12 tenant icons and 320px no-overflow fallback;
- Impeccable context/detect command and result or exact local runtime blocker;
- validation command results.

Required validation:

- `git diff --check`
- `npm run format:check`
- `npm run guard:doc-triggers`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-08-shared-sidebar-calibration.md --include-worktree`
- `npm run lint`
- `npm run typecheck`
- `npm run build:admin`
- focused Playwright for `apps/admin/tests/m7-ui-foundation.spec.ts` and `apps/admin/tests/m7-ui-page-router.spec.ts`
- Impeccable detector for changed shell files.

## Pass Conditions

- `/design` starts in group layer/group overview and renders group categories only.
- Tenant selection enters tenant layer/tenant conversations and renders tenant categories only.
- Group release stays in group layer and tenant queue stays in tenant layer.
- Sidebar category labels and item order match owner source.
- Expanded bottom collapse text is `收起导航`; collapsed icon rotates or equivalent owner behavior remains; accessible labels remain.
- Dimensions remain 232/68/52/36/40.
- Mobile fallback at 320px has no horizontal overflow.
- Evidence/ledger are updated and validation is recorded.
- Branch is committed locally if validation is locally coherent.

## Failure Branch

- If assigned worktree/branch is wrong, stop and report `BLOCKED`.
- If root/main or another worktree is modified, stop and report impact; record an incident if policy threshold is met.
- If implementation requires backend/API/authz/DB/package/lock/CI/global config changes, stop and split a separate spec.
- If validation fails due to pre-existing unrelated repo debt, record the exact command/output and whether changed files are coherent.

## Out Of Scope

- No page-local conversation work or PR #182 fixes.
- No release acceptance page body work.
- No backend/API/authz/DB/worker/cron/package/lock/CI/global config changes.
- No registry route model redesign.
- No mobile redesign beyond readable/no-overflow fallback.
- No raw prototype import, fixture import or owner/unpacked source edits.
- No GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply, owner signoff fabrication or 1.0 release approval.

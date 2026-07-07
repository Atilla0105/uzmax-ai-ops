# M7-UI-102 Conversation Context Rail Source Parity

## Goal

Fix one visible `tenant.conversations` right context rail parity issue in the default synthetic conversation workbench. The rail header and profile tab must match the owner source for Dilnoza Rashidova: single `D` avatar initial, `@dilnoza_r` secondary ref, source profile rows, source-like customer tags, custom fields, dual-track items and bottom quick actions.

This slice is rail-only. It does not change the conversation workbench grid, AppShell, topbar, sidebar, list, thread header, composer, runtime availability semantics, API, DB, package metadata, lockfiles, global config, owner acceptance, GA-0, production readiness or 1.0 release approval.

## Owner / Source Boundary

- Visual source: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/customers.ts`, and `docs/admin-design-system.md`.
- Governance source: `AGENTS.md`, v1.1 source-of-truth docs and M7 visible UI specs/evidence.
- Owner source rail: 340px right panel, 42px avatar, source customer header, profile/custom field/tag/dual-track sections, and bottom 2x2 quick actions.
- Existing M7-UI-100 and M7-UI-101 evidence provide the current synthetic fallback route/open/geometry baseline for the same page.

## Owner Confirmation / Agent Responsibility

Owner/coordinator:

- Confirm this work is limited to source-parity of the `tenant.conversations` right customer context rail.
- Keep final visual acceptance, runtime closure, production, real customer/order data, LLM key, cost, compliance and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-102-conversation-context-rail-source-parity` on branch `codex/m7-ui-102-conversation-context-rail-source-parity`.
- Keep root/main checkout untouched and do not revert unrelated edits.
- Record worker preflight (`pwd`, `git status --short --branch`, `git branch --show-current`), source reads, validation and artifacts in evidence.
- Prefer local rail data/render correction; stop if AppShell/global shell/shared primitive/API/DB/package/lock/global config changes are required.

## Timebox

<= 0.25 workday. If this requires AppShell, global shell, shared primitive, API, DB, package, lockfile or global config changes, stop and report `BLOCKED`.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-102-conversation-context-rail-source-parity.md`
  - `docs/evidence/M7/M7-UI-102-conversation-context-rail-source-parity.md`
  - `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts`
  - `apps/admin/tests/m7-ui-102-conversation-context-rail-source-parity.spec.ts`
- Unlisted modules are out of scope.

## 变更预算与路径分类

- source changed files: <= 3
- source net LOC: <= 90
- new source files: 0
- test files added/changed: <= 1
- docs files added/changed: <= 2
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global shell/AppShell/shared primitive changes: 0
- exceptions: none

```yaml
source:
  - apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx
  - apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts
  - apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts
test:
  - apps/admin/tests/m7-ui-102-conversation-context-rail-source-parity.spec.ts
docs:
  - docs/specs/M7-UI-102-conversation-context-rail-source-parity.md
  - docs/evidence/M7/M7-UI-102-conversation-context-rail-source-parity.md
generated: []
lock: []
config: []
```

`rg` search conclusion before source changes: searched owner HTML, owner `ContextRail.tsx`, owner `customers.ts`, current conversation panels/runtime/fallback/styles/page/tests/locators and `docs/admin-design-system.md`. Existing `ContextRail` render/data helpers and synthetic fallback row are the correct ownership points; no new source file is needed.

External API/SDK/provider/connector/adapter basis: none.

## Implementation Requirements

- Header:
  - Avatar text is single source initial `D`, not generated `Di`.
  - Primary name is `Dilnoza Rashidova`.
  - Secondary ref is `@dilnoza_r`, not `CU-59284013`.
  - Stage chip remains `售后`.
- Profile tab rows:
  - `客户ID` = `CU-59284013`
  - `语言` = `乌兹别克语（拉丁）`
  - `旅程阶段` = `售后`
  - `累计订单` = `4 单 · ¥1,026`
  - `未决问题` = `退款`
  - `建档时间` = `2026-03-02`
  - The profile section must not show `未决工单`, `订单快照` or `报价记录`.
- Tags:
  - Show `VIP`, `退款敏感`, and `+ 添加` in the customer tag section.
  - Preserve source-like pill density without page-local token/color invention.
- Custom fields:
  - Preserve `客户来源 广告投放`, `偏好品类 面部护理`, `累计积分 1280`, `生日 —`.
- Dual track and quick actions:
  - Preserve `双轨引导` with `报价 06-25 · 教程旅程自动定位` and `售后 06-26 · 红线转人工`.
  - Preserve bottom 2x2 quick actions: `创建工单`, `生成报价`, `身份归并`, `完整档案`.

## Impeccable / Design Skill Layer

- Adopted: product-register guidance for dense, stable, familiar admin controls; rail data must serve operator context without decorative redesign.
- Adopted: owner-source rail density, profile field set, tags, custom fields, dual-track rows and quick-action structure.
- Rejected: redesigning the workbench, changing global shell/grid columns, exposing runtime-unavailable copy in the visible rail header/profile, reviving legacy `--uzmax-*` visual language or expanding runtime/API contracts beyond local optional source-profile fields.

## Validation Plan

- `git diff --check`
- Focused Playwright: `apps/admin/tests/m7-ui-102-conversation-context-rail-source-parity.spec.ts`
- `npm run typecheck`
- `npm run build:admin`
- If time permits: `npm run lint`
- If time permits: `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui`
- Capture screenshots and metrics under `/tmp/uzmax-m7-ui-102-conversation-context-rail-source-parity/`.

## Non-Goals

- No AppShell/sidebar/topbar/grid changes.
- No API/DB/authz/backend/package/lock/global config/shared primitive work.
- No release/acceptance page work.
- No owner visual acceptance, runtime closure, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

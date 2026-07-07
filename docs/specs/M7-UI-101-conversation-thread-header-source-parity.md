# M7-UI-101 Conversation Thread Header Source Parity

## Goal

Fix one visible `tenant.conversations` header parity issue: at 1280px desktop width the conversation thread identity must not collapse to `D.` / `T...`. The compact 46px owner-source header must keep `Dilnoza R.` and `Telegram Bot` or `Telegram` readable while preserving compact status badges, SLA chip and action controls.

This slice is a header-only visual fix. It does not change the conversation workbench grid, AppShell, runtime, fallback data, handoff semantics, API, DB, package metadata, lockfiles, owner acceptance, GA-0, production readiness or 1.0 release approval.

## Owner / Source Boundary

- Visual source: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx`, and `docs/admin-design-system.md`.
- Governance source: `AGENTS.md`, v1.1 source-of-truth docs and M7 visible UI specs/evidence.
- Owner source header: 46px high, `padding: 0 18px`, compact title/subtitle, status chip, SLA chip, `接管会话 T` action and more icon.
- Existing M7-UI-100 evidence provides the current synthetic default text/geometry target for the same page.

## Owner Confirmation / Agent Responsibility

Owner/coordinator:

- Confirm this work is limited to source-parity of the conversation thread header.
- Keep final visual acceptance, runtime closure, production, real customer/order data, LLM key, cost, compliance and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-101-conversation-thread-header-source-parity` on branch `codex/m7-ui-101-conversation-thread-header-source-parity`.
- Keep root/main read-only and do not revert unrelated edits.
- Record worker preflight (`pwd`, `git status --short --branch`, `git branch --show-current`), source reads, validation and artifacts in evidence.
- Prefer CSS-only correction and do not change `.uz-page-conversations` grid columns or AppShell.

## Timebox

0.25 workday. If the fix requires AppShell, grid-column, runtime/data, primitive, lockfile or global config changes, stop and report `BLOCKED`.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-101-conversation-thread-header-source-parity.md`
  - `docs/evidence/M7/M7-UI-101-conversation-thread-header-source-parity.md`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/tests/m7-ui-101-conversation-thread-header-source-parity.spec.ts`
- Unlisted modules are out of scope.

## 变更预算与路径分类

- source changed files: <= 1
- source net LOC: <= 40
- new source files: 0
- test files added/changed: <= 1
- docs files added/changed: <= 2
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global shell/AppShell/shared primitive changes: 0
- exceptions: none

```yaml
source:
  - apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx
test:
  - apps/admin/tests/m7-ui-101-conversation-thread-header-source-parity.spec.ts
docs:
  - docs/specs/M7-UI-101-conversation-thread-header-source-parity.md
  - docs/evidence/M7/M7-UI-101-conversation-thread-header-source-parity.md
generated: []
lock: []
config: []
```

`rg` search conclusion before source changes: searched the current conversation styles/panels/tests, synthetic fallback data, owner `MessageThread.tsx`, `M7-UI-100` spec/evidence and primitive button/badge CSS. The existing thread header component and CSS are the correct ownership point; no new source file is needed.

External API/SDK/provider/connector/adapter basis: none.

## Implementation Requirements

- CSS-only if possible.
- Keep `.uz-page-conversations` desktop grid columns and AppShell untouched.
- Keep the compact 46px header geometry.
- Default synthetic header primary text must include readable `Dilnoza R.` and readable `Telegram Bot` or `Telegram`, plus `待人工`, `SLA 04:12`, `AI 已暂停`, `接管会话`, `T`.
- Default synthetic header primary text must not include visible `只读预览`, `runtime-unavailable` or `放回 AI`.
- At `1280x800` and `1280x840`, geometry remains nav `232`, topbar `52-53`, list `316`, thread `391-393`, rail `340`, body scroll width `<= 1280`.
- Mobile `320px` fallback has no horizontal overflow.

## Impeccable / Design Skill Layer

- Adopted: product-register guidance for dense, stable, familiar admin controls; source-derived header identity remains readable before status/action chrome; no decorative change, no new motion, no new color vocabulary.
- Adopted: owner-source header dimensions and compact action treatment.
- Rejected: redesigning the conversation workbench, changing shell/grid columns, moving hidden degraded evidence into visible header copy, or reviving legacy shell visual language because this slice is header source parity only.
- Detector result before edit: `[]` for `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`.

## Validation Plan

- `git diff --check`
- Focused Playwright: `apps/admin/tests/m7-ui-101-conversation-thread-header-source-parity.spec.ts`
- Existing M7-UI-100 Playwright test if feasible.
- Capture screenshots and metrics under `/tmp/uzmax-m7-ui-101-conversation-thread-header-source-parity/`.

## Non-Goals

- No runtime/API/DB/authz/package/lock/global config/AppShell/grid work.
- No fallback data, composer, list, rail or handoff behavior changes.
- No owner visual acceptance, runtime closure, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

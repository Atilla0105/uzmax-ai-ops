# M7-UI-58 Conversation Viewport Parity v2

## Goal

Cleanly replay accepted `M7-UI-58 conversation viewport parity v2` changes as a narrow clean-stack branch based on `origin/codex/m7-ui-31-orders-visible-ui` at `01388a0c428a9b07c981367d91ebb445b0465e74`.

This slice fixes a visible UI viewport parity issue for `tenant.conversations`: the desktop shell/body must remain locked to the viewport while the conversation list, thread and context rail scroll internally.

## Owner / Source Boundary

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`, related unpacked conversation components, and `docs/admin-design-system.md`.
- Old #200 head `7b401f647f47df4aac2ced8a27a11c0201037f0f` was inspected only as allowed-path source material.
- No branch from `codex/m7-ui-56-*`, `codex/m7-ui-58-*` or later failed stack is merged or cherry-picked.
- This is a UI-first visible fix for the existing `M7-UI-20` conversation candidate surface on the M7-UI-31 visible baseline.
- No owner visual acceptance, conversation runtime closure, merge closure, GA-0, production readiness or 1.0 release approval is claimed.

## Timebox

One focused worker slice. If desktop viewport lock cannot be fixed without redesigning the page or touching runtime/API/DB work, stop and record `blocked_by_viewport_parity_scope`.

## Spec 类型

fix

## 触碰模块/文件

- Touch module set (machine-readable glob/path, one line each; `guard:pr-shape` reads this list):
  - `docs/specs/M7-UI-58-conversation-viewport-parity.md`
  - `docs/evidence/M7/M7-UI-58-conversation-viewport-parity.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source budget: changed source files <= 2, net source LOC <= 80, new source files <= 0.
- expected non-source changes:

```yaml
source:
  - apps/admin/src/shell/AppShell.css
  - apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx
test:
  - apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts
docs:
  - docs/specs/M7-UI-58-conversation-viewport-parity.md
  - docs/evidence/M7/M7-UI-58-conversation-viewport-parity.md
  - docs/admin-ui-page-migration-ledger.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

- `rg` search conclusion before source changes: searched `M7-UI-58`, `conversation viewport`, `tenant.conversations`, `uz-app-shell`, `uz-app-main`, `uz-shell-workspace`, `uz-conversation-outlet`, `bodyScrollHeight`, owner HTML and unpacked conversation source. Existing shell/workspace/outlet and conversation workbench styles already exist; no new source file is needed.
- External API/SDK/provider/connector/adapter basis: none. This slice intentionally does not call API/DB/runtime or external providers.
- Exceptions: none.

## Preconditions

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-58-conversation-viewport-parity-cleanstack`.
- Branch: `codex/m7-ui-58-conversation-viewport-parity-cleanstack`.
- Base: `origin/codex/m7-ui-31-orders-visible-ui`.
- Base SHA verified: `01388a0c428a9b07c981367d91ebb445b0465e74`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, `git branch --show-current`, and `git rev-parse HEAD`.

## Implementation Steps

1. Inspect AGENTS, v1.1 source-of-truth docs, design context, owner unpacked conversation source, current shell/outlet/conversation CSS and old #200 allowed-path content.
2. Add shell/workspace/outlet desktop height constraints so `.uz-app-shell`, `.uz-app-main`, `.uz-shell-workspace`, `.uz-conversation-outlet` and `.uz-page-conversations` form a definite-height chain.
3. Set the desktop conversation workbench middle column to shrink within the shell workspace while preserving fixed list `316px` and rail `340px`.
4. Preserve mobile fallback by keeping the mobile shell block layout and allowing body vertical scroll where needed.
5. Add focused viewport parity Playwright coverage that captures desktop, collapsed and mobile screenshots plus geometry metrics.
6. Record validation output and pushed branch head.

## Pass Conditions

- At desktop `1280x840`, `activePageId=tenant.conversations`, `shellLevel=tenant`, `bodyScrollWidth <= 1280`, `bodyScrollHeight <= 840`, `nav.y=0`, `topbar.y=0`, expanded nav width `232`, collapsed nav width `68`, `workbench.width <= workspace.width`, right rail edge `<= 1280`, rows `>=8`, messages `>=1`, and workbench height approximately `787`.
- Conversation workbench preserves `316px / minmax / 340px` desktop columns.
- Collapsing the sidebar does not move nav/topbar above viewport and does not introduce body overflow.
- Mobile `320px` fallback remains readable with `bodyScrollWidth <= 320`; body vertical scroll is allowed.
- Default degraded fixture with no API still renders synthetic rows/messages and remains visibly degraded/read-only.
- Evidence artifacts are written under `/tmp/uzmax-m7-ui-58-conversation-viewport-parity-v2/`.

## Failure Branches

- If owner-source-like desktop geometry cannot be preserved without redesign, keep the existing page behavior and record remaining deltas.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

## Non-Goals

- No DB/API/runtime/authz/customer-data/LLM/provider work.
- No redesign of conversation layout, shell navigation, topbar, tenant switcher, fallback data, runtime client or handoff behavior.
- No cleanup, rescue, merge or readiness action for old #200-#238 draft stack.
- No owner visual acceptance, conversation runtime closure, merge closure, GA-0, production readiness or release approval.
- No changes to lockfiles, DB/API/backend, global config, old release pages or unrelated pages.

## Acceptance Mapping

- PRD: REQ-T01 conversation workbench filters/status; REQ-C02 Business draft must remain待确认; REQ-C03 takeover semantics.
- Admin architecture: three-column `会话列表 / 对话线程+草稿区 / 上下文面板`; human-needed and SLA-risk stay pinned; mobile is fallback only; conversation lists/messages/logs must scroll internally.
- Acceptance matrix: D-01 conversation filter/SLA risk visibility remains an automated UI concern, while this slice only covers viewport containment.

## Impeccable / Design Skill Layer

- Adopted: product UI should stay task-locked and operational on desktop; scroll belongs inside dense workbench panes, not on the global body; mobile may degrade structurally as fallback; no decorative layout change is introduced.
- Rejected: old shell visual inheritance, old `--uzmax-*` visual source, page redesign, runtime/API fixture forcing, production-looking data, owner-acceptance copy, old failed-stack topology and release/runtime closure claims because this slice is a clean viewport parity fix only.

## Closeout / Incident Record

- Incident: none planned.

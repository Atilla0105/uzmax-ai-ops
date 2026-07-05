# M7-UI-58 Conversation Viewport Parity

## 目标

Fix a narrow visible UI viewport parity issue for `tenant.conversations` on top of `codex/m7-ui-56-logs-visible-ui`: desktop shell/body must remain viewport-locked while the conversation list, thread and context rail scroll internally.

## Owner

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`, related unpacked conversation components, and `docs/admin-design-system.md`.
- This is a UI-first visible polish/fix for the existing `M7-UI-20` conversation candidate stack.
- It preserves tenant-layer navigation, sidebar category grouping, topbar, tenant switcher, three-column conversation workbench, degraded/mock fallback and runtime/fallback logic.
- No owner visual acceptance, conversation runtime closure, merge closure, GA-0, production readiness, or 1.0 release approval is claimed.

## 时间盒

One focused worker slice. If desktop viewport lock cannot be fixed without redesigning the page or touching runtime/API/DB work, stop and record `blocked_by_viewport_parity_scope`.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-58-conversation-viewport-parity.md`
  - `docs/evidence/M7/M7-UI-58-conversation-viewport-parity.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/tests/m7-ui-conversation-viewport-parity.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 80、new source files <= 0。
- test/generated/lock/config/docs 预计变更：

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

- 新增 source 文件前的 `rg` 搜索结论和归属理由：searched `uz-app-shell`, `uz-app-main`, `uz-shell-workspace`, `uz-conversation-outlet`, `tenant.conversations`, `m7-ui-conversation`, `bodyScrollHeight`, and owner unpacked conversation source. Existing shell/workspace and conversation workbench styles already exist; no new source file is needed.
- 外部 API/SDK/provider/connector/adapter 依据：无。This slice intentionally does not call API/DB/runtime or external providers.
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`.
- 判断依据：new visible UI fix spec plus evidence, M7 evidence index and page migration ledger status note.

## 前置条件

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-58-conversation-viewport-parity`.
- Branch: `codex/m7-ui-58-conversation-viewport-parity`.
- Base verified: `origin/codex/m7-ui-56-logs-visible-ui`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, `git branch --show-current`, and `git branch --no-merged main`.

## 实施步骤

1. Inspect AGENTS, design context, owner unpacked conversation source, current shell/outlet/conversation CSS and current conversation Playwright tests.
2. Add shell/workspace/outlet desktop height constraints so `.uz-app-shell`, `.uz-app-main`, `.uz-shell-workspace`, `.uz-conversation-outlet` and `.uz-page-conversations` form a definite-height chain.
3. Set the desktop conversation workbench middle column to shrink within the shell workspace while preserving fixed list `316px` and rail `340px`.
4. Preserve mobile fallback by keeping the mobile shell block layout and allowing body vertical scroll where needed.
5. Add focused viewport parity Playwright coverage that captures desktop, collapsed and mobile screenshots plus geometry metrics.
6. Record evidence and validation output.

## 通过条件

- At desktop `1280x840`, `activePageId=tenant.conversations`, `shellLevel=tenant`, `bodyScrollWidth <= 1280`, `bodyScrollHeight <= 840`, `nav.y=0`, `topbar.y=0`, expanded nav width `232`, collapsed nav width `68`, `workbench.width <= workspace.width`, right rail edge `<= 1280`, rows `>=8`, messages `>=1`, and workbench height approximately `787`.
- Conversation workbench preserves `316px / minmax / 340px` desktop columns.
- Collapsing the sidebar does not move nav/topbar above viewport and does not introduce body overflow.
- Mobile `320px` fallback remains readable with `bodyScrollWidth <= 320`; body vertical scroll is allowed.
- Default degraded fixture with no API still renders synthetic rows/messages and remains visibly degraded/read-only.
- Evidence artifacts are written under `/tmp/uzmax-m7-ui-58-conversation-viewport-parity/`.

## 失败分支

- If owner-source-like desktop geometry cannot be preserved without redesign, keep the existing page behavior and record remaining deltas.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

## 不做什么

- No DB/API/runtime/authz/customer-data/LLM/provider work.
- No redesign of conversation layout, shell navigation, topbar, tenant switcher, fallback data, runtime client or handoff behavior.
- No owner visual acceptance, conversation runtime closure, merge closure, GA-0, production readiness or release approval.
- No changes to lockfiles, DB/API/backend, global config, old release pages or unrelated pages.

## 验收映射

- M7 visible UI migration viewport parity for `tenant.conversations`.
- This only fixes shell/body viewport behavior for the visible conversation candidate; it does not change the underlying M7-UI-20 runtime status.

## Impeccable / Design Skill Layer

- Adopted: product UI should stay task-locked and operational on desktop; scroll belongs inside the dense workbench panes, not on the global body; mobile may degrade structurally as a fallback; no decorative layout change is introduced.
- Rejected: old shell visual inheritance, old `--uzmax-*` visual source, page redesign, runtime/API fixture forcing, production-looking data, owner-acceptance copy, and release/runtime closure claims because this slice is a viewport polish fix only.

## Closeout / Incident 记录

- Incident: none planned.

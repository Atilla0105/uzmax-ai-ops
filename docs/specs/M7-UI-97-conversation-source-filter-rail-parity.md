# M7-UI-97 Conversation Source Filter Rail Parity

## Goal

Repair a narrow visible parity slice on the tenant conversation workbench:

- Tenant conversation filters match the owner source labels and order.
- Default all-filter list count reads as a source-like single total.
- Right rail prioritizes customer source sections before quick actions, with notes kept after.

## Source Mapping

- Owner source filters: `/Users/atilla/源码/unpacked 6/hooks/useConversationWorkbench.ts`
- Owner source list header: `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationList.tsx`
- Owner source rail order: `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx`
- Runtime fixture shape: `/Users/atilla/源码/unpacked 6/fixtures/conversations.ts`

## Scope

Allowed paths:

- `apps/admin/src/pages/conversations/ConversationsPage.tsx`
- `apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts`
- `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts`
- `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx`
- `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
- `apps/admin/tests/m7-ui-97-conversation-source-filter-rail-parity.spec.ts`
- `docs/specs/M7-UI-97-conversation-source-filter-rail-parity.md`
- `docs/evidence/M7/M7-UI-97-conversation-source-filter-rail-parity.md`

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/conversations/ConversationsPage.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/tests/m7-ui-97-conversation-source-filter-rail-parity.spec.ts`
  - `docs/specs/M7-UI-97-conversation-source-filter-rail-parity.md`
  - `docs/evidence/M7/M7-UI-97-conversation-source-filter-rail-parity.md`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/conversations/ConversationsPage.tsx
  - apps/admin/src/pages/conversations/conversationWorkbenchFallback.ts
  - apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts
  - apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx
  - apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx
test:
  - apps/admin/tests/m7-ui-97-conversation-source-filter-rail-parity.spec.ts
docs:
  - docs/specs/M7-UI-97-conversation-source-filter-rail-parity.md
  - docs/evidence/M7/M7-UI-97-conversation-source-filter-rail-parity.md
generated: []
lock: []
config: []
```

## Runtime Boundary

This is a visible UI repair only. Conversation data may still be synthetic/degraded in local preview; Business send, handoff execution, customer aggregation, and live runtime APIs remain guarded by existing disabled/degraded markers.

## Acceptance

- Filter row labels/order: `全部`, `待人工`, `SLA风险`, `我接管`, `AI处理`.
- Removed visible filters: `未读`, `未回`, `已解决`.
- Synthetic fallback counts are source-like: all `8`, needs `1`, SLA risk `3`, mine `1`, AI `3`.
- Header badge is declarative in `ConversationList`: all-filter shows `8`, non-all shows `visible / 8`.
- Right rail source sections appear before `快捷动作`; `人工备注` is retained after quick actions and collapsed by default.
- Desktop geometry preserves tenant route, 316px list, and 340px rail.
- Mobile 320px page body has no horizontal overflow.

# M7-UI-60 Conversation Workbench Detail Parity

## Goal

Implement a narrow visible-UI high-fidelity polish slice for `tenant.conversations` on top of the current visible UI trunk, `origin/codex/m7-ui-31-orders-visible-ui` including #248 / M7-UI-62B tenant-entry visible proof.

This slice tightens the real tenant conversation workbench detail surface against the owner HTML and unpacked conversation source: list density, selected-row treatment, compact thread/header/messages/AI trace/composer, context rail density, fixed footer quick actions, desktop viewport lock and mobile no-overflow fallback.

It uses mock/degraded UI only and does not add or claim DB/API/runtime foundation, WebSocket closure, customer-context aggregation, Business send, human external send, owner final visual acceptance, production readiness, GA-0 or 1.0 release approval.

## Owner / Agent Boundary

- Owner HTML visual source: `/Users/atilla/Downloads/运营塔台1.0.html`.
- Unpacked source references: `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`, `ConversationList.tsx`, `MessageThread.tsx`, `ContextRail.tsx`, `Composer.tsx`, and `/Users/atilla/源码/unpacked 6/fixtures/conversations.ts`.
- Supporting design source: `docs/admin-design-system.md`.
- Governance source: `AGENTS.md`, `UZMAX智能运营系统-PRD-v1.1.md`, `UZMAX智能运营系统-技术架构-v1.1.md`, `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`, `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`.
- Agent works only in `/Users/atilla/.codex/worktrees/m7-ui-60-conversation-detail-parity-cleanstack` on branch `codex/m7-ui-60-conversation-detail-parity-cleanstack`.
- Root/main checkout is read-only coordination only.
- Preserve the owner instruction: visible UI must follow owner HTML/unpacked source; no assistant-invented layout, old shell visual carryover or runtime invention.
- Group/tenant separation is already proved by M7-UI-62B and must not regress: default group layer, selected tenant entry into `tenant.conversations`, tenant-only sidebar/topbar/context and no mixed universal dashboard fallback.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-60-conversation-detail-parity.md`
  - `docs/evidence/M7/M7-UI-60-conversation-detail-parity.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx`
  - `apps/admin/tests/m7-ui-conversation-detail-parity.spec.ts`
- 未列出的模块默认不可改。

## Budget

- source changed files <= 2.
- source net LOC <= 160.
- new source files = 0.
- test changed files <= 1.
- docs changed files <= 4.
- generated/lock/config/backend/API/DB/worker/cron/shared shell/tokens/primitives/patterns = 0.
- external API/SDK/provider/connector/adapter basis: none.
- exceptions: none.

## Source Mapping

| Source | Required Use |
|---|---|
| Owner HTML browser render | Compare first viewport geometry, visible row count, rail containment, sidebar grouping/bottom collapse and overall density when the frozen local file exists. CI may not have this local file, so tests must write an unavailable artifact and continue React assertions. |
| `ConversationList.tsx` | Preserve `316px` list, `46px` header, `8px 12px` filter row, `11/14/11/16` row padding, `22px` avatar, single-line preview, status/SLA metadata. |
| `MessageThread.tsx` | Preserve compact `46px` header, compact action buttons, centered system pill, inbound/outbound bubbles, AI trace table and scroll-owned message body. |
| `Composer.tsx` | Preserve source-like draft state, compact textarea, attachment/snippet tools, language/redline meta and confirm/send action rhythm while disabled for missing runtime. |
| `ContextRail.tsx` | Preserve `340px` rail, `16px` header, `9px/11px` tabs, `14px/16px` sections, tags/custom fields/dual-track/notes density and fixed footer quick actions. |
| M7-58 evidence | Preserve desktop `1280x840` body lock, list `316`, rail `340`, rail right edge <= viewport and mobile no horizontal overflow. |
| M7-62B evidence | Preserve group/tenant separation, tenant entry into `tenant.conversations`, active-layer-only nav trees and no mixed dashboard fallback. |

## Implementation Plan

1. Re-read AGENTS, v1.1 docs, `docs/admin-design-system.md`, M7-20/58/62B specs/evidence, owner HTML, unpacked conversation source and current React conversation page/tests.
2. Use page-local CSS first; touch `conversationWorkbenchPanels.tsx` only if needed for the source-like fixed rail action footer.
3. Add a focused Playwright spec that captures owner HTML where available, React screenshots at `1280x840`, React mobile `320px`, and concrete layout/density metrics under `/tmp/uzmax-m7-ui-60-conversation-detail-parity/`.
4. Record three-way comparison evidence and validation results.

## Pass Conditions

- At `1280x840`, `tenant.conversations` desktop keeps M7-58 geometry: nav `232`, topbar `53`, list `316`, rail `340`, rail right edge <= `1280`, `bodyScrollWidth <= 1280`, `bodyScrollHeight <= 840`.
- M7-UI-62B group/tenant separation remains intact; tenant conversation detail never falls back to mixed group+tenant navigation.
- Conversation list shows source-like header/filter rhythm, at least 8 visible rows, selected-row status stripe, aligned badges and ellipsized preview text without oversized card feel.
- Thread shows compact participant header/actions, centered internal/system pill, inbound/outbound bubbles, AI trace table and visible composer/draft area without global body scroll.
- Context rail shows avatar/header, tabs, profile/tags/custom fields/guidance/notes and fixed footer quick actions; rail scrolls internally and is not clipped.
- Mobile `320px` remains readable with no horizontal overflow; pixel parity is not required.
- `mock`/`degraded` labels remain truthful but visually secondary to the primary workflow; this slice remains mock/degraded UI only.

## Failure Branch

- If detail parity requires AppShell, token, primitive, pattern, backend/API/DB/runtime or lockfile changes, stop and record `blocked_by_scope`.
- If browser validation reveals remaining visual deltas, record them without claiming owner acceptance.
- If validation is blocked by environment tooling, record exact command/output and do not claim full closure.

## Out Of Scope

- No `AppShell.css`, navigation, token, primitive, pattern, backend/API/DB/runtime, package/lock, CI/config or production/staging changes.
- No page redesign, assistant-invented layout, new runtime state, new API client, fixture-as-runtime expansion or raw prototype source import.
- No owner acceptance, runtime closure, release closure, GA-0, production readiness or real customer/order-data use.

## Impeccable / Design Skill Layer

- Adopted: dense product UI, status-first hierarchy, source-derived spacing/typography, internal scroll ownership, mobile fallback only and visible degraded/runtime honesty.
- Rejected: old shell visual language, old `--uzmax-*` as visual target, decorative redesign, loud mock/degraded banners, runtime/API invention and owner-acceptance claims.

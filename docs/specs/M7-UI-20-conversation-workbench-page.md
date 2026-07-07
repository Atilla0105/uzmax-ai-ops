# M7-UI-20 Conversation Workbench Page

## 目标

Create the page-level migration contract for the real tenant operational 对话工作台 page (`tenant.conversations`).

This is a high-value admin page contract, not a transitional governance/release page. It prepares the implementation worker to migrate the first tenant operations workbench after the already-merged confirmation queue. This PR is spec/docs only: it may add this spec, a short M7 evidence stub, the M7 README queue update and the page-migration ledger update for `tenant.conversations`. It must not implement React pages, route rendering, API hooks, tests, CSS, backend/API/runtime changes, package/lock changes, DB/schema changes, CI/global config changes, screenshots, copied prototype fixtures or source code.

The later implementation phase may not start until the coordinator reviews this spec, confirms `tenant.conversations` is still the active target, and confirms the worktree/branch/touch-list do not conflict with other page workers. PR #178 / `M7-UI-11-release-acceptance-page` remains Draft/Paused and must not be edited by this worker.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this PR is a spec/evidence/ledger contract only.
- Confirm `发布与验收` is paused as a transitional owner/governance page and is not the next high-value migration blocker.
- Confirm the next implementation target after the already-merged confirmation queue is the tenant 对话工作台.
- Decide whether missing conversation/admin runtime contracts should be implemented in the page worker or split first; AI agents must not invent runtime truth.
- Keep final scope, production/staging, real customer/order data, customer LLM, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-spec` on branch `codex/m7-ui-20-conversation-workbench-spec`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Do not touch PR #178, its branch, its worktree or its files.
- Read `AGENTS.md`, v1.1 source-of-truth docs, admin design system, M7 ledger/evidence, current registry/shell/runtime clues, M2/M6B conversation contracts, and all owner prototype conversation sources before drafting.
- Record entry evidence and `rg` conclusions in this spec/evidence.
- Draft a decision-complete source mapping, page matrix, runtime integration plan, state coverage, visual rules, evidence plan, PR hygiene and sequencing gate.
- Do not implement or test the page in this spec-only PR.

## 时间盒

0.25 workday for the spec-only PR. If drafting requires source implementation, backend/API changes, package/lock updates, raw fixture copying, DB/schema changes, CI/global config changes, release/production action or PR #178 edits, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-20-conversation-workbench-page.md`
  - `docs/evidence/M7/M7-UI-20-conversation-workbench-page.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/admin-ui-prototype-migration-index.md`
  - `apps/admin/src/pages/conversations/**`
  - `apps/admin/src/App.tsx`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench.spec.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`
  - `apps/admin/tests/conversationWorkbenchLocators.ts`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`
  - `apps/admin/tests/helpers/openLegacyEvidence.ts`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
- 说明/备注：
  - The original spec-only phase touched only the docs paths above.
  - The implementation/retest phase may touch the listed `apps/admin` page/test paths after coordinator approval.
  - `apps/admin/src/App.tsx` is allowed only for selectedTenantId propagation into `PageOutlet`; this is not permission for AppShell/global shell work.
  - Coordinator-approved test-scope expansion: `apps/admin/tests/helpers/openLegacyEvidence.ts` and `apps/admin/tests/m7-ui-foundation.spec.ts` are allowed only for narrow full-suite compatibility after `tenant.conversations` stops rendering the scaffold. This is test/helper compatibility only.
  - Coordinator-approved fallback split: `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts` is allowed only because max-lines lint required splitting no-API fallback coverage out of the main workbench spec. This does not expand runtime/source scope.
  - Coordinator-approved locator-helper dedupe: `apps/admin/tests/conversationWorkbenchLocators.ts` is test-only Playwright locator helper extraction so `jscpd` can pass without duplicating locator code across focused conversation specs.
  - This expansion does not permit changes to shared shell, shared tokens, shared primitives, shared patterns, `AppShell`, global config, backend/API routes, WebSocket contracts, customer asset/order/quote clients, package/lock, CI/guard scripts or DB/schema. If any of those are required, stop and split to a separate approved spec.
- 未列出的模块默认不可改。

## 变更预算与路径分类

Spec-only PR budget:

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed: 0
- docs changed: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- binary screenshots/artifacts: 0

Future implementation budget after coordinator approval:

- source changed files: <= 5
- source net LOC: <= 600
- new source files: <= 3
- test files changed: <= 6 focused/admin-compatibility Playwright specs/helpers. The fifth test file is `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`, split out only because max-lines lint required no-API fallback coverage to leave the main workbench spec; the sixth is `apps/admin/tests/conversationWorkbenchLocators.ts`, a test-only locator helper extracted for `jscpd` dedupe.
- docs changed: <= 5 evidence/ledger/index/spec/M7 README updates
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- external API/SDK/provider/connector/adapter basis: none; use existing internal admin/API contracts, repo evidence and approved follow-up specs only.
- exceptions: `large_change_exception` is permitted only through PR metadata/review for the existing page-local implementation size overage. The only approved test-scope expansions are the helper/foundation compatibility pair, the fallback-spec max-lines split and the test-only locator-helper dedupe listed above. Runtime/API gaps, shared shell/tokens/primitives/patterns/AppShell/global config, backend/API, WebSocket, package/lock, CI/guard or DB/schema changes still require a separate approved spec.

## `rg` search conclusions before drafting

- `rg -n "conversation|Conversation|ticket|Ticket|handoff|SLA|sla|takeover|AI" apps packages docs/specs ...`
  - Found backend `apps/api/src/conversation-ticket.*` contract files, old `apps/admin/src/M2ConversationTicketShell.tsx`, M2/M6B conversation specs/evidence, registry row `tenant.conversations`, shell default route to `tenant.conversations`, and no M7 conversation page/client/hook.
  - Conclusion: later implementation must prefer the existing conversation/ticket API contract when truthful, but the old M2 shell is legacy evidence and must not be visually copied as the M7 page.
- `rg --files | rg 'conversation|Conversation|ticket|Ticket|handoff|runtime|ApiClient|hooks|registry|AppShell'`
  - Found admin API-client patterns for confirmation queue, AI members, logs, template copy, customer assets and order import; no `conversationApiClient` / `useConversationWorkbench` in the repo admin source.
  - Conclusion: if the implementation needs an admin conversation client/hook, it must wrap the existing `conversation-ticket` API truth or declare read-only/degraded behavior; it must not create fixture runtime.
- `rg -n "tenant\\.conversations|M7-UI-04H|M7-UI-20|M7-UI-11|M7-UI-10|UI-05" docs apps/admin/src`
  - Found stale ledger/README wording: UI-05 still marked pending despite current `main` HEAD `8804414 Implement M7 UI layered navigation shell`; UI-10 is merged to main; UI-11 / PR #178 is a Draft/Paused transitional implementation candidate that is not merged to main or owner accepted.
  - Conclusion: this PR updates the ledger/index enough to make UI-05 mandatory baseline, UI-10 already merged, UI-11 paused, and `tenant.conversations` the next high-value target without claiming implementation.
- `rg -n "对话工作台|会话|接管会话|AI 轨迹|Business 草稿|客户档案|SLA|待人工|tenant\\.conversations|conversations" /Users/atilla/Downloads/运营塔台1.0.html /Users/atilla/源码/unpacked\ 6/pages/conversations -S`
  - Found owner prototype conversation regions and behavior in the unpacked sources; owner HTML is bundled/compressed but includes the same conversation page state fields and route mapping.
  - Conclusion: use owner HTML plus unpacked conversation components for structure and first-viewport comparison only; do not copy raw fixtures, inline styles or local demo state as runtime truth.

## 文档触发检查

updated

## 前置条件

Required reads completed for this spec-only PR:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/specs/M7-UI-05-layered-navigation-shell.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `docs/specs/M7-UI-10-confirmation-queue-page.md`
- `docs/evidence/M7/M7-UI-10-confirmation-queue-page.md`
- `docs/specs/M7-UI-11-release-acceptance-page.md`
- `docs/evidence/M7/M7-UI-11-release-acceptance-page.md`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/api/src/conversation-ticket.types.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/admin/src/M2ConversationTicketShell.tsx` as legacy evidence only
- all read-only conversation prototype files listed below
- Impeccable skill context and product register with the product/admin register selected.

Source mapping:

| Source | Required use |
|---|---|
| `/Users/atilla/Downloads/运营塔台1.0.html` | Owner HTML visual reference. Compare the first viewport for tenant sidebar, conversation list, message thread, AI trace affordance, composer/draft area, customer context rail, SLA and handoff/takeover regions. |
| `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx` | Primary page structure: three-column workbench, state overlay, keyboard contract, tenant route body and context callbacks. |
| `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationList.tsx` | Conversation list anatomy: 316px column, title/count/filter/sort toolbar, filters with live counts, pinned human/SLA risk ordering, avatar/status/SLA row metadata. |
| `/Users/atilla/源码/unpacked 6/pages/conversations/MessageThread.tsx` | Thread anatomy: 46px header, customer subtitle, status/SLA chips, takeover/handback/reopen actions, system/customer/AI/human bubbles, voice transcription states, expandable AI trace. |
| `/Users/atilla/源码/unpacked 6/pages/conversations/Composer.tsx` | Composer anatomy: AI processing, Business draft confirmation/edit, human reply, done/reopen modes, attachment/snippet tools, Cmd/Ctrl+Enter and Esc behavior. |
| `/Users/atilla/源码/unpacked 6/pages/conversations/ContextRail.tsx` | Customer rail anatomy: 340px context rail, profile/tickets/orders/quotes tabs, customer fields/tags/notes, related ticket/order/quote summaries and quick actions. |
| `apps/api/src/conversation-ticket.*` | Existing API contract reference for conversation list/detail, handoff ticket creation and ticket actions. It is not a full M7 admin workbench client and currently uses in-memory repository wiring unless later runtime evidence proves otherwise. |
| `apps/admin/src/M2ConversationTicketShell.tsx` | Legacy evidence only. Do not copy layout, legacy CSS, copy style or synthetic shell behavior into M7 page. |
| `apps/admin/src/pages/registry.ts`, `apps/admin/src/shell/AppShell.tsx` | Confirms `tenant.conversations` is a tenant-layer page and tenant selection defaults to this page after UI-05. |

v1.1/doc references:

- PRD: REQ-T01 对话工作台; REQ-T02 工单闭环; REQ-T03 客户资产中心; REQ-T13 字段与标签; REQ-C03 接管语义; NG-06 no LLM numerical judgment; NG-07 routing by presence/permissions/SLA/escalation.
- Technical architecture: admin is a pure API/WS client; WebSocket covers conversation/ticket/presence/heartbeat; `handoff` capability owns ticket creation/presence routing/SLA/escalation; `ops-assets` feeds quick replies/media/tags/custom fields; group aggregate views must not expose customer plaintext.
- Backend design/frontend architecture: tenant IA order starts with 对话; conversation workbench is `会话列表 / 对话线程+草稿区 / 上下文面板`; "待人工" and "SLA 即将超时" stay pinned; AI messages expose trace; mobile is fallback only; conversation lists/messages/logs must be virtualized.
- Acceptance matrix: C-04/C-05/C-06, D-01/D-02/D-03/D-04/D-07, I-01/I-03/I-04/I-05, B-01 and relevant permission/RLS boundaries.
- Admin design system: conversation workbench desktop grid, tokenized status vocabulary, no side stripes as copied decoration, fixed product typography, dense operational state, keyboard-first actions and mobile fallback.

Worktree / branch entry evidence:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-spec` |
| worker `git status --short --branch` | `## codex/m7-ui-20-conversation-workbench-spec` |
| worker `git branch --show-current` | `codex/m7-ui-20-conversation-workbench-spec` |
| worker HEAD / origin main | `88044142c66257dce7cecd7b003cb49be0e6b44b` / `88044142c66257dce7cecd7b003cb49be0e6b44b` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before worktree creation | `## main...origin/main` |
| root/main branch before worktree creation | `main` |
| `git branch --no-merged main` at entry | `codex/m7-ui-11-release-acceptance-page-impl` was the only non-main branch shown; PR #178 is explicitly Draft/Paused and was not touched. |
| open PR audit | `gh` unavailable in this shell. No PR was edited. |

Known sequencing note:

- `origin/main` HEAD is `8804414 Implement M7 UI layered navigation shell`, so UI-05 group/tenant layer separation is merged baseline.
- `M7-UI-10` confirmation queue is already merged to `main` via PR #175 / commit `c82fa4d`.
- `M7-UI-11` / PR #178 release acceptance page is Draft/Paused transitional work and is not the next high-value page blocker.
- This spec updates `tenant.conversations` only to `spec_ready_pending_coordinator_review`; it does not claim page implementation, runtime closure, owner acceptance or release approval.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-spec` |
| branch | `codex/m7-ui-20-conversation-workbench-spec` |
| base | current `main` / `origin/main` at `8804414` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, root/main status/branch check, branch/PR availability check |

## 并发派发证据

This worker is assigned one physical worktree, one branch and one spec. This PR touch list is docs-only and does not overlap source, DB schema, lockfile, package, CI/guard, global generated artifacts or production/release gates.

Future implementation touches `apps/admin/src/pages/conversations/**`, `PageOutlet`, `registry` and focused admin Playwright tests, so it must not run in parallel with other page workers touching router/page outlet/registry, conversation/ticket admin runtime, shared page CSS conventions, customer/order/quote supporting clients, WebSocket wiring or `apps/admin/tests/**` unless the coordinator records explicit non-overlap.

## 事故与 closeout 记录

None for this spec-only worker at drafting time.

If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, includes secret/customer-data boundary risk, weakens tests/gates, or touches PR #178, stop and create or reference `docs/incidents/` before continuing.

## Page Matrix

### Objects And Fields

| Object | Required fields | Notes |
|---|---|---|
| Page shell | page id `tenant.conversations`, selected tenant id/name, channel/runtime state, permissions, degraded reason if any | Tenant layer only. No group nav mixed into sidebar. |
| Tenant sidebar context | active layer `tenant`, active page `tenant.conversations`, tenant switch/back-to-group affordance | UI-05 baseline is mandatory; accessible nav must contain tenant nav only. |
| Conversation list | conversation id/ref, customer display name/ref, channel, unread/awaiting flags, status, last message safe preview, last activity time, SLA remaining/risk, language/script, assigned human/AI member, pinned rank | Needs human and SLA risk stay pinned. 1k+ / 10k list implementation must virtualize. |
| Conversation filters | all, unread, awaiting reply, needs human, AI processing, closed, SLA risk, channel/language/member where runtime supports | Counts must come from runtime or be absent/degraded. No local fake counts. |
| Message thread header | customer name/ref, channel, language/script, status, SLA chip, active owner/assignee, takeover/handback/reopen action, more/actions menu | Header action depends on runtime status and permission. |
| Message item | id/ref, role customer/AI/human/system, direction, content kind, timestamp, channel send mode, language/script, delivery/draft status, redline/system marker | Do not expose raw carrier payload, secrets or uncontrolled customer data in evidence artifacts. |
| Voice item | media ref, duration, transcription status, transcript safe text when available, unsupported/uncertain reason | Unsupported/uncertain must drive handoff/degraded state where applicable. |
| AI trace | model/provider/ref, intent, tool/capability refs, knowledge refs, eval/redline result, token/cost accounting refs, handoff reason when relevant | Trace is required for AI accountability; never show hidden secrets/API keys. |
| Composer/draft | mode `ai_processing`/`business_draft_pending`/`business_draft_editing`/`human_reply`/`done`, draft body/ref, redline check status, language label, snippet/attachment tools, send/confirm state | Business drafts require human confirmation; AI cannot auto-send Business reply. |
| Handoff/takeover | handoff status, requestedBy/assignedTo, reason, SLA policy ref, created ticket ref, in-flight AI message states | Takeover must suspend AI and mark in-flight AI messages `withdrawn` or `pending_cancel` before send. |
| Customer context rail | customer id/ref, language/script, journey stage, tags, custom fields, notes, related tickets, related orders, quote records, quick actions | If customer context is unavailable, render unavailable/degraded state without blank rail. |
| SLA risk | policy ref, due time, remaining/overdue, escalation tier, owner/action needed | LLM must not calculate SLA; use runtime/code-derived values. |
| Exit paths | customer asset detail, ticket detail/create, order detail, quote generation, confirmation queue candidate/source, logs/audit refs | Exits must stay in tenant layer and preserve tenant context. |

### Statuses / States

| State | Meaning | UI behavior |
|---|---|---|
| `loading` | Initial or route/filter data pending | Skeleton/list/thread/rail placeholders with stable three-column dimensions. |
| `empty` | No conversations match current filters | Operational empty state with safe next action; no decorative illustration. |
| `error` | API/client/runtime request failed | Error state with retry and trace/ref if available. |
| `permission_denied` | User lacks conversation read/write or handoff permission | Explain role/prerequisite; backend remains authoritative. |
| `degraded` | API/WS/customer context/trace/SLA source incomplete or stale | Amber state; disable unbacked actions and show read-only data where truthful. |
| `mobile_fallback` | Small viewport | Single-column fallback: list -> thread -> key actions; emergency claim/takeover only, no full rail editing. |
| `sla_risk` | Conversation near or past SLA threshold | Pin in list; show SLA chip and escalation context. |
| `handoff_pending` | Handoff requested, ticket may be created/assigned | Human/blocking tone; show ticket ref or degraded blocker. |
| `human_takeover` | Operator owns external reply | AI suspended; composer switches to human reply; handback requires permitted action. |
| `ai_suspended` | AI must not generate/send for this conversation | Show status in header/composer; action copy must not imply AI is still active. |
| `withdrawn` | In-flight AI message was withdrawn after takeover | Show system/audit marker where runtime exposes it. |
| `pending_cancel` | In-flight AI send cancel requested but not confirmed | Warning state; block duplicate sends until resolved. |
| `customer_context_unavailable` | Customer asset/order/quote context cannot load | Keep rail present; show unavailable reason and safe links/actions disabled. |

### Actions

| Action | Desktop | Mobile fallback | Runtime requirement |
|---|---|---|---|
| Select conversation | Click row, keyboard list navigation | Tap row | Read detail by tenant-scoped id/ref. |
| Filter/sort list | Filter chips/search/sort menu | Basic filter drawer or simplified chips | Runtime query params or explicit degraded if unsupported. |
| Take over | Header/composer button, `T` outside inputs | Emergency/takeover button if permitted | Must call approved handoff/takeover runtime; must suspend AI and cancel/withdraw in-flight messages. |
| Hand back to AI | Header/composer action when human-owned | Usually desktop only | Requires runtime permission and clear audit trail; disabled if unsafe. |
| Reopen conversation | Header/composer action on closed/done | Optional | Requires runtime support; no local-only reopen. |
| Confirm Business draft | Composer button, Cmd/Ctrl+Enter | Not full mobile unless approved | Must confirm/send through approved Business draft API; C-04 blocks AI auto-send. |
| Edit draft | Composer edit/textarea, Esc cancel | Desktop only preferred | Edits require redline/eval check where contract exists; otherwise degraded/disabled. |
| Send human reply | Composer button, Cmd/Ctrl+Enter | Emergency short reply only if approved | Uses human/operator send path; no AI persona send. |
| Mark resolved | Composer/button | Optional | Must persist state and audit; no local-only done state. |
| Create ticket | Context rail quick action | Emergency claim/transfer only | Uses conversation/ticket API contract or disabled/degraded. |
| Jump to customer/ticket/order/quote | Context rail links | Read-only links when space allows | Preserve tenant context and route layer. |
| Add note/tag | Context rail controls | Desktop only | Requires customer asset/tag runtime; no local fixture mutation. |
| Expand AI trace | Trace chip in AI message | Read-only expansion if space allows | Trace fields must come from runtime/evidence refs. |

### Exit Paths

| Exit path | Target route/page | Requirement |
|---|---|---|
| Full customer profile | `tenant.customers` detail/search route when implemented | Stay tenant layer; pass customer ref, not plaintext payload. |
| Related ticket | `tenant.tickets` detail route when implemented | Stay tenant layer; preserve selected conversation ref. |
| Related order | `tenant.orders` detail route when implemented | Read-only if order runtime missing or stale. |
| Quote generation/record | Future quote tool or `tenant.customers`/orders quote record surface | LLM must not calculate price; use controlled quote/pricing tool only. |
| Knowledge/confirmation source | `tenant.queue` when a candidate/source ref exists | No automatic knowledge write; candidates go through confirmation queue. |
| Logs/audit | `tenant.logs` detail/filter route when implemented | Use controlled refs and tenant context. |

### Prohibited Behaviors

| Prohibited behavior | Reason |
|---|---|
| Showing group nav beside `tenant.conversations` | Violates UI-05 layered IA and owner rule. |
| Using fixtures/local state as runtime truth | Would fake the core operational page. |
| Copying old M2 shell layout/CSS | Legacy evidence only; not M7 visual source. |
| Copying raw prototype inline styles or raw fixtures | Must normalize through tokens/primitives/patterns and runtime contracts. |
| Reintroducing old `--uzmax-*` visual target or page-local tokens | M7+ visual source is owner prototype/design system, not old shell bridge. |
| Side-stripe list/card decoration | Rejected by design system; use status badges, dots, row tint or full borders. |
| AI auto-sending Business replies | Blocks C-04. Business draft requires human confirmation. |
| Sending AI after takeover | Blocks C-06 and REQ-C03. In-flight AI must be withdrawn/pending_cancel. |
| Letting LLM calculate SLA, price, cost or order status | Violates PRD NG-06. |
| Frontend-only permission hiding | Backend/authz/RLS remains authoritative. |
| Exposing customer/order plaintext in group layer or evidence artifacts | Violates tenant/privacy boundary. |
| Editing shared patterns/tokens in the page PR without approval | Must split to separate approved spec. |

## Runtime Integration Plan

1. Prefer an existing admin conversation/ticket API client/hook if one exists at implementation start. If absent, the implementation worker may add a page-local wrapper under `apps/admin/src/pages/conversations/**` only if it consumes approved existing runtime contracts and remains inside the approved touch list.
2. Current repo evidence shows backend `conversation-ticket` endpoints for:
   - `GET /conversation-ticket/conversations`
   - `GET /conversation-ticket/conversations/:conversationId`
   - `POST /conversation-ticket/conversations/:conversationId/handoff`
   - `POST /conversation-ticket/tickets/:ticketId/actions`
3. Current repo evidence does not show a M7 admin `conversationApiClient`, page hook, WebSocket conversation hook, customer-context aggregator, Business draft confirm API, human external send API, AI trace API or full runtime persistence client in `apps/admin`.
4. Therefore future implementation must choose one of these honest contracts:
   - use an approved existing admin/API client/hook discovered at implementation time;
   - add a page-local client/hook that wraps only approved `conversation-ticket` API semantics and renders missing regions as degraded/read-only;
   - or render the entire page as read-only/degraded if runtime is insufficient.
5. No fixture pretending as runtime is allowed. Playwright tests may route controlled synthetic responses, but the page code must not import prototype fixtures or old M2 synthetic arrays as production state.
6. If real implementation requires new backend/API/WS contracts for Business draft confirmation, human send, AI trace, customer context, order/quote rail, presence, SLA timers or WebSocket updates, stop and split before source edits.
7. Runtime must keep tenant isolation: conversation IDs, customer refs, ticket refs, order refs and quote refs are scoped by `AccessContext.selectedTenantId`; UI must not trust request bodies or route params to override tenant.

## Visual Rules

- Owner HTML and the unpacked conversation prototype are the one-to-one visual acceptance baseline for layout, density, sidebar separation, icons, spacing, status chip shape, header height, column proportions, message/composer/rail anatomy and microcopy shape.
- Use `packages/ui-tokens -> primitives -> patterns -> pages`; page code must consume existing tokens/patterns where available and may not introduce page-local token systems.
- No old `--uzmax-*` as the design target for new M7+ work. Existing legacy code may retain it untouched.
- Preserve the owner prototype first-viewport regions:
  - tenant sidebar from UI-05 baseline;
  - 316px conversation list;
  - central message thread with header and scroll body;
  - expandable AI trace inside AI messages;
  - composer/draft area anchored at bottom;
  - 340px customer context rail;
  - visible SLA/handoff/takeover actions.
- Preserve group-vs-tenant separation: admin opens group layer; selecting a tenant enters tenant layer; `tenant.conversations` belongs only to tenant layer and must not show group nav mixed into the sidebar.
- Do not free-layout the page. Column collapse/mobile behavior must be structural and tested, not accidental fluid scaling.
- Product typography remains fixed-size and dense; no hero-scale text, decorative dashboards, gradients, glass, colored shadows, marketing copy or ornamental empty states.
- Lucide remains the icon source. Do not hand-draw SVG icons.
- Status colors are semantic only. Human/blocking red is reserved for handoff, SLA/blocking risk and destructive states.
- Prototype side bars/stripes must be adapted, not copied: use status badges, small dots, row tint, full border or icon+text labels.

## Evidence Gate For Future Implementation

Future implementation evidence must include all of the following before PR merge:

- Desktop screenshot at owner/prototype comparison size, showing tenant sidebar, list, thread, AI trace, composer, context rail and SLA/handoff regions.
- Mobile screenshot at 320px showing fallback without horizontal overflow and without mixed group/tenant nav.
- Screenshot review against `/Users/atilla/Downloads/运营塔台1.0.html` and all unpacked conversation files listed in this spec.
- Playwright route assertions:
  - selecting a tenant enters `tenant.conversations`;
  - active nav is tenant-only and contains no group nav labels;
  - route/page id is `tenant.conversations`;
  - old legacy evidence route remains explicit if needed.
- Playwright state assertions for loading, empty, error, permission denied, degraded, SLA risk, handoff/takeover, AI suspended, withdrawn/pending_cancel and customer context unavailable.
- Playwright interaction assertions for keyboard navigation, `T` takeover, Cmd/Ctrl+Enter draft/human send where runtime exists, Esc edit cancel, AI trace expansion and disabled unbacked actions.
- Runtime assertions proving no fixture imports and no local-only runtime mutation.
- Design critique/detect or equivalent Impeccable review:
  - no old `--uzmax-*` additions;
  - no side-stripe decoration;
  - no text overflow at desktop/mobile;
  - no nested cards or marketing layout;
  - contrast/focus/keyboard states recorded.
- Screenshot and design review must happen before implementation PR merge, not after.

## Implementation Sequencing

1. Coordinator reviews this spec and confirms the page remains the next high-value migration target.
2. Implementation worker starts in a separate worktree/branch for implementation, re-reads `AGENTS.md`, this spec, v1.1 docs, admin design system, ledger, current `main`, and owner prototype sources.
3. Implementation worker records `pwd`, `git status --short --branch`, `git branch --show-current`, open PR/branch audit and root/main status before writes.
4. Implementation first checks for existing conversation admin clients/hooks/runtime contracts.
5. If runtime is missing, implementation renders read-only/degraded contract or stops for a runtime spec; it must not wire fixtures as runtime.
6. Implementation may not edit shared patterns/tokens, DB/schema, package/lock, backend/API, WebSocket, CI/global guards or PR #178 unless a separate approved spec allows it.
7. Page PR must not modify DB/schema/lockfile/global CI.
8. Spec compliance review must happen before code quality review.

## 实施步骤

Spec-only PR:

1. Create this spec.
2. Create evidence stub for this spec-only worker.
3. Update M7 README execution queue: UI-05 merged baseline, UI-10 merged, UI-11/PR #178 Draft/Paused transitional, UI-20 next high-value spec.
4. Update page migration ledger: `tenant.conversations` uses this spec id and status `spec_ready_pending_coordinator_review`; do not overclaim implementation.
5. Run docs-only validation commands listed below.
6. Commit and push only if validation passes.

Future implementation PR:

1. Reconfirm current main and this spec.
2. Implement the tenant conversations page in approved source paths only.
3. Use real API/client/runtime or documented read-only/degraded states.
4. Add focused Playwright coverage and screenshot/design evidence.
5. Update evidence/ledger with implementation status only after the page is actually implemented and verified.

## 通过条件

Spec-only PR passes when:

- Only allowed docs files changed.
- `docs/specs/M7-UI-20-conversation-workbench-page.md` exists and covers summary, source mapping, page matrix, runtime integration, state coverage, visual rules, evidence gate, implementation sequencing and priority update.
- M7 README and ledger reflect:
  - UI-05 layered nav merged baseline;
  - confirmation queue already merged to main;
  - `发布与验收` / PR #178 Draft/Paused transitional and not main high-value blocker;
  - `tenant.conversations` / `M7-UI-20-conversation-workbench-page` next high-value target, `spec_ready_pending_coordinator_review`.
- Validation passes:
  - `git diff --check`
  - `npm run guard:doc-triggers`
  - `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-20-conversation-workbench-page.md --include-worktree`

## 失败分支

- If validation fails because docs exceed touch list, revert own docs changes and report `BLOCKED`.
- If `guard:doc-triggers` requires additional docs outside the allowed list, stop and ask coordinator to approve expanded scope.
- If `pr-shape` cannot parse the spec touch list, fix only this spec formatting and rerun.
- If Node/npm is unavailable, locate the repo-approved runtime path and rerun; if still unavailable, report `DONE_WITH_CONCERNS` with exact command failure.
- If implementation is required to answer runtime gaps, stop; do not implement in this PR.
- If PR #178 or release acceptance branch requires edits to make the ledger true, stop; this worker must not touch it.

## 不做什么

- No React/source/test/CSS edits.
- No package/lock/generated/config/backend/API/DB/worker/cron/CI/global guard edits.
- No screenshots or binary artifacts committed.
- No raw prototype fixture imports or copied source.
- No new route rendering.
- No admin API client/hook implementation.
- No WebSocket implementation.
- No owner acceptance, GA-0, production, release or real customer/order-data action.
- No PR #178 edits.

## 验收映射

| Acceptance item | Mapping |
|---|---|
| C-04 | Business draft confirmation must be explicit; no AI auto-send Business reply. |
| C-05 | Human messages must pause AI抢答 semantics where runtime exposes Business/human messages. |
| C-06 | Takeover must suspend AI and mark in-flight AI messages withdrawn/pending_cancel before send. |
| D-01 | List filters and pinned needs-human/SLA-risk behavior are core page requirements. |
| D-02 | Handoff creates ticket summary/SLA/suggested action where runtime exists; otherwise degraded. |
| D-03 | Ticket claim/lock/note/escalate/close/reopen exits remain future ticket-page/runtime contracts, not local state. |
| D-04 | Customer rail must show available profile/history/order/quote/ticket refs or unavailable state. |
| D-07 | Customer/conversation tags and custom fields must use runtime/customer asset contracts, not local fixture mutation. |
| I-01 | 对话工作台 is one of the core desktop flows; this spec prepares its migration. |
| I-03 | Conversation list must virtualize for 10k rows in implementation. |
| I-04 | WS/realtime latency is an implementation/runtime evidence requirement; missing WS means degraded/read-only. |
| I-05 | Visual acceptance uses owner HTML/prototype, design system and Impeccable/equivalent review. |
| B-01 | Tenant isolation must be preserved for conversation/customer/ticket/order/quote refs. |

# M7-UI-69 AI Members Source Parity Refresh

## Goal

Refresh the existing visible UI-first `tenant.aiMembers` / `AI 成员` page on top of `origin/codex/m7-ui-68-eval-center-source-parity-refresh` (#210 stack) so the AI members page remains browser-comparable against the owner HTML, frozen unpacked agents source and latest stacked tenant shell.

This is a source parity refresh, not a rewrite. Primary scope is evidence/test/docs only. Small `apps/admin/src/pages/agents/**` corrections are allowed only if browser evidence proves an obvious current React mismatch that must be fixed now. This slice does not implement AI member DB/API/runtime/audit/member metrics, production persona publish, production route changes, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, frozen unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. AI member data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `not production member metrics`.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on #210 / `origin/codex/m7-ui-68-eval-center-source-parity-refresh`.
- Confirm the current lane remains visible-UI-first while AI member DB/API/runtime/audit/member metrics and production persona publish are downgraded.
- Decide later whether real AI member runtime, audit writes, member metrics or production persona publish proceeds through a separate approved spec.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-69-ai-members-source-parity-refresh` on branch `codex/m7-ui-69-ai-members-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-41 spec/evidence, current agents source/tests, owner unpacked agents page/hook/fixtures and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React desktop/persona/confirm/collapsed/mobile metrics.
- Preserve tenant-only routing, synthetic read-only AI member data, browser-local capability/emergency/recovery/persona state and eval-gated local publish preview.

## Timebox

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar/registry/PageOutlet edits, a broad page rewrite, real AI member runtime, production persona publish, real audit write or real production member metrics, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-69-ai-members-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-69-ai-members-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts`
- Conditional source scope, only if browser evidence proves a mismatch that must be fixed now:
  - `apps/admin/src/pages/agents/AgentsPage.tsx`
  - `apps/admin/src/pages/agents/AgentViews.tsx`
  - `apps/admin/src/pages/agents/agentsFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: 0 expected; <= 3 conditional only
- source net LOC: 0 expected; <= 100 conditional only
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-41-ai-members-page.md`
- `docs/evidence/M7/M7-UI-41-ai-members-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/agents/AgentsPage.tsx`
- `apps/admin/src/pages/agents/AgentViews.tsx`
- `apps/admin/src/pages/agents/agentsFallback.ts`
- `apps/admin/tests/m7-ui-ai-members.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/agents.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 AI members/eval boundaries: PRD REQ-T08/T09, admin §4.8, mobile fallback I-02, architecture GA-0/eval-gate production boundaries and acceptance gate rules.

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM/text sample for AI members/source shell terms. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked agents page | Primary structured source for title, segmented filters, breaker/estop alert, AI member cards, human member table, capability toggles, emergency/recovery confirmation, persona drawer, eval gate and publish path. |
| Unpacked `useAgents.ts` | Interaction source for filter state, capability toggle, status changes, persona draft, eval run, publish and rollback state. |
| Unpacked `fixtures/agents.ts` | Field-shape reference only. React must continue using centralized sanitized synthetic fallback data with visible degraded/mock/read-only labels. |
| v1.1 docs | Product/runtime boundary: tenant AI member control exists as scope, but this slice is UI evidence only and does not imply real runtime, audit write or production persona publish. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for AI members-related owner HTML region.
- Unpacked source mapping summary for agents page/hook/fixtures.
- React desktop screenshot.
- React persona drawer screenshot.
- React emergency/recovery confirm modal screenshot where feasible.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `tenant`
  - active page `tenant.aiMembers`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - page/card grid/human table/persona drawer widths and body/document scroll widths
  - runtime labels `mock/degraded/read-only/not production member metrics/no production persona publish/local action only`
  - source-like booleans for title, runtime alert, segmented filters, AI member cards, human table, capability toggles, emergency stop/recovery confirmation, persona drawer, persona eval gate and local publish preview
  - tenant sidebar categories only: `运营/数据/智能/管理/洞察`; group categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived AI member anatomy, separated tenant layer, restrained runtime caveat, reason-required local emergency/recovery confirmations, eval-gated local persona publish preview, tenant-only sidebar parity and mobile readable/no-overflow fallback.

Rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, raw prototype fixture imports, production-looking unlabeled member metrics, backend/API/runtime/audit invention, production persona publish and any owner-acceptance/runtime/release claim.

If Design Skill Layer suggests a visual correction that conflicts with AGENTS, v1.1 docs, data boundary, permissions, release gates or owner source boundaries, record the rejection in evidence instead of implementing it.

## Pass Conditions

- `tenant.aiMembers` renders inside tenant shell after selecting tenant `tenant-b` on the latest #210 stack.
- Focused browser evidence proves owner/source/React comparison, desktop/persona/confirm/collapsed/mobile geometry, tenant-only sidebar categories and 320px no-overflow fallback.
- Existing AI members interaction coverage remains intact.
- Synthetic/degraded/mock/read-only label remains visible and states `not production member metrics`, `no production persona publish` and `local action only`.
- Capability toggles, emergency stop/recovery and persona publish remain browser-local only; no production route change or real audit write is implied.
- Any React visual corrections are small and limited to `apps/admin/src/pages/agents/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check origin/codex/m7-ui-68-eval-center-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-68-eval-center-source-parity-refresh --spec docs/specs/M7-UI-69-ai-members-source-parity-refresh.md --include-worktree`
- touched Prettier check
- ESLint on touched AI members test/source if source changed
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright for `apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts` and existing `apps/admin/tests/m7-ui-ai-members.spec.ts`.

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If AI member/runtime boundary labels cannot stay honest without visually overwhelming the page, keep the labels and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## Not Doing

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No raw prototype fixture import.
- No AI member DB/API/runtime/audit/member metrics.
- No production route change.
- No production persona publish.
- No real eval gate, LLM/provider call, production prompt/persona change or production audit write.
- No real customer, order, Telegram, address, phone or production data.
- No owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

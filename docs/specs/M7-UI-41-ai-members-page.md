# M7-UI-41 AI Members Page

## 目标

Implement the UI-first visible `tenant.aiMembers` / `AI 成员` page on the current visible UI trunk `origin/codex/m7-ui-31-orders-visible-ui` at `e4670b491c912a30a4848b32adff29f35a3c0d8c`.

This slice renders real visible browser UI using centralized sanitized synthetic degraded/mock/read-only state. It does not implement AI member DB/API/runtime, production member metrics, production persona publish, audit writes, owner visual acceptance, GA-0, production deployment, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and frozen unpacked sources under `/Users/atilla/源码/unpacked 6/pages/agents`, `/hooks/useAgents.ts`, and `/fixtures/agents.ts` are the hard visual/anatomy baseline. Existing legacy AI-member runtime evidence and old shell visuals remain legacy evidence only.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this PR is a UI-first visible implementation candidate, not runtime closure.
- Confirm this branch remains based on `origin/codex/m7-ui-31-orders-visible-ui`, not `main`.
- Decide later whether AI member DB/API/runtime, audit writes, production eval gate or production persona publish proceed through separate runtime specs.
- Keep final production/staging, real customer/order data, customer LLM, LLM key, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-41-ai-members-page-cleanstack` on branch `codex/m7-ui-41-ai-members-page-cleanstack`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main checkout read-only for code.
- Read AGENTS, this spec, M7 ledger/evidence, registry/page outlet state, owner HTML, unpacked agents source and old v2 branch reference before editing source.
- Implement only the visible tenant AI members page with synthetic local browser state and focused Playwright coverage.

## 时间盒

0.5 workday. If implementation requires backend/API/DB changes, package/lock updates, raw fixture import, shared shell/sidebar/topbar/token/primitives/patterns changes, CI/global config changes, release/production action or edits outside the allowed paths, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-41-ai-members-page.md`
  - `docs/evidence/M7/M7-UI-41-ai-members-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/agents/AgentsPage.tsx`
  - `apps/admin/src/pages/agents/AgentViews.tsx`
  - `apps/admin/src/pages/agents/agentsFallback.ts`
  - `apps/admin/tests/m7-ui-ai-members.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files <= 5.
- source net LOC <= 600 if feasible; report `DONE_WITH_CONCERNS` if exceeded.
- new source files exactly 3: `AgentsPage.tsx`, `AgentViews.tsx`, `agentsFallback.ts`.
- test files changed <= 1 focused Playwright spec.
- docs changed <= 4 evidence/ledger/spec updates.
- package/lock/generated/backend/API/DB/worker/cron/CI/global config/release acceptance: 0.
- external API/SDK/provider/connector/adapter basis: none; render truthful degraded/read-only mock state only.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：searched `aiMembers`, `agents`, `AI 成员`, `tenant.aiMembers`, `M7-UI-41`, and `M7-UI-04O` under `apps/admin/src`, `apps/admin/tests`, `docs/specs`, `docs/evidence/M7`, and `docs/admin-ui-page-migration-ledger.md`. Current trunk has registry/sidebar/icon labels and a planned scaffold only; no routed M7 AI members page exists. New files belong under `apps/admin/src/pages/agents/` to match the current page-local M7 pattern and avoid a parallel shell/runtime.

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/agents/AgentsPage.tsx
  - apps/admin/src/pages/agents/AgentViews.tsx
  - apps/admin/src/pages/agents/agentsFallback.ts
test:
  - apps/admin/tests/m7-ui-ai-members.spec.ts
docs:
  - docs/specs/M7-UI-41-ai-members-page.md
  - docs/evidence/M7/M7-UI-41-ai-members-page.md
  - docs/admin-ui-page-migration-ledger.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## 前置条件与读取记录

Required reads completed for this implementation PR:

- `AGENTS.md`
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/impeccable/reference/product.md`
- Impeccable context loader for `apps/admin/src/pages/agents/AgentsPage.tsx`
- `PRODUCT.md` and `DESIGN.md` through Impeccable output
- `docs/admin-design-system.md` through Impeccable output
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- Current neighboring implementation/test: `apps/admin/src/pages/evals/*`, `apps/admin/src/pages/orders/*`, `apps/admin/tests/m7-ui-eval-center.spec.ts`
- Owner/unpacked source references:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts`
  - `/Users/atilla/源码/unpacked 6/fixtures/agents.ts`
- Old branch reference, read-only extraction only:
  - `origin/codex/m7-ui-41-ai-members-visible-ui-v2:apps/admin/src/pages/agents/*`
  - `origin/codex/m7-ui-41-ai-members-visible-ui-v2:apps/admin/tests/m7-ui-ai-members.spec.ts`
  - `origin/codex/m7-ui-41-ai-members-visible-ui-v2:docs/specs/M7-UI-41-ai-members-page.md`
  - `origin/codex/m7-ui-41-ai-members-visible-ui-v2:docs/evidence/M7/M7-UI-41-ai-members-page.md`

Worktree / branch entry evidence:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-41-ai-members-page-cleanstack` |
| worker `git status --short --branch` | `## codex/m7-ui-41-ai-members-page-cleanstack...origin/codex/m7-ui-31-orders-visible-ui` |
| worker `git branch --show-current` | `codex/m7-ui-41-ai-members-page-cleanstack` |
| base | `origin/codex/m7-ui-31-orders-visible-ui` |
| base HEAD verified | `e4670b491c912a30a4848b32adff29f35a3c0d8c` |

## Source Mapping

| Source | Required use |
|---|---|
| `/Users/atilla/Downloads/运营塔台1.0.html` | Owner shell/page visual baseline where local `file://` exposes the AI members region. |
| `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx` | Header, filters, alert, AI cards, capability chips, human table, confirm modal and persona drawer anatomy. |
| `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts` | Local UI state-machine reference only: capability toggle, status changes, persona edit/eval/publish. |
| `/Users/atilla/源码/unpacked 6/fixtures/agents.ts` | Field-shape reference only. Production page code uses centralized sanitized synthetic fallback data with ids such as `SYN-AI-MEMBER-*`. |
| `docs/admin-design-system.md` / `DESIGN.md` | Normalization layer: restrained dense product UI, status-first states, mobile readable fallback, honest runtime boundaries. |

## Page Matrix

| Object | Required fields / behavior |
|---|---|
| Route | `PageOutlet` renders `AgentsPage key={selectedTenantId}` for `tenant.aiMembers`; tenant switch resets browser-local state. |
| Header/filter | Title `AI 成员`, description, filters `全部` / `AI 成员` / `人类成员`. |
| Runtime note | Persistent `degraded`, `mock`, `read-only`, `not production member metrics`, `no production persona publish`, `local action only`. |
| Alert | Breaker/estop alert with local-only recovery boundary. |
| AI cards | Source-like AI member cards with status badge, capability chips, today/cost/feedback metrics, emergency stop/recovery and persona edit. |
| Human table | Source-like human member table with role, online state, active count and daily total. |
| Confirm modal | Reason-required emergency stop, breaker recovery and estop release; browser-local only. |
| Persona drawer | Draft textarea, version list, gate state, run eval and publish-local-preview boundary. |
| Required states | `?m7AgentState=loading|empty|error|permission|degraded` deterministic states. |
| Group/tenant separation | Default `/design` remains group layer; selecting tenant enters tenant layer; sidebar shows tenant sections `运营/数据/智能/管理/洞察`; AI members sits under `智能`; collapsed width remains `68px`. |
| Mobile fallback | 320px readable; no body/document horizontal overflow; dense tables may scroll in contained regions only. |

## Runtime Contract

Current implementation is local UI only:

- `tenant.aiMembers` renders centralized sanitized synthetic degraded/mock/read-only data from `agentsFallback.ts`.
- Capability toggles, emergency stop, breaker recovery, estop release, persona edit, eval and publish preview mutate only browser-local React state.
- No backend/API/DB/member runtime/audit write/eval runner/persona production publish exists or is implied.
- UI copy must not imply production AI member metrics, production persona publish, owner acceptance or runtime closure.

Future runtime must be split into approved AI member API/runtime/audit specs before this page can render production member data or mutate production persona/state.

## Impeccable / Design Decision Record

- Adopted: dense product layout, source-like header/cards/table/drawer structure, visible local-only/runtime boundaries, reason-required high-risk actions, tokenized status colors, Lucide/IconSlot icons, 320px readable fallback.
- Adapted: owner prototype raw inline styles and raw fixture values are converted into page-local React/CSS plus sanitized fallback records.
- Rejected: raw prototype fixture import, production-looking member metrics, backend/API/DB runtime, production persona publish, old shell visual target, old `--uzmax-*` visual target and shared shell/sidebar/token edits.
- Detector result: `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/pages/agents/AgentsPage.tsx apps/admin/src/pages/agents/AgentViews.tsx apps/admin/src/pages/agents/agentsFallback.ts` returned `[]`.

## Evidence / Validation Plan

Implementation must record:

- `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `git diff --check`
- `npm run format:check`
- `npm run jscpd`
- `npm run knip`
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-41-ai-members-page.md --include-worktree`
- `npx playwright test apps/admin/tests/m7-ui-ai-members.spec.ts`
- `npm run typecheck`
- `npm run lint`

Browser evidence must be written under `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/`, including owner/unpacked source mapping or unavailable artifacts, React desktop/collapsed/mobile screenshots and metrics. If owner HTML or unpacked source is unavailable in CI, tests must write unavailable evidence but React page assertions remain hard checks.

## Pass Conditions

- Only allowed files change.
- `tenant.aiMembers` renders visible UI, not scaffold.
- Registry, ledger and M7 README mark this as implementation candidate pending PR review, not merged, owner accepted or runtime closed.
- Focused Playwright covers tenant entry, tenant-only nav, runtime labels, filters, capability toggle, emergency stop/recovery reason gate, persona edit/eval/publish, URL states, tenant switch reset, sidebar collapse, 320px no body overflow and screenshot/metrics/source artifacts.

## 失败分支

- If visible AI members UI requires backend/API/DB/runtime truth to avoid misleading operators, stop and report `BLOCKED`; do not fake production state.
- If local validation is blocked by dependency/tooling gaps, record exact commands and blockers in evidence.
- If source comparison screenshots cannot be captured from owner HTML, record the exact caveat and do not claim visual acceptance.

## 不做什么

- No shared shell/sidebar/topbar/token/primitives/patterns changes.
- No backend/API/DB/schema/migration/generated/package/lock/global config/CI changes.
- No raw prototype fixture import.
- No production member metrics, production persona publish, production eval gate, audit write, owner acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

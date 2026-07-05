# M7-UI-41 AI Members Page

## Goal

Implement a smaller UI-first `tenant.aiMembers` / `AI 成员` visible page on top of `origin/codex/m7-ui-40-eval-center-visible-ui`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/agents.ts`, `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts`, and `docs/admin-design-system.md`.
- This is a v1 visible shell: source structure is carried, but full production runtime, member metrics, audit writes, and persona publish are not implemented.
- No owner visual acceptance, runtime closure, production AI member readiness, GA-0, or 1.0 release approval is claimed.

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

## Path Classification

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

## Change Budget

- Changed source files <= 5.
- New source files exactly 3: `AgentsPage.tsx`, `AgentViews.tsx`, `agentsFallback.ts`.
- Each `.tsx` file <= 250 lines.
- Net source LOC <= 600 if feasible.
- No fourth agents source file.

## Implementation Contract

- Route `tenant.aiMembers` through `PageOutlet` with `key={selectedTenantId}`.
- Persistent runtime labels include `degraded`, `mock`, `read-only`, `not production member metrics`, `no production persona publish`, `local action only`.
- URL query `?m7AgentState=loading|empty|error|permission|degraded` renders deterministic visible states.
- Include header/filter, breaker/estop alert, three synthetic AI cards, human table, simple persona drawer, reason-required emergency/recovery confirmation, local capability toggle, local eval pass, and local-only publish preview.

## Impeccable / Design Skill Layer

- Adopted: dense product UI, source-like structure, visible runtime boundaries, reason-required high-risk actions, and 320px mobile fallback.
- Rejected: exhaustive full source clone and full diff UI, because this v2 slice is explicitly budget-limited.

## Not Doing

- No backend/API/DB/worker/runtime/member metric/audit write implementation.
- No production persona publish, real eval gate, real AI member state, owner acceptance, merge closure, or release approval.

## Acceptance

- Focused Playwright coverage for tenant navigation, runtime labels, filter all/AI/human, capability toggle, emergency stop/recovery reason gate, persona edit/eval/publish, URL states, tenant switch reset, collapsed sidebar, mobile 320 no body overflow, and screenshot/metrics artifacts.

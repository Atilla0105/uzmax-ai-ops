# M7-UI-41 AI Members Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `tenant.aiMembers` / `AI 成员` candidate with sanitized synthetic mock data on cleanstack branch `codex/m7-ui-41-ai-members-page-cleanstack`, based on `origin/codex/m7-ui-31-orders-visible-ui` at `e4670b491c912a30a4848b32adff29f35a3c0d8c`.

It does not claim owner visual acceptance, merge, runtime closure, production member metrics readiness, production persona publish readiness, audit-write readiness, GA-0 or 1.0 release approval.

## Scope

| Item | Value |
|---|---|
| Spec | `docs/specs/M7-UI-41-ai-members-page.md` |
| Route | `tenant.aiMembers` |
| Worker path | `/Users/atilla/.codex/worktrees/m7-ui-41-ai-members-page-cleanstack` |
| Worker branch | `codex/m7-ui-41-ai-members-page-cleanstack` |
| Base | `origin/codex/m7-ui-31-orders-visible-ui` |
| Source target | `apps/admin/src/pages/agents/AgentsPage.tsx`; `apps/admin/src/pages/agents/AgentViews.tsx`; `apps/admin/src/pages/agents/agentsFallback.ts` |
| Test target | `apps/admin/tests/m7-ui-ai-members.spec.ts` |

## Source Review

- Read `AGENTS.md`.
- Read `.agents/skills/impeccable/SKILL.md` and `.agents/skills/impeccable/reference/product.md`.
- Ran Impeccable context loader for `apps/admin/src/pages/agents/AgentsPage.tsx`; it loaded `PRODUCT.md`, `DESIGN.md` and `docs/admin-design-system.md` content.
- Ran Impeccable detector for `apps/admin/src/pages/agents/AgentsPage.tsx`, `AgentViews.tsx` and `agentsFallback.ts`; result `[]`.
- Read `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Inspected current route/wiring:
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/evals/*`
  - `apps/admin/src/pages/orders/*`
  - `apps/admin/tests/m7-ui-eval-center.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts`
  - `/Users/atilla/源码/unpacked 6/fixtures/agents.ts`
- Inspected old branch reference for implementation shape only:
  - `origin/codex/m7-ui-41-ai-members-visible-ui-v2:apps/admin/src/pages/agents/AgentsPage.tsx`
  - `origin/codex/m7-ui-41-ai-members-visible-ui-v2:apps/admin/src/pages/agents/AgentViews.tsx`
  - `origin/codex/m7-ui-41-ai-members-visible-ui-v2:apps/admin/src/pages/agents/agentsFallback.ts`
  - `origin/codex/m7-ui-41-ai-members-visible-ui-v2:apps/admin/tests/m7-ui-ai-members.spec.ts`

## React / Owner / Unpacked Mapping

| Source feature | Owner/unpacked source | React implementation |
|---|---|---|
| Page route | Registry has `tenant.aiMembers`; PageOutlet previously scaffolded | PageOutlet imports/renders `AgentsPage key={selectedTenantId}` |
| Header/filter | `AI 成员`, `全部` / `AI 成员` / `人类成员` | `Header` renders source-like title, desc and filter controls |
| Runtime boundary | No production runtime in this slice | Persistent runtime note: `degraded`, `mock`, `read-only`, `not production member metrics`, `no production persona publish`, `local action only` |
| Breaker/estop alert | Source alert for breaker and urgent stop | `AlertBar` shows local-only alert with `TriangleAlert` icon |
| AI cards | Source card with status, capabilities, metrics and actions | `AgentCards` renders three synthetic cards with status badge, capability chips, today/cost/feedback, emergency/recovery and persona edit |
| Human members | Source human member table | `HumanTable` renders synthetic human member rows |
| Confirm modal | Source reason-required stop/recovery flows | Shared `ConfirmModal` requires reason and mutates local state only |
| Persona drawer | Source draft, version history, eval gate and publish | `PersonaDrawer` renders textarea, versions, gate, run eval and local publish preview |

## Data Boundary

- All data is synthetic and centralized in `agentsFallback.ts`.
- IDs use `SYN-AI-MEMBER-*`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `not production member metrics`, `no production persona publish`, `local action only`.
- Capability toggles, emergency stop, breaker recovery, estop release, persona eval and publish preview mutate only browser-local React state.
- No DB/API/runtime/audit write/eval runner/production persona publish/member metric source exists in this slice.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/`

- Owner/source sample screenshot: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/owner-html-ai-members-source-sample.png`
- Owner/source DOM sample or unavailable artifact: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/owner-html-ai-members-source-dom-sample.json`
- Unpacked source mapping or unavailable artifact: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/unpacked-ai-members-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/react-ai-members-desktop.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/react-ai-members-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/react-ai-members-mobile-320.png`
- Desktop metrics JSON: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/react-ai-members-metrics.json`
- Mobile/collapsed metrics JSON: `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/react-ai-members-mobile-metrics.json`

Metrics summary:

```json
{
  "desktop": {
    "activePageId": "tenant.aiMembers",
    "shellLevel": "tenant",
    "sidebarExpandedWidth": 232,
    "tenantCategories": ["运营", "数据", "智能", "管理", "洞察"],
    "topbarHeight": 53,
    "firstCardWidth": 323,
    "aiCardCount": 3,
    "bodyScrollWidth": 1440,
    "documentScrollWidth": 1440,
    "viewportWidth": 1440
  },
  "collapsed": {
    "sidebarExpandedWidth": 68,
    "tenantCategories": ["运营", "数据", "智能", "管理", "洞察"],
    "groupButtonCount": 0,
    "firstCardWidth": 323,
    "viewportWidth": 1280
  },
  "mobile": {
    "bodyScrollWidth": 320,
    "documentScrollWidth": 320,
    "firstCardWidth": 296,
    "viewportWidth": 320,
    "mobileReadable": true
  }
}
```

Coordinator follow-up: refreshed `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack/react-ai-members-mobile-320.png` after constraining the AI member page/card region to the 320px viewport. The first AI member card now measures `296px` within `viewportWidth: 320`; the human member table remains horizontally scrollable only inside `.uz-agent-table-wrap`.

## Validation

Local validation used Codex-bundled Node 24.14.0 / npm 11.9.0 with `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH`.

| Command | Result | Notes |
|---|---|---|
| `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD` | pass | Exact range lists the 10 allowed files only. |
| `git diff --check` | pass | No whitespace errors. |
| `npm run format:check` | pass | All matched files use Prettier style. |
| `npm run jscpd` | pass | No duplicates found. |
| `npm run knip` | pass | No unused exports/files reported. |
| `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-41-ai-members-page.md --include-worktree` | pass | `changedFiles: 10`; categories `source: 5`, `test: 1`, `docs: 4`; source `netLoc: 598`, `newFiles: 3`. |
| `npx playwright test apps/admin/tests/m7-ui-ai-members.spec.ts` | pass | 3/3 passed; generated `/tmp/uzmax-m7-ui-41-ai-members-page-cleanstack`. Vite emitted the existing large-chunk warning and Node printed the existing `NO_COLOR`/`FORCE_COLOR` warning. |
| `npm run typecheck` | pass | TypeScript no emit passed. |
| `npm run lint` | pass | ESLint passed. |

## Remaining Deltas

- Runtime AI member DB/API/audit/member metric wiring remains intentionally not implemented.
- Production persona publish and real eval gate remain intentionally blocked.
- Owner visual acceptance is still required after PR review/browser comparison.
- This slice does not alter shared shell/sidebar/topbar/tokens/primitives/patterns, release acceptance or production readiness state.

## Non-Claims

- No production member metrics.
- No production persona publish.
- No production eval gate.
- No audit write.
- No LLM/provider call.
- No backend/API/DB/schema/RLS/runtime closure.
- No owner visual acceptance.
- No GA-0 or 1.0 release approval.

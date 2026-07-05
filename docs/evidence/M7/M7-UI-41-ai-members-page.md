# M7-UI-41 AI Members Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a smaller visible UI-first `tenant.aiMembers` / `AI 成员` candidate with sanitized synthetic mock data. It does not claim owner visual acceptance, runtime closure, production member metrics, production persona publish, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-41-ai-members-page.md`
- Route: `tenant.aiMembers`
- Source target: `apps/admin/src/pages/agents/AgentsPage.tsx`, `apps/admin/src/pages/agents/AgentViews.tsx`, `apps/admin/src/pages/agents/agentsFallback.ts`
- Test target: `apps/admin/tests/m7-ui-ai-members.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `docs/admin-design-system.md`.
- Read v1.1 PRD, technical architecture, backend design/frontend architecture, and acceptance matrix AI member/eval/mobile fallback sections.
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/agents.ts`
  - `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts`
- Inspected nearby current implementation/test:
  - `apps/admin/src/pages/evals/*`
  - `apps/admin/tests/m7-ui-eval-center.spec.ts`

## Data Boundary

- All member/persona data is synthetic and centralized in `agentsFallback.ts`.
- IDs use `SYN-AI-MEMBER-*`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `not production member metrics`, `no production persona publish`, `local action only`.
- Capability toggles, emergency stop/recovery, persona eval, and publish preview mutate browser-local state only.
- No DB/API/runtime/audit write/member metric/persona production publish is wired.

## Validation

Passed locally on this branch:

- `git diff --check`
- `node scripts/guards/doc-trigger-paths.mjs`
- `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-40-eval-center-visible-ui`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-40-eval-center-visible-ui --spec docs/specs/M7-UI-41-ai-members-page.md --include-worktree`
- `node_modules/.bin/prettier --check docs/specs/M7-UI-41-ai-members-page.md docs/evidence/M7/M7-UI-41-ai-members-page.md docs/admin-ui-page-migration-ledger.md docs/evidence/M7/README.md apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/agents/AgentsPage.tsx apps/admin/src/pages/agents/AgentViews.tsx apps/admin/src/pages/agents/agentsFallback.ts apps/admin/tests/m7-ui-ai-members.spec.ts`
- `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/agents/AgentsPage.tsx apps/admin/src/pages/agents/AgentViews.tsx apps/admin/src/pages/agents/agentsFallback.ts apps/admin/tests/m7-ui-ai-members.spec.ts`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `node_modules/.bin/playwright test apps/admin/tests/m7-ui-ai-members.spec.ts`

Build note: Vite emitted the existing large chunk warning; the build exited 0.

Coordinator regression:

- Stacked visible UI regression with group/conversation/ticket/knowledge/eval/AI members: `36 passed`.
- Mobile 320 uses a readable fallback with body no-overflow; the human member table remains horizontally scrollable inside its container and is not a final mobile redesign.

Source shape:

- `apps/admin/src/pages/agents/AgentsPage.tsx`: 239 lines.
- `apps/admin/src/pages/agents/AgentViews.tsx`: 214 lines.
- `apps/admin/src/pages/agents/agentsFallback.ts`: 132 lines.

## Browser Evidence

- Desktop screenshot: `/tmp/uzmax-m7-ui-41-ai-members-visible-ui-v2/react-ai-members-desktop.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-41-ai-members-visible-ui-v2/react-ai-members-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-41-ai-members-visible-ui-v2/react-ai-members-metrics.json`

Metrics summary:

- `activePageId`: `tenant.aiMembers`
- `shellLevel`: `tenant`
- `sidebarExpandedWidth`: `232`
- `topbarHeight`: `53`
- `firstCardWidth`: `324`
- `gridColumnCount`: `3`

## Remaining Deltas

- Runtime AI member DB/API/audit/member metric wiring remains not implemented.
- Production persona publish and real eval gate remain intentionally blocked.
- Owner visual acceptance is still required after PR review/browser comparison.

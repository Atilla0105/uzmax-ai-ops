# M7-UI-51 Connection Center Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `group.connections` / `连接中心` candidate with synthetic mock/degraded data. It does not claim owner visual acceptance, runtime closure, production connector changes, real connection tests, audit writes, feature-flag persistence, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-51-connection-center-page.md`
- Route: `group.connections`
- Source target: `apps/admin/src/pages/group/GroupConnectionPage.tsx`, `apps/admin/src/pages/group/GroupConnectionViews.tsx`, `apps/admin/src/pages/group/groupConnectionFallback.ts`
- Test target: `apps/admin/tests/m7-ui-connection-center.spec.ts`
- Incident record: `docs/incidents/INC-2026-07-05-m7-ui-51-root-patch-target.md`

## Source Review

- Read `AGENTS.md`.
- Read `docs/admin-design-system.md`.
- Read `docs/specs/SPEC-template.md`.
- Ran Impeccable context for `apps/admin/src/pages/group/GroupConnectionPage.tsx` and read product-register guidance.
- Inspected current group page examples:
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
  - `apps/admin/tests/m7-ui-template-center.spec.ts`
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupConnectionPage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` connection section (`CONN_DEFS`, `CONN_HEALTH`)
  - `/Users/atilla/Downloads/运营塔台1.0.html` remains the frozen owner HTML source; the unpacked React source contained the required structure for this slice.

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate | Result |
|---|---|---|---|
| Header | `连接中心` plus subtitle `集团级连接类型 · 启停/测试写审计` | Same title/subtitle plus explicit `browser-local only` and degraded/mock badge | Aligned; boundary copy prevents production interpretation |
| Card list | Vertical list with icon block, name, health badge, ADR badge, description, meta row and tenant chips | Same structure with centralized `SYN-CONN-*` synthetic rows | Aligned with mock/read-only labeling |
| Controls | Right-side toggle and `测试连接` action | Same controls using `role="switch"`/`aria-checked`; actions mutate browser state only | Aligned; no persistence or connector call |
| Runtime states | Prototype shows default page | React adds deterministic loading/empty/error/permission/degraded states | Required M7 state coverage |

## Data Boundary

- All connection rows are synthetic and centralized in `groupConnectionFallback.ts`.
- Connection refs use `SYN-CONN-*`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic health`, `no production connector change`, `no real connection test`, `no audit write`.
- Toggle and test controls mutate browser-local UI state only. Toast copy explicitly says no production connector change, no real connection test and no audit write.
- No DB/API/runtime/connector/feature-flag/audit/export/release wiring is implemented.

## Worker Boundary Incident

- Incident: `docs/incidents/INC-2026-07-05-m7-ui-51-root-patch-target.md`
- Summary: an early relative `apply_patch` targeted root/main and created four untracked M7-UI-51 files there. The worker stopped, copied the exact files into the assigned worktree, removed only its accidental root files, and resumed with absolute assigned-worktree patch paths.
- Root/main cleanup result after containment: only unrelated pre-existing untracked `apps/admin/src/pages/knowledge/` and `docs/specs/M7-UI-32-knowledge-resources-page.md` remained.
- Assigned worktree result after containment: M7-UI-51 files existed only in the assigned branch/worktree.

## Validation

Passed locally on this branch:

- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-51-connection-center-page.md docs/evidence/M7/M7-UI-51-connection-center-page.md docs/incidents/INC-2026-07-05-m7-ui-51-root-patch-target.md docs/admin-ui-page-migration-ledger.md docs/evidence/M7/README.md apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/group/GroupConnectionPage.tsx apps/admin/src/pages/group/GroupConnectionViews.tsx apps/admin/src/pages/group/groupConnectionFallback.ts apps/admin/tests/m7-ui-connection-center.spec.ts`
- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node node_modules/eslint/bin/eslint.js apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/group/GroupConnectionPage.tsx apps/admin/src/pages/group/GroupConnectionViews.tsx apps/admin/src/pages/group/groupConnectionFallback.ts apps/admin/tests/m7-ui-connection-center.spec.ts`
- `git diff --check origin/codex/m7-ui-50-template-center-visible-ui...HEAD`
- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-50-template-center-visible-ui --spec docs/specs/M7-UI-51-connection-center-page.md --include-worktree`
- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node_modules/.bin/playwright test apps/admin/tests/m7-ui-connection-center.spec.ts`
- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node_modules/.bin/playwright test apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts apps/admin/tests/m7-ui-ticket-page.spec.ts apps/admin/tests/m7-ui-knowledge-resources.spec.ts apps/admin/tests/m7-ui-eval-center.spec.ts apps/admin/tests/m7-ui-ai-members.spec.ts apps/admin/tests/m7-ui-model-cost-risk.spec.ts apps/admin/tests/m7-ui-template-center.spec.ts apps/admin/tests/m7-ui-connection-center.spec.ts`

Validation notes:

- The shell does not expose `node`, `npm` or `npx` by default because `/Users/atilla/Applications/Codex/tools/bin/node` points at a missing `/Users/atilla/Documents/Codex/...` symlink target. Commands used the existing Node runtime at `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin`.
- `.prettierignore` ignores `*.md` and `docs/**`; the Prettier command validates matched source/test files and skips docs by repo rule.
- `guard:pr-shape` output: `changedFiles=11`, source files `5`, docs `5`, test `1`. It accepted the spec-owned path set, including the worker-boundary incident file.
- Vite emitted the existing large chunk warning and exited 0.
- Focused connection center Playwright: `4 passed`.
- Stacked visible UI regression: `49 passed`.

## Browser Evidence

Captured under `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/`:

- Desktop screenshot: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-desktop.png`
- Local toast screenshot: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-local-toast.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-51-connection-center-visible-ui/react-connection-center-metrics.json`

Metrics summary:

- `activePageId`: `group.connections`
- `shellLevel`: `group`
- `sidebarExpandedWidth`: `232`
- `topbarHeight`: `53`
- `cardCount`: `4`
- `firstCardWidth`: `820`
- `listMaxWidth`: `820px`
- `bodyScrollWidth`: `1280` on desktop capture; mobile test asserted `document.body.scrollWidth <= 320`.

## Remaining Deltas

- Runtime connector DB/API/adapter/feature-flag/audit paths remain intentionally not implemented.
- Telegram Bot, Telegram Business, order API and import fallback are not real-tested by this page.
- Owner visual acceptance is still required after PR review/browser comparison.

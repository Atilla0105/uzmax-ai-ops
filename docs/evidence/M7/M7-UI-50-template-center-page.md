# M7-UI-50 Template Center Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `group.templates` / `模板中心` candidate with synthetic mock/degraded data. It does not claim owner visual acceptance, runtime closure, production template copy, audit/config/knowledge/eval/persona write, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-50-template-center-page.md`
- Route: `group.templates`
- Source target: `apps/admin/src/pages/group/GroupTemplatePage.tsx`, `apps/admin/src/pages/group/GroupTemplateViews.tsx`, `apps/admin/src/pages/group/groupTemplateFallback.ts`
- Test target: `apps/admin/tests/m7-ui-template-center.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `docs/admin-design-system.md`.
- Ran Impeccable context for `apps/admin/src/pages/group/GroupTemplatePage.tsx` and read product/register guidance plus layout/typeset/adapt/clarify references.
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` template section and `GROUP_TENANTS`
  - `/Users/atilla/Downloads/运营塔台1.0.html` remains the frozen owner HTML source; the unpacked React source contained the required structure for this slice.
- Inspected nearby current implementation/test:
  - `apps/admin/src/pages/group/GroupModelRiskPage.tsx`
  - `apps/admin/src/pages/group/GroupModelRiskViews.tsx`
  - `apps/admin/src/pages/group/groupModelRiskFallback.ts`
  - `apps/admin/tests/m7-ui-model-cost-risk.spec.ts`

## Three-Way Comparison

| Surface | Owner / unpacked source | React candidate | Result |
|---|---|---|---|
| Header | `模板中心` plus subtitle `复制到租户将生成独立版本` | Same title/subtitle plus explicit degraded/mock badge | Aligned; added boundary badge to prevent production interpretation |
| Tabs | `知识包 / 人设 / 配置 / 评测集 / 话术包` | Same five tabs and order | Aligned |
| Cards | Dense grid with name, business line, eval badge, version/meta/recent-copy line and copy action | Same structure with centralized `SYN-TMPL-*` synthetic rows | Aligned with mock/read-only labeling |
| Copy modal | Centered modal, tenant multi-select rows, confirm disabled until selected | Same interaction and local-only confirmation | Aligned; no tenant navigation, no persistence |
| Runtime states | Prototype shows default page | React adds deterministic loading/empty/error/permission/degraded states | Required M7 state coverage |

## Data Boundary

- All template/card/tenant-target data is synthetic and centralized in `groupTemplateFallback.ts`.
- Template refs use `SYN-TMPL-*`; modal targets use `SYN-COPY-*`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `no production template copy`, `no audit write`, `no config write`.
- Copy confirmation mutates browser-local state only and closes with a toast saying no production template copy/audit/config write.
- No DB/API/runtime/ops-assets/template persistence/audit/config/knowledge/eval/persona write is wired.

## Validation

Passed locally on this branch:

- Post-coordinator fix: `PageOutlet.tsx` was refactored from a long route `if` chain into group/tenant renderer maps so targeted ESLint including `PageOutlet.tsx` passes the complexity <= 10 rule; the review fix below restores the one queue-wrapper drift from that refactor.
- Post-read-only-review fix: the copy modal now moves focus to the close control on open, traps Tab/Shift+Tab within the dialog, closes on Escape and returns focus to the originating `复制到租户` trigger after Escape/cancel/confirm.
- Post-read-only-review fix: tenant target rows now use checkbox semantics inside a labelled group (`role="checkbox"`/`aria-checked`), keep the visual row treatment, and mark the colored status dot decorative with `aria-hidden="true"`.
- Post-read-only-review fix: `tenant.queue` now renders through the prior tenant-id-free `page-outlet` wrapper again, while tenant pages that need `selectedTenantId` keep the tenant wrapper and `tenant.conversations` keeps its outlet class.
- PR-shape output after the review fix: `changedFiles=10`, source files `5`, test files `1`, docs `4`, source `netLoc=566`, new source files `3`.
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-50-template-center-page.md docs/evidence/M7/M7-UI-50-template-center-page.md docs/admin-ui-page-migration-ledger.md docs/evidence/M7/README.md apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/group/GroupTemplatePage.tsx apps/admin/src/pages/group/GroupTemplateViews.tsx apps/admin/src/pages/group/groupTemplateFallback.ts apps/admin/tests/m7-ui-template-center.spec.ts`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/eslint/bin/eslint.js apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/group/GroupTemplatePage.tsx apps/admin/src/pages/group/GroupTemplateViews.tsx apps/admin/src/pages/group/groupTemplateFallback.ts apps/admin/tests/m7-ui-template-center.spec.ts`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `git diff --check origin/codex/m7-ui-42-model-cost-risk-visible-ui...HEAD`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-42-model-cost-risk-visible-ui --spec docs/specs/M7-UI-50-template-center-page.md --include-worktree`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/playwright test apps/admin/tests/m7-ui-template-center.spec.ts`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/playwright test apps/admin/tests/m7-ui-group-overview.spec.ts apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts apps/admin/tests/m7-ui-ticket-page.spec.ts apps/admin/tests/m7-ui-knowledge-resources.spec.ts apps/admin/tests/m7-ui-eval-center.spec.ts apps/admin/tests/m7-ui-ai-members.spec.ts apps/admin/tests/m7-ui-model-cost-risk.spec.ts apps/admin/tests/m7-ui-template-center.spec.ts`

Validation notes:

- The shell does not expose `node`, `npm` or `npx` by default. Commands used the bundled Node path via `PATH`.
- `.prettierignore` ignores `*.md` and `docs/**`; the Prettier check therefore validates matched source/test files and skips docs by repo rule.
- Vite emitted the existing large chunk warning and exited 0.
- Focused template center Playwright: `5 passed`.
- Stacked visible UI regression: `45 passed`.

## Browser Evidence

Captured under `/tmp/uzmax-m7-ui-50-template-center-visible-ui/`:

- Desktop screenshot: `/tmp/uzmax-m7-ui-50-template-center-visible-ui/react-template-center-desktop.png`
- Modal screenshot: `/tmp/uzmax-m7-ui-50-template-center-visible-ui/react-template-center-modal.png`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-50-template-center-visible-ui/react-template-center-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-50-template-center-visible-ui/react-template-center-metrics.json`

Metrics summary:

- `activePageId`: `group.templates`
- `shellLevel`: `group`
- `sidebarExpandedWidth`: `232`
- `topbarHeight`: `53`
- `cardCount`: `3`
- `modalWidth`: `420`
- `activeTab`: `知识包`

## Remaining Deltas

- Runtime template copy DB/API/ops-assets/audit/config/knowledge/eval/persona write paths remain intentionally not implemented.
- Owner visual acceptance is still required after PR review/browser comparison.

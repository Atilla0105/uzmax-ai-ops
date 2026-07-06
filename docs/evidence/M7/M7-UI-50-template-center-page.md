# M7-UI-50 Template Center Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements a visible UI-first `group.templates` / `模板中心` candidate with synthetic mock/degraded data. It does not claim owner visual acceptance, runtime closure, production template copy, audit/config/ops-assets/knowledge/eval/persona/quick-reply write, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-50-template-center-page.md`
- Route: `group.templates`
- Source target: `apps/admin/src/pages/group/GroupTemplatePage.tsx`, `apps/admin/src/pages/group/GroupTemplateViews.tsx`, `apps/admin/src/pages/group/groupTemplateFallback.ts`
- Test target: `apps/admin/tests/m7-ui-template-center.spec.ts`
- Base: `origin/codex/m7-ui-31-orders-visible-ui` at `7366ebbdc6f69e588d282fe5cb1556e19369d164`

## Worker Preflight

| Check | Result |
|---|---|
| `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-50-template-center-page-cleanstack` |
| `git status --short --branch` | `## codex/m7-ui-50-template-center-page-cleanstack...origin/codex/m7-ui-31-orders-visible-ui` |
| `git branch --show-current` | `codex/m7-ui-50-template-center-page-cleanstack` |

## Source Review

- Read `AGENTS.md`.
- Read Impeccable project skill, ran context for `apps/admin/src/pages/group/GroupTemplatePage.tsx`, and read the product register.
- Coordinator early review reported Impeccable detect returned `[]`.
- Read `docs/admin-design-system.md`.
- Searched v1.1 PRD, technical architecture, admin design/frontend architecture and acceptance matrix for template/group/tenant/boundary clauses.
- Inspected owner/prototype sources:
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` template section and `GROUP_TENANTS`
  - `/Users/atilla/Downloads/运营塔台1.0.html` is sampled by Playwright when available; unavailable evidence is written when CI lacks the file.
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
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `no production template copy`, `no audit write`, `no config write`, `no knowledge/eval/persona/quick-reply write`, `no ops-assets write`.
- Copy confirmation mutates browser-local state only and closes with a toast saying no production template copy/audit/config/knowledge/eval/persona/quick-reply/ops-assets write.
- No DB/API/runtime/ops-assets/template persistence/audit/config/knowledge/eval/persona/quick-reply write is wired.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/`

Focused Playwright outputs:

- Source availability: `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/source-availability.json`
- Source sampling or unavailable note: `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/source-sampling.json` or `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/source-unavailable.md`
- Desktop metrics: `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/react-template-center-desktop-metrics.json`
- Desktop screenshot: `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/react-template-center-desktop.png`
- Modal screenshot: `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/react-template-center-modal.png`
- Mobile 320 metrics: `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/react-template-center-mobile-320-metrics.json`
- Mobile 320 screenshot: `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/react-template-center-mobile-320.png`

Metrics summary:

| Metric | Value |
|---|---:|
| desktop `activePageId` | `group.templates` |
| desktop `shellLevel` | `group` |
| desktop `sidebarExpandedWidth` | `232` |
| desktop `topbarHeight` | `53` |
| desktop `cardCount` | `3` |
| desktop `cardWidths` | `324, 324, 324` |
| desktop `headerWidth` | `1048` |
| desktop `tabsWidth` | `1000` |
| mobile `bodyScrollWidth` | `320` |
| mobile `documentScrollWidth` | `320` |
| mobile `headerWidth` | `320` |
| mobile `tabsWidth` | `296` |
| mobile `cardWidth` | `296` |
| mobile `modalWidth` | `296` |

## Validation

Passed locally on this branch:

- `git diff --check`
- `npm run format:check`
- `npm run jscpd`
- `npm run knip`
- `npx playwright test apps/admin/tests/m7-ui-template-center.spec.ts`
- `npm run typecheck`
- `npm run lint`
- `wc -l apps/admin/src/pages/group/GroupTemplateViews.tsx`: `248`, under the spec/change-budget ceiling of 250 lines for React component files.

Validation notes:

- The shell did not expose `node`, `npm` or `npx` by default. This worker used the bundled Codex Node path and a temporary `/tmp/uzmax-m7-ui-50-bin` npm/npx shim for commands that invoke `npm` or `npx`.
- The assigned worker worktree created its own ignored `node_modules/` with `npm ci --ignore-scripts` to honor worktree isolation, then ran `prisma generate --schema packages/db/prisma/schema.prisma` so `npm run typecheck` could resolve the generated Prisma client. No `package-lock.json` or package files changed.
- `npx playwright test apps/admin/tests/m7-ui-template-center.spec.ts`: 5 passed; Vite emitted the existing large-chunk warning and exited 0.
- `npm run jscpd`: pass, no duplicates found after refactoring copied helper shapes.
- `npm run knip`: pass, no unused exports.
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-50-template-center-page.md --include-worktree`: pass; `changedFiles=10`, categories `source=5`, `test=1`, `docs=4`, source `changedFiles=5`, `newFiles=3`, `netLoc=596`.

## Remaining Deltas

- Runtime template copy DB/API/ops-assets/audit/config/knowledge/eval/persona/quick-reply write paths remain intentionally not implemented.
- Owner visual acceptance is still required after PR review/browser comparison.

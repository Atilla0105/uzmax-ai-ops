# M7-UI-55 分析页面证据

## Status

`visible_mvp_candidate_pending_pr_review`

本分支实现 UI-first `tenant.analytics` / 分析 页面。默认使用 mock/degraded/browser-local 状态，不声称生产 analytics 指标、导出文件写入、analytics runtime、审计写入、owner visual acceptance、runtime closure 或 release closure。

## Scope

- Spec: `docs/specs/M7-UI-55-analytics-page.md`
- Route: `tenant.analytics`
- Source target: `apps/admin/src/pages/analytics/AnalyticsPage.tsx`, `apps/admin/src/pages/analytics/analyticsFallback.ts`
- Test target: `apps/admin/tests/m7-ui-analytics-page.spec.ts`

## Source Inspected

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `docs/admin-ui-page-migration-ledger.md` 顶部规则与 `tenant.analytics` 行
- `docs/admin-design-system.md`
- `/Users/atilla/源码/unpacked 6/pages/analytics/AnalyticsPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/analytics.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html` 中分析相关 owner prototype region
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/impeccable/reference/product.md`

## Data Boundary

- 所有分析数据来源：`analyticsFallback.ts` 的 centralized synthetic/mock fixture。
- 时间范围切换：仅在浏览器本地改变展示倍数。
- 添加/移除维度：仅在浏览器本地改变分析表组合，最多 2 个维度。
- 导出：仅显示 local-only toast。
- 未实现 production analytics metrics、export file write、analytics runtime、audit write。

## Validation

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-55-analytics-visible-ui`
- `git status --short --branch`: branch `codex/m7-ui-55-analytics-visible-ui` on `origin/codex/m7-ui-54-config-visible-ui`, dirty only in scoped files before commit.
- Root/main post-cleanup status: no `apps/admin/src/pages/analytics/` entry; unrelated pre-existing untracked `apps/admin/src/pages/knowledge/`, `apps/admin/src/pages/team/`, and `docs/specs/M7-UI-32-knowledge-resources-page.md` remained untouched.
- `git diff --check origin/codex/m7-ui-54-config-visible-ui`: pass.
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-54-config-visible-ui --spec docs/specs/M7-UI-55-analytics-page.md --include-worktree`: pass; changedFiles 10, categories source 4/test 1/docs 5, source changedFiles 4, source netLoc 429, newFiles 2 as confirmed by coordinator.
- Targeted Prettier: pass for scoped source/test/docs files.
- Targeted ESLint: pass for scoped source/test files.
- Admin-target TypeScript: pass, `node node_modules/typescript/lib/tsc.js --ignoreConfig --noEmit --jsx react-jsx --moduleResolution bundler --module esnext --target es2022 --lib dom,dom.iterable,es2022 --types vite/client,node --strict --skipLibCheck --allowSyntheticDefaultImports --esModuleInterop apps/admin/src/main.tsx apps/admin/tests/m7-ui-analytics-page.spec.ts --pretty false`.
- Vite admin build: pass via direct script-equivalent command `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`; `npm` was unavailable in the runtime PATH, and Vite emitted the existing large chunk warning.
- Focused Playwright `apps/admin/tests/m7-ui-analytics-page.spec.ts`: pass, 5/5 desktop-chromium; first run exposed a test selector ambiguity only, fixed with exact button matching before final pass.
- Stacked M7 visible regression `apps/admin/tests/m7-ui-*.spec.ts`: pass, 101/101 desktop-chromium, freshly confirmed by coordinator.
- Dependency hygiene: temporary `node_modules` symlink was removed before final pr-shape and commit; current worker status is clean except branch upstream metadata.

## Visual Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-55-analytics-page-visible-ui/react-analytics-desktop.png`
- `/tmp/uzmax-m7-ui-55-analytics-page-visible-ui/react-analytics-mobile-320.png`
- `/tmp/uzmax-m7-ui-55-analytics-page-visible-ui/react-analytics-metrics.json`

Metrics:

- `activePageId`: `tenant.analytics`
- `shellLevel`: `tenant`
- `bodyScrollWidth`: `1280`
- `kpiCount`: `10`
- `tableWidth`: `998`

## Browser Comparison Notes

- React visible MVP keeps tenant-layer shell/category grouping, owner/source-like header, time range segmented control, add-dimension menu, export control, KPI grid, handoff reason bars, Top issue list, dimension chips and analysis table.
- Mobile fallback keeps body scroll bounded at 320px; the table is allowed to scroll inside its own container.
- Remaining visual delta: charts remain lightweight CSS bars and table/list panels rather than a full pixel-complete analytics dashboard; exact prototype spacing and menu polish remain visual parity follow-up. This slice does not claim owner visual acceptance.

## Incident Note

- `docs/incidents/INC-2026-07-05-m7-ui-55-root-patch-target.md` records an early patch-target miss into root/main. The accidental root analytics directory was removed; unrelated root/main untracked files were left untouched. Implementation continued with absolute paths under the assigned worktree.

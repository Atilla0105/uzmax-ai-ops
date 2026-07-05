# M7-UI-54 配置页面证据

## Status

`visible_mvp_candidate_pending_pr_review`

本分支实现收窄后的 visible MVP `tenant.config` / 配置 页面。默认使用 mock/degraded/browser-local 状态，不声称生产配置写入、审计写入、connector 切换、eval-gated publish、owner visual acceptance、runtime closure 或 release closure；深度配置交互保留为后续切片。

## Scope

- Spec: `docs/specs/M7-UI-54-config-page.md`
- Route: `tenant.config`
- Source target: `apps/admin/src/pages/config/ConfigPage.tsx`, `apps/admin/src/pages/config/configFallback.ts`
- Test target: `apps/admin/tests/m7-ui-config-page.spec.ts`

## Source Inspected

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `docs/admin-ui-page-migration-ledger.md` 顶部规则与 `tenant.config` 行
- `docs/admin-design-system.md`
- `/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useConfig.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/config.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/knowledge.ts` 的 `TMPL_SRC`
- `/Users/atilla/Downloads/运营塔台1.0.html` 中配置相关 owner prototype region

## Data Boundary

- 所有配置数据来源：`configFallback.ts` 的本地 sanitized fixture。
- 保存并生成版本：仅更新浏览器本地 version/history/dirty/toast。
- 版本历史回滚：原因必填，但仅本地，不写 audit。
- 渠道测试/启停：仅本地状态和 toast。
- connector 测试/切换主路径：仅本地状态和 toast，不调用订单 API、不进入导入 runtime。
- 未实现 production config write、audit write、connector switch、eval-gated publish。

## Validation

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-54-config-visible-ui`
- `git status --short --branch`: branch `codex/m7-ui-54-config-visible-ui` on `origin/codex/m7-ui-53-team-visible-ui`, dirty only in scoped files before commit.
- `git diff --check origin/codex/m7-ui-53-team-visible-ui...HEAD`: pass.
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-53-team-visible-ui --spec docs/specs/M7-UI-54-config-page.md --include-worktree`: pass; changedFiles 9, source changedFiles 4, source netLoc 300, newFiles 2 as reported by coordinator guard.
- Targeted Prettier: pass for scoped source/test/docs files.
- Targeted ESLint: pass for scoped source/test files.
- Admin-target TypeScript: pass, `node node_modules/typescript/lib/tsc.js --ignoreConfig --noEmit --jsx react-jsx --moduleResolution bundler --module esnext --target es2022 --lib dom,dom.iterable,es2022 --types vite/client,node --strict --skipLibCheck --allowSyntheticDefaultImports --esModuleInterop apps/admin/src/main.tsx apps/admin/tests/m7-ui-config-page.spec.ts --pretty false`.
- Vite admin build: pass, with existing large chunk warning.
- Focused Playwright `apps/admin/tests/m7-ui-config-page.spec.ts`: pass, 6/6 desktop-chromium.
- Stacked M7 visible regression `apps/admin/tests/m7-ui-*.spec.ts`: pass, 96/96 desktop-chromium.

## Visual Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-54-config-page-visible-ui/react-config-desktop.png`
- `/tmp/uzmax-m7-ui-54-config-page-visible-ui/react-config-mobile-320.png`
- `/tmp/uzmax-m7-ui-54-config-page-visible-ui/react-config-metrics.json`

Metrics:

- `activePageId`: `tenant.config`
- `shellLevel`: `tenant`
- `bodyScrollWidth`: `1280`
- `internalNavWidth`: `235`
- `sectionCount`: `8`

## Browser Comparison Notes

- React visible MVP keeps tenant-layer shell/category grouping, internal 236px-style config navigation, 8 source sections, version header, dirty badge, version history, local save/rollback, channel local controls and connector local switch modal.
- Mobile fallback uses horizontal/stacked internal config navigation and bounded body scroll at 320px.
- Remaining visual delta: visible MVP has locked the internal 236px nav, 8 sections and version header, but internal nav icons, full source-page deep interactions and exact row-spacing details remain pixel/detail parity follow-up. This is still UI-first synthetic evidence and does not claim owner visual acceptance.

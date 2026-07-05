# M7-UI-71 Template Center Source Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes browser-comparable source-parity evidence for `group.templates` / `模板中心` on top of the latest #212 visible UI stack. It keeps template-center runtime downgraded: no template DB/API/runtime, ops-assets wiring, production template copy, audit write, config/KB/persona/eval/template write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-71-template-center-source-parity-refresh.md`
- Route: `group.templates`
- Base: `origin/codex/m7-ui-70-model-cost-risk-source-parity-refresh`
- Branch/worktree: `codex/m7-ui-71-template-center-source-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-71-template-center-source-parity-refresh`
- Source target:
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-template-center.spec.ts`

## Source Review

- Read `AGENTS.md`.
- Read `PRODUCT.md`, `DESIGN.md`, Impeccable product register and `docs/admin-design-system.md`.
- Read v1.1 PRD, technical architecture, admin design/frontend architecture and acceptance matrix template/group-layer/admin-quality/release-boundary sections.
- Read prior M7 template-center spec/evidence:
  - `docs/specs/M7-UI-50-template-center-page.md`
  - `docs/evidence/M7/M7-UI-50-template-center-page.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
  - `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
  - `/Users/atilla/源码/unpacked 6/App.tsx`
- Inspected current implementation/test:
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
  - `apps/admin/tests/m7-ui-template-center.spec.ts`

## Source Parity Changes

- Updated the copy modal subcopy from an English-heavy/browser-preview phrasing to the source-shaped `复制后生成独立版本，可各自演进`, while keeping `browser-local only` visible.
- Updated the local toast to start with the owner source shape `已复制「...」到 N 个租户 · tab`, while preserving `browser-local only`, `no production template copy`, `no audit write` and `no config write`.
- Kept the current governance adaptation of a status badge/runtime note because the page is still degraded/mock/read-only and must not look like production template copy is wired.
- Kept accessible close/focus handling and checkbox semantics in the modal; this differs from the raw owner source mechanics but preserves visible modal/card shape and improves operability.

## Data And Runtime Boundary

- All template/card/tenant-target data remains centralized synthetic fallback data in `groupTemplateFallback.ts`.
- Persistent UI copy states: `degraded`, `mock`, `read-only`, `browser-local only`, `no production template copy`, `no audit write`, `no config write`.
- Copy confirmation mutates browser-local state only and closes with a toast saying no production template copy/audit/config write.
- No DB/API/runtime/ops-assets/template persistence/audit/config/knowledge/eval/persona write is wired.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/`

Captured artifacts:

- Owner HTML screenshot: `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/owner-html-template-center-source-sample.png`
- Owner HTML DOM/text sample: `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/owner-html-template-center-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/unpacked-template-center-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/react-template-center-desktop.png`
- React copy modal screenshot: `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/react-template-center-copy-modal.png`
- React collapsed-sidebar screenshot: `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/react-template-center-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/react-template-center-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/metrics.json`

## Validation

Passed locally in this worker:

- `git diff --check origin/codex/m7-ui-70-model-cost-risk-source-parity-refresh...HEAD`
- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-70-model-cost-risk-source-parity-refresh --spec docs/specs/M7-UI-71-template-center-source-parity-refresh.md --include-worktree`
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-71-template-center-source-parity-refresh.md docs/evidence/M7/M7-UI-71-template-center-source-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md apps/admin/tests/m7-ui-template-center-source-parity.spec.ts apps/admin/src/pages/group/GroupTemplateViews.tsx apps/admin/src/pages/group/groupTemplateFallback.ts`
- `node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupTemplateViews.tsx apps/admin/src/pages/group/groupTemplateFallback.ts apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- `node_modules/.bin/playwright test apps/admin/tests/m7-ui-template-center-source-parity.spec.ts apps/admin/tests/m7-ui-template-center.spec.ts`

Validation notes:

- The shell does not expose `node`, `npm` or `npx` by default. Commands used bundled Node via `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH`.
- This worktree did not have its own `node_modules`; validation temporarily used a sibling `node_modules` symlink. The symlink was removed before final guard/status/commit.
- Playwright config's `webServer` command calls `npm`, which is unavailable in this shell. A Vite preview server was manually started with `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`, reused for Playwright, then stopped.
- `.prettierignore` ignores `*.md` and `docs/**`; the Prettier check therefore validates matched source/test files and skips docs by repo rule.
- Vite emitted the existing large chunk warning and exited 0.
- Focused Playwright result: `6 passed`.
- PR-shape output: `changedFiles=7`, categories `source=2`, `docs=4`, `test=1`, source `changedFiles=2`, source `netLoc=0`, new source files `0`.

Metrics summary from `/tmp/uzmax-m7-ui-71-template-center-source-parity-refresh/metrics.json`:

- Desktop: `shellLevel=group`, `activePageId=group.templates`, `navWidth=232`, `topbarHeight=53`, `bodyScrollWidth=1440`, `documentScrollWidth=1440`.
- Desktop geometry: header width `726`, tab list width `678`, card grid width `678`, first card width `332`, source-like default visible `true`.
- Modal: width `420`, height `330`, source-like modal visible `true`, four tenant targets rendered, confirm disabled until selection.
- Toast: source-shaped `已复制「美妆售后知识包 v4.2」到 1 个租户 · 知识包` plus `browser-local only/no production template copy/no audit write/no config write`, source-like toast visible `true`.
- Collapsed: `navWidth=68`, group categories `总览/平台/治理`, tenant category/button count `0`.
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`, group categories `总览/平台/治理`, readable fallback `true`.
- Owner HTML DOM/text sample contains the template center region and copy action. The owner HTML sample uses older tab nouns `知识模板 / AI 成员模板 / 配置模板 / 评测模板 / 话术模板`, while frozen unpacked source and this owner task specify `知识包 / 人设 / 配置 / 评测集 / 话术包`; React follows the frozen unpacked/task source.

## Remaining Deltas

- Runtime template copy DB/API/ops-assets/audit/config/knowledge/eval/persona write paths remain intentionally not implemented.
- Real template independent-version persistence, audit log and config write evidence remains intentionally blocked.
- Current React still adds a compact status badge/runtime note not present in the owner source; this is retained as a governance adaptation because the page remains degraded/mock/read-only.
- Template ids remain synthetic (`SYN-TMPL-*`, `SYN-COPY-*`) and eval labels keep `mock` prefixes; source shape is preserved, but production-looking ids/statuses are intentionally avoided.
- Owner HTML sample tab nouns differ from the frozen unpacked source/task anatomy as noted above; this refresh keeps the frozen unpacked/task tab labels.
- Owner visual acceptance, merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.

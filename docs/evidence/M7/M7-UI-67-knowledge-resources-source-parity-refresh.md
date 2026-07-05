# M7-UI-67 Knowledge Resources Source Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.knowledge` / 知识与资源 on stacked branch `codex/m7-ui-67-knowledge-resources-source-parity-refresh`, based on `origin/codex/m7-ui-66-orders-source-parity-refresh` (#208 stack).

This slice adds a focused source-parity Playwright pass for the existing knowledge/resources page on the latest tenant shell stack. It does not claim KB DB/API/storage/eval runtime, formal knowledge write, automatic publish, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-67-knowledge-resources-source-parity-refresh` |
| worker branch | `codex/m7-ui-67-knowledge-resources-source-parity-refresh` |
| worker status at entry | `## codex/m7-ui-67-knowledge-resources-source-parity-refresh...origin/codex/m7-ui-66-orders-source-parity-refresh` |
| entry HEAD | `1f2d00f6d2d2f6366e21658e80feb79d106c1c4f` |
| base | `origin/codex/m7-ui-66-orders-source-parity-refresh` / #208 stack |
| root/main checkout | Root checkout was read-only for this worker. |

## Required Reads / Mapping

- `AGENTS.md`
- `docs/specs/M7-UI-32-knowledge-resources-page.md`
- `docs/evidence/M7/M7-UI-32-knowledge-resources-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/knowledge/KnowledgePage.tsx`
- `apps/admin/src/pages/knowledge/KnowledgeViews.tsx`
- `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
- `apps/admin/tests/m7-ui-knowledge-resources.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/knowledge/KnowledgePage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useKnowledge.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/knowledge.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 knowledge boundaries: PRD REQ-T05/REQ-T06/NG-05, admin §4.5, architecture knowledge/template/eval-gate rules and acceptance H-01/H-02/H-04/H-06/H-07/I-01.

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source opened by Playwright for knowledge/resources owner/source sample. |
| Unpacked knowledge page | Source anatomy: title, six tabs, toolbar search/chips/actions, journey pipeline/stage detail/warning, facts table/detail/redline toggle, public/private snippets, assets table/detail/edit/delete and template source table. |
| Unpacked `useKnowledge.ts` | Local state source for tab/search/category, stage selection, fact redline, snippets, assets, asset detail/edit/delete and template source. |
| Unpacked `fixtures/knowledge.ts` | Field-shape source for prototype-like knowledge entities; React keeps centralized synthetic/degraded fallback labeling. |

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-67-knowledge-resources-source-parity-refresh.md` | Adds scoped source-parity refresh spec for knowledge/resources on the latest #208 stack. |
| `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts` | Adds focused Playwright evidence for owner/source sample, unpacked mapping, tenant shell, active page, nav/topbar geometry, tenant-only categories, knowledge source anatomy, degraded caveat, desktop journey/facts/assets/templates, collapsed sidebar and mobile fallback artifacts. |
| `docs/evidence/M7/README.md` | Records M7-UI-67 as visible refresh candidate, not runtime or owner acceptance. |
| `docs/admin-ui-page-migration-ledger.md` | Updates the `tenant.knowledge` row/status to include this source-parity refresh. |

No UI source changes are included.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/`

- Owner/source sample: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/owner-html-knowledge-source-sample.png`
- Owner/source DOM sample: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/owner-html-knowledge-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/unpacked-knowledge-source-mapping.json`
- React journey desktop screenshot: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/react-knowledge-journey-desktop.png`
- React facts/detail screenshot: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/react-knowledge-facts-detail.png`
- React assets detail screenshot: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/react-knowledge-assets-detail.png`
- React templates screenshot: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/react-knowledge-templates.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/react-knowledge-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/react-knowledge-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/metrics.json`

Expected assertions:

- tenant shell and active page `tenant.knowledge`;
- topbar height about `53`, nav `232` expanded / `68` collapsed;
- tenant nav sections exactly `运营/数据/智能/管理/洞察`, group sections absent;
- source-like knowledge title, six tabs, toolbar search/chips/actions, journey stage pipeline/detail/warning, facts table/detail/redline toggle, public/private snippets, assets table/detail local edit/delete and template source table;
- degraded/mock/read-only/not-production-knowledge-data/no-formal-write/no-automatic-publish caveat visible but not replacing content;
- `320px` mobile body scrollWidth `<= 320`.

Measured React metrics:

| Metric | Journey | Facts/detail | Assets/detail | Templates/collapsed | Mobile 320 |
|---|---:|---:|---:|---:|---:|
| shell level | `tenant` | `tenant` | `tenant` | `tenant` | `tenant` |
| active page | `tenant.knowledge` | `tenant.knowledge` | `tenant.knowledge` | `tenant.knowledge` | `tenant.knowledge` |
| nav width | `232` | `232` | `232` | `68` | `320` |
| topbar height | `53` | `53` | `53` | `53` | `53` |
| page width | `730` | `1070` | `694` | `775` | `320` |
| search width | `0` journey state | `320` | `320` before detail | `0` template state | `0` detail state |
| table/detail width | `0 / 682` | `685 / 340` | `0 / 694` | `725 / 775` | `0 / 296` |
| body/document scrollWidth | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `320 / 320` |
| tenant categories | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` |
| group category/button count | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` |
| runtime caveat | visible | visible | visible | visible | visible |

Unpacked source mapping records source files read, source anatomy booleans for title, six tabs, toolbar search/chips/actions, journey pipeline, facts redline toggle, public/private snippets, assets local edit/delete and template source table, plus hook local state terms `tab/search/cat/stage/factOpen/facts/snippets/assets/assetOpen/assetEditing/assetDraft` and fixture domains `FACTS/KB_SNIPPETS/ASSETS/TMPL_SRC/STAGE_DEFS`.

## Runtime / Data Boundary

- Knowledge/resource data remains synthetic/prototype-shaped degraded mock fallback.
- Search, tab switch, stage selection, fact redline toggle and asset edit/delete remain local React state only.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar files are touched.
- No formal knowledge write or automatic publish is implemented or implied.
- Confirmation/eval-gated publish remains disabled/read-only until a future approved runtime spec exists.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check origin/codex/m7-ui-66-orders-source-parity-refresh...HEAD` | pass | No whitespace output. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-66-orders-source-parity-refresh --spec docs/specs/M7-UI-67-knowledge-resources-source-parity-refresh.md --include-worktree` | pass | Ran after removing the temporary untracked `node_modules` symlink; docs/test-only diff within spec touch list, `source.changedFiles: 0`. |
| `node node_modules/prettier/bin/prettier.cjs --check ...` | pass | Touched spec/evidence/README/ledger/test files use Prettier style. |
| `node node_modules/eslint/bin/eslint.js apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts` | pass | Focused new test passes ESLint complexity and file-length rules. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` | pass | TypeScript completed cleanly. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts apps/admin/tests/m7-ui-knowledge-resources.spec.ts` | pass | 9/9 passed with manual `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173` because local `npm` is unavailable; writes owner/source sample, unpacked mapping, desktop journey/facts/assets/templates/collapsed/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/`. |

## Remaining Differences / Non-Claims

- This slice records parity evidence on the current #208 visible stack; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before production knowledge records, KB storage, eval runner wiring, formal writes or publish actions can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.

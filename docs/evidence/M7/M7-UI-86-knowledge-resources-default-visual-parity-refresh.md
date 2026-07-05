# M7-UI-86 Knowledge Resources Default Visual Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.knowledge` / 知识与资源 on stacked branch `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh`, based on `codex/m7-ui-85-customer-assets-default-visual-parity-refresh` / PR #227 HEAD.

This slice removes visible engineering/runtime labels from the default knowledge/resources fallback body while preserving degraded/mock/read-only/no runtime/no formal write/no automatic publish evidence in hidden DOM, `data-runtime-boundary`, `title`/ARIA and focused Playwright metrics. It does not claim knowledge DB/API/runtime, storage, eval runner, formal KB write, automatic publish, owner visual acceptance, merge, GA/1.0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-86-knowledge-resources-default-visual-parity-refresh` |
| worker branch | `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` |
| worker status at entry | `## codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` |
| entry HEAD | `441f207` |
| base | `codex/m7-ui-85-customer-assets-default-visual-parity-refresh` / PR #227 HEAD at entry |
| root/main checkout | Root checkout was not used for writes. |

## Required Reads / Mapping

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- Impeccable project context and product register
- `docs/specs/M7-UI-32-knowledge-resources-page.md`
- `docs/specs/M7-UI-67-knowledge-resources-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-67-knowledge-resources-source-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/knowledge/KnowledgePage.tsx`
- `apps/admin/src/pages/knowledge/KnowledgeViews.tsx`
- `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
- `apps/admin/tests/m7-ui-knowledge-resources.spec.ts`
- `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/knowledge/KnowledgePage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useKnowledge.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/knowledge.ts`

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source remains the owner visual/source oracle for knowledge/resources within the tenant shell. |
| Unpacked knowledge page | Source anatomy: title, six tabs, toolbar search/chips/actions, journey pipeline/stage detail/warning, facts table/detail/redline toggle, public/private snippets, assets table/detail/edit/delete and template source table. |
| Unpacked `useKnowledge.ts` | State-machine reference for tab/search/category/stage/fact/snippet/asset/template behavior only. |
| Unpacked `fixtures/knowledge.ts` | Wording and field-shape reference for journeys, facts, snippets, assets, templates, redline/eval gate and confirmation queue vocabulary; not production data. |

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/knowledge/KnowledgePage.tsx` | Adds page-level hidden runtime boundary data and replaces visible asset/template counts/source refs with business labels while preserving test ids. |
| `apps/admin/src/pages/knowledge/KnowledgeViews.tsx` | Replaces visible state, journey, facts, snippets and warning copy with business Chinese operations copy; source refs and write/runtime boundaries move to data/title metadata. |
| `apps/admin/src/pages/knowledge/knowledgeFallback.ts` | Reworks visible fallback facts/snippets/assets/templates/stages to owner/source-like operations vocabulary; hides runtime note while preserving boundary evidence. |
| `apps/admin/tests/m7-ui-knowledge-resources.spec.ts` | Updates existing focused interactions to assert clean visible body and hidden runtime boundary evidence. |
| `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts` | Keeps source-parity geometry/screenshots while reading caveat evidence from hidden/data/title attributes instead of visible body text. |
| `apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts` | Adds focused M7-UI-86 coverage for clean default journey/facts/snippets/assets/templates/states/mobile body plus hidden boundary metrics. |
| `docs/specs/M7-UI-86-knowledge-resources-default-visual-parity-refresh.md` | Adds scoped spec for this default visual parity refresh. |
| `docs/evidence/M7/README.md` and `docs/admin-ui-page-migration-ledger.md` | Records UI-86 as a visible refresh candidate with hidden-runtime-boundary non-claims. |

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-86-knowledge-resources-default-visual-parity-refresh/`

- React journey screenshot: `/tmp/uzmax-m7-ui-86-knowledge-resources-default-visual-parity-refresh/react-knowledge-journey-default-clean.png`
- React assets detail screenshot: `/tmp/uzmax-m7-ui-86-knowledge-resources-default-visual-parity-refresh/react-knowledge-assets-default-clean.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-86-knowledge-resources-default-visual-parity-refresh/react-knowledge-mobile-320-default-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-86-knowledge-resources-default-visual-parity-refresh/metrics.json`
- Source-parity screenshots/metrics remain under `/tmp/uzmax-m7-ui-67-knowledge-resources-source-parity-refresh/` when the existing source-parity spec is run.

Expected assertions:

- default visible knowledge/resources body contains `知识与资源`, `教程旅程`, `事实条目`, `公共话术`, `私人话术`, `素材库`, `模板来源`, `阶段管线`, `套装报价口径`, `物流延迟标准安抚`, `面霜使用教程`, `美妆售后知识包`, `红线攻击评测集` and source-like operational labels;
- default visible body does not contain forbidden engineering terms;
- page root, hidden runtime note and local/edit/delete controls contain boundary evidence;
- asset/template source refs remain in `data-source-ref`/title rather than visible cells;
- tenant shell and active page `tenant.knowledge`;
- `320px` mobile body scrollWidth `<= 320`.

## Runtime / Data Boundary

- Knowledge/resource data remains page-local fallback state.
- Search, filter, stage select, fact redline toggle, asset edit/save/cancel/delete and template source display remain local React behavior only.
- No backend/API/DB/storage/eval runner/package/lock/shared shell/topbar/sidebar/router files are touched.
- No formal knowledge write, automatic publish, real customer/order data, production knowledge runtime or write is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git status --short --branch` | pass | `## codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` at entry. |
| `git branch --show-current` | pass | `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh`. |
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-85-customer-assets-default-visual-parity-refresh --spec docs/specs/M7-UI-86-knowledge-resources-default-visual-parity-refresh.md --include-worktree` | pass | Exact output: `changedFiles=10`, `categories.source=3`, `categories.test=3`, `categories.docs=4`, `source.changedFiles=3`, `source.netLoc=0`, `source.newFiles=0`. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Vite build passed; existing chunk-size warning only. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-knowledge-resources.spec.ts apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts` | pass | `11 passed (2.6s)`. Used manual `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173` because the Playwright config webServer calls unavailable `npm/npx`; preview was stopped after the run. |

Dependency note: this worktree initially had no `node_modules` and the Codex runtime did not provide `npm`; `pnpm install --ignore-scripts` was used only to populate local validation dependencies. The temporary `pnpm-lock.yaml` generated by pnpm was removed and no package/lock changes are part of this diff.

## Remaining Differences / Non-Claims

- This slice records a default visual parity refresh only; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before production knowledge records, KB storage, eval runner wiring, formal writes or publish actions can appear.
- Mobile is a readable/no-overflow fallback, not a pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA/1.0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or release.

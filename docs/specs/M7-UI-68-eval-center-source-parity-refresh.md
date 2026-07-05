# M7-UI-68 Eval Center Source Parity Refresh

## Goal

Refresh the existing visible UI-first `tenant.eval` / 评测中心 page on top of `origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh` (#209 stack) so the eval center remains browser-comparable against the owner HTML, frozen unpacked eval source and latest stacked tenant shell.

This is a source parity refresh, not a rewrite. Primary scope is evidence/test/docs only. Small `apps/admin/src/pages/evals/**` corrections are allowed only if browser evidence proves an obvious current React mismatch that must be fixed now. This slice does not implement eval DB/API/runner/runtime, LLM/provider calls, production eval data, production publish, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, frozen unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Eval data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `not production eval data`.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this branch is stacked on #209 / `origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh`.
- Confirm the current lane remains visible-UI-first while eval DB/API/runner/runtime and production publish are downgraded.
- Decide later whether real eval runner/runtime or production publish proceeds through a separate approved spec.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-68-eval-center-source-parity-refresh` on branch `codex/m7-ui-68-eval-center-source-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-40 spec/evidence, current eval source/tests, owner unpacked eval page/constants/hook/fixtures and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React blocked/running/pass/collapsed/mobile metrics.
- Preserve tenant-only routing, synthetic read-only eval data, Production Gate UI-only boundary, local-only manual review and local-only publish preview.

## Timebox

0.5 workday. If the page requires backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar/registry/PageOutlet edits, a broad page rewrite, real eval runner, production publish or real production eval data, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-68-eval-center-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-68-eval-center-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts`
- Conditional source scope, only if browser evidence proves a mismatch that must be fixed now:
  - `apps/admin/src/pages/evals/EvalPage.tsx`
  - `apps/admin/src/pages/evals/EvalViews.tsx`
  - `apps/admin/src/pages/evals/evalFallback.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: 0 expected; <= 3 conditional only
- source net LOC: 0 expected; <= 100 conditional only
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

## Required Reads And Source Mapping

Required reads:

- `AGENTS.md`
- `docs/specs/M7-UI-40-eval-center-page.md`
- `docs/evidence/M7/M7-UI-40-eval-center-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/evals/EvalPage.tsx`
- `apps/admin/src/pages/evals/EvalViews.tsx`
- `apps/admin/src/pages/evals/evalFallback.ts`
- `apps/admin/tests/m7-ui-eval-center.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/evals/EvalPage.tsx`
- `/Users/atilla/源码/unpacked 6/pages/evals/evalConstants.ts`
- `/Users/atilla/源码/unpacked 6/hooks/useEvals.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/evals.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 eval boundaries: admin §4.7, architecture eval-gate/prompt/knowledge/model-routing boundaries and acceptance gate rules.

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM/text sample for eval/source shell terms. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked eval page | Primary structured source for title, Production Gate badge, blocked/running/pass states, first blocked action, 300px eval-set list, detail meta, blind review, failed-case diff, manual override confirmation and publish confirmation. |
| Unpacked `useEvals.ts` | Interaction source for gate calculation, run state, blind review state, case override, first blocked jump and publish state. |
| Unpacked `fixtures/evals.ts` | Field-shape reference only. React must continue using centralized sanitized synthetic fallback data with visible degraded/mock/read-only labels. |
| v1.1 docs | Product/runtime boundary: tenant eval center exists as scope, but production gate in this slice is UI evidence only and does not imply real runner/runtime or production publish. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for eval-related owner HTML region.
- Unpacked source mapping summary for eval page/constants/hook/fixtures.
- React blocked desktop screenshot.
- React running screenshot.
- React local publish preview modal screenshot in pass URL state.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `tenant`
  - active page `tenant.eval`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - page/list/detail widths and body/document scroll widths
  - runtime labels `mock/degraded/read-only/not production eval data/no production publish/manual review local only`
  - gate state booleans for blocked/running/pass
  - source-like text booleans for title, Production Gate, first blocked action, publish disabled/enabled, 300px list, detail meta, blind review toggle, Expected/Actual diff, manual override confirm and local publish confirm
  - tenant sidebar categories only: `运营/数据/智能/管理/洞察`; group categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived eval anatomy, separated tenant layer, restrained runtime caveat, reason-required local manual review, reason-required local publish preview, tenant-only sidebar parity and mobile readable/no-overflow fallback.

Rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, raw prototype fixture imports, production-looking unlabeled eval data, backend/API/runner/runtime invention, production publish and any owner-acceptance/runtime/release claim.

If Design Skill Layer suggests a visual correction that conflicts with AGENTS, v1.1 docs, data boundary, permissions, release gates or owner source boundaries, record the rejection in evidence instead of implementing it.

## Pass Conditions

- `tenant.eval` renders inside tenant shell after selecting tenant `tenant-b` on the latest #209 stack.
- Focused browser evidence proves owner/source/React comparison, desktop blocked/running/pass publish modal geometry, collapsed nav, tenant-only sidebar categories and 320px no-overflow fallback.
- Existing eval interaction coverage remains intact.
- Synthetic/degraded/mock/read-only label remains visible and states `not production eval data`, `no production publish` and `manual review local only`.
- Production Gate is explicitly UI evidence only; no production publish, real eval runner, eval DB/API/runtime or production eval data is implied.
- Any React visual corrections are small and limited to `apps/admin/src/pages/evals/**`.
- No disallowed files are changed.

## Validation Plan

- `git diff --check origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-67-knowledge-resources-source-parity-refresh --spec docs/specs/M7-UI-68-eval-center-source-parity-refresh.md --include-worktree`
- touched Prettier check
- ESLint on touched eval test/source if source changed
- `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false`
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright for `apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts` and existing `apps/admin/tests/m7-ui-eval-center.spec.ts`.

## Failure Branches

- If source geometry cannot be kept without shared shell/topbar/sidebar edits, stop and report the shell dependency instead of editing shared shell.
- If eval/runtime boundary labels cannot stay honest without visually overwhelming the page, keep the labels and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## Not Doing

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No raw prototype fixture import.
- No eval DB/API/runner/runtime.
- No LLM/provider call.
- No production eval data.
- No production publish.
- No real customer, order, Telegram, address, phone or production data.
- No owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

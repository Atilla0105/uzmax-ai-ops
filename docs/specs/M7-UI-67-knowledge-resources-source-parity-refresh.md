# M7-UI-67 Knowledge Resources Source Parity Refresh

## 目标

Refresh the existing visible UI-first `tenant.knowledge` / 知识与资源 page on top of `origin/codex/m7-ui-31-orders-visible-ui` (current clean visible UI trunk after #253) so the knowledge/resources page remains browser-comparable against the owner HTML, frozen unpacked knowledge source and current clean tenant shell.

This is a source parity refresh, not a rewrite. Scope is evidence/test/docs only. This slice does not implement KB DB/API/storage/eval runtime, does not write formal knowledge, does not publish knowledge automatically, and does not claim owner visual acceptance, runtime closure, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html`, frozen unpacked source `/Users/atilla/源码/unpacked 6`, and `docs/admin-design-system.md` remain the visible UI source set. Knowledge/resource data must stay centralized synthetic `mock/degraded/read-only` fallback and visibly `not production knowledge data`.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm the current M7 lane remains visible-UI-first while KB DB/API/storage/eval runtime are downgraded.
- Confirm this branch is stacked on `origin/codex/m7-ui-31-orders-visible-ui` / current clean visible UI trunk after #253.
- Decide later whether knowledge/resource runtime or formal publish work proceeds through a separate approved spec.
- Keep final production/staging, real customer/order data, LLM key, cost/compliance, GA-0, production and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-67-knowledge-resources-source-parity-refresh-cleanstack` on branch `codex/m7-ui-67-knowledge-resources-source-parity-refresh-cleanstack`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-32 spec/evidence, current knowledge source/tests, owner unpacked knowledge page/hook/fixtures and owner HTML before edits.
- Record browser evidence comparing owner HTML/source sample, unpacked source mapping and React journey/facts/assets/templates/collapsed/mobile metrics.
- Preserve tenant-only routing, local-only asset edit/delete state, redline toggle evidence, template source table, tenant switch isolation and no formal write/publish boundary.

## 时间盒

0.5 workday. If the page requires `apps/admin/src/**`, backend/API/DB/packages/package/lock/CI/global config/shared AppShell/topbar/sidebar/registry/PageOutlet edits, a broad page rewrite, raw owner fixture import, production data, formal knowledge write, automatic publish, eval runtime or release action, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-67-knowledge-resources-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-67-knowledge-resources-source-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed/added: <= 1 focused Playwright spec
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/registry/PageOutlet: 0
- external API/SDK/provider/connector/adapter basis: none; only browser evidence and local UI fallback state are in scope.

## 文档触发检查

updated

## 前置读取与 source mapping

Required reads:

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
- v1.1 product/admin/architecture/acceptance knowledge boundaries: PRD REQ-T05/REQ-T06/NG-05, admin §4.5, architecture knowledge/template/eval-gate rules and acceptance H-01/H-02/H-04/H-06/H-07/I-01.

| Source | Required use |
|---|---|
| Owner HTML | Browser screenshot or DOM/text sample for knowledge/source shell terms. The HTML is a bundled executable oracle, not source to copy. |
| Unpacked knowledge page | Primary structured source for title, six tabs, toolbar search/chips/actions, journey pipeline/stage detail/warning, facts table/detail/redline toggle, public/private snippets, assets table/detail/edit/delete and template source table. |
| Unpacked `useKnowledge.ts` | Interaction source for tab/search/category, stage selection, fact redline, snippet/asset state, asset edit/delete and template source state. |
| Unpacked `fixtures/knowledge.ts` | Field-shape reference only. React must continue using centralized sanitized synthetic fallback data with visible degraded/mock/read-only labels. |
| v1.1 docs | Product/runtime boundary: tenant knowledge/resources management exists as scope, but no automatic formal knowledge write or publish may be implied without confirmation/eval-gated runtime. |

## Required Evidence

- Owner/source screenshot and DOM/text sample for knowledge-related owner HTML region.
- Unpacked source mapping summary for knowledge page/hook/fixtures.
- React journey desktop screenshot.
- React facts/detail screenshot.
- React assets detail screenshot.
- React templates screenshot.
- React collapsed-sidebar screenshot.
- React mobile `320px` screenshot.
- Metrics JSON with at least:
  - shell level `tenant`
  - active page `tenant.knowledge`
  - nav width `232` expanded / `68` collapsed
  - topbar height about `53`
  - page/tab/search/table/detail/side/detail widths
  - body/document scrollWidth <= viewport desktop/mobile
  - runtime labels `mock/degraded/read-only/not production knowledge data/no formal knowledge write/no automatic publish`
  - tenant sidebar categories only: `运营/数据/智能/管理/洞察`; group categories absent.

## Impeccable / Design Decision Record

Adopted by default: dense product UI, source-derived knowledge tabs/anatomy, separated tenant layer, restrained runtime caveat, local-only asset state, no formal knowledge write/publish boundary, tenant-only sidebar parity and mobile readable/no-overflow fallback.

Rejected: free redesign, old shell visual language, old `--uzmax-*` as visual target, raw prototype fixture imports, production-looking unlabeled knowledge data, backend/API/storage/eval invention, automatic formal write, automatic publish and any owner-acceptance/runtime/release claim.

If Design Skill Layer suggests a visual correction that conflicts with AGENTS, v1.1 docs, data boundary, permissions, release gates or owner source boundaries, record the rejection in evidence instead of implementing it.

## Pass Conditions

- `tenant.knowledge` renders inside tenant shell after selecting tenant `tenant-b` on the current clean visible UI trunk after #253.
- Focused browser evidence proves owner/source/React comparison, desktop journey/facts/assets/templates geometry, collapsed nav, tenant-only sidebar categories and 320px no-overflow fallback.
- Existing knowledge interaction coverage remains intact.
- Synthetic/degraded/mock/read-only label remains visible and states `not production knowledge data`, `no formal knowledge write` and `no automatic publish`.
- No React source corrections are included.
- No disallowed files are changed.

## Validation Plan

- `git diff --name-only origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `git diff --check origin/codex/m7-ui-31-orders-visible-ui...HEAD`
- `npm run format:check`
- `npm run jscpd`
- `npm run knip`
- `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-67-knowledge-resources-source-parity-refresh.md --include-worktree`
- `npx playwright test apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts apps/admin/tests/m7-ui-knowledge-resources.spec.ts`
- `npm run typecheck`
- `npm run lint`

## Failure Branches

- If source geometry cannot be kept without `apps/admin/src/**` or shared shell/topbar/sidebar edits, stop and report the dependency instead of editing source.
- If knowledge/runtime boundary labels cannot stay honest without visually overwhelming the page, keep the labels and record the remaining visual delta.
- If Playwright cannot open owner HTML directly, record the owner HTML as bundled executable source and use the unpacked source files plus React browser evidence as the stable mapping; do not copy compressed bundle content.

## 不做什么

- No backend/API/DB/schema/migration/generated/package/lock/global config/CI/shared AppShell/topbar/sidebar/registry/PageOutlet changes.
- No `apps/admin/src/**` changes.
- No raw prototype fixture import.
- No KB DB/storage/eval runtime.
- No formal knowledge write.
- No automatic publish.
- No real customer, order, Telegram, address, phone or production knowledge data.
- No owner visual acceptance, M7 closeout, GA-0, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

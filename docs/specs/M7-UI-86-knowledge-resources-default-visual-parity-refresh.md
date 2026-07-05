# M7-UI-86 Knowledge Resources Default Visual Parity Refresh

## 目标

Refresh the default `tenant.knowledge` / 知识与资源 fallback so the visible body looks operational and owner/source-like by default, instead of showing engineering/runtime caveat labels in the main page copy.

This is default visual parity only. It does not implement knowledge DB/API/runtime, storage, eval runner, formal KB write, automatic publish, owner visual acceptance, GA/1.0, production deployment, customer-data approval, customer LLM, Telegram Business automatic reply or release approval.

Default visible UI must not contain `mock`, `degraded`, `read-only`, `runtime unavailable`, `not production`, `synthetic`, `local-only`, `browser-local only`, `no production`, `MOCK-`, `disabled`, `fixture` or `controlled://mock`. Runtime and write boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`/ARIA attributes and focused Playwright metrics.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not knowledge runtime/storage/write closure.
- Keep final owner visual acceptance, production/staging, real customer data, LLM key, cost, compliance, release and GA/1.0 decisions owner-only.
- Decide future KB DB/API/storage/eval/formal publish work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-86-knowledge-resources-default-visual-parity-refresh` on branch `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, Impeccable context/product register, current knowledge source/tests, owner HTML and unpacked knowledge page/hook/fixtures before edits.
- Modify only the allowed knowledge page/test/doc paths.
- Preserve tenant-only navigation, six tabs, search/chips, journey stage detail, facts detail/redline toggle, public/private snippets, asset detail edit/delete, template source table, URL states, tenant switch reset and mobile no-overflow behavior.

## 时间盒

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, storage runtime, eval runner, formal KB write or automatic publish changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/knowledge/KnowledgePage.tsx`
  - `apps/admin/src/pages/knowledge/KnowledgeViews.tsx`
  - `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-86-knowledge-resources-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-86-knowledge-resources-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3
- source net LOC: <= 260
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/PageOutlet/registry: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

## 前置读取与 source mapping

Required reads before edits:

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

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Browser/source oracle for the `知识与资源` surface and shell context. |
| Unpacked knowledge page | Source anatomy: title, six tabs, toolbar search/chips/actions, journey pipeline/stage detail/warning, facts table/detail/redline toggle, public/private snippets, assets table/detail/edit/delete and template source table. |
| Unpacked `useKnowledge.ts` | State-machine reference for tab/search/category/stage/fact/snippet/asset/template behavior only. |
| Unpacked `fixtures/knowledge.ts` | Wording and field-shape reference for knowledge/resources, journeys, facts, snippets, assets, templates, redline/eval gate and confirmation queue vocabulary; do not treat as production data. |
| Existing React knowledge page | Preserve page-local fallback and focused test ids; move engineering/runtime caveats out of default visible body into hidden/data/title/ARIA evidence. |

`rg` conclusions:

- `rg -n "mock|degraded|read-only|runtime unavailable|not production|synthetic|local-only|browser-local only|no production|MOCK-|disabled|fixture|controlled://mock" apps/admin/src/pages/knowledge apps/admin/tests/m7-ui-knowledge-resources*.spec.ts` found visible leaks in runtime note, counts, state panels, journey copy, facts/snippets/assets/templates, toolbar and focused tests.
- `rg --files apps/admin/src/pages/knowledge apps/admin/tests | rg 'knowledge-resources|Knowledge'` found the existing page-local knowledge implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "知识与资源|教程旅程|事实条目|公共话术|私人话术|素材库|模板来源|红线|评测|确认队列" /Users/atilla/源码/unpacked\ 6/pages/knowledge /Users/atilla/源码/unpacked\ 6/hooks/useKnowledge.ts /Users/atilla/源码/unpacked\ 6/fixtures/knowledge.ts` confirmed the owner/source-like labels and anatomy to preserve.

## Worktree / branch 前置条件

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-86-knowledge-resources-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` |
| entry HEAD | `441f207` |
| base | `codex/m7-ui-85-customer-assets-default-visual-parity-refresh` / PR #227 HEAD at entry |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.knowledge` visible journey, facts, snippets, assets, templates and URL states use business Chinese labels only.
- Hidden/data/title/ARIA evidence retains `mock/degraded/read-only`, `knowledge runtime unavailable`, `no production knowledge data`, `no formal knowledge write`, `no automatic publish` and `no DB/API closure`.
- Internal ids/testids/source refs may remain for tests and evidence, but default visible labels/placeholder/counts/actions must be clean.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; local/edit/delete/upload/new-entry controls expose boundary metadata.
- Asset source refs and template source refs stay in `data-source-ref`/title, not visible cell copy.

## Design Skill Layer

Adopted Impeccable/product-register guidance: restrained product UI, dense operational copy, owner/source-like knowledge workflow vocabulary, familiar disabled/local controls, hidden-but-present runtime boundaries and mobile fallback. No design suggestions were rejected except where governance requires hidden runtime caveats instead of visible engineering labels.

## 通过条件

- Default `tenant.knowledge` visible body contains no forbidden engineering terms.
- Hidden DOM/data/title/ARIA evidence still contains runtime/write boundary labels.
- Existing knowledge interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default journey/facts/snippets/assets/templates/states/mobile body plus hidden boundary evidence.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint if practical, admin build and focused Playwright pass or failures are recorded honestly.

## 不做什么

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No knowledge DB/API/runtime, storage, eval runner, formal KB write, automatic publish, production/staging action, owner visual acceptance, runtime closure, GA/1.0, real customer/order data, customer LLM, Telegram Business automatic reply or release approval claim.
- No broad redesign, raw production fixture import, real file upload/storage, eval-gated publish implementation or release acceptance change.

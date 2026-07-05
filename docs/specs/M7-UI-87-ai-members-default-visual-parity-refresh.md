# M7-UI-87 AI Members Default Visual Parity Refresh

## 目标

Refresh the default `tenant.aiMembers` / `AI 成员` fallback on top of `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` / PR #228 HEAD so the visible body looks operational and source-like by default instead of showing engineering/runtime caveat labels.

This is default visual parity only. It does not implement AI member DB/API/runtime, audit write, member metrics, production persona publish, owner visual acceptance, GA/1.0, production deployment, customer-data approval, customer LLM, Telegram Business automatic reply or release approval.

Default visible `tenant.aiMembers` header, filters, cards, human table, alert, toast, confirm, persona drawer, URL states and mobile body must not contain `mock`, `degraded`, `read-only`, `runtime unavailable`, `not production`, `synthetic`, `local-only`, `browser-local only`, `no production`, `MOCK-`, `disabled`, `fixture`, `controlled://mock` or `local action only`. Runtime/persona/write boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title` metadata and focused Playwright metrics.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not AI member runtime or release closure.
- Keep final owner visual acceptance, production/staging, real customer data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future AI member DB/API/runtime/audit/member-metrics/persona-publish work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-87-ai-members-default-visual-parity-refresh` on branch `codex/m7-ui-87-ai-members-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register, current AI members source/tests, owner HTML and unpacked agents page/hook/fixtures before edits.
- Modify only the allowed AI members page/test/doc paths.
- Preserve tenant-only navigation, filters, AI cards, capability toggles, urgent stop/recovery, persona drawer/eval/publish preview, human table, URL states, tenant switch reset and mobile no-overflow behavior.

## 时间盒

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, real AI member runtime, audit write, member metrics or production persona publish changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/agents/AgentsPage.tsx`
  - `apps/admin/src/pages/agents/AgentViews.tsx`
  - `apps/admin/src/pages/agents/agentsFallback.ts`
  - `apps/admin/tests/m7-ui-ai-members.spec.ts`
  - `apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-ai-members-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-87-ai-members-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-87-ai-members-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 3
- source net LOC: <= 180
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
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-41-ai-members-page.md`
- `docs/specs/M7-UI-69-ai-members-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-69-ai-members-source-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/agents/AgentsPage.tsx`
- `apps/admin/src/pages/agents/AgentViews.tsx`
- `apps/admin/src/pages/agents/agentsFallback.ts`
- `apps/admin/tests/m7-ui-ai-members.spec.ts`
- `apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/agents.ts`

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Browser/source oracle for the `AI 成员` surface and shell context. |
| Unpacked agents page | Source anatomy: title, member filters, breaker/estop alert, AI cards, capability chips, status actions, human table, persona editor, eval gate and publish controls. |
| Unpacked `useAgents.ts` | State-machine reference for filter, status, capability, persona draft/eval/publish/rollback behavior only. |
| Unpacked `fixtures/agents.ts` | Wording and field-shape reference for agents, capabilities, statuses, human members and persona versions; do not treat as production data. |
| Existing React agents page | Preserve page-local fallback and focused test ids; move engineering/runtime caveats out of default visible body into hidden/data/title evidence. |

`rg` conclusions:

- `rg -n "mock|degraded|read-only|runtime unavailable|not production|synthetic|local-only|browser-local only|no production|MOCK-|disabled|fixture|controlled://mock|local action only" apps/admin/src/pages/agents apps/admin/tests/m7-ui-ai-members*.spec.ts` found visible leaks in runtime note, alert, toast, confirm copy, URL state panels, persona fallback text and focused tests.
- `rg --files apps/admin/src/pages/agents apps/admin/tests | rg 'agents|Agent'` found the existing page-local AI members implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "AI 成员|人类成员|能力开关|熔断|急停|人设|评测|发布" /Users/atilla/源码/unpacked\ 6/pages/agents/AgentsPage.tsx /Users/atilla/源码/unpacked\ 6/hooks/useAgents.ts /Users/atilla/源码/unpacked\ 6/fixtures/agents.ts` confirmed the owner/source-like labels and anatomy to preserve.

## Worktree / branch 前置条件

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-87-ai-members-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-87-ai-members-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-87-ai-members-default-visual-parity-refresh` |
| entry HEAD | `b5bf192` |
| base | `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` / PR #228 HEAD |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.aiMembers` visible header, alert, cards, human table, toasts, confirm modal, persona drawer and URL states use business Chinese operations copy.
- Hidden/data/title evidence retains `mock/degraded/read-only`, `AI member runtime unavailable`, `not production member metrics`, `no production persona publish`, `local action only` and `no DB/API closure`.
- Internal ids/testids may remain for tests/evidence, but user-facing visible labels and accessible names are clean.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; local capability/status/persona controls expose boundary metadata.
- Persona text uses source-like operational wording, not placeholder runtime caveats.

## Design Skill Layer

Adopted Impeccable/product-register guidance: restrained product UI, dense operational copy, owner/source-like AI member workflow vocabulary, hidden-but-present runtime boundaries, familiar status/action controls and mobile no-overflow fallback. No design suggestions were rejected except where governance requires hidden runtime caveats instead of visible engineering labels.

## 通过条件

- Default `tenant.aiMembers` visible body contains no forbidden engineering terms.
- Hidden DOM/data/title evidence still contains runtime/write/persona boundary labels.
- Existing AI members interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, status/persona interactions, URL states, mobile body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint if practical, admin build and focused Playwright pass or failures are recorded honestly.

## 不做什么

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No M5 AI member console file edits.
- No AI member DB/API/runtime, audit write, production member metrics, production persona publish, production/staging action, owner visual acceptance, runtime closure, GA/1.0, real customer/order data, customer LLM, Telegram Business automatic reply or release approval claim.
- No broad redesign, raw production fixture import, real eval runner or release acceptance change.

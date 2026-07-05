# M7-UI-83 Confirmation Queue Default Visual Parity Refresh

## 目标

Refresh the `tenant.queue` default degraded fallback so the visible confirmation-queue body keeps owner/source-like operations copy and no longer exposes engineering caveats in the main visual surface.

This slice preserves the existing confirmation queue API/runtime path from M7-UI-10/M7-UI-63. When the list API is empty, unavailable, errors or permission-blocked, the page may still render sanitized fallback items, but visible body text must not contain `mock/degraded`, `mock`, `read-only`, `runtime unavailable`, `not production`, `synthetic`, `local-only`, `no runtime contract`, `no production truth`, `no write` or `API unavailable/empty/error`. Those boundaries must remain available through hidden DOM, `data-runtime-boundary`, `title`/ARIA attributes and Playwright metrics.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not runtime/DB/API closure.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, release and GA/1.0 decisions owner-only.
- Confirm future runtime contracts for distill health recovery or conflict keep-current semantics in separate specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-83-confirmation-queue-default-visual-parity-refresh` on branch `codex/m7-ui-83-confirmation-queue-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, M7-UI-10, M7-UI-63, M7-UI-63 evidence, current queue files/tests and owner queue source before edits.
- Modify only the allowed queue page/test/doc paths.
- Preserve API fixture decision tests, conflict keyboard bypass blocking, mobile 320, collapsed sidebar and tenant topbar/sidebar classification.

## 时间盒

0.5 workday. If API client, backend/API, DB, packages, lockfile, shared shell/topbar/sidebar/router, global config or CI changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/queue/QueuePage.tsx`
  - `apps/admin/src/pages/queue/QueueCard.tsx`
  - `apps/admin/src/pages/queue/QueueSupport.tsx`
  - `apps/admin/src/pages/queue/QueueOverlays.tsx`
  - `apps/admin/src/pages/queue/queueFallback.ts`
  - `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`
  - `apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts`
  - `apps/admin/tests/m7-ui-confirmation-queue-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-83-confirmation-queue-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-83-confirmation-queue-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 5
- source net LOC: <= 600
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router: 0
- external API/SDK/provider/connector/adapter basis: none; use existing admin client and local browser evidence only.
- exceptions: none.

## 前置读取与 source mapping

Required reads completed before edits:

- `AGENTS.md`
- `docs/specs/M7-UI-10-confirmation-queue-page.md`
- `docs/specs/M7-UI-63-confirmation-queue-visible-parity.md`
- `docs/evidence/M7/M7-UI-63-confirmation-queue-visible-parity.md`
- `apps/admin/src/pages/queue/QueuePage.tsx`
- `apps/admin/src/pages/queue/QueueCard.tsx`
- `apps/admin/src/pages/queue/QueueSupport.tsx`
- `apps/admin/src/pages/queue/QueueOverlays.tsx`
- `apps/admin/src/pages/queue/queueFallback.ts`
- `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`
- `apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useConfirmationQueue.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/queue.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- Impeccable project context and product register.

Source mapping:

| Source | Required use |
|---|---|
| Owner queue page source | Header metric strip, keyboard hint, amber downshift banner, 680px centered card stream, conflict diff and focused action footer. |
| Owner hook/fixtures | State-machine shape and stat labels only. Do not copy raw customer/order/contact/payment/provider/LLM payload values. |
| Owner HTML | Browser/source oracle for queue labels and layout vocabulary. |
| Existing M7 queue page | Keep existing `createConfirmationQueueApiClient` runtime path, API fixture decision behavior and conflict keyboard bypass tests. |

`rg` conclusions:

- `rg -n "mock/degraded|mock|read-only|runtime unavailable|not production|synthetic|local-only|no runtime contract|no production truth|no write|API unavailable" apps/admin/src/pages/queue apps/admin/tests -S` found visible leaks in queue stats, mode badge, degraded banner, fallback item fields/title/score, button labels, edit panel meta, loading copy and tests.
- `rg --files apps/admin/src/pages/queue apps/admin/tests | rg 'queue|m7-ui-confirmation'` found the existing M7 queue files/tests; this slice can extend them in place and add one focused default visual test.
- `rg -n "确认队列|今日候选|7日通过率|蒸馏频率|冲突待处理|最近降频|采纳候选值|保留当前值" /Users/atilla/Downloads/运营塔台1.0.html /Users/atilla/源码/unpacked\ 6 -S` confirmed the owner/source-like labels to preserve.

## Worktree / branch 前置条件

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-83-confirmation-queue-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-83-confirmation-queue-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-83-confirmation-queue-default-visual-parity-refresh` |
| base | `origin/codex/m7-ui-82-group-overview-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Runtime list success keeps runtime items and decision calls on the existing API client path.
- Empty/error/permission/unavailable list states render visible queue structure with business Chinese labels only.
- Hidden/data evidence must retain `mock/degraded`, `mock`, `read-only`, `runtime unavailable`, `no runtime contract`, `no production truth`, `no write` and no DB/API/runtime closure language.
- Disabled fallback actions show business labels such as `通过`, `编辑`, `丢弃`, `拦截`, `采纳候选值`, `保留当前值`; disabled reason may live in `title`, ARIA or `data-runtime-boundary`.
- Conflict candidates still require explicit side-by-side decision controls; keyboard A/D cannot bypass them.

## Design Skill Layer

Adopted Impeccable/product-register guidance: dense operational layout, owner/source-like wording, task-first status hierarchy, familiar disabled controls, hidden-but-present runtime boundaries and mobile fallback. No design suggestions were rejected except where governance requires hidden runtime caveats instead of visible engineering labels.

## 通过条件

- Default `tenant.queue` degraded fallback visible body contains no forbidden engineering terms.
- Hidden DOM/data/title/ARIA evidence still contains runtime boundary labels.
- Existing API fixture decision tests and conflict keyboard bypass still pass.
- Focused Playwright covers existing runtime spec, visible parity spec and new default visual parity spec.
- `git diff --check`, `pr-shape`, touched Prettier, touched ESLint and admin build pass or failures are recorded honestly.

## 不做什么

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router, PageOutlet, registry or global config changes.
- No production/staging action, owner visual acceptance, runtime closure, GA/1.0, real customer/order data, customer LLM or release approval claim.
- No fake writes, no automatic knowledge/profile/eval/config/template write, no raw prototype fixture copy.

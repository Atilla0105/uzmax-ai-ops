# M7-UI-63 Confirmation Queue Visible Parity

## 目标

Refresh the merged `tenant.queue` confirmation queue page so the visible owner-HTML structure remains present when the list API is unavailable, errors, permission-blocked or empty during the M7 visible-UI-first lane.

This slice must preserve the existing runtime API path when Playwright or local route fixtures provide confirmation queue items. The fallback path is a clearly labeled `mock/degraded`, `read-only`, `runtime unavailable` visual shell only; it must not pretend synthetic data is production runtime truth or fake write success.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm the M7 mainline is visible-UI-first for owner HTML parity while DB/API foundation remains downgraded.
- Keep final production/staging, real customer/order data, LLM key, cost, compliance, release and owner acceptance decisions owner-only.
- Confirm any future runtime contract for distill health recovery or conflict keep-current semantics in a separate spec.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity` on branch `codex/m7-ui-63-confirmation-queue-visible-parity`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only for code.
- Read AGENTS, M7-UI-10 spec/evidence, current queue page/tests, owner unpacked queue source/hook/fixtures and owner HTML before edits.
- Modify only the allowed queue page/test/doc paths.
- Record browser evidence comparing owner/source/React and validation results.

## 时间盒

0.5 workday. If the page requires API client, backend/API, DB, packages, lockfile, shared shell/topbar/sidebar or CI/global config edits, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-63-confirmation-queue-visible-parity.md`
  - `docs/evidence/M7/M7-UI-63-confirmation-queue-visible-parity.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/pages/queue/**`
  - `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`
  - `apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source changed files: <= 5
- source net LOC: <= 600
- new source files: <= 2
- test files changed/added: <= 2
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar: 0
- external API/SDK/provider/connector/adapter basis: none; use existing admin client and local browser evidence only.
- exceptions: none.

## 前置读取与 source mapping

Required reads completed before edits:

- `AGENTS.md`
- `docs/specs/M7-UI-10-confirmation-queue-page.md`
- `docs/evidence/M7/M7-UI-10-confirmation-queue-page.md`
- `apps/admin/src/pages/queue/QueuePage.tsx`
- `apps/admin/src/pages/queue/QueueCard.tsx`
- `apps/admin/src/pages/queue/QueueSupport.tsx`
- `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useConfirmationQueue.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/queue.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- Impeccable project context and product register.

Source mapping:

| Source | Required use |
|---|---|
| Owner queue page source | Header metric strip, keyboard hint, amber downshift banner, 680px centered card stream, normal KV card, conflict diff, focused footer, edit/block flows. |
| Owner hook/fixtures | State-machine shape only. Do not copy raw sample people, order, payment, contact, address, prompt or business values. |
| Owner HTML | Browser source sample/screenshot oracle for queue terms and layout. |
| Existing M7 queue page | Keep existing `createConfirmationQueueApiClient` runtime path and API fixture decision behavior. |

`rg` conclusions:

- `rg --files apps/admin/src/pages/queue apps/admin/tests | rg 'queue|m7-ui-confirmation'` found only the existing M7 queue page files and focused Playwright spec; this slice can extend those in place.
- `rg -n "confirmation-queue|tenant.queue|m7-confirmation" apps/admin/src apps/admin/tests docs/specs docs/evidence/M7 -S` found the existing API client path, route rendering, registry/ledger evidence and M7-UI-10 tests. No new API client or shared shell edit is needed.
- The owner HTML is a bundled interactive artifact containing the same queue strings and owner fixture state; use it for browser comparison, not as copied source.

## Worktree / branch 前置条件

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-63-confirmation-queue-visible-parity` |
| worker `git status --short --branch` | `## codex/m7-ui-63-confirmation-queue-visible-parity...origin/codex/m7-ui-62b-tenant-entry-visible-proof` |
| worker `git branch --show-current` | `codex/m7-ui-63-confirmation-queue-visible-parity` |
| base | `origin/codex/m7-ui-62b-tenant-entry-visible-proof` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- If the list API returns one or more valid items, render runtime items and keep approve/edit/discard/block calls on the existing API client path.
- If the list API is empty, unavailable, errors or permission-blocked, render sanitized fallback items with visible labels: `mock/degraded`, `read-only`, and `runtime unavailable`.
- Fallback items use controlled refs and synthetic labels only; no raw customer/order/contact/payment/provider/LLM payload values.
- Fallback actions must not call runtime write endpoints. Edit panel and block modal may open as local/read-only demonstrations, but save/confirm must be disabled or explicitly marked unavailable.
- Conflict candidates must show side-by-side diff and explicit conflict buttons. `keep_current` remains unavailable because the existing API contract has no such action.
- The route must remain tenant-layer only after tenant selection and preserve the M7-UI-62B group/tenant shell split.

## Visual Contract

- Top strip should follow owner source shape: title, compact metric strip, keyboard hint in the same band.
- Amber degraded/downshift banner must expose reason and recovery controls; recovery is disabled unless a future runtime contract exists.
- Card flow is centered and around 680px wide on desktop.
- Normal card body shows KV fields and a focused action footer.
- Conflict card shows side-by-side current/candidate diff and explicit conflict buttons.
- Mobile fallback at 320px must be readable with no horizontal overflow; full mobile redesign is out of scope.
- Use existing tokens/primitives/patterns; no old `--uzmax-*`, page-local token invention, old shell visual vocabulary, gradient/glass/decorative motion, nested cards or side-stripe accent pattern.

## Evidence Plan

- Add/update focused Playwright coverage for API fixture runtime behavior, default no-API/degraded visible structure, source-like geometry, tenant shell/nav/topbar, collapsed sidebar and 320px no-overflow.
- Capture owner HTML screenshot or DOM sample for the queue region, React desktop screenshot, collapsed screenshot, mobile 320 screenshot and a metrics JSON under `/tmp/uzmax-m7-ui-63-confirmation-queue-visible-parity`.
- Record metrics: nav width 232/68, topbar 53, queue flow width around 680, body scroll width <= viewport, runtime/degraded labels present, card count, conflict diff present.
- Update M7 evidence README and page ledger without claiming owner acceptance, runtime closure, production, GA/release approval or real customer/order-data use.

## Design Skill Layer

Adopted Impeccable/product-register guidance: dense operational layout, status-first hierarchy, keyboard-first repeated flow, restrained color, familiar controls, visible degraded states and mobile fallback. Rejected only prototype behaviors that conflict with governance: raw fixture data, local write success, runtime `kept` action and manual recovery without an API contract.

## 通过条件

- `tenant.queue` renders runtime API route fixture items and decisions as before.
- No-API/empty/error/permission states render visible mock/degraded/read-only queue structure instead of blank state pages.
- Focused Playwright proves desktop, collapsed and 320px geometry and labels.
- Validation minimum commands pass or failures are recorded honestly.
- No disallowed files are changed.

## 失败分支

- If path/branch mismatch occurs, stop and report `BLOCKED`.
- If runtime/API client/backend/shared shell changes are needed, stop and split to a separate spec.
- If sanitized mock/degraded labels cannot be made unambiguous, stop rather than shipping fixture-looking production UI.
- If browser evidence cannot be generated, record exact tooling blocker and do not claim visual proof.

## 不做什么

- No edits to `apps/admin/src/confirmationQueueApiClient.ts`, backend/API, DB, packages, package/lock, CI/global config, shared AppShell/topbar/sidebar, raw owner files or root/main.
- No production/staging action, owner acceptance, M7 closeout, GA-0, real traffic, customer LLM, Telegram Business automatic reply or 1.0 release claim.
- No fake writes, no automatic knowledge/profile/eval/config/template write, no raw prototype fixture copy.

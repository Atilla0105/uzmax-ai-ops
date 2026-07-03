# M7-UI-10 Confirmation Queue Page

## 目标

Create the page-level migration contract for the tenant 确认队列 page (`tenant.queue`) before implementation.

Phase 1 is spec draft only. It may add this spec, page-migration ledger/index updates and a short M7 evidence stub. It must not implement the React page, route rendering, API hooks, tests, CSS, backend/API/runtime changes, package or lockfile changes, DB changes, CI/global config changes, raw prototype copies, screenshots or fixture imports.

The later implementation phase may not start until the coordinator approves this spec and confirms the worktree/branch/touch-list still do not conflict with other page workers.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this Phase 1 PR is a spec/evidence/index contract only.
- Confirm whether later M7-UI-10 implementation may proceed from this same spec, or whether the implementation worker must first update this spec.
- Decide any missing runtime/API contract expansion for distill-health summary, manual recovery and conflict "keep current" semantics; AI agents must not invent those contracts.
- Keep final scope, production/staging, real customer/order data, customer LLM, cost/compliance and release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-10-confirmation-queue-page` on branch `codex/m7-ui-10-confirmation-queue-page`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, v1.1 source-of-truth docs, admin design system, M7 ledgers/evidence, existing confirmation queue runtime/client patterns, and read-only prototype queue sources before drafting.
- Record entry evidence and `rg` conclusions in this spec/evidence.
- Draft a decision-complete page matrix, runtime integration plan, state coverage, visual rules, evidence plan, PR hygiene and sequence gate.
- Do not implement or test the page in Phase 1.

## 时间盒

0.25 workday for Phase 1 spec draft. If drafting requires source implementation, backend/API changes, package/lock updates, raw fixture copying, DB/schema changes or CI/global config changes, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-10-confirmation-queue-page.md`
  - `docs/evidence/M7/M7-UI-10-confirmation-queue-page.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/incidents/INC-2026-07-03-m7-ui-10-root-patch-target.md`
  - `apps/admin/src/pages/queue/**`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`
- 说明/备注：
  - Phase 1 may touch only the docs paths above.
  - Future implementation may touch the listed `apps/admin` page/test paths only after coordinator approval.
  - If future implementation needs `apps/admin/src/confirmationQueueApiClient.ts`, backend/API routes, distill health API, package/lock, token package or shared pattern changes, stop and split to a separate approved spec.
- 未列出的模块默认不可改。

## 变更预算与路径分类

Phase 1 budget:

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed: 0
- docs changed: <= 5
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0

Future implementation budget after coordinator approval:

- source changed files: <= 5
- source net LOC: <= 600
- new source files: <= 3
- test files changed: <= 2 focused Playwright specs when the page route replaces the prior router scaffold assertion
- docs changed: <= 3 evidence/ledger updates
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- external API/SDK/provider/connector/adapter basis: none; use existing internal admin API client contracts and repo evidence only.
- exceptions: none expected. If missing API semantics force expansion, stop for a separate spec instead of declaring an exception inside this page worker.

`rg` search conclusions before drafting:

- `rg -n "confirmationQueue|ConfirmationQueue|confirm.*queue|queue|candidate|distill|确认队列|候选" apps/admin packages docs/specs docs/evidence/M7 -S`
  - Found current `apps/admin/src/confirmationQueueApiClient.ts`, legacy `M5ConfirmationQueueShell.tsx`, `m5ConfirmationQueueRuntime.ts`, `apps/admin/tests/m5-confirmation-queue.spec.ts`, page registry row `tenant.queue`, M7 design evidence, and M5/M5R contracts.
  - Conclusion: later implementation must reuse the existing admin client/runtime evidence where truthful, but the M5 shell remains legacy evidence and must not be visually copied as the M7 page.
- `rg -n "use[A-Z].*Queue|ApiClient|fetch\\(|TanStack|Query|confirmationQueueApiClient|m5ConfirmationQueueRuntime" apps/admin/src apps/admin/tests packages -S`
  - Found API-client patterns and opt-in M5 runtime wiring; no TanStack Query hook or M7 queue page hook exists.
  - Conclusion: future page may add a page-local hook under `apps/admin/src/pages/queue/**` that wraps `createConfirmationQueueApiClient`; it must not add a parallel API client.
- `rg --files /Users/atilla/源码/unpacked\ 6`
  - Found exact prototype queue sources: `pages/queue/QueuePage.tsx`, `hooks/useConfirmationQueue.ts`, `fixtures/queue.ts`, plus primitives/patterns/shell/navigation.
  - Conclusion: use these files for structure/comparison only; do not copy raw fixtures or inline styles.
- `rg -n "确认队列|候选|冲突|通过率|蒸馏|Queue|queue|candidate|conflict|approve|discard|diff" /Users/atilla/Downloads/运营塔台1.0.html /Users/atilla/源码/unpacked\ 6 -S`
  - Found owner HTML queue strings and unpacked queue implementation including stats bar, amber downshift banner, keyboard model, conflict diff, approve/edit/discard/block controls and local fixture state.
  - Conclusion: compare the rendered M7 page against those regions/elements, but adapt into repo tokens/primitives/patterns/runtime contracts.

## 文档触发检查

updated

## 前置条件

Required reads completed for Phase 1:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-03-page-migration-ledger-and-router.md`
- `docs/specs/M7-UI-04-shared-operational-patterns.md`
- `docs/evidence/M7/README.md`
- relevant M7 entries: M7-00, M7-03, M7-05, M7-UI-00, M7-UI-04
- relevant runtime specs: M5-03, M5-04, M5R-01, M5R-02, M5R-03, M5R-07
- current primitives/patterns and confirmation queue runtime/client source files
- read-only prototype sources listed below
- Impeccable skill and product register; context loader succeeded with bundled Node after default shell `node` was unavailable.

Source mapping:

| Source | Required use |
|---|---|
| `/Users/atilla/源码/unpacked 6/pages/queue/QueuePage.tsx` | Primary structure and interaction source for the queue page: stats bar, amber banner, centered 680px card stream, focused card, conflict diff, action footer, keyboard handling, block confirmation. |
| `/Users/atilla/源码/unpacked 6/hooks/useConfirmationQueue.ts` | Prototype local state machine only. Preserve decision semantics, but replace local fixture mutation with repo runtime/API contract or documented blockers. |
| `/Users/atilla/源码/unpacked 6/fixtures/queue.ts` | Shape reference for candidate kinds/results/stats only. Do not copy fixture names, customer examples, raw text or inline color values. |
| `/Users/atilla/源码/unpacked 6/shell/navigation.ts` | Confirms nav id `queue`, label 确认队列 and tenant navigation placement. |
| `/Users/atilla/源码/unpacked 6/App.tsx` | Confirms prototype route switch renders `QueuePage` for `queue`. |
| `/Users/atilla/源码/unpacked 6/patterns/ConfirmModal.tsx`, `DataTable.tsx`, `DegradedBar.tsx`, `Toast.tsx`, `BatchBar.tsx` | Compare anatomy only; use repo M7-UI-04 shared patterns for implementation. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Owner HTML visual reference. Compare the `确认队列` rendered region/elements: title, stats bar, keyboard hint, low-pass-rate amber banner, reason/recovery controls, card stream, conflict diff, approve/edit/discard/block controls, and confirmation modal copy shape. |

v1.1/doc references:

- PRD: REQ-T06 confirmation queue; REQ-A05 distill guardrails; NG-05 no unattended knowledge writes.
- Architecture: §2.1 admin pure API client and dependency rules; §4 `kb_candidate`/`distill_health_daily`; §6 `distill`; §6.2 distill health guardrails; §7.1 eval candidates enter confirmation queue; §11.1 GA-0 needs confirmation queue available.
- Backend design/frontend architecture: §2 IA; §4.6 confirmation queue; §5 mobile fallback; §7 layering; §8 quality budgets.
- Acceptance matrix: H-02, H-03, H-07, I-02, I-05, J-05, K-03, K-04, plus B-01/B-04 permission/RLS boundaries where runtime is used.
- Admin design system: §1 principles, §2 tokens, §3.2 680px confirmation queue, §7.5 operations components, §8 keyboard/high-risk actions, §10 mobile fallback, §12.8 confirmation queue, §15 developer/testing rules.
- M7 ledger: `tenant.queue`, target route/page id `tenant.queue`, target path `apps/admin/src/pages/queue/QueuePage.tsx`, current status `not_started`.

Worktree / branch entry evidence:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-10-confirmation-queue-page` |
| worker `git status --short --branch` | `## codex/m7-ui-10-confirmation-queue-page...origin/main` |
| worker `git branch --show-current` | `codex/m7-ui-10-confirmation-queue-page` |
| worker HEAD / origin main | `5877029adfb48d084ce53f8d6972b6356da0fb9a` / `5877029adfb48d084ce53f8d6972b6356da0fb9a` |
| root/main status | `/Users/atilla/Applications/UZMAX智能运营`: `## main...origin/main` |
| root/main branch | `main` |
| `git branch --no-merged main` at entry | no output |
| open PR audit | `gh pr list --state open` unavailable because `gh` is not installed in this shell |

Known sequencing note:

- `origin/main` HEAD is `5877029 M7-UI-04 shared operational patterns (#173)`, so the shared pattern code exists on this base.
- `docs/evidence/M7/README.md` still contained stale `implemented_in_worker` / `blocked_until_M7_UI_04_merge` wording at read time; Phase 1 may correct only the M7 index status needed to place this spec in the queue. It does not approve page implementation.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.codex/worktrees/m7-ui-10-confirmation-queue-page` |
| branch | `codex/m7-ui-10-confirmation-queue-page` |
| base | current `origin/main` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, root/main clean check, branch/PR availability check |

## 并发派发证据

This worker is assigned one physical worktree, one branch and one spec. Phase 1 touch list is docs-only and does not overlap source, DB schema, lockfile, package, CI/guard, global generated artifacts or production/release gates.

Future implementation touches `apps/admin/src/pages/**` and one admin Playwright test, so it must not run in parallel with other page workers touching the router/page outlet/registry, shared page CSS conventions, confirmation queue API client, or `apps/admin/tests/**` unless the coordinator records explicit non-overlap.

## 事故与 closeout 记录

Incident during Phase 1: `docs/incidents/INC-2026-07-03-m7-ui-10-root-patch-target.md`.

The first docs patch was accidentally applied to root/main because the patch tool used the root checkout as its working directory. The exact docs changes were transferred to the assigned worktree, and root/main was cleaned back to `## main...origin/main`. No source, secrets, customer/order data, package/lock, DB, backend/API, CI/global config or raw prototype files were affected.

If any further write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

## Page Matrix

### Objects And Fields

| Object | Required fields | Notes |
|---|---|---|
| Queue page shell | page id `tenant.queue`, tenant context, runtime mode label only if useful, evidence/status copy | Must not imply M5/M5R owner acceptance or release closure. |
| Distill health summary | today's candidate count, daily cap, 7-day pass rate, distill frequency, conflict count, latest downshift reason | Use runtime/read contract only. If unavailable, show degraded/read-only state and block recovery actions. |
| Distill health banner | normal/low-pass/downshifted state, reason summary/ref, recovery eligibility, audit destination | Amber banner only when guardrail says low pass rate or downshift. Manual recovery requires confirmation and controlled reason/audit ref. |
| Confirmation item | id, kind, title/summary ref, source ref, status, confidence/score if available, created time, target kind/ref, candidate payload refs, diff payload refs for conflicts | Display minimum judgment fields by default; details expand on demand. No customer/order/contact plaintext or raw payloads. |
| Candidate payload preview | controlled refs and safe summaries only | Values must come from API-validated payloads or controlled refs; do not decode/show raw carrier data. |
| Conflict diff | current/before ref, candidate/after ref, conflict reason/source ref | Conflict candidate must show side-by-side diff before any decision. |
| Decision draft | item id, action, edited payload ref/object, reason ref, audit destination, formalWrite/result status | Approve/edit/discard/block use existing API client contract. |
| Mobile fallback row | item kind, title/summary, status, approve/discard controls, edit desktop handoff | No full mobile editing. |

### Statuses

| Status | Meaning | UI behavior |
|---|---|---|
| `pending` | Needs human review | Focusable and actionable if permissions/runtime allow. |
| `approved` | Human accepted candidate | Dim but remains visible; show audit/result status. |
| `edited` | Human edited then accepted | Dim but remains visible; show edited status and audit/result status. |
| `discarded` | Human rejected this candidate | Dim but remains visible; no formal write implied. |
| `blocked` | Human blocked risky/error source | Human/blocking tone; reason required where runtime supports it. |
| `conflict_candidate` + pending | Requires side-by-side diff | Keyboard A/D must not bypass conflict decision. |
| `permission denied` | User lacks `confirmation:read` or `confirmation:write` | Explain role/prerequisite; backend remains authoritative. |
| `degraded` | Runtime/API/distill health incomplete or low-pass guardrail active | Show amber context and safe next action; disable unbacked actions. |

Existing API mismatch to preserve:

- `createConfirmationQueueApiClient` accepts actions `approve`, `edit`, `discard`, `block` and item statuses `approved`, `blocked`, `discarded`, `edited`, `pending`.
- Prototype fixtures include a `kept` result for "保留当前值"; the existing API client does not expose `keep_current`.
- Future implementation must not invent a runtime `kept` action. "保留当前值" may be rendered disabled/read-only with a blocker note, or mapped to `discard` only if coordinator/API review confirms that is the intended semantic and evidence is recorded.

### Actions

| Action | Desktop | Mobile fallback | Runtime requirement |
|---|---|---|---|
| Move focus | `J/K` and ArrowUp/ArrowDown outside inputs | Optional simple list focus | Local UI state only; no API call. |
| Approve | `A` or explicit button | enabled if write permitted and API available | `submitDecision(itemId, { action: "approve", reasonRef? })`; conflict requires diff present. |
| Edit | `E` or explicit button opens desktop edit panel/side panel | disabled with "edit on desktop" handoff | `edit` requires `editedPayload` or `editedPayloadRef`; no raw content keys. |
| Discard | `D` or explicit button | enabled if write permitted and API available | `submitDecision(itemId, { action: "discard", reasonRef? })`. |
| Block | explicit button; optional `B` only if documented in UI | mobile may omit unless emergency-safe | `submitDecision(itemId, { action: "block", reasonRef })`; reason required by page contract even if API only validates controlled ref. |
| Resolve conflict | explicit side-by-side decision buttons only | approve/discard fallback only if semantics are confirmed | Must not skip diff; no keyboard approve/discard bypass for unresolved conflict. |
| View reason | expands distill-health reason | read-only | Needs health summary/read contract. |
| Restore daily frequency | confirmation modal with reason | not required unless explicitly approved | Blocked until an admin runtime/API contract exists for manual distill recovery; do not fake local recovery. |
| Open source/detail | side panel or expanded details | desktop handoff if too dense | Only controlled refs and safe summaries. |

### Exit Paths

- After approve/edit/discard/block: optimistic local state may update only if the API call is in flight and rollback/error feedback exists; final state must use API result.
- After successful decision: keep item visible in dimmed decided state and move focus to next pending item.
- Conflict item after valid resolution: remain visible with final status and audit/result reference.
- Edit cancel: return focus to the same card, preserve draft only in local state.
- Runtime/read failure: show error state with retry; do not fall back to fixture data as if runtime succeeded.
- Permission denied: show role/prerequisite copy and return path to legacy evidence route or safe page.
- Mobile edit: show desktop handoff; do not expose full edit form.

### Forbidden Behaviors

- No fixture pretending to be runtime data.
- No raw prototype fixture copy, customer/contact/order examples, raw prompt/completion, Telegram payload, phone/address/payment/order ID, secret or inline carrier refs.
- No automatic write to formal knowledge/profile/eval/config/template without confirmed runtime contract and audit.
- No conflict candidate skipping diff.
- No runtime "keep current" invention without API/coordinator approval.
- No LLM numeric judgment for confidence, pass rate, candidate cap, SLA, cost or order state.
- No backend package import from `apps/admin`.
- No page-local design tokens, raw hex/spacing/font/radius values, old `--uzmax-*` visual source, side stripe borders, gradient/glass/decorative motion, nested cards or old side emphasis line.
- No hiding permission UI while backend still allows the call; direct API must reject unauthorized requests.
- No GA-0, production, release approval or real customer traffic claim.

## Runtime Integration Plan

Preferred existing runtime:

- Use `createConfirmationQueueApiClient` from `apps/admin/src/confirmationQueueApiClient.ts` for list/detail/decision calls.
- Future page-local hook may live under `apps/admin/src/pages/queue/**` and wrap the existing client. If TanStack Query is introduced/available in the repo, use it for server state; otherwise use the repo's existing explicit client/state pattern without adding dependencies.
- Preserve the client validation boundaries: relative base path, controlled refs, forbidden raw keys, conflict diff presence, and formal write result parsing.
- Use existing M5R evidence only as runtime support evidence, not as page acceptance or owner signoff.

Known runtime blockers / read-only contracts:

- No M7 page hook exists yet.
- Existing confirmation queue client does not expose distill health summary or manual recovery endpoints.
- Existing prototype `useConfirmationQueue` is local fixture state and must not be imported.
- Existing M5 shell can opt into API runtime, but it is legacy evidence UI and not the target M7 page.
- Manual "restore daily" must render disabled/read-only with an explicit blocker unless a coordinator-approved API contract exists.
- Conflict "keep current" must render disabled/read-only or use a confirmed existing action mapping; do not invent a new API action.
- If list/detail/decision endpoints are absent in the active environment, the page must show degraded/error/permission states. It must not silently switch to fixtures.

Minimum future implementation data contract:

```text
list pending items -> GET /confirmation-queue/items?status=pending
load item detail -> GET /confirmation-queue/items/:itemId
submit decision -> POST /confirmation-queue/items/:itemId/decisions
```

Any extra contract for health summary or recovery must be in a separate spec unless already present and documented before implementation starts.

## State Coverage

| State | Required page behavior | Evidence expectation |
|---|---|---|
| Loading | Stable skeleton/list dimensions for stats and card flow; no spinner-only blank page. | Playwright sees loading state without layout overflow. |
| Empty | Clear "no pending candidates" state, stats still visible if available, no fake sample cards. | Test with API route fixture returning empty items. |
| Error | Error copy includes retry and does not expose raw error payloads/secrets. | Test API 500/failed fetch. |
| Permission denied | Lock/role copy; approve/edit/discard/block disabled; backend 403 remains authoritative. | Test API 403 or permission state. |
| Degraded | Amber bar for low pass/downshift or unavailable health/recovery contract; unbacked actions disabled. | Test degraded banner and disabled recovery/keep-current paths. |
| Mobile fallback | 320px: approve/discard reachable, edit disabled/desktop handoff, no horizontal overflow. | Playwright 320px viewport assertion. |

## Visual Rules

- Implementation layering: `packages/ui-tokens -> primitives -> patterns -> pages`.
- Use repo primitives/patterns from M7-UI-04: `Button`, `IconSlot`, `StatusBadge`, `Kbd`, `SearchInput` if needed, `PageState`, `DegradedBar`, `DataTable` where table-like summaries are needed, `PageToolbar`, `SidePanel`, `ConfirmModal`, `ToastHost`/`useToast`.
- Queue card classes use `uz-confirmation-*` / `uz-page-queue` naming and canonical `--ink-*`, `--state-*`, `--accent-*`, `--paper`, `--card`, `--s-*`, `--radius-*`, motion/z-index tokens.
- The page should preserve prototype density: stats bar, centered flow max-width `680px`, compact cards, focused item, visible keyboard hints, dimmed completed decisions, and no decorative hero/card layout.
- Conflict diff must use two readable side-by-side panels on desktop and stacked panels on mobile; do not use side-stripe borders.
- Mobile minimum width: `320px`; dangerous actions must use full labels.
- Do not use old `--uzmax-*`, old M5 shell CSS visual vocabulary, page-local literals, inline style literals except unavoidable dynamic geometry that resolves to token values, gradient text, glassmorphism, decorative shadows, nested cards, or the old side emphasis line.

## Evidence Plan

Future implementation evidence must include:

- Updated M7 evidence file and M7 README status row.
- Updated `docs/admin-ui-page-migration-ledger.md` row for `tenant.queue`; only mark implementation beyond `not_started` after tests/evidence pass.
- Desktop screenshot at a 1440px-class viewport showing stats bar, low-pass/degraded state, focused normal card, conflict diff and decision states.
- 320px mobile screenshot showing approve/discard fallback, edit handoff and no horizontal overflow.
- Playwright assertions for:
  - route `tenant.queue` renders the migrated page, not scaffold;
  - no fixture fallback when runtime route is empty/error/403;
  - keyboard `J/K/A/E/D` does not fire inside input/textarea/select/contenteditable;
  - conflict candidate cannot be approved/discarded by keyboard without explicit diff decision;
  - approve/edit/discard/block calls the existing API client path under route fixture mode;
  - loading, empty, error, permission, degraded and mobile states;
  - no raw sensitive/sample strings and no horizontal overflow at 320px.
- Impeccable critique/detect or equivalent design audit:
  - Record adopted recommendations for density, focus, states and mobile fallback.
  - Record rejected recommendations with governance/security/performance/business reasons.
  - Run detector against changed page/CSS/test files where available and record no new side-stripe/old-token/raw-literal debt.

## 实施步骤

Phase 1:

1. Create this spec.
2. Add a short M7 evidence stub for the spec draft.
3. Update M7 evidence README and page ledger only enough to make the spec discoverable.
4. Run docs-only validation and record results.
5. Commit and push; open PR if tooling/connector permits, otherwise report PR-open blocker.

Future implementation after coordinator approval:

1. Reconfirm worker path/branch/root clean state and reread this spec plus current ledger/evidence.
2. Re-run `rg` to check for newly added queue page/API/hook patterns.
3. Add `apps/admin/src/pages/queue/QueuePage.tsx` and any page-local hook/CSS under `apps/admin/src/pages/queue/**`, reusing existing client/primitives/patterns.
4. Update `PageOutlet`/registry only enough to render `tenant.queue` through the migrated page and keep legacy evidence reachable.
5. Add focused Playwright coverage.
6. Update evidence/ledger with actual implementation state and screenshots.
7. Run validation and record exact failures if local tooling is unavailable.

## 通过条件

Phase 1:

- `docs/specs/M7-UI-10-confirmation-queue-page.md` exists and contains source mapping, page matrix, runtime integration plan, state coverage, visual rules, evidence plan, PR hygiene and sequence gate.
- M7 evidence/index makes the spec discoverable without claiming page implementation.
- No source/test/package/lock/db/API/CI/global config files are changed.
- `git diff --check` passes.
- `guard:pr-shape` passes for the docs-only Phase 1 diff or exact failure is recorded.
- Branch is committed and pushed, with PR URL if available or an explicit PR-open blocker if not.

Future implementation:

- The page is rendered for `tenant.queue` and no longer shows the generic scaffold for that route.
- It uses existing client/runtime contracts or documented disabled/degraded states for missing contracts.
- It covers all required states and mobile fallback.
- It does not copy raw fixtures or introduce visual debt.
- Focused Playwright, `git diff --check`, `guard:pr-shape`, format/typecheck/lint/build and design audit pass or failures are recorded honestly.
- Spec compliance review happens before code quality review.
- Coordinator approval is recorded before implementation starts.

## 失败分支

- If worktree/branch/root boundary differs, stop and report `BLOCKED`.
- If Phase 1 requires source implementation or tests, stop and ask coordinator to open implementation phase.
- If future implementation needs backend/API expansion for health summary, manual recovery or keep-current conflict semantics, stop and split to a backend/API/runtime spec.
- If runtime API is unavailable, show degraded/error/permission state and do not use fixtures as runtime.
- If validation requires package/lock changes or dependency install, stop and report.
- If touch list overlaps another active worker, stop until coordinator resolves queue order.
- If any raw sensitive/sample data, secret, customer/order/contact value or raw provider/Telegram/LLM payload appears, stop, remove it and create/reference incident evidence if boundary was crossed.

## 不做什么

- No Phase 1 React page, route, hook, CSS, test or API implementation.
- No edits to `apps/api`, `packages/db`, `packages/distill`, `apps/worker`, `apps/cron`, `packages/engine`, `packages/capabilities`, `packages/llm-gateway`, `packages/evals`, package files, lockfiles, CI/guard/global config or raw prototype files.
- No raw fixture copy or real customer/order/contact/LLM/provider data.
- No automatic formal knowledge/profile/eval/config/template write.
- No full mobile editing; mobile is approve/discard plus handoff.
- No production/staging action, GA-0 approval, owner acceptance, M5/M7 closeout, real traffic, Telegram Business automatic reply or 1.0 release claim.

## 验收映射

| Item | M7-UI-10 contract status | Notes |
|---|---|---|
| H-02 | `page_contract_supports_human_confirmation_not_closed` | Page contract preserves no unconfirmed formal write; runtime closure depends on existing/future API evidence. |
| H-03 | `page_contract_requires_conflict_diff_not_closed` | Conflict candidates require side-by-side diff and no keyboard bypass. |
| H-07 | `page_contract_exposes_distill_health_with_blockers` | Stats/banner/recovery are required, but missing admin health/recovery API remains a blocker/read-only state. |
| I-02 | `page_contract_requires_mobile_approve_discard` | 320px fallback must support approve/discard and desktop edit handoff. |
| I-05 | `page_contract_requires_token_pattern_visual_evidence` | Future implementation must prove no new token/design debt and include screenshots/audit. |
| J-05 | `spec_evidence_added_no_release_claim` | Phase 1 adds spec/evidence only. |
| K-03 | `active` | One spec/one branch; Phase 1 is spec draft only. |
| K-04 | `active` | Worktree/branch/touch list are scoped; implementation gated by coordinator approval. |

## Closeout / Incident 记录

Phase 1 incident: `docs/incidents/INC-2026-07-03-m7-ui-10-root-patch-target.md`. Root/main was restored to clean after containment. `gh` was unavailable in the shell, so open PR state/PR creation must be handled via another approved path or reported as blocked.

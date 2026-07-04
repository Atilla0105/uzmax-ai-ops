# M7-UI-20 Conversation Workbench Page Evidence

## Status

Implementation evidence for `tenant.conversations` / 对话工作台.

This branch replaces the planned scaffold with a real M7 tenant conversation workbench page. It adds a page-local `conversation-ticket` read/handoff client, route rendering, focused Playwright coverage, mobile fallback and honest degraded/read-only boundaries for runtime surfaces that do not yet have approved M7 contracts.

Post-UI-06 rebase/retest update: PR #182 was rebased onto `origin/main` / `2193a51274b73730680b5d88f66a06779fb633b8` (`M7-UI-06 shared shell topbar calibration`). The prior UI-06 blocker is resolved by keeping the merged shared shell/topbar facts: prototype tenant capsule/copy, Chinese global search placeholder, visual `PRODUCTION` marker, `68ms`, notification badge, operator chip and group/tenant layer separation.

This is not owner visual acceptance, runtime closure, M7 closeout, GA-0 opening, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

Reviewer remediation update: the PR remains Draft. UI-06 shell/topbar blocker is resolved, but owner visual acceptance is still pending; current screenshots show the broad workbench structure is closer to the owner prototype, not accepted.

Code quality/design remediation update: PR #182 remains Draft. The runtime no longer posts a page-local placeholder SLA policy ref; takeover is disabled/degraded until a real `slaPolicyRef` is present in the selected conversation detail. Detail loading now clears and guards stale responses so visible header/rail/composer data and handoff target stay aligned with the selected row. Composer draft copy is derived from the active conversation order/display ref, and the right rail uses segmented buttons instead of incomplete tab semantics.

Second code-review remediation update: takeover is now gated by loaded-consistent selected detail, runtime `slaPolicyRef`, actionable conversation status and AI state. Closed, pending handoff and already handoff/human-owned conversations stay disabled/degraded even when a policy ref is present. Handoff POST completion captures the request target and updates detail only if the operator is still viewing the same conversation.

Page-local visual parity update: the PR remains Draft, but desktop first-viewport alignment is closer to the owner HTML. The runtime degraded state is now a compact operational strip instead of a dominant warning slab; provided AI trace data opens in a compact table-like row treatment and remains collapsible; internal/system events render as compact status pills; composer density, disabled action weight and right-rail profile/tags/custom-field/dual-track rhythm are tightened. This update still does not claim owner visual acceptance.

Owner v6 screenshot review update: PR #182 remains Draft and is only an owner visual review candidate. The owner feedback is that the visual direction is broadly aligned, but the current desktop screenshot is not yet a complete one-to-one replication of `/Users/atilla/Downloads/运营塔台1.0.html`; it is not visual acceptance and is not merge-ready.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-page-impl` |
| worker branch | `codex/m7-ui-20-conversation-workbench-page-impl` |
| worker status at entry | `## codex/m7-ui-20-conversation-workbench-page-impl` |
| worker HEAD | `6e66143e4ea5c9323ec8b25470c8892fdece08a3` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status before worktree creation | `## main...origin/main` |
| root/main branch before worktree creation | `main` |
| branch audit | `git branch --no-merged main` showed `codex/m7-ui-11-release-acceptance-page-impl`; owner/coordinator explicitly marked PR #178 Draft/Paused and this worker did not touch it. |
| original open PR audit | Earlier implementation entry verified PR #178 was Draft/Paused and this worker did not touch it; the current rebase/retest worker is PR #182 on `codex/m7-ui-20-conversation-workbench-page-impl`. |

## Post-UI-06 Rebase Evidence

| Fact | Evidence |
|---|---|
| rebase worker path | `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-page-impl` |
| rebase worker branch | `codex/m7-ui-20-conversation-workbench-page-impl` |
| pre-rebase worker status | `## codex/m7-ui-20-conversation-workbench-page-impl...origin/codex/m7-ui-20-conversation-workbench-page-impl` |
| pre-rebase worker HEAD | `e5eed033c030ccd8e723d4d655594ef4f7636805` |
| fetched `origin/main` | `2193a51274b73730680b5d88f66a06779fb633b8` |
| rebase result | `git rebase origin/main` completed after resolving test conflicts in `apps/admin/tests/m7-ui-page-router.spec.ts` and `apps/admin/tests/m7-ui-foundation.spec.ts`. |
| conflict policy | Kept UI-06 shared shell/topbar expectations (`丝路数码`, Chinese search placeholder, `PRODUCTION`, enabled notification/user controls) while preserving UI-20 conversation page assertions and focused tests. |

## Required Reads / Mapping

- Required reads completed before drafting/retest: `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/admin-design-system.md`, M7 README, page migration ledger, UI-05 layered navigation shell spec/evidence, UI-06 shared shell/topbar evidence, UI-10 confirmation queue spec/evidence, UI-11 release acceptance spec/evidence, current registry/shell files, backend `conversation-ticket` contract files, legacy M2 conversation shell as evidence-only, and all owner prototype conversation files listed in the spec.
- Owner prototype files read: `/Users/atilla/源码/unpacked 6/pages/conversations/ConversationsPage.tsx`, `ConversationList.tsx`, `MessageThread.tsx`, `Composer.tsx`, `ContextRail.tsx`.
- Adopted Impeccable/product-register guidance: dense operational workbench, status-first hierarchy, keyboard-first desktop flow, mobile fallback only, no decorative visuals, no nested/free layout, no side-stripe copy.
- Rejected prototype/legacy behavior: raw inline styling, raw fixtures as runtime truth, local demo state, old M2 shell visuals, old `--uzmax-*` visual target and group+tenant mixed nav.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/conversations/ConversationsPage.tsx` | M7 three-column tenant conversation workbench page: 316px list, thread/header/message body, AI trace expansion, bottom composer, 340px context rail, SLA/handoff/takeover states and mobile fallback. |
| `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts` | Page-local client/hook for existing `conversation-ticket` list/detail/handoff endpoints; no fixture imports and no backend/API expansion. Takeover requires a runtime `slaPolicyRef`; stale/mismatched detail responses are ignored/degraded. |
| `apps/admin/src/pages/conversations/conversationWorkbenchHandoff.ts` | Page-local handoff eligibility/degraded-copy helper for status/AI-state/policy checks and request target derivation; no shared runtime or backend contract expansion. |
| `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` | Scoped page CSS using existing design-system token variables; no new tokens, old `--uzmax-*` target or M2 shell CSS. Composer draft text uses the selected conversation ref or generic copy, not a fixed fixture order id. |
| `apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx` | Page-local rail/state support split out after Prettier expansion to keep component file size and complexity within lint without moving shared primitives/patterns. Right rail view switches are segmented buttons with `aria-pressed`, not incomplete tabs. |
| `apps/admin/src/pages/PageOutlet.tsx`, `apps/admin/src/pages/registry.ts` | Routes `tenant.conversations` to the real page and marks implementation evidence pending PR review. |
| `apps/admin/tests/m7-ui-conversation-workbench.spec.ts` | Focused Playwright coverage for route/layer/nav, degraded runtime bar, disabled search/sort affordances, row selection, AI trace, handoff/degraded, no placeholder SLA policy post, closed/pending-handoff/already-handoff takeover blocking, stale handoff response detail guard, detail-failure target safety, dynamic composer ref, loading/empty/error/permission/customer-context-unavailable and 320px mobile fallback. |
| `apps/admin/tests/m7-ui-page-router.spec.ts` | Updates tenant selection assertion so `tenant.conversations` renders the real page, not the scaffold. |

## Runtime / Contract Notes

- Current repo has backend `apps/api/src/conversation-ticket.*` contracts for conversation list/detail, handoff ticket creation and ticket actions.
- This implementation adds only a page-local M7 admin client/hook under `apps/admin/src/pages/conversations/**`.
- The runtime reads approved `conversation-ticket` list/detail/handoff semantics. Business draft confirmation, human external send, customer-context aggregation, customer/order/quote rail actions, AI trace source expansion and WebSocket realtime remain read-only/degraded.
- Runtime list search/sort query params are not implemented in the current `conversation-ticket` contract. The page now renders disabled search and sort affordances with visible degraded copy, `title`/ARIA text and Playwright assertions instead of pretending the filters are runtime-backed.
- A first-class shared `DegradedBar` is visible in the thread with `degraded` status copy and page `data-runtime-state="degraded"` while the runtime remains read-only for unbacked surfaces. Disabled composer/rail actions remain disabled.
- Handoff/takeover does not send a page-local SLA placeholder. It is disabled and visibly degraded until the selected conversation detail returns a real `slaPolicyRef`; tests assert the old `controlled://m7-ui-20/sla/default` placeholder is never posted.
- Handoff/takeover is status/actionability-safe: `closed`, `pending_handoff` and already `handoff` conversations stay disabled/degraded, `open` conversations with suspended AI stay disabled unless a future approved runtime exposes that transition, and only actionable `open` conversations with a real policy ref may post.
- Detail fetches are guarded against stale/mismatched selection results. If detail is missing or fails, the page may display the selected list row as read-only context, but handoff remains disabled so the visible conversation cannot diverge from the action target.
- Handoff POST completion is also selection-guarded. The request captures the target id/ref; list rows may update from the target response, but detail/header/rail/messages are updated only when the active selection still matches the request target.
- Fixture pretending as runtime is prohibited and not used.
- UI-05 layered navigation is merged to `main` and is a mandatory baseline: `tenant.conversations` belongs only to the tenant layer.
- UI-06 shared shell/topbar calibration is merged to `main` at `2193a51`; M7-UI-20 keeps those shared shell decisions and does not modify shared shell/tokens/primitives/patterns.

## Visual / Runtime Notes

- Visual structure follows owner prototype/unpacked sources for tenant sidebar context, 316px conversation list, compact list search/sort/query state, central thread with 46px-ish header, message body, first-class degraded runtime bar, AI trace affordance, bottom composer/draft area and 340px customer context rail.
- Draft hold remediation tightened the default intercepted desktop data to resemble an operator workbench: 7 dense conversation rows, avatar initials, customer names, short previews, relative time, status/SLA chips, compact AI trace rows and customer rail fields/tags/custom fields/dual-track/notes/actions.
- Raw `controlled://...` refs were removed from the primary default UI. Synthetic Playwright data now uses safe operator-facing labels such as `WB-20413`, `ORD-REF-20413`, `order.lookup(ORD-REF-20413)` and `物流时效-中亚 v4`.
- Composer caveat remains visible as secondary disabled/read-only context; first-class runtime degradation now lives in the amber workbench bar. Composer draft text now follows the selected conversation order/display ref or generic fallback instead of a fixed production component fixture id.
- Visual parity pass v6 further compacts the degraded bar, message rhythm, AI trace table rows, internal status events, composer and customer context rail while keeping all runtime gaps honest/read-only. The focused screenshot route intentionally shows one controlled AI trace by default rather than fabricating additional runtime trace records.
- Owner v6 feedback keeps the next pass desktop-first: compare the implementation against owner HTML and frozen `/Users/atilla/源码/unpacked 6` at detailed pixel-level before any visual acceptance claim.
- Page workers must inspect the page-specific owner source carefully because the HTML/unpacked source already contains the relevant layout and code details; layout gaps should be corrected from that source, not invented locally.
- Sidebar parity is now an explicit acceptance item: owner HTML groups sidebar functions by category, and the collapse-sidebar control is located at the bottom.
- Prototype side stripes, raw fixtures, inline styles and local demo state were rejected/adapted. List risk uses badges/dots/row tint instead of 3px side bars.
- Page-local CSS uses existing `--ink-*`, `--state-*`, spacing, radius, font and z-index token variables.
- Mobile fallback stacks list/thread/rail at 320px and keeps emergency takeover visible; complex editing remains disabled/read-only. Owner feedback allows the current mobile fallback to remain for now; pixel-level mobile redesign/polish is deferred to a later mobile-specific pass.
- Default runtime may show degraded/error if `/conversation-ticket` is unavailable; this is intentional and does not imply backend/runtime closure.

## PR Hygiene / Budget

- Changed source remains inside the allowed page-local scope: `apps/admin/src/pages/conversations/**`, `PageOutlet`, and `registry`.
- `conversationWorkbenchPanels.tsx` is intentionally added as a page-local support file. Reason: Prettier-expanded JSX/CSS pushed `conversationWorkbenchStyles.tsx` over the React file-length limit and concentrated right-rail/state complexity; splitting the rail/state support keeps lintable code without touching shared primitives, patterns, tokens or shell.
- Coordinator-approved test-scope expansion is recorded in the spec: `apps/admin/tests/helpers/openLegacyEvidence.ts` and `apps/admin/tests/m7-ui-foundation.spec.ts` are allowed only for full-suite compatibility after `tenant.conversations` stopped being a scaffold. This is test/helper compatibility only and is not permission to touch shared shell, tokens, primitives, patterns, `AppShell`, global config, backend/API, WebSocket, package/lock, CI/guard or DB/schema.
- Post-UI-06 `pr-shape` without PR metadata fails on source budget: `net source LOC 1260 > 600`.
- Current `pr-shape` with PR-body metadata and `Exception: large_change_exception` passes and reports `source.changedFiles=7`, `source.netLoc=1260`, `source.newFiles=5`.
- The `large_change_exception` is source-size governance only and still requires coordinator/owner review before merge; it is not page acceptance, runtime closure or release approval.
- No package/lock, backend/API, DB/schema, shared token, shared primitive, shared pattern, shell architecture, CI/guard or PR #178 files were touched. `apps/admin/tests/helpers/openLegacyEvidence.ts` has a narrow full-suite compatibility update so legacy evidence specs can open the explicit legacy route after tenant-layer navigation.

## Screenshots

Generated artifacts are kept outside the repo under `/tmp/uzmax-m7-ui-20-conversation-workbench-page/`.

| Artifact | Path |
|---|---|
| Desktop 1440 screenshot after page-local visual parity pass | `/tmp/uzmax-m7-ui-20-conversation-workbench-page/desktop-1440-after-ui06-v6.png` |
| Mobile 320 full-page screenshot after page-local visual parity pass | `/tmp/uzmax-m7-ui-20-conversation-workbench-page/mobile-320-after-ui06-v6.png` |
| Owner HTML/prototype screenshot | `/tmp/uzmax-m7-ui-20-conversation-workbench-page/owner-html-1440-after-ui06-v2.png` |

Owner HTML/prototype screenshot was feasible from `/Users/atilla/Downloads/运营塔台1.0.html`. The owner screenshot shows the richer prototype runtime/demo data; implementation screenshots intentionally show controlled Playwright route data plus degraded runtime copy instead of importing prototype fixtures.

## Owner Visual Feedback / Next Acceptance Criteria

- PR #182 remains Draft / owner visual review candidate only; this evidence update does not approve visual acceptance, merge readiness, runtime closure, M7 closeout, GA-0, production or 1.0 release.
- Desktop acceptance requires a detailed pixel-level adjustment pass against `/Users/atilla/Downloads/运营塔台1.0.html` and frozen `/Users/atilla/源码/unpacked 6`, including the page-specific source files named in this evidence/spec.
- The next pass must derive layout, density, spacing, sidebar behavior, component anatomy, state treatment and microcopy shape from the owner HTML/unpacked source instead of inventing missing structure.
- Sidebar parity must be verified concretely: owner sidebar functions are grouped by category, and the collapse-sidebar control sits at the bottom.
- Mobile can remain as the current fallback for this PR cycle; mobile pixel-level redesign and polish is explicitly deferred to a later mobile-specific pass.
- No PR body or GitHub comment was updated in this worker pass because the coordinator session reported an expired GitHub connector token; this is a docs-only local evidence update.

## Validation

Latest page-local visual parity validation run from `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-page-impl`:

- `git diff --check` - pass.
- `PATH=/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run format:check` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-20-conversation-workbench-page.md --include-worktree --pr-body-file ../../../../../tmp/uzmax-m7-ui-20-conversation-workbench-page/pr-body.md` - pass with PR metadata / `large_change_exception`; report: 15 changed files, categories source 7 / test 4 / docs 4, source net LOC 1260, new source files 5.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run lint` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run typecheck -- --pretty false` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run build:admin` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npx playwright test apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts apps/admin/tests/m7-ui-foundation.spec.ts` - pass, 12 tests.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npx playwright test` - pass, 46 tests.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/pages/conversations/ConversationsPage.tsx apps/admin/src/pages/conversations/conversationWorkbenchHandoff.ts apps/admin/src/pages/conversations/conversationWorkbenchPanels.tsx apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` - pass, `[]`.
- Screenshot capture - pass, desktop/mobile artifacts refreshed as `*-after-ui06-v6.png` under `/tmp/uzmax-m7-ui-20-conversation-workbench-page/`; mobile capture checked `document.body.scrollWidth === 320`; owner baseline remains `/tmp/uzmax-m7-ui-20-conversation-workbench-page/owner-html-1440-after-ui06-v2.png`.

Evidence-only owner-feedback recording validation run from `/Users/atilla/.codex/worktrees/m7-ui-20-conversation-workbench-page-impl`:

- `git diff --check` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers` - pass.
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-20-conversation-workbench-page.md --include-worktree --pr-body-file ../../../../../tmp/uzmax-m7-ui-20-conversation-workbench-page/pr-body.md` - pass with PR metadata / `large_change_exception`.
- Playwright not run; this update is docs-only and did not change code.

## Boundary

This evidence does not approve page implementation, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.

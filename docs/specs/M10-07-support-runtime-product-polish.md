# M10-07 Support Runtime Product Polish

Spec ID: M10-07
Status: `evidence_ready`
Owner confirmation point: project owner requested a narrow follow-up after live Playwright found support runtime pages still exposing mock/degraded wording in strict/API states. Owner still owns production release, real customer/order-data expansion, credentials, LLM keys, cost/compliance, GA and 1.0 approval.
Timebox: small admin UI runtime-copy polish.

## Spec 类型

fix

## Goal

Remove product-polish residue where strict/API customer-support runtime states still expose synthetic/degraded/not-production semantics through DOM, accessibility text, visible copy or misleading test ids.

The support surfaces must:

1. Show `synthetic/degraded/not-production` disclosure only for local synthetic preview/fallback.
2. Keep API loading, empty, error, permission and ready states truthful without synthetic preview wording.
3. Keep confirmation queue strict/API states on real loading, empty, permission or error PageState surfaces with runtime API/source context.
4. Preserve local non-strict design preview behavior without adding backend, DB, env or data capability.

## AI Agent Responsibilities

- Implementation worker writes only in `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-07-support-runtime-product-polish` on `codex/m10-07-support-runtime-product-polish`.
- Implementation worker must not modify root/main or other worktrees and must not revert unrelated work.
- Implementation worker must keep the change to frontend state/copy/test/evidence only.
- Reviewers must verify strict/API states do not expose local-preview mock/degraded language while local preview still can.

## Source Of Truth

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md` REQ-T01, REQ-T02, REQ-T06 and evidence/data-truth principles.
- `UZMAX智能运营系统-技术架构-v1.1.md` admin as pure API client and no backend import boundary.
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` conversation workbench, confirmation queue and loading/empty/error/permission/degraded state requirements.
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` D-01..D-03 and I-01/I-05.
- `docs/admin-design-system.md` status-first, evidence-over-impression and permission-visible product UI rules.
- `PRODUCT.md`, `DESIGN.md` and project Impeccable product register.
- Prior runtime truth closure: `docs/specs/M10-06-support-runtime-ui-truth.md` and `docs/evidence/M10/M10-06-support-runtime-ui-truth.md`.

## Current Repo Facts

| Fact | Evidence |
|---|---|
| Conversation runtime already distinguishes `runtimeSource: "api" | "synthetic"`. | `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts` |
| Conversation page maps synthetic ready state to `data-runtime-state="degraded"` and API states to their real status. | `apps/admin/src/pages/conversations/ConversationsPage.tsx` |
| Conversation thread header always renders hidden `m7-conversation-degraded` text containing `synthetic/degraded/not-production 只读预览`. | `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx` |
| Queue strict runtime no longer injects fallback items, but runtime mode still renders `m7-queue-degraded` structure and strict PageState copy mentions mock queue wording. | `apps/admin/src/pages/queue/QueuePage.tsx`, `apps/admin/src/pages/queue/QueueRuntime.ts` |
| Existing M7 local preview tests still rely on degraded/synthetic disclosure when no API is configured. | `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`, `apps/admin/tests/m7-ui-confirmation-queue*.spec.ts` |

## Scope

- Gate the conversation hidden degraded disclosure so it only exists in DOM/a11y when `runtimeSource === "synthetic"`.
- Keep API loading/error/permission/empty/ready PageState behavior unchanged except for removing synthetic preview wording.
- In queue runtime/API mode, replace the degraded-named banner/testid with runtime-source status copy.
- In queue strict/API empty/error/permission copy, avoid mock/degraded wording and state that no local preview queue is filled.
- Treat HTTP 401 and 403 as permission states for confirmation queue runtime.
- Add focused static coverage for strict/API DOM/copy constraints.
- Add evidence for validation.

## Out Of Scope

- No backend, schema, migration, generated client, worker, cron, env, package/lock or CI changes.
- No confirmation queue backend route repair.
- No fallback cards restoration in strict/API mode.
- No mock expansion, new fixture set, new API capability or fabricated runtime data.
- No production deployment, GA/1.0 approval, real credentials/tokens or real customer/order-data handling.
- No broad visual redesign.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M10-07-support-runtime-product-polish.md`
  - `docs/evidence/M10/M10-07-support-runtime-product-polish.md`
  - `apps/admin/src/pages/conversations/ConversationsPage.tsx`
  - `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`
  - `apps/admin/src/pages/queue/QueuePage.tsx`
  - `apps/admin/src/pages/queue/QueueRuntime.ts`
  - `apps/admin/src/pages/queue/QueueSupport.tsx`
  - `apps/admin/tests/conversationWorkbenchLocators.ts`
  - `apps/admin/tests/m7-ui-conversation-workbench.spec.ts`
  - `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`
  - `scripts/tests/m10-support-runtime-product-polish.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M10-06-support-runtime-ui-truth.md`
- `docs/evidence/M10/M10-06-support-runtime-ui-truth.md`
- `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts`
- `apps/admin/src/pages/queue/QueueCard.tsx`
- `apps/admin/src/pages/queue/queueFallback.ts`
- `apps/admin/tests/m7-ui-conversation-workbench-fallback.spec.ts`
- `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`
- `apps/admin/tests/m7-ui-confirmation-queue-visible-parity.spec.ts`

## Change Budget

- Source: changed source files <= 5, new source files = 0, net source LOC <= 120.
- Test: new/changed focused test files <= 4.
- Docs/evidence: this spec and one M10 evidence file.
- Config/lock/generated/backend/CI: none.
- Exceptions: none.

## Acceptance

- API loading, empty, error, permission and ready conversation states do not render `m7-conversation-degraded` or `synthetic/degraded/not-production 只读预览` in DOM/a11y.
- Synthetic/local fallback conversation preview still renders the existing disclosure and `data-runtime-state="degraded"`.
- Confirmation queue strict/API mode does not render `m7-queue-degraded`, `mock/degraded visible structure`, fallback cards or degraded mode labels.
- Confirmation queue strict/API 401/403 renders permission state; 404/500/network renders error; empty API returns empty. None of these fill fallback cards.
- Queue runtime/API mode shows source/status context without implying local preview or production closure.
- Focused `node --test` coverage proves the strict/API copy and testid boundary.

## Failure Branches

- If conversation API returns 401/403, show permission state without synthetic disclosure.
- If conversation API returns 404/500/network, show error state without synthetic disclosure.
- If confirmation queue API returns 401/403, show permission state and runtime-source context without fallback cards.
- If confirmation queue API returns 404/500/network, show error state and runtime-source context without fallback cards.
- If confirmation queue API returns empty, show empty state and runtime-source context without fallback cards.
- If local no-API preview is used, preserve existing synthetic/degraded disclosure.

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-07-support-runtime-product-polish` |
| assigned branch | `codex/m10-07-support-runtime-product-polish` |
| preflight `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m10-07-support-runtime-product-polish` |
| preflight status | `## codex/m10-07-support-runtime-product-polish` |
| preflight current branch | `codex/m10-07-support-runtime-product-polish` |
| base | `3dffb22 M10-06: support runtime UI truth` |
| Impeccable context | product register; calm, exacting operational UI; evidence over impression |

## Impeccable Design Layer

Adopted:

- Product UI should prefer truthful task state over decorative warnings.
- Status copy must distinguish local preview, runtime API proof and release/production closure.
- Permission/error/empty states remain explicit and readable.

Rejected:

- None.

## Validation

Required focused validation:

- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node --test scripts/tests/m10-support-runtime-product-polish.test.mjs`
- `PATH="/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH" node --test scripts/tests/m10-support-runtime-ui-truth.test.mjs`
- `git diff --check origin/main...HEAD`

Where feasible:

- `npm run typecheck -- --pretty false`
- `npm run lint`
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M10-07-support-runtime-product-polish.md --include-worktree`

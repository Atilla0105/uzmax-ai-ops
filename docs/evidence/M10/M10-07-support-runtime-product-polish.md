# M10-07 Support Runtime Product Polish Evidence

> evidence_id: M10-07-support-runtime-product-polish
> spec: `docs/specs/M10-07-support-runtime-product-polish.md`
> branch: `codex/m10-07-support-runtime-product-polish`
> status: `evidence_ready`

## Summary

M10-07 removes the remaining product-polish residue where strict/API customer-support runtime states still exposed local preview terminology.

- Conversation thread header now renders the `synthetic/degraded/not-production` disclosure only when `runtimeSource === "synthetic"`.
- API conversation states render a neutral `m10-conversation-runtime-status` a11y/status node instead of `m7-conversation-degraded`.
- Confirmation queue runtime/API mode renders `m10-queue-runtime-source` instead of the degraded banner identity.
- Confirmation queue 401/403 is treated as `permission`; strict empty/error/permission copy states that no local preview queue is filled.
- Local non-strict preview behavior remains intact; strict/API mode still does not fill fallback cards.

## Scope Boundary

No backend, DB schema, migration, generated client, worker, cron, environment variable, package/lock, API capability, mock expansion, real customer/order data, production credentials, LLM key, GA or 1.0 release behavior was changed.

## Changed Files

| Category | Files |
|---|---|
| source | `apps/admin/src/pages/conversations/ConversationsPage.tsx`; `apps/admin/src/pages/conversations/conversationWorkbenchStyles.tsx`; `apps/admin/src/pages/queue/QueuePage.tsx`; `apps/admin/src/pages/queue/QueueRuntime.ts`; `apps/admin/src/pages/queue/QueueSupport.tsx` |
| test | `apps/admin/tests/conversationWorkbenchLocators.ts`; `apps/admin/tests/m7-ui-conversation-workbench.spec.ts`; `apps/admin/tests/m7-ui-confirmation-queue.spec.ts`; `scripts/tests/m10-support-runtime-product-polish.test.mjs` |
| docs | `docs/specs/M10-07-support-runtime-product-polish.md`; `docs/evidence/M10/M10-07-support-runtime-product-polish.md` |

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm install` | pass | Worktree-local dependencies installed; 361 packages added; 0 vulnerabilities. |
| `node --test scripts/tests/m10-support-runtime-product-polish.test.mjs scripts/tests/m10-support-runtime-ui-truth.test.mjs` | pass | 9/9 tests passed. |
| `npm run test` | pass | 546/546 tests passed. |
| `npm run typecheck -- --pretty false` | pass | TypeScript completed with exit 0. |
| `npm run lint` | pass | ESLint completed with exit 0 after keeping the touched Playwright file under 400 lines. |
| `npm run depcruise` | pass | 313 modules / 410 dependencies; no dependency violations. |
| `npm run jscpd` | pass | 419 files analyzed; 0 clones. |
| `npm run build:admin` | pass | Vite build completed; existing chunk-size warning only. |
| `npm run playwright -- apps/admin/tests/m7-ui-conversation-workbench.spec.ts apps/admin/tests/m7-ui-confirmation-queue.spec.ts` | pass | 11/11 focused Playwright tests passed. |
| `npm run playwright` | pass | 146/146 Playwright tests passed. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M10-07-support-runtime-product-polish.md --include-worktree` | pass | 11 changed files; source 5, test 4, docs 2; net source LOC 36; new source files 0. |

## Runtime Acceptance Mapping

| Acceptance | Evidence |
|---|---|
| API conversation states do not render `m7-conversation-degraded` or `synthetic/degraded/not-production` | `m10-support-runtime-product-polish.test.mjs`; `m7-ui-conversation-workbench.spec.ts` |
| Synthetic/local fallback still renders the existing disclosure | Existing `m7-ui-conversation-workbench-fallback.spec.ts` remained green in full Playwright. |
| Queue strict/API mode uses runtime-source status instead of degraded banner identity | `m10-support-runtime-product-polish.test.mjs`; `m7-ui-confirmation-queue.spec.ts` |
| Queue strict/API 401/403 maps to permission without fallback cards | `QueueRuntime.ts` focused static coverage and full Playwright regression. |
| No backend capability or data fabrication added | Scope-only diff; pr-shape source budget stayed within declared source files and no backend paths changed. |

## Remaining Boundary

This evidence does not approve GA, 1.0 release, real customer/order-data expansion, LLM/customer-provider use, production credential decisions, owner acceptance, or production incident closure. It only closes the strict/API support UI wording and state-identity polish gap introduced after M10-06 runtime truth.

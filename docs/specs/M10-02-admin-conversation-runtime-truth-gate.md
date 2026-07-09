# M10-02 Admin Conversation Runtime Truth Gate

Spec ID: M10-02
Status: `implementation_in_progress`
Owner confirmation point: project owner assigned this slice to make the admin conversation workbench fail closed when configured for real/staging API runtime. Owner still owns production traffic, real customer/order data approval, live employee credentials/tokens, LLM keys, cost/compliance decisions, GA and 1.0 release.
Timebox: narrow admin conversation runtime truth gate.

## Spec 类型

feature

## Goal

Prevent the admin conversation workbench from silently presenting synthetic local preview data as if it were runtime truth when the admin is configured for a real/staging API.

The workbench must:

1. Treat a configured `VITE_UZMAX_API_BASE_URL` or explicit `VITE_UZMAX_RUNTIME_STRICT=true` as strict runtime.
2. In strict runtime, fail closed on network errors, 404s, non-JSON responses, missing tenant selection, or invalid tenant selection.
3. Keep existing no-API local design preview behavior, including synthetic fallback for Vite/preview runtime absence.
4. Send `x-tenant-id` from the currently selected tenant instead of `config.tenants[0]`.
5. Avoid a module-level conversation fetcher that is locked to initial config or tenant.

## AI Agent Responsibilities

- Implementation agent owns only the files in the touch list and must keep root/main read-only except for coordination checks.
- Implementation agent must preserve the no-API local synthetic fallback while making configured/strict runtime fail closed.
- Spec compliance reviewer must verify preflight ordering, touch-list containment, strict runtime acceptance, incident recording and no backend/schema/package/CI drift.
- Code quality reviewer must check React/runtime behavior, tenant-header correctness, fallback behavior and residual test gaps before this slice is marked merge-ready.
- Coordinator must run final root/main and assigned-worktree status checks and report unmerged branch state before moving to the next slice.

## Source Of Truth

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md` REQ-T01, REQ-T09 and release/data truth principles.
- `UZMAX智能运营系统-技术架构-v1.1.md` admin as pure API client, API access context and tenant permission boundaries.
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` tenant switching, degraded states and conversation workbench contract.
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` B-02/B-04/D-01/I-01/J-05.
- `docs/admin-design-system.md` evidence-over-impression and secure permission/degraded state rules.
- Prior runtime contract: `docs/specs/M9-01-admin-staging-runtime-closeout.md`.

## Current Repo Facts

- `apps/admin/src/adminRuntimeConfig.ts` creates an admin runtime fetcher and currently sends `x-tenant-id` from the first configured tenant.
- `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts` creates a module-level `browserFetcher`.
- `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts` currently allows synthetic fallback for preview 404/non-JSON and network `TypeError`.
- `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts` creates one conversation client without selected tenant/config inputs.
- M7 Playwright fallback tests intentionally prove no-API local preview can use synthetic conversation data.
- M9 staging runtime closeout wired admin conversation reads to a configured staging API, but did not close the strict-runtime synthetic fallback gap.

## Scope

- Add a strict runtime signal to admin runtime config.
- Make the admin runtime fetcher tenant-aware and fail closed when strict runtime lacks a valid selected tenant.
- Create the conversation client per selected tenant/config in `useConversationWorkbenchRuntime`.
- Make synthetic fallback conditional on non-strict local/no-API preview.
- Add focused Node coverage for strict no-fallback behavior and selected tenant header behavior.
- Update M9 source/static assertions only if needed for the new fetcher shape.
- Record validation evidence in this evidence file.

## Out Of Scope

- No backend, schema, migration, generated client, worker, cron, package/lock or CI changes.
- No broad UI visual rewrite.
- No production release or GA approval.
- No live employee credential/token handling.
- No changes to M10-01 or other branches/worktrees.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M10-02-admin-conversation-runtime-truth-gate.md`
  - `docs/evidence/M10/M10-02-admin-conversation-runtime-truth-gate.md`
  - `docs/incidents/INC-2026-07-09-m10-02-root-preflight-docs.md`
  - `apps/admin/src/adminRuntimeConfig.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchClient.ts`
  - `apps/admin/src/pages/conversations/conversationWorkbenchRuntime.ts`
  - `scripts/tests/m10-admin-conversation-runtime-truth-gate.test.mjs`
  - `scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M9-01-admin-staging-runtime-closeout.md`
- relevant M7/M9 tests.

## Change Budget

- Source: changed source files <= 3, new source files <= 0, net source LOC target <= 180.
- Test: one focused Node test file; existing Playwright tests are read-only validation anchors only.
- Docs/evidence: this spec, one M10 evidence file and one incident record if required by `docs/incidents/README.md`.
- Config/lock/generated/backend/CI: none.
- Exceptions: none.

## Acceptance

- `AdminRuntimeConfig` exposes `strictRuntime` or equivalent.
- `strictRuntime` is true when `VITE_UZMAX_API_BASE_URL` is configured or `VITE_UZMAX_RUNTIME_STRICT=true`.
- No-API local preview remains non-strict by default.
- `createAdminRuntimeFetcher(config, { selectedTenantId })` or equivalent sends `x-tenant-id` from selected tenant.
- In strict runtime, missing or invalid selected tenant fails closed with a clear error and does not silently use `tenants[0]`.
- Conversation workbench creates the runtime fetcher/client from current selected tenant/config instead of a module-level browser fetcher.
- `canUseSyntheticFallback(error, config)` returns false in strict runtime.
- M7 local synthetic fallback behavior remains valid in no-API/local mode.
- Focused M10 Node test proves strict runtime no synthetic fallback and selected tenant header behavior.
- Required validation commands are run where possible and results are recorded in evidence.
- Commit history shows spec/evidence preflight before source/test changes.

## Failure Branches

- If strict runtime blocks because no selected tenant exists, show the existing error/permission/degraded state rather than inventing local rows.
- If configured API returns 404, HTML/non-JSON, 401/403 or network error, keep `data-runtime-source="api"` and expose error/permission/degraded state.
- If local no-API preview has no runtime API, preserve synthetic preview fallback for design review.
- If optional Playwright is too expensive or dependency-blocked, rely on focused Node/static tests and record the skipped browser validation.

## Start Audit

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-02-admin-conversation-runtime-truth-gate` |
| assigned branch | `codex/m10-02-admin-conversation-runtime-truth-gate` |
| preflight `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-02-admin-conversation-runtime-truth-gate` |
| preflight status | `## codex/m10-02-admin-conversation-runtime-truth-gate` |
| preflight current branch | `codex/m10-02-admin-conversation-runtime-truth-gate` |
| isolation check | `.git/worktrees/codex-m10-02-admin-conversation-runtime-truth-gate` with common git dir at root repo `.git` |
| root/main checkout | forbidden for edits; not used for source edits |
| incident record | `docs/incidents/INC-2026-07-09-m10-02-root-preflight-docs.md` records the root/main preflight docs write-boundary incident required by `docs/incidents/README.md`. |

## Validation

Required focused validation:

- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node --test scripts/tests/m10-admin-conversation-runtime-truth-gate.test.mjs scripts/tests/m9-admin-staging-runtime-closeout.test.mjs`
- `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-02-admin-conversation-runtime-truth-gate.md --include-worktree`
- `git diff --check main...HEAD`

Optional browser validation:

- Existing M7 conversation fallback tests if local dependency/runtime setup is available without broad churn.

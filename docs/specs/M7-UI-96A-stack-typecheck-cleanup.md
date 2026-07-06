# M7-UI-96A Stack CI Cleanup

## Goal

Fix the inherited stack CI blockers on top of `codex/m7-ui-95-group-logs-default-visual-parity-refresh` so #238/#96 and the following visible UI stack can run full-repo format and typecheck validation again.

This is a cleanup-only slice. It includes one format-only page-source change in `apps/admin/src/pages/knowledge/knowledgeFallback.ts` and the existing two focused test type fixes. It does not add visible UI, does not change AppShell/sidebar/topbar/router/shared patterns/tokens/page runtime semantics/data/visible copy, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this cleanup directly serves the stacked UI typecheck unblock for #238/#96.
- Keep final merge order, owner visual acceptance, production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup` on branch `codex/m7-ui-96a-stack-typecheck-cleanup`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Reproduce the full-repo Prettier failure against `apps/admin/src/pages/knowledge/knowledgeFallback.ts` using the temporary worktree-local `node_modules` symlink.
- Keep the already-landed #239 focused Playwright test type fixes limited to the two listed test files without deleting assertions, adding `.skip`/`.only`, broadening mocks or changing runtime assertions.
- Apply only Prettier-compatible formatting to `knowledgeFallback.ts`; do not change knowledge runtime semantics, fallback data or visible copy.

## Timebox

0.25 workday. If the CI unblock requires page/source edits beyond the approved `knowledgeFallback.ts` format-only change, shared shell edits, config/lock/package/backend/API/DB changes, test weakening or broad refactor, stop and report `BLOCKED`.

## Spec 类型

cleanup

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
  - `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/README.md`
- 未列出的模块默认不可改。

## Change Budget And Path Classification

- source changed files: <= 1 (`knowledgeFallback.ts` format-only)
- source net LOC: formatter-only, no semantic/runtime/data/visible-copy change
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 3
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/AppShell/sidebar/topbar/router/shared patterns/tokens: 0
- external API/SDK/provider/connector/adapter basis: none; local stack CI cleanup only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/knowledge/knowledgeFallback.ts
test:
  - apps/admin/tests/m7-ui-group-logs.spec.ts
  - apps/admin/tests/m7-ui-orders-source-parity.spec.ts
docs:
  - docs/specs/M7-UI-96A-stack-typecheck-cleanup.md
  - docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## Required Reads

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- `docs/specs/M7-UI-66-orders-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
- `apps/admin/tests/m7-ui-group-logs.spec.ts`
- `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- v1.1 product/admin/architecture/acceptance boundaries for orders, logs/audit, knowledge resources and release non-claims.

## Cleanup Contract

- `knowledgeFallback.ts` receives formatting-only Prettier cleanup for the full-repo `format:check` blocker; knowledge fallback data, runtime branches and visible copy are unchanged.
- Group logs forced-state coverage keeps `degraded` as a boundary-only branch and does not require visible copy text for that branch.
- Group logs non-degraded states are typed as a narrowed state union so `stateCopy[state]` cannot be `undefined`.
- Orders source-parity metrics keep their existing browser-evaluated raw metric object and runtime assertions.
- Orders source-parity raw metrics regain a `RawOrdersMetrics` type inferred from the `page.evaluate` return helper; no runtime assertion, mock, route or visible UI behavior changes.
- No tests are deleted, skipped, marked only, weakened or widened through broader mocks.

## Validation Plan

- `git diff --check codex/m7-ui-95-group-logs-default-visual-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base codex/m7-ui-95-group-logs-default-visual-parity-refresh --spec docs/specs/M7-UI-96A-stack-typecheck-cleanup.md --include-worktree`
- Full-repo Prettier check:
  - `node node_modules/prettier/bin/prettier.cjs --check .`
- ESLint for:
  - `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- Full-repo typecheck:
  - `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- Admin build:
  - `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`

## Failure Branches

- If full-repo format or typecheck exposes additional blockers outside the approved paths, record the exact blocker and stop instead of editing outside the allowed paths.
- If focused Playwright cannot run because the local Playwright webServer cannot start bare `npm`, use a manual `vite preview apps/admin --host 127.0.0.1 --port 4173` and repo Playwright config base URL reuse, then record that environment path.
- If dependency symlinks or generated artifacts are needed for validation, remove them before final status.

## Not Doing

- No visible UI changes.
- No `apps/admin/src/**` page/source changes except `apps/admin/src/pages/knowledge/knowledgeFallback.ts` Prettier-compatible formatting.
- No AppShell/sidebar/topbar/router/shared patterns/tokens changes.
- No package/lock/config/CI/backend/API/DB changes.
- No #238 branch-file edits outside the two listed tests and docs.
- No UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval claim.

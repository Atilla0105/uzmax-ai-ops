# M7-UI-96A Stack Typecheck Cleanup

## Goal

Fix the inherited TypeScript test blockers on top of `codex/m7-ui-95-group-logs-default-visual-parity-refresh` so #238/#96 and the following visible UI stack can run full-repo typecheck validation again.

This is a cleanup-only slice. It does not add visible UI, does not change AppShell/sidebar/topbar/router/shared patterns/tokens/page source, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this cleanup directly serves the stacked UI typecheck unblock for #238/#96.
- Keep final merge order, owner visual acceptance, production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup` on branch `codex/m7-ui-96a-stack-typecheck-cleanup`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Reproduce the two inherited typecheck failures before edits using the temporary worktree-local `node_modules` symlink.
- Fix only the two focused Playwright test type errors without deleting assertions, adding `.skip`/`.only`, broadening mocks or changing runtime assertions.

## Timebox

0.25 workday. If the typecheck unblock requires page/source edits, shared shell edits, config/lock/package/backend/API/DB changes, test weakening or broad refactor, stop and report `BLOCKED`.

## Spec 类型

cleanup

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/README.md`
- 未列出的模块默认不可改。

## Change Budget And Path Classification

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed/added: <= 2 focused Playwright specs
- docs changed/added: <= 3
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/AppShell/sidebar/topbar/router/shared patterns/tokens/page source: 0
- external API/SDK/provider/connector/adapter basis: none; local typecheck cleanup only.
- exceptions: none.

```yaml
source: []
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
- `apps/admin/tests/m7-ui-group-logs.spec.ts`
- `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- v1.1 product/admin/architecture/acceptance boundaries for orders, logs/audit and release non-claims.

## Cleanup Contract

- Group logs forced-state coverage keeps `degraded` as a boundary-only branch and does not require visible copy text for that branch.
- Group logs non-degraded states are typed as a narrowed state union so `stateCopy[state]` cannot be `undefined`.
- Orders source-parity metrics keep their existing browser-evaluated raw metric object and runtime assertions.
- Orders source-parity raw metrics regain a `RawOrdersMetrics` type inferred from the `page.evaluate` return helper; no runtime assertion, mock, route or visible UI behavior changes.
- No tests are deleted, skipped, marked only, weakened or widened through broader mocks.

## Validation Plan

- `git diff --check codex/m7-ui-95-group-logs-default-visual-parity-refresh...HEAD`
- `node scripts/guards/pr-shape.mjs --base codex/m7-ui-95-group-logs-default-visual-parity-refresh --spec docs/specs/M7-UI-96A-stack-typecheck-cleanup.md --include-worktree`
- touched Prettier check for the two changed tests and three docs files.
- ESLint for:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
- Full-repo typecheck:
  - `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- Focused Playwright:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`

## Failure Branches

- If full-repo typecheck exposes additional blockers outside the two inherited test errors, record the exact blocker and stop instead of editing outside the allowed paths.
- If focused Playwright cannot run because the local Playwright webServer cannot start bare `npm`, use a manual `vite preview apps/admin --host 127.0.0.1 --port 4173` and repo Playwright config base URL reuse, then record that environment path.
- If dependency symlinks or generated artifacts are needed for validation, remove them before final status.

## Not Doing

- No visible UI changes.
- No `apps/admin/src/**` page/source changes.
- No AppShell/sidebar/topbar/router/shared patterns/tokens changes.
- No package/lock/config/CI/backend/API/DB changes.
- No #238 branch-file edits outside the two listed tests and docs.
- No UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval claim.

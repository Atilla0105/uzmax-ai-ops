# M7-UI-96A Stack CI Cleanup

## Goal

Fix PR #239 / branch `codex/m7-ui-96a-stack-typecheck-cleanup` stack CI blockers on top of `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`.

This cleanup now covers:

- the existing #239 focused Playwright TypeScript fixes in `m7-ui-group-logs.spec.ts` and `m7-ui-orders-source-parity.spec.ts`;
- the previous full-repo Prettier blocker in `apps/admin/src/pages/knowledge/knowledgeFallback.ts`;
- the new CI `guard:prettier-ignore` blocker caused by baseline-external M7 page/source-parity files that introduced `// prettier-ignore` markers.

The cleanup removes those M7 `prettier-ignore` markers and lets repo Prettier format the affected structures. It does not add visible UI, does not change AppShell/sidebar/topbar/router/shared patterns/tokens/page runtime semantics/data/visible copy, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this cleanup directly serves PR #239 stack CI unblock.
- Accept the formatter-only churn required after removing `prettier-ignore` markers from previously compressed M7 page/test structures.
- Keep final merge order, owner visual acceptance, production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup` on branch `codex/m7-ui-96a-stack-typecheck-cleanup`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Reproduce `guard:prettier-ignore` against `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`.
- Remove only the baseline-external M7 `prettier-ignore` markers in this spec, then run Prettier formatting.
- Do not edit `scripts/guards/prettier-ignore-boundary.mjs`, do not change the prettier-ignore baseline, do not weaken or skip tests, and do not broaden mocks.

## Timebox

0.5 workday. If the CI unblock requires guard relaxation, package/lock/config/backend/API/DB/worker/cron/shared shell changes, test weakening, runtime behavior changes, visible-copy changes or non-M7 baseline files, stop and report `BLOCKED`.

## Spec 类型

cleanup

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/config/ConfigPage.tsx`
  - `apps/admin/src/pages/config/configFallback.ts`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
  - `apps/admin/src/pages/knowledge/KnowledgeViews.tsx`
  - `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
  - `apps/admin/src/pages/team/TeamDialogs.tsx`
  - `apps/admin/src/pages/team/TeamViews.tsx`
  - `apps/admin/src/pages/team/teamFallback.ts`
  - `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`
  - `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/README.md`
- 未列出的模块默认不可改。

## Change Budget And Path Classification

- source changed files: <= 9, all formatter-only M7 page/fallback/view files
- source net LOC: formatter-only churn after removing `prettier-ignore`; no semantic/runtime/data/visible-copy change
- new source files: 0
- test files changed/added: <= 7 focused Playwright specs, formatter/type-only cleanup only
- docs changed/added: <= 3
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/AppShell/sidebar/topbar/router/shared patterns/tokens: 0
- external API/SDK/provider/connector/adapter basis: none; local stack CI cleanup only
- exception handling: if committed formatter-only source net LOC exceeds the default `guard:pr-shape` source budget, PR #239 must use `large_change_exception` in PR Hygiene metadata. This is a formatter-churn exception only and still requires owner review; it does not expand semantic scope or allow guard relaxation.

```yaml
source:
  - apps/admin/src/pages/config/ConfigPage.tsx
  - apps/admin/src/pages/config/configFallback.ts
  - apps/admin/src/pages/group/GroupTenantViews.tsx
  - apps/admin/src/pages/group/groupTenantFallback.ts
  - apps/admin/src/pages/knowledge/KnowledgeViews.tsx
  - apps/admin/src/pages/knowledge/knowledgeFallback.ts
  - apps/admin/src/pages/team/TeamDialogs.tsx
  - apps/admin/src/pages/team/TeamViews.tsx
  - apps/admin/src/pages/team/teamFallback.ts
test:
  - apps/admin/tests/m7-ui-config-source-parity.spec.ts
  - apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts
  - apps/admin/tests/m7-ui-group-logs.spec.ts
  - apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts
  - apps/admin/tests/m7-ui-orders-source-parity.spec.ts
  - apps/admin/tests/m7-ui-template-center-source-parity.spec.ts
  - apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts
docs:
  - docs/specs/M7-UI-96A-stack-typecheck-cleanup.md
  - docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## Required Reads

- `/Users/atilla/Applications/UZMAX智能运营/AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- `docs/specs/M7-UI-66-orders-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-95-group-logs-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- Current cleanup target files listed under the touch module set.
- v1.1 product/admin/architecture/acceptance boundaries for orders, logs/audit, knowledge resources, team/config/tenant/connection/template surfaces and release non-claims.

## Cleanup Contract

- Remove `// prettier-ignore` / `/* prettier-ignore */` markers only from the listed baseline-external M7 files.
- Let Prettier format the affected arrays, object literals, type aliases, helper functions, JSX blocks and Playwright metric structures.
- Preserve runtime labels in hidden/data/title/ARIA evidence where existing tests require them.
- Preserve fallback data, visible copy, local-only interaction behavior, route IDs, test IDs and source-parity assertions.
- Keep the existing #239 group-logs and orders TypeScript fixes without deleting assertions, adding `.skip`/`.only`/`xit`/`xfail`, broadening mocks or changing runtime assertions.
- Do not change prettier-ignore guard code or its baseline.

## Validation Plan

- Reproduction before fix:
  - `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- Formatting:
  - `pnpm exec prettier --check .`
- Guard:
  - `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - `pnpm run guard:pr-shape -- --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- Type/build:
  - `pnpm --filter @uzmax/admin typecheck` if the admin package exposes it; otherwise record the missing script and run the repo equivalent `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`.
  - `pnpm --filter @uzmax/admin build`
- Focused Playwright:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`

## Failure Branches

- If `guard:prettier-ignore` still reports baseline-external M7 files after cleanup, inspect only the listed files and remove remaining markers.
- If full-repo format/typecheck exposes blockers outside approved paths, record the exact blocker and stop instead of editing outside scope.
- If `pnpm --filter @uzmax/admin typecheck` is unavailable because the admin package has no `typecheck` script, record that and run the repo root typecheck equivalent.
- If focused Playwright cannot run because the local Playwright webServer cannot start bare `npm`, use manual `vite preview apps/admin --host 127.0.0.1 --port 4173` with `PLAYWRIGHT_TEST_BASE_URL`, then record that environment path.
- If dependency symlinks or generated artifacts are needed for validation, remove them before final commit/status.

## Not Doing

- No visible UI changes.
- No AppShell/sidebar/topbar/router/shared patterns/tokens changes.
- No package/lock/config/CI/backend/API/DB changes.
- No prettier-ignore guard baseline or guard logic change.
- No test deletion, skip/only/xfail/xit, assertion weakening, mock broadening or snapshot inflation.
- No UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval claim.

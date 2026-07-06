# M7-UI-96A Stack CI Cleanup

## Goal

Fix PR #239 / branch `codex/m7-ui-96a-stack-typecheck-cleanup` stack CI blockers on top of `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`.

This cleanup now covers:

- the existing #239 focused Playwright TypeScript fixes in `m7-ui-group-logs.spec.ts` and `m7-ui-orders-source-parity.spec.ts`;
- the previous full-repo Prettier blocker in `apps/admin/src/pages/knowledge/knowledgeFallback.ts`;
- the CI `guard:prettier-ignore` blocker caused by baseline-external M7 page/source-parity files that introduced `// prettier-ignore` markers;
- the follow-up CI `npm run lint` `max-lines` blocker in the same config/group/knowledge/team page and source-parity stack;
- the 2026-07-06 clean-room jscpd investigation for head `065c4e9d8a0bf63dcd38c33469d7cd6f366f67c4`.
- the 2026-07-06 clean-room `knip` unused export/type cleanup for head `2542d7728e4675654d4a7e1b6b001ab22f831c19`.

The cleanup removes those M7 `prettier-ignore` markers, lets repo Prettier format the affected structures, and splits oversized files into adjacent semantic-preserving helpers so lint can pass without disabling `max-lines`. It does not add visible UI, does not change AppShell/sidebar/topbar/router/shared patterns/tokens/page runtime semantics/data/visible copy, and does not claim UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval.

The `knip` cleanup removes unnecessary `export` keywords from local-only values/types and deletes one truly unused local tenant-column constant after `rg` confirmed no references. It does not add synthetic references, delete tests, weaken `knip`, change package/config/lock/CI, or change UI/runtime behavior.

Clean-room jscpd result: `npm run jscpd` is not yet passable inside this spec's approved touch set because the PR base itself fails the same full-repo jscpd scan. The clean-room worker reproduced:

- PR head `065c4e9d8a0bf63dcd38c33469d7cd6f366f67c4`: `141` clones, duplicated lines `2538 (2.79%)`, duplicated tokens `17547 (3.31%)`.
- PR base `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh` / `9dc45e89dfa0a6ee724d03cffd6d498c690ef8a6`: `142` clones, duplicated lines `2595 (2.92%)`, duplicated tokens `17808 (3.37%)`.
- Many remaining clone blocks do not involve PR #239 changed files, for example `apps/admin/tests/m7-ui-ai-members-default-visual-parity.spec.ts` vs `apps/admin/tests/m7-ui-ai-members.spec.ts`, analytics/logs visual parity tests, and ticket default/source parity tests.

Therefore the current jscpd blocker is `blocked_base_wide_jscpd_clone_debt`: clearing `npm run jscpd` to threshold `0` requires a separate owner-approved global jscpd cleanup/baseline decision or a broader shared test-helper spec. This #96A spec must not expand into unrelated historic page/test rewrites.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this cleanup directly serves PR #239 stack CI unblock.
- Accept the formatter-only churn required after removing `prettier-ignore` markers from previously compressed M7 page/test structures.
- Keep final merge order, owner visual acceptance, production/staging, real customer/order data, LLM key, cost/compliance, GA-0 and release decisions owner-only.

AI agent:

- Work only in the assigned worker worktree. The 2026-07-06 jscpd clean-room worker used `/Users/atilla/.codex/worktrees/m7-ui-96a-jscpd-cleanroom` on branch `codex/m7-ui-96a-jscpd-cleanroom`, starting from `origin/codex/m7-ui-96a-stack-typecheck-cleanup`.
- The 2026-07-06 knip clean-room worker must use `/Users/atilla/.codex/worktrees/m7-ui-96a-knip-cleanroom` on branch `codex/m7-ui-96a-knip-cleanroom`, starting from `origin/codex/m7-ui-96a-stack-typecheck-cleanup`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Start by recording `pwd`, `git status --short --branch` and `git branch --show-current`.
- Reproduce `guard:prettier-ignore` against `origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`.
- Remove only the baseline-external M7 `prettier-ignore` markers in this spec, then run Prettier formatting.
- Resolve `max-lines` only by semantic-preserving adjacent extraction or helper consolidation within the approved M7 page/test stack.
- For jscpd, inspect clone blocks involving PR #239 changed files and record base-wide blockers. Do not modify jscpd config, guard scripts, CI, lockfiles or unrelated historic page/test files just to drive the full-repo threshold to zero.
- For knip, reproduce `npm run knip`, confirm each reported symbol with `rg`, then prefer local-only de-export cleanup or safe removal of truly unused local constants. Do not invent references just to silence knip.
- Do not edit `scripts/guards/prettier-ignore-boundary.mjs`, do not change the prettier-ignore baseline, do not weaken or skip tests, and do not broaden mocks.

## Timebox

0.5 workday. If the CI unblock requires guard relaxation, package/lock/config/backend/API/DB/worker/cron/shared shell changes, test weakening, runtime behavior changes, visible-copy changes, non-M7 baseline files or unrelated historic page/test jscpd rewrites, stop and report `BLOCKED`.

## Spec 类型

cleanup

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/config/ConfigPage.tsx`
  - `apps/admin/src/pages/config/ConfigConfirm.tsx`
  - `apps/admin/src/pages/config/ConfigInputs.tsx`
  - `apps/admin/src/pages/config/ConfigSections.tsx`
  - `apps/admin/src/pages/config/configFallback.ts`
  - `apps/admin/src/pages/analytics/analyticsFallback.ts`
  - `apps/admin/src/pages/evals/EvalViews.tsx`
  - `apps/admin/src/pages/group/GroupTenantPage.tsx`
  - `apps/admin/src/pages/group/GroupTenantTable.tsx`
  - `apps/admin/src/pages/group/GroupTenantViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
  - `apps/admin/src/pages/group/groupTenantFallback.ts`
  - `apps/admin/src/pages/knowledge/KnowledgeControls.tsx`
  - `apps/admin/src/pages/knowledge/KnowledgePage.tsx`
  - `apps/admin/src/pages/knowledge/KnowledgeViews.tsx`
  - `apps/admin/src/pages/knowledge/knowledgeFallback.ts`
  - `apps/admin/src/pages/logs/logsFallback.ts`
  - `apps/admin/src/pages/queue/queueFallback.ts`
  - `apps/admin/src/pages/team/TeamDialogs.tsx`
  - `apps/admin/src/pages/team/TeamMemberDrawer.tsx`
  - `apps/admin/src/pages/team/TeamPage.tsx`
  - `apps/admin/src/pages/team/TeamRoleViews.tsx`
  - `apps/admin/src/pages/team/TeamViews.tsx`
  - `apps/admin/src/pages/team/teamFallback.ts`
  - `apps/admin/src/pages/team/useTeamPageState.ts`
  - `apps/admin/tests/m7-ui-config-source-parity.helpers.ts`
  - `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-source-parity.helpers.ts`
  - `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.helpers.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.helpers.ts`
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`
  - `docs/specs/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/M7-UI-96A-stack-typecheck-cleanup.md`
  - `docs/evidence/M7/README.md`
- 未列出的模块默认不可改。

## Change Budget And Path Classification

- source changed files: <= 25, limited to formatter cleanup, adjacent helper extraction in the M7 config/group/knowledge/team page stack, and mechanical `knip` local-only export cleanup exposed by the current PR state
- source net LOC: formatter/helper-extraction churn after removing `prettier-ignore` and splitting oversized files; no semantic/runtime/data/visible-copy change
- new source files: <= 8, adjacent component/state/helper files only, no new route or parallel implementation
- test files changed/added: <= 12 focused Playwright specs/helpers, formatter/type/max-lines cleanup only
- docs changed/added: <= 3
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/AppShell/sidebar/topbar/router/shared patterns/tokens: 0
- external API/SDK/provider/connector/adapter basis: none; local stack CI cleanup only
- exception handling: if committed source net LOC or new/changed source file counts exceed default `guard:pr-shape` source budgets, PR #239 must use `large_change_exception` in PR Hygiene metadata. This is a formatter/max-lines extraction exception only and still requires owner review; it does not expand semantic scope or allow guard relaxation.

```yaml
source:
  - apps/admin/src/pages/analytics/analyticsFallback.ts
  - apps/admin/src/pages/config/ConfigPage.tsx
  - apps/admin/src/pages/config/ConfigConfirm.tsx
  - apps/admin/src/pages/config/ConfigInputs.tsx
  - apps/admin/src/pages/config/ConfigSections.tsx
  - apps/admin/src/pages/config/configFallback.ts
  - apps/admin/src/pages/evals/EvalViews.tsx
  - apps/admin/src/pages/group/GroupTenantPage.tsx
  - apps/admin/src/pages/group/GroupTenantTable.tsx
  - apps/admin/src/pages/group/GroupTenantViews.tsx
  - apps/admin/src/pages/group/groupTemplateFallback.ts
  - apps/admin/src/pages/group/groupTenantFallback.ts
  - apps/admin/src/pages/knowledge/KnowledgeControls.tsx
  - apps/admin/src/pages/knowledge/KnowledgePage.tsx
  - apps/admin/src/pages/knowledge/KnowledgeViews.tsx
  - apps/admin/src/pages/knowledge/knowledgeFallback.ts
  - apps/admin/src/pages/logs/logsFallback.ts
  - apps/admin/src/pages/queue/queueFallback.ts
  - apps/admin/src/pages/team/TeamDialogs.tsx
  - apps/admin/src/pages/team/TeamMemberDrawer.tsx
  - apps/admin/src/pages/team/TeamPage.tsx
  - apps/admin/src/pages/team/TeamRoleViews.tsx
  - apps/admin/src/pages/team/TeamViews.tsx
  - apps/admin/src/pages/team/teamFallback.ts
  - apps/admin/src/pages/team/useTeamPageState.ts
test:
  - apps/admin/tests/m7-ui-config-source-parity.helpers.ts
  - apps/admin/tests/m7-ui-config-source-parity.spec.ts
  - apps/admin/tests/m7-ui-connection-center-source-parity.helpers.ts
  - apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts
  - apps/admin/tests/m7-ui-group-logs.spec.ts
  - apps/admin/tests/m7-ui-knowledge-resources-source-parity.helpers.ts
  - apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts
  - apps/admin/tests/m7-ui-orders-source-parity.spec.ts
  - apps/admin/tests/m7-ui-template-center-source-parity.spec.ts
  - apps/admin/tests/m7-ui-tenant-management-source-parity.helpers.ts
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
- `package.json#knip`
- Current cleanup target files listed under the touch module set.
- v1.1 product/admin/architecture/acceptance boundaries for orders, logs/audit, knowledge resources, team/config/tenant/connection/template surfaces and release non-claims.

## Cleanup Contract

- Remove `// prettier-ignore` / `/* prettier-ignore */` markers only from the listed baseline-external M7 files.
- Let Prettier format the affected arrays, object literals, type aliases, helper functions, JSX blocks and Playwright metric structures.
- Keep every lint `max-lines` fix semantic-preserving: only move existing JSX/helpers/static test utilities into adjacent files or consolidate repeated Playwright helpers.
- Preserve runtime labels in hidden/data/title/ARIA evidence where existing tests require them.
- Preserve fallback data, visible copy, local-only interaction behavior, route IDs, test IDs and source-parity assertions.
- Keep the existing #239 group-logs and orders TypeScript fixes without deleting assertions, adding `.skip`/`.only`/`xit`/`xfail`, broadening mocks or changing runtime assertions.
- Do not change prettier-ignore guard code or its baseline.
- Keep the `knip` cleanup mechanical: remove unnecessary exports from local-only symbols or remove truly unused declarations only after `rg` confirms no references.

## Validation Plan

- Reproduction before fix:
  - `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - `node node_modules/jscpd/run-jscpd.js apps packages scripts --config jscpd.config.json --workers 1 --no-tips`
  - If head jscpd fails, run the same command against the PR base in a read-only temporary worktree to distinguish PR-local duplication from base-wide clone debt.
- Formatting:
  - `node node_modules/prettier/bin/prettier.cjs --check .` or project CI-equivalent format check
- Guard:
  - `node scripts/guards/prettier-ignore-boundary.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
  - `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-95-group-logs-default-visual-parity-refresh`
- Lint:
  - `npm run lint` if `npm` is available; otherwise run the exact `package.json` find/xargs ESLint entrypoint.
- Knip:
  - `npm run knip` after the local-only export cleanup; `knip` config must remain unchanged.
- Type/build:
  - `pnpm --filter @uzmax/admin typecheck` if the admin package exposes it; otherwise record the missing script and run the repo equivalent `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`.
  - `pnpm --filter @uzmax/admin build`
- Focused Playwright:
  - `apps/admin/tests/m7-ui-group-logs.spec.ts`
  - `apps/admin/tests/m7-ui-orders-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-connection-center-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-knowledge-resources-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-tenant-management-default-visual-parity.spec.ts`
  - `apps/admin/tests/m7-ui-team-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`

## Failure Branches

- If `guard:prettier-ignore` still reports baseline-external M7 files after cleanup, inspect only the listed files and remove remaining markers.
- If `max-lines` still reports within the approved stack, extract only adjacent helpers; do not use `eslint-disable`, lower lint rules, or reintroduce `prettier-ignore`.
- If full-repo format/typecheck/jscpd exposes blockers outside approved paths, record the exact blocker and stop instead of editing outside scope.
- If `npm run jscpd` remains blocked because the PR base already fails the same full-repo jscpd command with clone blocks outside this spec's touch set, report `blocked_base_wide_jscpd_clone_debt` and do not broaden this #96A cleanup into unrelated historic tests/pages without owner-approved spec expansion.
- If `npm run knip` reports additional symbols outside the approved touch set, record exact files/symbols and stop unless the owner/coordinator explicitly includes them as cleanup-only PR #239 blockers.
- If `pnpm --filter @uzmax/admin typecheck` is unavailable because the admin package has no `typecheck` script, record that and run the repo root typecheck equivalent.
- If focused Playwright cannot run because the local Playwright webServer cannot start bare `npm`, use manual `vite preview apps/admin --host 127.0.0.1 --port 4173` with `PLAYWRIGHT_TEST_BASE_URL`, then record that environment path.
- If dependency symlinks or generated artifacts are needed for validation, remove them before final commit/status.

## Not Doing

- No visible UI changes.
- No AppShell/sidebar/topbar/router/shared patterns/tokens changes.
- No package/lock/config/CI/backend/API/DB changes.
- No prettier-ignore guard baseline or guard logic change.
- No `knip` config, package script, ignore, threshold or entrypoint change.
- No test deletion, skip/only/xfail/xit, assertion weakening, mock broadening or snapshot inflation.
- No UI migration completion, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval claim.

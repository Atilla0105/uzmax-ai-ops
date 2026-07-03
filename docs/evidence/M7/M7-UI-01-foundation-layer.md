# M7-UI-01 Foundation Layer Evidence

## Entry Evidence

- Worker path: `/Users/atilla/.codex/worktrees/m7-ui-01-foundation-layer/UZMAX智能运营`
- Assigned branch: `codex/m7-ui-01-foundation-layer`
- Forbidden root/main checkout: `/Users/atilla/Applications/UZMAX智能运营`
- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-01-foundation-layer/UZMAX智能运营`
- `git status --short --branch`: `## codex/m7-ui-01-foundation-layer`
- `git branch --show-current`: `codex/m7-ui-01-foundation-layer`
- Root/main clean check: `git status --short --branch` in root/main returned `## main...origin/main`.
- `git branch --no-merged main`: no output in worker worktree.
- `gh pr list --state open --limit 20`: failed locally with `zsh:1: command not found: gh`.

## Required Reads

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/impeccable/reference/product.md`
- `docs/specs/M7-05-prototype-visual-source-reset.md`
- `docs/specs/M7-UI-00-prototype-migration-index.md`
- `docs/specs/M7-UI-00A-fixture-sanitization-map.md`
- `docs/specs/M7-UI-00B-token-foundation-contract.md`
- `docs/admin-ui-prototype-migration-index.md`
- `docs/admin-ui-fixture-sanitization-map.md`
- `docs/admin-ui-token-foundation-contract.md`
- `docs/admin-design-system.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` IA/global-frame sections
- `packages/ui-tokens/src/tokens.css`
- `packages/ui-tokens/src/index.ts`
- `packages/ui-tokens/package.json`
- `apps/admin/src/App.tsx`
- `apps/admin/src/main.tsx`
- `apps/admin/src/styles.css`
- `apps/admin/tests/design.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html` read-only (`wc -c`, `file`, targeted `rg`; output was too large/truncated, no raw fixture copied)
- `/Users/atilla/源码/unpacked 6` read-only file listing and key token/primitives/patterns/shell files

## Searches And Baseline

- `rg --files packages/ui-tokens apps/admin/src apps/admin/tests`
- `rg -n "primitives|patterns|shell|--uzmax-|--ink-|side-tab|border-left|AppShell|NavItem|PageState|StatusBadge|SearchInput" apps/admin/src packages/ui-tokens/src apps/admin/tests docs/specs/M7-UI-01-foundation-layer.md`
- `find /Users/atilla/源码/'unpacked 6' -maxdepth 3 -type f`
- `rg -n "集团|租户|对话|工单|客户|订单|知识|确认|评测|AI|团队|配置|分析|日志|发布|总览|导航|Topbar" UZMAX智能运营系统-后台设计与前端架构-v1.1.md`

Baseline findings:

- `packages/ui-tokens/src/tokens.css` had only legacy `--uzmax-*` bridge tokens.
- `apps/admin/src/primitives`, `apps/admin/src/patterns` and `apps/admin/src/shell` did not exist.
- `apps/admin/src/App.tsx` rendered the current M2-M6 evidence shell directly and owned `admin-shell`, `tenant-switcher`, `group-layer`, `tenant-layer` and `release-readiness`.
- Existing tests use `/design`, `tenant-switcher` as a native select, and M2-M6 test ids. These anchors must remain.
- `unpacked 6` provides the expected source layers: `ui-tokens`, `primitives`, `patterns`, `shell`, `pages`, `hooks`, `fixtures`.
- Prototype token source uses the 2px ordinal scale `--s-1..--s-10`, while `docs/admin-design-system.md` still contains a 4px scale table. This implementation follows M7-UI-00B / `unpacked 6` and records doc-sync as a follow-up.

## Prototype Mapping

- `unpacked 6/ui-tokens/tokens.css` -> `packages/ui-tokens/src/tokens.css`
- `unpacked 6/ui-tokens/tokens.ts` -> `packages/ui-tokens/src/tokens.ts`
- `unpacked 6/primitives/*` -> compact `apps/admin/src/primitives/index.tsx`
- `unpacked 6/patterns/NavItem.tsx`, `Tabs.tsx`, `PageState.tsx`, `EmptyState.tsx`, `DegradedBar.tsx` -> compact `apps/admin/src/patterns/index.tsx`
- `unpacked 6/shell/AppShell.tsx`, `NavSidebar.tsx`, `TopBar.tsx`, `TenantSwitcher.tsx`, `navigation.ts` -> `apps/admin/src/shell/AppShell.tsx`
- Raw `fixtures/**`, page fixtures, bundled HTML runtime and long HTML excerpts were not copied.

## Impeccable / Design Decisions

- Accepted: product register, dense operational UI, fixed product type scale, restrained status-first layout, visible focus, semantic state labels, reduced-motion support.
- Accepted: prototype frame dimensions `68px` collapsed nav, `232px` expanded nav, `52px` topbar.
- Accepted with adaptation: Lucide-only final icon source. This slice cannot add `lucide-react`, so it provides `IconSlot` placeholders and records lucide as a follow-up dependency/spec.
- Adapted: prototype navigation grouping. Tenant IA order follows v1.1: conversations, tickets, customer assets, orders, knowledge/resources, confirmation queue, eval center, AI members, team, config, analytics, logs.
- Rejected for new foundation: old `--uzmax-*` as visual source; it remains only as compatibility aliases.
- Rejected: raw fixture import, side-stripe state accents, decorative gradients/glassmorphism, rounded hero cards and page-local styling drift.

## Files Changed

- `docs/specs/M7-UI-01-foundation-layer.md`
  - Added this implementation spec.
  - Continuation fix: changed guard-facing headings to `## Spec 类型` and `## 触碰模块/文件`.
  - Continuation fix: changed spec type from unsupported `implementation` to guard-supported `feature`.
- `docs/evidence/M7/M7-UI-01-foundation-layer.md`
  - Added entry, read, mapping, decision, validation and follow-up evidence.
- `packages/ui-tokens/src/tokens.css`
  - Added prototype-derived canonical tokens: `--ink-*`, `--state-*`, `--accent-data-*`, fixed type scale, `--s-*` spacing, radius, motion, z-index, opacity and AppShell layout dimensions.
  - Kept `--uzmax-*` aliases only for unmigrated M2-M6 shell CSS compatibility.
- `packages/ui-tokens/src/tokens.ts`
  - Added typed token exports for colors, spacing, radius, shadow, motion, z-index, opacity, fonts, type scale and shell layout constants.
- `packages/ui-tokens/src/index.ts`
  - Re-exported typed tokens.
- `packages/ui-tokens/package.json`
  - Exported `.` and `./tokens` without dependency or lockfile changes.
- `apps/admin/src/primitives/index.tsx`
  - Added compact Button, IconSlot, StatusBadge, Avatar, CountBadge, Kbd, Input/SearchInput, Toggle, Checkbox and Heartbeat primitives.
- `apps/admin/src/patterns/index.tsx`
  - Added NavItem, Tabs, EmptyState, PageState and DegradedBar patterns.
- `apps/admin/src/shell/AppShell.tsx`
  - Added prototype-aligned shell with nav collapse/expand, topbar, tenant switcher, env marker, heartbeat, search, notification and user-menu controls.
  - Continuation fix: typed `tenants` as non-empty (`readonly [AppShellTenant, ...AppShellTenant[]]`) so `tenants.find(...) ?? tenants[0]` is strict-TS safe.
- `apps/admin/src/shell/FoundationPreview.tsx`
  - Continuation fix: extracted the M7 foundation preview component and props from `apps/admin/src/App.tsx` into the allowed `apps/admin/src/shell/**` scope.
  - Preserved existing preview test ids, controls, state coverage and copy.
- `apps/admin/src/shell/AppShell.css`
  - Added shell, primitive, pattern, state, reduced-motion and 320px fallback CSS using canonical tokens.
  - Continuation fix: removed nonzero `letter-spacing` from new shell labels to satisfy frontend typography constraints.
- `apps/admin/src/App.tsx`
  - Wrapped existing M2-M6 evidence content in AppShell while preserving `admin-shell`, `tenant-switcher`, `group-layer`, `tenant-layer`, `release-readiness` and existing milestone test ids.
  - Added focused foundation preview for loading, empty, error, permission denied and degraded states.
  - Continuation fix: imports `FoundationPreview` from `apps/admin/src/shell/FoundationPreview.tsx`; file length reduced from 329 lines to 225 lines.
- `apps/admin/tests/m7-ui-foundation.spec.ts`
  - Added focused Playwright coverage for AppShell frame, nav dimensions, topbar controls, tenant switching, state matrix and 320px fallback width.

## Validation Results

- Prettier write on changed M7-UI-01 files only:
  - Command shape: `NODE_PATH="/Users/atilla/Applications/UZMAX智能运营/node_modules" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/Applications/UZMAX智能运营/node_modules/prettier/bin/prettier.cjs --write <changed files>`
  - Changed-file set was generated from `git diff --name-only --diff-filter=ACMRT HEAD` plus `git ls-files --others --exclude-standard`, NUL-sorted and passed through `xargs -0`.
  - Result: passed with exit 0 using the existing root dependency; no dependency install, lockfile edit, root package edit or root/main write was performed.
- Prettier check on the same changed-file set:
  - First post-write check returned exit 1 for `apps/admin/src/shell/AppShell.css`.
  - Targeted CSS rewrite/check then passed: `apps/admin/src/shell/AppShell.css 28ms`; `All matched files use Prettier code style!`.
  - Final changed-file-set check passed: `Checking formatting...`; `All matched files use Prettier code style!`.
- `git diff --check`
  - Result: passed, no output.
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-01-foundation-layer.md --include-worktree`
  - Result: passed.
  - Output:
    - `base`: `main`
    - `specPath`: `docs/specs/M7-UI-01-foundation-layer.md`
    - `specType`: `feature`
    - `changedFiles`: `13`
    - `categories`: `source=9`, `config=1`, `test=1`, `docs=2`
    - `source`: `changedFiles=9`, `netLoc=0`, `newFiles=0`
- Coordinator source-size finding:
  - Current branch will require `Exception: large_change_exception` in PR metadata because this compact foundation slice creates the missing token/primitives/patterns/shell layers and is expected to exceed the default post-commit PR-shape source budget (`new source files > 5` and `net source LOC > 600`).
  - This is an owner-review/merge approval point and is not closed or self-approved by the worker.
- `wc -l apps/admin/src/App.tsx apps/admin/src/shell/FoundationPreview.tsx apps/admin/src/primitives/index.tsx apps/admin/src/patterns/index.tsx apps/admin/src/shell/AppShell.tsx`
  - Result:
    - `225 apps/admin/src/App.tsx`
    - `107 apps/admin/src/shell/FoundationPreview.tsx`
    - `215 apps/admin/src/primitives/index.tsx`
    - `156 apps/admin/src/patterns/index.tsx`
    - `196 apps/admin/src/shell/AppShell.tsx`
    - `899 total`
- `rg -n -e '--uzmax-' apps/admin/src/primitives apps/admin/src/patterns apps/admin/src/shell`
  - Result: passed for this slice requirement by returning no matches (exit 1 with empty output).
  - Note: `packages/ui-tokens/src/tokens.css` keeps `--uzmax-*` compatibility aliases and is allowed by spec.
- `test -d node_modules`
  - Result: failed with exit 1; this worker worktree has no `node_modules`.
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
  - Result: not run to completion because local dependency is absent.
  - Exact failure: `Error: Cannot find module '/Users/atilla/.codex/worktrees/m7-ui-01-foundation-layer/UZMAX智能运营/node_modules/typescript/lib/tsc.js'`.
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Result: not run to completion because local dependency is absent.
  - Exact failure: `Error: Cannot find module '/Users/atilla/.codex/worktrees/m7-ui-01-foundation-layer/UZMAX智能运营/node_modules/vite/bin/vite.js'`.
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-foundation.spec.ts`
  - Result: not run to completion because local dependency is absent.
  - Exact failure: `Error: Cannot find module '/Users/atilla/.codex/worktrees/m7-ui-01-foundation-layer/UZMAX智能运营/node_modules/@playwright/test/cli.js'`.
- Root/main node_modules were not symlinked, copied or used.

## Follow-Ups / Blockers

- Add `lucide-react` through a dedicated dependency/spec slice before replacing `IconSlot` placeholders with real Lucide icons.
- Resolve `docs/admin-design-system.md` 4px spacing table vs prototype/M7-UI-00B 2px ordinal scale in a docs-sync slice if coordinator wants docs to exactly match implementation.
- TypeScript, Vite build and focused Playwright still need to run in CI or a worker environment with its own isolated `node_modules`.
- The final PR body must keep `Exception: large_change_exception` visible for owner review; do not hide it behind the local uncommitted `pr-shape --include-worktree` pass.

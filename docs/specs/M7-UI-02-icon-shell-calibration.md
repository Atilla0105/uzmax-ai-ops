# M7-UI-02 Icon Shell Calibration

## Goal

Install the approved Lucide icon source and calibrate the M7 AppShell/sidebar/topbar icon layer left incomplete by `M7-UI-01-foundation-layer`.

This is a narrow follow-up slice. It must replace text glyph placeholders such as `对`, `工`, `S`, `收` and `展` in the AppShell, navigation and search/topbar shell controls with stable `lucide-react` icon components, while preserving the M7 foundation behavior, dimensions and anchors.

## Owner Confirmation Points

- The owner requested this worker slice explicitly as `M7-UI-02-icon-shell-calibration`.
- Root/main checkout remains read-only coordination context; all edits must happen in the assigned worktree.
- This slice is allowed to update root package metadata and lockfile only to add `lucide-react`.
- The coordinator will review and merge; the worker must not merge.

## AI Agent Responsibilities

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-02-icon-shell-calibration/UZMAX智能运营` on branch `codex/m7-ui-02-icon-shell-calibration`.
- Read `AGENTS.md`, `DESIGN.md`, M7-05, M7-UI-01 spec/evidence, migration index, fixture sanitization map, token foundation contract, current package/source/test files and prototype shell/navigation/icon usage before implementation edits.
- Create this spec before source implementation edits.
- Use `lucide-react` as the only new icon source, matching prototype intent and keeping stroke width around `1.75`.
- Preserve M7 foundation anchors: `admin-shell`, `app-shell-nav`, `tenant-switcher`, `environment-marker`, `system-heartbeat`, nav labels, collapse/expand behavior, `232px` expanded nav, `68px` collapsed nav and `320px` fallback.
- Add focused Playwright assertions without weakening existing assertions.
- Record validation attempts and exact failures in `docs/evidence/M7/M7-UI-02-icon-shell-calibration.md`.

## Timebox

0.25 workday. If this requires page migration, old M2-M6 page/CSS changes, backend/API/DB/worker/cron/package changes beyond root package metadata, raw prototype fixture import, release gate updates or production action, stop and hand back to the coordinator.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-02-icon-shell-calibration.md`
  - `docs/evidence/M7/M7-UI-02-icon-shell-calibration.md`
  - `package.json`
  - `package-lock.json`
  - `apps/admin/src/primitives/**`
  - `apps/admin/src/patterns/**`
  - `apps/admin/src/shell/**`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
- 未列出的模块默认不可改。

## Change Budget / Path Classification

- Source changed files: <= 4
- Source net LOC: <= 350
- New source files: 0
- Test files changed: 1 focused existing Playwright spec
- Docs files changed: 2
- Dependency files changed: `package.json`, `package-lock.json`
- Generated files: 0
- Backend/API/DB/worker/cron/page migration/release gate changes: 0
- Exceptions: none expected. If source budget is exceeded, PR metadata must include `Exception:` with the reason.

## Dependency Basis

- Package: `lucide-react`
- Version: `1.23.0`
- Basis: npm registry metadata queried on 2026-07-03 returned latest `lucide-react@1.23.0`, license `ISC`, peer dependency `react: ^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0`, compatible with the repo's React 19 dev dependency.
- Reason allowed: `DESIGN.md`, `docs/admin-ui-prototype-migration-index.md`, `docs/admin-ui-token-foundation-contract.md` and `/Users/atilla/源码/unpacked 6/primitives/Icon.tsx` all establish Lucide as the single icon source for M7+ UI once icons are introduced. M7-UI-01 evidence records this as the dedicated follow-up.

## Preconditions

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-02-icon-shell-calibration/UZMAX智能运营`
- `git branch --show-current`: `codex/m7-ui-02-icon-shell-calibration`
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
- Required reads and entry evidence are recorded in `docs/evidence/M7/M7-UI-02-icon-shell-calibration.md`.

## Implementation Steps

1. Record entry evidence and required reads.
2. Add exact pinned `lucide-react@1.23.0` through npm lockfile/package metadata in the assigned worktree.
3. Extend `IconSlot` to render ReactNode/Lucide icons and keep the primitive as the single icon wrapper for shell/patterns.
4. Replace AppShell nav, collapse, search, notification and user-menu placeholder glyphs with stable Lucide icons mapped from the prototype and UZMAX IA.
5. Update focused Playwright assertions proving sidebar/topbar icons render as icon elements consistently and collapsed nav still fits.
6. Run required validations and record exact results.

## Pass Conditions

- `package.json` and `package-lock.json` include only the approved dependency addition.
- Sidebar/topbar/search/collapse shell icons no longer rely on random text marks.
- `IconSlot` accepts/render ReactNode icons and applies the shared Lucide wrapper/stroke behavior.
- Sidebar icons remain visible and consistent in collapsed `68px` mode.
- M7 foundation behavior and anchors remain unchanged.
- No old M2-M6 page source/CSS, backend/API/DB/worker/cron/packages, raw prototype files, runtime fixtures or release/production docs are touched.
- `git diff --check`, formatting, `guard:pr-shape`, typecheck, admin build and focused Playwright are attempted and recorded.

## Failure Branch

- If package install cannot run because npm is unavailable, record the exact tool failure and stop before hand-editing lockfile unless a registry-metadata-safe fallback is explicitly possible.
- If `lucide-react` introduces unsupported peer dependency conflicts, stop and report.
- If shell icon replacement requires page migration or old page CSS changes, stop and split a new spec.
- If edits land in root/main or outside the assigned worktree, stop and report for incident handling.

## Out Of Scope

- No page migration.
- No new source files.
- No raw prototype fixture/customer/order/contact sample import.
- No M2-M6 page source/CSS edits.
- No backend/API/DB/worker/cron/package changes beyond root package metadata and lockfile.
- No release gate, production, GA-0, real customer traffic, customer LLM or Telegram Business automatic reply changes.

## Validation List

- `git diff --check`
- Formatting on changed files only
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-02-icon-shell-calibration.md --include-worktree`
- `npm run typecheck`
- `npm run build:admin`
- Focused Playwright: `apps/admin/tests/m7-ui-foundation.spec.ts`
- PR-mode `guard:pr-shape` after PR body if possible

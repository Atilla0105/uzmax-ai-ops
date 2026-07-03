# M7-UI-02 Icon Shell Calibration Evidence

## Entry Evidence

- Worker path: `/Users/atilla/.codex/worktrees/m7-ui-02-icon-shell-calibration/UZMAX智能运营`
- Assigned branch: `codex/m7-ui-02-icon-shell-calibration`
- Forbidden root/main checkout: `/Users/atilla/Applications/UZMAX智能运营`
- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-02-icon-shell-calibration/UZMAX智能运营`
- `git status --short --branch`: `## codex/m7-ui-02-icon-shell-calibration...origin/main`
- `git branch --show-current`: `codex/m7-ui-02-icon-shell-calibration`
- Root/main clean check: `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch` returned `## main...origin/main`.
- Root/main SHA and `origin/main` SHA at dispatch: `2b49ed86fb5ec22413496f5919d545c03ca9e3f7`.
- `git branch --no-merged main`: no output at dispatch.
- `gh pr list --state open --limit 20`: unavailable locally because `gh` is not installed (`zsh:1: command not found: gh`).
- GitHub connector open PR availability: `_get_users_recent_prs_in_repo` for `Atilla0105/uzmax-ai-ops`, state `open`, limit `20` returned an empty list.
- `git worktree list --porcelain`: root/main worktree plus this assigned worktree only.

## Boundary Incident Note

- During the first spec/evidence creation attempt, `apply_patch` resolved relative paths against `/Users/atilla/Applications/UZMAX智能运营` and created two untracked files in root/main:
  - `docs/specs/M7-UI-02-icon-shell-calibration.md`
  - `docs/evidence/M7/M7-UI-02-icon-shell-calibration.md`
- Impact: untracked docs only; no source, package, lockfile, prototype, customer data, backend, DB, release gate or committed root/main changes.
- Immediate correction: deleted the two root/main untracked files I created and re-added the same files using absolute paths under the assigned worktree.
- Follow-up verification required before commit: root/main `git status --short --branch` must return `## main...origin/main` with no untracked files.

## Required Reads

- `AGENTS.md`
- `DESIGN.md`
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/impeccable/reference/product.md`
- `docs/specs/M7-05-prototype-visual-source-reset.md`
- `docs/specs/M7-UI-01-foundation-layer.md`
- `docs/evidence/M7/M7-UI-01-foundation-layer.md`
- `docs/admin-ui-prototype-migration-index.md`
- `docs/admin-ui-fixture-sanitization-map.md`
- `docs/admin-ui-token-foundation-contract.md`
- `package.json`
- `package-lock.json`
- `apps/admin/package.json`
- `apps/admin/src/primitives/index.tsx`
- `apps/admin/src/patterns/index.tsx`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- `/Users/atilla/源码/unpacked 6` read-only structure listing.
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TenantSwitcher.tsx`
- `/Users/atilla/源码/unpacked 6/primitives/Icon.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx`

## Baseline Findings

- M7-UI-01 intentionally left `lucide-react` as this follow-up slice. Its evidence says `IconSlot` placeholders should be replaced by real Lucide icons after dependency approval.
- Current repo `package.json` has React and Vite in root `devDependencies`; `apps/admin/package.json` has no separate dependency block.
- `package-lock.json` had no `lucide-react` package entry at dispatch.
- Existing `IconSlot` only accepts `text?: string` and renders text inside a bordered square.
- `SearchInput` uses `<IconSlot text="S" />`.
- `NavItem` accepts `icon?: IconSlotProps["text"]` and passes it to `IconSlot`.
- `AppShell` nav definitions use placeholder marks such as `总`, `对`, `工`, `AI`; collapse button uses `收`/`展`; notifications and user menu are disabled text buttons.
- Existing Playwright spec checks shell anchors, nav labels, collapse width `232 -> 68`, tenant switcher, state matrix and 320px fallback.
- Prototype shell uses `lucide-react` icons and an `Icon` wrapper with `strokeWidth = 1.75`, `currentColor`, `aria-hidden`, and nav icon size around `19`.
- Prototype nav icon mapping includes `LayoutDashboard`, `Cpu`, `Copy`, `Plug`, `Rocket`, `Building2`, `ScrollText`, `MessageSquare`, `ClipboardList`, `Inbox`, `Users`, `Package`, `BookOpen`, `Gauge`, `Bot`, `UsersRound`, `SlidersHorizontal`, `BarChart3`.
- Prototype topbar/collapse/search/user controls use `PanelLeftClose`, `Search`, `Bell`, `ChevronsUpDown` and user/avatar patterns.
- No raw prototype fixtures or sample row data are needed for this slice.

## Dependency Evidence

- Bundled node path exists: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`, version `v24.14.0`.
- The sibling bundled npm path requested by the coordinator does not exist in this runtime (`/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/npm`: no such file or directory).
- Available npm CLI candidate discovered outside root/main: `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/lib/node_modules/npm/bin/npm-cli.js`.
- Registry metadata query using bundled node `fetch("https://registry.npmjs.org/lucide-react/latest")` returned:
  - `version`: `1.23.0`
  - `license`: `ISC`
  - `peerDependencies.react`: `^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0`
  - `dist.tarball`: `https://registry.npmjs.org/lucide-react/-/lucide-react-1.23.0.tgz`
  - `dist.integrity`: `sha512-38BpJcD0JhFosxHApP/BYsBetLpQFRoTRzEzstM/XCc3jsAG7wqaY1lgVwxiUe3xqYE+lNxo2PkCmYwXWrwwIw==`
- Dependency update command:
  - `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/lib/node_modules/npm/bin/npm-cli.js install --save-dev --save-exact --package-lock-only lucide-react@1.23.0`
  - Result: passed. Output included `up to date, audited 382 packages in 2s` and `found 0 vulnerabilities`.

## Design Skill Layer Decisions

- Accepted: product-register restrained operational shell; icons should be consistent, task-serving and not decorative.
- Accepted: Lucide-only icon source for M7+ UI once introduced.
- Accepted: prototype `Icon` wrapper shape: currentColor, `aria-hidden`, shared stroke width `1.75`, no self-drawn SVG.
- Accepted with adaptation: keep the existing repo `IconSlot` primitive name and CSS hook, but make it render ReactNode/Lucide icons instead of forcing text glyphs.
- Accepted with adaptation: preserve v1.1 tenant IA order from M7-UI-01 while mapping each page to the closest prototype Lucide icon.
- Rejected: text glyph placeholder marks in sidebar/topbar/search/collapse controls.
- Rejected: raw fixture copy, page migration, old M2-M6 page CSS edits and release/production gate changes.

## Implementation Notes

- Added exact pinned `lucide-react@1.23.0` to root `devDependencies` and `package-lock.json`.
- Extended `IconSlot` in `apps/admin/src/primitives/index.tsx`:
  - exports `ICON_STROKE = 1.75`;
  - accepts Lucide component objects, function components, already-created React nodes and legacy text fallback;
  - renders Lucide/forwardRef components through `createElement`;
  - keeps `data-icon-slot` for focused shell assertions.
- Replaced `SearchInput` placeholder `S` with the Lucide `Search` icon.
- Updated `NavItem` in `apps/admin/src/patterns/index.tsx` to accept icon components/nodes instead of `IconSlotProps["text"]`.
- Replaced pattern state glyphs with Lucide icons:
  - `Inbox` for empty/default state;
  - `TriangleAlert` for degraded/error;
  - `Lock` for permission denied.
- Replaced AppShell nav `mark` text values with prototype/IA-aligned Lucide components:
  - Group: `LayoutDashboard`, `Cpu`, `Copy`, `Plug`, `Rocket`, `Building2`, `ScrollText`.
  - Tenant: `MessageSquare`, `ClipboardList`, `Users`, `Package`, `BookOpen`, `Inbox`, `Gauge`, `Bot`, `UsersRound`, `SlidersHorizontal`, `BarChart3`, `ScrollText`.
- Replaced collapse button icon with `PanelLeftClose`, rotated in collapsed mode.
- Replaced topbar disabled text-only notification/user controls with icon buttons using `Bell` and `UserCircle` while preserving accessible button names.
- Updated shell CSS so regular `IconSlot` renders naked currentColor Lucide icons, nav icons are `19px`, large state icons keep a framed 48px block and topbar icon buttons stay compact.
- Updated focused Playwright coverage to assert:
  - topbar search SVG is visible;
  - notification and user menu buttons render SVG icons and remain disabled;
  - collapse button renders SVG;
  - all 19 nav entries render SVG icons;
  - nav icon slots have empty text content;
  - collapsed `68px` nav still contains all icons inside the rail bounds.
- No raw prototype fixtures/sample rows were copied. `/Users/atilla/源码/unpacked 6` remained read-only.
- No old M2-M6 page source/CSS, backend/API/DB/worker/cron/package directories or release/production docs were touched.

## Files Changed

- `docs/specs/M7-UI-02-icon-shell-calibration.md`
  - Added this feature spec, exact touch list, budget and dependency basis.
- `docs/evidence/M7/M7-UI-02-icon-shell-calibration.md`
  - Added entry/read/dependency/design/implementation/validation evidence.
- `package.json`
  - Added `lucide-react: 1.23.0` as an exact root dev dependency, consistent with existing private admin build dependency placement.
- `package-lock.json`
  - Added `node_modules/lucide-react` lock entry with npm registry integrity and React peer range.
- `apps/admin/src/primitives/index.tsx`
  - Added Lucide-capable `IconSlot`, `ICON_STROKE`, and Lucide search icon wiring.
- `apps/admin/src/patterns/index.tsx`
  - Updated `NavItem`, `EmptyState`, `PageState` and `DegradedBar` icon inputs to Lucide/ReactNode icons.
- `apps/admin/src/shell/AppShell.tsx`
  - Replaced sidebar/topbar/collapse placeholder glyphs with Lucide icons.
- `apps/admin/src/shell/AppShell.css`
  - Calibrated icon slot rendering, nav icon size, collapse rotation and compact topbar icon buttons.
- `apps/admin/tests/m7-ui-foundation.spec.ts`
  - Added focused SVG/icon consistency and collapsed-fit assertions without removing existing checks.

Budget notes:

- Source changed files: 4 (`primitives`, `patterns`, `AppShell.tsx`, `AppShell.css`) / target <= 4.
- New source files: 0 / target 0.
- Test changed files: 1 existing Playwright spec.
- Dependency files: 2 (`package.json`, `package-lock.json`) reported separately.
- Guard output reports source `changedFiles=4`, `newFiles=0`, `netLoc=0`.
- `git diff --numstat` before evidence update for source/test/dependency files:
  - `apps/admin/src/patterns/index.tsx`: `+14/-13`
  - `apps/admin/src/primitives/index.tsx`: `+43/-4`
  - `apps/admin/src/shell/AppShell.css`: `+33/-6`
  - `apps/admin/src/shell/AppShell.tsx`: `+50/-26`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`: `+36/-0`
  - `package-lock.json`: `+11/-0`
  - `package.json`: `+1/-0`
  - No `Exception:` needed.

## Validation Results

- `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch`
  - Result after boundary cleanup: passed, `## main...origin/main`.
- Dependency install for lockfile only:
  - Command: `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/lib/node_modules/npm/bin/npm-cli.js install --save-dev --save-exact --package-lock-only lucide-react@1.23.0`
  - Result: passed. Output included `up to date, audited 382 packages in 2s`, `found 0 vulnerabilities`.
- Worktree dependency install:
  - Command: `PATH="/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/lib/node_modules/npm/bin/npm-cli.js ci`
  - Result: passed. Output included `added 361 packages, and audited 382 packages in 8s`, `found 0 vulnerabilities`.
- Formatting on changed files only:
  - Command shape: `{ git diff --name-only --diff-filter=ACMRT HEAD; git ls-files --others --exclude-standard; } | sort -u | xargs /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/prettier/bin/prettier.cjs --check`
  - Result: passed. Output: `Checking formatting...` and `All matched files use Prettier code style!`.
- `git diff --check`
  - Result: passed, no output.
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-02-icon-shell-calibration.md --include-worktree`
  - Result: passed.
  - Output:
    - `specType`: `feature`
    - `changedFiles`: `9`
    - `categories`: `source=4`, `test=1`, `lock=1`, `config=1`, `docs=2`
    - `source.changedFiles`: `4`
    - `source.netLoc`: `0`
    - `source.newFiles`: `0`
- PR-mode metadata simulation after PR body update:
  - Setup: temporary `/tmp` GitHub event JSON with PR body fields `Spec ID: M7-UI-02-icon-shell-calibration`, `Spec file: docs/specs/M7-UI-02-icon-shell-calibration.md`, `Exception: none`; no repo file was written.
  - Command: `GITHUB_EVENT_PATH=<tmp_event> /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-02-icon-shell-calibration.md`
  - Result: passed.
  - Output:
    - `specType`: `feature`
    - `changedFiles`: `9`
    - `categories`: `source=4`, `test=1`, `docs=2`, `lock=1`, `config=1`
    - `source.changedFiles`: `4`
    - `source.netLoc`: `91`
    - `source.newFiles`: `0`
- `npm run typecheck`
  - First result: failed with `apps/admin/src/primitives/index.tsx(59,7): error TS2322: Type ... LucideIcon ... is not assignable to type 'ReactNode'.`
  - Fix: made `renderedIcon` an explicit `ReactNode` and rendered component inputs through a narrowed branch.
  - Final result: passed.
- `npm run build:admin`
  - Result: passed.
  - Output included `vite v8.0.16 building client environment for production...`, `1810 modules transformed`, `apps/admin/dist/assets/index-CHPoz_FZ.js 301.21 kB | gzip: 89.01 kB`, `built in 94ms`.
- Focused Playwright: `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-foundation.spec.ts`
  - First result: failed before tests because `playwright.config.ts` webServer command could not find `npm`: `/bin/sh: npm: command not found`, exit code `127`.
  - Retry setup: added `/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin` to `PATH` so config webServer can resolve `npm` and `npx`.
  - Second result: failed because the first `IconSlot` implementation treated Lucide forwardRef component objects as ReactNode and React raised minified error #31: `object with keys {$$typeof, render, displayName}`.
  - Fix: `IconSlot` now detects Lucide/forwardRef component objects and uses `createElement`.
  - Final result: passed, `2 passed (2.0s)`.
- Placeholder search:
  - Command: `rg -n 'IconSlot text|text="S"|mark:|收|展|>Notifications<|>User menu<' apps/admin/src/primitives/index.tsx apps/admin/src/patterns/index.tsx apps/admin/src/shell/AppShell.tsx apps/admin/src/shell/AppShell.css apps/admin/tests/m7-ui-foundation.spec.ts`
  - Result: no shell/icon placeholder matches except visible collapse labels `收起导航` / `展开`, which are preserved UI labels rather than icon glyphs.

## Follow-Ups / Blockers

- No implementation blockers remain for this slice.

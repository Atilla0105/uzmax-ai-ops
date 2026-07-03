# M7-UI-00 Prototype Migration Index Evidence

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/.codex/worktrees/m7-ui-00-prototype-migration-index/UZMAX智能运营` |
| worker branch | `codex/m7-ui-00-prototype-migration-index` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-00-prototype-migration-index/UZMAX智能运营` |
| entry `git status --short --branch` | `## codex/m7-ui-00-prototype-migration-index` |
| entry `git branch --show-current` | `codex/m7-ui-00-prototype-migration-index` |

## Sources Read

| Source | Use |
|---|---|
| `AGENTS.md` | Source-of-truth priority, Design Skill Layer boundary, workspace isolation and touch-list governance. |
| `docs/specs/M7-05-prototype-visual-source-reset.md` | Confirms owner prototype and `unpacked 6` are the M7+ visual source; no runtime code in M7-05. |
| `docs/evidence/M7/M7-05-prototype-visual-source-reset.md` | Confirms M7-05 boundary, I-05 remains open and legacy `--uzmax-*` is not the new visual source. |
| `.agents/skills/impeccable/SKILL.md` and `.agents/skills/impeccable/reference/product.md` | Product UI register and required design context flow. |
| `PRODUCT.md` / `DESIGN.md` | Current design operating brief and M7+ visual hierarchy. |
| `docs/admin-design-system.md` | Prototype-derived token/component/state contract. |
| `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` | v1.1 admin IA, workflow boundaries and quality requirements. |
| `apps/admin/**` | Current legacy shell, ApiClient contracts, tests and absence of primitives/patterns/pages layers. |
| `packages/ui-tokens/**` | Current legacy bridge token package shape. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Owner HTML visual source, inspected structurally only. |
| `/Users/atilla/源码/unpacked 6/**` | Frozen structured source package, inspected read-only. |

## Command Log

| Command | Result |
|---|---|
| `pwd && git status --short --branch && git branch --show-current` | Passed; path and branch matched assignment. |
| `node .agents/skills/impeccable/scripts/context.mjs --target apps/admin` | Initial attempt failed because `node` was not in PATH. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/context.mjs --target apps/admin` | Passed; resolved register `product` and required reading `reference/product.md`. |
| `find apps/admin packages/ui-tokens -maxdepth 5 -type f` | Confirmed current admin files are M2-M6 shells/API clients/tests; no `src/primitives`, `src/patterns` or `src/pages` directories exist. |
| `sed -n ... docs/admin-design-system.md`, `DESIGN.md`, v1.1 backend design | Confirmed prototype-derived visual source, token values, AppShell layout and state requirements. |
| `ls -la`, `file`, `wc` on owner HTML and `unpacked 6` | HTML is UTF-8 bundled page, 1,239,803 bytes, 181 very-long-line rows. `unpacked 6` contains 93 files and 21 directories. |
| `find '/Users/atilla/源码/unpacked 6' -maxdepth 4 -type f` | Confirmed structured directories: `ui-tokens`, `primitives`, `patterns`, `shell`, `pages`, `hooks`, `fixtures`, `App.tsx`, `README.md`. |
| `wc -l` over `unpacked 6` TS/CSS/MD | 9,480 total lines across source-shaped files. |
| `rg '^import|export function|export const'` over `unpacked 6` | Confirmed dependency shape: tokens -> primitives -> patterns -> shell/pages; pages also depend on hooks and fixtures. |
| `git branch --no-merged main` | Local output listed `codex/m7-05-prototype-visual-source-reset`, current `codex/m7-ui-00-prototype-migration-index`, `codex/m7-ui-01-fixture-sanitization-map`, `codex/m7-ui-02-token-foundation-contract`. |
| `gh pr list --state open` | Could not run; `gh` is not installed/in PATH in this shell. |
| `git diff --check` | Passed with no output. Note: files are untracked, so this command alone does not inspect their contents. |
| `git diff --check --no-index /dev/null <new-file>` for each new file | Passed for the three added docs files; no whitespace errors. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base codex/m7-05-prototype-visual-source-reset --spec docs/specs/M7-UI-00-prototype-migration-index.md --include-worktree` | Passed. Reported `changedFiles: 3`, category `docs: 3`, source changed files `0`, source net LOC `0`, new source files `0`. |

## Key Findings

### Current Repo

- `apps/admin/src/App.tsx` is still the legacy M2-M6 admin shell assembly.
- Existing runtime/API anchors include `confirmationQueueApiClient`, `customerAssetApiClient`, `orderImportApiClient`, `aiMemberRuntimeApiClient`, `logsAnalyticsApiClient` and template copy contracts.
- `apps/admin/src/primitives`, `apps/admin/src/patterns` and `apps/admin/src/pages` do not exist yet.
- `packages/ui-tokens/src/tokens.css` still exposes only the old `--uzmax-*` bridge namespace; `packages/ui-tokens/src/index.ts` only exports `tokenPackage`.

### Prototype Inputs

- Owner HTML is a bundled visual source and should be used for visual comparison, not committed or quoted in large blocks.
- `/Users/atilla/源码/unpacked 6` is already source-shaped:
  - `ui-tokens`: CSS and TS token exports.
  - `primitives`: 14 primitive components plus CSS.
  - `patterns`: 12 reusable patterns.
  - `shell`: AppShell, rail, topbar, tenant switcher and navigation definitions.
  - `pages`: 19 pages aligned broadly to group and tenant layers.
  - `hooks`: local state machines.
  - `fixtures`: demo data.
- Hooks and fixtures are useful for understanding intended interaction but are not production wiring. Page migration must replace them with existing repo ApiClient/hook contracts and permission/evidence states.
- `unpacked 6/README.md` says files can be moved into the repo, but AGENTS/M7-05 governance requires adaptation, scope specs and evidence before implementation.

## Deliverables

| File | Result |
|---|---|
| `docs/specs/M7-UI-00-prototype-migration-index.md` | Added docs-only worker spec. |
| `docs/admin-ui-prototype-migration-index.md` | Added migration index with directory mapping, component graph, page inventory, slice recommendations and direct/adapt/forbid boundaries. |
| `docs/evidence/M7/M7-UI-00-prototype-migration-index.md` | Added this evidence file. |

## Boundary

This slice does not:

- modify `apps/admin/**`, `packages/ui-tokens/**`, source, tests, config, generated files, package files or lockfiles;
- modify, move, format or write `/Users/atilla/源码/unpacked 6`;
- copy raw HTML, screenshots, fixtures, customer/order/contact/account values, raw prompt/completion, secrets or provider keys;
- approve GA-0, production, customer LLM, real traffic, Telegram Business automatic reply or 1.0 release;
- commit, push, merge or open a PR.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git status --short --branch` | pass | Only the three allowed files are untracked on `codex/m7-ui-00-prototype-migration-index`. |
| `git diff --check` | pass | No output. Because this docs slice added untracked files, a no-index check was also run. |
| `git diff --check --no-index /dev/null docs/specs/M7-UI-00-prototype-migration-index.md` | pass | No whitespace errors. |
| `git diff --check --no-index /dev/null docs/evidence/M7/M7-UI-00-prototype-migration-index.md` | pass | No whitespace errors. |
| `git diff --check --no-index /dev/null docs/admin-ui-prototype-migration-index.md` | pass | No whitespace errors. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base codex/m7-05-prototype-visual-source-reset --spec docs/specs/M7-UI-00-prototype-migration-index.md --include-worktree` | pass | `changedFiles: 3`; `docs: 3`; source changed files `0`; source net LOC `0`; new source files `0`. |

## Open Items

- `gh` is unavailable locally, so open PR state cannot be verified from this worker shell.
- `git branch --no-merged main` shows other M7 UI worker branches; coordinator must reconcile their PR/open/superseded state.
- Implementation decisions for `packages/ui-tokens` TS exports, AppShell target path and `lucide-react` dependency must be handled by later implementation specs.

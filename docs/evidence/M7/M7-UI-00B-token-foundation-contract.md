# M7-UI-00B Token Foundation Contract Evidence

## Entry State

| Fact | Evidence |
|---|---|
| worker worktree | `/Users/atilla/.codex/worktrees/m7-ui-02-token-foundation-contract/UZMAX智能运营` |
| worker branch | `codex/m7-ui-00b-token-foundation-contract` |
| `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-02-token-foundation-contract/UZMAX智能运营` |
| `git status --short --branch` at start | `## codex/m7-ui-00b-token-foundation-contract` |
| `git branch --show-current` | `codex/m7-ui-00b-token-foundation-contract` |

## Required Reads

| Source | Use |
|---|---|
| `AGENTS.md` | source-of-truth, M7 visual source priority, Design Skill Layer, worktree and write-boundary rules |
| `docs/specs/M7-05-prototype-visual-source-reset.md` | prototype-first source reset and out-of-scope boundaries |
| `docs/evidence/M7/M7-05-prototype-visual-source-reset.md` | M7-05 updated source/boundary evidence |
| `docs/admin-design-system.md` | current design-system contract and developer guidelines |
| `packages/ui-tokens/src/tokens.css` | current legacy `--uzmax-*` implementation bridge |
| `apps/admin/src`, `apps/admin/package.json`, root `package.json` | current admin structure and scripts/tests |
| v1.1 PRD / architecture / admin design / acceptance matrix | product scope, admin IA, permission/RLS/release and I-05 constraints |
| `.agents/skills/impeccable/SKILL.md`, `reference/product.md` | Design Skill Layer setup and product register rules |
| `/Users/atilla/Downloads/运营塔台1.0.html` | current rendered owner source |
| `/Users/atilla/源码/unpacked 6` | frozen prototype-derived source package |

Impeccable context loader was first attempted with `node` and failed because `node` was not in shell PATH. It was then successfully run with bundled Node:

```bash
/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/context.mjs --target apps/admin
```

The loader resolved `PRODUCT.md` / `DESIGN.md` and required product register context.

## Scan Commands

| Command | Result |
|---|---|
| `find apps/admin/src -maxdepth 3 -type f \| sort` | Current admin has flat milestone shell files and page-local CSS; no `primitives/`, `patterns/` or `shell/` directories. |
| `sed -n '1,220p' apps/admin/package.json` and root `package.json` | Admin workspace only exposes `build` and `start`; root validation uses Node-based guards, tests, build and Playwright. |
| `rg -n "import .*\\.css\|@uzmax/ui-tokens\|tokens.css\|--uzmax" apps/admin/src packages/ui-tokens/src` | `App.tsx` imports `@uzmax/ui-tokens/tokens.css`; many existing CSS files consume `--uzmax-*`; current package only exports `tokens.css`. |
| `ls -la /Users/atilla/Downloads/运营塔台1.0.html && wc -l ...` | HTML exists, large bundled file; treated as rendered source, not copied. |
| `find /Users/atilla/源码/'unpacked 6' -maxdepth 3 -type f` | Mother source contains `ui-tokens/`, `primitives/`, `patterns/`, `shell/`, `pages/`, `fixtures/`, `hooks/` and `App.tsx`. |
| `sed -n '1,140p' /Users/atilla/源码/'unpacked 6'/README.md` | README maps source layers to repo destinations and says visual truth remains the current `.dc.html`; pages must not use naked styles. |
| `sed -n '1,140p' /Users/atilla/源码/'unpacked 6'/ui-tokens/tokens.css` | Source CSS defines canonical prototype token set, keyframes and canvas baseline. |
| `sed -n '1,150p' /Users/atilla/源码/'unpacked 6'/ui-tokens/tokens.ts` | Source TS exports color, space, radius, shadow, motion, z, opacity, font, type and layout tokens. |
| `sed` reads of `primitives`, `patterns`, `shell` files | Confirmed reusable Button/Input/PageState/EmptyState/ConfirmModal/DataTable/AppShell/NavSidebar/TopBar/TenantSwitcher contracts. |
| `rg -n "customer\|phone\|telegram\|token\|secret\|api[_-]?key\|订单\|客户\|电话\|TG\|username" /Users/atilla/Downloads/运营塔台1.0.html /Users/atilla/源码/'unpacked 6'` | Found prototype fixture/customer/order/contact-like sample values. None were copied into docs beyond abstract file-category mentions. |
| `git branch --no-merged main` | Showed current worker plus other M7 worker branches. No cleanup performed by this worker. |
| `gh pr list --state open` | Failed: `gh` command unavailable in local shell. Open PR audit is limited to this recorded failure. |

## Key Findings

| Area | Finding |
|---|---|
| Current repo token package | `packages/ui-tokens/src/tokens.css` has only legacy `--uzmax-*` variables and mono font; no canonical CSS/TS token export yet. |
| Current admin structure | `apps/admin/src` is flat milestone shell files plus page-local CSS. There is no shared `primitives/`, `patterns/` or `shell/` layer yet. |
| Source package shape | `unpacked 6` already provides the intended layer split: `ui-tokens`, `primitives`, `patterns`, `shell`, `pages`, `hooks`, `fixtures`. |
| Token mismatch | Current docs/package retain 4px legacy scale in places; `unpacked 6` uses a 2px operational scale `--s-1..--s-10`. Contract recommends prototype scale for implementation and doc-sync evidence. |
| Color/state | Source adds missing hover/border/background pairs such as human hover/border, AI border and data accent strong/bg. |
| Motion | Source centralizes `120ms`, `160ms`, `ease`, `1800ms`, `uzpulse` and `uzspin`; no decorative animation contract. |
| Component chrome | Source uses compact 7px buttons, 8px inputs, 9/10px dropdowns/cards, 12px overlays; legacy shell side stripes remain current-source debt, not a future pattern. |
| Sensitive fixture boundary | `unpacked 6/fixtures` includes realistic-looking customer/order/contact values. They are not implementation tokens and must not be copied into repo docs or tests. |

## Recommended Implementation Scope

| Scope | Recommendation |
|---|---|
| First foundation worker | Implement `packages/ui-tokens + apps/admin/src/primitives + apps/admin/src/patterns + apps/admin/src/shell/AppShell` before any page worker. |
| Token package | Add canonical CSS tokens and TS exports; keep `--uzmax-*` only as compatibility aliases or legacy values for untouched shell. |
| Admin primitives | Button, Icon, StatusBadge, Avatar, Toggle, Input/SearchInput/Select/Textarea, Chip, Kbd, Checkbox, SlaCountdown, CountBadge, Heartbeat. |
| Admin patterns | NavItem, Tabs, MessageBubble, DataTable, ConfirmModal, Dropdown, BatchBar, EmptyState, MetricCard/MetricCell, DegradedBar, Toast, PageState. |
| AppShell | NavSidebar, TopBar, TenantSwitcher, environment marker, heartbeat, route outlet; do not migrate page content in the same slice unless spec explicitly allows. |
| Page workers | Wait for foundation merge and evidence; then migrate one bounded surface per spec, consuming shared primitives/patterns only. |

## Boundary / Non-Changes

This worker did not:

- modify `packages/ui-tokens/**`, `apps/admin/**`, README, shared indexes, `docs/admin-design-system.md`, raw HTML or `/Users/atilla/源码/unpacked 6`;
- add dependencies, lockfiles, Storybook, `/design`, Playwright tests or screenshots;
- copy raw customer/order/contact fixture values;
- submit, push, merge or open a PR.

Local tooling note: a `pnpm node --version` attempt incorrectly generated untracked `pnpm-lock.yaml` and ignored `node_modules/`. Both were removed immediately; tracked `package-lock.json` was not modified. `git status --short --branch` returned clean before docs edits.

Patch target note: the first `apply_patch` wrote the three M7-UI-00B docs into the root/main checkout because the patch tool defaulted to the thread cwd. The three files were moved into the assigned worker worktree, root/main returned clean, and the final docs were patched by absolute worker paths. No unrelated root files were changed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors after intent-to-add coverage of the three new docs files. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base codex/m7-05-prototype-visual-source-reset --spec docs/specs/M7-UI-00B-token-foundation-contract.md --include-worktree` | pass | Reported `changedFiles: 3`, categories `docs: 3`, source changed files `0`, source net LOC `0`, new source files `0`. |

## Open Items

- `gh` is unavailable locally, so open PR audit could not be performed with GitHub CLI.
- Coordinator should decide whether foundation implementation may update `docs/admin-design-system.md` for the 2px spacing contract mismatch or must split that into another docs spec.
- Coordinator should decide whether `lucide-react` dependency addition belongs in the foundation implementation budget.
- This contract does not close I-05; implementation, preview/visual regression, lint and core-screen evidence remain future work.

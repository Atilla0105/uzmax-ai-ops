# M7-UI-04 Shared Operational Patterns Evidence

## Status

- Worker branch: `codex/m7-ui-04-shared-operational-patterns`
- Worker path: `/Users/atilla/.codex/worktrees/m7-ui-04-shared-operational-patterns`
- Base confirmed: `main` at `b9ede1f50d5875f27ad6aca66f9cde8ce183ba90`
- Scope: shared operational patterns only; no page migration, runtime API/hook wiring, token mutation or raw prototype fixture copy.
- Page worker boundary: M7-UI-04A+ page workers remain blocked until this shared-pattern PR is merged.
- PR hygiene note: this worker proposes `large_change_exception` for owner/coordinator review because the committed source diff includes eight shared patterns, accessibility remediation and `/design` preview CSS. After the quality-review fixes, committed net source LOC is 1043; this exceeds the default repo guard budget of 600 and the earlier branch target of <= 1000. Merge requires PR metadata `Exception: large_change_exception` plus owner/coordinator approval; this worker does not self-approve that exception.

## Entry / Workspace Evidence

```text
pwd
/Users/atilla/.codex/worktrees/m7-ui-04-shared-operational-patterns

git status --short --branch
## codex/m7-ui-04-shared-operational-patterns

git branch --show-current
codex/m7-ui-04-shared-operational-patterns

not root/main checkout
CONFIRMED_NOT_ROOT_MAIN_CHECKOUT
```

Root/main cleanliness at entry and during implementation:

```text
cwd=/Users/atilla/Applications/UZMAX智能运营
git status --short --branch
## main...origin/main
```

## Required Reads

- `AGENTS.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/specs/M7-UI-03-page-migration-ledger-and-router.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/primitives/index.tsx`
- `apps/admin/src/patterns/index.tsx`
- `apps/admin/src/shell/FoundationPreview.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- `apps/admin/tests/m7-ui-page-router.spec.ts`
- `/Users/atilla/源码/unpacked 6/patterns/DataTable.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/MessageBubble.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/ConfirmModal.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/Toast.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/BatchBar.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/Dropdown.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/DegradedBar.tsx`
- `/Users/atilla/源码/unpacked 6/patterns/index.ts`

Impeccable / design-skill setup:

- Read `.agents/skills/impeccable/SKILL.md`.
- Ran `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/impeccable/scripts/context.mjs --target apps/admin`.
- Read `.agents/skills/impeccable/reference/product.md`.
- Adopted product-register guidance: restrained product UI, dense operational controls, familiar affordances, no decorative motion or nonstandard modal behavior.

## `rg` Search Conclusions

Searches before adding source files:

- `rg -n "DataTable|FilterBar|PageToolbar|SidePanel|MessageBubble|ConfirmModal|ToastHost|useToast|BatchAction|BatchBar|DegradedBar" apps/admin/src apps/admin/tests docs`
  - Existing repo implementation had `NavItem`, `Tabs`, `EmptyState`, `PageState` and `DegradedBar` in `apps/admin/src/patterns/index.tsx`.
  - Desired M7-UI operational patterns were listed in docs/contracts, but not implemented as repo patterns except `DegradedBar`.
  - Conclusion: add new shared pattern source under `apps/admin/src/patterns/**` and keep `DegradedBar` in place.
- `rg -n "uz-data|uz-filter|uz-page-toolbar|uz-side-panel|uz-message|uz-confirm|uz-toast|uz-batch" apps/admin/src apps/admin/tests docs`
  - No existing production classes for these pattern families.
  - Conclusion: scoped `uz-*` pattern classes are new and belong to this slice.
- `rg -n -- "--ink-|--state-|--accent-|--paper|--card|--s-|--radius|--duration|--easing|--uzmax" packages/ui-tokens apps/admin/src`
  - Canonical tokens exist in `packages/ui-tokens/src/tokens.css`.
  - Existing `--uzmax-*` usage remains legacy M2-M6 shell debt in untouched files.
  - Conclusion: consume canonical tokens in changed CSS; do not touch `packages/ui-tokens/**`.
- Post-implementation scan over changed source found no new raw hex, no old `--uzmax-*`, no `border-left` side stripe and no stale deleted module imports in the changed M7-UI-04 files.

## Prototype-to-Repo Mapping

| Prototype source | Repo pattern | Decision |
|---|---|---|
| `patterns/DataTable.tsx` | `DataTable` in `apps/admin/src/patterns/data-table.tsx` | Adopt anatomy: stable columns, compact density, optional selection, empty state. Replace inline styles/raw literals with classes and canonical tokens. |
| `patterns/MessageBubble.tsx` | `MessageBubble` in `apps/admin/src/patterns/feedback-patterns.tsx` | Adopt role variants: system/customer/AI/human. Use token classes and generic synthetic preview copy only. |
| `patterns/ConfirmModal.tsx` | `ConfirmModal` in `apps/admin/src/patterns/confirm-modal.tsx` | Adopt confirmation + optional reason field; keep button affordances primitive-based and gate/destructive copy explicit. |
| `patterns/Toast.tsx` | `useToast` + `ToastHost` | Adopt minimal host/hook shape. Toast is feedback only, not audit evidence. |
| `patterns/BatchBar.tsx` | `BatchActionBar` | Adopt selected-count + actions pattern. Use `Button` primitives and no inline raw colors. |
| `patterns/Dropdown.tsx` | Not implemented in this slice | Rejected for now because owner-required list names `FilterBar`; dropdown behavior can be added by a later spec if needed. |
| `patterns/DegradedBar.tsx` | Existing `DegradedBar` retained | Preserved shared degraded-state pattern from M7-UI-01; preview adds an operational anchor without replacing it. |

## Adopt / Reject Notes

Adopted:

- Impeccable/product guidance for dense, restrained, task-first product UI.
- Prototype structure for table density, message roles, confirmation reason, toast feedback and batch selection.
- Existing primitives: `Button`, `IconSlot`, `SearchInput`, `StatusBadge`, `Kbd`, `Checkbox`, `Avatar`.
- Lucide icons through `IconSlot` for close/toast/status affordances.
- Canonical `--ink-*`, `--state-*`, `--accent-*`, `--paper`, `--card`, spacing, radius, shadow, z-index and motion tokens.

Rejected:

- Prototype inline styles and raw color literals.
- Side stripes / thick `border-left` row or card accents.
- Raw fixture/customer/order/contact samples from prototype files.
- Old shell or `--uzmax-*` token vocabulary as a visual source for new M7+ patterns.
- Runtime API/hook wiring or any claim that planned pages are migrated.
- Dropdown extraction in this slice, because the required shared control is `FilterBar` and page workers are still blocked.

## Implementation Summary

- Added typed generic `DataTable` with column definitions, optional selection, density and empty-state support.
- Added `FilterBar`, `PageToolbar`, `SidePanel`, `MessageBubble`, `ConfirmModal`, `ToastHost`/`useToast` and `BatchActionBar` exports from `apps/admin/src/patterns`.
- Updated `FoundationPreview` to render an operational patterns preview with stable `data-testid` anchors.
- Added focused Playwright coverage in `apps/admin/tests/m7-ui-patterns.spec.ts`.
- Updated M7 evidence index to show UI-03 merged on this base, UI-04 implemented in worker and UI-04A+ blocked until UI-04 merge.

## Quality Review Fixes

- `ConfirmModal` now wires `aria-labelledby` and conditional `aria-describedby`, focuses the required reason textarea or first dialog control when opened, traps Tab/Shift+Tab within the dialog, closes on Escape, restores focus to the previously focused element on close/unmount and marks required reason textareas with both `required` and `aria-required`.
- `DataTable` no longer uses row-level mouse click activation. It exposes an explicit typed `rowAction` cell button with accessible per-row labels and keyboard activation; row selection checkbox clicks only toggle selection.
- `DataTable` disables the select-all checkbox and labels it `Select all rows unavailable` when `selection.onToggleAll` is absent, so the shared pattern no longer renders an enabled no-op bulk control.
- `useToast` now uses a monotonic `useRef` counter for toast IDs instead of `Date.now()`, and `ToastHost` exposes each generated ID for non-timing Playwright coverage.
- `apps/admin/tests/m7-ui-patterns.spec.ts` now covers dialog accessible name/description, required reason field, focus trap, Escape close with focus return, keyboard row action, row checkbox non-activation, select-all state changes and distinct stacked toast IDs.

## Validation

Source budget caveat:

- Current committed branch source numstat after quality fixes:
  - `140  0  apps/admin/src/patterns/confirm-modal.tsx`
  - `140  0  apps/admin/src/patterns/data-table.tsx`
  - `91   0  apps/admin/src/patterns/feedback-patterns.tsx`
  - `29   0  apps/admin/src/patterns/index.tsx`
  - `145  0  apps/admin/src/patterns/operational-patterns.tsx`
  - `350  0  apps/admin/src/shell/AppShell.css`
  - `232  84 apps/admin/src/shell/FoundationPreview.tsx`
- Current committed branch net source LOC: 1043.
- Default repo guard budget: net source LOC <= 600.
- Earlier branch target: net source LOC <= 1000; quality-review remediation pushed the branch above that target.
- Therefore the branch intentionally fails local `pr-shape --include-worktree` with `net source LOC 1043 > 600` unless PR metadata declares `Exception: large_change_exception`. The overage, including the post-review increase above 1000, requires owner/coordinator approval before merge; this worker does not self-approve it.

Quality-review validation rerun after source/test commit `4681b58`:

```text
git diff --check
EXIT:0
```

```text
git diff --check main...HEAD
EXIT:0
```

```text
rg -n -- "#[0-9a-fA-F]{3,8}|--uzmax|border-left|\.skip\(|\.only\(|\bxit\(|\bxfail\(" apps/admin/src/patterns apps/admin/src/shell/FoundationPreview.tsx apps/admin/src/shell/AppShell.css apps/admin/tests/m7-ui-patterns.spec.ts || true
(no output)
EXIT:0
```

```text
/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-04-shared-operational-patterns.md --include-worktree
guard:pr-shape failed:
net source LOC 1043 > 600
EXIT:1
```

```text
git status --short --branch
## codex/m7-ui-04-shared-operational-patterns
```

```text
cwd=/Users/atilla/Applications/UZMAX智能运营
git status --short --branch
## main...origin/main
```

Isolated worktree tooling availability remains unchanged from the implementation commit:

```text
test -d node_modules && echo NODE_MODULES_PRESENT || echo NODE_MODULES_ABSENT
NODE_MODULES_ABSENT

test -d apps/admin/node_modules && echo ADMIN_NODE_MODULES_PRESENT || echo ADMIN_NODE_MODULES_ABSENT
ADMIN_NODE_MODULES_ABSENT

command -v npm
no output

/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/npm --version
zsh:1: no such file or directory: /Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/npm
```

Unavailable validations, all with the same isolated-tooling failure:

```text
npm run format:check
zsh:1: command not found: npm

npm run typecheck
zsh:1: command not found: npm

npm run lint
zsh:1: command not found: npm

npm run build
zsh:1: command not found: npm

npm run playwright -- apps/admin/tests/m7-ui-patterns.spec.ts
zsh:1: command not found: npm
```

`gh pr list --state open --limit 20 --json number,headRefName,title` was unavailable in this worktree shell:

```text
zsh:1: command not found: gh
```

## Root/Main Cleanliness

```text
cwd=/Users/atilla/Applications/UZMAX智能运营
git status --short --branch
## main...origin/main
```

No edits were made to `/Users/atilla/Applications/UZMAX智能运营`.

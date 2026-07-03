# M7-UI-04 Shared Operational Patterns

## Goal

Implement the second M7 page-migration start gate: shared operational patterns that page workers must reuse before any page body is migrated. This slice creates typed, token-consuming admin patterns for dense tables/lists, filters, page toolbars, side panels, conversation bubbles, confirmation modals, toasts, degraded state and batch actions.

This is not page migration. Page workers remain blocked until this PR is merged and the shared pattern evidence is available on `main`.

## Owner Confirmation Points

- Owner assigned this worker as `M7-UI-04-shared-operational-patterns`.
- Work must happen only in `/Users/atilla/.codex/worktrees/m7-ui-04-shared-operational-patterns` on branch `codex/m7-ui-04-shared-operational-patterns`.
- `/Users/atilla/Applications/UZMAX智能运营` root/main is forbidden for edits.
- This slice may create shared operational patterns and a `/design` preview only; it may not migrate pages, wire runtime APIs/hooks, copy raw prototype fixtures, edit route scaffolding, or modify tokens.
- Tokens are consumed, not modified. If canonical tokens are insufficient, stop and ask for a separate token spec.

## AI Agent Responsibilities

- Create this spec before implementation edits.
- Read `AGENTS.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md`, M7-UI-03 spec/evidence index, current primitives/patterns/shell/tests and the read-only prototype pattern sources.
- Run `rg` before adding source files and record whether existing files already provide these operational patterns.
- Use existing primitives and canonical CSS variables through pattern classes; do not introduce old `--uzmax-*`, page-local raw hex, side stripes, raw fixture/customer/order samples, backend/API hooks or page migration claims.
- Preserve M7-UI-03 router and legacy evidence route behavior.
- Record Impeccable/design audit adoption and rejection notes.
- Record validation results honestly, including unavailable isolated-worktree tooling.

## Timebox

0.5 workday. If the work requires page migration, `apps/admin/src/App.tsx`, `apps/admin/src/pages/**`, `apps/admin/src/shell/AppShell.tsx`, `packages/ui-tokens/**`, package/lockfile edits, backend/API/DB/worker/cron/CI edits, raw prototype edits, runtime API wiring, dependency installation that mutates package files, production/release action or owner release decision, stop and report to coordinator.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-04-shared-operational-patterns.md`
  - `docs/evidence/M7/M7-UI-04-shared-operational-patterns.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/patterns/**`
  - `apps/admin/src/shell/FoundationPreview.tsx`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/tests/m7-ui-patterns.spec.ts`
- 未列出的模块默认不可改。

## Change Budget / Path Classification

- Source changed files: <= 8 after extracting the operational preview from `FoundationPreview.tsx` into `apps/admin/src/patterns/operational-patterns-preview.tsx` for lint max-lines compliance.
- Source net LOC: lint-remediation refactor raised the committed branch to 1213 net source LOC. This exceeds the repo default `guard:pr-shape` source budget of 600 and the earlier branch targets, so merge requires PR metadata `Exception: large_change_exception` plus owner/coordinator approval. If that exception is rejected, the branch must be split or shrunk before merge.
- New source files: <= 5
- Test files changed: 1 focused Playwright spec
- Docs files changed: 3
- Package/lock/generated/config/backend/API/DB/worker/cron/CI changes: 0
- External API/provider/connector/adapter basis: none
- Exceptions: `large_change_exception` proposed for owner/coordinator review because this start-gate slice delivers eight shared operational patterns, accessibility remediation, lint-remediation extraction and `/design` preview CSS before page workers may start. This worker does not self-approve the exception; merge still requires owner/coordinator approval of the exception path.

## Preconditions

- Base: current `main` after merged PR #172, expected HEAD `b9ede1f50d5875f27ad6aca66f9cde8ce183ba90`.
- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-04-shared-operational-patterns`.
- `git status --short --branch`: `## codex/m7-ui-04-shared-operational-patterns`.
- `git branch --show-current`: `codex/m7-ui-04-shared-operational-patterns`.
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`.
- M7-UI-03 router/ledger scaffold is present on `main`; all planned page ledger rows remain `not_started`.

## Implementation Steps

1. Record entry evidence, required reads, Impeccable context and `rg` search conclusions.
2. Add typed pattern modules under `apps/admin/src/patterns/**` and ergonomic exports from `apps/admin/src/patterns`.
3. Implement `DataTable` with stable columns, optional row selection, empty state and density variants.
4. Implement `FilterBar`, `PageToolbar`, `SidePanel`, `MessageBubble`, `ConfirmModal`, `ToastHost`/`useToast`, and `BatchActionBar`; keep `DegradedBar` as the shared degraded-state pattern.
5. Add tokenized CSS classes in `AppShell.css` without raw visual literals, side stripes, gradients, glassmorphism or old token aliases.
6. Update `FoundationPreview` with an operational patterns preview section and stable `data-testid` anchors, using local preview state only.
7. Add focused Playwright coverage against `/design` for the operational preview, confirmation/toast affordances and 320px fallback no-overflow.
8. Update M7 evidence and README without claiming page migration or runtime closure.
9. Run and record validation commands.

## Pass Conditions

- `/design` renders an operational patterns section with stable test IDs for DataTable, FilterBar, PageToolbar, SidePanel, MessageBubble roles, BatchActionBar, ConfirmModal, ToastHost and the existing DegradedBar.
- `DataTable` is generic/typed, uses stable column definitions, supports optional selection, empty state and compact/standard density.
- Patterns consume canonical tokens through CSS classes and existing primitives; no new raw page-local hex, old `--uzmax-*` visual target, side stripe or copied raw prototype fixture values are introduced.
- `FoundationPreview` explicitly remains a design/pattern preview and does not imply migrated pages.
- M7-UI-03 legacy evidence route and page scaffold behavior are preserved.
- Page workers remain blocked until this slice is merged; M7 evidence says so.
- Impeccable/design audit adoption/rejection notes are documented, including rejected side stripes, inline styles and raw fixtures.
- `git diff --check`, `guard:pr-shape`, format/typecheck/lint/build and focused Playwright are attempted or exact isolated-tooling failures are recorded.

## Failure Branch

- If the assigned worktree/branch has unexpected state, stop and report `BLOCKED`.
- If patterns require token changes, stop and request a separate token spec.
- If implementation requires modifying files outside the touch list, stop and ask coordinator to split or expand the spec.
- If Playwright/browser/npm tooling is unavailable in the isolated worktree, record exact command and error; do not borrow root `node_modules`.
- If edits land outside the assigned worktree or in root/main, stop and report for incident handling.

## Out Of Scope

- No page migration, page body porting, page ledger row status change to implemented, runtime API/hook wiring or synthetic fixture masquerading as runtime data.
- No edits to `apps/admin/src/App.tsx`, `apps/admin/src/pages/**`, `apps/admin/src/shell/AppShell.tsx`, `packages/ui-tokens/**`, package files, lockfiles, backend/API/DB/worker/cron/CI/guard configs or raw prototype files.
- No copied customer/order/contact plaintext samples from prototype sources.
- No GA-0, production, real customer traffic, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Validation List

- `git diff --check`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-04-shared-operational-patterns.md --include-worktree`
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run playwright -- apps/admin/tests/m7-ui-patterns.spec.ts`

# M7-UI-01 Foundation Layer

## Goal

Implement the first M7+ admin UI foundation layer after M7-05 / M7-UI-00 / 00A / 00B: canonical prototype tokens, compact shared primitives, compact shared patterns and a prototype-aligned AppShell that wraps the existing M2-M6 admin evidence content.

This is not a page migration. Existing milestone pages remain legacy evidence surfaces until later page specs.

## Owner Confirmation Points

- Owner current prototype `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6` are the M7+ visual source for this foundation.
- v1.1 admin IA, permissions, security, acceptance, release gates and owner decision boundaries remain authoritative.
- Page workers must wait until this foundation is merged and verified.
- No dependency installation is allowed in this slice; `lucide-react` remains a follow-up dependency/spec need.

## AI Agent Responsibilities

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-01-foundation-layer/UZMAX智能运营` on branch `codex/m7-ui-01-foundation-layer`.
- Read AGENTS, PRODUCT/DESIGN, Impeccable product guidance, M7-05, M7-UI-00/00A/00B, current admin source/tests and prototype source before implementation edits.
- Create/confirm this spec before runtime implementation.
- Keep legacy `--uzmax-*` aliases for existing pages; new foundation files must consume canonical tokens.
- Preserve existing anchors: `admin-shell`, `tenant-switcher`, `group-layer`, `tenant-layer`, `release-readiness`, and M2-M6 test ids.
- Record accepted/adapted/rejected design decisions, validation and follow-ups in M7 evidence.

## Timebox

0.5 workday. If a page migration, dependency install, lockfile update, backend/API change, raw fixture import, screenshot artifact, or production/release action becomes required, stop and hand back to coordinator.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M7-UI-01-foundation-layer.md`
  - `docs/evidence/M7/M7-UI-01-foundation-layer.md`
  - `packages/ui-tokens/src/tokens.css`
  - `packages/ui-tokens/src/tokens.ts`
  - `packages/ui-tokens/src/index.ts`
  - `packages/ui-tokens/package.json`
  - `apps/admin/src/primitives/**`
  - `apps/admin/src/patterns/**`
  - `apps/admin/src/shell/**`
  - `apps/admin/src/App.tsx`
  - `apps/admin/src/main.tsx`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`

- 未列出的模块默认不可改。

## Change Budget / Path Classification

- Source files changed: <= 10
- Source net LOC: <= 950
- New source files: <= 6
- Test files changed: 1 focused new Playwright spec
- Docs files changed: 2
- Package file changes: `packages/ui-tokens/package.json` exports only
- Lockfile/dependency changes: 0
- Backend/API/DB/worker/cron/CI changes: 0
- External API/provider/connector/adapter basis: none
- Exceptions: proposed PR metadata must include `Exception: large_change_exception` because this compact foundation slice creates the missing token/primitives/patterns/shell layers and is expected to exceed the default source-size budget after commit. This is an owner-review/merge approval point; the worker cannot self-approve it.

## Preconditions

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-01-foundation-layer/UZMAX智能运营`
- `git branch --show-current`: `codex/m7-ui-01-foundation-layer`
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
- Required docs and source references are read-only except the touch list above.

## Implementation Steps

1. Record entry evidence and required reads.
2. Add canonical prototype CSS and typed token exports while retaining legacy aliases.
3. Add compact primitives: Button, IconSlot, StatusBadge, Avatar, CountBadge, Kbd, SearchInput/Input, Toggle and Checkbox.
4. Add compact patterns: NavItem, Tabs, PageState, EmptyState and DegradedBar.
5. Add AppShell with prototype frame dimensions: 68px collapsed nav, 232px expanded nav, 52px topbar, tenant switcher, env marker, heartbeat, search, notification, user menu and collapse control.
6. Wrap existing admin content through AppShell without migrating individual pages.
7. Add focused Playwright assertions for shell collapse/expand, topbar controls, tenant switcher and state coverage.
8. Run validation commands where local tooling permits and record exact failures.

## Pass Conditions

- Spec exists before implementation edits.
- New files under primitives/patterns/shell use canonical tokens and do not consume `--uzmax-*`.
- Existing M2-M6 anchors and tests are not weakened.
- AppShell renders existing content and provides collapsed/expanded nav, topbar, tenant switcher, environment marker, heartbeat, search, notification and user menu.
- Foundation preview or test target covers loading, empty, error, permission denied and degraded states.
- No raw prototype fixtures/customer/order/contact samples are copied into repo.
- `git diff --check` passes.
- TypeScript, Vite build, guard and focused Playwright are attempted if local tooling exists; failures are recorded with exact commands.

## Failure Branch

- If root/main or prototype source is written, stop and report for incident handling.
- If local tooling lacks Node/npm/browser support, leave implementation diff and record exact validation failure.
- If package exports require dependency/lockfile changes, do not install; record a follow-up.
- If existing page files need edits to pass, stop unless they are in the allowed touch list.

## Out Of Scope

- No page migration.
- No changes to existing M2/M3/M4/M5 shell files or CSS files.
- No API client, contract, backend, DB, worker, cron, CI, lockfile, root package or dependency changes.
- No raw prototype import, raw fixture import, screenshot artifact storage or production data.
- No GA-0, 1.0 release, production, real customer traffic, customer LLM, Telegram Business automatic reply or owner release approval.

## Validation List

- `git diff --check`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M7-UI-01-foundation-layer.md --include-worktree`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- Focused Playwright: `m7-ui-foundation.spec.ts` if local browser/tooling is available.

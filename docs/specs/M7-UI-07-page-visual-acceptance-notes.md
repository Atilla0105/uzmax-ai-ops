# M7-UI-07 Page Visual Acceptance Notes

## Goal

Move the owner's latest page-migration acceptance notes into durable M7 migration planning docs, independent of Draft PR #182's conversation-workbench branch.

This is a docs-only governance slice. It does not implement UI, create page tasks, claim owner visual acceptance, or make #182 merge-ready.

## Owner Confirmation Points

- Owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and frozen source `/Users/atilla/源码/unpacked 6` remain the hard visual/source baseline for M7+ page migration.
- Current #182 visual direction is broadly aligned, but it is not one-to-one visual acceptance and not merge readiness.
- Desktop page acceptance requires detailed pixel/detail-level adjustment against the owner HTML and exact unpacked page source before acceptance is claimed.
- Mobile remains an acceptable/readable fallback in this phase; pixel-level mobile redesign/polish is deferred to a later mobile-specific pass.
- Release/acceptance work remains transitional/low business value and must not displace higher-value real admin pages.

## AI Agent Responsibilities

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-07-page-visual-acceptance-notes` on branch `codex/m7-ui-07-page-visual-acceptance-notes`.
- Read AGENTS, migration ledger/index, relevant design-system sections, M7 evidence index, and Draft #182 notes as source material only.
- Record worker/root branch state and confirm #178/#182 worktrees are not edited.
- Update durable planning docs with concise operational acceptance notes.
- Keep this slice docs-only and conservative.
- Commit, push, and open a Draft PR if `gh` auth is available.

## Timebox

0.25 workday. If implementation, visual screenshot work, prototype rewriting, apps/packages edits, guard changes, or DB/schema changes are needed, stop and report.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-07-page-visual-acceptance-notes.md`
  - `docs/evidence/M7/M7-UI-07-page-visual-acceptance-notes.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/admin-ui-prototype-migration-index.md`
  - `docs/evidence/M7/README.md`
- 未列出的模块默认不可改。

## Change Budget / Path Classification

- Source changed files: 0
- Source net LOC: 0
- New source files: 0
- Docs files changed: <= 5
- New docs files: 2
- Test/generated/lock/config/backend/API/DB/worker/cron/CI changes: 0
- External API/provider/connector/adapter basis: none
- Dependency changes: none
- Exceptions: none

## Preconditions / Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-07-page-visual-acceptance-notes` |
| worker branch | `codex/m7-ui-07-page-visual-acceptance-notes` |
| `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-07-page-visual-acceptance-notes` |
| `git status --short --branch` | `## codex/m7-ui-07-page-visual-acceptance-notes` |
| `git branch --show-current` | `codex/m7-ui-07-page-visual-acceptance-notes` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head | `## main...origin/main`; `2193a51` |
| root `git branch --no-merged main` | `codex/m7-ui-11-release-acceptance-page-impl`; `codex/m7-ui-20-conversation-workbench-page-impl` |
| #178 worktree status | `## codex/m7-ui-11-release-acceptance-page-impl...origin/codex/m7-ui-11-release-acceptance-page-impl` |
| #182 worktree status | `## codex/m7-ui-20-conversation-workbench-page-impl...origin/codex/m7-ui-20-conversation-workbench-page-impl` |

Confirmation: this worker read #182 docs as source material only and did not edit #178/#182 worktrees.

## Implementation Steps

1. Add this spec and matching evidence.
2. Add durable page visual acceptance notes to the ledger.
3. Add the same operational rules to the prototype migration index worker handoff and page-worker hard rules.
4. Add this docs-only slice to the M7 evidence index if the index convention expects listing.
5. Run `git diff --check`.
6. Run `npm run guard:doc-triggers`.
7. Run `guard:pr-shape` with the repo's branch PR invocation or record the exact blocker.
8. Commit, push, and open a Draft PR if available.

## Pass Conditions

- Only the five allowed docs paths are changed.
- The durable docs say owner HTML and frozen `/Users/atilla/源码/unpacked 6` are the hard visual/source baseline.
- The durable docs state #182 is broadly aligned but not accepted or merge-ready.
- Page workers are required to inspect exact target `unpacked 6/pages/**` files and relevant owner HTML regions before visual acceptance.
- Shared shell/sidebar acceptance records owner sidebar category grouping and bottom collapse-sidebar control.
- Group and tenant layers remain separate: `/design` or admin/home opens group layer/group overview; selecting a tenant enters tenant layer.
- Release/acceptance remains transitional/low business value and must not displace high-value real admin pages.
- Validation results are recorded honestly.

## Failure Branch

- If assigned worktree/branch state is wrong, stop and report `BLOCKED`.
- If required #182 source material is unavailable, update only the evidence with the missing path and stop before changing durable planning docs.
- If validation requires an open PR or PR metadata, create the Draft PR first if possible; otherwise record the exact blocker.
- If any file outside the allowed docs touch list changes, stop and report for cleanup.

## Out Of Scope

- No UI implementation, page implementation tasks, new page specs, screenshots or browser verification.
- No `apps/**`, `packages/**`, lockfile, generated, CI/guard, DB/schema, backend/API, worker/cron or dependency changes.
- No edits to `/Users/atilla/Downloads/运营塔台1.0.html` or `/Users/atilla/源码/unpacked 6`.
- No raw HTML copy or large prototype excerpt.
- No owner visual acceptance, merge readiness, M7 closeout, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

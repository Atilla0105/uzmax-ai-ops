# M7-UI-07B Page Visual Acceptance Hard Rules

## Goal

Turn the owner's latest page-migration visual feedback into explicit hard rules for every later M7 page worker and coordinator review.

This is a docs-only planning slice. It does not implement UI, reopen page scope, claim owner visual acceptance, or make Draft PR #182 merge-ready.

## Owner Confirmation Points

- The owner HTML `/Users/atilla/Downloads/运营塔台1.0.html` and frozen source `/Users/atilla/源码/unpacked 6` are not moodboards or loose references; they are the visual and structural baseline.
- "Overall direction is close" is not visual acceptance. Page PRs must keep tuning against the owner HTML/source until remaining desktop deltas are listed and accepted.
- The visible sidebar must keep the owner category grouping, item order, icon treatment, expanded/collapsed widths and bottom collapse control. Page workers cannot claim page visual acceptance while the shared shell/sidebar visible in their screenshots is wrong.
- Mobile remains readable/no-overflow fallback for this migration phase. A mobile-specific redesign pass is deferred and must not distract current desktop parity work.
- The unpacked source already contains page-level layout/component details. Workers must inspect the exact target page/source components before implementation and before visual acceptance; they must not invent alternate layouts, rearrange sections or carry old shell visuals.

## AI Agent Responsibilities

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-07b-visual-plan-hard-rules` on branch `codex/m7-ui-07b-visual-plan-hard-rules`.
- Read `AGENTS.md`, `docs/admin-ui-page-migration-ledger.md`, `docs/admin-ui-prototype-migration-index.md`, `docs/evidence/M7/README.md`, M7-UI-07 and M7-UI-08 specs/evidence before editing.
- Keep the change docs-only and conservative.
- Do not edit owner HTML, `/Users/atilla/源码/unpacked 6`, `apps/**`, `packages/**`, tests, CI, package files, lockfiles or generated files.
- Record validation honestly, including any unrelated baseline blocker.

## Timebox

0.25 workday. If implementation, screenshots, app source changes, prototype rewriting, backend/API/DB changes, guard changes or package changes are required, stop and report.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-07B-page-visual-acceptance-hard-rules.md`
  - `docs/evidence/M7/M7-UI-07B-page-visual-acceptance-hard-rules.md`
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
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-07b-visual-plan-hard-rules` |
| worker branch | `codex/m7-ui-07b-visual-plan-hard-rules` |
| worker base | `origin/main` at `22d9ba2` / M7-UI-08 shared sidebar calibration |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status/head | `## main...origin/main`; `22d9ba2` |

## Implementation Steps

1. Add this spec and matching evidence.
2. Strengthen the page migration ledger acceptance notes into hard rules and update M7-UI-08 from pending to merged state.
3. Strengthen the prototype migration index page-worker hard rules and required evidence checklist.
4. Update the M7 evidence index with this docs-only slice and current UI-08 merge status.
5. Run `git diff --check`.
6. Run `npm run guard:doc-triggers`.
7. Run `guard:pr-shape` against this spec.
8. Commit, push and open a Draft PR if GitHub auth is available.

## Pass Conditions

- Only the five allowed docs paths change.
- Later page workers have a durable checklist requiring owner HTML/source comparison, exact target source files/components inspected and desktop visual delta notes.
- Sidebar category grouping, item order, icon treatment, expanded/collapsed dimensions and bottom collapse control are explicit acceptance items when the sidebar is visible.
- Mobile is explicitly limited to readable/no-overflow fallback in the current migration phase.
- UI-08 is recorded as merged to `main` via PR #192 / commit `22d9ba2`, while still not counting as a page migration.
- Validation results are recorded honestly.

## Failure Branch

- If assigned worktree/branch state is wrong, stop and report `BLOCKED`.
- If any file outside the allowed docs touch list changes, stop and report cleanup need.
- If `guard:pr-shape` or GitHub metadata requires a PR that cannot be created, record the exact blocker instead of weakening the rules.

## Out Of Scope

- No UI implementation, screenshots, browser verification, page implementation tasks or new page runtime contracts.
- No `apps/**`, `packages/**`, tests, generated files, package files, lockfiles, CI/guard, DB/schema, backend/API, worker/cron or dependency changes.
- No edits to `/Users/atilla/Downloads/运营塔台1.0.html` or `/Users/atilla/源码/unpacked 6`.
- No owner visual acceptance, merge readiness for #182, M7 closeout, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

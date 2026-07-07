# M7-UI-99 Group Overview Source Copy Parity

## Goal

Repair one narrow visible UI copy-parity slice for `group.overview` on top of `origin/codex/m7-ui-31-orders-visible-ui`.

The current React fallback visibly injects `mock` / `mock/degraded` into tenant row business-line sublabels, evaluation badges, order badges and last-exception copy. This diverges from the owner HTML / unpacked source first-viewport shape. This slice keeps the required global degraded/mock disclosure in stable global places only: the result label and runtime note.

This is visual-source copy parity only. It does not add DB/API/runtime/authz wiring, does not import owner/unpacked files, does not claim production metrics, owner visual acceptance, GA-0, production readiness or 1.0 release approval.

## Owner / Agent Boundary

- Worker path: `/Users/atilla/.codex/worktrees/m7-ui-99-group-overview-source-copy-parity`.
- Branch: `codex/m7-ui-99-group-overview-source-copy-parity`.
- Base: `origin/codex/m7-ui-31-orders-visible-ui`.
- Owner visual source: `/Users/atilla/Downloads/运营塔台1.0.html`.
- Unpacked source references: `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx` and `/Users/atilla/源码/unpacked 6/fixtures/group.ts`.
- Keep root/main checkout and other worktrees untouched.
- Preserve tenant entry, group/tenant layer split, sidebar category/collapse behavior, search/filter/sort and mobile no-overflow.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/group/groupOverviewFallback.ts`
  - `apps/admin/tests/m7-ui-group-overview.spec.ts`
  - `apps/admin/tests/m7-ui-99-group-overview-source-copy-parity.spec.ts`
  - `docs/incidents/INC-2026-07-07-m7-ui-99-root-worktree-write.md`
  - `docs/specs/M7-UI-99-group-overview-source-copy-parity.md`
  - `docs/evidence/M7/M7-UI-99-group-overview-source-copy-parity.md`
  - `docs/evidence/M7/README.md`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/group/groupOverviewFallback.ts
test:
  - apps/admin/tests/m7-ui-group-overview.spec.ts
  - apps/admin/tests/m7-ui-99-group-overview-source-copy-parity.spec.ts
docs:
  - docs/incidents/INC-2026-07-07-m7-ui-99-root-worktree-write.md
  - docs/specs/M7-UI-99-group-overview-source-copy-parity.md
  - docs/evidence/M7/M7-UI-99-group-overview-source-copy-parity.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## Budget

- source changed files <= 1.
- source net LOC <= 40.
- new source files = 0.
- test changed files <= 2.
- docs changed files <= 4.
- generated/lock/config/backend/API/DB/worker/cron/shared shell/topbar/sidebar/tokens/primitives/patterns/package changes = 0.
- external API/SDK/provider/connector/adapter basis: none.
- exceptions: none.

## Source Mapping

| Source | Required use |
|---|---|
| Owner HTML browser render | Visual baseline for `group.overview` first viewport and copy shape; no owner file edits. |
| `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx` | Confirms row rendering uses `r.line`, `r.eval`, `r.order` and `r.last` directly without row-local mock prefixes. |
| `/Users/atilla/源码/unpacked 6/fixtures/group.ts` | Defines the exact source-like business lines, badge labels and last-exception copy for the four visible rows. |
| Current `apps/admin/src/pages/group/GroupOverviewPage.tsx` | Preserve page anatomy, result label, runtime note, search/filter/sort, row entry and responsive table behavior. |
| Current `apps/admin/src/pages/group/groupOverviewFallback.ts` | Only central fallback copy changes: remove row-local mock/degraded labels from row/status/last copy while keeping global disclosure. |
| Current group overview tests | Preserve existing behavior coverage and add focused assertions for row/status/last copy plus global mock/degraded disclosure. |

## Acceptance

- Default row business-line sublabels are source-like:
  - `美妆 · 中亚`
  - `3C · 俄语区`
  - `家居 · 哈萨克`
  - `母婴 · 俄语区`
- Evaluation badge labels are source-like: `阻断`, `通过`, `运行中`, `通过`.
- Order badge labels are source-like: `降级`, `正常`, `故障`, `正常`.
- Last-exception copy is source-like:
  - `退款红线 · 9分钟前`
  - `成本超预算 · 1小时前`
  - `connector 故障 · 22分钟前`
  - `AI 熔断 · 3小时前`
- Row-local business-line sublabels, evaluation badges, order badges and last-exception cells do not contain `mock` or `degraded`.
- Global result label still includes `mock/degraded`.
- Runtime note still includes degraded/mock/not-production semantics.
- Tenant entry, group/tenant layer split, sidebar category/collapse behavior, search/filter/sort and mobile no-overflow still pass existing focused coverage.
- Evidence includes validation commands and artifacts under `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/`; owner HTML screenshot is included if feasible, otherwise the caveat and source-file comparison are recorded.

## Impeccable / Design Skill Layer Decision Record

| Decision | Status | Reason |
|---|---|---|
| Treat row/status/last text as source-parity product copy, not runtime truth. | accepted | Product UI should be scannable and familiar; disclosure belongs in stable global locations so row content stays source-like. |
| Keep explicit result-label and runtime-note mock/degraded/not-production disclosure. | accepted | UZMAX governance requires evidence over impression and forbids production metric claims. |
| Preserve current page structure, tokens, primitives and shell behavior. | accepted | The requested slice is copy parity only; existing page behavior already owns search/filter/sort/entry/mobile fallback. |
| Add a focused Playwright source-copy parity test. | accepted | It guards against row-local mock/degraded text returning without bloating broad specs. |
| Add page-local tokens, AppShell/topbar/sidebar changes, DB/API/runtime work or owner/unpacked edits. | rejected | Out of scope and unnecessary for this copy-parity repair. |

## Validation Plan

- `git status --short --branch --untracked-files=all`
- focused Prettier check for changed files
- focused lint for changed TS/TSX files, or repository lint if needed
- `git diff --check`
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-99-group-overview-source-copy-parity.md --include-worktree`
- admin build equivalent
- focused Playwright for `apps/admin/tests/m7-ui-group-overview.spec.ts`
- focused Playwright for `apps/admin/tests/m7-ui-99-group-overview-source-copy-parity.spec.ts`
- screenshot/metrics evidence under `/tmp/uzmax-m7-ui-99-group-overview-source-copy-parity/`

## Failure Branch

- If assigned worktree, branch or base is wrong, stop and report `BLOCKED`.
- If owner HTML or unpacked source files are unavailable, record the caveat and rely on source-file comparison without claiming owner-browser parity.
- If validation blocks on environment tooling, record exact command/output and do not claim full closure.
- If satisfying acceptance requires unlisted files or runtime/API/DB/authz/shell/token/package changes, stop and split a separate spec.

## Out Of Scope

- No `AppShell`, topbar, sidebar, token, primitive, package, lockfile, DB/API/authz/runtime, CI/global config or owner/unpacked source changes.
- No production metrics, owner visual acceptance, runtime closure, GA-0, production readiness or 1.0 release approval claims.

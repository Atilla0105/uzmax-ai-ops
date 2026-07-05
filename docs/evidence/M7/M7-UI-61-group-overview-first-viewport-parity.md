# M7-UI-61 Group Overview First-Viewport Parity Evidence

## Status

`visible_ui_fix_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This clean-stack slice calibrates the default `group.overview` first viewport on top of `origin/codex/m7-ui-31-orders-visible-ui`. It makes sanitized centralized mock/degraded tenant rows visible by default so the group homepage reads as an operations homepage, while keeping runtime truth copy compact and explicit: values are not production metrics and no group aggregate API/DB/runtime, real authorization closure, owner visual acceptance, GA-0, production readiness or 1.0 release approval is claimed.

## Worktree Boundary

| Fact | Evidence |
|---|---|
| Worktree | `/Users/atilla/.codex/worktrees/m7-ui-61-group-overview-first-viewport-cleanstack` |
| Branch | `codex/m7-ui-61-group-overview-first-viewport-cleanstack` |
| Base | `origin/codex/m7-ui-31-orders-visible-ui` |
| Pre-edit status | `## codex/m7-ui-61-group-overview-first-viewport-cleanstack...origin/codex/m7-ui-31-orders-visible-ui` |
| Root/main boundary | `/Users/atilla/Applications/UZMAX智能运营` was used only for coordination/worktree creation and was not edited by this worker. |

## Source Material Read

- `AGENTS.md`
- Impeccable context for `apps/admin/src/pages/group/GroupOverviewPage.tsx` and `.agents/skills/impeccable/reference/product.md`
- v1.1 source-of-truth sections for REQ-G01, group/tenant IA, RLS/aggregate views and A-01/B-01/B-03/B-04 blockers
- `docs/specs/M7-UI-12-group-overview-page.md`
- `docs/evidence/M7/M7-UI-12-group-overview-page.md`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupOverviewPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/group.ts`
- Current `apps/admin/src/pages/group/GroupOverviewPage.tsx`
- Current `apps/admin/src/pages/group/groupOverviewFallback.ts`
- Current `apps/admin/tests/m7-ui-group-overview.spec.ts`

## Implementation Summary

| Path | Change |
|---|---|
| `apps/admin/src/pages/group/GroupOverviewPage.tsx` | Removes first-load row gating so default `/design` shows tenant rows immediately; keeps search/filter/clear/sort and genuine filtered-empty behavior; keeps compact bottom runtime note. |
| `apps/admin/src/pages/group/groupOverviewFallback.ts` | Replaces generic `Mock 租户 A/B/C/D` rows with centralized source-like sanitized tenant labels and values using existing app tenant ids; keeps health values `4/2/1/0/1/7` and explicit mock/degraded/not-production labeling. |
| `apps/admin/tests/m7-ui-group-overview.spec.ts` | Updates focused Playwright coverage for default visible rows, real no-match empty state, source-like search/sort order, tenant-entry click/keyboard and shell/mobile geometry. |

## Runtime / Data Boundary

- All group overview health cards and table rows are centralized mock/degraded fallback values.
- Tenant/business labels `玉珠跨境美妆`, `丝路数码`, `天净家居` and `白桦母婴` are sanitized source-like labels for visual parity only.
- Existing app tenant ids `tenant-a` through `tenant-d` are preserved so tenant entry remains compatible with the current shell switcher and tenant conversation entry baseline.
- The page does not import owner/unpacked fixtures and does not add DB/API/runtime/authz foundation.
- The compact result label and bottom runtime note explicitly say `mock/degraded`, `aggregate runtime unavailable` and `not production metrics`.
- Tenant-entry remains a UI-only degraded boundary demonstration. Real backend authorization, tenant-scoped cache invalidation, RLS and permission reload remain future runtime work.

## Browser Evidence

Artifacts are under `/tmp/uzmax-m7-ui-61-group-overview-first-viewport-parity/`.

- Owner HTML desktop screenshot: `/tmp/uzmax-m7-ui-61-group-overview-first-viewport-parity/owner-html-group-overview-1280x840.png`
- React desktop screenshot: `/tmp/uzmax-m7-ui-61-group-overview-first-viewport-parity/react-group-overview-1280x840.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-61-group-overview-first-viewport-parity/react-group-overview-mobile-320.png`
- Owner/React metrics JSON: `/tmp/uzmax-m7-ui-61-group-overview-first-viewport-parity/metrics.json`

| Metric | Owner / Source Evidence | React Result |
|---|---|---|
| Active layer/page | Required by spec: group layer, `group.overview` | `shellLevel=group`, `activePageId=group.overview`, `outletPageId=group.overview` |
| Shell geometry | Owner parity target: nav 232, topbar 53 | `navWidth=232`, `topbarHeight=53`, page `x=232`, `y=53`, `width=1048`, `height=787` at 1280x840 |
| Health strip | Unpacked source values `4 / 2 / 1 / 0 / 1 / 7` | `4 / 2 / 1 / 0 / 1 / 7`, strip `x=232`, `y=114`, `width=1048`, `height=106` |
| Tenant table | Unpacked source columns: `租户`, `会话量`, `待人工`, `SLA风险`, `转人工率`, `AI成本/日`, `评测状态`, `订单状态`, `最后异常` | Same 9 columns visible; default row count `4`; empty state count `0` |
| Tenant labels | Unpacked source rows: `玉珠跨境美妆`, `丝路数码`, `天净家居`, `白桦母婴` | Same sanitized labels visible as centralized mock/degraded fallback rows |
| Runtime truth copy | Owner HTML contains unqualified `实时` copy; this is intentionally not copied unqualified | Result label `4 个租户 · mock/degraded`; runtime note says `centralized mock/degraded fallback only; aggregate runtime unavailable, not production metrics.` |
| Desktop overflow | Target: no body horizontal overflow | `bodyScrollWidth=1280`, viewport width `1280`, `hasHorizontalOverflow=false` |
| Mobile fallback | Scope: readable/no horizontal overflow at 320 | row count `4`, `bodyScrollWidth=320`, viewport width `320`, `hasHorizontalOverflow=false` |

Owner HTML browser capture confirmed the title and health strip, and the unpacked source confirmed the four source-like rows, nine table columns and `4 / 2 / 1 / 0 / 1 / 7` health values. React intentionally combines those visual fixtures with explicit mock/degraded labels so the page is visibly useful without claiming production metrics.

## Validation

All commands were run from `/Users/atilla/.codex/worktrees/m7-ui-61-group-overview-first-viewport-cleanstack` with `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH`.

| Command | Result |
|---|---|
| `node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/group/GroupOverviewPage.tsx apps/admin/src/pages/group/groupOverviewFallback.ts apps/admin/tests/m7-ui-group-overview.spec.ts docs/specs/M7-UI-61-group-overview-first-viewport-parity.md docs/evidence/M7/M7-UI-61-group-overview-first-viewport-parity.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md` | Pass |
| `node .agents/skills/impeccable/scripts/detect.mjs --json apps/admin/src/pages/group/GroupOverviewPage.tsx apps/admin/src/pages/group/groupOverviewFallback.ts` | Pass, result `[]` |
| `node scripts/guards/doc-trigger-paths.mjs` | Pass |
| `find apps packages scripts -path '*/node_modules' -prune -o -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.mjs' -o -name '*.cjs' \) -print0 \| xargs -0 node node_modules/eslint/bin/eslint.js eslint.config.mjs dependency-cruiser.config.cjs playwright.config.ts` | Pass |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | Pass |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | Pass; existing large chunk warning only |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-group-overview.spec.ts --config=playwright.config.ts --reporter=line` | Pass, `5 passed` |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-*.spec.ts --config=playwright.config.ts --reporter=line` | Pass, `110 passed` |
| `git diff --check` | Pass |
| `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-61-group-overview-first-viewport-parity.md --include-worktree` | Pass; `changedFiles=7`, `source.changedFiles=2`, `source.netLoc=4`, `source.newFiles=0` |
| `test ! -L node_modules` | Pass; temporary validation symlink removed before commit |

Current clean-stack validation rerun also passed focused Playwright (`5 passed`), `npm run typecheck` and `npm run lint`. Vite reported the existing large chunk warning during the Playwright webServer build.

## Remaining Visual / Runtime Deltas

- React keeps explicit mock/degraded/runtime caveat copy required by UZMAX governance; owner prototype uses `实时`, which this slice intentionally does not copy unqualified.
- Tenant ids remain the current app ids (`tenant-a` through `tenant-d`) while labels/values are source-like; this preserves existing tenant switcher and conversation baseline.
- Mobile is only no-overflow/readable fallback; exact mobile pixel parity is out of scope.
- No group aggregate DB/API/runtime, production authorization closure, owner visual acceptance, GA-0, production readiness or release closure is claimed.

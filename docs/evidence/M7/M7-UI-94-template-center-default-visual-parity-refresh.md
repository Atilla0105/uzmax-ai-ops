# M7-UI-94 Template Center Default Visual Parity Refresh Evidence

## Status

`visible_ui_refresh_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch refreshes default-visible copy for `group.templates` / `模板中心` on top of `codex/m7-ui-93-connection-center-default-visual-parity-refresh`. It keeps template runtime downgraded: no template DB/API/runtime, ops-assets wiring, production template copy, tenant config persistence, audit write, KB/persona/config/eval/template write, owner visual acceptance, merge, runtime closure, GA-0 or 1.0 release approval is claimed.

## Scope

- Spec: `docs/specs/M7-UI-94-template-center-default-visual-parity-refresh.md`
- Route: `group.templates`
- Base: `codex/m7-ui-93-connection-center-default-visual-parity-refresh`
- Branch/worktree: `codex/m7-ui-94-template-center-default-visual-parity-refresh` / `/Users/atilla/.codex/worktrees/m7-ui-94-template-center-default-visual-parity-refresh`
- Source targets:
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
- Test targets:
  - `apps/admin/tests/m7-ui-template-center.spec.ts`
  - `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts`

## Startup Evidence

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-94-template-center-default-visual-parity-refresh`
- `git status --short --branch`: `## codex/m7-ui-94-template-center-default-visual-parity-refresh`
- `git branch --show-current`: `codex/m7-ui-94-template-center-default-visual-parity-refresh`
- `git rev-parse HEAD`: `4dc46734e746a6500afc8171cc84eae1781f76b0`
- Root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` was not used for code edits.

## Source Review

- Read `AGENTS.md`.
- Ran Impeccable context for `apps/admin/src/pages/group/GroupTemplatePage.tsx` with the Codex runtime `node`; read product-register and clarify guidance.
- Read `PRODUCT.md`, `DESIGN.md`, `docs/admin-design-system.md`, `docs/admin-ui-page-migration-ledger.md` and `docs/evidence/M7/README.md`.
- Read prior/default-refresh inputs:
  - `docs/specs/M7-UI-50-template-center-page.md`
  - `docs/specs/M7-UI-71-template-center-source-parity-refresh.md`
  - `docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
  - `docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-50-template-center-page.md`
  - `docs/evidence/M7/M7-UI-71-template-center-source-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-93-connection-center-default-visual-parity-refresh.md`
- Inspected owner/prototype sources:
  - `/Users/atilla/Downloads/运营塔台1.0.html`
  - `/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx`
  - `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
  - `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- Reviewed v1.1 template/group-layer boundaries: template center IA, independent-version copy boundary, mobile fallback and acceptance/release gate rules.

## Default Visual Refresh Changes

- Replaced visible header badge `集团级 · mock/degraded · read-only` with `集团级模板运营`.
- Hid the runtime note while preserving the full boundary in hidden DOM, `data-runtime-boundary`, `title` and `aria-description`.
- Replaced visible eval labels from `mock 通过/运行中/阻断` to source-shaped `通过/运行中/阻断`; hidden spans retain the mock boundary evidence.
- Replaced card copy lines with `最近复制 · ... · N 租户` or `尚未复制到任何租户`; hidden spans retain `mock/local history` and `synthetic read-only` evidence.
- Replaced copy modal subcopy with source-shaped `选择目标租户 · 复制后生成独立版本，可各自演进` and moved `browser-local only` into boundary metadata.
- Replaced copy toast with `已复制「...」到 N 个租户 · tab · 租户将生成独立版本` and moved no-production/audit/config boundaries into metadata.
- Replaced forced loading/empty/error/permission state copy with business-readable Chinese while preserving runtime boundary metadata and hidden text.
- Added focused default visual parity Playwright coverage for clean default body, copy modal/toast feedback, forced states, group/tenant nav separation, collapsed nav and mobile 320.
- Updated existing template-center tests and source-parity metrics so they assert hidden/data/title/ARIA boundary evidence instead of requiring visible engineering labels.

## Data And Runtime Boundary

- All template rows and tenant copy targets remain centralized fallback data in `groupTemplateFallback.ts`.
- Template IDs remain `SYN-TMPL-*`; copy target IDs remain `SYN-COPY-*`.
- Default React keeps M7-UI-71 source-shaped values: title `模板中心`, subtitle `复制到租户将生成独立版本`, five tabs, dense cards, eval badges, version/meta/recent-copy line, `复制到租户` action, centered copy modal, tenant rows and source-shaped toast.
- Copy action mutates page-local state only.
- Runtime labels remain present in hidden DOM/data/title/ARIA evidence: `degraded`, `mock`, `read-only`, `browser-local only`, `no production template copy`, `no audit write`, `no config write`.
- No DB/API/runtime/ops-assets/template persistence/tenant config/audit/KB/persona/eval/config/template write/export/release wiring is implemented.

## Browser Evidence

Artifact directory target:

- `/tmp/uzmax-m7-ui-94-template-center-default-visual-parity-refresh/`

Expected focused artifacts from Playwright:

- React default clean screenshot: `/tmp/uzmax-m7-ui-94-template-center-default-visual-parity-refresh/react-template-center-default-clean.png`
- React modal clean screenshot: `/tmp/uzmax-m7-ui-94-template-center-default-visual-parity-refresh/react-template-center-modal-clean.png`
- React toast clean screenshot: `/tmp/uzmax-m7-ui-94-template-center-default-visual-parity-refresh/react-template-center-toast-clean.png`
- React collapsed nav clean screenshot: `/tmp/uzmax-m7-ui-94-template-center-default-visual-parity-refresh/react-template-center-collapsed-clean.png`
- React mobile 320 clean screenshot: `/tmp/uzmax-m7-ui-94-template-center-default-visual-parity-refresh/react-template-center-mobile-320-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-94-template-center-default-visual-parity-refresh/metrics.json`

## Validation

Validation status: `PASS`.

Environment notes:

- Default shell had `node`, `npm` and `npx` unavailable until the Codex runtime PATH was used for Node commands.
- Worktree had no local `node_modules`.
- Validation used a temporary worktree-local symlink: `node_modules -> /Users/atilla/.codex/worktrees/m7-ui-64-ticket-source-parity-refresh/node_modules`.
- `pr-shape --include-worktree` was run after removing the symlink so dependency plumbing was not counted as an out-of-scope worktree file.
- Playwright config webServer calls `npm`, which is unavailable in this runtime PATH; validation used the successful build plus manual `vite preview` on `127.0.0.1:4173`, then Playwright reused the existing server.

Completed validation:

- PASS: `git diff --check codex/m7-ui-93-connection-center-default-visual-parity-refresh...HEAD`
- PASS: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-93-connection-center-default-visual-parity-refresh --spec docs/specs/M7-UI-94-template-center-default-visual-parity-refresh.md --include-worktree`
  - `changedFiles: 10`
  - `categories: { source: 3, test: 3, docs: 4 }`
  - `source: { changedFiles: 3, netLoc: 58, newFiles: 0 }`
  - Source net LOC remains within the spec budget `<= 180`.
- PASS: touched Prettier:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/group/GroupTemplatePage.tsx apps/admin/src/pages/group/GroupTemplateViews.tsx apps/admin/src/pages/group/groupTemplateFallback.ts apps/admin/tests/m7-ui-template-center.spec.ts apps/admin/tests/m7-ui-template-center-source-parity.spec.ts apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts docs/specs/M7-UI-94-template-center-default-visual-parity-refresh.md docs/evidence/M7/M7-UI-94-template-center-default-visual-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md`
- PASS: touched ESLint:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js apps/admin/src/pages/group/GroupTemplatePage.tsx apps/admin/src/pages/group/GroupTemplateViews.tsx apps/admin/src/pages/group/groupTemplateFallback.ts apps/admin/tests/m7-ui-template-center.spec.ts apps/admin/tests/m7-ui-template-center-source-parity.spec.ts apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts`
- PASS: Admin build with existing Vite warning:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
  - Existing warning: bundle chunk larger than 500 kB after minification.
- Initial Playwright attempt hit the known local webServer issue:
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-template-center.spec.ts apps/admin/tests/m7-ui-template-center-source-parity.spec.ts apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts`
  - Result: `/bin/sh: npm: command not found`; config webServer could not start.
- PASS: focused Playwright with manual preview:
  - Server: `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
  - `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-template-center.spec.ts apps/admin/tests/m7-ui-template-center-source-parity.spec.ts apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts`
  - Result: `7 passed`

Cleanup status:

- COMPLETE after validation: temporary `node_modules` symlink, `apps/admin/dist`, `test-results` and `playwright-report` removed before final commit.

## Remaining Deltas

- This branch is default visual parity/evidence refresh only; it does not claim owner visual acceptance.
- Template DB/API/runtime, ops-assets wiring, production template copy, tenant config persistence, audit write and KB/persona/eval/config/template writes are intentionally not implemented.
- Real template data, production permission enforcement and release approval remain future runtime specs, not this UI slice.
- Merge, runtime closure, GA-0 and 1.0 release approval are still required later and are not claimed here.

# M7-UI-56 Tenant Logs Minimal Visible Page Evidence

## Summary

This branch implements the tenant-layer `tenant.logs` / `日志` minimal visible page using local mock/degraded rows translated from the owner source. It does not claim logs runtime/API, DB/RLS, authz, production audit readback, real navigation, owner acceptance, GA-0, or 1.0 release closure.

## Source Mapping

| Source | React |
|---|---|
| `/Users/atilla/源码/unpacked 6/pages/logs/LogsPage.tsx` title/header/search/tabs/table | `apps/admin/src/pages/logs/LogsPage.tsx` |
| `LOG_TAB_DEFS` | `登录日志` / `在线日志` / `操作日志` tabs |
| `LOGIN_LOG`, `ONLINE_LOG`, `OP_LOG`, `LOG_COLS` | Local mock rows and table columns |
| Operation log detail cells | Link-like browser-local buttons; no real navigation |

## Runtime Boundary

- `mock/degraded`, `read-only`, `browser-local only`.
- No logs runtime, DB/API/authz/RLS, audit write, export, file write, or real business-object navigation.
- Query-driven states cover `loading`, `empty`, `error`, `permission`, and default `degraded`.

## Screenshots

- `/tmp/uzmax-m7-ui-56-logs-page-minimal/react-logs-desktop.png`
- `/tmp/uzmax-m7-ui-56-logs-page-minimal/react-logs-mobile-320.png`

Screenshot notes:

- Desktop screenshot renders `tenant.logs`, shell level `tenant`, title `日志`, the three source tabs, search, operation log table rows and runtime boundary note.
- 320px screenshot renders compact cards and measured `bodyScrollWidth=320`, `documentScrollWidth=320`, `pageWidth=320`, `noteTop-tabsBottom=1`, `noteHeight=100`, `firstCardTop-noteBottom=13`.

## Verification

Commands run in this worker:

- `node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/logs/LogsPage.tsx apps/admin/tests/m7-ui-logs-page.spec.ts docs/specs/M7-UI-56-logs-page.md docs/evidence/M7/M7-UI-56-logs-page.md` - PASS.
- `node node_modules/eslint/bin/eslint.js eslint.config.mjs dependency-cruiser.config.cjs playwright.config.ts apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/logs/LogsPage.tsx apps/admin/tests/m7-ui-logs-page.spec.ts` - PASS.
- Full lint equivalent over `apps packages scripts` with repo ESLint command shape - PASS.
- `node node_modules/typescript/lib/tsc.js --ignoreConfig --noEmit --target ES2022 --module ESNext --moduleResolution bundler --jsx react-jsx --allowSyntheticDefaultImports --esModuleInterop --skipLibCheck --lib DOM,DOM.Iterable,ES2022 --types vite/client,node apps/admin/src/pages/PageOutlet.tsx apps/admin/src/pages/registry.ts apps/admin/src/pages/logs/LogsPage.tsx` - PASS focused admin UI equivalent.
- Full `tsc --noEmit -p tsconfig.json` - DID NOT PASS in this dependency-limited worktree because API/worker workspace dependencies were unavailable after temporary dependency install (`@nestjs/common`, `@nestjs/core`, `@supabase/supabase-js`, `bullmq`, `@prisma/client`). No M7-UI-56 source error was reported in the focused admin UI check.
- `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` - PASS with the existing Vite chunk-size warning.
- `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-logs-page.spec.ts --project desktop-chromium` - PASS, 4/4.
  - Mobile geometry assertions include `noteTop - tabsBottom < 24`, `noteBottom - noteTop < 140`, and `firstCardTop - noteBottom < 32`.
- `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-56-logs-page.md --include-worktree` - PASS for worktree/spec shape; PR-only checks skipped before PR creation because no PR existed yet.

## Worktree Preflight

- `pwd`: `/Users/atilla/.codex/worktrees/m7-ui-56-logs-page-minimal`
- `git status --short --branch`: `## codex/m7-ui-56-logs-page-minimal...origin/codex/m7-ui-31-orders-visible-ui` with only M7-UI-56 allowed-path edits before staging.
- `git branch --show-current`: `codex/m7-ui-56-logs-page-minimal`

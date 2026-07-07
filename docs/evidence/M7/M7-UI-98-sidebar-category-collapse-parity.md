# M7-UI-98 AppShell Sidebar Category/Collapse Source Parity Evidence

## Status

DONE_WITH_CONCERNS as local worker evidence: visible shell/sidebar implementation, focused Playwright proof and source mapping are complete. This is not owner acceptance, runtime/API closure, GA-0 approval or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-98-sidebar-category-collapse-parity.md`
- Branch: `codex/m7-ui-98-sidebar-category-collapse-parity`
- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-98-sidebar-category-collapse-parity`
- Base: `origin/codex/m7-ui-31-orders-visible-ui`

Changed tracked paths:

- `apps/admin/src/shell/AppShellNavigation.tsx`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/tests/m7-ui-98-sidebar-category-collapse-parity.spec.ts`
- `docs/specs/M7-UI-98-sidebar-category-collapse-parity.md`
- `docs/evidence/M7/M7-UI-98-sidebar-category-collapse-parity.md`

## Source Mapping

| Source | What was used |
|---|---|
| `AGENTS.md` | Confirms owner prototype/unpacked source/design-system precedence and root/main isolation. |
| Impeccable product context | Adopted restrained product UI calibration; rejected redesign, decorative motion and old-shell visual revival. |
| `docs/admin-design-system.md` | Confirms `232px` expanded rail, `68px` collapsed rail, `52px` topbar/brand source, Lucide-only icons and canonical tokens. |
| `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` | Confirms group/tenant layer split, topbar semantics and tenant navigation boundary. |
| `/Users/atilla/源码/unpacked 6/shell/NavSidebar.tsx` | Confirms `232`/`68` rail widths, `52px` brand row, category opacity suppression and `40px` bottom collapse control. |
| `/Users/atilla/源码/unpacked 6/shell/navigation.ts` | Confirms group categories `总览 / 平台 / 治理` and tenant categories `运营 / 数据 / 智能 / 管理 / 洞察` with item order. |
| `/Users/atilla/源码/unpacked 6/patterns/NavItem.tsx` | Confirms `36px` row height, `19px` icons, collapsed label and badge hiding. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Local Playwright sample loaded; DOM sample contained `收起导航` and tenant categories. Exact all-layer category mapping came from the unpacked source because the HTML initial DOM does not expose every layer simultaneously. |

## Implementation Notes

- Added stable nav metadata/state only: `data-nav-group-label`, `data-nav-state`, `data-testid="app-shell-nav-collapse"` and `aria-expanded`.
- Calibrated shell CSS:
  - sidebar width transition uses prototype token duration;
  - brand row uses border-box sizing so measured height is exactly `52px`;
  - collapsed category headings are visually suppressed with `opacity: 0` plus `visibility: hidden`;
  - bottom collapse control keeps `40px` height and bottom anchoring;
  - reduced-motion disables nav/category/icon transitions.
- Left `AppShellIcons.ts` and `patterns/index.tsx` untouched because existing Lucide/IconSlot/NavItem behavior already matched the owner source.

## Browser Evidence

Artifact directory:

- `/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity/`

Screenshots:

- `/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity/owner-html-source-sample.png`
- `/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity/react-desktop-group-expanded.png`
- `/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity/react-desktop-tenant-expanded.png`
- `/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity/react-desktop-tenant-collapsed.png`
- `/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity/react-mobile-tenant-320.png`

Metrics:

- `/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity/sidebar-category-collapse-metrics.json`
- `/tmp/uzmax-m7-ui-98-sidebar-category-collapse-parity/owner-html-source-dom-sample.json`

Measured comparison:

| State | Source target | Measured |
|---|---:|---:|
| desktop group expanded nav width | `232px` | `232px` |
| desktop tenant expanded nav width | `232px` | `232px` |
| desktop tenant collapsed nav width | `68px` | `68px` |
| brand row height | `52px` | `52px` |
| collapse control height | `40px` | `40px` |
| collapse control bottom delta | `0px` | `0px` |
| nav row height | `36px` | `36px` |
| dense nav icon size | about `19px` | `19px x 19px` |
| mobile body/document scroll width | `<= 320px` | `320px / 320px` |

Category/order proof:

- Group expanded categories: `总览 / 平台 / 治理`
- Group expanded items: `集团总览 / 模型/成本/风险 / 模板中心 / 连接中心 / 发布与验收 / 租户管理 / 集团日志`
- Tenant expanded categories: `运营 / 数据 / 智能 / 管理 / 洞察`
- Tenant expanded items: `对话 / 工单 / 确认队列 / 客户资产 / 订单 / 知识与资源 / 评测中心 / AI 成员 / 团队 / 配置 / 分析 / 日志`
- Tenant collapsed: category labels remain mapped but are visually suppressed; nav item labels and badges are absent; icon count remains `12`; nav scroll width `67 <= 67`.

## Validation

Commands run from the assigned worktree:

- `git status --short --branch`
- `git diff --check`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/prettier/bin/prettier.cjs --check apps/admin/src/shell/AppShellNavigation.tsx apps/admin/src/shell/AppShell.tsx apps/admin/src/shell/AppShell.css apps/admin/tests/m7-ui-98-sidebar-category-collapse-parity.spec.ts docs/specs/M7-UI-98-sidebar-category-collapse-parity.md`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir`
- manual preview server: `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173`
- `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-98-sidebar-category-collapse-parity.spec.ts --project=desktop-chromium`

Results:

- Prettier changed-file check: passed.
- Typecheck: passed.
- Admin build equivalent: passed; Vite emitted the existing large chunk warning, final JS gzip `243.94 kB`.
- Focused Playwright: passed, `1 passed`.
- First Playwright attempt found real brand-row drift (`53px` measured vs `52px` source); fixed by `box-sizing: border-box` on `.uz-nav-brand`.
- Second Playwright attempt needed test polling for the newly source-aligned width transition; fixed by waiting for collapsed width before measuring.

## Concerns / Boundaries

- The bundled runtime has Node but no `npm`; Playwright config webServer uses `npm run build:admin && npx vite preview`. For local validation, I copied the nearby base worktree `node_modules` into this assigned worktree and ran the equivalent Node/Vite/Playwright commands directly. No package or lockfile changed.
- Build generated ignored `apps/admin/dist/`; dependency copy generated ignored `node_modules/`; Playwright generated ignored `test-results/`. These are local validation artifacts only and are not part of the PR.
- Owner HTML was sampled locally, but exact group/tenant category source mapping remains from `/Users/atilla/源码/unpacked 6/shell/navigation.ts` because the HTML runtime does not expose every layer category in the initial DOM sample.

# M7-UI-53 Tenant Team Page Evidence

## Status

`implementation_candidate_pending_pr_review_not_accepted_not_runtime_closed`

This branch implements visible UI-first `tenant.team` / 团队 page evidence. It does not claim owner visual acceptance, production runtime closure, authz persistence, audit write, invite email delivery, role CRUD, notification matrix, Telegram binding mutation, GA-0, or 1.0 release approval.

## Scope

- Spec: `docs/specs/M7-UI-53-team-page.md`
- Route: `tenant.team`
- Source target: `apps/admin/src/pages/team/**`
- Test target: `apps/admin/tests/m7-ui-team-page.spec.ts`
- PR base: `codex/m7-ui-31-orders-visible-ui`

## Source Mapping

- Owner HTML: `/Users/atilla/Downloads/运营塔台1.0.html`
- Unpacked page source: `/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx`
- Unpacked fixture source: `/Users/atilla/源码/unpacked 6/fixtures/team.ts`
- Current design system: `docs/admin-design-system.md`

Mapped anatomy:

- Header title: `团队`
- Primary action: `邀请成员`
- Tabs: `成员`, `角色摘要`
- Member table columns: 成员, 角色, 成员类型, 分组, 在线状态, 接待中, 今日累计, 最近登录
- Role summary columns: 角色, 类型, 说明, 成员数, 权限状态
- Dialog/drawer states: invite modal, member detail drawer, disable/restore confirmation

## Data Boundary

- All rows are centralized fallback/mock/degraded data in `apps/admin/src/pages/team/teamFallback.ts`.
- Page does not call API/WS/backend packages.
- Invite and member disable/restore are browser-local only.
- No production authz write, no production team mutation, no invite email, no audit write, no role CRUD, no notification matrix, no Telegram binding flow.

## Validation

Finalizer run in worktree
`/Users/atilla/.codex/worktrees/m7-ui-53-team-page-cleanstack` on branch
`codex/m7-ui-53-team-page-cleanstack`:

| Command | Result | Notes |
|---|---|---|
| `npm run guard:pr-shape -- --base origin/codex/m7-ui-31-orders-visible-ui --spec docs/specs/M7-UI-53-team-page.md --include-worktree` | PASS | changedFiles 8; categories source 5 / test 1 / docs 2; source netLoc 479; source newFiles 3 |
| `npm ci` | PASS | Rebuilt local dependencies to match CI lockfile state; Prettier is `3.8.4` |
| `npx prettier --write apps/admin/src/pages/registry.ts` | PASS | Fixes CI-reported registry formatting under lockfile Prettier `3.8.4` |
| `npm run format:check` | PASS | Full repo format check passes after the registry formatting fix |
| `npm run jscpd` | PASS | No duplicates found after rewriting the team-page route stub to avoid the tenant-management test duplicate block |
| `npm run knip` | PASS | Cleared unused exported type findings by keeping only externally imported team fallback types exported |
| `npm run guard:prettier-ignore` | PASS | `prettier-ignore-boundary: ok (8 baseline file(s), 89/89 marker(s))` |
| `npm run typecheck` | PASS | Initial local `teamMarkup.ts` tuple inference issue fixed in this slice |
| `npm run lint` | PASS | Initial local `TeamPage` complexity issue fixed by extracting confirm modal props |
| `npm run build:admin` | PASS with existing Vite chunk warning | Built `apps/admin/dist`; Vite reports main JS chunk > 500 kB |
| `npx playwright test apps/admin/tests/m7-ui-team-page.spec.ts` | PASS | 4 passed; initial selector ambiguity fixed by scoping restore click to `m7-confirm-modal` |

## Visual Evidence

Artifact directory: `/tmp/uzmax-m7-ui-53-team-page-cleanstack/`

Generated artifacts:

- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/owner-html-team-source-dom-sample.json`
- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/owner-html-team-source-sample.png`
- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/react-team-desktop.png`
- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/react-team-collapsed.png`
- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/react-team-mobile-320.png`
- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/react-team-desktop-metrics.json`
- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/react-team-collapsed-metrics.json`
- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/react-team-mobile-320-metrics.json`
- `/tmp/uzmax-m7-ui-53-team-page-cleanstack/source-sampling.json`

Metric highlights:

- Desktop: `activePageId=tenant.team`, `shellLevel=tenant`, `navWidth=232`,
  `pageWidth=1048`, `memberRows=3`
- Collapsed sidebar: `activePageId=tenant.team`, `shellLevel=tenant`,
  `navWidth=68`, `pageWidth=1212`, `memberRows=3`
- Mobile 320: `bodyScrollWidth=320`, `documentScrollWidth=320`,
  `pageWidth=320`, `drawerWidth=320`

## Self Review Notes

- Topbar/sidebar shell are inherited from current cleanstack trunk and not rewritten in this PR.
- Team page content follows owner Team source density within the slim scope: compact header, two tabs, dense member table, role summary table, invite modal, member drawer.
- Mobile fallback intentionally switches tables to row cards to keep the 320px emergency/readable fallback bounded.
- No owner visual acceptance, runtime closure, production authz/audit/invite closure, GA-0, or 1.0 release approval is claimed.

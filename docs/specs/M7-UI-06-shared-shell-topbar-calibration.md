# M7-UI-06 Shared Shell Topbar Calibration

## Goal

Calibrate the shared `AppShell` topbar visible structure and copy to the owner current HTML / `/Users/atilla/源码/unpacked 6` shell sources.

This is a narrow shared shell/topbar slice. It is not a page-local redesign, not a conversations page implementation, not release acceptance work and not a token/primitives migration.

Required visible target:

- `52px` topbar, white surface, bottom hairline and `0 16px` horizontal rhythm.
- Left breadcrumb: `集团 / <tenant capsule>` with prototype-style tenant capsule, status dot and compact page suffix where applicable.
- Center global search: max about `440px`, `34px` high, owner-style Chinese placeholder `搜索会话、客户、订单、工单、知识...` or matching repo ellipsis shape.
- Right tools: `PRODUCTION` visual marker by default, heartbeat `68ms`, notification icon with badge, operator identity avatar `韩` / `韩雪` / `运营负责人`.
- Tenant names/statuses come from the prototype tenant fixture vocabulary: `玉珠跨境美妆`, `丝路数码`, `天净家居`, `白桦母婴`, with line/status/dot equivalents.

The `PRODUCTION` marker is visual parity for the design/admin shell only. It is not production deployment, GA-0, owner acceptance, release approval or an environment truth claim.

## Owner Confirmation Points And AI Agent Responsibilities

Owner/coordinator:

- Authorized this follow-up after PR #182 visual acceptance was blocked by shared shell/topbar mismatch.
- Treat `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6` as the visual oracle for this slice.
- Keep root/main `/Users/atilla/Applications/UZMAX智能运营` coordination/read-only.
- Preserve M7-UI-05 group/tenant navigation separation: `/design` opens group layer; tenant selection enters tenant layer at `tenant.conversations`.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-06-shared-shell-topbar-calibration` on branch `codex/m7-ui-06-shared-shell-topbar-calibration`.
- Do not edit the root/main checkout.
- Do not edit PR #178 / release acceptance branch, PR #182 / conversations page branch or page-local files.
- Read AGENTS, v1.1 source-of-truth docs, admin design system, M7 ledger/evidence, current shell/tests and owner prototype shell sources before implementation.
- Run Impeccable context and detector, record accepted/rejected design decisions, screenshots or exact screenshot failure and validations honestly.

## Timebox

0.5 workday for spec, shared shell/topbar implementation, focused tests, evidence, screenshots, validation and Draft PR. If the work requires backend/API/DB/authz changes, package/lock changes, raw prototype import, global config/CI changes or page-local visual fixes, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-06-shared-shell-topbar-calibration.md`
  - `docs/evidence/M7/M7-UI-06-shared-shell-topbar-calibration.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/App.tsx`
  - `apps/admin/src/shell/AppShell.tsx`
  - `apps/admin/src/shell/AppShell.css`
  - `apps/admin/tests/m7-ui-foundation.spec.ts`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`
- 未列出的模块默认不可改。

## 变更预算与路径分类

Implementation PR budget:

- source changed files: <= 3
- source net LOC: <= 300
- new source files: 0
- test files changed: <= 2
- docs changed: <= 4
- package/lock/generated/backend/API/DB/worker/cron/CI/guard/global config: 0
- binary screenshots/artifacts committed: 0
- external API/SDK/provider/connector/adapter basis: none; frontend shell calibration only.
- exceptions: none expected.

## 文档触发检查

- 结果：`updated`。
- 判断依据：this PR changes frontend shell/topbar behavior, focused Playwright expectations and M7 evidence/ledger state.

## Required Reads / Source Mapping

Required reads before implementation:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/evidence/M7/M7-UI-05-layered-navigation-shell.md`
- `apps/admin/src/App.tsx`
- `apps/admin/src/shell/AppShell.tsx`
- `apps/admin/src/shell/AppShell.css`
- `apps/admin/tests/m7-ui-foundation.spec.ts`
- `apps/admin/tests/m7-ui-page-router.spec.ts`
- `/Users/atilla/源码/unpacked 6/shell/TopBar.tsx`
- `/Users/atilla/源码/unpacked 6/shell/AppShell.tsx`
- `/Users/atilla/源码/unpacked 6/shell/TenantSwitcher.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/tenants.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html` as read-only visual reference only.
- Impeccable context and `reference/product.md`.

Source mapping:

| Source | Required use |
|---|---|
| AGENTS and v1.1 docs | Product scope, group/tenant IA, admin pure-frontend boundary, release/acceptance and owner-decision boundaries. |
| `docs/admin-design-system.md` | Prototype topbar dimensions, environment marker semantics, tenant switcher shape, mobile fallback and no-overclaim wording. |
| M7-UI-05 evidence/ledger | Merged group/tenant layer separation remains mandatory. |
| Owner `shell/TopBar.tsx` | Topbar anatomy: breadcrumb, tenant capsule, centered global search, environment marker, heartbeat, notification and operator identity. |
| Owner `shell/TenantSwitcher.tsx` | Tenant dropdown row density, search header, dot, line and health badge vocabulary. |
| Owner `fixtures/tenants.ts` | Visible tenant names, business lines, health labels and dot/status color mapping. |
| Current `apps/admin/src/App.tsx` | Replace synthetic tenant display names/status copy while keeping internal route ids stable enough for tests. |
| Current `apps/admin/src/shell/AppShell.tsx` | Replace visible `Tenant` label/select/status string, `Search shell`, `STAGING` default and disabled icon-only identity with prototype-derived topbar structure. |
| Current `apps/admin/src/shell/AppShell.css` | Tune topbar layout/density and mobile fallback without changing page-local styles or tokens. |
| Focused Playwright tests | Preserve shell anchors and group/tenant behavior while updating visible-copy assertions. |

## Implementation Contract

Required behavior:

- Preserve anchors: `admin-shell`, `app-shell-nav`, `tenant-switcher`, `environment-marker`, `system-heartbeat`, `route-breadcrumb`, `active-layer-badge`, `data-shell-level`, `data-active-page-id`.
- Preserve M7-UI-05 behavior: group-only nav on group pages, tenant-only nav on tenant pages, tenant selection goes to `tenant.conversations`, back-to-group returns to `group.overview`.
- Keep a keyboard/accessibility-safe tenant switch control. A visually hidden/native select is allowed if needed for test and accessibility stability.
- Visible shell copy must not show `Search shell`, `Tenant B - Connector degraded`, raw `Tenant` label or default `STAGING` in the admin design shell.
- The default environment marker must render `PRODUCTION`, with evidence explicitly stating this is visual parity only.
- Mobile `320px` fallback must not horizontally overflow.

Out of scope:

- Conversations page files and page-local visual rhythm.
- Release acceptance page files and PR #178.
- Primitives/patterns/token changes.
- Page migrations.
- Backend/runtime APIs, DB, worker, cron or authz.
- Raw prototype fixture/runtime import or committing `/Users/atilla/Downloads/运营塔台1.0.html`.
- Production/release approval, GA-0, 1.0 release language or environment-state claims.

## Impeccable / Design Decisions

Adopted:

- Product register: dense, familiar, operational UI; status and trust beat decoration.
- Prototype topbar density and copy.
- Prototype tenant fixture vocabulary for visible shell labels.
- Current shell anchors and route behavior for stability.

Rejected:

- Old synthetic tenant labels/statuses as topbar default copy.
- Old `STAGING` default marker for the design/admin shell visual target.
- Visible native select label/status string when it competes with the owner tenant capsule.
- Any wording that treats `PRODUCTION` visual marker as deploy, GA-0, owner acceptance or release approval.

## Tests / Evidence Requirements

Implementation evidence must include:

- Required reads list and source mapping.
- Accepted/rejected design decisions.
- Validation table with exact commands and results.
- Desktop and mobile screenshot paths under `/tmp/uzmax-m7-ui-06-shared-shell-topbar-calibration/`, including `/design` group layer and a tenant-selected state, or exact failure if blocked.
- Impeccable detect result for changed shell files.
- Explicit boundary that `PRODUCTION` marker is visual parity and not production/GA approval.

Focused tests must cover:

- `/design` initial group shell uses group-only nav and prototype topbar copy.
- Tenant selection enters `tenant.conversations`, uses tenant-only nav and prototype tenant visible name.
- `group.release` and `tenant.queue` still do not expose the opposite nav tree.
- Topbar anchors remain present.
- `320px` fallback has no horizontal overflow.

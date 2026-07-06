# M7-UI-94 Template Center Default Visual Parity Refresh

## Goal

Refresh the default visible `group.templates` / `模板中心` page on top of `codex/m7-ui-93-connection-center-default-visual-parity-refresh` so the default body, header, runtime/source note, card copy, copy modal/toast, forced URL states and mobile fallback read like a real group-level template operations page instead of a fixture/runtime explanation surface.

This is default visual parity only. It preserves the M7-UI-71 source-shaped template-center anatomy and does not implement template DB/API/runtime, ops-assets wiring, production template copy, tenant config persistence, audit writes, KB/persona/config/eval/template writes, owner visual acceptance, GA/1.0, production deployment, real customer/order data, customer LLM or release approval.

Default visible `group.templates` body/header/subtitle/runtime/source note/card copy/modal copy/toast/forced states/mobile body must not contain `degraded`, `mock`, `read-only`, `browser-local only`, `synthetic`, `Synthetic`, `no production template copy`, `no audit write`, `no config write`, `mock/local history` or `synthetic read-only`. Runtime/copy/audit/config boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`, `aria-description` and focused Playwright metrics.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not template runtime or release closure.
- Confirm `group.templates` remains GROUP layer only: `/design` opens group shell, active page `group.templates`, no `data-tenant-id`, group categories only and tenant nav does not mix into group nav.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future template DB/API/runtime, ops-assets, production copy, config/KB/persona/eval/template write or audit-write work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-94-template-center-default-visual-parity-refresh` on branch `codex/m7-ui-94-template-center-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register/clarify guidance, M7-UI-50/71 template-center spec/evidence, M7-UI-92/93 default-refresh pattern, current template-center source/tests/evidence, owner HTML and unpacked template-center source before edits.
- Modify only the allowed template-center page/test/doc paths.
- Preserve group shell, active page `group.templates`, no `data-tenant-id`, group-only nav, owner/source-shaped tabs/card grid/eval badges/copy modal/toast, loading/empty/error/permission/degraded URL states, collapsed sidebar and mobile 320 fallback.

## Timebox

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, real template runtime, ops-assets wiring, production template copy, config/KB/persona/eval/template write or audit write changes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
  - `apps/admin/tests/m7-ui-template-center.spec.ts`
  - `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-94-template-center-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-94-template-center-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 3
- source net LOC: <= 180
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/topbar/router/PageOutlet/registry/API: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/group/GroupTemplatePage.tsx
  - apps/admin/src/pages/group/GroupTemplateViews.tsx
  - apps/admin/src/pages/group/groupTemplateFallback.ts
test:
  - apps/admin/tests/m7-ui-template-center.spec.ts
  - apps/admin/tests/m7-ui-template-center-source-parity.spec.ts
  - apps/admin/tests/m7-ui-template-center-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-94-template-center-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-94-template-center-default-visual-parity-refresh.md
  - docs/evidence/M7/README.md
  - docs/admin-ui-page-migration-ledger.md
generated: []
lock: []
config: []
```

## Required Reads And Source Mapping

Required reads before edits:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- Impeccable project context, product register and clarify guidance
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-50-template-center-page.md`
- `docs/specs/M7-UI-71-template-center-source-parity-refresh.md`
- `docs/specs/M7-UI-92-tenant-management-default-visual-parity-refresh.md`
- `docs/specs/M7-UI-93-connection-center-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-50-template-center-page.md`
- `docs/evidence/M7/M7-UI-71-template-center-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-93-connection-center-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/group/GroupTemplatePage.tsx`
- `apps/admin/src/pages/group/GroupTemplateViews.tsx`
- `apps/admin/src/pages/group/groupTemplateFallback.ts`
- `apps/admin/tests/m7-ui-template-center.spec.ts`
- `apps/admin/tests/m7-ui-template-center-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`
- `/Users/atilla/源码/unpacked 6/shell/navigation.ts`
- v1.1 template center/group-layer/mobile fallback and acceptance/release boundaries.

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Primary visual/source oracle for `模板中心` and group shell context. |
| Unpacked group template page | Source anatomy: title `模板中心`, subtitle `复制到租户将生成独立版本`, five tabs, dense card grid, eval badge, version/meta/recent-copy line, copy action, centered modal, tenant rows and toast shape. |
| Unpacked `fixtures/groupPlatform.ts` | Field-shape reference for `TMPL_TABS`, `TMPL_EVAL`, `TMPL_LIB` and `GROUP_TENANTS`; React keeps centralized fallback data and `SYN-TMPL-*` / `SYN-COPY-*` refs. |
| Unpacked `navigation.ts` | Group-only category and `g_tmpl` shell mapping reference. |
| M7-UI-71 template source refresh | Preserve source-shaped card/modal/toast layout while moving visible engineering/runtime labels into hidden/data/title/ARIA evidence. |
| M7-UI-92/93 default refreshes | Test/evidence pattern for clean visible default body with hidden/data/title/ARIA runtime boundaries. |
| Existing React template page | Preserve page-local fallback, focused test ids and local copy interactions; move engineering/runtime caveats out of default visible body and feedback into hidden/data/title/ARIA evidence. |

`rg` conclusions:

- `rg -n "degraded|mock|read-only|browser-local only|synthetic|Synthetic|no production template copy|no audit write|no config write|mock/local history|synthetic read-only" apps/admin/src/pages/group apps/admin/tests/m7-ui-template-center*.spec.ts` found visible leaks in header descriptor, runtime note, eval labels, copy line, modal subcopy, toast, forced state copy and stale focused tests.
- `rg --files apps/admin/src/pages/group apps/admin/tests docs/specs docs/evidence/M7 | rg 'GroupTemplate|groupTemplate|template-center|M7-UI-(50|71|92|93)|admin-ui-page-migration-ledger|M7/README'` found the existing page-local template implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "模板中心|复制到租户|复制后生成独立版本|TMPL_TABS|TMPL_EVAL|TMPL_LIB|GROUP_TENANTS|g_tmpl" /Users/atilla/Downloads/运营塔台1.0.html "/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx" "/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts" "/Users/atilla/源码/unpacked 6/shell/navigation.ts"` confirmed the owner/source mapping to preserve.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-94-template-center-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-94-template-center-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-94-template-center-default-visual-parity-refresh` |
| worker `git rev-parse HEAD` | `4dc46734e746a6500afc8171cc84eae1781f76b0` |
| base | `codex/m7-ui-93-connection-center-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `group.templates` visible body, header badge, runtime/source note, card eval/copy line, modal copy, toast and URL states use business-readable Chinese operations copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `read-only`, `browser-local only`, `no production template copy`, `no audit write` and `no config write`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; cards, modal, toast and forced state surfaces expose boundary metadata.
- Template cards remain centralized fallback data, source-shaped from M7-UI-71 and owner/unpacked source.
- Copy modal remains page-local state only and does not create production template versions or tenant config.
- Toast remains page-local feedback only and does not write audit/config/template records.
- The default group layer remains unchanged: `/design` opens group layer and `模板中心` maps to `group.templates`.

## Design Skill Layer

Adopted Impeccable/product-register/clarify guidance: restrained product UI, dense operational template-center copy, owner/source-like card/modal vocabulary, hidden-but-present runtime boundaries, familiar tab/card/modal controls and mobile no-overflow fallback.

Rejected: visible engineering labels in default body/feedback/accessibility labels, old shell visual vocabulary, old `--uzmax-*` as visual source, broad redesign, production-looking template runtime, ops-assets wiring, audit/config/KB/persona/eval/template writes and owner-acceptance/runtime/release claims.

## Pass Conditions

- Default `group.templates` visible body contains no forbidden engineering terms.
- Modal/toast visible feedback and accessible names contain no forbidden engineering terms.
- Forced URL states show business-readable loading/empty/error/permission copy while hidden/data/title/ARIA evidence still contains runtime/copy/audit/config boundary labels.
- Existing template-center interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, copy modal/toast feedback with clean visible copy, forced states, group/tenant nav separation, collapsed nav and mobile 320 body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No template DB/API/runtime, ops-assets wiring, production template copy, template persistence, tenant config persistence, audit write, KB/persona/eval/config/template write, production authz integration, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No broad redesign, raw production fixture import or real customer/order/Telegram/address/phone/production data.

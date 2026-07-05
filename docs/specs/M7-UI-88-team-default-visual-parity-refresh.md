# M7-UI-88 Team Default Visual Parity Refresh

## Goal

Refresh the default `tenant.team` / `团队` fallback on top of `codex/m7-ui-87-ai-members-default-visual-parity-refresh` so the default visible body looks like an operational team-management page instead of an engineering/runtime caveat page.

This is default visual parity only. It does not implement team DB/API/runtime, production authz writes, permission persistence, invite email sending, Telegram binding persistence, audit writes, owner visual acceptance, GA/1.0, production deployment, real customer data or release approval.

Default visible `tenant.team` header, members/roles tabs, search/empty state, invite modal, role editor/delete confirm, member drawer, toast, URL states and mobile body must not contain `degraded`, `mock`, `read-only`, `browser-local only`, `no production authz write`, `no team mutation`, `no invite email send`, `no Telegram binding change`, `no audit write` or `local-only`. Runtime/write boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`, `aria-description` and focused Playwright metrics.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not team runtime or release closure.
- Confirm `tenant.team` remains TENANT layer only after selecting a tenant from `/design`.
- Keep final owner visual acceptance, production/staging, real customer data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future team DB/API/runtime/authz/audit/invite/Telegram persistence work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-88-team-default-visual-parity-refresh` on branch `codex/m7-ui-88-team-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register, current team source/tests/evidence, owner HTML and unpacked team page/fixtures before edits.
- Modify only the allowed team page/test/doc paths.
- Preserve members/roles tabs, invite modal, role editor/delete confirm, member drawer, search, loading/empty/error/permission/degraded URL states, collapsed sidebar and mobile 320 fallback.

## Timebox

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, real team runtime, invite email, Telegram persistence or audit writes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/team/TeamPage.tsx`
  - `apps/admin/src/pages/team/TeamViews.tsx`
  - `apps/admin/src/pages/team/TeamDialogs.tsx`
  - `apps/admin/src/pages/team/teamFallback.ts`
  - `apps/admin/tests/m7-ui-team-page.spec.ts`
  - `apps/admin/tests/m7-ui-team-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-88-team-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-88-team-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 4
- source net LOC: <= 180
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/PageOutlet/registry: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/team/TeamPage.tsx
  - apps/admin/src/pages/team/TeamViews.tsx
  - apps/admin/src/pages/team/TeamDialogs.tsx
  - apps/admin/src/pages/team/teamFallback.ts
test:
  - apps/admin/tests/m7-ui-team-page.spec.ts
  - apps/admin/tests/m7-ui-team-source-parity.spec.ts
  - apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-88-team-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-88-team-default-visual-parity-refresh.md
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
- Impeccable project context and product register
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-53-team-page.md`
- `docs/specs/M7-UI-75-team-source-parity-refresh.md`
- `docs/specs/M7-UI-87-ai-members-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-75-team-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-87-ai-members-default-visual-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/team/TeamPage.tsx`
- `apps/admin/src/pages/team/TeamViews.tsx`
- `apps/admin/src/pages/team/TeamDialogs.tsx`
- `apps/admin/src/pages/team/teamFallback.ts`
- `apps/admin/tests/m7-ui-team-page.spec.ts`
- `apps/admin/tests/m7-ui-team-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-ai-members-default-visual-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/team.ts`

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Browser/source oracle for the `团队` surface and shell context. |
| Unpacked team page | Source anatomy: title, tabs, primary actions, member/role tables, invite modal, role editor, member drawer and delete confirmation vocabulary/geometry. |
| Unpacked `fixtures/team.ts` | Wording and field-shape reference for team members, roles, permission groups and member controls; do not treat as production data. |
| M7-UI-87 AI members default refresh | Test and evidence pattern for clean visible default body with hidden/data/title runtime boundaries. |
| Existing React team page | Preserve page-local fallback, focused test ids and local interactions; move engineering/runtime caveats out of default visible body into hidden/data/title evidence. |

`rg` conclusions:

- `rg -n "degraded|mock|read-only|browser-local only|no production authz write|no team mutation|no invite email send|no Telegram binding change|no audit write|local-only|locally|created role|deleted role|invite added" apps/admin/src/pages/team apps/admin/tests/m7-ui-team*.spec.ts` found visible leaks in runtime note expectations, forced state copy, search empty copy, toast copy, invite/member drawer notes and delete confirm description.
- `rg --files apps/admin/src/pages/team apps/admin/tests docs/specs docs/evidence/M7 | rg 'team|M7-UI-88|M7-UI-87|M7-UI-75'` found the existing page-local team implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "团队|成员|角色管理|邀请成员|新建角色|Telegram 绑定|通知偏好" /Users/atilla/源码/unpacked\ 6/pages/team/TeamPage.tsx /Users/atilla/源码/unpacked\ 6/fixtures/team.ts` confirmed the owner/source-like labels and anatomy to preserve.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-88-team-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-88-team-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-88-team-default-visual-parity-refresh` |
| base | `codex/m7-ui-87-ai-members-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.team` visible header, tables, empty copy, toast, invite modal, role editor, member drawer, delete confirm and URL states use business Chinese operations copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `read-only`, `browser-local only`, `no production authz write`, `no team mutation`, `no invite email send`, `no Telegram binding change` and `no audit write`.
- Internal ids/testids may remain for tests/evidence, but user-facing visible labels and accessible names are clean.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; modal/drawer/toast/state/local controls expose boundary metadata.
- Search, invite, role create/edit/delete, notification preference, Telegram binding preview and disable/restore remain page-local fallback interactions only.

## Design Skill Layer

Adopted Impeccable/product-register guidance: restrained product UI, dense operational copy, owner/source-like team workflow vocabulary, hidden-but-present runtime boundaries, familiar status/action controls and mobile no-overflow fallback. No design suggestions were rejected except where governance requires hidden runtime caveats instead of visible engineering labels.

## Pass Conditions

- Default `tenant.team` visible body contains no forbidden engineering terms.
- Hidden DOM/data/title/ARIA evidence still contains runtime/write boundary labels.
- Existing team page interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, local interactions with clean visible copy, forced states, collapsed nav, mobile body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint if practical, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No real team-member mutation, permission write, invite email, Telegram binding persistence, audit write, production authz integration, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No broad redesign, raw production fixture import or real customer/order/Telegram/address/phone/production data.

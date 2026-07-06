# M7-UI-89 Config Default Visual Parity Refresh

## Goal

Refresh the default `tenant.config` / `配置` fallback on top of `codex/m7-ui-88-team-default-visual-parity-refresh` so the default visible body reads like an operational configuration page instead of an engineering/runtime caveat page.

This is default visual parity only. It does not implement config DB/API/runtime, production config writes, audit writes, connector runtime switching, connector API calls, eval-gated publish, order import runtime, owner visual acceptance, GA/1.0, production deployment, real customer/order data or release approval.

Default visible `tenant.config` body, save/version/history/rollback, channel test/toggle, connector test/switch confirm, URL states and mobile body must not contain `degraded`, `mock`, `browser-local only`, `no production config write`, `no audit write`, `no connector switch`, `no eval-gated publish`, `no API call`, `local-only` or `Synthetic`. Runtime/write boundaries must remain available in hidden DOM, `data-runtime-boundary`, `title`, `aria-description` and focused Playwright metrics.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a default visual parity refresh only, not config runtime or release closure.
- Confirm `tenant.config` remains TENANT layer only after selecting a tenant from `/design`.
- Keep final owner visual acceptance, production/staging, real customer/order data, LLM key, cost, compliance, GA/1.0 and release decisions owner-only.
- Decide any future config DB/API/runtime/audit/connector/eval publish work through separate approved specs.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-89-config-default-visual-parity-refresh` on branch `codex/m7-ui-89-config-default-visual-parity-refresh`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read `AGENTS.md`, Impeccable context/product register, current config source/tests/evidence, owner HTML and unpacked config page/fixtures/hook before edits.
- Modify only the allowed config page/test/doc paths.
- Preserve internal nav, business/SLA/template/model/cost/breaker/channel/connector sections, version history, dirty save, rollback confirm, channel test/toggle, connector test/switch confirm, loading/empty/error/permission/degraded URL states, collapsed sidebar and mobile 320 fallback.

## Timebox

0.5 workday. If API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry, global config, CI, production/staging, real config runtime, connector switch/API call, eval publish or audit writes are required, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/admin/src/pages/config/ConfigPage.tsx`
  - `apps/admin/src/pages/config/configFallback.ts`
  - `apps/admin/tests/m7-ui-config-page.spec.ts`
  - `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
  - `apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts`
  - `docs/specs/M7-UI-89-config-default-visual-parity-refresh.md`
  - `docs/evidence/M7/M7-UI-89-config-default-visual-parity-refresh.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 2
- source net LOC: <= 160
- new source files: 0
- test files changed/added: <= 3
- docs changed/added: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config/shared shell/sidebar/topbar/router/PageOutlet/registry: 0
- external API/SDK/provider/connector/adapter basis: none; local browser evidence only.
- exceptions: none.

```yaml
source:
  - apps/admin/src/pages/config/ConfigPage.tsx
  - apps/admin/src/pages/config/configFallback.ts
test:
  - apps/admin/tests/m7-ui-config-page.spec.ts
  - apps/admin/tests/m7-ui-config-source-parity.spec.ts
  - apps/admin/tests/m7-ui-config-default-visual-parity.spec.ts
docs:
  - docs/specs/M7-UI-89-config-default-visual-parity-refresh.md
  - docs/evidence/M7/M7-UI-89-config-default-visual-parity-refresh.md
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
- `docs/specs/M7-UI-54-config-page.md`
- `docs/specs/M7-UI-76-config-source-parity-refresh.md`
- `docs/specs/M7-UI-88-team-default-visual-parity-refresh.md`
- `docs/evidence/M7/M7-UI-76-config-source-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/config/ConfigPage.tsx`
- `apps/admin/src/pages/config/configFallback.ts`
- `apps/admin/tests/m7-ui-config-page.spec.ts`
- `apps/admin/tests/m7-ui-config-source-parity.spec.ts`
- `apps/admin/tests/m7-ui-team-default-visual-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx`
- `/Users/atilla/源码/unpacked 6/fixtures/config.ts`
- `/Users/atilla/源码/unpacked 6/hooks/useConfig.ts`

Source mapping:

| Source | Required use |
|---|---|
| Owner HTML | Browser/source oracle for the `配置` surface and shell context. |
| Unpacked config page | Source anatomy: 8-section internal nav, version header, history, channel controls, connector confirmation and right-pane geometry. |
| Unpacked `fixtures/config.ts` and `hooks/useConfig.ts` | Wording and field-shape reference for config sections, versions/history and local transitions; do not treat as production data. |
| M7-UI-76 config source refresh | Preserve source-parity geometry and hidden runtime evidence while cleaning default visible copy. |
| M7-UI-87/88 default refreshes | Test and evidence pattern for clean visible default body with hidden/data/title/ARIA runtime boundaries. |
| Existing React config page | Preserve page-local fallback, focused test ids and local interactions; move engineering/runtime caveats out of default visible body into hidden/data/title evidence. |

`rg` conclusions:

- `rg -n "degraded|mock|browser-local only|no production config write|no audit write|no connector switch|no eval-gated publish|no API call|local-only|Synthetic" apps/admin/src/pages/config apps/admin/tests/m7-ui-config*.spec.ts` found visible leaks in toast copy, confirmation description, reason placeholders, forced state copy and stale tests.
- `rg --files apps/admin/src/pages/config apps/admin/tests docs/specs docs/evidence/M7 | rg 'config|M7-UI-89|M7-UI-76|M7-UI-88'` found the existing page-local config implementation and focused tests; this slice extends them in place and adds one focused default visual parity test.
- `rg -n "业务配置|版本历史|订单 connector|保存并生成版本|测试连接" /Users/atilla/源码/unpacked\ 6/pages/config/ConfigPage.tsx /Users/atilla/源码/unpacked\ 6/fixtures/config.ts /Users/atilla/源码/unpacked\ 6/hooks/useConfig.ts` confirmed the owner/source-like labels and anatomy to preserve.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-89-config-default-visual-parity-refresh` |
| worker `git status --short --branch` | `## codex/m7-ui-89-config-default-visual-parity-refresh` |
| worker `git branch --show-current` | `codex/m7-ui-89-config-default-visual-parity-refresh` |
| base | `codex/m7-ui-88-team-default-visual-parity-refresh` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` for writes |

## Functional Contract

- Default `tenant.config` visible header, body, state copy, toast and confirmations use business Chinese operations copy.
- Hidden/data/title/ARIA evidence retains `degraded`, `mock`, `browser-local only`, `no production config write`, `no audit write`, `no connector switch`, `no eval-gated publish` and `no API call`.
- Page root exposes `data-runtime-boundary`; hidden runtime note exposes the same boundary; modal/toast/state controls expose boundary metadata.
- Save/version/history/rollback, channel test/toggle and connector test/switch remain page-local fallback interactions only.
- The default group layer and tenant entry boundary remain unchanged: `/design` opens group layer, tenant selection enters tenant layer, and `配置` maps to `tenant.config`.

## Design Skill Layer

Adopted Impeccable/product-register guidance: restrained product UI, dense operational copy, owner/source-like config workflow vocabulary, hidden-but-present runtime boundaries, familiar status/action controls and mobile no-overflow fallback.

Rejected: visible engineering labels in default body, old shell visual vocabulary, old `--uzmax-*` as visual source, broad redesign, production-looking config writes, real audit-write claims, connector switching/API calls, eval-gated publish and owner-acceptance claims.

## Pass Conditions

- Default `tenant.config` visible body contains no forbidden engineering terms.
- Hidden DOM/data/title/ARIA evidence still contains runtime/write boundary labels.
- Existing config page interaction coverage and source-parity coverage pass after updated boundary expectations.
- Focused default visual parity Playwright covers clean default body, version/history local interactions with clean visible copy, connector actions with clean visible copy, forced states, collapsed nav and mobile 320 body plus hidden boundary metrics.
- `git diff --check`, direct `pr-shape`, touched Prettier/ESLint if practical, admin build and focused Playwright pass or failures are recorded honestly.

## Non-Goals

- No API client, backend/API, DB, package/lock, shared shell/topbar/sidebar/router/PageOutlet/registry or global config changes.
- No real config persistence, production config write, audit write, connector runtime switch, connector API call, order import runtime, eval-gated publish, production authz integration, runtime close, owner visual acceptance, merge closure, GA-0, production readiness or 1.0 release approval.
- No broad redesign, raw production fixture import or real customer/order/Telegram/address/phone/production data.

# M7-UI-54 Tenant Config Page Cleanstack

## Goal

Implement a slim visible tenant-layer `tenant.config` / 配置 page from the owner prototype `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/config/ConfigPage.tsx`, and `/Users/atilla/源码/unpacked 6/fixtures/config.ts`.

This slice is high-fidelity visible UI migration with deliberately narrow runtime scope. It keeps group-layer tenant management and tenant-layer config separated: the config page appears only after selecting a tenant. The visible page preserves the owner source's config grouping, version header, local save/version pattern, rollback confirmation, channel summary, connector summary, dangerous connector switch confirmation, degraded/runtime boundary copy, permission/locked state, and mobile readable fallback. It does not implement all eight owner config sections in full; this cleanstack slice keeps representative business/SLA/channel/connector groups to stay inside the M7 source budget.

## Owner Confirmation Points

- Owner confirms whether the visible tenant config page matches the current owner HTML/source system within this slim representative scope.
- Owner separately decides any future real DB/API/authz/RLS/config/audit/connector runtime scope.
- AI agents may implement, review, and produce evidence; they cannot approve production config mutation, connector switching, audit closure, owner acceptance, GA-0, or release acceptance.

## Timebox

2026-07-07. If owner source/evidence is unavailable, record source unavailability and keep React assertions hard.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

- `docs/specs/M7-UI-54-config-page.md`
- `docs/evidence/M7/M7-UI-54-config-page.md`
- `apps/admin/src/pages/config/**`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/tests/m7-ui-config-page.spec.ts`

- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：No `packages/db`, lockfile, CI/global config, root checkout, sidebar/topbar/shell rewrite, or unrelated docs.

## Change Budget

- New source files <= 5
- `apps/admin/src/pages/config/**` total lines <= 560
- `ConfigPage.tsx` <= 240 lines
- `configFallback.ts` <= 160 lines
- Net source LOC <= 600
- Test LOC is reported but not counted against source budget
- No generated, lockfile, migration, provider, connector, external API, backend, DB, authz, RLS, audit runtime, or CI/global config changes
- No `large_change_exception`, no `test_weakening_exception`

## Implementation Contract

- Use current base `codex/m7-ui-31-orders-visible-ui` as the cleanstack trunk.
- Add a tenant config page under `apps/admin/src/pages/config`.
- Wire `tenant.config` in `registry.ts` and `PageOutlet.tsx`; renderer returns `{ content: <ConfigPage key={selectedTenantId} selectedTenantId={selectedTenantId} /> }`.
- Registry/evidence wording must not say `not_started` for this page after implementation.
- Page includes config grouping, business config, SLA, channel config, order connector, version history, rollback confirmation, dangerous connector switch confirmation, permission denied/locked state, degraded/mock/local-only boundary copy, and mobile readable fallback.
- Use centralized fallback/mock/degraded data; no API calls, no production config write, no connector switch execution, no audit write, no DB/authz/RLS/API.
- All visual values must resolve through existing prototype-derived tokens/classes. No page-local CSS variables, no legacy `--uzmax-*`, no old side-stripe patterns.

## Design Skill Decision Record

- Impeccable product register was used because this is an admin/product UI slice.
- Adopted: dense task-first product surface, tokenized restrained color, fixed type scale, visible state labels, mobile structural fallback, no decorative motion.
- Adopted: visible permission/locked and degraded copy for every forced state.
- Adopted: reduced section count to representative business/SLA/channel/connector groups to respect explicit source budget while preserving the owner source's config/version/dangerous-action shape.
- No Impeccable suggestion was rejected. AGENTS/source-of-truth boundaries remain higher priority than design defaults.

## Acceptance

- `/design` can enter tenant context and open `tenant.config` only from tenant-layer navigation after selecting a tenant.
- Default degraded view shows config grouping, business config, SLA, channel config, connector summary, local-only runtime note, and no production runtime claim.
- Forced states cover `loading`, `empty`, `error`, `permission`, and `degraded`.
- Save, rollback, channel test/toggle, connector test, and connector switch are browser-local only and visibly say so.
- Desktop, collapsed sidebar, and 320px mobile fallback screenshots/metrics/source sampling are saved under `/tmp/uzmax-m7-ui-54-config-page-cleanstack/`.
- Focused Playwright `apps/admin/tests/m7-ui-config-page.spec.ts` passes.

## Failure Branches

- If owner HTML or unpacked Config source is missing, record source unavailability in evidence/artifacts and keep React assertions hard.
- If npm/runtime dependencies are unavailable, report exact missing command/dependency and keep diff/guard/source checks.
- If adding any path outside Touch Modules is required, stop and report before editing.

## Out Of Scope

- No DB/API/authz/RLS changes.
- No production config write, connector switch execution, audit write, eval-gated publish, real permission persistence, or owner release signoff.
- No group tenant management changes.
- No sidebar/topbar/shell rewrite.

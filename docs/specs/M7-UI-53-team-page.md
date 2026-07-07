# M7-UI-53 Tenant Team Page Cleanstack

## Goal

Implement the visible tenant-layer `tenant.team` page from the owner prototype `/Users/atilla/Downloads/运营塔台1.0.html` and `/Users/atilla/源码/unpacked 6/pages/team/TeamPage.tsx`.

This is a high-fidelity visible-UI migration slice with deliberately slim runtime scope. Visual acceptance compares against the current owner HTML/prototype system for layout density, team tabs, member table, role summary table, invite dialog, member detail drawer, state copy, and mobile fallback. Group-layer tenant management and tenant-layer team management stay separate: this team page appears only after selecting a tenant.

## Owner Confirmation Points

- Owner confirms whether the visible team page matches the current owner HTML/source system.
- Owner separately decides any future real DB/API/authz/audit/invite runtime scope.
- AI agents may implement, review, and produce evidence; they cannot approve production team mutation, audit closure, or release acceptance.

## Timebox

2026-07-07. If owner source/evidence is unavailable, stop at a degraded visible candidate and record the failed evidence branch.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

- `docs/specs/M7-UI-53-team-page.md`
- `docs/evidence/M7/M7-UI-53-team-page.md`
- `apps/admin/src/pages/team/**`
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- `apps/admin/tests/m7-ui-team-page.spec.ts`

- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：No `packages/db`, lockfile, CI/global config, root checkout, or unrelated docs.

## Change Budget

- Source changed files <= 12
- Net source LOC <= 600
- New source files <= 5
- Test LOC is reported but not counted against source budget
- No generated, lockfile, migration, provider, connector, or external API changes
- No `large_change_exception`, no `test_weakening_exception`

## Implementation Contract

- Use current base `codex/m7-ui-31-orders-visible-ui` as the cleanstack trunk.
- Add/organize a tenant team page under `apps/admin/src/pages/team`.
- Wire `tenant.team` in `registry.ts` and `PageOutlet.tsx`; renderer returns `{ content: <TeamPage ... /> }`.
- Registry/evidence wording must not say `not_started` for this page after implementation.
- Page includes members list, role summary/permission state, one invite local-only dialog, one member detail drawer, disable/restore confirmation, permission denied/disabled state, degraded/mock/local-only boundary states.
- Use centralized fallback/mock/degraded data; no API calls, no production authz writes, no invite email, no audit write, no role CRUD, no notification matrix, no Telegram binding flow.
- All visual values must resolve through existing `packages/ui-tokens -> primitives -> patterns -> pages` tokens/classes. No page-local CSS variables, no legacy `--uzmax-*`, no old side-stripe patterns.

## Design Skill Decision Record

- Impeccable product register was used because this is an admin/product UI slice.
- Adopted: dense task-first product surface, tokenized restrained color, fixed type scale, visible state labels, mobile structural fallback, no decorative motion.
- Adopted: reject old side stripes, gradients, glassmorphism, oversized card/hero patterns, and page-local token invention.
- No Impeccable suggestion was rejected. AGENTS/source-of-truth boundaries remain higher priority than design defaults.

## Acceptance

- `/design` can enter tenant context and open `tenant.team` only from tenant-layer navigation after selecting a tenant.
- Default degraded view shows member table, role tab/table, local-only runtime note, visible mock/degraded/read-only labels, and no production runtime claim.
- Forced states cover `loading`, `empty`, `error`, `permission`, and `degraded`.
- Invite, member detail drawer, disable, and restore are browser-local only and visibly say so.
- Desktop, collapsed sidebar, and 320px mobile fallback screenshots/metrics are saved under `/tmp/uzmax-m7-ui-53-team-page-cleanstack/`.
- Focused Playwright `apps/admin/tests/m7-ui-team-page.spec.ts` passes.

## Failure Branches

- If owner HTML or unpacked Team source is missing, record source unavailability in evidence and keep React assertions hard.
- If npm/runtime dependencies are unavailable, report exact missing command/dependency and keep diff/guard/source checks.
- If adding any path outside Touch Modules is required, stop and report before editing.

## Out Of Scope

- No DB/API/authz/RLS changes.
- No production member mutation, invite email/send, audit write, role CRUD, notification matrix, Telegram binding flow, real permission persistence, or owner release signoff.
- No group tenant management changes.
- No sidebar/topbar rewrite.

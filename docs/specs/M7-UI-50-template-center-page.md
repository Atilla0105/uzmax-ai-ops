# M7-UI-50 Template Center Page

## Goal

Implement a UI-first `group.templates` / `模板中心` visible page on top of `origin/codex/m7-ui-31-orders-visible-ui` at `7366ebbdc6f69e588d282fe5cb1556e19369d164`.

## Owner Confirmation Points

- Owner visual/source truth: `/Users/atilla/Downloads/运营塔台1.0.html`, `/Users/atilla/源码/unpacked 6/pages/group/GroupTemplatePage.tsx`, `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts`, and `docs/admin-design-system.md`.
- This supersedes the old ledger placeholder `M7-UI-04C-group-template`.
- This is a GROUP layer page. It renders group-only navigation; modal tenant rows are browser-local copy targets, not tenant navigation.
- Template rows and tenant targets are centralized synthetic/mock/degraded data derived from owner fixture values.
- Copy-to-tenant confirmation is browser-local only. It does not persist templates, write audit, write tenant config, wire ops-assets, write knowledge/eval/persona/quick-reply assets, or close runtime/template-copy readiness.
- No owner visual acceptance, runtime closure, production template copy, tenant config/knowledge/eval/persona/quick-reply write, GA-0, or 1.0 release approval is claimed.

## 时间盒

One focused worker slice. If the page cannot render with visible UI plus state/test/evidence coverage inside this branch, stop and mark `blocked_by_visual_or_validation_failure`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-50-template-center-page.md`
  - `docs/evidence/M7/M7-UI-50-template-center-page.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `docs/evidence/M7/README.md`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/src/pages/group/GroupTemplatePage.tsx`
  - `apps/admin/src/pages/group/GroupTemplateViews.tsx`
  - `apps/admin/src/pages/group/groupTemplateFallback.ts`
  - `apps/admin/tests/m7-ui-template-center.spec.ts`
- 未列出的模块默认不可改。

## Path Classification

```yaml
source:
  - apps/admin/src/pages/PageOutlet.tsx
  - apps/admin/src/pages/registry.ts
  - apps/admin/src/pages/group/GroupTemplatePage.tsx
  - apps/admin/src/pages/group/GroupTemplateViews.tsx
  - apps/admin/src/pages/group/groupTemplateFallback.ts
test:
  - apps/admin/tests/m7-ui-template-center.spec.ts
docs:
  - docs/specs/M7-UI-50-template-center-page.md
  - docs/evidence/M7/M7-UI-50-template-center-page.md
  - docs/admin-ui-page-migration-ledger.md
  - docs/evidence/M7/README.md
generated: []
lock: []
config: []
```

## Change Budget

- Changed source files <= 5.
- New source files <= 3.
- Net source LOC <= 600.
- Each React component file <= 250 lines.
- No `large_change_exception` planned.

## PR Hygiene Notes

- New source `rg` conclusion: searched `group.templates`, `GroupTemplate`, `模板中心`, `M7-UI-04C`, `M7-UI-50`, existing M7 group page patterns, and old M5 template center files. The current route was registry/scaffold-only and old M5 template center/runtime wiring remains legacy-only and out of scope. New page source belongs under `apps/admin/src/pages/group/**` to match current M7 page workers.
- External API/SDK/provider/connector/adapter basis: none. This page intentionally does not call API/DB/runtime or external providers.
- Exceptions: none.

## 文档触发检查

- 结果：`updated`.
- 判断依据：page migration ledger and M7 evidence index are owned outputs for this UI page slice.

## Preconditions

- Worktree: `/Users/atilla/.codex/worktrees/m7-ui-50-template-center-page-cleanstack`.
- Branch: `codex/m7-ui-50-template-center-page-cleanstack`.
- Base: `origin/codex/m7-ui-31-orders-visible-ui` at `7366ebbdc6f69e588d282fe5cb1556e19369d164`.
- Root/main checkout is read-only coordination; all edits stay in the assigned worktree.
- Startup recorded `pwd`, `git status --short --branch`, and `git branch --show-current`.

## Implementation Contract

- Update `registry.ts` so `group.templates` targets `M7-UI-50-template-center-page`, implemented pending PR, evidence pending not accepted/not runtime closed.
- Update `PageOutlet.tsx` to render `<GroupTemplatePage />` for `group.templates`; the rendered group section must not carry `data-tenant-id`.
- Preserve source structure: group-layer page header, subtitle `复制到租户将生成独立版本`, five tabs, dense card grid, eval badges, version/meta/recent copy line, copy-to-tenant action, centered modal with tenant multi-select rows and disabled/enabled confirm.
- Centralize synthetic data and styles in `groupTemplateFallback.ts`; use `SYN-TMPL-*` and `SYN-COPY-*` refs.
- URL query `?m7TemplateState=loading|empty|error|permission|degraded` and legacy-compatible `?state=...` render deterministic states. Default is degraded/interactive mock.
- Local interactions only: switch tabs, open copy modal, select copy targets, confirm browser-local copy toast.

## Impeccable / Design Skill Layer

- Adopted: dense, restrained, status-first product UI; owner prototype layout and copy shape; visible degraded/mock/read-only/local-only boundaries; group-only nav separation; mobile 320 no-overflow fallback.
- Rejected: old M5 runtime template center wiring, old `--uzmax-*` visual source, production-looking template persistence, audit/config/ops-assets writes, tenant config/knowledge/eval/persona/quick-reply writes, and any owner-acceptance/release/runtime closure copy because this slice is UI-first and local-only.

## Not Doing

- No DB/API/runtime/ops-assets wiring.
- No formal tenant config, knowledge, eval, persona, quick-reply or template persistence.
- No production template copy, audit write, export, version write, release gate change, owner visual acceptance, merge closure, runtime closure, GA-0, production readiness, or 1.0 release approval.
- No changes to lockfiles, DB/API/backend, global config, old M5 template center files, or unrelated pages.

## Acceptance

- Focused Playwright coverage for source availability artifacts, `activePageId=group.templates`, `shellLevel=group`, group-only nav, title/subtitle/tabs/card count, copy modal, disabled confirm until target selection, local-only toast with `role=status`/`aria-live`, forced URL states, collapsed sidebar width and mobile 320 no-overflow fallback.
- Mobile evidence must measure `bodyScrollWidth`, `documentScrollWidth`, template header width, tab rail width, card width and modal width at 320px; card/modal/tab/header must not be horizontally clipped.
- Browser evidence under `/tmp/uzmax-m7-ui-50-template-center-page-cleanstack/` with desktop screenshot, modal screenshot, mobile 320 screenshot, source availability artifacts and metrics JSON.
- Evidence doc records source HTML/unpacked/React three-way comparison summary, mock/degraded boundary, screenshot paths, metrics and validation commands/results.

## 失败分支

- If source parity cannot be achieved without runtime data, keep the UI visibly degraded/mock/local-only and record the visual/runtime delta.
- If validation blocks on baseline environment/runtime issues, record exact command/output and do not claim closure.

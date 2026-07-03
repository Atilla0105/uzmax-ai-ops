# M7-UI-11 Release Acceptance Page

## 目标

Create the page-level migration contract for the group 发布与验收 page (`group.release`) before implementation.

This PR is spec-only. It may add this spec, a short M7 evidence stub, M7 execution-queue wording and the page-migration ledger update for `group.release`. It must not implement the React page, route rendering, API hooks, tests, CSS, backend/API/runtime changes, package or lockfile changes, DB changes, CI/global config changes, raw prototype copies, screenshots or fixture imports.

The later implementation phase may not start until the coordinator approves this spec, confirms `group.release` is still the active target, and confirms the worktree/branch/touch-list do not conflict with any other page worker.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner/coordinator:

- Confirm this PR is a spec/evidence/ledger contract only.
- Confirm whether later M7-UI-11 implementation may proceed from this same spec, or whether the implementation worker must first update it.
- Confirm the release console must remain owner-facing governance UI, not a normal tenant operations page and not a release approval surrogate.
- Decide any missing runtime/API contract expansion for acceptance evidence records, owner signoff state, release blocker rollups, GA-0 checklist reads, GA-0 open action writes, and audit-log writes. AI agents must not invent those contracts.
- Keep final scope, production/staging, real customer/order data, customer LLM, cost/compliance, GA-0, production and 1.0 release decisions as owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page` on branch `codex/m7-ui-11-release-acceptance-page`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only.
- Read AGENTS, the four v1.1 source-of-truth docs, admin design system, M7 ledgers/evidence, adjacent M7-UI-03/M7-UI-04/M7-UI-10 specs/evidence, current legacy release-gate evidence contracts, and read-only prototype release sources before drafting.
- Record entry evidence and `rg` conclusions in this spec/evidence.
- Draft a decision-complete page matrix, runtime/API plan, state coverage, visual rules, evidence plan, PR hygiene and sequence gate.
- Do not implement or test the page in this spec-only PR.

## 时间盒

0.25 workday for the spec-only PR. If drafting requires source implementation, backend/API changes, package/lock updates, raw fixture copying, DB/schema changes, CI/global config changes or release/production action, stop and report `BLOCKED`.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-11-release-acceptance-page.md`
  - `docs/evidence/M7/M7-UI-11-release-acceptance-page.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
  - `apps/admin/src/pages/group/**`
  - `apps/admin/src/pages/PageOutlet.tsx`
  - `apps/admin/src/pages/registry.ts`
  - `apps/admin/tests/m7-ui-release-acceptance.spec.ts`
  - `apps/admin/tests/m7-ui-page-router.spec.ts`
- 说明/备注：
  - This PR may touch only the docs paths above.
  - Future implementation may touch the listed `apps/admin` page/test paths only after coordinator approval.
  - If future implementation needs `apps/admin/src/releaseGateContracts.ts`, backend/API routes, acceptance evidence DTOs, audit-log write APIs, package/lock, token package, shared patterns, CI/guard scripts or release docs beyond evidence/ledger, stop and split to a separate approved spec.
- 未列出的模块默认不可改。

## 变更预算与路径分类

Spec-only PR budget:

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test files changed: 0
- docs changed: <= 4
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- binary screenshots/artifacts: 0

Future implementation budget after coordinator approval:

- source changed files: <= 5
- source net LOC: <= 600
- new source files: <= 3
- test files changed: <= 2 focused Playwright specs
- docs changed: <= 3 evidence/ledger updates
- package/lock/generated/config/backend/API/DB/worker/cron/CI/global config: 0
- external API/SDK/provider/connector/adapter basis: none; use existing internal admin API client contracts, repo evidence contracts and future approved release/acceptance APIs only.
- exceptions: none expected. If missing runtime contracts force expansion, stop for a separate spec instead of declaring an exception inside this page worker.

## `rg` search conclusions before drafting

- `rg -n "release|Release|GA-0|GA0|发布|验收|acceptance|gate|L-01|J-05" apps/admin docs/specs docs/evidence -S`
  - Found `apps/admin/src/releaseGateContracts.ts`, the legacy `release-readiness` section in `apps/admin/src/App.tsx`, `apps/admin/src/pages/registry.ts` row for `group.release`, `apps/admin/src/pages/PageOutlet.tsx` scaffold behavior, M6/M6B release evidence and the M7 ledger.
  - Conclusion: later implementation should reuse existing truthful release-gate state where applicable, but legacy release-readiness remains evidence-route material and must not be copied as the M7 visual target.
- `rg -n "release-readiness|Release|GA-0|发布" apps/admin/src -S`
  - Found no M7 group release page, hook or focused test. Current `group.release` route remains a planned-page scaffold, while `tenant.queue` is the only migrated page in `PageOutlet`.
  - Conclusion: future implementation may add a page-local `apps/admin/src/pages/group/GroupReleasePage.tsx` wrapper and focused Playwright test, but this PR must not.
- `rg --files /Users/atilla/源码/unpacked\ 6 | rg "GroupReleasePage|groupPlatform|navigation|App"`
  - Found exact prototype release sources: `pages/group/GroupReleasePage.tsx`, `fixtures/groupPlatform.ts`, `App.tsx`, `shell/navigation.ts`.
  - Conclusion: use these files for structure/comparison only; do not copy raw fixtures, sample release labels, inline styles or local checklist state.
- `rg -n "发布与验收|验收|release|GA|group.release|M7" /Users/atilla/源码/unpacked\ 6/pages/group/GroupReleasePage.tsx /Users/atilla/源码/unpacked\ 6/App.tsx /Users/atilla/源码/unpacked\ 6/shell/navigation.ts /Users/atilla/Downloads/运营塔台1.0.html`
  - Found the owner prototype navigation label `发布与验收`, route switch `g_release`, page summary/header, M0-M6/GA-0/1.0 gate rows, release severity summary, GA-0 checklist, disabled/enabled open action and confirmation-modal copy shape.
  - Conclusion: compare later implementation against these release-console regions, but normalize through repo tokens/patterns/runtime truth and never use prototype local state as release authority.

## 文档触发检查

updated

## 前置条件

Required reads completed for this spec-only PR:

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `docs/specs/M7-UI-03-page-migration-ledger-and-router.md`
- `docs/specs/M7-UI-04-shared-operational-patterns.md`
- `docs/specs/M7-UI-10-confirmation-queue-page.md`
- `docs/evidence/M7/M7-UI-03-page-migration-ledger-and-router.md`
- `docs/evidence/M7/M7-UI-04-shared-operational-patterns.md`
- `docs/evidence/M7/M7-UI-10-confirmation-queue-page.md`
- `apps/admin/src/releaseGateContracts.ts`
- `apps/admin/src/App.tsx` legacy release-readiness section
- `apps/admin/src/pages/registry.ts`
- `apps/admin/src/pages/PageOutlet.tsx`
- read-only prototype sources listed below
- Impeccable skill context and product register with the product/admin register selected.

Source mapping:

| Source | Required use |
|---|---|
| `/Users/atilla/源码/unpacked 6/pages/group/GroupReleasePage.tsx` | Primary structure and interaction source: owner-facing release console header, summary, gate list, release-level summary, GA-0 checklist, disabled/open action, confirmation modal with required reason. |
| `/Users/atilla/源码/unpacked 6/fixtures/groupPlatform.ts` | Shape reference only for release gate fields, severity buckets, GA checklist labels and current blocker wording. Do not copy fixture values as runtime truth. |
| `/Users/atilla/源码/unpacked 6/shell/navigation.ts` | Confirms group nav item id `g_release`, label 发布与验收 and Rocket icon placement under platform group. |
| `/Users/atilla/源码/unpacked 6/App.tsx` | Confirms prototype route switch renders `GroupReleasePage` for `g_release`. |
| `/Users/atilla/Downloads/运营塔台1.0.html` | Owner HTML visual reference. Compare the 发布与验收 rendered region/elements: title, subtitle, release summary, gate cards/rows, source/evidence/owner/blocker metadata, release severity panel, GA-0 checklist, disabled open action and confirmation-modal copy shape. |
| `apps/admin/src/releaseGateContracts.ts` | Existing repo release-gate truth reference for M0-M6/GA-0/1.0 wording and disabled GA-0 action. It is legacy evidence/runtime contract material, not the M7 visual implementation. |
| `apps/admin/src/App.tsx` `release-readiness` section | Legacy evidence route surface that must stay available until replaced intentionally; do not visually copy as the new page. |
| `apps/admin/src/pages/registry.ts` and `PageOutlet.tsx` | Confirms `group.release` is currently a planned-page scaffold, not implemented. |

v1.1/doc references:

- PRD: §4 release principles; 1.0 is not a half-finished formal release; GA-0 is controlled production beta and does not waive acceptance; owner inputs/signoff remain gate inputs.
- Technical architecture: §4 `acceptance_evidence`; §9 `audit_log`; §11 governance/delivery; §11.1 GA-0 entry conditions; §11.2 owner-side critical path.
- Backend design/frontend architecture: §2 IA; §3.6 release/acceptance page contract; §5 mobile fallback; §7 frontend layering; §8 quality budgets and release screen visual regression.
- Acceptance matrix: J-05 release gate evidence, L-01 GA-0 gate, L-02 GA-0 incident path, P0/P1/P2 release impact, B-04/B-05 permission/audit boundaries, G-04/G-06 eval/owner quality gates, I-05 design-system quality.
- Admin design system: status-first control room principles; release console pattern; high-risk action confirmation; mobile fallback for release blocker read-only review; no release/eval/AI wording that overclaims evidence.
- M7 ledger: `group.release`, target route/page id `group.release`, target path `apps/admin/src/pages/group/GroupReleasePage.tsx`, current status updated by this PR to spec-ready only.

Worktree / branch entry evidence:

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page` |
| worker `git status --short --branch` | `## codex/m7-ui-11-release-acceptance-page...origin/main` |
| worker `git branch --show-current` | `codex/m7-ui-11-release-acceptance-page` |
| worker HEAD / origin main | `c82fa4d3496807286dc512af32f215b30c3a64fa` / `c82fa4d3496807286dc512af32f215b30c3a64fa` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| root/main branch | `main` |
| `git branch --no-merged main` at entry | no output |
| open PR audit | `gh pr list --state open --limit 50` unavailable because `gh` is not installed in this shell |

Known sequencing note:

- `origin/main` HEAD is `c82fa4d M7-UI-10 confirmation queue page (#175)`, so M7-UI-10 implementation evidence is on the base.
- This spec updates `group.release` only to `spec_ready_pending_pr_review`; it does not claim implementation, runtime closure, GA-0, release approval or owner acceptance.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page` |
| branch | `codex/m7-ui-11-release-acceptance-page` |
| base | current `origin/main` including #175 `c82fa4d` |
| forbidden checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main use | coordination/read-only only |
| required pre-edit evidence | `pwd`, `git status --short --branch`, `git branch --show-current`, root/main clean check, branch/PR availability check |

## 并发派发证据

This worker is assigned one physical worktree, one branch and one spec. This PR touch list is docs-only and does not overlap source, DB schema, lockfile, package, CI/guard, global generated artifacts or production/release gates.

Future implementation touches `apps/admin/src/pages/group/**`, `PageOutlet`, `registry` and focused admin Playwright tests, so it must not run in parallel with other page workers touching group pages, router/page outlet/registry, release-gate contracts, shared page CSS conventions or `apps/admin/tests/**` unless the coordinator records explicit non-overlap.

If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

## Page Matrix

### Objects And Fields

| Object | Required fields | Notes |
|---|---|---|
| Release page shell | page id `group.release`, current environment label, source/evidence timestamp, release-console status copy | Must distinguish evidence-ready, owner accepted, GA-0 open and 1.0 release approval. |
| Release summary | current release posture, M5/M6 posture, external-input posture, GA-0 posture, 1.0 posture | Must not imply GA-0/1.0 approval. |
| Gate row | gate id/name, covered acceptance items, state, evidence producer, evidence link/ref, owner signoff state, blocker summary, ADR/runbook refs, last evidence update | M0-M6, GA-0 and 1.0 must remain separately scannable. |
| Evidence link/ref | doc path or future API record ref, producer, producedAt, verification command when available | Link-only evidence is not owner acceptance. |
| Owner signoff state | not_required, pending, accepted, risk_accepted, rejected/not_approved, not_applicable | AI agents must not mutate signoff state without owner source. |
| Blocker item | acceptance id, priority/effect, current status, owner dependency, runtime dependency, next required evidence | P0/P1/P2 wording must match acceptance-matrix rules. |
| GA checklist | entry condition id, source, current state, evidence ref, owner-only decision flag, blocked reason | Checkboxes are runtime/evidence state, not local UI toggles. |
| GA open action | disabled/enabled state, required reason, audit destination, confirmation copy, owner permission requirement | Disabled unless runtime says all conditions are green and owner action is permitted. |
| Release action | 1.0 release action state, P0/P1/P2 rollup, required owner risk note/fix date for P1 | Formal release action remains disabled until all P0 and owner conditions are met. |
| Mobile blocker review | read-only blocker list, evidence refs, owner-needed marker | Mobile is read-only for GA-0/formal release blockers; no open/release action on mobile unless separately approved. |

### Statuses

| Status | Meaning | UI behavior |
|---|---|---|
| `accepted` | Evidence/signoff accepted for the specific gate scope | OK tone; show scope and source, not broader release approval. |
| `closed_no_release` | Gate/evidence package closed but does not approve release | Warning/neutral tone; must say not release. |
| `evidence_ready` | Evidence exists and awaits review/signoff | Informational tone; owner state remains pending. |
| `owner_pending` | Owner decision/signoff missing | Owner-needed marker; no action enabled by AI. |
| `locked` | Gate is locked pending checklist or owner decision | Human/blocking tone; open/release action disabled. |
| `blocked` | P0 or explicit release blocker open | Human/blocking tone; show blocker and required evidence. |
| `permission_denied` | User lacks release-console read/write permission | Explain role/prerequisite; backend remains authoritative. |
| `degraded` | Evidence API/rollup source unavailable or stale | Show stale/ref fallback and disable actions requiring current truth. |

Existing contract mismatch to preserve:

- `apps/admin/src/releaseGateContracts.ts` is a static, legacy evidence contract with `ga0Action.disabled: true`.
- Prototype `GroupReleasePage` uses local checkbox state and can open a confirmation modal when all local checklist items are clicked.
- Future implementation must not preserve the local-checkbox semantics as release truth. Checklist state must come from a real API/evidence contract or be rendered read-only/degraded. Opening GA-0 must remain disabled unless a future approved API contract, audit write and owner permission path exist.

### Actions

| Action | Desktop | Mobile fallback | Runtime requirement |
|---|---|---|---|
| Open evidence | Link/button to evidence ref | Link/read-only | Evidence ref must be a controlled repo/API path. |
| Filter gate rows | Status/priority/source filters | Optional read-only status grouping | Local UI state only. |
| View blocker detail | Inline expand or side panel | Read-only detail | Controlled blocker refs; no raw customer/order data. |
| Acknowledge evidence-ready item | Optional future owner/coordinator-only action | Not available | Requires owner/source-of-truth workflow; not in this page PR unless separately approved. |
| Open GA-0 | Disabled by default; enabled only when all runtime conditions and owner permission are true; reason required | Not available in this spec | Requires approved API, audit write, owner permission and current checklist truth. |
| Formal 1.0 release | Disabled until all P0 clear and P1/P2 owner risk state is recorded | Not available | Requires separate release/production spec and owner decision. |
| Export/review release packet | Optional future read-only packet link | Read-only link | Requires existing evidence bundle/export contract; do not add export runtime in this page worker. |

### Exit Paths

| From | To | Rule |
|---|---|---|
| Gate row evidence link | Evidence document or future evidence detail route | Open in controlled link; no blind external navigation without source. |
| Blocker item | Source acceptance matrix/runbook/spec/evidence | Preserve release boundary wording. |
| GA checklist item | Relevant evidence or blocker detail | If evidence missing, show disabled/degraded reason. |
| Legacy evidence route | `legacy.evidence` | Must remain reachable until coordinator explicitly retires it. |
| Release console | Group navigation | No mutation on navigation. |

### Forbidden Behaviors

- Do not turn prototype local checkboxes into GA-0 truth.
- Do not enable GA-0 or 1.0 release actions in the first implementation unless a separate approved runtime/API/audit/owner-decision contract exists.
- Do not claim owner signoff, P1 risk acceptance, GA-0 opening, production approval or 1.0 release from docs-only evidence.
- Do not copy raw `groupPlatform.ts` fixture values as runtime data.
- Do not show customer/order/contact plaintext on the group release page.
- Do not use red/human state as decoration; reserve it for blockers/owner-needed risk.
- Do not add modal-first flows for review; confirmation modal is only for actual high-risk actions.

## Runtime / API Plan

Implementation should prefer an existing or separately approved read API that can provide:

- release summary posture;
- gate rows with evidence refs, evidence producer, owner signoff state, blockers and ADR/runbook refs;
- GA-0 checklist condition states from repo/runtime evidence, not local UI;
- P0/P1/P2 rollup state;
- permission state for `release:read` and future `release:open_ga0` / `release:approve_1_0`;
- current audit-write availability for high-risk actions.

If no such API exists during implementation:

- render the page as read-only/degraded using existing `releaseGateConsoleState` as legacy evidence contract input only if that contract is still truthful;
- keep GA-0 and formal release actions disabled;
- show exact blockers for missing acceptance-evidence API and audit-write contract;
- record the API/runtime gap in evidence and ledger;
- do not add backend/API/DB code in the page worker.

Potential future API paths and DTO names are intentionally not invented here. They require a separate backend/API/runtime spec or an existing generated/contracted source.

## Loading / Empty / Error / Permission / Degraded / Mobile Fallback

| State | Required behavior |
|---|---|
| loading | Skeleton rows/panels for summary, gate list, severity/GA checklist; no centered spinner-only page. |
| empty | Explain no release evidence is available for this environment; show links to ledger/spec/evidence sources; all actions disabled. |
| error | Show failed source, retry affordance if read API exists, and preserve legacy evidence route link; no false green state. |
| permission denied | Explain release-console access requires group/release permission; backend remains authoritative even if UI hides actions. |
| degraded | Show stale/missing runtime source and exact disabled action reasons; release/open actions disabled. |
| owner-decision-required | Mark owner-only decisions separately from implementation blockers; AI cannot clear these. |
| mobile fallback | Read-only blocker/evidence review for GA-0 or 1.0 blockers; no full matrix editing, no GA-0 open, no formal release action. |

## Visual / Design Rules

Adopted Impeccable/product-register guidance:

- Dense operational control-room page; status and blocker recognition first.
- Use the owner prototype structure and density for the release console: top summary, gate rows, release severity panel, GA checklist/action panel.
- Use repo tokens/patterns from M7-UI-04 and `docs/admin-design-system.md`; no old `--uzmax-*` visual target in new page code.
- Use Lucide `Rocket`/status icons only through repo icon conventions when icons are introduced.
- Use data font for gate ids, acceptance ids, timestamps, trace/evidence ids and status codes.
- State labels must include text, not color alone.
- Motion, if any, is 150-250ms state feedback and reduced-motion aware.

Rejected prototype/local behaviors:

- Raw inline styles, raw hex values and copied fixture strings as runtime data.
- Local checkbox state enabling GA-0.
- Decorative gradients, glassmorphism, colored shadows, side stripes, nested cards, oversized hero typography or marketing-page layout.
- Hidden release actions that backend would still permit; permission and backend truth must match.

## Evidence Plan

This spec-only PR:

- Adds this spec and M7 evidence stub.
- Updates M7 README execution queue with `UI-11` as spec-ready only.
- Updates the page ledger `group.release` row to the target spec id and spec-ready status.
- Runs docs/shape validation and source-change guards listed below.

Future implementation evidence must include:

- spec compliance review against this file;
- code-quality review after implementation;
- focused Playwright desktop and 320px fallback coverage for `group.release`;
- state coverage for loading, empty, error, permission denied, degraded and owner-decision-required;
- disabled action assertions for GA-0/open/release when runtime/owner gates are not green;
- no accidental `apps/admin/**` source/test changes outside the approved implementation touch list;
- no raw prototype fixture import and no binary screenshot commit;
- updated ledger/evidence without claiming GA-0, production or 1.0 approval.

## Sequence Gate

- This PR must merge before any `M7-UI-11` implementation worker starts.
- The implementation worker must re-read this spec, AGENTS, v1.1 docs, `docs/admin-design-system.md`, current M7 README, current ledger, current `releaseGateContracts.ts`, current `PageOutlet`/registry and owner prototype sources.
- The implementation worker must re-run `git branch --no-merged main` and open PR audit at start.
- If M7-UI-10 status, release-gate contracts, page registry, shared patterns or owner release evidence changed after this spec PR, implementation must update this spec/evidence first or stop for coordinator decision.

## 通过条件

- `docs/specs/M7-UI-11-release-acceptance-page.md` exists and records all required boundaries, mapping, state/action matrix and validation plan.
- `docs/evidence/M7/M7-UI-11-release-acceptance-page.md` exists as a spec evidence stub and does not claim implementation.
- `docs/evidence/M7/README.md` execution queue includes UI-11 spec status without overclaiming.
- `docs/admin-ui-page-migration-ledger.md` `group.release` row points to `M7-UI-11-release-acceptance-page`, records source mapping/runtime blockers and does not claim implementation.
- No `apps/admin/**`, backend/API/DB/package/lock/CI/global config/shared pattern/token/test files or binary screenshots are changed.
- Validation commands are run and recorded honestly.

## 失败分支

- If the assigned worktree/branch has unexpected state, stop and report `BLOCKED`.
- If docs-only edits require changing source/test/runtime paths, stop and ask coordinator to split or expand the spec.
- If release state in current repo contradicts the prototype fixture wording, prefer current repo/source-of-truth evidence and record the mismatch; do not copy stale fixture truth.
- If `guard:doc-triggers` or `guard:pr-shape` fails, fix docs within this touch list or report the exact blocker.
- If push/PR creation is unavailable, leave the branch committed locally, report the head SHA and exact blocker.

## 不做什么

- No React page implementation.
- No route rendering change.
- No API hook/client implementation.
- No tests.
- No source/CSS/token/shared-pattern changes.
- No backend/API/DB/worker/cron/package/lock/CI/global config changes.
- No raw prototype fixture import or copied customer/order/contact samples.
- No binary screenshots.
- No GA-0 opening, production/staging action, real customer/order-data use, customer LLM, Telegram Business automatic reply, owner signoff fabrication or 1.0 release approval.

## Validation List

- `git diff --check`
- `npm run guard:doc-triggers`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-11-release-acceptance-page.md --include-worktree`
- `git diff --name-only origin/main...HEAD`
- `git diff --name-only origin/main...HEAD -- apps/admin packages package.json package-lock.json pnpm-lock.yaml yarn.lock .github scripts | sed -n '1,120p'`
- `git diff --name-only origin/main...HEAD -- '*.png' '*.jpg' '*.jpeg' '*.webp' '*.gif' '*.mp4' '*.mov'`

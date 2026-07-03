# M7-UI-11 Release Acceptance Page Evidence

## Status

Implementation evidence for `group.release` / 发布与验收.

This PR implements the M7 release and acceptance console in `apps/admin` as a
read-only/degraded owner-facing governance page. It replaces the planned scaffold
for `group.release`, updates focused Playwright coverage, and updates the M7
queue and page ledger to implementation-pending PR status.

This is not M7 closeout, owner acceptance, GA-0 opening, production/staging
action, real customer/order-data use, customer LLM, Telegram Business automatic
reply or 1.0 release approval.

## Resumed Entry Evidence

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page-impl` |
| assigned branch | `codex/m7-ui-11-release-acceptance-page-impl` |
| base after resume | `origin/main` at `da33a089663e4547ba3a2ffd56928f8a7cddec04` including incident PR #177 |
| resume fetch | `git fetch origin main --prune` passed |
| resume fast-forward | `git merge --ff-only origin/main` passed, updating `5d0000b..da33a08` |
| resumed `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page-impl` |
| resumed branch | `codex/m7-ui-11-release-acceptance-page-impl` |
| root/main status before resumed writes | `## main...origin/main` |
| assigned worktree status before resumed writes | `## codex/m7-ui-11-release-acceptance-page-impl...origin/main` |
| `git branch --no-merged main` at resume | no output |
| open PR audit at resume | GitHub REST `pulls?state=open` returned `[]`; `gh` unavailable in this shell |
| first resumed write control | First resumed write was `mkdir -p apps/admin/src/pages/group` scoped with command `workdir` to the assigned worktree. Immediate dual status check showed root/main clean and assigned worktree clean. |
| incident control used | All resumed manual patches used absolute assigned-worktree paths. Root/main dual status checks were run after the first page patch and before validation. |

## Required Reads / Mapping

- Re-read before resumed implementation: `AGENTS.md`, `docs/specs/M7-UI-11-release-acceptance-page.md`, `docs/incidents/INC-2026-07-03-m7-ui-11-root-patch-target.md`, `docs/evidence/M7/M7-UI-11A-worker-boundary-incident.md`, `docs/admin-design-system.md`, M7 README/ledger, v1.1 release/acceptance sections, `apps/admin/src/releaseGateContracts.ts`, `apps/admin/src/pages/PageOutlet.tsx`, `apps/admin/src/pages/registry.ts`, and owner prototype release sources.
- Adopted Impeccable/product-register guidance: dense operational page, status-first hierarchy, evidence-over-impression copy, high-risk release actions disabled, mobile blocker review read-only, no decorative visuals.
- Rejected prototype-local behavior: raw inline styling, raw fixture values as runtime truth, local checkbox state enabling GA-0, and wording that implies owner signoff or release approval without source evidence.

## Owner HTML Visual Parity Gate

`/Users/atilla/Downloads/运营塔台1.0.html` is the visual acceptance baseline
for this page. The owner HTML is a blueprint, not loose inspiration. Layout,
density, spacing, columns, hierarchy, sidebar/topbar/page structure, component
expression, state treatment and interaction shape are blockers if they diverge
without an explicit runtime, permission, mobile or degraded-state justification.

Parity evidence artifacts generated outside git:

- Owner baseline: `/tmp/uzmax-m7-ui-11-release-acceptance-page/owner-html-release-1440.png`
- Implementation desktop parity evidence: `/tmp/uzmax-m7-ui-11-release-acceptance-page/desktop-1440.png`
- Implementation mobile fallback parity evidence: `/tmp/uzmax-m7-ui-11-release-acceptance-page/mobile-320.png`

Visual parity actions taken before PR:

- Re-rendered the owner HTML release route by navigating the prototype to
  `集团 -> 发布与验收`; saved the owner baseline screenshot above.
- Revised the implementation from the earlier assistant-original composition to
  match the owner release console structure more closely: page title with inline
  release metrics, summary block, compact M0-M6/GA-0/1.0 gate cards, four-column
  metadata rows, and GA-0 checklist/action panel as the primary right column.
- Kept extra degraded/runtime blocker bar, P0/P1/P2 rollup and high-risk action
  boundary visible because the current repo has no release/acceptance runtime
  API, owner signoff source, GA-0 write path or audit-write path.
- Kept mobile as read-only blocker review. The mobile degraded action button is
  hidden so the blocker copy remains readable at 320px; GA-0/1.0 actions remain
  disabled.
- Inherited the existing M7 AppShell sidebar/topbar from the allowed
  implementation surface. This PR does not claim to close shell-wide visual
  parity; if exact sidebar/topbar reconstruction is required beyond the existing
  AppShell, it must be handled by a separate approved spec/touch list rather than
  hidden inside UI-11.

## Group/Tenant Layer Separation Gate

Owner rule: group layer and tenant layer must no longer share one combined
sidebar. Admin entry/home starts in the group layer. The user then selects a
tenant to enter the tenant layer.

Required IA separation:

- Group-level pages belong in the group layer: `group.release`, group overview,
  model/cost/risk, templates, connections, tenant management, group logs and
  other group governance surfaces.
- Tenant-level pages belong in the tenant layer after tenant selection:
  conversations, tickets, confirmation queue, customers, orders, knowledge,
  evals, AI members, team/config/analytics/logs where those surfaces are
  tenant-scoped.
- A group page must not be accepted as full visual/IA parity if the surrounding
  shell still presents a mixed group+tenant sidebar as the primary navigation.

Current UI-11 status:

- `group.release` itself is implemented as a group-layer page surface.
- This PR does not edit `apps/admin/src/shell/**`, shared navigation, shared
  patterns or global tokens because those paths are outside the approved UI-11
  implementation touch list.
- The current `/design` route therefore still inherits the mixed M7 AppShell
  sidebar/topbar. That is a visual/IA blocker for full owner-HTML navigation
  parity and a required follow-up foundation spec before broad tenant page
  migration.
- This implementation PR records the gate and does not claim full sidebar/IA
  parity, admin-home group-entry closure or tenant-transition closure.

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/group/GroupReleasePage.tsx` | New `group.release` page using existing primitives/patterns, owner prototype structure, and truthful release-gate evidence copy. |
| `apps/admin/src/pages/group/GroupReleaseSupport.tsx` | Page-local read-only release data shaping, state renderers, status mapping and scoped CSS. |
| `apps/admin/src/pages/PageOutlet.tsx` | Routes `group.release` to the new page instead of the planned scaffold. |
| `apps/admin/src/pages/registry.ts` | Marks `group.release` as `implemented_in_worker_pending_pr` with UI-11 target spec. |
| `apps/admin/tests/m7-ui-release-acceptance.spec.ts` | Focused desktop, state, disabled-action and 320px mobile fallback coverage. |
| `apps/admin/tests/m7-ui-page-router.spec.ts` | Updates router coverage so `group.release` no longer expects scaffold content. |

## Runtime / Contract Boundary

- No release/acceptance runtime API, owner signoff source, GA-0 checklist read API, audit-write path or release write action is added.
- The page renders read-only/degraded using `apps/admin/src/releaseGateContracts.ts` as legacy evidence input only.
- GA-0 and 1.0 actions remain disabled. The UI explicitly says an approved runtime/API/audit path and owner permission are required before any action can open.
- The GA-0 checklist is read-only; no local checkbox state can make GA-0 green.
- Missing runtime/API/audit blockers are visible in the degraded bar and high-risk action panel.

## State Coverage

| State | Evidence |
|---|---|
| loading | `?m7ReleaseState=loading`, skeleton rows, no fixture fallback copy |
| empty | `?m7ReleaseState=empty`, missing `acceptance_evidence` copy, actions disabled |
| error | `?m7ReleaseState=error`, no-green-state copy, disabled runtime action |
| permission denied | `?m7ReleaseState=permission`, `release:read` / `release:decision` copy |
| degraded | default page state, missing runtime/API/audit copy |
| owner-decision-required | `?m7ReleaseState=owner-decision-required`, owner-only decision marker |
| mobile fallback | 320px screenshot and Playwright assertion; read-only blocker review, disabled actions |

## Design Audit Notes

- Adopted owner prototype structure: page heading, release summary, M0-M6/GA-0/1.0 gate rows, release severity rollup, GA-0 checklist and high-risk action panel.
- Adapted prototype semantics to repo truth: local checkbox/open-modal behavior was rejected; checklist is read-only and release actions are disabled.
- Used existing M7 primitives/patterns (`DegradedBar`, `StatusBadge`, `Button`, `Checkbox`, `IconSlot`) and page-local scoped CSS. No shared tokens, primitives or patterns were changed.
- Visual choices stay restrained and operational: borders/surface contrast, status chips with text, data font for gate ids/status values, no gradients/glass/side stripes/nested cards.
- Mobile 320px fallback is read-only and does not expose GA-0 or formal release activation.

## Screenshot / Parity Artifacts

These artifacts were generated outside git and must not be committed:

- `/tmp/uzmax-m7-ui-11-release-acceptance-page/owner-html-release-1440.png`
- `/tmp/uzmax-m7-ui-11-release-acceptance-page/desktop-1440.png`
- `/tmp/uzmax-m7-ui-11-release-acceptance-page/mobile-320.png`

## Validation

| Command | Result | Notes |
|---|---|---|
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm ci` | pass | Installed dependencies inside the assigned implementation worktree only. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run typecheck -- --pretty false` | pass | TypeScript passed after the page-state typed prop fix. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npx playwright test apps/admin/tests/m7-ui-release-acceptance.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts` | pass | 4 focused tests passed. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run build:admin` | pass | Admin production build passed for screenshots and preview. |
| owner HTML parity baseline screenshot | pass | Prototype navigated to `集团 -> 发布与验收`; saved `/tmp/uzmax-m7-ui-11-release-acceptance-page/owner-html-release-1440.png`. |
| implementation screenshot generation | pass | Desktop/mobile parity screenshots generated under `/tmp/uzmax-m7-ui-11-release-acceptance-page/`; mobile `document.body.scrollWidth` was `320`. |
| `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch` after first resumed write and after page patch | pass | Root/main stayed `## main...origin/main`. |
| `git -C /Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page-impl status --short --branch` after first resumed write and after page patch | pass | Only assigned implementation files changed. |
| dual status before validation | pass | Root/main stayed `## main...origin/main`; assigned worktree showed only UI-11 source/test/docs changes. |
| `git diff --check` | pass | No whitespace errors. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-11-release-acceptance-page.md --include-worktree` | pass | 9 changed files: 4 source, 2 test, 3 docs. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run lint` | pass | ESLint/dependency-cruiser command completed. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run typecheck -- --pretty false` | pass | Re-run after final docs guard; TypeScript passed. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run build:admin` | pass | Admin production build passed. |
| `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npx playwright test apps/admin/tests/m7-ui-release-acceptance.spec.ts apps/admin/tests/m7-ui-page-router.spec.ts` | pass | 4 focused tests passed. |
| focused forbidden-path / binary-media check | pass | No backend/API/DB/package/lock/CI/global-config/incident-path or binary-media files in the implementation worktree diff. |

## Spec Compliance Review

- Correct spec: `docs/specs/M7-UI-11-release-acceptance-page.md`.
- Scope stayed inside the allowed implementation touch list.
- No backend/API/DB/worker/cron/package/lock/CI/global config/shared pattern/token changes.
- No raw prototype fixture import, no copied customer/order/contact samples and no screenshots committed.
- Existing release truth was reused from `releaseGateContracts.ts`; missing runtime/API/audit blockers are explicit.
- GA-0 and 1.0 release/open actions remain disabled.

## Code Quality Review

- New source files are page-local and avoid shared abstraction churn.
- State coverage is deterministic through app-local query controls and does not masquerade as runtime truth.
- Page styles use prototype-derived tokens already available in the app and avoid old `--uzmax-*` visual targeting.
- Focused Playwright coverage verifies route replacement, state copy, disabled actions, degraded copy and mobile fallback.

## Boundary

This evidence does not approve page merge to main, M7 closeout, owner acceptance,
GA-0, production/staging, real customer/order-data use, customer LLM, Telegram
Business automatic reply, P1 risk acceptance or 1.0 release.

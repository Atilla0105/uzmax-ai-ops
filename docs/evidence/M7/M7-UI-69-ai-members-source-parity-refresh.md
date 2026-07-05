# M7-UI-69 AI Members Source Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.aiMembers` / `AI 成员` on stacked branch `codex/m7-ui-69-ai-members-source-parity-refresh`, based on `origin/codex/m7-ui-68-eval-center-source-parity-refresh` (#210 stack).

This slice adds a focused source-parity Playwright pass for the existing AI members page on the latest tenant shell stack. It does not claim AI member DB/API/runtime/audit/member metrics, production persona publish, production route changes, owner visual acceptance, merge, GA-0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-69-ai-members-source-parity-refresh` |
| worker branch | `codex/m7-ui-69-ai-members-source-parity-refresh` |
| worker status at entry | `## codex/m7-ui-69-ai-members-source-parity-refresh...origin/codex/m7-ui-68-eval-center-source-parity-refresh` |
| worker entry HEAD | `e81e9b8fc857c80dadb5dc7bbd8bec67e8773687` |
| base | `origin/codex/m7-ui-68-eval-center-source-parity-refresh` / #210 stack |
| root/main handling | Root/main was not used for implementation; an accidental initial patch into root created two untracked M7-UI-69 files and was immediately moved into the assigned worker path. Root returned to its pre-existing unrelated untracked state. |

## Required Reads / Mapping

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- Impeccable project context and product register
- `docs/specs/M7-UI-41-ai-members-page.md`
- `docs/evidence/M7/M7-UI-41-ai-members-page.md`
- `docs/admin-design-system.md`
- `docs/admin-ui-page-migration-ledger.md`
- `docs/evidence/M7/README.md`
- `apps/admin/src/pages/agents/AgentsPage.tsx`
- `apps/admin/src/pages/agents/AgentViews.tsx`
- `apps/admin/src/pages/agents/agentsFallback.ts`
- `apps/admin/tests/m7-ui-ai-members.spec.ts`
- `apps/admin/tests/m7-ui-eval-center-source-parity.spec.ts`
- `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/agents.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- v1.1 AI member/eval boundaries: PRD REQ-T08/T09, admin §4.8, acceptance I-02 and architecture GA-0/eval-gate production boundaries.

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source opened by Playwright for AI members owner/source sample. |
| Unpacked agents page | Source anatomy: title, segmented filters, breaker/estop alert, AI member cards, human table, capability toggles, emergency/recovery confirmation, persona drawer, eval gate and publish path. |
| Unpacked `useAgents.ts` | Local state source for filters, status changes, capability toggle, persona draft, eval run, publish and rollback. |
| Unpacked `fixtures/agents.ts` | Field-shape source for prototype-like agents/humans/capabilities; React keeps centralized synthetic/degraded fallback labeling. |

## Implementation Summary

| Path | Summary |
|---|---|
| `docs/specs/M7-UI-69-ai-members-source-parity-refresh.md` | Adds scoped source-parity refresh spec for AI members on the latest #210 stack. |
| `apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts` | Adds focused Playwright evidence for owner/source sample, unpacked mapping, tenant shell, active page, nav/topbar/page/card/table/drawer geometry, tenant-only categories, AI members anatomy, degraded caveat, emergency/recovery confirms, persona drawer, local publish preview, collapsed/mobile screenshots and metrics. |
| `docs/evidence/M7/README.md` | Records M7-UI-69 as visible refresh candidate, not runtime or owner acceptance. |
| `docs/admin-ui-page-migration-ledger.md` | Updates the `tenant.aiMembers` row/status to include this source-parity refresh. |

No UI source changes are included.

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/`

- Owner/source sample: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/owner-html-ai-members-source-sample.png`
- Owner/source DOM sample: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/owner-html-ai-members-source-dom-sample.json`
- Unpacked source mapping: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/unpacked-ai-members-source-mapping.json`
- React desktop screenshot: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/react-ai-members-desktop.png`
- React emergency confirm screenshot: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/react-ai-members-emergency-confirm.png`
- React persona drawer screenshot: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/react-ai-members-persona-drawer.png`
- React collapsed sidebar screenshot: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/react-ai-members-collapsed.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/react-ai-members-mobile-320.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/metrics.json`

Expected assertions:

- tenant shell and active page `tenant.aiMembers`;
- topbar height about `53`, nav `232` expanded / `68` collapsed;
- tenant nav sections exactly `运营/数据/智能/管理/洞察`, group sections absent;
- source-like AI members title, runtime alert, segmented filters, AI member cards, human table, capability toggles, reason-required emergency stop confirmation, reason-required recovery confirmation, persona drawer, eval gate and local publish preview toast;
- degraded/mock/read-only/not-production-member-metrics/no-production-persona-publish/local-action-only caveat visible but not replacing content;
- `320px` mobile body scrollWidth and document scrollWidth `<= 320`.

Measured React metrics:

| Metric | Desktop | Emergency confirm | Recovery confirm | Persona drawer | Local publish toast | Collapsed | Mobile 320 |
|---|---:|---:|---:|---:|---:|---:|---:|
| shell level | `tenant` | `tenant` | `tenant` | `tenant` | `tenant` | `tenant` | `tenant` |
| active page | `tenant.aiMembers` | `tenant.aiMembers` | `tenant.aiMembers` | `tenant.aiMembers` | `tenant.aiMembers` | `tenant.aiMembers` | `tenant.aiMembers` |
| nav width | `232` | `232` | `232` | `232` | `232` | `68` | `320` |
| topbar height | `53` | `53` | `53` | `53` | `53` | `53` | `53` |
| page width | `709` | `709` | `709` | `709` | `709` | `709` | `586` |
| card grid / first card width | `661 / 323` | `661 / 323` | `661 / 323` | `661 / 323` | `661 / 323` | `661 / 323` | `562 / 562` |
| human table width | `661` | `661` | `661` | `661` | `661` | `661` | `562` |
| persona drawer width | `0` | `0` | `0` | `560` | `0` | `0` | `0` |
| body/document scrollWidth | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `1440 / 1440` | `320 / 320` |
| tenant categories | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` | `运营/数据/智能/管理/洞察` |
| group category/button count | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` | `0 / 0` |
| runtime caveat | visible | visible | visible | visible | visible | visible | visible |
| source-like focus | default | emergency confirm | recovery confirm | persona/eval gate | local publish preview | collapsed shell | mobile readable |

Unpacked source mapping records all key anatomy booleans as true: title, runtime alert, filter segmented controls, AI member cards, human table, capability toggles, emergency stop confirmation, recovery confirmation, persona drawer, persona eval gate and local publish preview boundary adaptation. It also records capability labels `教程/截图/报价/订单查询/Business 草稿` and local hook terms `agents/sel/setSel/setStatus/toggleCap/persona/openPersona/editPersona/runPersonaEval/publishPersona/rollbackPersona/closePersona`.

## Runtime / Data Boundary

- AI member data remains synthetic/prototype-shaped degraded mock fallback.
- Capability toggle, emergency stop, breaker recovery, persona eval and local publish preview remain browser-local React state only.
- Persona publish is explicitly local preview only; no production persona publish, production route change or real audit write is implemented or implied.
- No backend/API/DB/package/lock/shared shell/topbar/sidebar files are touched.
- No AI member DB/API/runtime/audit/member metrics are implemented or implied.

## Branch / PR Hygiene

- `git branch --no-merged main` ran from the worker worktree and listed the current branch `codex/m7-ui-69-ai-members-source-parity-refresh` plus existing stacked visible UI branches.
- `gh pr list --state open --limit 80 --json number,headRefName,title,state,url` could not run because `gh` is not installed or not on PATH in this worker environment.
- Temporary validation `node_modules` symlink must be removed before final `git diff --check`, `pr-shape` and commit.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M7-UI-69-ai-members-source-parity-refresh.md docs/evidence/M7/M7-UI-69-ai-members-source-parity-refresh.md docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts` | pass | Touched spec/evidence/README/ledger/test files use Prettier style. |
| `node node_modules/eslint/bin/eslint.js apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts` | pass | Focused new test passes ESLint; source was not changed. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json --pretty false` | pass | TypeScript completed cleanly. |
| `node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build completed; Vite emitted the existing large-chunk warning only. |
| `node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts apps/admin/tests/m7-ui-ai-members.spec.ts` | pass | 4/4 passed with manual `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173` because local `npm` is unavailable; writes owner/source sample, unpacked mapping, desktop/persona/confirm/collapsed/mobile screenshots and metrics under `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/`. |
| `git diff --check origin/codex/m7-ui-68-eval-center-source-parity-refresh...HEAD` | pass | No whitespace output; ran after removing the temporary validation `node_modules` symlink. |
| `node scripts/guards/pr-shape.mjs --base origin/codex/m7-ui-68-eval-center-source-parity-refresh --spec docs/specs/M7-UI-69-ai-members-source-parity-refresh.md --include-worktree` | pass | Docs/test-only diff within spec touch list; `source.changedFiles: 0`; ran after removing the temporary validation `node_modules` symlink. |

## Remaining Differences / Non-Claims

- This slice records parity evidence on the current #210 visible stack; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only. A future approved runtime spec is required before real AI member state, member metrics, audit writes or production persona publish actions can appear.
- Mobile is a readable/no-overflow fallback, not pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA-0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release.

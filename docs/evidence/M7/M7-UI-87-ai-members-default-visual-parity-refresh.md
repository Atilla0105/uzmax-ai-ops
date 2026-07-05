# M7-UI-87 AI Members Default Visual Parity Refresh Evidence

## Status

Visible UI refresh candidate evidence for `tenant.aiMembers` / AI 成员 on stacked branch `codex/m7-ui-87-ai-members-default-visual-parity-refresh`, based on `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` / PR #228 HEAD.

This slice removes visible engineering/runtime labels from the default AI members fallback body while preserving degraded/mock/read-only/no runtime/no production metrics/no production persona publish/local action/no DB/API evidence in hidden DOM, `data-runtime-boundary`, `title` metadata and focused Playwright metrics. It does not claim AI member DB/API/runtime, audit write, member metrics, production persona publish, owner visual acceptance, merge, GA/1.0, production deployment, real customer/order-data use, customer LLM, Telegram Business automatic reply or release approval.

## Entry Evidence

| Fact | Evidence |
|---|---|
| worker path | `/Users/atilla/.codex/worktrees/m7-ui-87-ai-members-default-visual-parity-refresh` |
| worker branch | `codex/m7-ui-87-ai-members-default-visual-parity-refresh` |
| worker status at entry | `## codex/m7-ui-87-ai-members-default-visual-parity-refresh` |
| entry HEAD | `b5bf192` |
| base | `codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh` / PR #228 HEAD |
| root/main checkout | Root checkout was not used for writes. |

## Required Reads / Mapping

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- Impeccable project context and product register
- `docs/admin-design-system.md`
- `docs/specs/M7-UI-41-ai-members-page.md`
- `docs/specs/M7-UI-69-ai-members-source-parity-refresh.md`
- `docs/evidence/M7/M7-UI-69-ai-members-source-parity-refresh.md`
- `docs/evidence/M7/README.md`
- `docs/admin-ui-page-migration-ledger.md`
- `apps/admin/src/pages/agents/AgentsPage.tsx`
- `apps/admin/src/pages/agents/AgentViews.tsx`
- `apps/admin/src/pages/agents/agentsFallback.ts`
- `apps/admin/tests/m7-ui-ai-members.spec.ts`
- `apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts`
- `/Users/atilla/Downloads/运营塔台1.0.html`
- `/Users/atilla/源码/unpacked 6/pages/agents/AgentsPage.tsx`
- `/Users/atilla/源码/unpacked 6/hooks/useAgents.ts`
- `/Users/atilla/源码/unpacked 6/fixtures/agents.ts`

| Source | Mapping summary |
|---|---|
| Owner HTML | Bundled interactive source remains the owner visual/source oracle for AI members within the tenant shell. |
| Unpacked agents page | Source anatomy: title, member filters, breaker/estop alert, AI cards, capability chips, status actions, human table, persona editor, eval gate and publish controls. |
| Unpacked `useAgents.ts` | State-machine reference for filter, status, capability, persona draft/eval/publish/rollback behavior only. |
| Unpacked `fixtures/agents.ts` | Wording and field-shape reference for agents, capabilities, statuses, human members and persona versions; not production data. |

## Implementation Summary

| Path | Summary |
|---|---|
| `apps/admin/src/pages/agents/AgentsPage.tsx` | Adds page-level boundary metadata, replaces visible local/runtime toast and confirm copy with operational Chinese, and keeps persona publish boundary evidence hidden/data/title-only. |
| `apps/admin/src/pages/agents/AgentViews.tsx` | Hides runtime note, cleans header/state/alert copy, and moves capability/status boundary terms into metadata. |
| `apps/admin/src/pages/agents/agentsFallback.ts` | Centralizes runtime boundary labels and replaces persona fallback text with source-like operational persona wording. |
| `apps/admin/tests/m7-ui-ai-members.spec.ts` | Updates existing focused interactions to assert clean visible body and hidden boundary evidence. |
| `apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts` | Keeps source-parity geometry/screenshots while reading runtime caveats from hidden/data/title attributes instead of visible body text. |
| `apps/admin/tests/m7-ui-ai-members-default-visual-parity.spec.ts` | Adds focused M7-UI-87 coverage for clean default body, status/persona interactions, URL states, mobile body and hidden boundary metrics. |
| `docs/specs/M7-UI-87-ai-members-default-visual-parity-refresh.md` | Adds scoped spec for this default visual parity refresh. |
| `docs/evidence/M7/README.md` and `docs/admin-ui-page-migration-ledger.md` | Records UI-87 as a visible refresh candidate with hidden-runtime-boundary non-claims. |

## Browser Evidence

Artifacts target: `/tmp/uzmax-m7-ui-87-ai-members-default-visual-parity-refresh/`

- React default screenshot: `/tmp/uzmax-m7-ui-87-ai-members-default-visual-parity-refresh/react-ai-members-default-clean.png`
- React mobile 320 screenshot: `/tmp/uzmax-m7-ui-87-ai-members-default-visual-parity-refresh/react-ai-members-mobile-320-default-clean.png`
- Metrics JSON: `/tmp/uzmax-m7-ui-87-ai-members-default-visual-parity-refresh/metrics.json`
- Source-parity screenshots/metrics remain under `/tmp/uzmax-m7-ui-69-ai-members-source-parity-refresh/` when the existing source-parity spec is run.

Expected assertions:

- default visible AI members body contains `AI 成员`, `人类成员与 AI 成员`, `能力开关`, `熔断/急停`, `人设版本`, `评测门禁`, `紧急停止`, `恢复熔断`, `解除急停`, `运行评测` and `发布预览`;
- default visible body does not contain forbidden engineering terms;
- page root, hidden runtime note and local action controls contain boundary evidence;
- tenant shell and active page `tenant.aiMembers`;
- `320px` mobile body scrollWidth `<= 320`.

## Runtime / Data Boundary

- AI member data remains page-local fallback state.
- Filter, capability toggle, status changes, persona draft, eval pass and publish preview remain local React behavior only.
- No backend/API/DB/audit/member metrics/persona production publish/package/lock/shared shell/topbar/sidebar/router files are touched.
- No formal runtime, production metrics, audit write, production persona publish or DB/API closure is claimed.

## Validation

| Command | Result | Notes |
|---|---|---|
| `pwd` | pass | `/Users/atilla/.codex/worktrees/m7-ui-87-ai-members-default-visual-parity-refresh`. |
| `git status --short --branch` | pass | `## codex/m7-ui-87-ai-members-default-visual-parity-refresh` at entry. |
| `git branch --show-current` | pass | `codex/m7-ui-87-ai-members-default-visual-parity-refresh`. |
| `git diff --check` | pass | No output. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node scripts/guards/pr-shape.mjs --base codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh --spec docs/specs/M7-UI-87-ai-members-default-visual-parity-refresh.md --include-worktree` | pass | Exact output: `{"base":"codex/m7-ui-86-knowledge-resources-default-visual-parity-refresh","specPath":"docs/specs/M7-UI-87-ai-members-default-visual-parity-refresh.md","specType":"feature","bootstrapException":false,"changedFiles":10,"categories":{"source":3,"test":3,"docs":4},"source":{"changedFiles":3,"netLoc":0,"newFiles":0}}`. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Vite output: `✓ 1879 modules transformed`; assets `index.html 0.39 kB`, CSS `47.44 kB`, JS `885.24 kB`; `✓ built in 110ms`; existing large-chunk warning only. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check ...` | pass | `All matched files use Prettier code style!`. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/eslint/bin/eslint.js ...` | pass | No output after keeping `AgentsPage.tsx` at 249 lines, `AgentViews.tsx` at 243 lines and source-parity spec at 398 lines. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/@playwright/test/cli.js test apps/admin/tests/m7-ui-ai-members.spec.ts apps/admin/tests/m7-ui-ai-members-source-parity.spec.ts apps/admin/tests/m7-ui-ai-members-default-visual-parity.spec.ts` | pass | `5 passed (2.6s)`. Manual `node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173` was used because the Playwright config webServer command calls unavailable `npm/npx`; preview was stopped after the run. |
| `rg -n "aria-label=\\{?\\\".*(mock\|degraded\|read-only\|runtime unavailable\|not production\|synthetic\|local-only\|browser-local only\|no production\|MOCK-\|disabled\|fixture\|controlled://mock\|local action only)" apps/admin/src/pages/agents apps/admin/tests/m7-ui-ai-members*.spec.ts \|\| true` | pass | No output; forbidden terms are not present in user-facing `aria-label` strings. |

Validation dependency note: this worktree has no committed `node_modules`; validation used a temporary symlink to `/Users/atilla/.codex/worktrees/m7-ui-86-knowledge-resources-default-visual-parity-refresh/node_modules`, then removed it before final status/staging. Final `git status --short --branch` did not show `?? node_modules`.

## Remaining Differences / Non-Claims

- This slice records a default visual parity refresh only; it does not claim owner visual acceptance.
- Runtime remains downgraded/local-only in hidden evidence. A future approved runtime spec is required before production AI member records, member metrics, audit writes or persona publish actions can appear.
- Mobile is a readable/no-overflow fallback, not a pixel-level mobile redesign.

## Boundary

This evidence does not approve page migration final acceptance, runtime closure, M7 closeout, owner acceptance, GA/1.0, production, real customer/order-data use, customer LLM, Telegram Business automatic reply or release.

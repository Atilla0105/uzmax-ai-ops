# M6-01 Release Gate Console Evidence

> evidence_id: M6-01-release-gate-console
> milestone: M6
> acceptance_items: A-01, A-04, A-05, J-05, K-03, K-04, L-01
> owner: project owner accepted M5 milestone/runtime evidence for starting M6; owner still owns GA-0, production, real data, customer LLM, P1 risk and 1.0 release decisions
> status: ready_for_review
> created_at: 2026-06-26
> updated_at: 2026-06-26
> source_files: `AGENTS.md`, four v1.1 source-of-truth docs, `docs/specs/M6-01-release-gate-console.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`, `docs/release.md`, `apps/admin/src/releaseGateContracts.ts`, `apps/admin/src/App.tsx`
> sensitive_data_location: none; this file contains no customer/order/message/provider secret material
> redaction_status: no raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets
> review_notes: M6-01 updates the existing admin release console to show current repo evidence and blockers; it does not implement audit writes, open GA-0, approve production or approve 1.0 release
> signoff: pending owner review of this M6-01 PR

## Summary

M6-01 replaces the stale hardcoded admin release gate rows with `apps/admin/src/releaseGateContracts.ts`, a single maintained frontend contract used by `App.tsx`.

The contract now shows:

- M0-M4 accepted milestone evidence;
- M5 owner accepted for milestone/runtime evidence only;
- M6 release hardening in progress;
- GA-0 locked by L-01 checklist and owner decision;
- 1.0 blocked by final P0/P1/P2 rollup.

Linear `LAY-6` is tracking only and is not a source of truth.

## Start Audit

Recorded at M6-01 entry on 2026-06-26.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-01-release-gate-console` |
| assigned `git status --short --branch` before docs/source edits | `## codex/m6-01-release-gate-console` |
| assigned branch | `codex/m6-01-release-gate-console` |
| assigned `HEAD` | `6a32dc365fd8df3174c76cbd566a57119fc6106e` |
| assigned `origin/main` | `6a32dc365fd8df3174c76cbd566a57119fc6106e` |
| root/main checkout | `/Users/atilla/Applications/UZMAX智能运营` |
| root/main status | `## main...origin/main` |
| root/main `HEAD` | `6a32dc365fd8df3174c76cbd566a57119fc6106e` |
| root/main `origin/main` | `6a32dc365fd8df3174c76cbd566a57119fc6106e` |
| open PR audit | GitHub REST returned `open_pr_count 0` before this PR |
| latest main CI | GitHub Actions `CI` run `28196030193`, push on `6a32dc3`, conclusion `success` |
| branch hygiene before M6-01 | M6-00 branch/worktree deleted; prior merged M5R remote stale branches deleted; no no-merged local or remote branch remained before M6-01 work |

## Implementation

| Area | Result |
|---|---|
| Admin contract | `apps/admin/src/releaseGateContracts.ts` now holds release gate rows, evidence links, blockers and disabled GA-0 action metadata. |
| Admin shell | `apps/admin/src/App.tsx` renders gate rows from the maintained contract instead of local stale arrays. |
| Evidence links | Admin rows link to repo paths, including `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` and `docs/evidence/M6/README.md`. |
| Release doc | `docs/release.md` added because M6-01 maintains a release console contract. |
| Tests | Playwright and Node tests cover current gate state, evidence traceability, stale wording removal and disabled GA-0 action. |

## Acceptance Mapping

| Item | M6-01 status | Evidence target |
|---|---|---|
| A-01/A-05 | `release_gate_console_current_state_supported_not_full_release_verified` | Release panel reflects current group/release evidence posture and remaining blockers. |
| A-04 | `non_goal_release_actions_disabled` | GA-0 open action remains disabled and no production approval wording appears. |
| J-05 | `milestone_evidence_visible_not_final_p0_rollup` | M5 owner-accepted evidence and M6 in-progress state are visible in admin release gate. |
| L-01 | `ga0_locked_until_checklist_green_and_owner_decision` | Admin console shows GA-0 locked and disabled. |
| K-03/K-04 | `active` | One spec / one PR; release gate contract is serial and scoped. |

## Validation

Recorded on 2026-06-26 from the assigned worktree.

| Command | Result | Notes |
|---|---|---|
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH /Users/atilla/Applications/UZMAX智能运营/node_modules/.bin/prettier --check docs/specs/M6-01-release-gate-console.md docs/evidence/M6/README.md docs/evidence/M6/M6-01-release-gate-console.md docs/release.md apps/admin/src/App.tsx apps/admin/src/releaseGateContracts.ts apps/admin/tests/m6-release-gate-console.spec.ts scripts/tests/m6-release-gate-console.test.mjs` | pass | Touched files use Prettier style. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node --test scripts/tests/m6-release-gate-console.test.mjs` | pass | Used temporary `node_modules` symlink to root checkout dependencies; 3/3 focused tests passed. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js build apps/admin --emptyOutDir` | pass | Admin build passed before focused Playwright. |
| `PATH=/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node node_modules/vite/bin/vite.js preview apps/admin --host 127.0.0.1 --port 4173` + `playwright test apps/admin/tests/m6-release-gate-console.spec.ts` | pass | Manual Vite preview used because local environment has bundled `node` but no `npm`; 1/1 focused Playwright test passed. |
| `node node_modules/typescript/lib/tsc.js --noEmit -p tsconfig.json` | blocked_local_dependency | Local root checkout dependencies do not include `bullmq`, so existing `apps/worker/src/order-import-bullmq-runtime.ts` cannot resolve that package in this machine state. |
| `eslint` on apps/packages/scripts plus repo config files | pass | Ran with temporary `node_modules` symlink to root checkout dependencies. |
| `dependency-cruise apps packages --config dependency-cruiser.config.cjs` | pass | `no dependency violations found`. |
| `jscpd apps packages scripts --config jscpd.config.json` | pass | `No duplicates found`. |
| `knip -c package.json#knip` | pass | No unused export findings after keeping release gate types internal. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/forbidden-terms.mjs` | pass | `forbidden-terms: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/eval-trigger-paths.mjs` | pass | `no eval-triggering paths changed`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/doc-trigger-paths.mjs` | pass | `doc-trigger-paths: ok`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/workspace-isolation.mjs` | pass | `workspace-isolation: ok (codex/m6-01-release-gate-console, linked worktree, dirty allowed)`. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/worker-write-boundary.mjs --assigned /Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-01-release-gate-console --root /Users/atilla/Applications/UZMAX智能运营` | pass | Assigned worktree boundary check passed. |
| `/Users/atilla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M6-01-release-gate-console.md` | pass | Commit diff: changed files 8; categories source 2/test 2/docs 4; source net LOC +92; new source files 1. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |

## Boundary

M6-01 does not approve:

- M6-02 implementation;
- GA-0 opening;
- production readiness;
- real customer traffic/data;
- real order data;
- customer LLM or real LLM/provider calls;
- production Redis/worker deployment;
- external SaaS onboarding;
- Telegram Business automatic reply;
- broad admin redesign;
- 1.0 release.

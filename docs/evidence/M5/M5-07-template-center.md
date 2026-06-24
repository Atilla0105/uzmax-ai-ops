# M5-07 Template Center Evidence

## Start Audit

Recorded before source/test implementation edits on 2026-06-24.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5-07-template-center` |
| assigned `git status --short --branch` | `## codex/m5-07-template-center...origin/main` |
| assigned `git branch --show-current` | `codex/m5-07-template-center` |
| worker `HEAD` | `c685a96b4dca0e76b3a5e0d6505ac269306b8851` |
| worker `origin/main` | `c685a96b4dca0e76b3a5e0d6505ac269306b8851` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root branch | `main` |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit | `git branch --no-merged main` returned no branch output |
| linked worktree check | git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5-07-template-center`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git` |
| node_modules | present at start |

## Scope

M5-07 implements a frontend-only admin shell and pure local contract for:

- allowed template kinds: `knowledge`, `ai_member`, `config`, `eval`, `quick_reply`;
- grouped template cards for knowledge, AI member, config, eval and quick reply;
- visible business fit, version, last copied tenant and eval status metadata;
- local copy-to-tenant draft governance with tenant-owned version refs;
- disabled sync suggestion and disabled production apply actions;
- no auto-overwrite of production tenant configuration.

Allowed files are exactly the allowlist in `docs/specs/M5-07-template-center.md`. Root/main checkout is read-only for this worker.

## Process Incident

`docs/incidents/INC-2026-06-24-m5-07-root-patch-target.md` records M5-07 boundary errors: this slice's first spec/evidence/M5 index patch landed in root/main; later `worker-write-boundary` detected transient root deletions of `apps/admin/tests/design.spec.ts`, `apps/admin/src/App.tsx` and `docs/evidence/M5/README.md`, with same-content conflict copies for the latter two. All were cleaned before commit/PR; post-cleanup root status returned to `## main...origin/main`; assigned worktree holds the M5-07 diff.

## Boundaries

This slice does not implement API changes, Prisma/DB runtime, schema/migrations/generated client, `packages/ops-assets`, template persistence, template copy runtime, production config overwrite, public/private quick-reply search/import/export, persisted audit/log integration, production Redis/worker deployment, customer LLM, external SaaS onboarding, GA-0, M6 or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5-07 uses synthetic template metadata, generic tenant labels, controlled refs, local UI state and structured status only.

## Acceptance Mapping

| Item | M5-07 status | Evidence target |
|---|---|---|
| A-03 | `frontend_local_contract_supported_not_closed` | Copy draft proves tenant-owned version refs and no auto-overwrite locally; integrated tenant creation/runtime copy remains future. |
| H-04 | `frontend_local_contract_supported_not_closed` | Knowledge/config template copy draft uses tenant-independent version refs; DB/API persistence remains future. |
| H-06 | `frontend_local_contract_supported_not_closed` | Quick-reply template governance is visible as a reusable template kind; public/private search, classification, import/export and permission tests remain future. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-07 only; M5 closeout remains future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-07. |
| K-04 | `active` | Worktree/branch and touch list are distinct from root/main; DB schema, ops-assets and global serial points are untouched. |

## Validation

Recorded on 2026-06-24 from `/Users/atilla/Documents/uzmax-m5-07-template-center`.

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m5-template-center.test.mjs` | pass | 4 tests passed. |
| `node --test scripts/tests/m5-*.test.mjs` | pass | 28 M5 contract tests passed across M5-01..M5-07. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run lint` | pass | ESLint exited 0. |
| `npm run typecheck` | pass | `tsc --noEmit -p tsconfig.json` exited 0. |
| `npm run playwright` | pass | 19 Playwright tests passed, including M5-07 desktop and 320px mobile coverage. |
| `npm run build` | pass | API, worker, cron and admin build commands exited 0; Vite built admin. |
| `npm run size` | pass | Admin bundle reported 67.07 kB brotlied under the 250 kB limit. |
| `npm run knip` | pass | Knip exited 0. |
| `npm run jscpd` | pass | 0 clones found after adjusting the M5-07 test helper. |
| `npm run depcruise` | pass | No dependency violations found. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` in the linked M5-07 worktree. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-07-template-center --root /Users/atilla/Documents/UZMAX智能运营` | pass | Passed after incident cleanup; root/main status returned to clean. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:eval-triggers` | pass | No eval-triggering paths changed. |
| `npm run guard:forbidden-terms` | pass | `forbidden-terms: ok`. |
| `npm run guard:prettier-ignore` | pass | Baseline prettier-ignore markers intact. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-07-template-center.md --include-worktree` | pass | Post-PR run reported changed files 10, source files 4, net source LOC 307 and new source files 3. |
| `git diff --check origin/main` | pass | No whitespace errors. |
| `git diff --numstat origin/main -- apps/admin/src apps/admin/tests scripts/tests docs/specs docs/evidence/M5 docs/incidents` | pass | Changed source files 4; net source LOC 307; new source files 3; within budget. |
| `npm run test` | blocked_local_existing_m4 | Full repo test was terminated after hanging in existing `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`; M5-specific Node tests passed separately. |

## Spec Compliance Review

Pass. Independent spec reviewer reported `Spec compliant`: current diff matches the M5-07 allowlist, implements the local template center/copy-draft requirements, preserves not-accepted boundaries, and keeps root/main clean.

## Code Quality Review

Pass. Independent code quality reviewer reported no Critical or Important issues. Optional coverage polish for unsafe `targetTenantRef` and `tenantVersionRef` was added to `scripts/tests/m5-template-center.test.mjs` before final validation.

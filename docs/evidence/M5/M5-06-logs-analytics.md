# M5-06 Logs Analytics Evidence

## Start Audit

Recorded before source/test implementation edits on 2026-06-24.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5-06-logs-analytics` |
| assigned `git status --short --branch` | `## codex/m5-06-logs-analytics...origin/main` |
| assigned `git branch --show-current` | `codex/m5-06-logs-analytics` |
| worker `HEAD` | `43a6f74c564ab462e001e46fc0ddd34e203ab98f` |
| worker `origin/main` | `43a6f74c564ab462e001e46fc0ddd34e203ab98f` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root branch | `main` |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit | `git branch --no-merged main` returned no branch output |
| linked worktree check | git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5-06-logs-analytics`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git` |
| node_modules | present at start |

## Scope

M5-06 implements a frontend-only admin shell and pure local contract for:

- allowed analytics dimensions: `tenant`, `member`, `ai_member`, `channel`, `intent`, `time_grain`, `order_status`, `handoff_reason`;
- fixed v1.1 analytics board readback: resolution rate, handoff rate, SLA, cost, top questions, order query, draft adoption, knowledge health, confirmation queue 7-day pass rate, distill frequency and real traffic baseline;
- local export draft governance with `formalExportWrite: false`, `requiresOwnerConfirmation: true`, whitelisted dimensions and controlled refs only;
- login, presence and operation log filters/readback over synthetic local rows;
- operation high-risk controlled jump refs only;
- mobile 320px readback/fallback without full dimension/export editing.

Allowed files are exactly the allowlist in `docs/specs/M5-06-logs-analytics.md`. Root/main checkout is read-only for this worker.

## Boundaries

This slice does not implement API changes, Prisma/DB runtime, schema/migrations/generated client, metric aggregation, export job runtime, export files, persisted audit/log center, production log ingestion, raw message scanning, customer/order data readback, alert delivery, production Redis/worker deployment, customer LLM, external SaaS onboarding, GA-0, M6 or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5-06 uses synthetic counts, generic member labels, controlled refs, local UI state and structured status only.

## Acceptance Mapping

| Item | M5-06 status | Evidence target |
|---|---|---|
| I-06 | `frontend_local_contract_supported_not_closed` | Fixed board, dimension whitelist and local export draft governance are visible; runtime aggregation/export jobs remain future. |
| I-07 | `frontend_local_contract_supported_not_closed` | Login/presence/operation log readback is visible over synthetic local rows; persisted audit/log integration remains future. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-06 only; M5 closeout remains future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-06. |
| K-04 | `active` | Worktree/branch and touch list are distinct from root/main; DB schema and global serial points are untouched. |

## Validation

Recorded on 2026-06-24 from `/Users/atilla/Documents/uzmax-m5-06-logs-analytics`.

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m5-logs-analytics.test.mjs` | pass | Focused contract/docs/import-boundary tests passed: 4 tests, 0 failures. |
| `npm run test` | pass | Full Node suite passed: 348 tests, 69 suites, 0 fail, 0 cancelled, 0 skipped. |
| `npm run format:check` | pass | Prettier check passed after implementation. |
| `npm run lint` | pass | ESLint passed after implementation and source-budget trimming. |
| `npm run knip` | pass | No unused files, dependencies or exports reported. |
| `npm run typecheck` | pass | TypeScript typecheck passed. |
| `npm run depcruise` | pass | Dependency boundary check passed. |
| `npm run jscpd` | pass | Copy/paste detector reported 0 clones. |
| `npm run playwright` | pass | Admin Playwright suite passed: 17 tests, including M5-06 desktop and 320px mobile readback. |
| `npm run guard:workspace` | pass | Linked worktree accepted; dirty feature worktree allowed. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-06-logs-analytics --root /Users/atilla/Documents/UZMAX智能运营` | pass | Boundary guard confirmed assigned worktree/root separation. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:eval-triggers` | pass | No eval-triggering paths changed. |
| `npm run guard:forbidden-terms` | pass | `forbidden-terms: ok`. |
| `npm run guard:prettier-ignore` | pass | `prettier-ignore-boundary: ok` with frozen baseline. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-06-logs-analytics.md --include-worktree` | pass | Pre-commit worktree check passed: source 4, test 2, docs 3. Manual source numstat is 598 net LOC and 3 new source files, within budget. |
| `npm run build` | pass | API/worker/cron type-only builds and admin Vite build passed; admin output gzip JS 77.32 kB. |
| `npm run size` | pass | Size Limit passed: 66.23 kB brotlied / 250 kB limit. |
| `git diff --check origin/main` | pass | No whitespace errors. |

## Spec Compliance Review

Coordinator review: pass. The diff is limited to the M5-06 allowlist; no API, DB, distill, worker, cron, generated, lockfile, provider or production gate path is touched. The shell is synthetic/local, export drafts are `formalExportWrite: false`, export confirmation remains disabled, dimensions are whitelisted, refs fail closed, M5 remains `not_accepted`, and I-06/I-07 stay `frontend_local_contract_supported_not_closed`. Read-only spec review found no blockers.

## Code Quality Review

Coordinator review: pass after takeover from a stopped mid-implementation worker. The final code reuses existing admin shell patterns, keeps validation in a small pure contract helper, avoids backend imports and network calls, covers desktop/mobile behavior with Playwright, avoids raw long numeric/date identifiers in visible UI, and keeps source budget within the spec target. Read-only code review found one blocker around camelCase/compact unsafe controlled refs; the final contract now rejects those variants and has regression coverage for `customerProfile`, `rawPayload`, `secretRef` and `orderStatus` refs.

# M5-05 AI Member Console Evidence

## Start Audit

Recorded before source/test implementation edits on 2026-06-24.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5-05-ai-member-console` |
| assigned `git status --short --branch` | `## codex/m5-05-ai-member-console...origin/main` |
| assigned `git branch --show-current` | `codex/m5-05-ai-member-console` |
| worker `HEAD` | `bba5e05a8f8f303ab3c79d2dd41787d839ccd37a` |
| worker `origin/main` | `bba5e05a8f8f303ab3c79d2dd41787d839ccd37a` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root branch | `main` |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit | `git branch --no-merged main` returned no branch output |
| linked worktree check | git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5-05-ai-member-console`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git` |
| node_modules | `npm ci` ran in the assigned worktree; installed 360 packages and found 0 vulnerabilities |

## Process Incident

`docs/incidents/INC-2026-06-24-m5-05-root-patch-target.md` records an initial patch-target boundary error: this slice's first docs/source patch landed in root/main, was detected before validation/commit, transferred into the assigned worktree, and removed from root. Post-cleanup root status returned to `## main...origin/main`; assigned worktree holds the M5-05 diff.

## Scope

M5-05 implements a frontend-only admin shell and pure local contract for:

- AI member status display across `online`, `manual_offline`, `breaker_offline` and `disabled`;
- active version and persona refs;
- breaker offline reason ref visibility;
- per-AI capability toggles for `business_draft`, `order_read`, `quote`, `tutorial` and `vision`;
- local manual offline, emergency stop, recover online and toggle action drafts;
- emergency/recovery owner confirmation gating with `formalRuntimeWrite: false`;
- mobile emergency stop/recovery fallback without full complex editing.

Allowed files are exactly the allowlist in `docs/specs/M5-05-ai-member-console.md`. Root/main checkout is read-only for this worker after the incident cleanup recorded above.

## Boundaries

This slice does not implement API changes, Prisma/DB runtime, schema/migrations/generated client, distill scheduler/runtime, worker/cron integration, persisted audit/log center, formal AI member status writes, formal capability writes, production AI persona release, alert delivery, production Redis/worker deployment, customer LLM, real customer/order data, external SaaS onboarding, GA-0, M6 or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5-05 uses controlled refs, synthetic counts, generic member labels, local UI state and structured status only.

## Acceptance Mapping

| Item | M5-05 status | Evidence target |
|---|---|---|
| I-02 | `supported_not_closed` | Mobile fallback exposes emergency stop/recovery local drafts and disabled confirmation; production runtime path remains future. |
| I-07 | `supported_not_closed` | AI member state/action audit refs and local drafts are visible; persisted audit/log center readback remains M5-06/future integration. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-05 only; M5 closeout remains future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-05. |
| K-04 | `active` | Worktree/branch and touch list are distinct from root/main; DB schema and global serial points are untouched. |

## Validation

Recorded on 2026-06-24 from `/Users/atilla/Documents/uzmax-m5-05-ai-member-console`.

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m5-ai-member-console.test.mjs` | pass | Focused contract/docs/import-boundary tests passed: 3 tests, 0 failures. |
| `npm run test` | pass | Full Node suite passed: 344 tests, 68 suites, 0 fail, 0 cancelled, 0 skipped. |
| `npm run format:check` | pass | Prettier check passed after implementation. |
| `npm run lint` | pass | ESLint passed after implementation. |
| `npm run knip` | pass | No unused files, dependencies or exports reported. |
| `npm run typecheck` | pass | TypeScript typecheck passed. |
| `npm run depcruise` | pass | Dependency boundary check passed. |
| `npm run jscpd` | pass | Copy/paste detector reported 0 clones. |
| `npm run playwright` | pass | Admin Playwright suite passed: 15 tests, including M5-05 desktop and 320px mobile fallback. |
| `npm run guard:prettier-ignore` | pass | `prettier-ignore-boundary: ok` with frozen baseline. |
| `npm run guard:forbidden-terms` | pass | `forbidden-terms: ok`; no engine forbidden-term violation. |
| `npm run guard:eval-triggers` | pass | No eval-triggering paths changed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | Linked worktree accepted; dirty feature worktree allowed. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-05-ai-member-console --root /Users/atilla/Documents/UZMAX智能运营` | pass | Boundary guard confirmed assigned worktree/root separation. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-05-ai-member-console.md --include-worktree` | pass | Pre-commit worktree check passed: source 4, test 2, docs 4. Manual source numstat is 395 net LOC and 3 new source files, within budget. |
| `npm run build` | pass | API/worker/cron type-only builds and admin Vite build passed; admin output gzip JS 75.18 kB. |
| `npm run size` | pass | Size Limit passed: 64.39 kB brotlied / 250 kB limit. |
| `git diff --check origin/main` | pass | No whitespace errors. |

## Spec Compliance Review

Coordinator preliminary review: pass. The diff is limited to the M5-05 allowlist; no API, DB, distill, worker, cron, generated, lockfile, provider or production gate path is touched. The shell is synthetic/local, action drafts are `formalRuntimeWrite: false`, emergency/recovery actions require owner confirmation, unsafe refs/raw-field keys fail closed, M5 remains `not_accepted`, and the M5-05 process incident is recorded instead of being hidden. Read-only worker spec review found no blockers and confirmed the branch-diff scope, not-accepted marker, incident evidence and manual source budget.

## Code Quality Review

Coordinator preliminary review: pass. The implementation reuses the existing admin shell pattern, keeps validation in a small pure contract helper, avoids backend imports and network calls, covers desktop/mobile behavior with Playwright, and keeps source budget within the spec target. Read-only worker code review found no blockers; its non-blockers were handled by hiding the capability edit grid on 320px mobile fallback, broadening the no-backend/no-network regression regex and adding fail-closed tests for invalid actions, unknown keys, non-toggle fields and base64-ish refs.

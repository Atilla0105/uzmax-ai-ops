# M5-01 DB Contract Foundation Evidence

## Start Audit

Recorded before code/schema edits on 2026-06-24.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5-01-db-contract-foundation` |
| assigned `git status --short --branch` | `## codex/m5-01-db-contract-foundation` |
| assigned `git branch --show-current` | `codex/m5-01-db-contract-foundation` |
| worker `HEAD` | `761e1257fa9dbb1be04fa704031f2bbf5d28efd9` |
| worker `origin/main` | `761e1257fa9dbb1be04fa704031f2bbf5d28efd9` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root branch | `main` |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit | `git branch --no-merged main` returned no branch output |
| linked worktree check | git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5-01-db-contract-foundation`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git` |
| node_modules | missing at start; `npm ci` required before validation |

## Scope

M5-01 creates the minimum DB and contract vocabulary for:

- confirmation candidate queue records;
- controlled distill run state and daily health/downshift stats;
- AI member state and version refs;
- per-AI capability toggles.

Allowed files are exactly the allowlist in `docs/specs/M5-01-db-contract-foundation.md`. Root/main checkout is read-only for this worker.

Prisma models keep scalar UUID fields for M5 relations while the SQL migration owns scoped foreign keys and RLS policies. This keeps the source budget below the default cap without weakening tenant isolation.

## Boundaries

This slice does not implement API/admin/worker/runtime/distill scheduler/template center/log center/analytics UI. It does not write formal knowledge, eval sets or customer profiles. It does not approve M5, GA-0, production readiness, real customer traffic/data, customer LLM, production Redis/worker deployment, external SaaS onboarding or 1.0 release.

## No Sensitive Data Statement

This evidence and the implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5-01 stores refs, manifests, hashes, metadata objects and controlled IDs only.

## Acceptance Mapping

| Item | M5-01 status | Evidence target |
|---|---|---|
| H-02 | `foundation_supported_not_closed` | Confirmation item table/contracts for candidate queue state; runtime no-formal-write proof remains future. |
| H-03 | `foundation_supported_not_closed` | Conflict candidate kind and diff payload contract foundation; UI/E2E diff enforcement remains future. |
| H-07 | `foundation_supported_not_closed` | Distill run/health tables/contracts for cap/pass-rate/downshift/audit refs; scheduler/alert behavior remains future. |
| I-02 | `queued_foundation_only` | Data foundation can support future mobile confirmation and AI emergency flows, but no UI/API in this slice. |
| I-07 | `queued_foundation_only` | AI member status/toggle/version refs can support later log center evidence, but no readback UI/API here. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-01 only; M5 closeout remains future. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Required because `node_modules` was missing at start; installed 360 packages and found 0 vulnerabilities. |
| `npm run -w @uzmax/db prisma:generate` | pass | Prisma Client generated successfully from `packages/db/prisma/schema.prisma`. |
| `node --test scripts/tests/m5-operations-db-contracts-foundation.test.mjs` | pass | 4/4 tests passed. |
| `node --test scripts/tests/m3-ai-capability-data-contracts-foundation.test.mjs` | pass | 5/5 tests passed; historical M3 no-distill check now applies to the M3 migration. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run typecheck` | pass | TypeScript completed with exit 0. |
| `npm run lint` | pass | ESLint completed with exit 0. |
| `npm run jscpd` | pass | Reported 0 clones after M5-local helper cleanup. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` for linked worktree `codex/m5-01-db-contract-foundation`. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-01-db-contract-foundation --root /Users/atilla/Documents/UZMAX智能运营` | pass | `worker-write-boundary: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-01-db-contract-foundation.md --include-worktree` | pass | Reported changedFiles 9; categories docs 3, generated 1, source 3, test 2; source changedFiles 3, netLoc 592, newFiles 1. |
| `git diff --check origin/main...HEAD` | pass | Post-commit whitespace check passed. |

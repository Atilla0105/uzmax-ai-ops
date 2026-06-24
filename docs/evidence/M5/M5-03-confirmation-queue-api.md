# M5-03 Confirmation Queue API Evidence

## Start Audit

Recorded before source/test implementation edits on 2026-06-24.

| Fact | Evidence |
|---|---|
| assigned worktree `pwd` | `/Users/atilla/Documents/uzmax-m5-03-confirmation-queue-api` |
| assigned `git status --short --branch` | `## codex/m5-03-confirmation-queue-api` |
| assigned `git branch --show-current` | `codex/m5-03-confirmation-queue-api` |
| worker `HEAD` | `9c9d32ebfbd9197b0b2a05ede377dfd4dd20592c` |
| worker `origin/main` | `9c9d32ebfbd9197b0b2a05ede377dfd4dd20592c` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root branch | `main` |
| open PR audit | `gh pr list --state open --limit 50 --json number,title,headRefName,url,isDraft` returned `[]` |
| root no-merged branch audit | `git branch --no-merged main` returned no branch output |
| linked worktree check | git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5-03-confirmation-queue-api`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git` |
| node_modules | missing at start; `npm ci` required before validation |

## Scope

M5-03 implements a split in-memory API contract shell for:

- listing and filtering pending confirmation queue items for the selected tenant;
- reading item detail, including `diffPayload` for conflict candidates;
- applying approve/edit/discard/block decisions with reviewer from access context;
- returning audit draft contracts and explicit `formalWrite: false`;
- rejecting unsafe raw carriers and refs in API decision payloads;
- proving org + selected tenant scoping and conservative permissions.
- emitting confirmation queue modules through the API runtime compiler cache used by the readiness Nest HTTP shell.

Allowed files are exactly the allowlist in `docs/specs/M5-03-confirmation-queue-api.md`. Root/main checkout is read-only for this worker.

## Boundaries

This slice does not implement Prisma/DB runtime, schema/migrations/generated client, distill scheduler/runtime, worker/cron/admin UI, formal knowledge/profile/eval writes, alert delivery, production Redis/worker deployment, customer LLM, real customer/order data, external SaaS onboarding, GA-0, M6 or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5-03 uses controlled refs, synthetic UUIDs, structured status and synthetic metadata only.

## Acceptance Mapping

| Item | M5-03 status | Evidence target |
|---|---|---|
| H-02 | `api_contract_supported_not_closed` | Confirmation decisions require human API actions and return `formalWrite: false`; formal write pipeline remains future. |
| H-03 | `api_contract_supported_not_closed` | Conflict candidates require diff payload before approve/edit and expose detail diff; admin side-by-side E2E remains future. |
| H-07 | `unchanged_not_closed` | Distill health guardrails remain M5-02/M5-04/M5-06 scope. |
| I-02 | `api_contract_supported_not_closed` | API can support later mobile pass/discard fallback; mobile UI/E2E remains future. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-03 only; M5 closeout remains future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-03. |
| K-04 | `active` | Worktree/branch and touch list are distinct from root/main; DB schema and global serial points are untouched. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Initial `npm ci` through the Codex npm shim was killed with exit 137 and later hung on `npm --version`; direct `node .../npm-cli.js ci` installed 360 packages with 0 vulnerabilities in the assigned worktree. |
| `node --test scripts/tests/m5-confirmation-queue-api.test.mjs` | pass | Follow-up rerun: 6/6 tests passed. |
| `node --test scripts/tests/m1-02-api-access-context.test.mjs` | pass | Follow-up runtime smoke: 5/5 tests passed; Nest boot mapped `/confirmation-queue/items`, `/confirmation-queue/items/:itemId`, and `/confirmation-queue/items/:itemId/decisions` from the API runtime compiler cache. |
| `npm run test` | pass | Follow-up final rerun with literal `npm run test`; 338/338 tests passed. |
| `npm run format:check` | pass | Direct npm CLI invocation reported all matched files use Prettier style. |
| `npm run typecheck` | pass | TypeScript completed with exit 0. |
| `npm run lint` | pass | ESLint completed with exit 0 after keeping the test below lint's effective line limit. |
| `npm run depcruise` | pass | dependency-cruiser reported no dependency violations. |
| `npm run jscpd` | pass | Reported 0 clones after local repository/test helper reshaping. |
| `npm run guard:prettier-ignore -- --base origin/main` | pass | prettier-ignore boundary and diff check passed. |
| `npm run guard:forbidden-terms` | pass | `forbidden-terms: ok`. |
| `npm run guard:eval-triggers -- --base origin/main` | pass | No eval-triggering paths changed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok` for linked worktree `codex/m5-03-confirmation-queue-api`. |
| `npm run guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-03-confirmation-queue-api --root /Users/atilla/Documents/UZMAX智能运营` | pass | `worker-write-boundary: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5-03-confirmation-queue-api.md --include-worktree` | pass | Follow-up rerun reported changedFiles 10; categories docs 3, source 6, test 1; source changedFiles 6, netLoc 550, newFiles 4. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors in post-commit diff. |

## Spec Compliance Review

- Allowlist compliance: only M5-03 allowlist files are changed.
- Source budget: follow-up branch diff is changed source files = 6, new source files = 4, net source LOC = 550, at the M5-03 target.
- Scope compliance: implementation is an in-memory `apps/api` API contract shell. It has no Prisma/DB runtime, distill scheduler, worker/cron/admin UI, provider call or formal write path.
- Sensitive-data boundary: raw carrier keys and unsafe refs are rejected in decision payloads; this evidence and tests use controlled refs and synthetic UUIDs only.
- Acceptance status: H-02/H-03/I-02 are `api_contract_supported_not_closed`; M5 is not accepted.

## Code Quality Review

- Service assertions use `confirmation:read` for list/detail and `confirmation:write` for decisions.
- Repository access is scoped by `orgId` and `selectedTenantId`; cross-tenant detail/decision paths return not found.
- Conflict candidates require side-by-side diff payload before approve/edit.
- Decision responses include an audit draft and explicit `formalWrite: false`.
- Controller maps validation to 400, not found to 404 and access/permission failures to 403.

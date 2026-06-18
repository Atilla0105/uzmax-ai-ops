# M2-07 Conversation Ticket API HTTP Error Hardening Evidence

> evidence_id: M2-07-conversation-ticket-api-http-hardening
> spec: `docs/specs/M2-07-conversation-ticket-api-http-hardening.md`
> branch: `codex/m2-07-conversation-ticket-api-hardening`
> date: 2026-06-18
> status: contract_hardening_complete
> sensitive_data_location: none in repo
> redaction_status: no raw Telegram payloads, customer plaintext, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts or secrets included

## Scope

Included:

- Conversation/ticket API domain and validation errors now map to explicit Nest HTTP exceptions at the controller boundary.
- `conversation not found` / `ticket not found` map to 404.
- Ticket lock ownership conflicts map to 409.
- Missing required fields, invalid conversation status, invalid ticket action type and invalid ticket priority map to 400.
- Missing `AccessContext` follows the local M1-style fail-closed access mapping and maps to 403 at the conversation/ticket controller boundary.
- Permission/authz failures map to 403 and do not become generic 500 responses.
- Unexpected errors remain unexpected; arbitrary errors are not rewritten into business HTTP exceptions.
- `apps/api/src/conversation-ticket.ts` is now a public barrel, with controller/errors/repository/service/types split into cohesive sibling files.
- Handoff ticket runtime now exposes typed `TicketDomainError` values for lock conflict, invalid action, invalid priority and required-field failures.

Excluded:

- Real DB persistence, Prisma schema/migration, WebSocket/realtime, worker/engine consumer, admin API client, production traffic, GA-0, LLM, prompt/model route, Telegram Business, outbound sending and `message.content` customer plaintext paths.
- Any change to claim vs lock semantics. `claim` assigns; `lock` remains the exclusive edit guard.
- Any raw/customer/TG/order/payment/secret data.

External API evidence: none. This PR does not add or call external API/SDK/provider/connector/adapter code.

## TDD Evidence

| Phase | Command | Result | Notes |
|---|---|---|---|
| RED | `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` | failed as expected | New M2-07 assertions failed because controller errors had no HTTP status and split files were missing. Failure examples: `undefined !== 404` for `conversation not found`; missing `conversation-ticket.controller.ts`. |
| GREEN M2-03 | `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` | pass | Existing contract coverage preserved after the split; 4/4 tests passed. |
| GREEN M2-07 | `node --test scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs` | pass | New HTTP hardening coverage passed; 4/4 tests passed. |

## HTTP Error Contract

| Case | Mapping | Evidence |
|---|---:|---|
| conversation not found | 404 | `m2-conversation-ticket-api-http-hardening.test.mjs` |
| ticket not found | 404 | `m2-conversation-ticket-api-http-hardening.test.mjs` |
| ticket locked by another user | 409 | `m2-conversation-ticket-api-http-hardening.test.mjs` |
| missing required field | 400 | `m2-conversation-ticket-api-http-hardening.test.mjs` |
| invalid conversation status | 400 | `m2-conversation-ticket-api-http-hardening.test.mjs` |
| invalid ticket action type | 400 | `m2-conversation-ticket-api-http-hardening.test.mjs` |
| invalid ticket priority | 400 | `m2-conversation-ticket-api-http-hardening.test.mjs` |
| missing access context | 403 | M1-style fail-closed access mapping documented in spec/contracts |
| permission/authz failure | 403 | `m2-conversation-ticket-api-http-hardening.test.mjs` |
| unexpected arbitrary error | unchanged | `m2-conversation-ticket-api-http-hardening.test.mjs` asserts no business status is attached |

Identity-missing or invalid-token behavior remains owned by the existing M1 `ApiAccessContextGuard` and access-context HTTP mapper before the conversation/ticket controller is invoked.

## Claim Vs Lock Boundary

M2-07 explicitly does not change product behavior:

- `claim` sets `assignedUserId` and records assignment.
- `lock` sets `lockedByUserId` and remains the exclusive edit guard.
- A later claim-exclusive behavior would require a separate owner product decision and spec.

## File Split

| File | Responsibility |
|---|---|
| `apps/api/src/conversation-ticket.ts` | Public barrel for existing `AppModule` import stability. |
| `apps/api/src/conversation-ticket.controller.ts` | Nest routes, request parsing and HTTP exception mapping. |
| `apps/api/src/conversation-ticket.errors.ts` | API/domain error types and Nest HTTP mapping. |
| `apps/api/src/conversation-ticket.repository.ts` | In-memory tenant-scoped repository contract. |
| `apps/api/src/conversation-ticket.service.ts` | Access permission checks, handoff/ticket orchestration and state updates. |
| `apps/api/src/conversation-ticket.types.ts` | API-local shared types. |

## Branch And PR Hygiene

| Command | Result | Notes |
|---|---|---|
| `git status --short --branch` | pass | Worktree started on `## codex/m2-07-conversation-ticket-api-hardening...origin/main`; no pre-existing local file changes were observed. |
| `git branch --no-merged main` | pass | Initial audit returned no output. During review, coordinator verified stale local branch `codex/m2-04-admin-conversation-ticket-shell` was patch-equivalent already merged (`git cherry -v` showed `-`) and deleted it. Current rerun returns no output. |
| `gh pr list --state open --json number,title,headRefName,url` | pass | Returned `[]`; no open PRs at audit. |

## PR Hygiene Snapshot

| Field | Value |
|---|---|
| Spec ID | `M2-07-conversation-ticket-api-http-hardening` |
| Touch modules | Spec/evidence/contracts/M2 README; `apps/api/src/conversation-ticket*.ts`; `apps/api/scripts/runtime-compiler.mjs`; `packages/capabilities/handoff/src/index.ts`; focused M2 conversation-ticket tests/harness. |
| Source changed files | 8: `apps/api/scripts/runtime-compiler.mjs`, `apps/api/src/conversation-ticket.ts`, 5 new split API sibling files, `packages/capabilities/handoff/src/index.ts`. |
| Source net LOC | approx +291 source LOC after splitting the prior 300-line combined file. |
| New source files | 5 API sibling files. |
| Tests | Existing M2-03 focused test retained; new `scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs`; shared harness `scripts/tests/m2-conversation-ticket-test-harness.mjs`. |
| Generated / lockfile / config | none |
| External API/provider/adapter | none |
| Exception | none |

## Validation

| Command | Status | Notes |
|---|---|---|
| `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` | pass | 4/4 tests passed after split. |
| `node --test scripts/tests/m2-conversation-ticket-api-http-hardening.test.mjs` | pass | 4/4 tests passed. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run typecheck` | pass | `tsc --noEmit -p tsconfig.json` completed successfully. |
| `npm run lint` | pass | ESLint completed successfully after moving M2-07 assertions into a focused test file. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-07-conversation-ticket-api-http-hardening.md --include-worktree` | pass | 15 changed files; categories source 8, docs 4, test 3. |
| `npm run check` | pass | Full chain passed: format, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc guards, 58/58 node tests, build, size-limit and Playwright 6/6. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one PR | pass | M2-07 only. |
| Touch list | pass | Intended diff stays inside the M2-07 spec write set. |
| HTTP mappings | pass | Focused M2-07 test covers 404/409/400/403 and unexpected passthrough. |
| Controller mapping responsibility | pass | Nest HTTP mapping lives in `conversation-ticket.controller.ts` via `conversation-ticket.errors.ts`; handoff helper remains Nest-free. |
| Claim vs lock | pass | Focused test proves claim does not set `lockedByUserId`; lock remains exclusive guard. |
| Sensitive data | pass | Synthetic UUID-like IDs and bounded placeholder text only; no raw/customer materials. |
| Production boundary | pass | No DB/WS/worker/admin/prod/customer plaintext wiring. |
| External API evidence | pass | None added or needed. |
| Exceptions | pass | none. |

## Follow-up Items

- Production DB repository and persistence wiring remain future work.
- Production WS or polling integration remains future work.
- Admin API client wiring remains future work.
- Worker/engine handoff concurrency remains future work.
- ADR-003/customer-data boundary remains an M3/production watchpoint before real customer message paths or customer LLM usage.

# M2-03 Conversation Handoff Ticket API Contract Evidence

> evidence_id: M2-03-conversation-handoff-ticket-api-contract  
> spec: `docs/specs/M2-03-conversation-handoff-ticket-api-contract.md`  
> branch: `codex/m2-03-conversation-ticket-api-contract`  
> date: 2026-06-17  
> status: contract_partial_evidence

## Scope

This evidence records only the M2-03 conversation / handoff / ticket API contract baseline.

Included:

- In-memory conversation repository/service shell scoped by `AccessContext.orgId` and `AccessContext.selectedTenantId`.
- Conversation list/detail filters for `open`, `pending_handoff`, `handoff`, `closed`, unread, awaiting reply and SLA risk contract flags.
- Handoff ticket draft creation with summary, suggested action and SLA config placeholder contract.
- Ticket state machine baseline for claim, lock, note, escalate, close and reopen.
- Human handoff semantics that mark conversation `pending_handoff`, set AI suspended and mark in-flight AI messages `withdrawn` or `pending_cancel`.

Excluded:

- Admin UI, WebSocket/realtime, real Redis/BullMQ, real DB repository, Prisma schema/migration, engine/worker consumer, LLM, prompts, model routes, Telegram Business, outbound sending, production deployment, GA-0, real customer traffic, raw payloads or customer samples.

External API evidence: none (no new external API/SDK/provider/connector/adapter).

## TDD Evidence

| Phase | Command | Result | Notes |
|---|---|---|---|
| RED-env | `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` | failed before `npm ci` | Fresh worktree lacked `node_modules`; failure was `ERR_MODULE_NOT_FOUND: typescript`, so this was environment setup, not accepted RED. |
| RED | `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` | failed as expected | 4 failures: missing `createHumanHandoff`, missing `createTicketState`/`applyTicketAction`, missing `apps/api/src/conversation-ticket.ts`, missing contracts README section. |
| GREEN | `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` | passed | 4/4 tests passed after handoff/API contracts and contracts README implementation. |

## Contract Notes

- `packages/capabilities/handoff/src/index.ts` is pure contract/runtime code: no LLM calls, no outbound send, no DB access, no cross-capability import.
- SLA is represented only as `{ policyRef, source: "config_placeholder", dueAt? }`; M2-03 does not compute or promise SLA from LLM output.
- Ticket lock ownership fail-closes when a second actor attempts to lock a ticket already locked by another user.
- The API service methods require explicit `AccessContext`; list/detail never trust request body tenant overrides.
- Default `AppModule` registration is a local contract shell with `InMemoryConversationTicketRepository`; it does not imply production readiness.
- `apps/api/scripts/runtime-compiler.mjs` only teaches the existing local Nest runtime smoke to load the new `conversation-ticket.ts` module; it does not add production DB, WS, queue or deployment readiness.

## Validation

| Command | Status | Notes |
|---|---|---|
| `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` | pass | 4/4 tests passed. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run typecheck` | pass | `tsc --noEmit -p tsconfig.json` completed successfully. |
| `npm run lint` | pass | ESLint completed for apps, packages and scripts. |
| `npm run depcruise` | pass | 33 modules / 13 dependencies cruised with no dependency violations. |
| `npm run jscpd` | pass | 39 files analyzed; 0 clones found. |
| `npm run knip` | pass | Completed with no findings. |
| `npm run test` | pass | 54/54 tests passed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-03-conversation-handoff-ticket-api-contract.md` | pass | 8 changed files: source 4, docs 3, test 1; source net LOC 598; new source files 1. |
| `npm run build` | pass | API/worker/cron type builds and admin Vite build completed. |

## Acceptance Mapping

| Item | M2-03 status | Evidence |
|---|---|---|
| C-06 | contract_partial_evidence | Handoff marks conversation `pending_handoff`, AI suspended and in-flight AI messages `withdrawn`/`pending_cancel`; engine/worker concurrency remains later. |
| D-01 | contract_partial_evidence | Conversation list/detail filters and access-context scoping covered by focused test; admin UI/E2E remains M2-04. |
| D-02 | contract_partial_evidence | Handoff creates ticket summary, suggested action and SLA placeholder contract; notification and real repository remain later. |
| D-03 | contract_partial_evidence | Ticket claim/lock/note/escalate/close/reopen state machine covered by focused test; multi-account admin E2E remains later. |
| I-04 | not_closed | WS/realtime or degraded polling remains M2-05. |
| J-05 | active | Evidence recorded during M2, not deferred to M6. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Touch list is explicit; DB schema remains untouched. |

## PR Hygiene Snapshot

| Field | Value |
|---|---|
| Spec ID | `M2-03-conversation-handoff-ticket-api-contract` |
| Touch modules | `docs/specs/M2-03-conversation-handoff-ticket-api-contract.md`; `docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md`; `docs/contracts/README.md`; `apps/api/scripts/runtime-compiler.mjs`; `apps/api/src/app.module.ts`; `apps/api/src/conversation-ticket.ts`; `packages/capabilities/handoff/src/index.ts`; `scripts/tests/m2-conversation-ticket-api-contract.test.mjs` |
| Source changed files | `apps/api/scripts/runtime-compiler.mjs`; `apps/api/src/app.module.ts`; `apps/api/src/conversation-ticket.ts`; `packages/capabilities/handoff/src/index.ts` |
| Source changed / net LOC / new files | 4 changed source files; +598 net source LOC; 1 new source file. |
| Runtime compiler scope | `apps/api/scripts/runtime-compiler.mjs` is necessary only because the existing Nest boot smoke imports `AppModule` through the local runtime compiler; without this allow-list/cache entry, `conversation-ticket.ts` is not loadable in `npm run test`. It does not add production DB, WS, queue or deployment readiness. |
| Tests | `scripts/tests/m2-conversation-ticket-api-contract.test.mjs` |
| Generated / lockfile / config | none |
| Exception | none |
| Unfinished items | Real DB repository, admin UI, WS/realtime, worker/engine integration, notification/presence routing and production readiness remain future specs. |

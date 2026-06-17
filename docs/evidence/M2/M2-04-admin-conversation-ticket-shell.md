# M2-04 Admin Conversation Ticket Shell Evidence

> evidence_id: M2-04-admin-conversation-ticket-shell
> spec: `docs/specs/M2-04-admin-conversation-ticket-shell.md`
> branch: `codex/m2-04-admin-conversation-ticket-shell`
> milestone: M2
> status: validated_local
> sensitive_data_location: none
> redaction_status: no real customer messages, Telegram handles, phone numbers, addresses, order ids, payment data, screenshots, voice transcripts or raw payloads

## Scope

This evidence records only the local synthetic admin conversation / ticket UI shell.

Included:

- Tenant-layer conversation list, filters and priority ordering for needs-human and SLA-risk states.
- Synthetic conversation detail showing AI suspended plus in-flight `withdrawn` and `pending_cancel` semantics.
- Ticket queues, ticket detail, local claim/lock/note/escalate/close/reopen UI state and close result/destination/explanation structure.
- Disabled/read-only Business posture referencing ADR-B01.
- Loading, empty, error, permission denied and degraded UI states.

Not included:

- Production conversation/ticket API, WebSocket/realtime, real DB repository, Prisma schema/migration, worker/engine/channel integration, LLM, prompt/model route, Telegram Business enablement, outbound sending, GA-0 or real customer traffic.

## RED / GREEN

| Phase | Command | Result | Notes |
|---|---|---|---|
| RED | `npm run playwright` | failed as expected | With only implementation files stashed and the new Playwright expectations kept, 1 existing M1 test passed and 5 M2 checks failed on missing `m2-conversation-ticket-shell`, `ticket-queue-tabs`, `m2-state-loading` or `ticket-detail` test ids. |
| GREEN | `npm run playwright` | pass | 6/6 Playwright tests passed after restoring/completing the local shell. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm run test` | pass | 54 tests passed, 0 failed. |
| `npm run typecheck` | pass | TypeScript strict check passed. |
| `npm run lint` | pass | ESLint completed with exit 0. |
| `npm run build` | pass | Admin build output: JS gzip 63.11 kB. |
| `npm run size` | pass | Size Limit reported 53.78 kB brotlied against 250 kB limit. |
| `npm run playwright` | pass | 6/6 Playwright tests passed after final component adjustment. |
| `npm run format:check` | pass | Prettier check passed for all matched files. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-04-admin-conversation-ticket-shell.md` | pass | Branch diff: 6 changed files; categories source 3, test 1, docs 2; source changed files 3, net LOC 498, new source files 2. |
| `npm run check` | pass | Full local check passed. The default PR-shape step inside `check` skipped PR-only checks because no PR existed yet; the explicit required spec-scoped PR-shape command above passed. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one PR | pass | `docs/specs/M2-04-admin-conversation-ticket-shell.md` only. |
| Touch list | pass | Staged files are exactly the M2-04 allowed paths. |
| Admin import boundary | pass | `apps/admin` imports only React, tokens and local CSS/component files. |
| Business disabled | pass | UI includes disabled ADR-B01 control and no confirm/send Business path. |
| Synthetic data only | pass | Playwright sensitive regex passed; source/evidence review found no real samples. |
| Source budget | pass | Source changed files 3, net source LOC 498, new source files 2. |
| No lock/config/generated churn | pass | Staged diff contains no lock, config, generated or dist paths. |
| No test weakening | pass | No `.skip`, `.only`, `xit` or `xfail` added. |

## Acceptance Mapping

| Item | M2-04 status | Notes |
|---|---|---|
| C-03b | ui_guard_partial_evidence | Business appears only as disabled/read-only ADR-B01 state. |
| C-06 | display_partial_evidence | UI displays AI suspended and in-flight withdrawn/pending_cancel semantics; engine/worker concurrency remains later. |
| D-01 | ui_partial_evidence | Conversation filters/states and priority ordering covered by Playwright; production data/API remains later. |
| D-02 | display_partial_evidence | Ticket detail shows summary, suggested action and SLA placeholder; API notification/repository remains later. |
| D-03 | ui_partial_evidence | Claim/lock/note/escalate/close/reopen and close result UI covered locally; multi-account backend locking remains later. |
| I-01 | local_ui_partial_evidence | Conversation/ticket shell joins admin desktop workflow; broader customer/order/knowledge/eval flows remain later. |
| I-04 | not_closed | UI shows degraded/non-realtime state only; WS/realtime or polling evidence remains future scope. |
| J-05 | active | Evidence recorded during M2 instead of deferred to M6. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Explicit touch list; no DB schema change. |

## PR Hygiene

| Field | Value |
|---|---|
| Spec ID | `M2-04-admin-conversation-ticket-shell` |
| Spec file | `docs/specs/M2-04-admin-conversation-ticket-shell.md` |
| Touch modules | `docs/specs/M2-04-admin-conversation-ticket-shell.md`; `docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md`; `apps/admin/src/App.tsx`; `apps/admin/src/M2ConversationTicketShell.tsx`; `apps/admin/src/m2-conversation-ticket-shell.css`; `apps/admin/tests/design.spec.ts` |
| Path categories | docs: spec/evidence; source: admin app shell/component/CSS; test: Playwright design spec; generated/lock/config: none |
| Source changed files / net LOC / new source files | 3 / 498 / 2 |
| Test changes | Playwright coverage for desktop, 320px mobile floor, tablet, tenant switch, D-01 filters/states/priority, D-03 ticket actions/close UI, Business disabled, sensitive text regex and core UI states |
| Generated / lock / config changes | none expected |
| External API evidence | none; this PR does not add or call external API/SDK/provider/connector/adapter |
| Exceptions | none |

## Unfinished Items

- M2-04 does not close production D-01/D-03, C-06, I-01 or I-04. It records local synthetic UI evidence only.
- Business remains closed under ADR-B01 `no_go_owner_inputs_missing`; future Business work requires a new real-account spike or superseding ADR evidence.

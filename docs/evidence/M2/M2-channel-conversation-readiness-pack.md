# M2 Channel Conversation Readiness Pack

> evidence_id: M2-channel-conversation-readiness-pack
> milestone: M2
> acceptance_items: C-01 / C-02 / C-03 / C-03b / C-04 / C-05 / C-05b / C-06 / D-01 / D-02 / D-03 / I-01 / I-04 / J-05 / K-03 / K-04
> status: ready_to_start_specs
> created_at: 2026-06-17
> updated_at: 2026-06-17
> owner: 项目 owner 确认是否允许进入 M2 spec-governed channel/conversation queue，并继续负责真实 Bot/Business 账号、真实客户流量、customer LLM、GA-0、成本和合规决策；AI agent 负责从当前 main、docs、PR/branch audit 和 validation 产证据、暴露阻断项并维护治理记录
> source_files: `docs/specs/M2-00-channel-conversation-readiness-pack.md`、`docs/evidence/M1/M1-platform-skeleton-signoff.md`、`docs/specs/SPK-01-telegram-business.md`、`docs/preflight/02-external-dependencies-spikes.md`、`docs/doc-gates.md`、v1.1 根文档、local audit commands on 2026-06-17
> sensitive_data_location: none
> redaction_status: no raw customer data, Telegram payloads, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data or support personal accounts in this readiness pack
> review_notes: M2 is opened only for future spec-governed channel/conversation work; production, real customer traffic, customer LLM, GA-0, Telegram Business auto-reply and Business feasibility remain blocked
> signoff: pending project owner review of PR; merging M2-00 would accept only `ready_to_start_specs`, not production readiness

## Current Decision

M1 platform skeleton is accepted, and the current `main` baseline is healthy enough to open an M2 readiness/spec-queue PR.

M2 current status is `ready_to_start_specs`: future M2 specs may be opened in order, one spec per PR, under the touch-module and schema-serial rules. This is not a production, GA-0, real-traffic, customer-LLM or Telegram Business feasibility approval.

## Current Main Audit

| Fact | Status | Evidence |
|---|---|---|
| branch baseline | clean main-equivalent | `HEAD` = `origin/main` = `417f777a1eb7379ff113273aeb42fecfa029655c` before this docs diff |
| M1 signoff | accepted | `docs/evidence/M1/M1-platform-skeleton-signoff.md` status `accepted` |
| open PR audit | none | `gh pr list --state open --json number,title,headRefName,baseRefName,url` returned `[]` |
| unmerged branch audit | none | `git branch --no-merged main` produced no branch output |
| baseline validation | passed | `npm run check` passed locally on 2026-06-17 before this docs diff |
| current M2 state | ready_to_start_specs | M2-00 only opens queue/spec governance, not implementation |
| production readiness | blocked | staging/prod, full M2/M3/M4, GA-0 and later release gates remain open |
| real customer traffic | blocked | GA-0 requires later checklist and owner decision |
| customer LLM | blocked | ADR-003 remains dev-only/customer-LLM blocked for real customer messages |
| Telegram Business | blocker for M2 closeout | SPK-01 has no feasibility conclusion yet |

## M2 Allowed Scope

- Future spec-governed work for Bot ingress/dedupe/queue, channel/conversation DB/contracts, conversation/handoff/ticket APIs, admin conversation/ticket shell and realtime evidence if needed.
- SPK-01 real-environment Business spike or conservative unavailable/no-conclusion branch closure.
- Milestone evidence and closeout records tied to C/D/I/J/K acceptance items.

## Not Opened

- Production deployment readiness or production release.
- Real customer traffic, GA-0, distill from real customer traffic or customer messages entering third-party LLM.
- Telegram Business auto-reply.
- Telegram Business feasibility claim.
- Order/customer asset/AI capability work outside the M2 channel/conversation boundary.

## M2 Queue

| Order | Future spec / PR | Purpose | Exit condition |
|---:|---|---|---|
| 1 | `M2-01-channel-conversation-db-contracts-foundation` | DB/contracts foundation for channel, conversation, message and ticket | schema/contracts tests pass; no production traffic |
| 2 | `M2-02-telegram-bot-ingress-dedupe-queue` | Bot webhook ingress, dedupe, queue handoff and boundary handling | C-01/C-02 partial evidence for Bot path |
| 3 | `SPK-01-telegram-business` | Real Business account spike or conservative closure | ADR-B01 records feasible/partial/unavailable branch and feature flag posture |
| 4 | `M2-03-conversation-handoff-ticket-apis` | Conversation, handoff and ticket APIs/state transitions | C-06/D-02/D-03 API/integration evidence |
| 5 | `M2-04-admin-conversation-ticket-shell` | Admin conversation/ticket shell | D-01/D-03/I-01 local UI evidence without backend imports |
| 6 | `M2-05-realtime-ws-evidence-if-needed` | WS/realtime or explicit degraded/polling evidence | I-04 evidence or documented no-WS branch for M2 |
| 7 | `M2-06-channel-conversation-closeout-signoff` | Close M2 evidence and record owner signoff/failures | M2 acceptance mapping complete or explicitly branched |

## Parallelism Rules

- M2-01 DB/contracts foundation is first and serial; any schema/migration/Prisma model/DTO generator change is a global serial point.
- SPK-01 can run in parallel with non-Business code only when it touches ADR/evidence and temporary spike assets. Production Business adapter/API/admin/contract work conflicts with the relevant implementation PRs.
- Bot, API and admin specs cannot parallelize if their `触碰模块/文件` overlap.
- Admin shell waits for stable API/contracts unless its own spec explicitly limits work to mocks and avoids production API claims.
- Future PRs must preserve AGENTS dependency rules: `admin` only calls API/WS, `capabilities/*` do not import each other, and `engine` carries no business-line terms.

## SPK-01 Status

SPK-01 remains an M2 blocker. Current status is `pending_real_business_account_or_conservative_closure`.

M2 cannot close Business acceptance items until one of these happens:

- Real Telegram Business account evidence proves the branch, and ADR-B01 records C-03/C-04/C-05/C-05b posture.
- The existing SPK-01 spec reaches the conservative unavailable/no-conclusion branch, ADR-B01 records that Business is unavailable for 1.0, and feature flags/API/admin entries are closed under C-03b.

This readiness pack does not claim Telegram Business feasibility.

## Acceptance Mapping

| Item | M2-00 status | Future closure path |
|---|---|---|
| C-01 | queued_not_closed | M2-02 Bot ingress/dedupe/queue |
| C-02 | queued_not_closed | M2-02 Bot edge cases |
| C-03 / C-03b / C-04 / C-05 / C-05b | conditional_blocked_by_SPK-01 | SPK-01 + ADR-B01 feasible/partial/unavailable branch |
| C-06 | queued_not_closed | M2-03 handoff/cancel in-flight behavior |
| D-01 | queued_not_closed | M2-04 admin conversation filters/states |
| D-02 | queued_not_closed | M2-03 handoff/ticket creation API |
| D-03 | queued_not_closed | M2-03/M2-04 ticket lock/claim/close/reopen |
| I-01 | partial_future_scope | M2-04 covers conversation/ticket shell only; full item remains broader 1.0 |
| I-04 | queued_if_needed | M2-05 realtime or degraded evidence |
| J-05 | opened_for_m2 | M2 evidence directory and readiness pack created |
| K-03 | active | M2-00 is one spec/one PR |
| K-04 | active | Queue and parallelism rules recorded |

## Validation Baseline

| Command | Result | Note |
|---|---|---|
| `git fetch --prune origin` | pass | refreshed remote refs before audit |
| `git branch --no-merged main` | pass | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,url` | pass | returned `[]` |
| `npm run check` | pass | local baseline on commit `417f777a1eb7379ff113273aeb42fecfa029655c` before this docs diff |

## Signoff Boundary

Project owner merge/signoff of M2-00 means:

- accepted: M2 may start future spec-governed channel/conversation PRs in queue order.
- not accepted: production readiness, real customer traffic, customer LLM, GA-0, Business auto-reply, Telegram Business feasibility, or any implementation not covered by a later approved spec.

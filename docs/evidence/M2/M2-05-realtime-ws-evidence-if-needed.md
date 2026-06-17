# M2-05 Realtime WS Evidence If Needed

> evidence_id: M2-05-realtime-ws-evidence-if-needed
> spec: `docs/specs/M2-05-realtime-ws-evidence-if-needed.md`
> branch: `codex/m2-05-realtime-ws-evidence`
> milestone: M2
> created_at: 2026-06-18
> updated_at: 2026-06-18
> status: documented_no_ws_branch_for_m2
> sensitive_data_location: none
> redaction_status: no real customer messages, Telegram handles, phone numbers, addresses, order ids, payment data, screenshots, voice transcripts, raw payloads, support personal accounts, secrets or token values

## Decision

M2-05 decision: `documented_no_ws_branch_for_m2`.

Current M2 does not implement production WebSocket or polling runtime for conversation/ticket updates. M2 accepts the documented degraded/no-WS branch as the queue exit for `M2-05-realtime-ws-evidence-if-needed`, while I-04 remains `not_closed_for_1_0_production`.

Future I-04 closure must come from a new implementation spec with real WS or polling integration and automated evidence for latency/freshness, tenant-scoped auth/permission behavior, admin cache patch behavior and degraded fallback behavior.

## Current Facts

| Fact | Status | Evidence |
|---|---|---|
| M2-03 production realtime | excluded | `docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md` records an in-memory API contract shell and explicitly excludes WebSocket/realtime, real DB repository, Redis/BullMQ, worker integration and production readiness. |
| M2-03 I-04 | not closed | M2-03 acceptance mapping records `I-04` as `not_closed`; WS/realtime or degraded polling remains M2-05. |
| M2-04 production realtime | excluded | `docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md` records only local synthetic admin UI shell evidence and explicitly excludes production API, WebSocket/realtime, real DB repository, worker/engine/channel integration and real customer traffic. |
| M2-04 degraded UI | present | M2-04 records loading, empty, error, permission denied and degraded UI states; its I-04 row says the UI shows degraded/non-realtime state only. |
| M0 SPK-04 / ADR-002 | not production conversation realtime | SPK-04 and ADR-002 cover auth/access-context principles for HTTP/WS handshake, token refresh, reconnect and storage signing; they do not prove conversation/ticket production realtime events, admin patch cache or I-04 latency. |
| 1.0 architecture target | still WebSocket | v1.1 technical architecture still lists WebSocket realtime gateway for 1.0 conversations, tickets, presence, heartbeat and eval run status. M2-05 does not delete or supersede that target. |
| 1.0 I-04 requirement | still open | The 1.0 acceptance matrix defines I-04 as WS event presentation within 200ms; this M2 branch does not satisfy the production acceptance item. |

## I-04 M2 Branch

| Item | M2 decision | Production status |
|---|---|---|
| I-04 realtime evidence | documented_no_ws_branch_for_m2 | not_closed_for_1_0_production |
| Runtime path | no production WS and no polling runtime in M2 | future spec required |
| Admin behavior in M2 | degraded/non-realtime shell only | future API/WS or polling client required |
| Automated latency evidence | none in M2 | future latency/freshness test required |

The M2 branch is intentionally conservative. It avoids implementing runtime pieces before production API/DB/worker/admin integration is ready and avoids claiming M0 auth spike evidence as conversation/ticket realtime evidence.

## Future Closure Path

Future I-04 closure must be a separate spec/PR and should include at least:

- Production or production-like conversation/ticket event source: WS gateway or documented polling route.
- Tenant-scoped auth and authorization behavior for realtime/polling requests, including tenant switch or revoked permission behavior.
- Admin integration evidence that server events patch or refresh the cache without requiring a manual page refresh.
- Automated latency/freshness evidence: WS event to screen <= 200ms, or an owner-approved polling freshness threshold if polling replaces WS for a branch.
- Degraded behavior when realtime transport is unavailable, including visible state and safe recovery.
- Sensitive-data boundary showing no raw customer messages, Telegram payloads, screenshots, voice transcripts, support personal accounts or secrets enter the repo.

## Explicit Non-Changes

- No production WebSocket gateway.
- No polling runtime.
- No admin API client or TanStack Query cache patch.
- No DB repository, Prisma schema/migration or production persistence change.
- No worker, engine, queue, presence or notification integration.
- No Telegram Business enablement, Business adapter, outbound sending or external provider/connector/adapter.
- No LLM, prompt, model route, real customer traffic, GA-0 or production deployment claim.

## Branch And PR Hygiene

| Check | Status | Evidence |
|---|---|---|
| worktree | pass | `/Users/atilla/Documents/uzmax-m2-05-realtime-evidence` |
| branch | pass | `codex/m2-05-realtime-ws-evidence` |
| baseline | pass | `HEAD` and `origin/main` were `2c3f9295900abab6cb4f16ff72659f33aba4e20a` before this docs diff. |
| root write boundary | pass | All final edits are limited to the isolated worktree; an initial mistaken root write was precisely removed, and root returned clean before this worktree diff. |
| open PR audit | pass | No open PR output was returned at start of work. |
| unmerged branch audit | pass | `git branch --no-merged main` produced no branch output at start of work. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Fresh worktree lacked `node_modules`; install completed. npm audit reported existing 3 high severity findings, not changed by this docs-only PR. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-05-realtime-ws-evidence-if-needed.md --include-worktree` | pass | 3 changed files; categories docs 3; source changed files 0, net LOC 0, new files 0. |
| `npm run guard:pr-shape -- --base origin/main` | pass | PR body metadata parsed the spec path and reported 3 docs files, source changed files 0, net LOC 0, new files 0. |
| `git diff --check` | pass | No whitespace errors. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one PR | pass | `docs/specs/M2-05-realtime-ws-evidence-if-needed.md` only. |
| Touch list | pass | Intended diff is limited to this spec, this evidence file and `docs/evidence/M2/README.md`. |
| Docs-only scope | pass | No source, test, config, generated, lockfile or contracts changes. |
| Runtime boundary | pass | No `apps/api/**`, `apps/admin/**`, `packages/**` or `scripts/**` changes. |
| I-04 honesty | pass | Evidence records M2 documented no-WS branch and leaves I-04 production open. |
| Sensitive data | pass | No raw customer data, Telegram payloads, screenshots, voice transcripts, order/customer/payment samples, support personal accounts or secrets. |
| External API evidence | pass | None required; no external API/SDK/provider/connector/adapter added or called. |
| Exceptions | pass | none. |

## Acceptance Mapping

| Item | M2-05 status | Notes |
|---|---|---|
| I-04 | documented_no_ws_branch_for_m2 / not_closed_for_1_0_production | M2 records no-WS/degraded branch only; future production closure needs real WS or polling integration and automated latency/freshness evidence. |
| J-05 | active | M2-05 evidence is recorded during M2 instead of deferred to M6. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Touch list is explicit and docs-only; no schema/API/admin/runtime conflict. |

M2-05 does not close C-06, D-01, D-02, D-03, I-01 or production I-04. It only closes the M2 queue item by recording the documented no-WS branch decision.

## PR Hygiene

| Field | Value |
|---|---|
| Spec ID | `M2-05-realtime-ws-evidence-if-needed` |
| Spec file | `docs/specs/M2-05-realtime-ws-evidence-if-needed.md` |
| Touch modules | `docs/specs/M2-05-realtime-ws-evidence-if-needed.md`; `docs/evidence/M2/M2-05-realtime-ws-evidence-if-needed.md`; `docs/evidence/M2/README.md` |
| Path categories | docs: spec/evidence/index; source/test/generated/lock/config: none |
| Source changed files / net LOC / new source files | 0 / 0 / 0 |
| Test changes | none |
| Generated / lock / config changes | none |
| External API evidence | none; this PR does not add or call external API/SDK/provider/connector/adapter |
| Exceptions | none |
| Unfinished items | Production I-04 remains open for future real WS or polling integration spec with automated latency/freshness and cache behavior evidence. |

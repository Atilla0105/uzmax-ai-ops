# M11-00 Value-0 Customer-Service Closure Contract

Spec ID: M11-00
Status: `approved_for_execution`
Owner confirmation point: on 2026-07-10 the project owner explicitly asked the AI agents to complete the previously proposed Value-0 customer-service loop. This approval covers controlled staging, the approved Telegram Test Bot/test account, the existing DeepSeek staging route, merge/deploy/verification needed for this loop, and one human staging operator account. It does not approve production, real customer/order data, Telegram Business, a real-customer third-party LLM data-processing change, GA, 1.0, or new paid infrastructure.
Timebox: one serial Value-0 milestone; stop expanding scope once the acceptance path below is true.

## Spec 类型

docs

## Goal

Turn the existing collection of contracts, prototype pages and partial staging services into one usable customer-service path:

1. the owner signs in to the real staging admin;
2. an approved Telegram test user sends a message to the Test Bot;
3. the inbound message body and Telegram customer identity/profile are stored under tenant RLS and are readable in the workbench;
4. the active published KB/persona/eval-gated DeepSeek route replies and persists safe accounting evidence;
5. the owner requests human takeover, edits and sends a manual reply from the admin;
6. Telegram delivery acknowledgement, ticket state, audit evidence and DB readback are visible;
7. closing the ticket and explicitly resuming the conversation restores Bot handling for the next message;
8. one browser + Telegram + API/worker + DB staging run proves the path without synthetic fallback.

The milestone outcome is binary: the path above either passes end to end or M11 remains open with the exact failing boundary. Completing screens, PRD rows, local mocks or isolated smoke tests is not closure.

## Product Value Metric

- Primary: one approved staging test conversation completes steps 1-8 with no direct DB repair between steps.
- Operator usability: after takeover, the owner can send a reply from the selected conversation without leaving the workbench.
- Runtime truth: every visible message and customer identity in the acceptance run maps to a tenant-scoped DB row; no synthetic/local fallback is displayed in strict staging.
- Safety/accounting: every DeepSeek attempt in the acceptance run maps to one `llm_call_log` row with hashes/counts/route status and no raw prompt/completion in that log.
- Delivery: every operator send has a stable request id and ends in `sent` or an explicit fail-closed/ambiguous state; an unsafe automatic retry must not create a duplicate customer message.
- Receipt semantics: `sent` proves Telegram Bot API accepted `sendMessage` and returned a provider message reference; it is not a customer delivered/read receipt. Client visibility remains an explicit human observation in M11-09.

## Source Of Truth

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `docs/admin-design-system.md`
- `docs/adr/ADR-003-llm-data-processing.md`
- owner prototype `/Users/atilla/Downloads/运营塔台1.0.html` and unpacked source `/Users/atilla/源码/unpacked 6`

## Current Repo And Runtime Facts

- The schema already has `message`, `customer`, `customer_identity`, `ticket`, `ticket_event`, `audit_log` and `llm_call_log`; M11 has no known schema requirement.
- The worker currently stores inbound text length but not the text body and does not create/update customer identity.
- The active answer runtime returns LLM accounting drafts but does not persist them.
- The conversation API can read and mutate handoff tickets but has no operator reply queue endpoint and does not aggregate customer identity.
- The strict admin workbench reads the API but its composer is disabled and fallback copy is presented as an AI draft/redline result.
- The handoff control depends on `slaPolicyRef`, which the real DB conversation mapper does not currently return.
- Staging services are version-skewed: admin is on current main, API and worker are older, and cron is older and repeatedly failing database authentication. No M11 staging signoff is valid until the services are aligned to the accepted M11 SHA and cron is healthy or explicitly removed from the acceptance dependency with owner approval.
- M10-08 requested the owner invite and access grants, but inbox acceptance and real browser login remain unverified.
- The Test Bot ingress currently has no approved-chat allowlist. A valid Telegram webhook secret authenticates Telegram as the sender; it does not authorize the human chat. M11 must fail closed before an unknown chat can reach storage, DeepSeek or outbound delivery.
- The worker currently does not fence on an existing `HANDOFF`/`PENDING_HANDOFF` conversation before LLM/send, and the answer branch writes the conversation back to `OPEN`. Human takeover is therefore not safe until an explicit ownership state machine and pre-send recheck are implemented.

## Data And Safety Boundary

- M11 uses only the approved internal/staging Telegram test identity and synthetic test content.
- The approved chat/participant reference is supplied only through secret environment configuration. Unknown chats are acknowledged without queueing business work and must not enter the LLM, business message/customer tables or outbound adapter.
- No evidence, fixture, log, screenshot, PR body or committed file may contain the owner email, access/refresh token, Bot token, LLM key, DB URL, Telegram raw update, or test message plaintext.
- Message plaintext may exist only in the tenant-scoped business `message.content` row and authorized admin response needed for this product function; it must not be copied into audit/LLM accounting/telemetry logs.
- Customer profile fields are limited to Telegram-provided identity metadata required for the support context. They are not added to the LLM prompt.
- ADR-003 remains `accepted_dev_only__customer_llm_blocked`. Real customer messages must not enter the third-party LLM until a later owner-approved ADR/data-processing gate changes that status.
- Operator outbound uses at-most-once safety around Telegram's non-idempotent `sendMessage`: reserve a stable DB request before the external call, never blindly repeat an ambiguous send, and expose ambiguity/failure for operator action.

## Serial Slice Plan

| Slice | Deliverable | Runtime/module boundary | Acceptance before next slice |
|---|---|---|---|
| M11-01 | owner staging login acceptance | merged M10-08 workflow/evidence only | owner accepts invite/sets password; `/me/access-context` returns the selected tenant and exact 18 permissions without exposing identity/token |
| M11-02 | allowlisted inbound body + Telegram identity/profile persistence | channels + API ingress + worker persistence; existing schema/RLS only | unknown chat never queues/stores/calls LLM; approved chat has readable bounded content, idempotent identity upsert and tenant isolation |
| M11-03 | conversation/customer read truth + atomic takeover | conversation-ticket API repository/mappers/service | detail returns message delivery/customer/operator state; server owns SLA policy; takeover atomically suspends AI and owns/reuses the ticket |
| M11-04 | takeover/resume ownership state machine | handoff capability + API/worker persistence | handoff inbound is stored for the operator with zero LLM/outbound; pre-send race recheck suppresses AI; only an authorized explicit resume reopens Bot handling |
| M11-05 | DeepSeek policy/accounting persistence | worker answer runtime + existing `llm_call_log` | every attempt is tenant-scoped with accurate redaction/truncation metadata, hashes/counts/route status and no raw prompt/completion; provider failure hands off |
| M11-06 | operator reply command/outbox API | channels + API/controller/service/repository/module + exact owner permission provisioning | assigned operator with explicit `conversation:reply` permission creates one bounded `QUEUED` reply/audit with a stable idempotency key; the queue payload contains scoped IDs only, never reply text; wrong tenant/state/permission fails closed; API does not call Telegram directly |
| M11-07 | operator Telegram send/ack/audit | worker queue processor + existing outbound adapter/persistence | worker re-reads DB ownership/state, sends once, persists `SENT`/`FAILED`/`delivery_uncertain` and provider ack; ambiguous result is never blindly retried |
| M11-08 | usable support workbench | existing admin conversation client/runtime/composer | owner can takeover, edit/send, see delivery state, close ticket and explicitly resume Bot; loading/error/permission/degraded states are truthful |
| M11-09 | aligned staging and end-to-end acceptance | deploy workflow/supervisor/evidence/runbook | owner login plus approved Test Bot/browser/API/worker/DB path passes on aligned SHA; access-context includes the newly provisioned `conversation:reply`; rollback/readback recorded; cron is repaired or explicitly isolated as a non-Value-0 unhealthy service |
| M11-10 | milestone closeout truth | release/evidence docs only after M11-09 pass | record only `value0_staging_support_loop_passed_not_production_not_1_0`; production, real-customer LLM, GA and 1.0 remain locked |

Slices are serial. A slice may be split further if its source budget would exceed `AGENTS.md`, but it may not absorb Telegram Business, orders, analytics, distill, broad knowledge management or visual redesign.

## AI Agent Responsibilities

- Create each implementation spec/evidence pair before source edits and keep its machine-readable touch list narrow.
- Use one isolated worktree/branch per spec; root/main remains coordination-only.
- Run spec-compliance review before code-quality review for every slice.
- Reuse the current schema, queue, outbound adapter, RLS transaction pattern and workbench; do not create parallel implementations without `rg` evidence.
- Preserve the owner prototype visual system. Impeccable governs truthful interaction states, accessibility, error recovery and copy; M11 does not invent a new visual direction.
- Use current official provider/platform documentation for any external adapter behavior and record the exact basis.
- Keep deployment mutations until M11-01 through M11-08 are merged and their local/true-DB gates pass.
- Stop and report if completion requires production, real customer/order data, a new paid service, a further ADR-003 decision/approval-status change, or secret disclosure.

## Preconditions

- Base main at M11 start: `1f68c482970a79edce2d10c0ac5a2b16fd248a8a`.
- M11-00 worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/m11-00-value0-closure-contract`.
- M11-00 branch: `codex/m11-00-value0-closure-contract`.
- Forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`.
- `git branch --no-merged main` and `gh pr list --state open` were empty before M11-00 worktree creation.

## 触碰模块/文件

- `docs/specs/M11-00-value0-customer-service-closure-contract.md`
- `docs/evidence/M11/M11-00-value0-customer-service-closure-contract.md`
- `docs/adr/ADR-003-llm-data-processing.md`

## Change Budget

- Source/test/config/generated/lock/schema/migration: none.
- Docs: this spec, one evidence record and a current-provider clarification in ADR-003.
- Exceptions: none.

## 文档触发检查

updated

## Implementation Steps

1. Freeze the Value-0 acceptance path, safety boundary, service-alignment requirement and serial slice ownership in this contract.
2. Clarify in ADR-003 that DeepSeek is now integrated for controlled dev/test use while the accepted customer-data decision remains unchanged.
3. Merge M11-00 after spec-compliance and documentation-quality review.
4. Open M11-01 from the resulting main and continue serially through M11-10.
5. Do not mark M11 complete until the live acceptance path is proven or a precise owner/external blocker remains.

## Pass Conditions

- The eight-step path, data boundary, product metric and non-goals are decision-complete.
- Every known blocking gap maps to exactly one serial implementation/verification slice.
- No implementation, secret, deployment or external mutation is included in M11-00.
- `guard:pr-shape` and `git diff --check` pass.

## Failure Branches

- If any implementation slice requires a schema/migration, stop that slice and open a globally serial DB spec with RLS proof.
- If Telegram cannot provide idempotent send semantics, keep the documented at-most-once reservation and surface ambiguous delivery; do not claim exactly-once.
- If real-customer third-party LLM use is needed, keep staging internal-only and open an owner decision/ADR spec instead of widening M11.
- If owner login cannot be completed without inbox/password interaction, finish all machine-verifiable work, navigate to the safe handoff point, and request only that bounded owner action.
- If service deployment alignment or cron repair requires a new config/infra change, open a narrow serial infra spec before M11-09 signoff.

## Out Of Scope

- Telegram Business, personal-account automation, additional channels or omnichannel routing.
- Order reads/imports, pricing, analytics, distill, group overview, broad customer CRM and broad knowledge-base management.
- Production/GA/1.0 release, real customer/order data, custom SMTP, new paid infrastructure or ADR-003 approval.
- New visual design, prototype rewrite, broad refactor, schema redesign or realtime/WebSocket expansion.

## Acceptance Mapping

| Value-0 requirement | Owning slice/evidence |
|---|---|
| owner staging login | M11-01 plus M10-08 live acceptance update |
| approved-chat gate + inbound readable message + customer identity | M11-02/M11-03 |
| safe takeover, AI suspension and explicit resume | M11-03/M11-04 |
| KB/persona/eval-gated DeepSeek reply + accounting | M11-05 |
| idempotent manual send command | M11-06 |
| Telegram delivery ack + audit | M11-07 |
| usable composer + close/explicit resume | M11-08 |
| no synthetic fallback; aligned services; browser/Telegram/DB E2E | M11-09 |
| truthful non-production closeout token | M11-10 |

## Incident And Closeout

- Known pre-M11 incident/runtime debt: version-skewed staging services and failing cron DB authentication; M11-09 must align the Value-0 services and either repair cron or explicitly record it as an isolated unhealthy non-Value-0 service.
- No new M11 process incident found at contract creation.

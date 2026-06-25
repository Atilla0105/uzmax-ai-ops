# M6-06 Telegram Bot GA-0 Main Path

Spec ID: M6-06
Tracking issue: Linear LAY-11
Owner confirmation point: project owner review of this PR and later explicit GA-0 open decision.
Timebox: one docs/test-only PR.

## Spec 类型

infra

## Goal

Record Telegram Bot-only GA-0 main-path readiness from current repo source, tests and evidence.

This slice does not implement a new channel runtime. It records the safe synthetic/test path from webhook ingress through queue contract, handoff/ticket contract, runbook response and Business-disabled boundary.

GA-0 is not open, real customer traffic is not approved, Telegram Business automatic reply is not approved, and 1.0 release remains not approved by this spec.

## Source Links

- `AGENTS.md`
- `UZMAX智能运营系统-PRD-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `apps/api/src/telegram-bot.ts`
- `packages/channels/src/index.ts`
- `apps/api/src/conversation-ticket.service.ts`
- `apps/api/src/conversation-ticket.controller.ts`
- `packages/capabilities/handoff/src/index.ts`
- `docs/adr/ADR-B01-telegram-business.md`
- `docs/evidence/M2/M2-02-telegram-bot-ingress-dedupe-queue.md`
- `docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md`
- `docs/evidence/M2/M2-04-admin-conversation-ticket-shell.md`
- `docs/evidence/M2/M2-07-conversation-ticket-api-http-hardening.md`
- `docs/evidence/M2/spikes/SPK-01-telegram-business/manifest.md`
- `docs/evidence/M6/M6-03-queue-failure-injection-drills.md`
- `docs/evidence/M6/M6-05-ai-safety-eval-gates.md`

## Scope

- Add M6-06 evidence mapping Bot-only GA-0 main-path readiness to C-01, C-02, C-03b, C-06, J-04, L-01 and L-02.
- Add a Telegram Bot main-path runbook for bot no response, duplicate/out-of-order ingress, Business-disabled handling and manual escalation.
- Record traceable artifacts that are safe to store in repo evidence: provider update id, update kind, content kind, controlled conversation/ticket refs and PR/CI refs.
- Keep Telegram Business auto-reply disabled under ADR-B01 unless a future owner-approved spec supersedes it.
- Add a docs/test-only evidence contract for M6-06.
- Update M6 evidence index, release boundary and runbook index.

## Out Of Scope

- Telegram Business automatic reply launch, Business draft-send implementation or Business feasibility re-open.
- Real customer data, raw Telegram payloads, production Bot token, production webhook secret, support personal accounts or real production broadcast.
- Channel architecture rewrite, DB-backed dedupe repository, worker consumer, engine orchestration, outbound Bot sending or WebSocket runtime.
- New external API/provider/adapter code or new Telegram SDK.
- GA-0 opening, production deployment or 1.0 approval.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-06-telegram-bot-ga0-main-path.md`
  - `docs/evidence/M6/M6-06-telegram-bot-ga0-main-path.md`
  - `docs/evidence/M6/README.md`
  - `docs/release.md`
  - `docs/runbooks/README.md`
  - `docs/runbooks/telegram-bot-main-path.md`
  - `scripts/tests/m6-bot-ga0-main-path-readiness.test.mjs`
- 说明/备注：
  - This slice may read AGENTS, v1.1 source-of-truth docs, M2 Bot/conversation evidence, ADR-B01/SPK-01, M6-03 queue evidence, M6-05 AI safety evidence and focused tests.
  - Do not modify runtime source, packages, apps, schema/migrations, generated files, lockfile, CI/guard config, deployment config or admin UI.

## 变更预算与路径分类

- Source files: 0 changed, 0 new, 0 net LOC.
- Test files: 1 new.
- Docs files: up to 6 changed/new.
- Generated, lockfile, migration, schema, CI/config changes: none.
- Exceptions: none.

## Agent Responsibilities

- Re-read `AGENTS.md`, this spec and referenced source/evidence before editing.
- Keep implementation docs/test-only.
- Verify M6-06 does not claim real Bot production readiness or Business feasibility.
- Verify Business updates remain deferred/unsupported and Business auto-reply remains disabled.
- Run the new focused test and supporting M2/M6 evidence tests where local dependencies allow.
- Record PR/CI result and update Linear only as tracking.

## Acceptance

- Evidence maps C-01, C-02, C-03b, C-06, J-04, L-01 and L-02 to repo sources and current release status.
- Bot main path records traceable synthetic/test artifacts for webhook, queue result, duplicate/deduped ingress, unsupported/Business-deferred ingress and manual handoff/ticket.
- Duplicate ingress remains deduped. Out-of-order ingress remains bounded and traceable by `providerUpdateId`; DB-backed ordering/worker restore remains a visible gap instead of an overclaim.
- Telegram Business auto-reply stays out of GA-0 scope under ADR-B01.
- `docs/runbooks/telegram-bot-main-path.md` covers bot no response, duplicate/out-of-order ingress, Business-disabled handling and manual escalation failure branches.
- New test passes and enforces evidence links, docs/test-only scope and no GA/production/Business overclaim.

## Dependencies

- M6-02 runtime baseline.
- M6-03 queue/failure injection evidence.
- M6-05 AI safety/eval gate evidence.
- M2-02 Telegram Bot ingress/dedupe queue foundation.
- M2-03/M2-07 conversation handoff/ticket API foundation and HTTP hardening.
- M2-04 admin conversation/ticket shell.
- ADR-B01/SPK-01 conservative Telegram Business closure.

## Failure Branches

- If Bot ingress cannot prove secret fail-closed, duplicate dedupe or safe unsupported handling, keep C-01/C-02 open and block GA-0.
- If out-of-order updates require ordering semantics beyond current trace/dedupe contract, record the gap and split a later DB-backed dedupe/worker spec.
- If Business entry, API, draft-send or auto-reply path becomes visible/callable, keep C-03b open and block GA-0.
- If manual handoff cannot create a controlled ticket/draft path or AI remains active after takeover, keep C-06/L-02 open and block GA-0.
- If runtime/source/schema/provider changes are needed, stop this PR and split a later spec.

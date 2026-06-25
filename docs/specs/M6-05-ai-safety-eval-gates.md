# M6-05 AI Safety Eval Gates

Spec ID: M6-05
Tracking issue: Linear LAY-10
Owner confirmation point: project owner review of this PR and later GA-0/final acceptance decision.
Timebox: one docs/test-only PR.

## Spec 类型

infra

## Goal

Record release-level AI safety, eval-gate, model-all-down and AI fuse evidence for M6 from the existing repo source, tests and milestone evidence.

This slice creates the M6 evidence and drill runbook layer. It does not add a provider, call a real LLM, process real customer messages, change runtime source, lower eval assertions or approve GA-0.

GA-0 is not open, customer LLM is not approved, real provider calls are not approved, and 1.0 release remains not approved by this spec.

## Source Links

- `AGENTS.md`
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
- `UZMAX智能运营系统-技术架构-v1.1.md`
- `docs/adr/ADR-003-llm-data-processing.md`
- `packages/evals/src/index.ts`
- `packages/evals/src/m4-order-read-no-fabrication.ts`
- `packages/llm-gateway/src/index.ts`
- `packages/engine/src/index.ts`
- `apps/api/src/ai-member-runtime.ts`
- `docs/evidence/M3/M3-03-eval-gate-redline-runner.md`
- `docs/evidence/M3/M3-08-breaker-radius-and-redline-output-guard.md`
- `docs/evidence/M5R/M5R-04-ai-member-runtime-control.md`

## Scope

- Add M6-05 evidence mapping F/G/J-04/L-02 AI safety and eval-gate items to current repo evidence.
- Add a runbook for model-all-down, redline-bad-send and AI fuse/recovery drills.
- Record owner-controlled language/blind-review and full eval-set gaps explicitly.
- Add a docs/test-only guard for the M6-05 evidence contract.
- Update M6 evidence index, release boundary and runbook index.

## Out Of Scope

- New LLM provider integration or external provider/API/SDK adapter.
- Real provider calls, real LLM keys, customer LLM or third-party processing of real customer messages.
- Prompt, knowledge, model route or AI persona production publishing.
- Runtime backend/admin/worker implementation.
- Eval assertion weakening, skipped tests or mock widening to pass gates.
- Real Bot leave-ticket flow, GA-0 opening, production deployment or 1.0 approval.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-05-ai-safety-eval-gates.md`
  - `docs/evidence/M6/M6-05-ai-safety-eval-gates.md`
  - `docs/evidence/M6/README.md`
  - `docs/release.md`
  - `docs/runbooks/README.md`
  - `docs/runbooks/ai-safety-fuse.md`
  - `scripts/tests/m6-ai-safety-eval-gates.test.mjs`
- 说明/备注：
  - This slice may read `AGENTS.md`, v1.1 source-of-truth docs, ADR-003, M3/M4/M5R evidence, eval/LLM/engine/AI-member runtime sources and focused tests.
  - Do not modify app runtime source, backend packages, schema/migrations, generated files, lockfile, CI/guard config, deployment config or admin UI.

## 变更预算与路径分类

- Source files: 0 changed, 0 new, 0 net LOC.
- Test files: 1 new.
- Docs files: up to 6 changed/new.
- Generated, lockfile, migration, schema, CI/config changes: none.
- Exceptions: none.

## Agent Responsibilities

- Re-read `AGENTS.md`, this spec and referenced source/evidence before editing.
- Keep implementation docs/test-only.
- Verify no `packages/**`, `apps/**`, schema, migration, generated client, lockfile, CI or deployment config files changed except the focused test under `scripts/tests`.
- Run the new focused test and supporting evidence tests where local dependencies allow.
- Record PR/CI result and update Linear only as tracking.

## Acceptance

- Evidence maps F-01 through F-06, G-01 through G-06, J-04 and L-02 to repo sources and current release status.
- Evidence explicitly records model-all-down, eval-gate non-bypass, redline output suppression, false-positive handling, AI fuse radius and AI member emergency/recovery support.
- Evidence keeps G-04 owner blind-review and G-06 full >=200 eval-set gaps visible instead of overclaiming closure.
- `docs/runbooks/ai-safety-fuse.md` contains drill commands and failure branches for model-all-down, redline bad send and AI fuse/recovery.
- New test passes and enforces evidence links, no source/schema edits and no GA/production/customer-LLM overclaim.

## Dependencies

- M6-02 runtime baseline.
- M3-02 LLM gateway foundation.
- M3-03 eval gate/redline runner foundation.
- M3-08 breaker radius/redline output guard foundation.
- M4-22/M4-44 order-read no-fabrication eval evidence.
- M5R-04 AI member runtime control evidence.
- ADR-003 `accepted_dev_only__customer_llm_blocked` boundary.
- Owner language/blind-review and full eval-set decisions remain release inputs.

## Failure Branches

- If evidence cannot prove eval-gate fail-closed behavior, keep G-03 open and block GA-0.
- If model-all-down cannot degrade to ticket/handoff evidence, keep J-04/L-02 open and block GA-0.
- If redline unsafe output is echoed or outbound send is not suppressible, keep F-05/L-02 open and block GA-0.
- If enabling AI capabilities can bypass passed eval-gate evidence, keep G-03/F-06 open and block GA-0.
- If owner blind-review/full-set evidence is absent, record explicit G-04/G-06 risk items and defer final release closure.
- If runtime/source/schema/provider changes are needed, stop this PR and split a later spec.

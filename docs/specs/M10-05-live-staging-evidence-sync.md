# M10-05 Live Staging Evidence Sync

Spec ID: M10-05
Status: `implementation_in_progress`
Owner confirmation point: project owner authorized continuing with staging deploy and M10-03 live smoke in the Codex thread on 2026-07-09.
Timebox: narrow docs-only evidence sync.

## Spec 类型

docs

## Goal

Record the live staging closure for the customer-service workbench after M10-01, M10-02 and M10-03 landed on `main`:

1. Record that Render staging API deployed `main@a6a8990efbf5e5c3542f47cb23395ca90e34fb15`.
2. Record that `/healthz` and `/readyz` returned HTTP 200 after that deploy.
3. Record that Vercel admin production alias deployed the same commit and served admin HTML.
4. Record that API CORS from `https://uzmax-admin.vercel.app` still passes.
5. Record that M10-03 support-operator smoke passed with the sanitized status token `m10_03_support_operator_write_smoke_passed_not_release`.

## AI Agent Responsibilities

- Keep writes inside the assigned M10-05 docs-only worktree.
- Do not print or commit secrets, passwords, tokens, raw auth responses, DB URLs, customer text or conversation payloads.
- Treat this as staging synthetic evidence only.
- Do not claim GA-0 expansion, 1.0 release, production traffic, real customer data, customer LLM/provider use, Telegram Business automatic reply or formal knowledge-write approval.

## Preconditions

- Current branch is `codex/m10-05-live-staging-evidence-sync`.
- Current worktree is `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-05-live-staging-evidence-sync`.
- Root/main checkout is read-only for coordination.
- Base is `main@a6a8990efbf5e5c3542f47cb23395ca90e34fb15`.
- M10-01, M10-02, M10-03 and M10-04 are merged to `main`.

## Scope

- Add this spec.
- Add one M10-05 evidence record.
- Update the existing M10-03 evidence status from workflow-ready-not-run to the live pass that actually happened.

## Out Of Scope

- No source/runtime changes.
- No config, workflow, schema, migration, generated client, lockfile or test changes.
- No additional staging writes beyond the already completed M10-03 workflow run.
- No production/backend deploy, real customer/order data, customer LLM/provider call, Telegram outbound, Telegram Business automatic reply, formal knowledge write or 1.0 approval.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M10-05-live-staging-evidence-sync.md`
  - `docs/evidence/M10/M10-05-live-staging-evidence-sync.md`
  - `docs/evidence/M10/M10-03-support-operator-smoke.md`

Read-only anchors:

- `AGENTS.md`
- `docs/specs/M10-01-conversation-ticket-db-writes.md`
- `docs/specs/M10-02-admin-conversation-runtime-truth-gate.md`
- `docs/specs/M10-03-support-operator-smoke.md`
- `docs/evidence/M10/M10-01-conversation-ticket-db-writes.md`
- `docs/evidence/M10/M10-02-admin-conversation-runtime-truth-gate.md`
- `docs/evidence/M10/M10-03-support-operator-smoke.md`

## Change Budget

- Docs: changed docs files <= 3.
- Source: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- Test/config/generated/lock: none.
- Exceptions: none.

## Acceptance

- M10-05 evidence records Render API deploy id, commit, health/readiness status and boundary.
- M10-05 evidence records Vercel admin deployment id, commit, alias and CORS check.
- M10-05 evidence records M10-03 workflow run id, job id, status token, permission count, action count and cleanup residue from sanitized artifact fields only.
- Existing M10-03 evidence no longer says live staging mutation has not run.
- `guard:pr-shape` passes with zero source changes.
- `git diff --check` passes.

## Failure Branches

- If any evidence requires printing or committing a secret/token/raw payload, stop and keep only the sanitized run URL/status.
- If staging evidence contradicts live deployment truth, record the blocker instead of marking pass.
- If this requires source/runtime/config changes, stop and split a new spec.

## Validation

- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-05-live-staging-evidence-sync.md --include-worktree`
- `git diff --check main...HEAD`

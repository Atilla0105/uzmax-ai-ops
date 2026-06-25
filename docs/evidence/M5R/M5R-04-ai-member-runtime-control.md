# M5R-04 AI Member Runtime Control Evidence

## Start Audit

Recorded on 2026-06-25T05:28:57Z from the assigned M5R-04 worktree before implementation edits in this worker run. The three untracked draft files present at startup were inspected as draft material only, not trusted as evidence until refreshed here.

| Fact | Evidence |
|---|---|
| assigned worktree relocation | Earlier M5R-04 attempts used `/Users/atilla/Documents/uzmax-m5r-04-ai-member-runtime-control`; the coordinator moved the same linked worktree to `/private/tmp/uzmax-m5r-04-ai-member-runtime-control` with `git worktree move` so this worker can write inside the thread's writable roots. This is worktree-isolation evidence, not product scope. |
| assigned worktree `pwd` | `/private/tmp/uzmax-m5r-04-ai-member-runtime-control` |
| assigned `git status --short --branch` | `## codex/m5r-04-ai-member-runtime-control...origin/main`; untracked drafts: `apps/api/src/ai-member-runtime.ts`, `docs/evidence/M5R/M5R-04-ai-member-runtime-control.md`, `docs/specs/M5R-04-ai-member-runtime-control.md` |
| assigned `git branch --show-current` | `codex/m5r-04-ai-member-runtime-control` |
| worker `HEAD` | `e52796e6fbd8fff1d8e953e24245236e1a765574` |
| worker `origin/main` | `e52796e6fbd8fff1d8e953e24245236e1a765574` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` |
| root/main branch | `main` |
| root/main `HEAD` | `e52796e6fbd8fff1d8e953e24245236e1a765574` |
| root/main `origin/main` | `e52796e6fbd8fff1d8e953e24245236e1a765574` |
| open PR audit | `gh pr list --state open` returned no PR rows |
| no-merged branch audit before edits | `git branch --no-merged main` returned no branch output |
| linked worktree list | `/Users/atilla/Documents/UZMAX智能运营` at `e52796e` on `main`; `/private/tmp/uzmax-m5r-04-ai-member-runtime-control` at `e52796e` on `codex/m5r-04-ai-member-runtime-control` |
| linked worktree git-dir/common-dir | worker git dir `/Users/atilla/Documents/UZMAX智能运营/.git/worktrees/uzmax-m5r-04-ai-member-runtime-control`; common dir `/Users/atilla/Documents/UZMAX智能运营/.git`; superproject empty |

## Baseline

Focused M5R-04 runtime validation passed on 2026-06-25T06:42:24Z from `/private/tmp/uzmax-m5r-04-ai-member-runtime-control`.

## Scope

M5R-04 adds a minimal runtime proof for AI member emergency stop, recovery and capability toggles:

- default AppModule mode remains disabled/contract-safe and does not require `UZMAX_RLS_DATABASE_URL`;
- explicit `rls_prisma_gateway` runtime writes existing `ai_member`, `ai_capability_toggle` and `audit_log`;
- active `ai_member_version` context is read and preserved in audit content where recovery evidence needs it;
- recovery and capability enabling enforce M3 breaker/eval-gate non-bypass rules;
- mobile emergency fallback is represented by a focused admin API client that reaches the real API contract, not by broad visible admin runtime wiring.

Allowed files are exactly the allowlist in `docs/specs/M5R-04-ai-member-runtime-control.md`. Root/main checkout is read-only for this worker.

## Current DB Contract Check

The existing DB contract already contains:

- `ai_member` Prisma model/table with status, active version, emergency stop timestamp, breaker reason ref and forced RLS grants.
- `ai_member_version` Prisma model/table with persona ref, status, eval gate ref, config version ref and forced RLS grants.
- `ai_capability_toggle` Prisma model/table with capability key, enabled flag, config version ref, updater and forced RLS grants.
- `audit_log` Prisma model/table with free-text event type, actor, module/action/object fields, before/after content and forced RLS select/insert grants.
- `eval_gate` Prisma model/table with target refs and `passed`/`failed`/`blocked`/`pending` statuses for the non-bypass rule.

M5R-04 therefore does not add Prisma schema, migration, RLS policy or generated-client changes.

## Boundaries

This slice does not implement broad admin UI runtime wiring, Playwright visible browser evidence, logs analytics runtime, template copy runtime, distill scheduler changes, eval publishing, prompt/persona/model-route release, worker/cron behavior, schema/migration changes, production deploy, production Redis/worker/cron deployment, external SaaS onboarding, real customer/order data, customer LLM, real LLM calls, GA-0, M6, M5 owner acceptance or 1.0 release behavior.

## No Sensitive Data Statement

This evidence, spec, tests and implementation must not include raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets. M5R-04 uses synthetic UUIDs, controlled refs, synthetic org/tenant names and structured metadata only.

## Runtime/RLS Evidence

Implementation evidence:

- `apps/api/src/ai-member-runtime.ts` registers the Nest controller routes and keeps the default AppModule repository disabled unless explicit runtime mode is configured.
- `apps/api/src/ai-member-runtime.contracts.ts` keeps request validation, controlled-ref checks, response snapshots, audit content shape and runtime mode parsing together.
- `apps/api/src/ai-member-runtime.repository.ts` requires `rls_prisma_gateway`, rejects bare `prisma_gateway`, uses `createRlsTransactionContext`, sets restricted app runtime role plus transaction-scoped `app.org_id` / `app.tenant_id`, and writes only existing `ai_member`, `ai_capability_toggle` and `audit_log` rows.
- `apps/admin/src/aiMemberRuntimeApiClient.ts` proves the mobile emergency fallback can reach real API routes; `apps/admin/src/M5AiMemberConsoleShell.tsx` only anchors the client contract for knip and does not wire visible runtime behavior.
- `packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs` is the true DB/RLS runner for same-tenant positive behavior, wrong-tenant denial and missing-context negative checks when `UZMAX_RLS_DATABASE_URL` exists.

## M3 Eval Gate / Breaker Non-Bypass Rule

M5R-04 records this exact runtime rule before implementation:

- Recovery from an AI member emergency/breaker state fails closed when `ai_member.breaker_reason_ref` remains active unless the request provides explicit controlled recovery evidence and the action writes an audit log.
- Recovery does not create, activate or publish a new `ai_member_version`, prompt, persona or model route; it only reads the existing active version for audit context.
- If the active `ai_member_version` references an `eval_gate`, recovery requires that existing gate to be `passed`.
- Enabling a capability with config/eval gate references requires existing `eval_gate.status = passed`; pending, failed, blocked or missing gate evidence fails closed and leaves the toggle disabled/unmodified.

## True DB/RLS Smoke Status

`node packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs` was run and failed closed because this environment does not provide `UZMAX_RLS_DATABASE_URL`.

Exact blocker: `Error: UZMAX_RLS_DATABASE_URL is required`.

No true DB write, customer/order data, secret or LLM/provider call occurred. The focused contract test also proves the runner rejects missing `UZMAX_RLS_DATABASE_URL`.

## Validation

Recorded after implementation and finalizer fixes on 2026-06-25.

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m5r-ai-member-runtime-control.test.mjs` | pass | 4 tests passed; validates disabled default, explicit RLS mode, API/admin client route shape, audit behavior and missing-env true DB fail-closed contract. |
| `node packages/db/scripts/tests/run-m5r-ai-member-runtime-true-db-smoke.mjs` | acceptable fail-closed | Missing `UZMAX_RLS_DATABASE_URL`; exact error `UZMAX_RLS_DATABASE_URL is required`. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m5r-04-ai-member-runtime-control, linked worktree, dirty allowed)`. |
| `npm run guard:worker-boundary -- --assigned /private/tmp/uzmax-m5r-04-ai-member-runtime-control --root /Users/atilla/Documents/UZMAX智能运营` | pass | Explicit assigned/root boundary check passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M5R-04-ai-member-runtime-control.md --include-worktree` | pre-commit caveat | Before final commit/PR metadata, exact failure was `out-of-scope file: packages/db/scripts/run-m5r-ai-member-runtime-true-db-smoke.mjs` and `net source LOC 1084 > 600`. The out-of-scope file is a pre-commit guard artifact: `origin/main...HEAD` still contained the thin wrapper while the worktree deletion removed it from the actual final diff. The remaining final governance caveat is the documented `large_change_exception` for source net LOC. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors reported before commit. |
| `npm run check` | pass | Includes format, prettier-ignore guard, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/boundary/pr-shape guards, 376 node tests, build, size and 21 Playwright tests. Size output: 67.07 kB brotlied. |

## Source Budget

Computed from the actual `git diff --numstat origin/main` after the thin DB smoke wrapper was removed and the direct true DB runner remained under `packages/db/scripts/tests`.

| Metric | Value | Budget status |
|---|---:|---|
| changed source files | 7 | within target `<= 10` |
| net source LOC | +815 | exceeds target `<= 650`; `large_change_exception` |
| new source files | 4 | within target `<= 4` |
| gross source churn | 815 | report-only |
| total PR gross churn | 1852 | report-only |

Source files counted: `apps/admin/src/M5AiMemberConsoleShell.tsx`, `apps/admin/src/aiMemberRuntimeApiClient.ts`, `apps/api/scripts/runtime-compiler.mjs`, `apps/api/src/ai-member-runtime.contracts.ts`, `apps/api/src/ai-member-runtime.repository.ts`, `apps/api/src/ai-member-runtime.ts`, `apps/api/src/app.module.ts`.

Budget caveat: the implementation stays inside the M5R-04 scope and validation passes, but the focused API runtime needed an ESLint-compliant controller/contracts/repository split plus admin client and direct true DB smoke runner, so actual diff numstat exceeds the spec target for net source LOC. Budget-reduction attempts included wrapper removal, contracts/client compaction and repository compaction. Further reduction would risk obscuring or weakening RLS transaction setup, breaker/eval-gate checks, DB writes, audit rows or route behavior. The `large_change_exception` is only for M5R-04 source-size governance; it is not product scope approval, M5 owner acceptance, production approval or release approval. Owner/review approval is required before merge if this over-budget shape is accepted.

## Spec Compliance Review

Scope compliance is mostly satisfied:

- Implementation is limited to the M5R-04 touch list plus the narrow `apps/admin/src/M5AiMemberConsoleShell.tsx` contract anchor added to satisfy knip without visible runtime wiring.
- No schema, migration, generated client, lockfile, shared config/CI/guard, worker, cron, distill, log analytics, template runtime, prompt/persona/model-route release, external provider or production/release change is included.
- True DB/RLS remains blocked only by missing `UZMAX_RLS_DATABASE_URL`.
- Actual diff source budget exceeds the net LOC target as recorded above; this is explicitly declared as `large_change_exception`, not hidden compliance.

## Code Quality Review

Focused code quality review:

- `npm run check` passed after replacing the initial oversized API source file with an ESLint-compliant split and anchoring the admin client for knip.
- Runtime mode fails closed by default and rejects `prisma_gateway` bypass.
- Request validation rejects raw/high-risk keys, inline refs and non-controlled refs.
- Recovery and capability enabling cannot bypass existing M3 eval-gate/breaker evidence.
- Remaining caveat is PR size/budget, not a failing validation command.

## Acceptance Mapping

| Item | M5R-04 status | Evidence target |
|---|---|---|
| G-03 | `runtime_non_bypass_rule_supported_not_eval_publish_closed` | Recovery/toggle paths require passed existing gate evidence where applicable; no eval publishing is added. |
| F-06 | `breaker_runtime_control_supported_not_fault_injection_closed` | Emergency stop/recovery respects active breaker reason and controlled recovery evidence; production fault injection remains future. |
| I-02 | `api_mobile_fallback_contract_supported_not_admin_wired` | Tiny admin API client reaches emergency stop/recovery routes; full mobile visible wiring remains M5R-07. |
| I-07 | `ai_member_runtime_audit_supported_not_logs_center_closed` | AI member actions write audit logs; log center readback remains M5R-05. |
| J-05 | `m5r_04_runtime_evidence_added_not_owner_accepted` | This evidence records M5R-04 only; no M5 owner acceptance or release signoff. |
| K-03 | `active` | One spec / one PR; current branch implements only M5R-04. |
| K-04 | `active` | Worktree/branch/touch list are scoped; schema/migration/global gates remain untouched. |

M5R-04 performs no prompt/persona/model-route release and does not update M5 owner acceptance status.

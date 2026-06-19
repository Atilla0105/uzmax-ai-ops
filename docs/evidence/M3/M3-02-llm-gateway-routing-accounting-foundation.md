# M3-02 LLM Gateway Routing Accounting Foundation

> evidence_id: M3-02-llm-gateway-routing-accounting-foundation
> milestone: M3
> spec: `docs/specs/M3-02-llm-gateway-routing-accounting-foundation.md`
> status: implemented_pending_pr_review
> created_at: 2026-06-19
> updated_at: 2026-06-19
> sensitive_data_location: none
> redaction_status: no raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets

## Scope

This evidence records only the M3-02 pure `packages/llm-gateway` foundation for task routing, fallback, deterministic mock providers, timeout/cost/token budgets and accounting drafts.

Included:

- Task constants matching M3-01 `llmTasks`.
- Route config validation for provider refs, task, timeout, token budgets, cost budget and eval gate metadata.
- Deterministic mock provider/port.
- Invocation flow that tries primary then fallback on deterministic failure, timeout or budget failure.
- Accounting drafts compatible with the M3-01 `llm_call_log` allowed metadata shape.
- Customer-facing/draft task boundary requiring redaction metadata and rejecting internal config fields.
- Code-quality follow-up hardening for wall-clock timeout races, async/sync provider exceptions, fail-closed telemetry validation, key-specific metadata value validation and duplicate provider-ref rejection.

Not included:

- Production, GA-0, real customer traffic, customer LLM, real provider route release, provider SDK/adapter, provider calls, LLM keys/env vars, prompt/model/persona release, knowledge publish, persistence, API/worker/engine/admin integration, M3-03 eval publish refusal semantics or M3 closeout.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-02-llm-gateway-routing-accounting` |
| `git status --short --branch` | `## codex/m3-02-llm-gateway-routing-accounting...origin/main` |
| `git branch --show-current` | `codex/m3-02-llm-gateway-routing-accounting` |
| `git branch --no-merged main` | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| base | `HEAD` and merge-base with `origin/main` were `3d6666b88646b24634aa952b22708e2569b0fede` before edits |

No open PR conflict or unmerged branch conflict was found at start.

## TDD Evidence

| Step | Command | Result | Summary |
|---|---|---|---|
| Dependency setup | `npm ci` | pass | Linked worktree had no `node_modules`; dependencies installed without lockfile changes. |
| RED | `node --test scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs` | failed as expected | 6/6 tests failed because M3-02 gateway exports/behavior/docs were missing from the placeholder package. |
| GREEN | `node --test scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs` | pass | 6/6 focused tests passed after implementing pure gateway contracts and docs notes. |

## Boundary Review

| Check | Result | Evidence |
|---|---|---|
| No DB runtime import | pass | `packages/llm-gateway/src/index.ts` mirrors M3-01 literals and does not import `packages/db`. |
| No external provider/SDK/key/env | pass | Gateway source uses deterministic mock provider only. |
| No raw prompt/completion | pass | Accounting draft exposes hash/metadata fields only. |
| Customer-facing redaction | pass | `kb_answer` and `draft_reply` require redaction metadata and reject `internalConfig`. |
| Eval gate semantics | pass | Route eval gate ref/status is metadata only; M3-03 remains future. |
| LLM numeric decisions | pass | Cost/token/timeout budgets are code-side guard checks; no LLM price/SLA/order/cost decision path exists. |

## Code Quality Review Fixes

The post-PR code quality review returned `Ready to merge? With fixes`. M3-02 follow-up fixes:

- Provider calls now race against `route.timeoutMs`; wall-clock timeouts create failed attempt accounting drafts and continue to fallback.
- Provider thrown errors, including synchronous throws before a promise is returned, are caught and converted to safe `failure` attempts without copying raw error payloads.
- Successful provider results must include finite non-negative integer `inputTokenCount`, `outputTokenCount`, `costMicros` and `latencyMs`; invalid or missing telemetry is `accounting_invalid` and falls back.
- `redactionMetadata` and `truncationMetadata` are validated through a narrow key allowlist plus key-specific value rules for hashes, controlled refs, short ids and counts; raw/free-text prompt/customer-like values fail closed even under allowed keys.
- Route config rejects duplicate `providerRefs`, duplicate fallbacks and fallback equal to primary; runtime provider arrays also reject duplicate `providerId` before routing.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs` | pass | 8/8 focused tests passed after code-quality review fixes. |
| `npm run format:check` | pass | Initial run found formatting issues in the new source/test files; after targeted Prettier write, rerun passed. |
| `npm run typecheck` | pass | TypeScript strict check passed. |
| `npm run lint` | pass | ESLint passed. |
| `npm run guard:eval-triggers -- --base origin/main` | pass | `eval-trigger-paths: no eval-triggering paths changed`. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-02-llm-gateway-routing-accounting, linked worktree, dirty allowed)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-02-llm-gateway-routing-accounting-foundation.md --include-worktree` | pass | 7 changed files; categories docs 5/source 1/test 1; source changedFiles 1, netLoc 399, newFiles 0. Direct `git diff --numstat origin/main -- packages/llm-gateway/src/index.ts` reports 399 added source lines, under the spec budget of 400. |
| `npm run test` | pass | 78/78 tests passed. |
| `git diff --check` | pass | No whitespace errors. |
| `npm run check` | failed then fixed, final pass | First run stopped at `jscpd` because the new focused test duplicated the M3-01 TypeScript source import helper shape. The helper was rewritten without changing assertions or production behavior. Final rerun passed: format, typecheck, lint, depcruise, jscpd, knip, forbidden-terms, eval/doc/workspace/pr-shape guards, 78/78 tests, build, size and Playwright 6/6. |

## PR Hygiene Summary

| Category | Result |
|---|---|
| Changed files | 7 |
| Path categories | docs 5, source 1, test 1 |
| Source changed files | 1 / budget 1 |
| New source files | 0 / budget 0 |
| Net source LOC | `guard:pr-shape` reports netLoc 399; direct `git diff --numstat` reports 399 added source lines, both under budget 400. |
| External API/provider/SDK evidence | none; no external provider/SDK/connector/adapter added |
| Exceptions | none |
| Test weakening | none; no `.skip` / `.only` / `xit` / `xfail` added |

## Acceptance Mapping

| Item | M3-02 status | Notes |
|---|---|---|
| F-05 | foundation_queued_not_closed | Customer-facing/draft route inputs require redaction metadata and disallow internal config fields; full redline runner/output guard remains M3-03/M3-08. |
| G-01 | foundation_implemented_not_closed | Task-level route/fallback works against deterministic mock providers only; no provider route release. |
| G-02 | foundation_implemented_not_closed | Accounting draft shape matches M3-01 `llm_call_log` allowed metadata; no persistence or dashboard. |
| G-03 | metadata_hook_only_not_closed | Eval gate ref/status is validated as metadata only; publish refusal semantics remain M3-03. |
| G-06 | not_closed | No eval quota runner or full >=200 closure. |
| J-05 | foundation_updated | This evidence records M3-02 gateway foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

M3-02 closes no production acceptance item. It only provides a pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Sensitive Data Boundary

M3-02 stores only code contracts, docs and aggregate validation evidence in git. The repository must not receive:

- raw/export/jsonl/csv samples;
- raw Telegram payloads or customer plaintext;
- screenshots or voice transcripts;
- raw prompts or raw completions;
- order IDs, phone numbers, addresses, payment data or customer identifiers;
- support personal accounts, Bot tokens, webhook secrets, LLM keys or other secrets.

Future source material must stay in controlled storage. Repo evidence may only record manifest identifiers, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## Unresolved Future Closure Paths

- M3-03: eval gate runner, redline checks and production publish refusal semantics.
- M3-04/M3-06/M3-07/M3-08: capability integrations that may call this gateway through explicit ports.
- API/worker/engine/admin integration and persistence remain future specs.
- M3 closeout remains blocked by owner tutorial materials, screenshot samples and language blind review unless provided or explicitly branched.

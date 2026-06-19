# M3-03 Eval Gate Redline Runner

> evidence_id: M3-03-eval-gate-redline-runner
> milestone: M3
> spec: `docs/specs/M3-03-eval-gate-redline-runner.md`
> status: implemented_pending_pr_review
> created_at: 2026-06-19
> updated_at: 2026-06-19
> sensitive_data_location: none
> redaction_status: no raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets

## Scope

This evidence records only the M3-03 pure `packages/evals` foundation for eval gate/redline runner semantics.

Included:

- M3 eval category/status constants mirroring M3-01 persisted vocabulary.
- Controlled eval case builder accepting only manifest/ref/redacted payload shapes.
- Category quota runner for `redline_attack`, `redline_false_positive`, `language` and target-specific coverage.
- Redline leakage detector for internal threshold/cost/profit/margin/config leakage in prompt/context/output-shaped strings.
- Pure publish gate decision semantics for prompt, knowledge, model route and persona changes.
- Safe evidence summaries with aggregate counts, reason codes and controlled refs only.

Not included:

- Production publish API, admin eval center, API/worker/engine integration, persistence, real eval fixtures, raw samples, provider SDK/adapter, provider calls, LLM keys/env vars, customer LLM, prompt/model/persona release, knowledge publish, M3-08 breaker radius/output guard, G-06 full >=200 closure, M3 closeout, GA-0 or real customer traffic.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-03-eval-gate-redline-runner` |
| `git status --short --branch` | `## codex/m3-03-eval-gate-redline-runner...origin/main` |
| `git branch --show-current` | `codex/m3-03-eval-gate-redline-runner` |
| `git branch --no-merged main` | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| base | `HEAD` was `15801bd896700a7bb19d029fd5cfab59f57ec8ad` before edits |

No open PR conflict or unmerged branch conflict was found at start.

## TDD Evidence

| Step | Command | Result | Summary |
|---|---|---|---|
| Dependency setup | `npm ci` | pass | Linked worktree had no `node_modules`; dependencies installed without lockfile changes. npm reported existing audit advisories. |
| RED | `node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs` | failed as expected | 6/6 tests failed because M3-03 eval runner exports/behavior were missing from `packages/evals`. |
| GREEN | `node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs` | pass | Initial focused implementation passed; current focused suite is 7/7 after the review fix. |
| Review-fix RED | `node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs` | failed as expected | New missing-redline-summary test failed because gates with absent `redlineSummary` still passed. |
| Review-fix GREEN | `node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs` | pass | 7/7 focused tests passed after requiring required redline categories to include passed redline summaries. |

## Boundary Review

| Check | Result | Evidence |
|---|---|---|
| No DB runtime import | pass | `packages/evals/src/index.ts` mirrors M3-01 literals and does not import `packages/db`. |
| No raw eval payload | pass | `createM3EvalCase` rejects raw prompt/completion/customer-text style keys and accepts controlled refs only. |
| Quota fail-closed | pass | Missing `redline_attack`, `redline_false_positive`, `language` or target-specific category returns `blocked`. |
| Redline leakage | pass | Internal config/economics terms are detected; ordinary redacted false-positive numbers can pass. |
| Missing redline evidence | pass | Required `redline_attack` and `redline_false_positive` results without `redlineSummary.passed === true` now return `redline_missing:<category>`. |
| Publish refusal | pass | prompt/knowledge/model_route/persona publish decisions refuse failed, blocked, pending, stale or mismatched gates. |
| Safe summaries | pass | Runner returns category counts, reason codes and controlled refs only. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs` | pass | 7/7 focused tests passed after review fix. |
| `npm run eval:minimal` | pass | 4/4 M1 minimal eval tests passed. |
| `npm run format:check` | pass | Prettier reported all matched files use code style. |
| `npm run typecheck` | pass | TypeScript strict check passed. |
| `npm run lint` | pass | ESLint passed. |
| `npm run guard:eval-triggers -- --base origin/main` | pass | Post-commit rerun detected `packages/evals/src/index.ts` and ran the minimal eval job successfully. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-03-eval-gate-redline-runner, linked worktree, clean)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-03-eval-gate-redline-runner.md --include-worktree` | pass | Post-commit rerun reports 6 changed files; categories docs 4/source 1/test 1; source changedFiles 1, netLoc 235, newFiles 0. |
| `npm run test` | pass | 85/85 tests passed. Guard negative tests print expected failure samples while their assertions pass. |
| `npm run check` | pass | Full local gate passed: format, typecheck, lint, depcruise, jscpd, knip, forbidden-terms, eval/doc/workspace/pr-shape guards, 85/85 tests, build, size and Playwright 6/6. |
| `git diff --check` | pass | No whitespace errors. |

## PR Hygiene Summary

| Category | Result |
|---|---|
| Changed files | 6 |
| Path categories | docs 4, source 1, test 1 |
| Source changed files | 1 / budget 1 |
| New source files | 0 / budget 0 |
| Net source LOC | `guard:pr-shape` reports netLoc 235 after the review fix. Source file length is 398 lines, under ordinary source file budget. |
| External API/provider/SDK evidence | none; no external provider/SDK/connector/adapter added |
| Exceptions | none |
| Test weakening | none; no `.skip` / `.only` / `xit` / `xfail` added |

## Acceptance Mapping

| Item | M3-03 status | Notes |
|---|---|---|
| F-05 | foundation_implemented_not_closed | Redline leakage detector blocks internal threshold/cost/profit/margin/config leakage in prompt/context/output-shaped strings; no production output guard or breaker radius. |
| G-03 | foundation_implemented_not_closed | Pure publish decision semantics refuse prompt/knowledge/model_route/persona publish unless matching eval gate passes required quotas/redline checks. No production publish API/admin integration. |
| G-05 | foundation_queued_not_closed | Redline false-positive cases can pass when marked passed and leak-free; no admin false-positive dashboard. |
| G-06 | partial_foundation_not_closed | Required foundation categories/quotas fail closed for supplied cases/results; full 1.0 >=200 target remains future. |
| J-05 | foundation_updated | This evidence records M3-03 eval gate foundation; no release signoff. |
| K-02 | foundation_supported | Existing `guard:eval-triggers` runs minimal eval for `packages/evals/**` changes; no guard widening in this PR. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

M3-03 closes no production acceptance item. It only provides a pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Sensitive Data Boundary

M3-03 stores only code contracts, docs, synthetic redacted test objects and aggregate validation evidence in git. The repository must not receive:

- raw/export/jsonl/csv samples;
- raw Telegram payloads or customer plaintext;
- screenshots or voice transcripts;
- raw prompts or raw completions;
- order IDs, phone numbers, addresses, payment data or customer identifiers;
- support personal accounts, Bot tokens, webhook secrets, LLM keys or other secrets.

Future source material must stay in controlled storage. Repo evidence may only record manifest identifiers, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## Unresolved Future Closure Paths

- API/worker/engine/admin integration and persistence remain future specs.
- M3-08 remains responsible for breaker radius and redline output guard behavior.
- Full G-06 >=200 eval target remains future and owner-input dependent.
- M3 closeout remains blocked by owner tutorial materials, screenshot samples and language blind review unless provided or explicitly branched.

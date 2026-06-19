# M3-12 Pre-M4 Safety Critical Ignore Cleanup

> evidence_id: M3-12-pre-m4-safety-critical-ignore-cleanup
> milestone: M3
> spec: `docs/specs/M3-12-pre-m4-safety-critical-ignore-cleanup.md`
> status: committed_boundary_fix
> created_at: 2026-06-19
> updated_at: 2026-06-19
> sensitive_data_location: none
> redaction_status: no raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets

## Scope

This evidence records only the M3 signoff 前治理 / pre-M4 safety-critical readability cleanup. It does not mark M4 as started.

Included:

- Removed logic-shaped `// prettier-ignore` from M3 eval gate/redline runner functions in `packages/evals/src/index.ts`.
- Removed logic-shaped `// prettier-ignore` from breaker decision and degradation/handoff contracts in `packages/engine/src/index.ts`.
- Removed logic-shaped `// prettier-ignore` from LLM route budget, timeout, accounting telemetry and metadata decision logic in `packages/llm-gateway/src/index.ts`.
- Preserved table-shaped ignores for constants, enum maps, static manifest/type shapes and large vocabulary tables where removing them would create churn without safety value.

Not included:

- M4 business capability start, production release, GA-0, real customer traffic, API/worker/admin integration, DB schema/migration/generated DTOs, guard/harness/package/runbook governance changes, full-repo `prettier-ignore` removal or `packages/db/**` bulk ignore cleanup.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-12-pre-m4-safety-critical-ignore-cleanup` |
| `git status --short --branch` | `## codex/m3-12-pre-m4-safety-critical-ignore-cleanup...origin/main` |
| `git branch --show-current` | `codex/m3-12-pre-m4-safety-critical-ignore-cleanup` |
| root/main status | `## main...origin/main` |
| `AGENTS.md` | read before implementation |
| required source/test files | read before implementation |
| dependency setup | `npm ci` ran because `node_modules` was missing; pass with existing npm audit advisories |

## Implementation Summary

| File | Cleanup |
|---|---|
| `packages/evals/src/index.ts` | Expanded eval case/result builders, redline leakage checks, eval gate evaluation, publish decision, category counting, active/backed result matching, redline reason calculation and safe payload mapping. |
| `packages/engine/src/index.ts` | Expanded breaker input type, breaker return object, safe degradation object, safety action parts type and degradation/handoff contract return objects. |
| `packages/llm-gateway/src/index.ts` | Expanded attempt summary type, task safety profile mapping, total-token budget validation, provider order/map construction, timeout promise, invalid telemetry/hash classification and metadata string decision. |

## Remaining `prettier-ignore` Boundary

Remaining ignores are intentionally table-shaped:

| File | Remaining count | Classification |
|---|---:|---|
| `packages/evals/src/index.ts` | 10 | M3 vocabulary/status/quota maps, input type rows, small status maps and safe payload key table. |
| `packages/engine/src/index.ts` | 9 | Engine vocabulary/status maps, breaker event map, global event set, unsafe output pattern table, scope reason map and output guard key table. |
| `packages/llm-gateway/src/index.ts` | 4 | Gateway task/status/eval status maps and safe metadata value pattern table. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m3-eval-gate-redline-runner.test.mjs` | pass | 9/9 M3-03 eval gate/redline runner tests passed. |
| `node --test scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs` | pass | 13/13 M3-08 breaker/output guard tests passed. |
| `node --test scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs` | pass | 8/8 M3-02 LLM gateway routing/accounting tests passed. |
| `npm run format:check` | pass | Prettier check passed for the repo. |
| `npm run typecheck` | pass | TypeScript no-emit check passed. |
| `npm run lint` | pass | ESLint passed, including complexity and max-lines budgets. |
| `npm run guard:forbidden-terms` | pass | `forbidden-terms: ok`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-12-pre-m4-safety-critical-ignore-cleanup.md --include-worktree` | pass | Reported no PR for this branch, 5 changed files, docs 2/source 3, source netLoc 107, new source files 0. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run check` | pass | Full local gate passed after rerun with elevated filesystem permission for `node_modules/.cache`: format, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/pr-shape guards, 132/132 Node tests, build, size and Playwright 7/7. |

## PR Hygiene Summary

| Category | Result |
|---|---|
| Changed files | 5 |
| Path categories | docs 2, source 3 |
| Source changed files | 3 / budget 3 |
| Source net LOC | 107 / budget 600 |
| New source files | 0 / budget 0 |
| External API/provider/SDK evidence | none; no external provider/SDK/connector/adapter added |
| Exceptions | none |
| Test weakening | none; no `.skip` / `.only` / `xit` / `xfail` added |

## Self Review

| Check | Result |
|---|---|
| Spec compliance | pass; changed files are within the M3-12 touch list and no tests/guard/package/runbook/DB/apps files were changed. |
| Code quality | pass; formatter, typecheck, lint and full check passed. |
| Behavior change | no intentional behavior change; focused M3 behavior tests and full `npm run check` passed. |
| Workspace isolation | root/main remained read-only and clean during validation. Expected final amended status: worker `## codex/m3-12-pre-m4-safety-critical-ignore-cleanup...origin/main [ahead 1]`; root/main `## main...origin/main`. |

## Sensitive Data Boundary

M3-12 stores only code cleanup, docs and aggregate validation evidence in git. No raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets were added.

## Concerns

- Existing `npm ci` reported 3 high severity audit advisories; this cleanup does not modify dependencies or lockfile.
- The worker needed escalated write permission for `npx prettier --write` because the assigned worktree is outside the default sandbox writable root; the command succeeded after approval.

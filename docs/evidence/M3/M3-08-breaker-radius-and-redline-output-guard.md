# M3-08 Breaker Radius And Redline Output Guard

> evidence_id: M3-08-breaker-radius-and-redline-output-guard
> milestone: M3
> spec: `docs/specs/M3-08-breaker-radius-and-redline-output-guard.md`
> status: implemented_pending_pr_review
> created_at: 2026-06-19
> updated_at: 2026-06-19
> sensitive_data_location: none
> redaction_status: no raw data/secrets, no raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets

## Scope

This evidence records only the M3-08 pure `packages/engine` foundation for breaker radius and redline output guard semantics.

Included:

- User-level, user+capability, capability-level and global breaker radius decision semantics.
- Single-user redline/attack events do not trigger global shutdown.
- Capability-level repeated failures disable only the named capability.
- Systemic, cross-user or cross-capability risk escalates to global breaker and safe degradation.
- Redline output guard suppresses customer-facing output leaking internal config, thresholds, cost, profit, margin, private route/budget/guard values without echoing unsafe output.
- False-positive path allows ordinary synthetic numbers, controlled refs and safe generic replies.
- Safe degradation/handoff contract suppresses outbound answer, requires ticket/draft hold where appropriate, and preserves controlled audit/evidence refs only.

Not included:

- Production release, GA-0, real customer traffic, customer LLM, provider SDK/adapter, provider calls, LLM keys/env vars, real redline samples, prompt/model/persona release, knowledge publish, API/worker/admin integration, DB persistence, breaker_event/redline_event persistence, outbound send, real fault injection, runbook drill, F-06 closeout, L-02 closeout or 1.0 release approval.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-08-breaker-radius-redline-output-guard` |
| `git status --short --branch` | `## codex/m3-08-breaker-radius-redline-output-guard...origin/main` |
| `git branch --show-current` | `codex/m3-08-breaker-radius-redline-output-guard` |
| `git rev-parse HEAD` | `f7750cd76f871b527a0de349cc27b3dac99bb2b7` |
| `npm ci` | pass; dependencies installed in linked worktree, existing audit reported 3 high severity advisories |
| root/main status | `## main...origin/main` |

## TDD Evidence

| Step | Command | Result | Summary |
|---|---|---|---|
| RED | pre-implementation inspection | not_run | M3-08 focused test/spec/evidence files were absent and engine exported only `packageName`, so the new test would have failed on missing exports/docs before implementation. |
| GREEN | `node --test scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs` | pass | 13/13 focused tests passed after pure engine implementation, review-blocker fixes and regression coverage. |

## Boundary Review

| Check | Result | Evidence |
|---|---|---|
| Engine purity | pass | `packages/engine/src/index.ts` imports no evals/db/llm-gateway/capability packages and uses no provider SDK/env/process. |
| Generic engine vocabulary | pass | Engine source uses generic user/capability/tenant/global/redline/breaker terms only. |
| Radius semantics | pass | Focused tests cover user, user+capability, capability and global decisions; single-user attack is not global. |
| Redline output no-echo | pass | Unsafe output is suppressed and not returned in the structured guard result. |
| False positive path | pass | Synthetic weight/size/count values and safe generic replies pass. |
| Safe degradation/handoff | pass | Combined action returns suppress outbound answer, handoff/ticket/draft hold and controlled audit refs only. |
| Foundation-only boundary | pass | Docs/evidence mark F-05/F-06/G-05/L-02 as foundation/support only, not closed. |

## PR #46 Review Blocker Closure

| Blocker | Closure |
|---|---|
| Unknown `eventKind` fail-open | `evaluateBreakerRadius` now validates `eventKind` against the known breaker event set before scope decisions. Unknown values throw `eventKind is invalid` without echoing raw event text. |
| Redline output raw/control leakage | `guardRedlineOutput` now uses a strict input allowlist, rejects extra raw/internal fields, detects raw prompt/completion/system prompt/model route/public URL/control leakage, and suppressed results do not include unsafe output text. |
| Forged runtime object trust | `decideEngineSafetyAction` now revalidates breaker scope, output status, controlled refs, disabled capability keys and reason codes before building `auditRefs`; invalid objects throw or fail closed without preserving unsafe refs. |
| Derived breaker fields | `safeBreakerDecision` now enforces scope-derived disabled capability keys and known breaker reason vocabulary, so user-scope forged disabled keys, capability-scope missing disabled keys and arbitrary safe-format reason codes are rejected. |
| Output guard object allowlist | `safeOutputGuard` now applies status-aware key allowlists before action building, so forged raw/internal/unknown fields such as `rawPrompt` are rejected even when the visible output is safe. |
| Source budget governance | Engine source was compacted without relaxing the spec budget; `guard:pr-shape --include-worktree` reports source net LOC `400`, within the `<=400` budget. |
| Regression coverage | Focused tests now cover unknown event kind rejection, raw field rejection, raw/system/model-route/public-URL suppression with no echo, forged object rejection, unsafe ref rejection and the legal false-positive synthetic number path. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m3-breaker-radius-redline-output-guard.test.mjs` | pass | 13/13 focused M3-08 tests passed after review-blocker fixes. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-08-breaker-radius-and-redline-output-guard.md --include-worktree` | pass | Reports 6 changed files: docs 4, source 1, test 1; source changedFiles 1, netLoc 400, newFiles 0. |
| `npm run check` | pass | Full local gate passed after review-blocker fixes: format, typecheck, lint, depcruise, jscpd, knip, forbidden-terms, eval/doc/workspace/pr-shape guards, 132/132 Node tests, build, size and Playwright 6/6. |
| final worker/root status | pending | To record after validation and commit. |

## PR Hygiene Summary

| Category | Result |
|---|---|
| Changed files | 6 expected |
| Path categories | docs 4, source 1, test 1 |
| Source changed files | 1 / budget 1 |
| New source files | 0 / budget 0 |
| Net source LOC | `guard:pr-shape` reports netLoc 400 after review-blocker fixes, within the spec budget `<=400`. |
| rg search conclusion | No new source file. Searched breaker/redline output/output policy/safe degradation/handoff/engineSafety/safety across packages/docs/scripts/tests; engine was placeholder and is the correct pure orchestration contract home. |
| External API/provider/SDK evidence | none; no external provider/SDK/connector/adapter added |
| Exceptions | none |
| Test weakening | none; no `.skip` / `.only` / `xit` / `xfail` added |

## Acceptance Mapping

| Item | M3-08 status | Notes |
|---|---|---|
| F-05 | foundation_supported_not_closed | Redline output guard suppresses internal config/economics/control leakage and avoids echoing unsafe output; no production output filter integration. |
| F-06 | foundation_implemented_not_closed | Pure breaker radius semantics cover user, user+capability, capability and global decisions; no real fault injection or runtime persistence. |
| G-05 | foundation_supported_not_closed | False-positive path allows ordinary synthetic business numbers; no admin false-positive dashboard. |
| L-02 | foundation_supported_not_closed | Safe degradation/handoff contract preserves leave-ticket/draft-hold semantics; no GA-0 runtime drill or production leave-ticket path. |
| J-05 | foundation_updated | This evidence records M3-08 engine foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no DB/schema/shared config edits. |

M3-08 closes no production acceptance item. It only provides pure package foundation for later integration and preserves all M3 closeout owner-input blockers.

## Sensitive Data Boundary

M3-08 stores only code contracts, docs, synthetic test strings and aggregate validation evidence in git. The repository must not receive:

- raw/export/jsonl/csv samples;
- raw Telegram payloads or customer plaintext;
- screenshots or voice transcripts;
- raw prompts or raw completions;
- order IDs, phone numbers, addresses, payment data or customer identifiers;
- support personal accounts, Bot tokens, webhook secrets, LLM keys or other secrets.

Future source material must stay in controlled storage. Repo evidence may only record manifest identifiers, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## Unresolved Future Closure Paths

- API/worker/admin integration, `redline_event`/`breaker_event` persistence and production output filter remain future specs.
- Real fault injection and GA-0 leave-ticket behavior are required before F-06/L-02 closeout.
- Future admin evidence is required for G-05 false-positive visibility.
- M3 closeout remains blocked by owner tutorial materials, screenshot samples and language blind review unless provided or explicitly branched.

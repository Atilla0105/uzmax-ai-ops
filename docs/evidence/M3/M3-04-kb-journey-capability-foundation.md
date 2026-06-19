# M3-04 KB Journey Capability Foundation

> evidence_id: M3-04-kb-journey-capability-foundation
> milestone: M3
> spec: `docs/specs/M3-04-kb-journey-capability-foundation.md`
> status: implemented_pending_pr_review
> created_at: 2026-06-19
> updated_at: 2026-06-19
> sensitive_data_location: none
> redaction_status: no raw owner tutorial pack, raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets

## Scope

This evidence records only the M3-04 pure `packages/capabilities/kb` foundation for tutorial journey behavior.

Included:

- Controlled KB journey/stage/material ref validation.
- Tutorial stage localization from stage key, title, localized title and trigger phrases.
- Stage-card-only selected answer contract with selected stage ref/key/title/sequence, concise answer, bounded steps, bounded material refs and next action.
- Unknown input returning `clarification_required` with bounded stage options and no hallucinated answer.
- Ambiguous input returning `handoff_required` with bounded candidate refs and no generated answer.
- Contracts README and M3 evidence index updates.

Not included:

- Production, GA-0, real customer traffic, customer LLM, real provider route release, prompt/model/persona release, knowledge publish, API/worker/engine/admin integration, DB persistence, real eval fixtures, raw owner tutorial pack, raw customer data, screenshots/voice, M3 closeout, F-01 full closure or H-01 full closure.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-04-kb-journey-capability-foundation` |
| `git status --short --branch` | `## codex/m3-04-kb-journey-capability-foundation...origin/main` |
| `git branch --show-current` | `codex/m3-04-kb-journey-capability-foundation` |
| `git fetch --prune` | pass, no output |
| `git branch --no-merged main` | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| base | `HEAD` was `c90f6b9a1d4dc299c8ac0e90ceab160086ed2d70` before edits |
| dependency setup | `npm ci` passed in this linked worktree; lockfile unchanged; npm reported existing audit advisories |

No open PR conflict or unmerged branch conflict was found at start.

## TDD Evidence

| Step | Command | Result | Summary |
|---|---|---|---|
| RED test harness fix | `node --test scripts/tests/m3-kb-journey-capability-foundation.test.mjs` | failed due test setup | Initial test read the not-yet-created M3-04 evidence file at module load. The test was adjusted to treat that file as optional until implementation creates it. |
| RED | `node --test scripts/tests/m3-kb-journey-capability-foundation.test.mjs` | failed as expected | 5/5 tests failed because M3-04 KB exports/behavior/docs/evidence were missing from the placeholder package and docs. |
| GREEN | `node --test scripts/tests/m3-kb-journey-capability-foundation.test.mjs` | pass | 5/5 focused tests passed after implementing pure KB journey contracts and docs notes. |

## Boundary Review

| Check | Result | Evidence |
|---|---|---|
| No capability-to-capability import | pass | Focused test and full `npm run check` verify `packages/capabilities/kb` does not import `handoff` or any sibling capability. |
| No DB/LLM/provider integration | pass | Focused test checks no `@uzmax/db`, `@uzmax/llm-gateway`, `process.env` or provider surface. |
| Stage-card-only output | pass | Focused test asserts selected output excludes other stage cards and full journey arrays. |
| Unknown/ambiguous fail closed | pass | Focused test asserts unknown returns `clarification_required` and ambiguous returns `handoff_required`. |
| Safe refs/no raw samples | pass | Focused test asserts controlled refs and no raw tutorial/customer/prompt fields in selected results. |
| Owner tutorial blocker | pass | Evidence keeps F-01/H-01 foundation-only; owner material pack remains required for closeout. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m3-kb-journey-capability-foundation.test.mjs` | pass | 5/5 focused tests passed. |
| `npm run eval:minimal` | pass | 4/4 M1 minimal eval tests passed. |
| `npm run format:check` | failed then fixed, final pass | First run found formatting issues in `packages/capabilities/kb/src/index.ts`; after targeted Prettier write, rerun passed. |
| `npm run typecheck` | pass | TypeScript strict check passed. |
| `npm run lint` | failed then fixed, final pass | First run found an unused type alias in KB source; after removal, rerun passed. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-04-kb-journey-capability-foundation, linked worktree, dirty allowed)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-04-kb-journey-capability-foundation.md --include-worktree` | pass | 6 changed files; categories docs 4/source 1/test 1; source changedFiles 1, source netLoc 362, newFiles 0. Source file length is 363 lines, under the 400-line budget. |
| `npm run test` | pass | 92/92 tests passed. Guard negative tests print expected failure samples while their assertions pass. |
| `npm run check` | pass | Full local gate passed: format, typecheck, lint, depcruise, jscpd, knip, forbidden-terms, eval/doc/workspace/pr-shape guards, 92/92 tests, build, size and Playwright 6/6. |
| `git diff --check` | pass | No whitespace errors in tracked diff before staging. |
| `git status --short --branch` | pass | Final dirty state contains only the allowed M3-04 files before commit. |

## PR Hygiene Summary

| Category | Result |
|---|---|
| Changed files | 6 |
| Path categories | docs 4, source 1, test 1 |
| Source changed files | 1 / budget 1 |
| New source files | 0 / budget 0 |
| Net source LOC | Guard reported source netLoc 362, under budget 400. Source file length is 363 lines, under ordinary source file budget. |
| External API/provider/SDK evidence | none; no external provider/SDK/connector/adapter added |
| Exceptions | none |
| Test weakening | none; no `.skip` / `.only` / `xit` / `xfail` added |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one PR | pass | This branch implements only M3-04. |
| Touch list | pass | Diff is limited to this spec, KB source, focused test, contracts README, M3 evidence README and this evidence file. |
| Source budget | pass | One existing source file changed; no new source files; direct source diff +362/-0 and file length 363 lines are under budget. |
| Scope honesty | pass | Pure KB journey foundation only; no production, GA-0, real traffic, customer LLM, knowledge publish, DB persistence, admin UI or engine integration. |
| Owner-input blockers | pass | F-01/H-01 remain foundation-only; owner material pack remains required for full tutorial closeout. |
| Sensitive data | pass | Synthetic controlled test fixtures only; no raw tutorial/customer/sample/secret content. |
| External API evidence | pass | none; no new provider/SDK/connector/adapter. |
| Exceptions | pass | none. |

## Code Quality Review

| Check | Result | Evidence |
|---|---|---|
| Pure package boundary | pass | No imports from DB, LLM gateway, provider SDKs, env vars or other capability packages. |
| Stage-card-only behavior | pass | Selected output returns bounded selected stage/card/refs and never returns full journey arrays or all stage cards. |
| Fail-closed behavior | pass | Unknown input returns `clarification_required`; ambiguous input returns `handoff_required`; neither hallucinates a selected stage. |
| Ref safety | pass | Journey/stage/material refs must use controlled, manifest or redaction refs. |
| Size/complexity | pass | KB source is 363 lines, below ordinary source file budget; lint/typecheck/full check passed. |
| Test quality | pass | Focused tests use synthetic controlled fixtures, cover success and fail-closed edges, and do not weaken existing tests. |

## Acceptance Mapping

| Item | M3-04 status | Notes |
|---|---|---|
| F-01 | foundation_implemented_not_closed | Stage localization and stage-card-only answer contract exist for synthetic controlled fixtures; full tutorial closeout remains blocked by owner material pack and eval/import evidence. |
| H-01 | foundation_queued_not_closed | KB journey/stage/card runtime contract supports future knowledge/resource workflows; no management UI, DB persistence or knowledge publish. |
| J-05 | foundation_updated | This evidence records M3-04 KB journey foundation; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

M3-04 is foundation-only. It closes no production acceptance item and preserves all M3 closeout owner-input blockers.

## Sensitive Data Boundary

M3-04 stores only code contracts, docs, synthetic controlled test fixtures and aggregate validation evidence in git. The repository must not receive:

- raw owner tutorial pack or raw/export/jsonl/csv samples;
- raw Telegram payloads or customer plaintext;
- screenshots or voice transcripts;
- raw prompts or raw completions;
- order IDs, phone numbers, addresses, payment data or customer identifiers;
- support personal accounts, Bot tokens, webhook secrets, LLM keys or other secrets.

Future source material must stay in controlled storage. Repo evidence may only record manifest identifiers, redaction method, storage refs, access scope, retention period and project owner confirmation status.

## Unresolved Future Closure Paths

- Owner material pack remains required before F-01 full closeout.
- Future import/eval/admin specs remain responsible for real tutorial material manifests, journey import reports, eval gate evidence, knowledge/resource management UI and knowledge publish controls.
- API/worker/engine/admin integration and persistence remain future specs.
- M3 closeout remains blocked by owner tutorial materials, screenshot samples and language blind review unless provided or explicitly branched.

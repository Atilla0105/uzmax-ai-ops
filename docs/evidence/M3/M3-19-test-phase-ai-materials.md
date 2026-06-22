# M3-19 Test Phase AI Materials Evidence

> evidence_id: M3-19-test-phase-ai-materials
> milestone: M3
> spec: `docs/specs/M3-19-test-phase-ai-materials.md`
> status: test_phase_branch_recorded__kb_structure_and_language_samples_ready_not_closed
> created_at: 2026-06-22
> owner_ai_boundary: Project owner allowed test-phase use of local FAQ, chat records/redacted samples and citable public references to accelerate knowledge structure and review preparation. Project owner still decides production knowledge, tutorial materials, screenshots, blind review, customer LLM, provider routes, costs, compliance, GA-0 and 1.0 release.
> sensitive_data_location: raw/local materials remain outside repository in owner-local controlled storage
> redaction_status: no raw Telegram payloads, customer plaintext, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, public raw copies, LLM keys or secrets included

## Scope

Included:

- M3-19 docs-only spec.
- Owner test-phase material branch decision evidence.
- Test-stage KB structure evidence.
- AI-assisted language review sample-selection evidence.
- M3 closeout/README rollup sync, including M3-18 and M3-19 indexing.

Not included:

- Raw chat exports, raw redacted rows, screenshots, blind-review raw rows, raw model replies, raw prompts/completions, DB import, admin upload, storage upload, eval runner execution, knowledge publish, prompt/model/persona release, production readiness, GA-0, real customer traffic, customer LLM, M3 closeout, M4 start or 1.0 release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-19-test-phase-ai-materials` |
| `git status --short --branch` | `## codex/m3-19-test-phase-ai-materials` before edits |
| `git branch --show-current` | `codex/m3-19-test-phase-ai-materials` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| branch creation | linked worktree branch `codex/m3-19-test-phase-ai-materials` created from `main` at `56a2f63` |

## Owner Test-Phase Source Decision

Project owner wrote on 2026-06-22 that AI agent may use materials in local Documents, including chat records and FAQ, to do what can be done for blind review and knowledge structure. The owner also allowed citable online tutorial/reference material during testing to improve speed, with a clear boundary that before launch the owner will reorganize all official knowledge, tutorials, screenshots and related materials.

This decision is recorded as a test-phase branch only:

- it can unblock test material preparation and follow-up eval/import work;
- it does not satisfy production owner blind review;
- it does not approve official KB publish;
- it does not approve screenshot diagnostic sample closure;
- it does not approve customer LLM, GA-0, M4 or 1.0 release.

## Source Audit

| Source | Current finding | Repository handling |
|---|---|---|
| `/Users/atilla/Documents/agent_startup_60_high_frequency_QA.md` | 824 lines; 60 QA items across 9 service/tutorial areas; sha256 already recorded as `c90821e219a22a5c646b2aa47759927aca4e1885468ab96e15f711b334e27db1` in M3-16 evidence | Source file not committed; used through M3-16 derived candidate refs and this test-stage structure evidence. |
| `/Users/atilla/Documents/聊天记录_脱敏样本/MANIFEST.md` | 25 raw export files summarized; 2443 redacted candidate pairs; 80 seed review rows; residual rescan reports 0 residual phone/url/handle/long-number/identity-doc hits | Manifest metadata summarized only; raw rows remain local. |
| `/Users/atilla/Documents/聊天记录_脱敏样本/telegram_real_seed80_redacted_review.jsonl` | 80 rows; seed set language labels: `uz_ru_mixed` 62, `uz_latin` 16, `ru_latin_mixed` 1, `zh_uz_mixed` 1; all review status `needs_human_review` | No row text committed. Current status supports sample selection only, not blind review pass. |
| `/Users/atilla/Documents/聊天记录_脱敏样本/telegram_real_candidates_redacted.jsonl` | 2443 rows; candidate language labels include `uz_latin` 524, `ru_latin_mixed` 518, `uz_ru_mixed` 150, `ru_or_cyrillic` 28, `latin_other` 1209 | No row text committed. Controlled sample ids can be selected for test review. |
| Public tutorial/reference materials | Allowed for future test-stage use only if cited, summarized and non-infringing | M3-19 did not ingest public content because local FAQ and redacted samples were sufficient for this docs/evidence slice. |

## Output Artifacts

| Output | Status |
|---|---|
| `docs/evidence/M3/tutorial/test-stage-kb-structure.md` | created; test-stage KB structure ready, not imported/published |
| `docs/evidence/M3/language-blind-review/test-stage-ai-assisted-review.md` | created; controlled language sample ids selected, not owner-scored |
| M3 closeout evidence | updated to include M3-18/M3-19 while preserving M3 no-go |
| M3 README | indexed M3-18 and M3-19 |

## Acceptance Mapping

| Item | M3-19 status | Notes |
|---|---|---|
| F-01 | test_structure_ready_not_closed | M3-16 candidate pack is mapped into a test-stage KB structure; future eval/import/publish still required. |
| G-04 | ai_assisted_sample_selection_ready_not_owner_scored | Controlled sample ids are selected for test review; owner blind review counts remain production-pending. |
| G-06 | test_coverage_improved_not_full_closed | Candidate pool can support test selection for Uzbek Latin and Cyrillic/Russian proxy groups; full production quotas and labels remain future. |
| H-01 | test_kb_structure_ready_not_published | No DB/admin/import/publish closure. |
| J-05 | evidence_updated | M3 rollup records the owner test-phase branch decision. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only; no schema/lock/shared config changes. |

M3-19 does not close M3. It allows faster test-stage execution while keeping production release gates intact.

## Remaining Work

- Future spec to run KB stage-localization eval against the test-stage structure.
- Future spec to generate or collect model outputs for language blind review without exposing route/prompt details to reviewers.
- Future spec for screenshot diagnostic test cases if controlled image/source refs can be prepared without raw image commits.
- Owner production re-review before M3 owner acceptance, GA-0, customer LLM or 1.0 release.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass_with_existing_audit_findings | Installed linked worktree dependencies; npm reported 3 high severity dependency findings not introduced by M3-19 because lockfile is untouched. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-19-test-phase-ai-materials, linked worktree, dirty allowed)`. |
| explicit assigned/root `npm run guard:worker-boundary` | pass | `worker-write-boundary: ok (codex/m3-19-test-phase-ai-materials, /Users/atilla/Documents/uzmax-m3-19-test-phase-ai-materials)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-19-test-phase-ai-materials.md --include-worktree` | pass | No PR context found for the branch; explicit spec shape passed with 6 changed docs files, source changed files 0, net source LOC 0 and new source files 0. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run check` | pass | Full local gate passed: format, prettier-ignore guard, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/worker/pr-shape guards, 150/150 Node tests, build, size and Playwright 7/7. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one branch | pass | This branch implements only M3-19. |
| Touch list | pass | Explicit PR shape validation found only 6 docs files changed and all are inside the M3-19 spec touch list. |
| Source budget | pass | Source changed files 0, net source LOC 0 and new source files 0. |
| Sensitive data boundary | pass | Docs contain source hashes/counts, aggregate labels, controlled sample ids and decision boundaries only; no raw owner/customer material. |
| Release honesty | pass | Test-stage materials are not production blind review, official KB publish, M3 closeout, production release or owner signoff. |

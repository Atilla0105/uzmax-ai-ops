# M3-17 Owner Input Intake Packs Evidence

> evidence_id: M3-17-owner-input-intake-packs
> milestone: M3
> spec: `docs/specs/M3-17-owner-input-intake-packs.md`
> status: intake_ready_owner_input_pending_not_closed
> created_at: 2026-06-22
> owner_ai_boundary: Project owner decides screenshot sample suitability, language blind-review results, strong-model lock decisions, real customer data use, customer LLM, provider keys/routes, knowledge/model/persona release, GA-0, cost, compliance and 1.0 release. AI agent records intake format, current blockers and validation evidence only.
> sensitive_data_location: future source materials must remain in owner-controlled storage
> redaction_status: no raw screenshots, raw blind-review rows, customer plaintext, Telegram payloads, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets

## Scope

Included:

- New M3-17 docs-only spec.
- Screenshot diagnostic sample manifest shell.
- Screenshot eval run report shell.
- Uzbek Latin / Uzbek Cyrillic / Russian blind-review report shell.
- M3 closeout/README evidence sync.

Not included:

- raw screenshot files, raw OCR/customer text, raw blind-review exports, raw model replies, raw prompts/completions, DB import, admin upload, storage upload, eval execution, prompt/model/persona release, production readiness, GA-0, real customer traffic, customer LLM, M3 closeout, M4 start or 1.0 release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-17-owner-input-intake-packs` |
| `git status --short --branch` | `## codex/m3-17-owner-input-intake-packs` before edits |
| `git branch --show-current` | `codex/m3-17-owner-input-intake-packs` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| open PR audit | `gh pr list --state open --json number,title,headRefName,baseRefName,mergeStateStatus,statusCheckRollup` returned `[]` |
| unmerged branch audit | `git branch --no-merged main` returned no branch output before creating this branch |
| branch creation | linked worktree branch `codex/m3-17-owner-input-intake-packs` created from `main` at `f0af2f2` |

## Source Audit

| Evidence source | Finding |
|---|---|
| `docs/preflight/01-owner-inputs-checklist.md` | Screenshot diagnostics require at least 20 real or real-flow recreation screenshots with case-id, screenshot type, user question, expected diagnosis, acceptable uncertainty answer and must-handoff flag. Language blind review requires case-id, input, model reply, score, issue type, customer-safe flag, revision suggestions, reviewer/date and Uzbek Latin/Cyrillic/Russian coverage. |
| `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` | F-02 blocks on low-confidence screenshot strong-answer behavior; G-04 blocks if low-quality Uzbek model output can be used for customers. |
| `UZMAX智能运营系统-技术架构-v1.1.md` | Full 1.0 eval quotas include 20 screenshot diagnostics, 20 Uzbek Latin QA, 20 Uzbek Cyrillic QA and 20 Russian QA. |
| `docs/evidence/M3/M3-06-vision-screenshot-diagnostics-foundation.md` | M3-06 is foundation-only; >=20 owner screenshot samples and real eval evidence still block F-02 closeout. |
| Repository search | `docs/evidence/M3/vision/` and `docs/evidence/M3/language-blind-review/` evidence files were absent before M3-17. |

## Output Artifacts

| Output | Status |
|---|---|
| `docs/evidence/M3/vision/screenshot-cases-manifest.md` | created as intake shell; current usable case count is 0 |
| `docs/evidence/M3/vision/eval-run-report.md` | created as not-run report; blocked until screenshot manifest has usable samples |
| `docs/evidence/M3/language-blind-review/blind-review-report.md` | created as blind-review shell; current reviewed counts are 0 |
| M3 closeout evidence | updated to record M3-17 intake-ready/pending status without closing M3 |
| M3 README | indexed M3-17 and updated remaining blocker wording |

## Acceptance Mapping

| Item | M3-17 status | Notes |
|---|---|---|
| F-02 | intake_ready_owner_samples_pending_not_closed | Evidence files exist, but no screenshot samples are committed or counted; eval not run. |
| G-04 | intake_ready_blind_review_pending_not_closed | Blind-review report exists, but Uzbek Latin/Cyrillic/Russian review counts are 0 and strong-model decision is pending. |
| G-06 | evidence_shape_prepared_not_closed | Required category quotas are reflected as intake requirements only. |
| J-05 | evidence_updated | M3 evidence now records remaining owner-input intake path and blockers. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only; no schema/lock/shared config changes. |

M3-17 does not close M3. It changes the missing evidence destinations to controlled intake documents while keeping the blocker state active.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed worktree dependencies; npm reported existing audit advisories and did not change lockfiles. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-17-owner-input-intake-packs, linked worktree, dirty allowed)`. |
| explicit assigned/root `npm run guard:worker-boundary` | pass | `worker-write-boundary: ok (codex/m3-17-owner-input-intake-packs, /Users/atilla/Documents/uzmax-m3-17-owner-input-intake-packs)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-17-owner-input-intake-packs.md --include-worktree` | pass | No PR context found for the branch; explicit spec shape passed with 7 changed docs files, source changed files 0, net source LOC 0 and new source files 0. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run check` | pass | Full local gate passed: format, prettier-ignore guard, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/worker/pr-shape guards, 150/150 Node tests, build, size and Playwright 7/7. |
| PR #55 CI | external_blocked | GitHub Actions run `27915399066`, job `82599751310`, failed before any steps started. Check-run annotation says account payments/spending limit must be fixed; no job logs were available. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one branch | pass | This branch implements only M3-17. |
| Touch list | pass | Explicit PR shape validation found only 7 docs files changed and all are inside the M3-17 spec touch list. |
| Source budget | pass | Source changed files 0, net source LOC 0 and new source files 0. |
| Sensitive data boundary | pass | Docs contain schemas, counts, refs and pending statuses only; no raw owner/customer material. |
| Release honesty | pass | Intake shells are not eval pass, M3 closeout, production release or owner signoff. |

## Remaining Work

- Owner provides at least 20 redacted screenshot samples in controlled storage with required metadata.
- AI agent performs redaction/sample usability review and future screenshot eval.
- Owner completes Uzbek Latin/Cyrillic/Russian blind review from controlled table/export.
- Future spec records pass/fail decision, strong-model lock status and any branch decision.

# M3-20 Vision Screenshot Samples Evidence

> evidence_id: M3-20-vision-screenshot-samples
> milestone: M3
> spec: `docs/specs/M3-20-vision-screenshot-samples.md`
> status: test_stage_f02_sample_eval_ready_not_production_provider_closed
> created_at: 2026-06-22
> owner_ai_boundary: Project owner confirmed visible screenshot identifiers are reserved test fixtures for M3 test-stage evidence. Project owner still decides production screenshot materials, production provider/e2e eval, real customer screenshot ingestion, customer LLM, provider keys/routes, costs, compliance, GA-0 and 1.0 release.
> sensitive_data_location: raw screenshots and visible fixture values remain outside repository in owner-controlled local storage
> redaction_status: no raw screenshots, OCR text, customer plaintext, Telegram payloads, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets included

## Scope

Included:

- M3-20 docs-only spec.
- Screenshot source batch inventory summary.
- 26 owner-confirmed test-fixture case records in `docs/evidence/M3/vision/screenshot-cases-manifest.md`.
- AI agent test-stage visual eval run in `docs/evidence/M3/vision/eval-run-report.md`.
- M3 closeout/README rollup sync.

Not included:

- Screenshot files, thumbnails, OCR text, visible test fixture values, storage upload, real provider/LLM calls, raw model outputs, DB import, admin upload, runtime integration, knowledge publish, production readiness, GA-0, real customer traffic, customer LLM, M4 start or 1.0 release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-20-vision-screenshot-samples` |
| `git status --short --branch` | `## codex/m3-20-vision-screenshot-samples` before edits |
| `git branch --show-current` | `codex/m3-20-vision-screenshot-samples` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| open PR audit | `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url,statusCheckRollup,mergeStateStatus` returned `[]` before branch creation |
| no-merged branch audit | `git branch --no-merged main` returned no branch output before branch creation |
| branch creation | linked worktree branch `codex/m3-20-vision-screenshot-samples` created from `main` at `f3bc346` |

## Owner Test-Fixture Decision

Project owner wrote on 2026-06-22 that the visible names/phone values in the screenshots are reserved test data and do not need to be treated as real personal data for this M3 test-stage pass.

Repository handling still stays strict:

- raw screenshots remain outside git;
- raw visible values are not copied into docs;
- case records use `storage://`, `redaction://` and `controlled://` refs;
- production screenshot packs may still be rebuilt/reorganized before launch.

## Source Audit

| Source | Current finding | Repository handling |
|---|---|---|
| Owner local screenshot batch | 26 JPG files, all visually inspected; dimensions range from 640x1280 to 750x1624 and 720x1600 | Images are not committed; manifest records controlled refs, sha256 hashes, dimensions and safe case metadata only. |
| Screenshot content profile | Tutorial/payment/address/login/bot-entry flows across iOS-like, Android and external shopping app screens | Safe screenshot kinds mapped to M3-06 `order_page`, `payment_page`, `merchant_chat`. |
| Visible identifier values | Owner confirmed they are reserved test fixtures for M3 test-stage evidence | Values are not written to repository evidence. |

## Output Artifacts

| Output | Status |
|---|---|
| `docs/evidence/M3/vision/screenshot-cases-manifest.md` | updated from intake shell to 26-case owner-confirmed manifest |
| `docs/evidence/M3/vision/eval-run-report.md` | updated from not-run shell to test-stage AI visual eval pass |
| M3 closeout evidence | updated to record M3-20 and F-02 test-stage sample/eval readiness |
| M3 README | indexed M3-20 and updated screenshot blocker wording |

## Acceptance Mapping

| Item | M3-20 status | Notes |
|---|---|---|
| F-02 | test_stage_sample_eval_ready_not_production_closed | 26 owner-confirmed test fixture screenshots manifested and AI visually reviewed; low-confidence/sensitive paths require handoff. |
| G-06 | screenshot_quota_met_for_test_stage_not_full_1_0_closed | Screenshot quota exceeds required 20; full 1.0 >=200 eval set and production provider/e2e remain future. |
| J-05 | evidence_updated | M3 rollup now references actual screenshot sample/eval evidence. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only; no schema/lock/shared config changes. |

M3-20 resolves the screenshot owner-input blocker for M3 test-stage evidence only. It does not close production provider/e2e, knowledge publish, GA-0, customer LLM, M4 or 1.0 release.

## Remaining Work

- Production screenshot pack may be rebuilt/reorganized before launch per owner decision.
- Production provider/e2e eval remains a future gate if screenshot diagnostics are enabled against real runtime traffic.
- Language blind-review production scoring and strong-model decision remain outside this M3-20 slice.
- Knowledge import/eval/publish gates remain outside this M3-20 slice.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass_with_existing_audit_findings | Installed linked worktree dependencies; npm reported 3 high severity dependency findings not introduced by M3-20 because lockfile is untouched. |
| sensitive value grep | pass | Targeted grep for visible fixture names/phone/address/order-like values found no M3-20 evidence leaks; only existing GitHub owner URLs matched the broad `Atilla` token in the closeout ledger. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-20-vision-screenshot-samples, linked worktree, dirty allowed)`. |
| explicit assigned/root `npm run guard:worker-boundary` | pass | `worker-write-boundary: ok (codex/m3-20-vision-screenshot-samples, /Users/atilla/Documents/uzmax-m3-20-vision-screenshot-samples)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-20-vision-screenshot-samples.md --include-worktree` | pass | No PR context found for the branch; explicit spec shape passed with 6 changed docs files, source changed files 0, net source LOC 0 and new source files 0. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run check` | pass | Full local gate passed: format, prettier-ignore guard, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/worker/pr-shape guards, 150/150 Node tests, build, size and Playwright 7/7. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one branch | pass | This branch implements only M3-20. |
| Touch list | pass | Explicit PR shape validation found only 6 docs files changed and all are inside the M3-20 spec touch list. |
| Source budget | pass | Source changed files 0, net source LOC 0 and new source files 0. |
| Sensitive data boundary | pass | Docs contain controlled refs, hashes, dimensions and safe labels only; no screenshot files, OCR text or visible fixture values. |
| Screenshot quota | pass | Manifest records 26 owner-confirmed usable cases; required test-stage minimum is 20. |
| Low-confidence behavior | pass | Eval report marks credential/payment-proof verification paths as handoff-required and keeps low-confidence strong answers as failures. |
| Release honesty | pass | M3-20 is test-stage evidence, not production provider/e2e, GA-0, customer LLM, M4 or 1.0 release. |
| Test integrity | pass | No tests deleted, skipped, weakened or mocked; full `npm run check` passed. |
| External API evidence | pass | none; no new provider/SDK/connector/adapter. |
| Exceptions | pass | none. |

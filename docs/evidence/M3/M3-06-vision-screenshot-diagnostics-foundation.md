# M3-06 Vision Screenshot Diagnostics Foundation Evidence

- evidence_id: M3-06-vision-screenshot-diagnostics-foundation
- spec: `docs/specs/M3-06-vision-screenshot-diagnostics-foundation.md`
- branch: `codex/m3-06-vision-screenshot-diagnostics-foundation`
- worktree: `/Users/atilla/Documents/uzmax-m3-06-vision-screenshot-diagnostics-foundation`
- base: `origin/main` at `fe1bd31fda4368cb341edc260c954e5bfa98fb61`
- status: foundation-only
- redaction_status: No raw screenshots, raw OCR/text, customer plaintext, Telegram payloads, voice transcripts, order IDs, phone numbers, addresses, payment data, support personal accounts, raw prompt/completion or secrets included

## Scope

M3-06 adds a pure `packages/capabilities/vision` foundation for screenshot diagnostics:

- controlled screenshot/media refs only;
- synthetic controlled diagnosis candidate validation;
- high-confidence bounded `diagnosis_card`;
- low-confidence, missing-signal, ambiguous, explicit-uncertain, unsafe or unsupported paths fail closed to `handoff_required` or `uncertain`;
- safe sample manifest builder that records counts, categories, controlled storage/redaction/expected outcome refs, redaction method, access scope and owner confirmation status.

This is foundation-only. It does not close F-02 because >=20 owner screenshot samples and real eval evidence are still missing.

## Not Included

- production, GA-0, real customer traffic, customer LLM, provider route release or 1.0 release approval;
- API, worker, engine, admin, DB persistence, schema/migration/generated DTOs or real eval runner integration;
- provider SDK, LLM key, env var, storage upload, outbound send or prompt/model/persona release;
- raw screenshots, raw OCR/customer text, raw/export/jsonl/csv, Telegram payloads, voice transcripts, order/phone/address/payment data, support personal accounts or secrets.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-06-vision-screenshot-diagnostics-foundation` |
| `git status --short --branch` | `## codex/m3-06-vision-screenshot-diagnostics-foundation...origin/main` |
| `git branch --show-current` | `codex/m3-06-vision-screenshot-diagnostics-foundation` |
| `git branch --no-merged main` | no branch output |
| `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` | `[]` |
| `git fetch --prune` | pass, no output |
| dependency setup | `npm ci` passed; lockfile unchanged; npm reported existing audit advisories |

No open PR conflict or unmerged branch conflict was found at start.

## TDD Evidence

| Step | Command | Result |
|---|---|---|
| RED | `node --test scripts/tests/m3-vision-screenshot-diagnostics-foundation.test.mjs` | failed as expected before implementation: missing M3-06 vision exports and docs/evidence entries; 0/7 tests passed |
| GREEN | `node --test scripts/tests/m3-vision-screenshot-diagnostics-foundation.test.mjs` | pass; 7/7 tests passed |

## Contract Evidence

| Behavior | Evidence |
|---|---|
| Controlled refs only | `createScreenshotDiagnosisInput` accepts `storageRef`, `manifestRef`, `redactionRef` and supported screenshot kind only; field-specific refs keep `storage://`, `manifest://` and `redaction://` schemes. |
| Raw input rejected | Raw screenshot content, data URLs, public URLs, file paths, base64/blob-ish payloads, raw OCR/text, customer plaintext and unknown free-text carrier fields fail closed before diagnosis. |
| Bounded diagnosis card | High-confidence synthetic controlled candidates return `diagnosis_card` with bounded diagnosis, observations, actions and controlled refs only. |
| Uncertainty handoff | Low confidence, missing required signals, ambiguous diagnosis, explicit uncertainty, kind mismatch and unsupported screenshot kinds return `handoff_required` or `uncertain` without a card. |
| Sample manifest | `createScreenshotSampleManifest` records safe refs/counts/categories/redaction/access/owner status and never raw screenshot content. |
| Owner blocker | Missing or <20 owner samples keeps `f02Closeout` blocked; >=20 samples only reaches `not_closed_foundation_only` for future eval. |

## Review Blocker Closure

| Blocker | Closure Evidence |
|---|---|
| Raw/customer text rejection bypassable | Candidate and sample manifest inputs now use strict allowlists plus recursive raw-field rejection. Focused tests cover candidate `messageText`, `customerMessage`, `caption` and manifest `notes`. |
| Controlled refs not field-prefix constrained | `storageRef`, `manifestRef`, `redactionRef`, case storage/redaction refs and model/provider/result refs now require their field-specific schemes. Focused tests cover swapped storage/manifest/redaction schemes. |
| Unsupported candidate kind threw instead of fail-closed | Unsupported tokenized screenshot kinds now return structured `handoff_required` with reason `unsupported_screenshot_kind` and no `diagnosis_card`. |
| Evidence whitespace | This evidence header no longer uses trailing spaces for Markdown line breaks; `git diff --check origin/main...HEAD` is required before push. |

## Acceptance Mapping

| Item | Status | Notes |
|---|---|---|
| F-02 | foundation_implemented_not_closed | Synthetic controlled screenshot diagnosis contract exists; full screenshot diagnostics closeout remains blocked by >=20 owner screenshot samples and real eval evidence. |
| F-05 | foundation_supported_not_closed | Raw screenshot/customer text and unsafe refs are rejected; broader redline output guard remains M3-08/future integration. |
| G-06 | foundation_queued_not_closed | Vision category/ref payload compatibility is manifest/ref-only; full 1.0 >=200 eval target and 20 screenshot cases remain future. |
| H-05 | foundation_supported_not_closed | Controlled `storageRef`/manifest refs are accepted; no upload/storage implementation. |
| J-05 | foundation_updated | This file records M3-06 evidence; no release signoff. |
| K-03 | active | One spec / one PR. |
| K-04 | active | Single linked worktree/branch; no overlapping open PR at dispatch audit. |

## Sensitive Data Boundary

Repository evidence may record only manifest identifiers, storage refs, redaction refs, access scope, redaction method, count/category summaries and owner confirmation status. Raw screenshot files, raw OCR text, customer messages, Telegram payloads and other sensitive material must stay out of git and out of third-party LLM paths unless future owner/governance signoff changes ADR-003 boundaries.

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/m3-vision-screenshot-diagnostics-foundation.test.mjs` | pass | 7/7 tests passed |
| `npm run format:check` | pass | Prettier check passed |
| `npm run typecheck` | pass | TypeScript check passed |
| `npm run lint` | pass | ESLint passed with source complexity and file length kept within budget |
| `npm run depcruise` | pass | no dependency violations |
| `npm run jscpd` | pass | no duplicates found after making the focused test helper distinct |
| `npm run knip` | pass | no unused files/dependencies reported |
| `npm run guard:forbidden-terms` | pass | forbidden-terms guard passed |
| `npm run guard:doc-triggers` | pass | doc-trigger guard passed |
| `npm run guard:workspace` | pass | linked feature worktree accepted |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-06-vision-screenshot-diagnostics-foundation.md --include-worktree` | pass | 6 changed files: docs 4, source 1, test 1; source net LOC 395; new source files 0 |
| `git diff --check origin/main...HEAD` | pass | no whitespace errors after review fix |
| `npm run check` | pass | Full chain passed: format, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/pr-shape guards, 112/112 node tests, build, size and Playwright 6/6 |

## PR Hygiene

| Field | Value |
|---|---|
| Spec ID | `M3-06-vision-screenshot-diagnostics-foundation` |
| Touch modules | M3-06 spec/evidence; contracts README; M3 evidence README; `packages/capabilities/vision/src/index.ts`; focused test |
| Path categories | source: 1; test: 1; docs: 4; generated/lock/config: 0 |
| Source changed files | `packages/capabilities/vision/src/index.ts` |
| Source net LOC | 395 by `guard:pr-shape`; source file length 396 lines |
| New source files | 0 |
| Test changes | Added focused M3-06 node test with post-review blocker regressions for raw text carrier fields, swapped ref schemes and unsupported-kind fail-closed behavior |
| Generated/lock/config changes | none |
| External API evidence | none; no external API/provider/SDK/connector/adapter added |
| Search conclusion | Existing repo had placeholder vision package only; M3-01 media/eval compatibility and M3-03 ref payload boundary exist, but no screenshot diagnostics runtime contract. In-place extension was the correct source home. |
| Unresolved items | >=20 owner screenshot samples and real eval evidence still block F-02 closeout. |

## Closeout / Incident

- Incident: none created by this spec.
- No raw sample directory or screenshot artifact was created.
- M3-06 closes no production acceptance item and does not approve release.

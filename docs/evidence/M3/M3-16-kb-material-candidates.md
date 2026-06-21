# M3-16 KB Material Candidates

> evidence_id: M3-16-kb-material-candidates
> milestone: M3
> spec: `docs/specs/M3-16-kb-material-candidates.md`
> status: implemented_validated
> created_at: 2026-06-21
> owner_ai_boundary: Project owner decides whether candidate knowledge is accepted, edited, translated, published, or held for later. AI agent derives candidate materials, records source hashes and validation evidence only.
> sensitive_data_location: source materials remain in owner-local controlled storage
> redaction_status: no raw Telegram payloads, customer plaintext, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets

## Scope

Included:

- New M3-16 docs-only spec.
- Tutorial materials manifest for owner-local FAQ and redacted Telegram source files.
- Draft journey import report with 9 stage keys and controlled material refs.
- Candidate knowledge pack covering service, account/address, order/inbound, routes/pricing/timing, restricted goods, customs, billing, pickup/delivery and claims.
- M3 closeout/README evidence sync.

Not included:

- Formal knowledge publish, DB import, admin upload, storage upload, eval closure, prompt/model/persona release, production readiness, GA-0, real customer traffic, customer LLM, M3 closeout, M4 start or 1.0 release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-16-kb-material-candidates` |
| `git status --short --branch` | `## codex/m3-16-kb-material-candidates` before edits |
| `git branch --show-current` | `codex/m3-16-kb-material-candidates` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| open PR audit | `gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,url` returned `[]` |
| unmerged branch audit | `git branch --no-merged main` returned no branch output before creating this branch |
| branch creation | linked worktree branch `codex/m3-16-kb-material-candidates` created from `main` at `36d6598` |

## Source Audit

| Check | Result |
|---|---|
| FAQ source hash | `c90821e219a22a5c646b2aa47759927aca4e1885468ab96e15f711b334e27db1` |
| FAQ item count | 60 QA sections |
| Telegram manifest hash | `ac36185db7766d8aaee9d87d9405f2a691c58d87757ee23f3034f5779d89da4b` |
| Redacted seed review set | 80 rows, `needs_human_review` |
| Redacted candidate pool | 2443 rows, `needs_human_review` |
| Residual rescan in source manifest | zero residual phone/url/handle/long-number/identity-doc hits |
| Raw source handling | source files not copied into repository |

## Candidate Outputs

| Output | Status |
|---|---|
| `docs/evidence/M3/tutorial/tutorial-materials-manifest.md` | created |
| `docs/evidence/M3/tutorial/journey-import-report.md` | created |
| `docs/evidence/M3/tutorial/kb-candidate-pack.md` | created |
| M3 closeout evidence | updated to `tutorial_candidate_generated_owner_review_pending` while preserving M3 no-go |
| M3 README | indexed M3-16 and updated tutorial blocker status |

## Acceptance Mapping

| Item | M3-16 status | Notes |
|---|---|---|
| F-01 | candidate_generated_owner_review_pending | Candidate tutorial/knowledge pack exists, but owner review, import/eval and publish gate remain future. |
| H-01 | material_candidate_partial | Facts/journeys/stages/material refs drafted as evidence; no DB/admin/publish closure. |
| G-03 | not_closed | No knowledge publish or production gate release. |
| J-05 | evidence_updated | M3 evidence now records generated tutorial/KB candidate evidence. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only; no schema/lock/shared config changes. |

M3-16 does not close M3. It changes only the tutorial material blocker state from absent to candidate generated / owner review pending. Screenshot samples and language blind review remain active blockers.

## Validation

| Command | Result | Notes |
|---|---|---|
| `npm ci` | pass | Installed worktree dependencies; npm reported existing audit advisories and did not change lockfiles. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-16-kb-material-candidates, linked worktree, dirty allowed)`. |
| explicit assigned/root `npm run guard:worker-boundary` | pass | `worker-write-boundary: ok (codex/m3-16-kb-material-candidates, /Users/atilla/Documents/uzmax-m3-16-kb-material-candidates)`. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-16-kb-material-candidates.md --include-worktree` | pass | 7 changed files; categories docs 7; source changed files 0, net LOC 0, new source files 0. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run check` | pass | Full local gate passed: format, prettier-ignore guard, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/pr-shape guards, 150/150 Node tests, build, size and Playwright 7/7. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one branch | pass | This branch implements only M3-16. |
| Touch list | pass | Explicit PR shape validation found only 7 docs files changed and all are inside the M3-16 spec touch list. |
| Source budget | pass | No source files changed. |
| Sensitive data boundary | pass | Generated docs contain source hashes, aggregate counts, QA ids and sample ids only; no raw source files copied. |
| Release honesty | pass | Candidate pack is not official KB publish and does not approve M3 closeout or production. |

## Remaining Work

- Owner review of candidate pack.
- Correct/approve wording and translation policy.
- Future import/persistence/admin/publish spec after approval.
- Eval gate coverage for tutorial stage localization.
- Screenshot diagnostic samples and language blind review remain unresolved.

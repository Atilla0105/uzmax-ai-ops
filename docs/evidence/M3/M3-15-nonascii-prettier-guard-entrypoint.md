# M3-15 Non-ASCII Prettier Guard Entrypoint

> evidence_id: M3-15-nonascii-prettier-guard-entrypoint
> milestone: M3
> spec: `docs/specs/M3-15-nonascii-prettier-guard-entrypoint.md`
> status: implemented_validated
> created_at: 2026-06-20
> updated_at: 2026-06-20
> owner_ai_boundary: Project owner decides M3 owner acceptance, owner-input blocker handling, M4 start, production readiness, real customer data, provider/LLM keys/routes, cost, compliance, GA-0 and 1.0 release. AI agent implements this governance follow-up and records validation evidence only.
> sensitive_data_location: none
> redaction_status: no raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets

## Scope

This slice is M3 signoff 前治理修补 / pre-M4 governance follow-up only.

Included:

- Fixed the `prettier-ignore` boundary guard CLI entrypoint so it runs under a non-ASCII script path instead of silently skipping `main()`.
- Added a focused regression that copies the guard into a non-ASCII temporary path and verifies CLI output is produced.
- Updated M3 closeout evidence and M3 evidence README to include this M3-15 follow-up.

Not included:

- M3 owner acceptance, M4 start, production release, GA-0, real customer traffic, customer LLM, provider route release, prompt/model/persona release, knowledge publish, DB/schema/migration/generated DTOs, apps/packages business source changes, CI/package script changes, lockfile changes or runtime write jail.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-15-nonascii-prettier-guard-entrypoint` |
| `git status --short --branch` | `## codex/m3-15-nonascii-prettier-guard-entrypoint` before M3-15 edits; later dirty only with scoped M3-15 files |
| `git branch --show-current` | `codex/m3-15-nonascii-prettier-guard-entrypoint` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits and during validation |
| existing worktrees | root/main plus assigned M3-15 worker worktree |
| open PR audit | `gh pr list --state open --json number,title,headRefName,baseRefName,url,isDraft` returned `[]` before this slice |
| unmerged branch audit | `git branch --no-merged main` had no unrelated branch before this slice; this M3-15 branch is the active work branch |
| dependency setup | `npm ci` had already installed dependencies in the assigned worktree; npm reported existing audit advisories and did not change lockfiles |

## Reproduction And Diagnosis

| Check | Result | Notes |
|---|---|---|
| root/main focused test before fix | fail_confirmed | In `/Users/atilla/Documents/UZMAX智能运营`, `node --test scripts/tests/prettier-ignore-boundary.test.mjs` reported 5/6 with `Missing expected exception`. |
| root/main direct guard before fix | fail_confirmed | In `/Users/atilla/Documents/UZMAX智能运营`, `node scripts/guards/prettier-ignore-boundary.mjs --base origin/main` exited 0 with no output, proving `main()` did not run. |
| ASCII worker focused test before fix | pass_masked_bug | In `/Users/atilla/Documents/uzmax-m3-15-nonascii-prettier-guard-entrypoint`, the same focused test passed 6/6 before the fix because the worker path is ASCII. |
| root cause | confirmed | `import.meta.url` URL-encodes `UZMAX智能运营`, while the previous `file://${process.argv[1]}` comparison used the raw filesystem path. The comparison was false under the non-ASCII root, so CLI entrypoint execution was skipped. |

## Implementation Summary

| File | Change |
|---|---|
| `scripts/guards/prettier-ignore-boundary.mjs` | Replaced the fragile hand-built `file://` URL comparison with the same path-safe filename entrypoint pattern used by other repo guards, while keeping marker strings split so the guard does not count itself. |
| `scripts/tests/prettier-ignore-boundary.test.mjs` | Added a non-ASCII script-path regression that copies the guard into a temporary `智能运营` path and asserts CLI output is produced. Existing spread/diff/baseline tests remain intact. |
| `docs/specs/M3-15-nonascii-prettier-guard-entrypoint.md` | Added this narrow follow-up spec. |
| `docs/evidence/M3/M3-15-nonascii-prettier-guard-entrypoint.md` | Added implementation, validation and PR hygiene evidence. |
| `docs/evidence/M3/M3-ai-capability-closeout-signoff.md` | Backfilled M3-15 governance follow-up status while preserving M3 no-go boundary. |
| `docs/evidence/M3/README.md` | Indexed M3-15 governance follow-up evidence and boundary. |

## Validation

| Command | Result | Notes |
|---|---|---|
| `node --test scripts/tests/prettier-ignore-boundary.test.mjs` | pass | Focused prettier-ignore boundary tests passed 7/7, including non-ASCII script path regression. |
| `npm run guard:prettier-ignore` | pass | Guard printed `prettier-ignore-boundary: ok (8 baseline file(s), 89/89 marker(s))`. |
| `npm run guard:prettier-ignore -- --base origin/main` | pass | Guard printed baseline ok plus diff check ok against `origin/main`. |
| `npm run format:check` | pass | Prettier reported all matched files use Prettier code style. |
| `npm run lint` | pass | ESLint completed without findings. |
| `npm run guard:doc-triggers` | pass | `doc-trigger-paths: ok`. |
| `npm run guard:workspace` | pass | `workspace-isolation: ok (codex/m3-15-nonascii-prettier-guard-entrypoint, linked worktree, dirty allowed)`. |
| `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m3-15-nonascii-prettier-guard-entrypoint UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` | pass | Explicit assigned/root invocation passed for the active worker and root/main checkout. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-15-nonascii-prettier-guard-entrypoint.md --include-worktree` | pass | No PR context found for the branch; explicit spec shape passed with 6 changed files, docs 4/source 1/test 1. |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm run test` | pass | 150/150 Node tests passed. |
| `npm run check` | pass | Full local gate passed: format, prettier-ignore guard, typecheck, lint, depcruise, jscpd, knip, forbidden/eval/doc/workspace/worker/pr-shape guards, 150/150 Node tests, build, size and Playwright 7/7. |

## PR Hygiene Summary

| Category | Result |
|---|---|
| Path categories | docs, source, test |
| Source changed files | 1 |
| New source files | 0 |
| Test files changed | 1 |
| Generated/lock/config changes | none |
| External API/provider/SDK evidence | none; no external provider/SDK/connector/adapter added |
| Exceptions | none |
| Test weakening | none; no `.skip` / `.only` / `xit` / `xfail` added |

## Final Handoff State

| Check | Result | Evidence |
|---|---|---|
| Worker branch | active | `codex/m3-15-nonascii-prettier-guard-entrypoint` |
| Root/main status | pass | `/Users/atilla/Documents/UZMAX智能运营` remained `## main...origin/main` |
| Open PR audit | pending | Coordinator owns PR creation after local validation. |
| No-merged branch audit | expected_handoff | This M3-15 branch remains pending PR/merge/cleanup. |

## Sensitive Data Boundary

M3-15 stores only guard/test/docs and aggregate validation evidence in git. No raw customer data, Telegram payloads, screenshots, voice transcripts, raw prompts, raw completions, order IDs, phone numbers, addresses, payment data, support personal accounts, LLM keys or secrets were added.

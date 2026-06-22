# M3-18 CI Cost Stopgap Evidence

> evidence_id: M3-18-ci-cost-stopgap
> milestone: M3
> spec: `docs/specs/M3-18-ci-cost-stopgap.md`
> status: implemented_local_validated_remote_ci_blocked_by_billing
> created_at: 2026-06-22
> owner_ai_boundary: Project owner decides GitHub billing/spending limit, ruleset changes, merge and future CI strictness. AI agent records UZMAX-only workflow changes, validation and known blockers.
> sensitive_data_location: none in repository
> redaction_status: no secrets, tokens, customer data, raw samples, LLM keys or billing credentials included

## Scope

Included:

- UZMAX-only CI path classification.
- Docs-only lightweight PR path.
- Conditional core CI, spike CI and Playwright CI gates.
- Manual `workflow_dispatch` full-CI escape hatch.
- Git/CI manifest evidence update.

Not included:

- ZAPCHATNWEUI changes, GitHub billing/spending limit updates, ruleset changes, secret changes, source/runtime changes, test deletion/weakening, M3 closeout, M4 start or production release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/Documents/uzmax-m3-18-ci-cost-stopgap` |
| `git status --short --branch` | `## codex/m3-18-ci-cost-stopgap` before edits |
| `git branch --show-current` | `codex/m3-18-ci-cost-stopgap` |
| root/main status | `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main` before edits |
| open PR audit | PR #55 open on `codex/m3-17-owner-input-intake-packs`; non-overlapping docs-only owner-input intake PR |
| unmerged branch audit | only `codex/m3-17-owner-input-intake-packs` before creating this branch |
| branch creation | linked worktree branch `codex/m3-18-ci-cost-stopgap` created from `main` at `f0af2f2` |

## Current Cost Evidence Used

| Source | Finding |
|---|---|
| `.github/workflows/ci.yml` before M3-18 | Every PR/push ran full type/lint/depcruise/jscpd/knip/forbidden/eval/doc/workspace/pr-shape/prisma/spike/test/build/size/Playwright path. |
| GitHub run history for `Atilla0105/uzmax-ai-ops` | Month-to-date repository history showed 167 runs and about 916 rounded run-level minutes; PR and push both contribute. |
| GitHub run history for `Atilla0105/ZAPCHATNWEUI` | ZAP was the larger account-level consumer, but project owner explicitly excluded ZAP from this task. |
| PR #55 CI annotation | GitHub Actions was externally blocked before steps by billing/payment or spending-limit state; workflow changes cannot prove remote CI until billing is fixed. |

## CI Behavior After M3-18

| Path class | Always runs | Conditional heavy gates |
|---|---|---|
| docs-only PR | `npm ci`, format, prettier-ignore boundary, eval-trigger guard, doc-trigger guard, workspace guard, PR shape | no type/lint/depcruise/jscpd/knip/forbidden/prisma/test/build/size/Playwright/spikes |
| non-docs PR/push | lightweight gates plus core type/lint/depcruise/jscpd/knip/forbidden/prisma/test/build | spikes only on DB/authz/package paths; Playwright only on admin/frontend paths |
| DB/authz/package paths | core gates | SPK-03 and SPK-04 |
| admin/frontend paths | core gates | size, Playwright install and Playwright |
| manual `workflow_dispatch` full=true | all gates | forces spikes and Playwright |

## Validation

| Command | Result | Notes |
|---|---|---|
| workflow syntax parse | pass | `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml"); puts "workflow yaml syntax ok"'` |
| `git diff --check origin/main...HEAD` | pass | No whitespace errors. |
| `npm ci` | pass_with_existing_audit_findings | Installed dependencies in this linked worktree; npm audit reported 3 high severity dependency findings, not introduced or modified by M3-18 because lockfile is untouched. |
| `npm run format:check` | pass | Prettier check passed. |
| `npm run guard:prettier-ignore -- --base origin/main` | pass | Baseline and monitored source/test diff check passed. |
| `npm run guard:eval-triggers -- --base origin/main` | pass | No eval-triggering paths changed. |
| `npm run guard:doc-triggers` | pass | Documentation trigger guard passed. |
| `npm run guard:workspace` | pass | Linked worktree on `codex/m3-18-ci-cost-stopgap`; dirty worker allowed. |
| explicit assigned/root `npm run guard:worker-boundary` | pass | `UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m3-18-ci-cost-stopgap` and `UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营` passed. |
| `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-18-ci-cost-stopgap.md --include-worktree` | pass | 4 changed files: config 1, docs 3; source changed files 0, net source LOC 0, new source files 0. |
| `npm run check` | pass | Full local check passed: format, guards, typecheck, lint, depcruise, jscpd, knip, forbidden terms, tests, build, size and 7 Playwright tests. |

## Spec Compliance Review

| Check | Result | Evidence |
|---|---|---|
| One spec / one branch | pass | `codex/m3-18-ci-cost-stopgap` implements `docs/specs/M3-18-ci-cost-stopgap.md`; root/main remained coordination/read-only. |
| Touch list | pass | PR shape guard reported only `.github/workflows/ci.yml`, this spec, this evidence file and `docs/evidence/M0/infra/git-ci-manifest.md`. |
| Source budget | pass | PR shape guard reported source changed files 0, net source LOC 0 and new source files 0. |
| Test integrity | pass | No test files changed; no `.skip`/`.only`/`xit`/`xfail`; no assertion or snapshot weakening. |
| Sensitive data boundary | pass | Workflow references existing secret names only; no secret values or billing credentials are included. |
| Release honesty | pass | CI cost stopgap is not M3 closeout, production release or owner signoff. |

## Remaining Work

- Fix GitHub billing/payment or spending-limit state before remote CI can prove this PR.
- After merge and billing recovery, observe at least one docs-only PR and one runtime PR to verify expected gate selection.
- ZAPCHATNWEUI remains explicitly out of scope.

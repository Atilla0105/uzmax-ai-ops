# M10-04 Release Gate CI Baseline

Spec: `docs/specs/M10-04-release-gate-ci-baseline.md`
Status: `implementation_in_progress`
Recorded: 2026-07-09
Branch: `codex/m10-04-release-gate-ci-baseline`
Worktree: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-04-release-gate-ci-baseline`

## Current Truth

M10-04 is a docs/test CI baseline unblocker found while validating M10-02:

- `main` at `8767572` fails `scripts/tests/m9-ga0-minimal-boundary.test.mjs`.
- The failure is a release doc/test drift after GA0-01/M9-07 recorded the minimal Bot-only GA-0 signoff.
- The release boundary still must say GA-0 remains locked for any broader scope and 1.0 remains blocked.

This slice does not implement or approve M10-01 backend writes, M10-02 admin runtime, M10-03 live support-operator smoke, production, real customer/order data, customer LLM, Telegram Business automatic reply, formal knowledge write or 1.0 release.

## Start Audit

| Fact | Evidence |
|---|---|
| `pwd` | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-04-release-gate-ci-baseline` |
| branch | `codex/m10-04-release-gate-ci-baseline` |
| status before edits | `## codex/m10-04-release-gate-ci-baseline` |
| base | `main` at `8767572` |
| root/main status | `## main...origin/main` |
| open PR audit before work | PR #290 M10-01, PR #291 M10-02, PR #292 M10-03 |

## Implementation

- Added an explicit release-doc sentence that `GA-0 remains locked` for any scope beyond the narrow minimal Bot-only controlled internal/staging signoff.
- Updated the M9 release-boundary test to assert current GA0-01/M9-07 truth rather than stale pre-signoff missing-work wording.
- Updated the M9-06 provisioning test to assert the current live pass token rather than the stale workflow-ready token.
- Updated the M9-04 employee read test to separate the historical owner-input spec from the current live evidence and release-doc lock boundary.

## Validation Log

- `node --test scripts/tests/m9-ga0-minimal-boundary.test.mjs`
  - Result: pass, 5/5 tests.
  - Coverage: GA-0 lock wording, current minimal Bot-only GA0-01/M9-07 signoff truth, G-04/G-06 deferral-not-pass boundary, M9-04 live employee evidence wording, M9-05 zero-outbound reason-code wording, 1.0 blocked boundary and admin release gate disabled state.
- `node --test scripts/tests/m9-ga0-employee-provisioning.test.mjs`
  - Result: pass, 5/5 tests.
  - Coverage: dispatch-only workflow, Node 24, trusted DB URL secret, exact live M9-06 pass token, sanitization boundary and no raw secret strings in evidence.
- `node --test scripts/tests/m9-admin-employee-read-evidence.test.mjs`
  - Result: pass, 4/4 tests.
  - Coverage: missing local employee auth still fails closed, manual token and password-session paths use scoped headers, historical M9-04 owner-input spec remains recorded, current M9-04 live pass evidence is asserted, and release docs keep broader GA-0 locked.
- `node node_modules/prettier/bin/prettier.cjs --check docs/specs/M10-04-release-gate-ci-baseline.md docs/evidence/M10/M10-04-release-gate-ci-baseline.md docs/release.md scripts/tests/m9-ga0-minimal-boundary.test.mjs scripts/tests/m9-ga0-employee-provisioning.test.mjs scripts/tests/m9-admin-employee-read-evidence.test.mjs`
  - Result: pass.
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-04-release-gate-ci-baseline.md --include-worktree`
  - Result: pass.
  - Shape: changed files `6`; categories `docs=3`, `test=3`; source net LOC `0`.
- `git diff --check main...HEAD`
  - Result: pass.
- `git diff --check`
  - Result: pass.

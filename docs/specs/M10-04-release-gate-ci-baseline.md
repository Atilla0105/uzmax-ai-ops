# M10-04 Release Gate CI Baseline

Spec ID: M10-04
Status: `implementation_in_progress`
Owner confirmation point: project owner authorized the product-grade customer-service closure goal on 2026-07-09; this slice only unblocks the repo CI baseline and does not approve release scope.
Timebox: narrow docs/test alignment.

## Spec 类型

docs

## Goal

Restore the release-gate CI baseline after M9-07 recorded the minimal Bot-only GA-0 signoff while keeping the release boundary truthful:

1. Keep `docs/release.md` explicit that GA-0 remains locked for any scope beyond the narrow minimal Bot-only controlled internal/staging signoff.
2. Update the M9 release-boundary, M9-06 and M9-04 evidence tests from pre-M9-07 "follow-up still missing" wording to the current GA0-01/M9-07 source-of-truth.
3. Do not weaken the GA/1.0, production, customer-data, customer LLM, Telegram Business automatic reply or formal knowledge-write boundaries.

## AI Agent Responsibilities

- Keep writes inside the assigned M10-04 worktree.
- Treat this as a CI baseline unblocker, not part of M10-01 backend, M10-02 admin runtime or M10-03 live smoke implementation.
- Do not edit production/deploy config, source runtime, schema, migrations, generated files or lockfiles.
- Record validation in the M10-04 evidence file.

## Preconditions

- Current branch is `codex/m10-04-release-gate-ci-baseline`.
- Current worktree is `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m10-04-release-gate-ci-baseline`.
- Base is local `main` at `8767572`.
- Root/main checkout is read-only for coordination.
- Main currently fails `scripts/tests/m9-ga0-minimal-boundary.test.mjs` because the release doc/test boundary drifted after M9-07.

## Scope

- Add one release-gate lock sentence to `docs/release.md`.
- Update only the stale M9 release-boundary assertions in `scripts/tests/m9-ga0-minimal-boundary.test.mjs`, the stale M9-06 ready-not-run assertion in `scripts/tests/m9-ga0-employee-provisioning.test.mjs` and the stale M9-04 current-blocker assertions in `scripts/tests/m9-admin-employee-read-evidence.test.mjs`.
- Add this spec and M10-04 evidence.

## Out Of Scope

- No M10-01 backend write implementation.
- No M10-02 admin runtime implementation.
- No M10-03 live support-operator smoke dispatch.
- No production traffic, real customer/order data, customer LLM, Telegram Business automatic reply, formal knowledge write or 1.0 approval.
- No source runtime, DB schema, migration, generated client, package/lockfile, CI workflow or deployment changes.

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：

  - `docs/specs/M10-04-release-gate-ci-baseline.md`
  - `docs/evidence/M10/M10-04-release-gate-ci-baseline.md`
  - `docs/release.md`
  - `scripts/tests/m9-admin-employee-read-evidence.test.mjs`
  - `scripts/tests/m9-ga0-employee-provisioning.test.mjs`
  - `scripts/tests/m9-ga0-minimal-boundary.test.mjs`

Read-only anchors:

- `AGENTS.md`
- `docs/evidence/GA-0/GA0-00-minimal-boundary.md`
- `docs/evidence/GA-0/GA0-01-minimal-bot-signoff.md`
- `docs/specs/M9-07-ga0-minimal-signoff-record.md`

## Change Budget

- Docs: changed docs files <= 3.
- Test: changed test files <= 3.
- Source: changed source files <= 0, net source LOC <= 0, new source files <= 0.
- Config/lock/generated/backend/DB/deploy: none.
- Exceptions: none.

## Acceptance

- `docs/release.md` contains an explicit `GA-0 remains locked` boundary without contradicting GA0-01/M9-07.
- `scripts/tests/m9-ga0-minimal-boundary.test.mjs` asserts the current M9-07/GA0-01 signoff truth instead of stale M9-04/M9-05 missing-work wording.
- `scripts/tests/m9-ga0-employee-provisioning.test.mjs` asserts the current live M9-06 pass token instead of stale ready-not-run wording.
- `scripts/tests/m9-admin-employee-read-evidence.test.mjs` distinguishes the historical M9-04 owner-input spec, the current M9-04 live evidence and the release-doc GA-0 lock boundary.
- Focused M9 release-boundary test passes.
- `guard:pr-shape` passes with zero source changes.
- `git diff --check` passes.

## Failure Branches

- If wording would imply production, broad customer traffic, customer LLM, Telegram Business automatic reply, formal knowledge write or 1.0 approval, stop and rewrite.
- If tests become weaker than the current release boundary, stop and keep the assertion.
- If this requires source/runtime/CI workflow changes, split a new spec.

## Validation

- `node --test scripts/tests/m9-ga0-minimal-boundary.test.mjs`
- `node --test scripts/tests/m9-ga0-employee-provisioning.test.mjs`
- `node --test scripts/tests/m9-admin-employee-read-evidence.test.mjs`
- `node scripts/guards/pr-shape.mjs --base main --spec docs/specs/M10-04-release-gate-ci-baseline.md --include-worktree`
- `git diff --check main...HEAD`

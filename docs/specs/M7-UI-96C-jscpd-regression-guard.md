# M7-UI-96C jscpd Regression Guard

## Goal

Add an independent cleanup/governance unblock slice for the M7 visible UI stack so PR CI no longer fails only because the base branch already contains repository-wide jscpd duplicate debt.

The new guard must still run jscpd on both the resolved base ref and current head, then fail closed if head worsens duplicate metrics. This slice does not clean the existing base-wide clone debt and does not relax `jscpd.config.json`.

This PR is stacked on #239 / `codex/m7-ui-96a-stack-typecheck-cleanup`. #239 handles the inherited prettier-ignore, typecheck and max-lines cleanup surface; 96C only changes the jscpd regression guard so the stack can keep an explicit no-regression gate without absorbing whole-repo duplicate cleanup.

## Owner Confirmation Points And AI Agent Responsibility

Owner/coordinator:

- Confirm this is a serialized CI/guard cleanup unblock, not a whole-repo duplicate cleanup.
- Confirm existing base-wide duplicate debt may pass only when head does not worsen it.
- Keep final merge/release decisions owner-only.

AI agent:

- Work only in `/Users/atilla/.codex/worktrees/m7-ui-96c-jscpd-regression-guard` on branch `codex/m7-ui-96c-jscpd-regression-guard`.
- Keep `/Users/atilla/Applications/UZMAX智能运营` root/main read-only except git metadata needed to create the worktree.
- Do not enter or modify `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup`.
- Read `AGENTS.md`, current `package.json`, `.github/workflows/ci.yml`, `jscpd.config.json`, existing guard/test patterns and the required jscpd search before edits.
- Keep `package.json` unchanged, keep the absolute `npm run jscpd` script available, and make PR CI call the regression guard directly with `node` against the resolved diff base.

## Timebox

0.5 workday. If this requires changing `jscpd.config.json`, touching app/admin page source, UI behavior/runtime/DB/lockfile, skipping jscpd, weakening tests or sharing another worker's `node_modules`, stop and report `BLOCKED`.

## Spec 类型

cleanup

## 触碰模块/文件

  - 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `.github/workflows/ci.yml`
  - `scripts/guards/jscpd-regression.mjs`
  - `scripts/tests/jscpd-regression.test.mjs`
  - `docs/specs/M7-UI-96C-jscpd-regression-guard.md`
  - `docs/evidence/M7/M7-UI-96C-jscpd-regression-guard.md`
  - `docs/evidence/M7/README.md`
- Unlisted modules are out of scope.

## Change Budget And Path Classification

- source changed files: <= 1
- source net LOC: <= 330
- new source files: <= 1
- test files changed/added: <= 1
- docs changed/added: <= 3
- config files changed: <= 1
- generated/lock/app-admin-page-source/UI/runtime/API/DB/worker/cron/package-json/package-lock: 0
- external API/SDK/provider/connector/adapter basis: none.
- exceptions: none.

```yaml
source:
  - scripts/guards/jscpd-regression.mjs
test:
  - scripts/tests/jscpd-regression.test.mjs
docs:
  - docs/specs/M7-UI-96C-jscpd-regression-guard.md
  - docs/evidence/M7/M7-UI-96C-jscpd-regression-guard.md
  - docs/evidence/M7/README.md
config:
  - .github/workflows/ci.yml
generated: []
lock: []
```

## Required Reads And Search

Required reads before edits:

- `AGENTS.md`
- `package.json`
- `.github/workflows/ci.yml`
- `jscpd.config.json`
- existing guard/test patterns under `scripts/guards/` and `scripts/tests/`
- `docs/evidence/M7/README.md`
- adjacent M7-UI-95 spec/evidence.

Required search:

- `rg -n "jscpd|duplicate|clone|threshold" scripts .github package.json docs/specs docs/evidence`

Search conclusions:

- `package.json` had `npm run jscpd` as an absolute threshold-0 duplicate gate; 96C keeps it unchanged and does not add a `guard:jscpd-regression` alias.
- `.github/workflows/ci.yml` ran `npm run jscpd` in the core PR CI path after depcruise before 96C.
- `jscpd.config.json` had `threshold: 0`; this spec forbids changing that file.
- Existing evidence shows historical jscpd use as a strict zero-clone gate, but no baseline-aware comparison against a PR base.
- #239 / `codex/m7-ui-96a-stack-typecheck-cleanup` already handles the stack's prettier-ignore, typecheck and max-lines cleanup. 96C must not include any `apps/admin/**` diff.

## Worktree / Branch Preconditions

| Fact | Evidence |
|---|---|
| worker `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-96c-jscpd-regression-guard` |
| worker `git status --short --branch` | `## codex/m7-ui-96c-jscpd-regression-guard...origin/codex/m7-ui-96c-jscpd-regression-guard` before rebase |
| worker `git branch --show-current` | `codex/m7-ui-96c-jscpd-regression-guard` |
| stacked base | `origin/codex/m7-ui-96a-stack-typecheck-cleanup` at `fc30eb3b5559e9366a8ae62f04fa1223840b6c9a` |
| previous #240 remote head before rebase | `6e4ce891b50f7c5ae461ba8d6e83417f4710724e` |
| forbidden dirty worktree | `/Users/atilla/.codex/worktrees/m7-ui-96a-stack-typecheck-cleanup` |

## Functional Contract

- Add `scripts/guards/jscpd-regression.mjs`.
- The guard supports `--base <ref>` and optional `--root <path>`.
- The guard resolves `--base` to a commit and creates a temporary detached git worktree for that base.
- The guard runs jscpd against `apps packages scripts` for both base and head with the current jscpd config semantics and JSON reporter output.
- The guard may override only the CLI threshold while collecting JSON so pre-existing base clones do not prevent metric parsing; the final gate remains the regression comparison.
- The guard fails closed if base cannot be resolved, jscpd cannot run, JSON cannot be parsed, required files are missing, temp worktree creation fails, or temp cleanup fails.
- The guard fails if head is greater than base for any of:
  - clone count
  - duplicated line count
  - duplicated line percentage
  - duplicated token count
  - duplicated token percentage
- The guard passes when every duplicate metric is less than or equal to base and prints both summaries.
- CI uses `node scripts/guards/jscpd-regression.mjs --base "$JSCPD_REGRESSION_BASE"` in the core path.
- CI must not run M5R true integration closeout solely because this narrow
  guard PR changes unrelated `.github/workflows/ci.yml` lines.
- M5R true integration closeout still triggers when its test/spec/evidence paths
  change, when workflow anchors for the M5R closeout step are missing, or when
  the workflow diff overlaps the actual M5R true closeout step region.
- 96C intentionally avoids any `package.json` diff so this narrow CI guard PR does not trigger `run_true_db_smoke=true` solely because a helper script alias was added.
- `jscpd.config.json` remains unchanged and `npm run jscpd` remains available as an absolute whole-repo debt check.

## Pass Conditions

- Focused parser/comparator tests pass and include a controlled failure-path test for metric worsening.
- Local guard against `origin/codex/m7-ui-96a-stack-typecheck-cleanup` passes on this branch if it does not worsen duplicate metrics.
- Local CI path-scope smoke proves this PR's jscpd/workflow diff keeps
  `workflow_m5r_true_db_closeout_changed=false` while preserving direct M5R
  test/spec/evidence triggers and fail-closed missing-anchor behavior.
- Validation commands from the task pass or are recorded honestly:
  - `npm run format:check`
  - `npm run guard:prettier-ignore -- --base origin/codex/m7-ui-96a-stack-typecheck-cleanup`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run depcruise`
  - focused guard tests and `npm test` if feasible
  - `node scripts/guards/jscpd-regression.mjs --base origin/codex/m7-ui-96a-stack-typecheck-cleanup`
  - `npm run guard:pr-shape -- --base origin/codex/m7-ui-96a-stack-typecheck-cleanup --spec docs/specs/M7-UI-96C-jscpd-regression-guard.md --include-worktree`
  - `git diff --check origin/codex/m7-ui-96a-stack-typecheck-cleanup...HEAD`
  - `npm run build:admin` if reasonable.
- Diff versus `origin/codex/m7-ui-96a-stack-typecheck-cleanup` contains exactly the six allowed files and no `package.json` or `apps/admin/**` paths.
- No `package.json`, lockfile, app/admin page source, UI/runtime/API/DB or dirty worktree changes.
- PR #240 targets `codex/m7-ui-96a-stack-typecheck-cleanup`.

## Non-Goals

- No whole-repo duplicate cleanup.
- No `jscpd.config.json` threshold/config change.
- No CI skip, no unconditional pass, no deletion of duplicate-producing tests to appease CI.
- No app/admin page source changes, UI behavior changes, UI tests, backend/API, DB/schema/migration, lockfile, generated files, real customer/order data, production/staging operations, owner visual acceptance or release approval.

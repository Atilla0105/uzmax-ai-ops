# M7-07 PR Shape QuotePath Fix

## 目标

Fix `guard:pr-shape` so CI default Git output handles non-ASCII filenames without requiring every caller to set `core.quotePath=false`.

This slice targets the PR #164 / M7-05 CI failure where an allowed Chinese root document path was reported as an escaped quoted path such as `"UZMAX\\346...v1.1.md"` and then treated as out of scope.

## Owner

Owner: project owner confirms this is a guard/tooling fix only. AI agent executes the narrow fix, adds focused regression coverage or documents why not, records validation evidence, and does not make release, production, customer-data, LLM-key, cost or compliance decisions.

Owner confirmation points:

- The CI-facing default command remains `npm run guard:pr-shape -- --base origin/main`.
- The guard should own Git path decoding for its own `git diff --name-only` calls.
- This fix does not change M7-05 scope, UI implementation, prototype files, lockfiles or CI workflow.

## 时间盒

0.25 个工作日. If the fix requires broad guard semantics, CI workflow edits, lockfile changes, or touching M7-05/admin/prototype branches, stop and report a blocker instead of widening the slice.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `scripts/guards/pr-shape/git.mjs`
  - `scripts/tests/guards.test.mjs`
  - `docs/specs/M7-07-pr-shape-quote-path.md`
  - `docs/evidence/M7/M7-07-pr-shape-quote-path.md`
  - `docs/incidents/INC-2026-07-03-m7-07-root-patch-target.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：Only the pr-shape Git helper, focused guard test, spec, evidence and the required write-boundary incident record are in scope.
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1, net source LOC <= 40, new source files <= 0.
- test/generated/lock/config/docs 预计变更：one focused script test update; spec/evidence/incident docs; no generated, lock or config changes.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：no new source file. `rg -n "pr-shape|quotePath|中文|name-only" scripts/tests scripts/guards package.json .github docs/specs/M0-07-guard-script-hardening.md docs/specs/M3-15-nonascii-prettier-guard-entrypoint.md` found the existing pr-shape helper at `scripts/guards/pr-shape/git.mjs` and existing guard harness at `scripts/tests/guards.test.mjs`.
- 外部 API/SDK/provider/connector/adapter 依据：无. No external API, SDK, provider, connector or adapter is introduced.
- 是否需要例外：无.

## 文档触发检查

- 结果：updated.
- 判断依据：this slice creates its own spec and evidence because it changes governance tooling behavior. The incident file is required by `docs/incidents/README.md` after a root checkout write-boundary mistake during this worker run.
- 备注：No release, environment, observability, eval, contract, runbook or API documentation category is newly triggered.

## 前置条件

- Read before edits: `AGENTS.md`, `docs/specs/SPEC-template.md`, `scripts/guards/pr-shape.mjs`, `scripts/guards/pr-shape/git.mjs`, `scripts/guards/pr-shape/cli.mjs`, and related guard/test search results.
- Worktree / branch:
  - Expected physical worktree: `/Users/atilla/.codex/worktrees/m7-07-pr-shape-quote-path/UZMAX智能运营`
  - Expected branch: `codex/m7-07-pr-shape-quote-path`
  - Forbidden checkout for writes: `/Users/atilla/Applications/UZMAX智能运营`
  - Opening `pwd`: `/Users/atilla/.codex/worktrees/m7-07-pr-shape-quote-path/UZMAX智能运营`
  - Opening `git status --short --branch`: `## codex/m7-07-pr-shape-quote-path`
  - Opening `git branch --show-current`: `codex/m7-07-pr-shape-quote-path`
- 并发派发证据：single worker for this guard/tooling slice. CI/guard script changes are globally serial with other CI/guard script edits.
- 事故触发器：if any write lands outside the assigned worktree, if this branch touches M7-05/M7-UI/admin/prototype/lockfile/CI workflow files, or if the guard fix requires bypassing PR hygiene, stop and create or reference `docs/incidents/`.

## 实施步骤

1. Add a focused regression in the existing pr-shape guard test harness using a disposable temp Git repo with `core.quotePath=true` and a Chinese filename allowed by the spec touch list.
2. Verify the regression fails before implementation because bare Git path output is quoted/escaped and misclassified as out of scope.
3. Update `scripts/guards/pr-shape/git.mjs` so the guard-owned Git calls that read diff path data run with `-c core.quotePath=false`.
4. Run focused test, guard validation, `git diff --check`, and record evidence.

## 通过条件

- Focused regression demonstrates the non-ASCII path case and passes after the helper fix.
- `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M7-07-pr-shape-quote-path.md --include-worktree` passes in the assigned worktree.
- `git diff --check` passes.
- The fix is local to the guard helper and does not require per-caller Git config.
- Root checkout is clean after the accidental root patch target is removed.

## 失败分支

- If Git path decoding cannot be fixed locally in the helper, stop and propose a narrower follow-up ADR/spec for shared Git command handling.
- If no suitable focused test harness exists, document that and provide disposable temp repo reproduction evidence instead.
- If the branch needs CI workflow, lockfile, admin UI, raw prototype or M7-05 branch changes, stop and report the blocker.

## 不做什么

- Do not touch M7-05 branch or M7-UI preflight branches.
- Do not modify `apps/admin/**`, `packages/ui-tokens/**`, lockfiles, CI workflow, README or raw prototype files.
- Do not change PR-shape budgets, path classification semantics, PR metadata parsing or spec touch-list syntax.
- Do not commit, push, merge or open a PR from this worker.

## 验收映射

- K-03/K-04: one spec / one branch / guard validation hygiene.
- M7 tooling hygiene: keep M7 UI/docs branches unblocked by Git quotePath path encoding without loosening scope checks.

## Closeout / Incident 记录

- Incident: `docs/incidents/INC-2026-07-03-m7-07-root-patch-target.md` records the accidental root checkout patch target during this worker run and its cleanup. No secret/customer data or production boundary was involved.

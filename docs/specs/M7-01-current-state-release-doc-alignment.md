# M7-01 Current State Release Doc Alignment

## 目标

Align stale current-state entrypoints, release/evidence summaries, admin release-gate contract and focused tests to the current repo truth: M6/M6B is closed as an evidence/runtime-hardening no-go package; M6B-17 cleared the external-input blocker class; GA-0, production, real customer/order data, customer LLM and 1.0 release remain locked.

## Owner

Owner: project owner authorizes this cleanup/alignment from the current-state audit. AI agent updates docs/code/tests, keeps evidence historical where appropriate, and must not make release, production, customer-data, LLM-key, cost or compliance decisions.

## 时间盒

0.5 个工作日. If alignment requires production/platform mutation, broad product-scope changes, DB/runtime behavior changes, new release approval, or unresolved source-of-truth conflict, stop and record the blocker instead of widening this PR.

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `README.md`
  - `UZMAX智能运营系统-技术架构-v1.1.md`
  - `"UZMAX\346\231\272\350\203\275\350\277\220\350\220\245\347\263\273\347\273\237-\346\212\200\346\234\257\346\236\266\346\236\204-v1.1.md"`
  - `apps/admin/src/releaseGateContracts.ts`
  - `apps/admin/tests/m6-release-gate-console.spec.ts`
  - `scripts/tests/m6-release-gate-console.test.mjs`
  - `scripts/tests/m6-backup-restore-asset-safety.test.mjs`
  - `scripts/tests/m6-final-acceptance-rollup.test.mjs`
  - `docs/specs/M7-01-current-state-release-doc-alignment.md`
  - `docs/release.md`
  - `docs/doc-gates.md`
  - `docs/evidence/README.md`
  - `docs/evidence/M6/README.md`
  - `docs/evidence/M6/M6-08-backup-restore-asset-safety.md`
  - `docs/evidence/M6/M6-09-final-acceptance-rollup.md`
  - `docs/preflight/README.md`
  - `docs/preflight/00-opening-control-matrix.md`
  - `docs/preflight/03-infrastructure-provisioning.md`
  - `docs/runbooks/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：This slice changes current-state wording and tests only. It does not delete historical evidence and does not create a new runtime capability.
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1, net source LOC <= 80, new source files <= 0.
- test/generated/lock/config/docs 预计变更：focused test assertion updates; docs/spec/release/evidence/readme wording updates; no generated/lock/config changes.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：no new source file. `rg` found the existing admin release gate contract in `apps/admin/src/releaseGateContracts.ts`, so this slice updates it in place.
- 外部 API/SDK/provider/connector/adapter 依据：无. No new external API, SDK, provider, connector or adapter behavior is introduced.
- 是否需要例外：无.

## 文档触发检查

- 结果：`updated`.
- 判断依据：`docs/doc-gates.md`. This slice updates existing docs that were already triggered by release, contracts/evals and evidence-index growth. No new doc category is required.
- 备注：`guard:doc-triggers` currently hard-checks evals/contracts doc presence only; release/environment/observability rows remain governance/manual unless later guard scope expands.

## 前置条件

- Current source-of-truth docs and evidence must be reread before editing: `AGENTS.md`, four v1.1 root docs, `docs/release.md`, `docs/evidence/M6/README.md`, `docs/evidence/M6B/README.md`, `docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md`, current admin release gate contract and related focused tests.
- Worktree / branch: expected physical worktree `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-current-state-release-doc-alignment`, branch `codex/current-state-release-doc-alignment`. Do not write in root/main checkout `/Users/atilla/Applications/UZMAX智能运营`.
- Start audit before edits:
  - `pwd`: `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-current-state-release-doc-alignment`
  - `git status --short --branch`: `## codex/current-state-release-doc-alignment`
  - `git branch --show-current`: `codex/current-state-release-doc-alignment`
  - root/main checkout: `/Users/atilla/Applications/UZMAX智能运营`, `## main...origin/main`
  - open PR audit: GitHub API returned `count=0`
  - root no-merged branch audit: no output before this worktree was created
- 并发派发证据：single worker only. This slice touches release-facing docs/admin contract/tests, so it must be serial with other release/current-state/doc-gate/admin-gate edits. No DB schema, migrations, lockfile, shared config, CI/guard script or generated artifacts are changed.
- 事故触发器：if any write lands outside the assigned worktree, if tests are weakened instead of updated to current truth, if release approval wording appears, or if secret/customer data enters docs, stop and create or update `docs/incidents/`.

## 实施步骤

1. Rewrite root `README.md` current stage to point to current status, release boundary, and actual validation entrypoints.
2. Update `docs/release.md`, `docs/evidence/M6/README.md`, M6-08 and M6-09 evidence to mark old J-01/J-03 blocker statements as historical/superseded by M6B-17 for external-input closure, while preserving remaining non-external release gaps.
3. Add a small owner-authorized errata note in the technical architecture around the M6-before full eval target, preserving G-06 as a release gate when M6 closes no-go.
4. Update doc-gate, evidence, preflight and runbook indexes so current/future agents know which docs are historical, current, manual governance or future branch.
5. Update the admin release gate contract and focused tests to display M6 closed / external-input blockers cleared / GA-0 locked.
6. Run focused tests and grep for stale contradictory phrases.

## 通过条件

- Root README no longer describes the project as Gate 0/M0 empty skeleton or admin as minimal Vite skeleton.
- Admin release-gate contract and Playwright/unit tests no longer show M6 as `In progress`; they show M6 closed as evidence/runtime-hardening and GA-0/1.0 locked.
- `docs/release.md`, `docs/evidence/M6/README.md`, M6-08 and M6-09 clearly distinguish historical no-go snapshots from current M6B-17 external-input closure.
- The technical architecture records an explicit errata that the G-06 full eval target remains a GA-0/1.0 release gate when M6 closes as no-go, instead of blocking all later alignment work on the old "M6 前" timestamp.
- `docs/doc-gates.md`, `docs/evidence/README.md`, preflight indexes and runbook index are updated enough to prevent stale current-state reading.
- Focused tests pass and no grep-visible stale current-state contradiction remains in the touched surfaces.

## 失败分支

- If source-of-truth docs conflict in a way this slice cannot resolve: stop and propose a separate ADR/errata spec.
- If admin gate changes require broader UI redesign: keep GA-0 locked and open a later M7 UI slice instead.
- If tests fail because they intentionally encode the old state: update assertions to the current evidence rather than deleting or weakening coverage.
- If a path outside the touch list must change: stop and either narrow the implementation or create a follow-up spec.

## 不做什么

- Do not approve GA-0, production, real customer/order data, customer LLM, real provider calls, production Bot token/webhook secret, external SaaS onboarding, P1/P2 risk acceptance or 1.0 release.
- Do not delete historical M6/M6B evidence.
- Do not change API, DB, worker, cron, runtime deployment, secrets, lockfiles, generated files, CI workflows or guard implementation.
- Do not broaden Impeccable/design work beyond the release-gate state text in existing admin contract/tests.

## 验收映射

- J-01/J-03/J-04/J-05: release evidence and runbook/current-state alignment without reopening cleared external-input blockers.
- L-01/L-02: GA-0 remains locked and owner decision remains required.
- K-03/K-04: one spec / one branch / serial release-facing doc/admin-gate update.

## Closeout / Incident 记录

- Incident expectation: none. If this slice creates or discovers a write-boundary/gate/secret incident, record it under `docs/incidents/`.

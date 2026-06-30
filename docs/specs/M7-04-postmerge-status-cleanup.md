# M7-04 Post-Merge Status Cleanup

## Goal

Align M7 documentation with the post-merge truth after M7-03 became the visual-system standard and was merged into local `main`.

This slice fixes stale status wording only. It does not change the visual standard, admin source code, tokens, release gates or acceptance state.

## Owner Confirmation Points

- M7-03 remains the higher-priority visual-system standard.
- M7-02 remains cleaned/superseded and must not be maintained as a parallel standard.
- I-05 remains open until token implementation, `/design` living spec, lint and visual-regression evidence exist.

## AI Agent Responsibilities

- Update M7 queue/status wording to match the current repository truth.
- Replace branch-centric M7-03 follow-up wording with `main` / `M7-UI-*` follow-up wording.
- Preserve the source-of-truth hierarchy and release boundaries.
- Verify docs-only PR shape and whitespace.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-04-postmerge-status-cleanup.md`
  - `docs/evidence/M7/README.md`
  - `docs/evidence/M7/M7-03-admin-design-system-from-prototype.md`
  - `docs/evidence/M7/M7-04-postmerge-status-cleanup.md`
- 未列出的模块默认不可改。

## Change Budget

- Source files changed: 0
- Source net LOC: 0
- New source files: 0
- Docs files changed: <= 4

## Required Changes

1. Mark M7-03 as merged to local `main` in the M7 evidence index.
2. Mark M7-00 consistently with its already-merged design-layer baseline status if the index uses merge-state tokens.
3. Update M7-03 evidence so future visual-system work proceeds from `main` with new `M7-UI-*` specs, not from the now-merged worker branch.
4. Record this cleanup evidence without implying GA-0, production, real customer/order-data, customer LLM, Telegram Business automatic reply or 1.0 approval.

## Pass Conditions

- No tracked M7-02 spec/evidence/design-standard file exists.
- M7-03 is consistently described as the current visual-system standard source.
- No text tells future work to continue from `codex/m7-03-admin-design-system`.
- `node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-04-postmerge-status-cleanup.md --include-worktree` passes after the branch is pushed or the base is otherwise available locally.
- `git diff --check` passes.

## Failure Branch

If remote `main` still does not include M7-03 because branch protection requires PR flow, this cleanup may ride in the same PR branch as M7-03. In that case the evidence must say local `main` has M7-03 and remote `main` is pending PR merge.

## Out Of Scope

- No admin UI source changes.
- No token implementation or alias migration.
- No `/design` route.
- No Impeccable detector debt fix.
- No I-05 closure.
- No release, production, customer LLM, real traffic or owner acceptance approval.

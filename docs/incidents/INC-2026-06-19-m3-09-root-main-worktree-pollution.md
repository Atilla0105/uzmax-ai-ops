# INC-2026-06-19 M3-09 Root Main Worktree Pollution

> incident_id: INC-2026-06-19-m3-09-root-main-worktree-pollution
> milestone: M3
> status: institutionalized_in_docs
> institutionalized_status: institutionalized_in_docs
> detected_at: 2026-06-19
> spec: `docs/specs/M3-09-admin-knowledge-eval-shell-if-needed.md`
> evidence: `docs/evidence/M3/M3-09-admin-knowledge-eval-shell-if-needed.md`

## 发生了什么

During M3-09 implementation, the worker used a relative `apply_patch` operation while intending to edit `/Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed`. The patch instead wrote M3-09 changes into the root/main checkout at `/Users/atilla/Documents/UZMAX智能运营` on branch `main`.

Affected root/main paths before cleanup:

- `apps/admin/src/App.tsx`
- `apps/admin/tests/design.spec.ts`
- `docs/evidence/M3/README.md`
- `apps/admin/src/M3KnowledgeEvalShell.tsx`
- `apps/admin/src/m3-knowledge-eval-shell.css`
- `docs/evidence/M3/M3-09-admin-knowledge-eval-shell-if-needed.md`
- `docs/specs/M3-09-admin-knowledge-eval-shell-if-needed.md`

The worker stopped before commit, push or PR creation and reported the issue.

## 影响

Actual impact was limited to uncommitted root/main working tree pollution. The root/main checkout briefly carried M3-09 implementation files and edits that belonged only in the assigned linked worktree.

Potential impact was serious for delivery governance: root/main could have become a hidden implementation workspace, invalidating workspace isolation evidence, branch-specific PR hygiene, and one worker / one worktree / one branch discipline.

No secret, customer data, raw sample, Telegram payload, screenshot, voice transcript, order, phone, address, payment data, support personal account, raw prompt or raw completion was introduced by the polluted files.

## 根因 / 未知

Confirmed root cause: the worker used relative `apply_patch` without a worktree-bound path. The patch tool applied relative paths from the root/main checkout context, not the assigned worker checkout.

Structural failure mode: a worker can satisfy shell `workdir` checks and still write through a path-agnostic edit tool unless edits are absolute-path-bound or performed through `git -C <assigned-worktree>` operations.

This is an M3 repeat-class process accident because it is another workspace-isolation failure mode inside the same milestone. It is not acceptable as harmless churn.

Unknown from repo evidence: the patch tool's internal current directory is not represented in git metadata, so the exact tool-level path resolution cannot be proven beyond the observed root/main diff.

## 检测

The worker detected the mismatch after `wc` in the assigned worktree could not find the newly created files. A dual status check then showed:

- root/main `/Users/atilla/Documents/UZMAX智能运营`: modified and untracked M3-09 files on `main`;
- assigned worktree `/Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed`: clean on `codex/m3-09-admin-knowledge-eval-shell-if-needed`.

The worker stopped and reported before any commit, push or PR.

## 清理

Coordinator cleanup completed before this incident file was authored:

- polluted tracked diff was sealed at `/tmp/uzmax-m3-09-root-pollution.t5hQeY/tracked.patch`;
- polluted untracked files were sealed at `/tmp/uzmax-m3-09-root-pollution.t5hQeY/untracked.tgz`;
- root/main was cleaned and rechecked clean: `/Users/atilla/Documents/UZMAX智能运营` -> `## main...origin/main`;
- assigned worktree was rechecked clean before restoration: `/Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed` -> `## codex/m3-09-admin-knowledge-eval-shell-if-needed`.

The sealed changes were then restored only into the assigned worktree by:

- `git -C /Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed apply /tmp/uzmax-m3-09-root-pollution.t5hQeY/tracked.patch`
- `tar -C /Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed -xzf /tmp/uzmax-m3-09-root-pollution.t5hQeY/untracked.tgz`

Immediate dual status after restoration:

- assigned worktree showed only the intended M3-09 dirty files on `codex/m3-09-admin-knowledge-eval-shell-if-needed`;
- root/main remained clean at `## main...origin/main`.

## 永久控制

Controls effective for the remainder of M3-09:

- All M3-09 edits must target `/Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed` using absolute paths or `git -C /Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed`.
- Relative-path `apply_patch` is prohibited for the remainder of this worker task.
- After any migration, archive restore, large edit, formatting write or generated write, run both:
  - `git -C /Users/atilla/Documents/uzmax-m3-09-admin-knowledge-eval-shell-if-needed status --short --branch`
  - `git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch`
- M3-09 evidence and PR Hygiene must record this incident, the sealed artifact paths, root cleanup, dual status checks and these controls.

Potential follow-up control:

- After M3-09 merge, M3 closeout should decide whether a broader guard/runbook/spec is needed to prevent path-agnostic edit tools from writing into root/main during linked-worktree worker tasks.

## Institutionalized 状态

`institutionalized_in_docs`

This incident is institutionalized for M3-09 because PR #47 merged this file, the M3-09 spec touch list and M3-09 evidence/PR Hygiene into `main` on 2026-06-19.

M3-10 records the broader follow-up decision: because M3-09 repeated the M3-07 path-agnostic edit failure class, a future governance/guard/runbook spec is recommended before another broad parallel milestone if the project owner wants stronger machine prevention. Existing M2 `guard:workspace` plus incident docs are enough to detect dirty root/main state and require stop/report behavior, but they do not technically bind edit-tool targets to the assigned worktree. M3-10 does not implement that guard because it is docs-only and outside its allowed touch list.

## 证据链接

- Spec: `docs/specs/M3-09-admin-knowledge-eval-shell-if-needed.md`
- Evidence: `docs/evidence/M3/M3-09-admin-knowledge-eval-shell-if-needed.md`
- Merged PR: https://github.com/Atilla0105/uzmax-ai-ops/pull/47
- M3-10 no-go rollup: `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
- Sealed tracked patch: `/tmp/uzmax-m3-09-root-pollution.t5hQeY/tracked.patch`
- Sealed untracked archive: `/tmp/uzmax-m3-09-root-pollution.t5hQeY/untracked.tgz`

## Owner / AI 边界

AI agent responsibilities: detect, stop, report, avoid further wrong-checkout writes, record this incident, preserve evidence paths, restore only into the assigned worktree, validate root/main cleanliness and propose durable controls.

Project owner responsibilities: decide final risk acceptance, whether this incident blocks merge, whether broader guard/runbook work should become a later spec, and all release, customer-data, account, cost and compliance decisions.

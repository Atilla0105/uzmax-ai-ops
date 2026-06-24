# INC-2026-06-24 M5-04 Root Patch Target

## 发生了什么

During M5-04 implementation on 2026-06-24, the worker verified the assigned path `/Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin` and branch `codex/m5-04-confirmation-queue-admin`, but the first `apply_patch` invocation used the tool's default working directory and wrote this worker's M5-04 docs/source/test patch into the root/main checkout `/Users/atilla/Documents/UZMAX智能运营`.

The misplaced root changes were detected immediately when `wc` in the assigned worktree could not find the newly added files and `git status` in root showed the M5-04 files as modified/untracked.

## 影响

- Root/main temporarily contained this worker's M5-04 uncommitted changes.
- The assigned worktree remained clean until the diff was mechanically transferred.
- No commit, PR, production state, DB/runtime state, secret, real customer/order data, raw payload, screenshot, transcript, prompt/completion or external call was involved.
- Root/main was returned to clean `## main...origin/main` state after cleanup.

## 根因 / 未知

- Confirmed root cause: the patch tool target directory did not match the verified assigned worktree.
- Structural failure mode: relying on the tool default cwd after a worktree verification can bypass the worker's intended assigned path.
- Unknown: no repo evidence proves why the tool default cwd remained root; the durable lesson is to run future patches from inside the assigned path.

## 检测

- `wc -l ...` in `/Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin` reported the new M5-04 files missing.
- Root `git status --short --branch` showed M5-04 modifications/untracked files in `/Users/atilla/Documents/UZMAX智能运营`.

## 清理

- The tracked root diff for `apps/admin/src/App.tsx`, `apps/admin/tests/design.spec.ts` and `docs/evidence/M5/README.md` was captured and applied to the assigned worktree.
- The untracked root M5-04 files were copied to the assigned worktree.
- The tracked root diff was reversed and the untracked root M5-04 files were removed.
- Post-cleanup root status: `## main...origin/main` with no changed files.
- Post-transfer assigned status contains the M5-04 files only on `codex/m5-04-confirmation-queue-admin`.

## 永久控制

- For this slice, all remaining patches must be invoked from `/Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin` using the local `apply_patch` executable or another command whose `workdir` is explicitly the assigned worktree.
- Existing repo guard `guard:worker-boundary -- --assigned /Users/atilla/Documents/uzmax-m5-04-confirmation-queue-admin --root /Users/atilla/Documents/UZMAX智能运营` remains required before completion.
- No new guard script is added in M5-04 because config/guard files are outside this spec's scope.

## Institutionalized 状态

pending_merge

## 证据链接

- Spec: `docs/specs/M5-04-confirmation-queue-admin.md`
- Evidence: `docs/evidence/M5/M5-04-confirmation-queue-admin.md`
- Cleanup command recorded in worker transcript: root diff transfer, reverse apply, untracked root file removal, and root/assigned status recheck.

## Owner / AI 边界

AI agent is responsible for recording the incident, cleaning only its own misplaced changes, preserving root/main cleanliness, and keeping validation honest. Project owner remains the final decision-maker for risk acceptance, release, real data/accounts, cost and compliance.

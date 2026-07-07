# INC-2026-07-07 M8-01 Root Patch Target

Status: `pending_merge`
Related spec: `docs/specs/M8-01-bot-runtime-answer-loop-v0.md`

## What Happened

During M8-01 setup, the coordinator used `apply_patch` without an explicit worktree target and created `docs/specs/M8-01-bot-runtime-answer-loop-v0.md` in the root/main checkout at `/Users/atilla/Applications/UZMAX智能运营` instead of the assigned M8-01 worktree at `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-bot-runtime-answer-loop-v0`.

The root status showed:

```text
## main...origin/main
?? docs/specs/M8-01-bot-runtime-answer-loop-v0.md
```

## Impact

- A file was written outside the assigned worker worktree.
- The file was untracked and not committed on `main`.
- No generated files, secrets, customer data, raw Telegram payloads or production configuration were involved.
- Delivery confidence was affected because the same root-patch-target failure pattern has prior incidents.

## Detection

The coordinator detected the mismatch while checking both the M8-01 worktree and root/main status after stopping a stuck worker.

## Cleanup

- The root/main untracked spec file was removed by the same corrective patch that added this incident.
- The M8-01 spec was re-added under the assigned worktree path.
- Root/main cleanliness must be rechecked before implementation resumes and before merge.

## Root Cause

The patch tool target defaults to the thread/root checkout when no worktree-specific path is provided. The coordinator failed to use an absolute assigned-worktree path for a manual patch in a multi-worktree task.

## Permanent Control

- For all remaining M8 work, manual `apply_patch` edits must use absolute paths rooted in the assigned worktree.
- Before each edit batch, run `pwd`, `git status --short --branch` and `git branch --show-current` in the intended worktree.
- After each edit batch, check root/main status until this slice is merged and the worktree is removed.

## Owner / AI Boundary

AI is responsible for cleanup, incident recording and preventing repeat root writes. Project owner remains responsible for final risk acceptance, release decisions, real customer data, real Telegram credentials, real LLM keys, cost and compliance.

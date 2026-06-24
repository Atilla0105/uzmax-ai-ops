# INC-2026-06-24 M5-05 Root Patch Target

## Summary

During M5-05 AI member console kickoff, the delegated worker produced initial M5-05 docs/source files in the root/main checkout `/Users/atilla/Documents/UZMAX智能运营` instead of the assigned worker checkout `/Users/atilla/Documents/uzmax-m5-05-ai-member-console`.

## Impact

Root/main briefly showed modified `apps/admin/src/App.tsx`, modified `docs/evidence/M5/README.md`, and untracked M5-05 docs/source files. The changes were detected before validation, commit, PR creation, merge, secrets handling, production interaction, or any real customer/order data handling.

## Detection

Coordinator checked root/main with `git status --short --branch` while the assigned M5-05 worktree was still clean. The root/main status showed only M5-05 paths.

## Cleanup

The coordinator copied the M5-05 patch into the assigned worktree, reversed the tracked root/main diff with a reverse patch, removed the untracked root/main M5-05 files, and rechecked root/main as `## main...origin/main`.

## Root Cause

Tool cwd targeting drift in the delegated worker run. The worker was closed and the coordinator took over M5-05 in the assigned worktree.

## Permanent Control

Continue using explicit assigned paths for M5 work, run root/main status checks before and after worker handoff, and require worker-boundary validation before M5-05 PR closeout.

## Institutionalized

Recorded in the M5-05 spec and evidence. M5-08 closeout should include this incident in the milestone incident inventory.

# INC-2026-06-24 M5-07 Root Patch Target

## Summary

During M5-07 template center startup on 2026-06-24, a delegated worker wrote the initial M5-07 spec/evidence/M5 index patch into the root/main checkout instead of the assigned worktree. During coordinator validation, the worker-boundary guard also detected transient tracked deletions in root/main for `apps/admin/tests/design.spec.ts`, `apps/admin/src/App.tsx` and `docs/evidence/M5/README.md`; the latter two appeared with same-content `App 2.tsx` and `README 2.md` conflict copies.

## Impact

Tracked root/main files were dirtied and two untracked M5-07 docs were created in root/main. Later, three tracked root files were transiently deleted and restored from Git before commit or PR; two same-content conflict copies were removed after hash comparison against root HEAD. No source implementation, validation, commit, PR, secret, customer data or production/runtime file was involved in root/main.

## Detection

The coordinator checked `/Users/atilla/Documents/UZMAX智能运营` and found:

- `docs/evidence/M5/README.md` modified;
- `docs/specs/M5-07-template-center.md` untracked;
- `docs/evidence/M5/M5-07-template-center.md` untracked.
- Later worker-boundary output found `D apps/admin/tests/design.spec.ts` in root/main.
- Later worker-boundary output found `D apps/admin/src/App.tsx`, `D docs/evidence/M5/README.md`, `apps/admin/src/App 2.tsx` and `docs/evidence/M5/README 2.md` in root/main.

## Cleanup

The coordinator copied the three M5-07 docs into `/Users/atilla/Documents/uzmax-m5-07-template-center`, restored root `docs/evidence/M5/README.md`, removed the untracked root M5-07 docs, restored root `apps/admin/tests/design.spec.ts`, restored root `apps/admin/src/App.tsx` and `docs/evidence/M5/README.md`, removed the same-content conflict copies, and confirmed root/main returned to `## main...origin/main`.

## Cause

The worker used patching without an assigned-worktree working directory. The runtime applied the patch relative to the root/main checkout.

## Permanent Control

For the remainder of M5-07, implementation and validation are coordinator-owned in the assigned worktree. The incident is part of the M5-07 spec allowlist and must be included in M5-08 closeout incident inventory.

## Owner / AI Boundary

This is an AI process incident. It does not require project owner scope, release, real data, account, cost or compliance decisions.

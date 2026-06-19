# Worker Worktree Boundary Runbook

## Purpose

Use this runbook for M3 signoff前治理 and before opening M4 or any real customer/order-data work to prevent and detect writes outside the assigned worker worktree.

Runtime/harness controls are responsible for prevention: sandbox roots, tool configuration, absolute assigned paths, and command cwd binding. The in-repo guard is forensic and preflight evidence: it can detect assigned path mismatch and dirty root/main checkout state, but it cannot stop every path-agnostic or absolute-path edit tool by itself.

## Required Preflight

From the assigned worker worktree:

```bash
pwd
git status --short --branch
git branch --show-current
git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch
UZMAX_ASSIGNED_WORKTREE=/absolute/assigned/worktree \
  UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 \
  npm run guard:worker-boundary
```

Expected local result:

```text
worker-write-boundary: ok (<branch>, <assigned-worktree>)
```

CI result may be limited:

```text
worker-write-boundary: CI mode physical multi-worktree/root-main enforcement limited/skipped
```

That CI message is acceptable because CI does not have the developer machine's full local multi-worktree topology. It is not runtime jail evidence.

## During Work

- Use absolute assigned paths for edit tools when tool-level cwd is uncertain.
- After large edits, formatter writes, archive restores, generated writes, or failed commands, run worker/root dual status checks.
- Do not write into root/main checkout or another worker worktree.
- Do not use this guard as proof that absolute-path tools were technically jailed.

## Failure Response

If `guard:worker-boundary` fails:

1. Stop edits immediately.
2. Record the failed command output.
3. Run:

```bash
git status --short --branch
git -C /Users/atilla/Documents/UZMAX智能运营 status --short --branch
```

4. If root/main is dirty, do not clean it from the worker branch unless explicitly assigned a cleanup spec. Report impact scope and enter incident/cleanup handling.
5. Resume only after assigned worktree, branch, and root/main cleanliness are re-established and recorded.

## Evidence To Archive

- Assigned worktree path and branch.
- Root/main path and status.
- `guard:worker-boundary` output.
- Whether prevention was provided by runtime/harness jail or by operator discipline with absolute assigned paths.
- Any limited/skipped CI wording, if CI lacks local worktree topology.

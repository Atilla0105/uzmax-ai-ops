# M7-07 PR Shape QuotePath Evidence

## Scope

Worker: M7-07 `guard:pr-shape` quotePath fix.

Assigned worktree: `/Users/atilla/.codex/worktrees/m7-07-pr-shape-quote-path/UZMAX智能运营`

Assigned branch: `codex/m7-07-pr-shape-quote-path`

This is a guard/tooling fix. It does not change M7-05 scope, admin UI, ui tokens, lockfiles, CI workflow, README, raw prototype files, release state, production config, customer/order data, LLM keys or provider behavior.

## Opening Checks

Commands run before work:

```text
pwd
/Users/atilla/.codex/worktrees/m7-07-pr-shape-quote-path/UZMAX智能运营

git status --short --branch
## codex/m7-07-pr-shape-quote-path

git branch --show-current
codex/m7-07-pr-shape-quote-path
```

## CI Failure Summary

PR #164 / M7-05 failed at:

```text
npm run guard:pr-shape -- --base "origin/main"
```

The failure reported an out-of-scope root v1.1 document using Git's quoted escaped non-ASCII path form, for example:

```text
"UZMAX\\346...v1.1.md"
```

The coordinator could make the local command pass only by adding caller-side Git config:

```text
GIT_CONFIG_COUNT=1 ... core.quotePath=false
```

M7-07 fixes the guard helper so the CI default command does not require every caller to remember this config.

## Root Patch Target Incident

During this worker run, the first patch command used relative paths and landed in the root checkout instead of the assigned worktree. This was detected because the assigned-worktree focused test did not include the new test.

Impact and cleanup:

- Root checkout briefly had `M scripts/tests/guards.test.mjs` and `?? docs/specs/M7-07-pr-shape-quote-path.md`.
- The root diff was inspected and then reverted with an absolute-path patch.
- Root verification after cleanup:

```text
git status --short --branch
## main...origin/main
```

Incident record:

- `docs/incidents/INC-2026-07-03-m7-07-root-patch-target.md`

No commit, push, merge, PR, lockfile, CI workflow, app/admin, customer data, secret, production config or generated artifact was involved.

## Regression Evidence

Focused RED command:

```text
/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin/node --test --test-name-pattern "matches non-ASCII paths" scripts/tests/guards.test.mjs
```

RED result before implementation:

```text
exit 1
out-of-scope file: "UZMAX\346\231\272\350\203\275\350\277\220\350\220\245\347\263\273\347\273\237-PRD-v1.1.md"
tests 1, pass 0, fail 1
```

The regression creates a disposable temp Git repo, configures `core.quotePath=true`, writes `UZMAX智能运营系统-PRD-v1.1.md`, verifies bare `git diff --name-only main...HEAD` does not equal the UTF-8 filename and starts with `"`, then expects `guard:pr-shape` to pass because the spec touch list allows the real path.

Implementation:

- `scripts/guards/pr-shape/git.mjs` now invokes Git as:

```text
git -c core.quotePath=false ...
```

This applies to the guard-owned Git helper path reads, including `diff --name-only`, worktree diff, untracked `ls-files`, `name-status`, `numstat` and `readDiff`.

Focused GREEN command:

```text
/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin/node --test --test-name-pattern "matches non-ASCII paths" scripts/tests/guards.test.mjs
```

GREEN result:

```text
exit 0
tests 1, suites 1, pass 1, fail 0
```

Focused pr-shape group command:

```text
/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin/node --test --test-name-pattern "pr-shape guard" scripts/tests/guards.test.mjs
```

Result:

```text
exit 0
tests 13, suites 1, pass 13, fail 0
```

Full `scripts/tests/guards.test.mjs` was not used as the final focused validation because this worktree currently lacks `node_modules/.bin/depcruise`, and that unrelated dependency-cruiser section fails with `ENOENT`.

## Final Validation

Command:

```text
git diff --check
```

Result:

```text
exit 0
no output
```

Command:

```text
PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH /Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/lib/node_modules/npm/bin/npm-cli.js run guard:pr-shape -- --base origin/main --spec docs/specs/M7-07-pr-shape-quote-path.md --include-worktree
```

Result:

```json
{
  "base": "origin/main",
  "specPath": "docs/specs/M7-07-pr-shape-quote-path.md",
  "specType": "fix",
  "bootstrapException": false,
  "changedFiles": 5,
  "categories": {
    "source": 1,
    "test": 1,
    "docs": 3
  },
  "source": {
    "changedFiles": 1,
    "netLoc": 0,
    "newFiles": 0
  }
}
```

## Branch / PR Lifecycle Check

Command:

```text
git branch --no-merged main
```

Result:

```text
+ codex/m7-05-prototype-visual-source-reset
+ codex/m7-06-m7-ui-worker-boundary-incident
+ codex/m7-ui-00-prototype-migration-index
+ codex/m7-ui-00a-fixture-sanitization-map
+ codex/m7-ui-00b-token-foundation-contract
```

M7-07 is not listed because this worker was instructed not to commit; its changes remain in the working tree.

Command:

```text
/Users/atilla/Applications/Codex/tools/downloads/gh/gh_2.92.0_macOS_arm64/bin/gh pr list --state open
```

Result:

```text
164	docs: reset M7 visual source to prototype	codex/m7-05-prototype-visual-source-reset	OPEN	2026-07-03T01:52:45Z
```

Final root checkout status:

```text
git status --short --branch
## main...origin/main
```

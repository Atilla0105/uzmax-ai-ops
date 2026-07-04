# REQ-G01A Worker Boundary Incident

## Goal

Record the PR #188 / `REQ-G01A-group-overview-runtime-implementation` root/main patch-target slip as a docs-only incident.

This PR records governance evidence only. It does not modify PR #188, does not implement DB/API/admin/runtime code, does not change the REQ-G01A runtime implementation plan, and does not approve owner acceptance, visual acceptance, GA-0, production/staging or 1.0 release.

## Owner

Project owner decides final risk acceptance, release scope, production/staging actions, real accounts, real customer/order data, LLM keys, cost and compliance.

AI agent responsibility is limited to recording incident facts, impact, cleanup evidence, unknowns, controls and validation in the assigned incident worktree.

## Timebox

0.25 workday.

If this incident record requires source/runtime edits, DB/API/admin code, package/lock updates, CI/global config edits, README/index updates, ledger updates, production/staging action, root/main edits or #188 worktree edits, stop and report `BLOCKED`.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/REQ-G01A-worker-boundary-incident.md`
  - `docs/evidence/M7/REQ-G01A-worker-boundary-incident.md`
  - `docs/incidents/INC-2026-07-04-req-g01a-root-patch-target.md`
- Notes:
  - The touch list is exactly these three new docs paths.
  - No `apps/**`, `packages/**`, package/lock, `.github`, `scripts`, backend/API/DB/runtime, tests, generated files, binary media, `docs/evidence/M7/README.md` or `docs/admin-ui-page-migration-ledger.md` may change.
  - This incident PR must not modify `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec` or branch `codex/req-g01a-group-overview-runtime-implementation-spec`.
- 未列出的模块默认不可改。

## Change Budget And Path Classification

- source changed files: 0
- source net LOC: 0
- new source files: 0
- test/generated/lock/config/source/runtime changes: 0
- docs changes: exactly 3 new docs paths listed above
- external API/SDK/provider/connector/adapter basis: none
- exceptions: none

## Document Trigger Check

- Result: `updated`.
- Basis: `docs/incidents/README.md` requires an incident when a worker writes outside the assigned worktree, including root/main checkout.
- This PR adds only the incident/spec/evidence docs required by that trigger and intentionally leaves PR #188 files untouched.

## Required Reads

- `AGENTS.md`
- `docs/incidents/README.md`
- `docs/incidents/INCIDENT-template.md`
- `docs/incidents/INC-2026-07-04-req-g01-runtime-root-patch-target.md`
- `docs/specs/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`
- `docs/evidence/M7/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`
- `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec/docs/specs/REQ-G01A-group-overview-runtime-implementation.md` read-only
- `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec/docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md` read-only

## Entry State

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.codex/worktrees/req-g01a-worker-boundary-incident` |
| assigned branch | `codex/req-g01a-worker-boundary-incident` |
| base | `origin/main` at `4af55f27f849ba197a114b4b76a8830dc3509d0d` / `4af55f2 docs: define REQ-G01 group overview runtime contract (#186)` |
| PR target | `main` |
| forbidden checkout for edits | `/Users/atilla/Applications/UZMAX智能运营` |
| forbidden affected worktree for edits | `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/req-g01a-worker-boundary-incident` |
| entry `git status --short --branch` | `## codex/req-g01a-worker-boundary-incident...origin/main` |
| entry `git branch --show-current` | `codex/req-g01a-worker-boundary-incident` |
| entry HEAD | `4af55f27f849ba197a114b4b76a8830dc3509d0d` |
| root/main status before writes | `## main...origin/main` |
| root/main diff before writes | no output from `git diff --name-only` |
| root/main HEAD before writes | `4af55f2` |

## Incident Trigger

- PR #188: `https://github.com/Atilla0105/uzmax-ai-ops/pull/188`
- PR #188 title: `docs: plan REQ-G01A group overview runtime implementation`
- PR #188 branch: `codex/req-g01a-group-overview-runtime-implementation-spec`
- PR #188 commit: `f18a7e9c6edb9818f5fa4087c3910304206db003`
- PR #188 files changed:
  - `docs/specs/REQ-G01A-group-overview-runtime-implementation.md`
  - `docs/evidence/M7/REQ-G01A-group-overview-runtime-implementation.md`
  - `docs/evidence/M7/README.md`
  - `docs/admin-ui-page-migration-ledger.md`
- Worker self-reported: `One concern is recorded in evidence: there was an initial patch-target slip into root/main, immediately cleaned; final diff/commit/push were only from the assigned worktree.`
- PR #188 evidence says root/main was inspected read-only only; writes were transferred to assigned worker worktree after an initial patch-target slip; an initial patch accidentally landed in root/main; the same docs content was reapplied to assigned worktree and root/main was cleaned before validation.
- Coordinator verified root/main currently clean: `git status --short --branch` -> `## main...origin/main`; no root diff.
- `docs/incidents/README.md` requires an incident for writes outside assigned worktree, including root/main checkout.

Therefore PR #188 must not become ready/merge until this incident is recorded and reviewed.

## Implementation Steps

1. Create this docs-only incident spec in the assigned worktree after verifying `pwd` and branch.
2. Create the M7 evidence file and incident file in the assigned worktree only.
3. Keep the diff limited to the three files in the touch list.
4. Run required validation.
5. Commit, push and open a Draft PR targeting `main`; do not mark ready and do not merge.

## Acceptance Criteria

- The PR changes exactly the three docs paths listed in this spec.
- The incident records what happened, impact, root cause/unknowns, detection, cleanup, permanent controls, institutionalized status, evidence links and owner/AI boundary.
- Evidence records entry state, root/main untouched evidence, no source/runtime changes in this incident PR and validation commands.
- `docs/evidence/M7/README.md` and `docs/admin-ui-page-migration-ledger.md` remain unchanged by this incident PR.
- Root/main remains clean after writes.
- #188 worktree and branch remain untouched by this incident PR.
- No source/test/runtime/package/lock/config/generated/binary media paths are changed.
- Required validation passes or an exact blocker is reported.

## Failure Branch

- If root/main becomes dirty, stop, report `BLOCKED`, and clean only changes caused by this incident-record worker if any.
- If the three allowed paths are insufficient, stop and ask for a split or expanded docs spec.
- If validation requires source/runtime/config changes, stop and report `BLOCKED`; do not broaden this PR.
- If push or PR creation is unavailable, leave the branch committed locally and report the head SHA plus exact blocker.

## Non-Goals

- No modification to PR #188, branch `codex/req-g01a-group-overview-runtime-implementation-spec` or `/Users/atilla/.codex/worktrees/req-g01a-group-overview-runtime-implementation-spec`.
- No runtime implementation plan changes.
- No `docs/evidence/M7/README.md` or `docs/admin-ui-page-migration-ledger.md` updates.
- No React page, route, API hook, test, CSS, token, shared pattern or runtime change.
- No backend/API/DB/worker/cron/package/lock/CI/global config changes.
- No binary screenshots or raw prototype imports.
- No source/runtime/DB/API/admin code implementation.
- No secret/customer data use is known or claimed.
- No GA-0 opening, production/staging action, owner acceptance, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## Validation List

- `git diff --check`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/REQ-G01A-worker-boundary-incident.md --include-worktree`
- focused forbidden-path check showing only the three allowed docs paths changed
- root/main status/diff check remains clean

## Closeout

- Incident: `docs/incidents/INC-2026-07-04-req-g01a-root-patch-target.md`
- Evidence: `docs/evidence/M7/REQ-G01A-worker-boundary-incident.md`
- Institutionalized status before merge: `pending_merge`

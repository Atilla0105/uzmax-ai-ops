# M7-UI-12A REQ-G01 Runtime Worker Boundary Incident

## 目标

Record the PR #186 / `REQ-G01-group-overview-runtime-contract` root/main patch-target slip as a docs-only incident, with concise evidence and permanent controls for future worker prompts.

This PR does not modify #186, does not update the REQ-G01 runtime contract, and does not change admin/source/runtime code.

## Owner

Owner: project owner decides final risk acceptance, release scope, production/staging, real accounts, real customer/order data, LLM keys, cost and compliance.

AI agent responsibility: record the incident facts, cleanup evidence, unknowns, controls and validation without expanding product/runtime scope or modifying the affected worker branch.

## 时间盒

0.25 workday. If this incident record requires source/runtime edits, guard/tool changes, package/lock updates, backend/API/DB changes, CI/global config edits, README/index updates, ledger updates, production/staging action or #186 worktree edits, stop and report `BLOCKED`.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`
  - `docs/evidence/M7/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`
  - `docs/incidents/INC-2026-07-04-req-g01-runtime-root-patch-target.md`
- 说明/备注：
  - The touch list is exactly these three new docs paths.
  - No `apps/**`, `packages/**`, package/lock, `.github`, `scripts`, backend/API/DB/runtime, tests, generated files, binary media, `docs/evidence/M7/README.md` or `docs/admin-ui-page-migration-ledger.md` may change.
  - This incident PR must not modify `/Users/atilla/.codex/worktrees/req-g01-group-overview-runtime-contract` or branch `codex/req-g01-group-overview-runtime-contract`.
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files = 0、net source LOC = 0、new source files = 0。
- test/generated/lock/config/source/runtime 预计变更：0。
- docs 预计变更：3 new docs paths exactly as listed above.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；this is incident documentation only.
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`。
- 判断依据：`docs/incidents/README.md` lines 7-15 require an incident record for writes outside the assigned worktree, including root/main checkout writes.
- 备注：this PR adds only the incident/spec/evidence docs required by that trigger and intentionally leaves M7 README and the admin migration ledger untouched to avoid conflict with #186.

## 前置条件

Required reads before drafting:

- `AGENTS.md`
- `docs/incidents/README.md`
- `docs/incidents/INCIDENT-template.md`
- `docs/incidents/INC-2026-07-02-m7-ui-root-patch-target.md`
- `docs/incidents/INC-2026-07-03-m7-ui-11-root-patch-target.md`
- `docs/specs/M7-06-m7-ui-worker-boundary-incident.md`
- `docs/evidence/M7/M7-06-m7-ui-worker-boundary-incident.md`

Worktree / branch:

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.codex/worktrees/m7-ui-12a-req-g01-runtime-worker-boundary-incident` |
| assigned branch | `codex/m7-ui-12a-req-g01-runtime-worker-boundary-incident` |
| base | `origin/main` at `ef6c40264280b4d5366e0895a2556a08c72b3f54` |
| PR target | `main` |
| forbidden checkout for edits | `/Users/atilla/Applications/UZMAX智能运营` |
| forbidden affected worktree for edits | `/Users/atilla/.codex/worktrees/req-g01-group-overview-runtime-contract` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-12a-req-g01-runtime-worker-boundary-incident` |
| entry `git status --short --branch` | `## codex/m7-ui-12a-req-g01-runtime-worker-boundary-incident...origin/main` |
| entry `git branch --show-current` | `codex/m7-ui-12a-req-g01-runtime-worker-boundary-incident` |
| entry HEAD | `ef6c40264280b4d5366e0895a2556a08c72b3f54` |
| root/main status before writes | `## main...origin/main` |
| root/main diff before writes | no output from `git diff --name-only` |
| root/main HEAD before writes | `ef6c40264280b4d5366e0895a2556a08c72b3f54` |

Incident trigger:

- During the #186 worker for `REQ-G01-group-overview-runtime-contract`, intended docs were initially written to root/main checkout instead of the assigned worktree.
- `docs/incidents/README.md` requires recording writes outside the assigned worktree/root coordination boundary, so this incident cannot be closed only in chat.

## 实施步骤

1. Create this docs-only spec in the assigned worktree after verifying `pwd` equals the assigned path.
2. Create the M7 evidence file and incident file in the assigned worktree only.
3. Keep the diff limited to the three files in the touch list.
4. Run required validation.
5. Commit, push and open a Draft PR targeting `main`; do not mark ready and do not merge.

## 通过条件

- The PR changes exactly the three docs paths listed in this spec.
- The incident records what happened, impact, root cause/unknowns, detection, cleanup, permanent controls, status, evidence links and owner/AI boundary.
- Evidence records entry state, root/main untouched evidence, no source/runtime changes in this incident PR and validation commands.
- `docs/evidence/M7/README.md` and `docs/admin-ui-page-migration-ledger.md` remain unchanged.
- Root/main remains clean after writes.
- #186 worktree and branch remain untouched by this incident PR.
- No source/test/runtime/package/lock/config/generated/binary media paths are changed.
- Required validation passes or an exact blocker is reported.

## 失败分支

- If root/main becomes dirty, stop, report `BLOCKED`, and clean only changes caused by this incident-record worker if any.
- If the three allowed paths are insufficient, stop and ask for a split or expanded docs spec.
- If validation requires source/runtime/config changes, stop and report `BLOCKED`; do not broaden this PR.
- If push or PR creation is unavailable, leave the branch committed locally and report the head SHA plus exact blocker.

## 不做什么

- No modification to PR #186, branch `codex/req-g01-group-overview-runtime-contract` or `/Users/atilla/.codex/worktrees/req-g01-group-overview-runtime-contract`.
- No runtime contract content changes.
- No `docs/evidence/M7/README.md` or `docs/admin-ui-page-migration-ledger.md` updates.
- No React page, route, API hook, test, CSS, token, shared pattern or runtime change.
- No backend/API/DB/worker/cron/package/lock/CI/global config changes.
- No binary screenshots or raw prototype imports.
- No GA-0 opening, production/staging action, owner acceptance, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## 验收映射

- Workspace isolation / orchestration safety: incident-threshold write outside assigned worktree is recorded in repo evidence.
- M7 UI runtime contract governance: REQ-G01 runtime contract PR remains separate; this slice records only the process incident.

## Validation List

- `git diff --check`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH npm run guard:doc-triggers`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:/Applications/Codex.app/Contents/Resources/cua_node/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md --include-worktree`
- `git diff --name-only origin/main...HEAD`
- `git diff --name-only origin/main...HEAD -- apps packages package.json package-lock.json pnpm-lock.yaml yarn.lock .github scripts docs/evidence/M7/README.md docs/admin-ui-page-migration-ledger.md`
- `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch`
- `git -C /Users/atilla/Applications/UZMAX智能运营 diff --name-only`

## Closeout / Incident 记录

- Incident: `docs/incidents/INC-2026-07-04-req-g01-runtime-root-patch-target.md`
- Institutionalized status before merge: `pending_merge`
- Evidence: `docs/evidence/M7/M7-UI-12A-req-g01-runtime-worker-boundary-incident.md`

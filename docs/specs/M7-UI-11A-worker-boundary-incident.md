# M7-UI-11A Worker Boundary Incident

## 目标

Record the 2026-07-03 M7-UI-11 implementation worker root/main patch-target boundary incident in repo-governed docs, with evidence and permanent controls before any resumed page implementation.

This PR is docs-only governance work. It does not implement `group.release`, does not approve the M7-UI-11 page, and does not expand the M7-UI-11 page implementation touch list.

## Owner

Owner: project owner decides final risk acceptance, release scope, production/staging, real accounts, real customer/order data, LLM keys, cost and compliance.

AI agent responsibility: record the incident facts, cleanup evidence, unknowns, permanent controls and validation without turning the incident record into page implementation approval.

## 时间盒

0.25 workday. If this incident record requires source/runtime edits, guard/tool changes, package/lock updates, backend/API/DB changes, CI/global config edits, production/staging action or page implementation, stop and report `BLOCKED`.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-UI-11A-worker-boundary-incident.md`
  - `docs/evidence/M7/M7-UI-11A-worker-boundary-incident.md`
  - `docs/incidents/INC-2026-07-03-m7-ui-11-root-patch-target.md`
  - `docs/evidence/M7/README.md`
- 说明/备注：
  - The touch list is exactly these four docs paths.
  - No `apps/admin/**`, `packages/**`, package/lock, `.github`, `scripts`, backend/API/DB/runtime, test or binary media paths may change.
  - This incident PR does not add, approve or widen the M7-UI-11 page implementation paths.
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files = 0、net source LOC = 0、new source files = 0。
- test/generated/lock/config/source/runtime 预计变更：0。
- docs 预计变更：4 docs paths exactly as listed above.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；this is incident documentation only.
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`。
- 判断依据：`docs/incidents/README.md` requires an incident record for writes outside the assigned worktree, including root/main checkout writes.
- 备注：this PR updates the existing M7 evidence index and adds the incident/spec/evidence docs required by that trigger.

## 前置条件

Required reads before drafting:

- `AGENTS.md`
- `docs/incidents/README.md`
- `docs/incidents/INCIDENT-template.md`
- `docs/specs/SPEC-template.md`
- `docs/incidents/INC-2026-07-03-m7-ui-03-root-write-boundary.md`
- `docs/incidents/INC-2026-07-03-m7-ui-10-root-patch-target.md`
- `docs/incidents/INC-2026-07-02-m7-ui-root-patch-target.md`
- `docs/specs/M7-UI-11-release-acceptance-page.md`
- `docs/evidence/M7/M7-UI-11-release-acceptance-page.md`
- `docs/evidence/M7/README.md`
- `docs/doc-gates.md`

Worktree / branch:

| Fact | Evidence |
|---|---|
| assigned worktree | `/Users/atilla/.codex/worktrees/m7-ui-11-worker-boundary-incident` |
| assigned branch | `codex/m7-ui-11-worker-boundary-incident` |
| base | current `origin/main` at `5d0000b28f7dffd33aca56a57cf066d304e2d664` |
| PR target | `main` |
| forbidden checkout for edits | `/Users/atilla/Applications/UZMAX智能运营` |
| entry `pwd` | `/Users/atilla/.codex/worktrees/m7-ui-11-worker-boundary-incident` |
| entry `git status --short --branch` | `## codex/m7-ui-11-worker-boundary-incident...origin/main` |
| entry `git branch --show-current` | `codex/m7-ui-11-worker-boundary-incident` |
| root/main status before writes | `## main...origin/main` |
| implementation worktree status before writes | `## codex/m7-ui-11-release-acceptance-page-impl...origin/main` |
| implementation worktree diff/cached diff before writes | none |
| open PR audit before writes | GitHub connector returned no open PRs. `gh` is not installed in this shell. |

Incident trigger:

- During the M7-UI-11 implementation worker attempt for `codex/m7-ui-11-release-acceptance-page-impl` in `/Users/atilla/.codex/worktrees/m7-ui-11-release-acceptance-page-impl`, one `apply_patch` accidentally targeted root/main `/Users/atilla/Applications/UZMAX智能运营`.
- `docs/incidents/README.md` makes this incident-threshold because it wrote outside the assigned worktree/root coordination boundary.

## 实施步骤

1. Create this docs-only spec in the assigned worktree using an absolute assigned-worktree file path.
2. Immediately check root/main and assigned worktree status after the first write.
3. Create the M7 evidence file and incident file in the assigned worktree only.
4. Update `docs/evidence/M7/README.md` with a minimal UI-11A boundary note without claiming M7-UI-11 implementation.
5. Run required validation and focused path checks.
6. Commit, push and open a ready PR targeting `main`.

## 通过条件

- The PR changes exactly the four docs paths listed in this spec.
- The incident records what happened, impact, root cause/unknowns, detection, cleanup, permanent controls, status, evidence links and owner/AI boundary.
- Evidence records entry state, open PR audit, root/main clean state, implementation worktree clean state, no source/runtime changes in this incident PR and validation commands.
- `docs/evidence/M7/README.md` includes only a minimal UI-11A/M7-UI-11A row or boundary note and does not claim UI-11 implementation.
- Root/main remains clean after writes.
- No source/test/runtime/package/lock/config/binary media paths are changed.
- Required validation passes or an exact blocker is reported.

## 失败分支

- If root/main becomes dirty, stop, report `BLOCKED`, and clean only changes caused by this incident-record worker if any.
- If required docs cannot fit in the four allowed paths, stop and ask for a split or expanded docs spec.
- If validation requires source/runtime/config changes, stop and report `BLOCKED`; do not broaden this PR.
- If push or PR creation is unavailable, leave the branch committed locally and report the head SHA plus exact blocker.

## 不做什么

- No M7-UI-11 page implementation.
- No React page, route, registry, page outlet, API hook, test, CSS, token, shared pattern or runtime change.
- No backend/API/DB/worker/cron/package/lock/CI/global config changes.
- No binary screenshots or raw prototype imports.
- No GA-0 opening, production/staging action, owner acceptance, real customer/order-data use, customer LLM, Telegram Business automatic reply or 1.0 release approval.

## 验收映射

- Workspace isolation / orchestration safety: incident-threshold write outside assigned worktree is recorded in repo evidence.
- M7 UI queue governance: UI-11A records the implementation worker boundary incident without approving or implementing UI-11.

## Validation List

- `git diff --check`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH npm run guard:doc-triggers`
- `PATH=/Users/atilla/Applications/Codex/tools/node-v24.14.0-darwin-arm64/bin:$PATH node scripts/guards/pr-shape.mjs --base origin/main --spec docs/specs/M7-UI-11A-worker-boundary-incident.md --include-worktree`
- `git diff --name-only origin/main...HEAD`
- `git diff --name-only origin/main...HEAD -- apps/admin packages package.json package-lock.json pnpm-lock.yaml yarn.lock .github scripts`
- `git diff --name-only origin/main...HEAD -- '*.png' '*.jpg' '*.jpeg' '*.webp' '*.gif' '*.mp4' '*.mov'`
- `git -C /Users/atilla/Applications/UZMAX智能运营 status --short --branch`

## Closeout / Incident 记录

- Incident: `docs/incidents/INC-2026-07-03-m7-ui-11-root-patch-target.md`
- Institutionalized status before merge: `pending_merge`
- Evidence: `docs/evidence/M7/M7-UI-11A-worker-boundary-incident.md`

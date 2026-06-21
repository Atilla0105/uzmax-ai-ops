# M3-18 CI Cost Stopgap

## 目标

执行项目 owner 已确认的 UZMAX GitHub Actions 止血方案，不处理 ZAPCHATNWEUI：

- docs-only PR 只跑轻量治理检查，不跑 type/lint/depcruise/jscpd/knip/test/build/size/Playwright/spike；
- Playwright 与 `playwright install --with-deps chromium` 只在 admin/frontend 相关路径变化或手动 full CI 时运行；
- SPK-03/SPK-04 外部 spike 只在 `packages/db/**`、`packages/authz/**`、root package 文件变化或手动 full CI 时运行；
- 保留 `checks` 这个 required status 名称，不修改 ruleset。

本 spec 只调整 UZMAX CI 编排和证据，不改业务代码、不改 ZAP、不改 GitHub billing 设置、不绕过分支保护。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：已确认从止血方案第 2 条开始执行，并明确 ZAPCHATNWEUI 先不处理。Owner 仍决定 GitHub billing/spending limit、ruleset、是否合并以及是否后续提高/降低 CI 严格度。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-18-ci-cost-stopgap` / `codex/m3-18-ci-cost-stopgap` 中执行；更新 workflow、spec 和 evidence；复核不削弱 PR shape/doc/workspace/guard 基线，不删除测试，不改变 runtime。

## 时间盒

0.5 个工作日。若 workflow 条件语法或 ruleset 要求导致 required check 缺失，则停止扩大范围，保留 required check 名称并记录外部 CI/billing blocker。

## Spec 类型

infra

## 触碰模块/文件

- `.github/workflows/ci.yml`
- `docs/specs/M3-18-ci-cost-stopgap.md`
- `docs/evidence/M3/M3-18-ci-cost-stopgap.md`
- `docs/evidence/M0/infra/git-ci-manifest.md`

说明/备注：

未列出的模块默认不可改。本 PR 不触碰 #55 的 `docs/evidence/M3/README.md` 或 `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`，避免与开放 PR 重叠。

## 变更预算与路径分类

- source 预算：changed source files <= 0；net source LOC <= 0；new source files <= 0。
- path categories：config = `.github/workflows/ci.yml`；docs = this spec、M3-18 evidence、Git/CI manifest。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `workflow`、`playwright`、`spike:rls-prisma-pool`、`spike:dual-auth`、`guard:eval-triggers`、`guard:pr-shape`、`docs-only`、`concurrency` 于 `.github`、`package.json`、`docs/specs`、`docs/evidence`、`scripts`。当前缺口是 CI 编排，不是 runtime/source implementation。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增外部 API/SDK/provider/connector/adapter。GitHub Actions workflow syntax 使用既有本地 workflow 模式。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-18-ci-cost-stopgap`。
- 当前分支必须是 `codex/m3-18-ci-cost-stopgap`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、root/main status、open PR 和 no-merged branch 状态。
- 开工前必须重读 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`.github/workflows/ci.yml`、`package.json`、`docs/specs/M0-08-ci-workflow-hygiene.md`、`docs/evidence/M0/infra/git-ci-manifest.md`。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-18-ci-cost-stopgap` |
| branch | `codex/m3-18-ci-cost-stopgap` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single infra spec. Shared CI config changes are globally serial in this PR. Open PR #55 touches M3 docs/evidence only and remains non-overlapping.

## 事故与 closeout 记录

- Incident: none at authoring.
- If workflow changes remove the required `checks` job name or bypass PR shape/doc/workspace guards, stop and fix before continuing.

## 实施步骤

1. Add `workflow_dispatch` full-CI escape hatch.
2. Add path classification outputs for docs-only, frontend/admin changes and spike-relevant DB/authz/package changes.
3. Keep lightweight checks always on: `npm ci`, format, prettier-ignore guard, eval trigger guard, doc trigger guard, workspace guard and PR shape on PRs.
4. Gate core type/lint/dep/test/build behind non-docs or manual full CI.
5. Gate SPK-03/SPK-04 behind DB/authz/package changes or manual full CI.
6. Gate size/Playwright install/Playwright behind admin/frontend changes or manual full CI.
7. Update Git/CI manifest and M3-18 evidence.

## 通过条件

- Workflow keeps the required job name `checks`.
- Docs-only PR path runs lightweight gates only and keeps PR shape/doc/workspace/eval-trigger guards active.
- Admin/frontend path runs Playwright and size.
- DB/authz/package path runs SPK-03/SPK-04.
- Manual `workflow_dispatch` with `full=true` can force full CI.
- Local validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-18-ci-cost-stopgap.md --include-worktree`, `git diff --check origin/main...HEAD`, workflow syntax parse check and full `npm run check` if feasible.

## 失败分支

- 若 path classification breaks GitHub Actions syntax: fix in the same PR before merge.
- 若 branch protection/ruleset treats skipped conditional steps as missing required checks: keep job name `checks`; do not split required checks without owner/ruleset update.
- 若 docs-only PRs still run Playwright or external spikes: treat as stopgap failure and adjust path conditions.
- 若 DB/authz/package changes skip SPK-03/SPK-04: treat as stopgap failure and adjust path conditions.
- 若 GitHub Actions cannot start because of account billing/spending limits: record as external validation blocker; do not claim CI pass.

## 不做什么

- 不处理 ZAPCHATNWEUI。
- 不修改 GitHub billing、spending limit、ruleset、CODEOWNERS、PR template 或 secrets。
- 不删除测试、不新增 `.skip`/`.only`/`xit`/`xfail`、不降低断言。
- 不改 `apps/**`、`packages/**`、scripts、schema、lockfile、generated/dist、provider/connector/adapter 或 runtime behavior。
- 不关闭 M3，不启动 M4，不放行 production、GA-0、真实客户流量、customer LLM、prompt/model/persona release、knowledge publish 或 1.0 release。

## 验收映射

| Item | M3-18 status | Notes |
|---|---|---|
| K-02 | ci_cost_stopgap_prepared | CI remains required as `checks`, with path-aware heavy gates. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Shared CI config is serialized in this PR; source/test/runtime untouched. |

M3-18 does not close M3. It reduces CI cost exposure while preserving required governance gates.

# Git / CI Manifest

> evidence_id: M0-infra-git-ci  
> status: repo_created__ci_ruleset_ready__owner_merge_equivalent_documented
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: 不适用；不得在仓库提交 CI secret 明文

## 环境信息

| 项目 | 值 |
|---|---|
| Git 托管平台 | GitHub |
| GitHub 账号 | `Atilla0105`，`gh auth status` 已登录，SSH 协议，具备 `repo` scope |
| 仓库名称 | `uzmax-ai-ops` |
| 仓库 URL | `https://github.com/Atilla0105/uzmax-ai-ops` |
| 默认分支 | `main` |
| 分支保护 | repository ruleset `uzmax-main-governance` active for `refs/heads/main`；强制 PR、`checks`、review thread resolution、禁止 non-fast-forward/delete；当前不强制 approving review |
| CI 平台 | GitHub Actions，工作流位置 `.github/workflows/ci.yml` |
| CI runner | GitHub-hosted runner，Node 24 action runtime 由 workflow env 固定 |
| PR 模板位置 | `.github/pull_request_template.md` |

## GitHub 只读发现

| 检查项 | 结果 |
|---|---|
| 当前工作区 | `/Users/atilla/Documents/UZMAX智能运营` 已初始化 git repo |
| 相关仓库扫描 | 创建前未发现 `uzmax` 命名仓库；本次创建 `uzmax-ai-ops` |
| 已存在相关但不复用仓库 | `ZAPCHATNWEUI`、`Tarjiman` |
| 本机 git identity | `Atilla` / `211694225+Atilla0105@users.noreply.github.com` |
| 初始提交 | `e125588 Initialize UZMAX planning baseline` |
| 远端 | `git@github.com:Atilla0105/uzmax-ai-ops.git` |

## AI agent 预检

| 检查项 | 状态 | 记录 |
|---|---|---|
| 当前目录是否为正式 git repo | ready | `.git/` 已创建，`main` 已推送到私有 GitHub repo |
| 工程 package 配置 | ready | root `package.json` 已定义 workspaces、Node 版本与本地/CI 脚本 |
| CI 配置 | ready_path_aware_stopgap_local_validated_pending_remote_ci | `.github/workflows/ci.yml` 已配置 path-aware CI cost stopgap：docs-only PR 保留 `npm ci`、format、prettier-ignore、eval/doc/workspace guards 和 PR shape，跳过 core heavy gates、spikes、size 与 Playwright；non-docs path 运行 core type/lint/depcruise/jscpd/knip/forbidden/prisma/test/build；DB/authz/package paths 运行 SPK-03/SPK-04；admin/frontend paths 运行 size、Playwright install 和 Playwright；manual `workflow_dispatch full=true` 可强制完整 CI。workflow 显式声明 `contents: read`，同一 PR 的旧 CI run 可被新 commit 取消，diff-based guards 按 PR base 或 push before SHA 解析 base。M3-18 本地验证已通过；远端 CI 当前受 GitHub billing/payment 或 spending-limit 外部状态阻断，恢复后需重新观察。 |
| Gate 0 最低输入 | repo_ready__ci_ruleset_ready | repo、CI、PR template、main ruleset 已就绪 |

## Owner Review / Approval 现状

| 检查项 | 当前值 | 判定 |
|---|---|---|
| required approving review count | `0` | 单 owner 私有仓库暂不强制 1 人 review，避免当前 GitHub 身份形成自审 deadlock |
| CODEOWNERS review | `false` | `.github/CODEOWNERS` 存在，但 ruleset 未强制 |
| review thread resolution | `true` | 已由 ruleset 强制 |
| required status checks | `checks` | 已由 ruleset 强制 |
| non-fast-forward / deletion | enforced | 已由 ruleset 强制 |

等价机制：所有 PR 必须走 PR + `checks`，最终 merge 由项目 owner 执行。若 PR 声明 `large_change_exception`、`test_weakening_exception` 或 `external_dependency_exception`，必须有项目 owner 在 PR review、PR comment 或等价审批记录中明确批准，否则不得合并。后续若引入第二个真人 reviewer 或独立机器人身份，应另开 infra spec 把 approving review / CODEOWNERS review 调整为硬性 ruleset。

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Git/CI 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录实际环境与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | repo_ready__ci_ruleset_ready |
| 实际失败分支 | 单 owner 私有仓库不配置强制 1 人 approving review，避免当前身份造成自审 deadlock；等价机制为 main ruleset 强制 PR、`checks`、review thread resolution、禁止 force-push/delete，最终 merge 由项目 owner 执行；例外 PR 需要项目 owner 显式审批记录 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted | 当前对话授权创建独立项目 |
| AI agent | evidence_ready | GitHub repo、CI 配置、PR 模板与 active main ruleset 已验证 |

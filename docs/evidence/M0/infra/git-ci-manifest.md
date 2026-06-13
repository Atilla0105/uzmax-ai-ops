# Git / CI Manifest

> evidence_id: M0-infra-git-ci  
> status: repo_created__ci_ruleset_ready
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
| 分支保护 | repository ruleset `uzmax-main-governance` active for `refs/heads/main` |
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
| CI 配置 | ready | `.github/workflows/ci.yml` 已配置 format/type/lint/depcruise/jscpd/knip/guards/test/build/size/Playwright |
| Gate 0 最低输入 | repo_ready__ci_ruleset_ready | repo、CI、PR template、main ruleset 已就绪 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Git/CI 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录实际环境与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | repo_ready__ci_ruleset_ready |
| 实际失败分支 | 单 owner 私有仓库不配置强制 1 人 review，避免无人可合；等价机制为 main ruleset 强制 PR、`checks` 状态、禁止 force-push/delete，最终 merge 由项目 owner 执行 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted | 当前对话授权创建独立项目 |
| AI agent | evidence_ready | GitHub repo、CI 配置、PR 模板与 active main ruleset 已验证 |

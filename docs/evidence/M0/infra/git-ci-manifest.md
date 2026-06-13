# Git / CI Manifest

> evidence_id: M0-infra-git-ci  
> status: repo_created__ci_pending  
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
| 分支保护 | not_configured |
| CI 平台 | GitHub Actions 计划值；未配置 |
| CI runner | GitHub-hosted 计划值；未配置 |
| PR 模板位置 | pending，M0-01 创建 repo 骨架时补齐 |

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
| 工程 package 配置 | not_ready | 未发现 `package.json`；M0-01 前不得假装 CI 可运行 |
| CI 配置 | not_ready | 未发现 `.github/` 或等价 CI 配置 |
| Gate 0 最低输入 | repo_ready__ci_pending | repo 已创建；CI/PR template/分支保护由 M0-01 落地 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Git/CI 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录实际环境与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | repo_ready__ci_pending |
| 实际失败分支 | 若 M0-01 前需要强保护，可先只允许本地 main 提交；CI/分支保护不在 OCM-00A 强行补 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted | 当前对话授权创建独立项目 |
| AI agent | evidence_ready | GitHub repo 创建、初始提交、远端推送已验证 |

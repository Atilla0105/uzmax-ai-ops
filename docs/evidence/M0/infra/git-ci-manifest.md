# Git / CI Manifest

> evidence_id: M0-infra-git-ci  
> status: platform_discovery_recorded__repo_not_created  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 0.5 个工作日  
> secret_policy: 不适用；不得在仓库提交 CI secret 明文

## 环境信息

| 项目 | 值 |
|---|---|
| Git 托管平台 | GitHub |
| GitHub 账号 | `Atilla0105`，`gh auth status` 已登录，SSH 协议，具备 `repo` scope |
| 仓库名称 | 未发现 UZMAX 仓库；候选命名 `uzmax-ai-ops` / `UZMAX智能运营` 待定 |
| 默认分支 | 计划 `main`；正式 repo 创建后复核 |
| 分支保护 | not_configured |
| CI 平台 | GitHub Actions 计划值；未配置 |
| CI runner | GitHub-hosted 计划值；未配置 |
| PR 模板位置 | pending，M0-01 创建 repo 骨架时补齐 |

## GitHub 只读发现

| 检查项 | 结果 |
|---|---|
| 当前工作区 | `/Users/atilla/Documents/UZMAX智能运营` 不是 git repo |
| 相关仓库扫描 | 未发现 `uzmax` 命名仓库 |
| 已存在相关但不复用仓库 | `ZAPCHATNWEUI`、`Tarjiman` |
| 本机 git identity | `Atilla` / `211694225+Atilla0105@users.noreply.github.com` |

## AI agent 预检

| 检查项 | 状态 | 记录 |
|---|---|---|
| 当前目录是否为正式 git repo | not_ready | 未发现 `.git/`；当前目录仍是开工规划包 |
| 工程 package 配置 | not_ready | 未发现 `package.json`；M0-01 前不得假装 CI 可运行 |
| CI 配置 | not_ready | 未发现 `.github/` 或等价 CI 配置 |
| Gate 0 最低输入 | blocked_pending_repo_creation | GitHub/CI 方向已明确，但正式 repo/CI 未创建；创建前仍需 Gate 0 Go |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Git/CI 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录实际环境与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | blocked_pending_repo_creation |
| 实际失败分支 | 当前不创建正式工程仓库；Gate 0 Go 后由 M0-01 创建 repo/CI 骨架 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending | 需最终确认 repo 命名 |
| AI agent | evidence_ready | GitHub 登录、仓库扫描、本地 git 状态已记录 |

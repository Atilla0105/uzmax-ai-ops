# Supabase Environment Manifest

> evidence_id: M0-infra-supabase  
> status: blocked_by_free_project_limit  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 1 个工作日  
> secret_policy: service role key、数据库 URL、JWT secret 只存受控密钥管理，不进仓库

## 环境信息

| 环境 | 项目名 | 区域 | 连接池模式 | Auth | Storage | RLS | 状态 |
|---|---|---|---|---|---|---|---|
| dev | `uzmax-dev` 创建失败 | 计划 `ap-south-1` | pending | pending | pending | pending | blocked_by_free_project_limit |
| staging | pending | pending | pending | pending | pending | pending | pending |
| prod | pending | pending | pending | pending | pending | pending | pending |

## Supabase 只读发现

| 项目 | ref | 区域 | 状态 | public 表/RLS | 判定 |
|---|---|---|---|---|---|
| `Atilla0105's Project` | `effofocsxrkjjcjfnvbg` | `ap-southeast-1` | `ACTIVE_HEALTHY` | 10 张 public 表 RLS disabled；含 `ai_config_profiles.apiKey` 敏感列暴露 advisor | 不作为 UZMAX 干净 dev 复用 |
| `Zapchastchi` | `giegaylsowefeutjzfzn` | `ap-northeast-1` | `ACTIVE_HEALTHY` | 28 张 public 表 RLS disabled；含订单、后台、物流、通知等既有业务表 | 不作为 UZMAX 干净 dev 复用 |

安全 advisor 链接：

- [RLS Disabled in Public](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)
- [Sensitive Columns Exposed](https://supabase.com/docs/guides/database/database-linter?lint=0023_sensitive_columns_exposed)

RLS remediation 只能在明确旧项目访问策略后执行。基础 SQL 形态为 `ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;`，但启用后没有 policy 会阻断现有访问，所以本次不自动执行。

## 创建尝试记录

| 项目 | 记录 |
|---|---|
| organization | `Atilla0105's Org` / `kbuvfalyysfmptcazxnc` |
| 目标项目 | `uzmax-dev` |
| 目标区域 | `ap-south-1` |
| cost record | project, 0/monthly |
| 结果 | 创建失败：active free project limit 2/2 |
| 不自动执行的动作 | 不暂停、不删除既有项目；不自动升级付费 plan；不把旧项目强行改成 UZMAX dev |

## Gate 0 最低输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| Supabase dev 项目名/ref | blocked_by_free_project_limit | `uzmax-dev` 创建失败；组织 active free projects 已达 2/2 |
| 区域与连接池模式 | blocked_by_free_project_limit | SPK-03 必须依赖真实或足够贴近真实的连接池信息 |
| Auth / Storage / RLS 可用性 | blocked_by_free_project_limit | SPK-04 必须验证 Auth、Storage 签名 URL 和 RLS 链路 |
| secret 存放位置 | waiting_project_owner | 只记录受控位置，不提交 secret；项目创建后再填 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Supabase 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录环境信息与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | blocked_by_free_project_limit |
| SPK-03 / SPK-04 判定输入 | blocked_by_free_project_limit |
| 实际失败分支 | 需暂停/删除一个旧 free 项目、升级 Supabase，或显式接受非干净分支方案；否则 SPK-03/SPK-04 顺延 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | action_required | 需决定 Supabase free project limit 的处理方式 |
| AI agent | evidence_ready | 已记录组织、项目、表/RLS advisor、创建成本与失败原因 |

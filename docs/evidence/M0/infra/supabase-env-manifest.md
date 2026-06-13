# Supabase Environment Manifest

> evidence_id: M0-infra-supabase  
> status: platform_discovery_recorded__clean_dev_required  
> owner: 项目 owner 决策；AI agent 记录/验证  
> timebox: 1 个工作日  
> secret_policy: service role key、数据库 URL、JWT secret 只存受控密钥管理，不进仓库

## 环境信息

| 环境 | 项目名 | 区域 | 连接池模式 | Auth | Storage | RLS | 状态 |
|---|---|---|---|---|---|---|---|
| dev | 未发现干净 UZMAX dev；建议新建 `uzmax-dev` | region 待确认，建议优先 `ap-southeast-1` 或 `ap-northeast-1` | pending | pending | pending | pending | blocked_pending_new_project |
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

## Gate 0 最低输入

| 检查项 | 状态 | 记录 |
|---|---|---|
| Supabase dev 项目名/ref | blocked_pending_new_project | 现有两个项目均非干净 UZMAX dev；推荐新建 `uzmax-dev` |
| 区域与连接池模式 | blocked_pending_new_project | SPK-03 必须依赖真实或足够贴近真实的连接池信息 |
| Auth / Storage / RLS 可用性 | blocked_pending_new_project | SPK-04 必须验证 Auth、Storage 签名 URL 和 RLS 链路 |
| secret 存放位置 | waiting_project_owner | 只记录受控位置，不提交 secret；项目创建后再填 |

## 判定引用

通过条件与失败分支以 `docs/preflight/03-infrastructure-provisioning.md` 的 Supabase 行和 `docs/specs/M0-00-infrastructure-provisioning.md` 为准。本文件只记录环境信息与签收状态。

| 项目 | 状态/记录 |
|---|---|
| Gate 0 判定输入 | blocked_pending_new_project |
| SPK-03 / SPK-04 判定输入 | blocked_pending_new_project |
| 实际失败分支 | 若不新建干净 dev，则 SPK-03/SPK-04 顺延；不得用既有污染项目或 mock 结论替代 |

## 签收

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending | 需确认是否创建新 `uzmax-dev` 以及区域/成本 |
| AI agent | evidence_ready | 已记录组织、项目、表/RLS advisor 与不可复用判定 |

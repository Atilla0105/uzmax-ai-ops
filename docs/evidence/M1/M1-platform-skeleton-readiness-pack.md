# M1 Platform Skeleton Readiness Pack

> evidence_id: M1-platform-skeleton-readiness-pack
> milestone: M1
> acceptance_items: A-01 / A-02 / B-01 / B-02 / B-03 / B-04 / B-05 / G-06 / J-05 / K-03 / K-04
> status: accepted
> created_at: 2026-06-14
> updated_at: 2026-06-14
> owner: 项目 owner 确认 M1 范围、项目输入排期、后续 spec 队列和 Gate 1 开工授权；AI agent 复核 M0 证据、拆分 spec、暴露阻断项
> source_files: `docs/specs/OCM-04-m1-readiness-pack.md`、`docs/preflight/00-opening-control-matrix.md`、`UZMAX智能运营系统-技术架构-v1.1.md`、`UZMAX智能运营系统-后台设计与前端架构-v1.1.md`、`UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
> sensitive_data_location: none
> redaction_status: no sensitive data included

## 当前判定

OCM-04 已通过 PR #12 合入并进入 `accepted`。M0 技术地基已达到启动 M1 平台骨架准备的前置条件：

| 前置项 | 状态 | 证据 |
|---|---|---|
| M0 治理骨架与 CI | accepted | PR #1、PR #3、PR #4；`docs/evidence/M0/gates/Gate-0-decision.md` |
| SPK-03 RLS x Prisma x 连接池 | accepted | PR #9；`docs/adr/ADR-001-rls-prisma-pool.md`；`docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md` |
| SPK-04 双鉴权链路 | accepted | PR #10；`docs/adr/ADR-002-dual-auth-access-context.md`；`docs/evidence/M0/spikes/SPK-04-dual-auth/manifest.md` |
| ADR-003 LLM 数据处理 | accepted_dev_only__customer_llm_blocked | PR #11；`docs/adr/ADR-003-llm-data-processing.md`；`docs/evidence/M0/llm-data-processing/README.md` |

本 readiness pack 不直接放行 M1 业务骨架实现。PR #12 合并后，Gate 1 必须独立做 Go/No-Go 复判；只有 Gate 1 Go 后，后续 M1 实现 spec 才能逐个开 PR。

## M1 Scope

M1 只覆盖平台骨架：

- `org`、`tenant`、`org_member`、`tenant_member`、`permission_grant` 的 schema 与 RLS 基线。
- 后端 `AccessContext`、org/tenant 权限查询、租户切换缓存失效和 API guard 基线。
- 集团层/租户层后台壳：顶栏、租户切换器、授权工作台入口、发布与验收只读入口；不得展示客户明文。
- 审计基线：权限变更、租户切换、配置版本、高风险动作的 `audit_log` 契约。
- 配置版本基线：业务配置、feature flag、模板复制后租户内版本化的最小契约。
- 种子评测集准备：历史脱敏样本 manifest、配额校验、受控存储链接和后续 eval runner spec。

## Not In M1

- M2 Telegram Bot / Business 渠道生产链路、对话工作台和工单闭环。
- M3 AI 能力、LLM 网关生产流量、prompt/知识/模型路由发布。
- M4 订单 connector、客户资产完整闭环、报价记录生产路径。
- GA-0 真实客户流量、自动回复、蒸馏候选自动生成或正式知识库写入。
- 真实客户明文、截图、语音转写或客户档案进入第三方 LLM。

## Proposed M1 Spec Queue

| 顺序 | Spec ID | 目标 | 主要触碰模块 | 并行限制 | 通过条件摘要 |
|---:|---|---|---|---|---|
| 1 | `M1-01-platform-schema-authz-foundation` | 建立 platform schema、RLS policy、Prisma model、权限事实源和 repository 入口 | `packages/db/**`、`packages/authz/**`、`docs/contracts/**` | `packages/db` schema 全局串行；不得与其他 schema PR 并行 | 多租户 RLS/API guard 基线测试通过；不含业务表 |
| 2 | `M1-02-api-access-context-shell` | 在 Nest API 中接入 Supabase Auth、AccessContext、tenant switch、health/readiness 和审计写入契约 | `apps/api/**`、`packages/authz/**`、`packages/db/**` | 依赖 M1-01；若触碰 schema 仍全局串行 | HTTP guard、伪造 tenant_id、权限撤销和审计契约测试通过 |
| 3 | `M1-03-admin-group-tenant-shell` | 建立集团/租户后台框架、租户切换器、授权入口、发布与验收只读入口 | `apps/admin/**`、`packages/ui-tokens/**` | 不得 import 后端包；只调用 API/WS | A-01/A-02 基础壳 E2E 通过；集团层不显示客户明文 |
| 4 | `M1-04-audit-config-version-foundation` | 落审计与配置版本最小闭环，覆盖权限变更、租户切换、配置保存/回滚契约 | `packages/db/**`、`apps/api/**`、`apps/admin/**` | 若触碰 schema，必须在 M1-01 后串行 | B-05、配置版本与回滚审计测试通过 |
| 5 | `M1-05-eval-seed-manifest-and-runner` | 建立种子评测集 manifest、配额校验和 eval runner 入口 | `packages/evals/**`、`docs/evidence/M1/eval-seed/**`、`docs/evals/**` | 历史样本缺失时只允许 synthetic/redacted fixture 骨架，不得假造真实样本 | G-06 seed quota 校验可运行；真实样本仍受 manifest 签收 |
| 6 | `M1-06-gate-1-go-no-go` | 复判 Gate 1 并归档 Go/No-Go 记录 | `docs/evidence/M1/**`、`docs/preflight/**` | 必须在 OCM-04 合并且 M1 输入排期确认后执行 | Gate 1 八项条件逐条有状态、证据和失败分支 |

后续实现时，一个 PR 只允许实现一个 spec。触碰模块有交集的 spec 禁止并行；任何 `packages/db` schema 变更全局串行。

## Project Inputs

| 输入 | 责任 | 当前状态 | 截止时间 | 失败分支 |
|---|---|---|---|---|
| 历史真实咨询样本脱敏导出 | 项目 owner 提供或确认不可提供；AI agent 检查 manifest 和脱敏摘要 | pending_owner_input | 2026-06-16 23:59 Asia/Tashkent，或项目 owner 在 PR review 中改写 | 缺失、脱敏不合格或不足 60 条时，顺延 M1 eval seed / M2-M3 智能验收；不得伪造样本 |
| Staging/prod Supabase 项目、连接池、Auth、Storage 策略 | 项目 owner 决策；AI agent 更新 infra manifest | pending_owner_input | Gate 1 前给出至少 staging/prod 路线或明确顺延 | 未定则 M1 可做 dev skeleton，但不得关闭生产 readiness |
| Render service creation / Redis / rollback route | 项目 owner 决策；AI agent 更新 manifest/runbook | pending_owner_input | M1 结束前 | 未定则 J-01/J-02 不能关闭 |
| Vercel preview/prod access protection | 项目 owner 决策；AI agent 更新 manifest | pending_owner_input | M1 结束前 | 未定则后台 preview readiness 不能关闭 |

## Gate 1 Status

| Gate 1 条件 | 当前状态 | 备注 |
|---|---|---|
| G1-1 M0 治理骨架 | accepted | `AGENTS.md`、`docs/adr/`、`docs/specs/`、PR 模板与 CI 已就绪 |
| G1-2 CI L2 机器执法 | accepted | CI 已常驻 format/typecheck/lint/depcruise/jscpd/knip/guards/spikes/test/build/size/playwright |
| G1-3 SPK-03 / ADR-001 | accepted | PR #9 合入 |
| G1-4 SPK-04 / ADR-002 | accepted | PR #10 合入 |
| G1-5 ADR-003 | accepted_dev_only__customer_llm_blocked | PR #11 合入；M1 平台骨架可继续，客户 LLM 仍阻断 |
| G1-6 M1 readiness pack | accepted | PR #12 已合入；readiness pack、M1 spec 清单、项目输入排期与平台骨架边界已归档 |
| G1-7 历史样本与种子评测责任 | pending_owner_input | 责任、截止时间与失败分支已记录；样本导出、受控存储和抽样脱敏检查仍待 owner 输入 |
| G1-8 当前 P0 残项 | no_go__owner_inputs_pending | Gate 1 decision 记录为 No-Go；不得进入 M1 实现 |

## Review Notes

- 本 readiness pack 不替代 Gate 1 Go/No-Go 记录。
- OCM-04 已合并；允许继续收集 Gate 1 owner inputs 和准备 spec 文案；实现类 PR 必须等待 Gate 1 Go。
- ADR-003 当前仅允许合成数据、脱敏开发样本、公开知识和非客户明文任务；不得把客户明文送入第三方 LLM。
- 历史样本原始文件不得提交到仓库，manifest 只能记录受控存储位置和脱敏摘要。

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted_via_pr12_merge | PR #12 已合入；若需改历史样本截止时间，应在后续 Gate 1 input PR 中明确 |
| AI agent | accepted | 已按 OCM-04 拆分 M1 scope、spec 队列、项目输入排期和 Gate 1 剩余状态 |

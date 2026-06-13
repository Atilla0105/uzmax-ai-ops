# Gate 0 决策记录：允许创建正式工程仓库/CI

> evidence_id: Gate-0-decision  
> milestone: M0  
> status: draft  
> created_at: 2026-06-13  
> updated_at: 2026-06-13  
> owner: 项目 owner 决策；AI agent 复判与产证据  

## 当前判定

**No-Go / 需要补齐干净 dev 基础设施。**

原因：OCM-00 已按单 owner 模式闭合；OCM-00A 已完成只读平台发现，但未发现可直接签收的干净 UZMAX dev 环境。现有 Supabase 项目均为既有业务/学习项目且存在 RLS disabled 安全红灯；GitHub/Vercel 尚无 UZMAX 项目；LLM key、Telegram 测试 bot、Render/Sentry 仍需按失败分支补齐或顺延。根据控制矩阵，Gate 0 不能跳过真实环境前置条件。

## 复判状态

Gate 0 六项判定条件以 `docs/preflight/00-opening-control-matrix.md` §2 为唯一主源；本表只记录当前状态与证据。

| 条件 ID | 当前状态 | 证据 | 备注 |
|---|---|---|---|
| G0-1 | accepted | `docs/evidence/M0/signoffs/OCM-00-document-baseline-signoff.md` | 单 owner 模式已闭合 |
| G0-2 | accepted | `docs/evidence/M0/signoffs/OCM-00-document-baseline-signoff.md` | 项目 owner 已确认开工口径与阻断规则 |
| G0-3 | blocked_clean_dev_required | `docs/evidence/M0/infra/*-manifest.md` | 已完成只读发现；阻塞点收敛为新建干净 Supabase dev、GitHub/Vercel UZMAX 项目、LLM key 存放策略、Telegram 测试 bot |
| G0-4 | ready_for_review | `docs/specs/M0-01-monorepo-ci-agents.md` | 仅授权治理骨架 |
| G0-5 | ready_for_review | `docs/specs/M0-02-rls-prisma-pool-spike.md`、`docs/specs/M0-03-dual-auth-spike.md`、`docs/specs/M0-04-llm-data-processing-adr.md` | M0 后续项，不代表 Gate 0 已过 |
| G0-6 | ready_for_review | `docs/preflight/00-opening-control-matrix.md` | 失败分支规则已成文 |

## 复判规则

- 每次复判必须逐条更新 G0-1 至 G0-6，并把最终结论写入“当前判定”。
- Go/No-Go 记录本身就是 Gate 0 的法定产出物；不得以口头判断或聊天结论替代。
- Gate 0 Go 后才能创建正式工程仓库/CI；M0-01 只是第一项治理骨架，不代表 M0 全部完成。

## No-Go 处理

- 不创建正式工程仓库/CI，或只保留本地规划包。
- 不启动 M0-01、SPK-03、SPK-04、ADR-003。
- 先完成 OCM-00A 的实际分支：新建干净 `uzmax-dev` Supabase 项目，或显式写入顺延/降级决定；确认 repo 命名、OpenAI key 存放位置、Telegram 测试 bot 策略。

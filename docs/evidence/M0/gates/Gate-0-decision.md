# Gate 0 决策记录：允许创建正式工程仓库/CI

> evidence_id: Gate-0-decision  
> milestone: M0  
> status: draft  
> created_at: 2026-06-13  
> updated_at: 2026-06-13  
> owner: 项目 owner 决策；AI agent 复判与产证据  

## 当前判定

**No-Go / 独立项目部分完成，Supabase 与 secret 输入仍阻塞。**

原因：OCM-00 已按单 owner 模式闭合；GitHub repo 与 Vercel project 已按独立命名创建。Supabase `uzmax-dev` 创建因 free active project limit 2/2 失败；LLM key、Telegram 测试 bot、Render/Sentry 仍需安全输入或登录。根据控制矩阵，Gate 0 不能跳过真实环境前置条件。

## 复判状态

Gate 0 六项判定条件以 `docs/preflight/00-opening-control-matrix.md` §2 为唯一主源；本表只记录当前状态与证据。

| 条件 ID | 当前状态 | 证据 | 备注 |
|---|---|---|---|
| G0-1 | accepted | `docs/evidence/M0/signoffs/OCM-00-document-baseline-signoff.md` | 单 owner 模式已闭合 |
| G0-2 | accepted | `docs/evidence/M0/signoffs/OCM-00-document-baseline-signoff.md` | 项目 owner 已确认开工口径与阻断规则 |
| G0-3 | partially_ready__blocked_by_supabase_limit_and_secret_inputs | `docs/evidence/M0/infra/*-manifest.md` | GitHub/Vercel 已创建；Supabase free project limit、LLM key 存放策略、Telegram 测试 bot、Render/Sentry 登录仍阻塞 |
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
- 先完成 OCM-00A 的实际分支：处理 Supabase free project limit；确认 OpenAI key 存放位置；补 Telegram 测试 bot；登录 Render/Sentry 或写顺延记录。

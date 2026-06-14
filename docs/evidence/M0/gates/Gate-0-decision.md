# Gate 0 决策记录：允许创建正式工程仓库/CI

> evidence_id: Gate-0-decision
> milestone: M0
> status: go
> created_at: 2026-06-13
> updated_at: 2026-06-14
> owner: 项目 owner 决策；AI agent 复判与产证据

## 当前判定

**Go / 允许继续 M0 治理与真实环境 spike。**

原因：OCM-00 已按单 owner 模式闭合；GitHub repo、Supabase dev、Vercel project、OpenAI dev key、Telegram 测试 bot、Sentry project 已创建或验证。Render dashboard 已登录，root `render.yaml` 已由 M0-01 提供 Blueprint 占位。M0-01、M0-02 cleanup、M0-05 PR1/PR2 已合入且 CI 通过。Gate 0 仍只放行 M0 治理与真实环境 spike，不放行业务能力实现或真实客户流量。

## 复判状态

Gate 0 六项判定条件以 `docs/preflight/00-opening-control-matrix.md` §2 为唯一主源；本表只记录当前状态与证据。

| 条件 ID | 当前状态 | 证据 | 备注 |
|---|---|---|---|
| G0-1 | accepted | `docs/evidence/M0/signoffs/OCM-00-document-baseline-signoff.md` | 单 owner 模式已闭合 |
| G0-2 | accepted | `docs/evidence/M0/signoffs/OCM-00-document-baseline-signoff.md` | 项目 owner 已确认开工口径与阻断规则 |
| G0-3 | accepted | `docs/evidence/M0/infra/*-manifest.md` | Gate 0 最低基础设施已满足；Render 服务创建延后到 M0-01 后 |
| G0-4 | accepted | `docs/specs/M0-01-monorepo-ci-agents.md`、PR #1、PR #3、PR #4 | 治理骨架、PR 模板、CI、doc gate 已建立；不包含业务能力 |
| G0-5 | ready_for_review | `docs/specs/SPK-03-rls-prisma-pool.md`、`docs/specs/M0-03-dual-auth-spike.md`、`docs/specs/M0-04-llm-data-processing-adr.md` | SPK-03、SPK-04、ADR-003 仍是 Gate 1 前 P0 |
| G0-6 | accepted | `docs/preflight/00-opening-control-matrix.md`、`docs/evidence/M0/kickoff-readiness-rollup.md` | 失败分支规则已成文；M0-06 rollup 记录当前未闭合项 |

## 复判规则

- 每次复判必须逐条更新 G0-1 至 G0-6，并把最终结论写入“当前判定”。
- Go/No-Go 记录本身就是 Gate 0 的法定产出物；不得以口头判断或聊天结论替代。
- Gate 0 Go 后才能创建正式工程仓库/CI；M0-01 只是第一项治理骨架，不代表 M0 全部完成。

## Go 范围

- 允许继续 M0：SPK-03、SPK-04、ADR-003 与必要的治理/evidence 整理。
- 不允许夹带业务能力实现、真实客户流量、真实订单写入、自动回复或生产知识库写入。
- SPK-03、SPK-04、ADR-003 仍必须在 M0 内完成；真实客户消息进入 LLM 前必须通过 ADR-003。

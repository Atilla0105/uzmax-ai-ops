# M1-06 Gate 1 Go/No-Go

## 目标

复判 Gate 1 是否允许进入 M1 平台骨架实现，把 PR #15 合并后的 owner-local 脱敏 seed review 状态、配额复核、脱敏残留复核和 M1 允许范围写入正式证据。本 spec 只做 Gate 1 docs-only 复判，不实现 M1 schema、API、后台、eval runner 或任何业务能力。

## Owner

Owner：项目 owner 对是否允许进入 M1 平台骨架作最终判定，并确认仓库外 80 条 seed review 可作为 Gate 1 的 `sample_ready` 输入；AI agent 负责复核 Gate 1 八项条件、检查仓库外脱敏样本摘要、更新 evidence、运行验证并暴露仍未关闭的 M1/M2/M3 风险。

## 时间盒

0.25 个工作日。若 seed review 配额、脱敏残留、owner 签收或 Gate 1 八项条件任一不成立，则保持 No-Go，不得进入 M1 实现。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M1-06-gate-1-go-no-go.md`
  - `docs/evidence/M1/gates/Gate-1-decision.md`
  - `docs/evidence/M1/eval-seed/history-samples-manifest.md`
  - `docs/evidence/M1/M1-platform-skeleton-readiness-pack.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只更新 Gate 1 复判证据和 M1 readiness 的当前状态。
  - 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；更新 Gate 1 decision、history samples manifest 和 M1 readiness pack 的复判状态。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `Gate 1`、`M1-06`、`sample_ready`、`redacted_seed_review`、`history-samples`，确认现有证据仍停留在 No-Go / human review pending 状态，需要 docs-only 复判。
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated
- 判断依据：本 PR 只更新 Gate 1 evidence/spec，不新增真实 eval fixtures、contracts、observability、environment 或 release 能力路径；`guard:doc-triggers` 必须保持通过。

## 前置条件

- PR #15 已合并到 `main`，记录 owner-local Telegram 真实导出和仓库外脱敏 seed review。
- 当前仓库外 seed review 文件位于 owner-local controlled storage，不提交 Git。
- `docs/evidence/M1/gates/Gate-1-decision.md` 当前为 `no_go__redacted_seed_review_pending`。
- 项目 owner 已在 2026-06-17 指示完成本窗口 Gate 1 Go/No-Go 复判，M1 作为新阶段另开窗口。

## 实施步骤

1. 新增本 spec，限定本 PR 为 docs-only Gate 1 复判。
2. 复核 Gate 1 八项条件：M0 治理、CI、SPK-03、SPK-04、ADR-003、M1 readiness、历史样本输入与当前 P0 残项。
3. 在仓库外只读检查 seed review 摘要：唯一记录数、字段完整性、意图/语言/红线配额、明显敏感模式残留和不可提交规则。
4. 更新 history samples manifest，将状态从 `redacted_seed_review_ready__human_review_pending` 调整为 `sample_ready__gate1_go`，但明确 G-06 仍需 M1-05 runner 和正式入集校验后关闭。
5. 更新 Gate 1 decision 为 Go，只允许 M1 平台骨架范围，继续阻断 M2/M3/M4、GA-0、客户 LLM 和真实客户明文进入第三方 LLM。
6. 更新 M1 readiness pack 中已过时的 Gate 1 输入状态，指向当前 Gate 1 decision。
7. 运行格式、doc trigger、PR shape 和本地验证命令。

## 通过条件

- Gate 1 八项条件逐项有状态、证据和备注。
- `docs/evidence/M1/gates/Gate-1-decision.md` 明确 Go 的允许范围和仍禁止范围。
- `docs/evidence/M1/eval-seed/history-samples-manifest.md` 记录 seed review 复核摘要，但不提交真实样本、脱敏 JSONL/CSV、截图、语音、订单号、电话或地址。
- `docs/evidence/M1/M1-platform-skeleton-readiness-pack.md` 不再把历史样本误标为 pending。
- 本 PR 不改 `apps/`、`packages/`、schema、migration、CI workflow、provider、connector 或 adapter。
- 本 PR 通过 Prettier、doc triggers、PR shape 与必要本地检查。

## 失败分支

- 若 seed review 不足 60 条、字段不完整、明显脱敏残留不为 0 或类别不达标：Gate 1 保持 No-Go，重新脱敏或补样。
- 若 owner 不确认 `sample_ready`：Gate 1 保持 No-Go 或改走 `sample_deferred`，不得进入 M1 实现。
- 若 Gate 1 任一 P0 条件退化：保持 No-Go，按对应 ADR/spec 修复后再复判。
- 若发现需要消费真实明文、提交仓库外 JSONL/CSV 或让客户数据进入第三方 LLM：关闭本复判，回到 ADR-003 风险处理。

## 不做什么

- 不提交真实客户样本、脱敏 JSONL/CSV、截图、语音、订单号、电话、地址、支付信息或客服个人账号。
- 不实现 M1 schema、API、authz、后台页面、eval runner 或测试。
- 不关闭 G-06；G-06 需 M1-05 的 runner、manifest 入集和配额校验后另行关闭。
- 不放行 M2/M3/M4、GA-0、真实客户流量、自动回复、客户 LLM 或蒸馏候选自动写库。
- 不修改 GitHub ruleset、CI workflow、Supabase/Render/Vercel/Sentry 配置。

## 验收映射

- Gate 1：允许进入 M1 平台骨架。
- G-06：确认 seed 输入已可用于 M1-05，但不关闭 G-06。
- J-05：里程碑证据滚动归档，不把 Gate 1 判定留到 M6。
- K-03：本 PR 有独立 spec。
- K-04：触碰模块清单约束本 PR 范围。

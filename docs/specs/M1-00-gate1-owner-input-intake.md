# M1-00 Gate 1 Owner Input Intake

## 目标

把 Gate 1 当前唯一未闭合的 owner input 变成可执行、可复判、可失败分支的补充包：历史真实咨询样本导出或明确顺延结论、受控存储位置与访问方式、抽样脱敏检查许可。本 spec 只更新 Gate 1 输入状态与复判准备，不放行 M1 实现。

## Owner

Owner：项目 owner 决定是否提供历史样本、是否顺延样本、受控存储访问方式和抽样检查许可；AI agent 执行证据更新、复核脱敏/配额要求、准备后续 Gate 1 Go/No-Go 复判。

## 时间盒

0.25 个工作日。若本 PR 合并时仍未拿到真实样本或明确顺延结论，则 Gate 1 保持 No-Go，只记录下一步 owner 决策缺口。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M1-00-gate1-owner-input-intake.md`
  - `docs/evidence/M1/eval-seed/history-samples-manifest.md`
  - `docs/evidence/M1/gates/Gate-1-decision.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只定义 Gate 1 owner input 的补充路径和复判分支。
  - 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec；更新 M1 history samples manifest 与 Gate 1 decision 的补充路径。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `M1-00`、`Gate 1`、`owner input`、`历史样本`、`受控存储`、`抽样脱敏`，确认现有文档只有 pending 状态，缺少执行级 intake 分支。
- 外部 API/SDK/provider/connector/adapter 依据：无。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated
- 判断依据：本 PR 只更新 evidence/spec，不新增真实 eval fixtures、contracts、observability、environment 或 release 能力路径；`guard:doc-triggers` 必须保持通过。

## 前置条件

- M0 closeout 已通过 PR #13 合入。
- M0-10 local validation hygiene 已通过 PR #14 合入。
- `docs/evidence/M1/gates/Gate-1-decision.md` 当前为 No-Go / owner inputs pending。
- 项目 owner 已在 2026-06-17 指示按既定计划补齐 Gate 1 输入。

## 实施步骤

1. 新增本 spec，限定本 PR 为 docs-only owner input intake。
2. 更新 history samples manifest，明确补齐 Gate 1 的两条合法分支：
   - `sample_ready`：提供脱敏样本、受控存储、抽样检查许可。
   - `sample_deferred`：明确样本不可按期提供，顺延 M1 eval seed 与 M2/M3 智能验收，只允许准备或执行不消费真实样本的平台骨架工作。
3. 更新 Gate 1 decision，记录 M1-00 为下一步补充动作；在没有真实样本或明确顺延前保持 No-Go。
4. 运行格式、doc trigger、PR shape 和本地验证命令。

## 通过条件

- `docs/evidence/M1/eval-seed/history-samples-manifest.md` 写清补充字段、分支判定和不得提交客户明文的规则。
- `docs/evidence/M1/gates/Gate-1-decision.md` 仍不误放行 M1 实现，并指向 M1-00 作为 owner input intake。
- 本 PR 不改 `apps/`、`packages/`、schema、migration、CI workflow、provider、connector 或 adapter。
- 本 PR 通过 Prettier、doc triggers、PR shape 与必要本地检查。

## 失败分支

- 若项目 owner 提供脱敏样本但样本不足 60 条、类别不达标或脱敏失败：关闭该批次，Gate 1 保持 No-Go，重新导出或改走 `sample_deferred`。
- 若项目 owner明确样本暂不可提供：记录 `sample_deferred`，顺延 M1 eval seed 与 M2/M3 智能验收；是否允许 M1 平台骨架进入 dev skeleton 由后续 Gate 1 Go/No-Go PR 单独复判。
- 若受控存储位置或访问方式不成立：不得消费样本，Gate 1 保持 No-Go。
- 若发现需要改变 Gate 1 判定口径：另开 Gate 1 Go/No-Go spec，不在本 intake PR 夹带实现。

## 不做什么

- 不提交真实客户样本、截图、语音、订单号、电话、地址、支付信息或客服个人账号。
- 不实现 M1 schema、API、authz、后台页面、eval runner 或测试。
- 不放行 M2/M3/M4 能力、GA-0 真实流量或客户明文进入第三方 LLM。
- 不修改 GitHub ruleset、CI workflow、Supabase/Render/Vercel/Sentry 配置。

## 验收映射

- G-06：种子评测集配额与 owner input 分支准备。
- J-05：里程碑证据滚动归档，不把 Gate 1 输入状态留到 M6。
- K-03：本 PR 有独立 spec。
- K-04：触碰模块清单约束本 PR 范围。

# UZMAX AI Ops

UZMAX 智能运营系统是 UZMAX 内部多租户 AI 运营平台。1.0 目标是可正式运营的内部平台，不是 MVP，不做外部 SaaS 商业化。产品范围以 `UZMAX智能运营系统-PRD-v1.1.md` 为准，技术边界以 `UZMAX智能运营系统-技术架构-v1.1.md` 为准，后台体验以 `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` 为准，发布阻断以 `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` 为准。

## 当前阶段

当前主线状态：M6/M6B 已按 evidence/runtime-hardening no-go package 关闭；`docs/evidence/M6B/M6B-17-ga0-external-blocker-rollup.md` 已清除 GA-0 activation 的 external-input blocker class。GA-0、production、真实客户/订单数据、customer LLM、真实 provider 调用、P1 风险接受和 1.0 release 仍全部锁定，必须由项目 owner 显式决策。

当前入口：

- `docs/release.md`：当前发布边界和 GA-0/1.0 锁定状态。
- `docs/evidence/M6B/README.md`：当前 M6B runtime/external-input closure truth。
- `docs/evidence/M6/README.md`：M6 历史 no-go package 和被 M6B-17 superseded 的 blocker 说明。
- `docs/admin-design-system.md`、`PRODUCT.md`、`DESIGN.md`、`docs/evidence/M7/README.md`：当前视觉系统标准源、Impeccable 采纳边界和后续 UI 切片队列；不替代四份 v1.1 真源。
- `docs/specs/`：任何新增工作必须先有一个 spec；一个 PR 只实现一个 spec。

此阶段允许继续做有 spec 的 current-state 对齐、GA-0 activation 后续证据、后台/运行时补缝、测试和文档治理；不允许把 M6B-17 解读为 GA-0 或 1.0 release approval。

## 开始

```bash
npm ci
npm run check
```

常用分项检查：

```bash
npm run format:check
npm run typecheck
npm run lint
npm run depcruise
npm run guard:pr-shape -- --base origin/main
npm run test
npm run build
```

Admin 已包含证据驱动的运营台壳、发布/验收 gate 状态和 M2-M6/M6B 相关只读入口，可构建但不代表业务后台、GA-0 或 1.0 已完成：

```bash
npm run build:admin
npm --workspace @uzmax/admin start
```

## 必读文档

- `AGENTS.md`：AI agent 宪法、依赖边界、禁止模式、PR hygiene 和 review checklist。
- `UZMAX智能运营系统-PRD-v1.1.md`：产品范围、non-goals、1.0 成功标准。
- `UZMAX智能运营系统-技术架构-v1.1.md`：架构、monorepo 边界、AI 开发治理。
- `UZMAX智能运营系统-后台设计与前端架构-v1.1.md`：后台信息架构、设计 token、前端质量预算。
- `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`：P0/P1/P2 验收与发布阻断。
- `docs/admin-design-system.md`：M7-03 视觉系统标准源稿，来自 owner 原型、v1.1 文档和 Design Skill Layer。
- `PRODUCT.md` / `DESIGN.md`：Impeccable / Design Skill Layer 的产品型 UI brief 与执行边界。
- `docs/README.md`：docs 目录地图和事实主源索引。
- `docs/doc-gates.md`：文档按真实能力生长的触发矩阵。
- `docs/specs/`：每个可执行任务的目标、触碰范围、通过条件和失败分支。
- `docs/evidence/`：Gate、infra、spike、签收和验证证据索引。
- `docs/runbooks/`：生产与演练操作入口。

## 当前禁止事项

- 禁止无 spec 开工。
- 禁止把历史 Gate 0/M0/M6 no-go 快照当作当前决策状态。
- 禁止把 M6B-17 external-input closure 解读为 GA-0、production、真实数据、customer LLM、真实 provider 或 1.0 批准。
- 禁止在 `engine` 写业务线词汇，禁止跨 capability import。
- 禁止让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 禁止真实客户消息进入第三方 LLM，除非 ADR-003 和对应证据已满足要求。
- 禁止提交 secret、真实客户明文、未脱敏样本或平台 token。
- 禁止通过删除测试、降低断言、`.skip`/`.only`、扩大 mock 或快照膨胀来让 CI 通过。

## 文档原则

`AGENTS.md` 保持稳定规则，`README.md` 作为人类入口，spec 承载单项任务边界，ADR 记录决策，evidence 记录状态和证据。阶段性手册按 `docs/doc-gates.md` 的触发矩阵生长：真实能力、路径或闸门出现后再补，不提前制造第二套散文真源。

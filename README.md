# UZMAX AI Ops

UZMAX 智能运营系统是 UZMAX 内部多租户 AI 运营平台。1.0 目标是可正式运营的内部平台，不是 MVP，不做外部 SaaS 商业化。产品范围以 `UZMAX智能运营系统-PRD-v1.1.md` 为准，技术边界以 `UZMAX智能运营系统-技术架构-v1.1.md` 为准，后台体验以 `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` 为准，发布阻断以 `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` 为准。

## 当前阶段

Gate 0 已允许进入 M0 治理与 CI 骨架。当前仓库已有 monorepo 空骨架、CI、`AGENTS.md`、spec、ADR、runbook 和 evidence 目录。此阶段不放行业务能力实现或真实客户流量；任何新增模块、页面、能力或文档机制都必须先有 `docs/specs/` 下的 spec。

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

Admin 当前是最小 Vite 骨架，可构建但不代表业务后台已完成：

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
- `docs/README.md`：docs 目录地图和事实主源索引。
- `docs/doc-gates.md`：文档按真实能力生长的触发矩阵。
- `docs/specs/`：每个可执行任务的目标、触碰范围、通过条件和失败分支。
- `docs/evidence/`：Gate、infra、spike、签收和验证证据索引。
- `docs/runbooks/`：生产与演练操作入口。

## 当前禁止事项

- 禁止无 spec 开工。
- 禁止把空骨架当真实能力，并提前创建散文式未来手册。
- 禁止在 `engine` 写业务线词汇，禁止跨 capability import。
- 禁止让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 禁止真实客户消息进入第三方 LLM，除非 ADR-003 和对应证据已满足要求。
- 禁止提交 secret、真实客户明文、未脱敏样本或平台 token。
- 禁止通过删除测试、降低断言、`.skip`/`.only`、扩大 mock 或快照膨胀来让 CI 通过。

## 文档原则

`AGENTS.md` 保持稳定规则，`README.md` 作为人类入口，spec 承载单项任务边界，ADR 记录决策，evidence 记录状态和证据。阶段性手册按 `docs/doc-gates.md` 的触发矩阵生长：真实能力、路径或闸门出现后再补，不提前制造第二套散文真源。

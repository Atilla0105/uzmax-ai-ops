# ADR

本目录记录架构决策与 spike 结论。ADR 用来防止后续 agent 在不了解背景时“优化”掉关键设计。

## 命名

- `ADR-001-rls-prisma-pool.md`
- `ADR-002-dual-auth-access-context.md`
- `ADR-003-llm-data-processing.md`
- `ADR-B01-telegram-business.md`
- `ADR-B02-order-api.md`

## 编号规则

- 技术地基和数据处理 ADR 使用数字序列：`ADR-001-*`、`ADR-002-*`、`ADR-003-*`。
- 外部业务依赖使用 B 序列：`ADR-B01-*`、`ADR-B02-*`。
- 下一个通用技术 ADR 用 `ADR-004-*`；下一个外部依赖 ADR 用 `ADR-B03-*`。

## 必填字段

- 状态：proposed / accepted / superseded
- 日期
- Owner：项目 owner 决策点与 AI agent 验证责任
- 时间盒
- 背景
- 决策
- 判定分支
- 备选方案
- 验证证据
- 失败分支
- 影响范围

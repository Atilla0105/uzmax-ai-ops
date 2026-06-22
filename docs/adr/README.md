# ADR

本目录记录架构决策与 spike 结论。ADR 用来防止后续 agent 在不了解背景时“优化”掉关键设计。

## 命名

- `ADR-001-rls-prisma-pool.md`
- `ADR-002-dual-auth-access-context.md`
- `ADR-003-llm-data-processing.md`
- `ADR-B01-telegram-business.md`
- `ADR-B02-order-api.md`

## 当前索引

| ADR | 状态 | 结论 |
|---|---|---|
| `ADR-B01-telegram-business.md` | accepted | `no_go_owner_inputs_missing`; M2 缺真实 Telegram Business 账号/实测证据，Business 模块当前关闭，C-03b 成为 P0 |
| `ADR-B02-order-api.md` | accepted/current branch | `no_api_for_m4__import_snapshot_main_path`; 2026-06-22 owner input “暂时没有api”，E-01 当前不阻断，E-02 导入快照为 P0 主路径，E-03/E-04 仍 P0 |

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

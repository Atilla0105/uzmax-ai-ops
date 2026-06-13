# 外部依赖 Spike 开工索引

来源主源：

- 执行步骤、通过条件、失败分支：`docs/specs/SPK-01-telegram-business.md`、`docs/specs/SPK-02-order-api.md`
- 验收分支与 P0/P1 影响：`UZMAX智能运营系统-1.0验收矩阵-v1.1.md` §13
- 技术边界：`UZMAX智能运营系统-技术架构-v1.1.md` §5、§8

本文件只做 preflight 路由，不复写 spike 细节。

## 索引

| Spike | 执行 spec | 输入 owner | ADR 输出 | 证据目录 | 最晚闸门 |
|---|---|---|---|---|---|
| SPK-01 Telegram Business | `docs/specs/SPK-01-telegram-business.md` | 项目 owner 提供或授权真实账号与测试会话 | `docs/adr/ADR-B01-telegram-business.md` | `docs/evidence/M2/spikes/SPK-01-telegram-business/` | M2 |
| SPK-02 订单 SaaS API | `docs/specs/SPK-02-order-api.md` | 项目 owner 提供 API 文档/沙箱凭据或确认无 API | `docs/adr/ADR-B02-order-api.md` | `docs/evidence/M4/spikes/SPK-02-order-saas-api/` | M4 |

## Preflight 规则

- 不接受纯 mock 结论。
- 到期无结论时按对应 spec 的不可行分支执行。
- 发布签收时引用 ADR、证据目录、feature flag 或 connector 配置快照。

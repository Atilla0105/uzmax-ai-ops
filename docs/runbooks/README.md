# Runbooks

本目录保存生产与演练操作手册。任何 P0 运维验收都必须能链接到对应 runbook 或演练证据。

## 首批 runbook

- `ci-gate-failure.md`：CI 门禁失败
- `rls-misconfig.md`：RLS 误配
- `deploy-rollback.md`：api / worker 回滚演练
- `queue-failure-injection.md`：worker 积压、队列重试/幂等、订单导入异常路径演练
- `backup-restore.md`：数据库备份与恢复演练
- `secret-token-rotation.md`：Bot token、LLM key、服务角色 key 轮换
- bot 无响应
- 模型全挂
- 红线误发
- 订单 API 挂
- AI 熔断与恢复

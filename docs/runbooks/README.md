# Runbooks

本目录保存生产与演练操作手册。任何 P0 运维验收都必须能链接到对应 runbook 或演练证据。

## 首批 runbook

- `ci-gate-failure.md`：CI 门禁失败
- `rls-misconfig.md`：RLS 误配
- `deploy-rollback.md`：api / worker 回滚演练
- `queue-failure-injection.md`：worker 积压、队列重试/幂等、订单导入异常路径演练
- `backup-restore.md`：数据库备份与恢复演练、素材 `storageRef` / Telegram `file_id` 安全边界
- `secret-token-rotation.md`：Bot token、LLM key、服务角色 key 轮换
- `ai-safety-fuse.md`：模型全挂、红线误发、AI 熔断与恢复演练
- `telegram-bot-main-path.md`：bot 无响应、重复/乱序入站、Business 关闭边界与人工留单
- `core-ops-synthetic-e2e.md`：对话、工单、客户资产、订单、确认队列、日志与后台可见性的合成闭环演练
- 订单 API 挂 / 无 API 分支：当前 ADR-B02 口径下以导入快照作为订单数据主路径，相关证据见 `docs/evidence/M4/README.md` 和 `docs/runbooks/core-ops-synthetic-e2e.md`；未来若重新打开真实订单 API 分支，必须先有 spec/ADR-B evidence，再补 dedicated runbook。

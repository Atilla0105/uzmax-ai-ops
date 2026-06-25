# Runbook: 数据库备份与恢复演练

## 适用场景

J-03 数据库备份与恢复验收，或 Supabase 数据误删/误迁移恢复演练。

This runbook does not approve production restore, production traffic, real customer/order data, customer LLM, provider calls, GA-0 or 1.0 release.

## 安全前置

1. 确认 safe restore target：必须是项目 owner 明确批准可覆盖的测试库或 staging 等价环境。
2. 禁止直接覆盖生产库；恢复到测试库。
3. 记录 backup snapshot 或 PITR 时间点、来源环境、目标环境和数据敏感级别。
4. 不在 repo、PR、Linear、日志或截图中粘贴 DB URL、service role key、Storage key、JWT secret、Bot token、LLM key 或其他 secret。
5. 如果没有 safe restore target、backup snapshot 或 owner 批准，本次只能记录 blocker；不得写“恢复已通过”。

## 处理步骤

1. 确认备份时间点、目标恢复环境和数据敏感级别。
2. 在 owner-approved safe restore target 执行恢复；禁止生产覆盖。
3. 验证租户表、RLS 策略、审计日志、Storage 引用一致性。
4. 运行基础权限/RLS 回归测试。
5. 验证 `audit_log`、`config_version`、confirmation/formal-write 路径和 template-copy DRAFT 版本仍可读写或按预期 fail closed。
6. 验证素材引用：`storageRef` 是素材本体/恢复来源；Telegram `file_id` 只能视为 provider cache，不得作为换 token 后的重建来源。
7. 对素材与截图类证据只记录 manifest/ref/hash/owner confirmation status；不提交原图、OCR、客户明文或 raw payload。
8. 归档备份来源、恢复命令类别、校验结果、残留清理结果和项目 owner 确认。

## Asset / Material Safety Drill

| Check | Expected result |
|---|---|
| `media_asset.storageRef` / screenshot `storageRef` | Controlled `storage://` ref remains the durable material body pointer. |
| Telegram `file_id` | Treated only as cache/provider metadata; token rotation must not depend on it for rebuild. |
| Confirmation queue | Pending/discarded/blocked candidates do not formally write. |
| Formal write | Approved/edited decisions write only to the named `config_version` + `audit_log` path. |
| Template copy | Tenant copy stays DRAFT and does not auto-overwrite production config. |
| Quick reply | Current quick-reply template-copy proof is partial; full public/private search/import/export/permission remains a separate release gap. |

## 失败分支

| Failure | Required action |
|---|---|
| 无 safe restore target 或 owner 批准 | J-03 不通过；不得进入正式发布。 |
| 无法恢复到测试库 | J-03 不通过；不得进入正式发布。 |
| RLS 或权限回归失败 | 保持 GA-0/1.0 closed，拆修复 spec。 |
| `audit_log` / `config_version` / confirmation formal-write 校验失败 | 保持发布关闭，拆修复 spec。 |
| Storage 引用无法恢复，或依赖 Telegram `file_id` 作为本体 | H-05 不通过，拆 asset recovery spec。 |
| 需要 raw customer/order/TG/screenshot/secret 材料进 repo | 停止演练，转 owner-controlled storage，不提交。 |

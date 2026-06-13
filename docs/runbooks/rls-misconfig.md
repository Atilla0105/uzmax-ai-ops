# Runbook: RLS 误配

## 适用场景

RLS 策略、`set_config` 上下文、连接池模式或 Prisma 注入路径导致越权、空读异常或串话风险。

## 处理步骤

1. 立即关闭相关部署或阻断合并。
2. 运行 SPK-03 并发压测用例。
3. 检查连接池模式、事务范围、`is_local=true`、RLS policy。
4. 若 transaction mode 不成立，按 ADR-001 失败分支改 session mode、关键路径直连或 repository 强隔离。
5. 归档复现命令、失败样例和修复结果。

## 失败分支

无法证明零串话时关闭 M1 开工授权，不得继续业务 schema 实现。


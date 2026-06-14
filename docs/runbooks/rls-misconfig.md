# Runbook: RLS 误配

## 适用场景

RLS 策略、`set_config` 上下文、连接池模式或 Prisma 注入路径导致越权、空读异常或串话风险。

## 处理步骤

1. 立即关闭相关部署或阻断合并。
2. 确认 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 是否存在、是否指向预期 Supabase dev/staging 环境，且未提交到仓库。
3. 运行 SPK-03 并发压测用例：

```bash
npm run -w @uzmax/db prisma:generate
UZMAX_RLS_SET_ROLE=uzmax_spk03_ci npm run -w @uzmax/db spike:rls-prisma-pool
```

4. 检查连接池模式、事务范围、`is_local=true`、`SET LOCAL ROLE`、RLS policy。
5. 若使用 `postgres.<project-ref>` pooler 用户，确认事务内已切到非 `bypassrls` role；禁止用 `postgres` 直接读取作为通过证据。
6. 若 transaction mode 不成立，按 ADR-001 失败分支改 session mode、关键路径直连或 repository 强隔离。
7. 归档复现命令、失败样例和修复结果到 `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md` 或后续里程碑 evidence。

## 失败分支

无法证明零串话时关闭 M1 开工授权，不得继续业务 schema 实现。

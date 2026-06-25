# Runbook: RLS 误配

## 适用场景

RLS 策略、`set_config` 上下文、连接池模式或 Prisma 注入路径导致越权、空读异常或串话风险。

## 处理步骤

1. 立即关闭相关部署或阻断合并。
2. 确认 GitHub Actions secret `UZMAX_RLS_DATABASE_URL` 是否存在、是否指向预期 Supabase dev/staging 环境，且未提交到仓库。
   - SPK-03 accepted dev evidence 使用 transaction pooler `aws-1-ap-south-1.pooler.supabase.com:6543`。
   - CI 会追加 `connection_limit=16&pool_timeout=60`，并设置 `UZMAX_RLS_SPIKE_CONCURRENCY=16`。
3. 运行 SPK-03 并发压测用例：

```bash
npm run -w @uzmax/db prisma:generate
UZMAX_RLS_SET_ROLE=uzmax_spk03_ci \
UZMAX_RLS_SPIKE_CONCURRENCY=16 \
npm run -w @uzmax/db spike:rls-prisma-pool
```

4. 检查连接池模式、事务范围、`is_local=true`、`SET LOCAL ROLE`、RLS policy。
5. 若使用 `postgres.<project-ref>` pooler 用户，确认事务内已切到非 `bypassrls` role；禁止用 `postgres` 直接读取作为通过证据。
6. 若 SPK-03 step 长时间无进展，先确认 Prisma URL 是否包含 `pgbouncer=true`，CI 是否追加 `connection_limit=16&pool_timeout=60`，且 harness 使用 batch `$transaction([...])` 而不是 interactive transaction callback。
7. 若 transaction mode 不成立，按 ADR-001 失败分支改 session mode、关键路径直连或 repository 强隔离。
8. 归档复现命令、失败样例和修复结果到 `docs/evidence/M0/spikes/SPK-03-rls-prisma-pool/manifest.md` 或后续里程碑 evidence。

## M6-04 release drill

M6-04 只记录 release-level RLS/authz 证据矩阵，不使用真实客户、订单或 Telegram 数据。Release drill 可以在 dev/staging/CI 环境执行：

```bash
npm run -w @uzmax/db prisma:generate
UZMAX_RLS_SET_ROLE=uzmax_spk03_ci \
UZMAX_RLS_SPIKE_CONCURRENCY=16 \
npm run -w @uzmax/db spike:rls-prisma-pool

node --test scripts/tests/m6-rls-authz-release-matrix.test.mjs
node --test scripts/tests/m1-02-api-access-context.test.mjs
node --test scripts/tests/m1-platform-foundation.test.mjs
node --test scripts/tests/m4-order-import-rls-batch-runner-contract.test.mjs
node --test scripts/tests/m4-order-import-rls-transaction-gateway-contract.test.mjs
node --test scripts/tests/m5r-true-integration-closeout.test.mjs
```

| Failure | Required action |
|---|---|
| Cross-tenant or zero-leakage evidence fails | Close release/GA-0 authorization and create a serialized RLS/schema fix spec if schema/policy changes are needed. |
| forged tenant or org context is accepted | Close release/GA-0 authorization; fix backend access-context loading before any frontend/admin claim is counted. |
| Backend permission guard is missing or frontend-only hiding is the only control | Close release/GA-0 authorization; add backend enforcement before reopening the gate. |
| Group role can reach customer plaintext outside aggregate views | Close release/GA-0 authorization and keep B-03 open in final acceptance rollup. |
| Audit evidence lacks actor/time/before/after where required | Keep B-05 and final release gate open until evidence is fixed or explicitly no-go. |
| Drill needs secrets or real customer/order data in repo | Stop and move evidence handling to owner-controlled storage; do not commit sensitive data. |

## 失败分支

无法证明零串话时关闭相关发布/GA-0 授权，不得继续业务 schema 实现或扩大真实数据范围。

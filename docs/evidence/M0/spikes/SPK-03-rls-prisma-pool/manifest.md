# SPK-03 RLS x Prisma x 连接池证据

> evidence_id: SPK-03-rls-prisma-pool
> milestone: M0
> status: blocked_pending_database_pooler_secret
> created_at: 2026-06-14
> updated_at: 2026-06-14
> owner: 项目 owner 确认数据库 secret 与隔离风险；AI agent 执行 spike、验证和归档
> sensitive_data_location: GitHub Actions secret `UZMAX_RLS_DATABASE_URL` / local env only; no secret in repo
> redaction_status: no secret or customer data included

## 当前结论

SPK-03 尚未 accepted。真实 Supabase SQL/RLS 基线已建立并验证，但 Prisma 通过 pooler 的 2000 次并发压测还缺 database pooler secret，GitHub Actions 也缺 `UZMAX_RLS_DATABASE_URL`。

Gate 1 仍被 SPK-03 阻断。

## 环境

| 项目 | 值 |
|---|---|
| Supabase project | `uzmax-dev` / `enyocaykcgcfcswycujg` |
| Region | `ap-south-1` |
| Postgres | 17.6 |
| Pooler host tested | `aws-0-ap-south-1.pooler.supabase.com` |
| Session pooler port | 5432 reachable |
| Transaction pooler port | 6543 reachable |
| Direct host | `db.enyocaykcgcfcswycujg.supabase.co` did not resolve from local environment |
| Prisma version | 6.19.3 |

## Applied Spike Objects

The SQL shape is recorded in `packages/db/spikes/spk03-rls-prisma-pool.sql`.

Applied to Supabase dev via Supabase connector:

- `spk03` schema.
- `spk03.rls_items` table.
- RLS enabled and forced on `spk03.rls_items`.
- tenant select policy using `current_setting('app.org_id', true)` and `current_setting('app.tenant_id', true)`.
- restricted role `uzmax_spk03_ci` with `nobypassrls`.
- `grant uzmax_spk03_ci to postgres` so a `postgres.<project-ref>` pooler session can `SET LOCAL ROLE uzmax_spk03_ci` before tenant reads.
- two rows for tenant A and two rows for tenant B.

No customer, order, conversation, knowledge-base or production business schema was created.

## Verified Commands And Results

| Check | Command / method | Result |
|---|---|---|
| Supabase read connectivity | Supabase connector `select current_database(), current_user, current_setting('server_version')` | passed; database `postgres`, user `postgres`, server `17.6` |
| Role presence | Supabase connector `select rolname, rolcanlogin, rolbypassrls from pg_roles where rolname like 'uzmax_spk03%'` | passed; role `uzmax_spk03_ci` can login and `rolbypassrls = false` |
| RLS active under restricted role | Supabase connector transaction with `set local role uzmax_spk03_ci` | passed; `current_user = uzmax_spk03_ci`, `row_security_active = true` |
| Tenant A isolation through SQL | same connector transaction with tenant A context | passed; only `tenant-a-row-1`, `tenant-a-row-2` returned |
| Prisma client generation | `npm ci`; `npm run -w @uzmax/db prisma:generate` | passed locally after cleaning stale workspace-local `packages/db/node_modules` |
| npm high audit | `npm audit --audit-level=high` | passed locally; no vulnerabilities reported after pinning Prisma 6.19.3 |
| Pooler custom role login | Prisma harness with `uzmax_spk03_ci.<project-ref>` session pooler username | failed; Supavisor returned `tenant/user ... not found` |
| Pooler unqualified custom role login | Prisma harness with `uzmax_spk03_ci` session pooler username | failed; Supavisor returned `no tenant identifier provided` |
| Privileged role password rotation | Supabase connector `alter role postgres with password ...` | failed; permission denied to alter privileged role |

## CI Hook

`.github/workflows/ci.yml` now includes:

- `npm run -w @uzmax/db prisma:generate`
- `UZMAX_RLS_SET_ROLE=uzmax_spk03_ci npm run -w @uzmax/db spike:rls-prisma-pool`

Expected secret:

- `UZMAX_RLS_DATABASE_URL`: Supabase session pooler or approved direct connection URL. It must not be committed to the repository.

Until this secret exists, GitHub Actions should fail instead of silently skipping SPK-03.

## Official Reference Notes

- Supabase Connect to Postgres docs: session pooler uses port 5432 and transaction pooler uses port 6543; direct connections may require IPv6 or the IPv4 add-on.
- Supabase Connect to Postgres docs: transaction mode does not support prepared statements.
- Supabase Prisma docs: Prisma should use the Supavisor session pooler string unless direct connection is available.

## Remaining Blocker

The project owner must provide or configure a Supabase database connection URL in GitHub Actions secret `UZMAX_RLS_DATABASE_URL`, or approve an equivalent platform operation that creates one.

After that, rerun:

```bash
npm run -w @uzmax/db prisma:generate
UZMAX_RLS_SET_ROLE=uzmax_spk03_ci npm run -w @uzmax/db spike:rls-prisma-pool
```

Acceptance requires at least 2000 interleaved tenant requests with zero cross-tenant rows, plus missing-context, wrong-context and transaction-cleanup negative cases passing in CI.

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | pending_database_secret | 需提供或配置 `UZMAX_RLS_DATABASE_URL` |
| AI agent | evidence_partial | SQL/RLS baseline verified; Prisma harness and CI hook ready; CI proof pending secret |

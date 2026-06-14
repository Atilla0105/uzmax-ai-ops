# M0-03 SPK-04 双鉴权链路 Spike

## 目标

验证 Supabase Auth 只负责身份认证，后端表作为权限唯一事实源，并由后端 guard 生成 `AccessContext{orgId, tenantIds, permissions}` 后贯穿 HTTP、WebSocket、租户切换缓存失效、RLS 会话变量与 Supabase Storage 签名 URL 校验。结论写入 ADR-002。

## Owner

Owner：AI agent 执行 spike、测试和 ADR 草案；项目 owner 确认权限、数据和体验风险。

## 时间盒

M0 内 1.5 个工作日。若任一链路无法被真实环境验证，到期按保守失败分支收口。

## Spec 类型

spike

## 触碰模块/文件

- `package-lock.json`
- `package.json`
- `packages/authz/package.json`
- `packages/db/package.json`
- `packages/authz/src/**`
- `packages/authz/scripts/**`
- `packages/db/spikes/**`
- `.github/workflows/ci.yml`
- `docs/adr/ADR-002-dual-auth-access-context.md`
- `docs/evidence/M0/spikes/SPK-04-dual-auth/**`
- `docs/specs/M0-03-dual-auth-spike.md`

说明/备注：

本 spike 只允许创建 `spk04` schema、spike-only 权限事实表、受限 RLS 测试 role、Auth/Storage 测试对象、AccessContext/guard harness 与 CI job。HTTP endpoint 与 WS gateway 不落正式 NestJS 模块，只在 harness 中模拟同一 guard 链路，避免在 M0 引入业务 API surface。

## 变更预算与路径分类

- path categories：source、generated、lock、config、docs。
- source 预算：changed source files <= 3、net source LOC <= 600、new source files <= 2。
- test/generated/lock/config/docs 预计变更：Supabase SDK/Prisma lockfile、root/workspace package config、spike SQL、CI workflow、ADR-002、evidence manifest、本 spec。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `AccessContext`、`whoami`、`websocket`、`signed`、`supabase`、`auth`、`storage`、`spike:dual-auth`；当前 `packages/authz` 只有空包入口，`apps/api` 只有 M0 placeholder，没有既有 guard/HTTP/WS/Auth/Storage harness 可扩展。本 PR 在 `packages/authz/scripts/run-dual-auth-spike.mjs` 新增本 spec 唯一 spike harness，并在 `packages/authz/src/index.ts` 放置未来正式实现可复用的最小 AccessContext 契约。
- 外部 API/SDK/provider/connector/adapter 依据：Supabase 官方 Auth、JWT、Storage signed URL、Storage access-control 与 RLS 文档；Supabase dev 项目真实 SQL/Storage/Auth 证据。
- 是否需要例外：无。

## 文档触发检查

- 结果：new doc required。
- 判断依据：本 PR 新增 ADR-002 与 SPK-04 evidence manifest；不新增正式业务 DTO/OpenAPI，不改变公开环境变量文档。CI secret 位置只记录 secret 名称，不记录值。

## 外部依赖与密钥

- GitHub Actions 需要现有 `UZMAX_RLS_DATABASE_URL`，以及新增 `UZMAX_SUPABASE_PUBLISHABLE_KEY` 与 `UZMAX_SUPABASE_SECRET_KEY`。
- `UZMAX_SUPABASE_SECRET_KEY` / legacy service_role key 只能用于 CI 或本地后端 harness，不得进入前端、日志、evidence 或 PR 描述。
- Supabase project URL 固定为 dev 项目 `https://enyocaykcgcfcswycujg.supabase.co`，不是 secret。

## 前置条件

- 可使用真实 Supabase Auth 测试项目，能签发、刷新、过期测试 JWT。
- 测试库有两个租户、两个用户、最小权限事实数据；权限事实只存在后端表，不写入 JWT claim。
- Storage 测试 bucket 可创建租户隔离对象，后端具备生成 signed URL 的服务端凭据。

## 实施步骤

1. 建立最小权限事实表：用户与租户成员关系、权限 grant、禁用/移除成员状态；表结构只服务 spike。
2. HTTP guard 验证 Supabase JWT 后，只从后端表读取权限，生成 `AccessContext`，再注入 RLS 会话变量并返回 `/spike/whoami` 结果。
3. 覆盖 HTTP 负例：无 token、过期 token、有效身份但无租户权限、切换到未授权租户、权限被撤销后缓存未失效。
4. WS handshake 使用同一鉴权链路建立连接上下文；token 刷新、租户切换或权限撤销后必须重建上下文，无法安全重建时断开重连。
5. Storage signed URL 只能由后端在确认 `AccessContext` 可访问对象所属租户后生成；测试跨租户对象、伪造路径、已撤权用户均无法拿到 URL。
6. 将 HTTP/WS/租户切换/Storage 关键用例沉淀为 CI 集成测试，并将链路、缓存策略、失败分支写入 ADR-002。

## 通过条件

- JWT 中不包含业务权限 claim，权限事实源只来自后端表。
- HTTP 与 WS 对同一用户、同一租户、同一撤权事件产生一致拒绝结果。
- 租户切换后旧 `AccessContext` 与 RLS 变量不可复用。
- Storage 签名 URL 对跨租户对象默认拒绝，且生成动作有审计日志占位。
- ADR-002 明确认证、授权、缓存失效、WS 重连、Storage 签名 URL 的推荐实现。
- `docs/evidence/M0/spikes/SPK-04-dual-auth/manifest.md` 记录 HTTP、WS、租户切换、Storage、撤权用例和签收状态。

## 失败分支

- 若 WS 无法安全刷新上下文，M1 以后默认采用强制断开重连，不允许保留旧权限继续通信。
- 若 Storage 原生策略无法表达所需租户校验，签名 URL 必须经后端代理生成，前端不得直接签名。
- 若权限撤销、租户切换缓存失效或旧 `AccessContext` 清除无法在测试中被证明安全，Gate 1 不得通过；必须改为强制断开重连、服务端缓存清除或更保守的无缓存路径，并在 ADR-002 记录改路径结果后重新验收。

## 不做什么

- 不实现业务权限 UI、角色管理页面、邀请流程或完整 RBAC 矩阵。
- 不实现客户、会话、订单、知识库等业务接口。
- 不把业务权限写入 Supabase JWT claim。
- 不用本 spike 的最小权限表替代最终业务 schema 设计。

## 验收映射

- J-06：ADR-002 存在，SPK-04 链路测试进入 CI 常驻。
- K-03：实现 PR 必须引用本 spec 编号。
- K-04：触碰 `packages/authz` 与 `packages/db`，HTTP/WS 只在 harness 中模拟，不得与同模块 spec 并行。
- A-01/A-02/B-01：本 spike 为后续登录、租户授权与 RLS 越权验收提供地基证据，但不交付业务权限 UI。

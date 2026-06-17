# M1-01 Platform Schema Authz Foundation

## 目标

建立 M1 平台骨架的最小 schema 与授权事实源：`org`、`tenant`、`org_member`、`tenant_member`、`permission_grant` 的 Prisma model、RLS baseline、authz repository/helper 契约和 contracts 入口。该 spec 只交付平台授权地基，不交付 API guard、后台 UI、审计闭环、配置版本、eval runner 或任何业务表。

## Owner

Owner：项目 owner 最终确认 M1-01 合并许可与后续 M1 顺序；AI agent 执行 schema/authz 实现、spec compliance review、code quality review、验证和证据归档。项目 owner 仍负责 staging/prod Supabase 路线、真实账号、真实客户数据和发布决策。

## 时间盒

1 个工作日。到期若 schema/RLS/authz 契约无法形成可验证地基，则关闭本实现分支或改写失败分支，不允许夹带 M1-02/M1-03/M1-04/M1-05 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M1-01-platform-schema-authz-foundation.md`
- `docs/contracts/**`
- `packages/db/**`
- `packages/authz/**`
- `scripts/tests/**`

说明/备注：

本 PR 允许新增平台 schema/RLS migration、db/authz 手写契约和脚本级测试。未列出的模块默认不可改；尤其不得修改 `apps/api/**`、`apps/admin/**`、`packages/engine/**`、`packages/channels/**`、`packages/capabilities/**`、`packages/llm-gateway/**`、`packages/evals/**` 或客户样本路径。

## 变更预算与路径分类

- source 预算：changed source files <= 6、net source LOC <= 450、new source files <= 3。
- test/generated/lock/config/docs 预计变更：新增本 spec；更新 `docs/contracts/README.md`；更新 Prisma schema；新增 SQL migration；更新 `packages/db/src/**` 与 `packages/authz/src/**`；新增脚本级测试。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `M1-01`、`platform-schema-authz`、`AccessContext`、`tenant_member`、`permission_grant`、`PrismaClient`、`withRls`、`RLS`、`org_member`；当前只有 M0 spike-only SQL/harness 和 `packages/authz/src/index.ts` 的最小类型契约，没有正式平台 schema、正式 RLS baseline 或 authz resolver/helper，可在现有 `packages/db/src/index.ts`、`packages/authz/src/index.ts` 就地扩展，并新增本 spec 的 SQL migration 与测试。
- 外部 API/SDK/provider/connector/adapter 依据：ADR-001、ADR-002 与现有 SPK-03/SPK-04 spike 证据；本 spec 不新增外部 provider/connector/adapter。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`。正式 Prisma schema/RLS migration 继续命中 contracts gate；本 PR 必须把 `docs/contracts/README.md` 从 spike-only 说明更新为平台 schema/authz 契约入口。
- 备注：不新增 eval fixtures、raw/export/jsonl/csv 样本、OpenAPI 或正式环境变量文档。

## 前置条件

- Gate 1 decision 状态为 `go__m1_platform_skeleton_only`。
- `docs/evidence/M1/M1-platform-skeleton-readiness-pack.md` 已确认 M1-01 为首个实现 spec。
- ADR-001 已接受 RLS x Prisma x transaction pooler 路径；ADR-002 已接受权限事实源来自后端表和 AccessContext 链路；ADR-003 仍阻断真实客户消息进入第三方 LLM。
- 当前没有并行 `packages/db` schema PR；新任务开始前已检查 `git branch --no-merged main` 与 `gh pr list --state open`。

## 实施步骤

1. 在 Prisma schema 中定义 `org`、`tenant`、`org_member`、`tenant_member`、`permission_grant` 的正式 platform model 和必要 enum/index/unique 约束，不加入客户、会话、订单、知识库或 AI 表。
2. 新增 SQL migration，启用并强制 RLS，使用 `app.org_id` / `app.tenant_id` 上下文做默认拒绝的 select baseline，并保留受限 runtime role 的 fail-closed 策略。
3. 在 `packages/db/src/index.ts` 暴露平台表名、RLS context key 和安全 role 校验等最小契约，供后续 M1-02 repository/API 接入。
4. 在 `packages/authz/src/index.ts` 就地扩展 AccessContext 类型、权限事实源 repository interface、纯函数 resolver/helper，确保权限只由 `tenant_member` 与 `permission_grant` 事实推导，JWT/user_metadata 不进入业务授权。
5. 更新 contracts 入口，记录 platform schema、RLS context、authz 事实源、当前不关闭完整 A-02/B-01 的边界。
6. 增加自动化测试，覆盖 schema/RLS migration 关键表与 default-deny policy、authz resolver 授权/拒绝/撤权/cacheVersion 行为、禁止样本文件格式误入仓库。

## 通过条件

- Prisma schema 可通过 `prisma validate`。
- `npm run typecheck`、`npm run lint`、`npm run test` 通过；如时间允许，运行 `npm run check`。
- 自动化测试证明 M1-01 平台表与 RLS baseline 存在，缺少上下文默认拒绝，authz resolver 只根据 active `tenant_member` 与 `permission_grant` 生成 `AccessContext`。
- `docs/contracts/README.md` 明确本 PR 的契约、生成/验证命令、兼容性边界和后续 owner。
- PR 不提交 raw/export/jsonl/csv 样本，不引入 M2/M3/M4/GA-0 能力，不让真实客户消息进入第三方 LLM。
- 实现完成后先做 spec compliance review，再做 code quality review。

## 失败分支

- 若 RLS baseline 出现缺上下文可读或跨租户可读：关闭 M1-01 合并授权，按 ADR-001 改测 direct connection、dedicated/session 路径或更保守 repository 封装。
- 若 AccessContext 必须依赖 JWT business claim 才能工作：阻断实现，更新 ADR-002 或拆新 spec；不得把业务权限写入 JWT。
- 若 Prisma schema 与 SQL migration 无法保持一致：暂停实现，先修 schema/migration 契约或拆出 generation spec。
- 若发现并行 schema PR 或 open PR 与本 spec 触碰模块冲突：暂停本 PR，先清理分支/PR 状态。
- 若 staging/prod Supabase 路线仍未定：本 PR 只能作为 dev skeleton，不关闭生产 readiness。

## 不做什么

- 不实现 NestJS HTTP/WS guard、tenant switch endpoint、Storage signed URL、审计写入闭环或缓存失效机制；这些属于 M1-02/M1-04。
- 不实现集团层/租户层后台壳、授权工作台、发布与验收入口；这些属于 M1-03。
- 不实现 eval seed manifest/runner；这些属于 M1-05。
- 不实现 Telegram Bot/Business、对话工作台、工单、订单 connector、AI prompt/模型路由/知识发布、报价、SLA 或客户资产闭环。
- 不提交真实客户明文、截图、语音转写、raw/export/jsonl/csv 样本或脱敏样本内容。

## 验收映射

- A-02：提供授权租户上下文的数据/权限地基；完整后台 E2E 后续由 M1-02/M1-03 关闭。
- B-01：提供平台表 RLS default-deny 与租户上下文基线；客户/会话/订单/知识越权验收后续在业务表出现时关闭。
- J-06：保持 ADR-001/ADR-002 与 SPK-03/SPK-04 常驻证据不被削弱。
- K-03：实现 PR 必须引用本 spec 编号。
- K-04：触碰 `packages/db` 与 `packages/authz`，schema 变更全局串行。

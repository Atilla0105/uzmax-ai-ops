# M1-02 API Access Context Shell

## 目标

把 M1-01 的 platform schema/authz 地基接入 API 请求链路，建立最小 Nest API shell：health/readiness、Supabase Auth 身份验证契约、AccessContext 生成、tenant switch、API guard 基线、RLS transaction context helper 和审计写入契约。该 spec 只交付 API access-context 壳，不交付后台 UI、完整审计表闭环、配置版本、Storage signed URL、WebSocket、渠道、AI、订单或 eval runner。

## Owner

Owner：项目 owner 最终确认 M1-02 合并许可、真实 Supabase/staging/prod 路线和后续 M1 顺序；AI agent 执行 API shell 实现、spec compliance review、code quality review、验证和证据归档。项目 owner 仍负责真实账号、真实客户数据、生产发布和合规/成本决策。

## 时间盒

1 个工作日。到期若 API guard、AccessContext 或 tenant switch 无法形成可测试壳，则关闭本实现分支或拆出更小 package bootstrap；不得夹带 M1-03/M1-04/M1-05 或非 M1 能力继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M1-02-api-access-context-shell.md`
- `docs/contracts/**`
- `apps/api/**`
- `packages/authz/**`
- `packages/db/src/**`
- `scripts/tests/**`
- `tsconfig.json`
- `package-lock.json`

说明/备注：

本 PR 允许把 `apps/api` 从 M0 placeholder 升级为最小 Nest API shell，并允许新增 API runtime dependencies 进入 `apps/api/package.json` 与 `package-lock.json`。`packages/db/prisma/**` 和 `packages/db/migrations/**` 默认不可改；若发现必须新增正式 `audit_log` schema，应拆到 M1-04 或重写 spec 后串行。未列出的模块默认不可改；尤其不得修改 `apps/admin/**`、`packages/engine/**`、`packages/channels/**`、`packages/capabilities/**`、`packages/llm-gateway/**`、`packages/evals/**` 或客户样本路径。

## 变更预算与路径分类

- source 预算：changed source files <= 10、net source LOC <= 600、new source files <= 5。
- test/generated/lock/config/docs 预计变更：新增本 spec；更新 contracts；更新 API package、root TypeScript decorator config 和 lockfile；新增/更新 API source 与 API runtime compiler、authz/db source；新增脚本级 API access-context 测试。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `M1-02`、`api-access-context`、`@nestjs`、`nestjs`、`AccessContext`、`tenant switch`、`health`、`readiness`、`audit`、`Supabase Auth`、`guard`；当前 `apps/api` 只有 M0 placeholder，没有 Nest module/controller/guard 可扩展，`packages/authz` 只有 M1-01 纯 resolver，`packages/db/src` 只有 RLS/table helper。新增 API shell 文件归属 `apps/api/src/**`，测试归属 `scripts/tests/**`。
- 外部 API/SDK/provider/connector/adapter 依据：ADR-002、Supabase Auth `auth.getUser(jwt)` spike 证据、现有 `@supabase/supabase-js` dependency；本 spec 不新增外部 provider/connector/adapter。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`。本 PR 不新增 eval fixtures、OpenAPI 文件或正式 environment docs；但 API access-context 契约会扩展 `docs/contracts/README.md` 的 platform/authz/API contract。
- 备注：如新增公开环境变量文档触发条件，应先确认 repo-tree guard 是否要求；不得凭空创建未来环境手册。

## 前置条件

- Gate 1 decision 状态为 `go__m1_platform_skeleton_only`。
- M1-01 已合并到 `main`，platform schema/RLS/authz contract 可用。
- ADR-001 已接受 transaction 内 role/context 注入；ADR-002 已接受 Supabase Auth 只做身份认证、业务权限来自后端表；ADR-003 仍阻断真实客户消息进入第三方 LLM。
- 当前无 open PR，`git branch --no-merged main` 无输出；本分支从最新 `main` 创建。

## 实施步骤

1. 在 `apps/api` 建立最小 Nest bootstrap、module/controller/service/guard/port 结构，保留 start/build 脚本可运行。
2. 实现 health/readiness 响应契约，readiness 只返回组件状态，不泄露 secret、客户数据或真实连接串。
3. 实现 Supabase identity verifier interface 与 bearer token 解析；生产路径只把 Supabase JWT 当身份源，不使用业务权限 claim。
4. 实现 AccessContext guard/service：通过 authz repository 读取 tenant membership 与 permission grants，生成 `AccessContext`；未授权 tenant、伪造 tenant、撤权/cacheVersion 变化必须 fail closed。
5. 实现 tenant switch endpoint/handler 基线，明确旧 context 不复用，并产出审计事件契约；审计只落 port/event shape，不新增正式 `audit_log` schema。
6. 在 `packages/db/src` 补最小 RLS transaction context helper/契约，供 API 后续 repository 接入；不得裸用 Prisma 业务查询。
7. 更新 contracts，记录 API access-context contract、tenant switch/audit event shape、当前不关闭完整 A-02/B-01/B-05 的边界。
8. 新增自动化测试，覆盖 health/readiness、缺 token/坏 token/有效 token、授权 tenant、伪造 tenant、撤权/cacheVersion、权限检查、审计事件契约和禁止样本格式误入。

## 通过条件

- `npm run typecheck`、`npm run lint`、`npm run test`、`npm run build` 通过；依赖变更后 `npm audit --audit-level=high` 通过或记录无关 dev advisory。
- 如时间允许，`npm run check` 通过。
- 自动化测试证明 API guard 不信任 JWT business claim，未授权 tenant/伪造 tenant/撤权 membership fail closed，tenant switch 产出审计契约事件。
- `docs/contracts/README.md` 更新 API access-context 契约和 M1-02 边界。
- PR 不提交 raw/export/jsonl/csv 样本，不引入 M2/M3/M4/GA-0 能力，不让真实客户消息进入第三方 LLM。
- 实现完成后先做 spec compliance review，再做 code quality review。

## 失败分支

- 若 Nest dependency/bootstrap 超预算或触发高危依赖问题：拆出更小 API package bootstrap spec，不夹带 access-context 行为。
- 若 AccessContext 需要 JWT business claim 才能工作：阻断实现，回 ADR-002；不得把业务权限写入 JWT。
- 若 RLS helper 无法强制事务内 role/context 注入：阻断实现，按 ADR-001 fallback 改路径。
- 若审计契约需要新增正式 `audit_log` schema 才能验证：暂停该部分，拆到 M1-04 或重写 spec 后串行执行。
- 若 staging/prod Supabase 路线仍未定：本 PR 只能关闭 dev skeleton/API shell，不关闭生产 readiness。

## 不做什么

- 不实现后台 UI、租户切换器页面、授权工作台或发布/验收入口；这些属于 M1-03。
- 不新增 `audit_log`、配置版本、feature flag 或回滚 schema；这些属于 M1-04。
- 不实现 eval seed manifest/runner；这些属于 M1-05。
- 不实现 Telegram Bot/Business、WebSocket gateway、Storage signed URL、对话工作台、工单、订单 connector、AI prompt/模型路由/知识发布、报价、SLA 或客户资产闭环。
- 不提交真实客户明文、截图、语音转写、raw/export/jsonl/csv 样本或脱敏样本内容。

## 验收映射

- A-02：提供 API access-context 与授权 tenant 基线；完整后台 E2E 后续由 M1-03 关闭。
- B-01：沿用 M1-01 平台 RLS 基线；业务表越权后续在业务表出现时关闭。
- B-02：覆盖伪造 `tenant_id` / 未授权 tenant switch 后端拒绝。
- B-04：证明后端 guard 拒绝无权限请求，不依赖前端隐藏。
- B-05：提供 tenant switch / 拒绝路径的审计事件契约；完整审计闭环后续由 M1-04 关闭。
- J-06：保持 ADR-001/ADR-002 与 SPK-03/SPK-04 常驻证据不被削弱。
- K-03：实现 PR 必须引用本 spec 编号。
- K-04：触碰模块清单约束本 PR 范围；若触碰 schema 则全局串行。

# M2-05 Realtime WS Evidence If Needed

## 目标

记录 M2-05 的最小分支决策：当前 M2 不实现生产 WebSocket、不实现 polling runtime，也不补做 admin API client、DB repository、worker integration 或真实实时链路。M2-05 只归档 `documented_no_ws_branch_for_m2` evidence，说明 I-04 在 M2 进入 documented degraded/no-WS 分支，1.0 production 关闭仍需后续真实 WS 或 polling integration spec 与自动化证据。

本 PR 只新增 docs-only spec/evidence 并更新 M2 evidence 索引；不改变 runtime、contracts、测试、CI、lockfile 或生产能力。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2 当前接受 documented no-WS/degraded branch 作为 M2 队列出口，不代表 I-04 已满足 1.0 production 验收，也不代表放弃 1.0 实时要求；后续是否采用真实 WS 或 polling integration 仍需 owner 排期和新 spec。

AI agent：执行 live 文档重读、前序 evidence 复核、M2-05 docs/evidence 编写、spec compliance review、docs quality review、branch/PR hygiene 记录与验证；不得替 owner 宣称生产实时能力、生产 DB/API/worker readiness、真实客户流量、LLM、Telegram Business 或 GA-0 放行。

## 时间盒

0.25 个工作日。若 docs/evidence 不能诚实关闭 M2-05 队列出口，或 guard 要求触碰 runtime/test/contracts 才能通过，则停止并返回 `NEEDS_CONTEXT`，说明为什么 documented no-WS branch 不足。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M2-05-realtime-ws-evidence-if-needed.md`
  - `docs/evidence/M2/M2-05-realtime-ws-evidence-if-needed.md`
  - `docs/evidence/M2/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 未列出的模块默认不可改。
  - 禁止触碰 `apps/api/**`、`apps/admin/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、真实 payload/customer samples、外部 provider/connector/adapter。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path categories：docs = 本 spec、M2-05 evidence、M2 evidence README；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M2-05`、`I-04`、`WebSocket`、`WS`、`realtime`、`polling`、`degraded`、`non-realtime`，确认当前缺口是 M2 对 I-04 的里程碑分支记录，不是可就地扩展的 production realtime runtime。
- 外部 API/SDK/provider/connector/adapter 依据：none，本 PR 不新增或调用外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

- 结果：none。
- 判断依据：`docs/doc-gates.md`。本 PR 不新增 schema、migration、generated DTO、OpenAPI、eval fixture/runner、environment validation、observability、release workflow、真实 provider/connector/adapter 或 production realtime path；M2 evidence README 仅做既有证据索引更新。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m2-05-realtime-evidence`，分支为 `codex/m2-05-realtime-ws-evidence`，基线为 `origin/main` commit `2c3f9295900abab6cb4f16ff72659f33aba4e20a`。
- root `/Users/atilla/Documents/UZMAX智能运营` 只读核对，不得写入。
- 开工前必须重读 `AGENTS.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、M2-00 spec/evidence、M2-03 evidence、M2-04 evidence、contracts README 和 ADR-B01。
- 当前 main 已合并 M2-00/M2-01/M2-02/SPK-01/M2-03/M2-04；M2-03 是 in-memory API contract shell，不声明 production DB/WS/queue readiness；M2-04 是 local synthetic admin UI shell，已显示 degraded/non-realtime state 并把 I-04 标为 `not_closed`。
- M0 SPK-04 / ADR-002 只证明 auth/access-context 在 HTTP/WS handshake/reconnect 维度的 spike 原则，不是 conversation/ticket production realtime evidence。
- 开工前完成 `git status --short --branch`、`git branch --no-merged main`、`gh pr list --state open` 和 `npm ci`（若 `node_modules` 不存在）。

## 实施步骤

1. 重读前置 docs/evidence 与 `docs/doc-gates.md`，复核 M2-05 是否可以 docs-only 关闭队列出口。
2. 使用 `rg` 检索 M2-05、I-04、WS/realtime/polling/degraded 现有引用，确认没有可扩展的生产实时实现需要就地修改。
3. 新增本 spec，限定触碰模块和 no-WS branch 范围。
4. 新增 M2-05 evidence，记录 `documented_no_ws_branch_for_m2`、M2-03/M2-04 当前事实、M0 SPK-04 边界、I-04 状态、后续 closure path、branch/PR hygiene、validation 和 sensitive-data boundary。
5. 更新 `docs/evidence/M2/README.md`，加入 M2-05 evidence 索引与 I-04 仍未生产关闭的边界说明。
6. 运行 required validation，完成 spec compliance review 与 docs quality review。

## 通过条件

- M2-05 evidence 明确记录 decision 为 `documented_no_ws_branch_for_m2` 或等价清晰状态。
- Evidence 明确说明 M2-03/M2-04 均排除 production WS；M2-04 只有 degraded/non-realtime UI evidence；M0 SPK-04 不是 conversation/ticket production realtime evidence。
- I-04 在 M2 为 documented branch / not closed for 1.0 production；后续 closure path 必须包含真实 WS 或 polling integration spec、tenant-scoped auth/permission/cache behavior、自动化 latency/patch-cache/freshness evidence。
- PR diff 只包含本 spec、M2-05 evidence 和 M2 evidence README。
- 不新增生产 WS、API、DB、worker、admin client、customer traffic、LLM、Telegram Business 能力，不触碰 runtime/test/contracts。
- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-05-realtime-ws-evidence-if-needed.md --include-worktree`、`git diff --check` 通过。

## 失败分支

- 若现有 docs/evidence 已经证明 production WS 或 polling runtime exists：本 spec 改为引用真实证据，不得保留 no-WS branch。
- 若 guard 或 reviewer 要求 runtime/test 才能证明 M2-05：停止并返回 `NEEDS_CONTEXT`，由后续 implementation spec 决定触碰 `apps/api/**`、`apps/admin/**`、`packages/**` 或 `scripts/**`。
- 若发现 M2-03/M2-04 的 evidence 与当前 main 不一致：停止并返回 `NEEDS_CONTEXT`，先做 evidence sync spec。
- 若 branch/PR hygiene 发现冲突的 open PR 或未合并分支：停止并记录 `blocked_needs_branch_pr_hygiene`，不得创建重叠 PR。
- 若文档触发要求新增 contracts/environment/observability/release docs：停止并拆出新的 docs-only spec，避免 placeholder manuals。

## 不做什么

- 不实现生产 WebSocket gateway、polling runtime、admin API client、TanStack Query cache patch、DB repository、Prisma schema/migration、worker/engine integration、queue consumer、presence/notification routing、Telegram adapter、LLM、prompt、model route、outbound sending、GA-0 或真实客户流量。
- 不触碰 `apps/api/**`、`apps/admin/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、contracts README、raw payload/customer samples 或外部 provider/connector/adapter。
- 不声明 I-04 已满足 1.0 production；不把 M0 SPK-04 auth WS handshake 证据误写成 conversation/ticket realtime evidence。
- 不提交真实客户明文、Telegram handles、电话、地址、订单号、支付信息、截图、语音转写、raw payload、客服个人账号或 token。

## 验收映射

| Item | M2-05 status | Future closure path |
|---|---|---|
| I-04 | documented_no_ws_branch_for_m2 / not_closed_for_1_0_production | 后续真实 WS 或 polling integration spec，覆盖 API/WS 或 polling runtime、admin cache patch、tenant auth/permission behavior、自动化 latency/freshness evidence |
| J-05 | active | M2-05 evidence 在 M2 阶段归档，不把 I-04 分支堆到 M6 |
| K-03 | active | 一 spec / 一 PR |
| K-04 | active | 触碰模块清单约束本 docs-only PR；无 schema 串行点、无 API/admin/runtime 触碰 |

M2-05 不关闭 C-06/D-01/D-02/D-03/I-01，也不关闭 I-04 的 1.0 production 要求。它只关闭 M2 queue item 的 documented no-WS/degraded branch decision。

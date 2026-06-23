# M4-34 Dev Main DB Baseline

## 目标

把 M1-M4 已合并的 `packages/db/migrations/0001-0006` 应用到 Supabase `uzmax-dev` 主项目 `enyocaykcgcfcswycujg`，并用最小 synthetic SQL/RLS 验证确认 dev main 不再停留在“只有代码契约、没有真实业务 schema”的状态。

本 spec 只建立 dev main 数据库基线与证据，不新增业务实现，不导入真实订单/客户数据，不关闭 E-02/E-03/E-04/J-02/I-01。完成后，M4 后续竖切必须以这条真库基线作为进度信号，而不是仅以 contract tests 或 PR 数量作为完成判断。

## 项目 Owner 确认点与 AI Agent 责任

Owner：已在 2026-06-23 指示“走推荐的路”，并说明 Supabase org id 在 `uzmax-dev`；真实 Supabase dev project、成本、密钥和是否把 dev main 作为当前集成库仍由 owner 决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-34-dev-main-db-baseline` / `codex/m4-34-dev-main-db-baseline` 记录 spec/evidence；通过 Supabase MCP 对 `uzmax-dev` 执行只限已合并 migration 的 DDL apply 与最小 synthetic RLS 验证；不得打印 secret、不得写入 raw customer/order data、不得调用外部 order API、不得把验证写成 production/release/GA-0 通过。

## 时间盒

0.25 个工作日。若 `0001-0006` 任一 migration 无法应用，或 synthetic RLS 验证失败，立即停止并进入失败分支；不得在 dev main 反复试错超过 2 次，不得绕过 migration 历史直接手改 schema 伪造通过。

## Spec 类型

infra

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-34-dev-main-db-baseline.md`
  - `docs/evidence/M4/M4-34-dev-main-db-baseline.md`
  - `docs/evidence/M4/README.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：外部状态变更限于 Supabase dev main project `enyocaykcgcfcswycujg` apply repo 已合并 migrations `0001-0006`。不得修改 `packages/db/migrations/**`、Prisma schema/generated client、runtime source、tests、lockfile/config、admin UI、worker 或 root/main checkout。

## 变更预算与路径分类

- source 预算：changed source files = 0，net source LOC = 0，new source files = 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 spec、1 个 evidence；更新 M4 evidence README；不改 test/generated/lock/config。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：不新增 source 文件。已检索 M4 evidence/spec、ADR-B02、验收矩阵 E-02/B-01、migration `0001-0006` 和 `uzmax_app_runtime`。
- 外部 API/SDK/provider/connector/adapter 依据：不新增外部 order API、provider、connector 或 adapter；Supabase MCP 仅用于项目状态读取、DDL migration apply 和 SQL/RLS verification。
- 是否需要例外：无。

## 文档触发检查

- 结果：`updated`
- 判断依据：`docs/doc-gates.md`。
- 备注：本 spec 触碰真实 dev DB 基线与 M4 evidence，因此更新 M4 evidence README；不新增环境手册、contracts README、runbook 或 release docs。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、PRD REQ-T04、技术架构 §3/§8/§12、验收矩阵 B-01/E-02/E-03/E-04/I-01/J-02。
- Supabase changelog checked on 2026-06-23：2026-04-28 Data/GraphQL API exposure breaking change does not block this direct Postgres/RLS verification path; future Data API exposure still needs explicit grants/settings review.
- Supabase project confirmed: `uzmax-dev`, project/ref `enyocaykcgcfcswycujg`, org `kbuvfalyysfmptcazxnc`, Postgres `17.6.1.127`, status `ACTIVE_HEALTHY`.
- Pre-apply read-only state: migration history contains only SPK-03 entries; `public` base tables = 0; `uzmax_app_runtime` role absent; M4 order import RLS tables absent.
- Worktree / branch：物理 worktree `/Users/atilla/Documents/uzmax-m4-34-dev-main-db-baseline`；branch `codex/m4-34-dev-main-db-baseline`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。开工前记录：`pwd=/Users/atilla/Documents/uzmax-m4-34-dev-main-db-baseline`，`git status --short --branch=## codex/m4-34-dev-main-db-baseline...origin/main`，`git branch --show-current=codex/m4-34-dev-main-db-baseline`。
- 并发派发证据：本 spec 触碰真实 dev DB/migration baseline，必须全局串行；不并发派发其他 `packages/db` schema、migration、runtime DB 或 release gate 改动。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 用 Supabase MCP 只读确认 `uzmax-dev` 当前 migration/table/role/RLS 状态。
2. 按仓库已合并 migration 顺序把 `0001-0006` 应用到 `uzmax-dev`，migration name 使用已在 M4-33 branch 验证过的稳定名称。
3. 用 SQL 验证 migration history、32 张 public 表、`uzmax_app_runtime` role、M4 order import 表 RLS enabled + forced、基础 grants/policies。
4. 写入最小 synthetic 租户/订单快照数据，仅使用测试 UUID 和非真实占位值；在 `uzmax_app_runtime` + `app.org_id/app.tenant_id` 上下文下验证 tenant A 可见、tenant B 和 missing context 不可见。
5. 清理 synthetic rows，复查无测试 residue；更新 evidence 和 M4 README，不关闭仍未完成的 runtime/E2E/eval/queue blockers。

## 通过条件

- `0001-0006` 在 dev main migration history 中可见，且没有重复/跳号伪造。
- `public` schema 中存在 M1-M4 业务表；M4 order import 表存在，RLS enabled + forced。
- `uzmax_app_runtime` role 存在，且 M4 order import 表对该 role 的 RLS/context path 可验证。
- Synthetic tenant A 能读到自己插入的 import job、order snapshot、row error、query log；tenant B 和 missing context 均读不到。
- Synthetic 测试数据被清理，复查无 `M4-34 synthetic` residue。
- Evidence 明确写清哪些验收项仍未关闭，避免把 DB baseline 误报为 E-02 完成。

## 失败分支

- 若 apply migration 失败：停止，记录失败 migration 和错误摘要；不得手改 dev main 绕过 migration history；后续拆 fix/cleanup spec。
- 若 RLS 验证失败：停止，保留最小错误摘要；清理 synthetic rows；不得继续主线 runtime/E2E 之前先修 DB/RLS。
- 若需要真实客户/订单样本、生产 DB、secret value、外部 order API、Storage downloader、BullMQ/Redis、admin browser E2E 或 AI runtime/eval：停止并拆到后续 scoped spec。

## 不做什么

- 不新增、修改或删除 migration SQL；不改 Prisma schema/generated client；不新增代码、测试、env 文件、secret、连接串、raw customer/order data、CSV/XLSX 样本、截图或外部 API connector。
- 不把 dev main DB baseline 写成 production/GA-0/release readiness。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 API/auth runtime、worker queue、admin visible E2E、real import sample、AI runtime/eval 或 release acceptance。

## 验收映射

| 验收项 | 状态 | 说明 |
|---|---|---|
| B-01 | `dev_main_true_db_rls_probe_supported_not_closed` | dev main 将跑最小 SQL/RLS synthetic 验证；仍需自动化 SQL/RLS gate 常驻。 |
| E-02 | `dev_main_db_baseline_supported_not_closed` | 真库 schema/RLS 基线支撑导入主路径；API/auth/worker/admin E2E、真实导入样例仍未关闭。 |
| E-03 | `not_closed` | 本 spec 不验证 stale warning E2E。 |
| E-04 | `not_closed` | 本 spec 不接入 AI runtime/eval/redline。 |
| J-02 | `not_closed` | 本 spec 不接入 Redis/BullMQ/fault injection。 |
| I-01 | `not_closed` | 本 spec 不做可见桌面主流程 E2E。 |

## Closeout / Incident 记录

- Closeout evidence target: `docs/evidence/M4/M4-34-dev-main-db-baseline.md`。
- Incident: none found in repo evidence for this spec at kickoff。

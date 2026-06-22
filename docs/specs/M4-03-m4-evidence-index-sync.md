# M4-03 M4 Evidence Index Sync

## 目标

同步 `docs/evidence/M4/README.md` 到当前已合并 M4 状态：SPK-02 no-API branch、M4-01 admin order-path status shell、M4-02 customer asset DB contracts foundation。只更新索引与本 slice 证据，不新增 runtime、source、test、schema 或验收关闭声明。

## Owner

Owner：项目 owner 最终确认 M4 evidence index 是否可作为当前 M4 协调入口；仍负责 M4 范围、真实数据、外部 API、生产配置、LLM key、成本和合规风险决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-03-m4-evidence-index-sync` / `codex/m4-03-m4-evidence-index-sync` 执行 docs-only index sync、validation、PR hygiene 和 cleanup；复核不触碰 source/test/generated/lock/config、不关闭未完成验收、不读取或提交 raw data。

## 时间盒

0.25 个工作日。若 docs-only 索引同步无法通过 doc/pr-shape/workspace validation，则关闭本分支或重开更小 docs spec。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-03-m4-evidence-index-sync.md`
  - `docs/evidence/M4/README.md`
  - `docs/evidence/M4/M4-03-m4-evidence-index-sync.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/**`、`packages/**`、`scripts/**`、schema/migrations、generated/dist、package/lock/config/CI files 或其他 M4 evidence files。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：docs 3；test/generated/lock/config/source 0。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已读取 `docs/evidence/M4/README.md`、`docs/evidence/M4/M4-01-admin-order-path-status-shell.md`、`docs/evidence/M4/M4-02-customer-asset-db-contracts-foundation.md` 和 latest git log，确认 M4 README 已落后于已合并 PR #62/#63，需要 docs-only index sync。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明外部 API/SDK/provider/connector/adapter。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice 只同步 M4 evidence index，不新增 OpenAPI/generated DTO/runbook/production runtime 触发项。

## 前置条件

- 已读取 `AGENTS.md`、`docs/evidence/M4/README.md`、M4-01/M4-02 evidence 和 latest `main` log。
- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-03-m4-evidence-index-sync`；branch `codex/m4-03-m4-evidence-index-sync`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-03-m4-evidence-index-sync`
  - `git status --short --branch`: `## codex/m4-03-m4-evidence-index-sync`
  - `git branch --show-current`: `codex/m4-03-m4-evidence-index-sync`
- Worker boundary preflight：`UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-03-m4-evidence-index-sync UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed with `worker-write-boundary: ok`.
- 并发派发证据：无并发 worker；docs-only slice from latest `main@4ed5ca7`; open PR list was `[]` after M4-02 cleanup.
- 事故触发器：若发现写入分配 worktree 外、root/main 污染、secret/customer-data 边界擦边或 gate 绕过，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 更新 `docs/evidence/M4/README.md`，列出当前 M4 evidence files 和已合并贡献边界。
2. 新增 M4-03 evidence，记录 docs-only validation、scope 和不关闭项。
3. 运行 docs-focused validation 和 PR shape checks；commit/PR/merge 后清理 worker。

## 通过条件

- M4 README 不再声称当前 M4 evidence 只包含 SPK-02。
- README 明确 M4-01/M4-02 是 foundation/partial evidence，不关闭 M4/order/customer milestone。
- README 保留 no raw data/no production/no external order API/no GA-0 boundary。
- PR shape reports source/test/generated/lock/config 0 and docs 3.

## 失败分支

- 若需要改 source/test/schema/runtime 才能同步索引：停止并拆分新的非-docs spec。
- 若发现 M4 evidence 与真实 merged repo 不一致：只记录 inconsistency，不编造验收关闭。
- 若 validation 失败且无法在 docs-only scope 内修复：关闭本分支或重开更小 docs spec。

## 不做什么

- 不改 runtime/source/test/schema/migration/generated/package/lock/config/CI。
- 不新增或调用外部 API、LLM/provider、Telegram、真实客户系统或生产 connector。
- 不提交 raw CSV/XLSX、截图、订单号、电话、地址、支付信息、客户明文、凭证、token 或 env。
- 不关闭 E-02/E-03/E-04、D-04/D-05/D-07、1.0 release、production、GA-0 或真实客户流量。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| M4 evidence index | `synced` | Reflects SPK-02, M4-01 and M4-02 merged facts. |
| E-01/E-02/E-03/E-04 | `not_closed_by_this_slice` | Index-only update; keeps no-API branch and remaining order blockers visible. |
| D-04/D-05/D-07 | `not_closed_by_this_slice` | Index records M4-02 foundation-only contribution. |

## Closeout / Incident 记录

- Incident：none found in this spec execution at authoring time。
- Closeout evidence target: `docs/evidence/M4/M4-03-m4-evidence-index-sync.md`。

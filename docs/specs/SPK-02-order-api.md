# SPK-02 Order SaaS API M4 Conservative Closure

## 目标

基于项目 owner 在 2026-06-22 提供的 SPK-02 输入“暂时没有api”，把订单 SaaS API spike 收口为 M4 当前分支的 docs-only/no-API closure：不调用外部订单 API，不编造平台能力，不声明订单 SaaS API 永久不可能存在，并将当前 1.0 验收口径写入 `docs/adr/ADR-B02-order-api.md` 与 M4 evidence。

本 spec 保留原 SPK-02 意图：验证订单 SaaS 是否提供可支撑 1.0 只读订单查询的 API；当当前阶段没有 API 文档或沙箱凭据时，按验收矩阵 v1.1 条件式 Spike 通则进入保守分支。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：项目 owner 在 2026-06-22 明确输入“暂时没有api”。该输入只确认当前 M4 分支没有可用订单 API；不表示订单 SaaS API 永久不存在。未来若 owner 提供 API 文档、沙箱凭据、真实测试账号或受控字段资料，必须通过新 spec、ADR revision 或 superseding ADR 重开 SPK-02。

AI agent：只在 `/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure` / `codex/spk-02-order-api-no-api-closure` 中执行，读取 live docs 与当前 repo state，维护 SPK-02 spec、ADR-B02、ADR index、M4 evidence README 和 SPK-02 evidence manifest。AI agent 不得调用外部订单 API，不得发明 order SaaS 能力，不得提交订单号、电话、地址、支付、客户明文、CSV/XLSX/raw export、凭据或 env 文件。

## 时间盒

0.25 个工作日。若当前 owner input、worktree/branch、required reading 或 validation 无法证明 docs-only/no-API closure，则保持 SPK-02 未收口并记录 `blocked_needs_order_api_input_refresh`；不得扩大为代码实现、外部 API spike、CSV 样本导入或 runtime connector。

## Spec 类型

spike

本 spec 的当前实现分支是 docs-only conservative closure，不执行外部 API spike。

## 触碰模块/文件

- `docs/specs/SPK-02-order-api.md`
- `docs/adr/ADR-B02-order-api.md`
- `docs/adr/README.md`
- `docs/evidence/M4/README.md`
- `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`
- `docs/incidents/INC-2026-06-22-spk02-root-main-worktree-pollution.md`

说明/备注：

本 PR 只允许 SPK-02 docs-only/no-API closure and process evidence for that same PR. The incident file is in scope because SPK-02 authoring triggered the `docs/incidents/README.md` threshold for writing to root/main outside the assigned worktree, and coordinator review/merge needs repo evidence rather than chat-only closure. 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw samples、screenshots、CSV/XLSX exports、订单 ID、电话、地址、支付、客户数据、credentials、env files、root checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0；net source LOC <= 0；new source files <= 0。
- path categories：docs = 本 spec、ADR-B02、ADR index、M4 evidence README、SPK-02 manifest、SPK-02 incident record；source/test/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `ADR-B02`、`SPK-02`、`order-api`、`order-saas`、`M4` 于 `docs`、四份 v1.1 根文档和 `AGENTS.md`，确认当前缺少 ADR-B02 与 M4 SPK-02 evidence，需要新增 docs-only closure，不需要新增或修改 source。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增 provider/connector/adapter，不调用外部订单 API，不引用未实测 SDK 能力；只记录项目 owner 当前 no-API 输入与根文档条件式分支。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure`。
- 当前分支必须是 `codex/spk-02-order-api-no-api-closure`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许 coordination/read-only status audit，不得写入。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/preflight/02-external-dependencies-spikes.md`、`docs/adr/ADR-B01-telegram-business.md`、`docs/adr/README.md`、`docs/evidence/README.md` 和 `docs/runbooks/worker-worktree-boundary.md`。
- 开工前必须记录：`pwd`、worker `git status --short --branch`、worker `git branch --show-current`、root/main status、open PR audit、no-merged branch audit 和 explicit worker boundary guard。
- 若 `node_modules` 缺失，先运行 `npm ci`，再运行 worker boundary guard。
- 项目 owner input：2026-06-22，“暂时没有api”。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure` |
| branch | `codex/spk-02-order-api-no-api-closure` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates, production configuration, app/package source, CSV/XLSX exports or customer/order data.

## 事故与 closeout 记录

- Incident: `docs/incidents/INC-2026-06-22-spk02-root-main-worktree-pollution.md`.
- Status before merge: `pending_merge`.
- Scope: process evidence for this same SPK-02 PR after a relative `apply_patch` operation wrote the same five SPK-02 docs changes into root/main before cleanup.
- Controls for remainder of SPK-02: use absolute assigned paths or `git -C /Users/atilla/Documents/uzmax-spk-02-order-api-no-api-closure` for all writes; run assigned/root dual status checks after edits, formatters, generated writes or validation residue; keep explicit worker boundary guard evidence.
- This incident record does not expand SPK-02 into source/runtime work and does not authorize root/main writes.

## 实施步骤

1. 更新本 SPK-02 spec，使 machine-readable touch list 与本 PR 实际触碰的 5 个 docs 文件一致。
2. 新增 `docs/adr/ADR-B02-order-api.md`，记录 `no_api_for_m4__import_snapshot_main_path` 当前分支，并明确该结论不是永久 API 不存在声明。
3. 更新 `docs/adr/README.md`，把 ADR-B02 加入 accepted/current branch 索引。
4. 新增 `docs/evidence/M4/README.md`，记录 M4 evidence boundaries：当前仅 SPK-02 no-API closure，不表示 production、GA-0、真实流量、customer LLM 或 1.0 release。
5. 新增 `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`，记录 owner input、pre-edit worktree/root evidence、无外部订单 API 调用、验收映射、敏感数据边界和未来重开条件。
6. 新增 SPK-02 root/main worktree pollution incident record，并在本 spec 与 manifest 中记录检测、清理、验证和永久控制。
7. 运行 required validation，复核 diff 只含 allowlist 文件，然后提交本 worker branch；worker 不打开 PR、不合并。
8. Coordinator 完成 spec compliance review 与 code/docs quality review 后，才由 coordinator 打开 SPK-02 的 one-spec/one-PR；K-03 one-spec/one-PR 仍保持 active。

## 通过条件

- Diff 只包含本 spec、ADR-B02、ADR README、M4 evidence README、SPK-02 manifest 和 SPK-02 incident record。
- ADR-B02 status 为 accepted/current branch，并使用 `no_api_for_m4__import_snapshot_main_path` 或同等清晰 token。
- E-01 当前状态写为 `not_current_blocker__no_api_for_m4` 或同等清晰 token。
- E-02 当前状态写为 `p0_current_main_path__import_snapshot` 或同等清晰 token。
- E-03/E-04 保持 P0：快照过期必须提示并避免误导；AI 不得编造物流或订单状态。
- 后台订单 UI 未来文案固定为“订单数据主路径：导入快照”，不得描述为临时 API outage。
- 无订单、过期快照、导入主路径异常或 connector 降级时必须转人工或降级留单；AI 不得凭 LLM 判断订单状态。
- evidence 记录 pre-edit worker/root/PR/branch/boundary command 输出，且不包含 raw order/customer data。
- Incident evidence records root/main pollution facts, affected paths, no commit/push/PR/merge from polluted root/main, cleanup back to clean root/main, final assigned worktree clean after commit, root cause/failure mode and controls.
- Worker branch does not open or merge the PR. Coordinator opens the SPK-02 one-spec/one-PR only after coordinator spec/quality review.
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/SPK-02-order-api.md --include-worktree`, `git diff --check origin/main...HEAD`, and full `npm run check` if feasible.

## 失败分支

- 若 owner 后续提供 API 文档、沙箱凭据或真实测试账号：本 current branch 不再足够，必须通过新 spec、ADR revision 或 superseding ADR 重开 SPK-02，并重新判定 E-01/E-02/E-03/E-04。
- 若 validation 发现 docs-only diff 外的文件变化：停止并清理本 worker 产生的越界改动；不得扩大 touch list。
- 若文案误写为订单 SaaS API 永久不存在、平台能力被发明、或当前 no-API 被描述成临时 API outage：修正为当前 M4 no-API conservative branch。
- 若发现 raw/export/jsonl/csv/xlsx、订单 ID、电话、地址、支付信息、客户明文、credentials、env files 或 screenshots：关闭本 PR，先执行清理/泄露处置 spec。
- 若当前 worktree/path/branch 与前置条件不一致：停止并报告，不在错误 checkout 写入。

## 不做什么

- 不调用外部订单 API，不调用 LLM/provider，不连接 Telegram/订单 SaaS/真实客户系统。
- 不新增或修改 `apps/**`、`packages/**`、`scripts/**`、configs、lockfile、generated/dist、contracts、runbooks、raw samples、root checkout 或其他 worktree。
- 不实现订单 connector、DB schema、import job、admin order UI、客户资产、报价记录、runtime feature flag 或 production release gate。
- 不提交 CSV/XLSX exports、raw samples、screenshots、订单 ID、电话、地址、支付信息、客户数据、凭据或 env files。
- 不声明订单 SaaS API 永久不可行；只记录 2026-06-22 当前 M4 分支 no usable API。
- 不让 AI 编造物流、订单状态、SLA、成本、价格或支付信息。

## 验收映射

| Item | SPK-02 current branch status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | 当前无 API 文档/沙箱凭据；不实现 API connector；未来可经新 spec/ADR revision/superseding ADR 重开。 |
| E-02 | `p0_current_main_path__import_snapshot` | CSV/表格导入订单快照成为当前 M4 订单数据主路径；导入样例与自动化仍由后续 M4 implementation spec 交付。 |
| E-03 | `p0_remains__stale_snapshot_warning` | 快照过期提示仍是 P0，过期数据不得被当实时状态输出。 |
| E-04 | `p0_remains__no_fabricated_order_status` | 无订单、过期快照或降级时必须转人工/留单；AI 不得编造物流或订单状态。 |
| 条件式 Spike 通则 §13 | active | 无 API 或不可用时 E-01 移出阻断清单，E-02 升级为 P0 主路径，E-03/E-04 仍 P0。 |
| K-03 | active | 一 spec / 一 PR；worker branch does not open/merge PR; coordinator opens SPK-02 PR after review. |
| K-04 | active | Touch modules explicit；docs-only；不进入 source/test/config/lock/generated。 |
| Workspace incident handling | `pending_merge` | `INC-2026-06-22-spk02-root-main-worktree-pollution` records the SPK-02 root/main write, cleanup and controls as PR process evidence. |

SPK-02 当前 closure 不关闭 M4 订单/客户 milestone，不批准 production、GA-0、真实客户流量、customer LLM、订单导入 runtime、正式知识库写入或 1.0 release。

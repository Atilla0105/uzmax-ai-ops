# ADR-B02 Order API M4 No-API Branch

> status: accepted
> date: 2026-06-22
> spec: `docs/specs/SPK-02-order-api.md`
> decision_type: no_api_for_m4__import_snapshot_main_path
> evidence: `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`
> owner: 项目 owner 在 2026-06-22 提供 SPK-02 输入“暂时没有api”；AI agent 负责记录当前 no-API 分支、维护 ADR/evidence、验证不调用外部订单 API、不提交 raw order/customer data，并明确未来 API 可通过新 spec/ADR revision/superseding ADR 重开。
> timebox: M4 前；收到 owner no-API input 后 0.25 个工作日内完成 docs-only conservative closure。

## 背景

UZMAX PRD v1.1 要求订单只读能力可用：优先通过 API connector 查询订单/物流，外部 API 不可用时支持后台导入兜底。技术架构 v1.1 §8 进一步定义 `order-read` 与订单 connector：API 查询结果写入 `order_snapshot`，API 失败时后台显示 connector 降级并允许使用最近导入快照；CSV/表格导入生成 `import_job` 并把成功行写入订单快照。

后台设计 v1.1 要求连接中心展示 ADR-B02 结论；若无 API，租户订单页把导入兜底标记为主路径，订单页面文案为“订单数据主路径：导入快照”，不得把当前 no-API 分支伪装成临时 API 异常。

验收矩阵 v1.1 §13 对 SPK-02 给出条件式分支：有 API 时 E-01 为 P0；无 API 或不可用时 E-01 移出阻断清单，E-02 导入兜底升级为 P0 主路径，E-03/E-04 仍为 P0。

当前 owner input 是 2026-06-22 的“暂时没有api”。本 ADR 只记录当前 M4 branch 没有可用 API 文档/沙箱凭据；不声明订单 SaaS API 永久不存在，也不声明未来不能接入 API。

## 决策

当前 M4 分支采用 `no_api_for_m4__import_snapshot_main_path`：

1. 不调用外部订单 API，不创建临时 HTTP/Postman/script spike，不猜测鉴权、字段、限流、分页、错误模型或数据新鲜度。
2. E-01 当前标记为 `not_current_blocker__no_api_for_m4`；不把 API connector 作为当前 M4 发布阻断项。
3. E-02 标记为 `p0_current_main_path__import_snapshot`；CSV/表格导入订单快照成为当前 M4 订单数据主路径。
4. E-03 保持 P0：快照过期必须在后台和 AI 路径中清晰提示，不得把过期快照当实时状态输出。
5. E-04 保持 P0：无订单、过期快照、导入主路径异常或 connector 降级时必须转人工/留单；AI 不得编造物流或订单状态。
6. Admin order UI future wording must be `订单数据主路径：导入快照`；不得描述为 temporary API outage。
7. 未来 owner 提供订单 SaaS API 文档、沙箱凭据、真实测试账号或可脱敏字段资料时，必须通过新 spec、ADR revision 或 superseding ADR 重开 SPK-02，并重新判定 E-01/E-02/E-03/E-04。

## 判定分支

| 验收项 | 当前分支 | 判定 |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | 当前无 API 文档/沙箱凭据；不得声明 API connector 已可用，也不得实现假 connector。 |
| E-02 | `p0_current_main_path__import_snapshot` | 导入快照是当前订单数据主路径；后续 M4 implementation spec 必须交付导入样例、错误行、成功行可查与 owner evidence。 |
| E-03 | `p0_remains__stale_snapshot_warning` | 快照来源、更新时间、过期时间和 stale warning 必须进入后台与 AI 降级路径。 |
| E-04 | `p0_remains__no_fabricated_order_status` | AI 只能基于订单快照或明确降级转人工；不得凭 LLM 推断订单/物流状态。 |

## 备选方案

| 方案 | 优点 | 风险 | 判定 |
|---|---|---|---|
| 真实 API spike 后启用 connector | 可关闭 E-01 的外部依赖风险，并让 API connector 成为主路径 | 当前 owner 明确输入“暂时没有api”，无文档/沙箱/凭据；调用或推断会编造能力 | rejected for current M4 |
| 用 mock、猜测字段或通用订单 SaaS 经验替代 | 速度快 | 违反 SPK-02 与验收矩阵；会伪造外部平台能力和数据新鲜度 | rejected |
| 无限 pending | 不需要改验收口径 | 发布定义被外部输入悬挂，违反条件式 Spike 默认保守规则 | rejected |
| Conservative no-API closure，导入快照为当前主路径 | 保留诚实边界，不阻塞 M4 订单/客户后续实现定义，E-02/E-03/E-04 仍可被明确验收 | 当前 1.0 没有 API connector 主路径，未来 API 需重开 spec/ADR | accepted |

## 验证证据

- Current evidence manifest: `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`.
- Owner input recorded on 2026-06-22: “暂时没有api”.
- No external order SaaS API call, LLM/provider call, Telegram call, customer/order-data system call, CSV/XLSX import, raw export or credentialed spike was performed for this ADR.
- Required governance calls are recorded in the manifest: worker/root status, open PR audit, no-merged branch audit and worker boundary guard.
- This ADR submits only docs/spec/ADR/evidence files; it does not submit raw order/customer data, order IDs, phone numbers, addresses, payment data, credentials, env files, screenshots or CSV/XLSX exports.

## 失败分支

- 若未来 owner 提供 API 文档、沙箱凭据、真实测试账号或可脱敏字段资料：新开 spec/PR，创建 ADR revision 或 superseding ADR，执行真实 API spike 后重新判定 E-01/E-02/E-03/E-04。
- 若实现分支出现订单 API connector、假 provider、mock-backed order status、未授权 API entrypoint 或 admin wording 将 no-API 写成临时 API outage：当前 ADR 不通过，必须关闭/修正并回到本分支。
- 若 AI 输出基于过期快照、缺失订单或 degraded path 编造物流/订单状态：E-04 不通过，必须走转人工/留单。
- 若有人试图用未归档截图、口头猜测、外部平台营销页、通用 SaaS 经验或 LLM 推理证明订单 API 可行：拒绝合并，回到真实 owner-provided docs/sandbox evidence 要求。

## 影响范围

- `docs/specs/SPK-02-order-api.md`
- `docs/adr/ADR-B02-order-api.md`
- `docs/adr/README.md`
- `docs/evidence/M4/README.md`
- `docs/evidence/M4/spikes/SPK-02-order-saas-api/manifest.md`
- 后续连接中心、租户订单页、订单导入、客户资产订单快照和 AI order-read/handoff 路径必须读取本 ADR 的 current branch 口径，直到新的真实 API evidence supersede 本 ADR。

## 后续重开条件

重开订单 API spike 前必须同时具备：

1. 项目 owner 提供订单 SaaS API 文档、沙箱凭据、真实测试账号或明确受控测试方式。
2. 可测试的订单号、批次号或客户标识，且敏感值不得直接提交到 repo。
3. 可对比订单 SaaS 前台或 owner 提供的真实状态，用于验证字段含义和数据新鲜度。
4. 可脱敏归档的鉴权方式、字段映射、频率限制、错误模型、新鲜度对比和降级行为 evidence。
5. 明确的敏感数据处理方式：raw payload、CSV/XLSX、截图、订单 ID、电话、地址、支付、客户明文、token、secret 和 env 文件不进入 repo，只在受控存储中记录访问权限、保留期限和 owner 确认状态。
6. 新 spec/PR 仍保持一 PR 一个 spec，且不得夹带订单 UI、DB schema、connector runtime、admin implementation、客户资产实现或 feature flag 生产改动，除非触碰模块和验收条件另行批准。

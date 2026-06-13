# M0-00 基础设施账号与环境 Provisioning

## 目标

在 Gate 0 前把正式开工所需的账号、环境、密钥和证据位置纳入受控清单，避免 SPK-03、SPK-04、CI、LLM 数据处理被“账号稍后补”卡住。

## Owner

Owner：项目 owner 决定账号、密钥、成本和真实环境风险；AI agent 填写 manifest、检查缺口并产证据。

## 时间盒

1 个工作日。到期缺失的环境必须写入失败分支并顺延对应闸门，不允许口头后补。

## 触碰模块/文件

- `docs/preflight/03-infrastructure-provisioning.md`
- `docs/evidence/M0/infra/` 下的 manifest
- 受控密钥管理或外部平台配置
- 必要时新增 ADR

## 前置条件

- 四份 v1.1 正式文档已进入 OCM-00 审阅；本 spec 可以提前准备账号和 manifest 草稿，但关闭通过前必须 OCM-00 已正式闭合。
- 已确定 Git/CI 托管方式或可选方案。
- 项目 owner 可访问或可创建 Supabase、Render、Vercel、Sentry/日志、LLM provider、Telegram Bot 管理入口。

## 实施步骤

1. 按 `docs/preflight/03-infrastructure-provisioning.md` 填写 Git/CI、Supabase、Render、Vercel、Sentry、LLM key、Telegram Bot manifest。
2. 确认 dev/staging/prod 命名、区域、权限、密钥保管方式。
3. 确认 Supabase dev 能支撑 SPK-03/04，LLM key 策略能支撑 ADR-003。
4. 将敏感信息放入受控密钥管理，只在仓库保存 manifest 和证据链接。
5. 对缺失项写失败分支：关闭、顺延、改路径或写 ADR。

## 通过条件

- OCM-00 已闭合；若 OCM-00 签收过程中修改了技术栈或托管路径，相关 manifest 已回炉更新。
- Gate 0 最低要求全部满足。
- Supabase dev、Git/CI、LLM key 策略、Telegram 测试 bot 均有 manifest 或明确顺延记录。
- 所有 manifest 有 Owner、时间、环境、权限范围、密钥保管位置和失败分支。

## 失败分支

- Git/CI 不可用：关闭 Gate 0 或改等价 CI 平台并写 ADR。
- Supabase dev 不可用：顺延 SPK-03/04，不得用 mock 结论替代。
- LLM key/数据策略不明：禁止真实客户消息进入 LLM，顺延 ADR-003。
- Telegram 测试 bot 缺失：顺延 Bot/Business spike。
- OCM-00 签收改动技术栈或托管路径：对应 manifest 回炉，OCM-00A 不得闭合。

## 不做什么

- 不提交任何真实 secret。
- 不创建业务 schema。
- 不部署真实业务流量。
- 不用个人账号临时替代正式项目归属。

## 验收映射

- Gate 0。
- J-01 / J-04 / J-06。
- SPK-03 / SPK-04 / ADR-003 前置条件。

# 基础设施账号与环境 Provisioning 清单

来源对齐：M0 架构与治理、SPK-03、SPK-04、LLM 数据处理、部署与运维验收。基础设施不是“后补条件”，是 Gate 0 前置输入。

## 控制原则

- 项目 owner 决定账号、密钥、成本和真实环境风险；AI agent 负责填 manifest、检查缺口、提出失败分支。
- 账号申请、环境创建和 manifest 草稿可以与 OCM-00 审阅重叠；OCM-00A 闭合必须等 OCM-00 通过后执行。
- dev/staging/prod 三套环境必须有命名、权限、密钥归属和失败分支。
- 真实环境 spike 不允许用口头“稍后开账号”替代。
- 敏感 key 不进入仓库；只归档 env manifest、权限截图或受控存储链接。

## Provisioning 矩阵

| 项目 | Owner | 时间盒 | 通过条件 | 截止闸门 | 失败分支 | 验收证据位置 |
|---|---|---|---|---|---|---|
| Git/CI 托管 | 项目 owner 决策；AI agent 填写/验证 | 0.5 个工作日 | 正式仓库或空仓库位置确认；CI runner 可执行最小 job；分支保护策略草案存在。 | Gate 0 前 | CI 不可用则关闭 Gate 0；可改用等价 CI 平台并写 ADR；不得跳过门禁。 | `docs/evidence/M0/infra/git-ci-manifest.md` |
| Supabase dev/staging/prod | 项目 owner 决策；AI agent 填写/验证 | 1 个工作日 | dev 可用于 SPK-03/04；staging/prod 项目名、区域、连接池模式、Auth、Storage、RLS 能力确认；服务角色 key 存入受控密钥管理。 | Gate 0 前 dev；M1 前 staging/prod | dev 缺失则顺延 SPK-03/04；staging/prod 未定则 M1 不能关闭；连接池模式不满足则写 ADR-001 分支。 | `docs/evidence/M0/infra/supabase-env-manifest.md` |
| Render api/worker/cron/Redis | 项目 owner 决策；AI agent 填写/验证 | 0.5-1 个工作日 | 服务命名、区域、实例规格、Redis、环境变量命名和回滚入口确认；M0 可先使用占位服务。 | Gate 0 前命名；M1 前可部署 | Render 不可用则改路径并写 ADR；不得把 worker/cron 长任务塞到 Vercel。 | `docs/evidence/M0/infra/render-env-manifest.md` |
| Vercel admin | 项目 owner 决策；AI agent 填写/验证 | 0.5 个工作日 | 项目名、preview/prod 策略、环境变量命名、访问保护策略确认；最小 Vite app 可部署或有等价计划。 | Gate 0 前 | Vercel 不可用则改静态托管路径并写 ADR；后台不可无 preview 环境。 | `docs/evidence/M0/infra/vercel-env-manifest.md` |
| Sentry/日志/告警 | 项目 owner 决策；AI agent 填写/验证 | 0.5 个工作日 | Sentry 项目或等价工具确认；traceId、环境名、告警渠道和 owner 映射存在。 | M0 关闭前 | 未就绪则不得通过 GA-0 条件；M0 可记录为 P1 但必须有修复日期。 | `docs/evidence/M0/infra/observability-manifest.md` |
| LLM provider keys | 项目 owner 决策；AI agent 起草数据处理证据 | 0.5 个工作日 | provider、key 归属、零留存/留存策略、区域、限额、fallback key 管理方式确认；不得把 key 写入仓库。 | ADR-003 前 | 未确认数据处理策略则禁止真实客户消息进 LLM；provider 不满足策略则关闭该 provider 或限制任务类型。 | `docs/evidence/M0/infra/llm-provider-manifest.md` |
| Telegram Bot 测试号/正式号 | 项目 owner 决策；AI agent 填写/验证 | 0.5 个工作日 | 测试 bot 和正式 bot 归属、token 保管、webhook 域名策略、轮换流程确认。 | M2 前；测试号 Gate 0 前 | 测试号缺失则顺延 Bot/Business spike；正式号缺失不阻断 M0，但阻断 M2 关闭。 | `docs/evidence/M0/infra/telegram-bot-manifest.md` |

## Gate 0 最低要求

Gate 0 前必须至少满足：Git/CI 可用、Supabase dev 可用、LLM key 策略进入 ADR-003、Telegram 测试 bot 准备或有明确顺延记录。未满足时不得创建正式协作仓库或启动 M0 spike。

若 OCM-00 签收过程中调整了技术栈、托管平台或数据处理边界，已经准备的 manifest 必须回炉更新；未更新前 OCM-00A 不得关闭。

# Evidence

本目录保存里程碑、spike、评测、演练和项目 owner 确认证据的索引。真实敏感文件可以放在受控存储中，但这里必须保留 manifest、证据链接和确认状态。

## Manifest 必填字段

- `evidence_id`
- `milestone`
- `acceptance_items`
- `owner`：项目 owner 决策点与 AI agent 产证据责任
- `status`：`draft` / `ready_for_review` / `accepted` / `rejected` / `superseded`
- `created_at`
- `updated_at`
- `source_files`
- `sensitive_data_location`
- `redaction_status`
- `review_notes`
- `signoff`：项目 owner 确认记录或明确未确认原因

## 命名规则

- 里程碑证据：`M1-platform-skeleton-signoff.md`
- spike 证据：`SPK-03-rls-prisma-pool-report.md`
- 评测证据：`G-04-language-blind-review-report.md`
- 演练证据：`J-01-api-worker-rollback-drill.md`

## 敏感文件链接规则

- 敏感原始文件不得直接提交到仓库。
- 仓库只保存 manifest、脱敏摘要、受控存储链接和确认状态。
- manifest 必须说明脱敏方式、访问权限、保留期限、项目 owner 决策点和 AI agent 产证据责任。

## 目录建议

- `M0/`：治理骨架、SPK-03、SPK-04。
- `M1/`：平台骨架、种子评测集。
- `M2/`：Bot、Business spike、对话/工单。
- `M3/`：AI 能力、语言盲评、截图诊断。
- `GA-0/`：生产内测开闸 checklist、真实流量证据。
- `M4/`：订单 API spike、导入主路径、客户资产。
- `M5/`：蒸馏、确认队列、分析日志。
- `M6/`：全链路演练、残项清零、正式发布签收。

每个里程碑关闭时必须归档证据；不得集中堆到 M6。

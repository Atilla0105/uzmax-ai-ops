# OCM-00 文档签字与 1.0 口径冻结

> evidence_id: OCM-00-document-baseline-signoff  
> milestone: M0  
> status: accepted  
> created_at: 2026-06-13  
> updated_at: 2026-06-13  
> owner: 项目 owner 决策；AI agent 复核与产证据  

## 结论

当前四份 v1.1 文档作为 OCM-00 开工基线。签字前预检已通过：基线 hash 匹配，技术架构文件头已有签字前修订记录。项目 owner 已确认本项目不设多人 owner 签字卡点，OCM-00 以单 owner 决策闭合；Gate 0 仍需等待 OCM-00A 基础设施 manifest 填实后复判。

## 待签基线

| 文档 | 行数 | sha256 |
|---|---:|---|
| `UZMAX智能运营系统-PRD-v1.1.md` | 122 | `2b6bdb3fd3ebd9ef948d714f15ead70b816d1107a62d201a491315f363813337` |
| `UZMAX智能运营系统-技术架构-v1.1.md` | 363 | `e7a009a71c6fd582f1fca30b0842e3b6a8ee488fa25408879c479fa7a17a6700` |
| `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` | 285 | `6c8df05d59308cad9718b32d14d59febc6c0788675ccda7648e72b4000830e90` |
| `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` | 156 | `92b28467e0a402cefe43692fa0ee59d82946dd4e85028fbc5da5eecee34044ed` |

## 签前预检

| 检查项 | 状态 | 记录 |
|---|---|---|
| 四份 v1.1 基线 hash | passed | 2026-06-13 复核，均与本记录一致 |
| 技术架构签字前修订记录 | passed | `UZMAX智能运营系统-技术架构-v1.1.md` 文件头已记录 |
| `.DS_Store` 等噪声文件 | passed | 已清理，且 `.gitignore` 已覆盖 |

## 闭合方式

1. AI agent 复核四份基线 hash、签字前修订记录和跨文档主源关系。
2. 项目 owner 确认四份 v1.1 文档为唯一开工基线。
3. OCM-00 闭合后，仍不得跳过 OCM-00A 或 Gate 0 复判。

## 签收范围

签收范围以 `docs/preflight/00-opening-control-matrix.md` 的 OCM-00 行为准；本记录只保存待签文件 hash、闭合方式和当前确认状态。

## 确认状态

| 角色 | 状态 | 记录 |
|---|---|---|
| 项目 owner | accepted | 当前对话确认本项目只有用户本人 + AI agents；不设多人 owner 签字卡点 |
| AI agent | evidence_ready | 已复核 hash、签字前修订记录、spec 结构和噪声文件 |

## 分支引用

失败分支以 `docs/preflight/00-opening-control-matrix.md` 的 OCM-00 行为准；若四份基线文档再次改变，本记录必须重新生成 hash 后再签。

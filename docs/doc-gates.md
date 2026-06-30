# Documentation Gates

UZMAX 不靠记忆决定什么时候补文档。文档按真实能力、路径或闸门生长：

```text
真实能力/路径/闸门出现 -> 必须存在或更新对应文档 -> guard 或 spec 检查强制提醒
```

本文件定义触发矩阵。PR1 先作为人工审查依据；PR2 以后由 `guard:doc-triggers` 对当前 repo 树做存在性推导。PR body 和 spec 的 Documentation triggers 字段只是 forcing function，不是权威真源。

Current-state note: as of M7-03, `guard:doc-triggers` hard-checks the evals and contracts documentation entries only. Release, observability, environment, design-system, issue-template and skill rows remain manual governance unless a later spec expands guard scope.

## 原则

- 单一真源：本文件只声明何时需要文档，不复写 PRD、技术架构、验收矩阵、ADR 或 runbook 正文。
- 证据优先：文档必须能指向真实代码、真实路径、真实闸门或 evidence；不能为了看起来完整提前写未来系统。
- 树存在性优先：doc-gate guard 必须检查当前 repo 树，而不是只看本次 diff。否则引入能力的 PR 之后 gate 会沉默。
- 空骨架不触发：M0 空包、占位入口、空 app/package 不等于真实能力。
- 低误报起步：新 gate 先用少量稳定触发条件，必要时先 observation，再 hard-fail。

## 触发矩阵

| 文档 | 触发条件 | 不触发条件 | 当前状态 |
|---|---|---|---|
| `README.md` | repo 有可运行工程骨架、CI 或协作入口 | 纯规划包且无工程仓库 | 已存在 |
| `SECURITY.md` | repo 记录或消费 secret、外部平台 key、真实客户数据、LLM provider 或安全 runbook | 只讨论产品范围且无工程/secret 入口 | 已存在 |
| `docs/evals/README.md` | `packages/evals/fixtures/**` 存在；或真实 eval case/redline/blind-review runner 出现；或 schema 出现 `eval_case`、`eval_run`、`eval_result` 等持久化实体 | 仅有 `packages/evals/` 空包或最小占位 `src/index.ts` | 已触发；文档已存在；`guard:doc-triggers` hard-check |
| `docs/contracts/README.md` | schema、migration、generated DTO、OpenAPI、schema generator、API contract 或前后端共享契约生成路径出现 | 仅有空 `packages/db/` 或手工 planning 文档 | 已触发；文档已存在；`guard:doc-triggers` hard-check |
| `docs/observability.md` | traceId、Sentry SDK、LLM call log、成本日志、告警 routing 或 production log correlation 接入代码出现 | infra manifest 只记录平台准备状态 | 人工治理待补；guard 未硬卡 |
| `docs/environment.md` | 真实代码消费的 env vars 超过 infra manifest 可表达范围；或新增 env validation/schema | 仅有平台 manifest 或 `.env.local` 本地保管说明 | 人工治理待补；guard 未硬卡 |
| `docs/release.md` | GA-0 checklist、发布控制台、回滚演练闭合或 production release workflow 出现 | M0/M1 仅有 preflight 和 runbook 占位 | 已触发；文档已存在；guard 未硬卡 |
| `docs/admin-design-system.md` / `PRODUCT.md` / `DESIGN.md` / `docs/evidence/M7/**` | Design Skill Layer 安装、owner 原型进入设计系统、`packages/ui-tokens/**` token 语义变化、admin primitives/patterns/pages 的视觉规则变化、Impeccable detect baseline 变化、`/design` 视觉回归范围变化或 UI follow-up 队列变化 | 纯 backend/API/DB/worker/cron 行为变更，且不影响后台 UI、token、视觉回归、设计审计或微文案形态 | 已触发；文档已存在；guard 未硬卡 |
| `.github/ISSUE_TEMPLATE/**` | issue 成为稳定需求、bug、incident 或 spike 入口 | 项目 owner 仍通过当前 Codex/GitHub PR 流程直接排期 | 待触发 |
| `.agents/skills/uzmax-spec-delivery/SKILL.md` | 同一 AI 交付流程重复运行 3 次以上，且步骤、验证和 review 分工稳定 | 流程仍在 M0 dogfood 中调整 | 待触发 |

## PR/spec 字段怎么填

在 spec 的“文档触发检查”和 PR 模板的 Documentation triggers 中只写结论：

- `none`：触碰模块没有命中本矩阵。
- `updated`：本 PR 更新了已存在的对应文档。
- `new doc required`：当前 repo 树已命中触发条件，但目标文档还不存在；必须补文档或顺延触发能力。

不要写长篇解释。复杂争议进入 spec 备注、ADR 或 review 结论。

## PR2 guard 要求

`guard:doc-triggers` 起步只做树存在性检查：

- 如果当前 repo 树已有稳定触发能力，而对应文档不存在，fail。
- 如果只存在空骨架，不要求提前创建手册。
- 至少覆盖 eval 和 contracts 两个低误报 gate。
- 必须有正/负例测试：触发能力存在但文档缺失会 fail；未触发能力时不要求空文档。

不要把 diff-only 语义照搬到 doc-gate。eval gate 可以是“本次 diff 碰到 AI 路径 -> 跑 eval”；doc-gate 必须是“当前 repo 已经长出真实能力 -> 文档入口必须存在”。

# M0-02 Governance Cleanup

## 目标

收尾 M0-01 合入后的低风险治理口径：同步测试弱化例外的文档规则，并补齐
`ops-assets` 依赖边界的负例测试。该 spec 只做治理文本和 guard 测试补强，不改变业务
实现、不调整部署入口、不放宽 CI。

## Owner

Owner：AI agent 实施和自检；项目 owner 确认合并许可。

## 时间盒

0.5 个工作日。

## Spec 类型

infra

## 触碰模块/文件

- `AGENTS.md`
- `docs/specs/M0-01-monorepo-ci-agents.md`
- `docs/specs/M0-02-governance-cleanups.md`
- `scripts/tests/guards.test.mjs`

## 变更预算与路径分类

- path categories：docs、test。
- 不新增 source 文件。
- Exception：`none`。

## 前置条件

- M0-01 已合入 main。
- `guard:pr-shape` 已启用并由 GitHub ruleset 要求 `checks` 通过。

## 实施步骤

1. 将 `AGENTS.md` 与 M0-01 spec 中的测试弱化例外文字同步为更严策略：
   `test_weakening_exception` 只允许 cleanup/refactor 删除测试候选，且必须映射同 PR
   删除的 source；其他测试弱化没有机器例外通道。
2. 为 `ops-assets-no-engine-or-channel-imports` 补 dependency-cruiser 负例测试。
3. 保持 `pr-shape` 实现不变；本 PR 只对既有行为补齐文档和证据。

## 通过条件

- `npm run test` 通过，且新增 `ops-assets` 负例会在边界违规时失败。
- `npm run guard:pr-shape -- --base origin/main` 通过。
- GitHub Actions `checks` 通过。

## 失败分支

- 若发现当前 `test_weakening_exception` 实现与文档仍不一致，不得放宽机器门禁；优先收紧
  文档，并把放宽需求另开 spec 讨论。

## 不做什么

- 不改 `scripts/guards/pr-shape.mjs` 行为。
- 不改 lint、Render、Vercel、CI ruleset 或部署 start 命令。
- 不引入业务代码。

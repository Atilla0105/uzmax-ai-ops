# Runbook: CI 门禁失败

## 适用场景

`tsc`、ESLint、formatter / `format:check`、dependency-cruiser、forbidden-terms、jscpd、knip、测试、评测触发、`guard:pr-shape`、size-limit、Playwright 任一门禁失败。

本 runbook 覆盖技术架构 §12.2 门禁，以及 M0-01 新增的作者期辅助门禁；辅助门禁待下一次合法基线修订时回流到技术架构和验收矩阵。

## 处理步骤

1. 确认失败门禁名称、spec 编号、触碰模块。
2. 若是依赖边界失败，按 AGENTS.md 的 DAG 修正 import，不允许关闭规则绕过。
3. 若是 forbidden-terms 失败，移除 `packages/engine` 中业务词，迁移到配置、知识或 capability。
4. 若是 formatter 失败，只运行规定 formatter，不混入无关重排；格式化 churn 过大时拆成单独 PR/spec。
5. 若是 `guard:pr-shape` 失败，先按路径分类确认是否误算 generated、lock、migration SQL、schema 生成 DTO、快照或测试 LOC；若无误，优先拆 PR 或就地替换，不能让 AI agent 自批例外。
6. 若是测试弱化失败，先确认是否满足 cleanup/refactor 候选条件：Spec 类型是否为 `cleanup` 或 `refactor`、测试是否随死码/下线功能/重构 source 同步删除、PR Hygiene 表是否映射被删 source。满足候选条件仍需 review 判定合理性；若不满足，移除 `.skip`、`.only`、`xit`、`xfail`，恢复被删用例或补充替代测试；确需弱化必须有项目 owner 明确批准。
7. 若是新增 provider/connector/adapter 缺依据，补官方文档、已生成类型、本地 spike 证据或 ADR-B；不能用口头猜测替代。
8. 若是评测触发失败，确认路径映射是否正确，触发的最小评测 job 必须可运行。
9. 修复后重新运行同一门禁并归档证据。

## 失败分支

门禁无法实现时，不得合并；必须写 ADR 说明替代机器执法方案。

# Runbook: CI 门禁失败

## 适用场景

`tsc`、ESLint、dependency-cruiser、forbidden-terms、jscpd、knip、测试、评测触发、size-limit、Playwright 任一门禁失败。

## 处理步骤

1. 确认失败门禁名称、spec 编号、触碰模块。
2. 若是依赖边界失败，按 AGENTS.md 的 DAG 修正 import，不允许关闭规则绕过。
3. 若是 forbidden-terms 失败，移除 `packages/engine` 中业务词，迁移到配置、知识或 capability。
4. 若是评测触发失败，确认路径映射是否正确，触发的最小评测 job 必须可运行。
5. 修复后重新运行同一门禁并归档证据。

## 失败分支

门禁无法实现时，不得合并；必须写 ADR 说明替代机器执法方案。


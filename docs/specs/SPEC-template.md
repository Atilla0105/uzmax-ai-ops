# SPEC-ID Title

## 目标

说明本 spec 要完成的最小可交付结果。

## Owner

Owner：项目 owner 最终决策；AI agent 执行、复核或产证据。若需要外部输入，在本节写清输入来源和项目 owner 确认点。

## 时间盒

写明确切时间盒；到期无结论时必须进入失败分支。

## Spec 类型

- 选择一个：`feature` / `fix` / `refactor` / `cleanup` / `spike` / `docs` / `infra`。

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `apps/example/**`
  - `packages/example/**`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 12、net source LOC <= 600、new source files <= 5，或写明更严预算。
- test/generated/lock/config/docs 预计变更：
- 新增 source 文件前的 `rg` 搜索结论和归属理由：
- 外部 API/SDK/provider/connector/adapter 依据：无 / 官方文档 / 已生成类型 / spike 证据 / ADR-B。
- 是否需要例外：无 / `large_change_exception` / `test_weakening_exception` / `external_dependency_exception`；例外必须在 PR Hygiene 表使用精确 token 声明，并由项目 owner 通过 review 或等价审批记录批准。

## 前置条件

- 依赖账号、样本、环境、ADR 或上游 spec。

## 实施步骤

1. 第一步。
2. 第二步。

## 通过条件

- 可验证、可截图、可测试或可签收。

## 失败分支

- 关闭、降级、顺延、改路径或写 ADR。
- 不允许写“继续观察”。

## 不做什么

- 明确排除项，防止 scope creep。

## 验收映射

- 对应验收矩阵编号。

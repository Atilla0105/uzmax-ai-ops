# M0-06 Kickoff Readiness Cleanup

## 目标

在进入 SPK-03 前，把当前 M0 开工状态整理成单一、可引用、不过度扩张的证据包：消除活跃 spec 编号歧义，更新 Gate 0/M0 readiness 证据，记录 owner review 机制的当前真实状态，并给未合并本地治理分支作出不合入本 PR 的处理结论。本 spec 只做开工整理，不实现业务能力。

## Owner

Owner：项目 owner 确认本 PR 的整理口径和合并许可；AI agent 执行文档整理、复核引用、产验证证据。项目 owner 仍是唯一真人决策者，AI agent 不得把本 PR 视为 Gate 1 放行。

## 时间盒

0.5 个工作日。若发现需要改 GitHub ruleset 或删除未合并分支，先记录为后续 owner 操作，不在本 PR 里强行完成。

## Spec 类型

infra

## 触碰模块/文件

- `docs/specs/M0-06-kickoff-readiness-cleanup.md`
- `docs/specs/M0-02-rls-prisma-pool-spike.md`
- `docs/specs/SPK-03-rls-prisma-pool.md`
- `docs/specs/README.md`
- `docs/preflight/00-opening-control-matrix.md`
- `docs/evidence/M0/README.md`
- `docs/evidence/M0/kickoff-readiness-rollup.md`
- `docs/evidence/M0/gates/Gate-0-decision.md`
- `docs/evidence/M0/infra/README.md`
- `docs/evidence/M0/infra/git-ci-manifest.md`

说明/备注：

`docs/specs/M0-02-rls-prisma-pool-spike.md` 只允许作为 rename 源路径出现；本 PR 不改 spike 内容本身，只把活跃 spec 身份对齐为 `SPK-03`。

未列出的模块默认不可改。

## 变更预算与路径分类

- path categories：docs。
- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec 和 M0 readiness rollup；rename RLS spike spec；更新 preflight/evidence 引用与状态说明。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `M0-06`、`kickoff`、`readiness`、`SPK-03-rls` 和旧 `M0-02-rls-prisma-pool-spike` 引用。
- 外部 API/SDK/provider/connector/adapter 依据：无；本 PR 不新增外部适配器。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated。
- 判断依据：本 PR 只更新现有 `docs/specs/`、`docs/preflight/` 与 `docs/evidence/`。未触发 `docs/doc-gates.md` 中 eval/contracts/observability/environment/release 等新文档要求。

## 前置条件

- 当前 `main` 已包含 M0-01、M0-02 cleanup、M0-05 PR1/PR2。
- 当前没有开放 PR。
- 当前业务代码仍是 M0 空骨架；本 PR 不改变 M0 只放行治理/spike 的边界。

## 实施步骤

1. 新增本 spec，锁定本 PR 为 docs-only kickoff readiness cleanup。
2. 将活跃 RLS spike spec 从重复的 `M0-02` 文件名改为 `SPK-03-rls-prisma-pool.md`，并更新引用。
3. 新增 M0 kickoff readiness rollup，记录 PR #1-#4、`npm run check`、下一个允许动作、仍阻断 Gate 1 的 P0 项。
4. 更新 Gate 0 与 infra evidence，反映 M0 治理骨架和文档 gate 已闭环，SPK-03/SPK-04/ADR-003 仍未闭合。
5. 记录 GitHub ruleset 的真实 owner-review 状态：当前单 owner 仓库强制 PR、`checks`、禁止 force-push/delete、review thread resolution；不强制 1 人 approving review，例外 PR 需要项目 owner 显式审批记录。
6. 记录本地 `codex/uzmax-governance-drift-hardening` 分支结论：不并入本 PR；若仍需要，必须从当前 `main` 另开独立 spec/PR。

## 通过条件

- `docs/specs/` 不再同时存在两个活跃 `M0-02` spec 身份；历史 cleanup spec 可保留 `M0-02`。
- `docs/preflight/00-opening-control-matrix.md` 与 Gate 0 evidence 指向新的 `SPK-03` spec 路径。
- M0 readiness rollup 清楚说明：已闭合项、未闭合项、下一个允许动作、owner-review 现状和本地旧分支处理结论。
- `git diff --check` 通过。
- `npm run check` 通过。
- GitHub Actions `checks` 通过。

## 失败分支

- 若 rename 造成历史 PR 或 evidence 引用混乱，保留历史 cleanup spec，不改其内容；只修正活跃 RLS spike 引用。
- 若发现 GitHub ruleset 可安全强制 1 人 review 且不会造成单 owner deadlock，另开 infra spec 操作平台设置；本 PR 只记录当前事实。
- 若旧本地分支仍有需要复用的实现，不 cherry-pick；另开当前 main 上的新 cleanup/refactor spec。

## 不做什么

- 不实现 SPK-03、SPK-04 或 ADR-003。
- 不进入 M1 平台骨架。
- 不改 `apps/`、`packages/`、CI 脚本或 GitHub ruleset。
- 不删除本地未合并分支。
- 不引入业务代码、schema、provider、connector 或 adapter。

## 验收映射

- K-03：本 PR 有独立 spec，保持一 PR 一 spec。
- K-04：整理触碰范围与后续 SPK-03 串行点，避免编号和 evidence 误导并行开工。
- J-05：里程碑证据滚动归档，不把 M0 readiness 证据推迟到 M6。

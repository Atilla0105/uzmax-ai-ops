# M4-48 Owner Signoff Test Alignment

## 目标

修正两个 M4 focused tests 中对 M4 evidence index 的过期状态断言。当前 `docs/evidence/M4/README.md` 已由 M4-47 更新为 `owner_accepted_m4_milestone_evidence`，测试仍断言 README 当前状态为 `m4_ready_for_owner_closeout_review`。本切片只让测试反映已合并的 M4-47 owner signoff 状态，不改变 runtime、production、release 或 M4 status 语义。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本修补只对齐 stale tests 与当前 M4-47 owner accepted evidence，不扩大 M4/M5/production/release 范围。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-48-owner-signoff-test-alignment` / `codex/m4-48-owner-signoff-test-alignment` 中执行，读取 `AGENTS.md`、v1.1 正式文档、M4-46/M4-47 evidence 与当前 tests，新增本 spec/evidence，最小修改两个 stale assertions，并保留 M4-46 自身 readiness evidence/spec 断言。

## 时间盒

0.05 个工作日。若当前 worktree/branch 不匹配、README 当前状态不是 `owner_accepted_m4_milestone_evidence`、或 validation 无法在本 worktree 证明测试口径修复，则停止并记录失败分支。

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-48-owner-signoff-test-alignment.md`
  - `docs/evidence/M4/M4-48-owner-signoff-test-alignment.md`
  - `docs/evidence/M4/README.md`
  - `scripts/tests/m4-audit-closeout-readiness.test.mjs`
  - `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许 M4-48 spec/evidence、M4 README evidence 索引项，以及两个 focused M4 tests 的 stale status assertion 修正。
  - 未列出的模块默认不可改，尤其不得修改 M5 files、DB schema/migrations、runtime source、API/admin/worker code、lockfiles、package files、CI config 或 guard scripts。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test 预算：changed test files <= 2；只允许替换 stale README status assertion，不删除测试、不降低断言、不新增 `.skip` / `.only` / `xit` / `xfail`。
- path categories：docs = 本 spec、M4-48 evidence、M4 evidence README；test = two focused M4 test files；source/generated/lock/config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `m4_ready_for_owner_closeout_review`、`owner_accepted_m4_milestone_evidence`、`M4-46`、`M4-47`、`M4-48` 于 `docs` 与 `scripts/tests`，确认 stale assertions 只位于两个 focused test 对 M4 README 的当前状态读取处。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m4-48-owner-signoff-test-alignment`。
- 当前 branch 必须是 `codex/m4-48-owner-signoff-test-alignment`。
- 禁止修改 root checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert 他人改动。
- 开工前必须重读 `AGENTS.md`、v1.1 PRD、技术架构、后台设计与前端架构、1.0 验收矩阵、`docs/specs/README.md`、`docs/doc-gates.md`、M4 README、M4-46 evidence、M4-47 spec/evidence 与两个目标 test files。
- 开工前必须记录：`pwd`、`git status --short --branch`、`git branch --show-current`。
- 当前 worker `HEAD` 与 `origin/main` 在开工前均为 `761e1257fa9dbb1be04fa704031f2bbf5d28efd9`。
- 当前 M4 README status 必须保持 `owner_accepted_m4_milestone_evidence`，不得恢复或改写为 M4-46 ready token。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m4-48-owner-signoff-test-alignment` |
| branch | `codex/m4-48-owner-signoff-test-alignment` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single small fix spec. Touch modules are exactly the allowed list above. This PR does not touch schema, lockfile, shared config, CI/guard scripts, generated artifacts, provider routes, runtime release gates, production configuration, M5/M6 scope or customer/order data.

## 事故与 closeout 记录

- Incident: none created by this spec.
- If validation reveals write-boundary, wrong-branch, stale dependency install or unrelated local changes, stop and report before widening scope.

## 实施步骤

1. 新增本 M4-48 fix spec。
2. 新增 `docs/evidence/M4/M4-48-owner-signoff-test-alignment.md`，记录 stale assertion basis、scope boundary、validation 与 review。
3. 在 `docs/evidence/M4/README.md` 只追加 M4-48 evidence 索引项，不改变 current closeout/signoff record 或 current status semantics。
4. 更新两个目标 tests 中读取 M4 README current status 的 stale assertion，使其断言 `owner_accepted_m4_milestone_evidence`。
5. 保留 M4-46 evidence/spec 上的 `m4_ready_for_owner_closeout_review` assertions。
6. 运行 required validation，复核 diff 只含 allowlist 文件。

## 通过条件

- Diff 只包含触碰模块/文件中列出的 5 个文件。
- `docs/evidence/M4/README.md` 当前状态仍为 `owner_accepted_m4_milestone_evidence`，当前 closeout/signoff record 仍为 M4-47。
- 两个目标 tests 不再对 M4 README 当前状态断言 `m4_ready_for_owner_closeout_review`。
- M4-46 evidence/spec 自身的 readiness token assertions 保留。
- Evidence 与 README 明确本切片不代表 production、GA-0、真实客户流量、customer LLM、生产 Redis/worker、正式告警路由、真实客户/订单数据、production eval gate 或 1.0 release signoff。
- Required validation passes or is honestly recorded: `node --test scripts/tests/m4-audit-closeout-readiness.test.mjs scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`, `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-48-owner-signoff-test-alignment.md --include-worktree`, `git diff --check origin/main...HEAD`.

## 失败分支

- 若 M4 README current status 不是 `owner_accepted_m4_milestone_evidence`：停止，不重写状态，交由 coordinator 判断是否需要重新同步 main。
- 若目标 tests 需要 runtime source、package、lockfile、guard 或 CI config 改动才能通过：停止并报告，不扩大 touch list。
- 若 M4-46 evidence/spec readiness token assertions 被误删：恢复该断言或停止。
- 若 validation 发现 docs/test allowlist 外的文件变化：停止并清理本 worker 产生的越界改动；不得扩大 touch list。
- 若 evidence wording 误写为 production、GA-0、real traffic、customer LLM、生产 Redis/worker、正式告警路由、production eval gate 或 1.0 release 已关闭：修正为 M4 milestone evidence only，不继承错误表述。

## 不做什么

- 不修改 M5 files、DB schema/migrations、runtime source、API/admin/worker code、lockfiles、package files、CI config、guard scripts、generated/dist、runbooks、raw samples、root checkout 或其他 worktree。
- 不实现或改动 production DB repository、formal auth runtime、Admin owner production flow、worker/Redis deployment、formal alert routing、external order API connector、XLSX parser、real eval fixtures、LLM/provider judge、production eval gate、M5/M6 或真实客户/订单流量。
- 不批准 production、GA-0、real customer traffic、customer LLM、production worker/Redis deployment、formal alert routing、real customer/order data、production eval gate 或 1.0 release。

## 验收映射

| Item | M4-48 status | Notes |
|---|---|---|
| J-02 | owner_accepted_m4_milestone_evidence | Tests now read the current M4 README owner-accepted status while preserving M4-45/M4-46 queue/security evidence assertions. |
| J-05 | owner_accepted_m4_milestone_evidence | This fix keeps milestone evidence signoff traceable and avoids stale ready-state assertions after M4-47. |
| K-03 | active | One spec / one PR; this PR only implements M4-48 test alignment. |
| K-04 | active | Touch modules explicit; docs/test only; no source/config/lock/generated changes. |

M4-48 不关闭任何 1.0 production acceptance item，只修正 stale tests 与已合并 M4 milestone evidence 状态之间的不一致。

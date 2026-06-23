# M4-46 Audit Closeout Readiness

## 目标

清理 M4-45 留下的唯一明确工程阻断：`npm audit --json` 中由 `@nestjs/platform-express -> multer@2.1.1` 引入的 3 个 high vulnerability。用最小、可回滚的 npm nested override 将 `@nestjs/platform-express` 的 transitive `multer` 解析到 `2.2.0`，并用 audit、Nest/API smoke、M4 关键测试和 full validation 证明兼容。

本 spec 的目标是把 M4 从 `queue_security_closeout_supported_not_production_deployment__security_blocker_open` 推进到 `queue_security_closeout_supported_not_production_deployment` / `m4_ready_for_owner_closeout_review`。它不是生产发布、GA-0、1.0 release、生产 Redis/worker 部署、真实客户/订单数据验收、真实 eval fixtures 或 owner 最终上线签收。

## 项目 Owner 确认点与 AI Agent 责任

Owner：确认本切片允许一个 bounded npm nested override 修复 M4 audit blocker；生产上线、真实账号、真实客户/订单数据、生产 Redis/worker、成本、合规和最终 M4 closeout/signoff 仍由 owner 决策。

AI agent：最终只在隔离 worker linked worktree `/Users/atilla/Documents/uzmax-m4-46-audit-closeout-readiness-linked` / branch `codex/m4-46-audit-closeout-readiness` 执行；不得写正式 root/main checkout。必须证明 override 后 `npm audit --json` high/total 为 `0`，并验证当前 Nest/API smoke、M4 order import/customer asset/order-read/queue evidence 不回退。若 override 造成 install、lockfile、API runtime、test 或 build 破坏，必须移除 override 并把 blocker 保留为 M4 security blocker。

## 时间盒

0.5 个工作日。若 nested override 不能清零 audit 或破坏 Nest/API build/smoke，不继续做依赖大迁移；记录失败分支并等待专门 dependency/security spec。

## Spec 类型

fix

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-46-audit-closeout-readiness.md`
  - `docs/evidence/M4/M4-46-audit-closeout-readiness.md`
  - `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`
  - `docs/evidence/M4/README.md`
  - `package.json`
  - `package-lock.json`
  - `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`
  - `scripts/tests/m4-audit-closeout-readiness.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得修改 app/source runtime、DB schema/migration/generated client、CI workflow、admin UI、worker queue runtime、order-read eval behavior 或真实样例。只允许 package override、lockfile resolution、focused test 和 M4 evidence/readiness wording。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- path classification:
  - config: `package.json`
  - lock: `package-lock.json`
  - test: `scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs`, `scripts/tests/m4-audit-closeout-readiness.test.mjs`
  - docs: `docs/specs/M4-46-audit-closeout-readiness.md`, `docs/evidence/M4/M4-46-audit-closeout-readiness.md`, `docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`, `docs/evidence/M4/README.md`
  - source: none
  - generated: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `multer`, `@nestjs/platform-express`, `FileInterceptor`, `UploadedFile`, `multipart`, `M4-45`, `security_blocker` 于 `apps`, `packages`, `scripts`, `docs`, `package.json`, `package-lock.json`。当前缺口是 npm transitive dependency audit blocker，不是业务上传实现；repo 中没有直接使用 Nest file upload interceptors。
- 外部依赖依据：2026-06-24 `npm view @nestjs/platform-express version dependencies --json` 返回 `@nestjs/platform-express@11.1.27` 且直接依赖 `multer: 2.1.1`；`npm view multer version --json` 返回 `2.2.0`；临时 `/tmp` 干净 lock 再生证明 `overrides.@nestjs/platform-express.multer=2.2.0` 可把 `npm audit --json` high/total 降为 `0`，而简单 `overrides.multer=2.2.0` 无效。
- 是否需要例外：none。lockfile must remain minimal: only the `node_modules/multer` package resolution may change from `2.1.1` to `2.2.0`; unrelated package version/dependency-map drift must be reverted or split.

## 文档触发检查

- 结果：updated。
- 判断依据：`docs/doc-gates.md`；本 slice 更新安全 blocker/evidence，不新增 production runbook、environment schema、release workflow、OpenAPI/generated DTO 或 external connector docs。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/specs/M4-45-order-import-queue-security-closeout.md`、`docs/evidence/M4/M4-45-order-import-queue-security-closeout.md`、v1.1 验收矩阵 J-02/E-02/E-03/E-04/I-01。
- Root/main at start: `/Users/atilla/Documents/UZMAX智能运营` clean on `main` at `0e365c6b9c84f74fecc7232d7ede6d6ae7e967ab`; open PR list `[]`; local `git branch --no-merged main` empty.
- Two stale remote M3 branches were patch-equivalent to `origin/main` by `git cherry -v` and were deleted before this work: `codex/m3-11-pre-m4-worker-write-boundary-governance`, `codex/m3-19-test-phase-ai-materials`.
- Standard `git worktree add` and `git worktree prune` in the formal root/main checkout hung against `.git/worktrees`; to avoid root/main writes and shared index pollution, this slice used an isolated fresh clone at `/Users/atilla/Documents/uzmax-m4-46-audit-closeout-readiness-clone`, then created the final worker linked worktree at `/Users/atilla/Documents/uzmax-m4-46-audit-closeout-readiness-linked` from that clone. This is a temporary orchestration fallback, not a new project convention.
- Worker checkout baseline:
  - `pwd=/Users/atilla/Documents/uzmax-m4-46-audit-closeout-readiness-linked`
  - `git status --short --branch=## codex/m4-46-audit-closeout-readiness`
  - base before M4-46: `0e365c6b9c84f74fecc7232d7ede6d6ae7e967ab`
  - `npm ci` passed and reproduced existing 3 high vulnerabilities before this fix.

## 并发派发证据

本 spec touches package/lock and M4 evidence, so it must be globally serial. Do not run parallel write workers touching dependency metadata, CI, DB schema, M4 evidence README, release gates or security blockers. Read-only reviewers may run after implementation.

## 事故与 closeout 记录

- No source/runtime incident is introduced by this spec.
- The root `.git/worktrees` hang is orchestration friction discovered before intentional writes. This spec records the fallback path; if future worktree creation remains blocked after this slice, repair should be handled as a dedicated repo hygiene task, not mixed into M4 security dependency changes.

## 实施步骤

1. Add the smallest npm override:
   - `package.json#overrides["@nestjs/platform-express"].multer = "2.2.0"`.
2. Keep `package-lock.json` scoped to the override result only:
   - `node_modules/multer.version/resolved/integrity` may change to `2.2.0`;
   - unrelated package versions, dependency maps, added packages or removed packages must stay unchanged from `origin/main`.
3. Add focused test `scripts/tests/m4-audit-closeout-readiness.test.mjs` that asserts:
   - root `package.json` contains only the nested `@nestjs/platform-express -> multer@2.2.0` override;
   - lockfile resolves `node_modules/multer` to `2.2.0`;
   - lockfile still keeps `@nestjs/platform-express@11.1.27`;
   - repo app/source does not directly use Nest file upload interceptors or `multer`;
   - M4 evidence records audit high cleared after validation.
4. Update M4-45 evidence and M4 README:
   - replace security blocker wording with audit-cleared wording only after `npm audit --json` proves high/total `0`;
   - keep production worker/Redis deployment, formal alert routing, real samples, production eval gate and owner release signoff out of scope;
   - record latest validation commands and CI once available.
5. Validate locally:
   - `node --test scripts/tests/m4-audit-closeout-readiness.test.mjs`
   - `npm audit --json`
   - focused M4 smoke tests covering API/Nest, customer asset runtime, order-read eval, BullMQ runtime:
     `node --test scripts/tests/m4-order-import-api-true-db-http-smoke.test.mjs scripts/tests/m4-customer-asset-runtime-workflow.test.mjs scripts/tests/m4-order-read-runtime-eval-gate.test.mjs scripts/tests/m4-order-import-bullmq-redis-runtime.test.mjs scripts/tests/m4-audit-closeout-readiness.test.mjs`
   - `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run depcruise`, `npm run jscpd`, `npm run knip`, `npm run guard:forbidden-terms`, `npm run guard:eval-triggers`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-46-audit-closeout-readiness.md`, `npm test`, `npm run build`.
6. Open PR with PR Hygiene, spec compliance review, code quality/security review, CI green, then merge and cleanup.

## 通过条件

- `npm audit --json` exits `0` and reports high `0`, total `0`.
- `node --test scripts/tests/m4-audit-closeout-readiness.test.mjs` passes.
- Focused M4 tests listed above pass.
- `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run depcruise`, `npm run jscpd`, `npm run knip`, `npm run guard:forbidden-terms`, `npm run guard:eval-triggers`, `npm run guard:doc-triggers`, `npm run guard:workspace`, `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M4-46-audit-closeout-readiness.md`, `npm test`, `npm run build` pass.
- PR/evidence reports changed files, path categories, minimal lockfile diff, audit before/after, external dependency evidence, no source LOC, no test weakening and no production/release claims.
- M4 README no longer lists npm audit high as an open M4 blocker; it instead records M4 as ready for owner closeout review, with production/release scope still future-gated.

## 失败分支

- 若 nested override fails to clear `npm audit`: remove override, keep M4-45 blocker wording, and record dependency/security blocker for a future dedicated spec.
- 若 override clears audit but breaks Nest/API focused tests, typecheck or build: remove override and record exact failure; do not merge.
- 若 lockfile churn includes unrelated major dependency changes: stop, revert lockfile, and split a dependency upgrade spec.
- 若 final CI fails for unrelated flaky true DB smoke: inspect logs; do not mark M4 ready until CI evidence is either green or explicitly recorded as unrelated infrastructure failure with a rerun.

## 不做什么

- 不新增业务 source、DB schema/migration/generated client、admin UI、API/worker runtime, queue behavior, eval behavior, external connector, production Redis/Render service, real worker deployment, release gate 或 M5/M6 演练。
- 不提交 raw CSV/XLSX/export/jsonl、真实订单号、客户明文、电话、地址、支付、截图、credentials、env 或 secret。
- 不把 audit cleared 误写成 production security/compliance signoff；M4 closeout owner decision remains separate.

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-02 | `order_import_queue_runtime_supported_for_m4_no_api_branch` | No behavior change; M4-45 queue runtime remains supported. |
| E-03 | `order_import_stale_missing_warning_closed_for_m4_no_api_branch` | No behavior change; warning semantics remain from M4-42/M4-44. |
| E-04 | `order_read_runtime_eval_gate_supported_not_production_gate` | No eval behavior change; M4-44 bridge remains intact. |
| I-01 | `m4_desktop_paths_ready_for_owner_closeout_review_not_release` | No new UI; M4 evidence can be rolled up without the audit high blocker. |
| J-02 | `queue_security_closeout_supported_not_production_deployment` | `npm audit` high blocker is cleared by bounded nested override; production worker/Redis deployment and formal alert routing remain future owner decisions. |

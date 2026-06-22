# M3-19 Test Phase AI Materials

## 目标

记录项目 owner 于 2026-06-22 作出的测试阶段材料分支决策，并把现有 owner-local FAQ、脱敏 Telegram 样本和后续可引用公开资料纳入 M3 测试材料规则：

- 测试阶段 AI agent 可以使用本机 `文稿` 中的 FAQ、脱敏聊天记录和可引用公开教程/资料来推进知识结构、测试样本选择和 AI-assisted review；
- raw 聊天、截图、客户明文、raw prompt/completion、secrets 不进入仓库；
- 这些测试材料不等同于上线材料；上线前项目 owner 会重新整理正式知识、教程、截图和盲评证据；
- 本 PR 只产出 docs/evidence，不发布知识、不关闭 M3、不启动 M4。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认测试阶段允许 AI agent 使用本机 FAQ、聊天记录/脱敏样本和可引用公开资料提升效率；上线前 owner 仍负责正式知识、教程、截图、盲评、customer LLM、模型路由、成本、合规、GA-0 和 1.0 发布决策。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-19-test-phase-ai-materials` / `codex/m3-19-test-phase-ai-materials` 中执行；记录 owner 分支决策、来源边界、KB 测试结构和语言样本选择证据；不提交 raw/customer/secret material；不把 AI-assisted 测试证据冒充 owner blind review 或 production closeout。

## 时间盒

0.25 个工作日。若本地材料需要 raw 内容进入仓库、公开资料无法引用、语言样本不能以 controlled refs 表达，或证据会被误读为 production signoff，则停止并保持 M3 no-go。

## Spec 类型

docs

## 触碰模块/文件

- `docs/specs/M3-19-test-phase-ai-materials.md`
- `docs/evidence/M3/M3-19-test-phase-ai-materials.md`
- `docs/evidence/M3/tutorial/test-stage-kb-structure.md`
- `docs/evidence/M3/language-blind-review/test-stage-ai-assisted-review.md`
- `docs/evidence/M3/M3-ai-capability-closeout-signoff.md`
- `docs/evidence/M3/README.md`

说明/备注：

未列出的模块默认不可改。尤其不得触碰 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated/dist、raw/export/jsonl/csv、客户明文、Telegram payload、screenshots、voice transcripts、orders、phone/address/payment data、support personal accounts、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 0；net source LOC <= 0；new source files <= 0。
- path categories：docs = this spec、M3-19 evidence、test-stage KB structure evidence、test-stage language review evidence、M3 closeout rollup、M3 evidence README。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source。已检索 `M3-16`、`M3-17`、`M3-18`、`test-stage`、`blind-review`、`tutorial-materials-manifest`、`kb-candidate`、`FAQ`、`FQA`、`Telegram`、`language_or_script`、`owner_inputs`。当前缺口是测试阶段材料分支决策和证据 rollup，不是 runtime implementation。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增外部 API/SDK/provider/connector/adapter。公开资料只允许作为未来 test material refs，使用时必须记录来源 URL、访问日期、摘要用途和版权边界。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-19-test-phase-ai-materials`。
- 当前分支必须是 `codex/m3-19-test-phase-ai-materials`。
- root/main checkout `/Users/atilla/Documents/UZMAX智能运营` 只允许只读核对，禁止写入。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current` 和 root/main status。
- 开工前必须重读 `AGENTS.md`、四份 v1.1 根文档、`docs/specs/README.md`、`docs/evidence/M3/README.md`、M3 closeout evidence、M3-16/M3-17/M3-18 spec/evidence、`docs/preflight/01-owner-inputs-checklist.md`。

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m3-19-test-phase-ai-materials` |
| branch | `codex/m3-19-test-phase-ai-materials` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | coordination/read-only only |

## 并发派发证据

Single worker, single linked worktree, single branch, single docs spec. No concurrent worker is active for overlapping M3 evidence paths in this task.

## 事故与 closeout 记录

- Incident: none at authoring.
- If any raw customer material, raw screenshot, secret, unsupported external claim, or unreviewed public content would enter git, stop and remove the generated content before continuing.

## 实施步骤

1. Record the owner test-phase source decision in M3-19 evidence.
2. Record local source availability and aggregate counts from FAQ and redacted Telegram manifests without copying raw content.
3. Add test-stage KB structure evidence based on the M3-16 candidate pack and M3-04 KB journey shape.
4. Add AI-assisted language review sample-selection evidence using controlled sample ids only.
5. Update M3 closeout and README to include M3-18 and M3-19 while preserving M3 no-go and production blocker wording.

## 通过条件

- M3-19 spec contains required fields and a docs-only touch list.
- Evidence records owner test-stage source decision and keeps production boundary explicit.
- KB structure evidence uses controlled refs and does not claim DB/admin/import/publish closure.
- Language evidence records test sample selection and strong-model safety default without claiming owner blind review passed.
- M3 closeout remains no-go for production/M3 owner acceptance.
- Required validation passes or is honestly recorded: `npm run format:check`, `npm run guard:doc-triggers`, `npm run guard:workspace`, explicit assigned/root `npm run guard:worker-boundary`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-19-test-phase-ai-materials.md --include-worktree`, `git diff --check origin/main...HEAD`, and full `npm run check` if feasible.

## 失败分支

- 若需要提交 raw 聊天、截图、模型回复、prompt/completion、订单/电话/地址/支付信息、客服个人账号或 secret：停止，删除该内容，只保留 controlled refs/hash/count。
- 若公开资料没有可引用来源或版权/平台条款不清：不得纳入 test evidence。
- 若语言样本无法覆盖 G-04 所需类别：记录 coverage gap，不得用 proxy 样本冒充 owner blind review。
- 若 GitHub Actions 因 billing/spending limit 无法启动：记录 external validation blocker，不得 claim remote CI pass。

## 不做什么

- 不实现 DB persistence、API、worker、engine orchestration、admin UI、storage upload、eval runner、provider adapter、outbound send、confirmation queue 或 distill。
- 不运行 customer LLM，不发布 prompt、知识、模型路由或 AI 人设。
- 不关闭 F-01/F-02/G-04/H-01/G-06/M3，不启动 M4，不放行 production、GA-0、真实客户流量、customer LLM、Business release 或 1.0 release。

## 验收映射

| Item | M3-19 status | Notes |
|---|---|---|
| F-01 | test_structure_ready_not_closed | KB/test journey structure is ready for future eval, but no DB/admin/import/publish closure. |
| G-04 | ai_assisted_sample_selection_ready_not_owner_scored | Controlled language sample ids are selected for testing; owner blind review and strong-model decision remain production gates. |
| G-06 | test_coverage_improved_not_full_closed | Local redacted pool has enough proxy language sample ids for test selection, but full production quotas remain future. |
| H-01 | test_kb_structure_ready_not_published | Candidate facts/journey structure exist as evidence only; no official KB publish. |
| J-05 | evidence_updated | M3 rollup now records M3-18/M3-19 and the test-phase branch decision. |
| K-03 | active | One spec / one branch / one PR slice. |
| K-04 | active | Docs-only; no schema/lock/shared config changes. |

M3-19 does not close M3. It converts the latest owner message into an auditable test-phase material branch and prepares follow-up work to run faster without weakening production gates.

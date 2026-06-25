# M6-00 M5 Signoff And M6 Readiness Pack

## 目标

Record the project owner M5 signoff, open the M6 release-hardening planning truth source in repo, and create a docs-only readiness baseline for M6-00 through M6-09.

This spec does not start M6-01 implementation. Linear issue `LAY-5` is tracking only; repo files are the source of truth.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: project owner accepted M5 milestone/runtime evidence in the Codex thread on 2026-06-25 with: "同意签收m5，可以启动m6". The owner still owns GA-0 opening, production deploy, real customer/order-data use, real LLM/provider key and cost decisions, P1 risk signoff, and 1.0 release approval.

AI agent: record the signoff, preserve release boundaries, create the M6 readiness queue, expose current main/CI/PR/branch status, record acceptance-matrix gaps, and keep future implementation slices spec-governed.

## 时间盒

0.5 个工作日. If this docs-only slice requires source/runtime/schema/API/admin/worker/cron implementation, production deploy, real customer/order data, real LLM/provider calls, external SaaS actions, CI/guard/config/lockfile changes, or starting M6-01 implementation, stop and report instead of widening this PR.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-00-m5-signoff-and-m6-readiness-pack.md`
  - `docs/evidence/M6/README.md`
  - `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`
- 说明/备注：
  - This PR is docs-only. It may read `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/specs/README.md`, `docs/evidence/README.md`, M5/M5R specs/evidence, runbooks, Git/GitHub current-state evidence, and Linear issue `LAY-5`.
  - Do not create `M6-01` through `M6-09` implementation spec files in this slice.
  - Do not modify `apps/**`, `packages/**`, `scripts/**`, lockfile, config, generated files or runtime release gates.
  - Root/main checkout `/Users/atilla/Applications/UZMAX智能运营` is coordination/read-only only.

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0.
- test/generated/lock/config/docs 预计变更：docs only; add one M6-00 spec and create M6 evidence entry/manifest.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：no source files are added. `rg` confirmed no existing `docs/specs/M6-*`, no `docs/evidence/M6/`, and no repo M6 execution plan.
- 外部 API/SDK/provider/connector/adapter 依据：无. GitHub REST is used only for read-only PR/CI evidence; Linear is tracking only and not a source of truth.
- 是否需要例外：无.

## 文档触发检查

- 结果：none.
- 判断依据：`docs/doc-gates.md`. This slice creates an M6 readiness baseline and acceptance-gap index, but it does not create a GA-0 checklist, close rollback drills, implement a release console workflow, or define a production release workflow. `docs/release.md` may be triggered by later M6 slices when those concrete artifacts appear.

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`, `docs/evidence/README.md` and `docs/specs/SPEC-template.md`.
- Read the four v1.1 source-of-truth docs named in `AGENTS.md`.
- Read current M5/M5R evidence, especially `docs/evidence/M5/README.md`, `docs/evidence/M5R/README.md` and `docs/evidence/M5R/M5R-08-true-integration-closeout.md`.
- Confirm repo currently has no complete M6 plan: no `docs/specs/M6-*`, no `docs/evidence/M6/`, and no `docs/release.md`.
- Confirm project owner has accepted M5 in the Codex thread before this slice records signoff.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worker worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-00-m5-signoff-readiness` |
| worker branch | `codex/m6-00-m5-signoff-readiness` |
| forbidden checkout for edits | `/Users/atilla/Applications/UZMAX智能运营` |
| required pre-edit evidence | worker `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, root/main `HEAD`, open PR audit, branch audit, latest main CI evidence |

## 并发派发证据

Single active writing worker for M6-00. Future M6 slices must use one worker = one physical worktree = one branch = one spec.

Global serial points for M6: `packages/db`, Prisma schema, migrations, RLS policy changes, shared runtime helpers, lockfile, shared config, CI/guard scripts, global generated artifacts, release/production gates, and any owner-facing release-console contract.

## 事故与 closeout 记录

If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

M6-00 creates no new incident if execution stays inside the assigned worktree and allowed docs paths.

Known inherited incident evidence before M6: `docs/incidents/INC-2026-06-24-m5r-00-root-main-worktree-pollution.md`, `docs/incidents/INC-2026-06-25-m5r-04-root-readme-pollution.md`, `docs/incidents/INC-2026-06-25-m5r-06-root-patch-target.md`.

M6-00 closeout evidence is `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.

## 实施步骤

1. Record current repo, CI, PR and branch state.
2. Add this M6-00 docs spec as the M6 total readiness spec.
3. Create `docs/evidence/M6/README.md` as the M6 evidence directory entry and source-of-truth index.
4. Create `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` with M5 owner signoff, M5R current state, M6 execution slices, acceptance-matrix gap table, current main/CI/PR/branch status, and remaining-gap list.
5. Keep M5/M5R README files as historical M5R-08 closeout evidence; record the later owner M5 signoff in M6 evidence as the handoff/current planning truth.
6. Run docs/guard validation and record results in the M6-00 evidence.
7. Push/open a docs-only PR, then update Linear `LAY-5` with repo paths and conclusion.

## M6 Execution Slices

M6 is release hardening and residual closure. It is not a new product expansion phase, not a formal UI redesign phase, and not production approval. Each future slice after M6-00 must open its own spec/branch/PR before implementation.

| Slice | Working title | Goal | Primary acceptance focus | Serial / parallel rule |
|---|---|---|---|---|
| M6-00 | M5 signoff and M6 readiness pack | Record M5 owner signoff and create M6 planning/evidence truth source. | J-05, K-03, K-04 | This docs-only slice is first and serial. |
| M6-01 | Evidence-driven release gate console | Align owner-facing release gate state with current evidence and blockers. | J-05, L-01, admin release surface | Serial with release/production gate contracts; do not mix broad UI redesign. |
| M6-02 | Runtime deploy and rollback baseline | Establish api/worker/cron/admin deploy, health and rollback baseline. | J-01, J-04, architecture deployment rules | May run after M6-00; serial with deployment config or release gate changes. |
| M6-03 | Queue and failure injection drills | Drill retry, idempotency, backlog alert, worker accumulation and order-import abnormal path. | J-02, final fault-drill list | Depends on M6-02 where runtime surfaces are needed; serial with worker/queue paths. |
| M6-04 | RLS/authz release matrix | Run release-level tenant isolation, forged-context, permission and audit matrix. | B-01..B-05, K-04 | Global serial for DB/RLS/schema/authz/API guard changes. |
| M6-05 | AI safety and eval gates | Close redline, eval gate, model-all-down, AI fuse and owner language-risk gaps. | F-05, F-06, G-01..G-06, L-02 | Serial with eval/prompt/model-route gates; no assertion weakening. |
| M6-06 | Telegram Bot GA-0 main path | Validate Bot-only GA-0 main path with synthetic/test traffic and Business disabled boundary. | C-01, C-02, C-03b, C-06, L-01 | Depends on queue and AI safety evidence; Business auto-reply remains out of scope. |
| M6-07 | Core operations synthetic E2E | Prove one synthetic golden path across conversation, ticket, customer asset, order snapshot, confirmation, logs and admin visibility. | A/D/E/H/I cross-domain closure | Starts only after relevant runtime/security gates are ready; fixes only acceptance blockers. |
| M6-08 | Backup restore and asset safety drills | Drill backup/restore and verify material/template/knowledge write safety. | J-03, H-01, H-05, H-06 | Requires safe DB target; no destructive production restore. |
| M6-09 | Final acceptance closure | Roll up P0/P1/P2 status and prepare owner GA-0 go/no-go decision package. | J-05, L-01, L-02, full release judgment | Last and serial; no new implementation unless a blocker is split into its own spec. |

## 通过条件

- M6-00 spec contains every required field from `docs/specs/README.md`.
- `docs/evidence/M6/README.md` exists and is the M6 evidence directory entry.
- `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md` records:
  - M5 owner signoff;
  - M5R evidence current state;
  - current main / CI / PR / branch status;
  - M6-00 through M6-09 execution slices;
  - acceptance-matrix gap table;
  - M6 readiness / remaining-gap list.
- M6 evidence records the owner M5 signoff and explains that older M5/M5R README status strings are historical M5R-08 closeout inputs.
- Diff only includes the allowed docs paths.
- Required validation passes or failures are honestly recorded.
- Linear `LAY-5` receives a comment with repo file paths and conclusion.

## 失败分支

- If the worktree path or branch differs from expected: stop and report.
- If root/main is dirty or ahead before docs edits: stop and report.
- If current repo evidence contradicts M5 owner signoff or M5R closeout status: record the contradiction and do not present M6 as ready to start.
- If a real GA-0 checklist, release workflow, rollback drill closure, or production release process must be created to complete this slice: stop and split a later M6 spec instead of widening M6-00.
- If validation requires changes outside the allowed docs paths: stop and report before widening scope.
- If wording implies GA-0 opening, production readiness, real customer/order-data approval, customer LLM approval, real LLM/provider key approval, external SaaS onboarding or 1.0 release signoff: correct it before merge.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.

## 不做什么

- Do not start M6-01.
- Do not create M6-01 through M6-09 implementation spec files.
- Do not implement or change source/runtime/schema/API/admin/worker/cron behavior.
- Do not create a production release workflow or approve GA-0.
- Do not use Linear as source of truth.
- Do not use real customer/order data, customer LLM, real LLM/provider calls, production Redis/worker deployment or external SaaS onboarding.
- Do not delete or weaken tests.

## 验收映射

- J-05: records owner-accepted M5 evidence and prevents M6 backlog from becoming a memory-only or Linear-only plan.
- K-03: one spec / one PR for M6-00.
- K-04: records M6 serial/parallel rules and future slice boundaries.
- L-01/L-02: records remaining GA-0 gates but does not close them.

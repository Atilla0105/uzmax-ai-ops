# M6-01 Release Gate Console

## 目标

Align the admin release gate console with current repo evidence and M6 entry state so owner-facing gate status no longer shows stale M1/M5 progress.

This slice keeps Linear `LAY-6` as tracking only. Repo spec, source, tests and evidence are the source of truth.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: project owner has accepted M5 milestone/runtime evidence for starting M6, but still owns GA-0 opening, production deploy, real customer/order-data use, customer LLM/provider keys/cost, P1 risk signoff and 1.0 release approval.

AI agent: implement a narrow admin release gate contract, render it in the existing admin shell, preserve GA-0/production locks, add admin tests, record evidence and update Linear with repo paths and result.

## 时间盒

0.5-1 个工作日. If this requires broad admin redesign, backend release APIs, DB/schema changes, audit-write implementation, real production deployment, real customer/order data, real LLM/provider calls, external SaaS action or owner approval beyond M5 milestone signoff, stop and split a later M6 spec.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M6-01-release-gate-console.md`
  - `docs/evidence/M6/README.md`
  - `docs/evidence/M6/M6-01-release-gate-console.md`
  - `docs/release.md`
  - `apps/admin/src/App.tsx`
  - `apps/admin/src/releaseGateContracts.ts`
  - `apps/admin/tests/m6-release-gate-console.spec.ts`
  - `scripts/tests/m6-release-gate-console.test.mjs`
- 说明/备注：
  - This slice reuses the existing admin shell and release panel in `apps/admin/src/App.tsx`.
  - It may read `AGENTS.md`, the four v1.1 source-of-truth docs, `docs/specs/README.md`, `docs/evidence/README.md`, `docs/doc-gates.md`, M5/M5R/M6 evidence and Linear `LAY-6`.
  - Do not modify backend packages, schemas, migrations, lockfile, CI/guard config, runtime deployment, Redis/worker/cron paths or release approval logic.

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 220、new source files <= 1.
- test/generated/lock/config/docs 预计变更：one Playwright admin test, one Node contract/docs test, M6 evidence/spec update, concise release doc.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：`rg` found the existing release gate state hardcoded in `apps/admin/src/App.tsx`; no shared admin release contract exists. Add `apps/admin/src/releaseGateContracts.ts` as the single maintained contract and update `App.tsx` to render it.
- 外部 API/SDK/provider/connector/adapter 依据：无.
- 是否需要例外：无.

## 文档触发检查

- 结果：new doc required.
- 判断依据：`docs/doc-gates.md`; this slice makes the release console state a maintained admin contract, so `docs/release.md` is added as the small repo release-gate boundary doc.

## 前置条件

- Read `AGENTS.md`.
- Read `docs/specs/README.md`, `docs/evidence/README.md`, `docs/doc-gates.md` and this spec.
- Read the four v1.1 source-of-truth docs named in `AGENTS.md`, focusing on release gate, GA-0 and admin release-console clauses.
- Read `docs/evidence/M6/README.md` and `docs/evidence/M6/M6-00-m5-signoff-and-m6-readiness-pack.md`.
- Read Linear `LAY-6`; treat it as tracking only.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worker worktree | `/Users/atilla/.config/superpowers/worktrees/UZMAX智能运营/codex-m6-01-release-gate-console` |
| worker branch | `codex/m6-01-release-gate-console` |
| forbidden checkout for edits | `/Users/atilla/Applications/UZMAX智能运营` |
| required pre-edit evidence | worker `pwd`, `git status --short --branch`, `git branch --show-current`, worker `HEAD`, worker `origin/main`, root/main status, root/main `HEAD`, open PR audit, branch audit, latest main CI evidence |

## 并发派发证据

Single active writing worker for M6-01. M6-01 touches the owner-facing release console contract, so it must not run concurrently with another release/production gate UI or contract slice.

No DB/schema, migration, lockfile, shared config, CI/guard script, generated artifact, backend runtime or deployment work is allowed in this branch.

## 事故与 closeout 记录

If any write lands outside the assigned worktree, on root/main, on the wrong branch, in an unlisted path, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.

M6-01 creates no new incident if execution stays inside the assigned worktree and allowed paths.

Known inherited incidents remain the M5R root/main pollution records listed by M6-00.

## 实施步骤

1. Record current repo, CI, PR and branch state for M6-01 entry.
2. Add this spec before implementation edits.
3. Add a small `releaseGateContracts.ts` contract containing M0-M6, GA-0 and 1.0 gate state, evidence paths, blockers and GA-0 disabled/open boundary.
4. Update `App.tsx` to render release gate rows from the contract instead of stale hardcoded M0/M1/GA-0 data.
5. Add Playwright admin coverage for current gate state, evidence links and disabled GA-0 action.
6. Add a Node contract/docs test proving stale M1/M5 wording is absent and gate state is traceable.
7. Add `docs/release.md` as the concise release gate boundary doc.
8. Update `docs/evidence/M6/README.md` and add `docs/evidence/M6/M6-01-release-gate-console.md`.
9. Run focused validation, create a one-spec PR, update Linear `LAY-6`, merge after CI green, then clean local and remote branches.

## 通过条件

- Admin release gate no longer shows stale `M1-05 open` or pre-M6 M5 owner status.
- Release gate state is maintained in one admin contract and rendered by the admin shell.
- Admin release console surfaces:
  - current M5 owner-accepted milestone evidence;
  - M6 in-progress release-hardening state;
  - remaining blockers;
  - evidence doc paths;
  - GA-0 locked state and disabled open action.
- `docs/release.md` exists and records current release-gate boundaries without approving GA-0 or production.
- Focused Node and Playwright tests cover the updated gate behavior.
- Diff is limited to this spec's touch list and remains within source budget.
- Linear `LAY-6` receives a comment with repo paths, PR and result.

## 失败分支

- If current evidence contradicts M5 owner signoff or M6 readiness state: keep GA-0 locked and record blocker instead of showing ready.
- If release console requires backend audit-write implementation: stop and split a later M6 spec.
- If full admin redesign is required: stop and split a later UX/UI spec.
- If validation requires source/backend/schema/config/lockfile changes outside the touch list: stop and split the work.
- If wording implies GA-0 opened, production-ready, real customer/order-data approved, customer LLM approved, real LLM/provider key approved, external SaaS onboarding approved or 1.0 release approved: correct before merge.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop, clean up and create or reference incident evidence before continuing.

## 不做什么

- Do not start M6-02.
- Do not implement backend release APIs, audit-write persistence, production release workflow or GA-0 open action.
- Do not approve GA-0, production, real customer/order data, customer LLM, external SaaS onboarding or 1.0 release.
- Do not redesign the admin application.
- Do not change `packages/db`, migrations, generated files, lockfile, CI/guard scripts, worker, cron, channels, engine, capabilities, llm-gateway, evals or production deploy config.
- Do not weaken tests.

## 验收映射

- A-01/A-05: release console now reflects current group/release evidence posture and connector/risk blockers at a high level.
- A-04: non-goal release actions remain absent/disabled.
- J-05: milestone evidence is visible in admin release gate rather than stale or memory-only.
- L-01: GA-0 checklist remains locked until green and owner-approved.
- K-03/K-04: one spec / one PR and release gate contract stays serial.

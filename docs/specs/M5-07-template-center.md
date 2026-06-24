# M5-07 Template Center

## 目标

Implement one narrow frontend/local-contract slice for the M5 template center: group knowledge, AI member, config, eval and quick-reply templates; show copy governance; and build a pure local copy-draft contract proving copy-to-tenant creates a tenant-owned draft without auto-overwriting production tenant configuration.

This slice is admin frontend and pure local contract only. It must not call API/DB/runtime, persist templates, modify `packages/ops-assets`, or mark M5/A-03/H-04/H-06 accepted.

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner: confirm this PR is only the M5-07 frontend/local-contract slice. It does not close M5, A-03/H-04/H-06 production acceptance, GA-0, production readiness, real customer/order data, customer LLM, LLM keys, cost, compliance or 1.0 release decisions.

AI agent: implement only the allowlisted docs/admin/test files in the assigned worktree, keep all template rows synthetic and non-sensitive, fail closed on unsafe refs/raw fields/URLs/encoded payloads, record evidence and validation, and keep M5 not accepted.

## 时间盒

0.5 个工作日. If changed source files exceed 4, net source LOC exceeds 600, new source files exceed 3, or meaningful implementation requires API/DB/runtime/template persistence, stop and report `BLOCKED` with a smaller split.

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M5-07-template-center.md`
  - `docs/evidence/M5/M5-07-template-center.md`
  - `docs/evidence/M5/README.md`
  - `docs/incidents/INC-2026-06-24-m5-07-root-patch-target.md`
  - `apps/admin/src/M5TemplateCenterShell.tsx`
  - `apps/admin/src/templateCenterContracts.ts`
  - `apps/admin/src/m5-template-center-shell.css`
  - `apps/admin/src/App.tsx`
  - `apps/admin/tests/m5-template-center.spec.ts`
  - `scripts/tests/m5-template-center.test.mjs`
- 说明/备注：
  - Root/main checkout `/Users/atilla/Documents/UZMAX智能运营` is read-only for this worker.
  - This slice must not touch `apps/api/**`, `packages/db/**`, `packages/ops-assets/**`, `packages/distill/**`, `apps/worker/**`, `apps/cron/**`, `packages/engine/**`, `packages/capabilities/**`, `packages/llm-gateway/**`, `packages/evals/**`, package/lock/config/CI/guard files, raw samples, generated artifacts or production/release gates.

## 变更预算与路径分类

- source budget target: changed source files <= 4, net source LOC <= 600, new source files <= 3.
- docs: this spec, M5-07 evidence, M5 evidence README, one required incident record for the root patch-target boundary event detected during this slice.
- source: `apps/admin/src/M5TemplateCenterShell.tsx`, `apps/admin/src/templateCenterContracts.ts`, `apps/admin/src/m5-template-center-shell.css`, `apps/admin/src/App.tsx`.
- test: `apps/admin/tests/m5-template-center.spec.ts`, `scripts/tests/m5-template-center.test.mjs`.
- generated/lock/config/API/DB/ops-assets/distill/worker/cron/engine/capabilities/llm-gateway/evals/raw samples/external provider/adapter: none.
- New source `rg` conclusion: searched `TemplateCenter`, `template center`, `模板中心`, `knowledge_template`, `ai_member_template`, `config_template`, `eval_template`, `quick_reply_template`, `copy-to-tenant`, `copy to tenant`, `templateAutoOverwrite`, `tenantVersionRef`, `quick_reply`, `quick reply`, `快捷话术`, `话术库`, public/private quick-reply governance and M5-07 under `apps/admin/src`, `apps/admin/tests`, `scripts/tests`, `docs/specs`, `docs/evidence/M5` and `packages/db/src`. Existing implementation is limited to M5 planning/evidence and adjacent M5 confirmation/AI/logs shells; no M5 template center admin shell or local copy-draft contract exists. New source belongs under `apps/admin/src/templateCenterContracts.ts` and `apps/admin/src/M5TemplateCenterShell.tsx`, with a feature CSS file matching current M5 admin shell conventions.
- External API/SDK/provider/connector/adapter basis: none. This PR adds no external API, SDK, provider, connector or adapter and performs no external call.
- Exceptions: none. No `large_change_exception` and no `test_weakening_exception`.

## 文档触发检查

updated

## 前置条件

- Read `AGENTS.md`, `docs/specs/README.md`, `docs/specs/M5-00-operations-loop-readiness-pack.md`, `docs/evidence/M5/README.md`, `docs/evidence/M5/M5-06-logs-analytics.md`, relevant v1.1 PRD/backoffice/technical/acceptance sections and existing M5 admin patterns before implementation.
- Worktree must be `/Users/atilla/Documents/uzmax-m5-07-template-center`.
- Branch must be `codex/m5-07-template-center`.
- Do not write to `/Users/atilla/Documents/UZMAX智能运营` root/main checkout.
- Start audit must be recorded in `docs/evidence/M5/M5-07-template-center.md` before source/test implementation edits.
- `apps/api`, `packages/db`, `packages/ops-assets`, worker/cron/runtime, lockfile, shared config, CI/guards, generated artifacts and production/release gates are outside this slice.

## Worktree / branch 前置条件

| Fact | Expected |
|---|---|
| worktree | `/Users/atilla/Documents/uzmax-m5-07-template-center` |
| branch | `codex/m5-07-template-center` |
| forbidden checkout | `/Users/atilla/Documents/UZMAX智能运营` |
| root/main checkout use | read-only audit only |

## 并发派发证据

Single active writing worker for this spec. Touch list is distinct from DB schema/migrations, `packages/ops-assets`, lockfile, shared config, CI/guard scripts, generated artifacts and release/production gates. It touches shared `apps/admin/src/App.tsx` and adds focused admin/test files, so any parallel admin-shell worker touching those files must wait or show explicit non-overlap in evidence. Physical worktree and branch are distinct from root/main.

## 事故与 closeout 记录

- Incident: `docs/incidents/INC-2026-06-24-m5-07-root-patch-target.md` records and cleans up an initial worker patch-target error where this slice's first docs patch landed in root/main before being transferred to the assigned worktree and removed from root.
- If any write lands outside the assigned worktree, on root/main, on the wrong branch, or includes secret/customer-data boundary risk, stop and create or reference `docs/incidents/` before continuing.
- M5 closeout is not in this slice; later M5-08 or owner evidence must decide milestone acceptance.

## 实施步骤

1. Record start audit evidence for worker/root/GitHub state.
2. Add pure local `templateCenterContracts.ts` for allowed template kinds and copy-draft validation.
3. Ensure copy drafts always return `formalTenantWrite: false`, `templateAutoOverwrite: false`, `requiresOwnerConfirmation: true`, controlled `tenantVersionRef` and controlled `sourceTemplateRef`.
4. Fail closed for unknown kinds, unsafe refs, raw fields, URLs, inline payloads, base64-ish segments and unsafe customer/order/phone/payment/secret/prompt/raw terms including camelCase and compact forms.
5. Add `M5TemplateCenterShell` using synthetic local state only: tabs/cards for knowledge, AI member, config, eval and quick reply; card fields for business fit, version, last copied tenant and eval status; copy-draft panel with tenant-owned version and no auto-overwrite.
6. Wire the shell into `apps/admin/src/App.tsx` after `M5LogsAnalyticsShell` and before release readiness.
7. Add focused Playwright coverage for desktop tabs/cards/copy gating/disabled sync and production apply controls and 320px mobile inspect/copy/no horizontal overflow without complex editing/import/export.
8. Add focused Node tests for contract fail-closed cases, docs/status/scope, no backend/network imports and no sensitive seed data.
9. Update M5 evidence README and M5-07 evidence without marking M5 accepted.
10. Run required validation and record results.

## 通过条件

- Spec has all required fields from `docs/specs/README.md`.
- Evidence records start audit, scope, boundaries, no sensitive data statement, acceptance mapping, validation and spec/code review result or placeholders.
- Local template helper accepts only `knowledge`, `ai_member`, `config`, `eval`, `quick_reply`.
- Copy draft builder always returns `formalTenantWrite: false`, `templateAutoOverwrite: false`, `requiresOwnerConfirmation: true`, controlled `tenantVersionRef` and controlled `sourceTemplateRef`.
- Copy draft builder rejects unsafe refs/raw fields/URLs/inline payloads/base64-ish segments and unsafe customer/order/phone/payment/secret/prompt/raw terms including camelCase and compact forms.
- Visible shell performs no real network calls and uses only synthetic local state.
- Template center exposes tabs/cards for knowledge, AI member, config, eval and quick reply, with business fit, version, last copied tenant and eval status.
- Copy draft panel shows tenant-owned version draft and no auto-overwrite; sync suggestion and production apply actions remain disabled.
- Mobile/narrow viewport can inspect templates and draft copy for the selected template, hides complex editing/import/export affordances and has no horizontal overflow at 320px.
- Required validation passes or failures are honestly recorded.
- Source budget remains within changed source files <= 4, net source LOC <= 600, new source files <= 3.

## 失败分支

- If worktree/branch/root boundary differs: stop and report `BLOCKED`.
- If source budget exceeds target: stop and report `BLOCKED` with proposed split.
- If tests require API/DB/ops-assets/distill/worker/cron/runtime persistence, template schema changes, production config writes, provider calls, real customer/order data or raw template material: stop and split to later M5 specs.
- If mobile full editing/import/export is required for acceptance: stop and split because this slice only guarantees inspect/copy-draft fallback.
- If raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets appear: stop and clean up before continuing.
- If validation fails from this slice, fix within allowed files; do not weaken tests or expand mocks to pass.

## 不做什么

- No `apps/api/**`, `packages/db/**`, `packages/ops-assets/**`, `packages/distill/**`, `apps/worker/**`, `apps/cron/**`, `packages/engine/**`, `packages/capabilities/**`, `packages/llm-gateway/**`, `packages/evals/**`, package/lock/config/CI/guard changes.
- No DB/Prisma runtime, template persistence, template schema, formal tenant config write, template sync runtime, production config overwrite, provider/LLM call, alert delivery, production Redis/worker deployment, M6, GA-0, real customer/order data or 1.0 release claim.
- No raw/export/jsonl/csv, screenshots, voice transcripts, customer plaintext, Telegram payloads, order IDs, phone/address/payment data, support personal accounts, raw prompts/completions, LLM keys or secrets.
- No M5 accepted claim.

## 验收映射

| Item | M5-07 status | Notes |
|---|---|---|
| A-03 | `frontend_local_contract_supported_not_closed` | Template-copy draft proves no auto-overwrite and tenant-owned version refs locally; integrated tenant creation/runtime copy remains future. |
| H-04 | `frontend_local_contract_supported_not_closed` | Knowledge/config template copy draft uses tenant-independent version refs; DB/API persistence remains future. |
| H-06 | `frontend_local_contract_supported_not_closed` | Quick-reply template governance is visible as a reusable template kind; public/private search, classification, import/export and permission tests remain future. |
| J-05 | `foundation_evidence_added_not_closed` | This evidence records M5-07 only; M5 closeout and release checklist remain future. |
| K-03 | `active` | One spec / one PR; current branch implements only M5-07. |
| K-04 | `active` | Worktree/branch and touch list are scoped; DB schema, ops-assets and global serial points are untouched. |

M5-07 closes no production acceptance item. It only provides the frontend/local-contract shell for later M5 runtime and closeout slices.

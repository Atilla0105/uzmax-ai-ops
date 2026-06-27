# M7-00 UZMAX Design Skill Layer

## 目标

Introduce Impeccable as the repo-scoped UZMAX Design Skill Layer so future admin UI work has a durable design operating context, detector baseline and adoption rules instead of relying on ad hoc taste.

This spec creates the design governance layer only. It does not redesign the admin application or change runtime/release status.

## Owner

Owner: project owner decides final product scope, release gates, real accounts, real customer/order data, LLM keys, cost and compliance risk.

AI agent: install and document the project-scoped design skill layer, produce baseline evidence, expose risks, and keep Impeccable design judgment inside UZMAX governance boundaries.

## 时间盒

1 个工作日. If project-scoped installation cannot complete without global mutation, hook approval, Live Mode, secrets, backend/API/DB changes or production/staging config changes, stop and record the failed branch in evidence.

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M7-00-uzmax-design-skill-layer.md`
  - `docs/evidence/M7/**`
  - `AGENTS.md`
  - `.gitignore`
  - `PRODUCT.md`
  - `DESIGN.md`
  - `.impeccable/**`
  - `.codex/**`
  - `.agents/**`
- 说明/备注：
  - This slice may read `apps/admin/**` and `packages/ui-tokens/**` to build the UX map and detector baseline, but it must not change frontend source in this PR.
  - It may run Impeccable install/init/document/detect commands only with project scope, no hook activation and no Live Mode.
  - Do not modify API, DB, worker, cron, secrets, production/staging config, release gate logic, lockfiles or admin source in this slice.

## 变更预算与路径分类

- source 预算：UZMAX app/package source changed files = 0、net app/package source LOC = 0、new app/package source files = 0. The vendored repo-scoped `.agents/skills/impeccable/**` package contains `.js/.mjs/.toml` tool files that `guard:pr-shape` classifies as source; this PR must declare `large_change_exception` in the PR Hygiene table for the installed design-skill package only.
- test/generated/lock/config/docs 预计变更：one spec, M7 evidence, Impeccable project config/skill files, `PRODUCT.md`, `DESIGN.md`, `.gitignore` hygiene including vendored Impeccable script exclusion from generic unused-file scanning, and a small AGENTS design-layer rule.
- 新增 source 文件前的 `rg` 搜索结论和归属理由：no source files are allowed in this slice.
- 外部 API/SDK/provider/connector/adapter 依据：官方 Impeccable docs and npm/GitHub package metadata only; no provider/adapter is added.
- 是否需要例外：`large_change_exception` for `.agents/skills/impeccable/**` vendored tool files only; no UZMAX app/package source exception is requested.

## 文档触发检查

- 结果：updated.
- 判断依据：`docs/doc-gates.md`; this slice creates a repo-level design skill operating layer, so evidence is recorded under `docs/evidence/M7/**` and the AI agent constitution is updated with the design-layer precedence rule.

## 前置条件

- Read `AGENTS.md`, this spec, `docs/doc-gates.md`, `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` and `UZMAX智能运营系统-1.0验收矩阵-v1.1.md`.
- Confirm there is no existing repo-scoped Impeccable/Design Skill Layer (`PRODUCT.md`, `DESIGN.md`, `.impeccable/**`, `.codex/**` or `.agents/**`) before installation.
- Use bundled Node 24 tooling if the shell lacks `node/npm/npx`; do not install global Node/npm.
- Worktree / branch:
  - worker worktree: `/Users/atilla/Applications/UZMAX智能运营-m7-design-skill-layer`
  - worker branch: `codex/m7-design-skill-layer`
  - forbidden checkout for edits: `/Users/atilla/Applications/UZMAX智能运营`
  - required pre-edit evidence: worker `pwd`, `git status --short --branch`, `git branch --show-current`, root/main status, no-merged branch audit and open PR audit when available.
- Incident trigger: if installation writes outside the assigned worktree, creates hook approvals, enables Live Mode, touches secrets/customer data or changes unlisted paths, stop and create or reference `docs/incidents/`.

## 实施步骤

1. Add this spec before installing or generating design context.
2. Add the AGENTS Design Skill Layer rule: Impeccable leads design judgment by default, while UZMAX source-of-truth and safety/release boundaries veto conflicts.
3. Run project-scoped Impeccable install equivalent to `npx impeccable install --providers=codex --scope=project --no-hooks`; do not enable hooks.
4. Create `PRODUCT.md` with UZMAX product-surface operating context and the required derived-context precedence header.
5. Create `DESIGN.md` with UZMAX admin design system context, mapped from the backend design v1.1 source-of-truth and current token implementation.
6. Add `.impeccable/config.json` for shared detector configuration and ignore local/cache/log outputs.
7. Run `npx impeccable detect --json apps/admin/src` or the bundled-tooling equivalent to capture baseline. Do not hard-fail on findings.
8. Produce M7 evidence with install details, detector baseline summary, admin UX map and the first two follow-up UI slice recommendations.
9. Verify diff stays inside the touch list and no hook/Live/production/staging mutation occurred.

## 通过条件

- `PRODUCT.md` and `DESIGN.md` exist and state their derived-context precedence boundary.
- Impeccable project install artifacts are repo-scoped; hooks and Live Mode remain disabled/not used.
- `.impeccable/config.json` exists, while local/cache/log outputs are ignored; `.gitignore` also excludes vendored Impeccable tool scripts from generic unused-file scanning while keeping them committed as skill assets.
- M7 evidence records install command/result, Node/tooling path, detector baseline result, admin UX map and follow-up slice recommendations.
- AGENTS records the Design Skill Layer operating rule.
- No frontend source, backend source, DB schema, lockfile, production/staging config, secrets or release gate logic changed.

## 失败分支

- If Impeccable cannot install project-scoped without global mutation: record the failed command and use manually authored `PRODUCT.md` / `DESIGN.md` as a temporary design context, then schedule installation retry.
- If detector cannot run because of package/runtime/tooling failure: record the failure and keep detector as non-blocking until the retry spec.
- If install enables hooks or Live Mode: disable/remove those artifacts before continuing and record the correction in evidence.
- If admin UX map requires real UI redesign: stop and split follow-up UI specs.

## 不做什么

- Do not redesign admin UI in this PR.
- Do not add API, DB, worker, cron, release gate or runtime behavior.
- Do not enable Impeccable hooks.
- Do not use Live Mode.
- Do not add global/user-level skills.
- Do not approve GA-0, production, real customer/order-data use, customer LLM, real provider calls or 1.0 release.
- Do not weaken tests or modify lockfiles.

## 验收映射

- I-01: future desktop core workflows receive design-skill context and UX-map follow-up.
- I-02: mobile fallback is captured in design context and UX-map follow-up.
- I-05: design system lint/detector baseline is established before hard-fail adoption.
- K-03/K-04: one spec / one PR governance remains intact.

## Closeout / Incident 记录

none found in repo evidence for this spec at creation time.

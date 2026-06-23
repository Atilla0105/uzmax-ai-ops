# M4-30 Order Import Storage Object Intake Contract

## 目标

为 ADR-B02 no-API import snapshot path 补齐 M4-28/M4-29 之后的最小 Storage object intake contract：把受控上传/Storage 层已经取回的对象内容与 `bucketId`/`objectPath` 元数据转换成现有 CSV/TSV intake 和 M4-10 `parseOrderImportCsvText` 可消费的输入，并生成受控 `storage://bucket/path` sourceRef。本 spec 只做已取得对象内容的元数据边界，不读取本地文件、不下载 Supabase Storage、不创建 signed URL、不实现 XLSX/binary spreadsheet parser、不连接 DB、不实现 BullMQ/Redis queue runtime、不新增 `order_connector`、不提交真实或原始订单数据。

本 spec 不关闭 production DB runtime、真实 Storage downloader/upload runtime、XLSX parser、admin E2E、BullMQ/Redis、真实导入样例、AI runtime/eval 或 release acceptance。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本切片只把“已由上游取回的 Storage 对象内容”接入既有 CSV/TSV intake contract，不代表真实文件上传、Supabase Storage 下载、signed URL、XLSX 表格解析、生产 DB runtime、worker queue、admin E2E、真实客户/订单数据、LLM key、成本、合规或 1.0 发布验收关闭。

AI agent：只在 `/Users/atilla/Documents/uzmax-m4-30-order-import-storage-object-intake` / `codex/m4-30-order-import-storage-object-intake` 执行；复核 controlled bucket/path, derived `storage://` source refs, CSV/TSV dispatch, filename/media type/content fail-closed, byte/row budget preservation, no fs/env/secrets/Storage downloader/signed URL, no PrismaClient, no DB connection/write, no external API/no `order_connector`, no BullMQ/Redis dependency/runtime, PR hygiene, worker boundary evidence 和 M4 evidence index 同步。

## 时间盒

0.5 个工作日。若 Storage object intake contract 无法在预算内通过 focused Node tests、type/lint/guards/check validation，则关闭或拆小；不得夹带真实 Storage downloader/upload runtime、XLSX dependency/parser、DB env wiring、schema/migration、queue runtime、admin UI/E2E、真实导入样例或外部 API connector 继续推进。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M4-30-order-import-storage-object-intake-contract.md`
  - `docs/evidence/M4/M4-30-order-import-storage-object-intake-contract.md`
  - `docs/evidence/M4/README.md`
  - `apps/worker/src/order-import-file-intake.ts`
  - `scripts/tests/m4-order-import-storage-object-intake-contract.test.mjs`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：不得触碰 `apps/api/**`、`apps/admin/**`、`packages/db/**` schema/migration/generated client、`packages/capabilities/**`、package/lock/config、真实导入样例、root/main checkout 或其他 worktree。
- 未列出的模块默认不可改。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 120、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增 1 个 focused Node test；新增 spec/evidence；同步 M4 evidence README；不改 DB schema/migration/generated client、API/admin、lockfile、config 或 package。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source 文件。`rg -n "Storage|storage|upload|file intake|object intake|bucket|path|signed|download|createOrderImportCsvTextInputFrom|OrderImport.*FileIntake|XLSX|xlsx|CSV|TSV|table file" apps packages scripts/tests docs/specs/M4-*.md docs/evidence/M4/*.md package.json package-lock.json` 显示 M4-28/M4-29 已有同域 CSV/TSV file intake module，SPK-04 只有 authz spike Storage signed URL evidence，尚无 order import worker-side Storage object intake contract；因此就地扩展 `apps/worker/src/order-import-file-intake.ts`，不新增平行 source 文件。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增、不调用、不声明任何外部 API/SDK/provider/connector/adapter 能力；不新增 package dependency；ADR-B02 no-API branch remains active and `order_connector` remains absent。
- 是否需要例外：无。

## 文档触发检查

- 结果：`none`。
- 判断依据：`docs/doc-gates.md`；本 slice uses spec/evidence/M4 README for a contract-only Storage object intake adapter, and does not add OpenAPI/generated DTO/runbook/production runtime docs trigger。

## 前置条件

- 已读取 `AGENTS.md`、`docs/specs/README.md`、`docs/doc-gates.md`、`docs/evidence/M4/README.md`、`docs/adr/ADR-B02-order-api.md`、M4-28/M4-29 spec/evidence、v1.1 PRD REQ-T04、后台设计 §4.4、技术架构 §8/§10、验收矩阵 E-02/E-03/E-04/J-02/I-01、`apps/worker/src/order-import-file-intake.ts`、existing worker/parser/file-intake tests 和 package dependencies。
- ADR-B02 当前分支为 `no_api_for_m4__import_snapshot_main_path`；本 spec 不实现订单 API connector，不新增 `order_connector`，不调用或模拟外部 API。
- `npm ci` passed in assigned worktree; npm audit reported existing 3 high severity vulnerabilities, not introduced by this spec。
- Root/main full local worker boundary preflight is blocked by existing untracked duplicate docs in `/Users/atilla/Documents/UZMAX智能运营`:
  - `docs/adr/ADR-B02-order-api 2.md`
  - `docs/adr/README 2.md`
  - `docs/evidence/M4/README 2.md`
  - `docs/evidence/M4/spikes 2/SPK-02-order-saas-api/manifest.md`
  - `docs/specs/SPK-02-order-api 2.md`
- Because those files pre-existed this worker and may be user-retained local files, this spec does not delete them. Implementation uses absolute assigned worktree paths; CI-mode worker boundary and manual root tracked/index clean evidence are recorded.

## Worktree / branch 前置条件

- Worktree / branch：预期物理 worktree `/Users/atilla/Documents/uzmax-m4-30-order-import-storage-object-intake`；branch `codex/m4-30-order-import-storage-object-intake`；禁止写入 `/Users/atilla/Documents/UZMAX智能运营` root/main checkout。
- 开工记录：
  - `pwd`: `/Users/atilla/Documents/uzmax-m4-30-order-import-storage-object-intake`
  - `git status --short --branch`: `## codex/m4-30-order-import-storage-object-intake`
  - `git branch --show-current`: `codex/m4-30-order-import-storage-object-intake`
  - `git rev-parse HEAD`: `49c97edde10b958e9f90bf6e6f33184eed7cc057`
- Worker boundary evidence:
  - Full local guard result: `root_untracked_duplicate_docs_block_full_local_preflight` for the five duplicate docs listed above.
  - `CI=true UZMAX_ASSIGNED_WORKTREE=/Users/atilla/Documents/uzmax-m4-30-order-import-storage-object-intake UZMAX_PRIMARY_ROOT=/Users/atilla/Documents/UZMAX智能运营 npm run guard:worker-boundary` passed assigned-worktree check.
  - Root tracked/index clean evidence before edits: `git status --short --branch --untracked-files=no` -> `## main...origin/main`; `git diff --quiet` passed; `git diff --cached --quiet` passed; `gh pr list --state open --json ...` -> `[]`.

## 并发派发证据

Single implementation worker. This spec touches the shared worker intake module and shared M4 docs, so no parallel implementation worker is safe. Coordinator may run local read-only spec compliance and code quality reviews after implementation.

## 事故与 closeout 记录

- Incident：none introduced by this spec execution at authoring time。
- Existing local blocker：root/main contains the five untracked duplicate docs listed in the preconditions; this blocks full local worker-boundary enforcement but was not written by this M4-30 worker。
- Closeout evidence target: `docs/evidence/M4/M4-30-order-import-storage-object-intake-contract.md`。

## 实施步骤

1. Extend `apps/worker/src/order-import-file-intake.ts` with `createOrderImportCsvTextInputFromStorageObject(input)`.
2. Validate controlled `bucketId`, safe `objectPath`, derived `storage://bucket/path` sourceRef, CSV/TSV extension, media type, UTF-8 text content and byte budget before passing data to the parser.
3. Dispatch `.csv` objects to M4-28 `createOrderImportCsvTextInputFromFile` and `.tsv` objects to M4-29 `createOrderImportCsvTextInputFromTableFile`.
4. Preserve `maxRows`, byte length, normalized storage metadata and existing parser compatibility.
5. Add focused Node test covering CSV and TSV storage objects -> existing parser, fail-closed unsafe bucket/path/XLSX/media/content errors, static runtime boundary and M4 evidence mapping.
6. Update M4 evidence file and M4 README without claiming real Storage downloader/upload runtime, XLSX parser, production DB runtime, admin E2E, BullMQ/Redis or release closeout.

## 通过条件

- Controlled UTF-8 CSV and TSV Storage object content becomes input accepted by existing `parseOrderImportCsvText`.
- `bucketId`, `objectPath`, derived sourceRef, filename extension, media type, byte budget and non-text payload validation fail closed before parser execution.
- This PR does not read files, download Storage, create signed URLs, instantiate PrismaClient, import `@prisma/client`, connect/write DB, add `order_connector`, call network/fetch, add BullMQ/Redis dependency/runtime, modify schema/migration/generated client, package/lock/config, or submit raw customer/order data.
- Evidence file records validation table, boundary notes and no production Storage/DB/runtime/admin E2E/BullMQ/Redis/XLSX closure.

## 失败分支

- 若需要真实 file upload、local fs read、Supabase Storage download、signed URL、XLSX parser/dependency、DB connection、env validation、PrismaClient provider、schema/migration、generated client commit、worker queue runtime、admin UI/E2E、real import files 或 external order API：停止并拆到后续 scoped spec。
- 若 Storage object intake cannot be expressed without reading fs/env/network or accepting raw/uncontrolled refs：停止并 record blocked evidence; do not create a hidden runtime provider。
- 若出现 raw order/customer samples、phone/address/payment/order IDs、credentials/env/secrets：停止、清理本 worker 改动并进入 incident/cleanup path。
- 若 validation 失败且无法在 scope 内修复：提交 blocked evidence 或关闭/重开更小 spec；不得降低断言、删测试或扩大 mock。

## 不做什么

- 不新增 `order_connector`、外部 API adapter/provider/connector、DB schema/migration、generated client、DB env/runtime default provider、real PrismaClient injection、worker queue runtime、admin visible UI/E2E、AI runtime/eval、feature flag、production config、Storage downloader/upload runtime、signed URL、XLSX parser/dependency 或 real CSV/XLSX import sample。
- 不读取 `process.env`、不创建 `new PrismaClient()`、不连接或写入真实数据库、不提交 raw/export/jsonl/csv/xlsx、真实客户明文、电话号码、地址、支付信息、订单号、截图、Telegram payload、LLM prompt/completion、env 或 secret。
- 不删除 root/main 中既有未跟踪 duplicate docs；后续若 owner 确认可清理，应单独 cleanup。
- 不关闭 E-02/E-03/E-04/J-02/I-01 的 production Storage downloader/upload runtime、DB/runtime、queue/admin E2E、真实导入样例、AI runtime/eval 或 release acceptance。

## 验收映射

| Item | Status | Notes |
|---|---|---|
| E-01 | `not_current_blocker__no_api_for_m4` | No `order_connector` or external API connector added. |
| E-02 | `storage_object_intake_contract_supported_not_closed` | Adds controlled Storage object metadata/content intake before existing CSV/TSV parser intake; real Storage downloader/upload runtime, XLSX parser, DB client runtime/RLS integration, queue and admin E2E remain future scope. |
| E-03 | `foundation_supported_not_closed` | Intake preserves storage source refs and row budgets for downstream parser/stale-warning contracts; persisted warning runtime remains future scope. |
| E-04 | `foundation_supported_not_closed` | No AI runtime/eval is added; no fabricated order status path is added. |
| J-02 | `queue_runtime_not_closed` | No real BullMQ/Redis runtime, retry execution, idempotent storage locks or backlog alerting added. |
| I-01 | `not_closed` | No admin E2E workflow is added. |

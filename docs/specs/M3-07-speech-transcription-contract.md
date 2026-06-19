# M3-07 Speech Transcription Contract

## 目标

建立 `packages/capabilities/speech` 的 pure speech transcription/postprocess contract foundation：仅在受控合成输入中支持 Uzbek Latin、Uzbek Cyrillic 与 Russian 的转写候选校验、后处理结果、confidence 与 source refs 保留。高置信度、语言/脚本匹配且 refs 合规时返回 bounded `transcript_ready`；低置信度、不确定、歧义、缺信号、语言/脚本不匹配、不支持语言或 unsafe/raw carrier 时 fail closed 或拒绝输入。

本 PR 不声明真实 ASR/provider 能力，不接入 provider/SDK/key/env，不进入 API/worker/engine/admin，不提交 raw voice/audio/transcripts/customer data，不关闭 F-03 production/integration acceptance。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认本 PR 只作为 M3-07 foundation slice，不代表真实语音样例、真实 ASR、provider route、customer LLM、Bot 语音链路或 F-03 closeout 通过。

AI agent：只在 `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract` / `codex/m3-07-speech-transcription-contract` 中执行；重读 AGENTS、M3 readiness/contracts/evidence、v1.1 REQ-A03/REQ-C01、架构 speech 与 `speech_postprocess`、验收 F-03、现有 capability package 样式；实现 pure contract、focused test 与证据文档；不触碰 root/main checkout 或其他 worktree。

## 时间盒

0.5 个工作日。若 worktree/branch 不匹配、依赖安装失败、touch list 需要扩大到 runtime/API/provider、或发现 raw/sensitive sample 内容，停止并报告，不扩大本 PR 范围。

## Spec 类型

feature

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M3-07-speech-transcription-contract.md`
  - `packages/capabilities/speech/package.json`
  - `packages/capabilities/speech/src/index.ts`
  - `scripts/tests/m3-speech-transcription-contract.test.mjs`
  - `docs/contracts/README.md`
  - `docs/evidence/M3/README.md`
  - `docs/evidence/M3/M3-07-speech-transcription-contract.md`
  - `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md`
  - `package-lock.json`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - `package-lock.json` 只允许登记新增 workspace package，不允许 dependency version churn。
  - 未列出的模块默认不可改，尤其不得触碰 `packages/db` schema/migrations/generated DTOs、`packages/llm-gateway/**`、`packages/evals/**`、`packages/engine/**`、apps、worker/API/admin integration、provider SDKs、configs、prompts、real eval fixtures、raw/export/jsonl/csv、customer plaintext、Telegram payloads、voice/audio files、raw transcripts、screenshots、orders、phone/address/payment data、secrets、root/main checkout 或其他 worktree。

## 变更预算与路径分类

- source 预算：changed source files <= 1、net source LOC <= 400、new source files <= 1。
- path categories：
  - source: `packages/capabilities/speech/src/index.ts`
  - test: `scripts/tests/m3-speech-transcription-contract.test.mjs`
  - docs: this spec, contracts README, M3 evidence README, M3-07 evidence, M3-07 incident record
  - lock: `package-lock.json`
  - config: `packages/capabilities/speech/package.json`
  - generated: none
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `speech|transcription|voice|audio|speech_postprocess|语音|转写` 于 `packages`、`docs`、`scripts`、`package.json`。现有 voice 仅在 channel normalization、DB enum、LLM/eval task/category 和 M3 queue/evidence 中出现；不存在 `packages/capabilities/speech` 或可扩展的 speech capability home，因此新增 `packages/capabilities/speech/src/index.ts` 作为 M3-07 pure capability 归属。
- 外部 API/SDK/provider/connector/adapter 依据：none。本 PR 不新增或调用外部 API/SDK/provider/connector/adapter，不声明 ASR/provider 支持。
- 是否需要例外：none。

## 文档触发检查

- 结果：updated
- 判断依据：`docs/doc-gates.md`。新增 capability contract foundation 触发 `docs/contracts/README.md` 与 `docs/evidence/M3/` 更新；不触发 provider/runbook/env/release/admin docs。

## 前置条件

- 当前 worktree 必须是 `/Users/atilla/Documents/uzmax-m3-07-speech-transcription-contract`，分支为 `codex/m3-07-speech-transcription-contract`。
- 禁止修改 root/main checkout `/Users/atilla/Documents/UZMAX智能运营`，禁止修改其他 worktree，禁止 revert unrelated edits。
- 开工前必须记录 `pwd`、`git status --short --branch`、`git branch --show-current`、`git rev-parse HEAD`，且 HEAD 应基于 `origin/main` 的 `58f2aa5b69ab5f8ee545d2556a90359a632d3fb2`。
- 新 worktree 必须运行 `npm ci`。
- 开工前必须重读 AGENTS、`docs/specs/README.md`、M3 readiness pack、M3 evidence/contracts indexes、v1.1 相关条目、现有 KB/pricing/vision package 样式、LLM/evals/DB M3 contract foundations。
- 并发派发证据：single worker, single linked worktree, single branch, single spec; touch modules listed above; no DB schema, shared config, CI/guard script, generated artifact, provider route or production gate edits.
- 事故记录：本 worker 曾将 M3-07 初稿误写到 root/main checkout；coordinator 已封存并清理 root/main，本 PR 必须纳入 `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md`，后续 edits 使用指定 worktree 绝对路径并做 worker/root 双 status 核对。
- 事故触发器：若发现跨任务污染、写到分配 worktree 外、错分支或 main 直接提交、secret/customer-data 边界擦边、gate 绕过、同一过程失败在一个里程碑内重复出现，停止并创建或引用 `docs/incidents/` 记录。

## 实施步骤

1. 新增本 M3-07 spec，限定 touch list、budget、scope、failure branches、not-doing 与 acceptance mapping。
2. 新增 `packages/capabilities/speech` package 与 pure `src/index.ts`。
3. 新增 focused Node test 覆盖 exports、purity/no forbidden imports、三种语言/脚本、confidence/source refs、fail-closed cases、raw carrier rejection、field-specific ref schemes、docs/evidence/spec wording。
4. 更新 contracts README、M3 evidence index 与 M3-07 evidence。
5. 新增 incident record 并把该文件纳入本 spec touch list/PR Hygiene。
6. 运行 required validation，复核 diff 只含 allowlist 文件。

## 通过条件

- `packages/capabilities/speech/src/index.ts` 暴露 pure API：`speechLanguages`、`speechTranscriptionStatuses`、`createSpeechTranscriptionInput`、`evaluateSpeechTranscription`，可选 safe sample manifest helper。
- No DB/LLM gateway/evals/provider SDK/process.env/sibling capability imports。
- `audioStorageRef` 只接受 `storage://`；`manifestRef` 只接受 `manifest://`；`redactionRef` 只接受 `redaction://`；postprocess/model/provider/result/evidence refs 只接受 `controlled://`。
- Uzbek Latin、Uzbek Cyrillic、Russian 的高置信度受控合成候选返回 bounded `transcript_ready`，保留 language/script、confidence 与 refs。
- Low confidence、missing signals、ambiguous/uncertain、language/script mismatch、unsupported language、unsafe input/raw fields、unsupported provider claims 均不得返回 confident transcript。
- No raw voice/audio/transcripts/customer content in source, tests, docs or evidence；测试只使用 synthetic toy text。
- Required validation passes or is honestly recorded: `node --test scripts/tests/m3-speech-transcription-contract.test.mjs`, `git diff --check origin/main...HEAD`, `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M3-07-speech-transcription-contract.md --include-worktree`, `npm run check` if feasible, plus final worker/root dual status check。

## 失败分支

- If worktree or branch differs from expected path/branch: stop and report; do not write.
- If implementation requires provider SDK, env vars, real provider calls, customer LLM, API/worker/engine/admin integration, DB persistence, real eval fixtures, raw voice/audio/transcripts/customer data or Telegram payloads: stop and narrow back to pure controlled-ref contract or close branch.
- If `package-lock.json` changes beyond new workspace registration: stop and inspect; do not accept dependency churn silently.
- If wording implies production ASR, provider support, real sample readiness, customer traffic, F-03 closeout, M3 closeout or release approval: correct before merge.
- If raw/export/jsonl/csv, customer plaintext, Telegram payloads, voice/audio files, raw transcripts, order IDs, phone/address/payment data, support personal accounts or secrets appear: close this PR and perform cleanup/incident handling before further M3 work.

## 不做什么

- 不接入真实 ASR/provider/SDK/key/env。
- 不修改 API、worker、engine、admin、DB schema/migrations/generated DTOs、LLM gateway、eval runner、routes、prompts、configs 或 production gates。
- 不提交真实语音、音频、转写、客户明文、Telegram payload、订单、电话、地址、支付信息、客服个人账号或 secrets。
- 不声明 F-03、C-01 voice flow、M3 closeout、GA-0、production、real customer traffic、customer LLM 或 release approval 关闭。

## 验收映射

| Item | M3-07 status | Future closure path |
|---|---|---|
| REQ-A03 | foundation_only | Controlled synthetic transcription/postprocess contract for Uzbek Latin/Cyrillic/Russian exists; real ASR/provider and conversation flow remain future |
| REQ-C01 | not_closed | Bot voice ingress existed as M2 foundation; this PR does not wire voice into queue/worker/engine/API |
| F-03 | foundation_only_not_closed | Full closeout still requires real/integration voice sample evidence, owner sample input, provider/spike decision and flow validation |
| G-04 | still_blocked_by_owner_input | Uzbek Latin/Cyrillic/Russian blind review remains required before M3 closeout |
| K-03 | active | One spec / one PR |
| K-04 | active | Single isolated worker/worktree/branch |

## Closeout / Incident 记录

- Incident: `docs/incidents/INC-2026-06-19-m3-07-root-main-worktree-pollution.md` records the root/main worktree pollution, cleanup evidence and permanent controls. Status: `pending_merge`.
- M3 closeout remains blocked by owner inputs and future integration evidence.

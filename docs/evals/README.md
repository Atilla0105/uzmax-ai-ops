# Evals

本目录记录 UZMAX 评测体系的仓库内契约、runner 入口和证据边界。M1-05 只建立 seed manifest 与配额校验，不提交真实样本或脱敏样本内容。

## M1 Seed Runner

当前 runner 入口在 `packages/evals/src/index.ts`，并由 `npm run eval:minimal` 通过 `scripts/tests/eval-gate.test.mjs` 执行。

M1 seed quota：

| 项目 | 最低要求 | 当前 Gate 1 聚合 manifest |
|---|---:|---:|
| seed 唯一记录 | 60 | 80 |
| 意图覆盖 | 30 | 68 |
| 乌语/俄语覆盖 | 20 | 80 |
| 红线覆盖 | 10 | 54 |
| 1.0 full candidate target | 200 | 80 |

1.0 full candidate target 仍按 M6 前目标跟踪；M1-05 只证明 seed quota runner 可运行且当前 seed 聚合 manifest 通过。

## Data Boundary

- 仓库只保存 manifest、聚合计数、配额结果、脱敏规则和受控存储状态。
- 原始样本、脱敏样本内容、截图、语音、订单、电话、地址、账号和客服个人信息不得进入 Git。
- 样本内容只允许留在 owner-local controlled storage；仓库不记录公开链接。
- ADR-003 仍生效：真实客户消息、截图、语音转写和客户档案不得进入第三方 LLM。
- 任何发现敏感残留的批次必须关闭或重新脱敏，不得局部修补后继续签收。

## Runner Contract

`evaluateSeedManifest` 是纯函数，只接收聚合 manifest：

- `seedReviewRecords` 与 `uniqueRecords`
- intent / Uzbek or Russian / redline 聚合计数
- 明显敏感模式残留总数
- 样本是否进入 Git、是否允许第三方 LLM、是否为 owner-local controlled storage
- manifest 签收状态

runner 必须 fail closed：

- seed 总数、意图、乌语/俄语或红线配额不足时失败。
- 明显敏感模式残留不为 0 时失败。
- 原始或脱敏样本内容进入 Git 时失败。
- 允许第三方 LLM、公开链接访问或非 owner-local controlled storage 时失败。

## Current Evidence

- Gate 1 seed input: `docs/evidence/M1/eval-seed/history-samples-manifest.md`
- M1-05 runner manifest: `docs/evidence/M1/eval-seed/m1-05-seed-runner-manifest.md`

## M3 Eval Persistence Boundary

`M3-01-ai-capability-data-contracts-foundation` adds DB persistence contracts for future eval gates:

- `eval_case`: category, controlled `case_ref`, version, status, quota weight and redacted payload shape.
- `eval_run`: gate key, trigger ref, status, category quotas and run timing.
- `eval_result`: run/case refs, category, status, optional score, redline summary and controlled output ref.
- `eval_gate`: target ref, gate status, category quotas and last run ref.

This is a persistence foundation only. It does not implement the M3-03 eval runner, redline judge, publish refusal path, admin eval center, provider calls, prompt/model/persona release, production gate or GA-0.

No raw sample content in git. Eval evidence may record manifest IDs, controlled storage refs, redaction method, payload shape, aggregate quotas, status and owner confirmation only. Raw/export/jsonl/csv, customer plaintext, Telegram payloads, screenshots, voice transcripts, order IDs, phone/address/payment data, raw prompts, raw completions, support personal accounts and secrets must remain outside the repo.

M3-01 keeps G-03/G-05/G-06 as `foundation_queued_not_closed`. Full quota closure, redline false-positive evidence and publish refusal semantics require later specs and owner-input evidence where applicable.

## M3 LLM Gateway Eval Hook Boundary

`M3-02-llm-gateway-routing-accounting-foundation` validates route-level eval gate ref/status metadata so model-route changes can carry future gate provenance.

This hook is metadata only. It does not implement the M3-03 eval runner, redline judge, production publish refusal path, admin eval center, provider calls, prompt/model/persona release, production gate or GA-0.

Gateway accounting drafts may include eval summary refs in later integrations, but raw prompt, raw completion, raw sample content and customer plaintext remain barred from git and from M3-02 contract evidence.

## M3 Eval Gate Redline Runner Foundation

`M3-03-eval-gate-redline-runner` adds pure `packages/evals` exports for eval gate/redline foundation:

- M3 eval category/status constants mirror the M3-01 persisted vocabulary.
- `createM3EvalCase` accepts manifest/ref/redacted payload shapes only and rejects raw prompt/completion/customer text style fields.
- `evaluateM3EvalGate` fails closed when required foundation quotas are missing for `redline_attack`, `redline_false_positive`, `language` or the target-specific category for prompt/knowledge/model route/persona changes.
- `detectRedlineLeakage` flags internal threshold/cost/profit/margin/config leakage in prompt/context/output-shaped strings while allowing normal redacted false-positive business numbers when the case is marked passed.
- `decideM3PublishGate` returns pure allow/refuse semantics. prompt, knowledge, model route and persona publish changes are refused unless the matching gate result is passed, not stale, and has required quota/redline evidence.

This is foundation only. It does not implement production publish APIs, admin eval center, provider calls, persistence, real eval fixtures, raw samples, prompt/model/persona release, knowledge publish, M3-08 breaker radius/output guard, GA-0, customer LLM or real customer traffic.

M3-03 keeps G-06 as `partial_foundation_not_closed`: the runner enforces quotas against supplied synthetic/redacted case refs, but the full 1.0 >=200 eval target and owner-input blind review remain future closure paths.

# M1-05 Seed Runner Manifest

> evidence_id: M1-05-seed-runner-manifest
> milestone: M1
> acceptance_items: G-06 / J-05 / K-03 / K-04
> status: seed_quota_pass__content_external
> created_at: 2026-06-17
> updated_at: 2026-06-17
> owner: 项目 owner 签收 owner-local seed review 输入与后续正式入集；AI agent 建立 runner、配额校验和证据边界
> source_files: `docs/specs/M1-05-eval-seed-manifest-and-runner.md`、`docs/evidence/M1/eval-seed/history-samples-manifest.md`、`docs/evidence/M1/gates/Gate-1-decision.md`、`UZMAX智能运营系统-技术架构-v1.1.md`、`UZMAX智能运营系统-1.0验收矩阵-v1.1.md`
> sensitive_data_location: owner-local controlled storage only; no raw or redacted sample content in repository
> redaction_status: local redaction pass accepted for Gate 1 intake; runner uses aggregate counts only

## 当前判定

M1-05 建立了 seed manifest/quota runner，并将 Gate 1 复判得到的 80 条 owner-local seed review 聚合摘要作为仓库内 manifest summary。runner 只消费聚合计数和受控存储状态，不读取、提交或生成真实样本内容。

当前 seed quota 通过：seed 唯一记录 80 条，意图覆盖 68 条，乌语/俄语覆盖 80 条，红线覆盖 54 条，明显敏感模式残留 0。该判定只关闭 M1 seed quota 可运行与当前 seed pass；1.0 full candidate target 仍需在 M6 前达到 200 条。

## Manifest Summary

| 字段 | 值 |
|---|---:|
| manifest version | `m1_seed_manifest_v1` |
| seed review records | 80 |
| unique records | 80 |
| intent records | 68 |
| Uzbek/Russian records | 80 |
| redline records | 54 |
| restricted goods records | 25 |
| residual sensitive pattern hits | 0 |
| full candidate records tracked now | 80 |
| full candidate target | 200 |

## Storage Policy

| 项目 | 状态 |
|---|---|
| controlled storage | owner-local controlled storage |
| raw sample content in Git | false |
| redacted sample content in Git | false |
| public link allowed | false |
| third-party LLM allowed | false |

## Runner Result

| Check | Expected | Actual | Result |
|---|---:|---:|---|
| seed minimum | 60 | 80 | pass |
| unique records | 80 | 80 | pass |
| intent minimum | 30 | 68 | pass |
| Uzbek/Russian minimum | 20 | 80 | pass |
| redline minimum | 10 | 54 | pass |
| redaction residuals | 0 | 0 | pass |
| sample content not in Git | false | false | pass |
| third-party LLM blocked | false | false | pass |
| controlled storage ref | owner-local controlled storage | owner-local controlled storage | pass |
| public link blocked | false | false | pass |

## Boundaries

- 不提交真实客户明文、截图、语音转写、订单号、电话、地址、账号、raw/export/jsonl/csv 样本或脱敏样本内容。
- 不让真实客户消息进入第三方 LLM。
- 不实现 eval judge、prompt/知识/模型路由发布、M2/M3/M4 能力或 GA-0。
- 若后续正式入集发现脱敏残留、类别不足或上下文不足，必须关闭该批次或补样；不得伪造真实样本。

## Verification Plan

- `npm run eval:minimal`
- `npm run guard:eval-triggers -- --base origin/main`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- 如时间允许，运行 `npm run check`。

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | sample_ready_accepted_for_gate1 | 继续负责 owner-local 样本受控存储、正式入集签收和后续 full candidate 200 target |
| AI agent | seed_quota_pass__content_external | 已建立 runner 和聚合 manifest；未提交样本内容，未调用第三方 LLM，未放行 M2/M3/M4/GA-0 |

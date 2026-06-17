# M1 Platform Skeleton Signoff

> evidence_id: M1-platform-skeleton-signoff
> milestone: M1
> acceptance_items: A-01 / A-02 / B-01 / B-02 / B-03 / B-04 / B-05 / G-06 / J-05 / K-03 / K-04
> status: accepted
> created_at: 2026-06-17
> updated_at: 2026-06-17
> owner: 项目 owner 最终确认 M1 里程碑签收、production readiness 风险和后续 M2 开闸；AI agent 从当前 `main`、PR/CI 和 M1 evidence 产证据、暴露阻断项并维护治理记录
> source_files: `docs/specs/M1-07-platform-skeleton-closeout-signoff.md`、`docs/specs/M1-08-closeout-postmerge-evidence-sync.md`、`docs/specs/M1-09-owner-signoff-record.md`、`docs/evidence/M1/M1-platform-skeleton-readiness-pack.md`、`docs/evidence/M1/gates/Gate-1-decision.md`、`docs/evidence/M1/eval-seed/history-samples-manifest.md`、`docs/evidence/M1/eval-seed/m1-05-seed-runner-manifest.md`、PR #16-#23、CI run `27688896364`、项目 owner Codex 线程签收输入
> sensitive_data_location: none in repository; owner-local seed review remains outside Git
> redaction_status: no raw or redacted sample content in repository; M1 signoff uses aggregate evidence only
> review_notes: M1 platform skeleton implementation queue is merged and owner accepted; production readiness, M2/M3/M4, GA-0, customer LLM and real customer traffic remain blocked until later gates
> signoff: project owner explicitly accepted M1 closeout in Codex thread on 2026-06-17 with “都看了，完成的不错，签收了。”; AI agent recorded the acceptance and preserved later-gate blockers

## 当前判定

M1 平台骨架实现队列已合并到 `main`：Gate 1 Go/No-Go、platform schema/authz、API access-context shell、admin group/tenant shell、audit/config version foundation、eval seed manifest/runner 均有独立 spec、独立 PR、CI 证据和验收边界。

项目 owner 已明确签收 M1 closeout，本记录将 M1 标记为 `accepted`。该签收不是 production-ready 或 M2 开闸。M1 完成的是平台骨架与种子评测集 runner；真实渠道、真实客户流量、客户 LLM、M2/M3/M4、GA-0 和 production readiness 均继续阻断。

## Current Main Evidence

| 项目 | 当前状态 |
|---|---|
| current branch at owner signoff record start | `main` clean before M1-09 branch |
| latest M1 merge commit | `dd468d8c5d8673a638ab8362e909eaf08be31906` |
| open PRs before M1-09 | none |
| unmerged branches before M1-09 | none |
| latest main push CI | run `27688896364`, job `81894437003`, success in 5m18s |
| main push CI covered | format, typecheck, lint, depcruise, jscpd, knip, forbidden terms, eval triggers, doc triggers, Prisma generate, SPK-03, SPK-04, test, build, size, Playwright |

## M1 PR Ledger

| PR | Spec | Merge commit | CI / validation status | Closeout note |
|---:|---|---|---|---|
| #16 | `M1-06-gate-1-go-no-go` | `3f78b4cd634e1b4d2d81abf51034151a0b29f24a` | PR CI run `27671895563`, job `81837941551`; main push CI run `27672188308` | Gate 1 set to `go__m1_platform_skeleton_only`; M2/M3/M4/GA-0 stayed blocked |
| #17 | `M1-01-platform-schema-authz-foundation` | `0d5e0eaa580e0e062a6d363f5134c318b392f8cd` | PR CI run `27674959910`, job `81847899050`; main push CI run `27675293043` | Platform schema/RLS/authz foundation added; no business tables |
| #18 | `M1-02-api-access-context-shell` | `9f0717d9c8a2e2c32fab09f7bdd36bae32285303` | PR CI run `27678132894`, job `81858417802`; main push CI run `27678499817` | API AccessContext, tenant switch and fail-closed guard shell added |
| #19 | `M1-03-admin-group-tenant-shell` | `629461fef3e3df0869d348de2d4c9c070caf6598` | PR CI run `27681986967`, job `81871436787`; main push CI run `27682307709` | Admin group/tenant shell and read-only release/acceptance entry added |
| #20 | `M1-04-audit-config-version-foundation` | `1a31bafa768efebda32c85d2375fa6ddbb622f67` | PR CI run `27684308649`, job `81879198964`; main push CI run `27684622328` | Audit/config version schema, contracts and read-only admin entry added |
| #21 | `M1-05-eval-seed-manifest-and-runner` | `62986d7c5956320542e4e4e3931f0542a292aa13` | PR CI run `27685972062`, job `81884635341`; main push CI run `27686287874` | Seed quota runner passes current 80-record aggregate manifest; full target 200 remains later |
| #22 | `M1-07-platform-skeleton-closeout-signoff` | `7e5fecb6006fff65870315b40060e62508b2cd81` | PR CI run `27687247764`, job `81888898222`; main push CI run `27687578400`, job `81889987853` | M1 closeout/signoff evidence added; owner final signoff was still pending at that checkpoint |
| #23 | `M1-08-closeout-postmerge-evidence-sync` | `dd468d8c5d8673a638ab8362e909eaf08be31906` | PR CI run `27688538310`, job `81893229551`; main push CI run `27688896364`, job `81894437003` | M1 closeout evidence synced to post-merge main state before owner signoff |

## Acceptance Item Status

Status legend:

- `closed_for_m1_platform_skeleton`: closed only for M1 dev/platform skeleton scope, not production readiness.
- `partial_or_follow_up`: M1 delivered a baseline, but later gates or real environments must close the full acceptance item.
- `blocked_for_production_or_next_gate`: not closed for production, M2/M3/M4 or GA-0.

| Item | M1 closeout status | Evidence | Follow-up boundary |
|---|---|---|---|
| A-01 集团层健康与风险聚合 shell | closed_for_m1_platform_skeleton | PR #19, Playwright design tests, M1 admin shell | Real data integrations and production dashboards remain later scope |
| A-02 租户授权上下文与后台 shell | partial_or_follow_up | PR #17, PR #18, PR #19 | Full multi-account production E2E awaits real staging/prod Auth/Supabase |
| B-01 RLS/API guard baseline | closed_for_m1_platform_skeleton | PR #17, PR #18, CI SPK-03/SPK-04 | Business table RLS remains future capability scope |
| B-02 AccessContext / tenant switch baseline | closed_for_m1_platform_skeleton | PR #18, M1-02 tests | WebSocket/Storage production paths remain later gate scope |
| B-03 集团层不展示客户明文 | closed_for_m1_platform_skeleton | PR #19 Playwright assertions | Real customer data remains absent from M1 |
| B-04 权限 denied/degraded 基线 | partial_or_follow_up | PR #18 guard tests, PR #19 UI states | Full permission matrix and real accounts remain later scope |
| B-05 审计与配置版本基线 | closed_for_m1_platform_skeleton | PR #20, `docs/contracts/README.md`, schema/tests | DB-backed production audit repository and full config center remain later scope |
| G-06 seed 评测配额 | closed_for_m1_platform_skeleton | PR #21, `eval-seed/m1-05-seed-runner-manifest.md` | 1.0 full candidate target >=200 remains M6-before-release target |
| J-05 里程碑证据滚动归档 | closed_for_m1_platform_skeleton | this signoff plus M1 evidence index, PR #23 post-merge CI and owner explicit signoff | Project owner accepted M1 closeout; production release signoff remains later scope |
| K-03 Spec governance | closed_for_m1_platform_skeleton | PR #16-#23 each references spec; M1-09 records owner signoff under this spec | Continue one spec / one PR in the next approved stage |
| K-04 并行治理 | closed_for_m1_platform_skeleton | no open PRs, no unmerged branches before M1-09 | Continue branch hygiene before every new task |

## Pending Inputs And Blockers

These items are not M1 platform skeleton implementation blockers, but they block production readiness, M2/M3/M4 closure or GA-0:

| Pending item | Current status | Blocking effect |
|---|---|---|
| Staging/prod Supabase project, connection pool, Auth and Storage policy | pending_owner_input | M1 dev skeleton can close, but production readiness and full multi-account E2E remain open |
| Render service creation / Redis / rollback route | pending_owner_input | J-01/J-02 rollback and worker production readiness cannot close |
| Vercel preview/prod access protection | pending_owner_input | Admin preview/prod readiness cannot close |
| 1.0 full eval candidate target >=200 | tracked at 80 current seed records | G-06 seed quota passes; full set target remains M6-before-release |
| Telegram Bot / Business real account spike | deferred to M2/SPK-01 | M2 cannot close until handled by ADR-B01 path |
| Customer LLM / prompt / model route production use | blocked by ADR-003 dev-only status | M3/GA-0 cannot use real customer messages in third-party LLM until future signoff |
| Real customer traffic / auto-reply / distill auto-write | blocked | GA-0 remains closed |

## Data Boundary

- No raw export, redacted JSONL/CSV, customer plaintext, screenshots, voice transcripts, order IDs, phone numbers, addresses, payment data or support personal accounts are committed in M1 closeout.
- Owner-local seed review remains outside Git; repository only stores aggregate counts and manifests.
- ADR-003 remains active: real customer messages, screenshots, voice transcripts and customer profiles must not enter third-party LLMs.

## Verification To Reproduce

- `gh pr list --state open --json number,headRefName,title,url`
- `git branch --no-merged main`
- `gh run watch 27688896364 --exit-status`
- `npm run check`
- `npm run guard:pr-shape -- --base origin/main --spec docs/specs/M1-09-owner-signoff-record.md`

## Signoff

| 角色 | 状态 | 备注 |
|---|---|---|
| 项目 owner | accepted_m1_platform_skeleton_closeout | 2026-06-17 在 Codex 线程明确回复：“都看了，完成的不错，签收了。”该签收只关闭 M1 平台骨架 closeout，不放行 production、M2/M3/M4、GA-0、客户 LLM 或真实客户流量 |
| AI agent | recorded_owner_acceptance | 已从当前 `main`、PR #16-#23、main push CI、M1 evidence 和 owner 明确签收输入归档 M1 平台骨架 closeout；未放行 production、M2/M3/M4、GA-0 或客户 LLM |

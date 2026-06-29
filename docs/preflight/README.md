# Preflight

本目录保存正式开工前必须完成或持续跟踪的控制文件。

Current-state note: these files are early Gate 0/Gate 1 control records. They remain useful historical/governance source material, but they are not the current release-stage action entrypoint. For current M6/M6B/GA-0 posture, read `docs/release.md`, `docs/evidence/M6/README.md` and `docs/evidence/M6B/README.md`.

## 文件

- `00-opening-control-matrix.md`：开工控制矩阵、Owner、时间盒、通过条件、失败分支。
- `01-owner-inputs-checklist.md`：项目 owner 侧资料、样本、话术、验收签收准备。
- `02-external-dependencies-spikes.md`：Telegram Business 与订单 API 的真实环境 spike。
- `03-infrastructure-provisioning.md`：Supabase、Render、Vercel、Sentry、LLM key、Bot 账号等基础设施前置。

Preflight 文件不是愿望清单；每一项都必须能归属到项目 owner 决策、AI agent 执行/复核、时间盒、产出物和失败分支。

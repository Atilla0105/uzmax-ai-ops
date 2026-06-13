# Runbook: Secret / Token 轮换

## 适用场景

Telegram Bot token、LLM provider key、Supabase service role key、Render/Vercel env secret 泄露、过期或例行轮换。

## 处理步骤

1. 标记 secret 类型、影响环境、影响服务。
2. 在受控密钥管理中新建 secret，不在仓库记录明文。
3. 灰度更新 dev/staging，验证 webhook、LLM 调用、Storage 签名 URL、worker 队列。
4. 更新 production secret，执行健康检查。
5. 撤销旧 secret，并归档轮换时间、验证结果和项目 owner 确认。

## 失败分支

轮换失败时关闭受影响能力：Bot 出站、LLM provider、Storage 签名 URL 或相关 worker；不得继续使用疑似泄露 secret。

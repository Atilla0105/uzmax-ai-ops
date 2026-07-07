const requiredEnv = ["UZMAX_RLS_DATABASE_URL", "UZMAX_REDIS_URL"];

const helpText = `M8 internal Bot loop smoke

Runs the canonical synthetic true DB smoke for:
- Telegram Bot webhook -> Redis queue -> worker service
- active AI member/persona gate/capability -> active KB answer
- dry-run outbound answer for "setup help"
- KB miss ticket for "unknown"
- conversation-ticket backend readback and tenant isolation

Required env:
- UZMAX_RLS_DATABASE_URL
- UZMAX_REDIS_URL

Boundary:
- dry-run outbound only
- no live Telegram token
- no real customer traffic
- no real LLM/provider call
`;

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(helpText.trimEnd());
  process.exit(0);
}

const missingEnv = requiredEnv.filter((name) => !process.env[name]?.trim());
if (missingEnv.length > 0) {
  console.error("m8-internal-bot-loop-smoke: missing required env");
  for (const name of missingEnv) console.error(`- ${name}`);
  console.error(
    "No smoke was started. Provide the env values through a trusted internal smoke environment; do not paste secret values into logs."
  );
  process.exit(1);
}

console.log("m8-internal-bot-loop-smoke: starting synthetic dry-run closed loop");
console.log(
  "m8-internal-bot-loop-smoke: customer questions are controlled fixtures: setup help, unknown"
);

await import("./tests/run-m8-active-answer-worker-true-db-smoke.mjs");

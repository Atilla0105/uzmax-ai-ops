import { execFileSync } from "node:child_process";

const DEFAULT_BASE = "origin/main";
const DEFAULT_EVAL_COMMAND = "npm run eval:minimal --silent";
const triggerPatterns = [
  /^prompts\//,
  /^packages\/llm-gateway\/.*\/routes\//,
  /^packages\/db\/.*knowledge/i,
  /^packages\/db\/.*ai_member/i,
  /^packages\/evals\//,
  /^configs\/.*\/ai-persona\//,
  /^docs\/specs\/.*ai.*/i
];

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function changedFiles(base) {
  try {
    return execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], {
      encoding: "utf8"
    })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

const base = argValue("--base", process.env.UZMAX_GUARD_BASE ?? DEFAULT_BASE);
const changed = changedFiles(base);
const triggered = changed.filter((file) =>
  triggerPatterns.some((pattern) => pattern.test(file))
);

if (triggered.length === 0) {
  console.log("eval-trigger-paths: no eval-triggering paths changed");
  process.exit(0);
}

console.log("eval-trigger-paths: running minimal eval job for:");
console.log(triggered.join("\n"));

try {
  execFileSync(process.env.UZMAX_EVAL_COMMAND ?? DEFAULT_EVAL_COMMAND, {
    env: {
      ...process.env,
      UZMAX_EVAL_TRIGGERED_PATHS: triggered.join("\n")
    },
    shell: true,
    stdio: "inherit"
  });
} catch (error) {
  console.error("eval-trigger-paths: minimal eval job failed");
  process.exit(error.status ?? 1);
}

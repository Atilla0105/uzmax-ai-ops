import { execFileSync } from "node:child_process";

const triggerPatterns = [
  /^prompts\//,
  /^packages\/llm-gateway\/.*\/routes\//,
  /^packages\/db\/.*knowledge/i,
  /^packages\/db\/.*ai_member/i,
  /^packages\/evals\//,
  /^configs\/.*\/ai-persona\//,
  /^docs\/specs\/.*ai.*/i
];

function changedFiles() {
  const base = process.env.UZMAX_GUARD_BASE ?? "origin/main";
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

const changed = changedFiles();
const triggered = changed.filter((file) =>
  triggerPatterns.some((pattern) => pattern.test(file))
);

if (triggered.length > 0) {
  console.log("eval-trigger-paths: minimal eval job required for:");
  console.log(triggered.join("\n"));
} else {
  console.log("eval-trigger-paths: no eval-triggering paths changed");
}

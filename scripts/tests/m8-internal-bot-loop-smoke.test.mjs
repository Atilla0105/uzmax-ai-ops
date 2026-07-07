import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = process.cwd();
const scriptPath = "packages/db/scripts/run-m8-internal-bot-loop-smoke.mjs";
const script = text(scriptPath);
const canonicalSmoke = text(
  "packages/db/scripts/tests/run-m8-active-answer-worker-true-db-smoke.mjs"
);
const packageJson = JSON.parse(text("package.json"));
const spec = text("docs/specs/M8-04-internal-bot-loop-smoke.md");
const evidence = text("docs/evidence/M8/M8-04-internal-bot-loop-smoke.md");
const ci = text(".github/workflows/ci.yml");

describe("M8-04 internal Bot loop smoke entrypoint", () => {
  it("exposes an operator-facing command without duplicating runtime logic", () => {
    assert.equal(
      packageJson.scripts["smoke:m8-internal-bot-loop"],
      `node ${scriptPath}`
    );
    assert.match(script, /run-m8-active-answer-worker-true-db-smoke\.mjs/);
    assert.match(script, /dry-run outbound only/);
    assert.match(script, /no live Telegram token/);
    assert.doesNotMatch(script, /UZMAX_TELEGRAM_BOT_TOKEN/);
  });

  it("prints help that names the closed loop and live boundaries", () => {
    const result = runScript(["--help"]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /Telegram Bot webhook -> Redis queue -> worker service/
    );
    assert.match(result.stdout, /conversation-ticket backend readback/);
    assert.match(result.stdout, /no real customer traffic/);
    assert.match(result.stdout, /no real LLM\/provider call/);
  });

  it("fails before smoke startup when trusted DB or Redis env is missing", () => {
    const result = runScript([], { UZMAX_RLS_DATABASE_URL: "", UZMAX_REDIS_URL: "" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing required env/);
    assert.match(result.stderr, /UZMAX_RLS_DATABASE_URL/);
    assert.match(result.stderr, /UZMAX_REDIS_URL/);
    assert.doesNotMatch(result.stderr, /PrismaClient|at async|postgres:\/\//);
    assert.equal(result.stdout, "");
  });

  it("keeps M8-04 anchored to the canonical true DB smoke and CI path", () => {
    assert.match(
      canonicalSmoke,
      /passed webhook->Redis->worker active KB answer dry-run outbound/
    );
    assert.match(canonicalSmoke, /assertApiReadback/);
    assert.match(canonicalSmoke, /tenant isolation/);
    assert.match(ci, /M8 active answer worker true DB smoke/);
    assert.match(ci, /run-m8-active-answer-worker-true-db-smoke\.mjs/);
  });

  it("records the scope and release boundaries in spec and evidence", () => {
    const docs = `${spec}\n${evidence}`;
    assert.match(docs, /internal dry-run smoke/i);
    assert.match(docs, /not_ga0_not_release/);
    assert.match(docs, /No live Telegram token/i);
    assert.doesNotMatch(
      docs,
      /owner_accepted|GA-0 opened|production ready|1\.0 release approved/i
    );
  });
});

function runScript(args, envOverrides = {}) {
  const env = {
    ...process.env,
    ...envOverrides
  };
  for (const name of ["UZMAX_RLS_DATABASE_URL", "UZMAX_REDIS_URL"]) {
    if (envOverrides[name] === "") delete env[name];
  }
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env
  });
}

function text(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

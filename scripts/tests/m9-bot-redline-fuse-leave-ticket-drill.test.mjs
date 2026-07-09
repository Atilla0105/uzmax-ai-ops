import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();
const scriptPath = "packages/db/scripts/run-m9-bot-redline-fuse-leave-ticket-drill.mjs";

const files = {
  evidence: read("docs/evidence/M9/M9-05-bot-redline-fuse-leave-ticket-drill.md"),
  packageJson: JSON.parse(read("package.json")),
  script: read(scriptPath),
  spec: read("docs/specs/M9-05-bot-redline-fuse-leave-ticket-drill.md")
};

test("package script exposes the M9 Bot redline/fuse drill", () => {
  assert.equal(
    files.packageJson.scripts["smoke:m9-bot-redline-fuse-leave-ticket"],
    `node ${scriptPath}`
  );
});

test("drill help names local-only and release boundaries", () => {
  const result = runScript(["--help"]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /deterministic local Bot redline canary/);
  assert.match(result.stdout, /no live Telegram network call/);
  assert.match(result.stdout, /no DB connection/);
  assert.match(result.stdout, /no real LLM\/provider call/);
  assert.match(result.stdout, /does not pass G-04\/G-06/);
  assert.match(result.stdout, /does not open GA-0 or approve 1\.0/);
});

test("drill proves redline suppression, zero outbound and ticket reason", () => {
  const result = runScript([]);

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "pass");
  assert.equal(output.reasonCode, "redline_output_suppressed");
  assert.equal(output.runtimeBranch, "handoff");
  assert.equal(output.persistedRuntimeBranch, "handoff");
  assert.equal(output.outboundAttemptCount, 0);
  assert.equal(output.outboundMessageCount, 0);
  assert.equal(output.inboundMessageCount, 1);
  assert.equal(output.ticketReasonMatched, true);
  assert.deepEqual(output.boundary, {
    ga0Opened: false,
    liveTelegram: false,
    realCustomerTraffic: false,
    realDb: false,
    realProvider: false
  });
});

test("spec and evidence keep M9-05 narrow and not a GA or AI-quality pass", () => {
  const docs = `${files.spec}\n${files.evidence}`;

  assert.match(docs, /m9_05_bot_redline_fuse_canary_passed_not_ga0/);
  assert.match(docs, /redline_output_suppressed/);
  assert.match(docs, /outbound attempts \| `0`/);
  assert.match(docs, /not a full live redline DB drill/i);
  assert.match(docs, /does not approve/i);
  assert.match(docs, /G-04/);
  assert.match(docs, /G-06/);
  assert.match(docs, /1\.0/);
  assert.match(docs, /GA-0 still requires M9-04/);
  assert.doesNotMatch(
    docs,
    /GA-0 opened|1\.0 release approved|G-04:\s*passed|G-06:\s*passed/i
  );
});

test("default drill source avoids live env, network and DB primitives", () => {
  assert.doesNotMatch(files.script, /process\.env/);
  assert.doesNotMatch(files.script, /fetch\(/);
  assert.doesNotMatch(files.script, /PrismaClient|createClient\(/);
  assert.doesNotMatch(files.script, /UZMAX_RLS_DATABASE_URL|UZMAX_REDIS_URL/);
  assert.doesNotMatch(files.script, /TELEGRAM_TEST_BOT_TOKEN|UZMAX_TELEGRAM_BOT_TOKEN/);
});

function runScript(args) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8"
  });
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

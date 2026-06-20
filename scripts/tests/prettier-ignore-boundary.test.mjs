import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

const repoRoot = process.cwd();
const marker = "prettier" + "-ignore";
const guardScript = path.join(
  repoRoot,
  "scripts/guards",
  `${"prettier"}${"-ignore"}-boundary.mjs`
);
const { collectViolations } = await import(
  `../guards/${"prettier"}${"-ignore"}-boundary.mjs`
);
const tempRepos = [];

const baselineCounts = new Map([
  ["packages/evals/src/index.ts", 10],
  ["packages/engine/src/index.ts", 9],
  ["packages/llm-gateway/src/index.ts", 4],
  ["packages/db/src/index.ts", 47],
  ["packages/db/src/m3-ai-contracts.ts", 9],
  ["packages/capabilities/speech/src/index.ts", 5],
  ["packages/capabilities/vision/src/index.ts", 2],
  ["scripts/tests/m3-llm-gateway-routing-accounting-foundation.test.mjs", 3]
]);

afterEach(() => {
  for (const repo of tempRepos.splice(0)) {
    rmSync(repo, { force: true, recursive: true });
  }
});

describe("format ignore boundary guard", () => {
  it("passes the frozen linked-source baseline", () => {
    const repo = createBaselineFixture();

    const result = collectViolations(repo);

    assert.equal(result.total, 89);
    assert.deepEqual(result.violations, []);
  });

  it("fails when an existing baseline file expands", () => {
    const repo = createBaselineFixture();
    append(repo, "packages/evals/src/index.ts", `// ${marker}\n`);

    const result = collectViolations(repo);

    assert.match(result.violations.join("\n"), /baseline file count exceeds baseline/);
  });

  it("fails when a new monitored source file contains the marker", () => {
    const repo = createBaselineFixture();
    write(repo, "packages/new-package/src/index.ts", `// ${marker}\n`);

    const result = collectViolations(repo);

    assert.match(result.violations.join("\n"), /new monitored source\/test file/);
  });

  it("fails when a diff adds the marker in monitored source or test paths", () => {
    const repo = createBaselineFixture();
    initMain(repo);
    append(repo, "packages/engine/src/index.ts", `// ${marker}\n`);

    assert.throws(
      () =>
        execFileSync(process.execPath, [guardScript, "--base", "main"], {
          cwd: repo,
          encoding: "utf8",
          stdio: "pipe"
        }),
      outputIncludes("diff adds")
    );
  });

  it("ignores docs prose outside monitored source and test paths", () => {
    const repo = createBaselineFixture();
    write(repo, "docs/specs/example.md", `Prose mentions ${marker}.\n`);
    write(repo, "docs/evidence/M3/example.md", `Evidence mentions ${marker}.\n`);

    const result = collectViolations(repo);

    assert.deepEqual(result.violations, []);
  });

  it("fails when total marker count exceeds the frozen baseline", () => {
    const repo = createBaselineFixture();
    append(repo, "packages/db/src/index.ts", `// ${marker}\n`);

    const result = collectViolations(repo);

    assert.match(
      result.violations.join("\n"),
      new RegExp(`total ${marker} count exceeds baseline`)
    );
  });
});

function createBaselineFixture() {
  const repo = tempRepo();
  for (const [file, count] of baselineCounts.entries()) {
    write(repo, file, markerBlock(count));
  }
  return repo;
}

function markerBlock(count) {
  return Array.from({ length: count }, (_, index) => `// ${marker} ${index}\n`).join(
    ""
  );
}

function initMain(repo) {
  run("git", ["init", "-b", "main"], repo);
  run("git", ["config", "user.email", "agent@example.com"], repo);
  run("git", ["config", "user.name", "Agent"], repo);
  run("git", ["add", "."], repo);
  run("git", ["commit", "-m", "base"], repo);
}

function tempRepo() {
  const repo = mkdtempSync(path.join(tmpdir(), "uzmax-prettier-boundary-"));
  tempRepos.push(repo);
  return repo;
}

function write(repo, file, contents) {
  const target = path.join(repo, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function append(repo, file, contents) {
  write(repo, file, `${readExisting(repo, file)}${contents}`);
}

function readExisting(repo, file) {
  return readFileSync(path.join(repo, file), "utf8");
}

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, encoding: "utf8", stdio: "pipe" });
}

function outputIncludes(text) {
  return (error) => {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}\n${error.message ?? ""}`;
    return output.includes(text);
  };
}

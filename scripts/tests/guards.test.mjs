import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { classify, findTestWeakening, parsePrBody } from "../guards/pr-shape.mjs";

const repoRoot = process.cwd();
const prShapeScript = path.join(repoRoot, "scripts/guards/pr-shape.mjs");
const evalTriggerScript = path.join(repoRoot, "scripts/guards/eval-trigger-paths.mjs");
const docTriggerScript = path.join(repoRoot, "scripts/guards/doc-trigger-paths.mjs");
const forbiddenTermsScript = path.join(repoRoot, "scripts/guards/forbidden-terms.mjs");
const depcruiseBin = path.join(repoRoot, "node_modules/.bin/depcruise");
const depcruiseConfig = path.join(repoRoot, "dependency-cruiser.config.cjs");
const tempRepos = [];

afterEach(() => {
  for (const repo of tempRepos.splice(0)) {
    rmSync(repo, { force: true, recursive: true });
  }
});

describe("pr-shape guard", () => {
  it("passes an in-scope PR with a valid spec and hygiene token", () => {
    const repo = createGitFixture();
    write(repo, "src/index.ts", "export const ok = true;\n");

    assert.doesNotThrow(() => runPrShape(repo));
  });

  it("matches non-ASCII paths when Git quotePath is enabled", () => {
    const file = "UZMAX智能运营系统-PRD-v1.1.md";
    const repo = createGitFixture({ spec: specContent("docs", [file]) });
    run("git", ["config", "core.quotePath", "true"], repo);
    write(repo, file, "# PRD\n");
    commitFeature(repo);

    const rawPath = execFileSync("git", ["diff", "--name-only", "main...HEAD"], {
      cwd: repo,
      encoding: "utf8"
    }).trim();
    assert.notEqual(rawPath, file);
    assert.match(rawPath, /^"/);

    assert.doesNotThrow(() => runPrShape(repo));
  });

  it("blocks files outside the spec touch list", () => {
    const repo = createGitFixture();
    write(repo, "outside.ts", "export const nope = true;\n");

    assert.throws(() => runPrShape(repo), /out-of-scope file/);
  });

  it("blocks PRs without a spec id", () => {
    const repo = createGitFixture({ body: prBody({ specId: "" }) });
    write(repo, "src/index.ts", "export const ok = true;\n");

    assert.throws(() => runPrShape(repo), /Spec ID/);
  });

  it("blocks PRs with the template spec fields left blank", () => {
    const repo = createGitFixture({ body: prBody({ specFile: "", specId: "" }) });
    write(repo, "src/index.ts", "export const ok = true;\n");

    assert.throws(() => runPrShape(repo), /Spec ID/);
  });

  it("blocks new test weakening controls", () => {
    const repo = createGitFixture();
    const skippedCall = `it.${"skip"}('bad', () => {});`;
    write(
      repo,
      "src/example.test.ts",
      `import { it } from 'vitest';\n${skippedCall}\n`
    );

    assert.throws(() => runPrShape(repo), /test weakening/);
  });

  it("allows cleanup test deletion candidates when mapped to deleted source", () => {
    const repo = createGitFixture({
      body: prBody({
        exception: "test_weakening_exception",
        testWeakeningSourceMap: "src/dead.ts"
      }),
      initialFiles: {
        "src/dead.test.ts": "import { it } from 'node:test';\nit('old', () => {});\n",
        "src/dead.ts": "export const dead = true;\n"
      },
      spec: specContent("cleanup")
    });
    remove(repo, "src/dead.test.ts");
    remove(repo, "src/dead.ts");

    assert.doesNotThrow(() => runPrShape(repo));
  });

  it("blocks test weakening exceptions without a deleted source mapping", () => {
    const repo = createGitFixture({
      body: prBody({ exception: "test_weakening_exception" }),
      initialFiles: {
        "src/dead.test.ts": "import { it } from 'node:test';\nit('old', () => {});\n",
        "src/dead.ts": "export const dead = true;\n"
      },
      spec: specContent("cleanup")
    });
    remove(repo, "src/dead.test.ts");
    remove(repo, "src/dead.ts");

    assert.throws(() => runPrShape(repo), /test weakening/);
  });

  it("blocks new adapter files without external evidence", () => {
    const repo = createGitFixture();
    write(repo, "src/order-adapter.ts", "export const adapter = true;\n");

    assert.throws(() => runPrShape(repo), /adapter without external evidence/);
  });

  it("classifies generated artifacts outside the source budget", () => {
    assert.equal(classify("packages/db/migrations/001_init.sql"), "generated");
    assert.equal(classify("packages/db/src/generated/client.ts"), "generated");
  });

  it("classifies hand-written mjs scripts as source", () => {
    assert.equal(classify("scripts/guards/pr-shape.mjs"), "source");
    assert.equal(classify("dependency-cruiser.config.cjs"), "config");
  });

  it("detects added skip and only controls from a diff hunk", () => {
    const diff =
      `+test.${"only"}('bad', () => {})\n` + `+describe.${"skip"}('bad', () => {})\n`;
    assert.equal(findTestWeakening(diff, []).length, 2);
  });

  it("parses exception and spec fields from the PR hygiene table", () => {
    const parsed = parsePrBody(prBody({ exception: "large_change_exception" }));
    assert.deepEqual(
      {
        exception: parsed.exception,
        specFile: parsed.specFile,
        specId: parsed.specId
      },
      {
        exception: "large_change_exception",
        specFile: "docs/specs/REQ-01.md",
        specId: "REQ-01"
      }
    );
  });
});

describe("eval trigger guard", () => {
  it("runs the minimal eval command when eval paths change", () => {
    const repo = createGitFixture();
    write(repo, "packages/evals/src/index.ts", "export const evals = true;\n");
    commitFeature(repo);

    assert.doesNotThrow(() =>
      execFileSync(process.execPath, [evalTriggerScript, "--base", "main"], {
        cwd: repo,
        encoding: "utf8",
        env: {
          ...process.env,
          UZMAX_EVAL_COMMAND: `${process.execPath} -e "process.exit(0)"`
        }
      })
    );
  });

  it("blocks when the triggered minimal eval command fails", () => {
    const repo = createGitFixture();
    write(repo, "packages/evals/src/index.ts", "export const evals = true;\n");
    commitFeature(repo);

    assert.throws(() =>
      execFileSync(process.execPath, [evalTriggerScript, "--base", "main"], {
        cwd: repo,
        encoding: "utf8",
        env: {
          ...process.env,
          UZMAX_EVAL_COMMAND: `${process.execPath} -e "process.exit(7)"`
        }
      })
    );
  });
});

describe("doc trigger guard", () => {
  it("does not require eval docs for the empty eval package skeleton", () => {
    const repo = tempRepo();
    write(repo, "packages/evals/src/index.ts", "export const evals = true;\n");

    assert.doesNotThrow(() => runDocTriggers(repo));
  });

  it("requires eval docs when eval fixtures exist", () => {
    const repo = tempRepo();
    write(repo, "packages/evals/fixtures/basic.json", "{}\n");

    assert.throws(() => runDocTriggers(repo), /docs\/evals\/README\.md/);
  });

  it("allows eval fixtures when eval docs exist", () => {
    const repo = tempRepo();
    write(repo, "packages/evals/fixtures/basic.json", "{}\n");
    write(repo, "docs/evals/README.md", "# Evals\n");

    assert.doesNotThrow(() => runDocTriggers(repo));
  });

  it("requires contracts docs when a database schema appears", () => {
    const repo = tempRepo();
    write(repo, "packages/db/prisma/schema.prisma", "model User { id String @id }\n");

    assert.throws(() => runDocTriggers(repo), /docs\/contracts\/README\.md/);
  });
});

describe("dependency and forbidden-term guards", () => {
  it("blocks forbidden business terms in packages/engine", () => {
    const repo = tempRepo();
    write(repo, "packages/engine/src/index.ts", "export const tenant = 'Laylak';\n");

    assert.throws(
      () =>
        execFileSync(process.execPath, [forbiddenTermsScript], {
          cwd: repo,
          encoding: "utf8"
        }),
      /Forbidden business terms/
    );
  });

  it("blocks capability packages importing each other", () => {
    const repo = tempRepo();
    write(
      repo,
      "packages/capabilities/kb/src/index.ts",
      "import '../../vision/src/index';\nexport const kb = true;\n"
    );
    write(
      repo,
      "packages/capabilities/vision/src/index.ts",
      "export const vision = true;\n"
    );

    assert.throws(
      () =>
        execFileSync(depcruiseBin, ["packages", "--config", depcruiseConfig], {
          cwd: repo,
          encoding: "utf8"
        }),
      outputIncludes("capabilities-kb-no-cross-imports")
    );
  });

  it("blocks admin importing backend packages", () => {
    const repo = tempRepo();
    write(
      repo,
      "apps/admin/src/main.tsx",
      "import '../../../packages/engine/src/index';\nexport const admin = true;\n"
    );
    write(repo, "packages/engine/src/index.ts", "export const engine = true;\n");

    assert.throws(
      () =>
        execFileSync(depcruiseBin, ["apps", "packages", "--config", depcruiseConfig], {
          cwd: repo,
          encoding: "utf8"
        }),
      outputIncludes("admin-no-backend-imports")
    );
  });

  it("blocks ui-tokens importing business packages", () => {
    const repo = tempRepo();
    write(
      repo,
      "packages/ui-tokens/src/index.ts",
      "import '../../engine/src/index';\nexport const tokens = true;\n"
    );
    write(repo, "packages/engine/src/index.ts", "export const engine = true;\n");

    assert.throws(
      () =>
        execFileSync(depcruiseBin, ["packages", "--config", depcruiseConfig], {
          cwd: repo,
          encoding: "utf8"
        }),
      outputIncludes("ui-tokens-no-business-imports")
    );
  });

  it("blocks ops-assets importing engine or channels", () => {
    const repo = tempRepo();
    write(
      repo,
      "packages/ops-assets/src/index.ts",
      "import '../../engine/src/index';\nexport const assets = true;\n"
    );
    write(repo, "packages/engine/src/index.ts", "export const engine = true;\n");

    assert.throws(
      () =>
        execFileSync(depcruiseBin, ["packages", "--config", depcruiseConfig], {
          cwd: repo,
          encoding: "utf8"
        }),
      outputIncludes("ops-assets-no-engine-or-channel-imports")
    );
  });
});

function createGitFixture(options = {}) {
  const repo = tempRepo();
  run("git", ["init", "-b", "main"], repo);
  run("git", ["config", "user.email", "agent@example.com"], repo);
  run("git", ["config", "user.name", "Agent"], repo);
  write(repo, "docs/specs/REQ-01.md", options.spec ?? specContent());
  for (const [file, contents] of Object.entries(options.initialFiles ?? {})) {
    write(repo, file, contents);
  }
  run("git", ["add", "."], repo);
  run("git", ["commit", "-m", "base"], repo);
  run("git", ["checkout", "-b", "feature"], repo);
  write(repo, ".git/pr-body.md", options.body ?? prBody());
  return repo;
}

function runPrShape(repo) {
  commitFeature(repo);
  return execFileSync(
    process.execPath,
    [prShapeScript, "--base", "main", "--pr-body-file", ".git/pr-body.md"],
    {
      cwd: repo,
      encoding: "utf8",
      stdio: "pipe"
    }
  );
}

function runDocTriggers(repo) {
  return execFileSync(process.execPath, [docTriggerScript, "--root", repo], {
    cwd: repo,
    encoding: "utf8",
    stdio: "pipe"
  });
}

function commitFeature(repo) {
  run("git", ["add", "."], repo);
  if (safeRun("git", ["diff", "--cached", "--quiet"], repo) !== 0) {
    run("git", ["commit", "-m", "feature"], repo);
  }
}

function tempRepo() {
  const repo = mkdtempSync(path.join(tmpdir(), "uzmax-guard-"));
  tempRepos.push(repo);
  return repo;
}

function write(repo, file, contents) {
  const target = path.join(repo, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function remove(repo, file) {
  rmSync(path.join(repo, file));
}

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, encoding: "utf8", stdio: "pipe" });
}

function safeRun(command, args, cwd) {
  try {
    run(command, args, cwd);
    return 0;
  } catch (error) {
    return error.status ?? 1;
  }
}

function outputIncludes(text) {
  return (error) => {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}\n${error.message ?? ""}`;
    return output.includes(text);
  };
}

function specContent(
  specType = "feature",
  touchPatterns = ["src/**", "packages/evals/**"]
) {
  const touchList = touchPatterns.map((pattern) => `- \`${pattern}\``).join("\n");

  return `# REQ-01

## Spec 类型

${specType}

## 触碰模块/文件

${touchList}
`;
}

function prBody(options = {}) {
  const specId = options.specId ?? "REQ-01";
  const specFile = options.specFile ?? "docs/specs/REQ-01.md";
  const testWeakeningSourceMap = options.testWeakeningSourceMap ?? "none";
  return `## Spec

- Spec ID: ${specId}
- Spec file: ${specFile}

## PR Hygiene

| Field | Value |
|---|---|
| External API evidence | none |
| Test weakening source map | ${testWeakeningSourceMap} |
| Exception | ${options.exception ?? "none"} |
`;
}

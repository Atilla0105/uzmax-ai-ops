import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

const repoRoot = process.cwd();
const workerBoundaryScript = path.join(
  repoRoot,
  "scripts/guards/worker-write-boundary.mjs"
);
const tempRepos = [];

afterEach(() => {
  for (const repo of tempRepos.splice(0)) {
    rmSync(repo, { force: true, recursive: true });
  }
});

describe("worker write-boundary guard", () => {
  it("allows a linked worker worktree with a clean primary root", () => {
    const { linked, root } = createLinkedWorkerFixture();

    assert.doesNotThrow(() =>
      runWorkerBoundary(linked, {
        UZMAX_ASSIGNED_WORKTREE: linked,
        UZMAX_PRIMARY_ROOT: root
      })
    );
  });

  it("blocks assigned worktree mismatches", () => {
    const { linked, root } = createLinkedWorkerFixture();
    const wrongAssigned = tempRepo();

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: wrongAssigned,
          UZMAX_PRIMARY_ROOT: root
        }),
      outputIncludes("assigned worktree mismatch")
    );
  });

  it("blocks explicit assigned worktree mismatches in CI", () => {
    const { linked, root } = createLinkedWorkerFixture();
    const wrongAssigned = tempRepo();

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          CI: "true",
          UZMAX_ASSIGNED_WORKTREE: wrongAssigned,
          UZMAX_PRIMARY_ROOT: root
        }),
      outputIncludes("assigned worktree mismatch")
    );
  });

  it("fails when primary root cannot be discovered from a linked worker", () => {
    const { linked, root } = createLinkedWorkerFixture();
    run("git", ["checkout", "-b", "coordinator"], root);

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: linked
        }),
      outputIncludes("primary root checkout could not be discovered")
    );
  });

  it("fails when the explicit primary root is outside the worker topology", () => {
    const { linked } = createLinkedWorkerFixture();
    const other = createMainFixture();

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: linked,
          UZMAX_PRIMARY_ROOT: other
        }),
      outputIncludes("not in the same git worktree topology")
    );
  });

  it("fails when root main is checked out on another branch", () => {
    const { linked, root } = createLinkedWorkerFixture();
    run("git", ["checkout", "-b", "coordinator"], root);

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: linked,
          UZMAX_PRIMARY_ROOT: root
        }),
      outputIncludes("is on coordinator")
    );
  });

  it("fails from a linked worker when primary root main is dirty", () => {
    const { linked, root } = createLinkedWorkerFixture();
    write(root, "pollution.txt", "root/main write should be detected\n");

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: linked,
          UZMAX_PRIMARY_ROOT: root
        }),
      outputIncludes("root/main checkout")
    );
    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: linked,
          UZMAX_PRIMARY_ROOT: root
        }),
      outputIncludes("tracked or untracked changes")
    );
  });

  it("fails when root main is ahead of upstream", () => {
    const { linked, root } = createLinkedWorkerFixture();
    write(root, "local-only.txt", "local root commit should fail\n");
    run("git", ["add", "."], root);
    run("git", ["commit", "-m", "local root commit"], root);

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: linked,
          UZMAX_PRIMARY_ROOT: root
        }),
      outputIncludes("ahead of upstream by 1 commit")
    );
  });

  it("fails when root main upstream cannot be read", () => {
    const { linked, root } = createLinkedWorkerFixture({ withUpstream: false });

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: linked,
          UZMAX_PRIMARY_ROOT: root
        }),
      outputIncludes("upstream could not be read")
    );
  });

  it("fails when root main git status cannot be read", () => {
    const { linked, root } = createLinkedWorkerFixture();
    write(root, ".git/index", "corrupt index fixture\n");

    assert.throws(
      () =>
        runWorkerBoundary(linked, {
          UZMAX_ASSIGNED_WORKTREE: linked,
          UZMAX_PRIMARY_ROOT: root
        }),
      outputIncludes("primary root git status could not be read")
    );
  });

  it("prints a clear CI limited enforcement message", () => {
    const { linked, root } = createLinkedWorkerFixture();
    const output = runWorkerBoundary(linked, {
      CI: "true",
      UZMAX_ASSIGNED_WORKTREE: linked,
      UZMAX_PRIMARY_ROOT: root
    });

    assert.match(
      output,
      /physical multi-worktree\/root-main enforcement limited\/skipped/
    );
  });
});

function createLinkedWorkerFixture(options = {}) {
  const root = createMainFixture(options);
  const linked = path.join(tempRepo(), "linked-worker");
  run("git", ["worktree", "add", "-b", "worker", linked, "main"], root);

  return { linked, root };
}

function createMainFixture({ withUpstream = true } = {}) {
  const root = tempRepo();
  run("git", ["init", "-b", "main"], root);
  run("git", ["config", "user.email", "agent@example.com"], root);
  run("git", ["config", "user.name", "Agent"], root);
  write(root, "README.md", "# fixture\n");
  run("git", ["add", "."], root);
  run("git", ["commit", "-m", "initial"], root);

  if (withUpstream) {
    const remote = tempRepo();
    run("git", ["init", "--bare"], remote);
    run("git", ["remote", "add", "origin", remote], root);
    run("git", ["push", "-u", "origin", "main"], root);
  }

  return root;
}

function runWorkerBoundary(repo, env = {}) {
  const childEnv = { ...process.env };
  delete childEnv.CI;
  delete childEnv.GITHUB_ACTIONS;

  return execFileSync(process.execPath, [workerBoundaryScript], {
    cwd: repo,
    encoding: "utf8",
    env: {
      ...childEnv,
      ...env
    },
    stdio: "pipe"
  });
}

function tempRepo() {
  const created = mkdtempSync(`${tmpdir()}${path.sep}uzmax-worker-boundary-`);
  tempRepos.push(created);
  return created;
}

function write(repo, file, contents) {
  const filePath = path.resolve(repo, file);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
}

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function outputIncludes(text) {
  return (error) => {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}\n${error.message ?? ""}`;
    return output.includes(text);
  };
}

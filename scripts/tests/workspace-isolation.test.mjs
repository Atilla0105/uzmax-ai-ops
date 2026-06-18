import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

const repoRoot = process.cwd();
const workspaceGuardScript = path.join(
  repoRoot,
  "scripts/guards/workspace-isolation.mjs"
);
const tempRepos = [];

afterEach(() => {
  for (const repo of tempRepos.splice(0)) {
    rmSync(repo, { force: true, recursive: true });
  }
});

describe("workspace isolation guard", () => {
  it("allows a clean primary main checkout", () => {
    const repo = createMainFixture();

    assert.doesNotThrow(() => runWorkspaceGuard(repo));
  });

  it("allows a dirty linked feature worktree", () => {
    const repo = createMainFixture();
    const linked = path.join(tempRepo(), "linked-feature");
    run("git", ["worktree", "add", "-b", "linked-feature", linked, "main"], repo);
    write(linked, "scratch.txt", "allowed local work\n");

    assert.doesNotThrow(() => runWorkspaceGuard(linked));
  });

  it("blocks a primary checkout on a feature branch", () => {
    const repo = createMainFixture();
    run("git", ["checkout", "-b", "feature"], repo);

    assert.throws(() => runWorkspaceGuard(repo), outputIncludes("primary checkout"));
  });

  it("blocks a detached HEAD linked worktree", () => {
    const repo = createMainFixture();
    const commit = git(["rev-parse", "HEAD"], repo);
    const linked = path.join(tempRepo(), "detached-linked");
    run("git", ["worktree", "add", "--detach", linked, commit], repo);

    assert.throws(
      () => runWorkspaceGuard(linked),
      outputIncludes("work in a named branch inside a linked git worktree")
    );
  });

  it("blocks a dirty primary main checkout", () => {
    const repo = createMainFixture();
    write(repo, "untracked.txt", "root main must stay clean\n");

    assert.throws(
      () => runWorkspaceGuard(repo),
      outputIncludes("main checkout has tracked or untracked changes")
    );
  });

  it("blocks a primary main checkout ahead of upstream", () => {
    const repo = createMainFixture();
    const remote = createBareRemote();
    run("git", ["remote", "add", "origin", remote], repo);
    run("git", ["push", "-u", "origin", "main"], repo);
    write(repo, "local-only.txt", "local commit should block root main\n");
    run("git", ["add", "."], repo);
    run("git", ["commit", "-m", "local main commit"], repo);

    assert.throws(
      () => runWorkspaceGuard(repo),
      outputIncludes("main branch is ahead of its upstream by 1 commit(s)")
    );
  });

  it("allows CI mode with an explicit physical worktree skip", () => {
    const repo = createMainFixture();
    run("git", ["checkout", "-b", "feature"], repo);
    const output = runWorkspaceGuard(repo, {
      CI: "true",
      GITHUB_ACTIONS: "true"
    });

    assert.match(
      output,
      /CI checkout: physical local worktree checks skipped\/limited/
    );
  });
});

function createMainFixture() {
  const repo = tempRepo();
  run("git", ["init", "-b", "main"], repo);
  run("git", ["config", "user.email", "agent@example.com"], repo);
  run("git", ["config", "user.name", "Agent"], repo);
  write(repo, "README.md", "# fixture\n");
  run("git", ["add", "."], repo);
  run("git", ["commit", "-m", "initial"], repo);
  return repo;
}

function createBareRemote() {
  const remote = tempRepo();
  run("git", ["init", "--bare"], remote);
  return remote;
}

function runWorkspaceGuard(repo, env = {}) {
  const childEnv = { ...process.env };
  if (!Object.hasOwn(env, "CI")) delete childEnv.CI;
  if (!Object.hasOwn(env, "GITHUB_ACTIONS")) delete childEnv.GITHUB_ACTIONS;

  return execFileSync(process.execPath, [workspaceGuardScript], {
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
  const repo = mkdtempSync(path.join(tmpdir(), "uzmax-workspace-guard-"));
  tempRepos.push(repo);
  return repo;
}

function write(repo, file, contents) {
  const target = path.join(repo, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, encoding: "utf8", stdio: "pipe" });
}

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" }).trim();
}

function outputIncludes(text) {
  return (error) => {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}\n${error.message ?? ""}`;
    return output.includes(text);
  };
}

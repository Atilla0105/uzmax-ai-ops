import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import path from "node:path";

function git(argsForGit, cwd = process.cwd()) {
  return execFileSync("git", argsForGit, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function safeGit(argsForGit, cwd = process.cwd()) {
  try {
    return git(argsForGit, cwd);
  } catch {
    return "";
  }
}

function normalizeGitPath(value, cwd) {
  if (!value) return "";
  const absolute = path.resolve(cwd, value);
  try {
    return realpathSync(absolute);
  } catch {
    return absolute;
  }
}

function readGitInfo(cwd = process.cwd()) {
  git(["rev-parse", "--show-toplevel"], cwd);
  const branch = safeGit(["branch", "--show-current"], cwd);
  const gitDir = normalizeGitPath(safeGit(["rev-parse", "--git-dir"], cwd), cwd);
  const commonDir = normalizeGitPath(
    safeGit(["rev-parse", "--git-common-dir"], cwd),
    cwd
  );
  const statusLines = safeGit(
    ["status", "--porcelain=v1", "--untracked-files=all"],
    cwd
  )
    .split(/\r?\n/)
    .filter(Boolean);

  return {
    branch,
    gitDir,
    commonDir,
    isLinkedWorktree: Boolean(gitDir && commonDir && gitDir !== commonDir),
    statusLines,
    upstreamAhead: readUpstreamAhead(cwd)
  };
}

function readUpstreamAhead(cwd) {
  const counts = safeGit(
    ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"],
    cwd
  )
    .split(/\s+/)
    .map((value) => Number.parseInt(value, 10));
  return Number.isFinite(counts[1]) ? counts[1] : 0;
}

function isCiMode() {
  return process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
}

function branchLabel(branch) {
  return branch || "(detached HEAD)";
}

function collectLocalViolations(info) {
  if (!info.branch) {
    return [
      "detached HEAD is not allowed for local worker edits; work in a named branch inside a linked git worktree"
    ];
  }

  if (info.branch === "main") {
    return [
      info.statusLines.length > 0 &&
        `main checkout has tracked or untracked changes:\n${info.statusLines
          .map((line) => `    ${line}`)
          .join("\n")}`,
      info.upstreamAhead > 0 &&
        `main branch is ahead of its upstream by ${info.upstreamAhead} commit(s)`
    ].filter(Boolean);
  }

  if (!info.isLinkedWorktree) {
    return [
      `branch ${branchLabel(
        info.branch
      )} is running in the primary checkout; use an independent linked git worktree for worker edits`
    ];
  }

  return [];
}

function printCiSummary(info) {
  console.log(
    "workspace-isolation: CI checkout: physical local worktree checks skipped/limited"
  );
  console.log(
    `workspace-isolation: git status read ok (${branchLabel(info.branch)}, ${
      info.statusLines.length
    } status entr${info.statusLines.length === 1 ? "y" : "ies"})`
  );
}

export function main() {
  const info = readGitInfo();

  if (isCiMode()) {
    printCiSummary(info);
    return;
  }

  const violations = collectLocalViolations(info);
  if (violations.length > 0) {
    console.error("workspace-isolation failed:");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    console.error(
      "Use a dedicated linked worktree for feature work, or clean and sync the root/main coordination checkout before running checks."
    );
    process.exit(1);
  }

  console.log(
    `workspace-isolation: ok (${branchLabel(info.branch)}, ${
      info.isLinkedWorktree ? "linked worktree" : "primary checkout"
    }, ${info.statusLines.length === 0 ? "clean" : "dirty allowed"})`
  );
}

if (process.argv[1]?.endsWith("workspace-isolation.mjs")) {
  try {
    main();
  } catch (error) {
    console.error(`workspace-isolation failed: ${error.message}`);
    process.exit(1);
  }
}

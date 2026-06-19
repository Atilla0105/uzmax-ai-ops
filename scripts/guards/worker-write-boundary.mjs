import { execFileSync as execFile } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";

function runGit(argsForGit, { cwd = process.cwd(), optional = false } = {}) {
  try {
    return execFile("git", argsForGit, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch (error) {
    if (!optional) throw error;
    return "";
  }
}

function realpathMaybe(value, cwd = process.cwd()) {
  if (!value) return "";
  const absolute = path.resolve(cwd, value);
  return existsSync(absolute) ? realpathSync(absolute) : absolute;
}

function parseArgs(argv) {
  const options = {
    assignedWorktree: process.env.UZMAX_ASSIGNED_WORKTREE ?? "",
    primaryRoot: process.env.UZMAX_PRIMARY_ROOT ?? ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--assigned-worktree") {
      options.assignedWorktree = argv[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--assigned-worktree=")) {
      options.assignedWorktree = arg.slice("--assigned-worktree=".length);
    } else if (arg === "--primary-root") {
      options.primaryRoot = argv[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--primary-root=")) {
      options.primaryRoot = arg.slice("--primary-root=".length);
    }
  }

  return options;
}

function readGitInfo(cwd = process.cwd()) {
  const topLevel = realpathMaybe(
    runGit(["rev-parse", "--show-toplevel"], { cwd }),
    cwd
  );
  const branch = runGit(["branch", "--show-current"], { cwd, optional: true });
  const gitDir = realpathMaybe(
    runGit(["rev-parse", "--git-dir"], { cwd, optional: true }),
    cwd
  );
  const commonDir = realpathMaybe(
    runGit(["rev-parse", "--git-common-dir"], { cwd, optional: true }),
    cwd
  );
  const status = readGitStatus(cwd);

  return {
    branch,
    commonDir,
    gitDir,
    isLinkedWorktree: Boolean(gitDir && commonDir && gitDir !== commonDir),
    statusLines: status.lines,
    statusReadable: status.readable,
    topLevel,
    upstream: readUpstream(cwd)
  };
}

function readGitStatus(cwd) {
  try {
    const statusText = runGit(["status", "--porcelain=v1", "--untracked-files=all"], {
      cwd
    });
    return {
      lines: statusText ? statusText.split(/\r?\n/) : [],
      readable: true
    };
  } catch {
    return {
      lines: [],
      readable: false
    };
  }
}

function readUpstream(cwd) {
  const output = runGit(["rev-list", "--left-right", "--count", "@{upstream}...HEAD"], {
    cwd,
    optional: true
  });
  const match = output.match(/^\d+\s+(\d+)$/);
  return match
    ? { ahead: Number.parseInt(match[1], 10), readable: true }
    : { ahead: 0, readable: false };
}

function isCiMode() {
  return process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
}

function branchLabel(branch) {
  return branch || "(detached HEAD)";
}

function findPrimaryRoot(workerTopLevel, explicitPrimaryRoot) {
  if (explicitPrimaryRoot) return realpathMaybe(explicitPrimaryRoot);

  const worktrees = runGit(["worktree", "list", "--porcelain"], {
    cwd: workerTopLevel,
    optional: true
  })
    .split(/\n\s*\n/)
    .map(parseWorktreeEntry)
    .filter((entry) => entry.path);

  return (
    worktrees.find(
      (entry) => entry.branch === "refs/heads/main" && entry.path !== workerTopLevel
    )?.path ?? ""
  );
}

function parseWorktreeEntry(entry) {
  const parsed = {
    branch: "",
    path: ""
  };

  for (const line of entry.split(/\r?\n/)) {
    if (line.startsWith("worktree ")) {
      parsed.path = realpathMaybe(line.slice("worktree ".length));
    } else if (line.startsWith("branch ")) {
      parsed.branch = line.slice("branch ".length);
    }
  }

  return parsed;
}

function collectViolations(workerInfo, options) {
  const violations = collectAssignedViolations(workerInfo, options);

  const primaryRoot = findPrimaryRoot(workerInfo.topLevel, options.primaryRoot);
  if (!primaryRoot) {
    if (!options.primaryRoot && workerInfo.isLinkedWorktree) {
      violations.push(
        "primary root checkout could not be discovered from git worktree list; pass UZMAX_PRIMARY_ROOT or --primary-root"
      );
    }
    return violations;
  }

  if (primaryRoot === workerInfo.topLevel) {
    violations.push(
      "primary root resolves to current worktree; run worker implementation from a linked worktree"
    );
    return violations;
  }

  return [...violations, ...collectPrimaryRootViolations(workerInfo, primaryRoot)];
}

function collectPrimaryRootViolations(workerInfo, primaryRoot) {
  const violations = [];
  const rootInfo = readGitInfo(primaryRoot);
  if (rootInfo.commonDir !== workerInfo.commonDir) {
    violations.push(
      `primary root checkout ${primaryRoot} is not in the same git worktree topology as ${workerInfo.topLevel}`
    );
  }
  if (rootInfo.branch !== "main") {
    violations.push(
      `root/main checkout ${primaryRoot} is on ${branchLabel(rootInfo.branch)}`
    );
  }
  if (!rootInfo.statusReadable) {
    violations.push(`primary root git status could not be read: ${primaryRoot}`);
  }
  if (rootInfo.statusLines.length > 0) {
    violations.push(
      `root/main checkout ${primaryRoot} has tracked or untracked changes:\n${rootInfo.statusLines
        .map((line) => `    ${line}`)
        .join("\n")}`
    );
  }
  if (!rootInfo.upstream.readable) {
    violations.push(
      `root/main checkout ${primaryRoot} upstream could not be read; configure upstream before local enforcement`
    );
  } else if (rootInfo.upstream.ahead > 0) {
    violations.push(
      `root/main checkout ${primaryRoot} is ahead of upstream by ${rootInfo.upstream.ahead} commit(s)`
    );
  }

  return violations;
}

function collectAssignedViolations(workerInfo, options) {
  const assigned = options.assignedWorktree
    ? realpathMaybe(options.assignedWorktree)
    : "";

  if (assigned && workerInfo.topLevel !== assigned) {
    return [
      `assigned worktree mismatch: current git top-level is ${workerInfo.topLevel}, expected ${assigned}`
    ];
  }

  return [];
}

export function main() {
  const options = parseArgs(process.argv.slice(2));
  const workerInfo = readGitInfo();
  const assignedViolations = collectAssignedViolations(workerInfo, options);

  if (isCiMode()) {
    if (assignedViolations.length > 0) {
      printFailure(assignedViolations);
      process.exit(1);
    }
    console.log(
      "worker-write-boundary: CI mode physical multi-worktree/root-main enforcement limited/skipped"
    );
    console.log(
      `worker-write-boundary: git status read ok (${branchLabel(
        workerInfo.branch
      )}, ${workerInfo.statusLines.length} status entr${
        workerInfo.statusLines.length === 1 ? "y" : "ies"
      })`
    );
    return;
  }

  const violations = collectViolations(workerInfo, options);
  if (violations.length > 0) {
    printFailure(violations);
    process.exit(1);
  }

  console.log(
    `worker-write-boundary: ok (${branchLabel(workerInfo.branch)}, ${workerInfo.topLevel})`
  );
}

function printFailure(violations) {
  console.error("worker-write-boundary failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  console.error(
    "This in-repo guard detects and records boundary failures; runtime/harness write jailing and absolute assigned paths remain required for prevention."
  );
}

if (process.argv[1]?.endsWith("worker-write-boundary.mjs")) {
  try {
    main();
  } catch (error) {
    console.error(`worker-write-boundary failed: ${error.message}`);
    process.exit(1);
  }
}

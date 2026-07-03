import { execFileSync } from "node:child_process";

function git(argsForGit, cwd = process.cwd()) {
  return execFileSync("git", ["-c", "core.quotePath=false", ...argsForGit], {
    cwd,
    encoding: "utf8"
  });
}

function safeGit(argsForGit, cwd = process.cwd()) {
  try {
    return git(argsForGit, cwd);
  } catch {
    return "";
  }
}

export function readChangedFiles(base, includeWorktree) {
  const committed = safeGit(["diff", "--name-only", `${base}...HEAD`]);
  const workspace = includeWorktree ? readWorktreeFiles() : "";

  return uniqueLines(`${committed}\n${workspace}`);
}

function readWorktreeFiles() {
  return `${safeGit(["diff", "--name-only"])}\n${safeGit([
    "ls-files",
    "--others",
    "--exclude-standard"
  ])}`;
}

export function readNameStatus(base) {
  return safeGit(["diff", "--name-status", `${base}...HEAD`])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [status, ...fileParts] = line.split(/\t/);
      return { status, file: fileParts.at(-1) };
    });
}

export function readNumstat(base) {
  return safeGit(["diff", "--numstat", `${base}...HEAD`])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [added, deleted, file] = line.split(/\t/);
      return {
        added: Number.parseInt(added, 10) || 0,
        deleted: Number.parseInt(deleted, 10) || 0,
        file
      };
    });
}

export function readDiff(base) {
  return safeGit(["diff", "--unified=0", "--no-ext-diff", `${base}...HEAD`]);
}

function uniqueLines(value) {
  return [...new Set(value.split(/\r?\n/).filter(Boolean))];
}
